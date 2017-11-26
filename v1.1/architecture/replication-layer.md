---
title: Replication Layer
summary: 
toc: false
---

The Replication Layer of CockroachDB's architecture copies data between nodes and ensures consistency between these copies by implementing our consensus algorithm.

{{site.data.alerts.callout_info}}If you haven't already, we recommend reading the <a href="overview.html">Architecture Overivew</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Overview

High availability requires that your database can tolerate nodes going offline without interrupting service to your application. This means replicating data between nodes to ensure the data remains accessible.

Ensuring consistency when nodes fail, though, is a challenge many databases fail. To solve this problem, CockroachDB uses a consensus algorithm, which requires a quorum of replicas to agree on any changes to a range before those changes are committed. Because 3 is the smallest number that can achieve quorum (i.e., 2 out of 3), CockroachDB requires at least 3 nodes to become highly available.

The number of failures that can be tolerated is equal to *(Replication factor - 1)/2*. For example, with 3x replication, one failure can be tolerated; with 5x replication, two failures, and so on. You can control the replication factor at the cluster, database, and table level using [Replication Zones](../configure-replication-zones.html).

When failures happen, though, CockroachDB undergoes two processes to maximize availability:

- After a few seconds, surviving nodes will take over read and writes responsibilities for ranges held by the suspect node.
- If the suspect node doesn't re-establish connection within a few minute, we begin copying data from the surviving replicas to new nodes to bring the range back up to the desired number of replicas.

### Interactions with Other Layers

In relationship to other layers in CockroachDB, the Replication Layer:

- Receives requests from and sends responses to the Distribution Layer.
- Writes accepted requests to and reads values from the Storage Layer.

## Components

### Raft

Raft is a consensus protocol––an algorithm which makes sure that a quorum of machines agree on the current state of your data, even if some of them are temporarily disconnected.

Raft organizes all nodes that contain a replica of a range into a group--unsurprisingly called a Raft Group. Each replica in a Raft Group is either a "leader" or a "follower". The leader, which is elected by Raft and long-lived, coordinates all writes to the Raft Group. It heartbeats followers periodically and keeps their logs replicated. In the absence of heartbeats, followers become candidates after randomized election timeouts and proceed hold new leader elections.

