---
title: Transaction Layer
summary: The transaction layer of CockroachDB's architecture implements support for ACID transactions by coordinating concurrent operations.
toc: true
---

The Transaction Layer of CockroachDB's architecture implements support for ACID transactions by coordinating concurrent operations.

{{site.data.alerts.callout_info}}If you haven't already, we recommend reading the <a href="overview.html">Architecture Overview</a>.{{site.data.alerts.end}}

## Overview

Above all else, CockroachDB believes consistency is the most important feature of a database––without it, developers cannot build reliable tools, and businesses suffer from potentially subtle and hard to detect anomalies.

To provide consistency, CockroachDB implements full support for ACID transaction semantics in the Transaction Layer. However, it's important to realize that *all* statements are handled as transactions, including single statements––this is sometimes referred to as "autocommit mode" because it behaves as if every statement is followed by a `COMMIT`.

For code samples of using transactions in CockroachDB, see our documentation on [transactions](../transactions.html#sql-statements).

Because CockroachDB enables transactions that can span your entire cluster (including cross-range and cross-table transactions), it optimizes correctness through a two-phase transaction protocol with asynchronous cleanup.

### Writes & Reads (Phase 1)

#### Writing

When the Transaction Layer executes write operations, it doesn't directly write values to disk. Instead, it creates two things that help it mediate a distributed transaction:

- A **Transaction Record** stored in the range where the first write occurs, which includes the transaction's current state (which starts as `PENDING`, and ends as either `COMMITTED` or `ABORTED`).

- **Write Intents** for all of a transaction’s writes, which represent a provisional, uncommitted state. These are essentially the same as standard [multi-version concurrency control (MVCC)](storage-layer.html#mvcc) values but also contain a pointer to the Transaction Record stored on the cluster.

As write intents are created, CockroachDB checks for newer committed values. If newer committed values exist, the transaction may be restarted. If existing write intents for the same keys exist, it is resolved as a [transaction conflict](#transaction-conflicts).

If transactions fail for other reasons, such as failing to pass a SQL constraint, the transaction is aborted.

#### Reading

If the transaction has not been aborted, the Transaction Layer begins executing read operations. If a read only encounters standard MVCC values, everything is fine. However, if it encounters any Write Intents, the operation must be resolved as a [transaction conflict](#transaction-conflicts).

### Commits (Phase 2)

CockroachDB checks the running transaction's record to see if it's been `ABORTED`; if it has, it restarts the transaction.

If the transaction passes these checks, it's moved to `COMMITTED` and responds with the transaction's success to the client. At this point, the client is free to begin sending more requests to the cluster.

### Cleanup (Asynchronous Phase 3)

After the transaction has been resolved, all of the Write Intents should resolved. To do this, the coordinating node––which kept a track of all of the keys it wrote––reaches out to the values and either:

- Resolves their Write Intents to MVCC values by removing the element that points it to the Transaction Record.
- Deletes the Write Intents.

This is simply an optimization, though. If operations in the future encounter Write Intents, they always check their Transaction Records––any operation can resolve or remove Write Intents by checking the Transaction Record's status.

### Interactions with Other Layers

In relationship to other layers in CockroachDB, the Transaction Layer:

- Receives KV operations from the SQL Layer.
- Controls the flow of KV operations sent to the Distribution Layer.

## Technical Details & Components

### Time & Hybrid Logical Clocks

In distributed systems, ordering and causality are difficult problems to solve. While it's possible to rely entirely on Raft consensus to maintain serializability, it would be inefficient for reading data. To optimize performance of reads, CockroachDB implements hybrid-logical clocks (HLC) which are composed of a physical component (always close to local wall time) and a logical component (used to distinguish between events with the same physical component). This means that HLC time is always greater than or equal to the wall time. You can find more detail in the [HLC paper](http://www.cse.buffalo.edu/tech-reports/2014-04.pdf).

In terms of transactions, the gateway node picks a timestamp for the transaction using HLC time. Whenever a transaction's timestamp is mentioned, it's an HLC value. This timestamp is used to both track versions of values (through [multiversion concurrency control](storage-layer.html#mvcc)), as well as provide our transactional isolation guarantees.

When nodes send requests to other nodes, they include the timestamp generated by their local HLCs (which includes both physical and logical components). When nodes receive requests, they inform their local HLC of the timestamp supplied with the event by the sender. This is useful in guaranteeing that all data read/written on a node is at a timestamp less than the next HLC time.

This then lets the node primarily responsible for the range (i.e., the Leaseholder) serve reads for data it stores by ensuring the transaction reading the data is at an HLC time greater than the MVCC value it's reading (i.e., the read always happens "after" the write).

#### Max Clock Offset Enforcement

CockroachDB requires moderate levels of clock synchronization to preserve data consistency. For this reason, when a node detects that its clock is out of sync with at least half of the other nodes in the cluster by 80% of the maximum offset allowed (500ms by default), **it crashes immediately**.

While [serializable consistency](https://en.wikipedia.org/wiki/Serializability) is maintained regardless of clock skew, skew outside the configured clock offset bounds can result in violations of single-key linearizability between causally dependent transactions. It's therefore important to prevent clocks from drifting too far by running [NTP](http://www.ntp.org/) or other clock synchronization software on each node.

For more detail about the risks that large clock offsets can cause, see [What happens when node clocks are not properly synchronized?](../operational-faqs.html#what-happens-when-node-clocks-are-not-properly-synchronized)

### Timestamp Cache

To provide serializability, whenever an operation reads a value, we store the operation's timestamp in a timestamp cache, which shows the high-water mark for values being read.

Whenever a write occurs, its timestamp is checked against the timestamp cache. If the timestamp is less than the timestamp cache's latest value, we attempt to push the timestamp for its transaction forward to a later time. In the case of serializable transactions, this might cause them to restart in the second phase of the transaction (see [read refreshing](#read-refreshing)).

### client.Txn and TxnCoordSender

As we mentioned in the SQL layer's architectural overview, CockroachDB converts all SQL statements into key-value (KV) operations, which is how data is ultimately stored and accessed.

All of the KV operations generated from the SQL layer use `client.Txn`, which is the transactional interface for the CockroachDB KV layer––but, as we discussed above, all statements are treated as transactions, so all statements use this interface.

However, `client.Txn` is actually just a wrapper around `TxnCoordSender`, which plays a crucial role in our code base by:

- Dealing with transactions' state. After a transaction is started, `TxnCoordSender` starts asynchronously sending heartbeat messages to that transaction's Transaction Record, which signals that it should be kept alive. If the `TxnCoordSender`'s heartbeating stops, the Transaction Record is moved to the `ABORTED` status.
- Tracking each written key or key range over the course of the transaction.
- Clearing the accumulated Write Intent for the transaction when it's committed or aborted. All requests being performed as part of a transaction have to go through the same `TxnCoordSender` to account for all of its Write Intents, which optimizes the cleanup process.

After setting up this bookkeeping, the request is passed to the `DistSender` in the Distribution Layer.

### Transaction Records

When a transaction starts, `TxnCoordSender` writes a Transaction Record to the range containing the first key modified in the transaction. As mentioned above, the Transaction Record provides the system with a source of truth about the status of a transaction.

The Transaction Record expresses one of the following dispositions of a transaction:

- `PENDING`: The initial status of all values, indicating that the Write Intent's transaction is still in progress.
- `COMMITTED`: Once a transaction has completed, this status indicates that the value can be read.
- `ABORTED`: If a transaction fails or is aborted by the client, it's moved into this state.

The Transaction Record for a committed transaction remains until all its Write Intents are converted to MVCC values. For an aborted transaction, the Transaction Record can be deleted at any time, which also means that CockroachDB treats missing Transaction Records as if they belong to aborted transactions.

### Write Intents

Values in CockroachDB are not directly written to the storage layer; instead everything is written in a provisional state known as a "Write Intent." These are essentially multi-version concurrency control values (also known as MVCC, which is explained in greater depth in the Storage Layer) with an additional value added to them which identifies the Transaction Record to which the value belongs.

Whenever an operation encounters a Write Intent (instead of an MVCC value), it looks up the status of the Transaction Record to understand how it should treat the Write Intent value.

#### Resolving Write Intent

Whenever an operation encounters a Write Intent for a key, it attempts to "resolve" it, the result of which depends on the Write Intent's Transaction Record:

- `COMMITTED`: The operation reads the Write Intent and converts it to an MVCC value by removing the Write Intent's pointer to the Transaction Record.
- `ABORTED`: The Write Intent is ignored and deleted.
- `PENDING`: This signals there is a [transaction conflict](#transaction-conflicts), which must be resolved.

### Isolation Levels

Isolation is an element of [ACID transactions](https://en.wikipedia.org/wiki/ACID), which determines how concurrency is controlled, and ultimately guarantees consistency.

CockroachDB efficiently supports the strongest ANSI transaction isolation level: `SERIALIZABLE`. All other ANSI transaction isolaton levels (e.g., `READ UNCOMMITTED`, `READ COMMITTED`, and `REPEATABLE READ`) are automatically upgraded to `SERIALIZABLE`. Weaker isolation levels have historically been used to maximize transaction throughput. However, [recent research](http://www.bailis.org/papers/acidrain-sigmod2017.pdf) has demonstrated that the use of weak isolation levels results in substantial vulnerability to concurrency-based attacks. CockroachDB continues to support an additional non-ANSI isolation level, `SNAPSHOT`, although it is deprecated. Clients can explicitly set a transaction's isolation when starting the transaction:

- **Serializable Snapshot Isolation** _(Serializable)_ transactions are CockroachDB's default (equivalent to ANSI SQL's `SERIALIZABLE` isolation level, which is the highest of the four standard levels). This isolation level does not allow any anomalies in your data, and is enforced by requiring the client to retry transactions if serializability violations are possible.

- **Snapshot Isolation** _(Snapshot)_ transactions trade correctness in order to avoid retries when serializability violations are possible. This is achieved by always reading at an initial transaction timestamp, but allowing the transaction's commit timestamp to be pushed forward in the event of [transaction conflicts](#transaction-conflicts). Snapshot isolation cannot prevent an anomaly known as [write skew](https://en.wikipedia.org/wiki/Snapshot_isolation).

### Transaction Conflicts

CockroachDB's transactions allow the following types of conflicts that involve running into an intent:

- **Write/Write**, where two `PENDING` transactions create Write Intents for the same key.
- **Write/Read**, when a read encounters an existing Write Intent with a timestamp less than its own.

To make this simpler to understand, we'll call the first transaction `TxnA` and the transaction that encounters its Write Intents `TxnB`.

CockroachDB proceeds through the following steps until one of the transactions is aborted, has its timestamp pushed, or enters the `TxnWaitQueue`.

1. If the transaction has an explicit priority set (i.e., `HIGH`, or `LOW`), the transaction with the lower priority is aborted (in the writer/write case) or has its timestamp pushed (in the write/read case).

2. `TxnB` tries to push `TxnA`'s timestamp forward.

    This succeeds only in the case that `TxnA` has snapshot isolation and `TxnB`'s operation is a read. In this case, the [write skew](https://en.wikipedia.org/wiki/Snapshot_isolation) anomaly occurs.

3. `TxnB` enters the `TxnWaitQueue` to wait for `TxnA` to complete.

Additionally, the following types of conflicts that do not involve running into intents can arise:

- **Write after read**, when a write with a lower timestamp encounters a later read. This is handled through the [Timestamp Cache](#timestamp-cache).
- **Read within uncertainty window**, when a read encounters a value with a higher timestamp but it's ambiguous whether the value should be considered to be in the future or in the past of the transaction because of possible *clock skew*. This is handled by attempting to push the transaction's timestamp beyond the uncertain value (see [read refreshing](#read-refreshing)). Note that, if the transaction has to be retried, reads will never encounter uncertainty issues on any node which was previously visited, and that there's never any uncertainty on values read from the transaction's gateway node.

### TxnWaitQueue

The `TxnWaitQueue` tracks all transactions that could not push a transaction whose writes they encountered, and must wait for the blocking transaction to complete before they can proceed.

The `TxnWaitQueue`'s structure is a map of blocking transaction IDs to those they're blocking. For example:

~~~
txnA -> txn1, txn2
txnB -> txn3, txn4, txn5
~~~

Importantly, all of this activity happens on a single node, which is the leader of the range's Raft group that contains the Transaction Record.

Once the transaction does resolve––by committing or aborting––a signal is sent to the `TxnWaitQueue`, which lets all transactions that were blocked by the resolved transaction begin executing.

Blocked transactions also check the status of their own transaction to ensure they're still active. If the blocked transaction was aborted, it's simply removed.

If there is a deadlock between transactions (i.e., they're each blocked by each other's Write Intents), one of the transactions is randomly aborted. In the above example, this would happen if `TxnA` blocked `TxnB` on `key1` and `TxnB` blocked `TxnA` on `key2`.

### Read refreshing

Whenever a transaction's timestamp has been pushed, additional checks are required before allowing serializable transactions to commit at the pushed timestamp: any values which the transaction previously read must be checked to verify that no writes have subsequently occurred between the original transaction timestamp and the pushed transaction timestamp. This check prevents serializability violation. The check is done by keeping track of all the reads using a dedicated `RefreshRequest`. If this succeeds, the transaction is allowed to commit (transactions perform this check at commit time if they've been pushed by a different transaction or by the timestamp cache, or they perform the check whenever they encounter a `ReadWithinUncertaintyIntervalError` immediately, before continuing).
If the refreshing is unsuccessful, then the transaction must be retried at the pushed timestamp.

## Technical Interactions with Other Layers

### Transaction & SQL Layer

The Transaction Layer receives KV operations from `planNodes` executed in the SQL Layer.

### Transaction & Distribution Layer

The `TxnCoordSender` sends its KV requests to `DistSender` in the Distribution Layer.

## What's Next?

Learn how CockroachDB presents a unified view of your cluster's data in the [Distribution Layer](distribution-layer.html).
