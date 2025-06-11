---
title: Replication Layer
summary: The replication layer of CockroachDB's architecture copies data between nodes and ensures consistency between copies.
toc: true
docs_area: reference.architecture
---

The replication layer of CockroachDB's architecture copies data between nodes and ensures consistency between these copies by implementing our consensus algorithm.

{{site.data.alerts.callout_info}}
If you haven't already, we recommend reading the [Architecture Overview]({% link {{ page.version.version }}/architecture/overview.md %}).
{{site.data.alerts.end}}

## Overview

High availability requires that your database can tolerate nodes going offline without interrupting service to your application. This means replicating data between nodes to ensure the data remains accessible.

Ensuring consistency with nodes offline, though, is a challenge many databases fail. To solve this problem, CockroachDB uses a consensus algorithm to require that a quorum of replicas agrees on any changes to a range before those changes are committed. Because 3 is the smallest number that can achieve quorum (i.e., 2 out of 3), CockroachDB's high availability (known as multi-active availability) requires 3 nodes.

The number of failures that can be tolerated is equal to *(Replication factor - 1)/2*. For example, with 3x replication, one failure can be tolerated; with 5x replication, two failures, and so on. You can control the replication factor at the cluster, database, and table level using [replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}).

When failures happen, though, CockroachDB automatically realizes nodes have stopped responding and works to redistribute your data to continue maximizing survivability. This process also works the other way around: when new nodes join your cluster, data automatically rebalances onto it, ensuring your load is evenly distributed.

### Interactions with other layers

In relationship to other layers in CockroachDB, the replication layer:

- Receives requests from and sends responses to the distribution layer.
- Writes accepted requests to the storage layer.

## Technical details and components

### Raft

Raft is a consensus protocol––an algorithm which makes sure that your data is safely stored on multiple machines, and that those machines agree on the current state even if some of them are temporarily disconnected.

