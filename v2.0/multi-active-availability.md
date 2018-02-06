---
title: Multi-Active Availability
summary: Learn about CockroachDB's high availability model, known as Multi-Active Availability.
toc: false
---

CockroachDB's availability model is described as "Multi-Active Availability." In essence, multi-active availability provides benefits similar to traditional notions of high availability, but also lets you read and write from every node in your cluster without generating any conflicts.

<div id="toc"></div>

## What is High Availability?

High availability lets an application continue running even if a system hosting one of its services fails. This is achieved by scaling the application's services horizontally, i.e., replicating the service across many machines or systems. If any one of them fails, the others can simply step in and perform the same service.

Before diving into the details of CockroachDB's multi-active availability, we'll review the two most common high availability designs: [Active-Passive](#active-passive) and [Active-Active](#active-active) systems.

### Active-Passive

In active-passive systems, all traffic is routed to a single, "active" replica. Changes to the replica's state are then copied to a backup "passive" replica, in an attempt to always mirror the active replica as closely as possible.

However, this design has downsides:

- If you use asynchronous replication, you cannot guarantee that any data is ever successfully replicated to passive followers––meaning you can easily lose data. Depending on your industry, this could have pretty dire consequences.
- If you use synchronous replication and any passive replicas fail, you have to either sacrifice availability for the entire application or risk inconsistencies.

### Active-Active

In active-active systems, multiple replicas run identical services, and traffic is routed to all of them. If any replica fails, the others simply handle the traffic that would've been routed to it.

For databases, though, active-active replication is incredibly difficult to instrument for most workloads. For example, if you let multiple replicas handle writes for the same keys, how do you keep them consistent?

#### Example: Conflicts with Active-Active Replication

For this example, we have 2 replicas (**A**, **B**) in an active-active high availability cluster.

1. **A** receives a write for key `xyz` of `'123'`, and then immediately fails.
2. **B** receives a read of key `xyz`, and returns a `NULL` because it cannot find the key.
3. **B** then receives a write for key `xyz` of `'456'`.
4. **A** is restarted and attempts to rejoin **B**––but what do you about key `xyz`? There's an inconsistency in the system without a clear way to resolve it.

{{site.data.alerts.callout_info}}In this example, the cluster remained active the entire time. But in terms of the <a href="https://en.wikipedia.org/wiki/CAP_theorem">CAP theorem</a>, this is an AP system; it favored being available instead of consistent when partitions occur.{{site.data.alerts.end}}

## What is Multi-Active Availability?

Multi-active availability is CockroachDB's version of high availability (keeping your application online in the face of partial failures), which we've designed to avoid the downsides of both active-passive and traditional active-active systems.

Like active-active designs, all replicas can handle traffic, including both reads and writes. However, CockroachDB improves upon that design by also ensuring that data remains consistent across them, which we achieve by using "consensus replication." In this design, replication requests are sent to at least 3 replicas, and are only considered committed when a majority of replicas acknowledge that they've received it. This means that you can still have failures without compromising availability.

To prevent conflicts and guarantee your data's consistency, clusters that lose a majority of replicas stop responding because they've lost the ability to reach a consensus on the state of your data. When a majority of replicas are restarted, your database resumes operation.

### Consistency Example

For this example, we have 3 CockroachDB nodes (**A**, **B**, **C**) in a multi-active availability cluster.

1. **A** receives a write on `xyz` of `'123'`. It communicates this write to nodes **B** and **C**, who confirm that they've received the write, as well. Once **A** receives the first confirmation, the change is committed.
2. **A** fails.
3. **B** receives a read of key `xyz`, and returns the result `'123'`.
4. **C** then receives an update for key `xyz` to the values `'456'`. It communicates this write to node **B**, who confirms that its received the write, as well. After receiving the confirmation, the change is committed.
5. **A** is restarted and rejoins the cluster. It receives an update that the key `xyz` had its value changed to `'456'`.

{{site.data.alerts.callout_info}}In this example, if nodes <strong>B</strong> or <strong>C</strong> failed at any time, the cluster would have stopped responding. In terms of the <a href="https://en.wikipedia.org/wiki/CAP_theorem">CAP theorem</a>, this is an CP system; it favored being consistent instead of available when partitions occur.{{site.data.alerts.end}}

## What's next?

To get a greater understanding of how CockroachDB is a survivable system that enforces strong consistency, check out our [architecture documentation](/architecture/overview.html).

To see Multi-Active Availability in action, see this [availability demo](demo-fault-tolerance-and-recovery.html).
