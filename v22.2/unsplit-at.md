---
title: UNSPLIT AT
summary: The UNSPLIT AT statement removes a range split enforcement at a specified row in the table or index.
toc: true
docs_area: reference.sql
---

{% assign rd = site.data.releases | where_exp: "rd", "rd.major_version == page.version.version" | first %}

{% if rd %}
{% assign remote_include_version = page.version.version | replace: "v", "" %}
{% else %}
{% assign remote_include_version = site.versions["stable"] | replace: "v", "" %}
{% endif %}

The `UNSPLIT AT` [statement](sql-statements.html) removes a [split enforcement](split-at.html) on a [range split](architecture/distribution-layer.html#range-splits), at a specified row in a table or index. `UNSPLIT ALL` removes all split enforcements for a table or index.

Removing a split enforcement from a table or index ("unsplitting") allows CockroachDB to merge ranges as needed, to help improve your cluster's performance. For more information, see [Range Merges](architecture/distribution-layer.html#range-merges).

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/unsplit_table_at.html %}
</div>

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/unsplit_index_at.html %}
</div>

## Required privileges

The user must have the `INSERT` [privilege](security-reference/authorization.html#managing-privileges) on the table or index.

## Parameters

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table to unsplit.
 `table_name @ index_name`<br>`standalone_index_name` | The name of the index to unsplit.
 `select_stmt` | A [selection query](selection-queries.html) that produces one or more rows at which to unsplit a table or index.

## Examples

{% include {{page.version.version}}/sql/movr-statements-geo-partitioned-replicas.md %}

### Unsplit a table

Create a `drivers` table and split the table based on the compound primary key as described in [Split a table with a compound primary key](split-at.html#split-a-table-with-a-compound-primary-key).

To remove the split enforcements, run the following:

{% include_cached copy-clipboard.html %}
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

You can see the split's expiration date in the `split_enforced_until` column. The [`crdb_internal.ranges`](crdb-internal.html) table also contains information about ranges in your CockroachDB cluster, including the `split_enforced_until` column.

{% include_cached copy-clipboard.html %}
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

### Unsplit an index

Add a new secondary [index](indexes.html) to the `rides` table, on the `revenue` column, and then split the table ranges by secondary index values as described in [Split an index](split-at.html#split-an-index).

To remove the split enforcements, run the following:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER INDEX rides@revenue_idx UNSPLIT AT VALUES (25.00), (50.00), (75.00);
~~~
~~~
         key        |      pretty
--------------------+-------------------
  \277\214*2\000    | /Table/55/4/25
  \277\214*d\000    | /Table/55/4/5E+1
  \277\214*\226\000 | /Table/55/4/75
(3 rows)
~~~

You can see the split's expiration date in the `split_enforced_until` column. The [`crdb_internal.ranges`](crdb-internal.html) table also contains information about ranges in your CockroachDB cluster, including the `split_enforced_until` column.

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT range_id, start_pretty, end_pretty, split_enforced_until FROM crdb_internal.ranges WHERE table_name='rides';
~~~
~~~
  range_id |                                        start_pretty                                         |                                         end_pretty                                          |        split_enforced_until
-----------+---------------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------------+--------------------------------------
        39 | /Table/55                                                                                   | /Table/55/1/"amsterdam"/"\xc5\x1e\xb8Q\xeb\x85@\x00\x80\x00\x00\x00\x00\x00\x01\x81"        | NULL
        56 | /Table/55/1/"amsterdam"/"\xc5\x1e\xb8Q\xeb\x85@\x00\x80\x00\x00\x00\x00\x00\x01\x81"        | /Table/55/1/"boston"/"8Q\xeb\x85\x1e\xb8B\x00\x80\x00\x00\x00\x00\x00\x00n"                 | 2262-04-11 23:47:16.854776+00:00:00
        55 | /Table/55/1/"boston"/"8Q\xeb\x85\x1e\xb8B\x00\x80\x00\x00\x00\x00\x00\x00n"                 | /Table/55/1/"los angeles"/"\xa8\xf5\u008f\\(H\x00\x80\x00\x00\x00\x00\x00\x01J"             | 2262-04-11 23:47:16.854776+00:00:00
        53 | /Table/55/1/"los angeles"/"\xa8\xf5\u008f\\(H\x00\x80\x00\x00\x00\x00\x00\x01J"             | /Table/55/1/"new york"/"\x1c(\xf5\u008f\\I\x00\x80\x00\x00\x00\x00\x00\x007"                | 2262-04-11 23:47:16.854776+00:00:00
        66 | /Table/55/1/"new york"/"\x1c(\xf5\u008f\\I\x00\x80\x00\x00\x00\x00\x00\x007"                | /Table/55/1/"paris"/"\xe1G\xae\x14z\xe1H\x00\x80\x00\x00\x00\x00\x00\x01\xb8"               | 2262-04-11 23:47:16.854776+00:00:00
        52 | /Table/55/1/"paris"/"\xe1G\xae\x14z\xe1H\x00\x80\x00\x00\x00\x00\x00\x01\xb8"               | /Table/55/1/"san francisco"/"\x8c\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x01\x13" | 2262-04-11 23:47:16.854776+00:00:00
        65 | /Table/55/1/"san francisco"/"\x8c\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x01\x13" | /Table/55/1/"seattle"/"p\xa3\xd7\n=pD\x00\x80\x00\x00\x00\x00\x00\x00\xdc"                  | 2262-04-11 23:47:16.854776+00:00:00
        64 | /Table/55/1/"seattle"/"p\xa3\xd7\n=pD\x00\x80\x00\x00\x00\x00\x00\x00\xdc"                  | /Table/55/1/"washington dc"/"Tz\xe1G\xae\x14L\x00\x80\x00\x00\x00\x00\x00\x00\xa5"          | 2262-04-11 23:47:16.854776+00:00:00
        54 | /Table/55/1/"washington dc"/"Tz\xe1G\xae\x14L\x00\x80\x00\x00\x00\x00\x00\x00\xa5"          | /Table/55/4                                                                                 | 2262-04-11 23:47:16.854776+00:00:00
        68 | /Table/55/4                                                                                 | /Table/55/4/25                                                                              | 2021-04-08 16:27:45.201336+00:00:00
        69 | /Table/55/4/25                                                                              | /Table/55/4/5E+1                                                                            | NULL
        70 | /Table/55/4/5E+1                                                                            | /Table/55/4/75                                                                              | NULL
        71 | /Table/55/4/75                                                                              | /Table/56                                                                                   | NULL
(13 rows)
~~~

The table is still split into ranges at `25.00`, `50.00`, and `75.00`, but the `split_enforced_until` column is now `NULL` for all ranges in the table. The split is no longer enforced, and CockroachDB can [merge the data](architecture/distribution-layer.html#range-merges) in the table as needed.

## See also


- [Selection Queries](selection-queries.html)
- [Distribution Layer](architecture/distribution-layer.html)
- [Range Merges](architecture/distribution-layer.html#range-merges)
- [Replication Layer](architecture/replication-layer.html)
- [`SHOW JOBS`](show-jobs.html)
- [`SPLIT AT`](split-at.html)
- [`ALTER TABLE`](alter-table.html)
- [`ALTER INDEX`](alter-index.html)
