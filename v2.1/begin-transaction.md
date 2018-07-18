---
title: BEGIN
summary: Initiate a SQL transaction with the BEGIN statement in CockroachDB.
toc: true
---

The `BEGIN` [statement](sql-statements.html) initiates a [transaction](transactions.html), which either successfully executes all of the statements it contains or none at all.

{{site.data.alerts.callout_danger}}
When using transactions, your application should include logic to [retry transactions](transactions.html#transaction-retries) that are aborted to break a dependency cycle between concurrent transactions.
{{site.data.alerts.end}}


## Synopsis

{% include {{ page.version.version }}/sql/diagrams/begin_transaction.html %}

## Required privileges

No [privileges](privileges.html) are required to initiate a transaction. However, privileges are required for each statement within a transaction.

## Aliases

In CockroachDB, the following are aliases for the `BEGIN` statement:

- `BEGIN TRANSACTION`
- `START TRANSACTION`

The following aliases also exist for [isolation levels](transactions.html#isolation-levels):

- `READ UNCOMMITTED`, `READ COMMITTED`, and `REPEATABLE READ` are aliases for `SERIALIZABLE`

For more information on isolation level aliases, see [Comparison to ANSI SQL Isolation Levels](transactions.html#comparison-to-ansi-sql-isolation-levels).

## Parameters

 Parameter | Description 
-----------|-------------
 `ISOLATION LEVEL` | By default, transactions in CockroachDB implement the strongest ANSI isolation level: `SERIALIZABLE`. At this isolation level, transactions will never result in anomalies. The `SNAPSHOT` isolation level is still supported as well for backwards compatibility, but you should avoid using it. It provides little benefit in terms of performance and can result in inconsistent state under certain complex workloads. For more information, see [Transactions: Isolation Levels](transactions.html#isolation-levels).<br/><br/>**Default**: `SERIALIZABLE` 
 `PRIORITY` | If you do not want the transaction to run with `NORMAL` priority, you can set it to `LOW` or `HIGH`.<br/><br/>Transactions with higher priority are less likely to need to be retried.<br/><br/>For more information, see [Transactions: Priorities](transactions.html#transaction-priorities).<br/><br/>**Default**: `NORMAL` 

## Examples

### Begin a transaction

#### Use default settings

Without modifying the `BEGIN` statement, the transaction uses `SERIALIZABLE` isolation and `NORMAL` priority.

{% include copy-clipboard.html %}
~~~ sql?nofmt
> BEGIN;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SAVEPOINT cockroach_restart;
~~~

{% include copy-clipboard.html %}
~~~ sql
> UPDATE products SET inventory = 0 WHERE sku = '8675309';
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO orders (customer, sku, status) VALUES (1001, '8675309', 'new');
~~~

{% include copy-clipboard.html %}
~~~ sql
> RELEASE SAVEPOINT cockroach_restart;
~~~

{% include copy-clipboard.html %}
~~~ sql?nofmt
> COMMIT;
~~~

{{site.data.alerts.callout_danger}}This example assumes you're using <a href="transactions.html#client-side-intervention">client-side intervention to handle transaction retries</a>.{{site.data.alerts.end}}

#### Change isolation level and priority

You can set a transaction's isolation level to `SNAPSHOT`, as well as its priority to `LOW` or `HIGH`.

{% include copy-clipboard.html %}
~~~ sql?nofmt
> BEGIN ISOLATION LEVEL SNAPSHOT, PRIORITY HIGH;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SAVEPOINT cockroach_restart;
~~~

{% include copy-clipboard.html %}
~~~ sql
> UPDATE products SET inventory = 0 WHERE sku = '8675309';
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO orders (customer, sku, status) VALUES (1001, '8675309', 'new');
~~~

{% include copy-clipboard.html %}
~~~ sql
> RELEASE SAVEPOINT cockroach_restart;
~~~

{% include copy-clipboard.html %}
~~~ sql?nofmt
> COMMIT;
~~~

You can also set a transaction's isolation level and priority with [`SET TRANSACTION`](set-transaction.html).

{{site.data.alerts.callout_danger}}
This example assumes you're using [client-side intervention to handle transaction retries](transactions.html#client-side-intervention).
{{site.data.alerts.end}}

### Begin a transaction with automatic retries

CockroachDB will [automatically retry](transactions.html#transaction-retries) all transactions that contain both `BEGIN` and `COMMIT` in the same batch. Batching is controlled by your driver or client's behavior, but means that CockroachDB receives all of the statements as a single unit, instead of a number of requests.

From the perspective of CockroachDB, a transaction sent as a batch looks like this:

{% include copy-clipboard.html %}
~~~ sql?nofmt
> BEGIN;

> DELETE FROM customers WHERE id = 1;

> DELETE orders WHERE customer = 1;

> COMMIT;
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

## See also

- [Transactions](transactions.html)
- [`COMMIT`](commit-transaction.html)
- [`SAVEPOINT`](savepoint.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
