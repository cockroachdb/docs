---
title: SET TRANSACTION
summary: The SET TRANSACTION statement sets the transaction priority for the current session or an individual transaction.
toc: true
docs_area: reference.sql
---

The `SET TRANSACTION` [statement]({{ page.version.version }}/sql-statements.md) sets the transaction priority, access mode, "as of" timestamp, and isolation level. These are applied after you [`BEGIN`]({{ page.version.version }}/begin-transaction.md) the transaction and before executing the first statement that manipulates a database.

{{site.data.alerts.callout_info}}
{{site.data.alerts.end}}

## Synopsis

<div>
</div>

## Required privileges

No [privileges]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) are required to set the transaction priority. However, privileges are required for each statement within a transaction.

## Parameters

Parameter | Description
----------|------------
`PRIORITY` | If you do not want the transaction to run with `NORMAL` priority, you can set it to `LOW` or `HIGH`. Transactions with higher priority are less likely to need to be retried. For more information, see [Transactions: Priorities]({{ page.version.version }}/transactions.md#transaction-priorities).<br><br>The current priority is also exposed as the read-only [session variable]({{ page.version.version }}/show-vars.md) `transaction_priority`.<br><br>**Default**: `NORMAL`
`READ` | Set the transaction access mode to `READ ONLY` or `READ WRITE`. The current transaction access mode is also exposed as the [session variable]({{ page.version.version }}/show-vars.md) `transaction_read_only`.<br><br>**Default**: `READ WRITE`
`AS OF SYSTEM TIME` | Execute the transaction using the database contents "as of" a specified time in the past.<br/><br/> The `AS OF SYSTEM TIME` clause can be used only when the transaction is read-only. If the transaction contains any writes, or if the `READ WRITE` mode is specified, an error will be returned.<br/><br/>For more information, see [`AS OF SYSTEM TIME`]({{ page.version.version }}/as-of-system-time.md).
`NOT DEFERRABLE`<br>`DEFERRABLE` |  This clause is supported for compatibility with PostgreSQL. `NOT DEFERRABLE` is a no-op and the default behavior for CockroachDB. `DEFERRABLE` returns an `unimplemented` error.
`ISOLATION LEVEL` | Set the transaction isolation level. Transactions use `SERIALIZABLE` isolation by default. They can be configured to run at [`READ COMMITTED`]({{ page.version.version }}/read-committed.md) isolation.<br/><br/>This clause only takes effect if specified at the beginning of the transaction.

## Examples

### Set isolation level

You can set the transaction isolation level to [`SERIALIZABLE`]({{ page.version.version }}/demo-serializable.md) or [`READ COMMITTED`]({{ page.version.version }}/read-committed.md#enable-read-committed-isolation).

If not specified, transactions use the value of the current session's [`default_transaction_isolation`]({{ page.version.version }}/session-variables.md#default-transaction-isolation) variable.

~~~ sql
BEGIN;
~~~

~~~ sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
~~~

### Set priority

{{site.data.alerts.callout_danger}}
This example assumes you're using <a href="transaction-retry-error-reference.html#client-side-retry-handling">client-side retry handling</a>.
{{site.data.alerts.end}}

~~~ sql
> BEGIN;
~~~

~~~ sql
> SET TRANSACTION PRIORITY HIGH;
~~~

~~~ sql
> SAVEPOINT cockroach_restart;
~~~

~~~ sql
> UPDATE products SET inventory = 0 WHERE sku = '8675309';
~~~

~~~ sql
> INSERT INTO orders (customer, sku, status) VALUES (1001, '8675309', 'new');
~~~

~~~ sql
> RELEASE SAVEPOINT cockroach_restart;
~~~

~~~ sql
> COMMIT;
~~~

### Use the `AS OF SYSTEM TIME` option

You can execute the transaction using the database contents "as of" a specified time in the past.


### Set the default transaction priority for a session

 To set the default transaction priority for all transactions in a session, use the `default_transaction_priority` [session variable]({{ page.version.version }}/set-vars.md). For example:

~~~ sql
SET default_transaction_priority = 'high';
~~~

~~~ sql
SHOW transaction_priority;
~~~

~~~
  transaction_priority
------------------------
  high
~~~

Note that `transaction_priority` is a read-only [session variable]({{ page.version.version }}/show-vars.md) that cannot be set directly.

## See also

- [`SET`]({{ page.version.version }}/set-vars.md)
- [Transactions: Priority levels]({{ page.version.version }}/transactions.md#transaction-priorities)
- [`BEGIN`]({{ page.version.version }}/begin-transaction.md)
- [`COMMIT`]({{ page.version.version }}/commit-transaction.md)
- [`SAVEPOINT`]({{ page.version.version }}/savepoint.md)
- [`RELEASE SAVEPOINT`]({{ page.version.version }}/release-savepoint.md)
- [`ROLLBACK`]({{ page.version.version }}/rollback-transaction.md)