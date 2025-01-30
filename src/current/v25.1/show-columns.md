---
title: SHOW COLUMNS
summary: The SHOW COLUMNS statement shows details about columns in a table, including each column's name, type, default value, and whether or not it's nullable.
toc: true
docs_area: reference.sql
---

The `SHOW COLUMNS` [statement]({{ page.version.version }}/sql-statements.md) shows details about columns in a table, including each column's name, type, default value, and whether or not it's nullable.

## Required privileges

The user must have any [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the target table.

## Synopsis

<div>
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
`data_type` | The [data type]({{ page.version.version }}/data-types.md) of the column.
`is_nullable` | Whether or not the column accepts `NULL`. Possible values: `true` or `false`.
`column_default` | The default value for the column, or an expression that evaluates to a default value.
`generation_expression` | The expression used for a [computed column]({{ page.version.version }}/computed-columns.md).
`indices` | The list of [indexes]({{ page.version.version }}/indexes.md) that the column is involved in, as an array.
`is_hidden` | Whether or not the column is hidden. Possible values: `true` or `false`.

## Examples


### Show columns in a table

~~~ sql
> SHOW COLUMNS FROM users;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |         indices          | is_hidden
--------------+-----------+-------------+----------------+-----------------------+--------------------------+------------
  id          | UUID      |    false    | NULL           |                       | {primary,users_name_idx} |   false
  city        | VARCHAR   |    false    | NULL           |                       | {primary,users_name_idx} |   false
  name        | VARCHAR   |    true     | NULL           |                       | {primary,users_name_idx} |   false
  address     | VARCHAR   |    true     | NULL           |                       | {primary}                |   false
  credit_card | VARCHAR   |    true     | NULL           |                       | {primary}                |   false
(5 rows)
~~~

Alternatively, within the built-in SQL shell, you can use the `\d <table>` [shell command]({{ page.version.version }}/cockroach-sql.md#commands):

~~~ sql
> \d users
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
+-------------+-----------+-------------+----------------+-----------------------+-----------+-----------+
  id          | UUID      |    false    | NULL           |                       | {primary,users_name_idx} |   false
  city        | VARCHAR   |    false    | NULL           |                       | {primary,users_name_idx} |   false
  name        | VARCHAR   |    true     | NULL           |                       | {primary,users_name_idx} |   false
  address     | VARCHAR   |    true     | NULL           |                       | {primary}                |   false
  credit_card | VARCHAR   |    true     | NULL           |                       | {primary}                |   false
(5 rows)
~~~

### Show columns with comments

You can use [`COMMENT ON`]({{ page.version.version }}/comment-on.md) to add comments on a column.

~~~ sql
> COMMENT ON COLUMN users.credit_card IS 'This column contains user payment information.';
~~~

~~~ sql
> SHOW COLUMNS FROM users WITH COMMENT;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden |                    comment
+-------------+-----------+-------------+----------------+-----------------------+-----------+-----------+------------------------------------------------+
  id          | UUID      |    false    | NULL           |                       | {primary} |   false   | NULL
  city        | VARCHAR   |    false    | NULL           |                       | {primary} |   false   | NULL
  name        | VARCHAR   |    true     | NULL           |                       | {primary} |   false   | NULL
  address     | VARCHAR   |    true     | NULL           |                       | {primary} |   false   | NULL
  credit_card | VARCHAR   |    true     | NULL           |                       | {primary} |   false   | This column contains user payment information.

(5 rows)
~~~

## See also

- [`CREATE TABLE`]({{ page.version.version }}/create-table.md)
- [Information Schema]({{ page.version.version }}/information-schema.md)
- [SQL Statements]({{ page.version.version }}/sql-statements.md)
- [`COMMENT ON`]({{ page.version.version }}/comment-on.md)