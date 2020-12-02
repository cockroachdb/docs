---
title: ALTER PRIMARY KEY
summary: Use the ALTER PRIMARY KEY statement to change the primary key of a table.
toc: true
---

  The `ALTER PRIMARY KEY` [statement](sql-statements.html) is a subcommand of [`ALTER TABLE`](alter-table.html) that can be used to change the [primary key](primary-key.html) of a table.

## Watch the demo

<iframe width="560" height="315" src="https://www.youtube.com/embed/MPx-LXY2D-c" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Details

- You cannot change the primary key of a table that is currently undergoing a primary key change, or any other [schema change](online-schema-changes.html).

- `ALTER PRIMARY KEY` might need to rewrite multiple indexes, which can make it an expensive operation.

-  When you change a primary key with `ALTER PRIMARY KEY`, the old primary key index becomes a [`UNIQUE`](unique.html) secondary index. This helps optimize the performance of queries that still filter on the old primary key column.

- `ALTER PRIMARY KEY` does not alter the [partitions](partitioning.html) on a table or its indexes, even if a partition is defined on [a column in the original primary key](partitioning.html#partition-using-primary-key). If you alter the primary key of a partitioned table, you must update the table partition accordingly.

- The secondary index created by `ALTER PRIMARY KEY` will not be partitioned, even if a partition is defined on [a column in the original primary key](partitioning.html#partition-using-primary-key). To ensure that the table is partitioned correctly, you must create a partition on the secondary index, or drop the secondary index.

{{site.data.alerts.callout_success}}
To change an existing primary key without creating a secondary index from that primary key, use [`DROP CONSTRAINT ... PRIMARY KEY`/`ADD CONSTRAINT ... PRIMARY KEY`](add-constraint.html#changing-primary-keys-with-add-constraint-primary-key). For examples, see the [`ADD CONSTRAINT`](add-constraint.html#examples) and [`DROP CONSTRAINT`](drop-constraint.html#examples) pages.
{{site.data.alerts.end}}

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/alter_primary_key.html %}
</div>

## Parameters

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table with the primary key that you want to modify.
 `index_params` | The name of the column(s) that you want to use for the primary key. These columns replace the current primary key column(s).
 `opt_interleave` | You can potentially optimize query performance by [interleaving tables](interleave-in-parent.html), which changes how CockroachDB stores your data.<br>{{site.data.alerts.callout_info}}[Hash-sharded indexes](indexes.html#hash-sharded-indexes) cannot be interleaved.{{site.data.alerts.end}}
 `USING HASH WITH BUCKET COUNT` | Creates a [hash-sharded index](indexes.html#hash-sharded-indexes) with `n_buckets` number of buckets.<br>{{site.data.alerts.callout_info}}To enable hash-sharded indexes, set the `experimental_enable_hash_sharded_indexes` [session variable](set-vars.html) to `on`.{{site.data.alerts.end}}

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on a table to alter its primary key.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

### Alter a single-column primary key

Suppose that you are storing the data for users of your application in a table called `users`, defined by the following `CREATE TABLE` statement:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
  name STRING PRIMARY KEY,
  email STRING
);
~~~

The primary key of this table is on the `name` column. This is a poor choice, as some users likely have the same name, and all primary keys enforce a `UNIQUE` constraint on row values of the primary key column. Per our [best practices](performance-best-practices-overview.html#use-uuid-to-generate-unique-ids), you should instead use a `UUID` for single-column primary keys, and populate the rows of the table with generated, unique values.

You can add a column and change the primary key with a couple of `ALTER TABLE` statements:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ADD COLUMN id UUID NOT NULL DEFAULT gen_random_uuid();
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ALTER PRIMARY KEY USING COLUMNS (id);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                create_statement
-------------+--------------------------------------------------
  users      | CREATE TABLE users (
             |     name STRING NOT NULL,
             |     email STRING NULL,
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
             |     UNIQUE INDEX users_name_key (name ASC),
             |     FAMILY "primary" (name, email, id)
             | )
(1 row)
~~~

Note that the old primary key index becomes a secondary index, in this case, `users_name_key`. If you do not want the old primary key to become a secondary index when changing a primary key, you can use [`DROP CONSTRAINT`](drop-constraint.html)/[`ADD CONSTRAINT`](add-constraint.html) instead.

### Make a single-column primary key composite for geo-partitioning

Suppose that you are storing the data for users of your application in a table called `users`, defined by the following `CREATE TABLE` statement:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email STRING,
  name STRING,
  INDEX users_name_idx (name)
);
~~~

Now suppose that you want to expand your business from a single region into multiple regions. After you [deploy your application in multiple regions](topology-patterns.html), you consider [geo-partitioning your data](topology-geo-partitioned-replicas.html) to minimize latency and optimize performance. In order to geo-partition the `user` database, you need to add a column specifying the location of the data (e.g., `region`):

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ADD COLUMN region STRING NOT NULL;
~~~

When you geo-partition a database, you [partition the database on a primary key column](partitioning.html#partition-using-primary-key). The primary key of this table is still on `id`. Change the primary key to be composite, on `region` and `id`:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ALTER PRIMARY KEY USING COLUMNS (region, id);
~~~
{{site.data.alerts.callout_info}}
The order of the primary key columns is important when geo-partitioning. For performance, always place the partition column first.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                      create_statement
-------------+-------------------------------------------------------------
  users      | CREATE TABLE users (
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     email STRING NULL,
             |     name STRING NULL,
             |     region STRING NOT NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (region ASC, id ASC),
             |     UNIQUE INDEX users_id_key (id ASC),
             |     INDEX users_name_idx (name ASC),
             |     FAMILY "primary" (id, email, name, region)
             | )
(1 row)
~~~

Note that the old primary key index on `id` is now the secondary index `users_id_key`.

With the new primary key on `region` and `id`, the table is ready to be [geo-partitioned](topology-geo-partitioned-replicas.html):

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users PARTITION BY LIST (region) (
    PARTITION us_west VALUES IN ('us_west'),
    PARTITION us_east VALUES IN ('us_east')
  );
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER PARTITION us_west OF INDEX users@primary
    CONFIGURE ZONE USING constraints = '[+region=us-west1]';
  ALTER PARTITION us_east OF INDEX users@primary
    CONFIGURE ZONE USING constraints = '[+region=us-east1]';
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW PARTITIONS FROM TABLE users;
~~~

~~~
  database_name | table_name | partition_name | parent_partition | column_names |  index_name   | partition_value |            zone_config             |          full_zone_config
----------------+------------+----------------+------------------+--------------+---------------+-----------------+------------------------------------+--------------------------------------
  movr          | users      | us_west        | NULL             | region       | users@primary | ('us_west')     | constraints = '[+region=us-west1]' | range_min_bytes = 134217728,
                |            |                |                  |              |               |                 |                                    | range_max_bytes = 536870912,
                |            |                |                  |              |               |                 |                                    | gc.ttlseconds = 90000,
                |            |                |                  |              |               |                 |                                    | num_replicas = 3,
                |            |                |                  |              |               |                 |                                    | constraints = '[+region=us-west1]',
                |            |                |                  |              |               |                 |                                    | lease_preferences = '[]'
  movr          | users      | us_east        | NULL             | region       | users@primary | ('us_east')     | constraints = '[+region=us-east1]' | range_min_bytes = 134217728,
                |            |                |                  |              |               |                 |                                    | range_max_bytes = 536870912,
                |            |                |                  |              |               |                 |                                    | gc.ttlseconds = 90000,
                |            |                |                  |              |               |                 |                                    | num_replicas = 3,
                |            |                |                  |              |               |                 |                                    | constraints = '[+region=us-east1]',
                |            |                |                  |              |               |                 |                                    | lease_preferences = '[]'
(2 rows)
~~~

The table is now geo-partitioned on the `region` column.

You now need to geo-partition any secondary indexes in the table. In order to geo-partition an index, the index must be prefixed by a column that can be used as a partitioning identifier (in this case, `region`). Currently, neither of the secondary indexes (i.e., `users_id_key` and `users_name_idx`) are prefixed by the `region` column, so they can't be meaningfully geo-partitioned. Any secondary indexes that you want to keep must be dropped, recreated, and then partitioned.

Start by dropping both indexes:

{% include copy-clipboard.html %}
~~~ sql
> DROP INDEX users_id_key CASCADE;
  DROP INDEX users_name_idx CASCADE;
~~~

You don't need to recreate the index on `id` with `region`. Both columns are already indexed by the new primary key.

Add `region` to the index on `name`:

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON users(region, name);
~~~

Then geo-partition the index:

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX users_region_name_idx PARTITION BY LIST (region) (
    PARTITION us_west VALUES IN ('us_west'),
    PARTITION us_east VALUES IN ('us_east')
  );
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER PARTITION us_west OF INDEX users@users_region_name_idx
    CONFIGURE ZONE USING constraints = '[+region=us-west1]';
  ALTER PARTITION us_east OF INDEX users@users_region_name_idx
    CONFIGURE ZONE USING constraints = '[+region=us-east1]';
~~~


## See also

- [Constraints](constraints.html)
- [`ADD CONSTRAINT`](add-constraint.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`ALTER TABLE`](alter-table.html)
- [`SHOW JOBS`](show-jobs.html)
