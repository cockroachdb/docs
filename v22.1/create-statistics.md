---
title: CREATE STATISTICS
summary: Use the CREATE STATISTICS statement to generate table statistics for the cost-based optimizer to use.
toc: true
docs_area: reference.sql
---

Use the `CREATE STATISTICS` [statement](sql-statements.html) to generate table statistics for the [cost-based optimizer](cost-based-optimizer.html) to use.

Once you [create a table](create-table.html) and load data into it (e.g., [`INSERT`](insert.html), [`IMPORT`](import.html)), table statistics can be generated. Table statistics help the cost-based optimizer determine the cardinality of the rows used in each query, which helps to predict more accurate costs.

For compatibility with PostgreSQL, CockroachDB supports the `ANALYZE`/`ANALYSE` statement as an alias for `CREATE STATISTICS`. For syntax, see [Aliases](#aliases).

By default, CockroachDB [automatically generates statistics](cost-based-optimizer.html#table-statistics) on all indexed columns and up to 100 non-indexed columns, and automatically collects [multi-column statistics](#create-statistics-on-multiple-columns) on columns that prefix each index. As a result, most users do not need to directly issue `CREATE STATISTICS` statements.

## Syntax

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/create_stats.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`statistics_name` | The name of the set of statistics you are creating.
`opt_stats_columns`   | The name of the column(s) to create statistics for.
`create_stats_target` | The name of the table to create statistics for.
`opt_as_of_clause`    | Create historical stats using the [`AS OF SYSTEM TIME`](as-of-system-time.html) clause.  For instructions, see [Create statistics as of a given time](#create-statistics-as-of-a-given-time).

## Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the parent database.

## Aliases

For [PostgreSQL compatibility](postgresql-compatibility.html), CockroachDB supports `ANALYZE` and `ANALYSE` as aliases for `CREATE STATISTICS`.

### Alias syntax

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/analyze.html %}
</div>

### Alias parameters

Parameter | Description
----------|------------
`analyze_target` | The name of the table to create statistics for.

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Create statistics on a single column

{% include copy-clipboard.html %}
~~~ sql
> CREATE STATISTICS revenue_stats ON revenue FROM rides;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW STATISTICS FOR TABLE rides;
~~~

~~~
  statistics_name |       column_names        |          created           | row_count | distinct_count | null_count | avg_size |    histogram_id
------------------+---------------------------+----------------------------+-----------+----------------+------------+----------+---------------------
  __auto__        | {city}                    | 2022-04-20 22:43:08.851613 |       500 |              9 |          0 |       12 | 755053982033936385
  __auto__        | {id}                      | 2022-04-20 22:43:08.851613 |       500 |            500 |          0 |       26 | 755053982039703553
  __auto__        | {city,id}                 | 2022-04-20 22:43:08.851613 |       500 |            500 |          0 |       37 |               NULL
  __auto__        | {rider_id}                | 2022-04-20 22:43:08.851613 |       500 |             50 |          0 |       17 | 755053982050910209
  __auto__        | {city,rider_id}           | 2022-04-20 22:43:08.851613 |       500 |             50 |          0 |       29 |               NULL
  __auto__        | {vehicle_city}            | 2022-04-20 22:43:08.851613 |       500 |              9 |          0 |       11 | 755053982061690881
  __auto__        | {vehicle_id}              | 2022-04-20 22:43:08.851613 |       500 |             15 |          0 |       17 | 755053982067392513
  __auto__        | {vehicle_city,vehicle_id} | 2022-04-20 22:43:08.851613 |       500 |             15 |          0 |       28 |               NULL
  __auto__        | {start_address}           | 2022-04-20 22:43:08.851613 |       500 |            500 |          0 |       25 | 755053982080991233
  __auto__        | {end_address}             | 2022-04-20 22:43:08.851613 |       500 |            500 |          0 |       25 | 755053982087544833
  __auto__        | {start_time}              | 2022-04-20 22:43:08.851613 |       500 |             30 |          0 |        7 | 755053982093443073
  __auto__        | {end_time}                | 2022-04-20 22:43:08.851613 |       500 |            367 |          0 |        7 | 755053982099472385
  __auto__        | {revenue}                 | 2022-04-20 22:43:08.851613 |       500 |            100 |          0 |        6 | 755053982105337857
  revenue_stats   | {revenue}                 | 2022-04-20 22:35:42.279266 |       500 |            100 |          0 |        6 | 755052518729449473
(14 rows)
~~~

Statistics are automatically collected for **all columns**, making the `revenue_stats` statistics a duplicate of the statistics automatically collected on the `revenue` column.

### Create statistics on multiple columns

{% include copy-clipboard.html %}
~~~ sql
> CREATE STATISTICS city_revenue_stats ON city, revenue FROM rides;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW STATISTICS FOR TABLE rides;
~~~

~~~
   statistics_name   |       column_names        |          created           | row_count | distinct_count | null_count | avg_size |    histogram_id
---------------------+---------------------------+----------------------------+-----------+----------------+------------+----------+---------------------
  __auto__           | {city}                    | 2022-04-20 22:43:08.851613 |       500 |              9 |          0 |       12 | 755053982033936385
  __auto__           | {id}                      | 2022-04-20 22:43:08.851613 |       500 |            500 |          0 |       26 | 755053982039703553
  __auto__           | {city,id}                 | 2022-04-20 22:43:08.851613 |       500 |            500 |          0 |       37 |               NULL
  __auto__           | {rider_id}                | 2022-04-20 22:43:08.851613 |       500 |             50 |          0 |       17 | 755053982050910209
  __auto__           | {city,rider_id}           | 2022-04-20 22:43:08.851613 |       500 |             50 |          0 |       29 |               NULL
  __auto__           | {vehicle_city}            | 2022-04-20 22:43:08.851613 |       500 |              9 |          0 |       11 | 755053982061690881
  __auto__           | {vehicle_id}              | 2022-04-20 22:43:08.851613 |       500 |             15 |          0 |       17 | 755053982067392513
  __auto__           | {vehicle_city,vehicle_id} | 2022-04-20 22:43:08.851613 |       500 |             15 |          0 |       28 |               NULL
  __auto__           | {start_address}           | 2022-04-20 22:43:08.851613 |       500 |            500 |          0 |       25 | 755053982080991233
  __auto__           | {end_address}             | 2022-04-20 22:43:08.851613 |       500 |            500 |          0 |       25 | 755053982087544833
  __auto__           | {start_time}              | 2022-04-20 22:43:08.851613 |       500 |             30 |          0 |        7 | 755053982093443073
  __auto__           | {end_time}                | 2022-04-20 22:43:08.851613 |       500 |            367 |          0 |        7 | 755053982099472385
  __auto__           | {revenue}                 | 2022-04-20 22:43:08.851613 |       500 |            100 |          0 |        6 | 755053982105337857
  revenue_stats      | {revenue}                 | 2022-04-20 22:45:40.272665 |       500 |            100 |          0 |        6 | 755054478211481601
  city_revenue_stats | {city,revenue}            | 2022-04-20 22:45:46.925799 |       500 |            372 |          0 |       18 |               NULL
(15 rows)
~~~

Multi-column statistics are automatically collected for **all columns that prefix an index**. In this example, `city` and `revenue` are not an index prefix, making the `city_revenue_stats` statistics unique for the table.

### Create statistics on a default set of columns

The `CREATE STATISTICS` statement shown below automatically figures out which columns to get statistics on.

{% include copy-clipboard.html %}
~~~ sql
> CREATE STATISTICS users_stats FROM users;
~~~

This statement creates statistics identical to the statistics that CockroachDB creates automatically.

{% include copy-clipboard.html %}
~~~ sql
> SHOW STATISTICS FOR TABLE users;
~~~

~~~
  statistics_name | column_names  |          created           | row_count | distinct_count | null_count | avg_size |    histogram_id
------------------+---------------+----------------------------+-----------+----------------+------------+----------+---------------------
  __auto__        | {city}        | 2022-04-20 22:43:08.819069 |        50 |              9 |          0 |       12 | 755053981927636993
  __auto__        | {id}          | 2022-04-20 22:43:08.819069 |        50 |             50 |          0 |       27 | 755053981933273089
  __auto__        | {city,id}     | 2022-04-20 22:43:08.819069 |        50 |             50 |          0 |       38 |               NULL
  __auto__        | {name}        | 2022-04-20 22:43:08.819069 |        50 |             49 |          0 |       16 | 755053981944184833
  __auto__        | {address}     | 2022-04-20 22:43:08.819069 |        50 |             50 |          0 |       26 | 755053981949001729
  __auto__        | {credit_card} | 2022-04-20 22:43:08.819069 |        50 |             50 |          0 |       12 | 755053981954015233
  users_stats     | {city}        | 2022-04-20 22:46:14.878975 |        50 |              9 |          0 |       12 | 755054591614943233
  users_stats     | {id}          | 2022-04-20 22:46:14.878975 |        50 |             50 |          0 |       27 | 755054591622447105
  users_stats     | {city,id}     | 2022-04-20 22:46:14.878975 |        50 |             50 |          0 |       38 |               NULL
  users_stats     | {name}        | 2022-04-20 22:46:14.878975 |        50 |             49 |          0 |       16 | 755054591638634497
  users_stats     | {address}     | 2022-04-20 22:46:14.878975 |        50 |             50 |          0 |       26 | 755054591645712385
  users_stats     | {credit_card} | 2022-04-20 22:46:14.878975 |        50 |             50 |          0 |       12 | 755054591652691969
(12 rows)
~~~

### Create statistics as of a given time

To create statistics as of a given time (in this example, 1 minute ago to avoid interfering with the production workload), run a statement like the following:

{% include copy-clipboard.html %}
~~~ sql
> CREATE STATISTICS vehicle_stats_1 FROM vehicles AS OF SYSTEM TIME '-1m';
~~~

For more information about how the `AS OF SYSTEM TIME` clause works, including supported time formats, see [`AS OF SYSTEM TIME`](as-of-system-time.html).

### Delete statistics

{% include {{ page.version.version }}/misc/delete-statistics.md %}

### View statistics jobs

Every time the `CREATE STATISTICS` statement is executed, it starts a background job. This is true for queries issued by your application as well as queries issued for [automatically generated statistics](cost-based-optimizer.html#table-statistics).

To view statistics jobs, there are two options:

1. Use  [`SHOW JOBS`](show-jobs.html) to see all statistics jobs that were created by user queries (i.e., someone entering `CREATE STATISTICS` at the SQL prompt or via application code):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM [SHOW JOBS] WHERE job_type LIKE '%CREATE STATS%';
    ~~~

    ~~~
            job_id       |   job_type   |                                           description                                            | statement | user_name |  status   | running_status |          created           |          started           |          finished          |          modified          | fraction_completed | error | coordinator_id |      trace_id       |          last_run          |          next_run          | num_runs | execution_errors
    ---------------------+--------------+--------------------------------------------------------------------------------------------------+-----------+-----------+-----------+----------------+----------------------------+----------------------------+----------------------------+----------------------------+--------------------+-------+----------------+---------------------+----------------------------+----------------------------+----------+-------------------
      755053959919108097 | CREATE STATS | CREATE STATISTICS revenue_stats ON revenue FROM movr.public.rides                                |           | demo      | succeeded | NULL           | 2022-04-20 22:43:02.104229 | 2022-04-20 22:43:02.109754 | 2022-04-20 22:43:02.123381 | 2022-04-20 22:43:02.122569 |                  1 |       |              1 | 2935658651779633570 | 2022-04-20 22:43:02.109755 | 2022-04-20 22:43:32.109755 |        1 | {}
      755054478158364673 | CREATE STATS | CREATE STATISTICS revenue_stats ON revenue FROM movr.public.rides                                |           | demo      | succeeded | NULL           | 2022-04-20 22:45:40.25829  | 2022-04-20 22:45:40.26361  | 2022-04-20 22:45:40.275882 | 2022-04-20 22:45:40.275032 |                  1 |       |              1 | 3941365223642966402 | 2022-04-20 22:45:40.263611 | 2022-04-20 22:46:10.263611 |        1 | {}
      755054499947053057 | CREATE STATS | CREATE STATISTICS city_revenue_stats ON city, revenue FROM movr.public.rides                     |           | demo      | succeeded | NULL           | 2022-04-20 22:45:46.907672 | 2022-04-20 22:45:46.912906 | 2022-04-20 22:45:46.929632 | 2022-04-20 22:45:46.928409 |                  1 |       |              1 | 6666823949040131150 | 2022-04-20 22:45:46.912906 | 2022-04-20 22:46:16.912906 |        1 | {}
      755054591559172097 | CREATE STATS | CREATE STATISTICS users_stats FROM movr.public.users                                             |           | demo      | succeeded | NULL           | 2022-04-20 22:46:14.865479 | 2022-04-20 22:46:14.869725 | 2022-04-20 22:46:14.895666 | 2022-04-20 22:46:14.89469  |                  1 |       |              1 | 6731618360724088456 | 2022-04-20 22:46:14.869726 | 2022-04-20 22:46:44.869726 |        1 | {}
      755055101600661505 | CREATE STATS | CREATE STATISTICS vehicle_stats_1 FROM movr.public.vehicles WITH OPTIONS AS OF SYSTEM TIME '-1m' |           | demo      | succeeded | NULL           | 2022-04-20 22:48:50.517787 | 2022-04-20 22:48:50.523002 | 2022-04-20 22:48:50.552397 | 2022-04-20 22:48:50.551333 |                  1 |       |              1 | 8797094911788373312 | 2022-04-20 22:48:50.523003 | 2022-04-20 22:49:20.523003 |        1 | {}
    (5 rows)
    ~~~

2. Use `SHOW AUTOMATIC JOBS` to see statistics jobs that were created by [automatically generated statistics](cost-based-optimizer.html#table-statistics):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM [SHOW AUTOMATIC JOBS] WHERE job_type LIKE '%CREATE STATS%';
    ~~~

    ~~~
            job_id       |     job_type      |                             description                             |                                         statement                                          | user_name |  status   | running_status |          created           |          started           |          finished          |          modified          | fraction_completed | error | coordinator_id |      trace_id       |          last_run          |          next_run          | num_runs | execution_errors
    ---------------------+-------------------+---------------------------------------------------------------------+--------------------------------------------------------------------------------------------+-----------+-----------+----------------+----------------------------+----------------------------+----------------------------+----------------------------+--------------------+-------+----------------+---------------------+----------------------------+----------------------------+----------+-------------------
      755046859132338177 | AUTO CREATE STATS | Table statistics refresh for movr.public.vehicle_location_histories | CREATE STATISTICS __auto__ FROM [109] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2022-04-20 22:06:55.116073 | 2022-04-20 22:06:55.126215 | 2022-04-20 22:06:55.81112  | 2022-04-20 22:06:55.809757 |                  1 |       |              1 | 7300707583932918060 | 2022-04-20 22:06:55.126216 | 2022-04-20 22:07:25.126216 |        1 | {}
      755046861432094721 | AUTO CREATE STATS | Table statistics refresh for movr.public.user_promo_codes           | CREATE STATISTICS __auto__ FROM [111] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2022-04-20 22:06:55.817903 | 2022-04-20 22:06:55.825208 | 2022-04-20 22:06:55.858624 | 2022-04-20 22:06:55.857442 |                  1 |       |              1 |  944378671132247270 | 2022-04-20 22:06:55.825209 | 2022-04-20 22:07:25.825209 |        1 | {}
      755046861588529153 | AUTO CREATE STATS | Table statistics refresh for movr.public.rides                      | CREATE STATISTICS __auto__ FROM [108] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2022-04-20 22:06:55.865648 | 2022-04-20 22:06:55.871917 | 2022-04-20 22:06:56.772123 | 2022-04-20 22:06:56.770818 |                  1 |       |              1 |  107998367520189635 | 2022-04-20 22:06:55.871917 | 2022-04-20 22:07:25.871917 |        1 | {}
      755046864579690497 | AUTO CREATE STATS | Table statistics refresh for movr.public.vehicles                   | CREATE STATISTICS __auto__ FROM [107] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2022-04-20 22:06:56.778476 | 2022-04-20 22:06:56.785127 | 2022-04-20 22:06:56.887308 | 2022-04-20 22:06:56.886099 |                  1 |       |              1 | 1370771572055208171 | 2022-04-20 22:06:56.785128 | 2022-04-20 22:07:26.785128 |        1 | {}
      755046864953376769 | AUTO CREATE STATS | Table statistics refresh for movr.public.promo_codes                | CREATE STATISTICS __auto__ FROM [110] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2022-04-20 22:06:56.892515 | 2022-04-20 22:06:56.898684 | 2022-04-20 22:06:57.416186 | 2022-04-20 22:06:57.414741 |                  1 |       |              1 | 3756312875539405235 | 2022-04-20 22:06:56.898685 | 2022-04-20 22:07:26.898685 |        1 | {}
      755046866689851393 | AUTO CREATE STATS | Table statistics refresh for movr.public.users                      | CREATE STATISTICS __auto__ FROM [106] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2022-04-20 22:06:57.422449 | 2022-04-20 22:06:57.428999 | 2022-04-20 22:06:57.573797 | 2022-04-20 22:06:57.57256  |                  1 |       |              1 | 6690084610338235566 | 2022-04-20 22:06:57.428999 | 2022-04-20 22:07:27.428999 |        1 | {}
    (6 rows)
    ~~~

## See also

- [Cost-Based Optimizer](cost-based-optimizer.html)
- [`SHOW STATISTICS`](show-statistics.html)
- [`CREATE TABLE`](create-table.html)
- [`INSERT`](insert.html)
- [`IMPORT`](import.html)
- [`SHOW JOBS`](show-jobs.html)
- [SQL Statements](sql-statements.html)
