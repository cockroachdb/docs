---
title: SAVEPOINT
summary: Define a SAVEPOINT within the current transaction
toc: true
---

A savepoint is a placeholder inside a transaction that is used to allow (non-DDL) statements that are executed after the savepoint to be [rolled back](rollback-transaction.html). When rolled back, the database is restored to the state that existed prior to the savepoint. Clients can use multiple nested savepoints in a transaction.

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
CREATE TABLE kv (k INT, v INT);
~~~

### Basic usage

To establish a savepoint inside a transaction:

{% include copy-clipboard.html %}
~~~ sql
SAVEPOINT foo;
~~~

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

### Multi-level commit / rollback

[`RELEASE SAVEPOINT`](release-savepoint.html) and [`ROLLBACK TO SAVEPOINT`](rollback-transaction.html) can both refer to a savepoint "higher" in the nesting hierarchy. When this occurs, all of the savepoints "under" the nesting are automatically released / rolled back too.

To insert both `(2,2)` and `(4,4)`:

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

This inserts nothing - both are rolled back:

{% include copy-clipboard.html %}
~~~ sql
BEGIN;
SAVEPOINT foo;
INSERT INTO kv VALUES (5,5);
SAVEPOINT bar;
INSERT INTO kv VALUES (5,5);
ROLLBACK TO SAVEPOINT foo;
COMMIT;
~~~

This demonstrates that the name "bar" is not visible after it was rolled back over:

{% include copy-clipboard.html %}
~~~ sql
BEGIN;
SAVEPOINT foo;
SAVEPOINT bar;
ROLLBACK TO SAVEPOINT foo;
RELEASE SAVEPOINT bar; -- error: savepoint "bar" does not exist
COMMIT;
~~~

#### Savepoints and prepared statements

```
prepare a as select 1;
root@localhost:26257/defaultdb  OPEN> prepare a as select 1;
PREPARE

Time: 1.177ms

rollback to savepoint foo;
root@localhost:26257/defaultdb  OPEN> rollback to savepoint foo;
ROLLBACK

Time: 145µs

execute a; 
root@localhost:26257/defaultdb  OPEN> execute a; 
  ?column?
------------
         1
(1 row)

Time: 468µs

show savepoint status;
root@localhost:26257/defaultdb  OPEN> show savepoint status;
  savepoint_name | is_restart_savepoint
-----------------+-----------------------
  foo            |        false
(1 row)

Time: 427µs

rollback;
root@localhost:26257/defaultdb  OPEN> rollback;
ROLLBACK

Time: 384µs

root@localhost:26257/defaultdb> 
```

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
