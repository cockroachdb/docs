---
title: Multi-Active Availability
summary: Learn about CockroachDB's high availability model, known as Multi-Active Availability
toc: false
---

CockroachDB's availability model is described as "Multi-Active Availability." In essence, Multi-Active Availability is like traditional notions of high availability, but lets you read and write from every node in your cluster without generating any conflicts. 

<div id="toc"></div>

## What is High Availability?

High availability is a common feature that lets an application continue running even if a machine hosting one of its services fails. This is achieved by scaling the application's services horizontally, i.e., running the same service on many machines. If any one of the machines fails, the other machines in your deployment can simply perform the same tasks that the downed machine was.

Before diving into the details of CockroachDB's multi-active availability, we'll review the two most common high availability designs, Active-Passive and Active-Active systems.

### Active-Passive

In Active-Passive systems, all traffic is routed to an "active" machine. Any kind of stateful changes made to the machine are then duplicated to a backup "passive" machine. If the active machine fails, traffic is then routed to the passive machine which can more or less pick up where the active machine left off.

This design has some significant drawbacks, though:

- Because you must adequately prepare for failover, your passive machines must provide production-level capacity, but remain inert the majority of the time––so you pay for hardware that you know you won't use to its full capacity.
- For stateful services, such as databases, you run the risk of losing data during failover. When the active machine fails, any data written or changed on it that wasn't yet duplicated is lost. Depending on your industry, this could have pretty dire consequences.

### Active-Active Systems

In Active-Active systems, multiple machines run identical services and, in the case one fails, the other machines running the same service can handle the traffic.

While this design puts the hardware you're paying for to better use, it doesn't solve the problem of losing data when machines fail. For databases, this is a particularly pressing problem to solve because of its inherently stateful nature, which greatly benefits from consistency across every machine running the database.

#### Example: Conflicts with Active-Active Replication

For this example, we have 2 nodes (A, B) in an Active-Active High Availability cluster.

For example, if we have two Active-Active nodes A and B.

1. A receives a write for key `abc` of `'123'`, and then immediately fails.
2. B receives a read of key `abc`, and returns a `NULL` because it cannot find the key.
3. B then receives a write for key `abc` of `'456'`.
4. Node A is restarted and attempts to rejoin Node B––but what do you about key `abc`?

{{site.data.alerts.callout_info}}In this example, the cluster remained active the entire time. But in terms of the CAP theorem, this is an AP system; it favored being available instead of consistent.{{site.data.alerts.end}}

## What is Multi-Active Availability?

Multi-Active Availability provides all of the benefits of high availability (remaining live despite individual machine failures), while overcoming some of the difficulties or downsides of both Active-Passive and traditional Active-Active systems.

Like Active-Active designs, traffic is routed to all nodes. However, CockroachDB improves upon that design by also ensuring that data remains consistent across your entire cluster; as long as a majority of your machines remain active, you don't run the risk of compromising your data's integrity.

However, if the cluster loses a majority of the nodes responsible for a set of data, it stops responding as a means of preserving consistency when a majority of nodes are brought back online.

#### Example: Conflict Prevention with MAA

For this example, we have 3 CockroachDB nodes (A, B, C) in a Multi-Active Availability cluster.

1. A receives a write on `abc` of `'123'`. It communicates this write to nodes B and C, who confirm that they've received the write, as well. Once node A receives the first confirmation, the change is committed.
2. Node A fails.
3. B receives a read of key `abc`, and returns the result `'123'`.
4. C then receives an update for key `abc` to the values `'456'`. It communicates this write to node B, who confirms that its received the write, as well. After receiving the confirmation, the change is committed.
5. Node A is restarted and rejoins the cluster. It receives an update that the key `abc` had its value changed to `'456'`.

{{site.data.alerts.callout_info}}In this example, if nodes B or C failed at any time, the cluster would have stopped responding. In terms of the CAP theorem, this is an CP system; it favored being consistent instead of available.{{site.data.alerts.end}}

## Technical Details of Multi-Active Availability

To achieve Multi-Active Availability, CockroachDB was designed from the ground up to create a database that is both consistent, as well as survivable.

### Ranges

All data stored in CockroachDB is split up into ranges (64MB by default). In a distributed cluster of 3 or more nodes, each of these ranges is replicated onto at least 3 nodes. This way, if one node fails, two copies of the data still exist and can be used by your application.

### Raft Consensus Algorithm

To create consistency among replicated ranges (also known as replicas), each replica becomes a member of a "Raft group." These groups use the Raft consensus algorithm to ensure that a majority (or consensus) of nodes acknowledge that any changes have happened to the range.

Each of these changes is stored in a Raft log; this lets nodes who experience downtime but end up rejoining the cluster to be quickly caught back up.

### Symmetrical Nodes

Because of CockroachDB's strong consistency, each node in your deployment reliably sees the same data. This means that CockroachDB was able to be designed to allow reads and writes from every node in the cluster, even when other nodes in the cluster are down.

To achieve this, every node can act as a gateway for client RPCs. The gateway node then find the nodes responsible for the ranges and lets them handle the changes to the data throguh Raft. After the changes have been committed (i.e., acknowledged by a majority of the replicas), the gateway node responds to the client.

### Gossip

Each node continually shares its status with other nodes, including details like its available storage space. When there are uneven distributions of data, CockroachDB can intelligently rebalance data onto nodes with available space.

This mechanism is particularly useful when a node fails for an extended period of time and is considered dead. Gossip can help identify new nodes to receive replicas of the ranges the downed node was responsible for.

## What's next?

With an understanding of CockroachDB's Multi-Active Availability model, go ahead and [install the `cockroach` binary](install-cockroachdb.html) or begin [exploring our core features](demo-data-replication.html).
