---
title: ALTER INDEX
summary: Use the ALTER INDEX statement to change an existing index.
toc: true
docs_area: reference.sql
---

The `ALTER INDEX` [statement](sql-statements.html) changes the definition of an index. For information on using `ALTER INDEX`, see the pages for its [subcommands](#subcommands).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Subcommands

Subcommand | Description
-----------|------------
[`CONFIGURE ZONE`](configure-zone.html) | [Configure replication zones](configure-replication-zones.html) for an index.
[`PARTITION BY`](partition-by.html)  | Partition, re-partition, or un-partition an index. ([Enterprise-only](enterprise-licensing.html)).
[`RENAME TO`](rename-index.html) | Change the name of an index.
[`SPLIT AT`](split-at.html) | Force a [range split](architecture/distribution-layer.html#range-splits) at the specified row in the index.
[`UNSPLIT AT`](unsplit-at.html) | Remove a range split enforcement in the index.

## View schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

{% include {{ page.version.version }}/sql/movr-statements-geo-partitioned-replicas.md %}

### Rename an index

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX on users(name);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM users;
~~~

~~~
 table_name |   index_name   | non_unique | seq_in_index | column_name | direction | storing | implicit | visible
-------------+----------------+------------+--------------+-------------+-----------+---------+----------+----------
  users      | users_name_idx |     t      |            1 | name        | ASC       |    f    |    f     |    t
  users      | users_name_idx |     t      |            2 | city        | ASC       |    f    |    t     |    t
  users      | users_name_idx |     t      |            3 | id          | ASC       |    f    |    t     |    t
  users      | users_pkey     |     f      |            1 | city        | ASC       |    f    |    f     |    t
  users      | users_pkey     |     f      |            2 | id          | ASC       |    f    |    f     |    t
  users      | users_pkey     |     f      |            3 | name        | N/A       |    t    |    f     |    t
  users      | users_pkey     |     f      |            4 | address     | N/A       |    t    |    f     |    t
  users      | users_pkey     |     f      |            5 | credit_card | N/A       |    t    |    f     |    t
(8 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX users@users_name_idx RENAME TO name_idx;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM users;
~~~

~~~
  table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit | visible
-------------+------------+------------+--------------+-------------+-----------+---------+----------+----------
  users      | name_idx   |     t      |            1 | name        | ASC       |    f    |    f     |    t
  users      | name_idx   |     t      |            2 | city        | ASC       |    f    |    t     |    t
  users      | name_idx   |     t      |            3 | id          | ASC       |    f    |    t     |    t
  users      | users_pkey |     f      |            1 | city        | ASC       |    f    |    f     |    t
  users      | users_pkey |     f      |            2 | id          | ASC       |    f    |    f     |    t
  users      | users_pkey |     f      |            3 | name        | N/A       |    t    |    f     |    t
  users      | users_pkey |     f      |            4 | address     | N/A       |    t    |    f     |    t
  users      | users_pkey |     f      |            5 | credit_card | N/A       |    t    |    f     |    t
(8 rows)
~~~

### Create a replication zone for a secondary index

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-secondary-index.md %}

### Split and unsplit an index

For examples, see [Split an index](split-at.html#split-an-index) and [Unsplit an index](unsplit-at.html#unsplit-an-index).

### Set an index to be not visible

You can specify that an index is not visible to the [cost-based optimizer](cost-based-optimizer.html#control-whether-the-optimzer-uses-indexes-marked-as-not-visible) (i.e. it won't be used in queries unless specifically selected with a hint). This allows you to create an index and check for corruption without affecting production queries.

{% include {{ page.version.version }}/demo_movr.md %}

1. Show the indexes on the `rides` table.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW INDEXES FROM rides;
    ~~~

    ~~~
      table_name |                  index_name                   | non_unique | seq_in_index |  column_name  | direction | storing | implicit | visible
    -------------+-----------------------------------------------+------------+--------------+---------------+-----------+---------+----------+----------
      rides      | rides_auto_index_fk_city_ref_users            |     t      |            1 | city          | ASC       |    f    |    f     |    t
      rides      | rides_auto_index_fk_city_ref_users            |     t      |            2 | rider_id      | ASC       |    f    |    f     |    t
      rides      | rides_auto_index_fk_city_ref_users            |     t      |            3 | id            | ASC       |    f    |    t     |    t
      rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            1 | vehicle_city  | ASC       |    f    |    f     |    t
      rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            2 | vehicle_id    | ASC       |    f    |    f     |    t
      rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            3 | city          | ASC       |    f    |    t     |    t
      rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            4 | id            | ASC       |    f    |    t     |    t
      rides      | rides_pkey                                    |     f      |            1 | city          | ASC       |    f    |    f     |    t
      rides      | rides_pkey                                    |     f      |            2 | id            | ASC       |    f    |    f     |    t
      rides      | rides_pkey                                    |     f      |            3 | vehicle_city  | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |            4 | rider_id      | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |            5 | vehicle_id    | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |            6 | start_address | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |            7 | end_address   | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |            8 | start_time    | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |            9 | end_time      | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |           10 | revenue       | N/A       |    t    |    f     |    t
    (17 rows)
    ~~~

1. Explain the query that filters on revenue. Since there is no index on the `revenue` column, the query performs a full scan.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    EXPLAIN SELECT * FROM rides WHERE revenue > 90 ORDER BY revenue ASC;
    ~~~

    ~~~
                                                                           info
    ---------------------------------------------------------------------------------------------------------------------------------------------------
      distribution: full
      vectorized: true

      • sort
      │ estimated row count: 12,417
      │ order: +revenue
      │
      └── • filter
          │ estimated row count: 12,417
          │ filter: revenue > 90
          │
          └── • scan
                estimated row count: 125,000 (100% of the table; stats collected 4 minutes ago)
                table: rides@rides_pkey
                spans: FULL SCAN

      index recommendations: 1
      1. type: index creation
         SQL command: CREATE INDEX ON rides (revenue) STORING (vehicle_city, rider_id, vehicle_id, start_address, end_address, start_time, end_time);
    (19 rows)
    ~~~

1. Create the recommended index.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE INDEX ON rides (revenue) STORING (vehicle_city, rider_id, vehicle_id, start_address, end_address, start_time, end_time);
    ~~~

1. Show the indexes on the rides table;

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW INDEXES FROM rides;
    ~~~

    ~~~
      table_name |                  index_name                   | non_unique | seq_in_index |  column_name  | direction | storing | implicit | visible
    -------------+-----------------------------------------------+------------+--------------+---------------+-----------+---------+----------+----------
      rides      | rides_auto_index_fk_city_ref_users            |     t      |            1 | city          | ASC       |    f    |    f     |    t
      rides      | rides_auto_index_fk_city_ref_users            |     t      |            2 | rider_id      | ASC       |    f    |    f     |    t
      rides      | rides_auto_index_fk_city_ref_users            |     t      |            3 | id            | ASC       |    f    |    t     |    t
      rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            1 | vehicle_city  | ASC       |    f    |    f     |    t
      rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            2 | vehicle_id    | ASC       |    f    |    f     |    t
      rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            3 | city          | ASC       |    f    |    t     |    t
      rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            4 | id            | ASC       |    f    |    t     |    t
      rides      | rides_pkey                                    |     f      |            1 | city          | ASC       |    f    |    f     |    t
      rides      | rides_pkey                                    |     f      |            2 | id            | ASC       |    f    |    f     |    t
      rides      | rides_pkey                                    |     f      |            3 | vehicle_city  | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |            4 | rider_id      | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |            5 | vehicle_id    | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |            6 | start_address | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |            7 | end_address   | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |            8 | start_time    | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |            9 | end_time      | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |           10 | revenue       | N/A       |    t    |    f     |    t
      rides      | rides_revenue_idx                             |     t      |            1 | revenue       | ASC       |    f    |    f     |    t
      rides      | rides_revenue_idx                             |     t      |            2 | vehicle_city  | N/A       |    t    |    f     |    t
      rides      | rides_revenue_idx                             |     t      |            3 | rider_id      | N/A       |    t    |    f     |    t
      rides      | rides_revenue_idx                             |     t      |            4 | vehicle_id    | N/A       |    t    |    f     |    t
      rides      | rides_revenue_idx                             |     t      |            5 | start_address | N/A       |    t    |    f     |    t
      rides      | rides_revenue_idx                             |     t      |            6 | end_address   | N/A       |    t    |    f     |    t
      rides      | rides_revenue_idx                             |     t      |            7 | start_time    | N/A       |    t    |    f     |    t
      rides      | rides_revenue_idx                             |     t      |            8 | end_time      | N/A       |    t    |    f     |    t
      rides      | rides_revenue_idx                             |     t      |            9 | city          | ASC       |    f    |    t     |    t
      rides      | rides_revenue_idx                             |     t      |           10 | id            | ASC       |    f    |    t     |    t
    (27 rows)
    ~~~

1. Explain the query behavior with the index. The query uses the new `rides_revenue_idx` index and scans many fewer rows.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    EXPLAIN SELECT * FROM rides WHERE revenue > 90 ORDER BY revenue ASC;
    ~~~

    ~~~
                                            info
    -------------------------------------------------------------------------------------
      distribution: local
      vectorized: true

      • scan
        estimated row count: 11,600 (9.3% of the table; stats collected 38 seconds ago)
        table: rides@rides_revenue_idx
        spans: (/90 - ]
    (7 rows)
    ~~~

1. Alter the index to be not visible to the optimizer.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > ALTER INDEX rides_revenue_idx NOT VISIBLE;
    ~~~

1. View the table indexes and verify that the index visibility for `rides_revenue_idx` is `f`.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SHOW INDEXES FROM rides;
    ~~~

    ~~~
      table_name |                  index_name                   | non_unique | seq_in_index |  column_name  | direction | storing | implicit | visible
    -------------+-----------------------------------------------+------------+--------------+---------------+-----------+---------+----------+----------
      rides      | rides_auto_index_fk_city_ref_users            |     t      |            1 | city          | ASC       |    f    |    f     |    t
      rides      | rides_auto_index_fk_city_ref_users            |     t      |            2 | rider_id      | ASC       |    f    |    f     |    t
      rides      | rides_auto_index_fk_city_ref_users            |     t      |            3 | id            | ASC       |    f    |    t     |    t
      rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            1 | vehicle_city  | ASC       |    f    |    f     |    t
      rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            2 | vehicle_id    | ASC       |    f    |    f     |    t
      rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            3 | city          | ASC       |    f    |    t     |    t
      rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            4 | id            | ASC       |    f    |    t     |    t
      rides      | rides_pkey                                    |     f      |            1 | city          | ASC       |    f    |    f     |    t
      rides      | rides_pkey                                    |     f      |            2 | id            | ASC       |    f    |    f     |    t
      rides      | rides_pkey                                    |     f      |            3 | vehicle_city  | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |            4 | rider_id      | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |            5 | vehicle_id    | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |            6 | start_address | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |            7 | end_address   | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |            8 | start_time    | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |            9 | end_time      | N/A       |    t    |    f     |    t
      rides      | rides_pkey                                    |     f      |           10 | revenue       | N/A       |    t    |    f     |    t
      rides      | rides_revenue_idx                             |     t      |            1 | revenue       | ASC       |    f    |    f     |    f
      rides      | rides_revenue_idx                             |     t      |            2 | vehicle_city  | N/A       |    t    |    f     |    f
      rides      | rides_revenue_idx                             |     t      |            3 | rider_id      | N/A       |    t    |    f     |    f
      rides      | rides_revenue_idx                             |     t      |            4 | vehicle_id    | N/A       |    t    |    f     |    f
      rides      | rides_revenue_idx                             |     t      |            5 | start_address | N/A       |    t    |    f     |    f
      rides      | rides_revenue_idx                             |     t      |            6 | end_address   | N/A       |    t    |    f     |    f
      rides      | rides_revenue_idx                             |     t      |            7 | start_time    | N/A       |    t    |    f     |    f
      rides      | rides_revenue_idx                             |     t      |            8 | end_time      | N/A       |    t    |    f     |    f
      rides      | rides_revenue_idx                             |     t      |            9 | city          | ASC       |    f    |    t     |    f
      rides      | rides_revenue_idx                             |     t      |           10 | id            | ASC       |    f    |    t     |    f
    (27 rows)
    ~~~

1. Explain the query behavior with the index not visible to the optimizer. With the index not visible, the optimizer reverts to full scan and recommends that you make the index visible.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    EXPLAIN SELECT * FROM rides WHERE revenue > 90 ORDER BY revenue ASC;
    ~~~

    ~~~
                                                                     info
    --------------------------------------------------------------------------------------------------------------------------------------
      distribution: full
      vectorized: true

      • sort
      │ estimated row count: 12,655
      │ order: +revenue
      │
      └── • filter
          │ estimated row count: 12,655
          │ filter: revenue > 90
          │
          └── • scan
                estimated row count: 125,000 (100% of the table; stats collected 4 minutes ago; using stats forecast for 10 seconds ago)
                table: rides@rides_pkey
                spans: FULL SCAN

      index recommendations: 1
      1. type: index alteration
         SQL command: ALTER INDEX rides@rides_revenue_idx VISIBLE;
    (19 rows)
    ~~~
