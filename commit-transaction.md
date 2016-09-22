---
title: COMMIT
summary: Use the COMMIT statement to commit a transaction.
toc: false
---

The `COMMIT` statement commits the current [transaction](transactions.html). 

If there were any errors during the transaction, committing it causes a [rollback](rollback-transaction.html), which discards all updates made by statements in the transaction and can potentially retry it.

{{site.data.alerts.callout_info}}To improve performance of <a href="transactions.html#transaction-retries">retrying transactions</a> from within your application, we recommend always using <a href="savepoint.html"><code>SAVEPOINT</code></a> in your transactions, which we show in the <a href="#example">example below</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/commit_transaction.html %}

## Required Privileges

No [privileges](privileges.html) are required to commit a transaction. 

## Aliases

In CockroachDB, `END` is an alias for the `COMMIT` statement.

## Example

### Commit the Current Transaction

After you `BEGIN` a transaction and identify its statements, you must `COMMIT` it to complete the transaction.

~~~ sql
> BEGIN;

> SAVEPOINT cockroach_restart;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, status) VALUES (1001, 'new');

> RELEASE SAVEPOINT cockroach_restart;

> COMMIT;
~~~

{{site.data.alerts.callout_info}}If you're using <code>SAVEPOINT</code>, which we recommend, you must execute <code>RELEASE SAVEPOINT</code> before <code>COMMIT</code>.{{site.data.alerts.end}}


## See Also

- [Transactions](transactions.html)
- [`BEGIN`](begin-transaction.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`SAVEPOINT`](savepoint.html)