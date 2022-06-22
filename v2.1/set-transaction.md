---
title: SET TRANSACTION
summary: The SET TRANSACTION statement sets the transaction priority for the current session or an individual transaction.
toc: true
---

The `SET TRANSACTION` [statement](sql-statements.html) sets the transaction priority after you [`BEGIN`](begin-transaction.html) it but before executing the first statement that manipulates a database.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/set_transaction.html %}
</div>

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to set the transaction priority. However, privileges are required for each statement within a transaction.

## Parameters

Parameter | Description
----------|------------
`PRIORITY` | If you do not want the transaction to run with `NORMAL` priority, you can set it to `LOW` or `HIGH`.<br><br>Transactions with higher priority are less likely to need to be retried.<br><br>For more information, see [Transactions: Priorities](transactions.html#transaction-priorities).<br><br>The current priority is also exposed as the [session variable](show-vars.html) `transaction_priority`.<br><br>**Default**: `NORMAL`
`READ` | Set the transaction access mode to `READ ONLY` or `READ WRITE`. The current transaction access mode is also exposed as the [session variable](show-vars.html) `transaction_read_only`.<br><br>**Default**: `READ WRITE`

<span class="version-tag">New in v2.1:</span> CockroachDB now only supports `SERIALIZABLE` isolation, so transactions can no longer be meaningfully set to any other `ISOLATION LEVEL`. In previous versions of CockroachDB, you could set transactions to `SNAPSHOT` isolation, but that feature has been removed.

## Examples

### Set priority

{{site.data.alerts.callout_danger}}This example assumes you're using <a href="transactions.html#client-side-intervention">client-side intervention to handle transaction retries</a>.{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> BEGIN;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SET TRANSACTION PRIORITY HIGH;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SAVEPOINT cockroach_restart;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> UPDATE products SET inventory = 0 WHERE sku = '8675309';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO orders (customer, sku, status) VALUES (1001, '8675309', 'new');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> RELEASE SAVEPOINT cockroach_restart;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> COMMIT;
~~~

## See also

- [`SET`](set-vars.html)
- [Transactions: Priority levels](transactions.html#transaction-priorities)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [`SAVEPOINT`](savepoint.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
