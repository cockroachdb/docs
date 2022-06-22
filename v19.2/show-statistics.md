---
title: SHOW STATISTICS
summary: The SHOW STATISTICS statement lists table statistics.
toc: true
---
The `SHOW STATISTICS` [statement](sql-statements.html) lists [table statistics](create-statistics.html) used by the [cost-based optimizer](cost-based-optimizer.html).

{{site.data.alerts.callout_info}}
[By default, CockroachDB automatically generates statistics](cost-based-optimizer.html#table-statistics) on all indexed columns, and up to 100 non-indexed columns.
{{site.data.alerts.end}}

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

{% include {{page.version.version}}/sql/movr-statements.md %}

### List table statistics

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW STATISTICS FOR TABLE rides;
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
