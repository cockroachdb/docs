---
title: UNSPLIT AT
summary: The UNSPLIT AT statement removes a key-value layer range split enforcement at a specified row in the table or index..
toc: true
---

The `UNSPLIT AT` [statement](sql-statements.html) removes a [split enforcement](split-at.html) on a key-value layer [range split](architecture/distribution-layer.html#range-splits), at a specified row in a table or index.

Removing a split enforcement from a table or index ("unsplitting") allows CockroachDB to merge ranges as needed, to help improve your cluster's performance. For more information, see [Range Merges](range-merges.html).

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/unsplit_table_at.html %}
</div>

<div>
  {% include {{ page.version.version }}/sql/diagrams/unsplit_index_at.html %}
</div>

## Required privileges

The user must have the `INSERT` [privilege](authorization.html#assign-privileges) on the table or index.

## Parameters

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table that you want to unsplit.
 `table_name @ index_name`<br>`standalone_index_name` | The name of the index that you want to unsplit.
 `select_stmt` | A [selection query](selection-queries.html) that produces one or more rows at which to unsplit a table or index.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

{% include {{page.version.version}}/sql/movr-statements-nodes.md %}

### Unsplit a table

The `crdb_internal.ranges` table contains information about ranges in your CockroachDB cluster. At this point, just one range contains the data in the `users` table:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM crdb_internal.ranges WHERE table_name='users';
~~~
~~~
  range_id | start_key | start_pretty | end_key | end_pretty | database_name | table_name | index_name | replicas | learner_replicas | split_enforced_until | lease_holder
+----------+-----------+--------------+---------+------------+---------------+------------+------------+----------+------------------+----------------------+--------------+
        21 | \275      | /Table/53    | \276    | /Table/54  | movr          | users      |            | {1,2,3}  | {}               | NULL                 |            1
(1 row)
~~~

Now split the `users` table ranges based on primary key values:

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

You can see the additional ranges in the `crdb_internal.ranges` table:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM crdb_internal.ranges WHERE table_name='users';
~~~
~~~
  range_id |          start_key           |      start_pretty      |           end_key            |       end_pretty       | database_name | table_name | index_name | replicas | learner_replicas |       split_enforced_until       | lease_holder
+----------+------------------------------+------------------------+------------------------------+------------------------+---------------+------------+------------+----------+------------------+----------------------------------+--------------+
        21 | \275                         | /Table/53              | \275\211\022chicago\000\001  | /Table/53/1/"chicago"  | movr          | users      |            | {1,2,3}  | {}               | NULL                             |            1
        27 | \275\211\022chicago\000\001  | /Table/53/1/"chicago"  | \275\211\022new york\000\001 | /Table/53/1/"new york" | movr          | users      |            | {1,2,3}  | {}               | 2262-04-11 23:47:16.854776+00:00 |            1
        28 | \275\211\022new york\000\001 | /Table/53/1/"new york" | \275\211\022seattle\000\001  | /Table/53/1/"seattle"  | movr          | users      |            | {1,2,3}  | {}               | 2262-04-11 23:47:16.854776+00:00 |            1
        29 | \275\211\022seattle\000\001  | /Table/53/1/"seattle"  | \276                         | /Table/54              | movr          | users      |            | {1,2,3}  | {}               | 2262-04-11 23:47:16.854776+00:00 |            1
(4 rows)
~~~

Now unsplit the table to remove the split enforcements:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users UNSPLIT AT VALUES ('chicago'), ('new york'), ('seattle');
~~~
~~~
              key              |         pretty
+------------------------------+------------------------+
  \275\211\022chicago\000\001  | /Table/53/1/"chicago"
  \275\211\022new york\000\001 | /Table/53/1/"new york"
  \275\211\022seattle\000\001  | /Table/53/1/"seattle"
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM crdb_internal.ranges WHERE table_name='users';
~~~
~~~
  range_id |          start_key           |      start_pretty      |           end_key            |       end_pretty       | database_name | table_name | index_name | replicas | learner_replicas | split_enforced_until | lease_holder
+----------+------------------------------+------------------------+------------------------------+------------------------+---------------+------------+------------+----------+------------------+----------------------+--------------+
        21 | \275                         | /Table/53              | \275\211\022chicago\000\001  | /Table/53/1/"chicago"  | movr          | users      |            | {1,2,3}  | {}               | NULL                 |            1
        27 | \275\211\022chicago\000\001  | /Table/53/1/"chicago"  | \275\211\022new york\000\001 | /Table/53/1/"new york" | movr          | users      |            | {1,2,3}  | {}               | NULL                 |            3
        28 | \275\211\022new york\000\001 | /Table/53/1/"new york" | \275\211\022seattle\000\001  | /Table/53/1/"seattle"  | movr          | users      |            | {1,2,3}  | {}               | NULL                 |            2
        29 | \275\211\022seattle\000\001  | /Table/53/1/"seattle"  | \276                         | /Table/54              | movr          | users      |            | {1,2,3}  | {}               | NULL                 |            1
(4 rows)
~~~

The `users` table is still split into ranges at `'chicago'`, `'new york'`, and `'seattle'`, but the `split_enforced_until` column is now `NULL` for all ranges in the table. The split is no longer enforced, and CockroachDB can merge the data in the table as needed.

### Unsplit an index

Add a new secondary [index](indexes.html) to the `rides` table, on the `revenue` column, and then split the table ranges by secondary index values:

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX revenue_idx ON rides(revenue);
~~~

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
> SELECT * FROM crdb_internal.ranges WHERE table_name='rides';
~~~
~~~
  range_id |     start_key     |   start_pretty   |      end_key      |    end_pretty    | database_name | table_name | index_name  | replicas | learner_replicas |       split_enforced_until       | lease_holder
+----------+-------------------+------------------+-------------------+------------------+---------------+------------+-------------+----------+------------------+----------------------------------+--------------+
        23 | \277              | /Table/55        | \277\214          | /Table/55/4      | movr          | rides      |             | {1,2,3}  | {}               | NULL                             |            1
        30 | \277\214          | /Table/55/4      | \277\214*2\000    | /Table/55/4/25   | movr          | rides      | revenue_idx | {1,2,3}  | {}               | 2019-09-03 18:01:02.973053+00:00 |            1
        31 | \277\214*2\000    | /Table/55/4/25   | \277\214*d\000    | /Table/55/4/5E+1 | movr          | rides      | revenue_idx | {1,2,3}  | {}               | 2262-04-11 23:47:16.854776+00:00 |            2
        32 | \277\214*d\000    | /Table/55/4/5E+1 | \277\214*\226\000 | /Table/55/4/75   | movr          | rides      | revenue_idx | {1,2,3}  | {}               | 2262-04-11 23:47:16.854776+00:00 |            1
        33 | \277\214*\226\000 | /Table/55/4/75   | \300              | /Table/56        | movr          | rides      | revenue_idx | {1,2,3}  | {}               | 2262-04-11 23:47:16.854776+00:00 |            1
(5 rows)
~~~

Now unsplit the index to remove the split enforcements:

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX rides@revenue_idx UNSPLIT AT VALUES (25.00), (50.00), (75.00);
~~~
~~~
         key        |      pretty
+-------------------+------------------+
  \277\214*2\000    | /Table/55/4/25
  \277\214*d\000    | /Table/55/4/5E+1
  \277\214*\226\000 | /Table/55/4/75
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM crdb_internal.ranges WHERE table_name='rides';
~~~
~~~
  range_id |     start_key     |   start_pretty   |      end_key      |    end_pretty    | database_name | table_name | index_name  | replicas | learner_replicas |       split_enforced_until       | lease_holder
+----------+-------------------+------------------+-------------------+------------------+---------------+------------+-------------+----------+------------------+----------------------------------+--------------+
        23 | \277              | /Table/55        | \277\214          | /Table/55/4      | movr          | rides      |             | {1,2,3}  | {}               | NULL                             |            2
        30 | \277\214          | /Table/55/4      | \277\214*2\000    | /Table/55/4/25   | movr          | rides      | revenue_idx | {1,2,3}  | {}               | 2019-09-03 18:01:02.973053+00:00 |            1
        31 | \277\214*2\000    | /Table/55/4/25   | \277\214*d\000    | /Table/55/4/5E+1 | movr          | rides      | revenue_idx | {1,2,3}  | {}               | NULL                             |            2
        32 | \277\214*d\000    | /Table/55/4/5E+1 | \277\214*\226\000 | /Table/55/4/75   | movr          | rides      | revenue_idx | {1,2,3}  | {}               | NULL                             |            1
        33 | \277\214*\226\000 | /Table/55/4/75   | \300              | /Table/56        | movr          | rides      | revenue_idx | {1,2,3}  | {}               | NULL                             |            1
(5 rows)
~~~

The table is still split into ranges at `25.00`, `50.00`, and `75.00`, but the `split_enforced_until` column is now `NULL` for all ranges in the table. The split is no longer enforced, and CockroachDB can merge the data in the table as needed.

## See also

- [`SPLIT AT`](split-at.html)
- [Selection Queries](selection-queries.html)
- [Distribution Layer](architecture/distribution-layer.html)
- [Range Merges](range-merges.html)
- [Replication Layer](architecture/replication-layer.html)
- [`SHOW JOBS`](show-jobs.html)
