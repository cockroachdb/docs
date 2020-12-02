---
title: CREATE STATISTICS
summary: Use the CREATE STATISTICS statement to generate table statistics for the cost-based optimizer to use.
toc: true
---
Use the `CREATE STATISTICS` [statement](sql-statements.html) to generate table statistics for the [cost-based optimizer](cost-based-optimizer.html) to use.

Once you [create a table](create-table.html) and load data into it (e.g., [`INSERT`](insert.html), [`IMPORT`](import.html)), table statistics can be generated. Table statistics help the cost-based optimizer determine the cardinality of the rows used in each query, which helps to predict more accurate costs.

 For compatibility with PostgreSQL, CockroachDB supports the `ANALYZE`/`ANALYSE` statement as an alias for `CREATE STATISTICS`. For syntax, [see below](#aliases).

{{site.data.alerts.callout_info}}
[By default, CockroachDB automatically generates statistics](cost-based-optimizer.html#table-statistics) on all indexed columns, and up to 100 non-indexed columns. As a result, most users don't need to issue `CREATE STATISTICS` statements directly.

 CockroachDB also automatically collects [multi-column statistics](#create-statistics-on-multiple-columns) on columns that prefix each index.
{{site.data.alerts.end}}

## Syntax

<div>
  {% include {{ page.version.version }}/sql/diagrams/create_stats.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`statistics_name` | The name of the set of statistics you are creating.
`opt_stats_columns`   | The name of the column(s) you want to create statistics for.
`create_stats_target` | The name of the table you want to create statistics for.
`opt_as_of_clause`    | Used to create historical stats using the [`AS OF SYSTEM TIME`](as-of-system-time.html) clause.  For instructions, see [Create statistics as of a given time](#create-statistics-as-of-a-given-time).

## Required Privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the parent database.

## Aliases

 For PostgreSQL compatibility, CockroachDB supports `ANALYZE`/`ANALYSE` as an alias for `CREATE STATISTICS`.

### Alias syntax

<div>
  {% include {{ page.version.version }}/sql/diagrams/analyze.html %}
</div>

### Alias parameters

Parameter | Description
----------|------------
`analyze_target` | The name of the table for which you want to create statistics.

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
  statistics_name |       column_names        |             created              | row_count | distinct_count | null_count |    histogram_id
------------------+---------------------------+----------------------------------+-----------+----------------+------------+---------------------
  __auto__        | {city}                    | 2020-08-26 16:55:24.725089+00:00 |       500 |              9 |          0 | 584550071425531905
  __auto__        | {id}                      | 2020-08-26 16:55:24.725089+00:00 |       500 |            500 |          0 | 584550071432740865
  __auto__        | {city,id}                 | 2020-08-26 16:55:24.725089+00:00 |       500 |            500 |          0 |               NULL
  __auto__        | {rider_id}                | 2020-08-26 16:55:24.725089+00:00 |       500 |             50 |          0 | 584550071446732801
  __auto__        | {city,rider_id}           | 2020-08-26 16:55:24.725089+00:00 |       500 |             50 |          0 |               NULL
  __auto__        | {vehicle_city}            | 2020-08-26 16:55:24.725089+00:00 |       500 |              9 |          0 | 584550071461019649
  __auto__        | {vehicle_id}              | 2020-08-26 16:55:24.725089+00:00 |       500 |             15 |          0 | 584550071467966465
  __auto__        | {vehicle_city,vehicle_id} | 2020-08-26 16:55:24.725089+00:00 |       500 |             15 |          0 |               NULL
  __auto__        | {start_address}           | 2020-08-26 16:55:24.725089+00:00 |       500 |            500 |          0 | 584550071482122241
  __auto__        | {end_address}             | 2020-08-26 16:55:24.725089+00:00 |       500 |            500 |          0 | 584550071489167361
  __auto__        | {start_time}              | 2020-08-26 16:55:24.725089+00:00 |       500 |             30 |          0 | 584550071496671233
  __auto__        | {end_time}                | 2020-08-26 16:55:24.725089+00:00 |       500 |            367 |          0 | 584550071504437249
  __auto__        | {revenue}                 | 2020-08-26 16:55:24.725089+00:00 |       500 |            100 |          0 | 584550071512137729
  revenue_stats   | {revenue}                 | 2020-08-26 16:55:33.986698+00:00 |       500 |            100 |          0 | 584550101775384577
(14 rows)
~~~

Note that statistics are automatically collected for all columns in the `rides` table, making the `revenue_stats` statistics a duplicate of the statistics automatically collected on the `revenue` column.

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
   statistics_name   |       column_names        |             created              | row_count | distinct_count | null_count |    histogram_id
---------------------+---------------------------+----------------------------------+-----------+----------------+------------+---------------------
  __auto__           | {city}                    | 2020-08-26 16:55:24.725089+00:00 |       500 |              9 |          0 | 584550071425531905
  __auto__           | {id}                      | 2020-08-26 16:55:24.725089+00:00 |       500 |            500 |          0 | 584550071432740865
  __auto__           | {city,id}                 | 2020-08-26 16:55:24.725089+00:00 |       500 |            500 |          0 |               NULL
  __auto__           | {rider_id}                | 2020-08-26 16:55:24.725089+00:00 |       500 |             50 |          0 | 584550071446732801
  __auto__           | {city,rider_id}           | 2020-08-26 16:55:24.725089+00:00 |       500 |             50 |          0 |               NULL
  __auto__           | {vehicle_city}            | 2020-08-26 16:55:24.725089+00:00 |       500 |              9 |          0 | 584550071461019649
  __auto__           | {vehicle_id}              | 2020-08-26 16:55:24.725089+00:00 |       500 |             15 |          0 | 584550071467966465
  __auto__           | {vehicle_city,vehicle_id} | 2020-08-26 16:55:24.725089+00:00 |       500 |             15 |          0 |               NULL
  __auto__           | {start_address}           | 2020-08-26 16:55:24.725089+00:00 |       500 |            500 |          0 | 584550071482122241
  __auto__           | {end_address}             | 2020-08-26 16:55:24.725089+00:00 |       500 |            500 |          0 | 584550071489167361
  __auto__           | {start_time}              | 2020-08-26 16:55:24.725089+00:00 |       500 |             30 |          0 | 584550071496671233
  __auto__           | {end_time}                | 2020-08-26 16:55:24.725089+00:00 |       500 |            367 |          0 | 584550071504437249
  __auto__           | {revenue}                 | 2020-08-26 16:55:24.725089+00:00 |       500 |            100 |          0 | 584550071512137729
  revenue_stats      | {revenue}                 | 2020-08-26 16:55:33.986698+00:00 |       500 |            100 |          0 | 584550101775384577
  city_revenue_stats | {city,revenue}            | 2020-08-26 16:55:52.539795+00:00 |       500 |            372 |          0 |               NULL
(15 rows)
~~~

 Multi-column statistics are automatically collected for all columns that prefix an index. In this example, `city` and `revenue` are not an index prefix, making the `city_revenue_stats` statistics unique for the table.

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
  statistics_name | column_names  |             created              | row_count | distinct_count | null_count |    histogram_id
------------------+---------------+----------------------------------+-----------+----------------+------------+---------------------
  __auto__        | {city}        | 2020-08-26 16:55:24.765331+00:00 |        50 |              9 |          0 | 584550071556964353
  __auto__        | {id}          | 2020-08-26 16:55:24.765331+00:00 |        50 |             50 |          0 | 584550071563976705
  __auto__        | {city,id}     | 2020-08-26 16:55:24.765331+00:00 |        50 |             50 |          0 |               NULL
  __auto__        | {name}        | 2020-08-26 16:55:24.765331+00:00 |        50 |             49 |          0 | 584550071577477121
  __auto__        | {address}     | 2020-08-26 16:55:24.765331+00:00 |        50 |             50 |          0 | 584550071583997953
  __auto__        | {credit_card} | 2020-08-26 16:55:24.765331+00:00 |        50 |             50 |          0 | 584550071591141377
  users_stats     | {city}        | 2020-08-26 16:56:12.802308+00:00 |        50 |              9 |          0 | 584550228973027329
  users_stats     | {id}          | 2020-08-26 16:56:12.802308+00:00 |        50 |             50 |          0 | 584550228985905153
  users_stats     | {city,id}     | 2020-08-26 16:56:12.802308+00:00 |        50 |             50 |          0 |               NULL
  users_stats     | {name}        | 2020-08-26 16:56:12.802308+00:00 |        50 |             49 |          0 | 584550229015625729
  users_stats     | {address}     | 2020-08-26 16:56:12.802308+00:00 |        50 |             50 |          0 | 584550229028765697
  users_stats     | {credit_card} | 2020-08-26 16:56:12.802308+00:00 |        50 |             50 |          0 | 584550229043937281
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

Every time the `CREATE STATISTICS` statement is executed, it kicks off a background job. This is true for queries issued by your application as well as queries issued by the [automatic stats feature](cost-based-optimizer.html#table-statistics).

To view statistics jobs, there are two options:

1. Use  [`SHOW JOBS`](show-jobs.html) to see all statistics jobs that were created by user queries (i.e., someone entering `CREATE STATISTICS` at the SQL prompt or via application code):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM [SHOW JOBS] WHERE job_type LIKE '%CREATE STATS%';
    ~~~

    ~~~
            job_id       |   job_type   |                                           description                                            | statement | user_name |  status   | running_status |             created              |             started              |             finished             |             modified             | fraction_completed | error | coordinator_id
    ---------------------+--------------+--------------------------------------------------------------------------------------------------+-----------+-----------+-----------+----------------+----------------------------------+----------------------------------+----------------------------------+----------------------------------+--------------------+-------+-----------------
      584550101732950017 | CREATE STATS | CREATE STATISTICS revenue_stats ON revenue FROM movr.public.rides                                |           | root      | succeeded | NULL           | 2020-08-26 16:55:33.976113+00:00 | 2020-08-26 16:55:33.979043+00:00 | 2020-08-26 16:55:33.990197+00:00 | 2020-08-26 16:55:33.989405+00:00 |                  1 |       |           NULL
      584550162508382209 | CREATE STATS | CREATE STATISTICS city_revenue_stats ON city, revenue FROM movr.public.rides                     |           | root      | succeeded | NULL           | 2020-08-26 16:55:52.523299+00:00 | 2020-08-26 16:55:52.527194+00:00 | 2020-08-26 16:55:52.544301+00:00 | 2020-08-26 16:55:52.543148+00:00 |                  1 |       |           NULL
      584550228891500545 | CREATE STATS | CREATE STATISTICS users_stats FROM movr.public.users                                             |           | root      | succeeded | NULL           | 2020-08-26 16:56:12.781808+00:00 | 2020-08-26 16:56:12.789111+00:00 | 2020-08-26 16:56:12.830659+00:00 | 2020-08-26 16:56:12.82907+00:00  |                  1 |       |           NULL
      584550307147874305 | CREATE STATS | CREATE STATISTICS vehicle_stats_1 FROM movr.public.vehicles WITH OPTIONS AS OF SYSTEM TIME '-1m' |           | root      | succeeded | NULL           | 2020-08-26 16:56:36.663773+00:00 | 2020-08-26 16:56:36.668101+00:00 | 2020-08-26 16:56:36.705743+00:00 | 2020-08-26 16:56:36.704696+00:00 |                  1 |       |           NULL
    (5 rows)
    ~~~

2. Use `SHOW AUTOMATIC JOBS` to see statistics jobs that were created by the [automatic statistics feature](cost-based-optimizer.html#table-statistics):

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM [SHOW AUTOMATIC JOBS] WHERE job_type LIKE '%CREATE STATS%';
    ~~~

    ~~~
            job_id       |     job_type      |                             description                             |                                         statement                                         | user_name |  status   | running_status |             created              |             started              |             finished             |             modified             | fraction_completed | error | coordinator_id
    ---------------------+-------------------+---------------------------------------------------------------------+-------------------------------------------------------------------------------------------+-----------+-----------+----------------+----------------------------------+----------------------------------+----------------------------------+----------------------------------+--------------------+-------+-----------------
      584550071026876417 | AUTO CREATE STATS | Table statistics refresh for movr.public.user_promo_codes           | CREATE STATISTICS __auto__ FROM [58] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2020-08-26 16:55:24.605364+00:00 | 2020-08-26 16:55:24.608296+00:00 | 2020-08-26 16:55:24.632626+00:00 | 2020-08-26 16:55:24.631635+00:00 |                  1 |       |           NULL
      584550071124131841 | AUTO CREATE STATS | Table statistics refresh for movr.public.vehicle_location_histories | CREATE STATISTICS __auto__ FROM [56] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2020-08-26 16:55:24.635051+00:00 | 2020-08-26 16:55:24.636861+00:00 | 2020-08-26 16:55:24.672699+00:00 | 2020-08-26 16:55:24.671777+00:00 |                  1 |       |           NULL
      584550071255498753 | AUTO CREATE STATS | Table statistics refresh for movr.public.promo_codes                | CREATE STATISTICS __auto__ FROM [57] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2020-08-26 16:55:24.675136+00:00 | 2020-08-26 16:55:24.677263+00:00 | 2020-08-26 16:55:24.709619+00:00 | 2020-08-26 16:55:24.708881+00:00 |                  1 |       |           NULL
      584550071376281601 | AUTO CREATE STATS | Table statistics refresh for movr.public.rides                      | CREATE STATISTICS __auto__ FROM [55] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2020-08-26 16:55:24.712003+00:00 | 2020-08-26 16:55:24.713674+00:00 | 2020-08-26 16:55:24.754449+00:00 | 2020-08-26 16:55:24.753735+00:00 |                  1 |       |           NULL
      584550071523082241 | AUTO CREATE STATS | Table statistics refresh for movr.public.users                      | CREATE STATISTICS __auto__ FROM [53] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2020-08-26 16:55:24.756802+00:00 | 2020-08-26 16:55:24.758638+00:00 | 2020-08-26 16:55:24.77889+00:00  | 2020-08-26 16:55:24.777899+00:00 |                  1 |       |           NULL
      584550071604314113 | AUTO CREATE STATS | Table statistics refresh for movr.public.vehicles                   | CREATE STATISTICS __auto__ FROM [54] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2020-08-26 16:55:24.781594+00:00 | 2020-08-26 16:55:24.783519+00:00 | 2020-08-26 16:55:24.815104+00:00 | 2020-08-26 16:55:24.814103+00:00 |                  1 |       |           NULL
    (6 rows)
    ~~~

## See Also

- [Cost-Based Optimizer](cost-based-optimizer.html)
- [`SHOW STATISTICS`](show-statistics.html)
- [`CREATE TABLE`](create-table.html)
- [`INSERT`](insert.html)
- [`IMPORT`](import.html)
- [`SHOW JOBS`](show-jobs.html)
- [SQL Statements](sql-statements.html)
