---
title: Replication Dashboard
toc: false
feedback: false
---

CockroachDB Admin UI enables you to monitor the replication metrics for your cluster.

<div id="toc"></div>

To view the Replication Metrics for your cluster, [access the Admin UI](https://www.cockroachlabs.com/docs/dev/explore-the-admin-ui.html#access-the-admin-ui), then from the Dashboard drop-down box, select **Replication**. 

#### Viewing time-series graphs for each node
By default, the time series panel displays the metrics for the entire cluster. To view the metrics for an individual node, select the node from the **Graph** drop-down list.
<img src="{{ 'images/admin_ui_select_node.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:40%" />

## Review of CockroachDB terminology

A CockroachDB cluster consists of **nodes**. Nodes contain one or more **stores**. Each store should be placed on a unique disk. Each store contains potentially many **ranges**, the lowest-level unit of key-value data. Ranges are replicated using the Raft consensus protocol. More than one **replica** for a range will never be placed on the same store or even the same node. 

Raft elects a relatively long-lived **leader** which must be involved to propose commands. To ensure tasks are carried out by a single replica at a time, **Range Leases** are used. A replica establishes itself as owning the lease on a range by committing a special lease acquisition log entry through raft. All Reads and writes are generally addressed to the replica holding the lease. 

When a cluster is first initialized, the few default starting ranges will only have a single replica, but as soon as other nodes are available, they will replicate to them until they've reached their desired replication factor, the default being 3. If a range does not have enough replicas, the range is said to be **under-replicated**. If a store has not been heard from in some time, the default setting being 5 minutes, the cluster will consider this store to be dead. When this happens, all ranges that have replicas on that store are determined to be **unavailable**. 

Zone configs can be used to control a range's replication factor and add constraints as to where the range's replicas can be located. When there is a change in a range's zone config, the range will up or down replicate to the appropriate number of replicas and move its replicas to the appropriate stores based on zone config's constraints.

As more data is added to the system, some stores may grow faster than others. To combat this and to spread the overall load across the full cluster, replicas will be moved between stores maintaining the desired replication factor. The heuristics used to perform this rebalancing include:


- The number of replicas per store
- The total size of the data used per store
- Free space available per store

## Replication dashboard

The Replication dashboard displays the following time-series graphs:

### Ranges
<img src="{{ 'images/admin_ui_ranges.png' | relative_url }}" alt="CockroachDB Admin UI Replicas per Store" style="border:1px solid #eee;max-width:100%" />
The graph shows the number of ranges across all nodes in the cluster.
On hovering over the graph, the values for the following metrics are displayed:

Metric | Description
--------|----
Ranges | The number of ranges across all nodes in the cluster.
Leaders | The number of leaders across all nodes in the cluster.
Lease Holders | The number of leaders with leases across all nodes in the cluster.
Leaders w/o Leases | The number of leaders without leases across all nodes in the cluster.
Unavailable | The number of unavailable ranges across all nodes in the cluster.
Under-replicated | The number of under-replicated ranges across all nodes in the cluster.

### Replicas per Store
<img src="{{ 'images/admin_ui_replicas_per_store.png' | relative_url }}" alt="CockroachDB Admin UI Replicas per Store" style="border:1px solid #eee;max-width:100%" />
The graph displays the number of range replicas on each store. 

By default, the cluster-wide replication zone is set to replicate data to any three nodes in your cluster, with ranges in each replica splitting once they get larger than 64 MB. The replicas are balanced evenly across the nodes. You can [Configure replication zones](https://www.cockroachlabs.com/docs/stable/configure-replication-zones.html) to set the number and location of replicas. You can monitor the changes in configuration using the Admin UI, as described in [Fault tolerance and recovery](https://www.cockroachlabs.com/docs/stable/demo-fault-tolerance-and-recovery.html).

### Replicas
<img src="{{ 'images/admin_ui_replicas.png' | relative_url }}" alt="CockroachDB Admin UI Replicas" style="border:1px solid #eee;max-width:100%" />
The graph displays the number of replicas across all nodes.
On hovering over the graph, the values for the following metrics are displayed:

Metric | Description
--------|----
Replicas | The number of replicas across all nodes.
Quiescent | The number of replicas across all nodes that haven't been touched for a while.

{{site.data.alerts.callout_info}}The Replication dashboard displays time-series graphs for other metrics such as Ranges, Leaseholders per Store, Live Bytes per Store, Keys Written per Second per Store, Range Operations, and Snapshots that are important for CockroachDB developers. For monitoring CockroachDB, it is sufficient to monitor the  Replicas per Store and Replicas graphs.{{site.data.alerts.end}}