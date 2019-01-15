---
title: SET TRANSACTION
summary: The SET TRANSACTION statement sets the transaction isolation level and/or priority for the current session or for an individual transaction.
toc: true
---

The `SET TRANSACTION` [statement](sql-statements.html) sets the transaction isolation level or priority after you [`BEGIN`](begin-transaction.html) it but before executing the first statement that manipulates a database.

{{site.data.alerts.callout_info}}You can also set the session's default isolation level.{{site.data.alerts.end}}


## Synopsis

{% include {{ page.version.version }}/sql/diagrams/set_transaction.html %}

## Required Privileges

No [privileges](privileges.html) are required to set the transaction isolation level or priority. However, privileges are required for each statement within a transaction.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `ISOLATION LEVEL` | If you do not want the transaction to run as `SERIALIZABLE` (CockroachDB's default, which provides the highest level of isolation), you can set the isolation level to `SNAPSHOT`, which can provide better performance in high-contention scenarios.<br/><br/>For more information, see [Transactions: Isolation Levels](transactions.html#isolation-levels).<br/><br/>**Default**: `SERIALIZABLE` |
| `PRIORITY` | If you do not want the transaction to run with `NORMAL` priority, you can set it to `LOW` or `HIGH`.<br/><br/>Transactions with higher priority are less likely to need to be retried.<br/><br/>For more information, see [Transactions: Priorities](transactions.html#transaction-priorities).<br/><br/>**Default**: `NORMAL` |

## Examples

### Set Isolation & Priority

You can set a transaction's isolation level to `SNAPSHOT`, as well as its priority to `LOW` or `HIGH`.

~~~ sql
> BEGIN;

> SET TRANSACTION ISOLATION LEVEL SNAPSHOT, PRIORITY HIGH;

> SAVEPOINT cockroach_restart;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, sku, status) VALUES (1001, '8675309', 'new');

> RELEASE SAVEPOINT cockroach_restart;

> COMMIT;
~~~

{{site.data.alerts.callout_danger}}This example assumes you're using <a href="transactions.html#client-side-intervention">client-side intervention to handle transaction retries</a>.{{site.data.alerts.end}}

### Set Session's Default Isolation

You can also set the default isolation level for all transactions in the client's current session using `SET DEFAULT_TRANSACTION_ISOLATION TO <isolation level>`.

~~~ sql
> SHOW DEFAULT_TRANSACTION_ISOLATION;
~~~
~~~
+-------------------------------+
| default_transaction_isolation |
+-------------------------------+
| SERIALIZABLE                  |
+-------------------------------+
(1 row)
~~~
~~~ sql
> SET DEFAULT_TRANSACTION_ISOLATION TO SNAPSHOT;
~~~
~~~
SET
~~~
~~~ sql
> SHOW DEFAULT_TRANSACTION_ISOLATION;
~~~
~~~
+-------------------------------+
| default_transaction_isolation |
+-------------------------------+
| SNAPSHOT                      |
+-------------------------------+
(1 row)
~~~

## See Also

- [`SET`](set-vars.html)
- [Transaction parameters](transactions.html#transaction-parameters)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`SAVEPOINT`](savepoint.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
