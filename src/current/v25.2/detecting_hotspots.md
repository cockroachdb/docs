---
title: Detect Hotspots 1
summary: Learn how to detect hotspots in CockroachDB.
toc: true
---

This document provides guidance on identifying common hotspots in CockroachDB clusters, using real-time monitoring and historical logs.

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

**Tip:** Compare runnable goroutine graphs and CPU graphs at the same timestamp to spot sharp increases.

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

## Historical Detection

- Check **Hot Range Logs**:
  - Logs are emitted under certain conditions.
  - Contain details like replica ID and CPU usage.
  - Found in the **HEALTH** channel (moved from **TELEMETRY**).

## Performance Benchmarks and Limitations

During internal testing (row sizes 256–512 bytes) on an **N2-standard-16** machine:

- **Index Hotspot Limit:** ~22,000 inserts per second.
- **Row Hotspot Limits:**
  - ~1,000 writes per second.
  - ~70,000 reads per second.

**Note:** The larger the cluster (number of nodes), the clearer and easier it is to detect hotspots.

---

**Deadline:** First minor release `v25.2.1` scheduled for June.
