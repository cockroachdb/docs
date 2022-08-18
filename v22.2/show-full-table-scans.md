---
title: SHOW FULL TABLE SCANS
summary: The SHOW FULL TABLE SCANS statement lists recent queries that used a full table scan.
toc: true
docs_area: reference.sql
---

 The `SHOW FULL TABLE SCANS` [statement](sql-statements.html) lists recent queries for which CockroachDB performed a full table scan during query execution.

Limiting the number of queries that require full table scans can help you optimize query execution performance. For more information on query performance optimization, see [Optimize Statement Performance](make-queries-fast.html) and [SQL Tuning with `EXPLAIN`](sql-tuning-with-explain.html).

## Syntax

<div>
{% include {{ page.version.version }}/sql/generated/diagrams/show_full_scans.html %}
</div>

## Required privileges

The [`admin` role](security-reference/authorization.html#admin-role) is required to run `SHOW FULL TABLE SCANS`.

## Examples

To follow along, run [`cockroach demo`](cockroach-demo.html) to start a temporary, in-memory cluster with the sample [`movr` dataset](movr.html) preloaded:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo
~~~

Now, suppose that you want to query the `rides` table for all rides that cost above 90 (i.e., `WHERE revenue > 90`):

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM rides WHERE revenue > 90;
~~~

~~~
                   id                  |     city      | vehicle_city  |               rider_id               |              vehicle_id              |           start_address           |            end_address             |     start_time      |      end_time       | revenue
---------------------------------------+---------------+---------------+--------------------------------------+--------------------------------------+-----------------------------------+------------------------------------+---------------------+---------------------+----------
  b4bc6a7e-f9db-4000-8000-000000000161 | amsterdam     | amsterdam     | ae147ae1-47ae-4800-8000-000000000022 | bbbbbbbb-bbbb-4800-8000-00000000000b | 73310 Young Harbor                | 31482 Omar Street                  | 2018-12-13 03:04:05 | 2018-12-13 07:04:05 |   92.00
  b9db22d0-e560-4000-8000-00000000016b | amsterdam     | amsterdam     | c28f5c28-f5c2-4000-8000-000000000026 | aaaaaaaa-aaaa-4800-8000-00000000000a | 66748 Carroll Ports Apt. 42       | 65413 Miller Point Suite 62        | 2018-12-08 03:04:05 | 2018-12-10 05:04:05 |   98.00

  ...

  4fdf3b64-5a1c-4c00-8000-00000000009c | washington dc | washington dc | 47ae147a-e147-4000-8000-00000000000e | 44444444-4444-4400-8000-000000000004 | 44086 Barbara Ville               | 88493 Michael Flat Apt. 97         | 2018-12-27 03:04:05 | 2018-12-28 05:04:05 |   91.00
(51 rows)
~~~

This `SELECT` statement requires a full table scan at execution. As a result, the query will show up in the `SHOW FULL TABLE SCANS` output, with all of the other queries that performed full table scans:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW FULL TABLE SCANS) SELECT * FROM x WHERE query LIKE 'SELECT * FROM rides WHERE revenue > %';
~~~

~~~
                  query                 | count | rows_read_avg | bytes_read_avg | service_lat_avg | contention_time_avg | max_mem_usage_avg | network_bytes_avg | max_retries
----------------------------------------+-------+---------------+----------------+-----------------+---------------------+-------------------+-------------------+--------------
  SELECT * FROM rides WHERE revenue > _ |     1 |           500 |          88497 |         0.00456 |                   0 |            450560 |                 0 |           0
(1 row)
~~~

To limit the number of rows scanned by `SELECT` queries that filter on the `revenue` column, you can add a secondary index to the `rides` table, on the `revenue` column:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON rides (revenue);
~~~

Now, if you execute a similar query, the query will not perform a full table scan.

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM rides WHERE revenue < 10;
~~~

~~~
                   id                  |     city      | vehicle_city  |               rider_id               |              vehicle_id              |          start_address          |           end_address           |     start_time      |      end_time       | revenue
---------------------------------------+---------------+---------------+--------------------------------------+--------------------------------------+---------------------------------+---------------------------------+---------------------+---------------------+----------
  ac083126-e978-4800-8000-000000000150 | amsterdam     | amsterdam     | c28f5c28-f5c2-4000-8000-000000000026 | aaaaaaaa-aaaa-4800-8000-00000000000a | 50217 Victoria Fields Apt. 44   | 56217 Wilson Spring             | 2018-12-07 03:04:05 | 2018-12-07 10:04:05 |    9.00
  ae147ae1-47ae-4800-8000-000000000154 | amsterdam     | amsterdam     | bd70a3d7-0a3d-4000-8000-000000000025 | aaaaaaaa-aaaa-4800-8000-00000000000a | 63503 Lisa Summit Suite 28      | 26800 Brown Station             | 2018-12-25 03:04:05 | 2018-12-26 22:04:05 |    0.00
  ...
(32 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW FULL TABLE SCANS) SELECT * FROM x WHERE query LIKE 'SELECT * FROM rides WHERE revenue < %';
~~~

~~~
  query | count | rows_read_avg | bytes_read_avg | service_lat_avg | contention_time_avg | max_mem_usage_avg | network_bytes_avg | max_retries
--------+-------+---------------+----------------+-----------------+---------------------+-------------------+-------------------+--------------
(0 rows)
~~~

## See also

- [`EXPLAIN`](explain.html)
- [Statement Tuning with `EXPLAIN`](sql-tuning-with-explain.html)
- [Selection queries](selection-queries.html)
