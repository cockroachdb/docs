---
title: Architecture Overview
summary: Learn about the inner-workings of the CockroachDB architecture.
toc: true
key: cockroachdb-architecture.html
docs_area: reference.architecture
---

CockroachDB was designed to create the source-available database we would want to use: one that is both scalable and consistent. Developers often have questions about how we've achieved this, and this guide sets out to detail the inner workings of [the `cockroach` process]({% link {{ page.version.version }}/cockroach-commands.md %}) as a means of explanation.

However, you definitely do not need to understand the underlying architecture to use CockroachDB. These pages give serious users and database enthusiasts a high-level framework to explain what's happening under the hood.

{{site.data.alerts.callout_success}}
If these docs interest you, consider taking the free [Intro to Distributed SQL](https://university.cockroachlabs.com/courses/course-v1:crl+intro-to-distributed-sql-and-cockroachdb+self-paced/about) course on Cockroach University.
{{site.data.alerts.end}}

## Using this guide

This guide is broken out into pages detailing each layer of CockroachDB. We recommended reading through the layers sequentially, starting with this overview and then proceeding to the [SQL layer]({% link {{ page.version.version }}/architecture/sql-layer.md %}).

If you're looking for a high-level understanding of CockroachDB, you can read the **Overview** section of each layer. For more technical detail &mdash; for example, if you're interested in [contributing to the project](https://cockroachlabs.atlassian.net/wiki/x/QQFdB) &mdash; you should read the **Components** sections as well.

{{site.data.alerts.callout_info}}
This guide details how CockroachDB is built, but does not explain how to build an application using CockroachDB. For more information about how to develop applications that use CockroachDB, check out our [Developer Guide]({% link {{ page.version.version }}/developer-guide-overview.md %}).
{{site.data.alerts.end}}

## Goals of CockroachDB

CockroachDB was designed to meet the following goals:

- Make life easier for humans. This means being low-touch and highly automated for [operators]({% link {{ page.version.version }}/recommended-production-settings.md %}) and simple to reason about for [developers]({% link {{ page.version.version }}/developer-guide-overview.md %}).
- Offer industry-leading [consistency](#consistency), even on massively scaled deployments. This means enabling distributed [transactions]({% link {{ page.version.version }}/architecture/transaction-layer.md %}), as well as removing the pain of eventual consistency issues and stale reads.
- Create an always-on database that accepts reads and writes on all nodes without generating conflicts.
- Allow flexible deployment in any environment, without tying you to any platform or vendor.
- Support familiar tools for working with relational data (i.e., [SQL]({% link {{ page.version.version }}/architecture/sql-layer.md %})).

With the confluence of these features, we hope that CockroachDB helps you build global, scalable, resilient deployments and [applications]({% link {{ page.version.version }}/developer-guide-overview.md %}).

## Overview

CockroachDB starts running on machines with two commands:

- [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) with a `--join` flag for all of the initial nodes in the cluster, so the process knows all of the other machines it can communicate with.
- [`cockroach init`]({% link {{ page.version.version }}/cockroach-init.md %}) to perform a one-time initialization of the cluster.

Once the CockroachDB cluster is initialized, developers interact with CockroachDB through a [PostgreSQL-compatible]({% link {{ page.version.version }}/postgresql-compatibility.md %}) SQL API. Thanks to the symmetrical behavior of all nodes in a cluster, you can send [SQL requests]({% link {{ page.version.version }}/architecture/sql-layer.md %}) to any node; this makes CockroachDB easy to integrate with [load balancers]({% link {{ page.version.version }}/recommended-production-settings.md %}#load-balancing).

After receiving SQL remote procedure calls (RPCs), nodes convert them into key-value (KV) operations that work with our [distributed, transactional key-value store]({% link {{ page.version.version }}/architecture/transaction-layer.md %}).

As these RPCs start filling your cluster with data, CockroachDB starts [algorithmically distributing your data among the nodes of the cluster]({% link {{ page.version.version }}/architecture/distribution-layer.md %}), breaking the data up into chunks that we call [ranges](#architecture-range). Each range is replicated to at least [3 nodes by default]({% link {{ page.version.version }}/configure-replication-zones.md %}#num_replicas) to ensure survivability. This ensures that if any nodes go down, you still have copies of the data which can be used for:

- Continuing to serve reads and writes.
- Consistently [replicating]({% link {{ page.version.version }}/architecture/replication-layer.md %}) the data to other nodes.

If a node receives a read or write request it cannot directly serve, it finds the node that can handle the request, and communicates with that node. This means you do not need to know where in the cluster a specific portion of your data is stored; CockroachDB tracks it for you, and enables symmetric read/write behavior from each node.

Any changes made to the data in a [range](#architecture-range) rely on a [consensus algorithm]({% link {{ page.version.version }}/architecture/replication-layer.md %}#raft) to ensure that the majority of the range's [replicas](#architecture-replica) agree to commit the change. This is how CockroachDB achieves the industry-leading isolation guarantees that allow it to provide your application with consistent reads and writes, regardless of which node you communicate with.

Ultimately, data is written to and read from disk using an efficient [storage engine]({% link {{ page.version.version }}/architecture/storage-layer.md %}), which is able to keep track of the data's timestamp. This has the benefit of letting us support the SQL standard [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) clause, letting you find historical data for a period of time.

While the high-level overview above gives you a notion of what CockroachDB does, looking at how CockroachDB operates at each of these layers will give you much greater understanding of our architecture.

### Layers

At the highest level, CockroachDB converts clients' SQL statements into key-value (KV) data, which is distributed among nodes and written to disk. CockroachDB's architecture is manifested as a number of layers, each of which interacts with the layers directly above and below it as relatively opaque services.

The following pages describe the function each layer performs, while mostly ignoring the details of other layers. This description is true to the experience of the layers themselves, which generally treat the other layers as black-box APIs. There are some interactions that occur between layers that require an understanding of each layer's function to understand the entire process.

Layer | Order | Purpose
------|------------|--------
[SQL]({% link {{ page.version.version }}/architecture/sql-layer.md %})  | 1  | Translate client SQL queries to KV operations.
[Transactional]({% link {{ page.version.version }}/architecture/transaction-layer.md %})  | 2  | Allow atomic changes to multiple KV entries.
[Distribution]({% link {{ page.version.version }}/architecture/distribution-layer.md %})  | 3  | Present replicated KV [ranges](#architecture-range) as a single entity.
[Replication]({% link {{ page.version.version }}/architecture/replication-layer.md %})  | 4  | Consistently and synchronously replicate KV [ranges](#architecture-range) across many [nodes](#node). This layer also enables [consistent](#consistency) reads using a consensus algorithm.
[Storage]({% link {{ page.version.version }}/architecture/storage-layer.md %})  | 5  | Read and write KV data on disk.

## Database terms

{% include {{ page.version.version }}/misc/database-terms.md %}

## CockroachDB architecture terms

{% include {{ page.version.version }}/misc/basic-terms.md %}

## What's next?

Start by learning about what CockroachDB does with your SQL statements at the [SQL layer]({% link {{ page.version.version }}/architecture/sql-layer.md %}).
