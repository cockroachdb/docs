---
title: SAVEPOINT
summary: The SAVEPOINT cockroach_restart statement identifies the intent to retry aborted transactions.
toc: false
---

The `SAVEPOINT cockroach_restart` statement defines the intent to retry [transactions](transactions.html) using the CockroachDB-provided function for client-side transaction retries. For more information, see [Transaction Retries](transactions.html#transaction-retries).

{{site.data.alerts.callout_danger}}CockroachDB’s <code>SAVEPOINT</code> implementation does not support all savepoint functionality, such as nested transactions.<br/><br/>CockroachDB only supports this special <code>SAVEPOINT</code> and no others.{{site.data.alerts.end}}

<div id="toc"></div>
 
## Synopsis

{% include sql/diagrams/savepoint.html %}

## Required Privileges

No [privileges](privileges.html) are required to create a savepoint. However, privileges are required for each statement within a transaction.

## Example

### Create Savepoint

After you `BEGIN` the transaction, you must create the savepoint to identify that if the transaction contends for resources with another transaction and "loses", you want to retry it with the function for client-side transaction retries.

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
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`ROLLBACK`](rollback-transaction.html)