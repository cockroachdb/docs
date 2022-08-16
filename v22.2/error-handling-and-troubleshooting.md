---
title: Troubleshoot Common Problems
summary: How to troubleshoot problems and handle transaction retry errors during application development
toc: true
docs_area: develop
---

This page has instructions for handling errors and troubleshooting problems that may arise during application development.

## Troubleshoot query problems

If you are not satisfied with your SQL query performance, follow the instructions in [Optimize Statement Performance Overview][fast] to be sure you are avoiding common performance problems like full table scans, missing indexes, etc.

If you have already optimized your SQL queries as described in [Optimize Statement Performance Overview][fast] and are still having issues such as:

- Hanging or "stuck" queries
- Queries that are slow some of the time (but not always)
- Low throughput of queries

Take a look at [Troubleshoot SQL Behavior](query-behavior-troubleshooting.html).

{% include {{ page.version.version }}/prod-deployment/check-sql-query-performance.md %}

## Transaction retry errors

Messages with the PostgreSQL error code `40001` indicate that a transaction failed because it [conflicted with another concurrent or recent transaction accessing the same data](performance-best-practices-overview.html#transaction-contention). The transaction needs to be retried by the client.

If your language's client driver or ORM implements transaction retry logic internally (e.g., if you are using Python and [SQLAlchemy with the CockroachDB dialect](build-a-python-app-with-cockroachdb-sqlalchemy.html)), then you do not need to handle this logic from your application.

If your driver or ORM does not implement this logic, then you will need to implement a retry loop in your application.

{% include {{page.version.version}}/misc/client-side-intervention-example.md %}

{{site.data.alerts.callout_info}}
If a consistently high percentage of your transactions are resulting in transaction retry errors, then you may need to evaluate your schema design and data access patterns to find and remove sources of contention. For more information about contention, see [Transaction Contention](performance-best-practices-overview.html#transaction-contention).

For more information about what is causing a specific transaction retry error code, see the [Transaction Retry Error Reference](transaction-retry-error-reference.html).
{{site.data.alerts.end}}

For more information about transaction retry errors, see [Transaction retries](transactions.html#client-side-intervention).

## Unsupported SQL features

CockroachDB has support for [most SQL features](sql-feature-support.html).

Additionally, CockroachDB supports [the PostgreSQL wire protocol and the majority of its syntax](postgresql-compatibility.html). This means that existing applications can often be migrated to CockroachDB without changing application code.

However, you may encounter features of SQL or the PostgreSQL dialect that are not supported by CockroachDB. For example, the following PostgreSQL features are not supported:

{% include {{page.version.version}}/sql/unsupported-postgres-features.md %}

For more information about the differences between CockroachDB and PostgreSQL feature support, see [PostgreSQL Compatibility](postgresql-compatibility.html).

For more information about the SQL standard features supported by CockroachDB, see [SQL Feature Support](sql-feature-support.html).

## Troubleshoot cluster problems

As a developer, you will mostly be working with the CockroachDB [SQL API](sql-statements.html).

However, you may need to access the underlying cluster to troubleshoot issues where the root cause is not your SQL, but something happening at the cluster level. Symptoms of cluster-level issues can include:

- Cannot join a node to an existing cluster
- Networking, client connection, or authentication issues
- Clock sync, replication, or node liveness issues
- Capacity planning, storage, or memory issues
- Node decommissioning failures

For more information about how to troubleshoot cluster-level issues, see [Troubleshoot Cluster Setup](cluster-setup-troubleshooting.html).

## See also

### Tasks

- [Connect to a CockroachDB Cluster](connect-to-the-database.html)
- [Run Multi-Statement Transactions](run-multi-statement-transactions.html)
- [Optimize Statement Performance Overview][fast]

### Reference

- [Common Errors and Solutions](common-errors.html)
- [Transactions](transactions.html)
- [Transaction retries](transactions.html#client-side-intervention)
- [SQL Layer][sql]

<!-- Reference Links -->

[sql]: architecture/sql-layer.html
[fast]: make-queries-fast.html
