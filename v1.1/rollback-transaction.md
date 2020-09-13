---
title: ROLLBACK
summary: Abort the current transaction, discarding all updates made by statements included in the transaction with the ROLLBACK statement in CockroachDB.
toc: true
---

The `ROLLBACK` [statement](sql-statements.html) aborts the current [transaction](transactions.html), discarding all updates made by statements included in the transaction.

When using [client-side transaction retries](transactions.html#client-side-transaction-retries), use `ROLLBACK TO SAVEPOINT cockroach_restart` to handle a transaction that needs to be retried (identified via the `40001` error code or `retry transaction` string in the error message), and then re-execute the statements you want the transaction to contain.


## Synopsis

{% include {{ page.version.version }}/sql/diagrams/rollback_transaction.html %}

## Required Privileges

No [privileges](privileges.html) are required to rollback a transaction. However, privileges are required for each statement within a transaction.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `TO SAVEPOINT cockroach_restart` | If using [client-side transaction retries](transactions.html#client-side-transaction-retries), retry the transaction. You should execute this statement when a transaction returns a `40001` / `retry transaction` error. |

## Example

### Rollback a Transaction

Typically, your application conditionally executes rollbacks, but you can see their behavior by using `ROLLBACK` instead of `COMMIT` directly through SQL.

~~~ sql
> SELECT * FROM accounts;
~~~
~~~
+----------+---------+
|   name   | balance |
+----------+---------+
| Marciela |    1000 |
+----------+---------+
~~~
~~~ sql
> BEGIN;

> UPDATE accounts SET balance = 2500 WHERE name = 'Marciela';

> ROLLBACK;

> SELECT * FROM accounts;
~~~
~~~
+----------+---------+
|   name   | balance |
+----------+---------+
| Marciela |    1000 |
+----------+---------+
~~~

### Retry a Transaction

To use [client-side transaction retries](transactions.html#client-side-transaction-retries), your application must execute `ROLLBACK TO SAVEPOINT cockroach_restart` after detecting a `40001` / `retry transaction` error.

~~~ sql
> ROLLBACK TO SAVEPOINT cockroach_restart;
~~~

For examples of retrying transactions in your application, check out the transaction code samples in our [Build an App with CockroachDB](build-an-app-with-cockroachdb.html) tutorials.

## See Also

- [Transactions](transactions.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`SAVEPOINT`](savepoint.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
