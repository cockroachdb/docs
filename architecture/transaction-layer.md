---
title: Transaction Layer
summary: 
toc: false
---

CockroachDB aims to provide transactions with the same kind of simplicity you would experience if you developed against a local MySQL instance, despite allowing massively distributed deployments.

<div id="toc"></div>

## Overview

To provide consistency, CockroachDB implements full support for ACID transaction semantics in the Transaction Layer.

However, it's important to realize that *all* statements are handled as transactions, including single statements––this is sometimes referred to as "autocommit mode" because it behaves as if every statement is followed by a `COMMIT`. If you want to treat multiple statements as a single atomic unit, you can use the SQL standard `BEGIN`/`COMMIT`/`ROLLBACK` syntax.

Transactional consistency is accomplished through a two-phase commit process.

### Writing & Checking Intents (Phase 1)

Instead of accessing values directly, CockroachDB instead handles access to MVCC values by writing two things:

- A **Transaction Record** stored in the range where the first write occurs. This record includes the transaction’s current state (starting as `PENDING`), as well as a randomly assigned priority, which will be used to handle some cases of contention with other transaction. Though it’s random, the client can influence the priority by explicitly setting it to `LOW` or `HIGH` when initiating the transaction.

- **Intents* for all of a transaction’s writes, which represent a provisional, uncommitted state. These are essentially the same as standard multi-version concurrency control (MVCC) values but also contain a special intent flag that points to the Transaction Record stored on the cluster. As long as the value exists as an intent, its values are treated as provisional.

   As intents are written, CockroachDB checks for existing intents for the same keys. If it encounters any, it checks its transaction record; if the transaction is `PENDING`, the transaction waits for the existing one to resolve; otherwise it resolves `COMMITTED` values or removes `ABORTED` ones.

If there is a deadlock, the transaction with the lowest priority has fails and returns a retryable error to the client.

If transactions fail for other reasons, such as failing to pass a SQL constraint, the transaction is also aborted.

### Committing Transaction (Phase 2)

CockroachDB checks if the transaction has been aborted; if it has, it surfaces an error to the client. If the transaction was aborted due to a deadlock with another transaction, it will generate a retryable error, meaning that the client should restart the transaction using updated values.

If the transaction is not aborted, CockroachDB then attempts to perform any read operations (e.g., `SELECT`). If the read only encounters standard MVCC values everything is fine. However, if it encounters any Write Intents, what happens next depends on the depends on the committing transaction’s isolation level. This setting is defined in the SQL statement, but is handled programmatically in the Transaction Layer.

- **Serializable Snapshot Isolation** (SSI) transactions are CockroachDB's default (equivalent to ANSI SQL's `SERIALIZABLE` isolation level, which is the highest of the four standard levels). If a read encounters Write Intents from an SSI transaction, it must wait for the transaction to complete.

