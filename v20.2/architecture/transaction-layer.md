---
title: Transaction Layer
summary: The transaction layer of CockroachDB's architecture implements support for ACID transactions by coordinating concurrent operations.
toc: true
---

The transaction layer of CockroachDB's architecture implements support for ACID transactions by coordinating concurrent operations.

{{site.data.alerts.callout_info}}
If you haven't already, we recommend reading the [Architecture Overview](overview.html).
{{site.data.alerts.end}}

## Overview

Above all else, CockroachDB believes consistency is the most important feature of a database––without it, developers cannot build reliable tools, and businesses suffer from potentially subtle and hard to detect anomalies.

To provide consistency, CockroachDB implements full support for ACID transaction semantics in the transaction layer. However, it's important to realize that *all* statements are handled as transactions, including single statements––this is sometimes referred to as "autocommit mode" because it behaves as if every statement is followed by a `COMMIT`.

For code samples of using transactions in CockroachDB, see our documentation on [transactions](../transactions.html#sql-statements).

Because CockroachDB enables transactions that can span your entire cluster (including cross-range and cross-table transactions), it achieves correctness using a distributed, atomic commit protocol called [Parallel Commits](#parallel-commits).

### Writes and reads (phase 1)

#### Writing

When the transaction layer executes write operations, it doesn't directly write values to disk. Instead, it creates several things that help it mediate a distributed transaction:

- **Locks** for all of a transaction’s writes, which represent a provisional, uncommitted state. CockroachDB has several different types of locking:

  - **Unreplicated Locks** are stored in an in-memory, per-node lock table by the [concurrency control](#concurrency-control) machinery. These locks are not replicated via [Raft](replication-layer.html#raft).

  - **Replicated Locks** (also known as [write intents](#write-intents)) are replicated via [Raft](replication-layer.html#raft), and act as a combination of a provisional value and an exclusive lock. They are essentially the same as standard [multi-version concurrency control (MVCC)](storage-layer.html#mvcc) values but also contain a pointer to the [transaction record](#transaction-records) stored on the cluster.

- A **transaction record** stored in the range where the first write occurs, which includes the transaction's current state (which is either `PENDING`, `STAGING`, `COMMITTED`, or `ABORTED`).

As write intents are created, CockroachDB checks for newer committed values. If newer committed values exist, the transaction may be restarted. If existing write intents for the same keys exist, it is resolved as a [transaction conflict](#transaction-conflicts).

If transactions fail for other reasons, such as failing to pass a SQL constraint, the transaction is aborted.

#### Reading

If the transaction has not been aborted, the transaction layer begins executing read operations. If a read only encounters standard MVCC values, everything is fine. However, if it encounters any write intents, the operation must be resolved as a [transaction conflict](#transaction-conflicts).

### Commits (phase 2)

CockroachDB checks the running transaction's record to see if it's been `ABORTED`; if it has, it restarts the transaction.

In the common case, it sets the transaction record's state to `STAGING`, and checks the transaction's pending write intents to see if they have succeeded (i.e., been replicated across the cluster).

If the transaction passes these checks, CockroachDB responds with the transaction's success to the client, and moves on to the cleanup phase. At this point, the transaction is committed, and the client is free to begin sending more requests to the cluster.

For a more detailed walkthrough of the commit protocol, see [Parallel Commits](#parallel-commits).

### Cleanup (asynchronous phase 3)

After the transaction has been committed, it should be marked as such, and all of the write intents should be resolved. To do this, the coordinating node––which kept a track of all of the keys it wrote––reaches out and:

- Moves the state of the transaction record from `STAGING` to `COMMITTED`.
- Resolves the transaction's write intents to MVCC values by removing the element that points it to the transaction record.
- Deletes the write intents.

This is simply an optimization, though. If operations in the future encounter write intents, they always check their transaction records––any operation can resolve or remove write intents by checking the transaction record's status.

### Interactions with other layers

In relationship to other layers in CockroachDB, the transaction layer:

- Receives KV operations from the SQL layer.
- Controls the flow of KV operations sent to the distribution layer.

## Technical details and components

### Time and hybrid logical clocks

In distributed systems, ordering and causality are difficult problems to solve. While it's possible to rely entirely on Raft consensus to maintain serializability, it would be inefficient for reading data. To optimize performance of reads, CockroachDB implements hybrid-logical clocks (HLC) which are composed of a physical component (always close to local wall time) and a logical component (used to distinguish between events with the same physical component). This means that HLC time is always greater than or equal to the wall time. You can find more detail in the [HLC paper](http://www.cse.buffalo.edu/tech-reports/2014-04.pdf).

In terms of transactions, the gateway node picks a timestamp for the transaction using HLC time. Whenever a transaction's timestamp is mentioned, it's an HLC value. This timestamp is used to both track versions of values (through [multi-version concurrency control](storage-layer.html#mvcc)), as well as provide our transactional isolation guarantees.

When nodes send requests to other nodes, they include the timestamp generated by their local HLCs (which includes both physical and logical components). When nodes receive requests, they inform their local HLC of the timestamp supplied with the event by the sender. This is useful in guaranteeing that all data read/written on a node is at a timestamp less than the next HLC time.

This then lets the node primarily responsible for the range (i.e., the leaseholder) serve reads for data it stores by ensuring the transaction reading the data is at an HLC time greater than the MVCC value it's reading (i.e., the read always happens "after" the write).

#### Max clock offset enforcement

CockroachDB requires moderate levels of clock synchronization to preserve data consistency. For this reason, when a node detects that its clock is out of sync with at least half of the other nodes in the cluster by 80% of the maximum offset allowed (500ms by default), **it crashes immediately**.

While [serializable consistency](https://en.wikipedia.org/wiki/Serializability) is maintained regardless of clock skew, skew outside the configured clock offset bounds can result in violations of single-key linearizability between causally dependent transactions. It's therefore important to prevent clocks from drifting too far by running [NTP](http://www.ntp.org/) or other clock synchronization software on each node.

For more detail about the risks that large clock offsets can cause, see [What happens when node clocks are not properly synchronized?](../operational-faqs.html#what-happens-when-node-clocks-are-not-properly-synchronized)

### Timestamp cache

As part of providing serializability, whenever an operation reads a value, we store the operation's timestamp in a timestamp cache, which shows the high-water mark for values being read.

Whenever a write occurs, its timestamp is checked against the timestamp cache. If the timestamp is less than the timestamp cache's latest value, we attempt to push the timestamp for its transaction forward to a later time. Pushing the timestamp might cause the transaction to restart in the second phase of the transaction (see [read refreshing](#read-refreshing)).

### client.Txn and TxnCoordSender

As we mentioned in the SQL layer's architectural overview, CockroachDB converts all SQL statements into key-value (KV) operations, which is how data is ultimately stored and accessed.

All of the KV operations generated from the SQL layer use `client.Txn`, which is the transactional interface for the CockroachDB KV layer––but, as we discussed above, all statements are treated as transactions, so all statements use this interface.

However, `client.Txn` is actually just a wrapper around `TxnCoordSender`, which plays a crucial role in our code base by:

- Dealing with transactions' state. After a transaction is started, `TxnCoordSender` starts asynchronously sending heartbeat messages to that transaction's transaction record, which signals that it should be kept alive. If the `TxnCoordSender`'s heartbeating stops, the transaction record is moved to the `ABORTED` status.
- Tracking each written key or key range over the course of the transaction.
- Clearing the accumulated write intent for the transaction when it's committed or aborted. All requests being performed as part of a transaction have to go through the same `TxnCoordSender` to account for all of its write intents, which optimizes the cleanup process.

After setting up this bookkeeping, the request is passed to the `DistSender` in the distribution layer.

### Transaction records

To track the status of a transaction's execution, we write a value called a transaction record to our key-value store. All of a transaction's write intents point back to this record, which lets any transaction check the status of any write intents it encounters. This kind of canonical record is crucial for supporting concurrency in a distributed environment.

Transaction records are always written to the same range as the first key in the transaction, which is known by the `TxnCoordSender`. However, the transaction record itself isn't created until one of the following conditions occur:

- The write operation commits
- The `TxnCoordSender` heartbeats the transaction
- An operation forces the transaction to abort

Given this mechanism, the transaction record uses the following states:

- `PENDING`: Indicates that the write intent's transaction is still in progress.
- `COMMITTED`: Once a transaction has completed, this status indicates that write intents can be treated as committed values.
- `STAGING`: Used to enable the [Parallel Commits](#parallel-commits) feature. Depending on the state of the write intents referenced by this record, the transaction may or may not be in a committed state.
- `ABORTED`: Indicates that the transaction was aborted and its values should be discarded.
- _Record does not exist_: If a transaction encounters a write intent whose transaction record doesn't exist, it uses the write intent's timestamp to determine how to proceed. If the write intent's timestamp is within the transaction liveness threshold, the write intent's transaction is treated as if it is `PENDING`, otherwise it's treated as if the transaction is `ABORTED`.

The transaction record for a committed transaction remains until all its write intents are converted to MVCC values.

### Write intents

Values in CockroachDB are not written directly to the storage layer; instead values are written in a provisional state known as a "write intent." These are essentially MVCC records with an additional value added to them which identifies the transaction record to which the value belongs. They can be thought of as a combination of a replicated lock and a replicated provisional value.

Whenever an operation encounters a write intent (instead of an MVCC value), it looks up the status of the transaction record to understand how it should treat the write intent value. If the transaction record is missing, the operation checks the write intent's timestamp and evaluates whether or not it is considered expired.

 CockroachDB manages concurrency control using a per-node, in-memory lock table. This table holds a collection of locks acquired by in-progress transactions, and incorporates information about write intents as they are discovered during evaluation. For more information, see the section below on [Concurrency control](#concurrency-control).

#### Resolving write intents

Whenever an operation encounters a write intent for a key, it attempts to "resolve" it, the result of which depends on the write intent's transaction record:

- `COMMITTED`: The operation reads the write intent and converts it to an MVCC value by removing the write intent's pointer to the transaction record.
- `ABORTED`: The write intent is ignored and deleted.
- `PENDING`: This signals there is a [transaction conflict](#transaction-conflicts), which must be resolved.
- `STAGING`: This signals that the operation should check whether the staging transaction is still in progress by verifying that the transaction coordinator is still heartbeating the staging transaction’s record. If the coordinator is still heartbeating the record, the operation should wait. For more information, see [Parallel Commits](#parallel-commits).
- _Record does not exist_: If the write intent was created within the transaction liveness threshold, it's the same as `PENDING`, otherwise it's treated as `ABORTED`.

### Concurrency control

 The *concurrency manager* sequences incoming requests and provides isolation between the transactions that issued those requests that intend to perform conflicting operations. This activity is also known as [concurrency control](https://en.wikipedia.org/wiki/Concurrency_control).

The concurrency manager combines the operations of a *latch manager* and a *lock table* to accomplish this work:

- The *latch manager* sequences the incoming requests and provides isolation between those requests.
- The *lock table* provides both locking and sequencing of requests (in concert with the latch manager). It is a per-node, in-memory data structure that holds a collection of locks acquired by in-progress transactions. To ensure compatibility with the existing system of [write intents](#write-intents) (a.k.a. replicated, exclusive locks), it pulls in information about these external locks as necessary when they are discovered in the course of evaluating requests.

The concurrency manager enables support for pessimistic locking via [SQL](sql-layer.html) using the [`SELECT FOR UPDATE`](../select-for-update.html) statement. This statement can be used to increase throughput and decrease tail latency for contended operations.

For more details about how the concurrency manager works with the latch manager and lock table, see the sections below:

- [Concurrency manager](#concurrency-manager)
- [Lock table](#lock-table)
- [Latch manager](#latch-manager)

#### Concurrency manager

 The concurrency manager is a structure that sequences incoming requests and provides isolation between the transactions that issued those requests that intend to perform conflicting operations. During sequencing, conflicts are discovered and any found are resolved through a combination of passive queuing and active pushing. Once a request has been sequenced, it is free to evaluate without concerns of conflicting with other in-flight requests due to the isolation provided by the manager. This isolation is guaranteed for the lifetime of the request but terminates once the request completes.

Each request in a transaction should be isolated from other requests, both during the request's lifetime and after the request has completed (assuming it acquired locks), but within the surrounding transaction's lifetime.

The manager accommodates this by allowing transactional requests to acquire locks, which outlive the requests themselves. Locks extend the duration of the isolation provided over specific keys to the lifetime of the lock-holder transaction itself. They are (typically) only released when the transaction commits or aborts. Other requests that find these locks while being sequenced wait on them to be released in a queue before proceeding. Because locks are checked during sequencing, locks don't need to be checked again during evaluation.

However, not all locks are stored directly under the manager's control, so not all locks are discoverable during sequencing. Specifically, write intents (replicated, exclusive locks) are stored inline in the MVCC keyspace, so they are not detectable until request evaluation time. To accommodate this form of lock storage, the manager integrates information about external locks with the concurrency manager structure.

{{site.data.alerts.callout_info}}
Currently, the concurrency manager operates on an unreplicated lock table structure. In the future, we intend to pull all locks, including those associated with [write intents](#write-intents), into the concurrency manager directly through a replicated lock table structure.
{{site.data.alerts.end}}

Fairness is ensured between requests. In general, if any two requests conflict then the request that arrived first will be sequenced first. As such, sequencing guarantees first-in, first-out (FIFO) semantics. The primary exception to this is that a request that is part of a transaction which has already acquired a lock does not need to wait on that lock during sequencing, and can therefore ignore any queue that has formed on the lock. For other exceptions to this sequencing guarantee, see the [lock table](#lock-table) section below.

#### Lock table

 The lock table is a per-node, in-memory data structure that holds a collection of locks acquired by in-progress transactions. Each lock in the table has a possibly-empty lock wait-queue associated with it, where conflicting transactions can queue while waiting for the lock to be released.  Items in the locally stored lock wait-queue are propagated as necessary (via RPC) to the existing [`TxnWaitQueue`](#txnwaitqueue), which is stored on the leader of the range's Raft group that contains the [transaction record](#transaction-records).

The database is read and written using "requests". Transactions are composed of one or more requests. Isolation is needed across requests. Additionally, since transactions represent a group of requests, isolation is needed across such groups. Part of this isolation is accomplished by maintaining multiple versions and part by allowing requests to acquire locks. Even the isolation based on multiple versions requires some form of mutual exclusion to ensure that a read and a conflicting lock acquisition do not happen concurrently. The lock table provides both locking and sequencing of requests (in concert with the use of latches).

Locks outlive the requests themselves and thereby extend the duration of the isolation provided over specific keys to the lifetime of the lock-holder transaction itself. They are (typically) only released when the transaction commits or aborts. Other requests that find these locks while being sequenced wait on them to be released in a queue before proceeding. Because locks are checked during sequencing, requests are guaranteed access to all declared keys after they have been sequenced. In other words, locks don't need to be checked again during evaluation.

{{site.data.alerts.callout_info}}
Currently, not all locks are stored directly under lock table control. Some locks are stored as [write intents](#write-intents) in the MVCC layer, and are thus not discoverable during sequencing. Specifically, write intents (replicated, exclusive locks) are stored inline in the MVCC keyspace, so they are often not detectable until request evaluation time. To accommodate this form of lock storage, the lock table adds information about these locks as they are encountered during evaluation. In the future, we intend to pull all locks, including those associated with write intents, into the lock table directly.
{{site.data.alerts.end}}

The lock table also provides fairness between requests. If two requests conflict then the request that arrived first will typically be sequenced first. There are some exceptions:

- A request that is part of a transaction which has already acquired a lock does not need to wait on that lock during sequencing, and can therefore ignore any queue that has formed on the lock.

- Contending requests that encounter different levels of contention may be sequenced in non-FIFO order. This is to allow for greater concurrency. For example, if requests *R1* and *R2* contend on key *K2*, but *R1* is also waiting at key *K1*, *R2* may slip past *R1* and evaluate.

#### Latch manager

The latch manager sequences incoming requests and provides isolation between those requests under the supervision of the [concurrency manager](#concurrency-manager).

The way the latch manager works is as follows:

As write requests occur for a range, the range's leaseholder serializes them; that is, they are placed into some consistent order.

To enforce this serialization, the leaseholder creates a "latch" for the keys in the write value, providing uncontested access to the keys. If other requests come into the leaseholder for the same set of keys, they must wait for the latch to be released before they can proceed.

Read requests also generate latches.  Multiple read latches over the same keys can be held concurrently, but a read latch and a write latch over the same keys cannot.

Another way to think of a latch is like a [mutex](https://en.wikipedia.org/wiki/Lock_(computer_science)) which is only needed for the duration of a single, low-level request. To coordinate longer-running, higher-level requests (i.e., client transactions), we use a durable system of [write intents](#write-intents).

### Isolation levels

Isolation is an element of [ACID transactions](https://en.wikipedia.org/wiki/ACID), which determines how concurrency is controlled, and ultimately guarantees consistency.

CockroachDB executes all transactions at the strongest ANSI transaction isolation level: `SERIALIZABLE`. All other ANSI transaction isolation levels (e.g., `SNAPSHOT`, `READ UNCOMMITTED`, `READ COMMITTED`, and `REPEATABLE READ`) are automatically upgraded to `SERIALIZABLE`. Weaker isolation levels have historically been used to maximize transaction throughput. However, [recent research](http://www.bailis.org/papers/acidrain-sigmod2017.pdf) has demonstrated that the use of weak isolation levels results in substantial vulnerability to concurrency-based attacks.

CockroachDB now only supports `SERIALIZABLE` isolation. In previous versions of CockroachDB, you could set transactions to `SNAPSHOT` isolation, but that feature has been removed.

`SERIALIZABLE` isolation does not allow any anomalies in your data, and is enforced by requiring the client to retry transactions if serializability violations are possible.

### Transaction conflicts

CockroachDB's transactions allow the following types of conflicts that involve running into an intent:

- **Write/write**, where two `PENDING` transactions create write intents for the same key.
- **Write/read**, when a read encounters an existing write intent with a timestamp less than its own.

To make this simpler to understand, we'll call the first transaction `TxnA` and the transaction that encounters its write intents `TxnB`.

CockroachDB proceeds through the following steps:

1. If the transaction has an explicit priority set (i.e., `HIGH` or `LOW`), the transaction with the lower priority is aborted (in the write/write case) or has its timestamp pushed (in the write/read case).

1. If the encountered transaction is expired, it's `ABORTED` and conflict resolution succeeds. We consider a write intent expired if:
	- It doesn't have a transaction record and its timestamp is outside of the transaction liveness threshold.
	- Its transaction record hasn't been heartbeated within the transaction liveness threshold.

2. `TxnB` enters the `TxnWaitQueue` to wait for `TxnA` to complete.

Additionally, the following types of conflicts that do not involve running into intents can arise:

- **Write after read**, when a write with a lower timestamp encounters a later read. This is handled through the [timestamp cache](#timestamp-cache).
- **Read within uncertainty window**, when a read encounters a value with a higher timestamp but it's ambiguous whether the value should be considered to be in the future or in the past of the transaction because of possible *clock skew*. This is handled by attempting to push the transaction's timestamp beyond the uncertain value (see [read refreshing](#read-refreshing)). Note that, if the transaction has to be retried, reads will never encounter uncertainty issues on any node which was previously visited, and that there's never any uncertainty on values read from the transaction's gateway node.

### TxnWaitQueue

The `TxnWaitQueue` tracks all transactions that could not push a transaction whose writes they encountered, and must wait for the blocking transaction to complete before they can proceed.

The `TxnWaitQueue`'s structure is a map of blocking transaction IDs to those they're blocking. For example:

~~~
txnA -> txn1, txn2
txnB -> txn3, txn4, txn5
~~~

Importantly, all of this activity happens on a single node, which is the leader of the range's Raft group that contains the transaction record.

Once the transaction does resolve––by committing or aborting––a signal is sent to the `TxnWaitQueue`, which lets all transactions that were blocked by the resolved transaction begin executing.

Blocked transactions also check the status of their own transaction to ensure they're still active. If the blocked transaction was aborted, it's simply removed.

If there is a deadlock between transactions (i.e., they're each blocked by each other's Write Intents), one of the transactions is randomly aborted. In the above example, this would happen if `TxnA` blocked `TxnB` on `key1` and `TxnB` blocked `TxnA` on `key2`.

### Read refreshing

Whenever a transaction's timestamp has been pushed, additional checks are required before allowing it to commit at the pushed timestamp: any values which the transaction previously read must be checked to verify that no writes have subsequently occurred between the original transaction timestamp and the pushed transaction timestamp. This check prevents serializability violation. The check is done by keeping track of all the reads using a dedicated `RefreshRequest`. If this succeeds, the transaction is allowed to commit (transactions perform this check at commit time if they've been pushed by a different transaction or by the timestamp cache, or they perform the check whenever they encounter a `ReadWithinUncertaintyIntervalError` immediately, before continuing).
If the refreshing is unsuccessful, then the transaction must be retried at the pushed timestamp.

### Transaction pipelining

Transactional writes are pipelined when being replicated and when being written to disk, dramatically reducing the latency of transactions that perform multiple writes. For example, consider the following transaction:

{% include copy-clipboard.html %}
~~~ sql
-- CREATE TABLE kv (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), key VARCHAR, value VARCHAR);
> BEGIN;
INSERT into kv (key, value) VALUES ('apple', 'red');
INSERT into kv (key, value) VALUES ('banana', 'yellow');
INSERT into kv (key, value) VALUES ('orange', 'orange');
COMMIT;
~~~

With transaction pipelining, write intents are replicated from leaseholders in parallel, so the waiting all happens at the end, at transaction commit time.

At a high level, transaction pipelining works as follows:

1. For each statement, the transaction gateway node communicates with the leaseholders (*L*<sub>1</sub>, *L*<sub>2</sub>, *L*<sub>3</sub>, ..., *L*<sub>i</sub>) for the ranges it wants to write to. Since the primary keys in the table above are UUIDs, the ranges are probably split across multiple leaseholders (this is a good thing, as it decreases [transaction conflicts](#transaction-conflicts)).

2. Each leaseholder *L*<sub>i</sub> receives the communication from the transaction gateway node and does the following in parallel:
  - Creates write intents and sends them to its follower nodes.
  - Responds to the transaction gateway node that the write intents have been sent. Note that replication of the intents is still in-flight at this stage.

3. When attempting to commit, the transaction gateway node then waits for the write intents to be replicated in parallel to all of the leaseholders' followers. When it receives responses from the leaseholders that the write intents have propagated, it commits the transaction.

In terms of the SQL snippet shown above, all of the waiting for write intents to propagate and be committed happens once, at the very end of the transaction, rather than for each individual write. This means that the cost of multiple writes is not `O(n)` in the number of SQL DML statements; instead, it's `O(1)`.

### Parallel Commits

The *Parallel Commits* feature introduces a new, optimized atomic commit protocol that cuts the commit latency of a transaction in half, from two rounds of consensus down to one. Combined with [Transaction pipelining](#transaction-pipelining), this brings the latency incurred by common OLTP transactions to near the theoretical minimum: the sum of all read latencies plus one round of consensus latency.

Under the new atomic commit protocol, the transaction coordinator can return to the client eagerly when it knows that the writes in the transaction have succeeded. Once this occurs, the transaction coordinator can set the transaction record's state to `COMMITTED` and resolve the transaction's write intents asynchronously.

The transaction coordinator is able to do this while maintaining correctness guarantees because it populates the transaction record with enough information (via a new `STAGING` state, and an array of in-flight writes) for other transactions to determine whether all writes in the transaction are present, and thus prove whether or not the transaction is committed.

For an example showing how the Parallel Commits feature works in more detail, see [Parallel Commits - step by step](#parallel-commits-step-by-step).

{{site.data.alerts.callout_info}}
The latency until intents are resolved is unchanged by the introduction of Parallel Commits: two rounds of consensus are still required to resolve intents. This means that [contended workloads](../performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) are expected to profit less from this feature.
{{site.data.alerts.end}}

#### Parallel Commits - step by step

This section contains a step by step example of a transaction that writes its data using the Parallel Commits atomic commit protocol and does not encounter any errors or conflicts.

##### Step 1

The client starts the transaction. A transaction coordinator is created to manage the state of that transaction.

![parallel-commits-00.png](../../images/{{page.version.version}}/parallel-commits-00.png "Parallel Commits Diagram #1")

##### Step 2

The client issues a write to the "Apple" key. The transaction coordinator begins the process of laying down a write intent on the key where the data will be written. The write intent has a timestamp and a pointer to an as-yet nonexistent transaction record. Additionally, each write intent in the transaction is assigned a unique sequence number which is used to uniquely identify it.

The coordinator avoids creating the record for as long as possible in the transaction's lifecycle as an optimization. The fact that the transaction record does not yet exist is denoted in the diagram by its dotted lines.

{{site.data.alerts.callout_info}}
The coordinator does not need to wait for write intents to replicate from leaseholders before moving on to the next statement from the client, since that is handled in parallel by [Transaction Pipelining](#transaction-pipelining).
{{site.data.alerts.end}}

![parallel-commits-01.png](../../images/{{page.version.version}}/parallel-commits-01.png "Parallel Commits Diagram #2")

##### Step 3

The client issues a write to the "Berry" key. The transaction coordinator lays down a write intent on the key where the data will be written. This write intent has a pointer to the same transaction record as the intent created in [Step 2](#step-2), since these write intents are part of the same transaction.

As before, the coordinator does not need to wait for write intents to replicate from leaseholders before moving on to the next statement from the client.

![parallel-commits-02.png](../../images/{{page.version.version}}/parallel-commits-02.png "Parallel Commits Diagram #3")

##### Step 4

The client issues a request to commit the transaction's writes. The transaction coordinator creates the transaction record and immediately sets the record's state to `STAGING`, and records the keys of each write that the transaction has in flight.

It does this without waiting to see whether the writes from Steps [2](#step-2) and [3](#step-3) have succeeded.

![parallel-commits-03.png](../../images/{{page.version.version}}/parallel-commits-03.png "Parallel Commits Diagram #4")

##### Step 5

The transaction coordinator, having received the client's `COMMIT` request, waits for the pending writes to succeed (i.e., be replicated across the cluster). Once all of the pending writes have succeeded, the coordinator returns a message to the client, letting it know that its transaction has committed successfully.

![parallel-commits-04.png](../../images/{{page.version.version}}/parallel-commits-04.png "Parallel Commits Diagram #4")

The transaction is now considered atomically committed, even though the state of its transaction record is still `STAGING`. The reason this is still considered an atomic commit condition is that a transaction is considered committed if it is one of the following logically equivalent states:

1. The transaction record's state is `STAGING`, and its list of pending writes have all succeeded (i.e., the `InFlightWrites` have achieved consensus across the cluster). Any observer of this transaction can verify that its writes have replicated. Transactions in this state are *implicitly committed*.

2. The transaction record's state is `COMMITTED`. Transactions in this state are *explicitly committed*.

Despite their logical equivalence, the transaction coordinator now works as quickly as possible to move the transaction record from the `STAGING` to the `COMMITTED` state so that other transactions do not encounter a possibly conflicting transaction in the `STAGING` state and then have to do the work of verifying that the staging transaction's list of pending writes has succeeded. Doing that verification (also known as the "transaction status recovery process") would be slow.

Additionally, when other transactions encounter a transaction in `STAGING` state, they check whether the staging transaction is still in progress by verifying that the transaction coordinator is still heartbeating that staging transaction’s record. If the coordinator is still heartbeating the record, the other transactions will wait, on the theory that letting the coordinator update the transaction record with the final result of the attempt to commit will be faster than going through the transaction status recovery process. This means that in practice, the transaction status recovery process is only used if the transaction coordinator dies due to an untimely crash.

## Technical interactions with other layers

### Transaction and SQL layer

The transaction layer receives KV operations from `planNodes` executed in the SQL layer.

### Transaction and distribution layer

The `TxnCoordSender` sends its KV requests to `DistSender` in the distribution layer.

## What's next?

Learn how CockroachDB presents a unified view of your cluster's data in the [distribution layer](distribution-layer.html).

<!-- Links -->

[storage]: storage-layer.html
[sql]: sql-layer.html
