---
title: ROLLBACK
summary: Rolls back the current transaction or sub-transaction, discarding all transactional updates made by statements inside the transaction.
toc: true
---

The `ROLLBACK` [statement](sql-statements.html) aborts the current [transaction](transactions.html) or [sub-transaction](transactions.html#sub-transactions), discarding all transactional updates made by statements included in the transaction.

The base `ROLLBACK` syntax [rolls back the entire transaction](#rollback-a-transaction).

The `ROLLBACK TO SAVEPOINT` syntax rolls back and restarts the [sub-transaction](transactions.html#sub-transactions) started at the corresponding `SAVEPOINT` statement.  For more information, see [the documentation for `SAVEPOINT`](savepoint.html).

{% include {{page.version.version}}/sql/savepoint-ddl-rollbacks.md %}

When using [advanced client-side transaction retries](advanced-client-side-transaction-retries.html), use `ROLLBACK TO SAVEPOINT` to handle a transaction that needs to be retried (identified via the `40001` error code or `retry transaction` string in the error message), and then re-execute the statements you want the transaction to contain.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/rollback_transaction.html %}
</div>

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to rollback a transaction. However, privileges are required for each statement within a transaction.

## Parameters

 Parameter | Description
-----------|-------------
 `TO SAVEPOINT <name>` | If using [advanced client-side transaction retries](advanced-client-side-transaction-retries.html), retry the transaction. You should execute this statement when a transaction returns a `40001` / `retry transaction` error.

## Example

### Using rollbacks with nested savepoints

For examples showing how to use `ROLLBACK` with nested savepoints, see [the `SAVEPOINT` documentation](savepoint.html).

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

### Retry a transaction

To use [advanced client-side transaction retries](advanced-client-side-transaction-retries.html), an application must execute `ROLLBACK TO SAVEPOINT` after detecting a `40001` / `retry transaction` error:

{% include copy-clipboard.html %}
~~~ sql
> ROLLBACK TO SAVEPOINT my_retry_savepoint;
~~~

For examples of retrying transactions in an application, check out the transaction code samples in our [Build an App with CockroachDB](build-an-app-with-cockroachdb.html) tutorials.

## See also

- [`SAVEPOINT`](savepoint.html)
- [Transactions](transactions.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`SHOW SAVEPOINT STATUS`](show-savepoint-status.html)
