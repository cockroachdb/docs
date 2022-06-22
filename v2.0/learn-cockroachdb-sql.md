---
title: Learn CockroachDB SQL
summary: Learn some of the most essential CockroachDB SQL statements.
toc: true
---

This page walks you through some of the most essential CockroachDB SQL statements. For a complete list and related details, see [SQL Statements](sql-statements.html).

{{site.data.alerts.callout_info}}CockroachDB aims to provide standard SQL with extensions, but some standard SQL functionality is not yet available. See our <a href="sql-feature-support.html">SQL Feature Support</a> page for more details.{{site.data.alerts.end}}


## Create a Database

CockroachDB comes with a single default `system` database, which contains CockroachDB metadata and is read-only. To create a new database, use [`CREATE DATABASE`](create-database.html) followed by a database name:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

Database names must follow [these identifier rules](keywords-and-identifiers.html#identifiers). To avoid an error in case the database already exists, you can include `IF NOT EXISTS`:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE IF NOT EXISTS bank;
~~~

When you no longer need a database, use [`DROP DATABASE`](drop-database.html) followed by the database name to remove the database and all its objects:

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP DATABASE bank;
~~~

## Show Databases

To see all databases, use the [`SHOW DATABASES`](show-databases.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
+--------------------+
|      Database      |
+--------------------+
| bank               |
| system             |
+--------------------+
(2 rows)
~~~

## Set the Default Database

To set the default database, use the [`SET`](set-vars.html#examples) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET DATABASE = bank;
~~~

When working with the default database, you do not need to reference it explicitly in statements. To see which database is currently the default, use the `SHOW DATABASE` statement (note the singular form):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DATABASE;
~~~

~~~
+----------+
| database |
+----------+
| bank     |
+----------+
(1 row)
~~~

## Create a Table

To create a table, use [`CREATE TABLE`](create-table.html) followed by a table name, the column names, and the [data type](data-types.html) and [constraint](constraints.html), if any, for each column:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE accounts (
    id INT PRIMARY KEY,
    balance DECIMAL
);
~~~

Table and column names must follow [these rules](keywords-and-identifiers.html#identifiers). Also, when you do not explicitly define a [primary key](primary-key.html), CockroachDB will automatically add a hidden `rowid` column as the primary key.

To avoid an error in case the table already exists, you can include `IF NOT EXISTS`:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS accounts (
    id INT PRIMARY KEY,
    balance DECIMAL
);
~~~

To show all of the columns from a table, use [`SHOW COLUMNS FROM`](show-columns.html) followed by the table name:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM accounts;
~~~

~~~
+---------+---------+-------+---------+-----------+
|  Field  |  Type   | Null  | Default |  Indices  |
+---------+---------+-------+---------+-----------+
| id      | INT     | false | NULL    | {primary} |
| balance | DECIMAL | true  | NULL    | {}        |
+---------+---------+-------+---------+-----------+
(2 rows)
~~~

When you no longer need a table, use [`DROP TABLE`](drop-table.html) followed by the table name to remove the table and all its data:

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TABLE accounts;
~~~

## Show Tables

To see all tables in the active database, use the [`SHOW TABLES`](show-tables.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
+----------+
|  Table   |
+----------+
| accounts |
| users    |
+----------+
(2 rows)
~~~

To view tables in a database that's not active, use `SHOW TABLES FROM` followed by the name of the database:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM animals;
~~~

~~~
+-----------+
|   Table   |
+-----------+
| aardvarks |
| elephants |
| frogs     |
| moles     |
| pandas    |
| turtles   |
+-----------+
(6 rows)
~~~

## Insert Rows into a Table

To insert a row into a table, use [`INSERT INTO`](insert.html) followed by the table name and then the column values listed in the order in which the columns appear in the table:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts VALUES (1, 10000.50);
~~~

If you want to pass column values in a different order, list the column names explicitly and provide the column values in the corresponding order:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (balance, id) VALUES
    (25000.00, 2);
~~~

To insert multiple rows into a table, use a comma-separated list of parentheses, each containing column values for one row:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts VALUES
    (3, 8100.73),
    (4, 9400.10);
~~~

[Default values](default-value.html) are used when you leave specific columns out of your statement, or when you explicitly request default values. For example, both of the following statements would create a row with `balance` filled with its default value, in this case `NULL`:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (id) VALUES
    (5);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (id, balance) VALUES
    (6, DEFAULT);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts WHERE id in (5, 6);
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  5 | NULL    |
|  6 | NULL    |
+----+---------+
(2 rows)
~~~

## Create an Index
[Indexes](indexes.html) help locate data without having to look through every row of a table. They're automatically created for the [primary key](primary-key.html) of a table and any columns with a [Unique constraint](unique.html).

To create an index for non-unique columns, use [`CREATE INDEX`](create-index.html) followed by an optional index name and an `ON` clause identifying the table and column(s) to index.  For each column, you can choose whether to sort ascending (`ASC`) or descending (`DESC`).

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE INDEX balance_idx ON accounts (balance DESC);
~~~

You can create indexes during table creation as well; just include the `INDEX` keyword followed by an optional index name and the column(s) to index:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE accounts (
    id INT PRIMARY KEY,
    balance DECIMAL,
    INDEX balance_idx (balance)
);
~~~

## Show Indexes on a Table

To show the indexes on a table, use [`SHOW INDEX FROM`](show-index.html) followed by the name of the table:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM accounts;
~~~

~~~
+----------+-------------+--------+-----+---------+-----------+---------+----------+
|  Table   |    Name     | Unique | Seq | Column  | Direction | Storing | Implicit |
+----------+-------------+--------+-----+---------+-----------+---------+----------+
| accounts | primary     | true   |   1 | id      | ASC       | false   | false    |
| accounts | balance_idx | false  |   1 | balance | DESC      | false   | false    |
| accounts | balance_idx | false  |   2 | id      | ASC       | false   | true     |
+----------+-------------+--------+-----+---------+-----------+---------+----------+
(3 rows)
~~~

## Query a Table

To query a table, use [`SELECT`](select-clause.html) followed by a comma-separated list of the columns to be returned and the table from which to retrieve the data:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT balance FROM accounts;
~~~

~~~
+----------+
| balance  |
+----------+
| 10000.50 |
| 25000.00 |
|  8100.73 |
|  9400.10 |
| NULL     |
| NULL     |
+----------+
(6 rows)
~~~

To retrieve all columns, use the `*` wildcard:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
+----+----------+
| id | balance  |
+----+----------+
|  1 | 10000.50 |
|  2 | 25000.00 |
|  3 |  8100.73 |
|  4 |  9400.10 |
|  5 | NULL     |
|  6 | NULL     |
+----+----------+
(6 rows)
~~~

To filter the results, add a `WHERE` clause identifying the columns and values to filter on:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT id, balance FROM accounts WHERE balance > 9000;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  2 |   25000 |
|  1 | 10000.5 |
|  4 |  9400.1 |
+----+---------+
(3 rows)
~~~

To sort the results, add an `ORDER BY` clause identifying the columns to sort by. For each column, you can choose whether to sort ascending (`ASC`) or descending (`DESC`).

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT id, balance FROM accounts ORDER BY balance DESC;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  2 |   25000 |
|  1 | 10000.5 |
|  4 |  9400.1 |
|  3 | 8100.73 |
|  5 | NULL    |
|  6 | NULL    |
+----+---------+
(6 rows)
~~~

## Update Rows in a Table

To update rows in a table, use [`UPDATE`](update.html) followed by the table name, a `SET` clause identifying the columns to update and their new values, and a `WHERE` clause identifying the rows to update:

{% include_cached copy-clipboard.html %}
~~~ sql
> UPDATE accounts SET balance = balance - 5.50 WHERE balance < 10000;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
+----+----------+
| id | balance  |
+----+----------+
|  1 | 10000.50 |
|  2 | 25000.00 |
|  3 |  8095.23 |
|  4 |  9394.60 |
|  5 | NULL     |
|  6 | NULL     |
+----+----------+
(6 rows)
~~~

If a table has a primary key, you can use that in the `WHERE` clause to reliably update specific rows; otherwise, each row matching the `WHERE` clause is updated. When there's no `WHERE` clause, all rows in the table are updated.

## Delete Rows in a Table

To delete rows from a table, use [`DELETE FROM`](delete.html) followed by the table name and a `WHERE` clause identifying the rows to delete:

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM accounts WHERE id in (5, 6);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
+----+----------+
| id | balance  |
+----+----------+
|  1 | 10000.50 |
|  2 | 25000.00 |
|  3 |  8095.23 |
|  4 |  9394.60 |
+----+----------+
(4 rows)
~~~

Just as with the `UPDATE` statement, if a table has a primary key, you can use that in the `WHERE` clause to reliably delete specific rows; otherwise, each row matching the `WHERE` clause is deleted. When there's no `WHERE` clause, all rows in the table are deleted.

## What's Next?

- Explore all [SQL Statements](sql-statements.html)
- [Use the built-in SQL client](use-the-built-in-sql-client.html) to execute statements from a shell or directly from the command line
- [Install the client driver](install-client-drivers.html) for your preferred language and [build an app](build-an-app-with-cockroachdb.html)
- [Explore core CockroachDB features](demo-data-replication.html) like automatic replication, rebalancing, and fault tolerance
