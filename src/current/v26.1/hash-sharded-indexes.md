---
title: Index Sequential Keys with Hash-sharded Indexes
summary: Hash-sharded indexes can eliminate single-range hotspots and improve write performance on sequentially-keyed indexes at a small cost to read performance
toc: true
docs_area: develop
---

If you are working with a table that must be indexed on sequential keys, you should use **hash-sharded indexes**. Hash-sharded indexes distribute sequential traffic uniformly across ranges, eliminating single-range hotspots and improving write performance on sequentially-keyed indexes at a small cost to read performance.

{{site.data.alerts.callout_info}}
Hash-sharded indexes are an implementation of hash partitioning, not hash indexing.
{{site.data.alerts.end}}

## How hash-sharded indexes work

### Overview

CockroachDB automatically splits ranges of data in [the key-value store]({% link {{ page.version.version }}/architecture/storage-layer.md %}) based on [the size of the range]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#range-splits) and on [the load streaming to the range]({% link {{ page.version.version }}/load-based-splitting.md %}). To split a range based on load, the system looks for a point in the range that evenly divides incoming traffic. If the range is indexed on a column of data that is sequential in nature (e.g., [an ordered sequence]({% link {{ page.version.version }}/sql-faqs.md %}#what-are-the-differences-between-uuid-sequences-and-unique_rowid) or a series of increasing, non-repeating [`TIMESTAMP`s](timestamp.html)), then all incoming writes to the range will be the last (or first) item in the index and appended to the end of the range. As a result, the system cannot find a point in the range that evenly divides the traffic, and the range cannot benefit from load-based splitting, creating a [hotspot]({% link {{ page.version.version }}/understand-hotspots.md %}) on the single range.

Hash-sharded indexes solve this problem by distributing sequential data across multiple nodes within your cluster, eliminating hotspots. The trade-off to this, however, is a small performance impact on reading sequential data or ranges of data, as it's not guaranteed that sequentially close values will be on the same node.

