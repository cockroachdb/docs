---
title: Frequently Asked Questions
summary: Get answers to frequently asked questions about CockroachDB.
toc: false
optimizely: true
---

<div id="toc"></div>

## What is CockroachDB?

CockroachDB is a distributed SQL database built on a transactional and strongly-consistent key-value store. It **scales** horizontally; **survives** disk, machine, rack, and even datacenter failures with minimal latency disruption and no manual intervention; supports **strongly-consistent** ACID transactions; and provides a familiar **SQL** API for structuring, manipulating, and querying data. 

CockroachDB is inspired by Google's [Spanner](http://research.google.com/archive/spanner.html) and [F1](http://research.google.com/pubs/pub38125.html) technologies, and it's completely [open source](https://github.com/cockroachdb/cockroach). 

## When is CockroachDB a good choice?

CockroachDB is especially well suited for applications that require:

- Horizontal scalability
- Business continuity (survivability) 
- High levels of consistency 
- Support for distributed ACID transactions 

## When is CockroachDB not a good choice?

CockroachDB is not a good choice when very low latency reads and writes are critical; use an in-memory database instead.

Also, CockroachDB is not yet suitable for: 

- Use cases requiring SQL joins ([the feature still needs optimization](https://www.cockroachlabs.com/blog/cockroachdbs-first-join/))
- Use cases requiring JSON/Protobuf data ([slated for an upcoming release](https://github.com/cockroachdb/cockroach/issues/2969))
- Real-time analytics (on our long-term roadmap)

## How easy is it to install CockroachDB?

It's as easy as downloading a binary on OS X and Linux or running our official Docker image on Windows. There are other simple install methods as well, such as running our Homebrew recipe on OS X or building from source files on both OS X and Linux.

For more details, see [Install CockroachDB](install-cockroachdb.html).

## How does CockroachDB scale?

CockroachDB scales horizontally with minimal operator overhead. You can run it on your local computer, a single server, a corporate development cluster, or a private or public cloud. [Adding capacity](start-a-node.html) is as easy as pointing a new node at the running cluster. 

At the key-value level, CockroachDB starts off with a single, empty range. As you put data in, this single range eventually reaches a threshold size (64MB by default). When that happens, the data splits into two ranges, each covering a contiguous segment of the entire key-value space. This process continues indefinitely; as new data flows in, existing ranges continue to split into new ranges, aiming to keep a relatively small and consistent range size.
 
When your cluster spans multiple nodes (physical machines, virtual machines, or containers), newly split ranges are automatically rebalanced to nodes with more capacity. CockroachDB communicates opportunities for rebalancing using a peer-to-peer [gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) by which nodes exchange network addresses, store capacity, and other information.

## How does CockroachDB survive failures?

CockroachDB is designed to survive software and hardware failures, from server restarts to datacenter outages. This is accomplished without confusing artifacts typical of other distributed systems (e.g., stale reads) using strongly-consistent replication as well as automated repair after failures.

**Replication**

CockroachDB replicates your data for availability and guarantees consistency between replicas using the [Raft consensus algorithm](https://raft.github.io/), a popular alternative to [Paxos](http://research.microsoft.com/en-us/um/people/lamport/pubs/paxos-simple.pdf). You can [define the location of replicas](configure-replication-zones.html) in various ways, depending on the types of failures you want to secure against and your network topology. You can locate replicas on:

- Different servers within a rack to tolerate server failures
- Different servers on different racks within a datacenter to tolerate rack power/network failures
- Different servers in different datacenters to tolerate large scale network or power outages 

When replicating across datacenters, we recommend using datacenters on a single continent to ensure better peformance. Cross-continent and other high-latency scenarios will be better supported in the future. 

**Automated Repair**

For short-term failures, such as a server restart, CockroachDB uses Raft to continue seamlessly as long as a majority of replicas remain available. Raft makes sure that a new “leader” for each group of replicas is elected if the former leader fails, so that transactions can continue and affected replicas can rejoin their group once they’re back online. For longer-term failures, such as a server/rack going down for an extended period of time or a datacenter outage, CockroachDB automatically rebalances replicas from the missing nodes, using the unaffected replicas as sources. Using capacity information from the gossip network, new locations in the cluster are identified and the missing replicas are re-replicated in a distributed fashion using all available nodes and the aggregate disk and network bandwidth of the cluster.

## How is CockroachDB strongly-consistent?

CockroachDB replicates your data multiple times and guarantees consistency between replicas using the [Raft consensus algorithm](https://raft.github.io/), a popular alternative to [Paxos](http://research.microsoft.com/en-us/um/people/lamport/pubs/paxos-simple.pdf). A consensus algorithm guarantees that any majority of replicas together can always provide the most recently written data on reads. Writes must reach a majority of replicas (2 out of 3 by default) before they are considered committed. If a write does not reach a majority of replicas, it will fail, not be permanent, and will never be visible to readers. This means that clients always see serializable consistency when viewing data (i.e., stale reads are not possible). 

For a detailed look at how we've tested CockroachDB for correctness and consistency, see [DIY Jepsen Testing of CockroachDB](https://www.cockroachlabs.com/blog/diy-jepsen-testing-cockroachdb/). 

## Why is CockroachDB SQL?

At the lowest level, CockroachDB is a distributed, strongly-consistent, transactional key-value store, but the external API is Standard SQL with extensions. This provides developers familiar relational concepts such as schemas, tables, columns, and indexes and the ability to structure, manipulate, and query data using well-established and time-proven tools and processes. Also, since CockroachDB supports the PostgreSQL wire protocol, it’s simple to get your application talking to Cockroach; just find your [PostgreSQL language-specific driver](install-client-drivers.html) and start building.  

For more details, learn our [basic CockroachDB SQL statements](learn-cockroachdb-sql.html), explore the [full SQL grammar](sql-grammar.html), and try it out via our [built-in SQL client](use-the-built-in-sql-client.html). Also, to understand how CockroachDB maps SQL table data to key-value storage and how CockroachDB chooses the best index for running a query, see [SQL in CockroachDB](https://www.cockroachlabs.com/blog/sql-in-cockroachdb-mapping-table-data-to-key-value-storage/) and [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/).

## Does CockroachDB support distributed transactions?

Yes. CockroachDB distributes transactions across your cluster, whether it’s a few servers in a single location or many servers across multiple datacenters. Unlike with sharded setups, you don’t need to know the precise location of data; you just talk to any node in your cluster and CockroachDB gets your transaction to the right place seamlessly. Distributed transactions proceed without downtime or additional latency while rebalancing is underway. You can even move tables – or entire databases – between data centers or cloud infrastructure providers while the cluster is under load.

## Does CockroachDB have ACID semantics?

Yes. Every transaction in CockroachDB guarantees ACID semantics.

- **Atomicity:** Transactions in CockroachDB are “all or nothing.” If any part of a transaction fails, the entire transaction is aborted, and the database is left unchanged. If a transaction succeeds, all mutations are applied together with virtual simultaneity. For a detailed discussion of atomicity in CockroachDB transactions, see [How CockroachDB Distributes Atomic Transactions](https://www.cockroachlabs.com/blog/how-cockroachdb-distributes-atomic-transactions/).
- **Consistency:** SQL operations never see any intermediate states and move the database from one valid state to another, keeping indexes up to date. Operations always see the results of previously completed statements on overlapping data and maintain specified constraints such as unique columns. For a detailed look at how we've tested CockroachDB for correctness and consistency, see [DIY Jepsen Testing of CockroachDB](https://www.cockroachlabs.com/blog/diy-jepsen-testing-cockroachdb/).
- **Isolation:** By default, transactions in CockroachDB use serializable snapshot isolation (SSI). This means that even concurrent read-write transactions will never result in anomalies. We also provide snapshot isolation (SI), which is more performant with high-contention workloads, although it exhibits anomalies not present in SSI (write skew). For a detailed discussion of isolation in CockroachDB transactions, see [Serializable, Lockless, Distributed: Isolation in CockroachDB](https://www.cockroachlabs.com/blog/serializable-lockless-distributed-isolation-cockroachdb/).
- **Durability:** In CockroachDB, every acknowledged write has been persisted consistently on a majority of replicas (typically at least 2) via the [Raft consensus algorithm](https://raft.github.io/). Power or disk failures that affect only a minority of replicas (typically 1) do not prevent the cluster from operating and do not lose any data.

## How are transactions in CockroachDB lock-free? 

[Transactions](transactions.html) in CockroachDB do not explicitly lock their data resources. Instead, using [optimistic concurrency control (OCC)](https://en.wikipedia.org/wiki/Optimistic_concurrency_control), CockroachDB proceeds with transactions under the assumption that there’s no contention until commit time. In cases without contention, this results in higher performance than explicit locking would allow. With contention, one of the conflicting transactions must be restarted or aborted. 

In practice, most applications experience low contention. However, with significant contention, OCC may perform poorly. If your application experiences high rates of contention, snapshot isolation (SI) can significantly improve performance.

## Since CockroachDB is inspired by Spanner, does it require atomic clocks to synchronize time?

No. CockroachDB was designed to work without atomic clocks or GPS clocks. It’s an open source database intended to be run on arbitrary collections of nodes, from physical servers in a corp development cluster to public cloud infrastructure using the flavor-of-the-month virtualization layer. It’d be a showstopper to require an external dependency on specialized hardware for clock synchronization. However, CockroachDB does require moderate levels of clock synchronization for correctness. If clocks drift past a maximum threshold, nodes will be taken offline. It's therefore highly recommended to run [NTP](http://www.ntp.org/) or other clock synchronization software on each node.

For full details on time synchronization in CockroachDB, see [Living Without Atomic Clocks](https://www.cockroachlabs.com/blog/living-without-atomic-clocks/).

## What languages can I use to work with CockroachDB?

CockroachDB supports the PostgreSQL wire protocol, so you can use any available PostgreSQL client drivers. We've tested it from the following languages:

- Go
- Python
- Ruby
- Java
- JavaScript (node.js)
- C++/C
- Clojure
- PHP
- Rust

See [Install Client Drivers](install-client-drivers.html) for more details.

## What is CockroachDB’s security model?

You can run a secure or insecure CockroachDB cluster. When secure, client/node and inter-node communication is encrypted, and SSL certificates authenticate the identity of both clients and nodes. When insecure, there's no encryption or authentication.

Also, CockroachDB supports common SQL privileges on databases and tables. The `root` user has privileges for all databases, while unique users can be granted privileges for specific statements at the database and table levels. 

For more details, see our documentation on [privileges](privileges.html) and the [`GRANT`](grant.html) statement.   

## How does CockroachDB compare to MySQL or PostgreSQL?

While all of these databases support SQL syntax, CockroachDB is the only one that scales easily (without the manual complexity of sharding), rebalances and repairs itself automatically, and distributes transactions seamlessly across your cluster.

For more insight, see [CockroachDB in Comparison](cockroachdb-in-comparison.html).

## How does CockroachDB compare to Cassandra, HBase, MongoDB, or Riak?

While all of these are distributed databases, only CockroachDB supports distributed transactions and provides strong consistency. Also, these other databases provide custom APIs, whereas CockroachDB offers standard SQL with extensions. 

For more insight, see [CockroachDB in Comparison](cockroachdb-in-comparison.html).

## Can a MySQL or PostgreSQL application be migrated to CockroachDB?

The current version of CockroachDB is intended for use with new applications. The initial subset of SQL we support is small relative to the extensive standard, and every popular database implements its own set of extensions and exhibits a unique set of idiosyncracies. This makes porting an existing application non-trivial unless it is only a very lightweight consumer of SQL functionality.

## Does Cockroach Labs offer a cloud database as a service?

Not yet, but this is on our long-term roadmap.

## How do I bulk insert data into CockroachDB?

Currently, you can bulk insert data with batches of [`INSERT`](insert.html) statements not exceeding a few MB. The size of your rows determines how many you can use, but 1,000 - 10,000 rows typically works best.

## Does CockroachDB support `JOIN`?

CockroachDB has basic, non-optimized support for SQL `JOIN`, whose performance we're working to improve.

To learn more, see our blog post on [CockroachDB's JOIN](https://www.cockroachlabs.com/blog/cockroachdbs-first-join/).

## Does CockroachDB support JSON or Protobuf datatypes?

Not currently, but [we plan to offer JSON/Protobuf datatypes](https://github.com/cockroachdb/cockroach/issues/2969).

## Can I use CockroachDB as a key-value store?

CockroachDB is a distributed SQL database built on a transactional and strongly-consistent key-value store. At this time, it is not possible to access the key-value store directly. As an alternative, you can [create a SQL table](create-table.html) with two columns, `k` and `v`, and set `k` as the primary key.

## Have questions that weren’t answered? 

- [CockroachDB Community Forum](https://forum.cockroachlabs.com): Ask questions, find answers, and help other users.
- [Join us on Gitter](https://gitter.im/cockroachdb/cockroach): This is the most immediate way to connect with CockroachDB engineers. To open Gitter without leaving these docs, click **Chat with Developers** in the lower-right corner of any page.
