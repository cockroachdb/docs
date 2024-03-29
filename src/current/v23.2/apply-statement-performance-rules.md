---
title: Apply SQL Statement Performance Rules
summary: How to apply SQL statement performance rules to optimize a query.
toc: true
docs_area: develop
---

This tutorial shows how to apply [SQL statement performance rules]({% link {{ page.version.version }}/make-queries-fast.md %}#sql-statement-performance-rules) to optimize a query against the [`movr` example dataset]({% link {{ page.version.version }}/cockroach-demo.md %}#datasets).

## Before you begin

{% include {{ page.version.version }}/demo_movr.md %}

It's common to offer users promo codes to increase usage and customer loyalty. In this scenario, you want to find the 10 users who have taken the highest number of rides on a given date, and offer them promo codes that provide a 10% discount. To phrase it in the form of a question: "Who are the top 10 users by number of rides on a given date?"

## Rule 1. Scan as few rows as possible

First, study the schema so you understand the relationships between the tables. Run [`SHOW TABLES`]({% link {{ page.version.version }}/show-tables.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW TABLES;
~~~

~~~
  schema_name |         table_name         | type  | estimated_row_count
--------------+----------------------------+-------+----------------------
  public      | promo_codes                | table |              250000
  public      | rides                      | table |              125000
  public      | user_promo_codes           | table |                   0
  public      | users                      | table |               12500
  public      | vehicle_location_histories | table |              250000
  public      | vehicles                   | table |                3750
(6 rows)

Time: 17ms total (execution 17ms / network 0ms)
~~~

Look at the schema for the `users` table:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE TABLE users;
~~~

~~~
  table_name |                      create_statement
-------------+--------------------------------------------------------------
  users      | CREATE TABLE public.users (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     name VARCHAR NULL,
             |     address VARCHAR NULL,
             |     credit_card VARCHAR NULL,
             |     CONSTRAINT users_pkey PRIMARY KEY (city ASC, id ASC)
             | )
(1 row)

Time: 9ms total (execution 9ms / network 0ms)
~~~

There's no information about the number of rides taken here, nor anything about the days on which rides occurred. Luckily, there is also a `rides` table. Let's look at it:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE TABLE rides;
~~~

~~~
  table_name |                                                        create_statement
-------------+----------------------------------------------------------------------------------------------------------------------------------
  rides      | CREATE TABLE public.rides (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     vehicle_city VARCHAR NULL,
             |     rider_id UUID NULL,
             |     vehicle_id UUID NULL,
             |     start_address VARCHAR NULL,
             |     end_address VARCHAR NULL,
             |     start_time TIMESTAMP NULL,
             |     end_time TIMESTAMP NULL,
             |     revenue DECIMAL(10,2) NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     CONSTRAINT fk_city_ref_users FOREIGN KEY (city, rider_id) REFERENCES public.users(city, id),
             |     CONSTRAINT fk_vehicle_city_ref_vehicles FOREIGN KEY (vehicle_city, vehicle_id) REFERENCES public.vehicles(city, id),
             |     INDEX rides_auto_index_fk_city_ref_users (city ASC, rider_id ASC),
             |     INDEX rides_auto_index_fk_vehicle_city_ref_vehicles (vehicle_city ASC, vehicle_id ASC),
             |     FAMILY "primary" (id, city, vehicle_city, rider_id, vehicle_id, start_address, end_address, start_time, end_time, revenue),
             |     CONSTRAINT check_vehicle_city_city CHECK (vehicle_city = city)
             | )
(1 row)

Time: 9ms total (execution 8ms / network 1ms)
~~~

There is a `rider_id` field that you can use to match each ride to a user. There is also a `start_time` field that you can use to filter the rides by date.

This means that to get the information you want, you'll need to do a [join]({% link {{ page.version.version }}/joins.md %}) on the `users` and `rides` tables.

Next, get the row counts for the tables that you'll be using in this query. You need to understand which tables are large, and which are small by comparison. You will need this later if you need to verify you are [using the right join type](#rule-3-use-the-right-join-type).

As specified by your [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) command, the `users` table has 12,500 records, and the `rides` table has 125,000 records. Because it's so large, you want to avoid scanning the entire `rides` table in your query. In this case, you can avoid scanning `rides` using an index, as shown in the next section.

## Rule 2. Use the right index

Here is a query that fetches the right answer to your question: "Who are the top 10 users by number of rides on a given date?"

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT
  name, count(rides.id) AS sum
FROM
  users JOIN rides ON users.id = rides.rider_id
WHERE
  rides.start_time BETWEEN '2018-12-31 00:00:00' AND '2020-01-01 00:00:00'
GROUP BY
  name
ORDER BY
  sum DESC
LIMIT
  10;
~~~

~~~
        name       | sum
-------------------+------
  William Brown    |  14
  William Mitchell |  10
  Joseph Smith     |  10
  Paul Nelson      |   9
  Christina Smith  |   9
  Jeffrey Walker   |   8
  Jennifer Johnson |   8
  Joseph Jones     |   7
  Thomas Smith     |   7
  James Williams   |   7
(10 rows)

Time: 111ms total (execution 111ms / network 0ms)
~~~

Unfortunately, this query is a bit slow. 111 milliseconds puts you [over the limit where a user feels the system is reacting instantaneously](https://www.nngroup.com/articles/response-times-3-important-limits/), and you're still down in the database layer. This data still needs to be sent back to your application and displayed.

You can see why if you look at the output of [`EXPLAIN`]({% link {{ page.version.version }}/explain.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN SELECT
    name, count(rides.id) AS sum
FROM
    users JOIN rides ON users.id = rides.rider_id
WHERE
    rides.start_time BETWEEN '2018-12-31 00:00:00' AND '2020-01-01 00:00:00'
GROUP BY
    name
ORDER BY
    sum DESC
LIMIT
    10;
~~~

~~~
                                                    info
-------------------------------------------------------------------------------------------------------------
  distribution: full
  vectorized: true

  • limit
  │ estimated row count: 10
  │ count: 10
  │
  └── • sort
      │ estimated row count: 7,772
      │ order: -count_rows
      │
      └── • group
          │ estimated row count: 7,772
          │ group by: name
          │
          └── • hash join
              │ estimated row count: 12,863
              │ equality: (rider_id) = (id)
              │
              ├── • filter
              │   │ estimated row count: 12,863
              │   │ filter: (start_time >= '2018-12-31 00:00:00') AND (start_time <= '2020-01-01 00:00:00')
              │   │
              │   └── • scan
              │         estimated row count: 125,000 (100% of the table; stats collected 54 seconds ago)
              │         table: rides@rides_pkey
              │         spans: FULL SCAN
              │
              └── • scan
                    estimated row count: 12,500 (100% of the table; stats collected 2 minutes ago)
                    table: users@users_pkey
                    spans: FULL SCAN
(32 rows)


Time: 2ms total (execution 2ms / network 0ms)
~~~

The main problem is that you are doing full table scans on both the `users` and `rides` tables (see `spans: FULL SCAN`). This tells you that you do not have indexes on the columns in your `WHERE` clause, which is [an indexing best practice]({% link {{ page.version.version }}/indexes.md %}#best-practices).

Therefore, you need to create an index on the column in your `WHERE` clause, in this case: `rides.start_time`.

It's also possible that there is not an index on the `rider_id` column that you are doing a join against, which will also hurt performance.

Before creating any more indexes, let's see what indexes already exist on the `rides` table by running [`SHOW INDEXES`]({% link {{ page.version.version }}/show-index.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW INDEXES FROM rides;
~~~

~~~
  table_name |                  index_name                   | non_unique | seq_in_index |  column_name  | direction | storing | implicit | visible
-------------+-----------------------------------------------+------------+--------------+---------------+-----------+---------+----------+----------
  rides      | rides_auto_index_fk_city_ref_users            |     t      |            1 | city          | ASC       |    f    |    f     |    t
  rides      | rides_auto_index_fk_city_ref_users            |     t      |            2 | rider_id      | ASC       |    f    |    f     |    t
  rides      | rides_auto_index_fk_city_ref_users            |     t      |            3 | id            | ASC       |    f    |    t     |    t
  rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            1 | vehicle_city  | ASC       |    f    |    f     |    t
  rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            2 | vehicle_id    | ASC       |    f    |    f     |    t
  rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            3 | city          | ASC       |    f    |    t     |    t
  rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            4 | id            | ASC       |    f    |    t     |    t
  rides      | rides_pkey                                    |     f      |            1 | city          | ASC       |    f    |    f     |    t
  rides      | rides_pkey                                    |     f      |            2 | id            | ASC       |    f    |    f     |    t
  rides      | rides_pkey                                    |     f      |            3 | vehicle_city  | N/A       |    t    |    f     |    t
  rides      | rides_pkey                                    |     f      |            4 | rider_id      | N/A       |    t    |    f     |    t
  rides      | rides_pkey                                    |     f      |            5 | vehicle_id    | N/A       |    t    |    f     |    t
  rides      | rides_pkey                                    |     f      |            6 | start_address | N/A       |    t    |    f     |    t
  rides      | rides_pkey                                    |     f      |            7 | end_address   | N/A       |    t    |    f     |    t
  rides      | rides_pkey                                    |     f      |            8 | start_time    | N/A       |    t    |    f     |    t
  rides      | rides_pkey                                    |     f      |            9 | end_time      | N/A       |    t    |    f     |    t
  rides      | rides_pkey                                    |     f      |           10 | revenue       | N/A       |    t    |    f     |    t
(17 rows)


Time: 5ms total (execution 5ms / network 0ms)
~~~

As suspected, there are no indexes on `start_time` or `rider_id`, so you'll need to create indexes on those columns.

Because another performance best practice is to [create an index on the `WHERE` condition storing the join key]({% link {{ page.version.version }}/sql-tuning-with-explain.md %}#solution-create-a-secondary-index-on-the-where-condition-storing-the-join-key), create an index on `start_time` that stores the join key `rider_id`:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INDEX ON rides (start_time) storing (rider_id);
~~~

Now that you have an index on the column in your `WHERE` clause that stores the join key, let's run the query again:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT
    name, count(rides.id) AS sum
FROM
    users JOIN rides ON users.id = rides.rider_id
WHERE
    rides.start_time BETWEEN '2018-12-31 00:00:00' AND '2020-01-01 00:00:00'
GROUP BY
    name
ORDER BY
    sum DESC
LIMIT
    10;
~~~

~~~
        name       | sum
-------------------+------
  William Brown    |  14
  William Mitchell |  10
  Joseph Smith     |  10
  Paul Nelson      |   9
  Christina Smith  |   9
  Jeffrey Walker   |   8
  Jennifer Johnson |   8
  Joseph Jones     |   7
  Thomas Smith     |   7
  James Williams   |   7
(10 rows)

Time: 20ms total (execution 20ms / network 0ms)
~~~

This query is now running much faster than it was before you added the indexes (111ms vs. 20ms). This means you have an extra 91 milliseconds you can budget towards other areas of your application.

To see what changed, look at the [`EXPLAIN`]({% link {{ page.version.version }}/explain.md %}) output:

{% include_cached copy-clipboard.html %}
~~~ sql
EXPLAIN SELECT
    name, count(rides.id) AS sum
FROM
    users JOIN rides ON users.id = rides.rider_id
WHERE
    rides.start_time BETWEEN '2018-12-31 00:00:00' AND '2020-01-01 00:00:00'
GROUP BY
    name
ORDER BY
    sum DESC
LIMIT
    10;
~~~

As you can see, this query is no longer scanning the entire (larger) `rides` table. Instead, it is now doing a much smaller range scan against only the values in `rides` that match the index you just created on the `start_time` column (12,863 rows instead of 125,000).

~~~
                                                info
----------------------------------------------------------------------------------------------------
  distribution: full
  vectorized: true

  • limit
  │ estimated row count: 10
  │ count: 10
  │
  └── • sort
      │ estimated row count: 7,772
      │ order: -count_rows
      │
      └── • group
          │ estimated row count: 7,772
          │ group by: name
          │
          └── • hash join
              │ estimated row count: 12,863
              │ equality: (rider_id) = (id)
              │
              ├── • scan
              │     estimated row count: 12,863 (10% of the table; stats collected 5 minutes ago)
              │     table: rides@rides_start_time_idx
              │     spans: [/'2018-12-31 00:00:00' - /'2020-01-01 00:00:00']
              │
              └── • scan
                    estimated row count: 12,500 (100% of the table; stats collected 6 minutes ago)
                    table: users@users_pkey
                    spans: FULL SCAN
(28 rows)


Time: 2ms total (execution 2ms / network 1ms)
~~~

## Rule 3. Use the right join type

Out of the box, the [cost-based optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) will select the right join type for your statement in the majority of cases. Therefore, you should only provide [join hints]({% link {{ page.version.version }}/cost-based-optimizer.md %}#join-hints) in your query if you can **prove** to yourself through experimentation that the optimizer should be using a different [join type]({% link {{ page.version.version }}/joins.md %}#join-algorithms) than it is selecting.

You can confirm that in this case the optimizer has already found the right join type for this statement by using a hint to force another join type.

For example, you might think that a [lookup join]({% link {{ page.version.version }}/joins.md %}#lookup-joins) could perform better in this instance, since one of the tables in the join is 10x smaller than the other.

In order to get CockroachDB to plan a lookup join in this case, you will need to add an explicit index on the join key for the right-hand-side table, in this case, `rides`.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INDEX ON rides (rider_id);
~~~

Next, you can specify the lookup join with a join hint:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT
  name, count(rides.id) AS sum
FROM
  users INNER LOOKUP JOIN rides ON users.id = rides.rider_id
WHERE
  (rides.start_time BETWEEN '2018-12-31 00:00:00' AND '2020-01-01 00:00:00')
GROUP BY
  name
ORDER BY
  sum DESC
LIMIT
  10;
~~~

~~~
        name       | sum
+------------------+-----+
  William Brown    |  14
  William Mitchell |  10
  Joseph Smith     |  10
  Paul Nelson      |   9
  Christina Smith  |   9
  Jeffrey Walker   |   8
  Jennifer Johnson |   8
  Joseph Jones     |   7
  Thomas Smith     |   7
  James Williams   |   7
(10 rows)


Time: 985ms total (execution 985ms / network 0ms)
~~~

The results, however, are not good. The query is much slower using a lookup join than what CockroachDB planned for you earlier.

The query is faster when you force CockroachDB to use a merge join:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT
  name, count(rides.id) AS sum
FROM
  users INNER MERGE JOIN rides ON users.id = rides.rider_id
WHERE
  (rides.start_time BETWEEN '2018-12-31 00:00:00' AND '2020-01-01 00:00:00')
GROUP BY
  name
ORDER BY
  sum DESC
LIMIT
  10;
~~~

~~~
        name       | sum
+------------------+-----+
  William Brown    |  14
  William Mitchell |  10
  Joseph Smith     |  10
  Paul Nelson      |   9
  Christina Smith  |   9
  Jennifer Johnson |   8
  Jeffrey Walker   |   8
  Joseph Jones     |   7
  Thomas Smith     |   7
  James Williams   |   7
(10 rows)


Time: 23ms total (execution 22ms / network 0ms)
~~~

The results are consistently about 20-26ms with a merge join versus 16-23ms when you let CockroachDB choose the join type as shown in the previous section. In other words, forcing the merge join is slightly slower than if you had done nothing.

## See also

- [SQL Best Practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %})
- [Troubleshoot SQL Behavior]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %})
