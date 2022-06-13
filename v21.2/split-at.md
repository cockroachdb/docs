---
title: SPLIT AT
summary: The SPLIT AT statement forces a range split at the specified row in a table or index.
toc: true
docs_area: reference.sql
---

The `SPLIT AT` [statement](sql-statements.html) forces a range split at the specified row in a table or index.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-21.2/grammar_svg/split_table_at.html %}
</div>

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-21.2/grammar_svg/split_index_at.html %}
</div>

## Required privileges

The user must have the `INSERT` [privilege](security-reference/authorization.html#managing-privileges) on the table or index.

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

## Examples

{% include {{page.version.version}}/sql/movr-statements-geo-partitioned-replicas.md %}

### Split a table

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW RANGES FROM TABLE users;
~~~

~~~
                                     start_key                                     |                                     end_key                                      | range_id | range_size_mb | lease_holder |  lease_holder_locality   | replicas |                             replica_localities
-----------------------------------------------------------------------------------+----------------------------------------------------------------------------------+----------+---------------+--------------+--------------------------+----------+-----------------------------------------------------------------------------
  NULL                                                                             | /"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |       37 |      0.000116 |            1 | region=us-east1,az=b     | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}
  /"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | /"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            |       46 |      0.000886 |            8 | region=europe-west1,az=c | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}
  /"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            | /"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   |       45 |       0.00046 |            8 | region=europe-west1,az=c | {2,4,8}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=c"}
  /"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   | /"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      |       44 |      0.001015 |            8 | region=europe-west1,az=c | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}
  /"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      | /"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            |       77 |      0.000214 |            8 | region=europe-west1,az=c | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}
  /"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            | /"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" |       43 |      0.001299 |            8 | region=europe-west1,az=c | {3,4,8}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=c"}
  /"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" | /"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         |       61 |      0.000669 |            3 | region=us-east1,az=d     | {3,4,8}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=c"}
  /"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         | /"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    |       57 |      0.000671 |            3 | region=us-east1,az=d     | {3,4,7}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=b"}
  /"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    | NULL                                                                             |       87 |      0.000231 |            4 | region=us-west1,az=a     | {3,4,7}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=b"}
