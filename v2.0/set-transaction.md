---
title: SET TRANSACTION
summary: The SET TRANSACTION statement sets the transaction isolation level and/or priority for the current session or for an individual transaction.
toc: true
---

The `SET TRANSACTION` [statement](sql-statements.html) sets the transaction isolation level or priority after you [`BEGIN`](begin-transaction.html) it but before executing the first statement that manipulates a database.

{{site.data.alerts.callout_info}}You can also set the session's default isolation level.{{site.data.alerts.end}}


## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/set_transaction.html %}</section>

## Required Privileges

No [privileges](privileges.html) are required to set the transaction isolation level or priority. However, privileges are required for each statement within a transaction.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `ISOLATION LEVEL` | By default, transactions in CockroachDB implement the strongest ANSI isolation level: `SERIALIZABLE`. At this isolation level, transactions will never result in anomalies. The `SNAPSHOT` isolation level is still supported as well for backwards compatibility, but you should avoid using it. It provides little benefit in terms of performance and can result in inconsistent state under certain complex workloads. For more information, see [Transactions: Isolation Levels](transactions.html#isolation-levels).<br><br><span class="version-tag">New in v2.0:</span> The current isolation level is also exposed as the [session variable](show-vars.html) `transaction_isolation`.<br><br>**Default**: `SERIALIZABLE` |
| `PRIORITY` | If you do not want the transaction to run with `NORMAL` priority, you can set it to `LOW` or `HIGH`.<br><br>Transactions with higher priority are less likely to need to be retried.<br><br>For more information, see [Transactions: Priorities](transactions.html#transaction-priorities).<br><br>The current priority is also exposed as the [session variable](show-vars.html) `transaction_priority`.<br><br>**Default**: `NORMAL` |
| `READ` | <span class="version-tag">New in v2.0:</span> Set the transaction access mode to `READ ONLY` or `READ WRITE`. The current transaction access mode is also exposed as the [session variable](show-vars.html) `transaction_read_only`.<br><br>**Default**: `READ WRITE`|

## Examples

### Set Isolation & Priority

You can set a transaction's isolation level to `SNAPSHOT`, as well as its priority to `LOW` or `HIGH`.

{% include_cached copy-clipboard.html %}
~~~ sql
> BEGIN;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SET TRANSACTION ISOLATION LEVEL SNAPSHOT, PRIORITY HIGH;
~~~

{{site.data.alerts.callout_success}}You can also set both transaction options as a space-separated list, e.g., <code>SET TRANSACTION ISOLATION LEVEL SNAPSHOT PRIORITY HIGH</code>.{{site.data.alerts.end}}

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
