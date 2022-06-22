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

Because CockroachDB enables transactions that can span your entire cluster (including cross-range and cross-table transactions), it optimizes correctness through a two-phase transaction protocol with asynchronous cleanup.

### Writes and reads (phase 1)

#### Writing

When the transaction layer executes write operations, it doesn't directly write values to disk. Instead, it creates two things that help it mediate a distributed transaction:

- A **transaction record** stored in the range where the first write occurs, which includes the transaction's current state (which is either `PENDING`, `COMMITTED`, or `ABORTED`).

- **Write intents** for all of a transaction’s writes, which represent a provisional, uncommitted state. These are essentially the same as standard [multi-version concurrency control (MVCC)](storage-layer.html#mvcc) values but also contain a pointer to the transaction record stored on the cluster.

As write intents are created, CockroachDB checks for newer committed values. If newer committed values exist, the transaction may be restarted. If existing write intents for the same keys exist, it is resolved as a [transaction conflict](#transaction-conflicts).

If transactions fail for other reasons, such as failing to pass a SQL constraint, the transaction is aborted.

#### Reading

If the transaction has not been aborted, the transaction layer begins executing read operations. If a read only encounters standard MVCC values, everything is fine. However, if it encounters any write intents, the operation must be resolved as a [transaction conflict](#transaction-conflicts).

### Commits (phase 2)

CockroachDB checks the running transaction's record to see if it's been `ABORTED`; if it has, it restarts the transaction.

If the transaction passes these checks, it's moved to `COMMITTED` and responds with the transaction's success to the client. At this point, the client is free to begin sending more requests to the cluster.

### Cleanup (asynchronous phase 3)

After the transaction has been resolved, all of the write intents should resolved. To do this, the coordinating node––which kept a track of all of the keys it wrote––reaches out to the values and either:

- Resolves their write intents to MVCC values by removing the element that points it to the transaction record.
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

### Latch manager

As write operations occur for a range, the range's leaseholder serializes them; that is to say that they are placed into some consistent order. 

To enforce this serialization, the leaseholder creates a "latch" for the keys in the write value, providing uncontested access to the keys. If other operations come into the leaseholder for the same set of keys, they must wait for the latch to be released before they can proceed.

Of note, only write operations generate a latch for the keys. Read operations do not block other operations from executing.

Another way to think of a latch is like a mutex, which is only needed for the duration of a low-level operation. To coordinate longer-running, higher-level operations (i.e., client transactions), we use a durable system of [write intents](#write-intents).

### Transaction records

To track the status of a transaction's execution, we write a value called a transaction record to our key-value store. All of a transaction's write intents point back to this record, which lets any transaction check the status of any write intents it encounters. This kind of canonical record is crucial for supporting concurrency in a distributed environment.

Transaction records are always written to the same range as the first key in the transaction, which is known by the `TxnCoordSender`. However, the transaction record itself isn't created until one of the following conditions occur:

- The write operation commits
- The `TxnCoordSender` heartbeats the transaction
- An operation forces the transaction to abort

Given this mechanism, the transaction record uses the following states:

- `PENDING`: Indicates that the write intent's transaction is still in progress.
- `COMMITTED`: Once a transaction has completed, this status indicates that write intents can be treated as committed values.
- `ABORTED`: Indicates that the transaction was aborted and its values should be discarded.
- _Record does not exist_: If a transaction encounters a write intent whose transaction record doesn't exist, it uses the write intent's timestamp to determine how to proceed. If the write intent's timestamp is within the transaction liveness threshold, the write intent's transaction is treated as if it is `PENDING`, otherwise it's treated as if the transaction is `ABORTED`.

The transaction record for a committed transaction remains until all its write intents are converted to MVCC values.

### Write intents

Values in CockroachDB are not written directly to the storage layer; instead everything is written in a provisional state known as a "write intent." These are essentially MVCC records with an additional value added to them which identifies the transaction record to which the value belongs.

Whenever an operation encounters a write intent (instead of an MVCC value), it looks up the status of the transaction record to understand how it should treat the write intent value. If the transaction record is missing, the operation checks the write intent's timestamp and evaluates whether or not it is considered expired.

#### Resolving write intents

Whenever an operation encounters a write intent for a key, it attempts to "resolve" it, the result of which depends on the write intent's transaction record:

- `COMMITTED`: The operation reads the write intent and converts it to an MVCC value by removing the write intent's pointer to the transaction record.
- `ABORTED`: The write intent is ignored and deleted.
- `PENDING`: This signals there is a [transaction conflict](#transaction-conflicts), which must be resolved.
- _Record does not exist_: If the write intent was created within the transaction liveness threshold, it's the same as `PENDING`, otherwise it's treated as `ABORTED`.

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

{% include_cached copy-clipboard.html %}
~~~ sql
-- CREATE TABLE kv (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), key VARCHAR, value VARCHAR);
> BEGIN;
  SAVEPOINT cockroach_restart;
  INSERT into kv (key, value) VALUES ('apple', 'red');
  INSERT into kv (key, value) VALUES ('banana', 'yellow');
  INSERT into kv (key, value) VALUES ('orange', 'orange');
  RELEASE SAVEPOINT cockroach_restart;
  COMMIT;
~~~

In versions prior to 2.1, for each `INSERT` statement above, the transaction gateway node would have to wait for write intents to propagate to each leaseholder, resulting in higher cumulative latency.

In versions 2.1 and later, write intents are propagated to leaseholders in parallel, so the waiting all happens at the end, at transaction commit time.

At a high level, transaction pipelining works as follows:

1. For each statement, the transaction gateway node communicates with the leaseholders (*L*<sub>1</sub>, *L*<sub>2</sub>, *L*<sub>3</sub>, ..., *L*<sub>i</sub>) for the ranges it wants to write to. Since the primary keys in the table above are UUIDs, the ranges are probably split across multiple leaseholders (this is a good thing, as it decreases [transaction conflicts](#transaction-conflicts)).

2. Each leaseholder *L*<sub>i</sub> receives the communication from the transaction gateway node and does the following in parallel:
  - Creates write intents and sends them to its follower nodes.
  - Responds to the transaction gateway node that the write intents have been sent. Note that replication of the intents is still in-flight at this stage.

3. When attempting to commit, the transaction gateway node then waits for the write intents to be replicated in parallel to all of the leaseholders' followers. When it receives responses from the leaseholders that the write intents have propagated, it commits the transaction.

In terms of the SQL snippet shown above, all of the waiting for write intents to propagate and be committed happens once, at the very end of the transaction, rather than for each individual write, which was the prior behavior. This changes the cost of multiple writes from `O(n)` in the number of SQL DML statements to `O(1)`.

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