(9 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users SPLIT AT VALUES ('chicago'), ('new york'), ('seattle');
~~~

~~~
              key              |   pretty    |        split_enforced_until
-------------------------------+-------------+--------------------------------------
  \275\211\022chicago\000\001  | /"chicago"  | 2262-04-11 23:47:16.854776+00:00:00
  \275\211\022new york\000\001 | /"new york" | 2262-04-11 23:47:16.854776+00:00:00
  \275\211\022seattle\000\001  | /"seattle"  | 2262-04-11 23:47:16.854776+00:00:00
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW RANGES FROM TABLE users;
~~~

~~~
                                     start_key                                     |                                     end_key                                      | range_id | range_size_mb | lease_holder |  lease_holder_locality   | replicas |                                 replica_localities
-----------------------------------------------------------------------------------+----------------------------------------------------------------------------------+----------+---------------+--------------+--------------------------+----------+-------------------------------------------------------------------------------------
  NULL                                                                             | /"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       |       37 |      0.000116 |            1 | region=us-east1,az=b     | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}
  /"amsterdam"/"\xb333333@\x00\x80\x00\x00\x00\x00\x00\x00#"                       | /"amsterdam"/PrefixEnd                                                           |       46 |      0.000446 |            8 | region=europe-west1,az=c | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
  /"amsterdam"/PrefixEnd                                                           | /"boston"                                                                        |       70 |             0 |            8 | region=europe-west1,az=c | {3,6,8}  | {"region=us-east1,az=d","region=us-west1,az=c","region=europe-west1,az=c"}
  /"boston"                                                                        | /"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            |       71 |       0.00044 |            1 | region=us-east1,az=b     | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}
  /"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\n"                            | /"boston"/PrefixEnd                                                              |       45 |      0.000225 |            2 | region=us-east1,az=c     | {2,3,8}  | {"region=us-east1,az=c","region=us-east1,az=d","region=europe-west1,az=c"}
  /"boston"/PrefixEnd                                                              | /"chicago"                                                                       |       72 |             0 |            8 | region=europe-west1,az=c | {2,4,8}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=c"}
  /"chicago"                                                                       | /"los angeles"                                                                   |       74 |             0 |            8 | region=europe-west1,az=c | {2,4,8}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=c"}
  /"los angeles"                                                                   | /"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   |       73 |      0.000235 |            8 | region=europe-west1,az=c | {2,4,8}  | {"region=us-east1,az=c","region=us-west1,az=a","region=europe-west1,az=c"}
  /"los angeles"/"\x99\x99\x99\x99\x99\x99H\x00\x80\x00\x00\x00\x00\x00\x00\x1e"   | /"los angeles"/PrefixEnd                                                         |       44 |      0.000462 |            4 | region=us-west1,az=a     | {4,6,8}  | {"region=us-west1,az=a","region=us-west1,az=c","region=europe-west1,az=c"}
  /"los angeles"/PrefixEnd                                                         | /"new york"                                                                      |       68 |             0 |            8 | region=europe-west1,az=c | {2,6,8}  | {"region=us-east1,az=c","region=us-west1,az=c","region=europe-west1,az=c"}
  /"new york"                                                                      | /"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      |       69 |      0.000553 |            8 | region=europe-west1,az=c | {1,3,8}  | {"region=us-east1,az=b","region=us-east1,az=d","region=europe-west1,az=c"}
  /"new york"/"\x19\x99\x99\x99\x99\x99J\x00\x80\x00\x00\x00\x00\x00\x00\x05"      | /"new york"/PrefixEnd                                                            |       77 |      0.000111 |            1 | region=us-east1,az=b     | {1,6,8}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=c"}
  /"new york"/PrefixEnd                                                            | /"paris"                                                                         |       62 |             0 |            8 | region=europe-west1,az=c | {3,4,8}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=c"}
  /"paris"                                                                         | /"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            |       63 |      0.000103 |            8 | region=europe-west1,az=c | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
  /"paris"/"\xcc\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x00("            | /"paris"/PrefixEnd                                                               |       43 |      0.000525 |            8 | region=europe-west1,az=c | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
  /"paris"/PrefixEnd                                                               | /"rome"                                                                          |       64 |             0 |            8 | region=europe-west1,az=c | {3,4,8}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=c"}
  /"rome"                                                                          | /"rome"/PrefixEnd                                                                |       65 |      0.000539 |            8 | region=europe-west1,az=c | {7,8,9}  | {"region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}
  /"rome"/PrefixEnd                                                                | /"san francisco"                                                                 |       66 |             0 |            8 | region=europe-west1,az=c | {3,4,8}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=c"}
  /"san francisco"                                                                 | /"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" |       67 |      0.000235 |            4 | region=us-west1,az=a     | {4,5,8}  | {"region=us-west1,az=a","region=us-west1,az=b","region=europe-west1,az=c"}
  /"san francisco"/"\x80\x00\x00\x00\x00\x00@\x00\x80\x00\x00\x00\x00\x00\x00\x19" | /"san francisco"/PrefixEnd                                                       |       61 |      0.000365 |            4 | region=us-west1,az=a     | {4,5,6}  | {"region=us-west1,az=a","region=us-west1,az=b","region=us-west1,az=c"}
  /"san francisco"/PrefixEnd                                                       | /"seattle"                                                                       |       88 |             0 |            3 | region=us-east1,az=d     | {3,4,8}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=c"}
  /"seattle"                                                                       | /"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         |       89 |      0.000304 |            3 | region=us-east1,az=d     | {3,4,8}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=c"}
  /"seattle"/"ffffffH\x00\x80\x00\x00\x00\x00\x00\x00\x14"                         | /"seattle"/PrefixEnd                                                             |       57 |      0.000327 |            3 | region=us-east1,az=d     | {3,4,7}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=b"}
  /"seattle"/PrefixEnd                                                             | /"washington dc"                                                                 |       90 |             0 |            3 | region=us-east1,az=d     | {3,4,7}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=b"}
  /"washington dc"                                                                 | /"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    |       91 |      0.000344 |            3 | region=us-east1,az=d     | {1,2,3}  | {"region=us-east1,az=b","region=us-east1,az=c","region=us-east1,az=d"}
  /"washington dc"/"L\xcc\xcc\xcc\xcc\xccL\x00\x80\x00\x00\x00\x00\x00\x00\x0f"    | /"washington dc"/PrefixEnd                                                       |       87 |      0.000231 |            3 | region=us-east1,az=d     | {1,2,3}  | {"region=us-east1,az=b","region=us-east1,az=c","region=us-east1,az=d"}
  /"washington dc"/PrefixEnd                                                       | NULL                                                                             |      157 |             0 |            4 | region=us-west1,az=a     | {3,4,7}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=b"}
(27 rows)
~~~

### Split a table with a compound primary key

You may want to split a table with a compound primary key.

Suppose that you want MovR to offer ride-sharing services, in addition to vehicle-sharing services. Some users need to sign up to be drivers, so you need a `drivers` table to store driver information.

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO drivers (id, city, name, address)
    SELECT id, city, name, address FROM users;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW RANGES FROM TABLE drivers;
~~~

~~~
  start_key | end_key | range_id | range_size_mb | lease_holder |  lease_holder_locality   | replicas |                             replica_localities
------------+---------+----------+---------------+--------------+--------------------------+----------+-----------------------------------------------------------------------------
  NULL      | NULL    |      310 |      0.007218 |            7 | region=europe-west1,az=b | {1,4,7}  | {"region=us-east1,az=b","region=us-west1,az=a","region=europe-west1,az=b"}
(1 row)
~~~

Now you can split the table based on the compound primary key. Note that you do not have to specify the entire value for the primary key, just the prefix.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE drivers SPLIT AT VALUES ('new york', '3'), ('new york', '7'), ('chicago', '3'), ('chicago', '7'), ('seattle', '3'), ('seattle', '7');
~~~

~~~
                     key                    |     pretty      |        split_enforced_until
--------------------------------------------+-----------------+--------------------------------------
  \303\211\022new york\000\001\0223\000\001 | /"new york"/"3" | 2262-04-11 23:47:16.854776+00:00:00
  \303\211\022new york\000\001\0227\000\001 | /"new york"/"7" | 2262-04-11 23:47:16.854776+00:00:00
  \303\211\022chicago\000\001\0223\000\001  | /"chicago"/"3"  | 2262-04-11 23:47:16.854776+00:00:00
  \303\211\022chicago\000\001\0227\000\001  | /"chicago"/"7"  | 2262-04-11 23:47:16.854776+00:00:00
  \303\211\022seattle\000\001\0223\000\001  | /"seattle"/"3"  | 2262-04-11 23:47:16.854776+00:00:00
  \303\211\022seattle\000\001\0227\000\001  | /"seattle"/"7"  | 2262-04-11 23:47:16.854776+00:00:00
(6 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW RANGES FROM TABLE drivers;
~~~

~~~
     start_key    |     end_key     | range_id | range_size_mb | lease_holder |  lease_holder_locality   | replicas |                             replica_localities
------------------+-----------------+----------+---------------+--------------+--------------------------+----------+-----------------------------------------------------------------------------
  NULL            | /"chicago"/"3"  |      310 |      0.001117 |            7 | region=europe-west1,az=b | {3,4,7}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=b"}
  /"chicago"/"3"  | /"chicago"/"7"  |      314 |             0 |            7 | region=europe-west1,az=b | {3,4,7}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=b"}
  /"chicago"/"7"  | /"new york"/"3" |      315 |      0.000933 |            7 | region=europe-west1,az=b | {3,4,7}  | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=b"}
  /"new york"/"3" | /"new york"/"7" |      311 |             0 |            7 | region=europe-west1,az=b | {1,4,7}  | {"region=us-east1,az=b","region=us-west1,az=a","region=europe-west1,az=b"}
  /"new york"/"7" | /"seattle"/"3"  |      312 |      0.001905 |            7 | region=europe-west1,az=b | {1,4,7}  | {"region=us-east1,az=b","region=us-west1,az=a","region=europe-west1,az=b"}
  /"seattle"/"3"  | /"seattle"/"7"  |      316 |      0.000193 |            7 | region=europe-west1,az=b | {1,6,7}  | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=b"}
  /"seattle"/"7"  | NULL            |      317 |       0.00307 |            7 | region=europe-west1,az=b | {1,4,7}  | {"region=us-east1,az=b","region=us-west1,az=a","region=europe-west1,az=b"}
(7 rows)
~~~

### Split an index

Add a new secondary [index](indexes.html) to the `rides` table, on the `revenue` column:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX revenue_idx ON rides(revenue);
~~~

Then split the table ranges by secondary index values:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER INDEX rides@revenue_idx SPLIT AT VALUES (25.00), (50.00), (75.00);
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
> SHOW RANGES FROM INDEX rides@revenue_idx;
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

### Set the expiration on a split enforcement

You can specify the time at which a split enforcement expires by adding a `WITH EXPIRATION` clause to your `SPLIT` statement. Supported expiration values include [`DECIMAL`](decimal.html), [`INTERVAL`](interval.html), [`TIMESTAMP`](timestamp.html), and [`TIMESTAMPZ`](timestamp.html).

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE vehicles SPLIT AT VALUES ('chicago'), ('new york'), ('seattle') WITH EXPIRATION '2022-01-10 23:30:00+00:00';
~~~
~~~
              key              |   pretty    |     split_enforced_until
-------------------------------+-------------+-------------------------------
  \276\211\022chicago\000\001  | /"chicago"  | 2022-01-10 23:30:00+00:00:00
  \276\211\022new york\000\001 | /"new york" | 2022-01-10 23:30:00+00:00:00
  \276\211\022seattle\000\001  | /"seattle"  | 2022-01-10 23:30:00+00:00:00
(3 rows)
~~~

You can see the split's expiration date in the `split_enforced_until` column. The `crdb_internal.ranges` table also contains information about ranges in your CockroachDB cluster, including the `split_enforced_until` column.

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT range_id, start_pretty, end_pretty, split_enforced_until FROM crdb_internal.ranges WHERE table_name='vehicles';
~~~

~~~
  range_id |                                       start_pretty                                        |                                        end_pretty                                         |        split_enforced_until
-----------+-------------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------------+--------------------------------------
        38 | /Table/54                                                                                 | /Table/54/1/"amsterdam"                                                                   | NULL
        55 | /Table/54/1/"amsterdam"                                                                   | /Table/54/1/"amsterdam"/PrefixEnd                                                         | NULL
       109 | /Table/54/1/"amsterdam"/PrefixEnd                                                         | /Table/54/1/"boston"                                                                      | NULL
       114 | /Table/54/1/"boston"                                                                      | /Table/54/1/"boston"/"\"\"\"\"\"\"B\x00\x80\x00\x00\x00\x00\x00\x00\x02"                  | NULL
        50 | /Table/54/1/"boston"/"\"\"\"\"\"\"B\x00\x80\x00\x00\x00\x00\x00\x00\x02"                  | /Table/54/1/"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\x03"                        | 2262-04-11 23:47:16.854776+00:00:00
        49 | /Table/54/1/"boston"/"333333D\x00\x80\x00\x00\x00\x00\x00\x00\x03"                        | /Table/54/1/"boston"/PrefixEnd                                                            | 2262-04-11 23:47:16.854776+00:00:00
       129 | /Table/54/1/"boston"/PrefixEnd                                                            | /Table/54/1/"chicago"                                                                     | NULL
       241 | /Table/54/1/"chicago"                                                                     | /Table/54/1/"los angeles"                                                                 | 2022-01-10 23:30:00+00:00:00
       130 | /Table/54/1/"los angeles"                                                                 | /Table/54/1/"los angeles"/PrefixEnd                                                       | NULL
       131 | /Table/54/1/"los angeles"/PrefixEnd                                                       | /Table/54/1/"new york"                                                                    | NULL
       132 | /Table/54/1/"new york"                                                                    | /Table/54/1/"new york"/"\x11\x11\x11\x11\x11\x11A\x00\x80\x00\x00\x00\x00\x00\x00\x01"    | 2022-01-10 23:30:00+00:00:00
        48 | /Table/54/1/"new york"/"\x11\x11\x11\x11\x11\x11A\x00\x80\x00\x00\x00\x00\x00\x00\x01"    | /Table/54/1/"new york"/PrefixEnd                                                          | 2262-04-11 23:47:16.854776+00:00:00
...
(46 rows)
~~~


## See also

- [Selection Queries](selection-queries.html)
- [Distribution Layer](architecture/distribution-layer.html)
- [Replication Layer](architecture/replication-layer.html)
- [`SHOW JOBS`](show-jobs.html)
- [`UNSPLIT AT`](unsplit-at.html)
