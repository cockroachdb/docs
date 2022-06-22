---
title: ROLLBACK
summary: Abort the current transaction, discarding all updates made by statements included in the transaction with the ROLLBACK statement in CockroachDB.
toc: true
---

The `ROLLBACK` [statement](sql-statements.html) aborts the current [transaction](transactions.html), discarding all updates made by statements included in the transaction.

When using [advanced client-side transaction retries](advanced-client-side-transaction-retries.html), use `ROLLBACK TO SAVEPOINT` to handle a transaction that needs to be retried (identified via the `40001` error code or `restart transaction` string in the error message), and then re-execute the statements you want the transaction to contain.

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

## Example

### Rollback a transaction

Typically, an application conditionally executes rollbacks, but we can see their behavior by using `ROLLBACK` instead of `COMMIT` directly through SQL:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> BEGIN;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> UPDATE accounts SET balance = 2500 WHERE name = 'Marciela';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ROLLBACK;
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> ROLLBACK TO SAVEPOINT cockroach_restart;
~~~

For examples of retrying transactions in an application, check out the transaction code samples in our [Build an App with CockroachDB](hello-world-example-apps.html) tutorials.

## See also

- [Transactions](transactions.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`SAVEPOINT`](savepoint.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
