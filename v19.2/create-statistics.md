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
+-----------------+-----------------+----------------------------------+-----------+----------------+------------+--------------------+
  __auto__        | {city}          | 2020-08-26 17:24:25.334218+00:00 |       500 |              9 |          0 | 584555775053725697
  __auto__        | {vehicle_city}  | 2020-08-26 17:24:25.334218+00:00 |       500 |              9 |          0 | 584555775060344833
  __auto__        | {id}            | 2020-08-26 17:24:25.334218+00:00 |       500 |            500 |          0 |               NULL
  __auto__        | {rider_id}      | 2020-08-26 17:24:25.334218+00:00 |       500 |             50 |          0 |               NULL
  __auto__        | {vehicle_id}    | 2020-08-26 17:24:25.334218+00:00 |       500 |             15 |          0 |               NULL
  __auto__        | {start_address} | 2020-08-26 17:24:25.334218+00:00 |       500 |            500 |          0 |               NULL
  __auto__        | {end_address}   | 2020-08-26 17:24:25.334218+00:00 |       500 |            500 |          0 |               NULL
  __auto__        | {start_time}    | 2020-08-26 17:24:25.334218+00:00 |       500 |             30 |          0 |               NULL
  __auto__        | {end_time}      | 2020-08-26 17:24:25.334218+00:00 |       500 |            367 |          0 |               NULL
  __auto__        | {revenue}       | 2020-08-26 17:24:25.334218+00:00 |       500 |            100 |          0 |               NULL
  revenue_stats   | {revenue}       | 2020-08-26 17:24:34.494008+00:00 |       500 |            100 |          0 | 584555805068886017
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
+-----------------+---------------+----------------------------------+-----------+----------------+------------+--------------------+
  __auto__        | {city}        | 2020-08-26 17:24:25.305468+00:00 |        50 |              9 |          0 | 584555774958108673
  __auto__        | {id}          | 2020-08-26 17:24:25.305468+00:00 |        50 |             50 |          0 |               NULL
  __auto__        | {name}        | 2020-08-26 17:24:25.305468+00:00 |        50 |             49 |          0 |               NULL
  __auto__        | {address}     | 2020-08-26 17:24:25.305468+00:00 |        50 |             50 |          0 |               NULL
  __auto__        | {credit_card} | 2020-08-26 17:24:25.305468+00:00 |        50 |             50 |          0 |               NULL
  users_stats     | {city}        | 2020-08-26 17:24:53.49405+00:00  |        50 |              9 |          0 | 584555867327430657
  users_stats     | {id}          | 2020-08-26 17:24:53.49405+00:00  |        50 |             50 |          0 |               NULL
  users_stats     | {name}        | 2020-08-26 17:24:53.49405+00:00  |        50 |             49 |          0 |               NULL
  users_stats     | {address}     | 2020-08-26 17:24:53.49405+00:00  |        50 |             50 |          0 |               NULL
  users_stats     | {credit_card} | 2020-08-26 17:24:53.49405+00:00  |        50 |             50 |          0 |               NULL
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
    +--------------------+--------------+--------------------------------------------------------------------------------------------------+-----------+-----------+-----------+----------------+----------------------------------+----------------------------------+----------------------------------+----------------------------------+--------------------+-------+----------------+
      584555805032710145 | CREATE STATS | CREATE STATISTICS revenue_stats ON revenue FROM movr.public.rides                                |           | root      | succeeded | NULL           | 2020-08-26 17:24:34.485089+00:00 | 2020-08-26 17:24:34.487231+00:00 | 2020-08-26 17:24:34.49702+00:00  | 2020-08-26 17:24:34.496442+00:00 |                  1 |       |              1
      584555867287060481 | CREATE STATS | CREATE STATISTICS users_stats FROM movr.public.users                                             |           | root      | succeeded | NULL           | 2020-08-26 17:24:53.483605+00:00 | 2020-08-26 17:24:53.486025+00:00 | 2020-08-26 17:24:53.505254+00:00 | 2020-08-26 17:24:53.504697+00:00 |                  1 |       |              1
      584555915664261121 | CREATE STATS | CREATE STATISTICS vehicle_stats_1 FROM movr.public.vehicles WITH OPTIONS AS OF SYSTEM TIME '-1m' |           | root      | succeeded | NULL           | 2020-08-26 17:25:08.247163+00:00 | 2020-08-26 17:25:08.252334+00:00 | 2020-08-26 17:25:08.27947+00:00  | 2020-08-26 17:25:08.278204+00:00 |                  1 |       |              1
    (3 rows)
    ~~~

