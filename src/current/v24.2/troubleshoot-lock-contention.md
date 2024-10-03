---
title: Troubleshoot Lock Contention
summary: How to use intelligent insights to identify and resolve lock contention issues
toc: true
---

This tutorial presents how to [understand lock contention](#understand-lock-contention) which may cause for slow SQL query performance. It shows how to [identify waiting and blocking transactions](#identify-waiting-and-blocking-transactions) using the Insights page of the Cloud Console or the DB Console. It then shows possible ways to [remediate lock contention](#remediate-lock-contention). 

## Before you begin

### Terminal 1

Use the [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) command to start a temporary, in-memory CockroachDB cluster of one node. 

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach demo --no-example-database
~~~

It will open an interactive SQL shell to the cluster set to an empty database called `defaultdb`. This database is used for testing and some internal databases.

The examples in this tutorial will use three terminals, one for each transaction. To distinguish each terminal set the `application_name`. In the SQL shell in your first terminal, execute:  

{% include_cached copy-clipboard.html %}
~~~ sql
SET application_name = 'Terminal 1';  -- to distinguish between transactions
~~~

To [connect additional SQL clients to the demo cluster]({% link {{ page.version.version }}/cockroach-demo.md %}#connect-an-additional-sql-client-to-the-demo-cluster), first use `\demo ls` to list the connection parameters in the demo cluster in the first terminal:

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
   (sql)      ...
   (sql/jdbc) ...
   (sql/unix) ...
   (rpc)      ...
~~~

### Terminal 2

In the second terminal, open another SQL shell to the demo cluster using the `cli` command from the `\demo ls` output:

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

In the third terminal, open another SQL shell to the demo cluster using the `cli` command from the `\demo ls` output:

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

In terminal 1, create a table and insert some data:

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

To reproduce the above example in CockroachDB in preparation for the next section on how to [identify waiting and blocking transactions](#identify-waiting-and-blocking-transactions) using the Insights page of the Cloud Console or the DB Console, execute the following SQL statements.

## Identify waiting and blocking transactions

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