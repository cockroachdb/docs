---
title: ALTER INDEX
summary: Use the ALTER INDEX statement to change an existing index.
toc: true
docs_area: reference.sql
sidebar: sql_statements
---

The `ALTER INDEX` [statement](sql-statements.html) applies a [schema change](online-schema-changes.html) to an index.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/misc/schema-change-view-job.md %}
{{site.data.alerts.end}}

## Required privileges

Refer to the respective [subcommands](#subcommands).

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/alter_index.html %}
</div>

## Parameters

 Parameter | Description
-----------|-------------
`table_name` | The name of the table with the index you want to change.
`index_name` | The current name of the index you want to change.
`IF EXISTS` | Alter the index only if an index `index_name` exists; if one does not exist, do not return an error.

Additional parameters are documented for the respective [subcommands](#subcommands).

## Subcommands

Subcommand | Description |
-----------|-------------|
[`CONFIGURE ZONE`](#configure-zone) | [Configure replication zones](configure-replication-zones.html) for an index. ([Enterprise-only](enterprise-licensing.html).) | 
[`PARTITION BY`](#partition-by)  | Partition, re-partition, or un-partition an index. ([Enterprise-only](enterprise-licensing.html).)
[`RENAME TO`](#rename-to) | Change the name of an index.
[`SPLIT AT`](#split-at) | Force a [range split](architecture/distribution-layer.html#range-splits) at the specified row in the index.
[`UNSPLIT AT`](#unsplit-at) | Remove a range split enforcement in the index.
[`[NOT] VISIBLE`](#not-visible) | Make an index visible or not visible to the [cost-based optimizer](cost-based-optimizer.html#control-whether-the-optimizer-uses-an-index).

### `CONFIGURE ZONE`

`ALTER INDEX ... CONFIGURE ZONE` is used to add, modify, reset, or remove replication zones for an index. To view details about existing replication zones, use [`SHOW ZONE CONFIGURATIONS`](show-zone-configurations.html). For more information about replication zones, see [Configure Replication Zones](configure-replication-zones.html).

{% include enterprise-feature.md %}

You can use *replication zones* to control the number and location of replicas for specific sets of data, both when replicas are first added and when they are rebalanced to maintain cluster equilibrium.

For examples, see [Configure replication zones](#configure-replication-zones).

#### Required privileges

The user must be a member of the [`admin` role](security-reference/authorization.html#admin-role) or have been granted [`CREATE`](security-reference/authorization.html#supported-privileges) or [`ZONECONFIG`](security-reference/authorization.html#supported-privileges) privileges. To configure [`system` objects](configure-replication-zones.html#for-system-data), the user must be a member of the `admin` role.

#### Parameters

 Parameter | Description
-----------+-------------
`variable` | The name of the [replication zone variable](configure-replication-zones.html#replication-zone-variables) to change.
`value` | The value of the [replication zone variable](configure-replication-zones.html#replication-zone-variables) to change.
`DISCARD` | Remove a replication zone.

For usage, see [Synopsis](#synopsis).

### `PARTITION BY`

`ALTER INDEX ... PARTITION BY` is used to partition, re-partition, or un-partition a secondary index. After defining partitions, [`CONFIGURE ZONE`](alter-partition.html#create-a-replication-zone-for-a-partition) is used to control the replication and placement of partitions.

{% include enterprise-feature.md %}

Similar to [indexes](indexes.html), partitions can improve query performance by limiting the numbers of rows that a query must scan. In the case of [geo-partitioned data](regional-tables.html), partitioning can limit a query scan to data in a specific region. For examples, see [Query partitions](partitioning.html#query-partitions).

{% include {{page.version.version}}/sql/use-multiregion-instead-of-partitioning.md %}

The [primary key required for partitioning](partitioning.html#partition-using-primary-key) is different from the conventional primary key: The unique identifier in the primary key must be prefixed with all columns you want to partition and subpartition the table on, in the order in which you want to nest your subpartitions.

If the primary key in your existing table does not meet the requirements, you can change the primary key with [`ALTER TABLE ... ALTER PRIMARY KEY`](alter-table.html#alter-primary-key).

For examples, see [Define partitions](#define-partitions).

#### Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the table.

#### Parameters

Parameter | Description |
-----------|-------------|
`name_list` | List of columns you want to define partitions on (in the order they are defined in the primary key).
`list_partitions` | Name of list partition followed by the list of values to be included in the partition.
`range_partitions` | Name of range partition followed by the range of values to be included in the partition.

For usage, see [Synopsis](#synopsis).

### `RENAME TO`

`ALTER INDEX ... RENAME TO` changes the name of an index.

{{site.data.alerts.callout_info}}
It is not possible to rename an index referenced by a view. For more details, see [View Dependencies](views.html#view-dependencies).
{{site.data.alerts.end}}

For examples, see [Rename indexes](#rename-indexes).

#### Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the table.

#### Parameters

 Parameter | Description
-----------|-------------
`index_new_name` | The [`name`](sql-grammar.html#name) you want to use for the index, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers).

For usage, see [Synopsis](#synopsis).

### `SPLIT AT`

`ALTER INDEX ... SPLIT AT` forces a [range split](architecture/distribution-layer.html#range-splits) at a specified row in the index.

{% include {{ page.version.version }}/sql/range-splits.md %}

For examples, see [Split and unsplit indexes](#split-and-unsplit-indexes).

#### Required privileges

The user must have the `INSERT` [privilege](security-reference/authorization.html#managing-privileges) on the table or index.

#### Parameters

 Parameter | Description
-----------|-------------
`select_stmt` | A [selection query](selection-queries.html) that produces one or more rows at which to split the index.
`a_expr` | The expiration of the split enforcement on the index. This can be a [`DECIMAL`](decimal.html), [`INTERVAL`](interval.html), [`TIMESTAMP`](timestamp.html), or [`TIMESTAMPZ`](timestamp.html).

For usage, see [Synopsis](#synopsis).

### `UNSPLIT AT`

`ALTER INDEX ... UNSPLIT AT` removes a [split enforcement](#split-at) on a [range split](architecture/distribution-layer.html#range-splits), at a specified row in the index.

Removing a split enforcement from a table or index ("unsplitting") allows CockroachDB to merge ranges as needed, to help improve your cluster's performance. For more information, see [Range Merges](architecture/distribution-layer.html#range-merges).

For examples, see [Split and unsplit indexes](#split-and-unsplit-indexes).

#### Required privileges

The user must have the `INSERT` [privilege](security-reference/authorization.html#managing-privileges) on the table or index.

#### Parameters

 Parameter | Description
-----------|-------------
`select_stmt` | A [selection query](selection-queries.html) that produces one or more rows at which to unsplit an index.
`ALL` | Remove all split enforcements for an index.

For usage, see [Synopsis](#synopsis).

### `[NOT] VISIBLE`

`ALTER INDEX ... VISIBLE` and `ALTER INDEX ... NOT VISIBLE` sets the visibility of an index. This determines whether the index is visible to the [cost-based optimizer](cost-based-optimizer.html#control-whether-the-optimizer-uses-an-index). 

By default, indexes are visible. If `NOT VISIBLE`, the index will not be used in queries unless it is specifically selected with an [index hint](indexes.html#selection) or the property is overridden with the [`optimizer_use_not_visible_indexes` session variable](set-vars.html#optimizer-use-not-visible-indexes).

This allows you to create an index and check for query plan changes without affecting production queries. For an example, see [Set an index to be not visible](#set-an-index-to-be-not-visible).

Note the following considerations:

- Primary indexes must be visible.
- Indexes that are not visible are still used to enforce `UNIQUE` and `FOREIGN KEY` [constraints](constraints.html).
- Indexes that are not visible are still used for foreign key cascades.
- When defining a [unique constraint](unique.html), the `NOT VISIBLE` syntax cannot be used to make the corresponding index not visible. Instead, use `ALTER INDEX` after creating the unique constraint.

For examples, see [Set index visibility](#set-index-visibility).

#### Aliases

In CockroachDB, the following are aliases for `NOT VISIBLE`:

- `INVISIBLE`

## Examples

### Configure replication zones

{% include {{ page.version.version }}/sql/movr-statements-geo-partitioned-replicas.md %}

#### Create a replication zone for an index

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-secondary-index.md %}

#### Edit a replication zone

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER INDEX vehicles@vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING range_min_bytes = 0, range_max_bytes = 90000, gc.ttlseconds = 89999, num_replicas = 4;
~~~

#### Remove a replication zone

{{site.data.alerts.callout_info}}
When you discard a zone configuration, the objects it was applied to will then inherit a configuration from an object "the next level up"; e.g., if the object whose configuration is being discarded is a table, it will use its parent database's configuration.

You cannot `DISCARD` any zone configurations on multi-region tables, indexes, or partitions if the [multi-region abstractions](migrate-to-multiregion-sql.html#replication-zone-patterns-and-multi-region-sql-abstractions) created the zone configuration.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER INDEX vehicles@vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE DISCARD;
~~~

### Define partitions

#### Define a list partition on an index

Suppose we have a table called `students_by_list`, a secondary index on the table called `name_idx`, and the primary key of the table is defined as `(country, id)`. We can define partitions on the index by list:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER INDEX students_by_list@name_idx PARTITION BY LIST (country) (
    PARTITION north_america VALUES IN ('CA','US'),
    PARTITION australia VALUES IN ('AU','NZ'),
    PARTITION DEFAULT VALUES IN (default)
  );
~~~

#### Define a range partition on an index

Suppose we have a table called `students_by_range`, with a secondary index called `name_idx`, and the primary key of the table is defined as `(expected_graduation_date, id)`. We can define partitions on the index by range:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER INDEX students_by_range@name_idx PARTITION BY RANGE (expected_graduation_date) (
    PARTITION graduated VALUES FROM (MINVALUE) TO ('2017-08-15'),
    PARTITION current VALUES FROM ('2017-08-15') TO (MAXVALUE)
  );
~~~

#### Define subpartitions on an index

Suppose we have a table named `students`, with a secondary index called `name_idx`, and the primary key is defined as `(country, expected_graduation_date, id)`. We can define partitions and subpartitions on the index:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER INDEX students@name_idx PARTITION BY LIST (country) (
    PARTITION australia VALUES IN ('AU','NZ') PARTITION BY RANGE (expected_graduation_date) (
      PARTITION graduated_au VALUES FROM (MINVALUE) TO ('2017-08-15'),
      PARTITION current_au VALUES FROM ('2017-08-15') TO (MAXVALUE)
    ),
    PARTITION north_america VALUES IN ('US','CA') PARTITION BY RANGE (expected_graduation_date) (
      PARTITION graduated_us VALUES FROM (MINVALUE) TO ('2017-08-15'),
      PARTITION current_us VALUES FROM ('2017-08-15') TO (MAXVALUE)
    )
  );
~~~

#### Repartition an index

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER INDEX students_by_range@name_idx PARTITION BY RANGE (expected_graduation_date) (
    PARTITION graduated VALUES FROM (MINVALUE) TO ('2018-08-15'),
    PARTITION current VALUES FROM ('2018-08-15') TO (MAXVALUE)
  );
~~~

#### Unpartition an index

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER INDEX students@name_idx PARTITION BY NOTHING;
~~~

### Rename indexes

#### Rename an index

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INDEX on users(name);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW INDEXES FROM users;
~~~

~~~
  table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit | visible
-------------+------------+------------+--------------+-------------+-----------+---------+----------+----------
  users      | name_idx   |     t      |            1 | name        | DESC      |    f    |    f     |    t
  users      | name_idx   |     t      |            2 | city        | ASC       |    f    |    t     |    t
  users      | name_idx   |     t      |            3 | id          | ASC       |    f    |    t     |    t
  users      | users_pkey |     f      |            1 | city        | ASC       |    f    |    f     |    t
  users      | users_pkey |     f      |            2 | id          | ASC       |    f    |    f     |    t
  users      | users_pkey |     f      |            3 | name        | N/A       |    t    |    f     |    t
  users      | users_pkey |     f      |            4 | address     | N/A       |    t    |    f     |    t
  users      | users_pkey |     f      |            5 | credit_card | N/A       |    t    |    f     |    t
(8 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER INDEX users@name_idx RENAME TO users_name_idx;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW INDEXES FROM users;
~~~

~~~
  table_name |   index_name   | non_unique | seq_in_index | column_name | direction | storing | implicit | visible
-------------+----------------+------------+--------------+-------------+-----------+---------+----------+----------
  users      | users_name_idx |     t      |            1 | name        | DESC      |    f    |    f     |    t
  users      | users_name_idx |     t      |            2 | city        | ASC       |    f    |    t     |    t
  users      | users_name_idx |     t      |            3 | id          | ASC       |    f    |    t     |    t
  users      | users_pkey     |     f      |            1 | city        | ASC       |    f    |    f     |    t
  users      | users_pkey     |     f      |            2 | id          | ASC       |    f    |    f     |    t
  users      | users_pkey     |     f      |            3 | name        | N/A       |    t    |    f     |    t
  users      | users_pkey     |     f      |            4 | address     | N/A       |    t    |    f     |    t
  users      | users_pkey     |     f      |            5 | credit_card | N/A       |    t    |    f     |    t
(8 rows)
~~~

### Split and unsplit indexes

{% include {{ page.version.version }}/sql/movr-statements-geo-partitioned-replicas.md %}

#### Split an index

Add a new secondary [index](indexes.html) to the `rides` table, on the `revenue` column:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INDEX revenue_idx ON rides(revenue);
~~~

Then split the table ranges by secondary index values:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER INDEX rides@revenue_idx SPLIT AT VALUES (25.00), (50.00), (75.00);
~~~
~~~
         key        | pretty |        split_enforced_until
--------------------+--------+--------------------------------------
  \277\214*2\000    | /25    | 2262-04-11 23:47:16.854776+00:00:00
  \277\214*d\000    | /5E+1  | 2262-04-11 23:47:16.854776+00:00:00
  \277\214*\226\000 | /75    | 2262-04-11 23:47:16.854776+00:00:00
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RANGES FROM INDEX rides@revenue_idx;
~~~
~~~
  start_key | end_key | range_id | range_size_mb | lease_holder | lease_holder_locality | replicas |                             replica_localities
------------+---------+----------+---------------+--------------+-----------------------+----------+-----------------------------------------------------------------------------
  NULL      | /25     |      249 |      0.007464 |            3 | region=us-east1,az=d  | {3,5,7}  | {"region=us-east1,az=d","region=us-west1,az=b","region=europe-west1,az=b"}
  /25       | /5E+1   |      250 |      0.008995 |            3 | region=us-east1,az=d  | {3,5,7}  | {"region=us-east1,az=d","region=us-west1,az=b","region=europe-west1,az=b"}
  /5E+1     | /75     |      251 |      0.008212 |            3 | region=us-east1,az=d  | {3,5,7}  | {"region=us-east1,az=d","region=us-west1,az=b","region=europe-west1,az=b"}
  /75       | NULL    |      252 |      0.009267 |            3 | region=us-east1,az=d  | {3,5,7}  | {"region=us-east1,az=d","region=us-west1,az=b","region=europe-west1,az=b"}
(4 rows)
~~~

#### Set the expiration on a split enforcement

For an example, see [`ALTER TABLE`](alter-table.html#set-the-expiration-on-a-split-enforcement).

#### Unsplit an index

Add a new secondary [index](indexes.html) to the `rides` table, on the `revenue` column, and then split the table ranges by secondary index values as described in [Split an index](#split-an-index).

To remove the split enforcements, run the following:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER INDEX rides@revenue_idx UNSPLIT AT VALUES (25.00), (50.00), (75.00);
~~~
~~~
         key        |      pretty
--------------------+-------------------
  \277\214*2\000    | /Table/55/4/25
  \277\214*d\000    | /Table/55/4/5E+1
  \277\214*\226\000 | /Table/55/4/75
(3 rows)
~~~

You can see the split's expiration date in the `split_enforced_until` column. The [`crdb_internal.ranges`](crdb-internal.html) table also contains information about ranges in your CockroachDB cluster, including the `split_enforced_until` column.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT range_id, start_pretty, end_pretty, split_enforced_until FROM crdb_internal.ranges WHERE table_name='rides';
~~~
~~~
  range_id |                                        start_pretty                                         |                                         end_pretty                                          |        split_enforced_until
-----------+---------------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------------+--------------------------------------
        39 | /Table/55                                                                                   | /Table/55/1/"amsterdam"/"\xc5\x1e\xb8Q\xeb\x85@\x00\x80\x00\x00\x00\x00\x00\x01\x81"        | NULL
        56 | /Table/55/1/"amsterdam"/"\xc5\x1e\xb8Q\xeb\x85@\x00\x80\x00\x00\x00\x00\x00\x01\x81"        | /Table/55/1/"boston"/"8Q\xeb\x85\x1e\xb8B\x00\x80\x00\x00\x00\x00\x00\x00n"                 | 2262-04-11 23:47:16.854776+00:00:00
        55 | /Table/55/1/"boston"/"8Q\xeb\x85\x1e\xb8B\x00\x80\x00\x00\x00\x00\x00\x00n"                 | /Table/55/1/"los angeles"/"\xa8\xf5\u008f\\(H\x00\x80\x00\x00\x00\x00\x00\x01J"             | 2262-04-11 23:47:16.854776+00:00:00
        53 | /Table/55/1/"los angeles"/"\xa8\xf5\u008f\\(H\x00\x80\x00\x00\x00\x00\x00\x01J"             | /Table/55/1/"new york"/"\x1c(\xf5\u008f\\I\x00\x80\x00\x00\x00\x00\x00\x007"                | 2262-04-11 23:47:16.854776+00:00:00
        66 | /Table/55/1/"new york"/"\x1c(\xf5\u008f\\I\x00\x80\x00\x00\x00\x00\x00\x007"                | /Table/55/1/"paris"/"\xe1G\xae\x14z\xe1H\x00\x80\x00\x00\x00\x00\x00\x01\xb8"               | 2262-04-11 23:47:16.854776+00:00:00
        52 | /Table/55/1/"paris"/"\xe1G\xae\x14z\xe1H\x00\x80\x00\x00\x00\x00\x00\x01\xb8"               | /Table/55/1/"san francisco"/"\x8c\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x01\x13" | 2262-04-11 23:47:16.854776+00:00:00
        65 | /Table/55/1/"san francisco"/"\x8c\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x01\x13" | /Table/55/1/"seattle"/"p\xa3\xd7\n=pD\x00\x80\x00\x00\x00\x00\x00\x00\xdc"                  | 2262-04-11 23:47:16.854776+00:00:00
        64 | /Table/55/1/"seattle"/"p\xa3\xd7\n=pD\x00\x80\x00\x00\x00\x00\x00\x00\xdc"                  | /Table/55/1/"washington dc"/"Tz\xe1G\xae\x14L\x00\x80\x00\x00\x00\x00\x00\x00\xa5"          | 2262-04-11 23:47:16.854776+00:00:00
        54 | /Table/55/1/"washington dc"/"Tz\xe1G\xae\x14L\x00\x80\x00\x00\x00\x00\x00\x00\xa5"          | /Table/55/4                                                                                 | 2262-04-11 23:47:16.854776+00:00:00
        68 | /Table/55/4                                                                                 | /Table/55/4/25                                                                              | 2021-04-08 16:27:45.201336+00:00:00
        69 | /Table/55/4/25                                                                              | /Table/55/4/5E+1                                                                            | NULL
        70 | /Table/55/4/5E+1                                                                            | /Table/55/4/75                                                                              | NULL
        71 | /Table/55/4/75                                                                              | /Table/56                                                                                   | NULL
(13 rows)
~~~

The table is still split into ranges at `25.00`, `50.00`, and `75.00`, but the `split_enforced_until` column is now `NULL` for all ranges in the table. The split is no longer enforced, and CockroachDB can [merge the data](architecture/distribution-layer.html#range-merges) in the table as needed.

### Set index visibility

#### Set an index to be not visible

{% include {{ page.version.version }}/demo_movr.md %}

1. Show the indexes on the `rides` table. In the last column, `visible`, you can see that all indexes have the value `t` (true).

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW INDEXES FROM rides;
    ~~~

    ~~~
      table_name |                  index_name                   | non_unique | seq_in_index |  column_name  | direction | storing | implicit | visible
    -------------+-----------------------------------------------+------------+--------------+---------------+-----------+---------+----------+----------
      rides      | rides_auto_index_fk_city_ref_users            |     t      |            1 | city          | ASC       |    f    |    f     |    t
      rides      | rides_auto_index_fk_city_ref_users            |     t      |            2 | rider_id      | ASC       |    f    |    f     |    t
      rides      | rides_auto_index_fk_city_ref_users            |     t      |            3 | id            | ASC       |    f    |    t     |    t
      rides      | rides_auto_index_fk_vehicle_city_ref_vehicles |     t      |            1 | vehicle_city  | ASC       |    f    |    f     |    t
      ...
      rides      | rides_pkey                                    |     f      |           10 | revenue       | N/A       |    t    |    f     |    t
    (17 rows)
    ~~~

1. Explain a query that filters on revenue. Since there is no index on the `revenue` column, the query performs a full scan.

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
    CREATE INDEX ON rides (revenue) STORING (vehicle_city, rider_id, vehicle_id, start_address, end_address, start_time, end_time);
    ~~~

1. Display the indexes on the `rides` table to verify the newly created index `rides_revenue_idx`.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW INDEXES FROM rides;
    ~~~

    ~~~
      table_name |                  index_name                   | non_unique | seq_in_index |  column_name  | direction | storing | implicit | visible
    -------------+-----------------------------------------------+------------+--------------+---------------+-----------+---------+----------+----------
      rides      | rides_auto_index_fk_city_ref_users            |     t      |            1 | city          | ASC       |    f    |    f     |    t
      rides      | rides_auto_index_fk_city_ref_users            |     t      |            2 | rider_id      | ASC       |    f    |    f     |    t
      ...
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

1. Explain the query behavior after creating the index. The query now uses the `rides_revenue_idx` index and scans many fewer rows.

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

1. Alter the index to be not visible to the optimizer, specifying the `NOT VISIBLE` clause.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER INDEX rides_revenue_idx NOT VISIBLE;
    ~~~

1. Display the table indexes and verify that the index visibility for `rides_revenue_idx` is `f` (false).

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW INDEXES FROM rides;
    ~~~

    ~~~
      table_name |                  index_name                   | non_unique | seq_in_index |  column_name  | direction | storing | implicit | visible
    -------------+-----------------------------------------------+------------+--------------+---------------+-----------+---------+----------+----------
      rides      | rides_auto_index_fk_city_ref_users            |     t      |            1 | city          | ASC       |    f    |    f     |    t
      rides      | rides_auto_index_fk_city_ref_users            |     t      |            2 | rider_id      | ASC       |    f    |    f     |    t
      rides      | rides_auto_index_fk_city_ref_users            |     t      |            3 | id            | ASC       |    f    |    t     |    t
      ...
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

1. Explain the query behavior after making the index not visible to the optimizer. With the index not visible, the optimizer reverts to full scan and recommends that you make the index visible.

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

## See also

- [`CREATE INDEX`](create-index.html)
- [`CREATE TABLE`](create-table.html)
- [`ALTER TABLE`](alter-table.html)
- [`ALTER PARTITION`](alter-partition.html)
- [`SHOW JOBS`](show-jobs.html)
- [Online Schema Changes](online-schema-changes.html)
- [SQL Statements](sql-statements.html)
