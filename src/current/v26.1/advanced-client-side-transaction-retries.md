---
title: Advanced Client-side Transaction Retries
summary: Advanced client-side transaction retry features for library authors
toc: true
docs_area: develop
---

This page has instructions for authors of [database drivers and ORMs]({% link {{ page.version.version }}/install-client-drivers.md %}) who would like to implement client-side retries in their database driver or ORM for maximum efficiency and ease of use by application developers.

{{site.data.alerts.callout_info}}
If you are an application developer who needs to implement an application-level retry loop, see the [client-side retry handling example]({% link {{ page.version.version }}/transaction-retry-error-example.md %}).
{{site.data.alerts.end}}

## Overview

To improve the performance of transactions that fail due to [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention), CockroachDB includes a set of statements (listed below) that let you retry those transactions. Retrying transactions using these statements has the benefit that when you use savepoints, you "hold your place in line" between attempts. Without savepoints, you're starting from scratch every time.

## How transaction retries work

A retryable transaction goes through the process described below, which maps to the following SQL statements:

{% include_cached copy-clipboard.html %}
~~~ sql
> BEGIN;                                  -- #1
> SAVEPOINT cockroach_restart;            -- #2
-- ... various transaction statements ... -- #3
> RELEASE SAVEPOINT cockroach_restart;    -- #5 (Or #4, ROLLBACK, in case of retry error)
> COMMIT;
~~~

1. The transaction starts with the [`BEGIN`]({% link {{ page.version.version }}/begin-transaction.md %}) statement.

1. The [`SAVEPOINT`]({% link {{ page.version.version }}/savepoint.md %}) statement shown here is a [retry savepoint](#retry-savepoints); that is, it declares the intention to retry the transaction in the case of contention errors. It must be executed after [`BEGIN`]({% link {{ page.version.version }}/begin-transaction.md %}), but before the first statement that manipulates a database. Although [nested transactions]({% link {{ page.version.version }}/savepoint.md %}#savepoints-for-nested-transactions) are supported in versions of CockroachDB 20.1 and later, a retry savepoint must be the outermost savepoint in a transaction.

1. The statements in the transaction are executed.

1. If a statement returns a retry error (identified via the `40001` error code or `"restart transaction"` string at the start of the error message), you can issue the [`ROLLBACK TO SAVEPOINT`]({% link {{ page.version.version }}/rollback-transaction.md %}) statement to restart the transaction. Alternately, the original [`SAVEPOINT`]({% link {{ page.version.version }}/savepoint.md %}) statement can be reissued to restart the transaction.

    You must now issue the statements in the transaction again.

    In cases where you do not want the application to retry the transaction, you can issue [`ROLLBACK`]({% link {{ page.version.version }}/rollback-transaction.md %}) at this point. Any other statements will be rejected by the server, as is generally the case after an error has been encountered and the transaction has not been closed.

1. Once the transaction executes all statements without encountering contention errors, execute [`RELEASE SAVEPOINT`]({% link {{ page.version.version }}/release-savepoint.md %}) to commit the changes. If this succeeds, all changes made by the transaction become visible to subsequent transactions and are guaranteed to be durable if a crash occurs.

    In some cases, the [`RELEASE SAVEPOINT`]({% link {{ page.version.version }}/release-savepoint.md %}) statement itself can fail with a retry error, mainly because transactions in CockroachDB only realize that they need to be restarted when they attempt to commit. If this happens, the retry error is handled as described in step 4.

## Retry savepoints

A savepoint defined with the name `cockroach_restart` is a "retry savepoint" and is used to implement advanced client-side transaction retries. A retry savepoint differs from a [savepoint for nested transactions]({% link {{ page.version.version }}/savepoint.md %}#savepoints-for-nested-transactions) as follows:

- It must be the outermost savepoint in the transaction.
- After a successful [`RELEASE`]({% link {{ page.version.version }}/release-savepoint.md %}), a retry savepoint does not allow further use of the transaction. The next statement must be a [`COMMIT`]({% link {{ page.version.version }}/commit-transaction.md %}).
- It cannot be nested. Issuing `SAVEPOINT cockroach_restart` two times in a row only creates a single savepoint marker (this can be verified with [`SHOW SAVEPOINT STATUS`]({% link {{ page.version.version }}/show-savepoint-status.md %})). Issuing `SAVEPOINT cockroach_restart` after `ROLLBACK TO SAVEPOINT cockroach_restart` reuses the marker instead of creating a new one.

Note that you can [customize the retry savepoint name](#customizing-the-retry-savepoint-name) to something other than `cockroach_restart` with a session variable if you need to.

## Customizing the retry savepoint name

{% include {{ page.version.version }}/misc/customizing-the-savepoint-name.md %}

## Examples

For examples showing how to use [`SAVEPOINT`]({% link {{ page.version.version }}/savepoint.md %}) and the other statements described on this page to implement library support for a programming language, see the following:

- [Build a Java app with CockroachDB]({% link {{ page.version.version }}/build-a-java-app-with-cockroachdb.md %}), in particular the logic in the `runSQL` method.
- The source code of the [sqlalchemy-cockroachdb](https://github.com/cockroachdb/sqlalchemy-cockroachdb) adapter for SQLAlchemy.

## See also

- [Transactions]({% link {{ page.version.version }}/transactions.md %})
- [`BEGIN`]({% link {{ page.version.version }}/begin-transaction.md %})
- [`COMMIT`]({% link {{ page.version.version }}/commit-transaction.md %})
- [`ROLLBACK`]({% link {{ page.version.version }}/rollback-transaction.md %})
- [`SAVEPOINT`]({% link {{ page.version.version }}/savepoint.md %})
- [`RELEASE SAVEPOINT`]({% link {{ page.version.version }}/release-savepoint.md %})
- [`SHOW`]({% link {{ page.version.version }}/show-vars.md %})
- [DB Console Transactions Page]({% link {{ page.version.version }}/ui-transactions-page.md %})
- [CockroachDB Architecture: Transaction Layer]({% link {{ page.version.version }}/architecture/transaction-layer.md %})
