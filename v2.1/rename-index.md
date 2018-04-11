---
title: RENAME INDEX
summary: The RENAME INDEX statement changes the name of an index for a table.
toc: false
---

The `RENAME INDEX` [statement](sql-statements.html) changes the name of an index for a table.

{{site.data.alerts.callout_info}}It is not possible to rename an index referenced by a view. For more details, see <a href="views.html#view-dependencies">View Dependencies</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/rename_index.html %}

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the table.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `IF EXISTS` | Rename the column only if a column of `current_name` exists; if one does not exist, do not return an error. |
| `table_name` | The name of the table with the index you want to use |
| `index_name` | The current name of the index |
| `name` | The [`name`](sql-grammar.html#name) you want to use for the index, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers). |

## Example

### Rename an Index

~~~ sql
> SHOW INDEXES FROM users;
~~~
~~~
+-------+----------------+--------+-----+--------+-----------+---------+----------+
| Table |      Name      | Unique | Seq | Column | Direction | Storing | Implicit |
+-------+----------------+--------+-----+--------+-----------+---------+----------+
| users | primary        | true   |   1 | id     | ASC       | false   | false    |
| users | users_name_idx | false  |   1 | name   | ASC       | false   | false    |
| users | users_name_idx | false  |   2 | id     | ASC       | false   | true     |
+-------+----------------+--------+-----+--------+-----------+---------+----------+
(3 rows)
~~~
~~~ sql
> ALTER INDEX users@users_name_idx RENAME TO name_idx;
~~~
~~~
RENAME INDEX
~~~
~~~ sql
> SHOW INDEXES FROM users;
~~~
~~~
+-------+----------+--------+-----+--------+-----------+---------+----------+
| Table |   Name   | Unique | Seq | Column | Direction | Storing | Implicit |
+-------+----------+--------+-----+--------+-----------+---------+----------+
| users | primary  | true   |   1 | id     | ASC       | false   | false    |
| users | name_idx | false  |   1 | name   | ASC       | false   | false    |
| users | name_idx | false  |   2 | id     | ASC       | false   | true     |
+-------+----------+--------+-----+--------+-----------+---------+----------+
(3 rows)
~~~

## See Also

- [Indexes](indexes.html)
- [`CREATE INDEX`](create-index.html)
- [`RENAME COLUMN`](rename-column.html)
- [`RENAME DATABASE`](rename-database.html)
- [`RENAME TABLE`](rename-table.html)
