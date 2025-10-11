---
title: Advanced Client-side Transaction Retries
summary: Advanced client-side transaction retry features for library authors
toc: true
---

This page has instructions for authors of [database drivers and ORMs](install-client-drivers.html) who would like to implement client-side retries in their database driver or ORM for maximum efficiency and ease of use by application developers.

{{site.data.alerts.callout_info}}
If you are an application developer who needs to implement an application-level retry loop, see the [Client-side intervention example](transactions.html#client-side-intervention-example).
{{site.data.alerts.end}}

## Overview

To improve the performance of transactions that fail due to contention, CockroachDB includes a set of statements (listed below) that let you retry those transactions. Retrying transactions using these statements has the following benefits:

1. When you use savepoints, you "hold your place in line" between attempts. Without savepoints, you're starting from scratch every time.
2. Transactions increase their priority each time they're retried, increasing the likelihood they will succeed. This has a lesser effect than #1.

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

1. The transaction starts with the [`BEGIN`](begin-transaction.html) statement.

2. The [`SAVEPOINT`](savepoint.html) statement declares the intention to retry the transaction in the case of contention errors. Note that CockroachDB's savepoint implementation does not support all savepoint functionality, such as nested transactions. It must be executed after [`BEGIN`](begin-transaction.html) but before the first statement that manipulates a database.

3. The statements in the transaction are executed.

4. If a statement returns a retry error (identified via the `40001` error code or `"retry transaction"` string at the start of the error message), you can issue the [`ROLLBACK TO SAVEPOINT`](rollback-transaction.html) statement to restart the transaction and increase the transaction's priority. Alternately, the original [`SAVEPOINT`](savepoint.html) statement can be reissued to restart the transaction.

    You must now issue the statements in the transaction again.

    In cases where you do not want the application to retry the transaction, you can simply issue [`ROLLBACK`](rollback-transaction.html) at this point. Any other statements will be rejected by the server, as is generally the case after an error has been encountered and the transaction has not been closed.

5. Once the transaction executes all statements without encountering contention errors, execute [`RELEASE SAVEPOINT`](release-savepoint.html) to commit the changes. If this succeeds, all changes made by the transaction become visible to subsequent transactions and are guaranteed to be durable if a crash occurs.

    In some cases, the [`RELEASE SAVEPOINT`](release-savepoint.html) statement itself can fail with a retry error, mainly because transactions in CockroachDB only realize that they need to be restarted when they attempt to commit. If this happens, the retry error is handled as described in step 4.

## Customizing the savepoint name

{% include {{ page.version.version }}/misc/customizing-the-savepoint-name.md %}

## Examples

For examples showing how to use [`SAVEPOINT`](savepoint.html) and the other statements described on this page to implement library support for a programming language, see the following:

- [Build a Java app with CockroachDB](build-a-java-app-with-cockroachdb.html), in particular the logic in the `runSQL` method.
- The source code of the [sqlalchemy-cockroachdb](https://github.com/cockroachdb/sqlalchemy-cockroachdb) adapter for SQLAlchemy.

## See also

- [Transactions](transactions.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`SAVEPOINT`](savepoint.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`SHOW`](show-vars.html)
- [CockroachDB Architecture: Transaction Layer](architecture/transaction-layer.html)
