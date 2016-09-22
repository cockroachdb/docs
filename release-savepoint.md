---
title: RELEASE SAVEPOINT
summary: Commit a transaction's changes once there are no retryable errors with the RELEASE SAVEPOINT cockroach_restart statement in CockroachDB.
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

### Commit the Current Transaction

After declaring `SAVEPOINT cockroach_restart`, you must release it before you `COMMIT` the transaction.

~~~ sql
> BEGIN;

> SAVEPOINT cockroach_restart;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, status) VALUES (1001, 'new');

> RELEASE SAVEPOINT cockroach_restart;

> COMMIT;
~~~

When using `SAVEPOINT`, your application also needs to include functions to retry transactions contending for the same resources using <a href="rollback-transaction.html#retry-a-transaction"><code>ROLLBACK TO cockroach_restart</code></a>.

## See Also

- [Transactions](transactions.html)
- [`SAVEPOINT`](savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
