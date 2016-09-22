---
title: RELEASE SAVEPOINT
summary: The RELEASE SAVEPOINT cockroach_restart statement commits a transaction's changes once there are no retryable errors.
toc: false
---

When using the CockroachDB-provided function for [client-side transaction retries](transactions.html#transaction-retries) (i.e., [`SAVEPOINT`](savepoint.html)), the `RELEASE SAVEPOINT cockroach_restart` statement commits the transaction's changes once there are no retryable errors. 

{{site.data.alerts.callout_info}}<code>RELEASE SAVEPOINT</code> is supported only for this special savepoint, <code>cockroach_restart</code>. For more details, see <a href="transactions.html#transaction-retries">Transaction Retries</a>. {{site.data.alerts.end}}


<div id="toc"></div>

## Synopsis

{% include sql/diagrams/release_savepoint.html %}

## Required Privileges

No [privileges](privileges.html) are required to release a savepoint. However, privileges are required for each statement within a transaction.

## Examples

~~~ sql
> BEGIN;

> SAVEPOINT cockroach_restart;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, status) VALUES (1001, 'new');

> RELEASE SAVEPOINT cockroach_restart;

> COMMIT;
~~~

## See Also

- [Transactions](transactions.html)
- [`SAVEPOINT`](savepoint.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`ROLLBACK`](rollback-transaction.html)
