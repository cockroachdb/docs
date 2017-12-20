---
title: Multi-Active Availability
summary: Learn about CockroachDB's high availability model, known as Multi-Active Availability
toc: false
---

CockroachDB's availability model is described as "Multi-Active Availability." In essence, Multi-Active Availability is like traditional notions of high availability, but lets you read and write from every node in your cluster without generating any conflicts.

<div id="toc"></div>

## What is High Availability?

High availability lets an application continue running even if a system hosting one of its services fails. This is achieved by scaling the application's services horizontally, i.e., replicating the service across many machines or system. If any one of them fails, the others can simply step in and perform the same service.

Before diving into the details of CockroachDB's Multi-Active Availability, we'll review the two most common high availability designs: [Active-Passive](#active-passive) and [Active-Active](#active-active) systems.

### Active-Passive

In Active-Passive systems, all traffic is routed to a single, "active" system. Changes to the system's state are then replicated to a backup "passive" system, in an attempt to always mirror the active system as closely as possible.

However, if this replication is done asynchronously, failovers will lose data that haven't made their way to the passive system. Depending on your industry, this could have pretty dire consequences.

### Active-Active

In Active-Active systems, multiple systems run identical services, and traffic is routed to all of them. If any system fails, the others simply handle the traffic that would've been routed to the downed system.

For databases, though, this runs into a more fundamental problem: if multiple machines accept writes, how do you keep data consistent?

#### Example: Conflicts with Active-Active Replication

For this example, we have 2 nodes (**A**, **B**) in an Active-Active High Availability cluster.

For example, if we have two Active-Active nodes **A** and **B**.

1. **A** receives a write for key `xyz` of `'123'`, and then immediately fails.
2. **B** receives a read of key `xyz`, and returns a `NULL` because it cannot find the key.
3. **B** then receives a write for key `xyz` of `'456'`.
4. **A** is restarted and attempts to rejoin **B**––but what do you about key `xyz`? There's an inconsistency in the system without a clear way to resolve it.

{{site.data.alerts.callout_info}}In this example, the cluster remained active the entire time. But in terms of the CAP theorem, this is an AP system; it favored being available instead of consistent.{{site.data.alerts.end}}

## What is Multi-Active Availability?

Multi-Active Availability provides all of the benefits of high availability (keeping your application online in the face of partial failures), while avoiding the downsides of both Active-Passive and traditional Active-Active systems.

Like Active-Active designs, all nodes handle traffic, including both reads and writes. However, CockroachDB improves upon that design by also ensuring that data remains consistent across them, which we achieve by using "consensus replication." In this design, replication requests are sent to at least 3 nodes, and is only considered comitted when a majority of them acknowledge that they've received it.

To prevent conflicts and preserve your data's consistency, if your cluster loses a majority of the nodes responsible for a set of data, it can no longer reach consensus and stops responding. When a quorum of nodes come back online, your database resumes operation.

### Consistency Example

For this example, we have 3 CockroachDB nodes (**A**, **B**, **C**) in a Multi-Active Availability cluster.

1. **A** receives a write on `xyz` of `'123'`. It communicates this write to nodes **B** and **C**, who confirm that they've received the write, as well. Once **A** receives the first confirmation, the change is committed.
2. **A** fails.
3. **B** receives a read of key `xyz`, and returns the result `'123'`.
4. **C** then receives an update for key `xyz` to the values `'456'`. It communicates this write to node **B**, who confirms that its received the write, as well. After receiving the confirmation, the change is committed.
5. **A** is restarted and rejoins the cluster. It receives an update that the key `xyz` had its value changed to `'456'`.

{{site.data.alerts.callout_info}}In this example, if nodes <strong>B</strong> or <strong>C</strong> failed at any time, the cluster would have stopped responding. In terms of the CAP theorem, this is an CP system; it favored being consistent instead of available.{{site.data.alerts.end}}

## What's next?

To get a greater understanding of how CockroachDB is a survivable system that enforces strong consistency, check out our [architecture documentation](/architecture).

To see Multi-Active Availability in action, see this [availability demo](demo-fault-tolerance-and-recovery.html).
