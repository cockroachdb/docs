---
title: Replication Layer
summary: The replication layer of CockroachDB's architecture copies data between nodes and ensures consistency between copies.
toc: true
docs_area: reference.architecture
---

The replication layer of CockroachDB's architecture copies data between nodes and ensures consistency between these copies by implementing our consensus algorithm.

{{site.data.alerts.callout_info}}
If you haven't already, we recommend reading the [Architecture Overview](overview.html).
{{site.data.alerts.end}}

## Overview

High availability requires that your database can tolerate nodes going offline without interrupting service to your application. This means replicating data between nodes to ensure the data remains accessible.

Ensuring consistency with nodes offline, though, is a challenge many databases fail. To solve this problem, CockroachDB uses a consensus algorithm to require that a quorum of replicas agrees on any changes to a range before those changes are committed. Because 3 is the smallest number that can achieve quorum (i.e., 2 out of 3), CockroachDB's high availability (known as multi-active availability) requires 3 nodes.

The number of failures that can be tolerated is equal to *(Replication factor - 1)/2*. For example, with 3x replication, one failure can be tolerated; with 5x replication, two failures, and so on. You can control the replication factor at the cluster, database, and table level using [replication zones](../configure-replication-zones.html).

When failures happen, though, CockroachDB automatically realizes nodes have stopped responding and works to redistribute your data to continue maximizing survivability. This process also works the other way around: when new nodes join your cluster, data automatically rebalances onto it, ensuring your load is evenly distributed.

### Interactions with other layers

In relationship to other layers in CockroachDB, the replication layer:

- Receives requests from and sends responses to the distribution layer.
- Writes accepted requests to the storage layer.

## Components

### Raft

Raft is a consensus protocol––an algorithm which makes sure that your data is safely stored on multiple machines, and that those machines agree on the current state even if some of them are temporarily disconnected.

