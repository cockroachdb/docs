---
title: Architecture Overview
summary: Learn about the inner-workings of the CockroachDB architecture.
toc: true
key: cockroachdb-architecture.html
---

CockroachDB was designed to create the source-available database we would want to use: one that is both scalable and consistent. Developers often have questions about how we've achieved this, and this guide sets out to detail the inner workings of the `cockroach` process as a means of explanation.

However, you definitely do not need to understand the underlying architecture to use CockroachDB. These pages give serious users and database enthusiasts a high-level framework to explain what's happening under the hood.

## Using this guide

This guide is broken out into pages detailing each layer of CockroachDB. We recommended reading through the layers sequentially, starting with this overview and then proceeding to the [SQL layer](sql-layer.html).

If you're looking for a high-level understanding of CockroachDB, you can read the **Overview** section of each layer. For more technical detail—for example, if you're interested in [contributing to the project](https://cockroachlabs.atlassian.net/wiki/x/QQFdB)—you should read the **Components** sections as well.

{{site.data.alerts.callout_info}}
This guide details how CockroachDB is built, but does not explain how to build an application using CockroachDB. For more information about how to develop applications that use CockroachDB, check out our [Developer Guide](../developer-guide-overview.html).
{{site.data.alerts.end}}

## Goals of CockroachDB

CockroachDB was designed to meet the following goals:

- Make life easier for humans. This means being low-touch and highly automated for [operators](../operate-cockroachdb-kubernetes.html) and simple to reason about for [developers](../developer-guide-overview.html).
- Offer industry-leading consistency, even on massively scaled deployments. This means enabling distributed transactions, as well as removing the pain of eventual consistency issues and stale reads.
- Create an always-on database that accepts reads and writes on all nodes without generating conflicts.
- Allow flexible deployment in any environment, without tying you to any platform or vendor.
- Support familiar tools for working with relational data (i.e., SQL).

With the confluence of these features, we hope that CockroachDB helps you build global, scalable, resilient deployments and applications.

## Glossary

### Terms

It's helpful to understand a few terms before reading our architecture documentation.

{% include {{ page.version.version }}/misc/basic-terms.md %}

### Concepts

CockroachDB relies heavily on the following concepts. Being familiar with them will help you understand what our architecture achieves.

Term | Definition
-----|-----------
**Consistency** | CockroachDB uses "consistency" in both the sense of [ACID semantics](https://en.wikipedia.org/wiki/Consistency_(database_systems)) and the [CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem), albeit less formally than either definition. What we try to express with this term is that your data should be anomaly-free.
**Isolation** | CockroachDB provides the [`SERIALIZABLE`](https://en.wikipedia.org/wiki/Serializability) isolation level, which provides the highest level of data consistency and protects against concurrency-based attacks and bugs.
**Consensus** | <a name="architecture-overview-consensus"></a> When a range receives a write, a quorum of nodes containing replicas of the range acknowledge the write. This means your data is safely stored and a majority of nodes agree on the database's current state, even if some of the nodes are offline.<br/><br/>When a write does not achieve consensus, forward progress halts to maintain consistency within the cluster.
**Replication** | Replication involves creating and distributing copies of data, as well as ensuring that those copies remain consistent. There are two types of replication: _synchronous_ and _asynchronous_.<br/><br/>Synchronous replication is used by CockroachDB. Synchronous replication requires all writes to propagate to a [quorum](https://en.wikipedia.org/wiki/Quorum_%28distributed_computing%29) of copies of the data before being considered committed. This ensures the consistency of your data.<br/><br/>Asynchronous replication is not used by CockroachDB. It only requires a single node to receive the write to be considered committed; state is then propagated to each copy of the data after the fact. This is more or less equivalent to ["eventual consistency"](https://en.wikipedia.org/wiki/Eventual_consistency), which was popularized by NoSQL databases. This method of replication is likely to cause anomalies and loss of data.
**Transactions** | A set of operations performed on your database that satisfy the requirements of [ACID semantics](https://en.wikipedia.org/wiki/Database_transaction). This is a crucial component for a consistent system to ensure developers can trust the data in their database. For more information about how transactions work, see the [Transaction Layer](transaction-layer.html) documentation.
**Multi-Active Availability** | Our consensus-based notion of high availability that lets each node in the cluster handle reads and writes for a subset of the stored data (on a per-range basis). This is in contrast to active-passive replication, in which the active node receives 100% of request traffic, as well as active-active replication, in which all nodes accept requests but typically cannot guarantee that reads are both up-to-date and fast.

## Overview

CockroachDB starts running on machines with two commands:

- [`cockroach start`](../cockroach-start.html) with a `--join` flag for all of the initial nodes in the cluster, so the process knows all of the other machines it can communicate with.
- [`cockroach init`](../cockroach-init.html) to perform a one-time initialization of the cluster.

Once the CockroachDB cluster is initialized, developers interact with CockroachDB through a [PostgreSQL-compatible](../postgresql-compatibility.html) SQL API. Thanks to the symmetrical behavior of all nodes in a cluster, you can send [SQL requests](sql-layer.html) to any node; this makes CockroachDB easy to integrate with load balancers.

After receiving SQL remote procedure calls (RPCs), nodes convert them into key-value (KV) operations that work with our [distributed, transactional key-value store](transaction-layer.html).

As these RPCs start filling your cluster with data, CockroachDB starts [algorithmically distributing your data among the nodes of the cluster](distribution-layer.html), breaking the data up into 512 MiB chunks that we call ranges. Each range is replicated to at least 3 nodes by default to ensure survivability. This ensures that if any nodes go down, you still have copies of the data which can be used for:

- Continuing to serve reads and writes.
- Consistently replicating the data to other nodes.

If a node receives a read or write request it cannot directly serve, it finds the node that can handle the request, and communicates with that node. This means you do not need to know where in the cluster a specific portion of your data is stored; CockroachDB tracks it for you, and enables symmetric read/write behavior from each node.

Any changes made to the data in a range rely on a [consensus algorithm](replication-layer.html) to ensure that the majority of the range's replicas agree to commit the change. This is how CockroachDB achieves the industry-leading isolation guarantees that allow it to provide your application with consistent reads and writes, regardless of which node you communicate with.

Ultimately, data is written to and read from disk using an efficient [storage engine](storage-layer.html), which is able to keep track of the data's timestamp. This has the benefit of letting us support the SQL standard [`AS OF SYSTEM TIME`](../as-of-system-time.html) clause, letting you find historical data for a period of time.

While the high-level overview above gives you a notion of what CockroachDB does, looking at how CockroachDB operates at each of these layers will give you much greater understanding of our architecture.

### Layers

At the highest level, CockroachDB converts clients' SQL statements into key-value (KV) data, which is distributed among nodes and written to disk. CockroachDB's architecture is manifested as a number of layers, each of which interacts with the layers directly above and below it as relatively opaque services.

The following pages describe the function each layer performs, while mostly ignoring the details of other layers. This description is true to the experience of the layers themselves, which generally treat the other layers as black-box APIs. There are some interactions that occur between layers that require an understanding of each layer's function to understand the entire process.

Layer | Order | Purpose
------|------------|--------
[SQL](sql-layer.html)  | 1  | Translate client SQL queries to KV operations.
[Transactional](transaction-layer.html)  | 2  | Allow atomic changes to multiple KV entries.
[Distribution](distribution-layer.html)  | 3  | Present replicated KV ranges as a single entity.
[Replication](replication-layer.html)  | 4  | Consistently and synchronously replicate KV ranges across many nodes. This layer also enables consistent reads using a consensus algorithm.
[Storage](storage-layer.html)  | 5  | Read and write KV data on disk.

## What's next?

Start by learning about what CockroachDB does with your SQL statements at the [SQL layer](sql-layer.html).
