---
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
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/rename_index.html %}
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

### Rename an index

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM users;
~~~

~~~
  table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit | visible
-------------+------------+------------+--------------+-------------+-----------+---------+----------+----------
  users      | name_idx   |     t      |            1 | name        | DESC      |    f    |    f     |    t
  users      | name_idx   |     t      |            2 | city        | ASC       |    f    |    t     |    t
  users      | name_idx   |     t      |            3 | id          | ASC       |    f    |    t     |    t
  users      | users_pkey |     f      |            1 | city        | ASC       |    f    |    f     |    t
  users      | users_pkey |     f      |            2 | id          | ASC       |    f    |    f     |    t
  users      | users_pkey |     f      |            3 | name        | N/A       |    t    |    f     |    t
  users      | users_pkey |     f      |            4 | address     | N/A       |    t    |    f     |    t
  users      | users_pkey |     f      |            5 | credit_card | N/A       |    t    |    f     |    t
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
  table_name |   index_name   | non_unique | seq_in_index | column_name | direction | storing | implicit | visible
-------------+----------------+------------+--------------+-------------+-----------+---------+----------+----------
  users      | users_name_idx |     t      |            1 | name        | DESC      |    f    |    f     |    t
  users      | users_name_idx |     t      |            2 | city        | ASC       |    f    |    t     |    t
  users      | users_name_idx |     t      |            3 | id          | ASC       |    f    |    t     |    t
  users      | users_pkey     |     f      |            1 | city        | ASC       |    f    |    f     |    t
  users      | users_pkey     |     f      |            2 | id          | ASC       |    f    |    f     |    t
  users      | users_pkey     |     f      |            3 | name        | N/A       |    t    |    f     |    t
  users      | users_pkey     |     f      |            4 | address     | N/A       |    t    |    f     |    t
  users      | users_pkey     |     f      |            5 | credit_card | N/A       |    t    |    f     |    t
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
