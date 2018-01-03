---
title: Storage Layer
summary: 
toc: false
---

The Storage Layer of CockroachDB's architecture reads and writes data to disk.

{{site.data.alerts.callout_info}}If you haven't already, we recommend reading the <a href="overview.html">Architecture Overivew</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Overview

Each CockroachDB node contains at least one `store`, specified when the node starts, which is where the `cockroach` process reads and writes its data on disk.

This data is stored as key-value pairs on disk using RocksDB, which is treated primarily as a black-box API. Internally, each store contains multiple instance of RocksDB:

- One for storing temporary [Distributed SQL data](sql-layer.html#distsql)
- One for all other data on the node, including the node's replicas of ranges (described in the [Distribution Layer](distribution-layer.html)).

### Interactions with Other Layers

In relationship to other layers in CockroachDB, the Storage Layer:

- Serves successful reads and writes from the Replication Layer.

## Components

### RocksDB

CockroachDB uses RocksDB––an embedded key-value store––to read and write data to disk. You can find more information about it on the [RocksDB Basics GitHub page](https://github.com/facebook/rocksdb/wiki/RocksDB-Basics).

RocksDB integrates really well with CockroachDB because it offers:

- Key-value stores, which simply maps to our own KV-oriented operations
- Atomic write batches and snapshots, which provides a subset of transactions

Keys are also guaranteed to be efficiently stored through RocksDB's prefix compression.

### MVCC

CockroachDB relies heavily on [multi-version concurrency control (MVCC)](https://en.wikipedia.org/wiki/Multiversion_concurrency_control) to process concurrent requests and guarantee consistency. Much of this work is done by using [hybrid logical clock (HLC) timestamps](transaction-layer.html#time-hybrid-logical-clocks) to differentiate between versions of data, track commit timestamps, and identify a value's garbage collection expiration. All of this MVCC data is then stored in RocksDB.

Despite being implemented in the Storage Layer, MVCC values are widely used to enforce consistency in the [Transaction Layer](transaction-layer.html). For example, CockroachDB maintains a [Timestamp Cache](transaction-layer.html#timestamp-cache), which stores the timestamp of the last time that the key was read. If a write operation occurs at a lower timestamp than the largest value in the Read Timestamp Cache, it signifies there’s a potential anomaly and the transaction must be restarted at a later timestamp.

#### Time-Travel

As described in the [SQL:2011 standard](https://en.wikipedia.org/wiki/SQL:2011#Temporal_support), CockroachDB supports time travel queries (enabled by MVCC).

To do this, all of the schema information also has an MVCC-like model behind it. This lets you perform `SELECT...AS OF SYSTEM TIME`, and CockroachDB actually uses the schema information as of that time to formulate the queries.

Using these tools, you can get consistent data from your database as far back as your garbage collection period.

### Garbage Collection

CockroachDB regularly garbage collects MVCC values to reduce the size of data stored on disk. To do this, we compact old MVCC values when there is a newer MVCC value with a timestamp that's older than the garbage collection period. By default, the garbage collection period is 24 hours, but it can be set at the cluster, database, or table level through [Replication Zones](../configure-replication-zones.html).

## Interactions with Other Layers

### Storage & Replication Layers

The Storage Layer commits writes from the Raft log to disk, as well as returns requested data (i.e., reads) to the Replication Layer.

## What's Next?

Now that you've learned about our architecture, [start a local cluster](../install-cockroachdb.html) and start [building an app with CockroachDB](../build-an-app-with-cockroachdb.html/).
