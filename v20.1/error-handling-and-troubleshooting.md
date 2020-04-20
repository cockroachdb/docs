---
title: Error Handling and Troubleshooting
summary: How to troubleshoot problems and handle transaction retry errors during application development
toc: true
---

This page has instructions for handling errors and troubleshooting problems that may arise during application development.

## Troubleshooting query problems

If you are not satisfied with your SQL query performance, follow the instructions in [Make Queries Fast][fast] to be sure you are avoiding common performance problems like full table scans, missing indexes, etc.

If you have already optimized your SQL queries as described in [Make Queries Fast][fast] and are still having issues such as:

- Hanging or "stuck" queries
- Queries that are slow some of the time (but not always)
- Low throughput of queries

Take a look at [Troubleshoot SQL Behavior](query-behavior-troubleshooting.html).

{{site.data.alerts.callout_info}}
If you aren't sure whether SQL query performance needs to be improved on your cluster, see [Identify slow queries](query-behavior-troubleshooting.html#identify-slow-queries).
{{site.data.alerts.end}}

## Transaction retry errors

Messages with the Postgres error code `40001` indicate that a transaction failed because it [conflicted with another concurrent or recent transaction accessing the same data](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention). The transaction needs to be retried by the client.

If your language's client driver or ORM implements transaction retry logic internally (e.g., if you are using Python and [SQLAlchemy with the CockroachDB dialect](build-a-python-app-with-cockroachdb-sqlalchemy.html)), then you don't need to handle this logic from your application.

If your driver or ORM does not implement this logic, then you will need to implement a retry loop in your application.

{% include {{page.version.version}}/misc/client-side-intervention-example.md %}

{{site.data.alerts.callout_info}}
If a consistently high percentage of your transactions are resulting in transaction retry errors, then you may need to evaluate your schema design and data access patterns to find and remove sources of contention. For more information, see [Understanding and Avoiding Transaction Contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).
{{site.data.alerts.end}}

For more information about transaction retry errors, see [Transaction retries](transactions.html#client-side-intervention).

## Unsupported SQL features

CockroachDB has support for [most SQL features](sql-feature-support.html).

Additionally, CockroachDB supports [the PostgreSQL wire protocol and the majority of its syntax](postgresql-compatibility.html). This means that existing applications can often be migrated to CockroachDB without changing application code.

However, you may encounter features of SQL or the Postgres dialect that are not supported by CockroachDB. For example, the following Postgres features are not supported:

{% include {{page.version.version}}/sql/unsupported-postgres-features.md %}

For more information about the differences between CockroachDB and Postgres feature support, see [PostgreSQL Compatibility](postgresql-compatibility.html).

For more information about the SQL standard features supported by CockroachDB, see [SQL Feature Support](sql-feature-support.html)

## Troubleshooting cluster problems

As a developer, you will mostly be working with the CockroachDB [SQL API](sql-statements.html).

However, you may need to access the underlying cluster to troubleshoot issues where the root cause is not your SQL, but something happening at the cluster level. Symptoms of cluster-level issues can include:

- Cannot join a node to an existing cluster
- Networking, client connection, or authentication issues
- Clock sync, replication, or node liveness issues
- Capacity planning, storage, or memory issues
- Node decommissioning failures

For more information about how to troubleshoot cluster-level issues, see [Troubleshoot Cluster Setup](cluster-setup-troubleshooting.html).

## See also

Reference information related to this page:

- [Troubleshoot Query Behavior](query-behavior-troubleshooting.html)
- [Troubleshoot Cluster Setup](cluster-setup-troubleshooting.html)
- [Common errors](common-errors.html)
- [Transactions](transactions.html)
- [Transaction retries](transactions.html#client-side-intervention)
- [Understanding and Avoiding Transaction Contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention)
- [SQL Layer][sql]

Other common tasks:

- [Connect to the Database](connect-to-the-database.html)
- [Insert Data](insert-data.html)
- [Query Data](query-data.html)
- [Update Data](update-data.html)
- [Delete Data](delete-data.html)
- [Run Multi-Statement Transactions](run-multi-statement-transactions.html)
- [Identify slow queries](query-behavior-troubleshooting.html#identify-slow-queries)
- [Make Queries Fast][fast]
- [Hello World Example apps](hello-world-example-apps.html)

<!-- Reference Links -->

[sql]: architecture/sql-layer.html
[fast]: make-queries-fast.html
