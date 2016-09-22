---
title: COMMIT
summary: Commit a transaction with the COMMIT statement in CockroachDB.
toc: false
---

The `COMMIT` statement commits the current [transaction](transactions.html).

If the transaction contends for the same resources as other transactions and "loses" when it commits, you can [retry the transaction on the client side](transactions.html#transaction-retries) using [`SAVEPOINT`](savepoint.html) (shown in the [example below](#example)).

If the transaction generates any other types of errors, committing it causes a [rollback](rollback-transaction.html), which discards *all* updates made by statements in the transaction.

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/commit_transaction.html %}

## Required Privileges

No [privileges](privileges.html) are required to commit a transaction. However, privileges are required for each statement within a transaction.

## Aliases

In CockroachDB, `END` is an alias for the `COMMIT` statement.

## Example

### Commit the Current Transaction

After you `BEGIN` a transaction and identify its statements, you must `COMMIT` it to complete the transaction.

~~~ sql
> BEGIN;

> SAVEPOINT cockroach_restart;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, status) VALUES (1001, 'new');

> RELEASE SAVEPOINT cockroach_restart;

> COMMIT;
~~~

{{site.data.alerts.callout_info}}If you're using <code>SAVEPOINT</code>, which we recommend, you should execute <code>RELEASE SAVEPOINT</code> immediately before <code>COMMIT</code>.<br/><br/>Your application also needs to include functions to retry transactions contending for the same resources using <a href="rollback-transaction.html#retry-a-transaction"><code>ROLLBACK TO cockroach_restart</code></a>.{{site.data.alerts.end}}

## See Also

- [Transactions](transactions.html)
- [`BEGIN`](begin-transaction.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`SAVEPOINT`](savepoint.html)
