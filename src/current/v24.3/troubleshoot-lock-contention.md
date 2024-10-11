---
title: Troubleshoot Lock Contention
summary: This tutorial presents how to understand lock contention, how to identify waiting and blocking transactions, and possible ways to remediate lock contention.
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

In this example, Transaction 1 is a write that blocks Transaction 2, a read, and Transaction 3, a write. Transaction 1 locks key `k=2`. When Transaction 2 tries to read key `k=2`, it experiences lock contention and waits for the lock on the key to be released. Similarly, when Transaction 3 tries to write to key `k=2`, it experiences lock contention and waits for the lock on the key to be released.

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
SELECT * FROM t where k=2;
~~~

The `SELECT` statement should output the following:

~~~
  k |  v
----+-------
  2 | 2032
(1 row)
~~~

## Identify waiting and blocking transactions

This section of the tutorial uses the [**Insights** page]({% link {{ page.version.version }}/ui-insights-page.md %}#transaction-executions-view) of the DB Console to identify waiting and block transactions in the demo cluster. With a CockroachDB Cloud cluster, the Cloud Console has a similar [**Insights** page]({% link cockroachcloud/insights-page.md %}#transaction-executions-view). You can also use the [`crdb_internal`]({% link {{ page.version.version }}/performance-recipes.md %}#identify-transactions-and-objects-that-experienced-lock-contention) system catalog to view tables and indexes that experienced contention.

While this tutorial uses the data from [Example 1](#example-1), when troubleshooting lock contention in your own workload, you can adapt the following steps using the DB Console or the Cloud Console.

### High Contention insight events

After executing the three transactions in the previous section, open the [DB Console](#db-console) for the demo cluster. Navigate to the **Insights** page and select **Workload Insights** > **Transactions Executions** view.

<img src="{{ 'images/v24.3/troubleshoot-lock-contention-transaction-executions-view.png' | relative_url }}" alt="Transaction Executions view" style="border:1px solid #eee;max-width:100%" />

Depending on when you executed the three transactions, to see Insight events, you may have to select a longer time interval, such as **Past 6 Hours**.

<img src="{{ 'images/v24.3/troubleshoot-lock-contention-time-interval.png' | relative_url }}" alt="Time interval" style="border:1px solid #eee;max-width:100%" />

With an adequate time interval, two [**High Contention**]({% link {{ page.version.version }}/ui-insights-page.md %}#high-contention) events will be listed for the waiting transactions that experienced contention, **Transaction 2** and **Transaction 3** executed in Example 1.

<img src="{{ 'images/v24.3/troubleshoot-lock-contention-high-contention.png' | relative_url }}" alt="High Contention" style="border:1px solid #eee;max-width:100%" />

### Waiting statement

To identify the exact statement in the transaction that experienced high contention, click the **Latest Transaction Execution ID**
452da3e7-e7fa-4801-aa40-c59988d14eb6, the ID of the latest execution with the given [transaction fingerprint]({% link {{ page.version.version }}/ui-transactions-page.md %}).

On the **Transaction Execution** page, navigate to the **Statement Executions** tab. In the list of statement executions, in the **Insights** column for `SELECT * FROM t where k = _`, there should be the **High Contention** event. In Example 1, Transaction 2 had one statement (other than `SHOW database`). In a transaction with multiple statements, use this page to pinpoint the exact statement that experienced high contention.

<img src="{{ 'images/v24.3/troubleshoot-lock-contention-waiting-statement.png' | relative_url }}" alt="Waiting statement" style="border:1px solid #eee;max-width:100%" />

### Blocking transaction

To identify the transaction that blocked **Transaction 2** and caused it to experience high contention, navigate back to the **Overview** tab.

<img src="{{ 'images/v24.3/troubleshoot-lock-contention-overview-tab.png' | relative_url }}" alt="Overview tab" style="border:1px solid #eee;max-width:100%" />

Scroll to the bottom of the Overview tab to the **Transaction with ID 452da3e7-e7fa-4801-aa40-c59988d14eb6 waited on** section which gives information about the blocking transaction.

<img src="{{ 'images/v24.3/troubleshoot-lock-contention-blocking-transaction.png' | relative_url }}" alt="Blocking transaction" style="border:1px solid #eee;max-width:100%" />

For more information about the blocking transaction, click the **Transaction Fingerprint ID** 08d8b7d97f830463 to open the [**Transaction Details** page]({% link {{ page.version.version }}/ui-transactions-page.md %}#transaction-details-page).

<img src="{{ 'images/v24.3/troubleshoot-lock-contention-blocking-transaction-details.png' | relative_url }}" alt="Blocking transaction details" style="border:1px solid #eee;max-width:100%" />

### Additional practice

For Transaction 3, take steps similar to the above steps for Transaction 2, to identify the waiting statement that experienced high contention and the corresponding blocking transaction.

## Remediate lock contention

### Background context

Locking conflicts are a natural artifact when business requirements call for concurrent data changes. Realistically, locking conflicts are unavoidable. The locking conflicts, however, are resolved efficiently with regard to the underlying resource utilization. When blocked transactions are waiting on a lock, they are not consuming CPU, disk, or network resources.

Remediation is required when locking conflicts are too numerous, resulting in a significant increase in response time and/or decrease in throughput. Remediation of locking conflicts is typically about giving up some functionality in exchange for a reduction in locking contention. [Example 2](#example-2) uses two ways of doing this: [historical queries]({% link {{ page.version.version }}/as-of-system-time.md %}) and a ["fail fast" method]({% link {{ page.version.version }}/select-for-update.md %}#wait-policies). Use these remediations if they fit your application design. Other possible ways to reduce lock conflicts are: [column families]({% link {{ page.version.version }}/column-families.md %}) and [secondary indexes]({% link {{ page.version.version }}/schema-design-indexes.md %}).

### Historical queries

In this tutorial's [Example 2](#example-2), Transaction 5 uses a historical query:

~~~ sql
BEGIN AS OF SYSTEM TIME '-30s';
SELECT * FROM t2 WHERE k=4; -- historical read
COMMIT;
~~~

Consider the following when using [historical queries]({% link {{ page.version.version }}/as-of-system-time.md %}):

- Use historical queries only if the application can use data that is 5 seconds old or older.
- Historical queries primarily benefit read-only transactions.
- Historical queries operate below [closed timestamps]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#closed-timestamps) and therefore have perfect concurrency characteristics - they never wait on anything and never block anything.
- Historical queries have the best possible performance, since they are served by the nearest replica.

### &quot;fail fast&quot; method

In this tutorial's [Example 2](#example-2), Transaction 6 uses a &quot;fail fast&quot; method:

~~~ sql
BEGIN;
SELECT * FROM t2 WHERE k=4 FOR UPDATE NOWAIT; -- fail fast write
UPDATE t2 SET v=4034 WHERE k=4;
COMMIT;
~~~

Consider the following when using a ["fail fast" method]({% link {{ page.version.version }}/select-for-update.md %}#wait-policies):

- &quot;Fail fast&quot; could be a reasonable protective measure in the application to handle "hot update key" situations, for example, when an application needs to be able to handle an arbitrary large surge of updates on the same key.
- The most direct method of "failing fast" is using pessimistic locking with [SELECT FOR UPDATE … NOWAIT]({% link {{ page.version.version }}/select-for-update.md %}#wait-policies). It can reduce or prevent failures late in a transaction's life (e.g. at the `COMMIT` time), by returning an error early in a contention situation if a row cannot be locked immediately.
- A more &quot;buffered fail fast&quot; approach would be to control the maximum length of a lock wait-queue that requests are willing to enter and wait in, with the cluster setting  [`kv.lock_table.maximum_lock_wait_queue_length`](https://github.com/cockroachdb/cockroach/pull/66146) (default: `0`). It can provide some level of quality-of-service with a response time predictability in a severe per-key contention. If set to a non-zero value and an existing lock wait-queue is already equal to or exceeding this length, requests will be rejected eagerly instead of entering the queue and waiting.

### Initial Data for Example 2

In any of the SQL shells, create a second table and insert some data:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP TABLE IF EXISTS t2;
CREATE TABLE t2 (k INT PRIMARY KEY, v INT);
INSERT INTO t2 VALUES (4,4), (5,5), (6,6);
~~~

### Example 2

In this example, Transaction 4 is a write that does not block either Transaction 5, a read, or Transaction 6, a write. Transaction 4 locks key `k=4`. When Transaction 5 tries to read key `k=4`, it does not experience lock contention because it does not have to wait for the lock on the key to be released. Transaction 5 uses [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) to do a historical read. When Transaction 6 executes the [`SELECT ... FOR UPDATE NOWAIT`]({% link {{ page.version.version }}/select-for-update.md %}#wait-policies) on key `k=4`, an error is returned since the key `k=4` cannot be locked immediately. In other words, Transaction 6 "fails fast". It does not even attempt to do an `UPDATE` write to key `k=4`, so it does not experience lock contention.

Transaction 4 (blocking write)   | Transaction 5 (historical read) | Transaction 6 (fail fast write)
---------------------------------|------------------------------|--------------------------------
`BEGIN;`                         |                              |
`UPDATE t2 SET v=4014 WHERE k=4;`| `BEGIN AS OF SYSTEM TIME '-30s';`|
lock k=4                         | `SELECT * FROM t2 WHERE k=4;`| `BEGIN;`
                                 | not waiting                  | `SELECT * FROM t2 WHERE k=4 FOR UPDATE NOWAIT;`
                                 | k=4,v=4                      | error: could not obtain lock
`COMMIT;`                        |                              | `UPDATE t2 SET v=4034 WHERE k=4;`
success, k=4,v=4014              |                              | not waiting
                                 | `COMMIT;`                    | `COMMIT;`
                                 | success                      | failure                                 
                                 |                              | `SELECT * FROM t2 WHERE k=4;`
                                 |                              | k=4, v=4014

### SQL statements for Example 2

To reproduce Example 2 in CockroachDB to show how to remediate a waiting read and write experiencing lock contention, execute the following SQL statements in the given order in the specified terminal.

**Terminal 1**

{% include_cached copy-clipboard.html %}
~~~ sql
SET application_name = 'Transaction 4';  -- to distinguish between transactions
BEGIN;
UPDATE t2 SET v=4014 WHERE k=4; -- lock k=4
~~~

**Terminal 2**

{% include_cached copy-clipboard.html %}
~~~ sql
SET application_name = 'Transaction 5';  -- to distinguish between transactions
BEGIN AS OF SYSTEM TIME '-30s';
SELECT * FROM t2 WHERE k=4; -- historical read
~~~

Transaction 5 does a historical read and should output the following:

~~~
  k | v
----+----
  4 | 4
(1 row)
~~~

**Terminal 3**

{% include_cached copy-clipboard.html %}
~~~ sql
SET application_name = 'Transaction 6';  -- to distinguish between transactions
BEGIN;
SELECT * FROM t2 WHERE k=4 FOR UPDATE NOWAIT; -- fail fast write
UPDATE t2 SET v=4034 WHERE k=4;
~~~

The `SELECT ... FOR UPDATE NOWAIT` returns:

~~~
ERROR: could not obtain lock on row (k)=(4) in t2@t2_pkey
SQLSTATE: 55P03
ERROR: current transaction is aborted, commands ignored until end of transaction block
SQLSTATE: 25P02
~~~

**Terminal 1**

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
~~~

**Terminal 2**

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
~~~

**Terminal 3**

`COMMIT` Transaction 6. Since the `SELECT` statement in Transaction 6 generated an error, `COMMIT` is equivalent to `ROLLBACK`, which aborts the transaction and discards the `UPDATE`. Afterward, verify that the `UPDATE` was discarded.

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
SELECT * FROM t2 WHERE k=4;
~~~

The `SELECT` statement should output the following:

~~~
  k |  v
----+-------
  4 | 4014
(1 row)
~~~
