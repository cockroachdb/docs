---
title: Statement Tuning with EXPLAIN
summary: How to use EXPLAIN to identify and resolve SQL statement performance issues
toc: true
docs_area: develop
---

This tutorial presents the common causes for [slow SQL queries](query-behavior-troubleshooting.html#identify-slow-queries) and describes how to use [`EXPLAIN`](explain.html) to troubleshoot the issues in queries against the [`movr` example dataset](cockroach-demo.html#datasets).

## Before you begin

Start the [MovR database](movr.html) on a CockroachDB demo cluster with a larger data set.

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach demo movr --num-users 1250000
~~~

This command opens an interactive SQL shell to a temporary, in-memory cluster with the `movr` database preloaded and set as the [current database](sql-name-resolution.html#current-database).

## Issue: Full table scans

The most common reason for slow queries is sub-optimal `SELECT` statements that include full table scans and incorrect use of indexes.

You'll get generally poor performance when retrieving a small number of rows from a large table based on a column that is not in the primary key or any secondary index:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
SELECT * FROM users WHERE name = 'Cheyenne Smith';
                   id                  |   city    |      name      |           address            | credit_card
---------------------------------------+-----------+----------------+------------------------------+--------------
  326d3a95-fe03-4600-8000-00000003c1d0 | boston    | Cheyenne Smith | 84252 Bradley Coves Suite 38 | 2369363335
  c6b45c93-7ecd-4800-8000-0000000ecdfd | amsterdam | Cheyenne Smith | 29149 Jane Lake              | 6072991876
  5edbdde1-c806-4400-8000-00000007114a | seattle   | Cheyenne Smith | 90016 Anthony Groves         | 3618456173
  60edde95-4c2d-4000-8000-0000000738c7 | seattle   | Cheyenne Smith | 70310 Knight Roads Suite 36  | 9909070365
  00024e8e-d94c-4710-8000-00000000002c | new york  | Cheyenne Smith | 8550 Kelsey Flats            | 4374468739
  0c777227-64c8-4780-8000-00000000edc8 | new york  | Cheyenne Smith | 47925 Cox Ways               | 7070681549
(1 row)


Time: 981ms total (execution 981ms / network 0ms)
~~~

To understand why this query performs poorly, use [`EXPLAIN`](explain.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
                                          info
-----------------------------------------------------------------------------------------
  distribution: full
  vectorized: true

  • filter
  │ estimated row count: 3
  │ filter: name = 'Cheyenne Smith'
  │
  └── • scan
        estimated row count: 1,259,634 (100% of the table; stats collected 3 minutes ago)
        table: users@users_pkey
        spans: FULL SCAN
~~~

`table: users@users_pkey` indicates the index used (`users_pkey`) to scan the table (`users`). `spans: FULL SCAN` shows you that, without a secondary index on the `name` column, CockroachDB scans every row of the `users` table, ordered by the primary key (`city`/`id`), until it finds the row with the correct `name` value.

### Solution: Filter by a secondary index

To speed up this query, add a secondary index on `name`:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX on users (name);
~~~

The query will now return much faster:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
                   id                  |   city    |      name      |           address            | credit_card
---------------------------------------+-----------+----------------+------------------------------+--------------
  c6b45c93-7ecd-4800-8000-0000000ecdfd | amsterdam | Cheyenne Smith | 29149 Jane Lake              | 6072991876
  326d3a95-fe03-4600-8000-00000003c1d0 | boston    | Cheyenne Smith | 84252 Bradley Coves Suite 38 | 2369363335
  00024e8e-d94c-4710-8000-00000000002c | new york  | Cheyenne Smith | 8550 Kelsey Flats            | 4374468739
  0c777227-64c8-4780-8000-00000000edc8 | new york  | Cheyenne Smith | 47925 Cox Ways               | 7070681549
  5edbdde1-c806-4400-8000-00000007114a | seattle   | Cheyenne Smith | 90016 Anthony Groves         | 3618456173
  60edde95-4c2d-4000-8000-0000000738c7 | seattle   | Cheyenne Smith | 70310 Knight Roads Suite 36  | 9909070365
(6 rows)


Time: 4ms total (execution 3ms / network 0ms)
~~~

To understand why the performance improved, use [`EXPLAIN`](explain.html) to see the new query plan:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
                                         info
--------------------------------------------------------------------------------------
  distribution: local
  vectorized: true

  • index join
  │ estimated row count: 3
  │ table: users@users_pkey
  │
  └── • scan
        estimated row count: 3 (<0.01% of the table; stats collected 3 seconds ago)
        table: users@users_name_idx
        spans: [/'Cheyenne Smith' - /'Cheyenne Smith']
~~~

This shows you that CockroachDB starts with the secondary index (`users@users_name_idx`). Because it is sorted by `name`, the query can jump directly to the relevant value (`/'Cheyenne Smith' - /'Cheyenne Smith'`). However, the query needs to return values not in the secondary index, so CockroachDB grabs the primary key (`city`/`id`) stored with the `name` value (the primary key is always stored with entries in a secondary index), jumps to that value in the primary index, and then returns the full row.

Because the `users` table is under 512 MiB, the primary index and all secondary indexes are contained in a single range with a single leaseholder. If the table were bigger, however, the primary index and secondary index could reside in separate ranges, each with its own leaseholder. In this case, if the leaseholders were on different nodes, the query would require more network hops, further increasing latency.

### Solution: Filter by a secondary index storing additional columns

When you have a query that filters by a specific column but retrieves a subset of the table's total columns, you can improve performance by [storing](indexes.html#storing-columns) those additional columns in the secondary index to prevent the query from needing to scan the primary index as well.

For example, let's say you frequently retrieve a user's name and credit card number:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT name, credit_card FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
       name      | credit_card
-----------------+--------------
  Cheyenne Smith | 6072991876
  Cheyenne Smith | 2369363335
  Cheyenne Smith | 4374468739
  Cheyenne Smith | 7070681549
  Cheyenne Smith | 3618456173
  Cheyenne Smith | 9909070365
(1 row)

Time: 4ms total (execution 4ms / network 0ms)
~~~

With the current secondary index on `name`, CockroachDB still needs to scan the primary index to get the credit card number:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT name, credit_card FROM users WHERE name = 'Cheyenne Smith';
~~~


~~~
                                        info
-------------------------------------------------------------------------------------
  distribution: local
  vectorized: true

  • index join
  │ estimated row count: 3
  │ table: users@users_pkey
  │
  └── • scan
        estimated row count: 3 (<0.01% of the table; stats collected 2 minutes ago)
        table: users@users_name_idx
        spans: [/'Cheyenne Smith' - /'Cheyenne Smith']
~~~

Drop and recreate the index on `name`, this time storing the `credit_card` value in the index:

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP INDEX users_name_idx;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON users (name) STORING (credit_card);
~~~

Now that `credit_card` values are stored in the index on `name`, CockroachDB only needs to scan that index:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT name, credit_card FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
                                      info
---------------------------------------------------------------------------------
  distribution: local
  vectorized: true

  • scan
    estimated row count: 3 (<0.01% of the table; stats collected 27 seconds ago)
    table: users@users_name_idx
    spans: [/'Cheyenne Smith' - /'Cheyenne Smith']
~~~

This results in even faster performance:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT name, credit_card FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
       name      | credit_card
-----------------+--------------
  Cheyenne Smith | 6072991876
  Cheyenne Smith | 2369363335
  Cheyenne Smith | 4374468739
  Cheyenne Smith | 7070681549
  Cheyenne Smith | 3618456173
  Cheyenne Smith | 9909070365
(6 rows)

Time: 2ms total (execution 2ms / network 0ms)
~~~

To reset the database for following examples, let's drop the index on `name`:

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP INDEX users_name_idx;
~~~

## Issue: Joining data from different tables

Secondary indexes are crucial when [joining](joins.html) data from different tables as well.

For example, let's say you want to count the number of users who started rides on a given day. To do this, you need to use a join to get the relevant rides from the `rides` table and then map the `rider_id` for each of those rides to the corresponding `id` in the `users` table, counting each mapping only once:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT count(DISTINCT users.id) FROM users INNER JOIN rides ON rides.rider_id = users.id WHERE start_time BETWEEN '2018-12-16 00:00:00' AND '2018-12-17 00:00:00';
~~~

~~~
  count
---------
   20
(1 row)

Time: 4ms total (execution 3ms / network 0ms)
~~~

To understand what's happening, use [`EXPLAIN`](explain.html) to see the query plan:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT count(DISTINCT users.id) FROM users INNER JOIN rides ON rides.rider_id = users.id WHERE start_time BETWEEN '2018-12-16 00:00:00' AND '2018-12-17 00:00:00';
~~~

~~~
                                                  info
---------------------------------------------------------------------------------------------------------
  distribution: full
  vectorized: true

  • group (scalar)
  │ estimated row count: 1
  │
  └── • distinct
      │ estimated row count: 16
      │ distinct on: id
      │
      └── • hash join
          │ estimated row count: 16
          │ equality: (id) = (rider_id)
          │
          ├── • scan
          │     estimated row count: 1,250,000 (100% of the table; stats collected 7 minutes ago)
          │     table: users@users_pkey
          │     spans: FULL SCAN
          │
          └── • filter
              │ estimated row count: 16
              │ filter: (start_time >= '2018-12-16 00:00:00') AND (start_time <= '2018-12-17 00:00:00')
              │
              └── • scan
                    estimated row count: 500 (100% of the table; stats collected 7 minutes ago)
                    table: rides@rides_pkey
                    spans: FULL SCAN
(27 rows)

Time: 1ms total (execution 1ms / network 0ms)
~~~

CockroachDB does a full table scan first on `rides` to get all rows with a `start_time` in the specified range and then does another full table scan on `users` to find matching rows and calculate the count.

Given the `WHERE` condition of the join, the full table scan of `rides` is particularly wasteful.

### Solution: Create a secondary index on the `WHERE` condition storing the join key

To speed up the query, you can create a secondary index on the `WHERE` condition (`rides.start_time`) storing the join key (`rides.rider_id`):

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON rides (start_time) STORING (rider_id);
~~~

Adding the secondary index reduced the query time:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT count(DISTINCT users.id) FROM users INNER JOIN rides ON rides.rider_id = users.id WHERE start_time BETWEEN '2018-12-16 00:00:00' AND '2018-12-17 00:00:00';
~~~

~~~
  count
---------
   20
(1 row)

Time: 2ms total (execution 2ms / network 0ms)
~~~

To understand why performance improved, again use [`EXPLAIN`](explain.html) to see the new query plan:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT count(DISTINCT users.id) FROM users INNER JOIN rides ON rides.rider_id = users.id WHERE start_time BETWEEN '2020-09-16 00:00:00' AND '2020-09-17 00:00:00';
~~~

~~~
                                            info
--------------------------------------------------------------------------------------------
  distribution: full
  vectorized: true

  • group (scalar)
  │ estimated row count: 1
  │
  └── • distinct
      │ estimated row count: 0
      │ distinct on: id
      │
      └── • hash join
          │ estimated row count: 0
          │ equality: (id) = (rider_id)
          │
          ├── • scan
          │     estimated row count: 1,250,000 (100% of the table; stats collected 7 minutes ago)
          │     table: users@users_pkey
          │     spans: FULL SCAN
          │
          └── • scan
                estimated row count: 0 (<0.01% of the table; stats collected 7 minutes ago)
                table: rides@rides_start_time_idx
                spans: [/'2020-09-16 00:00:00' - /'2020-09-17 00:00:00']

(23 rows)

Time: 1ms total (execution 1ms / network 0ms)
~~~

Notice that CockroachDB now starts by using `rides@rides_start_time_idx` secondary index to retrieve the relevant rides without needing to scan the full `rides` table.

## Issue: Inefficient joins

[Hash joins](joins.html#hash-joins) are more expensive and require more memory than [lookup joins](joins.html#lookup-joins). Hence the [cost-based optimizer](cost-based-optimizer.html) uses a lookup join whenever possible.

For the following query, the cost-based optimizer can’t perform a lookup join because the query doesn’t have a prefix of the `rides` table’s primary key available and thus has to read the entire table and search for a match, resulting in a slow query:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM vehicles JOIN rides on rides.vehicle_id = vehicles.id limit 1;
~~~

~~~
------------------------------------------------------------------------------------------
  distribution: full
  vectorized: true

  • limit
  │ estimated row count: 1
  │ count: 1
  │
  └── • hash join
      │ estimated row count: 500
      │ equality: (vehicle_id) = (id)
      │
      ├── • scan
      │     estimated row count: 500 (100% of the table; stats collected 23 seconds ago)
      │     table: rides@rides_pkey
      │     spans: FULL SCAN
      │
      └── • scan
            estimated row count: 15 (100% of the table; stats collected 4 minutes ago)
            table: vehicles@vehicles_pkey
            spans: FULL SCAN
(20 rows)

Time: 1ms total (execution 1ms / network 0ms)
~~~

### Solution: Provide primary key to allow lookup join

To speed up the query, you can provide the primary key to allow the cost-based optimizer to perform a lookup join instead of a hash join:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM vehicles JOIN rides ON rides.vehicle_id = vehicles.id and rides.city = vehicles.city limit 1;
~~~

~~~
                                          info
----------------------------------------------------------------------------------------
  distribution: full
  vectorized: true

  • limit
  │ estimated row count: 1
  │ count: 1
  │
  └── • lookup join
      │ estimated row count: 56
      │ table: vehicles@vehicles_pkey
      │ equality: (city, vehicle_id) = (city,id)
      │ equality cols are key
      │
      └── • scan
            estimated row count: 500 (100% of the table; stats collected 1 minute ago)
            table: rides@rides_pkey
            spans: FULL SCAN
(17 rows)

Time: 1ms total (execution 1ms / network 0ms)
~~~

## See also

- [SQL Best Practices](performance-best-practices-overview.html)
- [Troubleshoot SQL Behavior](query-behavior-troubleshooting.html)
- [Indexes](indexes.html)
