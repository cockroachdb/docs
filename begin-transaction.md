---
title: BEGIN
summary: Use the BEGIN statement to initiate a CockroachDB transaction.
toc: false
---

The `BEGIN` [statement](sql-statements.html) initiates a [transaction](transactions.html), which either successfully executes all of the statements it contains or none at all.

{{site.data.alerts.callout_info}}To improve performance of <a href="transactions.html#transaction-retries">retrying transactions</a> from within your application, we recommend always using <a href="savepoint.html"><code>SAVEPOINT</code></a> in your transactions, which we show in the <a href="#examples">examples below</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/begin_transaction.html %}

## Required Privileges

No [privileges](privileges.html) are required to initiate a transaction. However, privileges are required for each statement within a transaction.

## Aliases

In CockroachDB, the following are aliases for the `BEGIN` statement:

- `BEGIN TRANSACTION` 
- `START TRANSACTION`

The following aliases also exist for isolation levels:

- `REPEATABLE READ` is an alias for `SERIALIZABLE`
- `READ UNCOMMITTED` and `READ COMMITTED` are aliases for `SNAPSHOT`

For more information, see [Comparison to ANSI SQL Isolation Levels](transactions.html#comparison-to-ansi-sql-isolation-levelshttpsenwikipediaorgwikiisolationdatabasesystemsisolationlevels).

## Parameters

| Parameter | Description |
|-----------|-------------|
| `ISOLATION LEVEL` | If you don't want the transaction to run as `SERIALIZABLE` (CockroachDB's default, which provides the highest level of isolation), you can specify `SNAPSHOT`, which can provide better performance in high-contention scenarios.<br/><br/>For more information, see [Transactions: Isolation Levels](transactions.html#isolation-levels).<br/><br/>**Default**: `SERIALIZABLE` |
| `PRIORITY` | When transactions contend for access to the same resources, the transaction with the highest priority executes first; the lower priority transaction is then retried inheriting the priority of the "winning" transaction. This means the longer a transaction contends for resources, the more likely it is to succeed.<br/><br/>For more information, see [Transactions: Priorities](transactions.html#transaction-priorities).<br/><br/>**Default**: `NORMAL` |

## Examples

### Begin a Serializable Transaction with Normal Priority

Without modifying the `BEGIN` statement, the transaction uses `SERIALIZABLE` isolation and `NORMAL` priority.

~~~ sql
> BEGIN;

> SAVEPOINT cockroach_restart;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, status) VALUES (1001, 'new');

> RELEASE SAVEPOINT cockroach_restart;

> COMMIT;
~~~

{{site.data.alerts.callout_info}}If you are using <code>SAVEPOINT</code>, which we recommend, you must execute it immediately after executing <code>BEGIN</code>.{{site.data.alerts.end}}

### Use Snapshot Isolation & Change Priority 

You can set a transaction's isolation level to `SNAPSHOT`, as well as its priority to `LOW` or `HIGH`.

~~~ sql
> BEGIN ISOLATION LEVEL SNAPSHOT, PRIORITY HIGH;

> SAVEPOINT cockroach_restart;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, status) VALUES (1001, 'new');

> RELEASE SAVEPOINT cockroach_restart;

> COMMIT;
~~~

## See Also

- [Transactions](transactions.html)
- [`COMMIT`](commit-transaction.html)
- [`SAVEPOINT`](savepoint.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
