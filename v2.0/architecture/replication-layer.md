---
title: Replication Layer
summary: The replication layer of CockroachDB's architecture copies data between nodes and ensures consistency between copies.
toc: true
---

The Replication Layer of CockroachDB's architecture copies data between nodes and ensures consistency between these copies by implementing our consensus algorithm.

{{site.data.alerts.callout_info}}If you haven't already, we recommend reading the <a href="overview.html">Architecture Overview</a>.{{site.data.alerts.end}}

## Overview

High availability requires that your database can tolerate nodes going offline without interrupting service to your application. This means replicating data between nodes to ensure the data remains accessible.

Ensuring consistency with nodes offline, though, is a challenge many databases fail. To solve this problem, CockroachDB uses a consensus algorithm to require that a quorum of replicas agrees on any changes to a range before those changes are committed. Because 3 is the smallest number that can achieve quorum (i.e., 2 out of 3), CockroachDB's high availability (known as Multi-Active Availability) requires 3 nodes.

The number of failures that can be tolerated is equal to *(Replication factor - 1)/2*. For example, with 3x replication, one failure can be tolerated; with 5x replication, two failures, and so on. You can control the replication factor at the cluster, database, and table level using [Replication Zones](../configure-replication-zones.html).

When failures happen, though, CockroachDB automatically realizes nodes have stopped responding and works to redistribute your data to continue maximizing survivability. This process also works the other way around: when new nodes join your cluster, data automatically rebalances onto it, ensuring your load is evenly distributed.

### Interactions with Other Layers

In relationship to other layers in CockroachDB, the Replication Layer:

- Receives requests from and sends responses to the Distribution Layer.
- Writes accepted requests to the Storage Layer.

## Components

### Raft

Raft is a consensus protocol––an algorithm which makes sure that your data is safely stored on multiple machines, and that those machines agree on the current state even if some of them are temporarily disconnected.

Raft organizes all nodes that contain a replica of a range into a group--unsurprisingly called a Raft Group. Each replica in a Raft Group is either a "leader" or a "follower". The leader, which is elected by Raft and long-lived, coordinates all writes to the Raft Group. It heartbeats followers periodically and keeps their logs replicated. In the absence of heartbeats, followers become candidates after randomized election timeouts and proceed to hold new leader elections.

Once a node receives a `BatchRequest` for a range it contains, it converts those KV operations into Raft commands. Those commands are proposed to the Raft group leader––which is what makes it ideal for the [Leaseholder](#leases) and the Raft leader to be one in the same––and written to the Raft log.

For a great overview of Raft, we recommend [The Secret Lives of Data](http://thesecretlivesofdata.com/raft/).

#### Raft Logs

When writes receive a quorum, and are committed by the Raft group leader, they're appended to the Raft log. This provides an ordered set of commands that the replicas agreed on and is essentially the source of truth for consistent replication.

Because this log is treated as serializable, it can be replayed to bring a node from a past state to its current state. This log also lets nodes that temporarily went offline to be "caught up" to the current state without needing to receive a copy of the existing data in the form of a snapshot.

### Snapshots

Each replica can be "snapshotted", which copies all of its data as of a specific timestamp (available because of [MVCC](storage-layer.html#mvcc)). This snapshot can be sent to other nodes during a rebalance event to expedite replication.

After loading the snapshot, the node gets up to date by replaying all actions from the Raft group's log that have occurred since the snapshot was taken.

### Leases

A single node in the Raft group acts as the Leaseholder, which is the only node that can serve reads or propose writes to the Raft group leader (both actions are received as `BatchRequests` from [`DistSender`](distribution-layer.html#distsender)).

When serving reads, Leaseholders bypass Raft; for the Leaseholder's writes to have been committed in the first place, they must have already achieved consensus, so a second consensus on the same data is unnecessary. This has the benefit of not incurring networking round trips required by Raft and greatly increases the speed of reads (without sacrificing consistency).

CockroachDB attempts to elect a Leaseholder who is also the Raft group leader, which can also optimize the speed of writes.

If there is no Leaseholder, any node receiving a request will attempt to become the Leaseholder for the range. To prevent two nodes from acquiring the lease, the requester includes a copy of the last valid lease it had; if another node became the Leaseholder, its request is ignored.

#### Co-location with Raft Leadership

The range lease is completely separate from Raft leadership, and so without further efforts, Raft leadership and the Range lease might not be held by the same Replica. However, we can optimize query performance by making the same node both Raft leader and the Leaseholder; it reduces network round trips if the Leaseholder receiving the requests can simply propose the Raft commands to itself, rather than communicating them to another node.

To achieve this, each lease renewal or transfer also attempts to collocate them. In practice, that means that the mismatch is rare and self-corrects quickly.

#### Epoch-Based Leases (Table Data)

To manage leases for table data, CockroachDB implements a notion of "epochs," which are defined as the period between a node joining a cluster and a node disconnecting from a cluster. When the node disconnects, the epoch is considered changed, and the node immediately loses all of its leases.

This mechanism lets us avoid tracking leases for every range, which eliminates a substantial amount of traffic we would otherwise incur. Instead, we assume leases do not expire until a node loses connection.

#### Expiration-Based Leases (Meta & System Ranges)

Your table's meta and system ranges (detailed in the Distribution Layer) are treated as normal key-value data, and therefore have Leases, as well. However, instead of using epochs, they have an expiration-based lease. These leases simply expire at a particular timestamp (typically a few seconds)––however, as long as the node continues proposing Raft commands, it continues to extend the expiration of the lease. If it doesn't, the next node containing a replica of the range that tries to read from or write to the range will become the Leaseholder.

### Membership Changes: Rebalance/Repair

Whenever there are changes to a cluster's number of nodes, the members of Raft groups change and, to ensure optimal survivability and performance, replicas need to be rebalanced. What that looks like varies depending on whether the membership change is nodes being added or going offline.

**Nodes added**: The new node communicates information about itself to other nodes, indicating that it has space available. The cluster then rebalances some replicas onto the new node.

**Nodes going offline**: If a member of a Raft group ceases to respond, after 5 minutes, the cluster begins to rebalance by replicating the data the downed node held onto other nodes.

#### Rebalancing Replicas

When CockroachDB detects a membership change, ultimately, replicas are moved between nodes.

This is achieved by using a snapshot of a replica from the Leaseholder, and then sending the data to another node over [gRPC](distribution-layer.html#grpc). After the transfer has been completed, the node with the new replica joins that range's Raft group; it then detects that its latest timestamp is behind the most recent entries in the Raft log and it replays all of the actions in the Raft log on itself.

## Interactions with Other Layers

### Replication & Distribution Layers

The Replication Layer receives requests from its and other nodes' `DistSender`. If this node is the Leaseholder for the range, it accepts the requests; if it isn't, it returns an error with a pointer to which node it believes *is* the Leaseholder. These KV requests are then turned into Raft commands.

The Replication layer sends `BatchResponses` back to the Distribution Layer's `DistSender`.

### Replication & Storage Layers

Committed Raft commands are written to the Raft log and ultimately stored on disk through the Storage Layer.

The Leaseholder serves reads from its RocksDB instance, which is in the Storage Layer.

## What's Next?

Learn how CockroachDB reads and writes data from disk in the [Storage Layer](storage-layer.html).
