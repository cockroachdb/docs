---
title: Admission Control
summary: Learn about admission control system in CockroachDB.
toc: true
---

<span class="version-tag">New in v21.2:</span> CockroachDB implements an optional admission control system to maintain cluster performance and availability when experiencing high load on some part of the cluster. When admission control is enabled, CockroachDB sorts request and response operations into work queues by priority, giving preference to higher priority operations.

Admission control is disabled by default. To enable admission control:

- Set the [`admission.kv.enabled`](../cluster-settings.html) cluster setting to `true` for work performed by the [KV layer](distribution-layer.html).
- Set the [`admission.sql_kv_response.enabled`](../cluster-settings.html) cluster setting to `true` for work performed in the SQL layer when receiving [KV responses](distribution-layer.html).
- Set the [`admission.sql_sql_response.enabled`](../cluster-settings.html) cluster setting to `true` for work performed in the SQL layer when receiving [DistSQL responses](sql-layer.html#distsql).

## Use cases for admission control

A well-provisioned CockroachDB cluster may still encounter performance bottlenecks at the node level, as stateful nodes can develop hotspots that last until the cluster rebalances itself. When hotspot nodes occur, they should not cause failures or degraded performance for important work. In {{ site.data.products.serverless }}, one user tenant cluster experiencing high load should not degrade the performance or availability on a different, isolated tenant cluster running on the same host cluster.

If your cluster has degraded performance due to these type of overloads, enabling admission control can help.

## Work queues and ordering

When admission control is enabled, request and response operations get organized into work queues where the operations are organized by priority and transaction start time.

Higher priority operations are processed first. The criteria for determining higher and lower priority operations is different at each processing layer, and is determined by the CPU and storage I/O of the operation. Write operations in the [KV storage layer](storage-layer.html) in particular are often the cause of performance bottlenecks, and enabling admission control prevents [the Pebble storage engine](../cockroach-start.html#storage-engine) from getting into a state with high read amplification. Critical cluster operations like node heartbeats are processed as high priority.

Organizing operations by priority can mean that higher priority operations consume all the available resources while lower priority operations remain in the queue until the operation times out.

The transaction start time is used within the priority queue and gives preference to operations with earlier transaction start times. That is, within, for example, the high priority queue, operations with an earlier transaction start time are processed first.

## Limitations

Admission control works on the node level, not the cluster. The admission control system queues requests until the operations are processed or the request exceeds the timeout value. If you specify aggressive timeout values, the system may operate correctly but have low throughput as the operations exceed the timeout value while only completing part of the work. There is no mechanism for preemptively rejecting requests when the work queues are long.

## Observing admission control performance

The [DB Console Overload dashboard](ui-overload-dashboard.html) shows metrics related to the peformance of the admission control system.
