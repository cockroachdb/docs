---
title: ROLLBACK
summary: Abort the current transaction, discarding all updates made by statements included in the transaction with the ROLLBACK statement in CockroachDB.
toc: false
---

The `ROLLBACK` [statement](sql-statements.html) aborts the current [transaction](transactions.html), discarding all updates made by statements included in the transaction.

When using the CockroachDB-provided function for client-side transaction retries, the `ROLLBACK TO SAVEPOINT cockroach_restart` statement restarts the transaction if any included statement returns a retryable error (identified via the `40001` error code or `retry transaction` string in the error message). For more details, see [Transaction Retries](transactions.html#transaction-retries). 

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/rollback_transaction.html %}

## Required Privileges

No [privileges](privileges.html) are required to rollback a transaction. However, privileges are required for each statement within a transaction.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `TO cockroach_restart` | If using [client-side retries](transactions.html#transaction-retries), restart the transaction if any included statement returns a `40001` error or `retry transaction` error message |

## Example

### Rollback a Transaction

Typically, your application conditionally executes rollbacks but you can see their behavior by using `ROLLBACK` instead of `COMMIT` directly through SQL.

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

To use client-side transaction retries, your application must execute `ROLLBACK TO cockroach_restart` after detecting a `40001` error or `retry transaction` error message.

~~~ sql
> ROLLBACK TO cockroach_restart;
~~~

For examples of retrying transactions from your application, check out our [transaction code samples](build-a-test-app.html#step-4-execute-transactions-from-a-client).

## See Also

- [Transactions](transactions.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`SAVEPOINT`](savepoint.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
