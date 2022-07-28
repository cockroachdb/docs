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

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM users;
~~~

~~~
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
| table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit |
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
| users      | primary    |   false    |            1 | id          | ASC       |  false  |  false   |
| users      | name_idx   |    true    |            1 | name        | ASC       |  false  |  false   |
| users      | name_idx   |    true    |            2 | id          | ASC       |  false  |   true   |
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX users@name_idx RENAME TO users_name_idx;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM users;
~~~

~~~
+------------+----------------+------------+--------------+-------------+-----------+---------+----------+
| table_name |   index_name   | non_unique | seq_in_index | column_name | direction | storing | implicit |
+------------+----------------+------------+--------------+-------------+-----------+---------+----------+
| users      | primary        |   false    |            1 | id          | ASC       |  false  |  false   |
| users      | users_name_idx |    true    |            1 | name        | ASC       |  false  |  false   |
| users      | users_name_idx |    true    |            2 | id          | ASC       |  false  |   true   |
+------------+----------------+------------+--------------+-------------+-----------+---------+----------+
(3 rows)
~~~

### Create a replication zone for a secondary index

{% include {{ page.version.version }}/zone-configs/create-a-replication-zone-for-a-secondary-index.md %}

### Split and unsplit an index

For examples, see [Split an index](split-at.html#split-an-index) and [Unsplit an index](unsplit-at.html#split-and-unsplit-an-index).
