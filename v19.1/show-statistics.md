---
title: SHOW STATISTICS
summary: The SHOW STATISTICS statement lists table statistics.
toc: true
---
The `SHOW STATISTICS` [statement](sql-statements.html) lists [table statistics](create-statistics.html) used by the [cost-based optimizer](cost-based-optimizer.html).

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_stats.html %}
</div>

## Required Privileges

No [privileges](authorization.html#assign-privileges) are required to list table statistics.

## Parameters

Parameter      | Description
---------------+---------------
`table_name`   | The name of the table you want to view statistics for.

## Examples

### List table statistics

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE STATISTICS students ON id FROM students_by_list;
~~~

~~~
CREATE STATISTICS
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW STATISTICS FOR TABLE students_by_list;
~~~

~~~
  statistics_name | column_names |             created              | row_count | distinct_count | null_count | histogram_id
+-----------------+--------------+----------------------------------+-----------+----------------+------------+--------------+
  students        | {"id"}       | 2018-10-26 15:06:34.320165+00:00 |         0 |              0 |          0 |         NULL
(1 row)
~~~

### Delete statistics

{% include {{ page.version.version }}/misc/delete-statistics.md %}

## See Also

- [Cost-Based Optimizer](cost-based-optimizer.html)
- [`CREATE STATISTICS`](create-statistics.html)
- [`CREATE TABLE`](create-table.html)
- [`INSERT`](insert.html)
- [`IMPORT`](import.html)
- [SQL Statements](sql-statements.html)
