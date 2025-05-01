---
title: Detect Hotspots 2
summary: Learn how to detect hotspots in CockroachDB.
toc: true
---

This document provides guidance on identifying common hotspots in CockroachDB clusters, using real-time monitoring and historical logs.

{{site.data.alerts.callout_info}}
This guide focuses on both real-time and historical hotspot detection techniques.
{{site.data.alerts.end}}

## Real-time Detection

### Indicators of Hotspots

#### Index Hotspot or Hot Key (Read)

- **Hotspot "Eyeball Test"**
  - Use the **DB Console** and **Hardware** dashboard.
  - If the CPU usage of the hottest node is 20% or more greater than the cluster average, it indicates a potential hotspot.

- **Node Overload**
  - Use the **DB Console** and **Runtime** dashboard.
  - Monitor **Runnable Goroutines Per CPU**:
    - Nodes typically hover near 0.0.
    - A stark difference between the average and maximum values indicates that a node is at or near its limit.
    - Runnable goroutines increase faster than CPU usage when nearing the system-configured maximum of 32.

{{site.data.alerts.callout_success}}
Compare runnable goroutine graphs and CPU graphs at the same timestamp to easily spot sharp increases.
{{site.data.alerts.end}}

- **IO Overload**
  - If CPU is not the bottleneck, review the **Overload** dashboard for IO issues.

### Index Hotspot (Read/Write)

- **Clear Direction Metric** (`kv.loadsplitter.cleardirection`)
  - Indicates keys for a replica are increasing or decreasing uniformly.
  - Check via **Advanced Debug**.
  - Examine the last three messages for signs.

- **KV Execution Latency**
  - Found on the **SQL Dashboard** in the **DB Console**.
  - Look at the 90th percentile latency; an outlier indicates a hotspot.

- **Latch Conflict Wait Durations** (`kv.concurrency.latch_conflict_wait_durations`)
  - Available in **Advanced Debug**.
  - A clear outlier signals contention, often caused by writes to the same row.

- **Popular Key Metric** (`kv.loadsplitter.popularkey`)
  - Indicates one key is receiving most of the traffic.
  - Available only via **Advanced Debug**.

### Finding the Hot Index

- Use the **Hot Ranges** page:
  - Sort by **CPU usage** and **Write (bytes)**.
  - Correlate metrics with the suspected node.
  - Metrics are averaged over 30 minutes.
  - CPU time is measured in milliseconds used per second.

- If correlation is found:
  1. Identify the range.
  2. Retrieve the index associated with the range.

- **Final Step:**
  - Use `SHOW CREATE TABLE` to inspect the table structure for the involved index.

{{site.data.alerts.callout_success}}
Focus on correlating spikes in CPU or goroutines with specific index usage to confirm the hotspot.
{{site.data.alerts.end}}

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

---

{{site.data.alerts.callout_danger}}
**Deadline:** First minor release `v25.2.1` scheduled for June.
{{site.data.alerts.end}}
