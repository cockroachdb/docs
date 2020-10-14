---
title: Frequently Asked Questions
summary: CockroachDB FAQ - What is CockroachDB? How does it work? What makes it different from other databases?
tags: postgres, cassandra, google cloud spanner
toc: true
redirect_from:
- simplified-deployment.html
- strong-consistency.html
- sql.html
- distributed-transactions.html
- automated-scaling-and-repair.html
- high-availability.html
- go-implementation.html
- open-source.html
---

## What is CockroachDB?

CockroachDB is a [distributed SQL](https://www.cockroachlabs.com/blog/what-is-distributed-sql/) database built on a transactional and strongly-consistent key-value store. It **scales** horizontally; **survives** disk, machine, rack, and even datacenter failures with minimal latency disruption and no manual intervention; supports **strongly-consistent** ACID transactions; and provides a familiar **SQL** API for structuring, manipulating, and querying data.

CockroachDB is inspired by Google's [Spanner](http://research.google.com/archive/spanner.html) and [F1](http://research.google.com/pubs/pub38125.html) technologies, and the [source code](https://github.com/cockroachdb/cockroach) is freely available.

## When is CockroachDB a good choice?

CockroachDB is well suited for applications that require reliable, available, and correct data, and millisecond response times, regardless of scale. It is built to automatically replicate, rebalance, and recover with minimal configuration and operational overhead. Specific use cases include:

- Distributed or replicated OLTP
- Multi-datacenter deployments
- Multi-region deployments
- Cloud migrations
- Iinfrastructure initiatives built for the cloud

CockroachDB returns single-row reads in 2ms or less and single-row writes in 4ms or less, and supports a variety of [SQL and operational tuning practices](performance-tuning.html) for optimizing query performance. However, CockroachDB is not yet suitable for heavy analytics / OLAP.

## How easy is it to install CockroachDB?

It's as easy as downloading a binary or running our official Kubernetes configurations or Docker image. There are other simple install methods as well, such as running our Homebrew recipe on OS X or building from source files on both OS X and Linux.

For more details, see [Install CockroachDB](install-cockroachdb.html).

## How does CockroachDB scale?

CockroachDB scales horizontally with minimal operator overhead. You can run it on your local computer, a single server, a corporate development cluster, or a private or public cloud. [Adding capacity](cockroach-start.html) is as easy as pointing a new node at the running cluster.

At the key-value level, CockroachDB starts off with a single, empty range. As you put data in, this single range eventually reaches a threshold size (512 MiB by default). When that happens, the data splits into two ranges, each covering a contiguous segment of the entire key-value space. This process continues indefinitely; as new data flows in, existing ranges continue to split into new ranges, aiming to keep a relatively small and consistent range size.

When your cluster spans multiple nodes (physical machines, virtual machines, or containers), newly split ranges are automatically rebalanced to nodes with more capacity. CockroachDB communicates opportunities for rebalancing using a peer-to-peer [gossip protocol](https://en.wikipedia.org/wiki/Gossip_protocol) by which nodes exchange network addresses, store capacity, and other information.

## How does CockroachDB survive failures?

CockroachDB is designed to survive software and hardware failures, from server restarts to datacenter outages. This is accomplished without confusing artifacts typical of other distributed systems (e.g., stale reads) using strongly-consistent replication as well as automated repair after failures.

**Replication**

CockroachDB replicates your data for availability and guarantees consistency between replicas using the [Raft consensus algorithm](https://raft.github.io/), a popular alternative to [Paxos](http://research.microsoft.com/en-us/um/people/lamport/pubs/paxos-simple.pdf). You can [define the location of replicas](configure-replication-zones.html) in various ways, depending on the types of failures you want to secure against and your network topology. You can locate replicas on:

- Different servers within a rack to tolerate server failures
- Different servers on different racks within a datacenter to tolerate rack power/network failures
- Different servers in different datacenters to tolerate large scale network or power outages

In a CockroachDB cluster spread across multiple geographic regions, the round-trip latency between regions will have a direct effect on your database's performance. In such cases, it is important to think about the latency requirements of each table and then use the appropriate [data topologies](topology-patterns.html) to locate data for optimal performance and resiliency. For a step-by-step demonstration, see [Low Latency Multi-Region Deployment](demo-low-latency-multi-region-deployment.html).

**Automated Repair**

For short-term failures, such as a server restart, CockroachDB uses Raft to continue seamlessly as long as a majority of replicas remain available. Raft makes sure that a new “leader” for each group of replicas is elected if the former leader fails, so that transactions can continue and affected replicas can rejoin their group once they’re back online. For longer-term failures, such as a server/rack going down for an extended period of time or a datacenter outage, CockroachDB automatically rebalances replicas from the missing nodes, using the unaffected replicas as sources. Using capacity information from the gossip network, new locations in the cluster are identified and the missing replicas are re-replicated in a distributed fashion using all available nodes and the aggregate disk and network bandwidth of the cluster.

## How is CockroachDB strongly-consistent?

CockroachDB guarantees [serializable SQL transactions](demo-serializable.html), the highest isolation level defined by the SQL standard. It does so by combining the Raft consensus algorithm for writes and a custom time-based synchronization algorithms for reads.

- Stored data is versioned with MVCC, so [reads simply limit their scope to the data visible at the time the read transaction started](architecture/transaction-layer.html#time-and-hybrid-logical-clocks).

- Writes are serviced using the [Raft consensus algorithm](https://raft.github.io/), a popular alternative to [Paxos](http://research.microsoft.com/en-us/um/people/lamport/pubs/paxos-simple.pdf). A consensus algorithm guarantees that any majority of replicas together always agree on whether an update was committed successfully. Updates (writes) must reach a majority of replicas (2 out of 3 by default) before they are considered committed.

  To ensure that a write transaction does not interfere with read transactions that start after it, CockroachDB also uses a [timestamp cache](architecture/transaction-layer.html#timestamp-cache) which remembers when data was last read by ongoing transactions.

  This ensures that clients always observe serializable consistency with regards to other concurrent transactions.

## How is CockroachDB both highly available and strongly consistent?

The [CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem) states that it is impossible for a distributed system to simultaneously provide more than two out of the following three guarantees:

- Consistency
- Availability
- Partition Tolerance

CockroachDB is a CP (consistent and partition tolerant) system. This means
that, in the presence of partitions, the system will become unavailable rather than do anything which might cause inconsistent results. For example, writes require acknowledgements from a majority of replicas, and reads require a lease, which can only be transferred to a different node when writes are possible.

Separately, CockroachDB is also Highly Available, although "available" here means something different than the way it is used in the CAP theorem. In the CAP theorem, availability is a binary property, but for High Availability, we talk about availability as a spectrum (using terms like "five nines" for a system that is available 99.999% of the time).

Being both CP and HA means that whenever a majority of replicas can talk to each other, they should be able to make progress. For example, if you deploy CockroachDB to three datacenters and the network link to one of them fails, the other two datacenters should be able to operate normally with only a few seconds' disruption. We do this by attempting to detect partitions and failures quickly and efficiently, transferring leadership to nodes that are able to communicate with the majority, and routing internal traffic away from nodes that are partitioned away.

## Why is CockroachDB SQL?

At the lowest level, CockroachDB is a distributed, strongly-consistent, transactional key-value store, but the external API is Standard SQL with extensions. This provides developers familiar relational concepts such as schemas, tables, columns, and indexes and the ability to structure, manipulate, and query data using well-established and time-proven tools and processes. Also, since CockroachDB supports the PostgreSQL wire protocol, it’s simple to get your application talking to Cockroach; just find your [PostgreSQL language-specific driver](install-client-drivers.html) and start building.

For more details, learn our [basic CockroachDB SQL statements](learn-cockroachdb-sql.html), explore the [full SQL grammar](sql-grammar.html), and try it out via our [built-in SQL client](cockroach-sql.html). Also, to understand how CockroachDB maps SQL table data to key-value storage and how CockroachDB chooses the best index for running a query, see [SQL in CockroachDB](https://www.cockroachlabs.com/blog/sql-in-cockroachdb-mapping-table-data-to-key-value-storage/) and [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/).

## Does CockroachDB support distributed transactions?

Yes. CockroachDB distributes transactions across your cluster, whether it’s a few servers in a single location or many servers across multiple datacenters. Unlike with sharded setups, you do not need to know the precise location of data; you just talk to any node in your cluster and CockroachDB gets your transaction to the right place seamlessly. Distributed transactions proceed without downtime or additional latency while rebalancing is underway. You can even move tables – or entire databases – between data centers or cloud infrastructure providers while the cluster is under load.

## Do transactions in CockroachDB guarantee ACID semantics?

Yes. Every [transaction](transactions.html) in CockroachDB guarantees [ACID semantics](https://en.wikipedia.org/wiki/ACID) spanning arbitrary tables and rows, even when data is distributed.

- **Atomicity:** Transactions in CockroachDB are “all or nothing.” If any part of a transaction fails, the entire transaction is aborted, and the database is left unchanged. If a transaction succeeds, all mutations are applied together with virtual simultaneity. For a detailed discussion of atomicity in CockroachDB transactions, see [How CockroachDB Distributes Atomic Transactions](https://www.cockroachlabs.com/blog/how-cockroachdb-distributes-atomic-transactions/).
- **Consistency:** SQL operations never see any intermediate states and move the database from one valid state to another, keeping indexes up to date. Operations always see the results of previously completed statements on overlapping data and maintain specified constraints such as unique columns. For a detailed look at how we've tested CockroachDB for correctness and consistency, see [CockroachDB Beta Passes Jepsen Testing](https://www.cockroachlabs.com/blog/cockroachdb-beta-passes-jepsen-testing/).
- **Isolation:** Transactions in CockroachDB implement the strongest ANSI isolation level: serializable (`SERIALIZABLE`). This means that transactions will never result in anomalies. For more information about transaction isolation in CockroachDB, see [Transactions: Isolation Levels](transactions.html#isolation-levels).
- **Durability:** In CockroachDB, every acknowledged write has been persisted consistently on a majority of replicas (by default, at least 2) via the [Raft consensus algorithm](https://raft.github.io/). Power or disk failures that affect only a minority of replicas (typically 1) do not prevent the cluster from operating and do not lose any data.

## Since CockroachDB is inspired by Spanner, does it require atomic clocks to synchronize time?

No. CockroachDB was designed to work without atomic clocks or GPS clocks. It’s a database intended to be run on arbitrary collections of nodes, from physical servers in a corp development cluster to public cloud infrastructure using the flavor-of-the-month virtualization layer. It’d be a showstopper to require an external dependency on specialized hardware for clock synchronization. However, CockroachDB does require moderate levels of clock synchronization for correctness. If clocks drift past a maximum threshold, nodes will be taken offline. It's therefore highly recommended to run [NTP](http://www.ntp.org/) or other clock synchronization software on each node.

For more details on how CockroachDB handles unsychronized clocks, see [Clock Synchronization](recommended-production-settings.html#clock-synchronization). And for a broader discussion of clocks, and the differences between clocks in Spanner and CockroachDB, see [Living Without Atomic Clocks](https://www.cockroachlabs.com/blog/living-without-atomic-clocks/).

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

## Why does CockroachDB use the PostgreSQL wire protocol instead of the MySQL protocol?

CockroachDB uses the PostgreSQL wire protocol because it is better documented than the MySQL protocol, and because PostgreSQL has a liberal Open Source license, similar to BSD or MIT licenses, whereas MySQL has the more restrictive GNU General Public License.

Note, however, that the protocol used doesn't significantly impact how easy it is to port applications. Swapping out SQL network drivers is rather straightforward in nearly every language. What makes it hard to move from one database to another is the dialect of SQL in use. CockroachDB's dialect is based on PostgreSQL as well.

## What is CockroachDB’s security model?

You can run a secure or insecure CockroachDB cluster. When secure, client/node and inter-node communication is encrypted, and SSL certificates authenticate the identity of both clients and nodes. When insecure, there's no encryption or authentication.

Also, CockroachDB supports common SQL privileges on databases and tables. The `root` user has privileges for all databases, while unique users can be granted privileges for specific statements at the database and table-levels.

For more details, see our [Security Overview](security-overview.html).

## How does CockroachDB compare to MySQL or PostgreSQL?

While all of these databases support SQL syntax, CockroachDB is the only one that scales easily (without the manual complexity of sharding), rebalances and repairs itself automatically, and distributes transactions seamlessly across your cluster.

For more insight, see [CockroachDB in Comparison](cockroachdb-in-comparison.html).

## How does CockroachDB compare to Cassandra, HBase, MongoDB, or Riak?

While all of these are distributed databases, only CockroachDB supports distributed transactions and provides strong consistency. Also, these other databases provide custom APIs, whereas CockroachDB offers standard SQL with extensions.

For more insight, see [CockroachDB in Comparison](cockroachdb-in-comparison.html).

## Can a PostgreSQL or MySQL application be migrated to CockroachDB?

Yes. Most users should be able to follow the instructions in [Migrate from Postgres](migrate-from-postgres.html) or [Migrate from MySQL](migrate-from-mysql.html). Due to differences in available features and syntax, some features supported by these databases may require manual effort to port to CockroachDB. Check those pages for details.

We also fully support [importing your data via CSV](migrate-from-csv.html).

## Does Cockroach Labs offer a cloud database as a service?

Yes. The CockroachCloud offering is currently in Limited Availability and accepting customers on a qualified basis. The offering provides a running CockroachDB cluster suitable to your needs, fully managed by Cockroach Labs on GCP or AWS. Benefits include:

- No provisioning or deployment efforts for you
- Daily full backups and hourly incremental backups of your data
- Upgrades to the latest stable release of CockroachDB
- Monitoring to provide SLA-level support

For more details, see the [CockroachCloud](../cockroachcloud/quickstart.html) docs.

## Why did Cockroach Labs change the license for CockroachDB?

Our past outlook on the right business model relied on a crucial norm in the OSS world: that companies could build a business around a strong open source core product without a much larger technology platform company coming along and offering the same product as a service.

Recently, however, OSS companies have seen the rise of highly-integrated providers take advantage of their unique position to offer “as-a-service” versions of OSS products, and offer a superior user experience as a consequence of their integrations. We’ve most recently seen it happen with Amazon’s forked version of ElasticSearch.

To respond to this breed of competitor, we changed our software licensing terms. To learn more about our motivations, see the [Licensing FAQs](licensing-faqs.html) as well as our [blog post](https://www.cockroachlabs.com/blog/oss-relicensing-cockroachdb/) about the license change.

## Have questions that weren’t answered?

Try searching the rest of our docs for answers or using our other [support resources](support-resources.html), including:

- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [CockroachDB Community Slack](https://cockroachdb.slack.com)
- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Support Portal](https://support.cockroachlabs.com)
