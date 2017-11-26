---
title: Transaction Layer
summary: 
toc: false
---

The Transaction Layer of CockroachDB's architecture implements support for ACID transactions by coordinating concurrent operations.

{{site.data.alerts.callout_info}}If you haven't already, we recommend reading the <a href="overview.html">Architecture Overivew</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Overview

Above all else, CockroachDB believes consistency is the most important feature of a database––without it, developers cannot build reliable tools, and businesses suffer from potentially subtle and hard-to-detect anomalies.

To provide consistency, CockroachDB implements full support for ACID transaction semantics in the Transaction Layer. However, it's important to realize that *all* statements are handled as transactions, including single statements––this is sometimes referred to as "autocommit mode" because it behaves as if every statement is followed by a `COMMIT`.

For code samples of using transactions in CockroachDB, see our documentation on [transactions](../transactions.html#sql-statements).

### Concurrency Control

CockroachDB's concurrency control system is designed to enable ACID transactions capable of spanning your entire cluster (including cross-range and cross-table transactions).

#### Transaction Record

Because transactions can occur across many nodes, CockroachDB uses a single Transaction Record per transaction to track its state, stored in the range where the first write occurs.

Transaction Records two elements:

- The transaction's current state (which starts as `PENDING`, and ends as either `COMMITTED` or `ABORTED`).
- A list of all writes related to the transaction (known as Write Intents).

It's also important to realize that this Transaction Record is also a KV entry, so it benefits from [replication](replication-layer.html), ultimately letting a transaction continue even if a node containing it fails. (Though if the Gateway node fails, the transaction will still fail.)

#### Writing

Instead of writing values directly to disk, CockroachDB creates **Write Intents**. These represent a provisional, uncommitted state, and are essentially the same as standard [multi-version concurrency control (MVCC)](storage-layer.html#mvcc) values but also contain a pointer to its parent Transaction Record.

Whenever creating Write Intents, CockroachDB also checks for:

- Newer MVCC values, in which case the transaction is restarted
- Other Write Intents for the same keys, which are resolved as a [transaction conflict](#transaction-conflicts)
- The last timestamp of the last read for the key; if it's higher than this transaction's timestamp, the transaction is restarted

At any time, operations can attempt to "[resolve](#resolving-write-intents)" Write Intents based on their Transaction Record's status. If the transaction's been `COMMITTED`, the Write Intent can be resolved to an MVCC value by simply removing the pointer to the Transaction Record.

#### Reading

Reads return the most-recent MVCC value with a timestamp less than its own; if that value is a Write Intent, the read must be resolved as a [transaction conflict](#transaction-conflicts).

Notably, reading older MVCC values also lets us offer [`AS OF SYSTEM TIME` support](https://www.cockroachlabs.com/blog/time-travel-queries-select-witty_subtitle-the_future/). The read operation is simply treated as if it occurred at the specified time, and it then returns the first MVCC value with a timestamp less than its own.

#### Commits

When the Transaction Layer processes the request to `COMMIT` the transaction, the coordinating node that received the SQL request proceeds through the following checks:

1. If the Transaction Record's status is `ABORTED`, the SQL Layer becomes aware of the issue and makes decisions from there, either restarting the transaction or notifying the client of the failure.

2. If any of the transaction's operations are in the [`PushTxnQueue`](#pushtxnqueue), the `COMMIT` is deferred until the operation's resolved.

3. If the Transaction Record's status is `PENDING`, it's moved to `COMMITTED` and the client receives an acknowledgment that the transaction succeeded. At this point, the client is free to begin sending more requests to the cluster.

#### Cleanup

After the transaction has been resolved, CockroachDB [resolves all Write Intents](#resolving-write-intents) listed in the Transaction Record.

This cleanup is simply an optimization, though. Whenever an operation encounters a Write Intent, it checks its Transaction Record; if it's in any status besides `PENDING`, the operation can perform the same resolution.

### Interactions with Other Layers

In relationship to other layers in CockroachDB, the Transaction Layer:

- Receives KV operations from the SQL Layer.
- Controls the flow of KV operations sent to the Distribution Layer.

## Technical Details & Components

### Gateway Node

When a client sends a transaction to the SQL API, it works as the gateway node for the entire transaction, performing a number of record-keeping tasks:

- Creating the Transaction Record on the first range the transaction operates on
- Choosing a timestamp for the entire transaction
- Using `TxnCoordSender` to maintain the transaction
- Responding to the client

Though CockroachDB is a distributed, highly available database, if a the gateway node dies during a transaction, the operation will error out and the client will have to re-send the transaction to the cluster.

### Time & Hybrid Logical Clocks

To help rationalize time in a distributed environment––which must account for discrepancies between multiple nodes' clocks––CockroachDB implements hybrid-logical clocks (HLC). These are composed of a physical component (thought of as and always close to local wall time) and a logical component (used to distinguish between events with the same physical component). For much greater detail, check out the [HLC paper](http://www.cse.buffalo.edu/tech-reports/2014-04.pdf).

When initiating a transaction, the Gateway Node chooses a timestamp for the entire transaction using HLC time (unless it's a read using `AS OF SYSTEM TIME`). Whenever a transaction's timestamp is mentioned, it's an HLC value. This timestamp is used to both track versions of values (through [multiversion concurrency control](storage-layer.html#mvcc), as well as provide our transactional isolation guarantees.

This timestamp is included for all operations, including those sent to other nodes. When nodes receive requests, they inform their local HLC of the request's timestamp, which enforces distributed consistency by guaranteeing that all data that is read or overwritten is at a timestamp less than the next HLC time (i.e. is "in the past").

CockroachDB leverages HLC timestamp ordering to optimize read performance, as well. Whenever the read's timestamp is greater than the MVCC value it's reading (i.e., the read always happens "after" the write), we don't need to achieve consensus––the write already did––and can let a specific single replica of the range (known as the [Leaseholder](replication-layer.html#leases)) serve the read operation.

#### Timestamp Cache

To provide serializability, whenever an operation reads a value, we store the operation's timestamp in a Timestamp Cache, which shows the high-water mark for values being read. However, to keep the Timestamp Cache accurate while optimizing performance, only one replica at a time––the [Leaseholder](replication-layer.html#leases)––manages reads and writes.

Whenever the Leaseholder receives a write operations, its timestamp is checked against the Timestamp Cache. If the timestamp is less than the Timestamp Cache's latest value, we attempt to move the timestamp for its transaction forward to a later time. In the case of serializable transactions, this causes them to restart when they attempt to `COMMIT`. However, this *is* allowed for snapshot transactions, and introduces the a [write skew](https://en.wikipedia.org/wiki/Snapshot_isolation) anomaly.

#### Max Clock Offset Enforcement

CockroachDB requires moderate levels of clock synchronization to preserve data consistency. To manage this, we configure a maximum clock offset, which defaults to 500ms but can be changed. To enforce this setting, nodes run a version of [Marzullo’s algorithm](http://infolab.stanford.edu/pub/cstr/reports/csl/tr/83/247/CSL-TR-83-247.pdf) amongst themselves to measure maximum clock offset within the cluster. If any node exceeds 80% of the maximum clock offset, **it crashes immediately**.

This avoids the risk of violating [serializable consistency](https://en.wikipedia.org/wiki/Serializability) and causing stale reads and write skews, but it's important to prevent clocks from drifting too far in the first place by running [NTP](http://www.ntp.org/) or other clock synchronization software on each node.

### client.Txn and TxnCoordSender

In the [SQL Layer](sql-layer.html), CockroachDB converts all SQL statements into key-value (KV) operations, which is how data is ultimately stored and accessed. 

All of the KV operations generated from the SQL layer use `client.Txn`, which is the transactional interface for the CockroachDB KV layer (as we discussed above, all statements are treated as transactions, so all statements use this interface).

However, `client.Txn` is actually just a wrapper around `TxnCoordSender`, which plays a crucial role in our code base by:

- Managing each transaction's state. Once a transaction is started, `TxnCoordSender` starts asynchronously sending heartbeat messages to that transaction's Transaction Record, which signals that it should be kept alive. If the `TxnCoordSender`'s heartbeating stops, the Transaction Record is moved to the `ABORTED` status.
- Tracking each Write Intent created over the course of the transaction. 
- Resolving the transaction's Write Intents once it's committed or aborted. All of the transaction's requests go through the Gateway Node's `TxnCoordSender` to account for all of its Write Intents to optimizes this cleanup process.

After setting up this bookkeeping, the request is passed to the `DistSender` in the Distribution Layer.

### Transaction Records

When a transaction starts, `TxnCoordSender` writes a Transaction Record to the range containing the first key modified in the transaction. As mentioned above, the Transaction Record provides the system with a source of truth about the status of a transaction.

The Transaction Record expresses one of the following dispositions of a transaction:

- `PENDING`: The initial status of all values, indicating that the Write Intent's transaction is still in progress.
- `COMMITTED`: Once a transaction has completed, this status indicates that the value can be read.
- `ABORTED`: If a transaction fails or is aborted by the client, it's moved into this state.

The Transaction Record for a committed transaction remains until all its Write Intents are converted to MVCC values. For an aborted transaction, the Transaction Record can be deleted at any time, which also means that CockroachDB treats missing Transaction Records as if they belong to aborted transactions.

Transaction Records are stored in the KV layer as normal MVCC values, which also means that they benefit from CockroachDB's replication and survivability. If a node containing a Transaction Record goes down, the transaction can continue. (However, if the Gateway Node dies, its `TxnCoordSender` stops heartbeating the Transaction Record, and its status is changed to `ABORTED`.)

### Write Intents

Writes in CockroachDB are initialized as Write Intents, denoting that the write is in a provisional, uncommitted state. These values are essentially MVCC values, but also contain a reference to its Transaction Record, allowing any operation to look up the write's status and attempt to "resolve" it.

#### Resolving Write Intents

When operations attempt to resolve Write Intents, the outcome depends on the status of its Transaction Record:

- `COMMITTED`: The operation reads the Write Intent and converts it to an MVCC value by removing the Write Intent's pointer to the Transaction Record.
- `ABORTED`: The Write Intent is ignored and deleted.
- `PENDING`: This signals there is a [transaction conflict](#transaction-conflicts), which must be resolved.

### Isolation Levels

Isolation is an element of [ACID transactions](https://en.wikipedia.org/wiki/ACID), which determines how concurrency is controlled, and ultimately guarantees consistency.

Because CockroachDB aims to provide a highly consistent database, it only offers two isolation levels:

- **Serializable Snapshot Isolation** _(Serializable)_ transactions are CockroachDB's default (equivalent to ANSI SQL's `SERIALIZABLE` isolation level, which is the highest of the four standard levels). This isolation level does not allow any anomalies in your data, which is largely enforced by refusing to move the transaction's timestamp, or by aborting the transaction if its timestamp is moved.

- **Snapshot Isolation** _(Snapshot)_ transactions trade correctness for improvements in performance for high-contention work loads. This is achieved by allowing the transaction's timestamp to be moved during [write-read transaction conflicts](#transaction-conflicts), which allows [write skew](https://en.wikipedia.org/wiki/Snapshot_isolation) to occur.

### Transaction Conflicts

CockroachDB's transactions allow the following types of conflicts:

- **Read/Write**, which occurs when a write discovers that its Timestamp is less than the most recent read (identified in the Timestamp Cache)
- **Write/Write**, where two `PENDING` transactions create Write Intents for the same key.
- **Write/Read**, when a read encounters an existing Write Intent with a timestamp less than its own.

#### Read/Write

In the case of Read/Write conflicts, the read has already occurred and cannot possibly be altered. To resolve this, CockroachDB moves the write transaction's timestamp forward, to make it greater than the value it received from the Timestamp Cache.

What this ultimately achieves depends on the transaction's isolation level:

- **Serializable** transactions restart whenever their timestamps are moved, so the transaction restarts once it tried to commit.
- **Snapshot** transactions can have their timestamp moved, but in doing so introduce the [write skew](https://en.wikipedia.org/wiki/Snapshot_isolation) anomaly.

#### Write/Write & Write/Read

Both Write/Write & Write/Read conflicts involve in-progress transactions and are handled similarly. To make this simpler to understand, we'll call the first transaction `TxnA` and the transaction that encounters its Write Intents `TxnB`.

CockroachDB proceeds through the following steps until the first of the following conditions is met:

1. If either transaction has an explicit priority set (i.e. `HIGH`, or `LOW`), the transaction with the lower priority has its Transaction Record's status changed to `ABORTED`.

2. `TxnB` tries to push `TxnA`'s timestamp forward.
    
    This succeeds only in the case that `TxnA` has snapshot isolation and `TxnB`'s operation is a read. In this case, the [write skew](https://en.wikipedia.org/wiki/Snapshot_isolation) anomaly occurs.

3. `TxnB` enters the `PushTxnQueue` to wait for `TxnA` to complete.

### PushTxnQueue

The `PushTxnQueue` tracks all transactions that could not push a transaction whose Write Intents they encountered, and must wait for the blocking transaction to complete before they can proceed. 

The `PushTxnQueue`'s structure is a map of blocking transaction IDs to those they're blocking. For example:

~~~
txnA -> txn1, txn2
txnB -> txn3, txn4, txn5
~~~

Importantly, all of this activity happens on a single node, which is the leader of the range's Raft group that contains the Transaction Record.

Once the transaction does resolve––by committing or aborting––a signal is sent to the `PushTxnQueue`, which lets all transactions that were blocked by the resolved transaction resume execution.

Blocked transactions also check the status of their own transaction periodically to ensure its still active. If the blocked transaction was aborted, it's simply removed.

If there is a deadlock between transactions (i.e., they're each blocked by each other's Write Intents), one of the transactions is randomly aborted.

## Technical Interactions with Other Layers

### Transaction & SQL Layer

The Transaction Layer receives KV operations from `planNodes` executed in the SQL Layer, and returns results and statuses.

### Transaction & Distribution Layer

The `TxnCoordSender` sends its KV requests to `DistSender` in the Distribution Layer, as well as receives its responses, which are ultimately passed back to the SQL Layer.

## What's Next?

Learn how CockroachDB presents a unified view of your cluster's data in the [Distribution Layer](distribution-layer.html).
