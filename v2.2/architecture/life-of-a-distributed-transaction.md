---
title: Life of a Distributed Transaction
summary: This guide details the path through CockroachDB's architecture that a query takes, starting with a SQL client and progressing all the way to RocksDB (and then back out again).
toc: true
---

If you've already read the CockroachDB architecture documentation, this guide serves as another way to conceptualize how the database works. This time, instead of focusing on the layer's of CockroachDB's architecture, we're going to focus on the linear path that a query takes through the system (and then back out again).

This guide will be light on detail for each component, assuming you have read both the overview and technical detail sections of the architecture documentation, and serves mostly as another lens through which you can use your existing knowledge.

This guide focuses on the linear path through all of the actors involved in a query's execution, and then the linear path through each actor's components.

## SQL Client/Postgres Wire Protocol

To begin, a SQL client (e.g., an app) performs some kind business logic against your CockroachDB cluster, such as inserting a new customer record.

This request is sent over a connection to your CockroachDB cluster that's established using a PostgreSQL driver.

## Load Balancing & Routing

Modern architectures require distributing your cluster across machines to improve throughput, latency, and uptime. This means your connection is going to get routed to a load balancer of some variety, which chooses the best CockroachDB node to connect to.

Because all CockroachDB nodes have perfectly symmetrical access to data, this means your client is guaranteed to access the data it needs without compromising your cluster's consistency.

However, depending on your cluster's regulatory needs, you might also need to perform some higher-level routing, such as ensuring that all clients from the EU connect to your cluster through CockroachDB nodes located in the EU.

Once your router and load balancer determine the best node, your client's connection is established to what we call the gateway node.

## Gateway

The gateway node handles the connection with the client, both receiving and responding to the request.

### Parsing

