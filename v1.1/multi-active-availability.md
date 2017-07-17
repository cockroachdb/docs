---
title: Multi-Active Availability
summary: Learn about CockroachDB's high availability model, known as Multi-Active Availability
toc: false
---

CockroachDB's availability model is described as "Multi-Active Availability." In essence, Multi-Active Availability is like traditional notions of high availability, but lets you read and write from every node in your cluster without generating any conflicts.

Multi-Active Availability in CockroachDB has two major advantages:
- Provides industry-leading consistency, even on widely distributed deployments
- Reduces your hardware costs by minimizing the number of machines you need

<div id="toc"></div>

## What is High Availability?

High availability lets an application continue running even if a machine hosting one of its services fails. This is achieved by replicating the application's services horizontally, i.e., running the same service on many machines. If any one of the machines fails, the other machines can simply step in and perform the same service.

Before diving into the details of CockroachDB's multi-active availability, we'll review the two most common high availability designs: Active-Passive and Active-Active systems.

### Active-Passive

In Active-Passive systems, all traffic is routed to a single, "active" machine. Any kind of stateful changes made to the machine are then duplicated to a backup "passive" machine, in an attempt to always mirror the active machine as closely as possible.

If the active machine fails, traffic is then routed to the passive machine which can more or less pick up where the active machine left off.

This design has some significant drawbacks, though:

- Because you must adequately prepare for failover, your passive machines must provide production-level capacity, which means you double the amount of hardware you need.
- For stateful services, such as databases, you run the risk of inconsistent data during failover. When the active machine fails, any data written or changed on it that wasn't yet duplicated is lost. Depending on your industry, this could have pretty dire consequences.

### Active-Active

In Active-Active systems, multiple machines run identical services, and traffic is routed to all of them. If any machines fails, the others simply  running the same service can handle the failed machine's traffic in addition to their own.

Because machines must anticipate nodes failing, though, you must still have twice as much hardware. Each machine cannot exceed 50% of its capacity, or it wouldn't be able to take on the entire load of a downed machine.

For databases, though, this also runs into a more fundamental problem: it's incredibly difficult to keep data consistent if you have multiple machines attempting to accept reads and writes for the same data.

#### Example: Conflicts with Active-Active Replication

For this example, we have 2 nodes (A, B) in an Active-Active High Availability cluster.

For example, if we have two Active-Active nodes A and B.

1. A receives a write for key `abc` of `'123'`, and then immediately fails.
2. B receives a read of key `abc`, and returns a `NULL` because it cannot find the key.
3. B then receives a write for key `abc` of `'456'`.
4. Node A is restarted and attempts to rejoin Node B––but what do you about key `abc`?

{{site.data.alerts.callout_info}}In this example, the cluster remained active the entire time. But in terms of the CAP theorem, this is an AP system; it favored being available instead of consistent.{{site.data.alerts.end}}

## What is Multi-Active Availability?

Multi-Active Availability provides all of the benefits of high availability (remaining live despite individual machine failures), while overcoming the downsides of both Active-Passive and traditional Active-Active systems.

Like Active-Active designs, all nodes handle traffic. However, CockroachDB improves upon that design by also ensuring that data remains consistent across them––which we achieve by using "consensus replication." In this design, data is replicated at least 3 times, and any changes to it must be propagated to a majority of the replicas before it's considered committed.

If your cluster loses a majority of the nodes responsible for a set of data, it can no longer reach consensus and stops responding. This way, CockroachDB preserves consistency when a majority of nodes are brought back online.

### Consistency Example

For this example, we have 3 CockroachDB nodes (A, B, C) in a Multi-Active Availability cluster.

