This example assumes you are running a [local unsecured cluster]({% link {{ page.version.version }}/start-a-local-cluster.md %}).

First, connect to the running cluster (call this Terminal 1):

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --insecure
~~~

Next, create a table and insert some rows:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE kv (k INT PRIMARY KEY, v INT);
INSERT INTO kv (k, v) VALUES (1, 5), (2, 10), (3, 15);
~~~

Next, we'll start a [transaction]({% link {{ page.version.version }}/transactions.md %}) and lock the row we want to operate on:

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN;
SELECT * FROM kv WHERE k = 1 FOR UPDATE;
~~~

Press **Enter** twice in the [SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}) to send the statements to be evaluated.  This will result in the following output:

~~~
  k | v
+---+----+
  1 | 5
(1 row)
~~~

Now open another terminal and connect to the database from a second client (call this Terminal 2):

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

Press **Enter** twice to send the statements to be evaluated. Because Terminal 1 has already locked this row, the `SELECT FOR UPDATE` statement from Terminal 2 will appear to "wait".
