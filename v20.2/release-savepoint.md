---
title: RELEASE SAVEPOINT
summary: Commit a nested transaction.
toc: true
---

 The `RELEASE SAVEPOINT` statement commits the [nested transaction](transactions.html#nested-transactions) starting at the corresponding `SAVEPOINT` statement using the same savepoint name, including all its nested sub-transactions.  This is in addition to continued support for working with [retry savepoints](savepoint.html#savepoints-for-client-side-transaction-retries).

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/release_savepoint.html %}
</div>

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to release a savepoint. However, privileges are required for each statement within a transaction.

## Parameters

Parameter | Description
--------- | -----------
name      | The name of the savepoint.  [Retry savepoints](savepoint.html#savepoints-for-client-side-transaction-retries) default to using the name `cockroach_restart`, but this can be customized using a session variable.  For more information, see [Customizing the retry savepoint name](savepoint.html#customizing-the-retry-savepoint-name).

## Handling errors

The `RELEASE SAVEPOINT` statement is invalid after the nested transaction has encountered an error. After an error, the following statements can be used:

- [`ROLLBACK TO SAVEPOINT`](rollback-transaction.html#rollback-a-nested-transaction) to roll back to the previous savepoint.
- [`ROLLBACK` or `ABORT`](rollback-transaction.html#rollback-a-transaction) to roll back the entire surrounding transaction.
- [`COMMIT`](commit-transaction.html) to commit the entire surrounding transaction. In case of error, `COMMIT` is synonymous with [`ROLLBACK`/`ABORT`](rollback-transaction.html) and also rolls back the entire transaction.

When a (sub-)transaction encounters a retry error, the client should repeat `ROLLBACK TO SAVEPOINT` and the statements in the transaction until the statements complete without error, then issue `RELEASE`.

To completely remove the marker of a nested transaction after it encounters an error and begin other work in the outer transaction, use [`ROLLBACK TO SAVEPOINT`](rollback-transaction.html#rollback-a-nested-transaction) immediately followed by `RELEASE`.

## Examples

### Commit a nested transaction by releasing a savepoint

{{site.data.alerts.callout_info}}
This example uses the [MovR data set](movr.html).
{{site.data.alerts.end}}

In the example below, we roll back the inner [nested transaction](transactions.html#nested-transactions) (marked by the savepoint `lower`) and release (commit) the outer savepoint `higher`, which raises the promo code discount to 15% using CockroachDB's [JSONB functions](jsonb.html#functions).

{% include copy-clipboard.html %}
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

{% include {{page.version.version}}/sql/retry-savepoints.md %}

After declaring a retry savepoint, commit the transaction with `RELEASE SAVEPOINT` and then prepare the connection for the next transaction with [`COMMIT`](commit-transaction.html):

{% include copy-clipboard.html %}
~~~ sql
> BEGIN;
SAVEPOINT cockroach_restart;
UPDATE products SET inventory = 0 WHERE sku = '8675309';
INSERT INTO orders (customer, sku, status) VALUES (1001, '8675309', 'new');
RELEASE SAVEPOINT cockroach_restart;
COMMIT;
~~~

Applications using `SAVEPOINT` for client-side transaction retries must also include functions to execute retries with [`ROLLBACK TO SAVEPOINT `](rollback-transaction.html#retry-a-transaction).

Note that you can [customize the retry savepoint name](savepoint.html#customizing-the-retry-savepoint-name) to something other than `cockroach_restart` with a session variable if you need to.

## See also

- [Transactions](transactions.html)
- [`SAVEPOINT`](savepoint.html)
- [`SHOW SAVEPOINT STATUS`](show-savepoint-status.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
