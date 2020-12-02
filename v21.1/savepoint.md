---
title: SAVEPOINT
summary: Start a nested transaction.
toc: true
---

A savepoint is a marker that defines the beginning of a [nested transaction](transactions.html#nested-transactions). This marker can be later used to commit or roll back just the effects of the nested transaction without affecting the progress of the enclosing transaction.

 CockroachDB supports [general purpose savepoints for nested transactions](#savepoints-for-nested-transactions), in addition to continued support for [special-purpose retry savepoints](#savepoints-for-client-side-transaction-retries).

{% include {{page.version.version}}/sql/savepoint-ddl-rollbacks.md %}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/savepoint.html %}
</div>

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to create a savepoint. However, privileges are required for each statement within a transaction.

## Parameters

Parameter | Description
--------- | -----------
name      | The name of the savepoint.  [Nested transactions](savepoint.html#savepoints-for-nested-transactions) can use any name for the savepoint. [Retry savepoints](savepoint.html#savepoints-for-client-side-transaction-retries) default to using the name `cockroach_restart`, but this can be customized using a session variable.  For more information, see [Customizing the retry savepoint name](savepoint.html#customizing-the-retry-savepoint-name).

## Savepoints and row locks

{% include {{page.version.version}}/sql/savepoints-and-row-locks.md %}

## Savepoints and high priority transactions

{% include {{page.version.version}}/sql/savepoints-and-high-priority-transactions.md %}

## Examples

The examples below use the following table:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE kv (k INT PRIMARY KEY, v INT);
~~~

### Basic usage

To establish a savepoint inside a transaction:

{% include copy-clipboard.html %}
~~~ sql
> SAVEPOINT foo;
~~~

{{site.data.alerts.callout_info}}
Due to the [rules for identifiers in our SQL grammar](keywords-and-identifiers.html#identifiers), `SAVEPOINT foo` and `SAVEPOINT Foo` define the same savepoint, whereas `SAVEPOINT "Foo"` defines another.
{{site.data.alerts.end}}

To roll back a transaction partially to a previously established savepoint:

{% include copy-clipboard.html %}
~~~ sql
> ROLLBACK TO SAVEPOINT foo;
~~~

To forget a savepoint, and keep the effects of statements executed after the savepoint was established, use [`RELEASE SAVEPOINT`](release-savepoint.html):

{% include copy-clipboard.html %}
~~~ sql
> RELEASE SAVEPOINT foo;
~~~

For example, the transaction below will insert the values `(1,1)` and `(3,3)` into the table, but not `(2,2)`:

{% include copy-clipboard.html %}
~~~ sql
> BEGIN;
INSERT INTO kv VALUES (1,1);
SAVEPOINT my_savepoint;
INSERT INTO kv VALUES (2,2);
ROLLBACK TO SAVEPOINT my_savepoint;
INSERT INTO kv VALUES (3,3);
COMMIT;
~~~

### Savepoints for nested transactions

Transactions can be nested using named savepoints.  [`RELEASE SAVEPOINT`](release-savepoint.html) and [`ROLLBACK TO SAVEPOINT`](rollback-transaction.html) can both refer to a savepoint "higher" in the nesting hierarchy. When this occurs, all of the savepoints "under" the nesting are automatically released / rolled back too.  Specifically:

- When a previous savepoint is rolled back, the statements entered after that savepoint are also rolled back.

- When a previous savepoint is released, it commits; the statements entered after that savepoint are also committed.

For more information about nested transactions, see [Nested transactions](transactions.html#nested-transactions).

### Multi-level rollback with `ROLLBACK TO SAVEPOINT`

Savepoints can be arbitrarily nested, and rolled back to the outermost level so that every subsequent statement is rolled back.

For example, this transaction does not insert anything into the table.  Both `INSERT`s are rolled back:

{% include copy-clipboard.html %}
~~~ sql
> BEGIN;
SAVEPOINT foo;
INSERT INTO kv VALUES (5,5);
SAVEPOINT bar;
INSERT INTO kv VALUES (6,6);
ROLLBACK TO SAVEPOINT foo;
COMMIT;
~~~

### Multi-level commit with `RELEASE SAVEPOINT`

Changes committed by releasing a savepoint commit all of the statements entered after that savepoint.

For example, the following transaction inserts both `(2,2)` and `(4,4)` into the table when it releases the outermost savepoint:

{% include copy-clipboard.html %}
~~~ sql
> BEGIN;
SAVEPOINT foo;
INSERT INTO kv VALUES (2,2);
SAVEPOINT bar;
INSERT INTO kv VALUES (4,4);
RELEASE SAVEPOINT foo;
COMMIT;
~~~

### Multi-level rollback and commit in the same transaction

Changes partially committed by a savepoint release can be rolled back by an outer savepoint.

For example, the following transaction inserts only value `(5, 5)`. The values `(6,6)` and `(7,7)` are rolled back.

{% include copy-clipboard.html %}
~~~ sql
> BEGIN;
INSERT INTO kv VALUES (5,5);
SAVEPOINT foo;
INSERT INTO kv VALUES (6,6);
SAVEPOINT bar;
INSERT INTO kv VALUES (7,7);
RELEASE SAVEPOINT bar;
ROLLBACK TO SAVEPOINT foo;
COMMIT;
~~~

### Error recovery in nested transactions with `ROLLBACK TO SAVEPOINT`

If `ROLLBACK TO SAVEPOINT` is used after a database error, it can also cancel the error state of the transaction.  Database errors move a transaction (or nested transaction) into an "Aborted" state.  In this state, the transaction will not execute any further SQL statements.

You can use `ROLLBACK TO SAVEPOINT` to recover from a logical error in a nested transaction.  Logical errors include:

- Unique index error (duplicate row)
- Failed foreign key constraint check (row does not exist in referenced table)
- Mistakes in queries (reference a column that does not exist)

In addition, you can check the status of a nested transaction using the `SHOW TRANSACTION STATUS` statement as shown below.

For example:

{% include copy-clipboard.html %}
~~~ sql
> BEGIN;
SAVEPOINT error1;
INSERT INTO kv VALUES (5,5); -- Duplicate key error
~~~

~~~
ERROR: duplicate key value (k)=(5) violates unique constraint "primary"
SQLSTATE: 23505
~~~

{% include copy-clipboard.html %}
~~~ sql
SHOW TRANSACTION STATUS;
~~~

~~~
  TRANSACTION STATUS
----------------------
  Aborted
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
ROLLBACK TO SAVEPOINT error1;
INSERT INTO kv VALUES (6,6);
COMMIT;
~~~

### Savepoint name visibility

The name of a savepoint that was rolled back over is no longer visible afterward.

For example, in the transaction below, the name "bar" is not visible after it was rolled back over:

{% include copy-clipboard.html %}
~~~ sql
> BEGIN;
SAVEPOINT foo;
SAVEPOINT bar;
ROLLBACK TO SAVEPOINT foo;
RELEASE SAVEPOINT bar;
COMMIT;
~~~

~~~
ERROR: savepoint bar does not exist
SQLSTATE: 3B001
~~~

The [SQL client](cockroach-sql.html) prompt will now display an error state, which you can clear by entering [`ROLLBACK`](rollback-transaction.html):

{% include copy-clipboard.html %}
~~~ sql
? ERROR> ROLLBACK;
~~~

~~~
ROLLBACK
~~~

#### Savepoints and prepared statements

Prepared statements (`PREPARE` / `EXECUTE`) are not transactional.  Therefore, prepared statements are not invalidated upon savepoint rollback.  As a result, the prepared statement was saved and executed inside the transaction, despite the rollback to the prior savepoint:

{% include copy-clipboard.html %}
~~~ sql
> BEGIN;
SAVEPOINT foo;
PREPARE bar AS SELECT 1;
ROLLBACK TO SAVEPOINT foo;
EXECUTE bar;
COMMIT;
~~~

~~~
  ?column?
------------
         1
(1 row)
~~~

### Savepoints for client-side transaction retries

{% include {{page.version.version}}/sql/retry-savepoints.md %}

The example below shows basic usage of a retry savepoint.

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

Note that you can [customize the retry savepoint name](#customizing-the-retry-savepoint-name) to something other than `cockroach_restart` with a session variable if you need to.

#### Customizing the retry savepoint name

{% include {{page.version.version}}/misc/customizing-the-savepoint-name.md %}

### Showing savepoint status

Use the [`SHOW SAVEPOINT STATUS`](show-savepoint-status.html) statement to see how many savepoints are active in the current transaction:

{% include copy-clipboard.html %}
~~~ sql
> SHOW SAVEPOINT STATUS;
~~~

~~~
  savepoint_name | is_initial_savepoint
-----------------+-----------------------
  foo            |        true
  bar            |        false
  baz            |        false
(3 rows)
~~~

Note that the `is_initial_savepoint` column will be true if the savepoint is the outermost savepoint in the transaction.

## See also

- [`SHOW SAVEPOINT STATUS`](show-savepoint-status.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [Transactions](transactions.html)
- [Retryable transaction example code in Java using JDBC](build-a-java-app-with-cockroachdb.html)
- [CockroachDB Architecture: Transaction Layer](architecture/transaction-layer.html)
