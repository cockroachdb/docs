---
title: Replication Dashboard
toc: false
feedback: false
---

CockroachDB Admin UI enables you to monitor the replication metrics for your cluster.

<div id="toc"></div>

To view the Replication metrics for your cluster, [access the Admin UI](explore-the-admin-ui.html#access-the-admin-ui), then from the Dashboard drop-down box, select **Replication**. 

#### Viewing time-series graphs for each node
By default, the time series panel displays the cluster view, which shows the metrics for the entire cluster. For every time series data, the visualization for the entire cluster is the sum of the metric for each node. 

To access the node view that shows the metrics for an individual node, select the node from the **Graph** drop-down list.

<img src="{{ 'images/admin_ui_select_node.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:40%" />

## Review of CockroachDB terminology

- **Range**: CockroachDB stores all user data and almost all system data in a giant sorted map of key value pairs. This keyspace is divided into "ranges", contiguous chunks of the keyspace, so that every key can always be found in a single range.
- **Range Replica:** CockroachDB replicates each range (3 times by default) and stores each replica on a different node.
- **Range Lease:** For each range, one of the replicas holds the "range lease". This replica, referred to as the "leaseholder", is the one that receives and coordinates all read and write requests for the range.
- **Under-replicated Ranges:** When a cluster is first initialized, the few default starting ranges will only have a single replica, but as soon as other nodes are available, they will replicate to them until they've reached their desired replication factor, the default being 3. If a range does not have enough replicas, the range is said to be "under-replicated".
- **Unavailable Ranges:** If a store has not been heard from in some time, the default setting being 5 minutes, the cluster will consider this store to be dead. When this happens, all ranges that have replicas on that store are determined to be "unavailable" and removed.

## Replication Dashboard

The Replication dashboard displays the following time-series graphs:

### Ranges
<img src="{{ 'images/admin_ui_ranges.png' | relative_url }}" alt="CockroachDB Admin UI Replicas per Store" style="border:1px solid #eee;max-width:100%" />
The graph shows the number of ranges across all nodes in the cluster.
On hovering over the graph, the values for the following metrics are displayed:

Metric | Description
--------|----
Ranges | The number of ranges across all nodes in the cluster.
Leaders | The number of ranges with leaders across all nodes in the cluster. If the number does not match number of ranges for a long time, troubleshoot your cluster.
Lease Holders | The number of ranges that have leases across all nodes in the cluster.
Leaders w/o Leases | The number of Raft leaders without leases across all nodes in the cluster. If the number if non-zero for a long time, troubleshoot your cluster. 
Unavailable | The number of unavailable ranges across all nodes in the cluster. If the number if non-zero for a long time, troubleshoot your cluster. 
Under-replicated | The number of under-replicated ranges across all nodes in the cluster.

### Replicas Per Store
<img src="{{ 'images/admin_ui_replicas_per_store.png' | relative_url }}" alt="CockroachDB Admin UI Replicas per Store" style="border:1px solid #eee;max-width:100%" />
The graph displays the number of range replicas on each store. 

By default, the cluster-wide replication zone is set to replicate data to any three nodes in your cluster, with ranges in each replica splitting once they get larger than 64 MB. The replicas are balanced evenly across the nodes. You can [Configure replication zones](configure-replication-zones.html) to set the number and location of replicas. You can monitor the changes in configuration using the Admin UI, as described in [Fault tolerance and recovery](demo-fault-tolerance-and-recovery.html).

### Replicas
<img src="{{ 'images/admin_ui_replicas.png' | relative_url }}" alt="CockroachDB Admin UI Replicas" style="border:1px solid #eee;max-width:100%" />
The graph displays the number of replicas across all nodes.
On hovering over the graph, the values for the following metrics are displayed:

Metric | Description
--------|----
Replicas | The number of replicas across all nodes.
Quiescent | The number of replicas across all nodes that haven't been touched for a while.

{{site.data.alerts.callout_info}}The Replication dashboard displays time-series graphs for other metrics such as Ranges, Leaseholders per Store, Live Bytes per Store, Keys Written per Second per Store, Range Operations, and Snapshots that are important for CockroachDB developers. For monitoring CockroachDB, it is sufficient to monitor the  Replicas per Store and Replicas graphs.{{site.data.alerts.end}}