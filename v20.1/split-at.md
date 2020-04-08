---
title: SPLIT AT
summary: The SPLIT AT statement forces a range split at the specified row in a table or index.
toc: true
---

The `SPLIT AT` [statement](sql-statements.html) forces a range split at the specified row in a table or index.

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
 `a_expr` | The expiration of the split enforcement on the table or index. This can be a [`DECIMAL`](decimal.html), [`INTERVAL`](interval.html), [`TIMESTAMP`](timestamp.html), or [`TIMESTAMPZ`](timestamp.html).

## Why manually split a range?

CockroachDB breaks data into ranges. By default, CockroachDB attempts to keep ranges below
a size of 512 MiB. To do this, the system will automatically [split](architecture/distribution-layer.html#range-splits)
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

### Setup

{% include {{page.version.version}}/sql/movr-statements-partitioning.md %}

### Split a table

{% include copy-clipboard.html %}
~~~ sql
> SHOW RANGES FROM TABLE users;
~~~

~~~
  start_key | end_key | range_id | range_size_mb | lease_holder | lease_holder_locality | replicas |                  replica_localities
+-----------+---------+----------+---------------+--------------+-----------------------+----------+------------------------------------------------------+
  NULL      | NULL    |       25 |      0.005563 |            8 | region=us-west1       | {3,5,8}  | {region=us-east1,region=us-central1,region=us-west1}
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users SPLIT AT VALUES ('chicago'), ('new york'), ('seattle');
~~~

~~~
              key              |         pretty         |       split_enforced_until
+------------------------------+------------------------+----------------------------------+
  \275\211\022chicago\000\001  | /Table/53/1/"chicago"  | 2262-04-11 23:47:16.854776+00:00
  \275\211\022new york\000\001 | /Table/53/1/"new york" | 2262-04-11 23:47:16.854776+00:00
  \275\211\022seattle\000\001  | /Table/53/1/"seattle"  | 2262-04-11 23:47:16.854776+00:00
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW RANGES FROM TABLE users;
~~~

~~~
   start_key  |   end_key   | range_id | range_size_mb | lease_holder | lease_holder_locality | replicas |                  replica_localities
+-------------+-------------+----------+---------------+--------------+-----------------------+----------+------------------------------------------------------+
  NULL        | /"chicago"  |       25 |      0.000872 |            8 | region=us-west1       | {3,5,8}  | {region=us-east1,region=us-central1,region=us-west1}
  /"chicago"  | /"new york" |       45 |      0.001943 |            8 | region=us-west1       | {3,5,8}  | {region=us-east1,region=us-central1,region=us-west1}
  /"new york" | /"seattle"  |       46 |       0.00184 |            8 | region=us-west1       | {3,5,8}  | {region=us-east1,region=us-central1,region=us-west1}
  /"seattle"  | NULL        |       47 |      0.000908 |            7 | region=us-west1       | {1,4,7}  | {region=us-east1,region=us-central1,region=us-west1}
(4 rows)
~~~

### Split a table with a compound primary key

You may want to split a table with a compound primary key.

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

{% include copy-clipboard.html %}
~~~ sql
> SHOW RANGES FROM TABLE drivers;
~~~

~~~
  start_key | end_key | range_id | range_size_mb | lease_holder | lease_holder_locality | replicas |                  replica_localities
+-----------+---------+----------+---------------+--------------+-----------------------+----------+------------------------------------------------------+
  NULL      | NULL    |       45 |      0.007222 |            6 | region=us-central1    | {1,6,9}  | {region=us-east1,region=us-central1,region=us-west1}
(1 row)
~~~

Now you can split the table based on the compound primary key. Note that you don't have to specify the entire value for the primary key, just the prefix.

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE drivers SPLIT AT VALUES ('new york', '3'), ('new york', '7'), ('chicago', '3'), ('chicago', '7'), ('seattle', '3'), ('seattle', '7');
~~~

~~~
                     key                    |           pretty           |       split_enforced_until
+-------------------------------------------+----------------------------+----------------------------------+
  \303\211\022new york\000\001\0223\000\001 | /Table/59/1/"new york"/"3" | 2262-04-11 23:47:16.854776+00:00
  \303\211\022new york\000\001\0227\000\001 | /Table/59/1/"new york"/"7" | 2262-04-11 23:47:16.854776+00:00
  \303\211\022chicago\000\001\0223\000\001  | /Table/59/1/"chicago"/"3"  | 2262-04-11 23:47:16.854776+00:00
  \303\211\022chicago\000\001\0227\000\001  | /Table/59/1/"chicago"/"7"  | 2262-04-11 23:47:16.854776+00:00
  \303\211\022seattle\000\001\0223\000\001  | /Table/59/1/"seattle"/"3"  | 2262-04-11 23:47:16.854776+00:00
  \303\211\022seattle\000\001\0227\000\001  | /Table/59/1/"seattle"/"7"  | 2262-04-11 23:47:16.854776+00:00
(6 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW RANGES FROM TABLE drivers;
~~~

~~~
     start_key    |     end_key     | range_id | range_size_mb | lease_holder | lease_holder_locality | replicas |                   replica_localities
+-----------------+-----------------+----------+---------------+--------------+-----------------------+----------+---------------------------------------------------------+
  NULL            | /"chicago"/"3"  |       45 |      0.000792 |            6 | region=us-central1    | {1,6,9}  | {region=us-east1,region=us-central1,region=us-west1}
  /"chicago"/"3"  | /"chicago"/"7"  |       48 |      0.000316 |            1 | region=us-east1       | {1,5,6}  | {region=us-east1,region=us-central1,region=us-central1}
  /"chicago"/"7"  | /"new york"/"3" |       49 |      0.001452 |            6 | region=us-central1    | {1,6,9}  | {region=us-east1,region=us-central1,region=us-west1}
  /"new york"/"3" | /"new york"/"7" |       46 |      0.000094 |            6 | region=us-central1    | {1,6,9}  | {region=us-east1,region=us-central1,region=us-west1}
  /"new york"/"7" | /"seattle"/"3"  |       47 |      0.001865 |            9 | region=us-west1       | {1,6,9}  | {region=us-east1,region=us-central1,region=us-west1}
  /"seattle"/"3"  | /"seattle"/"7"  |       50 |      0.000106 |            9 | region=us-west1       | {1,6,9}  | {region=us-east1,region=us-central1,region=us-west1}
  /"seattle"/"7"  | NULL            |       51 |      0.002597 |            9 | region=us-west1       | {1,6,9}  | {region=us-east1,region=us-central1,region=us-west1}
(7 rows)
~~~

### Split an index

Add a new secondary [index](indexes.html) to the `rides` table, on the `revenue` column:

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX revenue_idx ON rides(revenue);
~~~

Then split the table ranges by secondary index values:

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX rides@revenue_idx SPLIT AT VALUES (25.00), (50.00), (75.00);
~~~
~~~
         key        |      pretty      |       split_enforced_until
+-------------------+------------------+----------------------------------+
  \277\214*2\000    | /Table/55/4/25   | 2262-04-11 23:47:16.854776+00:00
  \277\214*d\000    | /Table/55/4/5E+1 | 2262-04-11 23:47:16.854776+00:00
  \277\214*\226\000 | /Table/55/4/75   | 2262-04-11 23:47:16.854776+00:00
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW RANGES FROM INDEX rides@revenue_idx;
~~~
~~~
  start_key | end_key | range_id | range_size_mb | lease_holder | lease_holder_locality | replicas |                  replica_localities
+-----------+---------+----------+---------------+--------------+-----------------------+----------+------------------------------------------------------+
  NULL      | /25     |       55 |      0.007446 |            6 | region=us-central1    | {3,6,9}  | {region=us-east1,region=us-central1,region=us-west1}
  /25       | /5E+1   |       56 |      0.008951 |            6 | region=us-central1    | {3,6,9}  | {region=us-east1,region=us-central1,region=us-west1}
  /5E+1     | /75     |       57 |      0.008205 |            2 | region=us-east1       | {2,6,9}  | {region=us-east1,region=us-central1,region=us-west1}
  /75       | NULL    |       60 |      0.009322 |            6 | region=us-central1    | {2,6,9}  | {region=us-east1,region=us-central1,region=us-west1}
(4 rows)
~~~

### Set the expiration on a split enforcement

You can specify the time at which a split enforcement expires by adding a `WITH EXPIRATION` clause to your `SPLIT` statement. Supported expiration values include [`DECIMAL`](decimal.html), [`INTERVAL`](interval.html), [`TIMESTAMP`](timestamp.html), and [`TIMESTAMPZ`](timestamp.html).

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE vehicles SPLIT AT VALUES ('chicago'), ('new york'), ('seattle') WITH EXPIRATION '2020-01-10 23:30:00+00:00';
~~~
~~~
              key              |         pretty         |   split_enforced_until
+------------------------------+------------------------+---------------------------+
  \276\211\022chicago\000\001  | /Table/54/1/"chicago"  | 2020-01-10 23:30:00+00:00
  \276\211\022new york\000\001 | /Table/54/1/"new york" | 2020-01-10 23:30:00+00:00
  \276\211\022seattle\000\001  | /Table/54/1/"seattle"  | 2020-01-10 23:30:00+00:00
(3 rows)
~~~

You can see the split's expiration date in the `split_enforced_until` column. The `crdb_internal.ranges` table also contains information about ranges in your CockroachDB cluster, including the `split_enforced_until` column.

{% include copy-clipboard.html %}
~~~ sql
> SELECT range_id, start_pretty, end_pretty, split_enforced_until FROM crdb_internal.ranges WHERE table_name='vehicles';
~~~

~~~
  range_id |      start_pretty      |       end_pretty       |   split_enforced_until
+----------+------------------------+------------------------+---------------------------+
        26 | /Table/54              | /Table/54/1/"chicago"  | NULL
        75 | /Table/54/1/"chicago"  | /Table/54/1/"new york" | 2020-01-10 23:30:00+00:00
        76 | /Table/54/1/"new york" | /Table/54/1/"seattle"  | 2020-01-10 23:30:00+00:00
        78 | /Table/54/1/"seattle"  | /Table/55              | 2020-01-10 23:30:00+00:00
(4 rows)
~~~


## See also

- [Selection Queries](selection-queries.html)
- [Distribution Layer](architecture/distribution-layer.html)
- [Replication Layer](architecture/replication-layer.html)
- [`SHOW JOBS`](show-jobs.html)
- [`UNSPLIT AT`](unsplit-at.html)
