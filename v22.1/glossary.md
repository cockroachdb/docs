---
title: Glossary
summary: Learn about database, CockroachDB, and CockroachCloud concepts.
toc: true
key: cockroachdb-architecture.html
docs_area: get_started
---

## Database concepts

Term | Definition
-----|-----------
**Consistency** | The requirement that a transaction must change affected data only in allowed ways. CockroachDB uses "consistency" in both the sense of [ACID semantics](https://en.wikipedia.org/wiki/ACID) and the [CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem), albeit less formally than either definition.
**Isolation** | The degree to which actions occurring within transaction are visible to other users. CockroachDB provides the [`SERIALIZABLE`](https://en.wikipedia.org/wiki/Serializability) isolation level which is the highest level of data consistency and protects against concurrency-based attacks and bugs.
**Consensus** | <a name="architecture-overview-consensus"></a> When a range receives a write, a quorum of nodes containing replicas of the range acknowledge the write. This means your data is safely stored and a majority of nodes agree on the database's current state, even if some of the nodes are offline.<br/><br/>When a write does not achieve consensus, forward progress halts to maintain consistency within the cluster.
**Replication** | The process of creating and distributing copies of data, as well as ensuring that those copies remain consistent. There are two types of replication: _synchronous_ and _asynchronous_. CockroachDB uses synchronous replication. <br/><br/>Synchronous replication requires all writes to propagate to a [quorum](https://en.wikipedia.org/wiki/Quorum_%28distributed_computing%29) of copies of the data before being considered committed. This ensures the consistency of your data.<br/><br/>Asynchronous replication requires only a single node to receive the write to be considered committed; state is then propagated to each copy of the data after the fact. This is more or less equivalent to ["eventual consistency"](https://en.wikipedia.org/wiki/Eventual_consistency), which was popularized by NoSQL databases. This method of replication is likely to cause anomalies and loss of data.
**Transactions** | A set of operations performed on your database that satisfy the requirements of [ACID semantics](https://en.wikipedia.org/wiki/ACID). This is a crucial component for a consistent system to ensure developers can trust the data in their database. For more information about how transactions work, see [Transaction Layer](architecture/transaction-layer.html).
**Multi-active availability** | A consensus-based notion of high availability that lets each node in the cluster handle reads and writes for a subset of the stored data (on a per-range basis). This is in contrast to _active-passive replication_, in which the active node receives 100% of request traffic, as well as _active-active_ replication, in which all nodes accept requests but typically cannot guarantee that reads are both up-to-date and fast.

## CockroachDB architecture concepts

Term | Definition
-----|------------
**Cluster** | A CockroachDB deployment, which acts as a single logical application.
**Node** | An individual machine running CockroachDB. One or more nodes join together to create a cluster.
**Range** | <a name="architecture-range"></a> CockroachDB stores all user data (tables, indexes, etc.) and almost all system data in a sorted map of key-value pairs. This keyspace is divided into contiguous chunks called "ranges," such that every key is found in one range.<br/><br/>From a SQL perspective, a table and its secondary indexes initially map to a single range, where each key-value pair in the range represents a single row in the table (also called the _primary index_ because the table is sorted by the primary key) or a single row in a secondary index. As soon as a range reaches 512 MiB in size ([the default](../configure-replication-zones.html#range-max-bytes)), it is split into two ranges. This process continues for these new ranges as the table and its indexes continue growing.
**Replica** <a name="architecture-replica"></a> | A copy of a range (three [by default](../configure-replication-zones.html#num_replicas)) and stored on a node.
**Leaseholder** <a name="architecture-leaseholder"></a> | The replica that holds the "range lease." This replica receives and coordinates all read and write requests for the range.<br/><br/>Unlike writes, read requests access the leaseholder and send the results to the client without needing to coordinate with any of the other range replicas. This reduces the network round trips involved and is possible because the leaseholder is guaranteed to be up-to-date due to the fact that all write requests also go to the leaseholder.
**Raft leader** | For each range, the replica that is the "leader" for write requests. Using the [Raft consensus protocol](architecture/replication-layer.html#raft), this replica ensures that a majority of replicas (the leader and enough followers) agree, based on their Raft logs, before committing the write. The Raft leader is almost always the same replica as the leaseholder.
**Raft log** | A time-ordered log of writes to a range that its replicas have agreed on. This log exists on-disk with each replica and is the range's source of truth for consistent replication.

## CockroachDB deployment concepts

Term | Definition
-----|-----------
**CockroachDB Serverless (beta)** | A multi-tenant CockroachDB deployment managed by Cockroach Labs. A Serverless cluster is an isolated, virtualized tenant running on a large CockroachDB deployment in a single cloud and region. Cockroach Labs guarantees uptime and provides autonomous cluster operations. Other Serverless advantages include the ability to start clusters instantly and eliminates database operations. Consumption based billing and spend limits eliminate cost surprises.
**CockroachDB Dedicated** | A single tenant CockroachDB deployment managed by Cockroach Labs with no shared resources in a single  multi-region cloud. Cluster, node, and cloud instance Cockroach Labs SRE provide guaranteed uptime, optimization, and operations.
**CockroachDB Self-Hosted** | A self-managed CockroachDB deployment. Such a deployment offers deep control, per vCPU on any cloud or infrastructure type, in multiple clouds and regions. DB operations backed by Cockroach Labs are provided by your team.

## CockroachCloud concepts

Term | Definition
-----|-----------
**Serverless cluster** | A CockroachDB cluster automatically billed and scaled in response to the resources it consumes.
**Dedicated cluster** | A CockroachDB cluster automatically billed for resources provisioned.
**Request Unit (RU)** | Represents the compute and I/O resources used by a query. All database operations in {{ site.data.products.serverless-plan }} cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 2 RUs, and a "large read" such as a full table scan with indexes could cost a large number of RUs. You can see how many Request Units your cluster has used on the [Cluster Overview](../cockroachcloud/serverless-cluster-management.html#view-cluster-overview) page.
**Spend limit** | The maximum amount of money you want to spend on a cluster in a particular billing period. The amount you are billed is based on the resources the cluster used during that billing period. A cluster's budget is allocated across storage and burst performance.
**Baseline performance** | The minimum compute and I/O performance that you can expect from your cluster at all times. This is 100 RUs per second for all Serverless clusters (free and paid). The actual usage of a cluster may be lower than the baseline performance depending on application traffic, because not every application will need 100 RUs per second at all times. When the cluster's usage is lower than the baseline, the cluster accumulates the unused RUs until the load on the cluster increases above the baseline.
**Burst performance** | The ability of the Serverless cluster to perform above the baseline. Supporting application traffic that "bursts," i.e., can fluctuate above baseline traffic, is a key feature of Serverless clusters. Every Serverless cluster starts with a certain amount of burst performance capacity. If the actual usage of a cluster is lower than the baseline performance, the cluster can earn Request Units that can be used for burst performance for the rest of the month. 
**Storage** | Disk space for permanently storing data over time. All data in {{ site.data.products.serverless }} is automatically replicated three times and distributed across Availability Zones to survive outages. Storage is measured in units of GiB-months, which is the amount of data stored multiplied by how long it was stored. Storing 10 GiB for a month and storing 1 GiB for 10 months are both 10 GiB-months. The storage you see in the [Cluster Overview](../cockroachcloud/serverless-cluster-management.html#view-cluster-overview) page is the amount of data before considering the replication multiplier.
