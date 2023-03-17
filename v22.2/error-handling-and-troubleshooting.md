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

- [Hanging or "stuck" queries](query-behavior-troubleshooting.html#hanging-or-stuck-queries), usually due to [contention](performance-best-practices-overview.html#transaction-contention) with long-running transactions
- Queries that are slow some of the time (but not always)
- Low throughput of queries

Take a look at [Troubleshoot SQL Behavior](query-behavior-troubleshooting.html).

{% include {{ page.version.version }}/prod-deployment/check-sql-query-performance.md %}

## Transaction retry errors

Messages with [the PostgreSQL error code `40001` and the string `restart transaction`](common-errors.html#restart-transaction) indicate that a transaction failed because it [conflicted with another concurrent or recent transaction accessing the same data](performance-best-practices-overview.html#transaction-contention). The transaction needs to be retried by the client.

If your language's client driver or ORM implements transaction retry logic internally (e.g., if you are using Python and [SQLAlchemy with the CockroachDB dialect](build-a-python-app-with-cockroachdb-sqlalchemy.html)), then you do not need to handle this logic from your application.

If your driver or ORM does not implement this logic, then you will need to implement a retry loop in your application.

{% include {{page.version.version}}/misc/client-side-intervention-example.md %}

{{site.data.alerts.callout_info}}
If a consistently high percentage of your transactions are resulting in [transaction retry errors with the error code `40001` and the string `restart transaction`](common-errors.html#restart-transaction), then you may need to evaluate your [schema design](schema-design-overview.html) and data access patterns to find and remove sources of contention. For more information about contention, see [Transaction Contention](performance-best-practices-overview.html#transaction-contention).

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

## Troubleshoot SQL client application problems

<a name="scram-client-troubleshooting"></a>

### High client CPU load, connection pool exhaustion, or increased connection latency when SCRAM Password-based Authentication is enabled

+ [Overview](#overview)
+ [Mitigation steps while keeping SCRAM enabled](#mitigation-steps-while-keeping-scram-enabled)
+ [Downgrade from SCRAM authentication](#downgrade-from-scram-authentication)

#### Overview

When [SASL/SCRAM-SHA-256 Secure Password-based Authentication](security-reference/scram-authentication.html) (SCRAM Authentication) is enabled on a cluster, some additional CPU load is incurred on client applications, which are responsible for handling SCRAM hashing. It's important to plan for this additional CPU load to avoid performance degradation, CPU starvation, and [connection pool](connection-pooling.html) exhaustion on the client. For example, the following set of circumstances can exhaust the client application's resources:

1. SCRAM Authentication is enabled on the cluster (the `server.user_login.password_encryption` [cluster setting](cluster-settings.html#setting-server-user-login-password-encryption) is set to `scram-sha-256`).
1. The client driver's [connection pool](connection-pooling.html) has no defined maximum number of connections, or is configured to close idle connections eagerly.
1. The client application issues [transactions](transactions.html) concurrently.

In this situation, each new connection uses more CPU on the client application server than connecting to a cluster without SCRAM Authentication enabled. Because of this additional CPU load, each concurrent transaction is slower, and a larger quantity of concurrent transactions can accumulate, in conjunction with a larger number of concurrent connections. In this situation, it can be difficult for the client application server to recover.

Some applications may also see increased connection latency. This can happen because SCRAM incurs additional round trips during authentication which can add latency to the initial connection.

For more information about how SCRAM works, see [SASL/SCRAM-SHA-256 Secure Password-based Authentication](security-reference/scram-authentication.html).

#### Mitigation steps while keeping SCRAM enabled

To mitigate against this situation while keeping SCRAM authentication enabled, Cockroach Labs recommends that you:

{% include_cached {{page.version.version}}/scram-authentication-recommendations.md %}

#### Downgrade from SCRAM authentication

As an alternative to the [mitigation steps listed above](#mitigation-steps-while-keeping-scram-enabled), you can downgrade from SCRAM authentication by taking the following steps.

1. Turn off the `server.user_login.cert_password_method.auto_scram_promotion.enabled` [cluster setting](cluster-settings.html#setting-server-user-login-cert-password-method-auto-scram-promotion-enabled):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING server.user_login.upgrade_bcrypt_stored_passwords_to_scram.enabled = false;
    ~~~

1. Change the user password encryption algorithm to [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) by setting the [`server.user_login.password_encryption` cluster setting](cluster-settings.html#setting-server-user-login-password-encryption) to `crdb-bcrypt`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING server.user_login.password_encryption='crdb-bcrypt';
    ~~~

1. For each [SQL user](create-user.html) in the system, run [`ALTER USER {user} .. WITH PASSWORD`](alter-user.html#change-a-users-password) to encode the user's password using bcrypt.  Note that this can be the same password as the user's current password.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER USER {user} WITH PASSWORD {password};
    ~~~

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