2. Use `SHOW AUTOMATIC JOBS` to see statistics jobs that were created by the [automatic statistics feature](cost-based-optimizer.html#table-statistics):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM [SHOW AUTOMATIC JOBS] WHERE job_type LIKE '%CREATE STATS%';
    ~~~

    ~~~
            job_id       |     job_type      |                             description                             |                                         statement                                         | user_name |  status   | running_status |             created              |             started              |             finished             |             modified             | fraction_completed | error | coordinator_id
    +--------------------+-------------------+---------------------------------------------------------------------+-------------------------------------------------------------------------------------------+-----------+-----------+----------------+----------------------------------+----------------------------------+----------------------------------+----------------------------------+--------------------+-------+----------------+
      584555774723129345 | AUTO CREATE STATS | Table statistics refresh for movr.public.promo_codes                | CREATE STATISTICS __auto__ FROM [57] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2020-08-26 17:24:25.23534+00:00  | 2020-08-26 17:24:25.237261+00:00 | 2020-08-26 17:24:25.258822+00:00 | 2020-08-26 17:24:25.258199+00:00 |                  1 |       |              1
      584555774808096769 | AUTO CREATE STATS | Table statistics refresh for movr.public.vehicles                   | CREATE STATISTICS __auto__ FROM [54] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2020-08-26 17:24:25.261267+00:00 | 2020-08-26 17:24:25.263309+00:00 | 2020-08-26 17:24:25.292766+00:00 | 2020-08-26 17:24:25.292114+00:00 |                  1 |       |              1
      584555774921211905 | AUTO CREATE STATS | Table statistics refresh for movr.public.users                      | CREATE STATISTICS __auto__ FROM [53] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2020-08-26 17:24:25.295787+00:00 | 2020-08-26 17:24:25.297427+00:00 | 2020-08-26 17:24:25.31669+00:00  | 2020-08-26 17:24:25.315689+00:00 |                  1 |       |              1
      584555775000444929 | AUTO CREATE STATS | Table statistics refresh for movr.public.rides                      | CREATE STATISTICS __auto__ FROM [55] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2020-08-26 17:24:25.31997+00:00  | 2020-08-26 17:24:25.322527+00:00 | 2020-08-26 17:24:25.35465+00:00  | 2020-08-26 17:24:25.353909+00:00 |                  1 |       |              1
      584555775125815297 | AUTO CREATE STATS | Table statistics refresh for movr.public.user_promo_codes           | CREATE STATISTICS __auto__ FROM [58] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2020-08-26 17:24:25.35823+00:00  | 2020-08-26 17:24:25.35987+00:00  | 2020-08-26 17:24:25.380727+00:00 | 2020-08-26 17:24:25.380128+00:00 |                  1 |       |              1
      584555775206588417 | AUTO CREATE STATS | Table statistics refresh for movr.public.vehicle_location_histories | CREATE STATISTICS __auto__ FROM [56] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | NULL           | 2020-08-26 17:24:25.382874+00:00 | 2020-08-26 17:24:25.384203+00:00 | 2020-08-26 17:24:25.405608+00:00 | 2020-08-26 17:24:25.404834+00:00 |                  1 |       |              1
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
