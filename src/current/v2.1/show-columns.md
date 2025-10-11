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
`is_hidden` | <span class="version-tag">New in v2.1:</span> Whether or not the column is hidden. Possible values: `true` or `false`.

## Examples

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE orders (
    id INT PRIMARY KEY DEFAULT unique_rowid(),
    date TIMESTAMP NOT NULL,
    priority INT DEFAULT 1,
    customer_id INT UNIQUE,
    status STRING DEFAULT 'open',
    CHECK (priority BETWEEN 1 AND 5),
    CHECK (status in ('open', 'in progress', 'done', 'cancelled')),
    FAMILY (id, date, priority, customer_id, status)
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM orders;
~~~

~~~
  column_name | data_type | is_nullable | column_default  | generation_expression |               indices                | is_hidden
+-------------+-----------+-------------+-----------------+-----------------------+--------------------------------------+-----------+
  id          | INT       |    false    | unique_rowid()  |                       | {"primary","orders_customer_id_key"} |   false
  date        | TIMESTAMP |    false    | NULL            |                       | {}                                   |   false
  priority    | INT       |    true     | 1:::INT         |                       | {}                                   |   false
  customer_id | INT       |    true     | NULL            |                       | {"orders_customer_id_key"}           |   false
  status      | STRING    |    true     | 'open':::STRING |                       | {}                                   |   false
(5 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE foo (x INT);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM foo;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |   indices   | is_hidden
+-------------+-----------+-------------+----------------+-----------------------+-------------+-----------+
  x           | INT       |    true     | NULL           |                       | {}          |   false
  rowid       | INT       |    false    | unique_rowid() |                       | {"primary"} |   true
(2 rows)
~~~



## See also

- [`CREATE TABLE`](create-table.html)
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
