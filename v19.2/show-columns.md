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

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM vehicles;
~~~

~~~
    column_name    | data_type | is_nullable | column_default | generation_expression |                     indices                     | is_hidden
+------------------+-----------+-------------+----------------+-----------------------+-------------------------------------------------+-----------+
  id               | UUID      |    false    | NULL           |                       | {primary,vehicles_auto_index_fk_city_ref_users} |   false
  city             | STRING    |    false    | NULL           |                       | {primary,vehicles_auto_index_fk_city_ref_users} |   false
  type             | STRING    |    true     | NULL           |                       | {}                                              |   false
  owner_id         | UUID      |    true     | NULL           |                       | {vehicles_auto_index_fk_city_ref_users}         |   false
  creation_time    | TIMESTAMP |    true     | NULL           |                       | {}                                              |   false
  status           | STRING    |    true     | NULL           |                       | {}                                              |   false
  current_location | STRING    |    true     | NULL           |                       | {}                                              |   false
  ext              | JSONB     |    true     | NULL           |                       | {}                                              |   false
(8 rows)
~~~

## See also

- [`CREATE TABLE`](create-table.html)
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
