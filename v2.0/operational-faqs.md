---
title: Operational FAQs
summary: Get answers to frequently asked questions about operating CockroachDB.
toc: true
toc_not_nested: true
---


## Why is my process hanging when I try to start it in the background?

The first question that needs to be asked is whether or not you have previously
run a multi-node cluster using the same data directory. If you haven't, then you
should check out our [Cluster Setup Troubleshooting
docs](cluster-setup-troubleshooting.html). If you have previously started and
stopped a multi-node cluster and are now trying to bring it back up, you're in
the right place.

In order to keep your data consistent, CockroachDB only works when at least a
majority of its nodes are running. This means that if only one node of a three
node cluster is running, that one node will not be able to do anything. The
`--background` flag of [`cockroach start`](start-a-node.html) causes the start
command to wait until the node has fully initialized and is able to start
serving queries.

Together, these two facts mean that the `--background` flag will cause
`cockroach start` to hang until a majority of nodes are running. In order to
restart your cluster, you should either use multiple terminals so that you can
start multiple nodes at once or start each node in the background using your
shell's functionality (e.g., `cockroach start &`) instead of the `--background`
flag.

## Why is memory usage increasing despite lack of traffic?

Like most databases, CockroachDB caches the most recently accessed data in memory so that it can provide faster reads, and [its periodic writes of timeseries data](#why-is-disk-usage-increasing-despite-lack-of-writes) cause that cache size to increase until it hits its configured limit. For information about manually controlling the cache size, see [Recommended Production Settings](recommended-production-settings.html#cache-and-sql-memory-size).

## Why is disk usage increasing despite lack of writes?

The timeseries data used to power the graphs in the admin UI is stored within the cluster and accumulates for 30 days before it starts getting truncated. As a result, for the first 30 days or so of a cluster's life, you will see a steady increase in disk usage and the number of ranges even if you aren't writing data to the cluster yourself.

## Can I reduce or disable the storage of timeseries data? <span class="version-tag">New in v2.0</span>

Yes. By default, CockroachDB stores timeseries data for the last 30 days for display in the Admin UI, but you can [reduce the interval for timeseries storage](#reduce-the-interval-for-timeseries-storage) or [disable timeseries storage entirely](#disable-timeseries-storage-entirely).

{{site.data.alerts.callout_info}}After reducing or disabling timeseries storage, it can take up to 24 hours for timeseries data to be deleted and for the change to be reflected in Admin UI metrics.{{site.data.alerts.end}}

### Reduce the interval for timeseries storage

To reduce the interval for storage of timeseries data, change the `timeseries.resolution_10s.storage_duration` cluster setting to an [`INTERVAL`](interval.html) value less than `720h0m0s` (30 days). For example, to store timeseries data for the last 15 days, run the following [`SET CLUSTER SETTING`](set-cluster-setting.html) command:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING timeseries.resolution_10s.storage_duration = '360h0m0s';
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER SETTING timeseries.resolution_10s.storage_duration;
~~~

~~~
+--------------------------------------------+
| timeseries.resolution_10s.storage_duration |
+--------------------------------------------+
| 360h                                       |
+--------------------------------------------+
(1 row)
~~~

### Disable timeseries storage entirely

{{site.data.alerts.callout_info}}Disabling timeseries storage is recommended only if you exclusively use a third-party tool such as <a href="monitor-cockroachdb-with-prometheus.html">Prometheus</a> for timeseries monitoring. Prometheus and other such tools do not rely on CockroachDB-stored timeseries data; instead, they ingest metrics exported by CockroachDB from memory and then store the data themselves.{{site.data.alerts.end}}

To disable the storage of timeseries data entirely, run the following command:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING timeseries.storage.enabled = false;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER SETTING timeseries.storage.enabled;
~~~

~~~
+----------------------------+
| timeseries.storage.enabled |
+----------------------------+
| false                      |
+----------------------------+
(1 row)
~~~

If you want all existing timeseries data to be deleted, change the `timeseries.resolution_10s.storage_duration` cluster setting as well:     

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING timeseries.resolution_10s.storage_duration = '0s';
~~~

## Why would increasing the number of nodes not result in more operations per second?

If queries operate on different data, then increasing the number
of nodes should improve the overall throughput (transactions/second or QPS).

However, if your queries operate on the same data, you may be
observing transaction contention. See [Understanding and Avoiding
Transaction
Contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention)
for more details.

## Why does CockroachDB collect anonymized cluster usage details by default?

Collecting information about CockroachDB's real world usage helps us prioritize the development of product features. We choose our default as "opt-in" to strengthen the information we receive from our collection efforts, but we also make a careful effort to send only anonymous, aggregate usage statistics. See [Diagnostics Reporting](diagnostics-reporting.html) for a detailed look at what information is sent and how to opt-out.

## What happens when node clocks are not properly synchronized?

{% include {{ page.version.version }}/faq/clock-synchronization-effects.md %}

## How can I tell how well node clocks are synchronized?

{% include {{ page.version.version }}/faq/clock-synchronization-monitoring.html %}

You can also see these metrics in [the Clock Offset graph](admin-ui-runtime-dashboard.html#clock-offset) on the Admin UI's Runtime dashboard as of the v2.0 release.

## How do I prepare for planned node maintenance?

{% include {{ page.version.version }}/faq/planned-maintenance.md %}

## See Also

- [Product FAQs](frequently-asked-questions.html)
- [SQL FAQs](sql-faqs.html)
