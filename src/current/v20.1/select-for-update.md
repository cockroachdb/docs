---
title: SELECT FOR UPDATE
summary: The SELECT FOR UPDATE statement is used to order transactions under contention.
keywords: concurrency control, locking, transactions, update locking, update, contention
toc: true
---

{% include {{page.version.version}}/sql/select-for-update-overview.md %}

## Required privileges

The user must have the `SELECT` and `UPDATE` [privileges](authorization.html#assign-privileges) on the tables used as operands.

## Parameters

The same as for other [selection queries](selection-queries.html).

## Examples

### Enforce transaction order when updating the same rows

In this example, we'll use `SELECT FOR UPDATE` to lock a row inside a transaction, forcing other transactions that want to update the same row to wait for the first transaction to complete. The other transactions that want to update the same row are effectively put into a queue based on when they first try to read the value of the row.

This example assumes you are running a [local unsecured cluster](start-a-local-cluster.html).

First, let's connect to the running cluster (we'll call this Terminal 1):

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --insecure
~~~

Next, let's create a table and insert some rows:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE kv (k INT PRIMARY KEY, v INT);
INSERT INTO kv (k, v) VALUES (1, 5), (2, 10), (3, 15);
~~~

Next, we'll start a [transaction](transactions.html) and lock the row we want to operate on:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --insecure
~~~

From Terminal 2, start a transaction and try to lock the same row for updates that is already being accessed by the transaction we opened in Terminal 1:

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN;
SELECT * FROM kv WHERE k = 1 FOR UPDATE;
~~~

Hit enter twice to send the input so far to be evaluated. Because Terminal 1 has already locked this row, the `SELECT FOR UPDATE` statement from Terminal 2 will appear to "wait".

Back in Terminal 1, let's update the row and commit the transaction:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE kv SET v = v + 5 WHERE k = 1;
COMMIT;
~~~

~~~
UPDATE 1
~~~

Finally, we commit the transaction in Terminal 2:

{% include_cached copy-clipboard.html %}
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
