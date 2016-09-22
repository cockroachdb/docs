---
title: RELEASE SAVEPOINT
summary: Commit a transaction's changes once there are no retryable errors with the RELEASE SAVEPOINT cockroach_restart statement in CockroachDB.
toc: false
---

When using [client-side transaction retries](transactions.html#client-side-transaction-retries), `RELEASE SAVEPOINT cockroach_restart` statement commits the transaction.

Despite committing the transaction, you must still issue a [`COMMIT`](commit-transaction.html) statement to prepare the connection for the next transaction.

{{site.data.alerts.callout_info}}<code>RELEASE SAVEPOINT</code> is supported only for this special savepoint, <code>cockroach_restart</code>.{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/release_savepoint.html %}

## Required Privileges

No [privileges](privileges.html) are required to release a savepoint. However, privileges are required for each statement within a transaction.

## Examples

### Commit a Transaction

After declaring `SAVEPOINT cockroach_restart`, commit the transactions with `RELEASE SAVEPOINT cockroach_restart` and then prepare the connection for the next transaction with `COMMIT`.

~~~ sql
> BEGIN;

> SAVEPOINT cockroach_restart;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, status) VALUES (1001, 'new');

> RELEASE SAVEPOINT cockroach_restart;

> COMMIT;
~~~

{{site.data.alerts.callout_danger}}This examples requires <a href="transactions.html#client-side-intervention">client-side intervention to handle transaction retries</a>.{{site.data.alerts.end}}

## See Also

- [Transactions](transactions.html)
- [`SAVEPOINT`](savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
