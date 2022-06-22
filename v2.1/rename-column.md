---
title: RENAME COLUMN
summary: The RENAME COLUMN statement changes the name of a column in a table.
toc: true
---

The `RENAME COLUMN` [statement](sql-statements.html) changes the name of a column in a table.

{{site.data.alerts.callout_info}}It is not possible to rename a column referenced by a view. For more details, see <a href="views.html#view-dependencies">View Dependencies</a>.{{site.data.alerts.end}}


## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/rename_column.html %}
</div>

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the table.

## Parameters

 Parameter | Description
-----------|-------------
 `IF EXISTS` | Rename the column only if a column of `current_name` exists; if one does not exist, do not return an error.
 `table_name` | The name of the table with the column you want to use.
 `current_name` | The current name of the column.
 `name` | The [`name`](sql-grammar.html#name) you want to use for the column, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers).

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Example

### Rename a column

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users RENAME COLUMN title TO species;
~~~

{% include_cached copy-clipboard.html %}
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

## See also

- [`RENAME DATABASE`](rename-database.html)
- [`RENAME TABLE`](rename-table.html)
- [`ALTER TABLE`](alter-table.html)
