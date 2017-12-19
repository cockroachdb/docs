---
title: BEGIN
summary: Initiate a SQL transaction with the BEGIN statement in CockroachDB.
toc: false
---

The `BEGIN` [statement](sql-statements.html) initiates a [transaction](transactions.html), which either successfully executes all of the statements it contains or none at all.

{{site.data.alerts.callout_danger}}When using transactions, your application should include logic to <a href="transactions.html#transaction-retries">retry transactions</a> that are aborted to break a dependency cycle between concurrent transactions.{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/begin_transaction.html %}

## Required Privileges

No [privileges](privileges.html) are required to initiate a transaction. However, privileges are required for each statement within a transaction.

## Aliases

In CockroachDB, the following are aliases for the `BEGIN` statement:

- `BEGIN TRANSACTION`
- `START TRANSACTION`

The following aliases also exist for [isolation levels](transactions.html#isolation-levels):

- `REPEATABLE READ` is an alias for `SERIALIZABLE`
- `READ UNCOMMITTED` and `READ COMMITTED` are aliases for `SNAPSHOT`

For more information on isolation level aliases, see [Comparison to ANSI SQL Isolation Levels](transactions.html#comparison-to-ansi-sql-isolation-levels).

## Parameters

| Parameter | Description |
|-----------|-------------|
| `ISOLATION LEVEL` | If you don't want the transaction to run as `SERIALIZABLE` (CockroachDB's default, which provides the highest level of isolation), you can specify `SNAPSHOT`, which can provide better performance in high-contention scenarios.<br/><br/>For more information, see [Transactions: Isolation Levels](transactions.html#isolation-levels).<br/><br/>**Default**: `SERIALIZABLE` |
| `PRIORITY` | If you don't want the transaction to run with `NORMAL` priority, you can set it to `LOW` or `HIGH`.<br/><br/>Transactions with higher priority are less likely to need to be retried.<br/><br/>For more information, see [Transactions: Priorities](transactions.html#transaction-priorities).<br/><br/>**Default**: `NORMAL` |

## Examples

### Begin a Transaction

#### Use Default Settings

Without modifying the `BEGIN` statement, the transaction uses `SERIALIZABLE` isolation and `NORMAL` priority.

~~~ sql
> BEGIN;

> SAVEPOINT cockroach_restart;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, sku, status) VALUES (1001, '8675309', 'new');

> RELEASE SAVEPOINT cockroach_restart;

> COMMIT;
~~~

{{site.data.alerts.callout_danger}}This example assumes you're using <a href="transactions.html#client-side-intervention">client-side intervention to handle transaction retries</a>.{{site.data.alerts.end}}

#### Change Isolation Level & Priority

You can set a transaction's isolation level to `SNAPSHOT`, as well as its priority to `LOW` or `HIGH`.

~~~ sql
> BEGIN ISOLATION LEVEL SNAPSHOT, PRIORITY HIGH;

> SAVEPOINT cockroach_restart;

> UPDATE products SET inventory = 0 WHERE sku = '8675309';

> INSERT INTO orders (customer, sku, status) VALUES (1001, '8675309', 'new');

> RELEASE SAVEPOINT cockroach_restart;

> COMMIT;
~~~

You can also set a transaction's isolation level and priority with [`SET TRANSACTION`](set-transaction.html).

{{site.data.alerts.callout_danger}}This example assumes you're using <a href="transactions.html#client-side-intervention">client-side intervention to handle transaction retries</a>.{{site.data.alerts.end}}

### Begin a Transaction with Automatic Retries

CockroachDB will [automatically retry](transactions.html#transaction-retries) all transactions that contain both `BEGIN` and `COMMIT` in the same batch. Batching is controlled by your driver or client's behavior, but means that CockroachDB receives all of the statements as a single unit, instead of a number of requests.

From the perspective of CockroachDB, a transaction sent as a batch looks like this:

~~~ sql
> BEGIN; DELETE FROM customers WHERE id = 1; DELETE orders WHERE customer = 1; COMMIT;
~~~

However, in your application's code, batched transactions are often just multiple statements sent at once. For example, in Go, this transaction would sent as a single batch (and automatically retried):

~~~ go
db.Exec(
  "BEGIN;

  DELETE FROM customers WHERE id = 1;

  DELETE orders WHERE customer = 1;

  COMMIT;"
)
~~~

Issuing statements this way signals to CockroachDB that you do not need to change any of the statement's values if the transaction doesn't immediately succeed, so it can continually retry the transaction until it's accepted.

## See Also

- [Transactions](transactions.html)
- [`COMMIT`](commit-transaction.html)
- [`SAVEPOINT`](savepoint.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
