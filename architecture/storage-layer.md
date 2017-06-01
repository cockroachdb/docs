---
title: Storage Layer
summary: 
toc: false
---

Store Key/Value data on disk. Supports ordered scans and timestamp-based MVCC (using HLC time). [Could be split in two: “Storage” (i.e. rocksdb) and “MVCC” (and GC)]

<div id="toc"></div>

## Overview

Nodes contain one or more stores. Each store should be placed on a unique disk. Internally, each store contains two instance of RocksDB:

- One for the Raft log
- One for all other data on the node

{{site.data.alerts.callout_info}}Older versions of CockroachDB used only a single instance of RocksDB for both the Raft log and the node's data.{{site.data.alerts.end}}

In addition, there is also a block cache shared amongst all of the stores in a node. These stores in turn have a collection of range replicas. More than one replica for a range will never be placed on the same store or even the same node.

CockroachDB stores its key-values on disk using RocksDB, which is treated primarily as a black-box API. However, importantly, we extend the typical multiple-version concurrency control (MVCC) key-value storage to support timestamp values, which allows for more granular access to data.

## Components

### RocksDB

RocksDB integrates really well with CockroachDB for a number of reasons:

- Key-value store, which makes mapping to our key-value layer very simple
- Atomic write batches and snapshots, which give us a subset of transactions

Efficient storage for the keys is guaranteed by the underlying RocksDB engine by means of prefix compression.

### MVCC

Cockroach maintains historical versions of values by storing them with associated commit timestamps.

Multi-version concurrency control (MVCC) keeps timestamp-versioned key-value data, which means CockroachDB is able to keep track of what the data was at a particular point in time (at least until old versions are garbage-collected).

MVCC timestamps are widely used to prevent conflicts in transactions, making sure you have access to consistent, easy-to-reason-about data. For example, CockroachDB maintains a Read Timestamp Cache, which stores the timestamp of the last time that the key was read. If a write value occurs at a lower timestamp than the largest value in the Read Timestamp Cache, it signifies there’s a potential anomaly and the transaction must be restarted at a later timestamp.

Versioned values are supported by a layer on top of RocksDB to record commit timestamps and GC expirations per key. These values are then appended to the key-value pairs ultimately written to RocksDB.

#### Time-Travel

As described in the [SQL:2011 standard](https://en.wikipedia.org/wiki/SQL:2011#Temporal_support), CockroachDB uses MVCC to support time travel queries.

To do this, all of the schema information has an MVCC-like model behind it. This lets you perform `SELECT...AS OF SYSTEM TIME`, and CockroachDB actually uses the schema information as of that time to formulate the queries.

Using these tools, you can get consistent data from your database as far back as your garbage collection period.

### GC

CockroachDB regularly garbage collects MVCC values to reduce the size of data stored on disk. To do this, we compact old MVCC values when there is a newer MVCC value with a timestamp that's older than the garbage collection period. By default, the garbage collection period is 24 hours, but it can be set on a per-table basis through Zone Configs.

## Interactions with Other Layers

The Storage Layer commits writes from the Raft log to disk, as well as returns data which can be bundled back into `BatchResponses`.
