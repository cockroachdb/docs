---
title: Storage Dashboard
summary: The Storage dashboard lets you monitor the storage utilization of your cluster.
toc: true
docs_area: reference.db_console
---

The **Storage** dashboard lets you monitor the storage utilization of your cluster.

To view this dashboard, [access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access), click **Metrics** in the left-hand navigation, and select **Dashboard** > **Storage**.

## Dashboard navigation

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

### Per store metrics

To display per [store]({% link {{ page.version.version }}/cockroach-start.md %}#store) metrics, select a specific node in the **Graph** menu. An aggregate metric for that node as well as a metric for each store of that node will be displayed for [L0 SSTable Count](#l0-sstable-count), [L0 SSTable Size](#l0-sstable-size), and some [other graphs](#other-graphs).

---

The **Storage** dashboard displays the following time series graphs:

## Capacity

You can monitor the **Capacity** graph to determine when additional storage is needed (e.g., by [scaling your cluster]({% link {{ page.version.version }}/cockroach-start.md %})).

Metric | Description
--------|--------
**Max** | The maximum store size. This value may be set per node using [`--store`]({% link {{ page.version.version }}/cockroach-start.md %}#store). If a store size has not been set, this metric displays the actual disk capacity. See [Capacity metrics](#capacity-metrics).
**Available** | The free disk space available to CockroachDB data.
**Used** | The disk space in use by CockroachDB data. This excludes the Cockroach binary, operating system, and other system files.

{% include {{ page.version.version }}/prod-deployment/healthy-storage-capacity.md %}

{% include {{page.version.version}}/storage/free-up-disk-space.md %}

### Capacity metrics

The **Capacity** graph displays disk usage by CockroachDB data in relation to the maximum [store]({% link {{ page.version.version }}/architecture/storage-layer.md %}) size, which is determined as follows:

- If a store size was specified using the [`--store`]({% link {{ page.version.version }}/cockroach-start.md %}#store) flag when starting nodes, this value is used as the limit for CockroachDB data.
- If no store size has been explicitly set, the actual disk capacity is used as the limit for CockroachDB data.

The **available** capacity thus equals the amount of empty disk space, up to the value of the maximum store size. The **used** capacity refers only to disk space occupied by CockroachDB data, which resides in the store directory on each node.

The disk usage of the Cockroach binary, operating system, and other system files is not shown on the **Capacity** graph.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/misc/available-capacity-metric.md %}
{{site.data.alerts.end}}

## Live Bytes

The **Live Bytes** graph displays the amount of data that can be read by applications and CockroachDB.

Metric | Description
--------|--------
**Live** | Number of logical bytes stored in live [key-value pairs]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#table-data). Live data excludes historical and deleted data.
**System** | Number of physical bytes stored in [system key-value pairs]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#meta-ranges). This includes historical and deleted data that has not been [garbage collected]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection).

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/ui/logical-bytes.md %}
{{site.data.alerts.end}}

## L0 SSTable Count

- In the node view, the graph shows the number of [L0 SSTables]({% link {{ page.version.version }}/architecture/storage-layer.md %}#ssts) in use for each store of that node.

- In the cluster view, the graph shows the total number of L0 SSTables in use for each node of the cluster.

## L0 SSTable Size

- In the node view, the graph shows the size of all [L0 SSTables]({% link {{ page.version.version }}/architecture/storage-layer.md %}#ssts) in use for each store of that node.

- In the cluster view, the graph shows the total size of all L0 SSTables in use for each node of the cluster.

## File Descriptors

- In the node view, the graph shows the number of open file descriptors for that node, compared with the file descriptor limit.

- In the cluster view, the graph shows the number of open file descriptors across all nodes, compared with the file descriptor limit.

If the Open count is almost equal to the Limit count, increase [File Descriptors]({% link {{ page.version.version }}/recommended-production-settings.md %}#file-descriptors-limit).

{{site.data.alerts.callout_info}}
If you are running multiple nodes on a single machine (not recommended), the actual number of open file descriptors are considered open on each node. Thus the limit count value displayed on the DB Console is the actual value of open file descriptors multiplied by the number of nodes, compared with the file descriptor limit.
{{site.data.alerts.end}}

For Windows systems, you can ignore the File Descriptors graph because the concept of file descriptors is not applicable to Windows.

## Disk Write Breakdown

- In the node view, the graph shows the number of bytes written to disk per second categorized according to the source for that node.

- In the cluster view, the graph shows the number of bytes written to disk per second categorized according to the source for each node.

Possible sources of writes with their series label are:

- [WAL]({% link {{ page.version.version }}/architecture/storage-layer.md %}#memtable-and-write-ahead-log) (`pebble-wal`)
- [Compactions]({% link {{ page.version.version }}/architecture/storage-layer.md %}#compaction) (`pebble-compaction`)
- [SSTable ingestions]({% link {{ page.version.version }}/architecture/storage-layer.md %}#ssts) (`pebble-ingestion`)
- [Memtable flushes]({% link {{ page.version.version }}/architecture/storage-layer.md %}#memtable-and-write-ahead-log) (`pebble-memtable-flush`)
- [Raft snapshots]({% link {{ page.version.version }}/architecture/replication-layer.md %}#snapshots) (`raft-snapshot`)
- [Encryption Registry]({% link {{ page.version.version }}/security-reference/encryption.md %}#encryption-keys-used-by-cockroachdb-self-hosted-clusters) (`encryption-registry`)
- [Logs]({% link {{ page.version.version }}/logging-overview.md %}) (`crdb-log`)
- SQL row spill (`sql-row-spill`), refer to [`cockroach start` command]({% link {{ page.version.version }}/cockroach-start.md %}#flags) flag `--max-disk-temp-storage`
- [SQL columnar spill]({% link {{ page.version.version }}/vectorized-execution.md %}#disk-spilling-operations) (`sql-col-spill`)

To view an aggregate of all disk writes, refer to the **Hardware** dashboard [**Disk Write Bytes/s** graph]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}#disk-write-bytes-s).

## Other graphs

The **Storage** dashboard shows other time series graphs that are important for CockroachDB developers:

Graph | Description
--------|--------
WAL Fsync Latency | The latency for fsyncs to the storage engine's write-ahead log.
Log Commit Latency: 99th Percentile | The 99th percentile latency for commits to the Raft log. This measures essentially an fdatasync to the storage engine's write-ahead log.
Log Commit Latency: 50th Percentile | The 50th percentile latency for commits to the Raft log. This measures essentially an fdatasync to the storage engine's write-ahead log.
Command Commit Latency: 99th Percentile | The 99th percentile latency for commits of Raft commands. This measures applying a batch to the storage engine (including writes to the write-ahead log), but no fsync.
Command Commit Latency: 50th Percentile | The 50th percentile latency for commits of Raft commands.  This measures applying a batch to the storage engine (including writes to the write-ahead log), but no fsync.
Read Amplification | The average number of real read operations executed per logical read operation across all nodes. See [Read Amplification]({% link {{ page.version.version }}/architecture/storage-layer.md %}#read-amplification).
SSTables | The number of SSTables in use across all nodes.
Flushes | Bytes written by [memtable flushes]({% link {{ page.version.version }}/architecture/storage-layer.md %}#memtable-and-write-ahead-log) across all nodes.
WAL Bytes Written | Bytes written to WAL files across all nodes.
Compactions | Bytes written by [compactions]({% link {{ page.version.version }}/architecture/storage-layer.md %}#compaction) across all nodes.
Ingestions | Bytes written by SSTable ingestions across all nodes.
Write Stalls | The number of intentional write stalls per second across all nodes, used to backpressure incoming writes during periods of heavy write traffic.
Time Series Writes | The number of successfully written time-series samples, and number of errors attempting to write time series samples, per second across all nodes.
Time Series Bytes Written | The number of bytes written by the time-series system per second across all nodes.<br><br>Note that this does not reflect the rate at which disk space is consumed by time series; the data is highly compressed on disk. This rate is instead intended to indicate the amount of network traffic and disk activity generated by time-series writes.

For monitoring CockroachDB, it is sufficient to use the [**Capacity**](#capacity) and [**File Descriptors**](#file-descriptors) graphs.

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Support Resources]({% link {{ page.version.version }}/support-resources.md %})
- [Raw Status Endpoints]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#raw-status-endpoints)