For a great overview of Raft, we recommend [The Secret Lives of Data](http://thesecretlivesofdata.com/raft/).

#### Leases in Raft

One of the members of the Raft group is elected to be the range's Leaseholder, which means that all requests for the range are forwarded to it––both reads and writes. It's important to note that this does not *have* to be the same member as the Raft leader, though it's beneficial for them to be collocate and, if CockroachDB detects that they are not, attempts to collocate both the Leaseholder and the Raft leader on the same node.

We also have more detail on [Leases](#leases).

When the Leaseholder receives writes in `BatchRequests` from the [Distribution Layer](distribution-layer.html#batchrequest), it converts the contained KV operations into Raft commands. Those commands are proposed to the Raft group leader––which is what makes it ideal for the Leaseholder and the Raft leader to be one in the same––and written to the Raft log.

#### Raft Logs

When writes receive a quorum, they're committed by the Raft group leader appended to the Raft log. This provides an ordered set of commands that the replicas agreed on and is essentially the source of truth for consistent replication.

Because this log is treated as serializable, it can be replayed to bring a node from a past state to the same current state as the rest of the Raft group. This log also lets nodes that temporarily went offline to be "caught up" to the current state without needing to receive a copy of the existing data in the form of a snapshot.

### Snapshots

Each replica can be "snapshotted", which copies all of its data as of a specific timestamp (available because of [MVCC](storage-layer.html#mvcc)). This snapshot can be sent to other nodes during a rebalance event to expedite replication.

After loading the snapshot, the node gets up to date by replaying all actions from the Raft group's log that have occurred since the snapshot was taken.

### Leases

Enforcing our [isolation levels](transaction-layer.html#isolation-levels) relies on a [timestamp cache](transaction-layer.html#timestamp-cache) that tracks the timestamp of each key's most recent read. If a node receives a write request with a lower timestamp (i.e. "in the past"), allowing it would violate serializable isolation (but not snapshot isolation).

To keep this timestamp cache up to date and consistent, a single node in the Raft group is elected as the Leaseholder. This node serves all reads for the range (ensuring its timestamp cache is always accurate) and proposes all writes to the Raft group leader (except those which it rejects because of failed timestamp cache checks).

{{site.data.alerts.callout_info}}CockroachDB uses a single node's timestamp cache for efficiency's sake. This mechanism could be alternatively designed to use a consensus-based timestamp cache and serve reads from any replica, but each read would incur more network round trips.{{site.data.alerts.end}}

#### Acquiring and Maintaining a Lease

Any replica that can communicate with a majority of the range's replicas can become the Leaseholder. A replica establishes itself as the Leaseholder by committing a special lease acquisition log entry through Raft, which points to its own [node liveness record](distribution-layer.html#node-liveness) (because this is a write, it requires consensus). 

As long as the node can continue to update its liveness record it maintains the lease. Each other replica in the Raft group tracks the lease in memory and cross-references it with the node liveness table to ensure the Leaseholder is still valid.

If a node wants to do something that requires a lease and it detects that a lease for one of its ranges is invalid (i.e. because the Leaseholder could no longer update its node liveness record), this node attempts to become the Leaseholder for the range. To prevent two nodes from acquiring the lease, the requester includes a copy of the last valid lease it was aware of; if another node became the Leaseholder in the interrim, its lease is out of date, and its request to become the Leaseholder is ignored.

The new Leaseholder uses the time at which it became the Leaseholder as the first entry in its timestamp cache for all keys in the range (as if the entire range had been read). In this way, the Leaseholder treats any writes at a time before it held the lease to be unsafe and prevents potential inconsistencies during the move between Leaseholders.

#### Co-location with Raft Leadership

The range lease is completely separate from Raft leadership, and so without further efforts, Raft leadership and the Range lease might not be held by the same Replica. However, we optimize query performance by making the same node both Raft leader and the Leaseholder; it reduces network round trips if the Leaseholder receiving the requests can simply propose the Raft commands to itself, rather than communicating them to another node.

To achieve this, each lease renewal or transfer also attempts to collocate them. In practice, that means that the mismatch is rare and self-corrects quickly.

#### Epoch-Based Leases (Table Data)

To manage leases for table data, CockroachDB implements a notion of "epochs," which are defined as the period between a node joining a cluster and a node disconnecting from a cluster. When the node disconnects, the epoch is considered changed, and the node immediately loses all of its leases.

This mechanism lets us avoid tracking leases for every range, which eliminates a substantial amount of traffic we would otherwise incur. Instead, we assume leases don't expire until a node loses connection.

#### Expiration-Based Leases (Meta & System Ranges)

Your table's meta and system ranges (detailed in the [Distribution Layer](distribution-layer.html)) are treated as normal key-value data, and therefore have Leases, as well. However, instead of using epochs, they have an expiration-based lease. These leases simply expire at a particular timestamp (typically a few seconds)––however, as long as the node continues proposing Raft commands, it continues to extend the expiration of the lease. If it doesn't, the next node containing a replica of the range that tries to read from or write to the range will become the Leaseholder.

### Membership Changes: Rebalance/Repair

Whenever there are changes to a cluster's number of nodes, the members of Raft groups change and, to ensure optimal survivability and performance, replicas need to be rebalanced. What that looks like varies depending on whether the membership change is nodes being added or going offline.

**Nodes added**: The new node communicates information about itself to other nodes, indicating its available space. The cluster then decides which Raft groups it should join, and replicas are then rebalanced.

**Nodes going offline**: If a member of a Raft group ceases to respond, after 5 minutes, the cluster determines which nodes should replace it in the Raft groups for its ranges, and then replicas are rebalanced.

#### Rebalancing Replicas

When CockroachDB detects a membership change, ultimately, replicas are moved between nodes.

This is achieved by using a snapshot of a replica from the Leaseholder, and then sending the data to another node over [gRPC](distribution-layer.html#grpc). After the transfer has been completed, the new node joins that range's Raft group; it then detects that its latest timestamp is behind the most recent entries in the Raft log and it replays all of the actions in the Raft log on itself.

## Interactions with Other Layers

### Replication & Distribution Layers

The Replication Layer receives requests from its and other nodes' `DistSender`. If this node is the Leaseholder for the range, it accepts the requests; if it isn't, it returns an error with a pointer to which node it believes *is* the Leaseholder. These KV requests are then turned into Raft commands.

The Replication layer sends `BatchResponses` back to the Distribution Layer's `DistSender`.

### Replication & Storage Layers

Committed Raft commands are written to the Raft log and as KV data, both of which are stored in the (appropriately named) Storage Layer.

The Leaseholder serves reads from its local RocksDB instance.

## What's Next?

Learn how CockroachDB reads and writes data from disk in the [Storage Layer](storage-layer.html).
