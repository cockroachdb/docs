---
title: Frequently Asked Questions
toc: false
---

## What is CockroachDB?

CockroachDB is a distributed SQL database built on a transactional and consistent key-value store. It **scales** massively (up to 4 exabytes of logical data), **survives** failures with minimal latency disruption and no manual intervention (from disk to machine to rack to datacenter), supports **strongly-consistent** ACID transactions, and provides a familiar **SQL** API for structuring, manipulating, and querying data. 

CockroachDB is inspired by Google's [Spanner](http://research.google.com/archive/spanner.html) and [F1](http://research.google.com/pubs/pub38125.html) technologies, and it's completely open source. 

## When is CockroachDB a good choice?

CockroachDB is well suited for applications that require high levels of consistency, support for distributed ACID transactions, and the ability to scale massively.  

## How does CockroachDB scale?

CockroachDB scales massively and easily. You can run it on your local computer, a single server, a corporate development cluster, or the private or public cloud. 

At the key-value level, CockroachDB starts off with a single, empty range. As you put data in, this single range eventually reaches a threshold size (64MB by default). When that happens, the data splits into two ranges, each covering a contiguous segment of the entire key-value space. This process continues indefinitely; as new data flows in, existing ranges continue to split into new ranges, aiming to keep a relatively small and consistent range size.
 
When your cluster spans multiple nodes (physical machines, virtual machines, or containers), newly split ranges are automatically rebalanced to nodes with more capacity. CockroachDB accomplishes this using a peer-to-peer [gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) by which nodes exchange network addresses, store capacity, and other information.

## How does CockroachDB survive failures?

CockroachDB is designed to survive failures of any size, from transaction to server restart to datacenter outage. This is accomplished through strongly-consistent replication as well as automated repair after failures.

**Replication**

CockroachDB replicates your data multiple times and guarantees consistency between replicas using the the [Raft consensus algorithm](https://raft.github.io/), a popular successor to Paxos. You can define the location of replicas in various ways, depending on the types of failure you want to secure against and your network topology. You can locate replicas on:

- Different disks within a server to tolerate disk failures
- Different servers within a rack to tolerate server failures
- Different servers on different racks within a datacenter to tolerate rack power/network failures
- Different servers in different datacenters to tolerate large scale network or power outages

**Automated Repair**

When failures occur, CockroachDB ensures the continued existence and consistency of replicas. For short-term failures, such as a server restart, CockroachDB makes sure that there’s an available “leader” for each group of replicas so that subsequent transactions can continue seamlessly and affected replicas can rejoin their group once they’re back online. For longer-term failures, such as a server/rack going down for an extended period of time or a datacenter outage, CockroachDB automatically rebalances any lost replicas to other locations in your cluster, breaking up and distributing the data quickly.

## How is CockroachDB strongly-consistent?

CockroachDB replicates your data multiple times and guarantees consistency between replicas using the the [Raft consensus algorithm](https://raft.github.io/), a popular successor to Paxos. If any part of a transaction fails to reach a majority of affected replicas (3 by default), the entire transaction is aborted, and the database is left unchanged. This means that clients always see a consistent view of your data (i.e., no stale reads).  

## Why is CockroachDB SQL?

At the lowest level, CockroachDB is a distributed, transactionally consistent, key-value store, but the external API is Standard SQL with extensions. This provides developers familiar relational concepts such as schemas, tables, columns, and indexes and the ability to structure, manipulate, and query data in well-established and effective ways. Also, since CockroachDB supports the PostgreSQL wire protocol, it’s simple to get your application talking to Cockroach; just find your PostgreSQL language-specific driver and start building.  

For insight into how CockroachDB maps SQL table data to key-value storage, see this [blog post](http://www.cockroachlabs.com/blog/sql-in-cockroachdb-mapping-table-data-to-key-value-storage/).

## Does CockroachDB support distributed transactions?

Yes. CockroachDB distributes transactions across your cluster, whether it’s a few servers in a single location or many servers across multiple datacenters. Unlike with sharded setups, you don’t need to know the precise location of data; you just talk to any node in your cluster and CockroachDB gets your transaction to the right place seamlessly.

## Does CockroachDB have ACID semantics?

Yes. Every transaction in CockroachDB guarantees ACID semantics.

- **Atomicity:** Transactions in CockroachDB are “all or nothing.” If any part of a transaction fails, the entire transaction is aborted, and the database is left unchanged.   
- **Consistency:** CockroachDB ensures consistency between a majority of replicas using the Raft consensus algorithm. See [how CockroachDB survives failures](#how-does-cockroachdb-survive-failures) for more on replication.
- **Isolation:** By default, transactions in CockroachDB use serializable snapshot isolation (SSI). This means that concurrent transactions on the same data, whether reads or writes, will never result in anomalies. In cases where anomalies are low risk, you can choose the slightly more lenient snapshot isolation level (SI) to trade correctness for performance.
- **Durability:** In CockroachDB, once a transaction has been committed, the results are stored on-disk permanently.

## How are transactions in CockroachDB lock-free? 

Transactions in CockroachDB do not lock their data resources. Instead, using [optimistic concurrency control (OCC)](https://en.wikipedia.org/wiki/Optimistic_concurrency_control), CockroachDB assumes that transactions do not contend and thus can proceed in parallel. In cases without contention, this results in significantly better performance than locking would allow. When there is contention, one of the conflicting transactions is restarted or aborted.  

## How performant is CockroachDB?

TBD

## What languages can I use to work with CockroachDB?

Cockroach supports the PostgreSQL wire protocol, so you can use any available PostgreSQL client drivers.

## How does CockroachDB differ from MySQL or PostgreSQL?

While all of these databases support SQL syntax, CockroachDB is the only one that scales simply (without the manual complexity of sharding), rebalances and repairs itself automatically, and distributes transactions seamlessly across your cluster.

## How does CockroachDB differ from Cassandra, HBase, MongoDB, or Riak?

While all of these databases support distributed transactions, Cockroach is the only one that provides strongly-consistent, ACID-compliant transactions and the convenience and familiarity of a SQL API. 

## Can a MySQL or Postgres application be migrated to CockroachDB?

The Alpha (soon Beta) version of CockroachDB is intended for use with new applications. The subset of SQL we currently support makes porting an existing application impractical unless it is only a very lightweight consumer of SQL functionality. 

## How easy is it to install CockroachDB?

Very. See [Install CockroachDB](/install-cockroachdb.html).

## How easy is it to deploy CockroachDB?

TBD. [Single binary, no external dependencies, self-organization, rebalancing, re-replication on failures]

## What are some recommended deployments? 

TBD (Cloud service providers: Digital Ocean, AWS, Azure, Google Cloud; How to optimize for performance and consistency.)

## How do you configure and monitor a CockroachDB cluster? 

TBD.

## When is CockroachDB not a good choice?

CockroachDB is not yet suitable for real-time analytics, though support for analytics processing is on our long-term roadmap. 

## What is CockroachDB’s security model?

TBD. We support client and internode SSL. Everything within CockroachDB requires that you speak to it with encryption. 

## What is CockroachDB’s privacy model?

TBD. Opt-in only. 

## Does Cockroach Labs offer a cloud database as a service?

Not yet, and there are no known third-party vendors offering it as a service either at this time.

**Have a question that wasn’t answered here? Visit our Github page or ask on our Google-Group, and someone will get back to you.** 
