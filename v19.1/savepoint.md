---
title: SAVEPOINT
summary: Identify your intent to retry aborted transactions with the SAVEPOINT statement in CockroachDB.
toc: true
---

The `SAVEPOINT` statement defines the intent to retry [transactions](transactions.html) using the CockroachDB-provided function for client-side transaction retries. For more information, see [Transaction Retries](transactions.html#transaction-retries).

{% include {{ page.version.version }}/misc/savepoint-limitations.md %}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/savepoint.html %}
</div>

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to create a savepoint. However, privileges are required for each statement within a transaction.

## Parameters

Parameter | Description
--------- | -----------
name      | The name of the savepoint.  Defaults to `cockroach_restart`, but may be customized.  For more information, see [Customizing the savepoint name](#customizing-the-savepoint-name).

## Customizing the savepoint name

{% include {{ page.version.version }}/misc/customizing-the-savepoint-name.md %}

## Example

After you `BEGIN` the transaction, you must create the savepoint to identify that if the transaction contends with another transaction for resources and "loses", you intend to use [client-side transaction retries](transactions.html#transaction-retries).

Applications using `SAVEPOINT` must also include functions to execute retries with [`ROLLBACK TO SAVEPOINT `](rollback-transaction.html#retry-a-transaction).

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

## See also

- [Transactions](transactions.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [Retryable transaction example code in Java using JDBC](build-a-java-app-with-cockroachdb.html)
- [CockroachDB Architecture: Transaction Layer](architecture/transaction-layer.html)
