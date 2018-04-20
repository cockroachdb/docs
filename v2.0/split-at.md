---
title: SPLIT AT
summary: The SPLIT AT statement forces a key-value layer range split at the specified row in a table or index.
toc: false
---

The `SPLIT AT` [statement](sql-statements.html) forces a key-value layer range split at the specified row in a table or index.

<div id="toc"></div>

## Synopsis

<section>{% include sql/{{ page.version.version }}/diagrams/split_table_at.html %}</section>

<section>{% include sql/{{ page.version.version }}/diagrams/split_index_at.html %}</section>

## Required Privileges

The user must have the `INSERT` [privilege](privileges.html) on the table or index.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_name`<br>`table_name @ index_name` | The name of the table or index that should be split. |
| `select_stmt` | A [selection query](selection-queries.html) that produces one or more rows at which to split the table or index. |

## Why Manually Split a Range?

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

## Examples

### Split a Table

{% include copy-clipboard.html %}
~~~ sql
> SHOW TESTING_RANGES FROM TABLE kv;
~~~

~~~
+-----------+---------+----------+----------+--------------+
| Start Key | End Key | Range ID | Replicas | Lease Holder |
+-----------+---------+----------+----------+--------------+
| NULL      | NULL    |       72 | {1}      |            1 |
+-----------+---------+----------+----------+--------------+
(1 row)
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> SHOW TESTING_RANGES FROM TABLE kv;
~~~

~~~
+-----------+---------+----------+----------+--------------+
| Start Key | End Key | Range ID | Replicas | Lease Holder |
+-----------+---------+----------+----------+--------------+
| NULL      | /10     |       72 | {1}      |            1 |
| /10       | /20     |       73 | {1}      |            1 |
| /20       | /30     |       74 | {1}      |            1 |
| /30       | NULL    |       75 | {1}      |            1 |
+-----------+---------+----------+----------+--------------+
(4 rows)
~~~

### Split an Index

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX secondary ON kv (v);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TESTING_RANGES FROM INDEX kv@secondary;
~~~

~~~
+-----------+---------+----------+----------+--------------+
| Start Key | End Key | Range ID | Replicas | Lease Holder |
+-----------+---------+----------+----------+--------------+
| NULL      | NULL    |       75 | {1}      |            1 |
+-----------+---------+----------+----------+--------------+
(1 row)
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> SHOW TESTING_RANGES FROM INDEX kv@secondary;
~~~

~~~
+-----------+---------+----------+----------+--------------+
| Start Key | End Key | Range ID | Replicas | Lease Holder |
+-----------+---------+----------+----------+--------------+
| NULL      | /"a"    |       75 | {1}      |            1 |
| /"a"      | /"b"    |       76 | {1}      |            1 |
| /"b"      | /"c"    |       77 | {1}      |            1 |
| /"c"      | NULL    |       78 | {1}      |            1 |
+-----------+---------+----------+----------+--------------+
(4 rows)
~~~

## See Also

- [Selection Queries](selection-queries.html)
- [Distribution Layer](architecture/distribution-layer.html)
- [Replication Layer](architecture/replication-layer.html)
