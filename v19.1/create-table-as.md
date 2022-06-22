---
title: CREATE TABLE AS
summary: The CREATE TABLE AS statement persists the result of a query into the database for later reuse.
toc: true
---

The `CREATE TABLE ... AS` statement creates a new table from a [selection query](selection-queries.html).


## Intended use

Tables created with `CREATE TABLE ... AS` are intended to persist the
result of a query for later reuse.

This can be more efficient than a [view](create-view.html) when the
following two conditions are met:

- The result of the query is used as-is multiple times.
- The copy needs not be kept up-to-date with the original table over time.

When the results of a query are reused multiple times within a larger
query, a view is advisable instead. The query optimizer can "peek"
into the view and optimize the surrounding query using the primary key
and indices of the tables mentioned in the view query.

A view is also advisable when the results must be up-to-date; a view
always retrieves the current data from the tables that the view query
mentions.

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the parent database.

## Synopsis

<section> {% include {{ page.version.version }}/sql/diagrams/create_table_as.html %} </section>

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

 Parameter | Description
-----------|-------------
 `IF NOT EXISTS` | Create a new table only if a table of the same name does not already exist in the database; if one does exist, do not return an error.<br><br>Note that `IF NOT EXISTS` checks the table name only; it does not check if an existing table has the same columns, indexes, constraints, etc., of the new table.
 `table_name` | The name of the table to create, which must be unique within its database and follow these [identifier rules](keywords-and-identifiers.html#identifiers). When the parent database is not set as the default, the name must be formatted as `database.name`.<br><br>The [`UPSERT`](upsert.html) and [`INSERT ON CONFLICT`](insert.html) statements use a temporary table called `excluded` to handle uniqueness conflicts during execution. It's therefore not recommended to use the name `excluded` for any of your tables.
 `name` | The name of the column you want to use instead of the name of the column from `select_stmt`.
 `select_stmt` | A [selection query](selection-queries.html) to provide the data.

## Limitations

The [primary key](primary-key.html) of tables created with `CREATE
TABLE ... AS` is not derived from the query results. Like for other
tables, it is not possible to add or change the primary key after
creation. Moreover, these tables are not
[interleaved](interleave-in-parent.html) with other tables. The
default rules for [column families](column-families.html) apply.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE logoff (
    user_id INT PRIMARY KEY,
    user_email STRING UNIQUE,
    logoff_date DATE NOT NULL,
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE logoff_copy AS TABLE logoff;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE logoff_copy;
~~~
~~~
+-------------+-----------------------------------------------------------------+
|    Table    |                           CreateTable                           |
+-------------+-----------------------------------------------------------------+
| logoff_copy | CREATE TABLE logoff_copy (                                      |
|             |     user_id INT NULL,                                           |
|             |     user_email STRING NULL,                                     |
|             |     logoff_date DATE NULL,                                      |
|             |     FAMILY "primary" (user_id, user_email, logoff_date, rowid)  |
|             | )                                                               |
+-------------+-----------------------------------------------------------------+
(1 row)
~~~

The example illustrates that the primary key, unique, and "not null"
constraints are not propagated to the copy.

It is however possible to
[create a secondary index](create-index.html) after `CREATE TABLE
... AS`.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX logoff_copy_id_idx ON logoff_copy(user_id);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE logoff_copy;
~~~
~~~
+-------------+-----------------------------------------------------------------+
|    Table    |                           CreateTable                           |
+-------------+-----------------------------------------------------------------+
| logoff_copy | CREATE TABLE logoff_copy (                                      |
|             |     user_id INT NULL,                                           |
|             |     user_email STRING NULL,                                     |
|             |     logoff_date DATE NULL,                                      |
|             |     INDEX logoff_copy_id_idx (user_id ASC),                     |
|             |     FAMILY "primary" (user_id, user_email, logoff_date, rowid)  |
|             | )                                                               |
+-------------+-----------------------------------------------------------------+
(1 row)
~~~

For maximum data storage optimization, consider using separately
[`CREATE`](create-table.html) followed by
[`INSERT INTO ...`](insert.html) to populate the table using the query
results.

## Examples

### Create a table from a `SELECT` query

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers_ny AS SELECT * FROM customers WHERE state = 'NY';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
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

### Change column names

This statement creates a copy of an existing table but with changed column names.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers_ny (id, first_name) AS SELECT id, name FROM customers WHERE state = 'NY';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
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

### Create a table from a `VALUES` clause

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE tech_states AS VALUES ('CA'), ('NY'), ('WA');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
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


### Create a copy of an existing table

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers_ny_copy AS TABLE customers_ny;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
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

## See also

- [Selection Queries](selection-queries.html)
- [Simple `SELECT` Clause](select-clause.html)
- [`CREATE TABLE`](create-table.html)
- [`CREATE VIEW`](create-view.html)
- [`INSERT`](insert.html)
- [`DROP TABLE`](drop-table.html)
- [Other SQL Statements](sql-statements.html)
