---
title: Admission Control
summary: Learn about admission control to maintain cluster performance and availability during high load.
toc: true
docs_area: develop
---

CockroachDB supports an admission control system to maintain cluster performance and availability when some nodes experience high load. When admission control is enabled, CockroachDB sorts request and response operations into work queues by priority, giving preference to higher priority operations. Internal operations critical to node health, like [node liveness heartbeats]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#node-liveness-issues), are high priority. The admission control system also prioritizes transactions that hold [locks]({% link {{ page.version.version }}/crdb-internal.md %}#cluster_locks), to reduce [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) and release locks earlier.

{{site.data.alerts.callout_info}}
Admission control is not available for CockroachDB {{ site.data.products.serverless }} clusters.
{{site.data.alerts.end}}

## Use cases for admission control

A well-provisioned CockroachDB cluster may still encounter performance bottlenecks at the node level, as stateful nodes can develop [hot spots]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#hot-spots) that last until the cluster rebalances itself. When hot spots occur, they should not cause failures or degraded performance for important work.

This is particularly important for CockroachDB {{ site.data.products.serverless }}, where one user tenant cluster experiencing high load should not degrade the performance or availability of a different, isolated tenant cluster running on the same host.

Admission control can help if your cluster has degraded performance due to the following types of node overload scenarios:

- The node has more than 32 runnable goroutines per CPU, visible in the **Runnable goroutines per CPU** graph in the [**Overload** dashboard]({% link {{ page.version.version }}/ui-overload-dashboard.md %}#runnable-goroutines-per-cpu).
- The node has a high number of files in level 0 of the Pebble LSM tree, visible in the **LSM L0 Health** graph in the [**Overload** dashboard]({% link {{ page.version.version }}/ui-overload-dashboard.md %}#lsm-l0-health).
- The node has high CPU usage, visible in the **CPU percent** graph in the [**Overload** dashboard]({% link {{ page.version.version }}/ui-overload-dashboard.md %}#cpu-percent).
- The node is experiencing out-of-memory errors, visible in the **Memory Usage** graph in the [**Hardware** dashboard]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}#memory-usage). Even though admission control does not explicitly target controlling memory usage, it can reduce memory usage as a side effect of delaying the start of operation execution when the CPU is overloaded.

{{site.data.alerts.callout_info}}
Admission control is beneficial when overall cluster health is good but some nodes are experiencing overload. If you see these overload scenarios on many nodes in the cluster, that typically means the cluster needs more resources.
{{site.data.alerts.end}}

## Enable and disable admission control

To enable and disable admission control, use the following [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}):

- `admission.kv.enabled` for work performed by the [KV layer]({% link {{ page.version.version }}/architecture/distribution-layer.md %}).
- `admission.sql_kv_response.enabled` for work performed in the SQL layer when receiving [KV responses]({% link {{ page.version.version }}/architecture/distribution-layer.md %}).
- `admission.sql_sql_response.enabled` for work performed in the SQL layer when receiving [DistSQL responses]({% link {{ page.version.version }}/architecture/sql-layer.md %}#distsql).

When you enable admission control Cockroach Labs recommends that you enable it for **all layers**.

Admission control is enabled  by default for all layers.

## Work queues and ordering

When admission control is enabled, request and response operations are sorted into work queues where the operations are organized by priority and transaction start time.

Higher priority operations are processed first. The criteria for determining higher and lower priority operations is different at each processing layer, and is determined by the CPU and storage I/O of the operation. Write operations in the [KV storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}) in particular are often the cause of performance bottlenecks, and admission control prevents [the Pebble storage engine]({% link {{ page.version.version }}/architecture/storage-layer.md %}#pebble) from experiencing high [read amplification]({% link {{ page.version.version }}/architecture/storage-layer.md %}#read-amplification). Critical cluster operations like node heartbeats are processed as high priority, as are transactions that hold [locks]({% link {{ page.version.version }}/crdb-internal.md %}#cluster_locks) in order to avoid [contention]({% link {{ page.version.version }}/performance-recipes.md %}#transaction-contention) and release locks earlier.

The transaction start time is used within the priority queue and gives preference to operations with earlier transaction start times. For example, within the high priority queue operations with an earlier transaction start time are processed first.

### Set quality of service level for a session

In an overload scenario where CockroachDB cannot service all requests, you can identify which requests should be prioritized. This is often referred to as _quality of service_ (QoS). Admission control queues work throughout the system. To set the quality of service level on the admission control queues on behalf of SQL requests submitted in a session, use the `default_transaction_quality_of_service` [session variable]({% link {{ page.version.version }}/set-vars.md %}#default-transaction-quality-of-service). The valid values are `critical`, `background`, and `regular`. Admission control must be enabled for this setting to have an effect.

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

### Set quality of service level for a transaction

To set the quality of service level for a single [transaction]({% link {{ page.version.version }}/transactions.md %}), set the [`default_transaction_quality_of_service` session variable]({% link {{ page.version.version }}/set-vars.md %}#default-transaction-quality-of-service) for just that transaction using the [`SET LOCAL`]({% link {{ page.version.version }}/set-vars.md %}#set-a-variable-for-the-duration-of-a-single-transaction) statement inside a [`BEGIN`]({% link {{ page.version.version }}/begin-transaction.md %}) ... [`COMMIT`]({% link {{ page.version.version }}/commit-transaction.md %}) block as shown below. The valid values are `critical`, `background`, and `regular`.

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN;
SET LOCAL default_transaction_quality_of_service = 'regular'; -- Edit to desired level
-- Statements to run in this transaction go here
COMMIT;
~~~

## Limitations

Admission control works on the level of each node, not at the cluster level. The admission control system queues requests until the operations are processed or the request exceeds the timeout value (for example by using [`SET statement_timeout`]({% link {{ page.version.version }}/set-vars.md %}#supported-variables)). If you specify aggressive timeout values, the system may operate correctly but have low throughput as the operations exceed the timeout value while only completing part of the work. There is no mechanism for preemptively rejecting requests when the work queues are long.

Organizing operations by priority can mean that higher priority operations consume all the available resources while lower priority operations remain in the queue until the operation times out.

## Observe admission control performance

The [DB Console Overload dashboard]({% link {{ page.version.version }}/ui-overload-dashboard.md %}) shows metrics related to the performance of the admission control system.

## See also

The [technical note for admission control](https://github.com/cockroachdb/cockroach/blob/master/docs/tech-notes/admission_control.md) for details on the design of the admission control system.

{% include {{page.version.version}}/sql/server-side-connection-limit.md %}  This may be useful in addition to your admission control settings.
