---
title: RELEASE SAVEPOINT cockroach_restart
summary: Commit a transaction's changes once there are no retryable errors with the RELEASE SAVEPOINT cockroach_restart statement in CockroachDB.
toc: false
---

When using [client-side transaction retries](transactions.html#client-side-transaction-retries), the `RELEASE SAVEPOINT cockroach_restart` statement commits the transaction.

If statements in the transaction [generated any non-retryable errors](transactions.html#error-handling), `RELEASE SAVEPOINT cockroach_restart` is equivalent to [`ROLLBACK`](rollback-transaction.html), which aborts the transaction and discards *all* updates made by its statements.

Despite committing the transaction, you must still issue a [`COMMIT`](commit-transaction.html) statement to prepare the connection for the next transaction.

{{site.data.alerts.callout_danger}}CockroachDB’s <code>SAVEPOINT</code> implementation only supports the <code>cockroach_restart</code> savepoint and does not support all savepoint functionality, such as nested transactions.{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/release_savepoint.html %}

## Required Privileges

No [privileges](privileges.html) are required to release a savepoint. However, privileges are required for each statement within a transaction.

## Examples

### Commit a Transaction

After declaring `SAVEPOINT cockroach_restart`, commit the transaction with `RELEASE SAVEPOINT cockroach_restart` and then prepare the connection for the next transaction with `COMMIT`.

~~~ sql
> BEGIN;

> SAVEPOINT cockroach_restart;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, sku, status) VALUES (1001, '8675309', 'new');

> RELEASE SAVEPOINT cockroach_restart;

> COMMIT;
~~~

{{site.data.alerts.callout_danger}}This example assumes you're using <a href="transactions.html#client-side-intervention">client-side intervention to handle transaction retries</a>.{{site.data.alerts.end}}

## See Also

- [Transactions](transactions.html)
- [`SAVEPOINT`](savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