Raft organizes all nodes that contain a [replica](overview.html#architecture-replica) of a [range](overview.html#architecture-range) into a group--unsurprisingly called a Raft group. Each replica in a Raft group is either a "leader" or a "follower". The leader, which is elected by Raft and long-lived, coordinates all writes to the Raft group. It heartbeats followers periodically and keeps their logs replicated. In the absence of heartbeats, followers become candidates after randomized election timeouts and proceed to hold new leader elections.

 A third replica type is introduced, the "non-voting" replica. These replicas do not participate in Raft elections, but are useful for unlocking use cases that require low-latency multi-region reads. For more information, see [Non-voting replicas](#non-voting-replicas).

Once a node receives a `BatchRequest` for a range it contains, it converts those KV operations into Raft commands. Those commands are proposed to the Raft group leader––which is what makes it ideal for the [leaseholder](#leases) and the Raft leader to be one in the same––and written to the Raft log.

For a great overview of Raft, we recommend [The Secret Lives of Data](http://thesecretlivesofdata.com/raft/).

#### Raft logs

When writes receive a quorum, and are committed by the Raft group leader, they're appended to the Raft log. This provides an ordered set of commands that the replicas agreed on and is essentially the source of truth for consistent replication.

Because this log is treated as serializable, it can be replayed to bring a node from a past state to its current state. This log also lets nodes that temporarily went offline to be "caught up" to the current state without needing to receive a copy of the existing data in the form of a snapshot.

#### Non-voting replicas

In versions prior to v21.1, CockroachDB only supported _voting_ replicas: that is, [replicas](overview.html#architecture-replica) that participate as voters in the [Raft consensus protocol](#raft). However, the need for all replicas to participate in the consensus algorithm meant that increasing the [replication factor](../configure-replication-zones.html#num_replicas) came at a cost of increased write latency, since the additional replicas needed to participate in Raft [quorum](overview.html#architecture-overview-consensus).

 In order to provide [better support for multi-region clusters](../multiregion-overview.html), (including the features that make [fast multi-region reads](../multiregion-overview.html#global-tables) and [surviving region failures](../multiregion-overview.html#surviving-region-failures) possible), a new type of replica is introduced: the _non-voting_ replica.

Non-voting replicas follow the [Raft log](#raft-logs) (and are thus able to serve [follower reads](../follower-reads.html)), but do not participate in quorum. They have almost no impact on write latencies.

They are also sometimes referred to as [_read-only_ replicas](https://cloud.google.com/spanner/docs/replication#read-only), since they only serve reads, but do not participate in quorum (and thus do not incur the associated latency costs).

Non-voting replicas can be configured via [zone configurations through `num_voters` and `num_replicas`](../configure-replication-zones.html#num_voters). When `num_voters` is configured to be less than `num_replicas`, the difference dictates the number of non-voting replicas. However, most users should control non-voting replica placement with the high-level [multi-region SQL features](../multiregion-overview.html) instead.

#### Per-replica circuit breakers

- [Overview](#per-replica-circuit-breaker-overview)
- [Configuration](#per-replica-circuit-breaker-configuration)
- [Limitations](#per-replica-circuit-breaker-limitations)

<a name="per-replica-circuit-breaker-overview"></a>

##### Overview

{% include_cached new-in.html version=v22.1 %} When individual [ranges](overview.html#architecture-range) become temporarily unavailable, requests to those ranges are refused by a per-replica "circuit breaker" mechanism instead of hanging indefinitely. 

From a user's perspective, this means that if a [SQL query](sql-layer.html) is going to ultimately fail due to accessing a temporarily unavailable range, a [replica](overview.html#architecture-replica) in that range will trip its circuit breaker (after 60 seconds [by default](#per-replica-circuit-breaker-timeout)) and bubble a `ReplicaUnavailableError` error back up through the system to inform the user why their query did not succeed. These (hopefully transient) errors are also signalled as events in the DB Console's [Replication Dashboard](../ui-replication-dashboard.html) and as "circuit breaker errors" in its [**Problem Ranges** and **Range Status** pages](../ui-debug-pages.html). Meanwhile, CockroachDB continues asynchronously probing the range's availability. If the replica becomes available again, the breaker is reset so that it can go back to serving requests normally.

This feature is designed to increase the availability of your CockroachDB clusters by making them more robust to transient errors.

For more information about per-replica circuit breaker events happening on your cluster, see the following pages in the [DB Console](../ui-overview.html): 

- The [**Replication** dashboard](../ui-replication-dashboard.html).
- The [**Advanced Debug** page](../ui-debug-pages.html). From there you can view the **Problem Ranges** page, which lists the range replicas whose circuit breakers were tripped. You can also view the **Range Status** page, which displays the circuit breaker error message for a given range.

<a name="per-replica-circuit-breaker-configuration"></a>

##### Configuration

Per-replica circuit breakers are enabled by default. Most users will not have to configure anything to get the benefits of this feature.

<a name="per-replica-circuit-breaker-timeout"></a>

The circuit breaker timeout value is controlled by the `kv.replica_circuit_breaker.slow_replication_threshold` [cluster setting](../cluster-settings.html), which defaults to an [interval](../interval.html) of `1m0s` (1 minute).

<a name="per-replica-circuit-breaker-limitations"></a>

##### Limitations

Per-replica circuit breakers have the following limitations:

- They cannot prevent requests from hanging when the node's [liveness range](#epoch-based-leases-table-data) is unavailable. For more information about troubleshooting a cluster that's having node liveness issues, see [Node liveness issues](../cluster-setup-troubleshooting.html#node-liveness-issues).
- They are not tripped if _all_ replicas of a range [become unavailable](../cluster-setup-troubleshooting.html#db-console-shows-under-replicated-unavailable-ranges), because the circuit breaker mechanism operates per-replica. This means at least one replica needs to be available to receive the request in order for the breaker to trip.

### Snapshots

Each replica can be "snapshotted", which copies all of its data as of a specific timestamp (available because of [MVCC](storage-layer.html#mvcc)). This snapshot can be sent to other nodes during a rebalance event to expedite replication.

After loading the snapshot, the node gets up to date by replaying all actions from the Raft group's log that have occurred since the snapshot was taken.

### Leases

A single node in the Raft group acts as the leaseholder, which is the only node that can serve reads or propose writes to the Raft group leader (both actions are received as `BatchRequests` from [`DistSender`](distribution-layer.html#distsender)).

CockroachDB attempts to elect a leaseholder who is also the Raft group leader, which can also optimize the speed of writes.

If there is no leaseholder, any node receiving a request will attempt to become the leaseholder for the range. To prevent two nodes from acquiring the lease, the requester includes a copy of the last valid lease it had; if another node became the leaseholder, its request is ignored.

When serving [strongly-consistent (aka "non-stale") reads](transaction-layer.html#reading), leaseholders bypass Raft; for the leaseholder's writes to have been committed in the first place, they must have already achieved consensus, so a second consensus on the same data is unnecessary. This has the benefit of not incurring latency from networking round trips required by Raft and greatly increases the speed of reads (without sacrificing consistency).

#### Co-location with Raft leadership

The range lease is completely separate from Raft leadership, and so without further efforts, Raft leadership and the range lease might not be held by the same replica. However, we can optimize query performance by making the same node both Raft leader and the leaseholder; it reduces network round trips if the leaseholder receiving the requests can simply propose the Raft commands to itself, rather than communicating them to another node.

To achieve this, each lease renewal or transfer also attempts to collocate them. In practice, that means that the mismatch is rare and self-corrects quickly.

#### Epoch-based leases (table data)

To manage leases for table data, CockroachDB implements a notion of "epochs," which are defined as the period between a node joining a cluster and a node disconnecting from a cluster. To extend its leases, each node must periodically update its liveness record, which is stored on a system range key. When a node disconnects, it stops updating the liveness record, and the epoch is considered changed. This causes the node to [lose all of its leases](#how-leases-are-transferred-from-a-dead-node) a few seconds later when the liveness record expires.

Because leases do not expire until a node disconnects from a cluster, leaseholders do not have to individually renew their own leases. Tying lease lifetimes to node liveness in this way lets us eliminate a substantial amount of traffic and Raft processing we would otherwise incur, while still tracking leases for every range.

#### Expiration-based leases (meta and system ranges)

A table's meta and system ranges (detailed in the [distribution layer](distribution-layer.html#meta-ranges)) are treated as normal key-value data, and therefore have leases just like table data.

However, unlike table data, system ranges cannot use epoch-based leases because that would create a circular dependency: system ranges are already being used to implement epoch-based leases for table data. Therefore, system ranges use expiration-based leases instead. Expiration-based leases expire at a particular timestamp (typically after a few seconds). However, as long as a node continues proposing Raft commands, it continues to extend the expiration of its leases. If it doesn't, the next node containing a replica of the range that tries to read from or write to the range will become the leaseholder.

#### How leases are transferred from a dead node

When a node disconnects, the process by which each of its leases is transferred to a healthy node is as follows:

1. The dead node's liveness record, which is stored in a system range, has an expiration time of 9 seconds, and is heartbeated every 4.5 seconds. When the node dies, the amount of time the cluster has to wait for the record to expire varies, but on average is 6.75 seconds.
1. A healthy node attempts to acquire the lease. This is rejected because lease acquisition can only happen on the Raft leader, which the healthy node is not (yet). Therefore, a Raft election must be held.
1. The rejected attempt at lease acquisition [unquiesces](../ui-replication-dashboard.html#replica-quiescence) ("wakes up") the range associated with the lease.
1. What happens next depends on whether the lease is on [table data](#epoch-based-leases-table-data) or [meta ranges or system ranges](#expiration-based-leases-meta-and-system-ranges):
    - If the lease is on [meta or system ranges](#expiration-based-leases-meta-and-system-ranges), the node that unquiesced the range checks if the Raft leader is alive according to the liveness record. If the leader is not alive, it kicks off a campaign to try and win Raft leadership so it can become the leaseholder.
    - If the lease is on [table data](#epoch-based-leases-table-data), the "is the leader alive?" check described above is skipped and an election is called immediately. The check is skipped since it would introduce a circular dependency on the liveness record used for table data, which is itself stored in a system range.
1. The Raft election is held and a new leader is chosen from among the healthy nodes.
1. The lease acquisition can now be processed by the newly elected Raft leader.

This process should take no more than 9 seconds for liveness expiration plus the cost of 2 network roundtrips: 1 for Raft leader election, and 1 for lease acquisition.

Finally, note that the process described above is lazily initiated: it only occurs when a new request comes in for the range associated with the lease.

#### Leaseholder rebalancing

Because CockroachDB serves reads from a range's leaseholder, it benefits your cluster's performance if the replica closest to the primary geographic source of traffic holds the lease. However, as traffic to your cluster shifts throughout the course of the day, you might want to dynamically shift which nodes hold leases.

{{site.data.alerts.callout_info}}

This feature is also called [Follow-the-Workload](../topology-follow-the-workload.html) in our documentation.

{{site.data.alerts.end}}

Periodically (every 10 minutes by default in large clusters, but more frequently in small clusters), each leaseholder considers whether it should transfer the lease to another replica by considering the following inputs:

- Number of requests from each locality
- Number of leases on each node
- Latency between localities

##### Intra-locality

If all the replicas are in the same locality, the decision is made entirely on the basis of the number of leases on each node that contains a replica, trying to achieve a roughly equitable distribution of leases across all of them. This means the distribution isn't perfectly equal; it intentionally tolerates small deviations between nodes to prevent thrashing (i.e., excessive adjustments trying to reach an equilibrium).

##### Inter-locality

If replicas are in different localities, CockroachDB attempts to calculate which replica would make the best leaseholder, i.e., provide the lowest latency.

To enable dynamic leaseholder rebalancing, a range's current leaseholder tracks how many requests it receives from each locality as an exponentially weighted moving average. This calculation results in the locality that has recently requested the range most often being assigned the greatest weight. If another locality then begins requesting the range very frequently, this calculation would shift to assign the second region the greatest weight.

When checking for leaseholder rebalancing opportunities, the leaseholder correlates each requesting locality's weight (i.e., the proportion of recent requests) to the locality of each replica by checking how similar the localities are. For example, if the leaseholder received requests from gateway nodes in locality `country=us,region=central`, CockroachDB would assign the following weights to replicas in the following localities:

Replica locality | Replica rebalancing weight
-----------------|-------------------
`country=us,region=central` | 100% because it is an exact match
`country=us,region=east` | 50% because only the first locality matches
`country=aus,region=central` | 0% because the first locality does not match

The leaseholder then evaluates its own weight and latency versus the other replicas to determine an adjustment factor. The greater the disparity between weights and the larger the latency between localities, the more CockroachDB favors the node from the locality with the larger weight.

When checking for leaseholder rebalancing opportunities, the current leaseholder evaluates each replica's rebalancing weight and adjustment factor for the localities with the greatest weights. If moving the leaseholder is both beneficial and viable, the current leaseholder will transfer the lease to the best replica.

##### Controlling leaseholder rebalancing

You can control leaseholder rebalancing through the `kv.allocator.load_based_lease_rebalancing.enabled` and `kv.allocator.lease_rebalancing_aggressiveness` [cluster settings](../cluster-settings.html). Note that depending on the needs of your deployment, you can exercise additional control over the location of leases and replicas by [configuring replication zones](../configure-replication-zones.html).

### Membership changes: rebalance/repair

Whenever there are changes to a cluster's number of nodes, the members of Raft groups change and, to ensure optimal survivability and performance, replicas need to be rebalanced. What that looks like varies depending on whether the membership change is nodes being added or going offline.

- **Nodes added**: The new node communicates information about itself to other nodes, indicating that it has space available. The cluster then rebalances some replicas onto the new node.

- **Nodes going offline**: If a member of a Raft group ceases to respond, after 5 minutes, the cluster begins to rebalance by replicating the data the downed node held onto other nodes.

Rebalancing is achieved by using a snapshot of a replica from the leaseholder, and then sending the data to another node over [gRPC](distribution-layer.html#grpc). After the transfer has been completed, the node with the new replica joins that range's Raft group; it then detects that its latest timestamp is behind the most recent entries in the Raft log and it replays all of the actions in the Raft log on itself.

#### Load-based replica rebalancing

In addition to the rebalancing that occurs when nodes join or leave a cluster, replicas are also rebalanced automatically based on the relative load across the nodes within a cluster. For more information, see the `kv.allocator.load_based_rebalancing` and `kv.allocator.qps_rebalance_threshold` [cluster settings](../cluster-settings.html). Note that depending on the needs of your deployment, you can exercise additional control over the location of leases and replicas by [configuring replication zones](../configure-replication-zones.html).

## Interactions with other layers

### Replication and distribution layers

The replication layer receives requests from its and other nodes' `DistSender`. If this node is the leaseholder for the range, it accepts the requests; if it isn't, it returns an error with a pointer to which node it believes *is* the leaseholder. These KV requests are then turned into Raft commands.

The replication layer sends `BatchResponses` back to the distribution layer's `DistSender`.

### Replication and storage layers

Committed Raft commands are written to the Raft log and ultimately stored on disk through the storage layer.

The leaseholder serves reads from the storage layer.

## What's next?

Learn how CockroachDB reads and writes data from disk in the [storage layer](storage-layer.html).
