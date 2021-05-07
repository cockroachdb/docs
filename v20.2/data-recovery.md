---
title: Run Differentials for Data Recovery
summary: Learn how to recover data after a malicious data attack with CockroachDB's garbage collection window.
toc: true
---

In this tutorial, you will recover data after a malicious data attack. In the process, you will learn how to identify malicious transactions, search the [audit logs](sql-audit-logging.html) to find the transactions, and correct and restore the data values.

For this tutorial, you'll use the [`movr`](movr.html) workload as an example. MovR is a fictional vehicle-sharing company. You'll insert a user called `bad_actor` into the `movr` database who will create a malicious transaction that updates all of Tyler Dalton's ride values to $1000.

This is a practical scenario of [data failure recovery](https://www.cockroachlabs.com/docs/v20.2/disaster-recovery.html#run-differentials) within the garbage collection window.

{{site.data.alerts.callout_info}}
You can use the workflow in this tutorial if the data issue is discovered within CockroachDB's [garbage collection](architecture/storage-layer.html#garbage-collection) window for a particular zone configuration, which by default is 25 hours.
{{site.data.alerts.end}}

## Step 1. Start CockroachDB

1. If you haven't already, [download the CockroachDB binary](install-cockroachdb.html).
1. [Start a local cluster](start-a-local-cluster.html).

## Step 2. Set up `movr` with a bad actor record

With your cluster ready, you'll begin by initiating the workload and setting up the scenario for this tutorial.

1. First, initiate the `movr` workload:

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach workload init movr 'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

    Note that if you're working on a secure local cluster, you'll need to adapt the [connection string](secure-a-cluster.html#step-4-run-a-sample-workload).

1. In the [built-in SQL shell](cockroach-sql.html), turn on SQL audit logging for the `rides` table:

    {% include copy-clipboard.html %}
    ~~~ sql
    > ALTER TABLE movr.rides EXPERIMENTAL_AUDIT SET READ WRITE;
    ~~~

    You use the [`EXPERIMENTAL_AUDIT`](experimental-audit.html) subcommand of `ALTER TABLE` to turn audit logging on and off. This will log all reads and writes, so both `READ` and `WRITE` are required here.

1. Back in your terminal, run the workload:

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach workload run movr --max-rate 10 --duration 10s '<connection string>'
    ~~~

1. From your SQL shell session, create the bad actor:

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE USER bad_actor;
    ~~~

    Then grant `SELECT` and `UPDATE` privileges to `bad_actor` in `movr`:

    {% include copy-clipboard.html %}
    ~~~ sql
    > GRANT SELECT, UPDATE ON movr.* TO bad_actor;
    ~~~

1. You'll now run the malicious transaction as `bad_actor` against the user Tyler Dalton. This will update all of Tyler's ride transactions to $1000:

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach sql --insecure -execute "UPDATE rides SET revenue = 1000 WHERE rider_id = (SELECT id FROM users WHERE name = 'Tyler Dalton');" --user bad_actor --host=localhost:26257 --database movr
    ~~~

1. Finally, run the workload again:

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach workload run movr --max-rate 10 --duration 10s '<connection string>'
    ~~~

## Step 3. Identify malicious transactions

With the bad actor set up and the malicious transactions committed, Tyler Dalton has discovered the errors in their account and has called to complain. You'll check the transactions and then use the audit log to locate and identify the bad actor.

1. First, you'll find the transactions that Tyler Dalton has reported. You use [`INNER JOIN`](joins.html) to reference the `rides` table on the `id` column of the `users` table and specify the described transactions:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT r.* FROM users u INNER JOIN rides r ON u.id = r.rider_id WHERE u.name = 'Tyler Dalton' AND r.revenue = 1000;
    ~~~

    The output will show that every ride Tyler took cost $1000:

    ~~~
    id                                   |   city    | vehicle_city |               rider_id               |              vehicle_id              |        start_address         |         end_address          |          start_time          |           end_time           | revenue
    -------------------------------------+-----------+--------------+--------------------------------------+--------------------------------------+------------------------------+------------------------------+------------------------------+------------------------------+----------
    c624dd2f-1a9f-4000-8000-000000000183 | amsterdam | amsterdam    | ae147ae1-47ae-4800-8000-000000000022 | aaaaaaaa-aaaa-4800-8000-00000000000a | 43278 Mills Circles Suite 77 | 63002 Sheila Fall            | 2018-12-07 03:04:05+00:00:00 | 2018-12-09 09:04:05+00:00:00 | 1000.00
    c49ba5e3-53f7-4000-8000-000000000180 | amsterdam | amsterdam    | ae147ae1-47ae-4800-8000-000000000022 | aaaaaaaa-aaaa-4800-8000-00000000000a | 63049 Jacob Falls Apt. 27    | 42512 Miller Avenue Suite 19 | 2018-12-04 03:04:05+00:00:00 | 2018-12-05 00:04:05+00:00:00 | 1000.00
    c4189374-bc6a-4000-8000-00000000017f | amsterdam | amsterdam    | ae147ae1-47ae-4800-8000-000000000022 | aaaaaaaa-aaaa-4800-8000-00000000000a | 73202 Owens Parkway Apt. 52  | 47413 Jenna Hollow           | 2018-12-23 03:04:05+00:00:00 | 2018-12-25 04:04:05+00:00:00 | 1000.00
    c28f5c28-f5c2-4000-8000-00000000017c | amsterdam | amsterdam    | ae147ae1-47ae-4800-8000-000000000022 | bbbbbbbb-bbbb-4800-8000-00000000000b | 44094 Joyce Grove Apt. 59    | 50264 Susan Heights Suite 89 | 2018-12-19 03:04:05+00:00:00 | 2018-12-21 14:04:05+00:00:00 | 1000.00
    c0000000-0000-4000-8000-000000000177 | amsterdam | amsterdam    | ae147ae1-47ae-4800-8000-000000000022 | bbbbbbbb-bbbb-4800-8000-00000000000b | 65738 Williams Summit        | 72424 Thomas Field Suite 82  | 2018-12-31 03:04:05+00:00:00 | 2019-01-01 03:04:05+00:00:00 | 1000.00
    bced9168-72b0-4000-8000-000000000171 | amsterdam | amsterdam    | ae147ae1-47ae-4800-8000-000000000022 | aaaaaaaa-aaaa-4800-8000-00000000000a | 85073 Robin Plaza            | 96144 Elizabeth Squares      | 2018-12-17 03:04:05+00:00:00 | 2018-12-19 00:04:05+00:00:00 | 1000.00
    bbe76c8b-4395-4000-8000-00000000016f | amsterdam | amsterdam    | ae147ae1-47ae-4800-8000-000000000022 | aaaaaaaa-aaaa-4800-8000-00000000000a | 45295 Brewer View Suite 52   | 62188 Jade Causeway          | 2018-12-17 03:04:05+00:00:00 | 2018-12-17 13:04:05+00:00:00 | 1000.00
    b74bc6a7-ef9d-4000-8000-000000000166 | amsterdam | amsterdam    | ae147ae1-47ae-4800-8000-000000000022 | aaaaaaaa-aaaa-4800-8000-00000000000a | 46011 Williams Tunnel        | 47657 Brianna Grove          | 2018-12-28 03:04:05+00:00:00 | 2018-12-30 07:04:05+00:00:00 | 1000.00
    b645a1ca-c083-4000-8000-000000000164 | amsterdam | amsterdam    | ae147ae1-47ae-4800-8000-000000000022 | bbbbbbbb-bbbb-4800-8000-00000000000b | 54794 Jones Circles          | 1864 Stacie Crest            | 2018-12-16 03:04:05+00:00:00 | 2018-12-18 06:04:05+00:00:00 | 1000.00
    b4bc6a7e-f9db-4000-8000-000000000161 | amsterdam | amsterdam    | ae147ae1-47ae-4800-8000-000000000022 | bbbbbbbb-bbbb-4800-8000-00000000000b | 73310 Young Harbor           | 31482 Omar Street            | 2018-12-13 03:04:05+00:00:00 | 2018-12-13 07:04:05+00:00:00 | 1000.00
    af1a9fbe-76c8-4800-8000-000000000156 | amsterdam | amsterdam    | ae147ae1-47ae-4800-8000-000000000022 | aaaaaaaa-aaaa-4800-8000-00000000000a | 64807 Melissa Branch         | 32661 Dalton Flats Suite 70  | 2018-12-18 03:04:05+00:00:00 | 2018-12-18 12:04:05+00:00:00 | 1000.00
    ad0e5604-1893-4800-8000-000000000152 | amsterdam | amsterdam    | ae147ae1-47ae-4800-8000-000000000022 | aaaaaaaa-aaaa-4800-8000-00000000000a | 10806 Kevin Spur             | 15744 Valerie Squares        | 2018-12-08 03:04:05+00:00:00 | 2018-12-08 22:04:05+00:00:00 | 1000.00
    ac8b4395-8106-4800-8000-000000000151 | amsterdam | amsterdam    | ae147ae1-47ae-4800-8000-000000000022 | bbbbbbbb-bbbb-4800-8000-00000000000b | 34704 Stewart Ports Suite 56 | 53889 Frank Lake Apt. 49     | 2018-12-22 03:04:05+00:00:00 | 2018-12-22 16:04:05+00:00:00 | 1000.00
    (13 rows)
    ~~~

1. Now that you've confirmed the malicious transactions, you'll use the audit log to identify the bad actor. For a local cluster, you can [find the audit log](experimental-audit.html#audit-log-file-storage-location) in your node's directory and then within `logs`. The file name will begin with `cockroach-sql-audit` and follow this format:

    ~~~
    cockroach-sql-audit.[host].[user].[start timestamp in UTC].[process ID].log
    ~~~

    Run the following command to locate the bad actor:

    {% include copy-clipboard.html %}
    ~~~ shell
    cat cockroach-sql-audit.<[host].[user].[start timestamp in UTC].[process ID]>.log | grep 1000 | grep Tyler
    ~~~

    ~~~
    I210506 18:01:00.444195 40032 8@util/log/event_log.go:32 ⋮ [n1,client=‹127.0.0.1:57266›,hostnossl,user=‹bad_actor›] 8 ={"Timestamp":1620324060417008000,"EventType":"sensitive_table_access","Statement":"‹UPDATE \"\".\"\".rides SET revenue = 1000 WHERE rider_id = (SELECT id FROM \"\".\"\".users WHERE name = 'Tyler Dalton')›","User":"‹bad_actor›","DescriptorID":55,"ApplicationName":"‹$ cockroach sql›","ExecMode":"exec","NumRows":13,"Age":27.309,"FullTableScan":true,"TxnCounter":1,"TableName":"‹movr.public.rides›","AccessMode":"rw"}
    I210506 18:01:00.444404 40032 8@util/log/event_log.go:32 ⋮ [n1,client=‹127.0.0.1:57266›,hostnossl,user=‹bad_actor›] 9 ={"Timestamp":1620324060417008000,"EventType":"sensitive_table_access","Statement":"‹UPDATE \"\".\"\".rides SET revenue = 1000 WHERE rider_id = (SELECT id FROM \"\".\"\".users WHERE name = 'Tyler Dalton')›","User":"‹bad_actor›","DescriptorID":55,"ApplicationName":"‹$ cockroach sql›","ExecMode":"exec","NumRows":13,"Age":27.309,"FullTableScan":true,"TxnCounter":1,"TableName":"‹movr.public.rides›","AccessMode":"r"}
    ~~~

    The output provides the name of the malicious user and the timestamp for the transactions that you can use to correct Tyler Dalton's account. For more information on the format of the log, read [Audit Log File Format](experimental-audit.html#audit-log-file-format).

## Step 5. Remove the bad actor

Before correcting the data, you'll identify the privileges the user `bad_actor` has on the `movr` database.

1. Show the privileges for `bad_actor`.

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW GRANTS FOR bad_actor;
    ~~~

    ~~~
    database_name | schema_name |       relation_name        |  grantee  | privilege_type
    --------------+-------------+----------------------------+-----------+-----------------
    movr          | public      | promo_codes                | bad_actor | SELECT
    movr          | public      | promo_codes                | bad_actor | UPDATE
    movr          | public      | rides                      | bad_actor | SELECT
    movr          | public      | rides                      | bad_actor | UPDATE
    movr          | public      | user_promo_codes           | bad_actor | SELECT
    movr          | public      | user_promo_codes           | bad_actor | UPDATE
    movr          | public      | users                      | bad_actor | SELECT
    movr          | public      | users                      | bad_actor | UPDATE
    movr          | public      | vehicle_location_histories | bad_actor | SELECT
    movr          | public      | vehicle_location_histories | bad_actor | UPDATE
    movr          | public      | vehicles                   | bad_actor | SELECT
    movr          | public      | vehicles                   | bad_actor | UPDATE
    (12 rows)
    ~~~

1. Since `bad_actor` has `SELECT` and `UPDATE` privileges on the database, you'll remove these:

    {% include copy-clipboard.html %}
    ~~~ sql
    > REVOKE ALL ON movr.* FROM bad_actor;
    ~~~

1. Now, you'll remove the `bad_actor` user from the database:

    {% include copy-clipboard.html %}
    ~~~ sql
    > DROP USER bad_actor;
    ~~~

## Step 6. Restore the correct data values

With the bad actor removed from the database, you'll now restore Tyler Dalton's ride balances from before the malicious data attack.

1. First, you can find the correct data values by using the timestamp from the audit log. For example, if your audit log entries began with `I210503 19:36:34.032312`, you would adapt that to `2021-05-03 19:36:33.032312`. Here, you'll also adjust the timestamp to **1 second earlier** and pass that to [`AS OF SYSTEM TIME`](as-of-system-time.html) to read the historical data of the values before the malicious change was made:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT r.id, r.revenue FROM users u INNER JOIN rides r ON u.id = rider_id AS OF SYSTEM TIME '<insert timestamp here>' WHERE u.NAME = 'Tyler Dalton';
    ~~~

    ~~~
      id                                 | revenue
    -------------------------------------+----------
    ac8b4395-8106-4800-8000-000000000151 |   27.00
    ad0e5604-1893-4800-8000-000000000152 |   20.00
    af1a9fbe-76c8-4800-8000-000000000156 |   87.00
    b4bc6a7e-f9db-4000-8000-000000000161 |   92.00
    b645a1ca-c083-4000-8000-000000000164 |   54.00
    b74bc6a7-ef9d-4000-8000-000000000166 |   74.00
    bbe76c8b-4395-4000-8000-00000000016f |   99.00
    bced9168-72b0-4000-8000-000000000171 |   74.00
    c0000000-0000-4000-8000-000000000177 |   28.00
    c28f5c28-f5c2-4000-8000-00000000017c |   57.00
    c4189374-bc6a-4000-8000-00000000017f |   73.00
    c49ba5e3-53f7-4000-8000-000000000180 |   87.00
    c624dd2f-1a9f-4000-8000-000000000183 |   14.00
    (13 rows)
    ~~~

1. The following constructs an `UPDATE` statement incorporating the revenue and ride id columns for Tyler Dalton. Using `AS OF SYSTEM TIME`, the statement pinpoints the correct data values as of a specific time. Running this in your SQL shell will output a list of `UPDATE` statements that you can then run to reinstate the correct transactions of Tyler Dalton's rides:

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT 'UPDATE movr.rides SET revenue = ' || r.revenue::STRING || ' WHERE id = ' || '''' || r.id::STRING || '''' || ';' FROM users u INNER JOIN rides r ON u.id = r.rider_id AS OF SYSTEM TIME '<insert timestamp here>' WHERE u.name = 'Tyler Dalton';
    ~~~

    ~~~
    ?column?
    --------------------------------------------------------------------------------------------
    UPDATE movr.rides SET revenue = 27.00 WHERE id = 'ac8b4395-8106-4800-8000-000000000151';
    UPDATE movr.rides SET revenue = 20.00 WHERE id = 'ad0e5604-1893-4800-8000-000000000152';
    UPDATE movr.rides SET revenue = 87.00 WHERE id = 'af1a9fbe-76c8-4800-8000-000000000156';
    UPDATE movr.rides SET revenue = 92.00 WHERE id = 'b4bc6a7e-f9db-4000-8000-000000000161';
    UPDATE movr.rides SET revenue = 54.00 WHERE id = 'b645a1ca-c083-4000-8000-000000000164';
    UPDATE movr.rides SET revenue = 74.00 WHERE id = 'b74bc6a7-ef9d-4000-8000-000000000166';
    UPDATE movr.rides SET revenue = 99.00 WHERE id = 'bbe76c8b-4395-4000-8000-00000000016f';
    UPDATE movr.rides SET revenue = 74.00 WHERE id = 'bced9168-72b0-4000-8000-000000000171';
    UPDATE movr.rides SET revenue = 28.00 WHERE id = 'c0000000-0000-4000-8000-000000000177';
    UPDATE movr.rides SET revenue = 57.00 WHERE id = 'c28f5c28-f5c2-4000-8000-00000000017c';
    UPDATE movr.rides SET revenue = 73.00 WHERE id = 'c4189374-bc6a-4000-8000-00000000017f';
    UPDATE movr.rides SET revenue = 87.00 WHERE id = 'c49ba5e3-53f7-4000-8000-000000000180';
    UPDATE movr.rides SET revenue = 14.00 WHERE id = 'c624dd2f-1a9f-4000-8000-000000000183';
    (13 rows)
    ~~~

    You'll receive output similar to the above, which you can run to restore the correct revenue values:

    {% include copy-clipboard.html %}
    ~~~ sql
    > UPDATE movr.rides SET revenue = 14.00 WHERE id = 'c624dd2f-1a9f-4000-8000-000000000183';
    ~~~

    After updating each of the IDs with the corresponding ride values, Tyler Dalton's account will be restored to the state prior to the malicious data transactions.

## Step 7. Clean up

To remove the database from your cluster:

{% include copy-clipboard.html %}
~~~ shell
cockroach sql --insecure -execute "SET sql_safe_updates = false; DROP DATABASE movr;"
~~~

If you will not use the cluster again, follow the process to [stop your cluster](secure-a-cluster.html#step-8-stop-the-cluster).

## See also

- [Disaster Recovery](disaster-recovery.html)
- [SQL Audit Logging](sql-audit-logging.html)
- [`EXPERIMENTAL_AUDIT`](experimental-audit.html)
- [`AS OF SYSTEM TIME`](as-of-system-time.html)