Raft organizes all nodes that contain a [replica]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-replica) of a [range]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) into a group--unsurprisingly called a Raft group. Each replica in a Raft group is either a "leader" or a "follower". The leader, which is elected by Raft and long-lived, coordinates all writes to the Raft group. It heartbeats followers periodically and keeps their logs replicated. In the absence of heartbeats, followers become candidates after [randomized election timeouts](#important-values-and-timeouts) and proceed to hold new leader elections.

A third replica type, the "non-voting" replica, does not participate in Raft elections, but is useful for unlocking use cases that require low-latency multi-region reads. For more information, see [Non-voting replicas](#non-voting-replicas).

For the current values of the Raft election timeout, the Raft proposal timeout, and other important intervals, see [Important values and timeouts](#important-values-and-timeouts).

Once a node receives a `BatchRequest` for a range it contains, it converts those KV operations into Raft commands. Those commands are proposed to the Raft group leader––which is also the [leaseholder](#leases)––and written to the Raft log.

For a great overview of Raft, we recommend [The Secret Lives of Data](http://thesecretlivesofdata.com/raft/).

#### Raft logs

When writes receive a quorum, and are committed by the Raft group leader, they're appended to the Raft log. This provides an ordered set of commands that the replicas agreed on and is essentially the source of truth for consistent replication.

Because this log is treated as serializable, it can be replayed to bring a node from a past state to its current state. This log also lets nodes that temporarily went offline to be "caught up" to the current state without needing to receive a copy of the existing data in the form of a snapshot.

#### Non-voting replicas

In versions prior to v21.1, CockroachDB only supported _voting_ replicas: that is, [replicas]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-replica) that participate as voters in the [Raft consensus protocol](#raft). However, the need for all replicas to participate in the consensus algorithm meant that increasing the [replication factor]({% link {{ page.version.version }}/configure-replication-zones.md %}#num_replicas) came at a cost of increased write latency, since the additional replicas needed to participate in Raft [quorum]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-overview-consensus).

In order to provide [better support for multi-region clusters]({% link {{ page.version.version }}/multiregion-overview.md %}) (including the features that make [fast multi-region reads]({% link {{ page.version.version }}/table-localities.md %}#global-tables) and [surviving region failures]({% link {{ page.version.version }}/multiregion-survival-goals.md %}#survive-region-failures) possible), a new type of replica was introduced: the _non-voting_ replica.

Non-voting replicas follow the [Raft log](#raft-logs) (and are thus able to serve [follower reads]({% link {{ page.version.version }}/follower-reads.md %})), but do not participate in quorum. They have almost no impact on write latencies.

They are also sometimes referred to as [_read-only_ replicas](https://cloud.google.com/spanner/docs/replication#read-only), since they only serve reads, but do not participate in quorum (and thus do not incur the associated latency costs).

Non-voting replicas can be configured via [zone configurations through `num_voters` and `num_replicas`]({% link {{ page.version.version }}/configure-replication-zones.md %}#num_voters). When `num_voters` is configured to be less than `num_replicas`, the difference dictates the number of non-voting replicas. However, most users should control non-voting replica placement with the high-level [multi-region SQL features]({% link {{ page.version.version }}/multiregion-overview.md %}) instead.

#### Per-replica circuit breakers

- [Overview](#per-replica-circuit-breaker-overview)
- [Configuration](#per-replica-circuit-breaker-configuration)
- [Limitations](#per-replica-circuit-breaker-limitations)

<a name="per-replica-circuit-breaker-overview"></a>

##### Overview

When individual [ranges]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) become temporarily unavailable, requests to those ranges are refused by a per-replica "circuit breaker" mechanism instead of hanging indefinitely.

From a user's perspective, this means that if a [SQL query]({% link {{ page.version.version }}/architecture/sql-layer.md %}) is going to ultimately fail due to accessing a temporarily unavailable range, a [replica]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-replica) in that range will trip its circuit breaker (after 60 seconds [by default](#per-replica-circuit-breaker-timeout)) and bubble a `ReplicaUnavailableError` error back up through the system to inform the user why their query did not succeed. These (hopefully transient) errors are also signalled as events in the DB Console's [Replication Dashboard]({% link {{ page.version.version }}/ui-replication-dashboard.md %}) and as "circuit breaker errors" in its [**Problem Ranges** and **Range Status** pages]({% link {{ page.version.version }}/ui-debug-pages.md %}). Meanwhile, CockroachDB continues asynchronously probing the range's availability. If the replica becomes available again, the breaker is reset so that it can go back to serving requests normally.

This feature is designed to increase the availability of your CockroachDB clusters by making them more robust to transient errors.

For more information about per-replica circuit breaker events happening on your cluster, see the following pages in the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}):

- The [**Replication** dashboard]({% link {{ page.version.version }}/ui-replication-dashboard.md %}).
- The [**Advanced Debug** page]({% link {{ page.version.version }}/ui-debug-pages.md %}). From there you can view the **Problem Ranges** page, which lists the range replicas whose circuit breakers were tripped. You can also view the **Range Status** page, which displays the circuit breaker error message for a given range.

<a name="per-replica-circuit-breaker-configuration"></a>

##### Configuration

Per-replica circuit breakers are enabled by default. Most users will not have to configure anything to get the benefits of this feature.

<a name="per-replica-circuit-breaker-timeout"></a>

The circuit breaker timeout value is controlled by the `kv.replica_circuit_breaker.slow_replication_threshold` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}), which defaults to an [interval]({% link {{ page.version.version }}/interval.md %}) of `1m0s` (1 minute).

<a name="per-replica-circuit-breaker-limitations"></a>

##### Known limitations

{% include {{ page.version.version }}/known-limitations/per-replica-circuit-breaker-limitations.md %}

### Snapshots

Each replica can be "snapshotted", which copies all of its data as of a specific timestamp (available because of [MVCC]({% link {{ page.version.version }}/architecture/storage-layer.md %}#mvcc)). This snapshot can be sent to other nodes during a rebalance event to expedite replication.

After loading the snapshot, the node gets up to date by replaying all actions from the Raft group's log that have occurred since the snapshot was taken.

CockroachDB clusters running v23.1 and later can send _delegated snapshots_. Delegated snapshots can be sent by a Raft follower on behalf of the leader of a range. Which follower is chosen depends on the locality of the follower being nearest the replica that is the final recipient of the snapshot. If the follower is not able to send the snapshot quickly, the attempt is cancelled and the Raft leader sends the snapshot instead. If the follower is not able to send a snapshot that will be valid for the recipient, the request is rerouted to the leader.

Sending data locally using delegated snapshots has the following benefits:

- Snapshot transfers are faster
- Snapshot transfers use less WAN bandwidth
- Network costs are lower for operators of multi-region deployments
- User traffic is less likely to be negatively impacted by snapshots

Delegated snapshots are managed automatically by the cluster with no need for user involvement.

To limit the impact of snapshot ingestion on a node with a [provisioned rate]({% link {{ page.version.version }}/cockroach-start.md %}#store) configured for its store, you can enable [admission control]({% link {{ page.version.version }}/admission-control.md %}) for snapshot transfer, based on disk bandwidth. This allows you to limit the disk impact on foreground workloads on the node. Admission control for snapshot transfers is disabled by default; to enable it, set the [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) `kvadmission.store.snapshot_ingest_bandwidth_control.enabled` to `true`. The histogram [metric]({% link {{ page.version.version }}/metrics.md %}) `admission.wait_durations.snapshot_ingest` allows you to observe the wait times for snapshots that were impacted by admission control.

### Leases

A single node in the Raft group acts as the leaseholder, which is the only node that can serve reads or propose writes to the Raft group leader (both actions are received as `BatchRequests` from [`DistSender`]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#distsender)).

CockroachDB ensures that the leaseholder is also the Raft group leader via the [Leader leases](#leader-leases) mechanism. This optimizes the speed of writes, and makes the cluster more robust against network partitions and node liveness failures.

When the leaseholder is sent a write request, a majority of the replica nodes must be able to communicate with each other to coordinate the write. This ensures that the most recent write is always available to subsequent reads.

If there is no leaseholder, any node receiving a request will attempt to become the leaseholder for the range.

To extend its leases, each node must also remain the Raft leader, as described in [Leader leases](#leader-leases). When a node disconnects, it stops updating its _store liveness_, causing the node to [lose all of its leases](#how-leases-are-transferred-from-a-dead-node).

A table's meta and system ranges (detailed in [Distribution Layer]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#meta-ranges)) are treated as normal key-value data, and therefore have leases just like table data.

When serving [strongly-consistent (aka "non-stale") reads]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#reading), leaseholders bypass Raft; for the leaseholder's writes to have been committed in the first place, they must have already achieved consensus, so a second consensus on the same data is unnecessary. This has the benefit of not incurring latency from networking round trips required by Raft and greatly increases the speed of reads (without sacrificing consistency).

CockroachDB is considered a CAP-Consistent (CP) system under the [CAP theorem](https://wikipedia.org/wiki/CAP_theorem). CockroachDB prioritizes data consistency, but also provides high-availability due to the coordination between leaseholders and replicas, minimizing the tradeoff between consistency and availability outlined by the CAP theorem. When you store data in CockroachDB, the data will be valid and anomaly-free, even in the event of a system error or power failure.

#### Co-location with Raft leadership

The range lease is always colocated with Raft leadership via the [Leader leases](#leader-leases) mechanism, except briefly during [lease transfers](#how-leases-are-transferred-from-a-dead-node). This reduces network round trips since the leaseholder receiving the requests can simply propose the Raft commands to itself, rather than communicating them to another node.

It also increases robustness against network partitions and outages due to liveness failures.

For more information, refer to [Leader leases](#leader-leases).

#### Epoch-based leases

Epoch-based leases are disabled by default in favor of [Leader leases](#leader-leases).

To manage leases for table data, CockroachDB implements a notion of "epochs," which are defined as the period between a node joining a cluster and a node disconnecting from a cluster. To extend its leases, each node must periodically update its liveness record, which is stored on a system range key. When a node disconnects, it stops updating the liveness record, and the epoch is considered changed. This causes the node to [lose all of its leases](#how-leases-are-transferred-from-a-dead-node) a few seconds later when the liveness record expires.

Because leases do not expire until a node disconnects from a cluster, leaseholders do not have to individually renew their own leases. Tying lease lifetimes to node liveness in this way lets us eliminate a substantial amount of traffic and Raft processing we would otherwise incur, while still tracking leases for every range.

#### Expiration-based leases (meta and system ranges)

A table's meta and system ranges (detailed in the [distribution layer]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#meta-ranges)) are treated as normal key-value data, and therefore have leases just like table data.

Unlike table data, system ranges use expiration-based leases; expiration-based leases expire at a particular timestamp (typically after a few seconds). However, as long as a node continues proposing Raft commands, it continues to extend the expiration of its leases. If it doesn't, the next node containing a replica of the range that tries to read from or write to the range will become the leaseholder.

Expiration-based leases are also used temporarily during operations like lease transfers, until the new Raft leader can be fortified based on store liveness, as described in [Leader leases](#leader-leases).

#### Leader‑leaseholder splits

[Epoch-based leases](#epoch-based-leases) (unlike [Leader leases](#leader-leases)) are vulnerable to _leader-leaseholder splits_. These can occur when a leaseholder's Raft log has fallen behind other replicas in its group and it cannot acquire Raft leadership. Coupled with a [network partition]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#network-partition), this split can cause permanent unavailability of the range if (1) the stale leaseholder continues heartbeating the [liveness range](#liveness-range) to hold its lease but (2) cannot reach the leader to propose writes.

Symptoms of leader-leaseholder splits include a [stalled Raft log]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#requests-stuck-in-raft) on the leaseholder and [increased disk usage]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#disks-filling-up) on follower replicas buffering pending Raft entries. Remediations include:

- Restarting the affected nodes.
- Fixing the network partition (or slow networking) between nodes.

#### Leader leases

{% include {{ page.version.version }}/leader-leases-intro.md %}

Leader leases rely on a shared, store-wide failure detection mechanism for triggering new Raft elections. [Stores]({% link {{ page.version.version }}/cockroach-start.md %}#store) participate in Raft leader elections by "fortifying" a candidate replica based on that replica's _store liveness_, as determined among a quorum of all the node's stores. A replica can **only** become the Raft leader if it is so fortified.

After the fortified Raft leader is chosen, it is then also established as the leaseholder. Support for the lease is provided as long as the Raft leader's store liveness remains supported by a quorum of stores in the Raft group. This provides the fortified Raft leader with a guarantee that it will not lose leadership until **after** it has lost store liveness support. This guarantee enables a number of improvements to the performance and resiliency of CockroachDB's Raft implementation that were prevented by the need to handle cases where Raft leadership and range leases were not colocated.

Importantly, since Leader leases rely on a quorum of stores in the Raft group, they remove the need for the single point of failure (SPOF) that was the node liveness range. As a result, Leader leases are not vulnerable to the scenario possible under the previous leasing regime (prior to CockroachDB v25.2) where a leaseholder was [partitioned]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#network-partition) from its followers (including a follower that was the Raft leader) but still heartbeating the node liveness range. Before Leader leases, this scenario would result in an indefinite outage that lasted as long as the lease was held by the partitioned node.

Based on Cockroach Labs' internal testing, leader leases provide the following user-facing benefits:

- [Network partitions]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#network-partition) between a leaseholder and its followers heal in less than 20 seconds, since the leaseholder no longer needs to heartbeat a single node liveness range.
- Outages caused by liveness failures last less than 1 second, since liveness is now determined by a store-level detection mechanism, not a single node liveness range.
- Performance is equivalent (within less than 1%) to epoch-based leases on a 100 node cluster of 32 vCPU machines with 8 stores each.

{% include {{ page.version.version }}/leader-leases-node-heartbeat-use-cases.md %}

### How leases are transferred from a dead node

When a cluster needs to access a range on a leaseholder node that is dead, the lease must be transferred to a healthy node. The process is as follows:

1. Detection of Node Failure: The _store liveness_ mechanism described in [Leader leases](#leader-leases) detects node failures through its store-wide heartbeating process. If a node becomes unresponsive, its store liveness support is withdrawn, marking it as unavailable.
1. Raft Leadership Election: A Raft election is initiated to establish a new leader for the range. This step is necessary because lease acquisition can only occur on the Raft leader. The election process includes a store liveness component to fortify the new leader, as described in [Leader leases](#leader-leases).
1. Lease Acquisition: Once a new Raft leader is elected, the lease acquisition process can proceed. The new leader acquires the lease.

The entire process, from detecting the node failure to acquiring the lease on a new node, should complete within a few seconds.

This process is lazily initiated and only occurs when a new request is made that requires access to the range associated with the lease on the dead node.

#### Leaseholder rebalancing

Because CockroachDB serves reads from a range's leaseholder, it benefits your cluster's performance if the replica closest to the primary geographic source of traffic holds the lease. However, as traffic to your cluster shifts throughout the course of the day, you might want to dynamically shift which nodes hold leases.

{{site.data.alerts.callout_info}}

This feature is also called [Follow-the-Workload]({% link {{ page.version.version }}/topology-follow-the-workload.md %}) in our documentation.

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

You can control leaseholder rebalancing through the `kv.allocator.load_based_lease_rebalancing.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}). Note that depending on the needs of your deployment, you can exercise additional control over the location of leases and replicas by [configuring replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}).

### Membership changes: rebalance/repair

Whenever there are changes to a cluster's number of nodes, the members of Raft groups change and, to ensure optimal survivability and performance, replicas need to be rebalanced. What that looks like varies depending on whether the membership change is nodes being added or going offline.

- **Nodes added**: The new node communicates information about itself to other nodes, indicating that it has space available. The cluster then rebalances some replicas onto the new node.

- **Nodes going offline**: If a member of a Raft group ceases to respond, the cluster begins to rebalance by replicating the data the downed node held onto other nodes.

Rebalancing is achieved by using a snapshot of a replica from the leaseholder, and then sending the data to another node over [gRPC]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#grpc). After the transfer has been completed, the node with the new replica joins that range's Raft group; it then detects that its latest timestamp is behind the most recent entries in the Raft log and it replays all of the actions in the Raft log on itself.

#### Load-based replica rebalancing

In addition to the rebalancing that occurs when nodes join or leave a cluster, replicas are also rebalanced automatically across the cluster based on a combination of:

1. Replica count.
1. CPU usage (if [`kv.allocator.load_based_rebalancing.objective`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-kv-allocator-load-based-rebalancing-objective) is set to `cpu`, which is the default in CockroachDB v23.1 and later)

Note that disk utilization per node is not one of the rebalancing criteria. For more information, see [Disk utilization is different across nodes in the cluster]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#disk-utilization-is-different-across-nodes-in-the-cluster).

Load-based replica rebalancing operates in conjunction with [load-based splitting]({% link {{ page.version.version }}/load-based-splitting.md %}) of [ranges]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range).

For more information on how to control load-based rebalancing, see the following [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}):

- [`kv.allocator.store_cpu_rebalance_threshold`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-kv-allocator-store-cpu-rebalance-threshold)
- [`kv.allocator.range_rebalance_threshold`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-kv-allocator-range-rebalance-threshold)

Depending on the needs of your deployment, you can exercise additional control over the locations of leases and replicas using [multi-region SQL]({% link {{ page.version.version }}/multiregion-overview.md %}), or by [configuring replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}).

### Important values and timeouts

The following table lists some important values used by CockroachDB's replication layer:

Constant | Default value | Notes
---------|---------------|------
[Raft](#raft) election timeout | {{site.data.constants.cockroach_raft_election_timeout_ticks}} * {{site.data.constants.cockroach_raft_tick_interval}} | Controlled by `COCKROACH_RAFT_ELECTION_TIMEOUT_TICKS`, which is then multiplied by the default tick interval to determine the timeout value. This value is then multiplied by a random factor of 1-2 to avoid election ties.
[Raft](#raft) proposal timeout | {{site.data.constants.cockroach_raft_reproposal_timeout_ticks}} * {{site.data.constants.cockroach_raft_tick_interval}} | Controlled by `COCKROACH_RAFT_REPROPOSAL_TIMEOUT_TICKS`, which is then multiplied by the default tick interval to determine the value.
[Lease interval](#how-leases-are-transferred-from-a-dead-node) | {{site.data.constants.cockroach_range_lease_duration}} | Controlled by `COCKROACH_RANGE_LEASE_DURATION`.
[Lease acquisition timeout](#how-leases-are-transferred-from-a-dead-node) | {{site.data.constants.cockroach_range_lease_acquisition_timeout}} |
Raft tick interval | {{site.data.constants.cockroach_raft_tick_interval}} | Controlled by `COCKROACH_RAFT_TICK_INTERVAL`. Used to calculate various replication-related timeouts.

## Interactions with other layers

### Replication and distribution layers

The replication layer receives requests from its and other nodes' `DistSender`. If this node is the leaseholder for the range, it accepts the requests; if it isn't, it returns an error with a pointer to which node it believes *is* the leaseholder. These KV requests are then turned into Raft commands.

The replication layer sends `BatchResponses` back to the distribution layer's `DistSender`.

### Replication and storage layers

Committed Raft commands are written to the Raft log and ultimately stored on disk through the storage layer.

The leaseholder serves reads from the storage layer.

## What's next?

Learn how CockroachDB reads and writes data from disk in the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}).
