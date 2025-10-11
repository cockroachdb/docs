---
title: COMMENT ON
summary: The COMMENT ON statement associates comments to databases, tables, or columns.
toc: true
---

<span class="version-tag">New in v19.1:</span> The `COMMENT ON` [statement](sql-statements.html) associates comments to [databases](create-database.html), [tables](create-table.html), or [columns](add-column.html).

{{site.data.alerts.callout_success}}
Currently, `COMMENT ON` is best suited for use with database GUI navigation tools (e.g., [dBeaver](dbeaver.html)).
{{site.data.alerts.end}}

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the object they are commenting on.

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/comment.html %}</section>

## Parameters

 Parameter | Description
------------|--------------
`database_name` | The name of the database you are commenting on.
`table_name` | The name of the  table you are commenting on.
`column_name` | The name of the column you are commenting on.
`comment_text` | The comment ([`STRING`](string.html)) you are associating to the object.

## Examples

### Add a comment to a database

To add a comment to a database:

{% include_cached copy-clipboard.html %}
~~~ sql
> COMMENT ON DATABASE customers IS 'This is a sample comment';
~~~

~~~
COMMENT ON DATABASE
~~~

To view database comments, use a database GUI navigation tool (e.g., [dBeaver](dbeaver.html)).

### Add a comment to a table

To add a comment to a table:

{% include_cached copy-clipboard.html %}
~~~ sql
> COMMENT ON TABLE dogs IS 'This is a sample comment';
~~~

~~~
COMMENT ON TABLE
~~~

To view table comments, use [`SHOW TABLES`](show-tables.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM customers WITH COMMENT;
~~~

~~~
  table_name |         comment
+------------+--------------------------+
  dogs       | This is a sample comment
(1 row)
~~~

### Add a comment to a column

To add a comment to a column:

{% include_cached copy-clipboard.html %}
~~~ sql
> COMMENT ON COLUMN dogs.name IS 'This is a sample comment';
~~~

~~~
COMMENT ON COLUMN
~~~

To view column comments, use a database GUI navigation tool (e.g., [dBeaver](dbeaver.html)).

## See also

- [`CREATE DATABASE`](create-database.html)
- [`CREATE TABLE`](create-table.html)
- [`ADD COLUMN`](add-column.html)
- [`SHOW TABLES`](show-tables.html)
- [Other SQL Statements](sql-statements.html)
- [dBeaver](dbeaver.html)
