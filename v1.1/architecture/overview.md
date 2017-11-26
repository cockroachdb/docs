---
title: Architecture Overview
summary:
toc: false
key: cockroachdb-architecture.html
redirect_from: index.html
---

CockroachDB was designed to create the open-source database our developers wished they had: one that is both scalable and consistent. Developers often have questions about how we've achieved this, and this guide sets out to detail the inner-workings of the `cockroach` process as a means of explanation.

<div id="toc"></div>

## Using this Guide

This guide is broken out into pages detailing each layer of CockroachDB. It's recommended to read through the layers sequentially, starting with this overview and then proceeding to the SQL Layer.

If you're looking for a high-level understanding of CockroachDB, you can simply read the **Overview** section of each layer. For more technical detail––for example, if you're interested in [contributing to the project](../contribute-to-cockroachdb.html)––you should read the **Components** sections as well.

For readers primarily interested in what differentiates CockroachDB from other databases, we recommend focusing on the [Transaction Layer](transaction-layer.html), though the [Replication Layer](replication-layer.html) is likely to be interesting, as well.

{{site.data.alerts.callout_info}}This guide details how CockroachDB is built, but does not explain how <em>you</em> should architect an application using CockroachDB. For help with your own application's architecture using CockroachDB, check out our <a href="https://cockroachlabs.com/docs/stable">user documentation</a>.{{site.data.alerts.end}}

## Goals of CockroachDB

CockroachDB is designed to:

- Make life easier for humans. This means being low-touch and highly automated for operators and simple to reason about for developers.
- Offer industry-leading consistency, even on massively scaled deployments. CockroachDB achieves this through distributed transactions, which removes the pain developers experience with eventual consistency.
- Create an always-on database that accepts reads and writes on all nodes without sacrificing consistency.
- Allow flexible deployment in any environment, without tying users to any platform or vendor.
- Support familiar tools for working with relational data (i.e., SQL).

With the confluence of these features, CockroachDB lets teams build global, scalable, resilient cloud services with ease.

## Glossary

### Terms

It's helpful to understand a few terms before reading this architecture guide.

Term | Definition
-----|-----------
**Cluster** | Your CockroachDB deployment, which acts as a single logical application that contains one or more databases.
**Node** | An individual machine running CockroachDB. Many nodes join together to create your cluster.
**Range** | A set of sorted, contiguous data from your cluster.
**Replicas** | Copies of your ranges, which are stored on at least 3 nodes to ensure survivability.
**Range Lease** | For each range, one of the replicas holds the "range lease". This replica, referred to as the "leaseholder", is the one that receives and coordinates all read and write requests for the range.

### Concepts

CockroachDB heavily relies on the following concepts, so being familiar with them will help you understand what our architecture achieves.

Term | Definition
-----|-----------
**Consistency** | CockroachDB uses "consistency" in both the sense of [ACID semantics](https://en.wikipedia.org/wiki/Consistency_(database_systems)) and the [CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem), albeit less formally than either definition. What we try to express with this term is that your data should be anomaly-free.
**Consistency** | CockroachDB uses "consistency" in both the sense of [ACID semantics](https://en.wikipedia.org/wiki/Consistency_(database_systems)) and the [CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem), albeit less formally than either definition. What we try to express with this term is that your data should be anomaly-free.
**Consensus** | When a range receives a write, a quorum of nodes containing replicas of the range acknowledge the write. This means your data is safely stored and a majority of nodes agree on the database's current state, even if some of the nodes are offline.<br/><br/>When a write *doesn't* achieve consensus, forward progress halts to maintain consistency within the cluster.
**Replication** | Replication involves creating and distributing copies of data. However, there are multiple types of replication: namely, synchronous and asynchronous.<br/><br/>Synchronous replication requires all writes to propagate to a quorum of copies of the data before being considered committed. To ensure consistency with your data, this is the kind of replication CockroachDB uses.<br/><br/>Asynchronous replication only requires a single node to receive the write to be considered committed; it's propagated to each copy of the data after the fact. This is more or less equivalent to "eventual consistency", which was popularized by NoSQL databases. This method of replication is likely to cause anomalies and loss of data.
**Transactions** | A set of operations performed on your database that satisfy the requirements of [ACID semantics](https://en.wikipedia.org/wiki/Database_transaction). This makes developer's lives much easier by letting them write queries as if they were the only ones using the database, and letting the database itself handle all concurrency issues.

## Overview

CockroachDB starts running on machines with two commands:

- `cockroach start` with a `--join` flag for all of the initial nodes in the cluster, so the process knows all of the other machines it can communicate with
- `cockroach init` to perform a one-time initialization of the cluster

Once the `cockroach` process is running, developers interact with CockroachDB through a SQL API, which we've modeled after PostgreSQL. Because all nodes in the cluster behave symmetrically, developers can send SQL requests to any of them.

After receiving SQL RPCs, nodes convert them into operations that work with our distributed key-value store. As these RPCs start filling your cluster with data, CockroachDB algorithmically starts distributing your data among your nodes, breaking the data up into 64MiB chunks that we call ranges. Each range is replicated to at least 3 nodes to ensure survivability. This way, if nodes go down, you still have copies of the data which can be used for reads, writes, and replicating the data to other nodes.

If a node receives a read or write request for keys it doesn't contain, it simply forwards the reqest to the nodes that do contain the keys, making all data accessible from every node.

All writes rely on a consensus algorithm to ensure a majority of replicas agree to commit the write, ensuring industry-leading isolation guarantees.

Ultimately, data is written to and read from disk using an efficient, multi-version concurrency control-enabled storage engine. This also has the added benefit of letting us support the SQL standard `AS OF SYSTEM TIME` clause, letting you find historical data for a period of time.

However, while that high-level overview gives you a notion of what CockroachDB does, looking at how the `cockroach` process operates on each of these needs will give you much greater understanding of our architecture.

### Layers

At the highest level, CockroachDB converts clients' SQL statements into key-value (KV) data, which is distributed among nodes and written to disk. Our architecture is the process by which we accomplish that, which is manifested as a number of layers that interact with those directly above and below it.

The following pages describe the function each layer performs, but mostly ignore the details of other layers. This description is true to the experience of the layers themselves, which generally treat the other layers as black-box APIs. However, there are interactions that occur between layers which *are not* clearly articulated and require an understanding of each layer's function to understand the entire process.

Layer | Order | Purpose
------|------------|--------
[SQL](sql-layer.html)  | 1  | Translate client SQL queries to KV operations.
[Transactional](transaction-layer.html)  | 2  | Allow atomic changes to multiple KV entries.
[Distribution](distribution-layer.html)  | 3  | Present replicated KV ranges as a single entity.
[Replication](replication-layer.html)  | 4  | Consistently and synchronously replicate KV ranges across many nodes.
[Storage](storage-layer.html)  | 5  | Write and read KV data on disk.

## What's Next?

Begin understanding our architecture by learning how CockroachDB works with applications in the [SQL Layer](sql-layer.html).
