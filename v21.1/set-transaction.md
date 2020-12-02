---
title: SET TRANSACTION
summary: The SET TRANSACTION statement sets the transaction priority for the current session or an individual transaction.
toc: true
---

The `SET TRANSACTION` [statement](sql-statements.html) sets the transaction priority, access mode, and "as of" timestamp after you [`BEGIN`](begin-transaction.html) it but before executing the first statement that manipulates a database.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/set_transaction.html %}
</div>

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to set the transaction priority. However, privileges are required for each statement within a transaction.

## Parameters

Parameter | Description
----------|------------
`PRIORITY` | If you do not want the transaction to run with `NORMAL` priority, you can set it to `LOW` or `HIGH`. Transactions with higher priority are less likely to need to be retried. For more information, see [Transactions: Priorities](transactions.html#transaction-priorities).<br><br>The current priority is also exposed as the read-only [session variable](show-vars.html) `transaction_priority`.<br><br>**Default**: `NORMAL`
`READ` | Set the transaction access mode to `READ ONLY` or `READ WRITE`. The current transaction access mode is also exposed as the [session variable](show-vars.html) `transaction_read_only`.<br><br>**Default**: `READ WRITE`
`AS OF SYSTEM TIME` | Execute the transaction using the database contents "as of" a specified time in the past.<br/><br/> The `AS OF SYSTEM TIME` clause can be used only when the transaction is read-only. If the transaction contains any writes, or if the `READ WRITE` mode is specified, an error will be returned.<br/><br/>For more information, see [AS OF SYSTEM TIME](as-of-system-time.html).
`NOT DEFERRABLE`<br>`DEFERRABLE` |  This clause is supported for compatibility with PostgreSQL. `NOT DEFERRABLE` is a no-op and the default behavior for CockroachDB. `DEFERRABLE` returns an `unimplemented` error.

CockroachDB now only supports `SERIALIZABLE` isolation, so transactions can no longer be meaningfully set to any other `ISOLATION LEVEL`. In previous versions of CockroachDB, you could set transactions to `SNAPSHOT` isolation, but that feature has been removed.

## Examples

### Set priority

{{site.data.alerts.callout_danger}}This example assumes you're using <a href="transactions.html#client-side-intervention">client-side intervention to handle transaction retries</a>.{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> BEGIN;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SET TRANSACTION PRIORITY HIGH;
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

### Use the `AS OF SYSTEM TIME` option

You can execute the transaction using the database contents "as of" a specified time in the past.

{% include {{ page.version.version }}/sql/set-transaction-as-of-system-time-example.md %}

### Set the default transaction priority for a session

 To set the default transaction priority for all transactions in a session, use the `default_transaction_priority` [session variable](set-vars.html). For example:

~~~ sql
> SET default_transaction_priority 'high';
~~~

~~~ sql
> SHOW transaction_priority;
~~~

~~~
  transaction_priority
------------------------
  high
~~~

Note that `transaction_priority` is a read-only [session variable](show-vars.html) that cannot be set directly.

## See also

- [`SET`](set-vars.html)
- [Transactions: Priority levels](transactions.html#transaction-priorities)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`SAVEPOINT`](savepoint.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
