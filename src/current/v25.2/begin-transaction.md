---
title: BEGIN
summary: Initiate a SQL transaction with the BEGIN statement in CockroachDB.
toc: true
docs_area: reference.sql
---

The `BEGIN` [statement]({% link {{ page.version.version }}/sql-statements.md %}) initiates a [transaction]({% link {{ page.version.version }}/transactions.md %}), which either successfully executes all of the statements it contains or none at all.

{{site.data.alerts.callout_info}}
When running under the default [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) isolation level, your application should [use a retry loop to handle transaction retry errors]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#transaction-retry-errors) that can occur under [contention]({{ link_prefix }}performance-best-practices-overview.html#transaction-contention).
{{site.data.alerts.end}}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/legacy_begin.html %}
</div>

## Required privileges

No [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) are required to initiate a transaction. However, privileges are required for each statement within a transaction.

## Aliases

In CockroachDB, the following are aliases for the `BEGIN` statement:

- `BEGIN TRANSACTION`
- `START TRANSACTION`

## Parameters

 Parameter | Description
-----------|-------------
`PRIORITY` | If you do not want the transaction to run with `NORMAL` priority, you can set it to `LOW` or `HIGH`.<br/><br/>Transactions with higher priority are less likely to need to be retried.<br/><br/>For more information, see [Transactions: Priorities]({% link {{ page.version.version }}/transactions.md %}#transaction-priorities).<br/><br/>**Default**: `NORMAL`
`READ` | Set the transaction access mode to `READ ONLY` or `READ WRITE`. The current transaction access mode is also exposed as the [session variable]({% link {{ page.version.version }}/show-vars.md %}) `transaction_read_only`.<br><br>**Default**: `READ WRITE`
`AS OF SYSTEM TIME` | Execute the transaction using the database contents "as of" a specified time in the past.<br/><br/> The `AS OF SYSTEM TIME` clause can be used only when the transaction is read-only. If the transaction contains any writes, or if the `READ WRITE` mode is specified, an error will be returned.<br/><br/>For more information, see [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}).
`NOT DEFERRABLE`<br>`DEFERRABLE` |  This clause is supported for compatibility with PostgreSQL. `NOT DEFERRABLE` is a no-op and the default behavior for CockroachDB. `DEFERRABLE` returns an `unimplemented` error.
`ISOLATION LEVEL` | Set the transaction isolation level. Transactions use `SERIALIZABLE` isolation by default. They can be configured to run at [`READ COMMITTED`]({% link {{ page.version.version }}/read-committed.md %}) isolation.

## Examples

### Begin a transaction

#### Use default settings

Without modifying the `BEGIN` statement, the transaction uses `SERIALIZABLE` isolation and `NORMAL` priority.

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

{{site.data.alerts.callout_danger}}
This example assumes you're using <a href="{% link {{ page.version.version }}/transaction-retry-error-reference.md %}#client-side-retry-handling">client-side retry handling</a>.
{{site.data.alerts.end}}

#### Change isolation level

You can set the transaction isolation level to [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) or [`READ COMMITTED`]({% link {{ page.version.version }}/read-committed.md %}#enable-read-committed-isolation). 

If not specified, transactions use the value of the current session's [`default_transaction_isolation`]({% link {{ page.version.version }}/session-variables.md %}#default-transaction-isolation) variable.

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
~~~

#### Change priority

You can set a transaction's priority to `LOW` or `HIGH`.

{% include_cached copy-clipboard.html %}
~~~ sql
> BEGIN PRIORITY HIGH;
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

You can also set a transaction's priority with [`SET TRANSACTION`]({% link {{ page.version.version }}/set-transaction.md %}).

{{site.data.alerts.callout_danger}}
This example assumes you're using [client-side retry handling]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#client-side-retry-handling).
{{site.data.alerts.end}}

### Use the `AS OF SYSTEM TIME` option

You can execute the transaction using the database contents "as of" a specified time in the past.

{% include {{ page.version.version }}/sql/begin-transaction-as-of-system-time-example.md %}

{{site.data.alerts.callout_success}}
You can also use the [`SET TRANSACTION`]({% link {{ page.version.version }}/set-transaction.md %}#use-the-as-of-system-time-option) statement inside the transaction to achieve the same results. This syntax is easier to use from [drivers and ORMs]({% link {{ page.version.version }}/install-client-drivers.md %}).
{{site.data.alerts.end}}

### Begin a transaction with automatic retries

CockroachDB will [automatically retry]({% link {{ page.version.version }}/transactions.md %}#transaction-retries) all transactions that contain both `BEGIN` and `COMMIT` in the same batch. Batching is controlled by your driver or client's behavior, but means that CockroachDB receives all of the statements as a single unit, instead of a number of requests.

From the perspective of CockroachDB, a transaction sent as a batch looks like this:

{% include_cached copy-clipboard.html %}
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

- [Transactions]({% link {{ page.version.version }}/transactions.md %})
- [`COMMIT`]({% link {{ page.version.version }}/commit-transaction.md %})
- [`SAVEPOINT`]({% link {{ page.version.version }}/savepoint.md %})
- [`RELEASE SAVEPOINT`]({% link {{ page.version.version }}/release-savepoint.md %})
- [`ROLLBACK`]({% link {{ page.version.version }}/rollback-transaction.md %})
