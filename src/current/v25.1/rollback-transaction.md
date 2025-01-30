---
title: ROLLBACK
summary: Rolls back the current transaction and all of its nested sub-transactions, discarding all transactional updates made by statements inside the transaction.
toc: true
docs_area: reference.sql
---

The `ROLLBACK` [statement]({{ page.version.version }}/sql-statements.md) aborts the current [transaction]({{ page.version.version }}/transactions.md) and all of its [nested transactions]({{ page.version.version }}/transactions.md#nested-transactions), discarding all transactional updates made by statements included in the transaction.

There are two ways to use `ROLLBACK`:

- The `ROLLBACK` statement [rolls back the entire transaction](#rollback-a-transaction).

-  The `ROLLBACK TO SAVEPOINT` statement [rolls back and restarts the nested transaction](#rollback-a-nested-transaction) started at the corresponding `SAVEPOINT` statement, for working with [standard savepoints]({{ page.version.version }}/savepoint.md#savepoints-for-nested-transactions). This is in addition to the existing support for working with [client-side transaction retries]({{ page.version.version }}/transaction-retry-error-reference.md#client-side-retry-handling). For examples of each usage, see:

  - [Rollback a nested transaction](#rollback-a-nested-transaction)
  - [Retry a transaction](#retry-a-transaction)


## Synopsis

<div>
</div>

## Required privileges

No [privileges]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) are required to rollback a transaction. However, privileges are required for each statement within a transaction.

## Parameters

 Parameter | Description
-----------|-------------
 `TO SAVEPOINT cockroach_restart` | If using [advanced client-side transaction retries]({{ page.version.version }}/advanced-client-side-transaction-retries.md), retry the transaction. You should execute this statement when a transaction returns a `40001` / `retry transaction` error.
 `TO SAVEPOINT <name>` | If using [nested transactions]({{ page.version.version }}/savepoint.md#savepoints-for-nested-transactions), roll back and restart the [nested transaction]({{ page.version.version }}/transactions.md#nested-transactions) started at the corresponding `SAVEPOINT` statement.

## Savepoints and row locks


## Savepoints and high priority transactions


## Examples

### Rollback a transaction

Typically, an application conditionally executes rollbacks, but we can see their behavior by using `ROLLBACK` instead of `COMMIT` directly through SQL:

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
~~~

~~~ sql
> UPDATE accounts SET balance = 2500 WHERE name = 'Marciela';
~~~

~~~ sql
> ROLLBACK;
~~~

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

### Rollback a nested transaction

The `ROLLBACK TO SAVEPOINT` statement rolls back and restarts the [nested transaction]({{ page.version.version }}/transactions.md#nested-transactions) started at the corresponding `SAVEPOINT` statement.

For examples showing how to use `ROLLBACK TO SAVEPOINT` to rollback a nested transaction, see [the `SAVEPOINT` documentation on nested savepoints]({{ page.version.version }}/savepoint.md#savepoints-for-nested-transactions).

### Retry a transaction

When using [advanced client-side transaction retries]({{ page.version.version }}/advanced-client-side-transaction-retries.md), use `ROLLBACK TO SAVEPOINT` to handle a transaction that needs to be retried (identified via the `40001` error code or `restart transaction` string in the error message), and then re-execute the statements you want the transaction to contain.

~~~ sql
> ROLLBACK TO SAVEPOINT cockroach_restart;
~~~

For examples of retrying transactions in an application, check out the transaction code samples in our [Build an App with CockroachDB]({{ page.version.version }}/example-apps.md) tutorials.

## See also

- [`SAVEPOINT`]({{ page.version.version }}/savepoint.md)
- [Transactions]({{ page.version.version }}/transactions.md)
- [`BEGIN`]({{ page.version.version }}/begin-transaction.md)
- [`COMMIT`]({{ page.version.version }}/commit-transaction.md)
- [`RELEASE SAVEPOINT`]({{ page.version.version }}/release-savepoint.md)
- [`SHOW SAVEPOINT STATUS`]({{ page.version.version }}/show-savepoint-status.md)