- **Snapshot Isolation** (SI) transactions provide slightly weaker guarantees than SSI ones, allowing an anomaly called [write skew](https://en.wikipedia.org/wiki/Snapshot_isolation) to occur. In return, they perform better under certain kinds of contention. This is similar to the ANSI SQL `REPEATABLE READ` isolation level (but not exactly equivalent).
   
   If a read encounters an intent written by an SI transaction, it doesn't have to wait for the transaction to complete. Instead, it can "push" the writing transaction's timestamp forward, and allow the read to proceed. This improves performance of reads when read/write conflicts occur, but again, at the expense of allowing an anomaly into the data.

If the transaction passes these checks, it's moved to `COMMITTED` and respond with the transaction's success to the client.

### Cleanup (Asynchronous Phase 3)

After the transaction has been resolved, all of the Write Intents should be converted to MVCC values or removed. To do this, the coordinating node, which kept a track of all of the keys it wrote, reaches out to the values and converts their intents to MVCC values by removing the element that points it to the transaction record or––in the case of aborted transactions––removed entirely.

This is simply an optimization, though. If operations in the future encounter intents, they always check their transaction records––any operation can resolve or remove intents by checking the transaction record's status.

## Components

### Time & Hybrid Logical Clocks

In distributed systems, ordering and causality are difficult problems to solve. While it's possible to rely entirely on Raft consensus to maintain serializability, it would be inefficient for reading data. To optimize performance of reads, CockroachDB implements hybrid-logical clocks (HLC) which are composed of a physical component (thought of as and always close to local wall time) and a logical component (used to distinguish between events with the same physical component). This means that HLC time is always greater than or equal to the wall time. You can find more detail in the [HLC paper](http://www.cse.buffalo.edu/tech-reports/2014-04.pdf).

In terms of transactions, the gateway node picks a timestamp for the transaction using HLC time. Whenever a transaction's timestamp is mentioned, it's an HLC value. This timestamp is used to both track versions of values (through MVCC, which is detailed in the Storage Layer overview), as well as provide our transactional isolation guarantees.

When nodes send requests to other nodes, the sending node includes a timestamp generated by their local HLCs (which includes both physical and logical components). When nodes receive requests, they inform their local HLC of the timestamp supplied with the event by the sender. This is useful in guaranteeing that all data read/written on a node is at a timestamp < next HLC time.

This then lets the node primarily responsible for the range (i.e., the leaseholder) serve reads for data it stores by ensuring the transaction reading the data is at an HLC time greater than the MVCC value it's reading (i.e., the read always happens "after" the write).

#### Timestamp Cache

To provide provide serializability, whenever an operation reads a value, we store the operation's timestamp in a Timestamp Cache, which shows the high-water mark for values being read.

Whenever writes occur, their timestamps are checked against the TimestampCache to ensure its timestamp is greater than the Timestamp Cache (otherwise we would allow you to rewrite history, which produces anomalies). If the timestamp is less than, we attempt to bump it to a later timestamp than the cache.

#### Max Clock Offset Enforcement

To ensure correctness among distributed nodes, you can identify a Maximum Clock Offset. Because CockroachDB relies on clock synchronization, nodes run a version of [Marzullo’s algorithm](http://infolab.stanford.edu/pub/cstr/reports/csl/tr/83/247/CSL-TR-83-247.pdf) amongst themselves to measure maximum clock offset within the cluster. If the configured maximum offset is exceeded by any node, it commits suicide, preventing it from potentially creating consistency issues within the cluster.

### client.Txn and TxnCoordSender

As we mentioned in the SQL layer's architectural overview, CockroachDB converts all SQL statements into key-value (KV) operations, which is how data is ultimately stored and accessed. 

All of the KV operations generated from the SQL layer's parsing use `client.Txn`, which is the transactional interface for the CockroachDB KV layer––but, as we discussed above, all statements are transactions so everything ends up actually using this layer.

However, `client.Txn` is actually just a wrapper around `TxnCoordSender`, which is the first `client.Sender` for KV operations. TxnCoordSender plays a crucial role in our code base by:

- Dealing with transactions' state. After a transaction is started, the TxnCoordSender starts asynchronously sending heartbeat messages to that transaction's Transaction Records to keep it live. If the `TxnCoordSender`'s heartbeating stops, the Transaction Record is moved to `ABORTED` status.
- Tracking each written key or key range over the course of the transaction. 
- Clearing the accumulated write intents for the transaction when it's committed or aborted. All requests being performed as part of a transaction have to go through the same `TxnCoordSender` so that all write intents are accounted for and eventually cleaned up.

After setting up this bookkeeping, the request is passed to the `DistSender` in the Distribution Layer.

### Transaction Records

When a transaction starts, `TxnCoordSender` writes a Transaction Record to the range containing the first key modified in the transaction. As mentioned above, the Transaction Record provides the system with a source of truth about the status of a transaction.

The Transaction Record expresses one of the following dispositions of a transaction:

- `PENDING`: The initial status of all values, indicating that the transaction the write intent belongs to is in progress. Note that retried transactions remain in this status because we continue to increment the transaction's priority in an attempt to cause transaction's likelihood of succeeding to increase the longer they remain in the system.
- `COMMITTED`: Once a transaction has completed, this status indicates that the value can be read. Whenever this status is encountered, the transaction status attribute is removed, converting the value from a Write Intent to a standard MVCC value.
- `ABORTED`: If a transaction fails or is aborted by the client, it's moved into this state.

This record remains on the coordinating node until all of the intents it's responsible for are converted to MVCC values.

The Transaction Record for committed transactions remain until all intents are converted to MVCC values. For aborted transactions, the transaction record can be deleted at any time, which also means that CockroachDB treats missing transaction records as if they belong to aborted transactions.

### Write Intents

Values in CockroachDB are not directly written to the storage layer; instead everything is written in a provisional state known as a "write intent." These are essentially multi-version concurrency control values (also known as MVCC, which is explained in greater depth in the Storage Layer) with an additional value added to them which identifies the transaction record to which the value belongs.

Whenever an operation encounters a Write Intent (instead of an MVCC value), it looks up the status of the the transaction record to understand how it should treat the Write Intent value.

How CockroachDB treats Write Intents depends on the status of the Transaction Record to which they point:

- `PENDING`: Because the transaction is still in progress, the new operation contends with the Write Intent and tries to push its timestamp forward. If the timestamp can't be pushed, this operation enters the `PushTxnQueue`.
- `COMMITTED`: The operation reads the Write Intent and converts it to an MVCC value by removing its pointer to the Transaction Record.
- `ABORTED`: The Write Intent is ignored and deleted.

### PushTxnQueue

Whenever an operation encounters a Write Intent, it checks its Transaction Record. If the Transaction Record is `PENDING`, the operations attempts to "push" the transaction it encounters, which means it increases its timestamp. 

If it succeeds in doing this or not depends on the writing transaction's isolation level and both transactions' priorities:

- Writing transactions with SSI isolation cannot have their time timestamps pushed.
- HIGH priority transaction can push anything except another HIGH priority transaction
- LOW priority transaction can be pushed by anything except another LOW priority transaction
- In all other cases pushes are only allowed when a deadlock has been detected.

If the operation *cannot* push the transaction it encounters, it is placed in the `PushTxnQueue`, where it waits alongside any other transactions blocked by the same transaction.

The `PushTxnQueue`'s structure is a map of blocking transaction IDs to those they're blocking. For example:

~~~
txn1 -> txnA, txnB
txn2 -> txnD, txnC, txnF
~~~

Importantly, all of this activity happens on a single node, which is the leader of the range's Raft group where the transaction record is stored.

Once the transaction does resolve, a signal is sent to the `PushTxnQueue`, which lets all transactions that were blocked on it begin executing.

Waiting transactions also check the status of their own transaction to ensure they're still active. If the blocked transaction's been aborted, the operation simply removes itself.

## Interactions with Other Layers

Executing the query plan begins sending KV operations to the Transaction Layer.

In the Transaction Layer, the `TxnCoordSender` sends its KV requests to `DistSender` in the Distribution Layer.
