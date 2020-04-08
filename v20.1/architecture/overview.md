---
title: Architecture Overview
summary: An overview of the CockroachDB architecture.
toc: true
key: cockroachdb-architecture.html
redirect_from: index.html
---

CockroachDB was designed to create the source-available database our developers would want to use: one that is both scalable and consistent. Developers often have questions about how we've achieved this, and this guide sets out to detail the inner-workings of the `cockroach` process as a means of explanation.

However, you definitely do not need to understand the underlying architecture to use CockroachDB. These pages give serious users and database enthusiasts a high-level framework to explain what's happening under the hood.

## Using this guide

This guide is broken out into pages detailing each layer of CockroachDB. It's recommended to read through the layers sequentially, starting with this overview and then proceeding to the SQL layer.

If you're looking for a high-level understanding of CockroachDB, you can simply read the **Overview** section of each layer. For more technical detail––for example, if you're interested in [contributing to the project](https://wiki.crdb.io/wiki/spaces/CRDB/pages/73204033/Contributing+to+CockroachDB)––you should read the **Components** sections as well.

{{site.data.alerts.callout_info}}This guide details how CockroachDB is built, but does not explain how <em>you</em> should architect an application using CockroachDB. For help with your own application's architecture using CockroachDB, check out our <a href="https://cockroachlabs.com/docs/stable">user documentation</a>.{{site.data.alerts.end}}

## Goals of CockroachDB

CockroachDB was designed in service of the following goals:

- Make life easier for humans. This means being low-touch and highly automated for operators and simple to reason about for developers.
- Offer industry-leading consistency, even on massively scaled deployments. This means enabling distributed transactions, as well as removing the pain of eventual consistency issues and stale reads.
- Create an always-on database that accepts reads and writes on all nodes without generating conflicts.
- Allow flexible deployment in any environment, without tying you to any platform or vendor.
- Support familiar tools for working with relational data (i.e., SQL).

With the confluence of these features, we hope that CockroachDB lets teams easily build global, scalable, resilient cloud services.

## Glossary

### Terms

It's helpful to understand a few terms before reading our architecture documentation.

{% include {{ page.version.version }}/misc/basic-terms.md %}

### Concepts

CockroachDB heavily relies on the following concepts, so being familiar with them will help you understand what our architecture achieves.

Term | Definition
-----|-----------
**Consistency** | CockroachDB uses "consistency" in both the sense of [ACID semantics](https://en.wikipedia.org/wiki/Consistency_(database_systems)) and the [CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem), albeit less formally than either definition. What we try to express with this term is that your data should be anomaly-free.
**Consensus** | <a name="architecture-overview-consensus"></a> When a range receives a write, a quorum of nodes containing replicas of the range acknowledge the write. This means your data is safely stored and a majority of nodes agree on the database's current state, even if some of the nodes are offline.<br/><br/>When a write *doesn't* achieve consensus, forward progress halts to maintain consistency within the cluster.
**Replication** | Replication involves creating and distributing copies of data, as well as ensuring copies remain consistent. However, there are multiple types of replication: namely, synchronous and asynchronous.<br/><br/>Synchronous replication requires all writes to propagate to a quorum of copies of the data before being considered committed. To ensure consistency with your data, this is the kind of replication CockroachDB uses.<br/><br/>Asynchronous replication only requires a single node to receive the write to be considered committed; it's propagated to each copy of the data after the fact. This is more or less equivalent to "eventual consistency", which was popularized by NoSQL databases. This method of replication is likely to cause anomalies and loss of data.
**Transactions** | A set of operations performed on your database that satisfy the requirements of [ACID semantics](https://en.wikipedia.org/wiki/Database_transaction). This is a crucial component for a consistent system to ensure developers can trust the data in their database.
**Multi-Active Availability** | Our consensus-based notion of high availability that lets each node in the cluster handle reads and writes for a subset of the stored data (on a per-range basis). This is in contrast to active-passive replication, in which the active node receives 100% of request traffic, as well as active-active replication, in which all nodes accept requests but typically cannot guarantee that reads are both up-to-date and fast.

## Overview

CockroachDB starts running on machines with two commands:

- `cockroach start` with a `--join` flag for all of the initial nodes in the cluster, so the process knows all of the other machines it can communicate with
- `cockroach init` to perform a one-time initialization of the cluster

Once the `cockroach` process is running, developers interact with CockroachDB through a SQL API, which we've modeled after PostgreSQL. Thanks to the symmetrical behavior of all nodes, you can send SQL requests to any of them; this makes CockroachDB really easy to integrate with load balancers.

After receiving SQL RPCs, nodes convert them into operations that work with our distributed key-value store. As these RPCs start filling your cluster with data, CockroachDB algorithmically starts distributing your data among your nodes, breaking the data up into 512 MiB chunks that we call ranges. Each range is replicated to at least 3 nodes to ensure survivability. This way, if nodes go down, you still have copies of the data which can be used for reads and writes, as well as replicating the data to other nodes.

If a node receives a read or write request it cannot directly serve, it simply finds the node that can handle the request, and communicates with it. This way you do not need to know where your data lives, CockroachDB tracks it for you, and enables symmetric behavior for each node.

Any changes made to the data in a range rely on a consensus algorithm to ensure a majority of its replicas agree to commit the change, ensuring industry-leading isolation guarantees and providing your application consistent reads, regardless of which node you communicate with.

Ultimately, data is written to and read from disk using an efficient storage engine, which is able to keep track of the data's timestamp. This has the benefit of letting us support the SQL standard `AS OF SYSTEM TIME` clause, letting you find historical data for a period of time.

However, while that high-level overview gives you a notion of what CockroachDB does, looking at how the `cockroach` process operates on each of these needs will give you much greater understanding of our architecture.

### Layers

At the highest level, CockroachDB converts clients' SQL statements into key-value (KV) data, which is distributed among nodes and written to disk. Our architecture is the process by which we accomplish that, which is manifested as a number of layers that interact with those directly above and below it as relatively opaque services.

The following pages describe the function each layer performs, but mostly ignore the details of other layers. This description is true to the experience of the layers themselves, which generally treat the other layers as black-box APIs. There are interactions that occur between layers which *are not* clearly articulated and require an understanding of each layer's function to understand the entire process.

Layer | Order | Purpose
------|------------|--------
[SQL](sql-layer.html)  | 1  | Translate client SQL queries to KV operations.
[Transactional](transaction-layer.html)  | 2  | Allow atomic changes to multiple KV entries.
[Distribution](distribution-layer.html)  | 3  | Present replicated KV ranges as a single entity.
[Replication](replication-layer.html)  | 4  | Consistently and synchronously replicate KV ranges across many nodes. This layer also enables consistent reads via leases.
[Storage](storage-layer.html)  | 5  | Write and read KV data on disk.

## What's next?

Begin understanding our architecture by learning how CockroachDB works with applications in the [SQL layer](sql-layer.html).
