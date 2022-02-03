---
title: UNSPLIT AT
summary: The UNSPLIT AT statement removes a range split enforcement at a specified row in the table or index.
toc: true
---

The `UNSPLIT AT` [statement](sql-statements.html) removes a [split enforcement](split-at.html) on a [range split](architecture/distribution-layer.html#range-splits), at a specified row in a table or index.

Removing a split enforcement from a table or index ("unsplitting") allows CockroachDB to merge ranges as needed, to help improve your cluster's performance. For more information, see [Range Merges](architecture/distribution-layer.html#range-merges).

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

## Examples

{% include {{page.version.version}}/sql/movr-statements-nodes.md %}

### Unsplit a table

The `crdb_internal.ranges` table contains information about ranges in your CockroachDB cluster. At this point, just one range contains the data in the `users` table:

{% include copy-clipboard.html %}
~~~ sql
> SELECT range_id, start_pretty, end_pretty, split_enforced_until FROM crdb_internal.ranges WHERE table_name='users';
~~~
~~~
  range_id | start_pretty | end_pretty | split_enforced_until
+----------+--------------+------------+----------------------+
        21 | /Table/53    | /Table/54  | NULL
(1 row)
~~~

Now [split](split-at.html) the `users` table ranges based on primary key values:

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
> SELECT range_id, start_pretty, end_pretty, split_enforced_until FROM crdb_internal.ranges WHERE table_name='users';
~~~
~~~
  range_id |      start_pretty      |       end_pretty       |       split_enforced_until
+----------+------------------------+------------------------+----------------------------------+
        21 | /Table/53              | /Table/53/1/"chicago"  | NULL
        27 | /Table/53/1/"chicago"  | /Table/53/1/"new york" | 2262-04-11 23:47:16.854776+00:00
        28 | /Table/53/1/"new york" | /Table/53/1/"seattle"  | 2262-04-11 23:47:16.854776+00:00
        29 | /Table/53/1/"seattle"  | /Table/54              | 2262-04-11 23:47:16.854776+00:00
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
> SELECT range_id, start_pretty, end_pretty, split_enforced_until FROM crdb_internal.ranges WHERE table_name='users';
~~~
~~~
  range_id |      start_pretty      |       end_pretty       | split_enforced_until
+----------+------------------------+------------------------+----------------------+
        21 | /Table/53              | /Table/53/1/"chicago"  | NULL
        27 | /Table/53/1/"chicago"  | /Table/53/1/"new york" | NULL
        28 | /Table/53/1/"new york" | /Table/53/1/"seattle"  | NULL
        29 | /Table/53/1/"seattle"  | /Table/54              | NULL
(4 rows)
~~~

The `users` table is still split into ranges at `'chicago'`, `'new york'`, and `'seattle'`, but the `split_enforced_until` column is now `NULL` for all ranges in the table. The split is no longer enforced, and CockroachDB can [merge the data](architecture/distribution-layer.html#range-merges) in the table as needed.

### Unsplit an index at specific points

{% include {{page.version.version}}/sql/unsplit-an-index.md %}

## See also

- [`SPLIT AT`](split-at.html)
- [Selection Queries](selection-queries.html)
- [Distribution Layer](architecture/distribution-layer.html)
- [Range Merges](architecture/distribution-layer.html#range-merges)
- [Replication Layer](architecture/replication-layer.html)
- [`SHOW JOBS`](show-jobs.html)
