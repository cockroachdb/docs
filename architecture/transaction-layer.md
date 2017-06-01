---
title: Architecture&#58; Transaction Layer
summary: 
toc: false
---

The Transaction Layer of CockroachDB's architecture implements support for ACID transactions by coordinating concurrent operation's executions.

{{site.data.alerts.callout_info}}If you haven't already, we recommend reading the <a href="overview.html">Architecture Overivew</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Overview

Above all else, CockroachDB believes consistency is the most feature of a database––without it, developers cannot build reliable tools, and businesses suffer with potentially subtle and hard to detect anomalies.

To provide consistency, CockroachDB implements full support for ACID transaction semantics in the Transaction Layer. However, it's important to realize that *all* statements are handled as transactions, including single statements––this is sometimes referred to as "autocommit mode" because it behaves as if every statement is followed by a `COMMIT`.

For code samples of using transactions in CockroachDB, see our documentation on [transactions](https://www.cockroachlabs.com/docs/stable/transactions.html#sql-statements).

Because CockroachDB enables transactions that can span your entire cluster (including cross-range and cross-table transactions), it optimizes performance through a two-phase commit process.

### Writing & Checking Write Intents (Phase 1)

When the Transaction Layer executes write operations, it doesn't directly write values to disk. Instead, it creates two things that help it mediate a distributed transaction:

- A **Transaction Record** stored in the range where the first write occurs, which includes the transaction's current state (which starts as `PENDING`, and ends as either `COMMITTED` or `ABORTED`).

- **Write Intents** for all of a transaction’s writes, which represent a provisional, uncommitted state. These are essentially the same as standard [multi-version concurrency control (MVCC)](storage-layer.html#mvcc) values but also contain a pointer to the Transaction Record stored on the cluster.
	
As Write Intents are created, CockroachDB checks for existing Write Intents for the same keys. If it encounters any, what it does depends on the encountered Write Intent's Transaction Record:

- `COMMITTED`: Converts the Write Intent to a normal MVCC value by removing the pointer to the Transaction Record
- `ABORTED`: Deletes the Write Intent and proceeds
- `PENDING`: Resolves this as [Write/Write conflict]()

If transactions fail for other reasons, such as failing to pass a SQL constraint, the transaction is aborted.

### Reading & Committing the Transaction (Phase 2)

CockroachDB checks the running transaction's record to see if it's been `ABORTED`; if it has, it surfaces an error to the client.

If the transaction is not aborted, the Transaction Layer begins executing read operations. If a read only encounters standard MVCC values everything is fine. However, if it encounters any Write Intents, the operation must be resolved as a [Write/Read conflict]().

If the transaction passes these checks, it's moved to `COMMITTED` and responds with the transaction's success to the client. At this point, the client is free to begin sending more requests to the cluster.

### Cleanup (Asynchronous Phase 3)

After the transaction has been resolved, all of the Write Intents should either be converted to MVCC values or removed. To do this, the coordinating node––which kept a track of all of the keys it wrote––reaches out to the values and either:
- Converts their Write Intents to MVCC values by removing the element that points it to the transaction record 
- Deletes the Write Intents

This is simply an optimization, though. If operations in the future encounter Write Intents, they always check their transaction records––any operation can resolve or remove Write Intents by checking the transaction record's status.

### Interactions with Other Layers

In relationship to other layers in CockroachDB, the Transaction Layer:

- Receives KV operations from the SQL Layer.
- Controls the flow of KV operations sent to the Distribution Layer.

## Technical Details & Components

### Time & Hybrid Logical Clocks

In distributed systems, ordering and causality are difficult problems to solve. While it's possible to rely entirely on Raft consensus to maintain serializability, it would be inefficient for reading data. To optimize performance of reads, CockroachDB implements hybrid-logical clocks (HLC) which are composed of a physical component (thought of as and always close to local wall time) and a logical component (used to distinguish between events with the same physical component). This means that HLC time is always greater than or equal to the wall time. You can find more detail in the [HLC paper](http://www.cse.buffalo.edu/tech-reports/2014-04.pdf).

In terms of transactions, the gateway node picks a timestamp for the transaction using HLC time. Whenever a transaction's timestamp is mentioned, it's an HLC value. This timestamp is used to both track versions of values (through multiversion concurrency control, or [MVCC](storage-layer.html#mvcc)), which is detailed in the Storage Layer overview), as well as provide our transactional isolation guarantees.

When nodes send requests to other nodes, the sending node includes a timestamp generated by their local HLCs (which includes both physical and logical components). When nodes receive requests, they inform their local HLC of the timestamp supplied with the event by the sender. This is useful in guaranteeing that all data read/written on a node is at a timestamp less than the next HLC time.

This then lets the node primarily responsible for the range (i.e., the Lease Holder) serve reads for data it stores by ensuring the transaction reading the data is at an HLC time greater than the MVCC value it's reading (i.e., the read always happens "after" the write).

#### Max Clock Offset Enforcement

To ensure correctness among distributed nodes, you can identify a Maximum Clock Offset. Because CockroachDB relies on clock synchronization, nodes run a version of [Marzullo’s algorithm](http://infolab.stanford.edu/pub/cstr/reports/csl/tr/83/247/CSL-TR-83-247.pdf) amongst themselves to measure maximum clock offset within the cluster. If the configured maximum offset is exceeded by any node, it commits suicide, preventing it from potentially creating consistency issues within the cluster.

For more detail about the risks that large clock offsets can cause, see [What happens when node clocks are not properly synchronized?](operational-faqs.html#what-happens-when-node-clocks-are-not-properly-synchronized)

#### Timestamps & Serializability

HLC timestamps let us understand the sequence of state changes in the database. CockroachDB then uses this ordering to provide its isolation guarantees. Isolation, in this context, meaning the order in which keys and their values become accessible to other operations. By providing strict isolation levels, we aim to provide anomaly-free consistency to our users, which we refer to as "serializability"––the database's state is ordered in a strictly serialized way, clearly ordered by HLC timestamps.

For instance, if an operation finds a value with a timestamp in the future, it "understands" that its own timestamp must be moved forward to preserve serialized order in the database.

However, when timestamps are moved, it introduces anomalies into the database. This is an intuitive concept, that it violates the notion of strict serialiazability to reorder the state of your data's values.

In this document, you can find more about our [isolation levels]().

### Timestamp Cache

To provide provide serializability, whenever an operation reads a value, we store the operation's timestamp in a Timestamp Cache, which shows the high-water mark for values being read.

Whenever writes occur, their timestamps are checked against the TimestampCache to ensure its timestamp is greater than the Timestamp Cache (otherwise we would allow you to rewrite history, which produces anomalies). If the timestamp is less than, we attempt to move the timestamp to a time later timestamp than the cache.

### client.Txn and TxnCoordSender

As we mentioned in the SQL layer's architectural overview, CockroachDB converts all SQL statements into key-value (KV) operations, which is how data is ultimately stored and accessed. 

All of the KV operations generated from the SQL layer's use `client.Txn`, which is the transactional interface for the CockroachDB KV layer––but, as we discussed above, all statements are treated as transactions, so all statements use this interface.

However, `client.Txn` is actually just a wrapper around `TxnCoordSender`, which plays a crucial role in our code base by:

- Dealing with transactions' state. After a transaction is started, `TxnCoordSender` starts asynchronously sending heartbeat messages to that transaction's Transaction Record, which signal that it should be kept alive. If the `TxnCoordSender`'s heartbeating stops, the Transaction Record is moved to `ABORTED` status.
- Tracking each written key or key range over the course of the transaction. 
- Clearing the accumulated Write Intent for the transaction when it's committed or aborted. All requests being performed as part of a transaction have to go through the same `TxnCoordSender` to account for all of its Write Intents, which optimizes the cleanup process.

After setting up this bookkeeping, the request is passed to the `DistSender` in the Distribution Layer.

### Transaction Records

When a transaction starts, `TxnCoordSender` writes a Transaction Record to the range containing the first key modified in the transaction. As mentioned above, the Transaction Record provides the system with a source of truth about the status of a transaction.

The Transaction Record expresses one of the following dispositions of a transaction:

- `PENDING`: The initial status of all values, indicating that the transaction the Write Intent belongs to is in progress. Note that retried transactions remain in this status because we continue to increment the transaction's priority in an attempt to cause transaction's likelihood of succeeding to increase the longer they remain in the system.
- `COMMITTED`: Once a transaction has completed, this status indicates that the value can be read. Whenever this status is encountered, the transaction status attribute is removed, converting the value from a Write Intent to a standard MVCC value.
- `ABORTED`: If a transaction fails or is aborted by the client, it's moved into this state.

This record remains on the coordinating node until all of the Write Intents it's responsible for are converted to MVCC values.

The Transaction Record for committed transactions remain until all Write Intents are converted to MVCC values. For aborted transactions, the transaction record can be deleted at any time, which also means that CockroachDB treats missing transaction records as if they belong to aborted transactions.

### Write Intents

Values in CockroachDB are not directly written to the storage layer; instead everything is written in a provisional state known as a "Write Intent." These are essentially multi-version concurrency control values (also known as MVCC, which is explained in greater depth in the Storage Layer) with an additional value added to them which identifies the transaction record to which the value belongs.

Whenever an operation encounters a Write Intent (instead of an MVCC value), it looks up the status of the the transaction record to understand how it should treat the Write Intent value.

How CockroachDB treats Write Intent depends on the status of the Transaction Record to which they point:

- `PENDING`: Because the transaction is still in progress, the new operation contends with the Write Intent and tries to push its timestamp forward. If the timestamp can't be pushed, this operation enters the `PushTxnQueue`.
- `COMMITTED`: The operation reads the Write Intent and converts it to an MVCC value by removing its pointer to the Transaction Record.
- `ABORTED`: The Write Intent is ignored and deleted.

### Isolation Levels

Isolation is an element of [ACID transactions](https://en.wikipedia.org/wiki/ACID), which determines how concurrency is controlled, and ultimately guarantees consistency.

Because CockroachDB aims to provide a highly consistent database, it only offers two isolation levels:

- **Serializable Snapshot Isolation** (SSI) transactions are CockroachDB's default (equivalent to ANSI SQL's `SERIALIZABLE` isolation level, which is the highest of the four standard levels). This isolation level does not allow any anomalies in your data, which is largely enforced by refusing to move the transaction's timestamp, or by aborting the transaction if its timestamp is moved. This enforce strict serializability in your data.

- **Snapshot Isolation** (SI) transactions trade correctness for improvements in performance for high-contention work loads. It does this by allowing the transaction's timestamp to be moved during [Write/Read conflicts](), which allows an anomally called [write skew](https://en.wikipedia.org/wiki/Snapshot_isolation) to occur.

### Transaction Conflicts

CockroachDB's transactions allow the following types of conflicts:

- [Write/Write], where two `PENDING` transactions create Write Intents for the same key.
- [Write/Read], where a read operation encounters an unresolved Write Intent from a `PENDING` transaction.

#### Write/Write Conflicts

If a Write Intent encounters another Write Intent, there are three possible outcomes:

- If either transaction has an explicitly set priority, the transaction with the lower priority is aborted.
- If there is a deadlock (i.e., two transactions who are blocked on each other's Write Intents), one of the transactions is randomly aborted
- If neither of the cases above, the blocked transaction enters the `PushTxnQueue`, where it waits for the blocking transaction to complete.

#### Write/Read Conflicts

When a read encounters an existing Write Intent, it checks the Write Intent's Transaction Record. If the Transaction Record is `PENDING`, the operation attempts to "push" the transaction it encountered by increasing its timestamp. 

If the transaction succeeds in pushing or not depends on the Write Intent's transaction's isolation level and both transactions' priorities:

- In all cases pushes are allowed when a deadlock has been detected. A deadlock is a circular dependencies of transactions, e.g., `TxnA` depends on `TxnB`'s completion, and vice versa.
- Transactions with SSI isolation cannot have their time timestamps pushed by reads.
- HIGH priority transaction can push anything except another HIGH priority transaction.
- LOW priority transaction can be pushed by anything except another LOW priority transaction.
- In all other cases (e.g., SI isolation transactions without an explicit priority), CockroachDB randomly selects one of the transactions to push.

If the operation *cannot* push the Write Intent's transaction, it is placed in the `PushTxnQueue`, where it waits alongside any other transactions blocked by the same transaction. This happens, for example, to transactions who encounter an SSI isolation transaction's Write Intents.

### PushTxnQueue

The `PushTxnQueue` tracks all transactions that could not push a transaction whose writes they encountered, and must wait for the blocking transaction to complete before they can proceed. 

The `PushTxnQueue`'s structure is a map of blocking transaction IDs to those they're blocking. For example:

~~~
txn1 -> txnA, txnB
txn2 -> txnD, txnC, txnF
~~~

Importantly, all of this activity happens on a single node, which is the leader of the range's Raft group that contains the transaction record.

Once the transaction does resolve––by committing or aborting––a signal is sent to the `PushTxnQueue`, which lets all transactions that were blocked by the resolved transaction begin executing.

Blocked transactions also check the status of their own transaction to ensure they're still active. If the blocked transaction was aborted, it's simply removed.

## Technical Interactions with Other Layers

### Transaction & SQL Layer

The Transaction Layer receives KV operations from `planNodes` executed in the SQL Layer.

### Transaction & Distribution Layer

The `TxnCoordSender` sends its KV requests to `DistSender` in the Distribution Layer.

## What's Next?

Learn how CockroachDB presents a unified view of your cluster's data in the [Distribution Layer](distribution-layer.html).
