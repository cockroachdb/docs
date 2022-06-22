---
title: SHOW STATISTICS
summary: The SHOW STATISTICS statement lists table statistics.
toc: true
---
The `SHOW STATISTICS` [statement](sql-statements.html) lists [table statistics](create-statistics.html) used by the [cost-based optimizer](cost-based-optimizer.html).

By default, CockroachDB [automatically generates statistics](cost-based-optimizer.html#table-statistics) on all indexed columns and up to 100 non-indexed columns, and automatically collects [multi-column statistics](create-statistics.html#create-statistics-on-multiple-columns) on the columns that prefix each index.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/show_stats.html %}
</div>

## Required Privileges

No [privileges](security-reference/authorization.html#managing-privileges) are required to list table statistics.

## Parameters

Parameter      | Description
---------------+---------------
`table_name`   | The name of the table to view statistics for.

## Output

| Column | Description |
|-----------|-------------|
| `statistics_name` | The name of the statistics. If `__auto__`, the statistics were created automatically. |
| `column_names` | The name of the columns on which the statistics were created. |
| `created` | The timestamp when the statistics were created. |
| `row_count` | The number of rows for which the statistics were computed. |
| `distinct_count` |  The number of distinct values for which the statistics were computed. |
| `null_count` |  The number of null values for which the statistics were computed.  |
| `avg_size` |  **New in v22.1:** The average size in bytes of the values of the columns for which the statistics were computed. |
| `histogram_id` |  The ID of the [histogram](cost-based-optimizer.html#control-histogram-collection) used to compute statistics. |

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### List table statistics

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW STATISTICS FOR TABLE rides;
~~~

~~~
  statistics_name |       column_names        |          created           | row_count | distinct_count | null_count | avg_size |    histogram_id
------------------+---------------------------+----------------------------+-----------+----------------+------------+----------+---------------------
  __auto__        | {city}                    | 2022-04-20 22:43:08.851613 |       500 |              9 |          0 |       12 | 755053982033936385
  __auto__        | {id}                      | 2022-04-20 22:43:08.851613 |       500 |            500 |          0 |       26 | 755053982039703553
  __auto__        | {city,id}                 | 2022-04-20 22:43:08.851613 |       500 |            500 |          0 |       37 |               NULL
  __auto__        | {rider_id}                | 2022-04-20 22:43:08.851613 |       500 |             50 |          0 |       17 | 755053982050910209
  __auto__        | {city,rider_id}           | 2022-04-20 22:43:08.851613 |       500 |             50 |          0 |       29 |               NULL
  __auto__        | {vehicle_city}            | 2022-04-20 22:43:08.851613 |       500 |              9 |          0 |       11 | 755053982061690881
  __auto__        | {vehicle_id}              | 2022-04-20 22:43:08.851613 |       500 |             15 |          0 |       17 | 755053982067392513
  __auto__        | {vehicle_city,vehicle_id} | 2022-04-20 22:43:08.851613 |       500 |             15 |          0 |       28 |               NULL
  __auto__        | {start_address}           | 2022-04-20 22:43:08.851613 |       500 |            500 |          0 |       25 | 755053982080991233
  __auto__        | {end_address}             | 2022-04-20 22:43:08.851613 |       500 |            500 |          0 |       25 | 755053982087544833
  __auto__        | {start_time}              | 2022-04-20 22:43:08.851613 |       500 |             30 |          0 |        7 | 755053982093443073
  __auto__        | {end_time}                | 2022-04-20 22:43:08.851613 |       500 |            367 |          0 |        7 | 755053982099472385
  __auto__        | {revenue}                 | 2022-04-20 22:43:08.851613 |       500 |            100 |          0 |        6 | 755053982105337857
(13 rows)
~~~

### Delete statistics

{% include {{ page.version.version }}/misc/delete-statistics.md %}

## See also

- [Cost-Based Optimizer](cost-based-optimizer.html)
- [`CREATE STATISTICS`](create-statistics.html)
- [`CREATE TABLE`](create-table.html)
- [`INSERT`](insert.html)
- [`IMPORT`](import.html)
- [SQL Statements](sql-statements.html)
