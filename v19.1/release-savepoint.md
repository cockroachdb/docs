---
title: RELEASE SAVEPOINT
summary: Commit a transaction's changes once there are no retry errors with the RELEASE SAVEPOINT statement in CockroachDB.
toc: true
---

When using [advanced client-side transaction retries](advanced-client-side-transaction-retries.html), the `RELEASE SAVEPOINT` statement commits the transaction.

If statements in the transaction [generated any non-retry errors](transactions.html#error-handling), `RELEASE SAVEPOINT` is equivalent to [`ROLLBACK`](rollback-transaction.html), which aborts the transaction and discards all updates made by its statements.

Note that although issuing this statement commits the transaction, you must also issue a subsequent [`COMMIT`](commit-transaction.html) statement to prepare the connection for the next transaction.

{% include {{ page.version.version }}/misc/savepoint-limitations.md %}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/release_savepoint.html %}
</div>

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to release a savepoint. However, privileges are required for each statement within a transaction.

## Parameters

Parameter | Description
--------- | -----------
name      | The name of the savepoint.  Defaults to `cockroach_restart`, but may be customized.  For more information, see [Customizing the savepoint name](#customizing-the-savepoint-name).

## Customizing the savepoint name

{% include {{ page.version.version }}/misc/customizing-the-savepoint-name.md %}

## Examples

### Commit a Transaction

After declaring a [`SAVEPOINT`](savepoint.html), commit the transaction with `RELEASE SAVEPOINT` and then prepare the connection for the next transaction with [`COMMIT`](commit-transaction.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> BEGIN;

> SAVEPOINT cockroach_restart;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, sku, status) VALUES (1001, '8675309', 'new');

> RELEASE SAVEPOINT cockroach_restart;

> COMMIT;
~~~

{{site.data.alerts.callout_danger}}This example assumes you're using <a href="transactions.html#client-side-intervention">client-side intervention to handle transaction retries</a>.{{site.data.alerts.end}}

## See also

- [Transactions](transactions.html)
- [`SAVEPOINT`](savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
