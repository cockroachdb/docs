---
title: CREATE TABLE AS
summary: The CREATE TABLE AS statement creates a new table from the results of a SELECT statement.
toc: false
---

The `CREATE TABLE AS` statement creates a new table from the results of a [`SELECT`](select.html) statement.

These tables are not designed for long-term use, as they do not support some common table features like [Primary Keys](constraints.html#primary-key) and [interleaving](interleave-in-parent.html). For similar functionality with more robust feature support, [create a table](create-table.html) and then use [`INSERT INTO SELECT`](insert.html#insert-from-a-select-statement).

<div id="toc"></div>

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the parent database. 

## Synopsis

{% include sql/diagrams/create_table_as.html %}

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

| Parameter | Description |
|-----------|-------------|
| `IF NOT EXISTS` | Create a new table only if a table of the same name does not already exist in the database; if one does exist, do not return an error.<br><br>Note that `IF NOT EXISTS` checks the table name only; it does not check if an existing table has the same columns, indexes, constraints, etc., of the new table. |
| `any_name` | The name of the table to create, which must be unique within its database and follow these [identifier rules](keywords-and-identifiers.html#identifiers). When the parent database is not set as the default, the name must be formatted as `database.name`.<br><br>The [`UPSERT`](upsert.html) and [`INSERT ON CONFLICT`](insert.html) statements use a temporary table called `excluded` to handle uniqueness conflicts during execution. It's therefore not recommended to use the name `excluded` for any of your tables. |
| name | The name of the column you want to use instead of the name of the column from `select_stmt` |
| select_stmt | The [`SELECT`](select.html) statement whose results you want to use to create the table. |

## Examples

### Create a Table from a `SELECT` Statement

~~~ sql
> SELECT * FROM customers WHERE state = 'NY';
~~~
~~~
+----+---------+-------+
| id |  name   | state |
+----+---------+-------+
|  6 | Dorotea | NY    |
| 15 | Thales  | NY    |
+----+---------+-------+
~~~
~~~ sql
> CREATE TABLE customers_ny AS SELECT * FROM customers WHERE state = 'NY';

> SELECT * FROM customers_ny;
~~~
~~~
+----+---------+-------+
| id |  name   | state |
+----+---------+-------+
|  6 | Dorotea | NY    |
| 15 | Thales  | NY    |
+----+---------+-------+
~~~

### Change Column Names

~~~ sql
> CREATE TABLE customers_ny (id, first_name) AS SELECT id, name FROM customers WHERE state = 'NY';

> SELECT * FROM customers_ny;
~~~
~~~
+----+------------+
| id | first_name |
+----+------------+
|  6 | Dorotea    |
| 15 | Thales     |
+----+------------+
~~~

## See Also

- [`CREATE TABLE`](create-table.html)
- [`SELECT`](select.html)
- [`INSERT`](insert.html)
- [`DROP TABLE`](drop-table.html)
- [Other SQL Statements](sql-statements.html)
