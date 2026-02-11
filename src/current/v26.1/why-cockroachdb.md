---
title: Why CockroachDB?
summary: What is CockroachDB? How does it work? What makes it different from other databases?
tags: postgres, cassandra, google cloud spanner
toc: false
docs_area: get_started
---

{% include {{ page.version.version }}/faq/what-is-crdb.md %}

## Why use CockroachDB?

There are many reasons to use CockroachDB, including:

- [Resiliency](#resiliency)
- [Scalability](#scalability)
- [Strong consistency](#strong-consistency)
- [Geo-partioning and multi-region features](#geo-partitioning-and-multi-region-features)
- [PostgreSQL-compatibility](#postgresql-compatibility)

### Resiliency

One of the key attributes of CockroachDB is its inherent distributed nature. Data is automatically replicated across multiple nodes for high availability and failover protection, ensuring your data is always accessible. Even during instances of hardware failure or maintenance, the system remains resilient and operational.

For more information, refer to [CockroachDB Resilience]({% link {{ page.version.version }}/demo-cockroachdb-resilience.md %}).

### Scalability

CockroachDB supports seamless and efficient horizontal scalability. As your data and transaction volumes increase, you can add more nodes to the cluster to manage this growth, all without a decline in system performance.

For more information, refer to [Replication & Rebalancing]({% link {{ page.version.version }}/demo-replication-and-rebalancing.md %}).

### Strong consistency

CockroachDB supports [ACID](https://en.wikipedia.org/wiki/ACID) transactions. This means that every copy of data across all nodes accurately reflects the same state, thereby ensuring data integrity throughout your system.

For more information, refer to [Transactions]({% link {{ page.version.version }}/transactions.md %}).

### Geo-partitioning and multi-region features

CockroachDB's geo-partitioning functionality lets you tie data to specific geographical locations, which is beneficial for many reasons, including:

- Reduced Latency: By tying data to a specific location closer to where it is accessed from, latency can be significantly reduced, leading to improved application performance.
- Regulatory Compliance: Geo-partitioning aids in meeting data sovereignty requirements, as it allows storing and processing of data within defined geographic boundaries.
- Surviving Outages: Geo-partitioning ensures that your database can survive availability zone or regional outages, providing an additional layer of data safety.

For more information, refer to [Multi-Region Capabilities Overview]({% link {{ page.version.version }}/multiregion-overview.md %}).

### PostgreSQL compatibility

CockroachDB supports the [PostgreSQL wire protocol](https://www.postgresql.org/docs/current/protocol.html) and the majority of PostgreSQL syntax. This means that existing applications built on PostgreSQL can often be migrated to CockroachDB without changing application code.

For more information, refer to [PostgreSQL Compatibility]({% link {{ page.version.version }}/postgresql-compatibility.md %})
