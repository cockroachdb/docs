---
title: Glossary
summary: Learn about database, CockroachDB architecture and deployment, and CockroachCloud terminology.
toc: true
docs_area: get_started
---

This page defines terms that you will encounter throughout the documentation.

## Database

Term | Definition
-----|-----------
**consistency** | The requirement that a transaction must change affected data only in allowed ways. CockroachDB uses "consistency" in both the sense of [ACID semantics](https://en.wikipedia.org/wiki/ACID) and the [CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem), albeit less formally than either definition.
**isolation** | The  degree to which a transaction may be affected by other transactions running at the same time. CockroachDB provides the [`SERIALIZABLE`](https://en.wikipedia.org/wiki/Serializability) isolation level, which is the highest possible and guarantees that every committed transaction has the same result as if each transaction were run one at a time.
**consensus** | <a name="architecture-overview-consensus"></a> The process of reaching agreement on whether a transaction is committed or aborted. In CockroachDB, when a range receives a write, a quorum of nodes containing replicas of the range acknowledge the write. This means your data is safely stored and a majority of nodes agree on the database's current state, even if some of the nodes are offline.<br/><br/>When a write does not achieve consensus, forward progress halts to maintain consistency within the cluster. CockroachDB uses the [Raft consensus protocol](#architecture-raft).
**replication** | The process of creating and distributing copies of data, as well as ensuring that those copies remain\ consistent. CockroachDB requires all writes to propagate to a [quorum](https://en.wikipedia.org/wiki/Quorum_%28distributed_computing%29) of copies of the data before being considered committed. This ensures the consistency of your data.
**transaction** | A set of operations performed on a database that satisfy the requirements of [ACID semantics](https://en.wikipedia.org/wiki/ACID). This is a crucial feature for a consistent system to ensure developers can trust the data in their database. For more information about how transactions work in CockroachDB, see [Transaction Layer](architecture/transaction-layer.html).
**multi-active availability** | A consensus-based notion of high availability that lets each node in the cluster handle reads and writes for a subset of the stored data (on a per-range basis). This is in contrast to _active-passive replication_, in which the active node receives 100% of request traffic, and _active-active_ replication, in which all nodes accept requests but typically cannot guarantee that reads are both up-to-date and fast.

## CockroachDB architecture

Term | Definition
-----|------------
**cluster** | A group of interconnected storage nodes that collaboratively organize transactions, fault tolerance, and data rebalancing.
**node** | An individual instance of CockroachDB. One or more nodes form a cluster.
**range** | <a name="architecture-range"></a> CockroachDB stores all user data (tables, indexes, etc.) and almost all system data in a sorted map of key-value pairs. This keyspace is divided into contiguous chunks called _ranges_, such that every key is found in one range.<br/><br/>From a SQL perspective, a table and its secondary indexes initially map to a single range, where each key-value pair in the range represents a single row in the table (also called the _primary index_ because the table is sorted by the primary key) or a single row in a secondary index. As soon as the size of a range reaches 512 MiB ([the default](configure-replication-zones.html#range-max-bytes)), it is split into two ranges. This process continues for these new ranges as the table and its indexes continue growing.
**replica** <a name="architecture-replica"></a> | A copy of a range stored on a node. By default, there are three [replicas](configure-replication-zones.html#num_replicas) of each range on different nodes.
**leaseholder** <a name="architecture-leaseholder"></a> | The replica that holds the "range lease." This replica receives and coordinates all read and write requests for the range.<br/><br/>For most types of tables and queries, the leaseholder is the only replica that can serve consistent reads (reads that return "the latest" data).
**Raft protocol** <a name="architecture-raft"></a> | The [consensus protocol](architecture/replication-layer.html#raft) employed in CockroachDB that ensures that your data is safely stored on multiple nodes and that those nodes agree on the current state even if some of them are temporarily disconnected.
**Raft leader** | For each range, the replica that is the "leader" for write requests. The leader uses the Raft protocol to ensure that a majority of replicas (the leader and enough followers) agree, based on their Raft logs, before committing the write. The Raft leader is almost always the same replica as the leaseholder.
**Raft log** | A time-ordered log of writes to a range that its replicas have agreed on. This log exists on-disk with each replica and is the range's source of truth for consistent replication.

For more information on CockroachDB architecture, see [Architecture Overview](architecture/overview.html#overview).

## CockroachDB deployment

Term | Definition
-----|-----------
**single tenant** | A type of CockroachDB deployment where a single customer uses the database cluster.
**multi-tenant** | A type of CockroachDB deployment where multiple customers share a single storage cluster. Each customer sees a virtual CockroachDB cluster. Data in each virtual cluster is isolated and is invisible to other customers.
**region** | A logical identification of how nodes and data are clustered around [geographical locations](multiregion-overview.html). A _cluster region_ is the set of locations where cluster nodes are running. A _database region_ is the subset of cluster regions database data should be restricted to.
**availability zone**  | A part of a data center that is considered to form a unit with regards to failures and fault tolerance. There can be multiple nodes in a single availability zone, however Cockroach Labs recommends that you to place different replicas of your data in different availability zones.
**[CockroachDB Serverless (beta)](../cockroachcloud/quickstart.html)** | A fully managed, multi-tenant CockroachDB deployment, in a single region and cloud (AWS or GCP). Delivers an instant, autoscaling database and offers a generous free tier and consumption based billing once free limits are exceeded.
**[CockroachDB Dedicated](../cockroachcloud/quickstart-trial-cluster.html)** | A fully managed, single tenant CockroachDB deployment in a single region or multi-region cloud (AWS or GCP).
**[CockroachDB Self-Hosted](start-a-local-cluster.html)** | A full featured, self-managed CockroachDB deployment.

For more information on deployment types and guidelines on how to choose a deployment type, see [How to Choose a Deployment Option](choose-a-deployment-option.html).

## CockroachDB Cloud

Term | Definition
-----|-----------
**Serverless cluster** | A CockroachDB cluster billed and scaled according to the resources _consumed_ by the cluster.
**Dedicated cluster** | A CockroachDB cluster billed according to the resources _provisioned for_ the cluster.
**Request Unit (RU)** | Represents the compute and I/O resources used by a query. All database operations in {{ site.data.products.serverless-plan }} cost a certain amount of RUs depending on the resources used. For example, a "small read" might cost 2 RUs, and a "large read" such as a full table scan with indexes could cost a large number of RUs. You can see how many Request Units your cluster has used on the [Cluster Overview](../cockroachcloud/serverless-cluster-management.html#view-cluster-overview) page.
**spend limit** | The maximum amount of money you want to spend on a cluster in a particular billing period. The amount you are billed is based on the resources the cluster used during that billing period. A cluster's budget is allocated across storage and burst performance.
**baseline performance** | The minimum compute and I/O performance that you can expect from your cluster at all times. This is 100 RUs per second for all Serverless clusters (free and paid). The actual usage of a cluster may be lower than the baseline performance depending on application traffic, because not every application will need 100 RUs per second at all times. When the cluster's usage is lower than the baseline, the cluster accumulates the unused RUs until the load on the cluster increases above the baseline.
**burst performance** | The ability of the Serverless cluster to perform above the baseline. Supporting application traffic that "bursts," i.e., can fluctuate above baseline traffic, is a key feature of Serverless clusters. Every Serverless cluster starts with a certain amount of burst performance capacity. If the actual usage of a cluster is lower than the baseline performance, the cluster can earn Request Units that can be used for burst performance for the rest of the month. 
**storage** | Disk space for permanently storing data over time. All data in {{ site.data.products.serverless }} is automatically replicated three times and distributed across Availability Zones to survive outages. Storage is measured in units of GiB-months, which is the amount of data stored multiplied by how long it was stored. Storing 10 GiB for a month and storing 1 GiB for 10 months are both 10 GiB-months. The storage you see in the [Cluster Overview](../cockroachcloud/serverless-cluster-management.html#view-cluster-overview) page is the amount of data before considering the replication multiplier.

For more information on CockroachDB Cloud, see [CockroachDB Cloud Architecture](../cockroachcloud/architecture.html#architecture).