The gateway node first [parses](sql-layer.html#sql-parser-planner-executor) the statement to ensure it's valid according to the CockroachDB dialect of Postgres.

### SQL

While CockroachDB presents a SQL interface to clients, the actual database is built on top of a key-value store. Parsed SQL statements are converted into key-value operations, bundled together and sent out as `planNodes`.

### TxnCoordSender

The entire SQL statement (now converted to a key-value operations) is sent to the TxnCoordSender, which performs a large amount of the accounting and tracking for a transaction:

- Accounts for all keys (or ranges of keys) involved in a transaction. This is used, among other ways, to manage the transaction's state as it proceeds throughout the cluster.
- Packages all key-value operations into a `BatchRequest`.

### DistSender

The gateway node's `DistSender` receives `BatchRequests` from the `TxnCoordSender`. It begins dismantling the `BatchRequest` by taking each operation and finding which physical machine should receive the request for the range. This information is readily available in both local caches, as well as in the [cluster's `meta2` ranges](distribution-layer.html#meta-range-kv-structure).

These dismantled `BatchRequests` are immediately reassembled into new (likely smaller) `BatchRequests`, updated to be sent to the range's leaseholder. (More information on that process below.)

All writes operations also propagate the leaseholder's address back to the `TxnCoordSender`, so it can track and clean up write operations as necessary.

The DistSender sends out the first `BatchRequest` that it has for each range in parallel. As soon as it receives a provisional ack from the receiving node’s evaluator, it sends out the next `BatchRequest` for that range.

The DistSender then waits to receive complete acks for all of its write operations, as well as values for all of its read operations.

#### Finding leaseholders (meta ranges)

Each range is replicated at least three times, and one of these range is chosen as the leaseholder, which serves and reads and coordinates all writes for the range. Because of this architecture, all of the KV operations the `DistSender` receives must be routed directly to the range's leaseholder.

To determine which physical node to send the operation to, the `DistSender` relies on data from the cluster's meta ranges, which detail which physical nodes contain the range's replicas as well as which node is the leaseholder. For any given request, the `DistSender` can determine the leaseholders by performing a read from the meta ranges for the keys in question.

For example, if the `DistSender` needs to route a request for keys `[1000, 2000)`, it performs a read across the meta ranges for those values. The response contains the leaseholder as the first node in the response.

To optimize performance, nodes heavily cache the values they've previously seen in meta ranges, which means that in most cases this read is served by a local cache, rather than going all the way out to the network.

#### Transaction Record

The first range that a transaction touches receives an additional KV operation to create a translation record (`TxnRecord`). This key-value pair is used to store the transaction's current state.

## Leaseholder Node

The gateway node's `DistSender` tries to send its `BatchRequests` to the replica identified as the range's leaseholder. If you aren't familiar with the concept, it's a crucial one to understand CockroachDB's architecture and serializability guarantees, but in short it is a single replica that serves all reads for a range, as well as coordinates all writes. Crucially, there is nothing intrinsically important about the leaseholder and any replica in good health can become the leaseholder.

### Request response

Because the leaseholder replica can shift between nodes, any node needs to be able to handle requests for any key:

##### No Longer Leaseholder

If a node was the leaseholder, but no longer holds the lease, and holds a replica for the range, it denies the request, but includes the last known address for the leaseholder of that range.

Upon receipt of this response, the `DistSender` will update the header of the `BatchRequest` with the new address, and then send out the `BatchRequest` again.

##### No Longer Has Range

If the node no longer has a replica for the requested range, it denies the request without providing any further information.

In this case, the `DistSender` must look up the current leaseholder using the cluster's `meta2` range.

##### Success

Once the node that contains the leaseholder of the range receives the `BatchRequest`, it begins processing it, and progresses onto checking the timestamp cache.

### Timestamp cache

One component in CockroachDB's architecture that allows for our `SERIALIZABILE` isolation level is the timestamp cache on the leaseholder, which tracks the highest (i.e., most recent) timestamp for any read operation the replica has served.

Each write operation in a `BatchRequest` checks its own timestamp versus the timestamp cache to ensure that the write operation has a higher timestamp; this guarantees that no write ever gets placed "under" a value that's already been read.

### Latch manager

Operations in the `BatchRequest` are serialized through the leaseholder's Latch Manager.

This works by giving each write operation a latch on a row. Any reads or writes that come in after the latch has been granted on the row must wait for the write to complete, at which point the latch is released and the subsequent operations can continue.

### Evaluator

Because the leaseholder has a valid, up-to-date copy of all of the range's data, it can trivially check the validity of the DML statement––which is done through the Evaluator. This guarantees that operation would complete in an system without contention. For example, that the DML values pass any `CHECK` constraints.

If the evaluator passes the DML operation, the leaseholder sends a provisional `ack` to the gateway node's `DistSender`; this lets the `DistSender` begin to send its subsequent DML statements to other nodes.

### Writing Txn Record

The very first range that receives a write in the Txn also receives a write with its Txn Record. This includes a UUID to uniquely identify the transaction, as well as the canonical record of its state––e.g. `PENDING`, `ABORTED`, `COMMITTED`.

As soon as this write completes (i.e., achieves consensus through Raft), it begins communicating with the gateway node's TxnCoordSender, which regularly heartbeats the TxnRecord to keep it alive (i.e., in a `PENDING` state). If the heartbeating from the TxnCoordSender stops, the TxnRecord moves itself into `ABORTED` status.

We'll touch on how writes work more in the following sections.

### Reads from RocksDB

All operations begin by reading from the store's instance of RocksDB to check for write intents for the operation's key. We talk much more about write intents in the transaction layer of the CockroachDB architecture, which is worth reading, but a simplified explanation is: these are provisional, uncommitted writes that express that some other concurrent transaction plans to write a value to the key.

This notion of write intents is crucial to how CockroachDB's distributed transactions work.

What we detail below is a simplified version of the CockroachDB transaction model. For more detail, check out the transaction architecture documentation.

#### Resolving Write Intents

If an operation encounters a write intent for a key, it attempts to "resolve" the write intent:

1. Find the TxnID for the write intent and check its TxnRecord; see if it's still `PENDING`.
	- This lets us check on writes to ensure that a new value doesn't get written under another; we can't allow a write to "rewrite history" and change values that previous writes are predicated upon.
2. If the write intent's transaction is still `PENDING`, the new transaction attempts to "push" it, by moving the write intent's transaction timestamp forward (i.e. ahead of this transaction's timestmap)
	- This operation succeeds only if this transaction's priority is explicitly higher; i.e. it has a `HIGH` priority or the transaction whose write intent it encountered has a `LOW` priority.
	- If this push fails, this transaction goes into the `TxnWaitQueue` on this node; if the write intent is at a higher timestamp, this transaction must be retried at a new, even higher timestamp.

### Read Operations

The range's leaseholder is guaranteed to have the most up-to-date version of the range's data; it had to be part of the consensus group for all writes, so it must be aware of the most recent state of the range. Because of this, the leaseholder can simply serve read requests from its local RocksDB instance.

The leaseholder aggregates all read responses into a `BatchResponse` that will get returned to the gateway node's `DistSender`.

As we mentioned before, each read operation also updates the Timestamp Cache.

### Write Operations

All write operations being by checking the Timestamp Cache; if the write's value is at a lower timestamp (i.e., in the past), the transaction must be restarted at a higher timestamp.

Once writes pass that check, the key-value operations are converted to Raft operations as Write Intents. Again, this is a provisional, uncommitted state for a write that contains a reference to its corresponding transaction record.

The leaseholder then proposes these Raft operations to the Raft group leader. Most often, the leaseholder and the Raft leader are the same node, but there are situations where the roles might drift to different nodes. However, when the two roles are not collocated on the same physical machine, CockroachDB will attempt to relocate them on the same node at the next opportunity.

## Raft Leader

While we've discussed Raft only peripherally, it deserves a note. Raft is the consensus protocol CockroachDB uses to provide consistency and availability. You can read up on CockroachDB's implementation of Raft here, as well as learn more about how the protocol works at large.

In terms of the life of a distributed transaction, the Raft leader receives proposed Raft commands from the leaseholder. Each Raft command is a write that is used to represent an atomic state change of the underlying key-value pairs stored in RocksDB.

### Consensus

For each command the Raft leader receives, it proposes a vote to the other members of the Raft group.

Once it achieves consensus (i.e. a majority of nodes including itself acknowledge the Raft command), it is committed to the Raft leader’s Raft log, and written to RocksDB. The other nodes move their Raft log ahead as soon as they hear from the leader that they can. So when the leader moves its commit index forward, it broadcasts this to all nodes that were part of the quorum.

Once the leader commits the Raft log entry, it’s considered committed. At this point the value is considered written, and if another operation comes in and performs a read on RocksDB for this key, they’ll encounter this value.

Note that at this time the committed write operation generates a write intent and not a fully committed value.

## On the way back up

Now that we have followed an operation all the way down from the SQL client to RocksDB, we can pretty quickly cover what happens on the way back up (i.e., generating a response to the client).

1. Once the leaseholder applies a write to its Raft log, it sends an `ack` to the gateway node's `DistSender`, which was waiting for this operation's `ack`, having already received the provisional `ack` from the leaseholder's evaluator.
2. The gateway node's `DistSender` aggregates commit acks from all of the write operations in the `BatchRequest`, as well as any values from read operations that should be returned to the client.
3. Once all operations have successfully completed, the `DistSender` sends a response to the `TxnCoordSender`.
4. The `TxnCoordSender` checks the `TxnRecord`; it's still in a `PENDING` state, it's moved to `COMMITTED`. If it's `ABORTED`, the transaction must be restarted.
	- Any modification to the `TxnRecord` must also go through Raft because the TxnRecord is a key-value pair, just like all other values.
	- Once the `TxnRecord` is moved to committed, the transaction is considered committed.
5. The `TxnCoordSender` responds to the SQL interface with the value that should be returned to the client (e.g. the number of affected rows)
	- The TxnCoordSender begins asynchronous intent cleanup by sending a request to the DistSender to convert all write intents it created for the transaction to regular MVCC values. However, this process is largely an optimization; if any operation encounters a write intent (instead of a fully committed MVCC value), it checks the write intent's transaction record. If the transaction record is `COMMITTED`, the operation can perform the same cleanup and convert the write intent to an MVCC value.
6. The SQL interface then responds to the client, and is now prepared to continue accepting new connections.
