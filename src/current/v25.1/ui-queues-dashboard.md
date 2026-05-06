---
title: Queues Dashboard
summary: The Queues dashboard lets you monitor the health and performance of various queueing systems in CockroachDB.
toc: true
docs_area: reference.db_console
---

The **Queues** dashboard lets you monitor the health and performance of various queueing systems in CockroachDB.

To view this dashboard, [access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access) and click **Metrics** on the left-hand navigation, and then select **Dashboard** > **Queues**.

## Dashboard navigation

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

{{site.data.alerts.callout_info}}
All timestamps in the DB Console are shown in Coordinated Universal Time (UTC).
{{site.data.alerts.end}}

The **Queues** dashboard displays the following time series graphs:

## Queue Processing Failures

<img src="{{ 'images/common/ui/ui_queue_failures.png' | relative_url }}" alt="DB Console queue failures graph" style="border:1px solid #eee;max-width:100%" />

The **Queue Processing Failures** graph displays processing failures experienced across various queuing systems.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
GC | The number of replicas which failed processing in the garbage collection queue, as tracked by the `queue.gc.process.failure` metric.
Replica GC | The number of replicas which failed processing in the replica garbage collection queue, as tracked by the `queue.replicagc.process.failure` metric.
Replication | The number of replicas which failed processing in the replica queue, as tracked by the `queue.replicate.process.failure` metric.
Split | The number of replicas which failed processing in the split queue, as tracked by the `queue.split.process.failure` metric.
Consistency | The number of replicas which failed processing in the consistency checker queue, as tracked by the `queue.consistency.process.failure` metric.
Raft Log | The number of replicas which failed processing in the Raft log queue, as tracked by the `queue.raftlog.process.failure` metric.
Raft Snapshot | The number of replicas which failed processing in the Raft repair queue, as tracked by the `queue.raftsnapshot.process.failure` metric.
Time Series Maintenance | The number of replicas which failed processing in the time series maintenance queue, as tracked by the `queue.tsmaintenance.process.failure` metric.

## Queue Processing Times

<img src="{{ 'images/common/ui/ui_queue_time.png' | relative_url }}" alt="DB Console queue processing time graph" style="border:1px solid #eee;max-width:100%" />

The **Queue Processing Times** graph displays the processing rate across various queue systems.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
GC | The processing rate for the garbage collection queue, as tracked by the `queue.gc.processingnanos` metric.
Replica GC | The processing rate for the replica garbage collection queue, as tracked by the `queue.replicagc.processingnanos` metric.
Replication | The processing rate for the replication queue, as tracked by the `queue.replicate.processingnanos` metric.
Split | The processing rate for the split queue, as tracked by the `queue.split.processingnanos` metric.
Consistency | The processing rate for the consistency checker queue, as tracked by the `queue.consistency.processingnanos` metric.
Raft Log | The processing rate for the Raft log queue, as tracked by the `queue.raftlog.processingnanos` metric.
Raft Snapshot | The processing rate for the Raft repair queue, as tracked by the `queue.raftsnapshot.processingnanos` metric.
Time Series Maintenance | The processing rate for the time series maintenance queue, as tracked by the `queue.tsmaintenance.processingnanos` metric.

## Replica GC Queue

<img src="{{ 'images/common/ui/ui_replicagc_queue.png' | relative_url }}" alt="DB Console replica GC queue graph" style="border:1px solid #eee;max-width:100%" />

The **Replica GC Queue** graph displays various details about the health and performance of the replica garbage collection queue.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Successful Actions | The number of replicas successfully processed by the replica garbage collection queue, as tracked by the `queue.replicagc.process.success` metric.
Pending Actions | The number of pending replicas in the replica garbage collection queue, as tracked by the `queue.replicagc.pending` metric.
Replicas Removed | The number of replica removals attempted in the replica garbage collection queue, as tracked by the `queue.replicagc.removereplica` metric.

## Replication Queue

<img src="{{ 'images/common/ui/ui_replication_queue.png' | relative_url }}" alt="DB Console replication queue graph" style="border:1px solid #eee;max-width:100%" />

The **Replication Queue** graph displays various details about the health and performance of the replication queue.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Successful Actions | The number of replicas successfully processed by the replication queue, as tracked by the `queue.replicate.process.success` metric.
Pending Actions | The number of pending replicas in the replication queue, as tracked by the `queue.replicate.pending` metric.
Replicas Added | The number of replica additions attempted by the replication queue, as tracked by the `queue.replicate.addreplica` metric.
Replicas Removed | The number of replica removals attempted by the replication queue, as tracked by the `queue.replicate.removereplica` metric.
Dead Replicas Removed | The number of dead replica removals attempted by the replication queue, as tracked by the `queue.replicate.removedeadreplica` metric.
Learner Replicas Removed | The number of learner replica removals attempted by the replication queue, as tracked by the `queue.replicate.removelearnerreplica` metric.
Replicas Rebalanced | The number of replica rebalancer-initiated additions attempted by the replication queue, as tracked by the `queue.replicate.rebalancereplica` metric.
Leases Transferred | The number of range lease transfers attempted by the replication queue, as tracked by the `queue.replicate.transferlease` metric.
Replicas in Purgatory | The number of replicas in the replication queue's purgatory currently awaiting allocation options, as tracked by the `queue.replicate.purgatory` metric.

