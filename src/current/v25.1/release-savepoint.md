---
title: RELEASE SAVEPOINT
summary: The RELEASE SAVEPOINT statement commits the nested transaction starting at the corresponding SAVEPOINT statement using the same savepoint name.
toc: true
docs_area: reference.sql
---

The `RELEASE SAVEPOINT` statement commits the [nested transaction]({{ page.version.version }}/transactions.md#nested-transactions) starting at the corresponding `SAVEPOINT` statement using the same savepoint name, including all its nested sub-transactions.  This is in addition to continued support for working with [retry savepoints]({{ page.version.version }}/savepoint.md#savepoints-for-client-side-transaction-retries).

## Synopsis

<div>
</div>

## Required privileges

No [privileges]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) are required to release a savepoint. However, privileges are required for each statement within a transaction.

## Parameters

Parameter | Description
--------- | -----------
name      | The name of the savepoint.  [Retry savepoints]({{ page.version.version }}/savepoint.md#savepoints-for-client-side-transaction-retries) default to using the name `cockroach_restart`, but this can be customized using a session variable.  For more information, see [Customizing the retry savepoint name]({{ page.version.version }}/savepoint.md#customizing-the-retry-savepoint-name).

## Handling errors

The `RELEASE SAVEPOINT` statement is invalid after the nested transaction has encountered an error. After an error, the following statements can be used:

- [`ROLLBACK TO SAVEPOINT`]({{ page.version.version }}/rollback-transaction.md#rollback-a-nested-transaction) to roll back to the previous savepoint.
- [`ROLLBACK` or `ABORT`]({{ page.version.version }}/rollback-transaction.md#rollback-a-transaction) to roll back the entire surrounding transaction.
- [`COMMIT`]({{ page.version.version }}/commit-transaction.md) to commit the entire surrounding transaction. In case of error, `COMMIT` is synonymous with [`ROLLBACK`/`ABORT`]({{ page.version.version }}/rollback-transaction.md) and also rolls back the entire transaction.

When a (sub-)transaction encounters a retry error, the client should repeat `ROLLBACK TO SAVEPOINT` and the statements in the transaction until the statements complete without error, then issue `RELEASE`.

To completely remove the marker of a nested transaction after it encounters an error and begin other work in the outer transaction, use [`ROLLBACK TO SAVEPOINT`]({{ page.version.version }}/rollback-transaction.md#rollback-a-nested-transaction) immediately followed by `RELEASE`.

## Examples

### Commit a nested transaction by releasing a savepoint

{{site.data.alerts.callout_info}}
This example uses the [MovR data set]({{ page.version.version }}/movr.md).
{{site.data.alerts.end}}

In the example below, we roll back the inner [nested transaction]({{ page.version.version }}/transactions.md#nested-transactions) (marked by the savepoint `lower`) and release (commit) the outer savepoint `higher`, which raises the promo code discount to 15% using CockroachDB's [JSONB functions]({{ page.version.version }}/jsonb.md#functions).

~~~ sql
> BEGIN;
SAVEPOINT higher;
UPDATE promo_codes SET rules = jsonb_set(rules, '{value}', '"15%"') WHERE rules @> '{"type": "percent_discount"}';
SAVEPOINT lower;
UPDATE promo_codes SET rules = jsonb_set(rules, '{value}', '"7.5%"') WHERE rules @> '{"type": "percent_discount"}';
ROLLBACK TO SAVEPOINT lower;
RELEASE SAVEPOINT higher;
COMMIT;
~~~

~~~
COMMIT
~~~

### Commit a transaction by releasing a retry savepoint


After declaring a retry savepoint, commit the transaction with `RELEASE SAVEPOINT` and then prepare the connection for the next transaction with [`COMMIT`]({{ page.version.version }}/commit-transaction.md):

~~~ sql
> BEGIN;
SAVEPOINT cockroach_restart;
UPDATE products SET inventory = 0 WHERE sku = '8675309';
INSERT INTO orders (customer, sku, status) VALUES (1001, '8675309', 'new');
RELEASE SAVEPOINT cockroach_restart;
COMMIT;
~~~

Applications using `SAVEPOINT` for client-side transaction retries must also include functions to execute retries with [`ROLLBACK TO SAVEPOINT `]({{ page.version.version }}/rollback-transaction.md#retry-a-transaction).

Note that you can [customize the retry savepoint name]({{ page.version.version }}/savepoint.md#customizing-the-retry-savepoint-name) to something other than `cockroach_restart` with a session variable if you need to.

## See also

- [Transactions]({{ page.version.version }}/transactions.md)
- [`SAVEPOINT`]({{ page.version.version }}/savepoint.md)
- [`SHOW SAVEPOINT STATUS`]({{ page.version.version }}/show-savepoint-status.md)
- [`ROLLBACK`]({{ page.version.version }}/rollback-transaction.md)
- [`BEGIN`]({{ page.version.version }}/begin-transaction.md)
- [`COMMIT`]({{ page.version.version }}/commit-transaction.md)