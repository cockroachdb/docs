---
title: Read Committed Transactions
summary: How to enable and use the READ COMMITTED isolation level for transactions
toc: true
docs_area: deploy
---



`READ COMMITTED` is one of two [transaction isolation levels](https://wikipedia.org/wiki/Isolation_(database_systems)) supported on CockroachDB. By default, CockroachDB uses the [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) isolation level, which is the strongest [ANSI transaction isolation level](https://wikipedia.org/wiki/Isolation_(database_systems)#Isolation_levels).

`READ COMMITTED` isolation is appropriate in the following scenarios:

- Your application needs to maintain a high workload concurrency with minimal [transaction retries]({% link {{ page.version.version }}/developer-basics.md %}#transaction-retries), and it can tolerate potential [concurrency anomalies](#concurrency-anomalies). Predictable query performance at high concurrency is more valuable than guaranteed transaction [serializability]({% link {{ page.version.version }}/developer-basics.md %}#serializability-and-transaction-contention).

- You are [migrating an application to CockroachDB]({% link molt/migration-overview.md %}) that was built at a `READ COMMITTED` isolation level on the source database, and it is not feasible to modify your application to use `SERIALIZABLE` isolation.

Whereas `SERIALIZABLE` isolation guarantees data correctness by placing transactions into a [serializable ordering]({% link {{ page.version.version }}/demo-serializable.md %}), `READ COMMITTED` isolation permits some [concurrency anomalies](#concurrency-anomalies) in exchange for minimizing transaction aborts, [retries]({% link {{ page.version.version }}/developer-basics.md %}#transaction-retries), and blocking. Compared to `SERIALIZABLE` transactions, `READ COMMITTED` transactions do **not** return [serialization errors]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}) that require client-side handling. See [`READ COMMITTED` transaction behavior](#read-committed-transaction-behavior).

If your workload is already running well under `SERIALIZABLE` isolation, Cockroach Labs does not recommend changing to `READ COMMITTED` isolation unless there is a specific need.

{{site.data.alerts.callout_info}}
`READ COMMITTED` on CockroachDB provides stronger isolation than `READ COMMITTED` on PostgreSQL. On CockroachDB, `READ COMMITTED` prevents anomalies within single statements. For complete details on how `READ COMMITTED` is implemented on CockroachDB, see the [Read Committed RFC](https://github.com/cockroachdb/cockroach/blob/master/docs/RFCS/20230122_read_committed_isolation.md).
{{site.data.alerts.end}}

## Enable `READ COMMITTED` isolation

By default, the `sql.txn.read_committed_isolation.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) is `true`, enabling `READ COMMITTED` transactions. If the cluster setting is `false`, `READ COMMITTED` transactions will run as `SERIALIZABLE`.

{{site.data.alerts.callout_success}}
To check whether any transactions are being upgraded to `SERIALIZABLE`, see the [**Upgrades of SQL Transaction Isolation Level**]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#upgrades-of-sql-transaction-isolation-level) graph in the DB Console.
{{site.data.alerts.end}}

### Set the default isolation level to `READ COMMITTED`

To set all future transactions to run at `READ COMMITTED` isolation, use one of the following options:

- The [`SET SESSION CHARACTERISTICS`]({% link {{ page.version.version }}/set-vars.md %}#special-syntax-cases) statement, which applies to the current session:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL READ COMMITTED;
	~~~

- The [`default_transaction_isolation`]({% link {{ page.version.version }}/session-variables.md %}#default-transaction-isolation) session variable:

  	At the session level:

  	{% include_cached copy-clipboard.html %}
  	~~~ sql
  	SET default_transaction_isolation = 'read committed';
  	~~~

    At the [database level]({% link {{ page.version.version }}/alter-database.md %}#set-session-variable):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER DATABASE db SET default_transaction_isolation = 'read committed';
    ~~~

    At the [role level]({% link {{ page.version.version }}/alter-role.md %}#set-default-session-variable-values-for-a-role):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER ROLE foo SET default_transaction_isolation = 'read committed';
    ~~~

- The `default_transaction_isolation` session variable as a [connection parameter]({% link {{ page.version.version }}/connection-parameters.md %}#supported-options-parameters) with [`cockroach sql`]({% link {{ page.version.version }}/cockroach-sql.md %}):

	{% include_cached copy-clipboard.html %}
	~~~ sql
	cockroach sql --url='postgresql://{username}@{host}:{port}/{database}?options=-c default_transaction_isolation=read\ committed'
	~~~

To view the default isolation level of the session:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW default_transaction_isolation;
~~~

~~~
	default_transaction_isolation
-----------------------------------------------------
	read committed
~~~

### Set the current transaction to `READ COMMITTED`

To begin a transaction as a `READ COMMITTED` transaction, use one of the following options:

- The [`BEGIN TRANSACTION ISOLATION LEVEL`]({% link {{ page.version.version }}/begin-transaction.md %}#parameters) statement:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
	~~~

- The [`SET TRANSACTION ISOLATION LEVEL`]({% link {{ page.version.version }}/set-transaction.md %}#parameters) statement, at the beginning of the transaction:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	BEGIN;
	  SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
	~~~

- The [`transaction_isolation`]({% link {{ page.version.version }}/session-variables.md %}#transaction-isolation) session variable, at the beginning of the transaction: 

	{% include_cached copy-clipboard.html %}
	~~~ sql
	BEGIN;
	  SET transaction_isolation = 'read committed';
	~~~

To view the isolation level of a transaction, run `SHOW` within the open transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW transaction_isolation;
~~~

~~~
  transaction_isolation
-------------------------
  read committed
~~~

{{site.data.alerts.callout_success}}
Starting a transaction as `READ COMMITTED` does not affect the [default isolation level](#set-the-default-isolation-level-to-read-committed), which can be different.
{{site.data.alerts.end}}

## `READ COMMITTED` transaction behavior

`READ COMMITTED` and `SERIALIZABLE` transactions both serve globally consistent ("non-stale") reads and [commit atomically]({% link {{ page.version.version }}/developer-basics.md %}#how-transactions-work-in-cockroachdb). `READ COMMITTED` transactions have the following differences:

- Writes in concurrent `READ COMMITTED` transactions can interleave without aborting transactions, and a write can never block a non-locking read of the same row. This is because `READ COMMITTED` transactions are not required to be placed into a [serializable ordering]({% link {{ page.version.version }}/demo-serializable.md %}). 

- Whereas statements in `SERIALIZABLE` transactions see data that committed before the transaction began, statements in `READ COMMITTED` transactions see data that committed before each **statement** began. If rows are being updated by concurrent writes, reads in a `READ COMMITTED` transaction can [return different results](#non-repeatable-reads-and-phantom-reads).

	{{site.data.alerts.callout_info}}
	For details on how this is implemented, see [Read snapshots]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#read-snapshots).
	{{site.data.alerts.end}}

- Due to the preceding behaviors, `READ COMMITTED` transactions permit some types of concurrency anomalies that are prevented in `SERIALIZABLE` transactions. For details and examples, see [Concurrency anomalies](#concurrency-anomalies).

- You can mitigate concurrency anomalies by issuing [locking reads](#locking-reads) in `READ COMMITTED` transactions. These statements can block concurrent transactions that are issuing writes or other locking reads on the same rows.

- When using `READ COMMITTED` isolation, you do **not** need to implement [client-side retries]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#client-side-retry-handling) to handle [serialization errors]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}) under [transaction contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention). `READ COMMITTED` transactions never return [`RETRY_SERIALIZABLE`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#retry_serializable) errors, and will only return `40001` errors in limited cases, as described in the following points.

<a id="read-committed-abort"></a>
`READ COMMITTED` transactions can abort in certain scenarios:

- Transactions at all isolation levels are subject to [*lock contention*]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention), where a transaction attempts to lock a row that is already locked by a [write]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#write-intents) or [locking read](#locking-reads). In such cases, the later transaction is blocked until the earlier transaction commits or rolls back, thus releasing its lock on the row. Lock contention that produces a *deadlock* between two transactions will result in a transaction abort and a `40001` error ([`ABORT_REASON_ABORTED_RECORD_FOUND`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#abort_reason_aborted_record_found) or [`ABORT_REASON_PUSHER_ABORTED`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#abort_reason_pusher_aborted)) returned to the client.

- [Constraint]({% link {{ page.version.version }}/constraints.md %}) violations will abort transactions at all isolation levels.

- In rare cases under `READ COMMITTED` isolation, a [`RETRY_WRITE_TOO_OLD`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#retry_write_too_old) or [`ReadWithinUncertaintyIntervalError`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#readwithinuncertaintyintervalerror) error can be returned to the client if a statement has already begun streaming a partial result set back to the client and cannot retry transparently. By default, the result set is buffered up to the value of the [`sql.defaults.results_buffer.size`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-defaults-results-buffer-size) cluster setting before overflowing and being streamed to the client.

### Concurrency anomalies

Statements in concurrent `READ COMMITTED` transactions can interleave with each other. This can create concurrency anomalies that are not permitted under `SERIALIZABLE` isolation, which places concurrent transactions into a [serializable ordering]({% link {{ page.version.version }}/demo-serializable.md %}).

{{site.data.alerts.callout_success}}
The behaviors described in this section assume the use of non-locking reads. You can prevent concurrency anomalies through the selective use of [locking reads](#locking-reads), which can also increase latency due to [lock contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention).
{{site.data.alerts.end}}

#### Non-repeatable reads and phantom reads

`READ COMMITTED` transactions can serve different reads over the course of a transaction.

*Non-repeatable reads* return different row values because a concurrent transaction updated the values in between reads:

1. Transaction `A` reads row `R` at timestamp `1`.
1. Transaction `B` writes to row `R` and commits at timestamp `2`.
1. Transaction `A` reads row `R` and gets a different result at timestamp `3`.

*Phantom reads* return different rows because a concurrent transaction changed the set of rows that satisfy the row search:

1. Transaction `A` reads the set of rows `S` at timestamp `1`.
1. Transaction `B` inserts, deletes, or updates rows in `S` and commits at timestamp `2`.
1. Transaction `A` reads the set of rows `S` and gets a different result at timestamp `3`.

Whereas statements in `SERIALIZABLE` transactions see data that committed before the transaction began, statements in `READ COMMITTED` transactions see data that committed before each **statement** began.

{{site.data.alerts.callout_info}}
For details on how this is implemented, see [Read snapshots]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#read-snapshots).
{{site.data.alerts.end}}

##### Example: Non-repeatable reads and phantom reads

  <div class="grid-container">
  <h5 style="text-align:center">Session 1</h5><h5 style="text-align:center">Session 2</h5>
  <div class="grid-item">
  In a terminal window (Session 1), create a table and insert some values:

  {% include_cached copy-clipboard.html %}
  ~~~ sql
  CREATE TABLE kv (k INT PRIMARY KEY, v INT);
  ~~~
  
  {% include_cached copy-clipboard.html %}
  ~~~ sql
  INSERT INTO kv VALUES (1, 2);
  ~~~
  
  Begin a `READ COMMITTED` transaction and read a table row:
  
  {% include_cached copy-clipboard.html %}
  ~~~ sql
  BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
    SELECT * FROM kv WHERE v = 2;
  ~~~
  
  ~~~
    k | v
  ----+----
    1 | 2
  ~~~
  </div>

  <div class="grid-item">
  In a new terminal window (Session 2), begin another `READ COMMITTED` transaction:

  {% include_cached copy-clipboard.html %}
  ~~~ sql
  BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
  ~~~
  
  Update the table row, insert a new row, and commit the transaction:
  
  {% include_cached copy-clipboard.html %}
  ~~~ sql
  UPDATE kv SET k = 2 WHERE v = 2;
    INSERT INTO kv VALUES (3, 2);
    COMMIT;
  ~~~
  </div>

  <div class="grid-item">
  In Session 1, issue the read again:

  {% include_cached copy-clipboard.html %}
  ~~~ sql
  SELECT * FROM kv WHERE v = 2;
  ~~~
  
  ~~~
    k | v
  ----+----
    2 | 2
    3 | 2
  ~~~
  </div>
  </div>

#### Lost update anomaly

The `READ COMMITTED` conditions that permit [non-repeatable reads and phantom reads](#non-repeatable-reads-and-phantom-reads) also permit *lost update anomalies*, where an update from a transaction appears to be "lost" because it is overwritten by a concurrent transaction:

1. Transaction `A` reads row `R` at timestamp `1`.
1. Transaction `B` writes to row `R` and commits at timestamp `2`.
1. Transaction `A` writes to row `R` and commits at timestamp `3`.

The value of `R` has changed while transaction `A` is open. However, `A` can still write to `R` and commit, effectively overwriting the update from transaction `B`.

{{site.data.alerts.callout_info}}
Under `SERIALIZABLE` isolation, transaction `A` would have aborted with a [`RETRY_WRITE_TOO_OLD`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#retry_write_too_old) error, prompting the client to retry the transaction.
{{site.data.alerts.end}}

##### Example: Lost update anomaly

  <div class="grid-container">
  <h5 style="text-align:center">Session 1</h5><h5 style="text-align:center">Session 2</h5>
  <div class="grid-item">
  In a terminal window (Session 1), create a table and insert some values:

  {% include_cached copy-clipboard.html %}
  ~~~ sql
  CREATE TABLE kv (k INT PRIMARY KEY, v INT);
  ~~~

  {% include_cached copy-clipboard.html %}
  ~~~ sql
  INSERT INTO kv VALUES (1, 2);
  ~~~
  
  Begin a `READ COMMITTED` transaction and read a table row:

  {% include_cached copy-clipboard.html %}
  ~~~ sql
  BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
    SELECT * FROM kv WHERE k = 1;
  ~~~
  
  ~~~
    k | v
  ----+----
    1 | 2
  ~~~
  </div>

  <div class="grid-item">
  In a new terminal window (Session 2), begin another `READ COMMITTED` transaction:

  {% include_cached copy-clipboard.html %}
  ~~~ sql
  BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
  ~~~
  
  Update the table row and commit the transaction:
  
  {% include_cached copy-clipboard.html %}
  ~~~ sql
  UPDATE kv SET v = 3 WHERE k = 1;
    COMMIT;
  ~~~
  </div>

  <div class="grid-item">
  In Session 1, update the table row again and commit the transaction:

  {% include_cached copy-clipboard.html %}
  ~~~ sql
  UPDATE kv SET v = 4 WHERE k = 1;
    COMMIT;
  ~~~
  
  Read the table row and see that it reflects the update from Session 1:
  
  {% include_cached copy-clipboard.html %}
  ~~~ sql
  SELECT * FROM kv WHERE k = 1;
  ~~~
  
  ~~~
    k | v
  ----+----
    1 | 4
  ~~~
  </div>
  </div>

The update in Session 2 appears to be "lost" because its result is overwritten by a concurrent transaction. It is **not** lost at the database level, and can be found using [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) and a timestamp earlier than the commit in Session 1:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM kv AS OF SYSTEM TIME '2023-11-09 21:22:10' WHERE k = 1;
~~~

~~~
  k | v
----+----
  1 | 3
~~~

{{site.data.alerts.callout_info}}
While concurrent `READ COMMITTED` transactions can have their committed writes overwritten, **uncommitted** writes in `READ COMMITTED` transactions cannot be overwritten.
{{site.data.alerts.end}}

#### Write skew anomaly

The following sequence of operations on a table is possible under `READ COMMITTED` isolation: 

1. Transaction `A` reads row `R` at timestamp `1`.
1. Transaction `B` reads row `S` at timestamp `2`.
1. Transaction `A` writes to row `S` and commits at timestamp `3`.
1. Transaction `B` writes to row `R` and commits at timestamp `4`.

Transaction `A` updates the value of `S` based on the `R` value it reads at timestamp `1`. Transaction `B` updates the value of `R` based on the `S` value it reads at timestamp `2`. The value of `S` has changed while transaction `B` is open, but `B` can still write and commit instead of aborting, since `READ COMMITTED` transactions do not require serializability. This is the basis of potential *write skew anomalies* where two concurrent transactions each read values that the other subsequently updates.

{{site.data.alerts.callout_info}}
For details on why this is allowed, see [Read refreshing]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#write-skew-tolerance).
{{site.data.alerts.end}}

##### Example: Write skew anomaly

For an example of how a write skew anomaly can occur, see [Demonstrate interleaved statements in `READ COMMITTED` transactions](#demonstrate-interleaved-statements-in-read-committed-transactions).

## Locking reads

To reduce the occurrence of [concurrency anomalies](#concurrency-anomalies) in `READ COMMITTED` isolation, you can strengthen the isolation of individual reads by using [`SELECT ... FOR UPDATE`]({% link {{ page.version.version }}/select-for-update.md %}) or [`SELECT ... FOR SHARE`]({% link {{ page.version.version }}/select-for-update.md %}) to issue *locking reads* on specific rows. Locking reads behave similarly to [writes]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#write-intents): they lock qualifying rows to prevent concurrent writes from modifying them until the transaction commits. Conversely, if a locking read finds that a row is exclusively locked by a concurrent transaction, it waits for the other transaction to commit or rollback before proceeding. A locking read in a transaction will always have the latest version of a row when the transaction commits.

The clause used with the `SELECT` statement determines the *lock strength* of a locking read:

{% include {{ page.version.version }}/sql/select-lock-strengths.md %}

### When to use locking reads

Use locking reads in your application if certain `READ COMMITTED` transactions must guarantee that the data they access will not be changed by intermediate writes.

Non-locking reads can allow intermediate writes to update rows before `READ COMMITTED` transactions commit, potentially creating [concurrency anomalies](#concurrency-anomalies). Locking reads prevent such anomalies, but increase the amount of lock contention that [may require intervention]({% link {{ page.version.version }}/performance-recipes.md %}#waiting-transaction) if latency becomes too high. Note that locking reads do **not** prevent [phantom reads](#non-repeatable-reads-and-phantom-reads) that are caused by the insertion of new rows, since only existing rows can be locked.

{{site.data.alerts.callout_info}}
Locking reads are not effective for emulating `SERIALIZABLE` transactions, which can avoid locking reads because they always [retry or abort if reads are not current]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#read-refreshing). As a result, `READ COMMITTED` transactions that use locking reads will perform differently than `SERIALIZABLE` transactions at various levels of concurrency.
{{site.data.alerts.end}}

To use locking reads:

- If you need to read and later update a row within a transaction, use `SELECT ... FOR UPDATE` to acquire an exclusive lock on the row. This guarantees data integrity between the transaction's read and write operations.

- If you need to read the latest version of a row, and later update a **different** row within a transaction, use `SELECT ... FOR SHARE` to acquire a shared lock on the row. This blocks all concurrent writes on the row without unnecessarily blocking concurrent reads or other `SELECT ... FOR SHARE` queries.

	{{site.data.alerts.callout_success}}
	This allows an application to build cross-row consistency constraints by ensuring that rows that are read in a `READ COMMITTED` transaction will not change before the writes in the same transaction have been committed.
	{{site.data.alerts.end}}

## Examples

In this scenario:

- A hospital has an application for doctors to manage their on-call shifts.
- The hospital has a rule that at least one doctor must be on call at any one time.
- Two doctors are on call for a particular shift, and both of them try to request leave for the shift in two concurrent transactions.
- Under the `READ COMMITTED` isolation level, the [write skew anomaly](#write-skew-anomaly) can potentially result in both doctors successfully booking leave and the hospital having no doctors on call for that particular shift. 

The following examples demonstrate how to:

- Observe that `READ COMMITTED` transactions can [serve different reads](#demonstrate-interleaved-statements-in-read-committed-transactions).
- Use exclusive locks to [strengthen isolation for `READ COMMITTED` transactions](#reserve-rows-for-updates-using-exclusive-locks).
- Use shared locks to [reserve values in `READ COMMITTED` transactions](#reserve-row-values-using-shared-locks).

### Before you begin

1. Open the SQL shell using [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}).

1. Enable `READ COMMITTED` transactions:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	SET CLUSTER SETTING sql.txn.read_committed_isolation.enabled = 'true';
	~~~

1. Create the `doctors` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE doctors (
      id INT PRIMARY KEY,
      name TEXT
    );
    ~~~

1. Create the `schedules` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE schedules (
      day DATE,
      doctor_id INT REFERENCES doctors (id),
      on_call BOOL,
      PRIMARY KEY (day, doctor_id)
    );
    ~~~

1. Add two doctors to the `doctors` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    INSERT INTO doctors VALUES
      (1, 'Abe'),
      (2, 'Betty');
    ~~~

1. Insert one week's worth of data into the `schedules` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    INSERT INTO schedules VALUES
      ('2023-12-01', 1, true),
      ('2023-12-01', 2, true),
      ('2023-12-02', 1, true),
      ('2023-12-02', 2, true),
      ('2023-12-03', 1, true),
      ('2023-12-03', 2, true),
      ('2023-12-04', 1, true),
      ('2023-12-04', 2, true),
      ('2023-12-05', 1, true),
      ('2023-12-05', 2, true),
      ('2023-12-06', 1, true),
      ('2023-12-06', 2, true),
      ('2023-12-07', 1, true),
      ('2023-12-07', 2, true);
    ~~~

### Demonstrate interleaved statements in `READ COMMITTED` transactions

Before proceeding, reset the [example scenario](#before-you-begin):

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE schedules SET on_call = true WHERE on_call = false;
~~~

Confirm that at least one doctor is on call each day of the week:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT day, count(*) AS on_call FROM schedules
  WHERE on_call = true
  GROUP BY day
  ORDER BY day;  
~~~

~~~
     day     | on_call
-------------+----------
  2023-12-01 |       2
  2023-12-02 |       2
  2023-12-03 |       2
  2023-12-04 |       2
  2023-12-05 |       2
  2023-12-06 |       2
  2023-12-07 |       2
~~~

  <div class="grid-container">
  <h5 style="text-align:center">Session 1</h5><h5 style="text-align:center">Session 2</h5>
  <div class="grid-item">
Doctor 1, Abe, starts to request leave for `2023-12-05` using the hospital's schedule management application.

Start a transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
~~~

Check to make sure that another doctor is on call for `2023-12-05`:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM schedules
  WHERE day = '2023-12-05';
~~~

~~~
     day     | doctor_id | on_call
-------------+-----------+----------
  2023-12-05 |         1 |    t
  2023-12-05 |         2 |    t
~~~
  </div>

  <div class="grid-item">
Around the same time, Doctor 2, Betty, starts to request leave for the same day using the hospital's schedule management application. 

In a new terminal (Session 2), open the SQL shell on your [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) cluster. Start a transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
~~~

Check to make sure that another doctor is on call for `2023-12-05`:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM schedules
  WHERE day = '2023-12-05';
~~~

~~~
     day     | doctor_id | on_call
-------------+-----------+----------
  2023-12-05 |         1 |    t
  2023-12-05 |         2 |    t
~~~
  </div>

  <div class="grid-item">
In Session 1, the previous read confirmed that another doctor is available on `2023-12-05`. Update the schedule to put Abe on leave:

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE schedules SET on_call = false
  WHERE day = '2023-12-05'
  AND doctor_id = 1;
~~~

Read the rows for `2023-12-05`. Session 1 sees that only Abe is on leave once its transaction commits:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM schedules
  WHERE day = '2023-12-05';
~~~

~~~
     day     | doctor_id | on_call
-------------+-----------+----------
  2023-12-05 |         1 |    f
  2023-12-05 |         2 |    t
~~~
  </div>

  <div class="grid-item">
In Session 2, the previous read confirmed that another doctor is available on `2023-12-05`. Update the schedule to put Betty on leave:

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE schedules SET on_call = false
  WHERE day = '2023-12-05'
  AND doctor_id = 2;
~~~

Read the rows for `2023-12-05`. Session 2 sees that only Betty is on leave once its transaction commits:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM schedules
  WHERE day = '2023-12-05';
~~~

~~~
     day     | doctor_id | on_call
-------------+-----------+----------
  2023-12-05 |         1 |    t
  2023-12-05 |         2 |    f
~~~
  </div>

  <div class="grid-item">
In Session 1, commit the transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
~~~

[By design under `READ COMMITTED` isolation]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#write-skew-tolerance), CockroachDB allows the transaction to commit even though its previous read (the `SELECT` query) has changed due to the concurrent transaction in Session 2.
  </div>

  <div class="grid-item">
In Session 2, read the rows for `2023-12-05` again:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM schedules
  WHERE day = '2023-12-05';
~~~

~~~
     day     | doctor_id | on_call
-------------+-----------+----------
  2023-12-05 |         1 |    f
  2023-12-05 |         2 |    f
~~~

The result has changed because Session 1 committed earlier and updated the `on_call` value for doctor 1, thus changing the read result for the transaction in Session 2.

If the transaction in Session 2 commits and updates the `on_call` value for Betty, this will create a [write skew anomaly](#write-skew-anomaly). The result would be that neither Abe nor Betty is scheduled to be on call on `2023-12-05`.

Instead, the transaction should rollback so that the write skew anomaly does not commit:

{% include_cached copy-clipboard.html %}
~~~ sql
ROLLBACK;
~~~
  </div>
</div>

### Reserve rows for updates using exclusive locks

Before proceeding, reset the [example scenario](#before-you-begin):

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE schedules SET on_call = true WHERE on_call = false;
~~~

Confirm that at least one doctor is on call each day of the week:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT day, count(*) AS on_call FROM schedules
  WHERE on_call = true
  GROUP BY day
  ORDER BY day;  
~~~

~~~
     day     | on_call
-------------+----------
  2023-12-01 |       2
  2023-12-02 |       2
  2023-12-03 |       2
  2023-12-04 |       2
  2023-12-05 |       2
  2023-12-06 |       2
  2023-12-07 |       2
~~~

  <div class="grid-container">
  <h5 style="text-align:center">Session 1</h5><h5 style="text-align:center">Session 2</h5>
  <div class="grid-item">
Doctor 1, Abe, starts to request leave for `2023-12-05` using the hospital's schedule management application.

Start a transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
~~~

Check to make sure that another doctor is on call for `2023-12-05`. Use [`FOR UPDATE`]({% link {{ page.version.version }}/select-for-update.md %}) to lock the rows so that only the current transaction can update them:

  {{site.data.alerts.callout_success}}
  Include an `ORDER BY` clause to force locking to occur in a specific order. This prevents potential deadlock with another locking read on the same rows, which can cause the transaction to abort.
  {{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM schedules
  WHERE day = '2023-12-05'
  ORDER BY doctor_id
  FOR UPDATE;
~~~

~~~
     day     | doctor_id | on_call
-------------+-----------+----------
  2023-12-05 |         1 |    t
  2023-12-05 |         2 |    t
~~~
  </div>

  <div class="grid-item">
Around the same time, Doctor 2, Betty, starts to request leave for the same day using the hospital's schedule management application. 

In a new terminal (Session 2), open the SQL shell on your [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) cluster. Start a transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
~~~

Check to make sure that another doctor is on call for `2023-12-05`. Use `FOR UPDATE` to lock the rows so that only the current transaction can update them:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM schedules
  WHERE day = '2023-12-05'
  ORDER BY doctor_id
  FOR UPDATE;
~~~

However, because Session 1 has already acquired an [exclusive lock](#locking-reads) on these rows, the current transaction is blocked until Session 1 releases its lock.
  </div>

  <div class="grid-item">
In Session 1, the previous read confirmed that another doctor is available on `2023-12-05`. Update the schedule to put Abe on leave:

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE schedules SET on_call = false
  WHERE day = '2023-12-05'
  AND doctor_id = 1;
~~~

Commit the transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
~~~
</div>

  <div class="grid-item">
Once the transaction in Session 1 commits, it releases its exclusive lock. Session 2 can read the rows for `2023-12-05`, which show that Abe has already been put on leave for that day:

~~~
     day     | doctor_id | on_call
-------------+-----------+----------
  2023-12-05 |         1 |    f
  2023-12-05 |         2 |    t
~~~

Rollback the transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
ROLLBACK;
~~~
  </div>
</div>

### Reserve row values using shared locks

Before proceeding, reset the [example scenario](#before-you-begin):

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE schedules SET on_call = true WHERE on_call = false;
~~~

Confirm that at least one doctor is on call each day of the week:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT day, count(*) AS on_call FROM schedules
  WHERE on_call = true
  GROUP BY day
  ORDER BY day;  
~~~

~~~
     day     | on_call
-------------+----------
  2023-12-01 |       2
  2023-12-02 |       2
  2023-12-03 |       2
  2023-12-04 |       2
  2023-12-05 |       2
  2023-12-06 |       2
  2023-12-07 |       2
~~~

  <div class="grid-container">
  <h5 style="text-align:center">Session 1</h5><h5 style="text-align:center">Session 2</h5>
  <div class="grid-item">
Doctor 1, Abe, starts to request leave for `2023-12-05` using the hospital's schedule management application.

Start a transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
~~~

Check to make sure that another doctor is on call for `2023-12-05`. Use [`FOR SHARE`]({% link {{ page.version.version }}/select-for-update.md %}) to lock the rows so that they cannot be updated by another transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM schedules
  WHERE day = '2023-12-05'
  FOR SHARE;
~~~

~~~
     day     | doctor_id | on_call
-------------+-----------+----------
  2023-12-05 |         1 |    t
  2023-12-05 |         2 |    t
~~~
</div>

  <div class="grid-item">
Around the same time, Doctor 2, Betty, starts to request leave for the same day using the hospital's schedule management application. 

In a new terminal (Session 2), open the SQL shell on your [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) cluster. Start a transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
~~~

Check to make sure that another doctor is on call for `2023-12-05`. Use `FOR SHARE` to lock the rows so that they cannot be updated by another transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM schedules
  WHERE day = '2023-12-05'
  FOR SHARE;
~~~

~~~
     day     | doctor_id | on_call
-------------+-----------+----------
  2023-12-05 |         1 |    t
  2023-12-05 |         2 |    t
~~~
  </div>

</div>

Shared locks are [typically used](#when-to-use-locking-reads) when a transaction needs to read the latest version of a row, but does not need to update the row. With the rows locked by both Sessions 1 and 2, a third Session 3 is blocked from updating the rows:

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE schedules SET on_call = false
  WHERE day = '2023-12-05'
  AND doctor_id = 1;
~~~

Once both Sessions 1 and 2 commit or rollback their transactions, Session 3 can complete the update to place Abe on leave:

~~~
UPDATE 1
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
~~~

Read the rows for `2023-12-05` and confirm that Betty is still on call:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM schedules
  WHERE day = '2023-12-05';
~~~

~~~
     day     | doctor_id | on_call
-------------+-----------+----------
  2023-12-05 |         1 |    f
  2023-12-05 |         2 |    t
~~~

## Known limitations

{% include {{ page.version.version }}/known-limitations/read-committed-limitations.md %}

## See also

- [Transaction Layer]({% link {{ page.version.version }}/architecture/transaction-layer.md %})
- [`SELECT ... FOR UPDATE`]({% link {{ page.version.version }}/select-for-update.md %})
- [Serializable Transactions]({% link {{ page.version.version }}/demo-serializable.md %})
- [What Write Skew Looks Like](https://www.cockroachlabs.com/blog/what-write-skew-looks-like/)
- [Read Committed RFC](https://github.com/cockroachdb/cockroach/blob/master/docs/RFCS/20230122_read_committed_isolation.md)
- [Migration Overview]({% link molt/migration-overview.md %})
