---
title: Admission Control
summary: Learn about admission control system in CockroachDB.
toc: true
docs_area: reference.architecture
---

{% include_cached new-in.html version=v21.2 %} CockroachDB implements an optional admission control system to maintain cluster performance and availability when some nodes experience high load. When admission control is enabled, CockroachDB sorts request and response operations into work queues by priority, giving preference to higher priority operations. Internal operations critical to node health, like node liveness heartbeats, are high priority. The admission control system also prioritizes transactions that hold locks, to reduce contention by releasing locks in a timely manner.

{{site.data.alerts.callout_info}}
Admission control is not available for {{ site.data.products.serverless }} clusters.
{{site.data.alerts.end}}

## Enable admission control

Admission control is disabled by default. To enable admission control:

- Set the [`admission.kv.enabled`](../cluster-settings.html) cluster setting to `true` for work performed by the [KV layer](distribution-layer.html).
- Set the [`admission.sql_kv_response.enabled`](../cluster-settings.html) cluster setting to `true` for work performed in the SQL layer when receiving [KV responses](distribution-layer.html).
- Set the [`admission.sql_sql_response.enabled`](../cluster-settings.html) cluster setting to `true` for work performed in the SQL layer when receiving [DistSQL responses](sql-layer.html#distsql).

If you decide to use admission control, Cockroach Labs recommends that you enable admission control on all layers.

{{site.data.alerts.callout_info}}
If you are upgrading to v21.2, first complete the upgrade with admission control disabled, then enable admission control after verifying the upgrade was successful.
{{site.data.alerts.end}}

## Use cases for admission control

A well-provisioned CockroachDB cluster may still encounter performance bottlenecks at the node level, as stateful nodes can develop hot spots that last until the cluster rebalances itself. When hot spots occur, they should not cause failures or degraded performance for important work.

This is particularly important for {{ site.data.products.serverless }}, where one user tenant cluster experiencing high load should not degrade the performance or availability of a different, isolated tenant cluster running on the same host.

If your cluster has degraded performance due to the following types of node overload scenarios, enabling admission control can help:

- The node has more than 50 runnable goroutines per CPU, visible in the **Runnable goroutines per CPU** graph in the [**Overload** dashboard](../ui-overload-dashboard.html#runnable-goroutines-per-cpu).
- The node has a high number of files in level 0 of the Pebble LSM tree, visible in the **LSM L0 Health** graph in the [**Overload** dashboard](../ui-overload-dashboard.html#lsm-l0-health).
- The node has high CPU usage, visible in the **CPU percent** graph in the [**Overload** dashboard](../ui-overload-dashboard.html#cpu-percent).
- The node is experiencing out-of-memory errors, visible in the **Memory Usage** graph in the [**Hardware** dashboard](../ui-hardware-dashboard.html#memory-usage). Even though admission control does not explicitly target controlling memory usage, it can reduce memory usage as a side effect of delaying the start of operation execution when the CPU is overloaded.

{{site.data.alerts.callout_info}}
You should use admission control when overall cluster health is good but some nodes are experiencing overload. If you see these overload scenarios on many nodes in the cluster, that typically means the cluster needs more resources.
{{site.data.alerts.end}}

## Work queues and ordering

When admission control is enabled, request and response operations get sorted into work queues where the operations are organized by priority and transaction start time.

Higher priority operations are processed first. The criteria for determining higher and lower priority operations is different at each processing layer, and is determined by the CPU and storage I/O of the operation. Write operations in the [KV storage layer](storage-layer.html) in particular are often the cause of performance bottlenecks, and enabling admission control prevents [the Pebble storage engine](../cockroach-start.html#storage-engine) from experiencing high [read amplification](storage-layer.html#read-amplification). Critical cluster operations like node heartbeats are processed as high priority, as are transactions that hold locks in order to avoid [contention](../performance-recipes.html#transaction-contention) by releasing locks.

The transaction start time is used within the priority queue and gives preference to operations with earlier transaction start times. For example, within the high priority queue operations with an earlier transaction start time are processed first.

## Limitations

Admission control works on the level of each node, not at the cluster level. The admission control system queues requests until the operations are processed or the request exceeds the timeout value (for example by using [`SET statement_timeout`](../set-vars.html#supported-variables)). If you specify aggressive timeout values, the system may operate correctly but have low throughput as the operations exceed the timeout value while only completing part of the work. There is no mechanism for preemptively rejecting requests when the work queues are long.

Organizing operations by priority can mean that higher priority operations consume all the available resources while lower priority operations remain in the queue until the operation times out.

## Observe admission control performance

The [DB Console Overload dashboard](../ui-overload-dashboard.html) shows metrics related to the performance of the admission control system.

## See also

The [technical note for admission control](https://github.com/cockroachdb/cockroach/blob/master/docs/tech-notes/admission_control.md) for details on the design of the admission control system.
