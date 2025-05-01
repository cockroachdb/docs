---
title: Detect Hotspots
summary: Learn how to detect hotspots in CockroachDB.
toc: true
---

This page provides guidance on identifying common hotspots in CockroachDB clusters, using real-time monitoring and historical logs.

## Real-time Detection

### Read hotspots

To detect a [read hotspot]({% link {{ page.version.version }}/understand-hotspots.md %}#read-hotspot), such as an [index hotspot]({% link {{ page.version.version }}/understand-hotspots.md %}#index-hotspot) or [hot key]({% link {{ page.version.version }}/understand-hotspots.md %}#row-hotspot), monitor the following graphs on the [DB Console **Metrics** page]({% link {{ page.version.version }}/ui-overview.md %}#metrics).

#### CPU check

- On the DB Console **Metrics** page **Hardware** dashboard, monitor the [**CPU Percent** graph]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}#cpu-percent).
- If the CPU usage of the hottest node is 20% or more above the cluster average, it may indicate a potential hotspot.
- For example, node `n5`, represented by the green line in the following graph, hovers at around 87% at time 17:35 compared to other nodes which hover around 20% to 25%:
  
<img src="{{ 'images/v25.2/detect-hotspots-1.png' | relative_url }}" alt="graph of CPU Percent utilization per node showing hot key" style="border:1px solid #eee;max-width:100%" />

#### Node overload check

- On the DB Console **Metrics** page **Runtime** dashboard, monitor the [**Runnable Goroutines Per CPU** graph]({% link {{ page.version.version }}/ui-runtime-dashboard.md %}#runnable-goroutines-per-cpu).
- A significant difference between the average and maximum values may indicate a potential hotspot.
- Nodes typically hover near `0.0`, unless a node is at or near its system-configured limit of 32.
- The **Runnable Goroutines per CPU** graph increases faster than the **CPU Percent** graph only when a node approaches its limit. 
- For example, node `n5`, represented by the green line in the following graph, hovers above 3 at 17:35, compared to other nodes hovering around 0.5:

<img src="{{ 'images/v25.2/detect-hotspots-2.png' | relative_url }}" alt="graph of Runnable Goroutines per CPU per node showing node overload" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_success}}
Compare the **Runnable Goroutine per CPU** graph and the **CPU Percent** graph at the same timestamp to spot sharp increases.
{{site.data.alerts.end}}

#### I/O check

