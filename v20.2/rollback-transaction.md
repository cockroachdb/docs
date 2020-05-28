---
title: ROLLBACK
summary: Rolls back the current transaction and all of its nested sub-transactions, discarding all transactional updates made by statements inside the transaction.
toc: true
---

The `ROLLBACK` [statement](sql-statements.html) aborts the current [transaction](transactions.html) and all of its [nested transactions](transactions.html#nested-transactions), discarding all transactional updates made by statements included in the transaction.

There are two ways to use `ROLLBACK`:

- The `ROLLBACK` statement [rolls back the entire transaction](#rollback-a-transaction).

-  The `ROLLBACK TO SAVEPOINT` statement [rolls back and restarts the nested transaction](#rollback-a-nested-transaction) started at the corresponding `SAVEPOINT` statement, for working with [standard savepoints](savepoint.html#savepoints-for-nested-transactions).  This is in addition to the existing support for working with [client-side transaction retries](transactions.html#client-side-intervention).  For examples of each usage, see:

  - [Rollback a nested transaction](#rollback-a-nested-transaction)
  - [Retry a transaction](#retry-a-transaction)

{% include {{page.version.version}}/sql/savepoint-ddl-rollbacks.md %}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/rollback_transaction.html %}
</div>

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to rollback a transaction. However, privileges are required for each statement within a transaction.

## Parameters

 Parameter | Description
-----------|-------------
 `TO SAVEPOINT cockroach_restart` | If using [advanced client-side transaction retries](advanced-client-side-transaction-retries.html), retry the transaction. You should execute this statement when a transaction returns a `40001` / `retry transaction` error.
 `TO SAVEPOINT <name>` | If using [nested transactions](savepoint.html#savepoints-for-nested-transactions), roll back and restart the [nested transaction](transactions.html#nested-transactions) started at the corresponding `SAVEPOINT` statement.

## Savepoints and row locks

{% include {{page.version.version}}/sql/savepoints-and-row-locks.md %}

## Savepoints and high priority transactions

{% include {{page.version.version}}/sql/savepoints-and-high-priority-transactions.md %}

## Examples

### Rollback a transaction

Typically, an application conditionally executes rollbacks, but we can see their behavior by using `ROLLBACK` instead of `COMMIT` directly through SQL:

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> BEGIN;
~~~

{% include copy-clipboard.html %}
~~~ sql
> UPDATE accounts SET balance = 2500 WHERE name = 'Marciela';
~~~

{% include copy-clipboard.html %}
~~~ sql
> ROLLBACK;
~~~

{% include copy-clipboard.html %}
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

The `ROLLBACK TO SAVEPOINT` statement rolls back and restarts the [nested transaction](transactions.html#nested-transactions) started at the corresponding `SAVEPOINT` statement.

For examples showing how to use `ROLLBACK TO SAVEPOINT` to rollback a nested transaction, see [the `SAVEPOINT` documentation on nested savepoints](savepoint.html#savepoints-for-nested-transactions).

### Retry a transaction

When using [advanced client-side transaction retries](advanced-client-side-transaction-retries.html), use `ROLLBACK TO SAVEPOINT` to handle a transaction that needs to be retried (identified via the `40001` error code or `restart transaction` string in the error message), and then re-execute the statements you want the transaction to contain.

{% include copy-clipboard.html %}
~~~ sql
> ROLLBACK TO SAVEPOINT cockroach_restart;
~~~

For examples of retrying transactions in an application, check out the transaction code samples in our [Build an App with CockroachDB](build-an-app-with-cockroachdb.html) tutorials.

## See also

- [`SAVEPOINT`](savepoint.html)
- [Transactions](transactions.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`SHOW SAVEPOINT STATUS`](show-savepoint-status.html)
