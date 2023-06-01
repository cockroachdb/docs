---
title: COMMIT
summary: Commit a transaction with the COMMIT statement in CockroachDB.
toc: true
---

The `COMMIT` [statement](sql-statements.html) commits the current [transaction](transactions.html) or, when using [client-side transaction retries](transactions.html#client-side-transaction-retries), clears the connection to allow new transactions to begin.

When using [client-side transaction retries](transactions.html#client-side-transaction-retries), statements issued after [`SAVEPOINT cockroach_restart`](savepoint.html) are committed when [`RELEASE SAVEPOINT cockroach_restart`](release-savepoint.html) is issued instead of `COMMIT`. However, you must still issue a `COMMIT` statement to clear the connection for the next transaction.

For non-retryable transactions, if statements in the transaction [generated any errors](transactions.html#error-handling), `COMMIT` is equivalent to `ROLLBACK`, which aborts the transaction and discards *all* updates made by its statements.


## Synopsis

{% include {{ page.version.version }}/sql/diagrams/commit_transaction.html %}

## Required Privileges

No [privileges](privileges.html) are required to commit a transaction. However, privileges are required for each statement within a transaction.

## Aliases

In CockroachDB, `END` is an alias for the `COMMIT` statement.

## Example

### Commit a Transaction

How you commit transactions depends on how your application handles [transaction retries](transactions.html#transaction-retries).

#### Client-Side Retryable Transactions

When using [client-side transaction retries](transactions.html#client-side-transaction-retries), statements are committed by [`RELEASE SAVEPOINT cockroach_restart`](release-savepoint.html). `COMMIT` itself only clears the connection for the next transaction.

~~~ sql
> BEGIN;

> SAVEPOINT cockroach_restart;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, sku, status) VALUES (1001, '8675309', 'new');

> RELEASE SAVEPOINT cockroach_restart;

> COMMIT;
~~~

{{site.data.alerts.callout_danger}}This example assumes you're using <a href="transactions.html#client-side-intervention">client-side intervention to handle transaction retries</a>.{{site.data.alerts.end}}

#### Automatically Retried Transactions

If you are using transactions that CockroachDB will [automatically retry](transactions.html#automatic-retries) (i.e., all statements sent in a single batch), commit the transaction with `COMMIT`.

~~~ sql
> BEGIN; UPDATE products SET inventory = 100 WHERE = '8675309'; UPDATE products SET inventory = 100 WHERE = '8675310'; COMMIT;
~~~

## See Also

- [Transactions](transactions.html)
- [`BEGIN`](begin-transaction.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`SAVEPOINT`](savepoint.html)
