---
title: COMMIT
summary: Commit a transaction with the COMMIT statement in CockroachDB.
toc: true
---

The `COMMIT` [statement](sql-statements.html) commits the current [transaction](transactions.html) or, when using [advanced client-side transaction retries](advanced-client-side-transaction-retries.html), clears the connection to allow new transactions to begin.

When using [advanced client-side transaction retries](advanced-client-side-transaction-retries.html), statements issued after [`SAVEPOINT`](savepoint.html) are committed when [`RELEASE SAVEPOINT`](release-savepoint.html) is issued instead of `COMMIT`. However, you must still issue a `COMMIT` statement to clear the connection for the next transaction.

For non-retryable transactions, if statements in the transaction [generated any errors](transactions.html#error-handling), `COMMIT` is equivalent to `ROLLBACK`, which aborts the transaction and discards *all* updates made by its statements.


## Synopsis

<section> {% include {{ page.version.version }}/sql/diagrams/commit_transaction.html %} </section>

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to commit a transaction. However, privileges are required for each statement within a transaction.

## Aliases

In CockroachDB, `END` is an alias for the `COMMIT` statement.

## Example

### Commit a transaction

How you commit transactions depends on how your application handles [transaction retries](transactions.html#transaction-retries).

#### Client-side retryable transactions

When using [advanced client-side transaction retries](advanced-client-side-transaction-retries.html), statements are committed by [`RELEASE SAVEPOINT`](release-savepoint.html). `COMMIT` itself only clears the connection for the next transaction.

{% include copy-clipboard.html %}
~~~ sql
> BEGIN;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SAVEPOINT cockroach_restart;
~~~

{% include copy-clipboard.html %}
~~~ sql
> UPDATE products SET inventory = 0 WHERE sku = '8675309';
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO orders (customer, sku, status) VALUES (1001, '8675309', 'new');
~~~

{% include copy-clipboard.html %}
~~~ sql
> RELEASE SAVEPOINT cockroach_restart;
~~~

{% include copy-clipboard.html %}
~~~ sql
> COMMIT;
~~~

{{site.data.alerts.callout_danger}}This example assumes you're using <a href="transactions.html#client-side-intervention">client-side intervention to handle transaction retries</a>.{{site.data.alerts.end}}

#### Automatically retried transactions

If you are using transactions that CockroachDB will [automatically retry](transactions.html#automatic-retries) (i.e., all statements sent in a single batch), commit the transaction with `COMMIT`.

{% include copy-clipboard.html %}
~~~ sql
> BEGIN; UPDATE products SET inventory = 100 WHERE = '8675309'; UPDATE products SET inventory = 100 WHERE = '8675310'; COMMIT;
~~~

## See also

- [Transactions](transactions.html)
- [`BEGIN`](begin-transaction.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`SAVEPOINT`](savepoint.html)
- [`SHOW SAVEPOINT STATUS`](show-savepoint-status.html)
