---
title: SHOW COLUMNS
summary: The SHOW COLUMNS statement shows details about columns in a table, including each column's name, type, default value, and whether or not it's nullable.
toc: true
---

The `SHOW COLUMNS` [statement](sql-statements.html) shows details about columns in a table, including each column's name, type, default value, and whether or not it's nullable.


## Required Privileges

The user must have any [privilege](privileges.html) on the target table.

## Synopsis

{% include {{ page.version.version }}/sql/diagrams/show_columns.html %}

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table for which to show columns.

## Response

The following fields are returned for each column. 

Field | Description
------|------------
`Field` | The name of the column.
`Type` | The [data type](data-types.html) of the column. 
`Null` | Whether or not the column accepts `NULL`. Possible values: `true` or `false`.
`Default` | The default value for the column, or an expression that evaluates to a default value.
`Indices` | The list of [indexes](indexes.html) that the column is involved in, as an array.

## Example

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

> SHOW COLUMNS FROM orders;
~~~

~~~
+-------------+-----------+-------+----------------+----------------------------------+
|    Field    |   Type    | Null  |    Default     |             Indices              |
+-------------+-----------+-------+----------------+----------------------------------+
| id          | INT       | false | unique_rowid() | {primary,orders_customer_id_key} |
| date        | TIMESTAMP | false | NULL           | {}                               |
| priority    | INT       | true  |              1 | {}                               |
| customer_id | INT       | true  | NULL           | {orders_customer_id_key}         |
| status      | STRING    | true  | 'open'         | {}                               |
+-------------+-----------+-------+----------------+----------------------------------+
(5 rows)
~~~

## See Also

- [`CREATE TABLE`](create-table.html)
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)

