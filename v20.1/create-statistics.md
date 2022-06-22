---
title: CREATE STATISTICS
summary: Use the CREATE STATISTICS statement to generate table statistics for the cost-based optimizer to use.
toc: true
---
Use the `CREATE STATISTICS` [statement](sql-statements.html) to generate table statistics for the [cost-based optimizer](cost-based-optimizer.html) to use.

Once you [create a table](create-table.html) and load data into it (e.g., [`INSERT`](insert.html), [`IMPORT`](import.html)), table statistics can be generated. Table statistics help the cost-based optimizer determine the cardinality of the rows used in each query, which helps to predict more accurate costs.

{{site.data.alerts.callout_info}}
[By default, CockroachDB automatically generates statistics](cost-based-optimizer.html#table-statistics) on all indexed columns, and up to 100 non-indexed columns. As a result, most users do not need to issue `CREATE STATISTICS` statements directly.
{{site.data.alerts.end}}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/create_stats.html %}
</div>

## Required Privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the parent database.

## Parameters

| Parameter             | Description                                                                                                                                                                                           |
|-----------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `statistics_name`     | The name of the set of statistics you are creating.                                                                                                                                                   |
| `opt_stats_columns`   | The name of the column(s) you want to create statistics for.                                                                                                                                          |
| `create_stats_target` | The name of the table you want to create statistics for.                                                                                                                                              |
| `opt_as_of_clause`    | Used to create historical stats using the [`AS OF SYSTEM TIME`](as-of-system-time.html) clause.  For instructions, see [Create statistics as of a given time](#create-statistics-as-of-a-given-time). |

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Create statistics on a single column

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE STATISTICS revenue_stats ON revenue FROM rides;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW STATISTICS FOR TABLE rides;
~~~

~~~
  statistics_name |  column_names   |             created              | row_count | distinct_count | null_count |    histogram_id
------------------+-----------------+----------------------------------+-----------+----------------+------------+---------------------
  __auto__        | {city}          | 2020-08-26 17:17:13.852138+00:00 |       500 |              9 |          0 | 584554361172525057
  __auto__        | {vehicle_city}  | 2020-08-26 17:17:13.852138+00:00 |       500 |              9 |          0 | 584554361179242497
  __auto__        | {id}            | 2020-08-26 17:17:13.852138+00:00 |       500 |            500 |          0 |               NULL
  __auto__        | {rider_id}      | 2020-08-26 17:17:13.852138+00:00 |       500 |             50 |          0 |               NULL
  __auto__        | {vehicle_id}    | 2020-08-26 17:17:13.852138+00:00 |       500 |             15 |          0 |               NULL
  __auto__        | {start_address} | 2020-08-26 17:17:13.852138+00:00 |       500 |            500 |          0 |               NULL
  __auto__        | {end_address}   | 2020-08-26 17:17:13.852138+00:00 |       500 |            500 |          0 |               NULL
  __auto__        | {start_time}    | 2020-08-26 17:17:13.852138+00:00 |       500 |             30 |          0 |               NULL
  __auto__        | {end_time}      | 2020-08-26 17:17:13.852138+00:00 |       500 |            367 |          0 |               NULL
  __auto__        | {revenue}       | 2020-08-26 17:17:13.852138+00:00 |       500 |            100 |          0 |               NULL
  revenue_stats   | {revenue}       | 2020-08-26 17:18:23.928606+00:00 |       500 |            100 |          0 | 584554590801035265
(11 rows)
~~~

Note that statistics are automatically collected for all columns in the `rides` table, making the `revenue_stats` statistics a duplicate of the statistics automatically collected on the `revenue` column.

### Create statistics on a default set of columns

The `CREATE STATISTICS` statement shown below automatically figures out which columns to get statistics on.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE STATISTICS users_stats FROM users;
~~~

This statement creates statistics identical to the statistics that CockroachDB creates automatically.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW STATISTICS FOR TABLE users;
~~~

~~~
  statistics_name | column_names  |             created              | row_count | distinct_count | null_count |    histogram_id
------------------+---------------+----------------------------------+-----------+----------------+------------+---------------------
  __auto__        | {city}        | 2020-08-26 17:17:13.880576+00:00 |        50 |              9 |          0 | 584554361264930817
  __auto__        | {id}          | 2020-08-26 17:17:13.880576+00:00 |        50 |             50 |          0 |               NULL
  __auto__        | {name}        | 2020-08-26 17:17:13.880576+00:00 |        50 |             49 |          0 |               NULL
  __auto__        | {address}     | 2020-08-26 17:17:13.880576+00:00 |        50 |             50 |          0 |               NULL
  __auto__        | {credit_card} | 2020-08-26 17:17:13.880576+00:00 |        50 |             50 |          0 |               NULL
  users_stats     | {city}        | 2020-08-26 17:18:55.87803+00:00  |        50 |              9 |          0 | 584554695490502657
  users_stats     | {id}          | 2020-08-26 17:18:55.87803+00:00  |        50 |             50 |          0 |               NULL
  users_stats     | {name}        | 2020-08-26 17:18:55.87803+00:00  |        50 |             49 |          0 |               NULL
  users_stats     | {address}     | 2020-08-26 17:18:55.87803+00:00  |        50 |             50 |          0 |               NULL
  users_stats     | {credit_card} | 2020-08-26 17:18:55.87803+00:00  |        50 |             50 |          0 |               NULL
(10 rows)
~~~

### Create statistics as of a given time

To create statistics as of a given time (in this example, 1 minute ago to avoid interfering with the production workload), run a statement like the following:

{% include_cached copy-clipboard.html %}
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

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM [SHOW JOBS] WHERE job_type LIKE '%CREATE STATS%';
    ~~~

    ~~~
            job_id       |   job_type   |                                           description                                            | statement | user_name |  status   | running_status |             created              |             started              |             finished             |             modified             | fraction_completed | error | coordinator_id
    ---------------------+--------------+--------------------------------------------------------------------------------------------------+-----------+-----------+-----------+----------------+----------------------------------+----------------------------------+----------------------------------+----------------------------------+--------------------+-------+-----------------
      584554590745821185 | CREATE STATS | CREATE STATISTICS revenue_stats ON revenue FROM movr.public.rides                                |           | root      | succeeded | NULL           | 2020-08-26 17:18:23.914124+00:00 | 2020-08-26 17:18:23.918222+00:00 | 2020-08-26 17:18:23.932202+00:00 | 2020-08-26 17:18:23.931436+00:00 |                  1 |       |              1
      584554695442432001 | CREATE STATS | CREATE STATISTICS users_stats FROM movr.public.users                                             |           | root      | succeeded | NULL           | 2020-08-26 17:18:55.864992+00:00 | 2020-08-26 17:18:55.867214+00:00 | 2020-08-26 17:18:55.888815+00:00 | 2020-08-26 17:18:55.888237+00:00 |                  1 |       |              1
      584554752084606977 | CREATE STATS | CREATE STATISTICS vehicle_stats_1 FROM movr.public.vehicles WITH OPTIONS AS OF SYSTEM TIME '-1m' |           | root      | succeeded | NULL           | 2020-08-26 17:19:13.150822+00:00 | 2020-08-26 17:19:13.152896+00:00 | 2020-08-26 17:19:13.176799+00:00 | 2020-08-26 17:19:13.176202+00:00 |                  1 |       |              1
    (3 rows)
    ~~~

2. Use `SHOW AUTOMATIC JOBS` to see statistics jobs that were created by the [automatic statistics feature](cost-based-optimizer.html#table-statistics):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM [SHOW AUTOMATIC JOBS] WHERE job_type LIKE '%CREATE STATS%';
    ~~~

    ~~~
            job_id       |     job_type      |                             description                             |                                         statement                                         | user_name |  status   | running_status |             created              |             started              |             finished             |             modified             | fraction_completed | error | coordinator_id
    ---------------------+-------------------+---------------------------------------------------------------------+-------------------------------------------------------------------------------------------+-----------+-----------+----------------+----------------------------------+----------------------------------+----------------------------------+----------------------------------+--------------------+-------+-----------------
      584554360819712001 | AUTO CREATE STATS | Table statistics refresh for movr.public.vehicles                   | CREATE STATISTICS __auto__ FROM [54] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2020-08-26 17:17:13.746242+00:00 | 2020-08-26 17:17:13.754166+00:00 | 2020-08-26 17:17:13.785217+00:00 | 2020-08-26 17:17:13.784454+00:00 |                  1 |       |              1
      584554360958156801 | AUTO CREATE STATS | Table statistics refresh for movr.public.vehicle_location_histories | CREATE STATISTICS __auto__ FROM [56] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2020-08-26 17:17:13.788499+00:00 | 2020-08-26 17:17:13.79+00:00     | 2020-08-26 17:17:13.813299+00:00 | 2020-08-26 17:17:13.812742+00:00 |                  1 |       |              1
      584554361050529793 | AUTO CREATE STATS | Table statistics refresh for movr.public.user_promo_codes           | CREATE STATISTICS __auto__ FROM [58] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2020-08-26 17:17:13.816693+00:00 | 2020-08-26 17:17:13.818026+00:00 | 2020-08-26 17:17:13.833977+00:00 | 2020-08-26 17:17:13.833316+00:00 |                  1 |       |              1
      584554361118425089 | AUTO CREATE STATS | Table statistics refresh for movr.public.rides                      | CREATE STATISTICS __auto__ FROM [55] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2020-08-26 17:17:13.837398+00:00 | 2020-08-26 17:17:13.83881+00:00  | 2020-08-26 17:17:13.870263+00:00 | 2020-08-26 17:17:13.868936+00:00 |                  1 |       |              1
      584554361235341313 | AUTO CREATE STATS | Table statistics refresh for movr.public.users                      | CREATE STATISTICS __auto__ FROM [53] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2020-08-26 17:17:13.873091+00:00 | 2020-08-26 17:17:13.874499+00:00 | 2020-08-26 17:17:13.889308+00:00 | 2020-08-26 17:17:13.888625+00:00 |                  1 |       |              1
      584554361296388097 | AUTO CREATE STATS | Table statistics refresh for movr.public.promo_codes                | CREATE STATISTICS __auto__ FROM [57] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2020-08-26 17:17:13.89172+00:00  | 2020-08-26 17:17:13.893181+00:00 | 2020-08-26 17:17:13.912905+00:00 | 2020-08-26 17:17:13.912349+00:00 |                  1 |       |              1
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
