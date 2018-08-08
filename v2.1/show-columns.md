---
title: SHOW COLUMNS
summary: The SHOW COLUMNS statement shows details about columns in a table, including each column's name, type, default value, and whether or not it's nullable.
toc: true
---

The `SHOW COLUMNS` [statement](sql-statements.html) shows details about columns in a table, including each column's name, type, default value, and whether or not it's nullable.

## Required privileges

The user must have any [privilege](privileges.html) on the target table.

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

## Example

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM orders;
~~~

~~~
ttys001
~$ cd go/src/github.com/cockroachdb/cockroach/
~/go/src/github.com/cockroachdb/cockroach$ git branch
* master
 release-2.0
~/go/src/github.com/cockroachdb/cockroach$ cockroach demo
#
# Welcome to the CockroachDB demo database!
#
# You are connected to a temporary, in-memory CockroachDB
# instance. Your changes will not be saved!
#
# Web UI: http://127.0.0.1:53072
#
# Server version: CockroachDB CCL v2.1.0-alpha.20180702-1304-ge0de098a9a (x86_64-apple-darwin17.7.0, built 2018/08/07 22:18:58, go1.10.1) (same version as client)
# Cluster ID: 2900713b-e31c-44a9-942c-6ff7be903cfc
#
# Enter \? for a brief introduction.
#
root@127.0.0.1:53071/defaultdb> create table t1 (a serial, b string);
CREATE TABLE

Time: 9.22934ms

root@127.0.0.1:53071/defaultdb> show columns from t1;
+-------------+-----------+-------------+----------------+-----------------------+---------+
| column_name | data_type | is_nullable | column_default | generation_expression | indices |
+-------------+-----------+-------------+----------------+-----------------------+---------+
| a           | INT       |    true     | unique_rowid() |                       | {}      |
| b           | STRING    |    true     | NULL           |                       | {}      |
+-------------+-----------+-------------+----------------+-----------------------+---------+
(2 rows)

Time: 10.426829ms

root@127.0.0.1:53071/defaultdb> CREATE TABLE orders (                                                                                                                                                           id INT PRIMARY KEY DEFAULT unique_rowid(),                                                                                                                                                                  date TIMESTAMP NOT NULL,                                                                                                                                                                                    priority INT DEFAULT 1,                                                                                                                                                                                     customer_id INT UNIQUE,                                                                                                                                                                                     status STRING DEFAULT 'open',                                                                                                                                                                               CHECK (priority BETWEEN 1 AND 5),                                                                                                                                                                           CHECK (status in ('open', 'in progress', 'done', 'cancelled')),                                                                                                                                             FAMILY (id, date, priority, customer_id, status)                                                                                                                                                        );
CREATE TABLE

Time: 5.249689ms

root@127.0.0.1:53071/defaultdb> show columns from orders;
+-------------+-----------+-------------+-----------------+-----------------------+--------------------------------------+
| column_name | data_type | is_nullable | column_default  | generation_expression |               indices                |
+-------------+-----------+-------------+-----------------+-----------------------+--------------------------------------+
| id          | INT       |    false    | unique_rowid()  |                       | {"primary","orders_customer_id_key"} |
| date        | TIMESTAMP |    false    | NULL            |                       | {}                                   |
| priority    | INT       |    true     | 1:::INT         |                       | {}                                   |
| customer_id | INT       |    true     | NULL            |                       | {"orders_customer_id_key"}           |
| status      | STRING    |    true     | 'open':::STRING |                       | {}                                   |
+-------------+-----------+-------------+-----------------+-----------------------+--------------------------------------+
(5 rows)
~~~

## See also

- [`CREATE TABLE`](create-table.html)
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
