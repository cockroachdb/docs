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

<div>
  {% include {{ page.version.version }}/sql/diagrams/begin_transaction.html %}
</div>

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to initiate a transaction. However, privileges are required for each statement within a transaction.

## Aliases

In CockroachDB, the following are aliases for the `BEGIN` statement:

- `BEGIN TRANSACTION`
- `START TRANSACTION`

## Parameters

 Parameter | Description
-----------|-------------
`PRIORITY` | If you do not want the transaction to run with `NORMAL` priority, you can set it to `LOW` or `HIGH`.<br/><br/>Transactions with higher priority are less likely to need to be retried.<br/><br/>For more information, see [Transactions: Priorities](transactions.html#transaction-priorities).<br/><br/>**Default**: `NORMAL`
`READ` | Set the transaction access mode to `READ ONLY` or `READ WRITE`. The current transaction access mode is also exposed as the [session variable](show-vars.html) `transaction_read_only`.<br><br>**Default**: `READ WRITE`
`AS OF SYSTEM TIME` | Execute the transaction using the database contents "as of" a specified time in the past.<br/><br/> The `AS OF SYSTEM TIME` clause can be used only when the transaction is read-only. If the transaction contains any writes, or if the `READ WRITE` mode is specified, an error will be returned.<br/><br/>For more information, see [AS OF SYSTEM TIME](as-of-system-time.html).
`NOT DEFERRABLE`<br>`DEFERRABLE` |  This clause is supported for compatibility with PostgreSQL. `NOT DEFERRABLE` is a no-op and the default behavior for CockroachDB. `DEFERRABLE` returns an `unimplemented` error.

 CockroachDB now only supports `SERIALIZABLE` isolation, so transactions can no longer be meaningfully set to any other `ISOLATION LEVEL`. In previous versions of CockroachDB, you could set transactions to `SNAPSHOT` isolation, but that feature has been removed.

## Examples

### Begin a transaction

#### Use default settings

Without modifying the `BEGIN` statement, the transaction uses `SERIALIZABLE` isolation and `NORMAL` priority.

{% include copy-clipboard.html %}
~~~ sql
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
~~~ sql
> COMMIT;
~~~

{{site.data.alerts.callout_danger}}This example assumes you're using <a href="transactions.html#client-side-intervention">client-side intervention to handle transaction retries</a>.{{site.data.alerts.end}}

#### Change priority

You can set a transaction's priority to `LOW` or `HIGH`.

{% include copy-clipboard.html %}
~~~ sql
> BEGIN PRIORITY HIGH;
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
~~~ sql
> COMMIT;
~~~

You can also set a transaction's priority with [`SET TRANSACTION`](set-transaction.html).

{{site.data.alerts.callout_danger}}
This example assumes you're using [client-side intervention to handle transaction retries](transactions.html#client-side-intervention).
{{site.data.alerts.end}}

### Use the `AS OF SYSTEM TIME` option

You can execute the transaction using the database contents "as of" a specified time in the past.

{% include {{ page.version.version }}/sql/begin-transaction-as-of-system-time-example.md %}

{{site.data.alerts.callout_success}}
You can also use the [`SET TRANSACTION`](set-transaction.html#use-the-as-of-system-time-option) statement inside the transaction to achieve the same results. This syntax is easier to use from [drivers and ORMs](install-client-drivers.html).
{{site.data.alerts.end}}

### Begin a transaction with automatic retries

CockroachDB will [automatically retry](transactions.html#transaction-retries) all transactions that contain both `BEGIN` and `COMMIT` in the same batch. Batching is controlled by your driver or client's behavior, but means that CockroachDB receives all of the statements as a single unit, instead of a number of requests.

From the perspective of CockroachDB, a transaction sent as a batch looks like this:

{% include copy-clipboard.html %}
~~~ sql
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