- On the DB Console **Metrics** page **Overload** dashboard, monitor the [**IO Overload** graph]({% link {{ page.version.version }}/ui-overload-dashboard.md %}#io-overload).
- If the CPU is not the bottleneck, check the **IO Overload** graph for potential I/O issues.

<img src="{{ 'images/v25.2/detect-hotspots-3.png' | relative_url }}" alt="graph of IO Overload score per node" style="border:1px solid #eee;max-width:100%" />

### Read or write hotspots

To detect a [read or write hotspot]({% link {{ page.version.version }}/understand-hotspots.md %}#read-hotspot), such as an [index hotspot]({% link {{ page.version.version }}/understand-hotspots.md %}#index-hotspot), monitor the following metric on the [DB Console **Advanced Debug Custom Chart** page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}).

#### Clear direction check

To optimize your cluster's performance, CockroachDB can split frequently accessed keys into smaller ranges. In conjunction with load-based rebalancing, [load-based splitting]({% link {{ page.version.version }}/load-based-splitting.md %}) distributes load evenly across your cluster.

- On the [DB Console **Advanced Debug Custom Chart** page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}), select the `system` virtual cluster and create a chart to monitor the metric `kv.loadsplitter.cleardirection`. This metric tracks whether the [load-based splitter]({% link {{ page.version.version }}/load-based-splitting.md %}) observed an access direction greater than 80% to the left or right in the samples. This suggests that keys used for a replica are steadily increasing or decreasing in a consistent direction.
- If this metric significantly increases, it may indicate an index hotspot.
- TODO: READ Example, look at last 3 messages

<img src="{{ 'images/v25.2/detect-hotspots-4.png' | relative_url }}" alt="graph of kv.loadsplitter.cleardirection" style="border:1px solid #eee;max-width:100%" />

### Write hotspots

To detect a [write hotspot]({% link {{ page.version.version }}/understand-hotspots.md %}#write-hotspot), such as a [hot key]({% link {{ page.version.version }}/understand-hotspots.md %}#row-hotspot), monitor the following graph on the [DB Console **Metrics** page]({% link {{ page.version.version }}/ui-overview.md %}#metrics), as well as the following metrics on the [DB Console **Advanced Debug Custom Chart** page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}).

#### KV Execution Latency check

- On the DB Console **Metrics** page **SQL** dashboard, monitor the [**KV Execution Latency: 90th percentile** graph]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#kv-execution-latency-90th-percentile).
- If the maximum value is a clear outlier in the cluster, it may indicate a potential hotspot.
  
<img src="{{ 'images/v25.2/detect-hotspots-5.png' | relative_url }}" alt="graph of KV Execution Latency: 90th percentile" style="border:1px solid #eee;max-width:100%" />

#### Latch conflict wait durations check

- On the [DB Console **Advanced Debug Custom Chart** page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}), select the `system` virtual cluster and create a chart to monitor the metric `kv.concurrency.latch_conflict_wait_durations`. This metric tracks durations in nanoseconds spent on [latch acquisition]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#latch-manager) waiting for conflicts with other latches. For example, a [sequence]({% link {{ page.version.version }}/understand-hotspots.md %}#hot-sequence) writing to the same row must wait for the latch.
- If the maximum value is a clear outlier in the cluster, it may indicate a potential hotspot.

- ?? metric is a histogram so which should be chosen?

<img src="{{ 'images/v25.2/detect-hotspots-6.png' | relative_url }}" alt="kv.concurrency.latch_conflict_wait_durations" style="border:1px solid #eee;max-width:100%" />

#### Popular key check

- On the [DB Console **Advanced Debug Custom Chart** page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}), select the `system` virtual cluster and create a chart to monitor the metric `kv.loadsplitter.popularkey`. This metric tracks whether the [load-based splitter]({% link {{ page.version.version }}/load-based-splitting.md %})  could not find a split key, and the most popular sampled split key appears in more than 25% of the samples. In a given replica, one key is receiving most of the traffic.
- If this metric significantly increases, it may indicate a potential hotspot.

### Finding the Hot Index

#### Hot Ranges page

If the graphs on the **Metrics** page or the **Advanced Debug Custom Chart** page indicate a potential [node hotspot]({% link {{ page.version.version }}/understand-hotspots.md %}#node-hotspot), navigate to the DB Console [**Hot Ranges** page]({% link {{ page.version.version }}/ui-hot-ranges-page.md %}) to determine the corresponding [hot index]({% link {{ page.version.version }}/understand-hotspots.md %}#index-hotspot). The **Hot ranges** page results are averaged over 30 minutes.

1. Sort the results.
   1.  By the **CPU** column descending. The values are CPU time measured in milliseconds used per second compared to the **CPU Percent** graph which is percent usage.
   1.  By the **Write (bytes)** column descending.
1. Check the **Leaseholder** column to correlate the hot range results with the suspected node from the preceding graph checks on the **Metrics** or **Advanced Debug Custom Chart** pages.
1. If a correlation is found:
  1. Note the range in the **Range ID** column.
  1. Scroll to the right of the page to the **Table** and **Index** columns to retrieve the table and index associated with that range.

{{site.data.alerts.callout_success}}
Focus on correlating spikes in **CPU Percent** or **Runnable Goroutine per CPU** with specific index usage to confirm the hotspot.
{{site.data.alerts.end}}

Use the SQL statement [`SHOW CREATE TABLE`] to inspect the schema for the involved table and index.

## Historical Detection

- Check **Hot Range Logs**:
  - Logs are emitted under certain conditions.
  - Contain details like replica ID and CPU usage.
  - Found in the **HEALTH** channel (moved from **TELEMETRY**).

## Performance Benchmarks and Limitations

During internal testing (row sizes 256–512 bytes) on an **N2-standard-16** machine:

| Category               | Performance Limit          |
|------------------------|-----------------------------|
| Index Hotspot          | ~22,000 inserts per second  |
| Row Hotspot (Writes)   | ~1,000 writes per second    |
| Row Hotspot (Reads)    | ~70,000 reads per second    |

{{site.data.alerts.callout_info}}
The larger the cluster, the easier it is to detect hotspots due to clearer outliers.
{{site.data.alerts.end}}