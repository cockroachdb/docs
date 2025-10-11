---
title: CREATE STATISTICS
summary: Use the CREATE STATISTICS statement to generate table statistics for the cost-based optimizer to use.
toc: true
---
Use the `CREATE STATISTICS` [statement](sql-statements.html) to generate table statistics for the [cost-based optimizer](cost-based-optimizer.html) to use.

Once you [create a table](create-table.html) and load data into it (e.g., [`INSERT`](insert.html), [`IMPORT`](import.html)), table statistics can be generated. Table statistics help the cost-based optimizer determine the cardinality of the rows used in each query, which helps to predict more accurate costs.

`CREATE STATISTICS` automatically figures out which columns to get statistics on &mdash; specifically, it chooses:

- Columns that are part of the primary key or an index (in other words, all indexed columns).
- Up to 100 non-indexed columns (unless you specify which columns to create statistics on, as shown in [this example](#create-statistics-on-a-specific-column)).

{{site.data.alerts.callout_info}}
<span class="version-tag">New in v19.1</span>: [Automatic statistics is enabled by default](cost-based-optimizer.html#table-statistics); most users do not need to issue `CREATE STATISTICS` statements directly.
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

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE STATISTICS students ON id FROM students_by_list;
~~~

{{site.data.alerts.callout_info}}
Multi-column statistics are not supported yet.
{{site.data.alerts.end}}

### Create statistics on a default set of columns

The `CREATE STATISTICS` statement shown below automatically figures out which columns to get statistics on &mdash; specifically, it chooses: 

- Columns that are part of the primary key or an index (in other words, all indexed columns).
- Up to 100 non-indexed columns.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE STATISTICS students FROM students_by_list;
~~~

### Create statistics as of a given time

To create statistics as of a given time (in this example, 1 minute ago to avoid interfering with the production workload), run a statement like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE STATISTICS employee_stats FROM employees AS OF SYSTEM TIME '-1m';
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
           job_id       |   job_type   |                           description                            | statement | user_name |  status   | running_status |          created           |          started           |          finished          |          modified          | fraction_completed | error | coordinator_id 
    --------------------+--------------+------------------------------------------------------------------+-----------+-----------+-----------+----------------+----------------------------+----------------------------+----------------------------+----------------------------+--------------------+-------+----------------
     441281249412743169 | CREATE STATS | CREATE STATISTICS salary_stats FROM employees.public.salaries    |           | root      | succeeded |                | 2019-04-08 15:52:30.040531 | 2019-04-08 15:52:30.046646 | 2019-04-08 15:52:32.757519 | 2019-04-08 15:52:32.757519 |                  1 |       |              1
     441281163978637313 | CREATE STATS | CREATE STATISTICS employee_stats FROM employees.public.employees |           | root      | succeeded |                | 2019-04-08 15:52:03.968099 | 2019-04-08 15:52:03.972557 | 2019-04-08 15:52:05.168809 | 2019-04-08 15:52:05.168809 |                  1 |       |              1
    (2 rows)
    ~~~

2. Use `SHOW AUTOMATIC JOBS` to see statistics jobs that were created by the [automatic statistics feature](cost-based-optimizer.html#table-statistics):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM [SHOW AUTOMATIC JOBS] WHERE job_type LIKE '%CREATE STATS%';
    ~~~

    ~~~
           job_id       |     job_type      |                        description                         |                                         statement                                         | user_name |  status   | running_status |          created           |          started           |          finished          |          modified          | fraction_completed | error | coordinator_id 
    --------------------+-------------------+------------------------------------------------------------+-------------------------------------------------------------------------------------------+-----------+-----------+----------------+----------------------------+----------------------------+----------------------------+----------------------------+--------------------+-------+----------------
     441280366254850049 | AUTO CREATE STATS | Table statistics refresh for employees.public.departments  | CREATE STATISTICS __auto__ FROM [55] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded |                | 2019-04-08 15:48:00.522119 | 2019-04-08 15:48:00.52663  | 2019-04-08 15:48:00.541608 | 2019-04-08 15:48:00.541608 |                  1 |       |              1
     441280364809289729 | AUTO CREATE STATS | Table statistics refresh for employees.public.titles       | CREATE STATISTICS __auto__ FROM [60] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded |                | 2019-04-08 15:48:00.080971 | 2019-04-08 15:48:00.083117 | 2019-04-08 15:48:00.515766 | 2019-04-08 15:48:00.515767 |                  1 |       |              1
     441280356286201857 | AUTO CREATE STATS | Table statistics refresh for employees.public.salaries     | CREATE STATISTICS __auto__ FROM [59] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded |                | 2019-04-08 15:47:57.479929 | 2019-04-08 15:47:57.482235 | 2019-04-08 15:48:00.075025 | 2019-04-08 15:48:00.075025 |                  1 |       |              1
     441280352161693697 | AUTO CREATE STATS | Table statistics refresh for employees.public.employees    | CREATE STATISTICS __auto__ FROM [58] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded |                | 2019-04-08 15:47:56.221223 | 2019-04-08 15:47:56.223664 | 2019-04-08 15:47:57.474159 | 2019-04-08 15:47:57.474159 |                  1 |       |              1
     441280352070434817 | AUTO CREATE STATS | Table statistics refresh for employees.public.dept_manager | CREATE STATISTICS __auto__ FROM [57] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded |                | 2019-04-08 15:47:56.193375 | 2019-04-08 15:47:56.195813 | 2019-04-08 15:47:56.215114 | 2019-04-08 15:47:56.215114 |                  1 |       |              1
     441280350791401473 | AUTO CREATE STATS | Table statistics refresh for employees.public.dept_emp     | CREATE STATISTICS __auto__ FROM [56] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded |                | 2019-04-08 15:47:55.803052 | 2019-04-08 15:47:55.806071 | 2019-04-08 15:47:56.187153 | 2019-04-08 15:47:56.187154 |                  1 |       |              1
     441279760786096129 | AUTO CREATE STATS | Table statistics refresh for test.public.kv                | CREATE STATISTICS __auto__ FROM [53] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded |                | 2019-04-08 15:44:55.747725 | 2019-04-08 15:44:55.754582 | 2019-04-08 15:44:55.775664 | 2019-04-08 15:44:55.775665 |                  1 |       |              1
    (7 rows)
    ~~~

## See Also

- [Cost-Based Optimizer](cost-based-optimizer.html)
- [`SHOW STATISTICS`](show-statistics.html)
- [`CREATE TABLE`](create-table.html)
- [`INSERT`](insert.html)
- [`IMPORT`](import.html)
- [`SHOW JOBS`](show-jobs.html)
- [SQL Statements](sql-statements.html)
