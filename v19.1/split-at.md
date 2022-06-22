---
title: SPLIT AT
summary: The SPLIT AT statement forces a key-value layer range split at the specified row in a table or index.
toc: true
---

The `SPLIT AT` [statement](sql-statements.html) forces a key-value layer range split at the specified row in a table or index.

{{site.data.alerts.callout_info}}
In order to manually split a range, you must turn off automatic range merging by [setting the `kv.range_merge.queue_enabled` cluster setting](range-merges.html#enable-disable-range-merges) to `false`. <br><br> This limitation has been lifted in v19.2. If you disabled automatic range merging in order to use manual splits, and you are upgrading to v19.2, consider setting `kv.range_merge.queue_enabled` to `true` [to improve performance](range-merges.html#why-range-merges-improve-performance).
{{site.data.alerts.end}}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/split_table_at.html %}
</div>

<div>
  {% include {{ page.version.version }}/sql/diagrams/split_index_at.html %}
</div>

## Required privileges

The user must have the `INSERT` [privilege](authorization.html#assign-privileges) on the table or index.

## Parameters

 Parameter | Description
-----------|-------------
 `table_name`<br>`table_name @ index_name` | The name of the table or index that should be split.
 `select_stmt` | A [selection query](selection-queries.html) that produces one or more rows at which to split the table or index.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Why manually split a range?

The key-value layer of CockroachDB is broken into sections of contiguous
key-space known as ranges. By default, CockroachDB attempts to keep ranges below
a size of 64MiB. To do this, the system will automatically [split](architecture/distribution-layer.html#range-splits)
a range if it grows larger than this limit. For most use cases, this automatic
range splitting is sufficient, and you should never need to worry about
when or where the system decides to split ranges.

However, there are reasons why you may want to perform manual splits on
the ranges that store tables or indexes:

- When a table only consists of a single range, all writes and reads to the
  table will be served by that range's [leaseholder](architecture/replication-layer.html#leases).
  If a table only holds a small amount of data but is serving a large amount of traffic,
  load distribution can become unbalanced. Splitting the table's ranges manually
  can allow the load on the table to be more evenly distributed across multiple
  nodes. For tables consisting of more than a few ranges, load will naturally
  be distributed across multiple nodes and this will not be a concern.

- When a table is created, it will only consist of a single range. If you know
  that a new table will immediately receive significant write
  traffic, you may want to preemptively split the table based on the expected
  distribution of writes before applying the load. This can help avoid reduced
  workload performance that results when automatic splits are unable to keep up
  with write traffic.

Note that when a table is [truncated](truncate.html), it is essentially re-created in a single new empty range, and the old ranges that used to constitute the table are garbage collected. Any pre-splitting you have performed on the old version of the table will not carry over to the new version. The new table will need to be pre-split again.

## Examples

### Split a table

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW EXPERIMENTAL_RANGES FROM TABLE kv;
~~~

~~~
+-----------+---------+----------+----------+--------------+
| start_key | end_key | range_id | replicas | lease_holder |
+-----------+---------+----------+----------+--------------+
| NULL      | NULL    |       72 | {1}      |            1 |
+-----------+---------+----------+----------+--------------+
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE kv SPLIT AT VALUES (10), (20), (30);
~~~

~~~
+------------+----------------+
|    key     |     pretty     |
+------------+----------------+
| \u0209\x92 | /Table/64/1/10 |
| \u0209\x9c | /Table/64/1/20 |
| \u0209\xa6 | /Table/64/1/30 |
+------------+----------------+
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW EXPERIMENTAL_RANGES FROM TABLE kv;
~~~

~~~
+-----------+---------+----------+----------+--------------+
| start_key | end_key | range_id | replicas | lease_holder |
+-----------+---------+----------+----------+--------------+
| NULL      | /10     |       72 | {1}      |            1 |
| /10       | /20     |       73 | {1}      |            1 |
| /20       | /30     |       74 | {1}      |            1 |
| /30       | NULL    |       75 | {1}      |            1 |
+-----------+---------+----------+----------+--------------+
(4 rows)
~~~

### Split a table with a composite primary key

You may want to split a table with a composite primary key (e.g., when working with [partitions](partitioning.html#partition-using-primary-key)).

Given the table

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE t (k1 INT, k2 INT, v INT, w INT, PRIMARY KEY (k1, k2));
~~~

we can split it at its primary key like so:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE t SPLIT AT VALUES (5,1), (5,2), (5,3);
~~~

~~~
+------------+-----------------+
|    key     |     pretty      |
+------------+-----------------+
| \xbc898d89 | /Table/52/1/5/1 |
| \xbc898d8a | /Table/52/1/5/2 |
| \xbc898d8b | /Table/52/1/5/3 |
+------------+-----------------+
(3 rows)
~~~

To see more information about the range splits, run:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW EXPERIMENTAL_RANGES FROM TABLE t;
~~~

~~~
+-----------+---------+----------+----------+--------------+
| start_key | end_key | range_id | replicas | lease_holder |
+-----------+---------+----------+----------+--------------+
| NULL      | /5/1    |      151 | {2,3,5}  |            5 |
| /5/1      | /5/2    |      152 | {2,3,5}  |            5 |
| /5/2      | /5/3    |      153 | {2,3,5}  |            5 |
| /5/3      | NULL    |      154 | {2,3,5}  |            5 |
+-----------+---------+----------+----------+--------------+
(4 rows)
~~~

Alternatively, you could split at a prefix of the primary key columns. For example, to add a split before all keys that start with `3`, run:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE t SPLIT AT VALUES (3);
~~~

~~~
+----------+---------------+
|   key    |    pretty     |
+----------+---------------+
| \xcd898b | /Table/69/1/3 |
+----------+---------------+
(1 row)
~~~

Conceptually, this means that the second range will include keys that start with `3` through `∞`:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW EXPERIMENTAL_RANGES FROM TABLE t;
~~~

~~~
+-----------+---------+----------+----------+--------------+
| start_key | end_key | range_id | replicas | lease_holder |
+-----------+---------+----------+----------+--------------+
| NULL      | /3      |      155 | {2,3,5}  |            5 |
| /3        | NULL    |      165 | {2,3,5}  |            5 |
+-----------+---------+----------+----------+--------------+
(2 rows)
~~~

### Split an index

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX secondary ON kv (v);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW EXPERIMENTAL_RANGES FROM INDEX kv@secondary;
~~~

~~~
+-----------+---------+----------+----------+--------------+
| start_key | end_key | range_id | replicas | lease_holder |
+-----------+---------+----------+----------+--------------+
| NULL      | NULL    |       75 | {1}      |            1 |
+-----------+---------+----------+----------+--------------+
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER INDEX kv@secondary SPLIT AT (SELECT v FROM kv LIMIT 3);
~~~

~~~
+---------------------+-----------------+
|         key         |     pretty      |
+---------------------+-----------------+
| \u020b\x12a\x00\x01 | /Table/64/3/"a" |
| \u020b\x12b\x00\x01 | /Table/64/3/"b" |
| \u020b\x12c\x00\x01 | /Table/64/3/"c" |
+---------------------+-----------------+
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW EXPERIMENTAL_RANGES FROM INDEX kv@secondary;
~~~

~~~
+-----------+---------+----------+----------+--------------+
| start_key | end_key | range_id | replicas | lease_holder |
+-----------+---------+----------+----------+--------------+
| NULL      | /"a"    |       75 | {1}      |            1 |
| /"a"      | /"b"    |       76 | {1}      |            1 |
| /"b"      | /"c"    |       77 | {1}      |            1 |
| /"c"      | NULL    |       78 | {1}      |            1 |
+-----------+---------+----------+----------+--------------+
(4 rows)
~~~

## See also

- [Selection Queries](selection-queries.html)
- [Distribution Layer](architecture/distribution-layer.html)
- [Replication Layer](architecture/replication-layer.html)
- [`SHOW JOBS`](show-jobs.html)
