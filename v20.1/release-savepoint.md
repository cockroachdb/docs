---
title: RELEASE SAVEPOINT
summary: Commit a sub-transaction.
toc: true
---

The `RELEASE SAVEPOINT` statement commits the [sub-transaction](transactions.html#sub-transactions) starting at the corresponding `SAVEPOINT` statement using the same savepoint name, including all its nested sub-transactions.

The `RELEASE SAVEPOINT` statement is invalid after the sub-transaction has encountered an error. After an error, the [`ROLLBACK TO SAVEPOINT`](rollback-transaction.html#using-rollbacks-with-nested-savepoints) statement must be used instead.

When a (sub-)transaction encounters a retry error, the client should repeat `ROLLBACK TO SAVEPOINT` and the statements in the transaction until the statements complete without error, then issue `RELEASE`.

To completely remove the marker of a sub-transaction after it encounters an error and begin other work in the outer transaction, use [`ROLLBACK TO SAVEPOINT`](rollback-transaction.html#using-rollbacks-with-nested-savepoints) immediately followed by `RELEASE`.

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
