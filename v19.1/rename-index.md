---
title: RENAME INDEX
summary: The RENAME INDEX statement changes the name of an index for a table.
toc: true
---

The `RENAME INDEX` [statement](sql-statements.html) changes the name of an index for a table.

{{site.data.alerts.callout_info}}It is not possible to rename an index referenced by a view. For more details, see <a href="views.html#view-dependencies">View Dependencies</a>.{{site.data.alerts.end}}

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/rename_index.html %}
</div>

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the table.

## Parameters

 Parameter | Description
-----------|-------------
 `IF EXISTS` | Rename the column only if a column of `current_name` exists; if one does not exist, do not return an error.
 `table_name` | The name of the table with the index you want to use
 `index_name` | The current name of the index
 `name` | The [`name`](sql-grammar.html#name) you want to use for the index, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers).

## Example

### Rename an Index

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

## See also

- [Indexes](indexes.html)
- [`CREATE INDEX`](create-index.html)
- [`RENAME COLUMN`](rename-column.html)
- [`RENAME DATABASE`](rename-database.html)
- [`RENAME TABLE`](rename-table.html)
- [`SHOW JOBS`](show-jobs.html)
