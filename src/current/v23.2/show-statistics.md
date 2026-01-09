---
title: SHOW STATISTICS
summary: The SHOW STATISTICS statement lists table statistics.
toc: true
---

The `SHOW STATISTICS` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists [table statistics]({% link {{ page.version.version }}/create-statistics.md %}) used by the [cost-based optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}).

By default, CockroachDB [automatically generates statistics]({% link {{ page.version.version }}/cost-based-optimizer.md %}#table-statistics) on all indexed columns and up to 100 non-indexed columns, and automatically collects [multi-column statistics]({% link {{ page.version.version }}/create-statistics.md %}#create-statistics-on-multiple-columns) on the columns that prefix each index.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_stats.html %}
</div>

## Required Privileges

To list table statistics, the user must have any [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the table being inspected.

## Parameters

Parameter      | Description
---------------+---------------
`table_name`   | The name of the table to view statistics for.
`opt_with_options` | Control the behavior of `SHOW STATISTICS` with [these options](#options).

### Options

|   Option   | Value |                                                Description                                                |
|------------|-------|-----------------------------------------------------------------------------------------------------------|
| `FORECAST` | N/A   | [Display forecasted statistics](#display-forecasted-statistics) along with the existing table statistics. |

## Output

| Column | Description |
|-----------|-------------|
| `statistics_name` | The name of the statistics. If `__auto__`, the statistics were created automatically. If `__forecast__`, the statistics are [forecasted](#display-forecasted-statistics). |
| `column_names` | The name of the columns on which the statistics were created. |
| `created` | The [`timestamptz`]({% link {{ page.version.version }}/timestamp.md %}) when the statistics were created. |
| `row_count` | The number of rows for which the statistics were computed. |
| `distinct_count` |  The number of distinct values for which the statistics were computed. |
| `null_count` |  The number of null values for which the statistics were computed.  |
| `avg_size` |  The average size in bytes of the values of the columns for which the statistics were computed. |
| `histogram_id` |  The ID of the [histogram]({% link {{ page.version.version }}/cost-based-optimizer.md %}#control-histogram-collection) used to compute statistics. |

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
  __auto__        | {id}                      | 2022-09-22 16:45:29.957103 |       500 |            500 |          0 |       26 | 798866571146067969
  __auto__        | {id,city}                 | 2022-09-22 16:45:29.957103 |       500 |            500 |          0 |       37 |               NULL
  __auto__        | {city}                    | 2022-09-22 16:45:29.957103 |       500 |              9 |          0 |       12 | 798866571134304257
  __auto__        | {city,rider_id}           | 2022-09-22 16:45:29.957103 |       500 |             50 |          0 |       29 |               NULL
  __auto__        | {vehicle_city}            | 2022-09-22 16:45:29.957103 |       500 |              9 |          0 |       11 | 798866571197153281
  __auto__        | {vehicle_city,vehicle_id} | 2022-09-22 16:45:29.957103 |       500 |             15 |          0 |       28 |               NULL
  __auto__        | {rider_id}                | 2022-09-22 16:45:29.957103 |       500 |             50 |          0 |       17 | 798866571173724161
  __auto__        | {vehicle_id}              | 2022-09-22 16:45:29.957103 |       500 |             15 |          0 |       17 | 798866571208720385
  __auto__        | {start_address}           | 2022-09-22 16:45:29.957103 |       500 |            500 |          0 |       25 | 798866571232575489
  __auto__        | {end_address}             | 2022-09-22 16:45:29.957103 |       500 |            500 |          0 |       25 | 798866571245191169
  __auto__        | {start_time}              | 2022-09-22 16:45:29.957103 |       500 |             30 |          0 |        7 | 798866571257315329
  __auto__        | {end_time}                | 2022-09-22 16:45:29.957103 |       500 |            367 |          0 |        7 | 798866571269537793
  __auto__        | {revenue}                 | 2022-09-22 16:45:29.957103 |       500 |            100 |          0 |        6 | 798866571283103745
(13 rows)
~~~

### Display forecasted statistics

The `WITH FORECAST` option calculates and displays [forecasted statistics]({% link {{ page.version.version }}/cost-based-optimizer.md %}#forecasted-statistics) along with the existing table statistics.

The following example shows 3 historical statistics collections and the subsequent forecast:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW STATISTICS FOR TABLE rides WITH FORECAST;
~~~

~~~
  statistics_name |       column_names        |          created           | row_count | distinct_count | null_count | avg_size |    histogram_id
------------------+---------------------------+----------------------------+-----------+----------------+------------+----------+---------------------
  __auto__        | {id}                      | 2022-09-22 18:57:19.254073 |       500 |            500 |          0 |       26 | 798892488327364609
  __auto__        | {id,city}                 | 2022-09-22 18:57:19.254073 |       500 |            500 |          0 |       37 |               NULL
  __auto__        | {city}                    | 2022-09-22 18:57:19.254073 |       500 |              9 |          0 |       12 | 798892488315830273
  __auto__        | {city,rider_id}           | 2022-09-22 18:57:19.254073 |       500 |             50 |          0 |       29 |               NULL
  __auto__        | {vehicle_city}            | 2022-09-22 18:57:19.254073 |       500 |              9 |          0 |       11 | 798892488400011265
  __auto__        | {vehicle_city,vehicle_id} | 2022-09-22 18:57:19.254073 |       500 |             15 |          0 |       28 |               NULL
  __auto__        | {rider_id}                | 2022-09-22 18:57:19.254073 |       500 |             50 |          0 |       17 | 798892488351875073
  __auto__        | {vehicle_id}              | 2022-09-22 18:57:19.254073 |       500 |             15 |          0 |       17 | 798892488412004353
  __auto__        | {start_address}           | 2022-09-22 18:57:19.254073 |       500 |            500 |          0 |       25 | 798892488436908033
  __auto__        | {end_address}             | 2022-09-22 18:57:19.254073 |       500 |            500 |          0 |       25 | 798892488447590401
  __auto__        | {start_time}              | 2022-09-22 18:57:19.254073 |       500 |             30 |          0 |        7 | 798892488458928129
  __auto__        | {end_time}                | 2022-09-22 18:57:19.254073 |       500 |            367 |          0 |        7 | 798892488472920065
  __auto__        | {revenue}                 | 2022-09-22 18:57:19.254073 |       500 |            100 |          0 |        6 | 798892488485011457
  __auto__        | {id}                      | 2022-09-22 19:35:13.274435 |       500 |            500 |          0 |       26 | 798899939842326529
  __auto__        | {id,city}                 | 2022-09-22 19:35:13.274435 |       500 |            500 |          0 |       37 |               NULL
  __auto__        | {city}                    | 2022-09-22 19:35:13.274435 |       500 |              9 |          0 |       12 | 798899939828039681
  __auto__        | {city,rider_id}           | 2022-09-22 19:35:13.274435 |       500 |             50 |          0 |       29 |               NULL
  __auto__        | {vehicle_city}            | 2022-09-22 19:35:13.274435 |       500 |              9 |          0 |       11 | 798899939903963137
  __auto__        | {vehicle_city,vehicle_id} | 2022-09-22 19:35:13.274435 |       500 |             15 |          0 |       28 |               NULL
  __auto__        | {rider_id}                | 2022-09-22 19:35:13.274435 |       500 |             50 |          0 |       17 | 798899939874242561
  __auto__        | {vehicle_id}              | 2022-09-22 19:35:13.274435 |       500 |             15 |          0 |       17 | 798899939921068033
  __auto__        | {start_address}           | 2022-09-22 19:35:13.274435 |       500 |            500 |          0 |       25 | 798899939972808705
  __auto__        | {end_address}             | 2022-09-22 19:35:13.274435 |       500 |            500 |          0 |       25 | 798899939987783681
  __auto__        | {start_time}              | 2022-09-22 19:35:13.274435 |       500 |             30 |          0 |        7 | 798899939956031489
  __auto__        | {end_time}                | 2022-09-22 19:35:13.274435 |       500 |            367 |          0 |        7 | 798899940003348481
  __auto__        | {revenue}                 | 2022-09-22 19:35:13.274435 |       500 |            100 |          0 |        6 | 798899940018978817
  __auto__        | {id}                      | 2022-09-22 19:37:13.395095 |       500 |            500 |          0 |       26 | 798900333460258817
  __auto__        | {id,city}                 | 2022-09-22 19:37:13.395095 |       500 |            500 |          0 |       37 |               NULL
  __auto__        | {city}                    | 2022-09-22 19:37:13.395095 |       500 |              9 |          0 |       12 | 798900333442203649
  __auto__        | {city,rider_id}           | 2022-09-22 19:37:13.395095 |       500 |             50 |          0 |       29 |               NULL
  __auto__        | {vehicle_city}            | 2022-09-22 19:37:13.395095 |       500 |              9 |          0 |       11 | 798900333525762049
  __auto__        | {vehicle_city,vehicle_id} | 2022-09-22 19:37:13.395095 |       500 |             15 |          0 |       28 |               NULL
  __auto__        | {rider_id}                | 2022-09-22 19:37:13.395095 |       500 |             50 |          0 |       17 | 798900333491945473
  __auto__        | {vehicle_id}              | 2022-09-22 19:37:13.395095 |       500 |             15 |          0 |       17 | 798900333540900865
  __auto__        | {start_address}           | 2022-09-22 19:37:13.395095 |       500 |            500 |          0 |       25 | 798900333573799937
  __auto__        | {end_address}             | 2022-09-22 19:37:13.395095 |       500 |            500 |          0 |       25 | 798900333588676609
  __auto__        | {start_time}              | 2022-09-22 19:37:13.395095 |       500 |             30 |          0 |        7 | 798900333605093377
  __auto__        | {end_time}                | 2022-09-22 19:37:13.395095 |       500 |            367 |          0 |        7 | 798900333623869441
  __auto__        | {revenue}                 | 2022-09-22 19:37:13.395095 |       500 |            100 |          0 |        6 | 798900333639041025
  __forecast__    | {id}                      | 2022-09-22 19:57:10.465606 |       500 |            500 |          0 |       26 |                  0
  __forecast__    | {id,city}                 | 2022-09-22 19:57:10.465606 |       500 |            500 |          0 |       37 |               NULL
  __forecast__    | {city}                    | 2022-09-22 19:57:10.465606 |       500 |              9 |          0 |       12 |                  0
  __forecast__    | {city,rider_id}           | 2022-09-22 19:57:10.465606 |       500 |             50 |          0 |       29 |               NULL
  __forecast__    | {vehicle_city}            | 2022-09-22 19:57:10.465606 |       500 |              9 |          0 |       11 |                  0
  __forecast__    | {vehicle_city,vehicle_id} | 2022-09-22 19:57:10.465606 |       500 |             15 |          0 |       28 |               NULL
  __forecast__    | {rider_id}                | 2022-09-22 19:57:10.465606 |       500 |             50 |          0 |       17 |                  0
  __forecast__    | {vehicle_id}              | 2022-09-22 19:57:10.465606 |       500 |             15 |          0 |       17 |                  0
  __forecast__    | {start_address}           | 2022-09-22 19:57:10.465606 |       500 |            500 |          0 |       25 |                  0
  __forecast__    | {end_address}             | 2022-09-22 19:57:10.465606 |       500 |            500 |          0 |       25 |                  0
  __forecast__    | {start_time}              | 2022-09-22 19:57:10.465606 |       500 |             30 |          0 |        7 |                  0
  __forecast__    | {end_time}                | 2022-09-22 19:57:10.465606 |       500 |            367 |          0 |        7 |                  0
  __forecast__    | {revenue}                 | 2022-09-22 19:57:10.465606 |       500 |            100 |          0 |        6 |                  0
(52 rows)
~~~

### Delete statistics

{% include {{ page.version.version }}/misc/delete-statistics.md %}

## See also

- [Cost-Based Optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %})
- [`CREATE STATISTICS`]({% link {{ page.version.version }}/create-statistics.md %})
- [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %})
- [`INSERT`]({% link {{ page.version.version }}/insert.md %})
- [`IMPORT`]({% link {{ page.version.version }}/import.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
