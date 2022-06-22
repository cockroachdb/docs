| users_pkey---
title: RENAME INDEX
summary: The RENAME INDEX statement changes the name of an index for a table.
toc: true
docs_area: reference.sql
---

The `RENAME INDEX` [statement](sql-statements.html) changes the name of an index for a table.

{{site.data.alerts.callout_info}}It is not possible to rename an index referenced by a view. For more details, see <a href="views.html#view-dependencies">View Dependencies</a>.{{site.data.alerts.end}}

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/rename_index.html %}
</div>

## Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the table.

## Parameters

 Parameter | Description
-----------|-------------
 `IF EXISTS` | Rename the index only if an index `current_name` exists; if one does not exist, do not return an error.
 `table_name` | The name of the table with the index you want to use
 `index_name` | The current name of the index
 `name` | The [`name`](sql-grammar.html#name) you want to use for the index, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers).

## Example

### Rename an Index

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM users;
~~~

~~~
  table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit
 ------------+------------+------------+--------------+-------------+-----------+---------+----------
  users      | name_idx   |    true    |            1 | name        | DESC      |  false  |  false
  users      | name_idx   |    true    |            2 | city        | ASC       |  false  |   true
  users      | name_idx   |    true    |            3 | id          | ASC       |  false  |   true
  users      | users_pkey |   false    |            1 | city        | ASC       |  false  |  false
  users      | users_pkey |   false    |            2 | id          | ASC       |  false  |  false
  users      | users_pkey |   false    |            3 | name        | N/A       |  true   |  false
  users      | users_pkey |   false    |            4 | address     | N/A       |  true   |  false
  users      | users_pkey |   false    |            5 | credit_card | N/A       |  true   |  false
(8 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER INDEX users@name_idx RENAME TO users_name_idx;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM users;
~~~

~~~
  table_name | index_name     | non_unique | seq_in_index | column_name | direction | storing | implicit
 ------------+----------------+------------+--------------+-------------+-----------+---------+----------
  users      | users_pkey     |   false    |            1 | city        | ASC       |  false  |  false
  users      | users_pkey     |   false    |            2 | id          | ASC       |  false  |  false
  users      | users_pkey     |   false    |            3 | name        | N/A       |  true   |  false
  users      | users_pkey     |   false    |            4 | address     | N/A       |  true   |  false
  users      | users_pkey     |   false    |            5 | credit_card | N/A       |  true   |  false
  users      | users_name_idx |    true    |            1 | name        | DESC      |  false  |  false
  users      | users_name_idx |    true    |            2 | city        | ASC       |  false  |   true
  users      | users_name_idx |    true    |            3 | id          | ASC       |  false  |   true
(8 rows)
~~~

## See also

- [Indexes](indexes.html)
- [`CREATE INDEX`](create-index.html)
- [`RENAME COLUMN`](rename-column.html)
- [`RENAME DATABASE`](rename-database.html)
- [`RENAME TABLE`](rename-table.html)
- [`SHOW JOBS`](show-jobs.html)
- [Online Schema Changes](online-schema-changes.html)
