---
title: CREATE STATISTICS (Experimental)
summary: Use the CREATE STATISTICS statement to generate table statistics for the cost-based optimizer to use.
toc: true
---
<span class="version-tag">New in v2.1:</span> Use the `CREATE STATISTICS` [statement](sql-statements.html) to generate table statistics for the [cost-based optimizer](cost-based-optimizer.html) to use.

Once you [create a table](create-table.html) and load data into it (e.g., [`INSERT`](insert.html), [`IMPORT`](import.html)), table statistics can be generated. Table statistics help the cost-based optimizer determine the cardinality of the rows used in each query, which helps to predict more accurate costs.

{% include {{ page.version.version }}/misc/experimental-warning.md %}

## Considerations

Each time `CREATE STATISTICS` is used, a new statistic is created without removing any old statistics. To delete statistics for all tables in all databases, use [`DELETE`](#delete-all-statistics).

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/create_stats.html %}
</div>

## Required Privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the parent database.

## Parameters

Parameter            | Description
---------------------+--------------------------------------------------------------
`statistics_name`    | The name of the statistic you are creating.
`column_name`        | The name of the column you want to create the statistic for.
`table_name`         | The name of the table you want to create the statistic for.

## Examples

### Create statistics

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE STATISTICS students ON id FROM students_by_list;
~~~

~~~
CREATE STATISTICS
~~~

{{site.data.alerts.callout_info}}
Multi-column statistics are not supported yet.
{{site.data.alerts.end}}

### Delete all statistics

To delete statistics for all tables in all databases:

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM system.table_statistics WHERE true;
~~~

~~~
DELETE 1
~~~

For more information, see [`DELETE`](delete.html).

## See Also

- [Cost-Based Optimizer](cost-based-optimizer.html)
- [`SHOW STATISTICS`](show-statistics.html)
- [`CREATE TABLE`](create-table.html)
- [`INSERT`](insert.html)
- [`IMPORT`](import.html)
- [SQL Statements](sql-statements.html)
