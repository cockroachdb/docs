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
(10 rows)
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
