---
title: SELECT FOR UPDATE
summary: The SELECT FOR UPDATE statement is used to order transactions under contention.
keywords: concurrency control, locking, transactions, update locking, update, contention
toc: true
---

{% include {{page.version.version}}/sql/select-for-update-overview.md %}

## Syntax

The following diagram shows the supported syntax for the optional `FOR` locking clause of a `SELECT` statement.

<div>
  {% include {{ page.version.version }}/sql/diagrams/for_locking.html %}
</div>

For the full `SELECT` statement syntax documentation, see [Selection Queries](selection-queries.html).

## Parameters

Parameter | Description
----------|------------
`FOR SHARE` | CockroachDB currently does not support the `FOR SHARE` locking mode. This syntax is a no-op, allowed for PostgreSQL compatibility.
`FOR KEY SHARE` | CockroachDB currently does not support the `FOR KEY SHARE` locking mode. This syntax is a no-op, allowed for PostgreSQL compatibility.
`FOR UPDATE` | Lock the rows returned by the [`SELECT`](selection-queries.html) statement, such that other transactions trying to access those rows must wait for the transaction to finish.
`FOR NO KEY UPDATE` | CockroachDB currently does not support the `FOR NO KEY UPDATE` locking mode. This syntax is a no-op, allowed for PostgreSQL compatibility.
`SKIP LOCKED` | Skipping locked rows is not yet supported by CockroachDB. `SELECT` statements with `SKIP LOCKED` will return an `"unimplemented"` error.
`NOWAIT` | Return an error if a row cannot be locked immediately.

For documentation on all other parameters of a `SELECT` statement, see [Selection Queries](selection-queries.html).

## Required privileges

The user must have the `SELECT` and `UPDATE` [privileges](authorization.html#assign-privileges) on the tables used as operands.

## Examples

### Enforce transaction order when updating the same rows

In this example, we'll use `SELECT FOR UPDATE` to lock a row inside a transaction, forcing other transactions that want to update the same row to wait for the first transaction to complete. The other transactions that want to update the same row are effectively put into a queue based on when they first try to read the value of the row.

This example assumes you are running a [local unsecured cluster](start-a-local-cluster.html).

First, let's connect to the running cluster (we'll call this Terminal 1):

{% include copy-clipboard.html %}
~~~ shell
cockroach sql --insecure
~~~

Next, let's create a table and insert some rows:

{% include copy-clipboard.html %}
~~~ sql
CREATE TABLE kv (k INT PRIMARY KEY, v INT);
INSERT INTO kv (k, v) VALUES (1, 5), (2, 10), (3, 15);
~~~

Next, we'll start a [transaction](transactions.html) and and lock the row we want to operate on:

{% include copy-clipboard.html %}
~~~ sql
BEGIN;
SELECT * FROM kv WHERE k = 1 FOR UPDATE;
~~~

Hit enter twice in the [SQL client](cockroach-sql.html) to send the input so far to be evaluated.  This will result in the following output:

~~~
  k | v
+---+----+
  1 | 5
(1 row)
~~~

Now let's open another terminal and connect to the database from a second client (we'll call this Terminal 2):

{% include copy-clipboard.html %}
~~~ shell
cockroach sql --insecure
~~~

From Terminal 2, start a transaction and try to lock the same row for updates that is already being accessed by the transaction we opened in Terminal 1:

{% include copy-clipboard.html %}
~~~ sql
BEGIN;
SELECT * FROM kv WHERE k = 1 FOR UPDATE;
~~~

Hit enter twice to send the input so far to be evaluated. Because Terminal 1 has already locked this row, the `SELECT FOR UPDATE` statement from Terminal 2 will appear to "wait".

Back in Terminal 1, let's update the row and commit the transaction:

{% include copy-clipboard.html %}
~~~ sql
UPDATE kv SET v = v + 5 WHERE k = 1;
COMMIT;
~~~

~~~
COMMIT
~~~

Now that the transaction in Terminal 1 has committed, the transaction in Terminal 2 will be "unblocked", generating the following output, which shows the value left by the transaction in Terminal 1:

~~~
  k | v
+---+----+
  1 | 10
(1 row)
~~~

The transaction in Terminal 2 can now receive input, so let's update the row in question again:

{% include copy-clipboard.html %}
~~~ sql
UPDATE kv SET v = v + 5 WHERE k = 1;
COMMIT;
~~~

~~~
UPDATE 1
~~~

Finally, we commit the transaction in Terminal 2:

{% include copy-clipboard.html %}
~~~ sql
COMMIT;
~~~

~~~
COMMIT
~~~

## See also

- [`SELECT`](select-clause.html)
- [Selection Queries](selection-queries.html)
- [Understanding and avoiding transaction contention][transaction_contention]

<!-- Reference links -->

[transaction_contention]: performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention
[retries]: transactions.html#client-side-intervention
[select]: select-clause.html
