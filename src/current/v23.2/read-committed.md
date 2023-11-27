---
title: Read Committed Transactions
summary: Follow a demonstration of READ COMMITTED isolation
toc: true
docs_area: deploy
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

{% include_cached new-in.html version="v23.2" %} `READ COMMITTED` is one of two [transaction isolation levels](https://wikipedia.org/wiki/Isolation_(database_systems)) supported on CockroachDB. By default, CockroachDB uses the [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) isolation level, which is the strongest [ANSI transaction isolation level](https://wikipedia.org/wiki/Isolation_(database_systems)#Isolation_levels). `READ COMMITTED` isolation is appropriate in the following scenarios:

- Your application needs to maintain a high workload concurrency with minimal [transaction retries]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#client-side-retry-handling), and it can tolerate potential [concurrency anomalies](#concurrency-anomalies). Predictable query performance at high concurrency is more valuable than guaranteed data correctness.

- You are [migrating an application to CockroachDB]({% link {{ page.version.version }}/migration-overview.md %}) that was built at a `READ COMMITTED` isolation level on the source database, and it is not feasible to modify your application to use `SERIALIZABLE` isolation.

Whereas `SERIALIZABLE` isolation guarantees data correctness by placing transactions into a [serializable ordering]({% link {{ page.version.version }}/demo-serializable.md %}), `READ COMMITTED` isolation permits some [concurrency anomalies](#concurrency-anomalies) in exchange for minimizing transaction aborts and [retries]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}). Unlike `SERIALIZABLE` transactions, `READ COMMITTED` transactions do not usually return any serialization errors that require client-side handling. For more details, see [Differences from `SERIALIZABLE` in CockroachDB](#differences-from-serializable-in-cockroachdb).

{{site.data.alerts.callout_info}}
`READ COMMITTED` on CockroachDB provides stronger isolation than `READ COMMITTED` on PostgreSQL. On CockroachDB, `READ COMMITTED` internally [retries individual statements that encounter write conflicts]((#per-statement-retries)). This prevents anomalies within single statements. For complete details on how `READ COMMITTED` is implemented on CockroachDB, see the [Read Committed RFC](https://github.com/cockroachdb/cockroach/blob/master/docs/RFCS/20230122_read_committed_isolation.md).
{{site.data.alerts.end}}

## Enable `READ COMMITTED` isolation

To make `READ COMMITTED` isolation available to use on a cluster, enable the following [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) in the SQL shell:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.txn.read_committed_isolation.enabled = 'true';
~~~

After you enable the cluster setting, you can configure `READ COMMITTED` isolation at the [session](#set-the-current-session-to-read-committed) or [transaction](#set-the-current-transaction-to-read-committed) level.

### Set the current session to `READ COMMITTED`

You can set all future transactions in a session to run at `READ COMMITTED` isolation.

Using [`SET SESSION CHARACTERISTICS`]({% link {{ page.version.version }}/set-vars.md %}#special-syntax-cases):

{% include_cached copy-clipboard.html %}
~~~ sql
SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL READ COMMITTED;
~~~

Using the `default_transaction_isolation` [session variable]({% link {{ page.version.version }}/session-variables.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
SET default_transaction_isolation = 'read committed';
~~~

To view the isolation level of a session:

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

You can begin a transaction as a `READ COMMITTED` transaction.

Using [`BEGIN TRANSACTION ISOLATION LEVEL`]({% link {{ page.version.version }}/begin-transaction.md %}#parameters):

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
~~~

Using [`SET TRANSACTION ISOLATION LEVEL`]({% link {{ page.version.version }}/set-transaction.md %}#parameters) at the beginning of the transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN;
  SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
~~~

Using the `transaction_isolation` [session variable]({% link {{ page.version.version }}/session-variables.md %}) at the beginning of the transaction: 

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
Starting a transaction as `READ COMMITTED` does not affect the [session-level isolation setting](#set-the-current-session-to-read-committed), which can be different.
{{site.data.alerts.end}}

## Differences from `SERIALIZABLE` in CockroachDB

`READ COMMITTED` and `SERIALIZABLE` transactions have the following key differences:

- `READ COMMITTED` transactions do not usually return serialization errors to applications, making it unnecessary to implement [client-side retries]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#client-side-retry-handling) to handle `40001` errors under [transaction contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention). For details on how `READ COMMITTED` transactions handle conflicts, see [Transaction conflict behavior](#transaction-conflict-behavior).
- `READ COMMITTED` transactions permit some types of concurrency anomalies that are prevented in `SERIALIZABLE` transactions. For details on anomalies that can be experienced by `READ COMMITTED` transactions, see [Concurrency anomalies](#concurrency-anomalies). These can be mitigated through the selective use of [locking reads](#locking-reads).
- `READ COMMITTED` transactions use *per-statement read snapshots* to evaluate rows, whereas `SERIALIZABLE` transactions use per-transaction read snapshots. `READ COMMITTED` transactions can operate across multiple read snapshots. For details, see [Per-statement read snapshots](#per-statement-read-snapshots).

Under both `READ COMMITTED` and `SERIALIZABLE` isolation, transactions use globally consistent read snapshots and commit atomically.

### Per-statement read snapshots

A `READ COMMITTED` transaction's read snapshot advances with each statement in the transaction. When each statement begins, it establishes a new read snapshot from the [MVCC]({% link {{ page.version.version }}/architecture/storage-layer.md %}#mvcc) timestamp, capturing the writes previously committed by transactions. This means that a `READ COMMITTED` transaction can operate across multiple read snapshots, and guarantees that when a `READ COMMITTED` transaction begins, it will only read the latest value of each row it retrieves.

Per-statement read snapshots enable `READ COMMITTED` transactions to resolve [serialization errors]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}) by retrying individual statements rather than entire transactions. Statement-level retries are automatically performed without involving the client, whereas transaction-level retries (as required with `SERIALIZABLE` isolation) usually require [client-side logic]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#client-side-retry-handling). For more details on how `READ COMMITTED` transactions handle conflicts, see [Transaction conflict behavior](#transaction-conflict-behavior).

{{site.data.alerts.callout_info}}
Because each subsequent statement uses a new read snapshot, this means that reads in a `READ COMMITTED` transaction can return different results. For details, see [Non-repeatable reads and phantom reads](#non-repeatable-reads-and-phantom-reads).
{{site.data.alerts.end}}

### Transaction conflict behavior

`READ COMMITTED` transactions handle [conflicts]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#transaction-conflicts) differently than `SERIALIZABLE` transactions, with the outcome that `READ COMMITTED` transactions can often avoid blocking other transactions, thereby minimizing transaction aborts and [retries]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}).

- <a name="per-statement-retries"></a> If a `READ COMMITTED` transaction conflicts with another transaction such that a serialization error ([`WriteTooOld`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#retry_write_too_old), [`RETRY_SERIALIZABLE`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#retry_serializable), or [`ReadWithinUncertaintyInterval`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#readwithinuncertaintyintervalerror)) is generated, the `READ COMMITTED` transaction attempts to resolve the error by internally retrying the statement that is in conflict. This differs from `SERIALIZABLE` transactions, which immediately abort the transaction and return the error to the client, thus prompting the client to retry the entire transaction. A `READ COMMITTED` transaction can retry individual statements at new [read timestamps](#per-statement-read-snapshots) without involving the client.

	This means that under normal operating conditions, a `READ COMMITTED` transaction will **not** return serializable errors to your client.

- <a name="write-skew-tolerance"></a> At commit time, a `READ COMMITTED` transaction's read and write timestamps are permitted to skew, making it possible for statements in concurrent `READ COMMITTED` transactions to interleave with one another without blocking or aborting transactions. `SERIALIZABLE` transactions, in contrast, require read and write timestamps to be equal before the transaction can commit. If a `READ COMMITTED` transaction's write timestamp is [pushed by the timestamp cache]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#timestamp-cache), CockroachDB does not adjust the transaction's read timestamp to match the write timestamp by [refreshing earlier reads]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#read-refreshing), as it does for `SERIALIZABLE` transactions.

	This means read operations in a `READ COMMITTED` transaction are **not** guaranteed to return the latest value of a row when the transaction commits, thus enabling potential [concurrency anomalies](#concurrency-anomalies). It also means that a `READ COMMITTED` transaction will never be aborted because its reads were not correct at commit time. 

	{{site.data.alerts.callout_success}}
	[Locking reads](#locking-reads) in a `READ COMMITTED` transaction will always return the latest value of a row, but can block concurrent transactions.
	{{site.data.alerts.end}}

- Under `READ COMMITTED` isolation, a write can never block a read of the same row. In `SERIALIZABLE` transactions, a [subset of write-read conflicts]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#transaction-conflicts) can block in order to maintain serializable ordering.

`READ COMMITTED` transactions can still abort in some scenarios, including:

- Transactions at all isolation levels are subject to [*lock contention*]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention), where a transaction attempts to lock a row that is already locked by a [write]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#write-intents) or [locking read](#locking-reads). In such cases, the later transaction is blocked until the earlier transaction commits or rolls back, thus releasing its lock on the row. Locking contention that produces a *deadlock* between two transactions will result in a transaction abort and a `40001` error ([`ABORT_REASON_ABORTED_RECORD_FOUND`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#abort_reason_aborted_record_found) or [`ABORT_REASON_PUSHER_ABORTED`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#ABORT_REASON_PUSHER_ABORTED)) returned to the client. For an example, see [Reserve row values using shared locks](#reserve-row-values-using-shared-locks).

- [Constraint]({% link {{ page.version.version }}/constraints.md %}) violations will abort transactions at all isolation levels.

- In rare cases, a `WriteTooOld` or `RETRY_SERIALIZABLE` error will be returned to the client if a statement has already begun streaming a partial result set back to the client and cannot retry transparently. By default, the result set is buffered up to 16 KiB before overflowing and being streamed to the client. You can configure the result buffer size using the [`sql.defaults.results_buffer.size`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-defaults-results-buffer-size) cluster setting or the [`results_buffer_size`]({% link {{ page.version.version }}/session-variables.md %}) session variable.

### Concurrency anomalies

Statements in concurrent `READ COMMITTED` transactions [can interleave with each other](#write-skew-tolerance). This can create concurrency anomalies that are not permitted under `SERIALIZABLE` isolation, which places concurrent transactions into a [serializable ordering]({% link {{ page.version.version }}/demo-serializable.md %}).

{{site.data.alerts.callout_success}}
The behavior described in this section assumes the use of non-locking reads. Concurrency anomalies can be prevented through the selective use of [locking reads](#locking-reads), which can also increase latency due to [lock contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention).
{{site.data.alerts.end}}

#### Write skew anomaly

Because a `READ COMMITTED` transaction's [read timestamp can skew from its write timestamp](#write-skew-tolerance), the following sequence of operations is possible: 

1. Transaction `A` reads row `R` in table `T` at timestamp `1`.
1. Transaction `B` writes to row `R` in table `T` and commits at timestamp `2`.
1. Transaction `A` writes to table `T` and commits at timestamp `3`.

Under `SERIALIZABLE` isolation, transaction `A` would have [refreshed the read]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#read-refreshing) from timestamp `1` and found it to be incorrect at timestamp `3`. The transaction would have aborted with a [`RETRY_SERIALIZABLE`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#retry_serializable) error, prompting the client to retry the transaction.

Under `READ COMMITTED` isolation, transaction `A` does not refresh the read from timestamp `1`. Transaction `A` can commit at timestamp `3` even though the read results are already different at timestamp `2`. This does not inherently create an anomaly, but is the basis of potential *write skew anomalies* where two concurrent transactions each read values that the other subsequently updates.

##### Example: Write skew anomaly

For an example of how a write skew anomaly can occur, see [Demonstrate multiple read snapshots in `READ COMMITTED` transactions](#demonstrate-multiple-read-snapshots-in-read-committed-transactions).

#### Lost updates

The `READ COMMITTED` conditions that permit [write skew anomalies](#write-skew-anomaly) also permit *lost updates*, where an update from a transaction appears to be "lost" because it is overwritten by a concurrent transaction:

1. Transaction `A` reads row `R` in table `T` at timestamp `1`.
1. Transaction `B` writes to row `R` in table `T` and commits at timestamp `2`.
1. Transaction `A` writes to row `R` in table `T` and commits at timestamp `3`.

Under `SERIALIZABLE` isolation, transaction `A` would have [refreshed the read]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#read-refreshing) from timestamp `1` and found that its write at timestamp `3` was targeting values that had already changed at timestamp `2`. The transaction would have aborted with a [`WriteTooOld`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#retry_write_too_old) error, prompting the client to retry the transaction.

Under `READ COMMITTED` isolation, transaction `A` does not refresh the read from timestamp `1`. Transaction `A` can commit at timestamp `3` without detecting a conflicting write at timestamp `2`. Transaction `A` effectively overwrites the update from transaction `B` with its own update.

##### Example: Lost update

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
While concurrent `READ COMMITTED` transactions can have their writes overwritten, **uncommitted** writes in `READ COMMITTED` transactions cannot be overwritten.
{{site.data.alerts.end}}

#### Non-repeatable reads and phantom reads

Since `READ COMMITTED` transactions use [per-statement read snapshots](#per-statement-retries), they can serve different reads over the course of a transaction.

*Non-repeatable reads* return different row values because a concurrent transaction updated the values in between reads:

1. Transaction `A` reads row `R` in table `T` at timestamp `1`.
1. Transaction `B` writes to row `R` in table `T` and commits at timestamp `2`.
1. Transaction `A` reads row `R` in table `T` and gets a different result at timestamp `3`.

*Phantom reads* return different rows because a concurrent transaction changed the set of rows that satisfy the row search:

1. Transaction `A` reads the set of rows `S` in table `T` at timestamp `1`.
1. Transaction `B` inserts, deletes, or updates rows in `S` in table `T` and commits at timestamp `2`.
1. Transaction `A` reads the set of rows `S` in table `T` and gets a different result at timestamp `3`.

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

## Locking reads

To reduce the occurrence of [concurrency anomalies](#concurrency-anomalies) in `READ COMMITTED` isolation, you can strengthen the isolation of individual transactions by using [`SELECT FOR UPDATE`]({% link {{ page.version.version }}/select-for-update.md %}) or [`SELECT FOR SHARE`]({% link {{ page.version.version }}/select-for-update.md %}) to issue *locking reads* on specific rows. Reads using the `FOR UPDATE` or `FOR SHARE` clauses behave similarly to [writes]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#write-intents): they exclusively lock qualifying rows to prevent concurrent writes from modifying them until the transaction commits. Conversely, if a locking read finds that a row is exclusively locked by a concurrent transaction, it waits for the other transaction to commit or rollback before proceeding. A locking read in a transaction will always have the latest value of a row when the transaction commits.

The clause used with the `SELECT` statement determines the *lock strength* of a locking read:

{% include {{ page.version.version }}/sql/select-lock-strengths.md %}

By default for `READ COMMITTED` transactions, locks are replicated via [Raft]({% link {{ page.version.version }}/architecture/replication-layer.md %}#raft). This allows locks to be preserved even if the [leaseholder node]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leases) serving a locking read dies and its [lease is transferred to another node]({% link {{ page.version.version }}/architecture/replication-layer.md %}#how-leases-are-transferred-from-a-dead-node).

### When to use locking reads

Use locking reads in your application if certain `READ COMMITTED` transactions must guarantee data correctness in [high-contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) scenarios.

Non-locking reads can allow intermediate writes to update rows before `READ COMMITTED` transactions commit, potentially creating [concurrency anomalies](#concurrency-anomalies). Locking reads prevent such anomalies, but increase the amount of lock contention that [may require intervention]({% link {{ page.version.version }}/performance-recipes.md %}#waiting-transaction) if latency becomes too high.

Locking reads are not effective for emulating `SERIALIZABLE` transactions, which can avoid locking reads because they [refresh reads]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#read-refreshing) at commit time to verify their correctness, potentially causing the transaction to abort. As a result, `READ COMMITTED` transactions that use locking reads will perform differently than `SERIALIZABLE` transactions at various levels of concurrency.

If you decide to use locking reads:

- If a transaction needs to update a row, use `SELECT FOR UPDATE` to acquire an exclusive lock on the row. This guarantees data integrity between the transaction's read and write operations.

- If a transaction needs to read the latest value of a row, but not update the row, use `SELECT FOR SHARE` to block all concurrent writes on the row without unnecessarily blocking concurrent reads.

## Examples

In this scenario:

- A hospital has an application for doctors to manage their on-call shifts.
- The hospital has a rule that at least one doctor must be on call at any one time.
- Two doctors are on call for a particular shift, and both of them try to request leave for the shift in two concurrent transactions.
- Under the `READ COMMITTED` isolation level, the [write skew anomaly](#write-skew-anomaly) anomaly can potentially result in both doctors successfully booking leave and the hospital having no doctors on call for that particular shift. 

The following examples demonstrate how to:

- Observe that `READ COMMITTED` transactions can use [multiple read snapshots](#demonstrate-multiple-read-snapshots-in-read-committed-transactions).
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

### Demonstrate multiple read snapshots in `READ COMMITTED` transactions

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

[By design under `READ COMMITTED` isolation](#write-skew-tolerance), CockroachDB allows the transaction to commit even though its previous read (the `SELECT` query) has become incorrect due to the concurrent transaction in Session 2.
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

The result has changed because Session 1 committed earlier, thus updating the `on_call` value for doctor 1. The `READ COMMITTED` transaction in Session 2 sees this because its [read snapshot advances with each statement](#per-statement-read-snapshots).

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

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM schedules
  WHERE day = '2023-12-05'
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

  <div class="grid-item">
In Session 1, the previous read confirmed that another doctor is available on `2023-12-05`. Update the schedule to put Abe on leave:

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE schedules SET on_call = false
  WHERE day = '2023-12-05'
  AND doctor_id = 1;
~~~

However, because Session 2 has also acquired a shared lock on these rows, the current transaction is blocked until Session 2 releases its lock.

{{site.data.alerts.callout_success}}
`FOR SHARE` is not typically used by transactions that intend to update rows, as shown by the following steps. For more information, see [When to use locking reads](#when-to-use-locking-reads).
{{site.data.alerts.end}}
  </div>

  <div class="grid-item">
In Session 2, the previous read confirmed that another doctor is available on `2023-12-05`. Update the schedule to put Betty on leave:

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE schedules SET on_call = false
  WHERE day = '2023-12-05'
  AND doctor_id = 2;
~~~

However, because Session 1 has also acquired a shared lock on these rows, the current transaction is blocked until Session 1 releases its lock.

Because each concurrent transaction is waiting on the other to release its lock, they will deadlock. Session 2 aborts first with a [`ABORT_REASON_PUSHER_ABORTED`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#ABORT_REASON_PUSHER_ABORTED) error:

~~~
ERROR: restart transaction: TransactionRetryWithProtoRefreshError: TransactionAbortedError(ABORT_REASON_PUSHER_ABORTED): "sql txn" meta={id=85394586 key=/Tenant/2/Table/115/1/19696/1/0 iso=ReadCommitted pri=0.01582601 epo=0 ts=1700690868.143651000,0 min=1700690819.160354000,0 seq=0} lock=true stat=ABORTED rts=1700690868.143651000,0 wto=false gul=1700690819.660354000,0
~~~
</div>

  <div class="grid-item">
With the transaction in Session 2 aborted, Session 1 completes its update to place Abe on leave:

~~~
UPDATE 1
~~~

Commit the transaction:

{% include_cached copy-clipboard.html %}
~~~ sql
COMMIT;
~~~
  </div>
</div>

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

The following are not yet supported with `READ COMMITTED`:

- Schema changes cannot be performed within explicit `READ COMMITTED` transactions, and will cause transactions to abort. As a workaround, [set the transaction's isolation level](#set-the-current-transaction-to-read-committed) to `SERIALIZABLE`.
- `READ COMMITTED` isolation cannot be set at the cluster level. As a workaround, run `ALTER ROLE ALL SET default_transaction_isolation = 'read committed'`.
- `READ COMMITTED` transactions cannot access [`REGIONAL BY ROW`]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables) tables.

## See also

- [Transaction Layer]({% link {{ page.version.version }}/architecture/transaction-layer.md %})
- [`SELECT FOR UPDATE`]({% link {{ page.version.version }}/select-for-update.md %})
- [Serializable Transactions]({% link {{ page.version.version }}/demo-serializable.md %})
- [What Write Skew Looks Like](https://www.cockroachlabs.com/blog/what-write-skew-looks-like/)
- [Read Committed RFC](https://github.com/cockroachdb/cockroach/blob/master/docs/RFCS/20230122_read_committed_isolation.md)
- [Migration Overview]({% link {{ page.version.version }}/migration-overview.md %})