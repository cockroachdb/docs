---
title: Troubleshoot Lock Contention
summary: This tutorial presents how to understand lock contention, how to identify waiting and blocking transactions using intelligent insights, and possible ways to remediate lock contention.
toc: true
---

Lock contention is a type of [transaction contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) that occurs when a [transaction]({% link {{ page.version.version }}/transactions.md %}) is unable to complete due to another concurrent or recent transaction attempting to write to the same data. Lock contention may be the cause of slow SQL query performance.

This tutorial presents

- how to [understand lock contention](#understand-lock-contention) by reproducing a basic example,
- how to [identify waiting and blocking transactions](#identify-waiting-and-blocking-transactions) by using the Insights page of the DB Console, and
- possible ways to [remediate lock contention](#remediate-lock-contention).

## Before you begin

[Download]({% link releases/index.md %}) and [Install CockroachDB]({% link {{ page.version.version }}/install-cockroachdb-mac.md %}).

### Terminal 1

Use the [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) command to start a temporary, in-memory CockroachDB cluster of one node. 

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach demo --no-example-database
~~~

It will open an interactive SQL shell to the cluster set to an empty database called `defaultdb`. This database is used for testing and some internal databases.

The examples in this tutorial will use three terminals, one for each transaction. To distinguish each terminal set the `application_name`. In the SQL shell in the first terminal, execute:  

{% include_cached copy-clipboard.html %}
~~~ sql
SET application_name = 'Transaction 1';  -- to distinguish between transactions
~~~

To [connect additional SQL clients to the demo cluster]({% link {{ page.version.version }}/cockroach-demo.md %}#connect-an-additional-sql-client-to-the-demo-cluster), in the SQL shell use `\demo ls` to list the connection parameters in the demo cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
\demo ls
~~~

The output will be similar to:

~~~
demo@127.0.0.1:26257/defaultdb> \demo ls
node 1:
   (webui)    http://127.0.0.1:8080/demologin?password=demo28806&username=demo
   (cli)      cockroach sql --certs-dir=/Users/myuser/.cockroach-demo -u demo -d defaultdb
~~~

### Terminal 2

In a second terminal, open another SQL shell to the demo cluster using the `cli` command from the `\demo ls` output:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --certs-dir=/Users/myuser/.cockroach-demo -u demo -d defaultdb
~~~

In the second SQL shell, set `application_name`:

{% include_cached copy-clipboard.html %}
~~~ sql
SET application_name = 'Transaction 2';  -- to distinguish between transactions
~~~

### Terminal 3

In a third terminal, open another SQL shell to the demo cluster using the `cli` command from the `\demo ls` output:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --certs-dir=/Users/myuser/.cockroach-demo -u demo -d defaultdb
~~~

In the third SQL shell, set `application_name`:

{% include_cached copy-clipboard.html %}
~~~ sql
SET application_name = 'Transaction 3';  -- to distinguish between transactions
~~~

### DB Console

In a web browser, open the DB Console to the demo cluster using the `webui` address from the `\demo ls` output:

~~~
http://127.0.0.1:8080/demologin?password=demo28806&username=demo
~~~

## Understand lock contention

### Initial Data

In any of the SQL shells, create a table and insert some data:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP TABLE IF EXISTS t;
CREATE TABLE t (k INT PRIMARY KEY, v INT);
INSERT INTO t VALUES (1,1), (2,2), (3,3);
~~~

### Example 1

In this example, Transaction 1 is a write that blocks Transaction 2, a read, and Transaction 3, a write. Transaction 1 locks key `k=2`. When Transaction 2 tries to read lock `k=2`, it experiences lock contention and waits for the lock on the key to be released. Similarly, when Transaction 3 tries to write to key `k=2`, it experiences lock contention and waits for the lock on the key to be released.

Transaction 1 (blocking write)   | Transaction 2 (waiting read) | Transaction 3 (waiting write)
---------------------------------|------------------------------|--------------------------------
`BEGIN;`                         |                              |
`UPDATE t SET v=2012 WHERE k=2;` | `BEGIN;`                     |
lock k=2                         | `SELECT * FROM t WHERE k=2;` | `BEGIN;`
                                 | waiting                      | `UPDATE t SET v=2032 WHERE k=2;`
                                 |                              | waiting
`COMMIT;`                        | unblocked to proceed         | unblocked to proceed
success, k=2,v=2012              | k=2, v=2012                  |
                                 | `COMMIT;`                    | `COMMIT;`
                                 | success                      | success                                 
                                 |                              | `SELECT * FROM t WHERE k=2;`
                                 |                              | k=2, v=2032

### SQL statements

To reproduce Example 1 in CockroachDB in preparation for the next section on how to [identify waiting and blocking transactions](#identify-waiting-and-blocking-transactions) using the Insights page of the Cloud Console or the DB Console, execute the following SQL statements in the given order in the specified terminal.

**Terminal 1**

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN;
UPDATE t SET v=2012 WHERE k=2; -- lock k=2
~~~

**Terminal 2**

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN;
SELECT * FROM t WHERE k=2; -- waiting read
~~~

**Terminal 3**

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN;
UPDATE t SET v=2032 WHERE k=2; -- waiting write
~~~

**Terminal 1**

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
~~~

**Terminal 2**

When Transaction 1, releases key `k=2`, Transaction 2 should output the following:

~~~
  k |  v
----+-------
  2 | 2012
(1 row)
~~~

`COMMIT` Transaction 2:

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
~~~

**Terminal 3**

`COMMIT` Transaction 3 and verify that the `UPDATE` has succeeded:

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
SELECT * FROM t;
~~~

The `SELECT` statement should output the following:

~~~
  k |  v
----+-------
  1 |    1
  2 | 2032
  3 |    3
(3 rows)
~~~

## Identify waiting and blocking transactions

This section of the tutorial uses the [**Insights** page]({% link {{ page.version.version }}/ui-insights-page.md %}#transaction-executions-view) of the DB Console to identify waiting and block transactions in the demo cluster. With a CockroachDB Cloud cluster, the Cloud Console has a similar [**Insights** page]({% link cockroachcloud/insights-page.md %}#transaction-executions-view). You can also use the [`crdb_internal`]({% link {{ page.version.version }}/performance-recipes.md %}#identify-transactions-and-objects-that-experienced-lock-contention) system catalog to view tables and indexes that experienced contention.

When troubleshooting lock contention in your own workloads, adapt the following steps using the DB Console or the Cloud Console.

### High Contention insight events

After executing the three transactions in the previous section, open the [DB Console](#db-console) for the demo cluster. Navigate to the **Insights** page. Switch to the **Transactions Executions** view.

image lock-contention-transactions-executions_view.png

Depending on when you executed the three transactions, to see Insight events, you may have to select a longer time interval, such as **Past 6 Hours**.

image lock-contention-time-interval.png

With an adequate time interval, you should see the 2 high contention events that we reproduced in Example 1.

image lock-contention-high-contention.png

Click on Latest Transaction Execution ID
The execution ID of the latest execution with the transaction fingerprint.





## Remediate lock contention

##### Contention Illustration 3.2.  Writes are blocking reads and writes

| Transaction 1 (blocking write)          | Transaction 2 (historical read)       | Transaction 3 (fail-fast write)           |
| ------------------------------ | -------------------------- | ------------------------------- |
| BEGIN;                         |                            |                                 |
| UPDATE t SET v=2012 WHERE k=2; | BEGIN;                     |                                 |
| `lock k=2`                     | SELECT * FROM t AS OF SYSTEM TIME '-5s' WHERE k=2; | BEGIN;                          |
|                                | `not waiting...`           | SELECT * FROM t WHERE k=2 FOR UPDATE NOWAIT; |
|                                |  `kv=2,2`                          | UPDATE t SET v=2032  WHERE k=2; | 
|                                |                            | `not waiting...`                    |
| COMMIT;                        |   |        |
| `success, kv=2,2012`           | COMMIT;                    | COMMIT;                         |
|                                | `success`                  | `failure, kv=2,2012`            |