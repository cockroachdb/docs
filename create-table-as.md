---
title: CREATE TABLE AS
summary: The CREATE TABLE AS statement creates a new table from the results of a SELECT statement.
toc: false
---

The `CREATE TABLE ... AS` statement persists the result of a query into the database for later reuse.

Tables created with `CREATE TABLE ... AS` do not define a
[primary key](primary-key.html) derived from the query results and are
not [interleaved](interleave-in-parent.html) with other tables. It is
however possible to [create a secondary index](create-index.html) on
them. For maximum data optimization, consider using separately
[`CREATE`](create-table.html) followed by
[`INSERT INTO ...`](insert.html) to populate the table using the query
results.

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
| `name` | The name of the column you want to use instead of the name of the column from `select_stmt`. |
| `select_stmt` | The query whose results you want to use to create the table. This can use [`SELECT`](select.html), `TABLE` or `VALUES`. |

## Examples

### Create a Table from a `SELECT` Query

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

The following statement determines names for the columns on the newly
created table independently from the names of the result columns in
the query's results:

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

### Create a Table from a `VALUES` Clause

~~~ sql
> CREATE TABLE tech_states AS VALUES ('CA'), ('NY'), ('WA');

> SELECT * FROM tech_states;
~~~
~~~
+---------+
| column1 |
+---------+
| CA      |
| NY      |
| WA      |
+---------+
(3 rows)
~~~


### Create an Unstructured Copy of an Existing Table

~~~ sql
> CREATE TABLE customers_ny_copy AS TABLE customers_ny;

> SELECT * FROM customers_ny_copy;
~~~
~~~
+----+------------+
| id | first_name |
+----+------------+
|  6 | Dorotea    |
| 15 | Thales     |
+----+------------+
~~~

When a table copy is created this way, the copy is not associated to
any primary key, secondary index or constraint that was present on the
original table.

## See Also

- [`CREATE TABLE`](create-table.html)
- [`SELECT`](select.html)
- [`INSERT`](insert.html)
- [`DROP TABLE`](drop-table.html)
- [Other SQL Statements](sql-statements.html)
