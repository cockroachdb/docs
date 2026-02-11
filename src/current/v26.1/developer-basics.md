---
title: Developer Basics
summary: A short overview of key concepts developers need to know about CockroachDB
toc: true
docs_area: develop
---

Before you start using CockroachDB, you should understand the following important mechanics of the database:

- [How transactions work in CockroachDB](#how-transactions-work-in-cockroachdb), including [serializability](#serializability-and-transaction-contention) and [transaction retries](#transaction-retries)
- [How applications interact with CockroachDB](#how-applications-interact-with-cockroachdb)

Note that the sections that follow were written for the purposes of orienting application developers. For more detailed technical documentation on CockroachDB's architecture, see our [architecture documentation]({% link {{ page.version.version }}/architecture/overview.md %}).

### How transactions work in CockroachDB

CockroachDB is designed to make your data scalable and consistent. All stored records are replicated across a distributed deployment of database instances, and all database transactions committed in CockroachDB satisfy [ACID properties](https://en.wikipedia.org/wiki/ACID).

To guarantee that database operations are [atomic](https://wikipedia.org/wiki/Atomicity_(database_systems)) (the "A" of the [ACID properties](https://en.wikipedia.org/wiki/ACID)), CockroachDB executes all statements in the context of an atomic [database transaction](https://wikipedia.org/wiki/Database_transaction). If a transaction succeeds, all data mutations are applied together simultaneously from the perspective of operations outside of the transaction. If any part of a transaction fails, the entire transaction is aborted, and the database is left unchanged.

Managing transactions is an important part of CockroachDB application development. When creating your application's persistence layer, you must understand how CockroachDB interacts with your application framework's transaction management system. You should also have some knowledge of CockroachDB's [transaction syntax]({% link {{ page.version.version }}/transactions.md %}#syntax). We go into more detail about transaction management in [Manage Transactions]({% link {{ page.version.version }}/transactions.md %}).

#### Serializability and transaction contention

By default, CockroachDB uses [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) transaction [isolation](https://wikipedia.org/wiki/Isolation_(database_systems)) (the "I" of ACID semantics). If transactions are executed concurrently, the final state of the database will appear as if the transactions were executed serially. `SERIALIZABLE` isolation, the strictest level of isolation, provides the highest level of data consistency and protects against concurrency anomalies.

To guarantee data consistency, CockroachDB [locks]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#concurrency-control) the data targeted by an open transaction. If a separate transaction attempts to modify data that are locked by an open transaction, the newest transaction will not succeed, as committing it could result in incorrect data. This scenario is called *transaction contention*, and should be avoided when possible. For a more detailed explanation of transaction contention, and tips on how to avoid it, see [Transaction contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention).

#### Transaction retries

In some cases, [transaction contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) is unavoidable. If a transaction fails due to contention, CockroachDB will automatically retry the transaction. If the transaction is `SERIALIZABLE` and cannot automatically be retried without allowing [serialization]({% link {{ page.version.version }}/demo-serializable.md %}) anomalies, CockroachDB will return a [transaction retry error]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}) to the client.

Most [official CockroachDB client libraries]({% link {{ page.version.version }}/install-client-drivers.md %}) include a transaction-retrying wrapper function to make writing your persistence layer easier. If your framework's client library does not include a retry wrapper, you will need to write transaction retry logic in your application. We go into more detail about transaction retries later in the guide, in [Retry Transactions]({% link {{ page.version.version }}/advanced-client-side-transaction-retries.md %}).

#### Read Committed isolation

CockroachDB can be configured to execute transactions at [`READ COMMITTED`]({% link {{ page.version.version }}/read-committed.md %}) instead of `SERIALIZABLE` isolation. `READ COMMITTED` permits some concurrency anomalies in exchange for minimizing transaction aborts and removing the need for client-side retries. Depending on your workload requirements, this may be desirable. For more information, see [Read Committed Transactions]({% link {{ page.version.version }}/read-committed.md %}).

### How applications interact with CockroachDB

CockroachDB supports the PostgreSQL wire protocol, and CockroachDB supports [most PostgreSQL syntax and features]({% link {{ page.version.version }}/postgresql-compatibility.md %}), making most PostgreSQL client libraries compatible with CockroachDB. Cockroach Labs also maintains official CockroachDB adapters for some of the most popular PostgreSQL drivers and ORMs. Using an official CockroachDB adapter can help simplify transaction management and performance optimization in your application. If an official CockroachDB adapter does not yet exist for your application's data framework, we recommend just using the PostgreSQL client library that works for your application.

A growing number of popular third-party database tools offer full support for CockroachDB. Because CockroachDB uses the PostgreSQL wire protocol and supports PostgreSQL syntax, most PostgreSQL-compatible third-party tools are also compatible with CockroachDB. For a list of libraries and tools that we have tested against CockroachDB, see [Third-party Database Tools]({% link {{ page.version.version }}/third-party-database-tools.md %}).