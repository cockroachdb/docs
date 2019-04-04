---
title: CREATE STATISTICS
summary: Use the CREATE STATISTICS statement to generate table statistics for the cost-based optimizer to use.
toc: true
---
Use the `CREATE STATISTICS` [statement](sql-statements.html) to generate table statistics for the [cost-based optimizer](cost-based-optimizer.html) to use.

Once you [create a table](create-table.html) and load data into it (e.g., [`INSERT`](insert.html), [`IMPORT`](import.html)), table statistics can be generated. Table statistics help the cost-based optimizer determine the cardinality of the rows used in each query, which helps to predict more accurate costs.

`CREATE STATISTICS` automatically figures out which columns to get statistics on &mdash; specifically, it chooses:

- Columns that are part of the primary key or an index (in other words, all indexed columns).
- Up to 100 non-indexed columns.

{{site.data.alerts.callout_info}}
<span class="version-tag">New in v19.1</span>: [Automatic statistics is enabled by default](cost-based-optimizer.html#table-statistics); most users don't need to issue `CREATE STATISTICS` statements directly.
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

### Create statistics on a specific column

{% include copy-clipboard.html %}
~~~ sql
> CREATE STATISTICS students ON id FROM students_by_list;
~~~

{{site.data.alerts.callout_info}}
Multi-column statistics are not supported yet.
{{site.data.alerts.end}}

### Create statistics on a default set of columns

The `CREATE STATISTICS` statement shown below automatically figures out which columns to get statistics on &mdash; specifically, it chooses columns which are part of the primary key and/or an index.

{% include copy-clipboard.html %}
~~~ sql
> CREATE STATISTICS students FROM students_by_list;
~~~

### Create statistics as of a given time

To create statistics as of a given time (in this example, 1 minute ago to avoid interfering with the production workload), run a statement like the following:

{% include copy-clipboard.html %}
~~~ sql
> CREATE STATISTICS employee_stats FROM employees AS OF SYSTEM TIME '-1m';
~~~

For more information about how the `AS OF SYSTEM TIME` clause works, including supported time formats, see [`AS OF SYSTEM TIME`](as-of-system-time.html).

### Delete statistics

{% include {{ page.version.version }}/misc/delete-statistics.md %}

### View statistics jobs

Every time the `CREATE STATISTICS` statement is executed, it kicks off a background job. This is true for queries issued by your application as well as queries issued by the [automatic stats feature](cost-based-optimizer.html#table-statistics).

To view statistics jobs, issue the following query that uses [`SHOW JOBS`](show-jobs.html).

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW JOBS] WHERE job_type LIKE '%CREATE STATS%';
~~~

~~~
       job_id       |     job_type      |                     description                     |                           statement                           | user_name |  status   | running_status |          created           |          started           |          finished          |          modified          | fraction_completed | error | coordinator_id 
--------------------+-------------------+-----------------------------------------------------+---------------------------------------------------------------+-----------+-----------+----------------+----------------------------+----------------------------+----------------------------+----------------------------+--------------------+-------+----------------
 440126573959512065 | AUTO CREATE STATS | Table statistics refresh for tpcc.public.order_line | CREATE STATISTICS __auto__ FROM [61] AS OF SYSTEM TIME '-30s' | root      | succeeded |                | 2019-04-04 13:59:31.056986 | 2019-04-04 13:59:31.059442 | 2019-04-04 13:59:40.975497 | 2019-04-04 13:59:40.975498 |                  1 |       |              1
 440126554231275521 | AUTO CREATE STATS | Table statistics refresh for tpcc.public.stock      | CREATE STATISTICS __auto__ FROM [60] AS OF SYSTEM TIME '-30s' | root      | succeeded |                | 2019-04-04 13:59:25.036411 | 2019-04-04 13:59:25.040731 | 2019-04-04 13:59:31.053151 | 2019-04-04 13:59:31.053151 |                  1 |       |              1
 440126352196435969 | AUTO CREATE STATS | Table statistics refresh for tpcc.public.history    | CREATE STATISTICS __auto__ FROM [56] AS OF SYSTEM TIME '-30s' | root      | succeeded |                | 2019-04-04 13:58:23.380263 | 2019-04-04 13:58:23.384597 | 2019-04-04 13:58:25.023725 | 2019-04-04 13:58:25.023726 |                  1 |       |              1
 440126345266462721 | AUTO CREATE STATS | Table statistics refresh for tpcc.public.item       | CREATE STATISTICS __auto__ FROM [59] AS OF SYSTEM TIME '-30s' | root      | succeeded |                | 2019-04-04 13:58:21.265405 | 2019-04-04 13:58:21.267658 | 2019-04-04 13:58:23.377281 | 2019-04-04 13:58:23.377281 |                  1 |       |              1
 440126345144532993 | AUTO CREATE STATS | Table statistics refresh for tpcc.public.warehouse  | CREATE STATISTICS __auto__ FROM [53] AS OF SYSTEM TIME '-30s' | root      | succeeded |                | 2019-04-04 13:58:21.228193 | 2019-04-04 13:58:21.230397 | 2019-04-04 13:58:21.262612 | 2019-04-04 13:58:21.262613 |                  1 |       |              1
 440126333637033985 | AUTO CREATE STATS | Table statistics refresh for tpcc.public.customer   | CREATE STATISTICS __auto__ FROM [55] AS OF SYSTEM TIME '-30s' | root      | succeeded |                | 2019-04-04 13:58:17.716385 | 2019-04-04 13:58:17.718692 | 2019-04-04 13:58:21.225282 | 2019-04-04 13:58:21.225282 |                  1 |       |              1
 440126328489476097 | AUTO CREATE STATS | Table statistics refresh for tpcc.public."order"    | CREATE STATISTICS __auto__ FROM [57] AS OF SYSTEM TIME '-30s' | root      | succeeded |                | 2019-04-04 13:58:16.145472 | 2019-04-04 13:58:16.148248 | 2019-04-04 13:58:17.713295 | 2019-04-04 13:58:17.713295 |                  1 |       |              1
 440126319591227393 | AUTO CREATE STATS | Table statistics refresh for tpcc.public.stock      | CREATE STATISTICS __auto__ FROM [60] AS OF SYSTEM TIME '-30s' | root      | succeeded |                | 2019-04-04 13:58:13.429948 | 2019-04-04 13:58:13.43343  | 2019-04-04 13:58:16.142435 | 2019-04-04 13:58:16.142436 |                  1 |       |              1
 440126319390261249 | AUTO CREATE STATS | Table statistics refresh for tpcc.public.district   | CREATE STATISTICS __auto__ FROM [54] AS OF SYSTEM TIME '-30s' | root      | succeeded |                | 2019-04-04 13:58:13.368614 | 2019-04-04 13:58:13.373541 | 2019-04-04 13:58:13.426379 | 2019-04-04 13:58:13.42638  |                  1 |       |              1
 440126319248474113 | AUTO CREATE STATS | Table statistics refresh for tpcc.public.new_order  | CREATE STATISTICS __auto__ FROM [58] AS OF SYSTEM TIME '-30s' | root      | succeeded |                | 2019-04-04 13:58:13.325351 | 2019-04-04 13:58:13.330711 | 2019-04-04 13:58:13.363199 | 2019-04-04 13:58:13.3632   |                  1 |       |              1
(10 rows)
~~~

## See Also

- [Cost-Based Optimizer](cost-based-optimizer.html)
- [`SHOW STATISTICS`](show-statistics.html)
- [`CREATE TABLE`](create-table.html)
- [`INSERT`](insert.html)
- [`IMPORT`](import.html)
- [`SHOW JOBS`](show-jobs.html)
- [SQL Statements](sql-statements.html)
