---
title: SET TRANSACTION
summary: The SET TRANSACTION statement sets the transaction isolation level and/or priority for the current session or for an individual transaction.
toc: false
---

The `SET TRANSACTION` [statement](sql-statements.html) sets the transaction isolation level or priority after you [`BEGIN`](begin-transaction.html) it but before executing the first statement that manipulates a database.

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/set_transaction.html %}

## Required Privileges

No [privileges](privileges.html) are required to set the transaction isolation level or priority. However, privileges are required for each statement within a transaction.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `ISOLATION LEVEL` | If you don't want the transaction to run as `SERIALIZABLE` (CockroachDB's default, which provides the highest level of isolation), you can set the isolation level to `SNAPSHOT`, which can provide better performance in high-contention scenarios.<br/><br/>For more information, see [Transactions: Isolation Levels](transactions.html#isolation-levels).<br/><br/>**Default**: `SERIALIZABLE` |
| `PRIORITY` | If you don't want the transaction to run with `NORMAL` priority, you can set it to `LOW` or `HIGH`.<br/><br/>When transactions contend for access to the same resources, the transaction with the highest priority executes first; the lower priority transaction is then retried inheriting the priority of the "winning" transaction. This means the longer a transaction contends for resources, the more likely it is to succeed.<br/><br/>For more information, see [Transactions: Priorities](transactions.html#transaction-priorities).<br/><br/>**Default**: `NORMAL` |

## Examples

### Use Snapshot Isolation & Change Priority 

You can set a transaction's isolation level to `SNAPSHOT`, as well as its priority to `LOW` or `HIGH`.

~~~ sql
> BEGIN;

> SET ISOLATION LEVEL SNAPSHOT, PRIORITY HIGH;

> SAVEPOINT cockroach_restart;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, status) VALUES (1001, 'new');

> RELEASE SAVEPOINT cockroach_restart;

> COMMIT;
~~~

{{site.data.alerts.callout_info}}If you are using <code>SAVEPOINT</code>, which we recommend, you must execute it immediately after executing <code>BEGIN</code>.<br/><br/>Your application also needs to include functions to retry transactions contending for the same resources using <a href="rollback-transaction.html#retry-a-transaction"><code>ROLLBACK TO cockroach_restart</code></a>.{{site.data.alerts.end}}

## See Also

- [Transactions](transactions.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`SAVEPOINT`](savepoint.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
