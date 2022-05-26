---
title: Operational FAQs
summary: Get answers to frequently asked questions about operating CockroachDB.
toc: true
toc_not_nested: true
docs_area: get_started
---

## Why is my process hanging when I try to start nodes with the `--background` flag?

Check whether you have previously run a multi-node cluster using the same data directory. If you have not, refer to [Troubleshoot Cluster Setup](cluster-setup-troubleshooting.html). 

If you have previously started and stopped a multi-node cluster, and are now trying to bring it back up, note the following:

The [`--background`](cockroach-start.html#general) flag of [`cockroach start`](cockroach-start.html) causes the `start` command to wait until the node has fully initialized and is able to start serving queries. In addition, to keep your data consistent, CockroachDB waits until a majority of nodes are running. This means that if only one node of a three-node cluster is running, that one node will not be operational. 

As a result, starting nodes with the `--background` flag will cause `cockroach start` to hang until a majority of nodes are fully initialized. 

To restart your cluster, you should either: 

- Use multiple terminals to start multiple nodes at once.
- Start each node in the background using your shell's functionality (e.g., `cockroach start &`) instead of using the `--background` flag.

## Why is memory usage increasing despite lack of traffic?

Like most databases, CockroachDB caches the most recently accessed data in memory so that it can provide faster reads, and [its periodic writes of time-series data](#why-is-disk-usage-increasing-despite-lack-of-writes) cause that cache size to increase until it hits its configured limit. For information about manually controlling the cache size, see [Recommended Production Settings](recommended-production-settings.html#cache-and-sql-memory-size).

## Why is disk usage increasing despite lack of writes?

The time-series data used in the [DB Console](ui-overview-dashboard.html) is stored within the cluster and accumulates for 10 days before it starts to be truncated. As a result, for the first 10 days or so of a cluster's life, you will see a steady increase in disk usage and the number of ranges even if you are not writing data to the cluster.

## Can I reduce or disable the storage of time-series data?

Yes, you can either [reduce the interval for time-series storage](#reduce-the-interval-for-time-series-storage) or [disable time-series storage entirely](#disable-time-series-storage-entirely).

{{site.data.alerts.callout_info}}
After reducing or disabling time-series storage, it can take up to 24 hours for time-series data to be deleted and for the change to be reflected in DB Console metrics.
{{site.data.alerts.end}}

### Reduce the interval for time-series storage

By default, CockroachDB stores time-series data at 10s resolution for 10 days. This data is aggregated into time-series data at 30m resolution, which is stored for 90 days.

To reduce the interval for storage of time-series data:

- For data stored at 10s resolution, change the `timeseries.storage.resolution_10s.ttl` cluster setting to an [`INTERVAL`](interval.html) value less than `240h0m0s` (10 days). 

  For example, to change the storage interval for time-series data at 10s resolution to 5 days, run the following [`SET CLUSTER SETTING`](set-cluster-setting.html) command:

  {% include copy-clipboard.html %}
  ~~~ sql
  > SET CLUSTER SETTING timeseries.storage.resolution_10s.ttl = '120h0m0s';
  ~~~

  {% include copy-clipboard.html %}
  ~~~ sql
  > SHOW CLUSTER SETTING timeseries.storage.resolution_10s.ttl;
  ~~~

  ~~~
    timeseries.storage.resolution_10s.ttl
  +---------------------------------------+
    120:00:00
  (1 row)
  ~~~

  Note that this data is still aggregated into data at 30m resolution, which is stored for 90 days by default.

- For data stored at 30m resolution, change the `timeseries.storage.resolution_30m.ttl` cluster setting to an [`INTERVAL`](interval.html) value less than `2160h0m0s` (90 days).

### Disable time-series storage entirely

{{site.data.alerts.callout_info}}
Disabling time-series storage is recommended only if you exclusively use a third-party tool such as [Prometheus](monitor-cockroachdb-with-prometheus.html) for time-series monitoring. Prometheus and other such tools do not rely on CockroachDB-stored time-series data; instead, they ingest metrics exported by CockroachDB from memory and then store the data themselves.
{{site.data.alerts.end}}

To disable the storage of time-series data entirely, run the following command:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING timeseries.storage.enabled = false;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER SETTING timeseries.storage.enabled;
~~~

~~~
  timeseries.storage.enabled
+----------------------------+
            false
(1 row)
~~~

If you want all existing time-series data to be deleted, also change both the `timeseries.storage.resolution_10s.ttl` and `timeseries.storage.resolution_30m.ttl` cluster settings:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING timeseries.storage.resolution_10s.ttl = '0s';
~~~

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING timeseries.storage.resolution_30m.ttl = '0s';
~~~

## What happens when a node runs out of disk space?

When a node runs out of disk space, it shuts down and cannot be restarted until space is freed up.

{% include_cached new-in.html version=v21.2 %} To prepare for this case, CockroachDB [automatically creates an emergency ballast file](cluster-setup-troubleshooting.html#automatic-ballast-files) in each node's storage directory that can be deleted to free up enough space to be able to restart the node.

For more information about troubleshooting disk usage issues, see [storage issues](cluster-setup-troubleshooting.html#disks-filling-up).

{{site.data.alerts.callout_info}}
In addition to using ballast files, it is important to actively [monitor remaining disk space](common-issues-to-monitor.html#storage-capacity).
{{site.data.alerts.end}}

## Why would increasing the number of nodes not result in more operations per second?

If queries operate on different data, then increasing the number of nodes should improve the overall throughput (transactions/second or QPS).

However, if your queries operate on the same data, you may be observing transaction contention. For details, see [SQL Performance Best Practices](performance-best-practices-overview.html#transaction-contention).

## Why does CockroachDB collect anonymized cluster usage details by default?

Cockroach Labs collects information about CockroachDB's real-world usage to help prioritize the development of product features. We choose our default as "opt-in" to strengthen the information collected, and are careful to send only anonymous, aggregate usage statistics. For details on what information is collected and how to opt out, see [Diagnostics Reporting](diagnostics-reporting.html).

## What happens when node clocks are not properly synchronized?

{% include {{ page.version.version }}/faq/clock-synchronization-effects.md %}

## How can I tell how well node clocks are synchronized?

{% include {{ page.version.version }}/faq/clock-synchronization-monitoring.html %}

You can also see these metrics in [the Clock Offset graph](ui-runtime-dashboard.html#clock-offset) on the DB Console.

## How do I prepare for planned node maintenance?

Perform a [node shutdown](node-shutdown.html#perform-node-shutdown) to temporarily stop a node that you plan to restart.

## See also

- [Production Checklist](recommended-production-settings.html)
- [Product FAQs](frequently-asked-questions.html)
- [SQL FAQs](sql-faqs.html)
