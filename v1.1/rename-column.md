---
title: RENAME COLUMN
summary: The RENAME COLUMN statement changes the name of a column in a table.
toc: false
---

The `RENAME COLUMN` [statement](sql-statements.html) changes the name of a column in a table.

{{site.data.alerts.callout_info}}It is not possible to rename a column referenced by a view. For more details, see <a href="views.html#view-dependencies">View Dependencies</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/rename_column.html %}

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the table.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `IF EXISTS` | Rename the column only if a column of `current_name` exists; if one does not exist, do not return an error. |
| `table_name` | The name of the table with the column you want to use. |
| `current_name` | The current name of the column. |
| `name` | The [`name`](sql-grammar.html#name) you want to use for the column, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers). |

## Viewing Schema Changes

{% include custom/schema-change-view-job.md %}

## Example

### Rename a Column

~~~ sql
> SELECT * FROM users;
~~~
~~~
+----+-------+-------+
| id | name  | title |
+----+-------+-------+
|  1 | Tom   | cat   |
|  2 | Jerry | rat   |
+----+-------+-------+
~~~
~~~ sql
> ALTER TABLE users RENAME COLUMN title TO species;
~~~
~~~ sql
> SELECT * FROM users;
~~~
~~~
+----+-------+---------+
| id | name  | species |
+----+-------+---------+
|  1 | Tom   | cat     |
|  2 | Jerry | rat     |
+----+-------+---------+
~~~

## See Also

- [`RENAME DATABASE`](rename-database.html)
- [`RENAME TABLE`](rename-table.html)
- [`ALTER TABLE`](alter-table.html)