1. A receives a write on `abc` of `'123'`. It communicates this write to nodes B and C, who confirm that they've received the write, as well. Once node A receives the first confirmation, the change is committed.
2. Node A fails.
3. B receives a read of key `abc`, and returns the result `'123'`.
4. C then receives an update for key `abc` to the values `'456'`. It communicates this write to node B, who confirms that its received the write, as well. After receiving the confirmation, the change is committed.
5. Node A is restarted and rejoins the cluster (but cannot serve any queries until it's caught up). It receives an update that the key `abc` had its value changed to `'456'`.

{{site.data.alerts.callout_info}}In this example, if nodes B or C failed at any time, the cluster would have stopped responding. In terms of the CAP theorem, this is an CP system; it favored being consistent instead of available.{{site.data.alerts.end}}

### Reduced Hardware Costs

In addition to providing scalable consistency, Multi-Active Availability also reduces the amount of hardware your deployment requires.

While both Active-Passive and Active-Active require twice the hardware, CockroachDB only requires an additional 50% due to Multi-Active Availability. This is an emergent principle in the way that Multi-Active Availability maximizes the amount of your machine's computing power that's in use.

#### Machines Required by Availability Type

This table shows you the total number of machines you must have to achieve relative throughput for each type of availability.

Here we use an arbitrary unit we're calling **Effective Machine**. The aim here is to create an arbitrary unit of work––the CPU required to process 1,000 or 5,000 queries per second––and then show multipliers of that value. So 2.0 Effective Machines is simply twice the processing power of 1.0 Effective Machines.

The parenthetical value next to the Deployment Size represents (**Number of physical machines** @ **Effective Machine power**). For example, if you need 1.0 Effective Machines, Multi-Active availability requires 3 physical machines, but each physical machine only needs 0.5 times the power of the Effective Machine.

Availability Type | Effective Machines Required | Deployment Size in Effective Machines | Number of Faults Tolerated
------------------|------------------------|-------------------|----------------
<strong style="color:#46a8ff;">Active-Passive</strong> | 1.0 | 2.0 (2 @ 1x) | 1
<strong style="color:#46a8ff;">Active-Passive</strong> | 2.0 | 4.0 (2 @ 2x) | 1
<strong style="color:#46a8ff;">Active-Passive</strong> | 3.0 | 6.0 (2 @ 3x) | 1
<strong style="color:#82cc00;">Active-Active</strong> | 1.0 | 2.0 (2 @ 1x) | 1
<strong style="color:#82cc00;">Active-Active</strong> | 2.0 | 4.0 (4 @ 1x) | 2
<strong style="color:#82cc00;">Active-Active</strong> | 3.0 | 6.0 (6 @ 1x) | 3
**Multi-Active** | 1.0 | 1.5 (3 @ .5x) | 1
**Multi-Active** | 2.0 | 3.0 (3 @ 1x) | 1
**Multi-Active** | 3.0 | 4.5 (5 @ .9x) | 2

As you can see, in each instance, Multi-Active Availability requires the fewest number of Effective Machines in your deployment.

## Technical Details of Multi-Active Availability

To achieve Multi-Active Availability, CockroachDB was designed from the ground up to create a database that is both consistent, as well as survivable.

### Ranges

All data stored in CockroachDB is split up into ranges (64MB by default). In a distributed cluster of 3 or more nodes, each of these ranges is replicated onto at least 3 nodes. This way, if one node fails, two copies of the data still exist and can be used by your application.

### Raft Consensus Algorithm

To create consistency among the replicas of a range, each replica becomes a member of a "Raft group." These groups use the Raft consensus algorithm to ensure that a majority (or consensus) of nodes acknowledge that any changes have happened to the range.

Each of these changes is stored in a Raft log; this lets nodes who experience downtime but end up rejoining the cluster to be quickly caught back up.

### Symmetrical Nodes

Because of CockroachDB's strong consistency, each node in your deployment reliably sees the same data. This means that CockroachDB lets you send reads and writes to every node.

To achieve this, every node has the ability to act as a gateway for client RPCs. The gateway node then find the nodes responsible for the ranges and lets them handle the changes to the data through Raft. After the changes have been committed (i.e., acknowledged by a majority of the replicas), the response is sent to the gateway node, which then responds to the client.

## What's next?

With an understanding of CockroachDB's Multi-Active Availability model, go ahead and [install the `cockroach` binary](install-cockroachdb.html) or begin [exploring our core features](demo-data-replication.html).
