---
title: SHOW CREATE
summary: The SHOW CREATE statement shows the CREATE statement for an existing table, view, or sequence.
toc: true
---

The `SHOW CREATE` [statement](sql-statements.html) shows the `CREATE` statement for an existing [table](create-table.html), [view](create-view.html), or [sequence](create-sequence.html).

## Required privileges

The user must have any [privilege](authorization.html#assign-privileges) on the target table, view, or sequence.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_create.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`object_name` | The name of the table, view, or sequence for which to show the `CREATE` statement.

## Response

Field | Description
------|------------
`table_name` | The name of the table, view, or sequence.
`create_statement` | The `CREATE` statement for the table, view, or sequence.

## Example

### Show the `CREATE TABLE` statement for a table

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers (id INT PRIMARY KEY, email STRING UNIQUE);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE customers;
~~~

~~~
+------------+---------------------------------------------------+
| table_name |                 create_statement                  |
+------------+---------------------------------------------------+
| customers  | CREATE TABLE customers (                          |
|            |                                                   |
|            |     id INT NOT NULL,                              |
|            |                                                   |
|            |     email STRING NULL,                            |
|            |                                                   |
|            |     CONSTRAINT "primary" PRIMARY KEY (id ASC),    |
|            |                                                   |
|            |     UNIQUE INDEX customers_email_key (email ASC), |
|            |                                                   |
|            |     FAMILY "primary" (id, email)                  |
|            |                                                   |
|            | )                                                 |
+------------+---------------------------------------------------+
(1 row)
~~~

### Show the `CREATE VIEW` statement for a view

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE bank.user_accounts;
~~~

~~~
+---------------------------+--------------------------------------------------------------------------+
|        table_name         |                             create_statement                             |
+---------------------------+--------------------------------------------------------------------------+
| bank.public.user_accounts | CREATE VIEW user_accounts (type, email) AS SELECT type, email FROM       |
|                           | bank.public.accounts                                                     |
+---------------------------+--------------------------------------------------------------------------+
(1 row)
~~~

### Show just a view's `SELECT` statement

To get just a view's `SELECT` statement, you can query the `views` table in the built-in `information_schema` database and filter on the view name:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT view_definition
  FROM information_schema.views
  WHERE table_name = 'user_accounts';
~~~

~~~
+----------------------------------------------+
|               view_definition                |
+----------------------------------------------+
| SELECT type, email FROM bank.public.accounts |
+----------------------------------------------+
(1 row)
~~~

### Show the `CREATE SEQUENCE` statement for a sequence

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE desc_customer_list START -1 INCREMENT -2;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE desc_customer_list;
~~~

~~~
+--------------------+--------------------------------------------------------------------------+
|     table_name     |                             create_statement                             |
+--------------------+--------------------------------------------------------------------------+
| desc_customer_list | CREATE SEQUENCE desc_customer_list MINVALUE -9223372036854775808         |
|                    | MAXVALUE -1 INCREMENT -2 START -1                                        |
+--------------------+--------------------------------------------------------------------------+
(1 row)
~~~

## See also

- [`CREATE TABLE`](create-table.html)
- [`CREATE VIEW`](create-view.html)
- [`CREATE TABLE`](create-sequence.html)
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
