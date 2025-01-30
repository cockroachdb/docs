---
title: COMMIT
summary: Commit a transaction with the COMMIT statement in CockroachDB.
toc: true
docs_area: reference.sql
---

The `COMMIT` [statement]({{ page.version.version }}/sql-statements.md) commits the current [transaction]({{ page.version.version }}/transactions.md) or, when using [advanced client-side transaction retries]({{ page.version.version }}/advanced-client-side-transaction-retries.md), clears the connection to allow new transactions to begin.

When using [advanced client-side transaction retries]({{ page.version.version }}/advanced-client-side-transaction-retries.md), statements issued after [`SAVEPOINT`]({{ page.version.version }}/savepoint.md) are committed when [`RELEASE SAVEPOINT`]({{ page.version.version }}/release-savepoint.md) is issued instead of `COMMIT`. However, you must still issue a `COMMIT` statement to clear the connection for the next transaction.

For non-retryable transactions, if statements in the transaction [generated any errors]({{ page.version.version }}/transactions.md#error-handling), `COMMIT` is equivalent to `ROLLBACK`, which aborts the transaction and discards *all* updates made by its statements.


## Synopsis

<div>
</div>

## Required privileges

No [privileges]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) are required to commit a transaction. However, privileges are required for each statement within a transaction.

## Aliases

In CockroachDB, `END` is an alias for the `COMMIT` statement.

## Example

### Commit a transaction

How you commit transactions depends on how your application handles [transaction retries]({{ page.version.version }}/transactions.md#transaction-retries).

#### Client-side retryable transactions

When using [advanced client-side transaction retries]({{ page.version.version }}/advanced-client-side-transaction-retries.md), statements are committed by [`RELEASE SAVEPOINT`]({{ page.version.version }}/release-savepoint.md). `COMMIT` itself only clears the connection for the next transaction.

~~~ sql
> BEGIN;
~~~

~~~ sql
> SAVEPOINT cockroach_restart;
~~~

~~~ sql
> UPDATE products SET inventory = 0 WHERE sku = '8675309';
~~~

~~~ sql
> INSERT INTO orders (customer, sku, status) VALUES (1001, '8675309', 'new');
~~~

~~~ sql
> RELEASE SAVEPOINT cockroach_restart;
~~~

~~~ sql
> COMMIT;
~~~

{{site.data.alerts.callout_danger}}This example assumes you're using <a href="transaction-retry-error-reference.html#client-side-retry-handling">client-side retry handling</a>.{{site.data.alerts.end}}

#### Automatically retried transactions

If you are using transactions that CockroachDB will [automatically retry]({{ page.version.version }}/transactions.md#automatic-retries) (i.e., all statements sent in a single batch), commit the transaction with `COMMIT`.

~~~ sql
> BEGIN; UPDATE products SET inventory = 100 WHERE = '8675309'; UPDATE products SET inventory = 100 WHERE = '8675310'; COMMIT;
~~~

## See also

- [Transactions]({{ page.version.version }}/transactions.md)
- [`BEGIN`]({{ page.version.version }}/begin-transaction.md)
- [`RELEASE SAVEPOINT`]({{ page.version.version }}/release-savepoint.md)
- [`ROLLBACK`]({{ page.version.version }}/rollback-transaction.md)
- [`SAVEPOINT`]({{ page.version.version }}/savepoint.md)
- [`SHOW SAVEPOINT STATUS`]({{ page.version.version }}/show-savepoint-status.md)