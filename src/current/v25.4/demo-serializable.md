---
title: Serializable Transactions
summary: Follow a demonstration of the importance of SERIALIZABLE isolation for data correctness
toc: true
toc_not_nested: true
docs_area: deploy
---

In contrast to most databases, CockroachDB offers `SERIALIZABLE` isolation by default, which is the strongest of the four [transaction isolation levels](https://wikipedia.org/wiki/Isolation_(database_systems)) defined by the SQL standard and is stronger than the `SNAPSHOT` isolation level developed later. `SERIALIZABLE` isolation guarantees that even though transactions may execute in parallel, the result is the same as if they had executed one at a time, without any concurrency. This ensures data correctness by preventing all "anomalies" allowed by weaker isolation levels.

In this tutorial, you'll work through a hypothetical scenario that demonstrates the effectiveness of `SERIALIZABLE` isolation for maintaining data correctness.

1. You'll start by reviewing the scenario and its schema.
1. You'll finish by executing the scenario at `SERIALIZABLE` isolation, observing how it guarantees correctness. You'll use CockroachDB for this portion.

{{site.data.alerts.callout_info}}
For a deeper discussion of transaction isolation and the write skew anomaly, see the [Real Transactions are Serializable](https://www.cockroachlabs.com/blog/acid-rain/) and [What Write Skew Looks Like](https://www.cockroachlabs.com/blog/what-write-skew-looks-like/) blog posts.
{{site.data.alerts.end}}

## Overview

### Scenario

- A hospital has an application for doctors to manage their on-call shifts.
- The hospital has a rule that at least one doctor must be on call at any one time.
- Two doctors are on-call for a particular shift, and both of them try to request leave for the shift at approximately the same time.
- In PostgreSQL, with the default [`READ COMMITTED`]({% link {{ page.version.version }}/read-committed.md %}) isolation level, the [write skew](#write-skew) anomaly results in both doctors successfully booking leave and the hospital having no doctors on call for that particular shift.
- In CockroachDB, with the `SERIALIZABLE` isolation level, write skew is prevented, one doctor is allowed to book leave and the other is left on-call, and lives are saved.

#### Write skew

When write skew happens, a transaction reads something, makes a decision based on the value it saw, and writes the decision to the database. However, by the time the write is made, the premise of the decision is no longer true. Only `SERIALIZABLE` and some implementations of `REPEATABLE READ` isolation prevent this anomaly.

### Schema

<img src="{{ 'images/v25.4/serializable_schema.png' | relative_url }}" alt="Schema for serializable transaction tutorial" style="max-width:100%" />

## Step 1. Set up the scenario on PostgreSQL

1. If you haven't already, install PostgreSQL locally. On Mac, you can use [Homebrew](https://brew.sh/):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ brew install postgres
    ~~~

1. [Start PostgreSQL](https://www.postgresql.org/docs/10/static/server-start.html):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ postgres -D /usr/local/var/postgres &
    ~~~

1. Open a SQL connection to PostgreSQL:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ psql
    ~~~

1. Create the `doctors` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE doctors (
        id INT PRIMARY KEY,
        name TEXT
    );
    ~~~

1. Create the `schedules` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE schedules (
        day DATE,
        doctor_id INT REFERENCES doctors (id),
        on_call BOOL,
        PRIMARY KEY (day, doctor_id)
    );
    ~~~

1. Add two doctors to the `doctors` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO doctors VALUES
        (1, 'Abe'),
        (2, 'Betty');
    ~~~

1. Insert one week's worth of data into the `schedules` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO schedules VALUES
        ('2024-10-01', 1, true),
        ('2024-10-01', 2, true),
        ('2024-10-02', 1, true),
        ('2024-10-02', 2, true),
        ('2024-10-03', 1, true),
        ('2024-10-03', 2, true),
        ('2024-10-04', 1, true),
        ('2024-10-04', 2, true),
        ('2024-10-05', 1, true),
        ('2024-10-05', 2, true),
        ('2024-10-06', 1, true),
        ('2024-10-06', 2, true),
        ('2024-10-07', 1, true),
        ('2024-10-07', 2, true);
    ~~~

1. Confirm that at least one doctor is on call each day of the week:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT day, count(*) AS doctors_on_call FROM schedules
      WHERE on_call = true
      GROUP BY day
      ORDER BY day;
    ~~~

    ~~~
        day     | doctors_on_call
    ------------+-----------------
     2024-10-01 |               2
     2024-10-02 |               2
     2024-10-03 |               2
     2024-10-04 |               2
     2024-10-05 |               2
     2024-10-06 |               2
     2024-10-07 |               2
    (7 rows)
    ~~~

## Step 2. Run the scenario on PostgreSQL

1. Doctor 1, Abe, starts to request leave for 10/5/18 using the hospital's schedule management application. The application starts a transaction:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > BEGIN;
    ~~~

1. The application checks to make sure at least one other doctor is on call for the requested date:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT count(*) FROM schedules
      WHERE on_call = true
      AND day = '2024-10-05'
      AND doctor_id != 1;
    ~~~

    ~~~
     count
    -------
         1
    (1 row)
    ~~~

1. Around the same time, doctor 2, Betty, starts to request leave for the same day using the hospital's schedule management application. In a new terminal, start a second SQL session:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ psql
    ~~~

1. The application starts a transaction:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > BEGIN;
    ~~~

1. The application checks to make sure at least one other doctor is on call for the requested date:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT count(*) FROM schedules
      WHERE on_call = true
      AND day = '2024-10-05'
      AND doctor_id != 2;
    ~~~

    ~~~
     count
    -------
         1
    (1 row)
    ~~~

1. In the terminal for doctor 1, since the previous check confirmed that another doctor is on call for 10/5/18, the application tries to update doctor 1's schedule:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > UPDATE schedules SET on_call = false
      WHERE day = '2024-10-05'
      AND doctor_id = 1;
    ~~~

1. In the terminal for doctor 2, since the previous check confirmed the same thing, the application tries to update doctor 2's schedule:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > UPDATE schedules SET on_call = false
      WHERE day = '2024-10-05'
      AND doctor_id = 2;
    ~~~

1. In the terminal for doctor 1, the application commits the transaction, despite the fact that the previous check (the `SELECT` query) is no longer true:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > COMMIT;
    ~~~

1. In the terminal for doctor 2, the application commits the transaction, despite the fact that the previous check (the `SELECT` query) is no longer true:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > COMMIT;
    ~~~

## Step 3. Check data correctness on PostgreSQL

So what just happened? Each transaction started by reading a value that, before the end of the transaction, became incorrect. Despite that fact, each transaction was allowed to commit. This is known as write skew, and the result is that 0 doctors are scheduled to be on call on 10/5/18.

To check this, in either terminal, run:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM schedules WHERE day = '2024-10-05';
~~~

~~~
    day     | doctor_id | on_call
------------+-----------+---------
 2024-10-05 |         1 | f
 2024-10-05 |         2 | f
(2 rows)
~~~

Again, this anomaly is the result of PostgreSQL's default isolation level of [`READ COMMITTED`]({% link {{ page.version.version }}/read-committed.md %}), but note that this would happen with any isolation level except `SERIALIZABLE` and some implementations of `REPEATABLE READ`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TRANSACTION_ISOLATION;
~~~

~~~
 transaction_isolation
-----------------------
 read committed
(1 row)
~~~

Exit each SQL shell with `\q` and then stop the PostgreSQL server:

{% include_cached copy-clipboard.html %}
~~~ shell
$ pkill -9 postgres
~~~

## Step 4. Set up the scenario on CockroachDB

When you repeat the scenario on CockroachDB, you'll see that the anomaly is prevented by CockroachDB's `SERIALIZABLE` transaction isolation.

1. If you haven't already, [install CockroachDB]({% link {{ page.version.version }}/install-cockroachdb.md %}) locally.

1. Use the [`cockroach start-single-node`]({% link {{ page.version.version }}/cockroach-start-single-node.md %}) command to start a one-node CockroachDB cluster in insecure mode:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node \
    --insecure \
    --store=serializable-demo \
    --listen-addr=localhost
    ~~~

1. In a new terminal window, open the [built-in SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}) and connect to `localhost`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --host=localhost
    ~~~

1. Create the `doctors` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE doctors (
        id INT PRIMARY KEY,
        name TEXT
    );
    ~~~

1. Create the `schedules` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE schedules (
        day DATE,
        doctor_id INT REFERENCES doctors (id),
        on_call BOOL,
        PRIMARY KEY (day, doctor_id)
    );
    ~~~

1. Add two doctors to the `doctors` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO doctors VALUES
        (1, 'Abe'),
        (2, 'Betty');
    ~~~

1. Insert one week's worth of data into the `schedules` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO schedules VALUES
        ('2024-10-01', 1, true),
        ('2024-10-01', 2, true),
        ('2024-10-02', 1, true),
        ('2024-10-02', 2, true),
        ('2024-10-03', 1, true),
        ('2024-10-03', 2, true),
        ('2024-10-04', 1, true),
        ('2024-10-04', 2, true),
        ('2024-10-05', 1, true),
        ('2024-10-05', 2, true),
        ('2024-10-06', 1, true),
        ('2024-10-06', 2, true),
        ('2024-10-07', 1, true),
        ('2024-10-07', 2, true);
    ~~~

1. Confirm that at least one doctor is on call each day of the week:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT day, count(*) AS on_call FROM schedules
      WHERE on_call = true
      GROUP BY day
      ORDER BY day;
    ~~~

    ~~~
         day     | on_call
    -------------+----------
      2024-10-01 |       2
      2024-10-02 |       2
      2024-10-03 |       2
      2024-10-04 |       2
      2024-10-05 |       2
      2024-10-06 |       2
      2024-10-07 |       2
    (7 rows)
    ~~~

## Step 5. Run the scenario on CockroachDB

1. Doctor 1, Abe, starts to request leave for 10/5/18 using the hospital's schedule management application. The application starts a transaction:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > BEGIN;
    ~~~

1. The application checks to make sure at least one other doctor is on call for the requested date:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT count(*) FROM schedules
      WHERE on_call = true
      AND day = '2024-10-05'
      AND doctor_id != 1;
    ~~~

    ~~~
      count
    ---------
          1
    (1 row)
    ~~~

1. Around the same time, doctor 2, Betty, starts to request leave for the same day using the hospital's schedule management application. In a new terminal, start a second SQL session:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --host=localhost
    ~~~

1. The application starts a transaction:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > BEGIN;
    ~~~

1. The application checks to make sure at least one other doctor is on call for the requested date:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT count(*) FROM schedules
      WHERE on_call = true
      AND day = '2024-10-05'
      AND doctor_id != 2;
    ~~~

    ~~~
      count
    ---------
          1
    (1 row)
    ~~~

1. In the terminal for doctor 1, since the previous check confirmed that another doctor is on call for 10/5/18, the application tries to update doctor 1's schedule:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > UPDATE schedules SET on_call = false
      WHERE day = '2024-10-05'
      AND doctor_id = 1;
    ~~~

1. In the terminal for doctor 2, since the previous check confirmed the same thing, the application tries to update doctor 2's schedule:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > UPDATE schedules SET on_call = false
      WHERE day = '2024-10-05'
      AND doctor_id = 2;
    ~~~

1. In the terminal for doctor 1, the application tries to commit the transaction:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > COMMIT;
    ~~~

    The transaction for doctor 1 is committed.

1. In the terminal for doctor 2, the application tries to commit the transaction:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > COMMIT;
    ~~~

    Since CockroachDB uses `SERIALIZABLE` isolation, the database detects that the previous check (the `SELECT` query) is no longer true due to a concurrent transaction. It therefore prevents the transaction from committing, returning a retry error that indicates that the transaction must be attempted again.

    ~~~
    ERROR: restart transaction: TransactionRetryWithProtoRefreshError: TransactionRetryError: retry txn (RETRY_SERIALIZABLE - failed preemptive refresh due to encountered recently written committed value /Table/105/1/20001/1/0 @1700513356.063385000,2): "sql txn" meta={id=10f4abbc key=/Table/105/1/20001/2/0 iso=Serializable pri=0.00167708 epo=0 ts=1700513366.194063000,2 min=1700513327.262632000,0 seq=1} lock=true stat=PENDING rts=1700513327.262632000,0 wto=false gul=1700513327.762632000,0
    SQLSTATE: 40001
    HINT: See: https://www.cockroachlabs.com/docs/{{ page.version.version }}/transaction-retry-error-reference.html#retry_serializable
    ~~~

    {{site.data.alerts.callout_success}}
    For this kind of error, CockroachDB recommends a [client-side transaction retry loop]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#client-side-retry-handling) that would transparently observe that the one doctor cannot take time off because the other doctor already succeeded in asking for it. You can find generic transaction retry functions for various languages in our [Build an App]({% link {{ page.version.version }}/example-apps.md %}) tutorials.

    For more information about the error message for the `RETRY_SERIALIZABLE` error type, see the [Transaction Retry Error Reference]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#retry_serializable).
    {{site.data.alerts.end}}

## Step 6. Check data correctness on CockroachDB

1. In either terminal, confirm that one doctor is still on call for 10/5/18:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM schedules WHERE day = '2024-10-05';
    ~~~

    ~~~
         day     | doctor_id | on_call
    -------------+-----------+----------
      2024-10-05 |         1 |    f
      2024-10-05 |         2 |    t
    (2 rows)
    ~~~

1. Again, the write skew anomaly was prevented by CockroachDB using the `SERIALIZABLE` isolation level:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW TRANSACTION_ISOLATION;
    ~~~

    ~~~
      transaction_isolation
    -------------------------
      serializable
    (1 row)
    ~~~

1. Exit the SQL shell in each terminal:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~


1. Exit each SQL shell with `\q` and then stop the node:

    Get the process ID of the node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ps -ef | grep cockroach | grep -v grep
    ~~~

    ~~~
      501 21691     1   0  6:19PM ttys001    0:01.15 cockroach start-single-node --insecure --store=serializable-demo --listen-addr=localhost
    ~~~

    Gracefully shut down the node, specifying its process ID:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kill -TERM 21691
    ~~~

    ~~~
    initiating graceful shutdown of server
    server drained and shutdown completed
    ~~~

    If you do not plan to restart the cluster, you may want to remove the node's data store:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -rf serializable-demo
    ~~~

## What's next?

Explore other CockroachDB benefits and features:

{% include {{ page.version.version }}/misc/explore-benefits-see-also.md %}

You might also want to learn more about how transactions work in CockroachDB and in general:

- [Transactions Overview]({% link {{ page.version.version }}/transactions.md %})
- [What Write Skew Looks Like](https://www.cockroachlabs.com/blog/what-write-skew-looks-like/)
- [Read Committed Transactions]({% link {{ page.version.version }}/read-committed.md %})
