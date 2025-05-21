---
title: Detect Hotspots
summary: Learn how to detect hotspots using real-time monitoring and historical logs in CockroachDB.
toc: true
---

This page provides practical guidance on identifying common [hotspots]({% link {{ page.version.version }}/understand-hotspots.md %}) in CockroachDB clusters, using real-time monitoring and historical logs.

## Step 1. Determine if a hotspot exists

To determine whether a [hotspot]({% link {{ page.version.version }}/understand-hotspots.md %}) exists, monitor the [CPU percent graph](#cpu-percent) or [Goroutines graph](#runnable-goroutines-per-cpu) on the [**Metrics** page of the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#metrics). Either graph indicating overload is sufficient to identify a hotspot. Put alerts on these metrics.

### CPU percent

- On the DB Console **Metrics** page **Hardware** dashboard, monitor the [**CPU Percent** graph]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}#cpu-percent).
- CPU usage increases proportionally with traffic.
- If the CPU usage of the hottest node is 20% or more above the cluster average, it may indicate a potential [index hotspot](#index-hotspot) or [row hotspot (hot by read)](#row-hotspot-hot-by-read). Note the ID of the [hot node]({% link {{ page.version.version }}/understand-hotspots.md %}#hot-node).
- For example, node `n5`, represented by the green line in the following **CPU Percent** graph, hovers at around 87% at time 17:35 compared to other nodes that hover around 20% to 25%.
  
<img src="{{ 'images/v25.2/detect-hotspots-1.png' | relative_url }}" alt="graph of CPU Percent utilization per node showing hot key" style="border:1px solid #eee;max-width:100%" />

### Runnable Goroutines per CPU

- On the DB Console **Metrics** page **Runtime** dashboard, monitor the [**Runnable Goroutines Per CPU** graph]({% link {{ page.version.version }}/ui-runtime-dashboard.md %}#runnable-goroutines-per-cpu).
- A significant difference between the average and maximum values may indicate a potential [index hotspot](#index-hotspot) or [row hotspot (hot by read)](#row-hotspot-hot-by-read).  Note the ID of the [hot node]({% link {{ page.version.version }}/understand-hotspots.md %}#hot-node).
- Nodes typically hover near `0.0`, unless a node is at or near its system-configured limit of 32.
- The **Runnable Goroutines per CPU** graph rises more sharply than the [**CPU Percent** graph](#1-cpu-percent). The goroutines graph only jumps up when a node approaches its limit, and then rises sharply. The following image shows the general shapes of the two graphs.

<img src="{{ 'images/v25.2/detect-hotspots-cpu-goroutine-graphs.png' | relative_url }}" alt="comparison of CPU percent and Runnable Goroutines per CPU graphs" style="border:1px solid #eee;max-width:100%" />

- For example, node `n5`, represented by the green line in the following **Runnable Goroutine per CPU** graph, hovers above 3 at 17:35, compared to other nodes hovering around 0.0.

<img src="{{ 'images/v25.2/detect-hotspots-2.png' | relative_url }}" alt="graph of Runnable Goroutines per CPU per node showing node overload" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_success}}
Compare the **Runnable Goroutine per CPU** graph and the **CPU Percent** graph at the same timestamp to spot sharp increases.
{{site.data.alerts.end}}

## Step 2. Determine the type of hotspot

To determine the type of hotspot, monitor the `kv.loadsplitter.popularkey` and `kv.loadsplitter.cleardirection` metrics on the [**Advanced Debug Custom Chart** page of the DB Console]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}). These metrics indicate problematic access patterns. If either graph reveals a pattern, you can use it to identify the hotspot type.

### Popular key

