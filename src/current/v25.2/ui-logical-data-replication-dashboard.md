---
title: Logical Data Replication Dashboard
summary: The Logical Data Replication Dashboard lets you monitor and observe logical data replication jobs on the destination cluster.
toc: true
docs_area: reference.db_console
---

The **Logical Data Replication** dashboard in the DB Console lets you monitor metrics related to the [logical data replication]({% link {{ page.version.version }}/logical-data-replication-overview.md %}) (LDR) jobs on the destination cluster. These metrics are at the **cluster** level. This means that if there are multiple LDR jobs running on a cluster the DB Console will show the average metrics across jobs.

To view this dashboard, [access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access) for the destination cluster, click **Metrics** on the left-hand navigation bar, and select **Logical Data Replication** from the **Dashboard** dropdown.

{{site.data.alerts.callout_info}}
The **Logical Data Replication** dashboard is distinct from the [**Replication** dashboard]({% link {{ page.version.version }}/ui-replication-dashboard.md %}), which tracks metrics related to how data is replicated across the cluster, e.g., range status, replicas per store, etc.
{{site.data.alerts.end}}

## Dashboard navigation

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

---

The **Logical Data Replication** dashboard displays the following time-series graphs:

{{site.data.alerts.callout_info}}
The specific node views do not apply for LDR metrics.
{{site.data.alerts.end}}

## Replication Latency

The graph shows the difference in commit times between the source cluster and the destination cluster.

Metric | CockroachDB Metric Name | Description
-------|-------------------------|-------------
p50,<br>p99 | `logical_replication.commit_latency-p50`,<br>`logical_replication.commit_latency-p99` | Event commit latency: a difference between event MVCC timestamp and the time it was flushed into disk. If we batch events, then the difference between the oldest event in the batch and flush is recorded.

## Replication Lag

The graph shows the age of the oldest row on the source cluster that has yet to replicate to the destination cluster.

Metric | CockroachDB Metric Name | Description
-------|-------------------------|-------------
Replication Lag | `logical_replication.replicated_time_seconds` | The replicated time of the logical replication stream in seconds since the unix epoch.

## Row Updates Applied

The graph shows the rate at which row updates are applied by all logical replication jobs.

Metric | CockroachDB Metric Name | Description
-------|-------------------------|-------------
Row Updates Applied | `logical_replication.events_ingested` | Events ingested by all logical replication jobs.
Row Updates sent to DLQ | `logical_replication.events_dlqed` | Row update events sent to the dead letter queue (DLQ).

## Logical Bytes Received

- In the cluster view, the graph shows the rate at which the logical bytes (sum of keys + values) are received by all logical replication jobs across all nodes.
- In the node view, the graph shows the rate at which the logical bytes (sum of keys + values) are received by all logical replication jobs on the node.

Metric | CockroachDB Metric Name | Description
-------|-------------------------|-------------
logical bytes | `logical_replication.logical_bytes` | Logical bytes (sum of keys + values) received by all replication jobs.

## Batch Application Processing Time: 50th percentile

- In the cluster view, the graph shows the 50th percentile in the time it takes to write a batch of row updates across all nodes.
- In the node view, the graph shows the 50th percentile in the time it takes to write a batch of row updates on the node.

Metric | CockroachDB Metric Name | Description
-------|-------------------------|-------------
processing time | `logical_replication.batch_hist_nanos-p50` | Time spent flushing a batch.


## Batch Application Processing Time: 99th percentile

- In the cluster view, the graph shows the 99th percentile in the time it takes to write a batch of row updates across all nodes.
- In the node view, the graph shows the 99th percentile in the time it takes to write a batch of row updates on the node.

Metric | CockroachDB Metric Name | Description
-------|-------------------------|-------------
processing time | `logical_replication.batch_hist_nanos-p99` | Time spent flushing a batch.
 
## DLQ Causes

The graph shows the reasons why events were sent to the [dead letter queue (DLQ)]({% link {{ page.version.version }}/manage-logical-data-replication.md %}#dead-letter-queue-dlq)

Metric | CockroachDB Metric Name | Description
-------|-------------------------|-------------
Retry Duration Expired | `logical_replication.events_dlqed_age` | Row update events sent to DLQ due to reaching the maximum time allowed in the retry queue.
Retry Queue Full | `logical_replication.events_dlqed_space` | Row update events sent to DLQ due to capacity of the retry queue.
Non-retryable | `logical_replication.events_dlqed_errtype` | Row update events sent to DLQ due to an error not considered retryable.

## Retry Queue Size

- In the cluster view, the graph shows the total size of the retry queues across all processors in all LDR jobs across all nodes.
- In the node view, the graph shows the total size of the retry queues across all processors in all LDR jobs on the node.

Metric | CockroachDB Metric Name | Description
-------|-------------------------|-------------
retry queue bytes | `logical_replication.retry_queue_bytes` | The size of the retry queue of the logical replication stream.

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Logical Data Replication Overview]({% link {{ page.version.version }}/logical-data-replication-overview.md %})
- [Logical Data Replication Monitoring]({% link {{ page.version.version }}/logical-data-replication-monitoring.md %})
- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Support Resources]({% link {{ page.version.version }}/support-resources.md %})
