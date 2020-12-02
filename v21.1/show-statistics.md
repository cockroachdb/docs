---
title: SHOW STATISTICS
summary: The SHOW STATISTICS statement lists table statistics.
toc: true
---
The `SHOW STATISTICS` [statement](sql-statements.html) lists [table statistics](create-statistics.html) used by the [cost-based optimizer](cost-based-optimizer.html).

{{site.data.alerts.callout_info}}
[By default, CockroachDB automatically generates statistics](cost-based-optimizer.html#table-statistics) on all indexed columns, and up to 100 non-indexed columns.

 CockroachDB also automatically collects [multi-column statistics](create-statistics.html#create-statistics-on-multiple-columns) on the columns that prefix each index.
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

{% include copy-clipboard.html %}
~~~ sql
> SHOW STATISTICS FOR TABLE rides;
~~~

~~~
  statistics_name |       column_names        |             created              | row_count | distinct_count | null_count |    histogram_id
------------------+---------------------------+----------------------------------+-----------+----------------+------------+---------------------
  __auto__        | {city}                    | 2020-08-26 16:55:24.725089+00:00 |       500 |              9 |          0 | 584550071425531905
  __auto__        | {id}                      | 2020-08-26 16:55:24.725089+00:00 |       500 |            500 |          0 | 584550071432740865
  __auto__        | {city,id}                 | 2020-08-26 16:55:24.725089+00:00 |       500 |            500 |          0 |               NULL
  __auto__        | {rider_id}                | 2020-08-26 16:55:24.725089+00:00 |       500 |             50 |          0 | 584550071446732801
  __auto__        | {city,rider_id}           | 2020-08-26 16:55:24.725089+00:00 |       500 |             50 |          0 |               NULL
  __auto__        | {vehicle_city}            | 2020-08-26 16:55:24.725089+00:00 |       500 |              9 |          0 | 584550071461019649
  __auto__        | {vehicle_id}              | 2020-08-26 16:55:24.725089+00:00 |       500 |             15 |          0 | 584550071467966465
  __auto__        | {vehicle_city,vehicle_id} | 2020-08-26 16:55:24.725089+00:00 |       500 |             15 |          0 |               NULL
  __auto__        | {start_address}           | 2020-08-26 16:55:24.725089+00:00 |       500 |            500 |          0 | 584550071482122241
  __auto__        | {end_address}             | 2020-08-26 16:55:24.725089+00:00 |       500 |            500 |          0 | 584550071489167361
  __auto__        | {start_time}              | 2020-08-26 16:55:24.725089+00:00 |       500 |             30 |          0 | 584550071496671233
  __auto__        | {end_time}                | 2020-08-26 16:55:24.725089+00:00 |       500 |            367 |          0 | 584550071504437249
  __auto__        | {revenue}                 | 2020-08-26 16:55:24.725089+00:00 |       500 |            100 |          0 | 584550071512137729
(13 rows)
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
