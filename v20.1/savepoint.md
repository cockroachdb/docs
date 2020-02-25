---
title: SAVEPOINT
summary: Define a SAVEPOINT within the current transaction
toc: true
---

A savepoint is a placeholder inside a transaction that allows all statements that are executed after the savepoint to be [rolled back](rollback-transaction.html). When rolled back, the database is restored to the state that existed prior to the savepoint. Clients can use multiple nested savepoints in a transaction.

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
name      | The name of the savepoint.

## Examples

The examples below use the following table:

{% include copy-clipboard.html %}
~~~ sql
CREATE TABLE kv (k INT PRIMARY KEY, v INT);
~~~

### Basic usage

To establish a savepoint inside a transaction:

{% include copy-clipboard.html %}
~~~ sql
SAVEPOINT foo;
~~~

{{site.data.alerts.callout_info}}
Due to the [rules for identifiers in our SQL grammar](keywords-and-identifiers.html#identifiers), `SAVEPOINT foo` and `SAVEPOINT Foo` define the same savepoint, whereas `SAVEPOINT "Foo"` defines another.
{{site.data.alerts.end}}

To roll back a transaction partially to a previously established savepoint:

{% include copy-clipboard.html %}
~~~ sql
ROLLBACK TO SAVEPOINT foo;
~~~

To forget a savepoint, and keep the effects of statements executed after the savepoint was established, use [`RELEASE SAVEPOINT`](release-savepoint.html):

{% include copy-clipboard.html %}
~~~ sql
RELEASE SAVEPOINT foo;
~~~

For example, the transaction below will insert the values `(1,1)` and `(3,3)` into the table, but not `(2,2)`:

{% include copy-clipboard.html %}
~~~ sql
BEGIN;
INSERT INTO kv VALUES (1,1);
SAVEPOINT my_savepoint;
INSERT INTO kv VALUES (2,2);
ROLLBACK TO SAVEPOINT my_savepoint;
INSERT INTO kv VALUES (3,3);
COMMIT;
~~~

### Nested savepoints

Savepoints can be nested.  [`RELEASE SAVEPOINT`](release-savepoint.html) and [`ROLLBACK TO SAVEPOINT`](rollback-transaction.html) can both refer to a savepoint "higher" in the nesting hierarchy. When this occurs, all of the savepoints "under" the nesting are automatically released / rolled back too.  Specifically:

- When a previous savepoint is rolled back, the statements entered after that savepoint are also rolled back.

- When a previous savepoint is released, it commits; the statements entered after that savepoint are also committed.

### Multi-level rollback with `ROLLBACK`

Savepoints can be arbitrarily nested, and rolled back to the outermost level so that every subsequent statement is rolled back.

For example, this transaction does not insert anything into the table.  Both `INSERT`s are rolled back:

{% include copy-clipboard.html %}
~~~ sql
BEGIN;
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
BEGIN;
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
BEGIN;
INSERT INTO kv VALUES (5,5);
SAVEPOINT foo;
INSERT INTO kv VALUES (6,6);
SAVEPOINT bar;
INSERT INTO kv VALUES (7,7);
RELEASE SAVEPOINT bar;
ROLLBACK TO SAVEPOINT foo;
COMMIT;
~~~

### Savepoint name visibility

The name of a savepoint that was rolled back over is no longer visible afterward.

For example, in the transaction below, the name "bar" is not visible after it was rolled back over:

{% include copy-clipboard.html %}
~~~ sql
BEGIN;
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
BEGIN;
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

<!--

The below is adapted from the RFC at
https://github.com/knz/cockroach/blob/20191014-rfc-savepoints/docs/RFCS/20191014_savepoints.md#behavior-in-case-of-errors

NOTE: This behavior is not yet implemented.

### Savepoints and errors

If a SQL error occurs "under" a savepoint, it is possible for the transaction to recover to a "healthy" state by rolling back the savepoint without rolling back the entire transaction.

For example, the following transaction inserts a value that triggers a duplicate primary key error, followed by a rollback to the previous savepoint, followed by another insertion that does not trigger an error.

The end result is that `(6,6)` is inserted into the table:

{% include copy-clipboard.html %}
~~~ sql
BEGIN;
SAVEPOINT foo;
INSERT INTO kv VALUES (5,5);
ROLLBACK TO SAVEPOINT foo;
INSERT INTO kv VALUES (6,6);
COMMIT;
~~~

-->

### Savepoints for client-side transaction retries

If you intend to implement [advanced client-side transaction retries](advanced-client-side-transaction-retries.html), after you `BEGIN` the transaction, you must create an outermost savepoint named `cockroach_restart`. This will identify that if the transaction contends with another transaction for resources and "loses", you intend to use [client-side transaction retries](transactions.html#transaction-retries).

Applications using `SAVEPOINT` for client-side transaction retries must also include functions to execute retries with [`ROLLBACK TO SAVEPOINT `](rollback-transaction.html#retry-a-transaction).

A savepoint used for client-side transaction retries must be the outermost savepoint in a transaction; it cannot be nested inside other savepoints.

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

### Showing savepoint status

Use the [`SHOW SAVEPOINT STATUS`](show-savepoint-status.html) statement to see how many savepoints are active in the current transaction:

{% include copy-clipboard.html %}
~~~ sql
SHOW SAVEPOINT STATUS;
~~~

~~~
  savepoint_name | is_restart_savepoint
-----------------+-----------------------
  foo            |        false
  bar            |        false
(2 rows)
~~~

Note that the `is_restart_savepoint` column will be true if the savepoint is [being used to implement client-side transaction retries](#savepoints-for-client-side-transaction-retries).

### Customizing the name of retry savepoints

{% include {{ page.version.version }}/misc/customizing-the-savepoint-name.md %}

## See also

- [`SHOW SAVEPOINT STATUS`](show-savepoint-status.html)
- [`RELEASE SAVEPOINT`](release-savepoint.html)
- [`ROLLBACK`](rollback-transaction.html)
- [`BEGIN`](begin-transaction.html)
- [`COMMIT`](commit-transaction.html)
- [Transactions](transactions.html)
- [Retryable transaction example code in Java using JDBC](build-a-java-app-with-cockroachdb.html)
- [CockroachDB Architecture: Transaction Layer](architecture/transaction-layer.html)
