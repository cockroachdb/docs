---
title: Operational FAQs
summary: Get answers to frequently asked questions about operating CockroachDB.
toc: true
toc_not_nested: true
docs_area: get_started
---

## Why is my process hanging when I try to start nodes with the `--background` flag?

{{site.data.alerts.callout_info}}
Cockroach Labs recommends against using the `--background` flag when starting a cluster. In production, operators usually use a process manager like `systemd` to start and manage the `cockroach` process on each node. Refer to [Deploy CockroachDB On-Premises]({% link {{page.version.version}}/deploy-cockroachdb-on-premises.md %}?filters=systemd). When testing locally, starting nodes in the foreground is recommended so you can monitor the runtime closely.

If you do use `--background`, you should also set `--pid-file`. To stop or restart a cluster, send `SIGTERM` or `SIGHUP` signal to the process ID in the PID file.
{{site.data.alerts.end}}

Check whether you have previously run a multi-node cluster using the same data directory. If you have not, refer to [Troubleshoot Cluster Setup]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}).

If you have previously started and stopped a multi-node cluster, and are now trying to bring it back up, note the following:

The [`--background`]({% link {{ page.version.version }}/cockroach-start.md %}#general) flag of [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) causes the `start` command to wait until the node has fully initialized and is able to start serving queries. In addition, to keep your data consistent, CockroachDB waits until a majority of nodes are running. This means that if only one node of a three-node cluster is running, that one node will not be operational.

As a result, starting nodes with the `--background` flag will cause `cockroach start` to hang until a majority of nodes are fully initialized.

To restart your cluster, you should either:

- Use multiple terminal windows to start multiple nodes in the foreground.
- Start each node in the background using your shell's functionality (e.g., `cockroach start &`) instead of using the `--background` flag.

## Why is memory usage increasing despite lack of traffic?

Like most databases, CockroachDB caches the most recently accessed data in memory so that it can provide faster reads, and [its periodic writes of time-series data](#why-is-disk-usage-increasing-despite-lack-of-writes) cause that cache size to increase until it hits its configured limit. For information about manually controlling the cache size, see [Recommended Production Settings]({% link {{ page.version.version }}/recommended-production-settings.md %}#cache-and-sql-memory-size).

## Why is disk usage increasing despite lack of writes?

By default, [DB Console]({% link {{ page.version.version }}/ui-overview-dashboard.md %}) stores time-series cluster metrics within the cluster. By default, data is retained at 10-second granularity for 10 days, and at 30-minute granularity for 90 days. An automatic job periodically runs and prunes historical data. For the first several days of your cluster's life, the cluster's time-series data grows continually.

CockroachDB writes about 15 KiB per second per node to the time-series database. About half of that is optimized away by the storage engine. Therefore an estimated calculation of how much data will be stored in the time-series database is:

`8 KiB * 24 hours * 3600 seconds/hour * number of days`

For the first 10 days of your cluster's life, you can expect storage per node to increase by about the following amount:

`8 * 24 * 3600 * 10 = 6912000`

or about 6 GiB. With on-disk compression, the actual disk usage is likely to be about 4 GiB.

However, depending on your usage of time-series charts in the [DB Console]({% link {{ page.version.version }}/ui-overview-dashboard.md %}), you may prefer to reduce the amount of disk used by time-series data. To reduce the amount of time-series data stored, refer to [Can I reduce the storage of time-series data?](#can-i-reduce-the-storage-of-time-series-data)

## Why is my disk usage not decreasing after deleting data?

{% comment %}
The below is a lightly edited version of https://stackoverflow.com/questions/74481018/why-is-my-cockroachdb-disk-usage-not-decreasing
{% endcomment %}

There are several reasons why disk usage may not decrease right after deleting data:

- [The data could be preserved for MVCC history.](#the-data-could-be-preserved-for-mvcc-history)
- [The data could be in the process of being compacted.](#the-data-could-be-in-the-process-of-being-compacted)

{% include {{page.version.version}}/storage/free-up-disk-space.md %}

### The data could be preserved for MVCC history

CockroachDB implements [Multi-Version Concurrency Control (MVCC)]({% link {{ page.version.version }}/architecture/storage-layer.md %}#mvcc), which means that it maintains a history of all mutations to a row. This history is used for a wide range of functionality: [transaction isolation]({% link {{ page.version.version }}/transactions.md %}#isolation-levels), historical [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) queries, [incremental backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}), [changefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}), [cluster replication]({% link {{ page.version.version }}/architecture/replication-layer.md %}), and so on. The requirement to preserve history means that CockroachDB "soft deletes" data: The data is marked as deleted by a tombstone record so that CockroachDB will no longer surface the deleted rows to queries, but the old data is still present on disk.

The length of history preserved by MVCC is determined by two things: the [`gc.ttlseconds`]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds) of the zone that contains the data, and whether any [protected timestamps]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) exist. You can check the range's statistics to observe the `key_bytes`, `value_bytes`, and `live_bytes`. The `live_bytes` metric reflects data that's not garbage. The value of `(key_bytes + value_bytes) - live_bytes` will tell you how much MVCC garbage is resident within a range.

This information can be accessed in the following ways:

- Using the [`SHOW RANGES`]({% link {{ page.version.version }}/show-ranges.md %}) SQL statement, which lists the above values under the names `live_bytes`, `key_bytes`, and `val_bytes`.
- In the DB Console, under [**Advanced Debug Page > Even more Advanced Debugging**]({% link {{ page.version.version }}/ui-debug-pages.md %}#even-more-advanced-debugging), click the **Range Status** link, which takes you to a page where the values are displayed in a tabular format like the following: `MVCC Live Bytes/Count | 2.5 KiB / 62 count`.

When data has been deleted for at least the duration specified by [`gc.ttlseconds`]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds), CockroachDB will consider it eligible for 'garbage collection'. Asynchronously, CockroachDB will perform garbage collection of ranges that contain significant quantities of garbage. Note that if there are backups or other processes that haven't completed yet but require the data, these processes may prevent the garbage collection of that data by setting a protected timestamp until these processes have completed.

For more information about how MVCC works, see [MVCC]({% link {{ page.version.version }}/architecture/storage-layer.md %}#mvcc).

### The data could be in the process of being compacted

<a name="space-amplification"></a>

When MVCC garbage is deleted by garbage collection, the data is still not yet physically removed from the filesystem by the [Storage Layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}). Removing data from the filesystem requires rewriting the files containing the data using a process called [compaction]({% link {{ page.version.version }}/architecture/storage-layer.md %}#compaction), which can be expensive. The storage engine has heuristics to compact data and remove deleted rows when enough garbage has accumulated to warrant a compaction. It strives to limit the overhead of this obsolete data (called the _space amplification_) to a small fixed percentage. If a lot of data was just deleted, it may take the storage engine some time to compact the files and restore this property.

{% include {{page.version.version}}/storage/free-up-disk-space.md %}

## How can I free up disk space when dropping a table?

If you've noticed that [your disk space is not freeing up quickly enough after dropping a table](#why-is-my-disk-usage-not-decreasing-after-deleting-data), you can take the following steps to free up disk space more quickly the next time you drop a table. This example assumes a table `t` exists. 

{{site.data.alerts.callout_info}}
The procedure shown here only works if you get the range IDs from the table **before** running [`DROP TABLE`]({% link {{ page.version.version }}/drop-table.md %}). If you are in an emergency situation due to running out of disk, see [What happens when a node runs out of disk space?](#what-happens-when-a-node-runs-out-of-disk-space)
{{site.data.alerts.end}}

1. Lower the [`gc.ttlseconds` parameter]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds) to 10 minutes.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE t CONFIGURE ZONE USING gc.ttlseconds = 600;
    ~~~

1. Find the IDs of the [ranges]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) storing the table data using [`SHOW RANGES`]({% link {{ page.version.version }}/show-ranges.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT range_id FROM [SHOW RANGES FROM TABLE t];
    ~~~

    ~~~
      range_id
    ------------
            68
            69
            70
            ...
    ~~~

1. Drop the table using [`DROP TABLE`]({% link {{ page.version.version }}/drop-table.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
DROP TABLE t;
~~~

1. Visit the [Advanced Debug page]({% link {{ page.version.version }}/ui-debug-pages.md %}) and click the link **Run a range through an internal queue** to visit the **Manually enqueue range in a replica queue** page. On this page, select **mvccGC** from the **Queue** dropdown and enter each range ID from the previous step. Check the **SkipShouldQueue** checkbox to speed up the MVCC [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection) process.

1. Monitor GC progress in the DB Console by watching the [MVCC GC Queue]({% link {{ page.version.version }}/ui-queues-dashboard.md %}#mvcc-gc-queue) and the overall disk space used as shown on the [Overview Dashboard]({% link {{ page.version.version }}/ui-overview-dashboard.md %}).

## What is the `internal-delete-old-sql-stats` process and why is it consuming my resources?

When a query is executed, a process records query execution statistics on system tables. This is done by recording [SQL statement fingerprints]({% link {{ page.version.version }}/ui-statements-page.md %}).

The CockroachDB `internal-delete-old-sql-stats` process cleans up query execution statistics collected on system tables, including `system.statement_statistics` and `system.transaction_statistics`. These system tables have a default row limit of 1 million, set by the `sql.stats.persisted_rows.max` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}). When this limit is exceeded, there is an hourly cleanup job that deletes all of the data that surpasses the row limit, starting with the oldest data first. For more information about the cleanup job, use the following query:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM crdb_internal.jobs WHERE job_type='AUTO SQL STATS COMPACTION';
~~~

In general, the `internal-delete-old-sql-stats` process is not expected to impact cluster performance. There are a few cases where there has been a spike in CPU due to an incredibly large amount of data being processed; however, those cases were resolved through [workload optimizations]({% link {{ page.version.version }}/make-queries-fast.md %}) and general improvements over time.

## Can I reduce the storage of time-series data?

Yes, you can [reduce the interval for time-series storage](#reduce-the-interval-for-time-series-storage).

After reducing time-series storage, it can take up to 24 hours for time-series data to be deleted and for the change to be reflected in DB Console metrics.

### Reduce the interval for time-series storage

To reduce the interval for storage of time-series data:

- For data stored at 10-second resolution, reduce the `timeseries.storage.resolution_10s.ttl` cluster setting to an [`INTERVAL`]({% link {{ page.version.version }}/interval.md %}) value less than `240h0m0s` (10 days).

  For example, to change the storage interval for time-series data at 10s resolution to 5 days, run the following [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %}) command:

  {% include_cached copy-clipboard.html %}
  ~~~ sql
  > SET CLUSTER SETTING timeseries.storage.resolution_10s.ttl = '120h0m0s';
  ~~~

  {% include_cached copy-clipboard.html %}
  ~~~ sql
  > SHOW CLUSTER SETTING timeseries.storage.resolution_10s.ttl;
  ~~~

  ~~~
    timeseries.storage.resolution_10s.ttl
  +---------------------------------------+
    120:00:00
  (1 row)
  ~~~

  This setting has no effect on time-series data aggregated at 30-minute resolution, which is stored for 90 days by default.

- For data stored at 30-minute resolution, reduce the `timeseries.storage.resolution_30m.ttl` cluster setting to an [`INTERVAL`]({% link {{ page.version.version }}/interval.md %}) value less than `2160h0m0s` (90 days).

Cockroach Labs recommends that you avoid _increasing_ the period of time that DB Console retains time-series metrics. If you need to retain this data for a longer period, consider using a third-party tool such as Prometheus to collect and store metrics. Refer to [Monitoring and Alerting]({% link {{ page.version.version }}/monitoring-and-alerting.md %}).

### Disable time-series storage

{{site.data.alerts.callout_info}}
Even if you rely on external tools for storing and visualizing your cluster's time-series metrics, CockroachDB continues to store time-series metrics for its [DB Console Metrics dashboards]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#metrics-dashboards), unless you manually disable this collection. These stored time-series metrics may be used to generate a [tsdump]({% link {{ page.version.version }}/cockroach-debug-tsdump.md %}), which may be critical during escalations to Cockroach Labs support.
{{site.data.alerts.end}}

Disabling time-series storage is recommended only if you exclusively use a third-party tool such as [Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}) for time-series monitoring. Prometheus and other such tools do not rely on CockroachDB-stored time-series data; instead, they ingest metrics exported by CockroachDB from memory and then store the data themselves.

When storage of time-series metrics is disabled, the DB Console Metrics dashboards in the DB Console are still available, but their visualizations are blank. This is because the dashboards rely on data that is no longer available.

To disable the storage of time-series data, run the following command:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING timeseries.storage.enabled = false;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER SETTING timeseries.storage.enabled;
~~~

~~~
  timeseries.storage.enabled
+----------------------------+
            false
(1 row)
~~~

This setting only prevents the collection of new time-series data. To also delete all existing time-series data, also change both the `timeseries.storage.resolution_10s.ttl` and `timeseries.storage.resolution_30m.ttl` cluster settings:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING timeseries.storage.resolution_10s.ttl = '0s';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING timeseries.storage.resolution_30m.ttl = '0s';
~~~

Historical data is not deleted immediately, but is eventually removed by a background job within 24 hours.

## What happens when a node runs out of disk space?

When a node runs out of disk space, it shuts down and cannot be restarted until space is freed up.

To prepare for this case, CockroachDB [automatically creates an emergency ballast file]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#automatic-ballast-files) in each node's storage directory that can be deleted to free up enough space to be able to restart the node.

For more information about troubleshooting disk usage issues, see [storage issues]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#disks-filling-up).

{{site.data.alerts.callout_info}}
In addition to using ballast files, it is important to actively [monitor remaining disk space]({% link {{ page.version.version }}/common-issues-to-monitor.md %}#storage-capacity).
{{site.data.alerts.end}}

{% include {{page.version.version}}/storage/free-up-disk-space.md %}

## Why would increasing the number of nodes not result in more operations per second?

If queries operate on different data, then increasing the number of nodes should improve the overall throughput (transactions/second or QPS).

However, if your queries operate on the same data, you may be observing transaction contention. For details, see [Transaction Contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention).

## Why does CockroachDB collect anonymized cluster usage details by default?

Cockroach Labs collects information about CockroachDB's real-world usage to help prioritize the development of product features. We choose our default as "opt-in" to strengthen the information collected, and are careful to send only anonymous, aggregate usage statistics. For details on what information is collected and how to opt out, see [Diagnostics Reporting]({% link {{ page.version.version }}/diagnostics-reporting.md %}).

## What happens when node clocks are not properly synchronized?

{% include {{ page.version.version }}/faq/clock-synchronization-effects.md %}

## How can I tell how well node clocks are synchronized?

{% include {{ page.version.version }}/faq/clock-synchronization-monitoring.md %}

You can also see these metrics in [the Clock Offset graph]({% link {{ page.version.version }}/ui-runtime-dashboard.md %}#clock-offset) on the DB Console.

## How do I prepare for planned node maintenance?

Perform a [node shutdown]({% link {{ page.version.version }}/node-shutdown.md %}#perform-node-shutdown) to temporarily stop the `cockroach` process on the node. When maintenance is complete and you restart the `cockroach` process, the node will rejoin the cluster.

## See also

- [Production Checklist]({% link {{ page.version.version }}/recommended-production-settings.md %})
- [Product FAQs]({% link {{ page.version.version }}/frequently-asked-questions.md %})
- [SQL FAQs]({% link {{ page.version.version }}/sql-faqs.md %})
