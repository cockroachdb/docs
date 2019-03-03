---
title: CREATE STATISTICS
summary: Use the CREATE STATISTICS statement to generate table statistics for the cost-based optimizer to use.
toc: true
redirect_from: /v2.2/create-statistics.html
---
Use the `CREATE STATISTICS` [statement](sql-statements.html) to generate table statistics for the [cost-based optimizer](cost-based-optimizer.html) to use.

Once you [create a table](create-table.html) and load data into it (e.g., [`INSERT`](insert.html), [`IMPORT`](import.html)), table statistics can be generated. Table statistics help the cost-based optimizer determine the cardinality of the rows used in each query, which helps to predict more accurate costs.

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

### Automatic table statistics

{% include {{ page.version.version }}/misc/automatic-statistics.md %}

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

Every time the `CREATE STATISTICS` statement is executed, it kicks off a background job.  This is true for queries issued by your application as well as queries issued by the [automatic stats](#automatic-table-statistics) feature.

To view statistics jobs, issue the following query that uses [`SHOW JOBS`](show-jobs.html).

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW JOBS] WHERE job_type LIKE '%CREATE STATS%';
~~~

~~~
       job_id       |   job_type   |                                     description                                     | user_name |  status   | running_status |          created           |          started           |          finished          |          modified          | fraction_completed | error | coordinator_id 
--------------------+--------------+-------------------------------------------------------------------------------------+-----------+-----------+----------------+----------------------------+----------------------------+----------------------------+----------------------------+--------------------+-------+----------------
 429997863416791041 | CREATE STATS | CREATE STATISTICS employee_stats FROM test.public.employees AS OF SYSTEM TIME '-1m' | root      | succeeded |                | 2019-02-27 19:22:13.904065 | 2019-02-27 19:22:13.909684 | 2019-02-27 19:22:14.203006 | 2019-02-27 19:22:14.203007 |                  1 |       |              1
 429996681838297089 | CREATE STATS | CREATE STATISTICS __auto__ FROM [67] AS OF SYSTEM TIME '-30s'                       | root      | succeeded |                | 2019-02-27 19:16:13.314916 | 2019-02-27 19:16:13.317949 | 2019-02-27 19:16:13.63022  | 2019-02-27 19:16:13.630221 |                  1 |       |              1
 429996676782456833 | CREATE STATS | CREATE STATISTICS __auto__ FROM [66] AS OF SYSTEM TIME '-30s'                       | root      | succeeded |                | 2019-02-27 19:16:11.771999 | 2019-02-27 19:16:11.775159 | 2019-02-27 19:16:13.308078 | 2019-02-27 19:16:13.308079 |                  1 |       |              1
 429996676018601985 | CREATE STATS | CREATE STATISTICS __auto__ FROM [65] AS OF SYSTEM TIME '-30s'                       | root      | succeeded |                | 2019-02-27 19:16:11.538883 | 2019-02-27 19:16:11.542195 | 2019-02-27 19:16:11.762671 | 2019-02-27 19:16:11.762672 |                  1 |       |              1
~~~

## See Also

- [Cost-Based Optimizer](cost-based-optimizer.html)
- [`SHOW STATISTICS`](show-statistics.html)
- [`CREATE TABLE`](create-table.html)
- [`INSERT`](insert.html)
- [`IMPORT`](import.html)
- [`SHOW JOBS`](show-jobs.html)
- [SQL Statements](sql-statements.html)
