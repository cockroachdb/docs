---
title: Admission Control
summary: Learn about admission control to maintain cluster performance and availability during high load.
toc: true
docs_area: develop
---

CockroachDB supports an admission control system to maintain cluster performance and availability when some nodes experience high load. When admission control is enabled, CockroachDB sorts request and response operations into work queues by priority, giving preference to higher priority operations. Internal operations critical to node health are high priority. The admission control system also prioritizes transactions that hold [locks]({% link {{ page.version.version }}/crdb-internal.md %}#cluster_locks), to reduce [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) and release locks earlier.

## How admission control works

At a high level, the admission control system works by queueing requests to use the following system resources:

- CPU
- Storage IO (writes to disk)

For CPU, different types of usage are queued differently based on priority to allow important work to make progress even under [high CPU utilization]({% link {{ page.version.version }}/common-issues-to-monitor.md %}#cpu-usage).

For storage IO, the goal is to prevent the [storage layer's log-structured merge tree]({% link {{ page.version.version }}/architecture/storage-layer.md %}#log-structured-merge-trees) (LSM) from experiencing high [read amplification]({% link {{ page.version.version }}/architecture/storage-layer.md %}#read-amplification), which slows down reads, while also maintaining the ability to absorb bursts of writes.

Admission control works on a per-[node]({% link {{ page.version.version }}/architecture/overview.md %}#node) basis, since even though a large CockroachDB cluster may be well-provisioned as a whole, individual nodes are stateful and may experience performance [hotspots]({% link {{ page.version.version }}/understand-hotspots.md %}).

For more details about how the admission control system works, see:

- The [Admission Control tech note](https://github.com/cockroachdb/cockroach/blob/master/docs/tech-notes/admission_control.md).
- The blog post [Here's how CockroachDB keeps your database from collapsing under load](https://www.cockroachlabs.com/blog/admission-control-in-cockroachdb/).

## Use cases for admission control

A well-provisioned CockroachDB cluster may still encounter performance bottlenecks at the node level, as stateful nodes can develop [hotspots]({% link {{ page.version.version }}/understand-hotspots.md %}) that last until the cluster rebalances itself. When hotspots occur, they should not cause failures or degraded performance for important work.

This is particularly important for CockroachDB {{ site.data.products.standard }} and CockroachDB {{ site.data.products.basic }}, where one user tenant cluster experiencing high load should not degrade the performance or availability of a different, isolated tenant cluster running on the same host.

Admission control can help if your cluster has degraded performance due to the following types of node overload scenarios:

- The node has more than 32 runnable goroutines per CPU, visible in the **Runnable goroutines per CPU** graph in the [**Overload** dashboard]({% link {{ page.version.version }}/ui-overload-dashboard.md %}#runnable-goroutines-per-cpu).
- The node has a high amount of overload in the Pebble LSM tree, visible in the **IO Overload** graph in the [**Overload** dashboard]({% link {{ page.version.version }}/ui-overload-dashboard.md %}#io-overload).
- The node has high CPU usage, visible in the **CPU Utilization** graph in the [**Overload** dashboard]({% link {{ page.version.version }}/ui-overload-dashboard.md %}#cpu-utilization).
- The node is experiencing out-of-memory errors, visible in the **Memory Usage** graph in the [**Hardware** dashboard]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}#memory-usage). Even though admission control does not explicitly target controlling memory usage, it can reduce memory usage as a side effect of delaying the start of operation execution when the CPU is overloaded.

## Operations subject to admission control

Almost all database operations that use CPU or perform storage IO are controlled by the admission control system. From a user's perspective, specific operations that are affected by admission control include:

- [General SQL queries]({% link {{ page.version.version }}/selection-queries.md %}) have their CPU usage subject to admission control, as well as storage IO for writes to [leaseholder replicas]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leases) and [follower replicas](#replication-admission-control).
- [Bulk data imports]({% link {{ page.version.version }}/import-into.md %}).
- [`COPY`]({% link {{ page.version.version }}/copy.md %}) statements.
- [Deletes]({% link {{ page.version.version }}/delete-data.md %}) (including deletes initiated by [row-level TTL jobs]({% link {{ page.version.version }}/row-level-ttl.md %}); the [selection queries]({% link {{ page.version.version }}/selection-queries.md %}) performed by TTL jobs are also subject to CPU admission control).
- [Backups]({% link {{ page.version.version }}/backup-and-restore-overview.md %}).
- [Restore]({% link {{ page.version.version }}/restore.md %}) operations, including [full cluster]({% link {{ page.version.version }}/restore.md %}#full-cluster), [database]({% link {{ page.version.version }}/restore.md %}#databases), and [table]({% link {{ page.version.version }}/restore.md %}#tables) restores.
- [Schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}), including index and column backfills (on both the [leaseholder replica]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leases) and [follower replicas]({% link {{ page.version.version }}/architecture/replication-layer.md %}#raft)).
- [Follower replication work](#replication-admission-control).
- [Raft log entries being written to disk]({% link {{ page.version.version }}/architecture/replication-layer.md %}#raft).
- [Changefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}).
- [Intent resolution]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#write-intents).

{{site.data.alerts.callout_info}}
Admission control is beneficial when overall cluster health is good but some nodes are experiencing overload. If you see these overload scenarios on many nodes in the cluster, that typically means the cluster needs more resources.
{{site.data.alerts.end}}

### Replication admission control

The admission control subsystem paces all work done at the [Replication Layer]({% link {{ page.version.version }}/architecture/replication-layer.md %}#raft) to avoid cluster overload. This includes user-facing writes from SQL statements, as well as background (elastic) replication work.

The pacing of catchup writes is controlled at the replication layer to avoid overloading slow or [newly restarted nodes]({% link {{ page.version.version }}/eventlog.md %}#node_restart) with replication flows. Note that this pacing does not slow down user-facing SQL writes; it only ensures there are fewer impacts from background operations.

At a high level, replication admission control works by:

- Pacing regular SQL writes at the rate of replica quorum. ()
- Pacing background (elastic) replication at the rate of the slowest replica.

This has the following effects:

1. Does not overload slow/restarted nodes with replication flows. ()
2. Isolates performance between regular and elastic traffic.
3. Paces regular writes at quorum speed. ()
4. Paces elastic writes at the slowest replica's speed.

For example, prior to CockroachDB v25.1, when a leader and follower replica were disconnected from each other due to a node going away and coming back, once the follower came back the leader would slam the follower with any Raft entries it had missed. In v25.1 and later, the leader paces the entries it sends to the follower. The result is that baseline cluster QPS (queries per second) and latency should not change substantially during perturbations such as [node restarts]({% link {{ page.version.version }}/eventlog.md %}#node_restart).

To monitor the behavior of replication admission control, refer to [UI Overload Dashboard &gt; Replication Admission Control]({% link {{ page.version.version }}/ui-overload-dashboard.md %}#admission-queueing-delay-p99-replication-admission-control).

## Enable and disable admission control

Admission control is enabled by default. To enable or disable admission control, use the following [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}):

- `admission.kv.enabled` for work performed by the [KV layer]({% link {{ page.version.version }}/architecture/distribution-layer.md %}).
- `admission.sql_kv_response.enabled` for work performed in the SQL layer when receiving [KV responses]({% link {{ page.version.version }}/architecture/distribution-layer.md %}).
- `admission.sql_sql_response.enabled` for work performed in the SQL layer when receiving [DistSQL responses]({% link {{ page.version.version }}/architecture/sql-layer.md %}#distsql).
- `kvadmission.store.snapshot_ingest_bandwidth_control.enabled` to optionally limit the disk impact of ingesting snapshots on a node. This cluster setting is in [Preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}#features-in-preview).
- `kvadmission.store.provisioned_bandwidth` to optionally limit the disk bandwidth capacity of stores on the cluster. Disk bandwidth admission control paces background disk writes to keep disk bandwidth within its provisioned bandwidth. This cluster setting is in [Preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}#features-in-preview).

When you enable or disable admission control settings for one layer, Cockroach Labs recommends that you enable or disable them for **all layers**.

## Work queues and ordering

When admission control is enabled, request and response operations are sorted into work queues where the operations are organized by priority and transaction start time.

Higher priority operations are processed first. The criteria for determining higher and lower priority operations is different at each processing layer, and is determined by the CPU and storage I/O of the operation. Write operations in the [KV storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}) in particular are often the cause of performance bottlenecks, and admission control prevents [the Pebble storage engine]({% link {{ page.version.version }}/architecture/storage-layer.md %}#pebble) from experiencing high [read amplification]({% link {{ page.version.version }}/architecture/storage-layer.md %}#read-amplification). Critical cluster operations are processed as high priority, as are transactions that hold [locks]({% link {{ page.version.version }}/crdb-internal.md %}#cluster_locks) in order to avoid [contention]({% link {{ page.version.version }}/performance-recipes.md %}#transaction-contention) and release locks earlier.

The transaction start time is used within the priority queue and gives preference to operations with earlier transaction start times. For example, within the high priority queue operations with an earlier transaction start time are processed first.

### Set quality of service level for a session

In an overload scenario where CockroachDB cannot service all requests, you can identify which requests should be prioritized. This is often referred to as _quality of service_ (QoS). Admission control queues work throughout the system. To set the quality of service level on the admission control queues on behalf of SQL requests submitted in a session, use the [`default_transaction_quality_of_service`]({% link {{ page.version.version }}/set-vars.md %}#default-transaction-quality-of-service) session variable. The valid values are `critical`, `background`, and `regular`. Admission control must be enabled for this setting to have an effect.

To increase the priority of subsequent SQL requests, run:

{% include_cached copy-clipboard.html %}
~~~ sql
SET default_transaction_quality_of_service=critical;
~~~

To decrease the priority of subsequent SQL requests, run:

{% include_cached copy-clipboard.html %}
~~~ sql
SET default_transaction_quality_of_service=background;
~~~

To reset the priority to the default session setting (in between background and critical), run:

{% include_cached copy-clipboard.html %}
~~~ sql
SET default_transaction_quality_of_service=regular;
~~~

<a id="copy-qos"></a>

The quality of service for [`COPY`]({% link {{ page.version.version }}/copy.md %}) statements is configured separately with the [`copy_transaction_quality_of_service`]({% link {{ page.version.version }}/set-vars.md %}#copy-transaction-quality-of-service) session variable, which defaults to `background`.

To increase the priority of subsequent `COPY` statements, run:

{% include_cached copy-clipboard.html %}
~~~ sql
SET copy_transaction_quality_of_service=critical;
~~~

### Set quality of service level for a transaction

To set the quality of service level for a single [transaction]({% link {{ page.version.version }}/transactions.md %}), set the [`default_transaction_quality_of_service`]({% link {{ page.version.version }}/set-vars.md %}#default-transaction-quality-of-service) and/or [`copy_transaction_quality_of_service`]({% link {{ page.version.version }}/set-vars.md %}#copy-transaction-quality-of-service) session variable for just that transaction using the [`SET LOCAL`]({% link {{ page.version.version }}/set-vars.md %}#set-a-variable-for-the-duration-of-a-single-transaction) statement inside a [`BEGIN`]({% link {{ page.version.version }}/begin-transaction.md %}) ... [`COMMIT`]({% link {{ page.version.version }}/commit-transaction.md %}) block, as shown in the following example. The valid values are `critical`, `background`, and `regular`.

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN;
SET LOCAL default_transaction_quality_of_service = 'regular'; -- Edit transaction QoS to desired level
SET LOCAL copy_transaction_quality_of_service = 'regular'; -- Edit COPY QoS to desired level
-- Statements to run in this transaction go here
COMMIT;
~~~

## Known limitations

{% include {{ page.version.version }}/known-limitations/admission-control-limitations.md %}

## Considerations

To prevent unnecessary queuing in admission control CPU queues, set the `goschedstats.always_use_short_sample_period.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-goschedstats-always-use-short-sample-period-enabled) to `true` for any [production cluster]({% link {{ page.version.version }}/recommended-production-settings.md %}).

[Client connections]({% link {{ page.version.version }}/connection-parameters.md %}) are not managed by the admission control subsystem. Too many connections per [gateway node]({% link {{ page.version.version }}/architecture/sql-layer.md %}#gateway-node) can also lead to cluster overload.

{% include {{page.version.version}}/sql/server-side-connection-limit.md %}

## Observe admission control performance

The [DB Console Overload dashboard]({% link {{ page.version.version }}/ui-overload-dashboard.md %}) shows metrics related to the performance of the admission control system.

## See also

- The [Overload Dashboard]({% link {{ page.version.version }}/ui-overload-dashboard.md %}) in the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}).
- The [technical note for admission control](https://github.com/cockroachdb/cockroach/blob/master/docs/tech-notes/admission_control.md) for details on the design of the admission control system.
- The blog post [Here's how CockroachDB keeps your database from collapsing under load](https://www.cockroachlabs.com/blog/admission-control-in-cockroachdb/).
- The blog post [Rubbing Control Theory on the Go scheduler](https://www.cockroachlabs.com/blog/rubbing-control-theory/).
