---
title: Serializable Transactions
summary: Follow a demonstration of the importance of SERIALIZABLE isolation for data correctness
toc: true
toc_not_nested: true
docs_area: deploy
---

In contrast to most databases, CockroachDB always uses `SERIALIZABLE` isolation, which is the strongest of the four [transaction isolation levels](https://en.wikipedia.org/wiki/Isolation_(database_systems)) defined by the SQL standard and is stronger than the `SNAPSHOT` isolation level developed later. `SERIALIZABLE` isolation guarantees that even though transactions may execute in parallel, the result is the same as if they had executed one at a time, without any concurrency. This ensures data correctness by preventing all "anomalies" allowed by weaker isolation levels.

In this tutorial, you'll work through a hypothetical scenario that demonstrates the importance of `SERIALIZABLE` isolation for data correctness.

1. You'll start by reviewing the scenario and its schema.
2. You'll then execute the scenario at one of the weaker isolation levels, `READ COMMITTED`, observing the write skew anomaly and its implications. Because CockroachDB always uses `SERIALIZABLE` isolation, you'll run this portion of the tutorial on PostgreSQL, which defaults to `READ COMMITTED`.
3. You'll finish by executing the scenario at `SERIALIZABLE` isolation, observing how it guarantees correctness. You'll use CockroachDB for this portion.

{{site.data.alerts.callout_info}}
For a deeper discussion of transaction isolation and the write skew anomaly, see the [Real Transactions are Serializable](https://www.cockroachlabs.com/blog/acid-rain/) and [What Write Skew Looks Like](https://www.cockroachlabs.com/blog/what-write-skew-looks-like/) blog posts.
{{site.data.alerts.end}}

## Overview

### Scenario

- A hospital has an application for doctors to manage their on-call shifts.
- The hospital has a rule that at least one doctor must be on call at any one time.
- Two doctors are on-call for a particular shift, and both of them try to request leave for the shift at approximately the same time.
- In PostgreSQL, with the default `READ COMMITTED` isolation level, the [write skew](#write-skew) anomaly results in both doctors successfully booking leave and the hospital having no doctors on call for that particular shift.
- In CockroachDB, with the `SERIALIZABLE` isolation level, write skew is prevented, one doctor is allowed to book leave and the other is left on-call, and lives are saved.

#### Write skew

When write skew happens, a transaction reads something, makes a decision based on the value it saw, and writes the decision to the database. However, by the time the write is made, the premise of the decision is no longer true. Only `SERIALIZABLE` and some implementations of `REPEATABLE READ` isolation prevent this anomaly.  

### Schema

<img src="{{ 'images/v21.2/serializable_schema.png' | relative_url }}" alt="Schema for serializable transaction tutorial" style="max-width:100%" />

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
        ('2018-10-01', 1, true),
        ('2018-10-01', 2, true),
        ('2018-10-02', 1, true),
        ('2018-10-02', 2, true),
        ('2018-10-03', 1, true),
        ('2018-10-03', 2, true),
        ('2018-10-04', 1, true),
        ('2018-10-04', 2, true),
        ('2018-10-05', 1, true),
        ('2018-10-05', 2, true),
        ('2018-10-06', 1, true),
        ('2018-10-06', 2, true),
        ('2018-10-07', 1, true),
        ('2018-10-07', 2, true);
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
     2018-10-01 |               2
     2018-10-02 |               2
     2018-10-03 |               2
     2018-10-04 |               2
     2018-10-05 |               2
     2018-10-06 |               2
     2018-10-07 |               2
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
      AND day = '2018-10-05'
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
      AND day = '2018-10-05'
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
      WHERE day = '2018-10-05'
      AND doctor_id = 1;
    ~~~

2. In the terminal for doctor 2, since the previous check confirmed the same thing, the application tries to update doctor 2's schedule:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > UPDATE schedules SET on_call = false
      WHERE day = '2018-10-05'
      AND doctor_id = 2;
    ~~~

3. In the terminal for doctor 1, the application commits the transaction, despite the fact that the previous check (the `SELECT` query) is no longer true:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > COMMIT;
    ~~~

4. In the terminal for doctor 2, the application commits the transaction, despite the fact that the previous check (the `SELECT` query) is no longer true:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > COMMIT;
    ~~~

## Step 3. Check data correctness on PostgreSQL

So what just happened? Each transaction started by reading a value that, before the end of the transaction, became incorrect. Despite that fact, each transaction was allowed to commit. This is known as write skew, and the result is that 0 doctors are scheduled to be on call on 10/5/18.  

To check this, in either terminal, run:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM schedules WHERE day = '2018-10-05';
~~~

~~~
    day     | doctor_id | on_call
------------+-----------+---------
 2018-10-05 |         1 | f
 2018-10-05 |         2 | f
(2 rows)
~~~

Again, this anomaly is the result of PostgreSQL's default isolation level of `READ COMMITTED`, but note that this would happen with any isolation level except `SERIALIZABLE` and some implementations of `REPEATABLE READ`:

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

1. If you haven't already, [install CockroachDB](install-cockroachdb.html) locally.

1. Use the [`cockroach start-single-node`](cockroach-start-single-node.html) command to start a one-node CockroachDB cluster in insecure mode:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node \
    --insecure \
    --store=serializable-demo \
    --listen-addr=localhost \
    --background
    ~~~

1. As the `root` user, open the [built-in SQL client](cockroach-sql.html):

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
        ('2018-10-01', 1, true),
        ('2018-10-01', 2, true),
        ('2018-10-02', 1, true),
        ('2018-10-02', 2, true),
        ('2018-10-03', 1, true),
        ('2018-10-03', 2, true),
        ('2018-10-04', 1, true),
        ('2018-10-04', 2, true),
        ('2018-10-05', 1, true),
        ('2018-10-05', 2, true),
        ('2018-10-06', 1, true),
        ('2018-10-06', 2, true),
        ('2018-10-07', 1, true),
        ('2018-10-07', 2, true);
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
                 day            | on_call
    +---------------------------+---------+
      2018-10-01 00:00:00+00:00 |       2
      2018-10-02 00:00:00+00:00 |       2
      2018-10-03 00:00:00+00:00 |       2
      2018-10-04 00:00:00+00:00 |       2
      2018-10-05 00:00:00+00:00 |       2
      2018-10-06 00:00:00+00:00 |       2
      2018-10-07 00:00:00+00:00 |       2
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
      AND day = '2018-10-05'
      AND doctor_id != 1;
    ~~~

    Press enter a second time to have the server return the result:

    ~~~
      count
    +-------+
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
      AND day = '2018-10-05'
      AND doctor_id != 2;
    ~~~

    Press enter a second time to have the server return the result:

    ~~~
      count
    +-------+
          1
    (1 row)    
    ~~~

1. In the terminal for doctor 1, since the previous check confirmed that another doctor is on call for 10/5/18, the application tries to update doctor 1's schedule:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > UPDATE schedules SET on_call = false
      WHERE day = '2018-10-05'
      AND doctor_id = 1;
    ~~~

1. In the terminal for doctor 2, since the previous check confirmed the same thing, the application tries to update doctor 2's schedule:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > UPDATE schedules SET on_call = false
      WHERE day = '2018-10-05'
      AND doctor_id = 2;
    ~~~

1. In the terminal for doctor 1, the application tries to commit the transaction:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > COMMIT;
    ~~~

    Since CockroachDB uses `SERIALIZABLE` isolation, the database detects that the previous check (the `SELECT` query) is no longer true due to a concurrent transaction. It therefore prevents the transaction from committing, returning a retry error that indicates that the transaction must be attempted again:

    ~~~
    pq: restart transaction: TransactionRetryWithProtoRefreshError: TransactionRetryError: retry txn (RETRY_SERIALIZABLE): id=373bbefe key=/Table/53/1/17809/1/0 rw=true pri=0.03885012 stat=PENDING epo=0 ts=1569638527.268184000,1 orig=1569638507.593587000,0 min=1569638507.593587000,0 max=1569638507.593587000,0 wto=false seq=2
    ~~~

    {{site.data.alerts.callout_success}}
    For this kind of error, CockroachDB recommends a [client-side transaction retry loop](transactions.html#client-side-intervention) that would transparently observe that the one doctor cannot take time off because the other doctor already succeeded in asking for it. You can find generic transaction retry functions for various languages in our [Build an App](example-apps.html) tutorials.
    {{site.data.alerts.end}}

1. In the terminal for doctor 2, the application tries to commit the transaction:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > COMMIT;
    ~~~

    Since the transaction for doctor 1 failed, the transaction for doctor 2 can commit without causing any data correctness problems.

## Step 6. Check data correctness on CockroachDB

1. In either terminal, confirm that one doctor is still on call for 10/5/18:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM schedules WHERE day = '2018-10-05';
    ~~~

    ~~~
                 day            | doctor_id | on_call
    +---------------------------+-----------+---------+
      2018-10-05 00:00:00+00:00 |         1 |  true
      2018-10-05 00:00:00+00:00 |         2 |  false
    (2 rows)
    ~~~

1. Again, the write skew anomaly was prevented by CockroachDB using the `SERIALIZABLE` isolation level:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW TRANSACTION_ISOLATION;
    ~~~

    ~~~
      transaction_isolation
    +-----------------------+
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

Explore other core CockroachDB benefits and features:

{% include {{ page.version.version }}/misc/explore-benefits-see-also.md %}

You might also want to learn more about how transactions work in CockroachDB and in general:

- [Transactions Overview](transactions.html)
- [Real Transactions are Serializable](https://www.cockroachlabs.com/blog/acid-rain/)
- [What Write Skew Looks Like](https://www.cockroachlabs.com/blog/what-write-skew-looks-like/)
