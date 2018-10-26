---
title: SHOW STATISTICS (Experimental)
summary: The SHOW STATISTICS statement lists table statistics.
toc: true
---
<span class="version-tag">New in v2.1:</span> The `SHOW STATISTICS` [statement](sql-statements.html) lists [table statistics](create-statistics.html) used by the [cost-based optimizer](cost-based-optimizer.html).

{% include {{ page.version.version }}/misc/experimental-warning.md %}

## Synopsis

~~~ sql
> SHOW STATISTICS [USING JSON] FOR TABLE <table_name>
~~~

## Required Privileges

No [privileges](privileges.html) are required to list table statistics.

## Parameters

Parameter      | Description
---------------+---------------
`table_name`   | The name of the table you want to create the statistic for.

## Examples

### List table statistics

{% include copy-clipboard.html %}
~~~ sql
> SHOW STATISTICS FOR TABLE students_by_list;
~~~

~~~
  table_name | column_names |             created              | row_count | distinct_count | null_count | histogram_id
+------------+--------------+----------------------------------+-----------+----------------+------------+--------------+
  test       | {"id"}       | 2018-10-26 15:06:34.320165+00:00 |         0 |              0 |          0 |         NULL
(1 row)
~~~

### List table statistics in JSON

{% include copy-clipboard.html %}
~~~ sql
> SHOW STATISTICS USING JSON FOR TABLE students_by_list;
~~~

~~~
                                                                                          statistics
+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
  [{"columns": ["id"], "created_at": "2018-10-26 15:06:34.320165+00:00", "distinct_count": 0, "histo_buckets": null, "histo_col_type": "", "name": "test", "null_count": 0, "row_count": 0}]
(1 row)
~~~

## See Also

- [Cost-Based Optimizer](cost-based-optimizer.html)
- [`CREATE STATISTICS`](create-statistics.html)
- [`CREATE TABLE`](create-table.html)
- [`INSERT`](insert.html)
- [`IMPORT`](import.html)
- [SQL Statements](sql-statements.html)