Hash-sharded indexes contain a [virtual computed column]({% link {{ page.version.version }}/computed-columns.md %}#virtual-computed-columns), known as a shard column. CockroachDB uses this shard column, as opposed to the sequential column in the index, to control the distribution of values across the index. The shard column is hidden by default but can be seen with [`SHOW COLUMNS`]({% link {{ page.version.version }}/show-columns.md %}).

{{site.data.alerts.callout_info}}
In v21.2 and earlier, hash-sharded indexes create a physical `STORED` [computed column]({% link {{ page.version.version }}/computed-columns.md %}) instead of a virtual computed column. If you are using a hash-sharded index that was created in v21.2 or earlier, the `STORED` column still exists in your database. When dropping a hash-sharded index that has created a physical shard column, you must include the [`CASCADE`]({% link {{ page.version.version }}/drop-index.md %}#remove-an-index-and-dependent-objects-with-cascade) clause to drop the shard column. Doing so will require a rewrite of the table.
{{site.data.alerts.end}}

For details about the mechanics and performance improvements of hash-sharded indexes in CockroachDB, see our [Hash Sharded Indexes Unlock Linear Scaling for Sequential Workloads](https://www.cockroachlabs.com/blog/hash-sharded-indexes-unlock-linear-scaling-for-sequential-workloads/) blog post.

{{site.data.alerts.callout_info}}
Hash-sharded indexes created in v22.1 and later will not [backfill]({% link {{ page.version.version }}/changefeed-messages.md %}#schema-changes-with-column-backfill), as the shard column isn't stored. Hash-sharded indexes created prior to v22.1 will backfill if `schema_change_policy` is set to `backfill`, as they use a stored column. If you don't want CockroachDB to backfill hash-sharded indexes you created prior to v22.1, drop them and recreate them.
{{site.data.alerts.end}}

### Shard count

When creating a hash-sharded index, CockroachDB creates a specified number of shards (buckets) within the cluster based on the value of the `sql.defaults.default_hash_sharded_index_bucket_count` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}). You can also specify a different `bucket_count` by passing in an optional storage parameter. See the example below.

For most use cases, no changes to the cluster setting are needed, and hash-sharded indexes can be created with `USING HASH` instead of `USING HASH WITH (bucket_count = n)`. Changing the cluster setting or storage parameter to a number greater than the number of nodes within that cluster will produce diminishing returns and is not recommended.

A larger number of buckets allows for greater load-balancing and thus greater write throughput. More buckets disadvantages operations that need to scan over the data to fulfill their query; such queries will now need to scan over each bucket and combine the results.

We recommend doing thorough performance testing of your workload with different `bucket_count`s if the default `bucket_count` does not satisfy your use case.

{% include {{page.version.version}}/sql/sql-defaults-cluster-settings-deprecation-notice.md %}

### Hash-sharded indexes on partitioned tables

You can create hash-sharded indexes with implicit partitioning under the following scenarios:

- The table is partitioned implicitly with [`REGIONAL BY ROW`]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables), and the `crdb_region` column is not part of the columns in the hash-sharded index.
- The table is partitioned implicitly with `PARTITION ALL BY`, and the partition columns are not part of the columns in the hash-sharded index. Note that `PARTITION ALL BY` is in preview.

However, if an index of a table, whether it be a primary key or secondary index, is explicitly partitioned with `PARTITION BY`, then that index cannot be hash-sharded. Partitioning columns cannot be placed explicitly as key columns of a hash-sharded index as well, including `REGIONAL BY ROW` table's `crdb_region` column.

## Create a hash-sharded index

The general process of creating a hash-sharded index is to add the `USING HASH` clause to one of the following statements:

- [`CREATE INDEX`]({% link {{ page.version.version }}/create-index.md %})
- [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %})
- [`ALTER PRIMARY KEY`]({% link {{ page.version.version }}/alter-table.md %}#alter-primary-key)

When this clause is used, CockroachDB creates a computed shard column and then stores each index shard in the underlying key-value store with one of the computed column's hash as its prefix.

## Examples

### Create a table with a hash-sharded primary key

{% include {{page.version.version}}/performance/create-table-hash-sharded-primary-index.md %}

### Create a table with a hash-sharded secondary index

{% include {{page.version.version}}/performance/create-table-hash-sharded-secondary-index.md %}

### Create a hash-sharded secondary index on an existing table

{% include {{page.version.version}}/performance/create-index-hash-sharded-secondary-index.md %}

### Alter an existing primary key to use hash sharding

{% include {{page.version.version}}/performance/alter-primary-key-hash-sharded.md %}

### Show hash-sharded index in `SHOW CREATE TABLE`

Following the above [example](#create-a-hash-sharded-secondary-index-on-an-existing-table), you can show the hash-sharded index definition along with the table creation statement using `SHOW CREATE TABLE`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE events;
~~~

~~~
  table_name |                                                        create_statement
-------------+---------------------------------------------------------------------------------------------------------------------------------
  events     | CREATE TABLE public.events (
             |     product_id INT8 NOT NULL,
             |     owner UUID NOT NULL,
             |     serial_number VARCHAR NOT NULL,
             |     event_id UUID NOT NULL,
             |     ts TIMESTAMP NOT NULL,
             |     data JSONB NULL,
             |     crdb_internal_ts_shard_16 INT8 NOT VISIBLE NOT NULL AS (mod(fnv32(crdb_internal.datums_to_bytes(ts)), 16:::INT8)) VIRTUAL,
             |     CONSTRAINT events_pkey PRIMARY KEY (product_id ASC, owner ASC, serial_number ASC, ts ASC, event_id ASC),
             |     INDEX events_ts_idx (ts ASC) USING HASH WITH (bucket_count=16)
             | )
(1 row)
~~~

### Create a hash-sharded secondary index with a different `bucket_count`

You can specify a different `bucket_count` via a storage parameter on a hash-sharded index to optimize either write performance or sequential read performance on a table:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE events (
    product_id INT8,
    owner UUID,
    serial_number VARCHAR,
    event_id UUID,
    ts TIMESTAMP,
    data JSONB,
    PRIMARY KEY (product_id, owner, serial_number, ts, event_id),
    INDEX (ts) USING HASH WITH (bucket_count = 20)
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM events;
~~~

~~~
  table_name |  index_name   | non_unique | seq_in_index |        column_name        | direction | storing | implicit
-------------+---------------+------------+--------------+---------------------------+-----------+---------+-----------
  events     | events_pkey   |   false    |            1 | product_id                | ASC       |  false  |  false
  events     | events_pkey   |   false    |            2 | owner                     | ASC       |  false  |  false
  events     | events_pkey   |   false    |            3 | serial_number             | ASC       |  false  |  false
  events     | events_pkey   |   false    |            4 | ts                        | ASC       |  false  |  false
  events     | events_pkey   |   false    |            5 | event_id                  | ASC       |  false  |  false
  events     | events_pkey   |   false    |            6 | data                      | N/A       |  true   |  false
  events     | events_ts_idx |    true    |            1 | crdb_internal_ts_shard_20 | ASC       |  false  |   true
  events     | events_ts_idx |    true    |            2 | ts                        | ASC       |  false  |  false
  events     | events_ts_idx |    true    |            3 | product_id                | ASC       |  false  |   true
  events     | events_ts_idx |    true    |            4 | owner                     | ASC       |  false  |   true
  events     | events_ts_idx |    true    |            5 | serial_number             | ASC       |  false  |   true
  events     | events_ts_idx |    true    |            6 | event_id                  | ASC       |  false  |   true
(12 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM events;
~~~

~~~
         column_name        | data_type | is_nullable | column_default |               generation_expression               |           indices           | is_hidden
----------------------------+-----------+-------------+----------------+---------------------------------------------------+-----------------------------+------------
  product_id                | INT8      |    false    | NULL           |                                                   | {events_pkey,events_ts_idx} |   false
  owner                     | UUID      |    false    | NULL           |                                                   | {events_pkey,events_ts_idx} |   false
  serial_number             | VARCHAR   |    false    | NULL           |                                                   | {events_pkey,events_ts_idx} |   false
  event_id                  | UUID      |    false    | NULL           |                                                   | {events_pkey,events_ts_idx} |   false
  ts                        | TIMESTAMP |    false    | NULL           |                                                   | {events_pkey,events_ts_idx} |   false
  data                      | JSONB     |    true     | NULL           |                                                   | {events_pkey}               |   false
  crdb_internal_ts_shard_20 | INT8      |    false    | NULL           | mod(fnv32(crdb_internal.datums_to_bytes(ts)), 20) | {events_ts_idx}             |   true
(7 rows)
~~~


## See also

- [Indexes]({% link {{ page.version.version }}/indexes.md %})
- [`CREATE INDEX`]({% link {{ page.version.version }}/create-index.md %})
- [`UUID`]({% link {{ page.version.version }}/uuid.md %})