- On the [DB Console **Advanced Debug Custom Chart** page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}), if a virtual cluster dropdown is present in the upper right corner, select `system`.
- Create a custom chart to monitor the `kv.loadsplitter.popularkey` metric. This metric tracks whether the [load-based splitter]({% link {{ page.version.version }}/load-based-splitting.md %}) could not find a split key, and the most frequently sampled split key appears in over 25% of the samples. In a given replica, one key may receive most of the traffic.
- If this metric significantly increases, it may indicate a potential [row hotspot (hot by read)](#row-hotspot-hot-by-read) or [row hotspot (hot by write)](#row-hotspot-hot-by-write).

### Clear direction

CockroachDB optimizes performance by splitting frequently accessed keys into smaller ranges. In conjunction with load-based rebalancing, [load-based splitting]({% link {{ page.version.version }}/load-based-splitting.md %}) distributes load evenly across your cluster.

- On the [DB Console **Advanced Debug Custom Chart** page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}), if a virtual cluster dropdown is present in the upper right corner, select `system`.
- Create a custom chart to monitor the `kv.loadsplitter.cleardirection` metric. This metric tracks whether the [load-based splitter]({% link {{ page.version.version }}/load-based-splitting.md %}) observed an access direction greater than 80% to the left or right in the samples. This indicates that the keys used by a replica increase or decrease steadily in one direction.
- If this metric is non-zero, it may indicate a potential [index hotspot](#index-hotspot).

<img src="{{ 'images/v25.2/detect-hotspots-4.png' | relative_url }}" alt="graph of kv.loadsplitter.cleardirection" style="border:1px solid #eee;max-width:100%" />

## Step 3. Check related logs to determine affected range

After determining the time, node, and the type of the hotspot, check the related logs for more information. Correlate the popular key and clear direction logs with the `hot_ranges_stats` log.

### `hot_ranges_stats` logs

Under certain circumstances, an event of type [`hot_ranges_stats`]({% link {{ page.version.version }}/eventlog.md %}#hot_ranges_stats) will be emitted for a [hot range]({% link {{ page.version.version }}/understand-hotspots.md %}#hot-range). The `hot_ranges_stats` logs contain historical information only for the given node. This event type is logged to the [`HEALTH` channel]({% link {{ page.version.version }}/logging.md %}#health).

The circumstances occur when a single replica on a node uses 250 ms/sec of CPU time. This check is run every minute. Only the node with a hot range logs a `hot_ranges_stats` event.

{{site.data.alerts.callout_info}}
`hot_ranges_stats` logs are also emitted automatically every 4 hours for the top ranges at the time of the check. These entries typically show CPU usage below 250 ms/sec. 
{{site.data.alerts.end}}

### Popular key logs

When the kv layer checks to split ranges, there are two reasons the split fails: (1) a popular key or (2) monotonically increasing or decreasing index.

The popular key log is not connected to a structured event, but has an unstructured message similar to this:

```
no split key found: insufficient counters = 6, imbalance = 14, most popular key occurs in 46% of samples
```

The affected range is in the log tag.

### Clear direction logs

When this log is emitted, the kv layer has detected accesses on a range are occurring in a clear direction.

The clear direction log is not connected to an structured event, but has an unstructured message similar to this:

```
access balance between left and right for sampled keys: left-biased 85%
```

The logs are only emitted when the bias is greater than or equal to 85%.

The affected range is in the log tag.

## Step 4. Determine the index or row causing the hotspot

Once you have determined the [type of hotspot](#hotspot-type), locate the index or row causing the hotspot using the [Hot Ranges page](#hot-ranges-page) and logs, if applicable.

### Hot Ranges page

Navigate to the DB Console [**Hot Ranges** page]({% link {{ page.version.version }}/ui-hot-ranges-page.md %}) to identify the corresponding [hot index](#index-hotspot). For row hotspots—either [hot by read](#row-hotspot-hot-by-read) or [hot by write](#row-hotspot-hot-by-write)—the **Hot Ranges** page can help locate the table and index associated with the affected row.

1. Sort the results by either of the following columns in descending order:
   1.  The **CPU** column that represents CPU time, measured in milliseconds used per second, compared to the [**CPU Percent** graph](#1-cpu-percent) which is percent usage. The per-second rate is averaged over the last 30 minutes.
   1.  The **Write (bytes)** column that represents the total number of bytes written per second on this range. The per-second rate is averaged over the last 30 minutes.
1. Correlate the node ID listed in the **Leaseholder** column with the suspected node noted from the [signal graphs](#signals-to-monitor).
1. If a correlation is found:
  1. Note the range in the **Range ID** column.
  1. Scroll to the right side of the page to find the Table and Index columns, which identify the table and index associated with that range ID.

{{site.data.alerts.callout_success}}
Focus on correlating spikes in the **CPU Percent** or **Runnable Goroutines per CPU** graphs with specific index usage to confirm the index hotspot.
{{site.data.alerts.end}}

Once you have determined the table and index, run the SQL statement [`SHOW CREATE TABLE`]({% link {{ page.version.version }}/show-create.md %}#show-the-create-table-statement-for-a-table) to inspect the schema for the identified table and index.

```mermaid
flowchart TD
    Start --> CPU[CPU metrics]
    Start --> KV[KV latch contention]

    KV -- Yes --> PopKey1[Popular key log]
    KV -- No --> OtherLatch[Some other reason for\nlatch contention]

    CPU -- Yes --> PopKey2[Popular key log]

    PopKey1 --> HRLog[Hot range log\n(Write hotspot)]
    HRLog --> TableIdx1[Table index]
    TableIdx1 --> MitigateApp[Mitigate app\n(refactor)]

    PopKey2 --> ClearLog[Clear access log]
    ClearLog --> HRCheck{Read hotspot?}
    HRCheck -- Yes --> TableIdx2[Table index]
    HRCheck -- No --> OtherSkew[Some other reason for\nCPU skew]
    TableIdx2 --> MitigateIdx[Mitigate index\n(change schema)]
```

---

## Signals to monitor

To identify a [hotspot]({% link {{ page.version.version }}/understand-hotspots.md %}), monitor the following graphs on the [DB Console **Metrics** page]({% link {{ page.version.version }}/ui-overview.md %}#metrics), as well as the following metrics on the [DB Console **Advanced Debug Custom Chart** page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}).

### 1. CPU percent

- On the DB Console **Metrics** page **Hardware** dashboard, monitor the [**CPU Percent** graph]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}#cpu-percent).
- CPU usage increases proportionally with traffic.
- If the CPU usage of the hottest node is 20% or more above the cluster average, it may indicate a potential [index hotspot](#index-hotspot) or [row hotspot (hot by read)](#row-hotspot-hot-by-read). Note the ID of the [hot node]({% link {{ page.version.version }}/understand-hotspots.md %}#hot-node).
- For example, node `n5`, represented by the green line in the following **CPU Percent** graph, hovers at around 87% at time 17:35 compared to other nodes that hover around 20% to 25%.
  
<img src="{{ 'images/v25.2/detect-hotspots-1.png' | relative_url }}" alt="graph of CPU Percent utilization per node showing hot key" style="border:1px solid #eee;max-width:100%" />

### 2. Runnable Goroutines per CPU

- On the DB Console **Metrics** page **Runtime** dashboard, monitor the [**Runnable Goroutines Per CPU** graph]({% link {{ page.version.version }}/ui-runtime-dashboard.md %}#runnable-goroutines-per-cpu).
- A significant difference between the average and maximum values may indicate a potential [index hotspot](#index-hotspot) or [row hotspot (hot by read)](#row-hotspot-hot-by-read).  Note the ID of the [hot node]({% link {{ page.version.version }}/understand-hotspots.md %}#hot-node).
- Nodes typically hover near `0.0`, unless a node is at or near its system-configured limit of 32.
- The **Runnable Goroutines per CPU** graph rises more sharply than the [**CPU Percent** graph](#1-cpu-percent). The goroutines graph only jumps up when a node approaches its limit, and then rises sharply. The following image shows the general shapes of the two graphs.

<img src="{{ 'images/v25.2/detect-hotspots-cpu-goroutine-graphs.png' | relative_url }}" alt="comparison of CPU percent and Runnable Goroutines per CPU graphs" style="border:1px solid #eee;max-width:100%" />

- For example, node `n5`, represented by the green line in the following **Runnable Goroutine per CPU** graph, hovers above 3 at 17:35, compared to other nodes hovering around 0.0.

<img src="{{ 'images/v25.2/detect-hotspots-2.png' | relative_url }}" alt="graph of Runnable Goroutines per CPU per node showing node overload" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_success}}
Compare the **Runnable Goroutine per CPU** graph and the **CPU Percent** graph at the same timestamp to spot sharp increases.
{{site.data.alerts.end}}

### 3. KV Execution Latency

- On the DB Console **Metrics** page **SQL** dashboard, monitor the [**KV Execution Latency: 90th percentile** graph]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#kv-execution-latency-90th-percentile).
- A maximum value that is a clear outlier in the cluster may indicate a potential [row hotspot (hot by write)](#row-hotspot-hot-by-write). Note the ID of the [hot node]({% link {{ page.version.version }}/understand-hotspots.md %}#hot-node).
  
<img src="{{ 'images/v25.2/detect-hotspots-5.png' | relative_url }}" alt="graph of KV Execution Latency: 90th percentile" style="border:1px solid #eee;max-width:100%" />

### 4. Latch conflict wait durations

- On the [DB Console **Advanced Debug Custom Chart** page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}), if a virtual cluster dropdown is present in the upper right corner, select `system`.
- Create a custom chart to monitor the `kv.concurrency.latch_conflict_wait_durations-avg` metric, which tracks time spent on [latch acquisition]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#latch-manager) waiting for conflicts with other latches. For example, a [sequence]({% link {{ page.version.version }}/understand-hotspots.md %}#hot-sequence) writing to the same row must wait for the latch.
- To display the metric per node, select the `PER NODE/STORE` checkbox. 

<img src="{{ 'images/v25.2/detect-hotspots-6.png' | relative_url }}" alt="kv.concurrency.latch_conflict_wait_durations-avg" style="border:1px solid #eee;max-width:100%" />

- A maximum value that is a clear outlier in the cluster may indicate a potential [row hotspot (hot by write)](#row-hotspot-hot-by-write). Note the ID of the [hot node]({% link {{ page.version.version }}/understand-hotspots.md %}#hot-node).

### 5. Clear direction

CockroachDB optimizes performance by splitting frequently accessed keys into smaller ranges. In conjunction with load-based rebalancing, [load-based splitting]({% link {{ page.version.version }}/load-based-splitting.md %}) distributes load evenly across your cluster.

- On the [DB Console **Advanced Debug Custom Chart** page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}), if a virtual cluster dropdown is present in the upper right corner, select `system`.
- Create a custom chart to monitor the `kv.loadsplitter.popularkey` metric. This metric tracks whether the [load-based splitter]({% link {{ page.version.version }}/load-based-splitting.md %}) observed an access direction greater than 80% to the left or right in the samples. This indicates that the keys used by a replica increase or decrease steadily in one direction.
- If this metric is non-zero, it may indicate a potential [index hotspot](#index-hotspot).

<img src="{{ 'images/v25.2/detect-hotspots-4.png' | relative_url }}" alt="graph of kv.loadsplitter.cleardirection" style="border:1px solid #eee;max-width:100%" />

### 6. Popular key

- On the [DB Console **Advanced Debug Custom Chart** page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}), if a virtual cluster dropdown is present in the upper right corner, select `system`.
- Create a custom chart to monitor the `kv.loadsplitter.popularkey` metric. This metric tracks whether the [load-based splitter]({% link {{ page.version.version }}/load-based-splitting.md %}) could not find a split key, and the most frequently sampled split key appears in over 25% of the samples. In a given replica, one key may receive most of the traffic.
- If this metric significantly increases, it may indicate a potential [row hotspot (hot by read)](#row-hotspot-hot-by-read) or [row hotspot (hot by write)](#row-hotspot-hot-by-write).

## Hotspot type

Once you have checked the graphs described in [Signals to monitor](#signals-to-monitor), identify the type of hotspot occurring in your cluster.

### Index hotspot

If the following combination of graphs indicates a hotspot:

- [1. CPU percent](#1-cpu-percent)
- [2. Runnable Goroutines per CPU](#2-runnable-goroutines-per-cpu)
- [5. Clear direction](#5-clear-direction) 

the hotspot is likely to be an [index hotspot]({% link {{ page.version.version }}/understand-hotspots.md %}#index-hotspot).

### Row hotspot, hot by read

If the following combination of graphs indicates a hotspot:

- [1. CPU percent](#1-cpu-percent)
- [2. Runnable Goroutines per CPU](#2-runnable-goroutines-per-cpu)
- [6. Popular key](#6-popular-key)

the hotspot is likely to be a [row hotspot]({% link {{ page.version.version }}/understand-hotspots.md %}#row-hotspot) that is [hot by read]({% link {{ page.version.version }}/understand-hotspots.md %}#read-hotspot).

### Row hotspot, hot by write

If the following combination of graphs indicates a hotspot:

- [3. KV Execution Latency](#3-kv-execution-latency)
- [4. Latch conflict wait durations](#4-latch-conflict-wait-durations)
- [6. Popular key](#6-popular-key)

the hotspot is likely to be a [row hotspot]({% link {{ page.version.version }}/understand-hotspots.md %}#row-hotspot) that is [hot by write]({% link {{ page.version.version }}/understand-hotspots.md %}#write-hotspot).

## Location of hotspot

Once you have determined the [type of hotspot](#hotspot-type), locate the index or row causing the hotspot using the [Hot Ranges page](#hot-ranges-page) and logs, if applicable.

### Hot Ranges page

Navigate to the DB Console [**Hot Ranges** page]({% link {{ page.version.version }}/ui-hot-ranges-page.md %}) to identify the corresponding [hot index](#index-hotspot). For row hotspots—either [hot by read](#row-hotspot-hot-by-read) or [hot by write](#row-hotspot-hot-by-write)—the **Hot Ranges** page can help locate the table and index associated with the affected row.

1. Sort the results by either of the following columns in descending order:
   1.  The **CPU** column that represents CPU time, measured in milliseconds used per second, compared to the [**CPU Percent** graph](#1-cpu-percent) which is percent usage. The per-second rate is averaged over the last 30 minutes.
   1.  The **Write (bytes)** column that represents the total number of bytes written per second on this range. The per-second rate is averaged over the last 30 minutes.
1. Correlate the node ID listed in the **Leaseholder** column with the suspected node noted from the [signal graphs](#signals-to-monitor).
1. If a correlation is found:
  1. Note the range in the **Range ID** column.
  1. Scroll to the right side of the page to find the Table and Index columns, which identify the table and index associated with that range ID.

{{site.data.alerts.callout_success}}
Focus on correlating spikes in the **CPU Percent** or **Runnable Goroutines per CPU** graphs with specific index usage to confirm the index hotspot.
{{site.data.alerts.end}}

Once you have determined the table and index, run the SQL statement [`SHOW CREATE TABLE`]({% link {{ page.version.version }}/show-create.md %}#show-the-create-table-statement-for-a-table) to inspect the schema for the identified table and index.


### `hot_ranges_stats` logs

Under certain circumstances, an event of type [hot_ranges_stats]({% link {{ page.version.version }}/eventlog.md %}#hot_ranges_stats) will be emitted for a [hot range]({% link {{ page.version.version }}/understand-hotspots.md %}#hot-range). While the [**Hot Ranges** page](#hot-ranges-page) contains real-time information for all the nodes of the cluster, the `hot_ranges_stats` logs contain historical information only for the given node. This event type is logged to the [`HEALTH` channel]({% link {{ page.version.version }}/logging.md %}#health).

### Clear direction logs

The clear direction log is not connected to an event, but has an unstructured message similar to this:

```
access balance between left and right for sampled keys: left-biased 85%
```

### Popular key logs

The popular key log is not connected to an event, but has an unstructured message similar to this:

```
no split key found: insufficient counters = 6, imbalance = 14, most popular key occurs in 46% of samples
```

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

## See also

- [Understand Hotspots]({% link {{ page.version.version }}/understand-hotspots.md %})
- [DB Console **Metrics** page]({% link {{ page.version.version }}/ui-overview.md %}#metrics)
- [DB Console **Advanced Debug Custom Chart** page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %})
- [**Hot Ranges** page]({% link {{ page.version.version }}/ui-hot-ranges-page.md %})