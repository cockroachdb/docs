---
title: Replication Dashboard
summary: The Replication dashboard lets you monitor the replication metrics for your cluster.
toc: true
redirect_from: admin-ui-replication-dashboard.html
---

The **Replication** dashboard in the DB Console enables you to monitor the replication metrics for your cluster. 

To view this dashboard, [access the DB Console](ui-overview.html#db-console-access), click **Metrics** in the left-hand navigation, and select **Dashboard** > **Replication**.

## Review of CockroachDB terminology

- **Range**: CockroachDB stores all user data and almost all system data in a giant sorted map of key-value pairs. This keyspace is divided into "ranges", contiguous chunks of the keyspace, so that every key can always be found in a single range.
- **Range Replica:** CockroachDB replicates each range (3 times by default) and stores each replica on a different node.
- **Range Lease:** For each range, one of the replicas holds the "range lease". This replica, referred to as the "leaseholder", is the one that receives and coordinates all read and write requests for the range.
- **Under-replicated Ranges:** <a name="under-replicated-ranges"></a> When a cluster is first initialized, the few default starting ranges will only have a single replica, but as soon as other nodes are available, they will replicate to them until they've reached their desired replication factor, the default being 3. If a range does not have enough replicas, the range is said to be "under-replicated".
- **Unavailable Ranges:** <a name="unavailable-ranges"></a> If a majority of a range's replicas are on nodes that are unavailable, then the entire range is unavailable and will be unable to process queries.

For more details, see [Scalable SQL Made Easy: How CockroachDB Automates Operations](https://www.cockroachlabs.com/blog/automated-rebalance-and-repair/)

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

The **Replication** dashboard displays the following time series graphs:

## Ranges

<img src="{{ 'images/v21.1/ui_ranges.png' | relative_url }}" alt="DB Console Replicas per Store" style="border:1px solid #eee;max-width:100%" />

The **Ranges** graph shows you various details about the status of ranges.

- In the node view, the graph shows details about ranges on the node.

- In the cluster view, the graph shows details about ranges across all nodes in the cluster.

On hovering over the graph, the values for the following metrics are displayed:

Metric | Description
--------|----
Ranges | The number of ranges.
Leaders | The number of ranges with leaders. If the number does not match the number of ranges for a long time, troubleshoot your cluster.
Lease Holders | The number of ranges that have leases.
Leaders w/o Leases | The number of Raft leaders without leases. If the number if non-zero for a long time, troubleshoot your cluster.
Unavailable | The number of unavailable ranges. If the number if non-zero for a long time, troubleshoot your cluster.
Under-replicated | The number of under-replicated ranges.

## Logical Bytes per Store

<img src="{{ 'images/v21.1/ui_logical_bytes_per_store.png' | relative_url }}" alt="DB Console Replicas per Store" style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|--------
**Logical Bytes per Store** | Number of logical bytes stored in [key-value pairs](architecture/distribution-layer.html#table-data) on each node. This includes historical and deleted data.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/ui/logical-bytes.md %}
{{site.data.alerts.end}}

## Replicas Per Store

<img src="{{ 'images/v21.1/ui_replicas_per_store.png' | relative_url }}" alt="DB Console Replicas per Store" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the number of range replicas on the store.

- In the cluster view, the graph shows the number of range replicas on each store.

You can [Configure replication zones](configure-replication-zones.html) to set the number and location of replicas. You can monitor the configuration changes using the DB Console, as described in [Fault tolerance and recovery](demo-fault-tolerance-and-recovery.html).

## Replica Quiescence

<img src="{{ 'images/v21.1/ui_replica_quiescence.png' | relative_url }}" alt="DB Console Replica Quiescence" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the number of replicas on the node.

- In the cluster view, the graph shows the number of replicas across all nodes.

On hovering over the graph, the values for the following metrics are displayed:

Metric | Description
--------|----
Replicas | The number of replicas.
Quiescent | The number of replicas that haven't been accessed for a while.

## Snapshots

<img src="{{ 'images/v21.1/ui_replica_snapshots.png' | relative_url }}" alt="DB Console Replica Snapshots" style="border:1px solid #eee;max-width:100%" />

Usually the nodes in a [Raft group](architecture/replication-layer.html#raft) stay synchronized by following along the log message by message.  However, if a node is far enough behind the log (e.g., if it was offline or is a new node getting up to speed), rather than send all the individual messages that changed the range, the cluster can send it a snapshot of the range and it can start following along from there.  Commonly this is done preemptively, when the cluster can predict that a node will need to catch up, but occasionally the Raft protocol itself will request the snapshot.

Metric | Description
-------|------------
Generated | The number of snapshots created per second.
Applied (Raft-initiated) | The number of snapshots applied to nodes per second that were initiated within Raft.
Applied (Learner) | The number of snapshots applied to nodes per second that were anticipated ahead of time (e.g., because a node was about to be added to a Raft group).  This metric replaces the `Applied (Preemptive)` metric in 19.2 and onwards.
Applied (Preemptive) | The number of snapshots applied to nodes per second that were anticipated ahead of time (e.g., because a node was about to be added to a Raft group). This metric was used in pre-v19.2 releases and will be removed in future releases.
Reserved | The number of slots reserved per second for incoming snapshots that will be sent to a node.

## Other graphs

The **Replication** dashboard shows other time series graphs that are important for CockroachDB developers:

- Leaseholders per Store
- Average Queries per Store
- Range Operations

For monitoring CockroachDB, it is sufficient to use the [**Ranges**](#ranges), [**Replicas per Store**](#replicas-per-store), and [**Replica Quiescence**](#replica-quiescence) graphs.

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
