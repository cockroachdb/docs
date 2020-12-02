---
title: SQL Tuning with EXPLAIN
summary: How to use `EXPLAIN to identify and resolve SQL performance issues
toc: true
---

This tutorial walks you through the common reasons for [slow SQL statements](query-behavior-troubleshooting.html#identify-slow-queries) and describes how to use [`EXPLAIN`](explain.html) to troubleshoot the issues.

The following examples use [MovR](movr.html), a fictional vehicle-sharing application, to demonstrate CockroachDB SQL statements. Run [`cockroach demo movr`](cockroach-demo.html) to open an interactive SQL shell to a temporary, in-memory cluster with the `movr` database preloaded and set as the [current database](sql-name-resolution.html#current-database).

## Issue: Full table scans

The most common reason for slow queries is sub-optimal `SELECT` statements that include full table scans and incorrect use of indexes.

You'll get generally poor performance when retrieving a single row based on a column that is not in the primary key or any secondary index:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
                   id                  | city  |      name      |      address      | credit_card
---------------------------------------+-------+----------------+-------------------+--------------
  e147ae14-7ae1-4800-8000-00000000002c | paris | Cheyenne Smith | 8550 Kelsey Flats | 4374468739
(1 row)

Server Execution Time: 928µs
Network Latency: 315µs
~~~

To understand why this query performs poorly, use [`EXPLAIN`](explain.html):

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
    tree    |        field        |       description
------------+---------------------+--------------------------
            | distribution        | full
            | vectorized          | false
  filter    |                     |
   │        | filter              | name = 'Cheyenne Smith'
   └── scan |                     |
            | estimated row count | 279
            | table               | users@primary
            | spans               | FULL SCAN
(8 rows)
~~~

The row with `table | users@primary` indicates the index used (`primary`) to scan the table (`users`). The row with `spans | FULL SCAN` shows you that, without a secondary index on the `name` column, CockroachDB scans every row of the `users` table, ordered by the primary key (`city`/`id`), until it finds the row with the correct `name` value.

### Solution: Filter by a secondary index

To speed up this query, add a secondary index on `name`:

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX on users (name);
~~~

The query will now return much faster:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
                   id                  | city  |      name      |      address      | credit_card
---------------------------------------+-------+----------------+-------------------+--------------
  e147ae14-7ae1-4800-8000-00000000002c | paris | Cheyenne Smith | 8550 Kelsey Flats | 4374468739
(1 row)

Server Execution Time: 304µs
Network Latency: 251µs
~~~

To understand why the performance improved, use [`EXPLAIN`](explain.html) to see the new query plan:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
     tree    |        field        |               description
-------------+---------------------+------------------------------------------
             | distribution        | local
             | vectorized          | false
  index join |                     |
   │         | table               | users@primary
   └── scan  |                     |
             | estimated row count | 1
             | table               | users@users_name_idx
             | spans               | [/'Cheyenne Smith' - /'Cheyenne Smith']
(8 rows)
~~~

This shows you that CockroachDB starts with the secondary index (`users@users_name_idx`). Because it is sorted by `name`, the query can jump directly to the relevant value (`/'Cheyenne Smith' - /'Cheyenne Smith'`). However, the query needs to return values not in the secondary index, so CockroachDB grabs the primary key (`city`/`id`) stored with the `name` value (the primary key is always stored with entries in a secondary index), jumps to that value in the primary index, and then returns the full row.

Because the `users` table is under 512 MiB, the primary index and all secondary indexes are contained in a single range with a single leaseholder. If the table were bigger, however, the primary index and secondary index could reside in separate ranges, each with its own leaseholder. In this case, if the leaseholders were on different nodes, the query would require more network hops, further increasing latency.

### Solution: Filter by a secondary index storing additional columns

When you have a query that filters by a specific column but retrieves a subset of the table's total columns, you can improve performance by [storing](indexes.html#storing-columns) those additional columns in the secondary index to prevent the query from needing to scan the primary index as well.

For example, let's say you frequently retrieve a user's name and credit card number:

{% include copy-clipboard.html %}
~~~ sql
> SELECT name, credit_card FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
       name      | credit_card
-----------------+--------------
  Cheyenne Smith | 4374468739
(1 row)

Server Execution Time: 379µs
Network Latency: 189µs
~~~

With the current secondary index on `name`, CockroachDB still needs to scan the primary index to get the credit card number:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT name, credit_card FROM users WHERE name = 'Cheyenne Smith';
~~~


~~~
     tree    |        field        |               description
-------------+---------------------+------------------------------------------
             | distribution        | local
             | vectorized          | false
  index join |                     |
   │         | table               | users@primary
   └── scan  |                     |
             | estimated row count | 1
             | table               | users@users_name_idx
             | spans               | [/'Cheyenne Smith' - /'Cheyenne Smith']
(8 rows)
~~~

Let's drop and recreate the index on `name`, this time storing the `credit_card` value in the index:

{% include copy-clipboard.html %}
~~~ sql
> DROP INDEX users_name_idx;
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON users (name) STORING (credit_card);
~~~

Now that `credit_card` values are stored in the index on `name`, CockroachDB only needs to scan that index:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT name, credit_card FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
  tree |        field        |               description
-------+---------------------+------------------------------------------
       | distribution        | local
       | vectorized          | false
  scan |                     |
       | estimated row count | 1
       | table               | users@users_name_idx
       | spans               | [/'Cheyenne Smith' - /'Cheyenne Smith']
(6 rows)
~~~

This results in even faster performance:

{% include copy-clipboard.html %}
~~~ sql
> SELECT name, credit_card FROM users WHERE name = 'Cheyenne Smith';
~~~

~~~
       name      | credit_card
-----------------+--------------
  Cheyenne Smith | 4374468739
(1 row)

Server Execution Time: 217µs
Network Latency: 274µs
~~~

To reset the database for following examples, let's drop the index on `name`:

{% include copy-clipboard.html %}
~~~ sql
> DROP INDEX users_name_idx;
~~~

## Issue: Joining data from different tables

Secondary indexes are crucial when [joining](joins.html) data from different tables as well.

For example, let's say you want to count the number of users who started rides on a given day. To do this, you need to use a join to get the relevant rides from the `rides` table and then map the `rider_id` for each of those rides to the corresponding `id` in the `users` table, counting each mapping only once:

{% include copy-clipboard.html %}
~~~ sql
> SELECT count(DISTINCT users.id) FROM users INNER JOIN rides ON rides.rider_id = users.id WHERE start_time BETWEEN '2020-09-16 00:00:00' AND '2020-09-17 00:00:00';
~~~

~~~
  count
---------
    149
(1 row)

Server Execution Time: 2.431ms
Network Latency: 302µs
~~~

To understand what's happening, use [`EXPLAIN`](explain.html) to see the query plan:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT count(DISTINCT users.id) FROM users INNER JOIN rides ON rides.rider_id = users.id WHERE start_time BETWEEN '2020-09-16 00:00:00' AND '2020-09-17 00:00:00';
~~~

~~~
            tree           |        field        |                                   description
---------------------------+---------------------+----------------------------------------------------------------------------------
                           | distribution        | full
                           | vectorized          | false
  group (scalar)           |                     |
   └── distinct            |                     |
        │                  | distinct on         | id
        └── hash join      |                     |
             │             | equality            | (rider_id) = (id)
             ├── filter    |                     |
             │    │        | filter              | (start_time >= '2020-09-16 00:00:00') AND (start_time <= '2020-09-17 00:00:00')
             │    └── scan |                     |
             │             | estimated row count | 817
             │             | table               | rides@primary
             │             | spans               | FULL SCAN
             └── scan      |                     |
                           | estimated row count | 279
                           | table               | users@primary
                           | spans               | FULL SCAN
(17 rows)

Server Execution Time: 202µs
Network Latency: 296µs
~~~

CockroachDB does a full table scan first on `rides` to get all rows with a `start_time` in the specified range and then does another full table scan on `users` to find matching rows and calculate the count.

Given the `WHERE` condition of the join, the full table scan of `rides` is particularly wasteful.

### Solution: Create a secondary index on the `WHERE` condition storing the join key

To speed up the query, you can create a secondary index on the `WHERE` condition (`rides.start_time`) storing the join key (`rides.rider_id`):

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON rides (start_time) STORING (rider_id);
~~~

Adding the secondary index reduced the query time:

{% include copy-clipboard.html %}
~~~ sql
> SELECT count(DISTINCT users.id) FROM users INNER JOIN rides ON rides.rider_id = users.id WHERE start_time BETWEEN '2020-09-16 00:00:00' AND '2020-09-17 00:00:00';
~~~

~~~
  count
---------
    149
(1 row)

Server Execution Time: 1.562ms
Network Latency: 311µs
~~~

To understand why performance improved, again use [`EXPLAIN`](explain.html) to see the new query plan:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT count(DISTINCT users.id) FROM users INNER JOIN rides ON rides.rider_id = users.id WHERE start_time BETWEEN '2020-09-16 00:00:00' AND '2020-09-17 00:00:00';
~~~

~~~
         tree         |        field        |                    description
----------------------+---------------------+----------------------------------------------------
                      | distribution        | full
                      | vectorized          | false
  group (scalar)      |                     |
   └── distinct       |                     |
        │             | distinct on         | id
        └── hash join |                     |
             │        | equality            | (id) = (rider_id)
             ├── scan |                     |
             │        | estimated row count | 279
             │        | table               | users@primary
             │        | spans               | FULL SCAN
             └── scan |                     |
                      | estimated row count | 2
                      | table               | rides@rides_start_time_idx
                      | spans               | [/'2020-09-16 00:00:00' - /'2020-09-17 00:00:00']
(15 rows)
~~~

Notice that CockroachDB now starts by using `rides@rides_start_time_idx` secondary index to retrieve the relevant rides without needing to scan the full `rides` table.

## Issue: Inefficient joins

[Hash joins](joins.html#hash-joins) are more expensive and require more memory than [lookup joins](joins.html#lookup-joins). Hence the [cost-based optimizer](cost-based-optimizer.html) uses a lookup join whenever possible.

For the following query, the cost-based optimizer can’t perform a lookup join because the query doesn’t have a prefix of the `rides` table’s primary key available and thus has to read the entire table and search for a match, resulting in a slow query:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM vehicles JOIN rides on rides.vehicle_id = vehicles.id limit 1;
~~~

~~~
       tree      |        field        |     description
-----------------+---------------------+----------------------
                 | distribution        | full
                 | vectorized          | false
  limit          |                     |
   │             | count               | 1
   └── hash join |                     |
        │        | equality            | (vehicle_id) = (id)
        ├── scan |                     |
        │        | estimated row count | 817
        │        | table               | rides@primary
        │        | spans               | FULL SCAN
        └── scan |                     |
                 | estimated row count | 15
                 | table               | vehicles@primary
                 | spans               | FULL SCAN
(14 rows)
~~~

### Solution: Provide primary key to allow lookup join

To speed up the query, you can provide the primary key to allow the cost-based optimizer to perform a lookup join instead of a hash join:

{% include copy-clipboard.html %}
~~~ sql
> EXPLAIN SELECT * FROM vehicles JOIN rides ON rides.vehicle_id = vehicles.id and rides.city = vehicles.city limit 1;
~~~

~~~
        tree       |         field         |          description
-------------------+-----------------------+---------------------------------
                   | distribution          | full
                   | vectorized            | false
  limit            |                       |
   │               | count                 | 1
   └── lookup join |                       |
        │          | table                 | vehicles@primary
        │          | equality              | (city, vehicle_id) = (city,id)
        │          | equality cols are key |
        └── scan   |                       |
                   | estimated row count   | 817
                   | table                 | rides@primary
                   | spans                 | FULL SCAN
(12 rows)
~~~

## See also

- [SQL Best Practices](performance-best-practices-overview.html)
- [Troubleshoot SQL Behavior](query-behavior-troubleshooting.html)
- [Make Queries Fast](make-queries-fast.html)