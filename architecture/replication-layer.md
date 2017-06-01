---
title: Replication Layer
summary: 
toc: false
---

<div id="toc"></div>

## Overview

To ensure survivability, CockroachDB replicates all ranges at least 3 times. This allows for one range to become inaccessible without compromising the consistency of the system.

Up to F failures can be tolerated, where the total number of replicas N = 2F + 1 (e.g. with 3x replication, one failure can be tolerated; with 5x replication, two failures, and so on).

However, the number of replicas is ultimately controlled with table-level granularity in your cluster's zone config file.

CockroachDB ensures consistency on these replicas––despite being distributed––by using the Raft consensus algorithm.

## Components

### Raft

Raft works by organizing all nodes that contain a replica of a range into a group––unsurprisingly called a Raft Group.

Raft elects a relatively long-lived leader which must be involved to propose commands. It heartbeats followers periodically and keeps their logs replicated. In the absence of heartbeats, followers become candidates after randomized election timeouts and proceed to hold new leader elections. Cockroach weights random timeouts such that the replicas with shorter round trip times to peers are more likely to hold elections first (not implemented yet). Only the Raft leader may propose commands; followers will simply relay commands to the last known leader.

Once a node receives `BatchRequests` for a range it contains, it converts those KV operations into Raft commands. Those commands are proposed to the Raft group leader––which is what makes it ideal for the Lease Holder and the Raft leader to be one in the same; it reduces network roundtrips if the Lease Holder receiving the requests can simply propose the Raft commands to itself, rather than communicating them to another node.

Proposed Raft commands are proposed to have them serialized through quorum voting into a coherent distributed log.

#### Logs

The log voted on by the Raft group contains an ordered set of commands that a quorum of replicas acknowledged and can be replayed to bring the node from a past state to its current state.

This log also lets nodes that temporarily went offline to be "caught up" to the current state without needing to receive a copy of the existing data in the form of a snapshot.

### Snapshots

Each replica can be "snapshotted", which copies all of its data as of a specific MVCC timestamp. This snapshot can be sent to other nodes during a rebalance event to expedite replication.

After receiving a snapshot, the node gets it up to date by playing all of the actions from the Raft group's committed log that have occurred since the snapshot was taken.

### Leases

Leases are held by a single member of the Raft group (usually the same node as the Raft group leader), and the leaseholder is responsible for receiving `BatchRequests` for all reads and writes related to keys in the range. This has the benefit of improving the speed of reads drastically (which don't need consensus, since a quorum of nodes already agreed with the leaseholder as to the status of the node after the write ).

If there is no Lease holder, any range receiving a request will attempt to become to Lease holder.

Since reads bypass Raft, a new lease holder will, among other things, ascertain that its timestamp cache does not report timestamps smaller than the previous lease holder's (so that it's compatible with reads which may have occurred on the former lease holder). This is accomplished by letting leases enter a stasis period (which is just the expiration minus the maximum clock offset) before the actual expiration of the lease, so that all the next lease holder has to do is set the low water mark of the timestamp cache to its new lease's start time.

As a lease enters its stasis period, no more reads or writes are served, which is undesirable. However, this would only happen in practice if a node became unavailable. In almost all practical situations, no unavailability results since leases are usually long-lived (and/or eagerly extended, which can avoid the stasis period) or proactively transferred away from the lease holder, which can also avoid the stasis period by promising not to serve any further reads until the next lease goes into effect.

#### Co-location with Raft leadership

The range lease is completely separate from Raft leadership, and so without further efforts, Raft leadership and the Range lease might not be held by the same Replica. Since it's expensive to not have these two roles colocated (the lease holder has to forward each proposal to the leader, adding costly RPC round-trips), each lease renewal or transfer also attempts to colocate them. In practice, that means that the mismatch is rare and self-corrects quickly.

### Membership Changes: Rebalance/Repair

Whenever there are changes to a cluster's number of nodes, replicas are rebalanced. What that looks like varies depending on whether the membership change is nodes being added or going offline.

**Nodes added**: The new node Gossips information about itself, indicating that it has space available. The cluster then rebalances some replicas onto the new node based on its zone configs, that control replication with table-level granularity.

**Nodes going offline**: If a member of a Raft group ceases to respond, after 5 minutes, the cluster begins to rebalance by replicating the data the downed node held onto nodes with available space.

#### Rebalancing Replicas

When CockroachDB detects a membership change, ultimately, replicas are moved between ranges.

This is achieved by taking using a snapshot of a replica from the lease-holding node, and then sending the data to another node over gRPC. After the transfer has been completed, the node with the new replica joins the Raft group for the range; it then detects that its latest timestamp is behind the most recent entries in the Raft log and it replays all of the actions in the Raft log on itself. Once it's caught up it becomes a voting member of the Raft consensus group.

## Interactions with Other Layers

The Replication Layer receives requests from its and other nodes' `DistSender`, which it accepts if it is the leaseholder or errors if it's not. These KV requests are then turned into Raft commands.

The Replication layer sends `BatchResponses` back to the Distribution Layer's `DistSender`.

Accepted Raft commands are written to the Raft log and ultimately stored on disk through the Storage Layer.
