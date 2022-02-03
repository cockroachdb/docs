---
title: UNSPLIT AT
summary: The UNSPLIT AT statement removes a range split enforcement at a specified row in the table or index.
toc: true
---

The `UNSPLIT AT` [statement](sql-statements.html) removes a [split enforcement](split-at.html) on a [range split](architecture/distribution-layer.html#range-splits), at a specified row in a table or index.

Removing a split enforcement from a table or index ("unsplitting") allows CockroachDB to merge ranges as needed, to help improve your cluster's performance. For more information, see [Range Merges](architecture/distribution-layer.html#range-merges).

## Synopsis

<div>
{% include {{ page.version.version }}/sql/generated/diagrams/unsplit_table_at.html %}
</div>

<div>
{% include {{ page.version.version }}/sql/generated/diagrams/unsplit_index_at.html %}
</div>

## Required privileges

The user must have the `INSERT` [privilege](authorization.html#assign-privileges) on the table or index.

## Parameters

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table that you want to unsplit.
 `table_name @ index_name`<br>`standalone_index_name` | The name of the index that you want to unsplit.
 `select_stmt` | A [selection query](selection-queries.html) that produces one or more rows at which to unsplit a table or index.

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Unsplit a table

Suppose that you want MovR to offer ride-sharing services, in addition to vehicle-sharing services. Some users need to sign up to be drivers, so you need a `drivers` table to store driver information.

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE drivers (
    id UUID DEFAULT gen_random_uuid(),
    city STRING,
    name STRING,
    dl STRING DEFAULT left(md5(random()::text),8) UNIQUE CHECK (LENGTH(dl) < 9),
    address STRING,
    CONSTRAINT "primary" PRIMARY KEY (city ASC, dl ASC)
);
~~~

The table's compound primary key is on the `city` and `dl` columns. Note that the table automatically generates an `id` and a `dl` [using supported SQL functions](functions-and-operators.html), if they are not provided.

Because this table has several columns in common with the `users` table, you can populate the table with values from the `users` table with an `INSERT` statement:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO drivers (id, city, name, address)
    SELECT id, city, name, address FROM users;
~~~

 At this point, just one range contains the data in the `drivers` table.

{% include copy-clipboard.html %}
~~~ sql
> SHOW RANGES FROM TABLE drivers;
~~~

~~~
  start_key | end_key | range_id | range_size_mb | lease_holder | lease_holder_locality | replicas |    replica_localities
------------+---------+----------+---------------+--------------+-----------------------+----------+---------------------------
  NULL      | NULL    |       74 |      0.007218 |            1 | region=us-east1,az=b  | {1}      | {"region=us-east1,az=b"}
(1 row)
~~~

You can [split](split-at.html) the table based on the compound primary key. Note that you do not have to specify the entire value for the primary key, just the prefix.

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE drivers SPLIT AT VALUES ('new york', '3'), ('new york', '7'), ('chicago', '3'), ('chicago', '7'), ('seattle', '3'), ('seattle', '7');
~~~

~~~
                     key                    |     pretty      |    split_enforced_until
--------------------------------------------+-----------------+-----------------------------
  \xc3\x89\x12new york\x00\x01\x123\x00\x01 | /"new york"/"3" | 2262-04-11 23:47:16.854776
  \xc3\x89\x12new york\x00\x01\x127\x00\x01 | /"new york"/"7" | 2262-04-11 23:47:16.854776
  \xc3\x89\x12chicago\x00\x01\x123\x00\x01  | /"chicago"/"3"  | 2262-04-11 23:47:16.854776
  \xc3\x89\x12chicago\x00\x01\x127\x00\x01  | /"chicago"/"7"  | 2262-04-11 23:47:16.854776
  \xc3\x89\x12seattle\x00\x01\x123\x00\x01  | /"seattle"/"3"  | 2262-04-11 23:47:16.854776
  \xc3\x89\x12seattle\x00\x01\x127\x00\x01  | /"seattle"/"7"  | 2262-04-11 23:47:16.854776
(6 rows)
~~~

The [`crdb_internal.ranges`](crdb-internal.html) view contains additional information about ranges in your CockroachDB cluster, including the expiration of the split enforcement.

{% include copy-clipboard.html %}
~~~ sql
> SELECT range_id, start_pretty, end_pretty, split_enforced_until FROM crdb_internal.ranges WHERE table_name='drivers';
~~~

~~~
  range_id |        start_pretty        |         end_pretty         |    split_enforced_until
-----------+----------------------------+----------------------------+-----------------------------
        74 | /Table/59                  | /Table/59/1/"chicago"/"3"  | NULL
        77 | /Table/59/1/"chicago"/"3"  | /Table/59/1/"chicago"/"7"  | 2262-04-11 23:47:16.854776
        78 | /Table/59/1/"chicago"/"7"  | /Table/59/1/"new york"/"3" | 2262-04-11 23:47:16.854776
        75 | /Table/59/1/"new york"/"3" | /Table/59/1/"new york"/"7" | 2262-04-11 23:47:16.854776
        76 | /Table/59/1/"new york"/"7" | /Table/59/1/"seattle"/"3"  | 2262-04-11 23:47:16.854776
        79 | /Table/59/1/"seattle"/"3"  | /Table/59/1/"seattle"/"7"  | 2262-04-11 23:47:16.854776
        80 | /Table/59/1/"seattle"/"7"  | /Max                       | 2262-04-11 23:47:16.854776
(7 rows)
~~~

Now unsplit the table to remove the split enforcements:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE drivers UNSPLIT AT VALUES ('new york', '3'), ('new york', '7'), ('chicago', '3'), ('chicago', '7'), ('seattle', '3'), ('seattle', '7');
~~~

~~~
                     key                    |           pretty
--------------------------------------------+-----------------------------
  \xc3\x89\x12new york\x00\x01\x123\x00\x01 | /Table/59/1/"new york"/"3"
  \xc3\x89\x12new york\x00\x01\x127\x00\x01 | /Table/59/1/"new york"/"7"
  \xc3\x89\x12chicago\x00\x01\x123\x00\x01  | /Table/59/1/"chicago"/"3"
  \xc3\x89\x12chicago\x00\x01\x127\x00\x01  | /Table/59/1/"chicago"/"7"
  \xc3\x89\x12seattle\x00\x01\x123\x00\x01  | /Table/59/1/"seattle"/"3"
  \xc3\x89\x12seattle\x00\x01\x127\x00\x01  | /Table/59/1/"seattle"/"7"
(6 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT range_id, start_pretty, end_pretty, split_enforced_until FROM crdb_internal.ranges WHERE table_name='drivers';
~~~

~~~
  range_id |        start_pretty        |         end_pretty         | split_enforced_until
-----------+----------------------------+----------------------------+-----------------------
        74 | /Table/59                  | /Table/59/1/"chicago"/"3"  | NULL
        77 | /Table/59/1/"chicago"/"3"  | /Table/59/1/"chicago"/"7"  | NULL
        78 | /Table/59/1/"chicago"/"7"  | /Table/59/1/"new york"/"3" | NULL
        75 | /Table/59/1/"new york"/"3" | /Table/59/1/"new york"/"7" | NULL
        76 | /Table/59/1/"new york"/"7" | /Table/59/1/"seattle"/"3"  | NULL
        79 | /Table/59/1/"seattle"/"3"  | /Table/59/1/"seattle"/"7"  | NULL
        80 | /Table/59/1/"seattle"/"7"  | /Max                       | NULL
(7 rows)

~~~

The `drivers` table is still split into ranges at specific primary key column values, but the `split_enforced_until` column is now `NULL` for all ranges in the table. The split is no longer enforced, and CockroachDB can [merge the data](architecture/distribution-layer.html#range-merges) in the table as needed.

### Unsplit an index at specific points

{% include {{page.version.version}}/sql/unsplit-an-index.md %}

## See also

- [`SPLIT AT`](split-at.html)
- [Selection Queries](selection-queries.html)
- [Distribution Layer](architecture/distribution-layer.html)
- [Range Merges](architecture/distribution-layer.html#range-merges)
- [Replication Layer](architecture/replication-layer.html)
- [`SHOW JOBS`](show-jobs.html)