## Split Queue

<img src="{{ 'images/common/ui/ui_split_queue.png' | relative_url }}" alt="DB Console split queue graph" style="border:1px solid #eee;max-width:100%" />

The **Split Queue** graph displays various details about the health and performance of the split queue.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Successful Actions | The number of replicas successfully processed by the split queue, as tracked by the `queue.split.process.success` metric.
Pending Actions | The number of pending replicas in the split queue, as tracked by the `queue.split.pending` metric.

## Merge Queue

<img src="{{ 'images/common/ui/ui_merge_queue.png' | relative_url }}" alt="DB Console merge queue graph" style="border:1px solid #eee;max-width:100%" />

The **Merge Queue** graph displays various details about the health and performance of the merge queue.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Successful Actions | The number of replicas successfully processed by the merge queue, as tracked by the `queue.merge.process.success` metric.
Pending Actions | The number of pending replicas in the merge queue, as tracked by the `queue.merge.pending` metric.

## Raft Log Queue

<img src="{{ 'images/common/ui/ui_raftlog_queue.png' | relative_url }}" alt="DB Console Raft log queue graph" style="border:1px solid #eee;max-width:100%" />

The **Raft Log Queue** graph displays various details about the health and performance of the Raft log queue.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Successful Actions | The number of replicas successfully processed by the Raft log queue, as tracked by the `queue.raftlog.process.success` metric.
Pending Actions | The number of pending replicas in the Raft log queue, as tracked by the `queue.raftlog.pending` metric.

## Raft Snapshot Queue

<img src="{{ 'images/common/ui/ui_raftsnapshot_queue.png' | relative_url }}" alt="DB Console Raft snapshot queue graph" style="border:1px solid #eee;max-width:100%" />

The **Raft Snapshot Queue** graph displays various details about the health and performance of the Raft repair queue.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Successful Actions | The number of replicas successfully processed by the Raft repair queue, as tracked by the `queue.raftsnapshot.process.success` metric.
Pending Actions | The number of pending replicas in the Raft repair queue, as tracked by the `queue.raftsnapshot.pending` metric.

## Consistency Checker Queue

<img src="{{ 'images/common/ui/ui_consistencychecker_queue.png' | relative_url }}" alt="DB Console consistency checker queue graph" style="border:1px solid #eee;max-width:100%" />

The **Consistency Checker Queue** graph displays various details about the health and performance of the consistency checker queue.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Successful Actions | The number of replicas successfully processed by the consistency checker queue, as tracked by the `queue.consistency.process.success` metric.
Pending Actions | The number of pending replicas in the consistency checker queue, as tracked by the `queue.consistency.pending` metric.

## Time Series Maintenance Queue

<img src="{{ 'images/common/ui/ui_tsmaintenance_queue.png' | relative_url }}" alt="DB Console time series maintenance queue graph" style="border:1px solid #eee;max-width:100%" />

The **Time Series Maintenance Queue** graph displays various details about the health and performance of the time series maintenance queue.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Successful Actions | The number of replicas successfully processed by the time series maintenance queue, as tracked by the `queue.tsmaintenance.process.success` metric.
Pending Actions | The number of pending replicas in the time series maintenance queue, as tracked by the `queue.tsmaintenance.pending` metric.

## MVCC GC Queue

<img src="/docs/images/{{ page.version.version }}/ui_mvcc_gc_queue.png" alt="DB Console GC queue graph" style="border:1px solid #eee;max-width:100%" />

The **MVCC GC Queue** graph displays various details about the health and performance of the [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection) queue.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Successful Actions | The number of replicas successfully processed by the [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection) queue, as tracked by the `queue.gc.process.success` metric.
Pending Actions | The number of pending replicas in the [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection) queue, as tracked by the `queue.gc.pending` metric.

## Protected Timestamp Records

<img src="/docs/images/{{ page.version.version }}/ui_protected_timestamp_records.png" alt="DB Console GC queue graph" style="border:1px solid #eee;max-width:100%" />

The **Protected Timestamp Records** graph displays the number of [protected timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) records (used by backups, changefeeds, etc. to prevent MVCC GC) per node, as tracked by the `spanconfig.kvsubscriber.protected_record_count` metric.

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Support Resources]({% link {{ page.version.version }}/support-resources.md %})
- [Raw Status Endpoints]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#raw-status-endpoints)
