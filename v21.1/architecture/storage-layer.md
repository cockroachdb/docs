---
title: Storage Layer
summary: The storage layer of CockroachDB's architecture reads and writes data to disk.
toc: true
---

The storage layer of CockroachDB's architecture reads and writes data to disk.

{{site.data.alerts.callout_info}}
If you haven't already, we recommend reading the [Architecture Overview](overview.html).
{{site.data.alerts.end}}


## Overview

Each CockroachDB node contains at least one `store`, specified when the node starts, which is where the `cockroach` process reads and writes its data on disk.

This data is stored as key-value pairs on disk using the storage engine, which is treated primarily as a black-box API.

 By default, [CockroachDB uses the Pebble storage engine](../cockroach-start.html#storage-engine), with RocksDB available as an option.  Pebble is intended to be bidirectionally compatible with the RocksDB on-disk format, but differs in that it:

- Is written in Go and implements a subset of RocksDB's large feature set.
- Contains optimizations that benefit CockroachDB.

Internally, each store contains two instances of the storage engine:

- One for storing temporary distributed SQL data
- One for all other data on the node

In addition, there is also a block cache shared amongst all of the stores in a node. These stores in turn have a collection of range replicas. More than one replica for a range will never be placed on the same store or even the same node.

### Interactions with other layers

In relationship to other layers in CockroachDB, the storage layer:

- Serves successful reads and writes from the replication layer.

## Components

### Pebble

 CockroachDB uses [Pebble by default](../cockroach-start.html#storage-engine)––an embedded key-value store with a RocksDB-compatible API developed by Cockroach Labs––to read and write data to disk. You can find more information about it on the [Pebble GitHub page](https://github.com/cockroachdb/pebble) or in the blog post [Introducing Pebble: A RocksDB Inspired Key-Value Store Written in Go](https://www.cockroachlabs.com/blog/pebble-rocksdb-kv-store/).

Pebble integrates well with CockroachDB for a number of reasons:

- It is a key-value store, which makes mapping to our key-value layer simple
- It provides atomic write batches and snapshots, which give us a subset of transactions
- It is developed by Cockroach Labs engineers
- It contains optimizations that are not in RocksDB, that are inspired by how CockroachDB uses the storage engine.  For an example of such an optimization, see the blog post [Faster Bulk-Data Loading in CockroachDB](https://www.cockroachlabs.com/blog/bulk-data-import/).

Efficient storage for the keys is guaranteed by the underlying Pebble engine by means of prefix compression.

### RocksDB

If you [choose it at node startup time (it's not the default)](../cockroach-start.html#storage-engine), CockroachDB uses RocksDB––an embedded key-value store––to read and write data to disk. You can find more information about RocksDB on the [RocksDB Basics GitHub page](https://github.com/facebook/rocksdb/wiki/RocksDB-Basics).

RocksDB integrates well with CockroachDB for a number of reasons:

- It is a key-value store, which makes mapping to our key-value layer simple
- It provides atomic write batches and snapshots, which give us a subset of transactions

Efficient storage for the keys is guaranteed by the underlying RocksDB engine by means of prefix compression.

### MVCC

CockroachDB relies heavily on [multi-version concurrency control (MVCC)](https://en.wikipedia.org/wiki/Multiversion_concurrency_control) to process concurrent requests and guarantee consistency. Much of this work is done by using [hybrid logical clock (HLC) timestamps](transaction-layer.html#time-and-hybrid-logical-clocks) to differentiate between versions of data, track commit timestamps, and identify a value's garbage collection expiration. All of this MVCC data is then stored in Pebble.

Despite being implemented in the storage layer, MVCC values are widely used to enforce consistency in the [transaction layer](transaction-layer.html). For example, CockroachDB maintains a [timestamp cache](transaction-layer.html#timestamp-cache), which stores the timestamp of the last time that the key was read. If a write operation occurs at a lower timestamp than the largest value in the read timestamp cache, it signifies there’s a potential anomaly and the transaction must be restarted at a later timestamp.

#### Time-travel

As described in the [SQL:2011 standard](https://en.wikipedia.org/wiki/SQL:2011#Temporal_support), CockroachDB supports time travel queries (enabled by MVCC).

To do this, all of the schema information also has an MVCC-like model behind it. This lets you perform `SELECT...AS OF SYSTEM TIME`, and CockroachDB uses the schema information as of that time to formulate the queries.

Using these tools, you can get consistent data from your database as far back as your garbage collection period.

### Garbage collection

CockroachDB regularly garbage collects MVCC values to reduce the size of data stored on disk. To do this, we compact old MVCC values when there is a newer MVCC value with a timestamp that's older than the garbage collection period. The garbage collection period can be set at the cluster, database, or table level by configuring the [`gc.ttlseconds` replication zone variable](../configure-replication-zones.html#gc-ttlseconds). For more information about replication zones, see [Configure Replication Zones](../configure-replication-zones.html).

#### Protected timestamps

Garbage collection can only run on MVCC values which are not covered by a *protected timestamp*. The protected timestamp subsystem exists to ensure the safety of operations that rely on historical data, such as:

- [Imports](../import.html), including [`IMPORT INTO`](../import-into.html)
- [Backups](../backup.html)
- [Streaming data out of CockroachDB using changefeeds](../stream-data-out-of-cockroachdb-using-changefeeds.html)
- [Online schema changes](../online-schema-changes.html)

Protected timestamps ensure the safety of historical data while also enabling shorter [GC TTLs](../configure-replication-zones.html#gc-ttlseconds). A shorter GC TTL means that fewer previous MVCC values are kept around. This can help lower query execution costs for workloads which update rows frequently throughout the day, since [the SQL layer](sql-layer.html) has to scan over previous MVCC values to find the current value of a row.

##### How protected timestamps work

Protected timestamps work by creating *protection records*, which are stored in an internal system table. When a long-running job such as a backup wants to protect data at a certain timestamp from being garbage collected, it creates a protection record associated with that data and timestamp.

Upon successful creation of a protection record, the MVCC values for the specified data at timestamps less than or equal to the protected timestamp will not be garbage collected. When the job that created the protection record finishes its work, it removes the record, allowing the garbage collector to run on the formerly protected values.

## Interactions with other layers

### Storage and replication layers

The storage layer commits writes from the Raft log to disk, as well as returns requested data (i.e., reads) to the replication layer.

## What's next?

Now that you've learned about our architecture, [start a local cluster](../install-cockroachdb.html) and start [building an app with CockroachDB](../build-an-app-with-cockroachdb.html).
