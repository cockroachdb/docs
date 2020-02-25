---
title: RELEASE SAVEPOINT
summary: Remove all open savepoints from the current transaction with the RELEASE SAVEPOINT statement in CockroachDB.
toc: true
---

The `RELEASE SAVEPOINT` statement causes all open savepoints back to and including the named savepoint to be removed from the transaction stack.

It functions as a [`COMMIT`](commit-transaction.html) when it releases the outermost savepoint in a stack of nested savepoints. This includes when it is used as part of the legacy [client-side transaction retry protocol](transactions.html#client-side-intervention). Note that although issuing this statement commits the transaction, you must also issue a subsequent [`COMMIT`](commit-transaction.html) statement to prepare the connection for the next transaction.

If statements in the transaction [generated any non-retry errors](transactions.html#error-handling), `RELEASE SAVEPOINT` is equivalent to [`ROLLBACK`](rollback-transaction.html), which aborts the transaction and discards all updates made by its statements.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/release_savepoint.html %}
</div>

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to release a savepoint. However, privileges are required for each statement within a transaction.

## Parameters

Parameter | Description
--------- | -----------
name      | The name of the savepoint.

## Customizing the name of a retry savepoint

{% include {{ page.version.version }}/misc/customizing-the-savepoint-name.md %}

## Examples

### Commit a Transaction

After declaring a [`SAVEPOINT`](savepoint.html), commit the transaction with `RELEASE SAVEPOINT` and then prepare the connection for the next transaction with [`COMMIT`](commit-transaction.html):

{% include copy-clipboard.html %}
~~~ sql
BEGIN;
SAVEPOINT update_inventory;
UPDATE products SET inventory = 0 WHERE sku = '8675309';
INSERT INTO orders (customer, sku, status) VALUES (1001, '8675309', 'new');
RELEASE SAVEPOINT update_inventory;
COMMIT;
~~~

## See also

- [Transactions](transactions.html)
- [`SAVEPOINT`](savepoint.html)
- [`SHOW SAVEPOINT STATUS`](show-savepoint-status.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
