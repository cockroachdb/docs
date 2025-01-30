---
title: SAVEPOINT
summary: A savepoint is a marker that defines the beginning of a nested transaction.
toc: true
docs_area: reference.sql
---

A savepoint is a marker that defines the beginning of a [nested transaction]({{ page.version.version }}/transactions.md#nested-transactions). This marker can be later used to commit or roll back just the effects of the nested transaction without affecting the progress of the enclosing transaction.

CockroachDB supports [general purpose savepoints for nested transactions](#savepoints-for-nested-transactions), in addition to continued support for [special-purpose retry savepoints](#savepoints-for-client-side-transaction-retries).


## Synopsis

<div>
</div>

## Required privileges

No [privileges]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) are required to create a savepoint. However, privileges are required for each statement within a transaction.

## Parameters

Parameter | Description
--------- | -----------
name      | The name of the savepoint.  [Nested transactions]({{ page.version.version }}/savepoint.md#savepoints-for-nested-transactions) can use any name for the savepoint. [Retry savepoints]({{ page.version.version }}/savepoint.md#savepoints-for-client-side-transaction-retries) default to using the name `cockroach_restart`, but this can be customized using a session variable.  For more information, see [Customizing the retry savepoint name]({{ page.version.version }}/savepoint.md#customizing-the-retry-savepoint-name).

## Savepoints and row locks


## Savepoints and high priority transactions


## Examples

The examples below use the following table:

~~~ sql
> CREATE TABLE kv (k INT PRIMARY KEY, v INT);
~~~

### Basic usage

To establish a savepoint inside a transaction:

~~~ sql
> SAVEPOINT foo;
~~~

{{site.data.alerts.callout_info}}
Due to the [rules for identifiers in our SQL grammar]({{ page.version.version }}/keywords-and-identifiers.md#identifiers), `SAVEPOINT foo` and `SAVEPOINT Foo` define the same savepoint, whereas `SAVEPOINT "Foo"` defines another.
{{site.data.alerts.end}}

To roll back a transaction partially to a previously established savepoint:

~~~ sql
> ROLLBACK TO SAVEPOINT foo;
~~~

To forget a savepoint, and keep the effects of statements executed after the savepoint was established, use [`RELEASE SAVEPOINT`]({{ page.version.version }}/release-savepoint.md):

~~~ sql
> RELEASE SAVEPOINT foo;
~~~

For example, the transaction below will insert the values `(1,1)` and `(3,3)` into the table, but not `(2,2)`:

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

Transactions can be nested using named savepoints.  [`RELEASE SAVEPOINT`]({{ page.version.version }}/release-savepoint.md) and [`ROLLBACK TO SAVEPOINT`]({{ page.version.version }}/rollback-transaction.md) can both refer to a savepoint "higher" in the nesting hierarchy. When this occurs, all of the savepoints "under" the nesting are automatically released / rolled back too.  Specifically:

- When a previous savepoint is rolled back, the statements entered after that savepoint are also rolled back.

- When a previous savepoint is released, it commits; the statements entered after that savepoint are also committed.

For more information about nested transactions, see [Nested transactions]({{ page.version.version }}/transactions.md#nested-transactions).

### Multi-level rollback with `ROLLBACK TO SAVEPOINT`

Savepoints can be arbitrarily nested, and rolled back to the outermost level so that every subsequent statement is rolled back.

For example, this transaction does not insert anything into the table.  Both `INSERT`s are rolled back:

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

~~~ sql
> BEGIN;
SAVEPOINT error1;
INSERT INTO kv VALUES (5,5); -- Duplicate key error
~~~

~~~
ERROR: duplicate key value (k)=(5) violates unique constraint "primary"
SQLSTATE: 23505
~~~

~~~ sql
SHOW TRANSACTION STATUS;
~~~

~~~
  TRANSACTION STATUS
----------------------
  Aborted
(1 row)
~~~

~~~ sql
ROLLBACK TO SAVEPOINT error1;
INSERT INTO kv VALUES (6,6);
COMMIT;
~~~

### Savepoint name visibility

The name of a savepoint that was rolled back over is no longer visible afterward.

For example, in the transaction below, the name "bar" is not visible after it was rolled back over:

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

The [SQL client]({{ page.version.version }}/cockroach-sql.md) prompt will now display an error state, which you can clear by entering [`ROLLBACK`]({{ page.version.version }}/rollback-transaction.md):

~~~ sql
? ERROR> ROLLBACK;
~~~

~~~
ROLLBACK
~~~

#### Savepoints and prepared statements

Prepared statements (`PREPARE` / `EXECUTE`) are not transactional.  Therefore, prepared statements are not invalidated upon savepoint rollback.  As a result, the prepared statement was saved and executed inside the transaction, despite the rollback to the prior savepoint:

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


The example below shows basic usage of a retry savepoint.

~~~ sql
> BEGIN;
SAVEPOINT cockroach_restart;
UPDATE products SET inventory = 0 WHERE sku = '8675309';
INSERT INTO orders (customer, sku, status) VALUES (1001, '8675309', 'new');
RELEASE SAVEPOINT cockroach_restart;
COMMIT;
~~~

Applications using `SAVEPOINT` for client-side transaction retries must also include functions to execute retries with [`ROLLBACK TO SAVEPOINT `]({{ page.version.version }}/rollback-transaction.md#retry-a-transaction).

Note that you can [customize the retry savepoint name](#customizing-the-retry-savepoint-name) to something other than `cockroach_restart` with a session variable if you need to.

#### Customizing the retry savepoint name


### Showing savepoint status

Use the [`SHOW SAVEPOINT STATUS`]({{ page.version.version }}/show-savepoint-status.md) statement to see how many savepoints are active in the current transaction:

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

- [`SHOW SAVEPOINT STATUS`]({{ page.version.version }}/show-savepoint-status.md)
- [`RELEASE SAVEPOINT`]({{ page.version.version }}/release-savepoint.md)
- [`ROLLBACK`]({{ page.version.version }}/rollback-transaction.md)
- [`BEGIN`]({{ page.version.version }}/begin-transaction.md)
- [`COMMIT`]({{ page.version.version }}/commit-transaction.md)
- [Transactions]({{ page.version.version }}/transactions.md)
- [Retryable transaction example code in Java using JDBC]({{ page.version.version }}/build-a-java-app-with-cockroachdb.md)
- [CockroachDB Architecture: Transaction Layer]({{ page.version.version }}/architecture/transaction-layer.md)