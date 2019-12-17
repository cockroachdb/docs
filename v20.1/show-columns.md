---
title: SHOW COLUMNS
summary: The SHOW COLUMNS statement shows details about columns in a table, including each column's name, type, default value, and whether or not it's nullable.
toc: true
---

The `SHOW COLUMNS` [statement](sql-statements.html) shows details about columns in a table, including each column's name, type, default value, and whether or not it's nullable.

## Required privileges

The user must have any [privilege](authorization.html#assign-privileges) on the target table.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_columns.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table for which to show columns.

## Response

The following fields are returned for each column.

Field | Description
------|------------
`column_name` | The name of the column.
`data_type` | The [data type](data-types.html) of the column.
`is_nullable` | Whether or not the column accepts `NULL`. Possible values: `true` or `false`.
`column_default` | The default value for the column, or an expression that evaluates to a default value.
`generation_expression` | The expression used for a [computed column](computed-columns.html).
`indices` | The list of [indexes](indexes.html) that the column is involved in, as an array.
`is_hidden` | Whether or not the column is hidden. Possible values: `true` or `false`.

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Show columns in a table

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM users;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
+-------------+-----------+-------------+----------------+-----------------------+-----------+-----------+
  id          | UUID      |    false    | NULL           |                       | {primary} |   false
  city        | VARCHAR   |    false    | NULL           |                       | {primary} |   false
  name        | VARCHAR   |    true     | NULL           |                       | {}        |   false
  address     | VARCHAR   |    true     | NULL           |                       | {}        |   false
  credit_card | VARCHAR   |    true     | NULL           |                       | {}        |   false
(5 rows)
~~~

Alternatively, within the built-in SQL shell, you can use the `\d <table>` [shell command](cockroach-sql.html#commands):

{% include copy-clipboard.html %}
~~~ sql
> \d users
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
+-------------+-----------+-------------+----------------+-----------------------+-----------+-----------+
  id          | UUID      |    false    | NULL           |                       | {primary} |   false
  city        | VARCHAR   |    false    | NULL           |                       | {primary} |   false
  name        | VARCHAR   |    true     | NULL           |                       | {}        |   false
  address     | VARCHAR   |    true     | NULL           |                       | {}        |   false
  credit_card | VARCHAR   |    true     | NULL           |                       | {}        |   false
(5 rows)
~~~

### Show columns with comments

You can use [`COMMENT ON`](comment-on.html) to add comments on a column.

{% include copy-clipboard.html %}
~~~ sql
> COMMENT ON COLUMN users.credit_card IS 'This column contains user payment information.';
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM users WITH COMMENT;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden |                    comment
+-------------+-----------+-------------+----------------+-----------------------+-----------+-----------+------------------------------------------------+
  id          | UUID      |    false    | NULL           |                       | {primary} |   false   | NULL
  city        | VARCHAR   |    false    | NULL           |                       | {primary} |   false   | NULL
  name        | VARCHAR   |    true     | NULL           |                       | {}        |   false   | NULL
  address     | VARCHAR   |    true     | NULL           |                       | {}        |   false   | NULL
  credit_card | VARCHAR   |    true     | NULL           |                       | {}        |   false   | This column contains user payment information.
(5 rows)
~~~

## See also

- [`CREATE TABLE`](create-table.html)
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
- [`COMMENT ON`](comment-on.html)
