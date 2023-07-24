---
title: Storage Dashboard
summary: The Storage dashboard lets you monitor the storage utilization of your cluster.
toc: true
docs_area: reference.db_console
---

The **Storage** dashboard lets you monitor the storage utilization of your cluster.

To view this dashboard, [access the DB Console](ui-overview.html#db-console-access), click **Metrics** in the left-hand navigation, and select **Dashboard** > **Storage**.

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

The **Storage** dashboard displays the following time series graphs:

## Capacity

You can monitor the **Capacity** graph to determine when additional storage is needed (e.g., by [scaling your cluster](cockroach-start.html)).

<img src="{{ 'images/v23.1/ui_capacity.png' | relative_url }}" alt="DB Console Capacity graph" style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|--------
**Capacity** | The maximum store size. This value may be set per node using [`--store`](cockroach-start.html#store). If a store size has not been set, this metric displays the actual disk capacity. See [Capacity metrics](#capacity-metrics).
**Available** | The free disk space available to CockroachDB data.
**Used** | The disk space in use by CockroachDB data. This excludes the Cockroach binary, operating system, and other system files.

{% include {{ page.version.version }}/prod-deployment/healthy-storage-capacity.md %}

### Capacity metrics

The **Capacity** graph displays disk usage by CockroachDB data in relation to the maximum [store](architecture/storage-layer.html) size, which is determined as follows:

- If a store size was specified using the [`--store`](cockroach-start.html#store) flag when starting nodes, this value is used as the limit for CockroachDB data.
- If no store size has been explicitly set, the actual disk capacity is used as the limit for CockroachDB data.

The **available** capacity thus equals the amount of empty disk space, up to the value of the maximum store size. The **used** capacity refers only to disk space occupied by CockroachDB data, which resides in the store directory on each node.

The disk usage of the Cockroach binary, operating system, and other system files is not shown on the **Capacity** graph.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/misc/available-capacity-metric.md %}
{{site.data.alerts.end}}

## Live Bytes

The **Live Bytes** graph displays the amount of data that can be read by applications and CockroachDB.

<img src="{{ 'images/v23.1/ui_live_bytes.png' | relative_url }}" alt="DB Console Replicas per Store" style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|--------
**Live** | Number of logical bytes stored in live [key-value pairs](architecture/distribution-layer.html#table-data). Live data excludes historical and deleted data.
**System** | Number of physical bytes stored in [system key-value pairs](architecture/distribution-layer.html#meta-ranges). This includes historical and deleted data that has not been [garbage collected](architecture/storage-layer.html#garbage-collection).

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/ui/logical-bytes.md %}
{{site.data.alerts.end}}

## File Descriptors

<img src="{{ 'images/v23.1/ui_file_descriptors.png' | relative_url }}" alt="DB Console File Descriptors" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the number of open file descriptors for that node, compared with the file descriptor limit.

- In the cluster view, the graph shows the number of open file descriptors across all nodes, compared with the file descriptor limit.

If the Open count is almost equal to the Limit count, increase [File Descriptors](recommended-production-settings.html#file-descriptors-limit).

{{site.data.alerts.callout_info}}
If you are running multiple nodes on a single machine (not recommended), the actual number of open file descriptors are considered open on each node. Thus the limit count value displayed on the DB Console is the actual value of open file descriptors multiplied by the number of nodes, compared with the file descriptor limit.
{{site.data.alerts.end}}

For Windows systems, you can ignore the File Descriptors graph because the concept of file descriptors is not applicable to Windows.

## Other graphs

The **Storage** dashboard shows other time series graphs that are important for CockroachDB developers:

Graph | Description
--------|--------
Log Commit Latency: 99th Percentile | The 99th percentile latency for commits to the Raft log.
Log Commit Latency: 50th Percentile | The 50th percentile latency for commits to the Raft log.
Command Commit Latency: 99th Percentile | The 99th percentile latency for commits of Raft commands.
Command Commit Latency: 50th Percentile | The 50th percentile latency for commits of Raft commands.
Read Amplification | The average number of real read operations executed per logical read operation across all nodes. See [Read Amplification](architecture/storage-layer.html#read-amplification).
SSTables | The number of SSTables in use across all nodes.
Flushes | Bytes written by [memtable flushes](architecture/storage-layer.html#memtable-and-write-ahead-log) across all nodes.
Compactions | Bytes written by [compactions](architecture/storage-layer.html#compaction) across all nodes.
Ingestions | Bytes written by SSTable injections across all nodes.
Write Stalls | The number of intentional write stalls per second across all nodes, used to backpressure incoming writes during periods of heavy write traffic.
Time Series Writes | The number of successfully written time-series samples, and number of errors attempting to write time series samples, per second across all nodes.
Time Series Bytes Written | The number of bytes written by the time-series system per second across all nodes.

For monitoring CockroachDB, it is sufficient to use the [**Capacity**](#capacity) and [**File Descriptors**](#file-descriptors) graphs.

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
