---
title: SAVEPOINT
summary: Identify your intent to retry aborted transactions with the SAVEPOINT cockroach_restart statement in CockroachDB.
toc: true
---

The `SAVEPOINT cockroach_restart` statement defines the intent to retry [transactions](transactions.html) using the CockroachDB-provided function for client-side transaction retries. For more information, see [Transaction Retries](transactions.html#transaction-retries).

{{site.data.alerts.callout_danger}}CockroachDB’s <code>SAVEPOINT</code> implementation only supports the <code>cockroach_restart</code> savepoint and does not support all savepoint functionality, such as nested transactions.{{site.data.alerts.end}}


## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/savepoint.html %}
</div>

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to create a savepoint. However, privileges are required for each statement within a transaction.

## Example

After you `BEGIN` the transaction, you must create the savepoint to identify that if the transaction contends with another transaction for resources and "loses", you intend to use [the function for client-side transaction retries](transactions.html#transaction-retries):

{% include_cached copy-clipboard.html %}
~~~ sql
> BEGIN;
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

When using `SAVEPOINT`, an application must also include functions to execute retries with [`ROLLBACK TO SAVEPOINT cockroach_restart`](rollback-transaction.html#retry-a-transaction).

## See also

- [Transactions](transactions.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
