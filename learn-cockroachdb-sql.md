---
title: Learn CockroachDB SQL
summary: Learn some of the most essential CockroachDB SQL statements.
toc: false
---

This page walks you through some of the most essential CockroachDB SQL statements. For a complete list and related details, see [SQL Statements](sql-statements.html).

{{site.data.alerts.callout_info}}CockroachDB aims to provide standard SQL with extensions, but some standard SQL functionality is not yet available. See our <a href="https://github.com/cockroachdb/cockroach/wiki">Product Roadmap</a> and <a href="sql-feature-support.html">SQL Feature Support</a> page for more details.{{site.data.alerts.end}}

<div id="toc"></div>

## Create a Database

CockroachDB comes with a single default `system` database, which contains CockroachDB metadata and is read-only. To create a new database, use [`CREATE DATABASE`](create-database.html) followed by a database name:

~~~ sql
> CREATE DATABASE bank;
~~~

Database names must follow [these identifier rules](keywords-and-identifiers.html#identifiers). To avoid an error in case the database already exists, you can include `IF NOT EXISTS`:

~~~ sql
> CREATE DATABASE IF NOT EXISTS bank;
~~~

When you no longer need a database, use [`DROP DATABASE`](drop-database.html) followed by the database name to remove the database and all its objects:

~~~ sql
> DROP DATABASE bank;
~~~

## Show Databases

To see all databases, use the [`SHOW DATABASES`](show-databases.html) statement:

~~~ sql
> SHOW DATABASES;
~~~
~~~
+----------+
| Database |
+----------+
| bank     |
| system   |
+----------+
~~~

## Set the Default Database

To set the default database, use the [`SET DATABASE`](set-database.html) statement:

~~~ sql
> SET DATABASE = bank;
~~~

When working with the default database, you don't need to reference it explicitly in statements. To see which database is currently the default, use the `SHOW DATABASE` statement (note the singular form):

~~~ sql
> SHOW DATABASE;
~~~
~~~
+----------+
| DATABASE |
+----------+
| bank     |
+----------+
~~~

## Create a Table

To create a table, use [`CREATE TABLE`](create-table.html) followed by a table name, the column names, and the [data type](data-types.html) and [constraint](constraints.html), if any, for each column:

~~~ sql
> CREATE TABLE accounts (
    id INT PRIMARY KEY,
    balance DECIMAL
);
~~~

Table and column names must follow [these rules](keywords-and-identifiers.html#identifiers). Also, when you don't explicitly define a `PRIMARY KEY`, CockroachDB will automatically add a hidden `rowid` column as the primary key.

To avoid an error in case the table already exists, you can include `IF NOT EXISTS`:

~~~ sql
> CREATE TABLE IF NOT EXISTS accounts (
    id INT PRIMARY KEY,
    balance DECIMAL
);
~~~

To show all of the columns from a table, use [`SHOW COLUMNS FROM`](show-columns.html) followed by the table name:

~~~ sql
> SHOW COLUMNS FROM accounts;
~~~
~~~
+---------+---------+-------+---------+
|  Field  |  Type   | Null  | Default |
+---------+---------+-------+---------+
| id      | INT     | false | NULL    |
| balance | DECIMAL | true  | NULL    |
+---------+---------+-------+---------+
~~~

When you no longer need a table, use [`DROP TABLE`](drop-table.html) followed by the table name to remove the table and all its data:

~~~ sql
> DROP TABLE accounts;
~~~

## Show Tables

To see all tables in the active database, use the [`SHOW TABLES`](show-tables.html) statement:

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
~~~

To view tables in a database that's not active, use `SHOW TABLES FROM` followed by the name of the database:

~~~ sql
> SHOW TABLES FROM animals;
~~~
~~~
+------------+
|   Table    |
+------------+
| aardvarks  |
| elephants  |
| frogs      |
| moles      |
| pandas     |
| turtles    |
+------------+
~~~

## Insert Rows into a Table

To insert a row into a table, use [`INSERT INTO`](insert.html) followed by the table name and then the column values listed in the order in which the columns appear in the table:

~~~ sql
> INSERT INTO accounts VALUES (1, 10000.50);
~~~

If you want to pass column values in a different order, list the column names explicitly and provide the column values in the corresponding order:

~~~ sql
> INSERT INTO accounts (balance, id) VALUES 
    (25000.00, 2);
~~~

To insert multiple rows into a table, use a comma-separated list of parentheses, each containing column values for one row:

~~~ sql
> INSERT INTO accounts VALUES 
    (3, 8100.73),
    (4, 9400.10);
~~~

[Defaults values](default-value.html) are used when you leave specific columns out of your statement, or when you explicitly request default values. For example, both of the following statements would create a row with `balance` filled with its default value, in this case `NULL`:

~~~ sql
> INSERT INTO accounts (id, balance) VALUES 
    (5);

> INSERT INTO accounts (id, balance) VALUES 
    (6, DEFAULT);

> SELECT * FROM accounts WHERE id in (5, 6);
~~~
~~~
+----+---------+
| id | balance |
+----+---------+
|  5 | NULL    |
|  6 | NULL    |
+----+---------+
~~~

## Create an Index
[Indexes](indexes.html) help locate data without having to look through every row of a table. They're automatically created for the [`PRIMARY KEY`](primary-key.html) of a table and any columns with a [`UNIQUE`](unique.html) constraint.

To create an index for non-unique columns, use [`CREATE INDEX`](create-index.html) followed by an optional index name and an `ON` clause identifying the table and column(s) to index.  For each column, you can choose whether to sort ascending (`ASC`) or descending (`DESC`).

~~~ sql
> CREATE INDEX balance_idx ON accounts (balance DESC);
~~~

You can create indexes during table creation as well; just include the `INDEX` keyword followed by an optional index name and the column(s) to index:

~~~ sql
> CREATE TABLE accounts (
    id INT PRIMARY KEY,
    balance DECIMAL,
    INDEX balance_idx (balance)
);
~~~

## Show Indexes on a Table

To show the indexes on a table, use [`SHOW INDEX FROM`](show-index.html) followed by the name of the table:

~~~ sql
> SHOW INDEX FROM accounts;
~~~
~~~
+----------+-------------+--------+-----+---------+-----------+---------+
|  Table   |    Name     | Unique | Seq | Column  | Direction | Storing |
+----------+-------------+--------+-----+---------+-----------+---------+
| accounts | primary     | true   |   1 | id      | ASC       | false   |
| accounts | balance_idx | false  |   1 | balance | DESC      | false   |
+----------+-------------+--------+-----+---------+-----------+---------+
~~~

## Query a Table

To query a table, use [`SELECT`](select.html) followed by a comma-separated list of the columns to be returned and the table from which to retrieve the data:

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
~~~

To retrieve all columns, use the `*` wildcard:

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
~~~

To filter the results, add a `WHERE` clause identifying the columns and values to filter on: 

~~~ sql
> SELECT id, balance FROM accounts WHERE balance > 9000;
~~~
~~~
+----+----------+
| id | balance  |
+----+----------+
|  4 |  9400.10 |
|  1 | 10000.50 |
|  2 |    25000 |
+----+----------+
~~~

To sort the results, add an `ORDER BY` clause identifying the columns to sort by. For each column, you can choose whether to sort ascending (`ASC`) or descending (`DESC`).

~~~ sql
> SELECT id, balance FROM accounts ORDER BY balance DESC;
~~~
~~~
+----+----------+
| id | balance  |
+----+----------+
|  2 |    25000 |
|  1 | 10000.50 |
|  4 |  9400.10 |
|  3 |  8100.73 |
|  6 | NULL     |
|  5 | NULL     |
+----+----------+
~~~ 

## Update Rows in a Table

To update rows in a table, use [`UPDATE`](update.html) followed by the table name, a `SET` clause identifying the columns to update and their new values, and a `WHERE` clause identifying the rows to update:

~~~ sql
> UPDATE accounts SET balance = balance - 5.50 WHERE balance < 10000;

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
~~~

If a table has a primary key, you can use that in the `WHERE` clause to reliably update specific rows; otherwise, each row matching the `WHERE` clause is updated. When there's no `WHERE` clause, all rows in the table are updated. 

## Delete Rows in a Table

To delete rows from a table, use [`DELETE FROM`](delete.html) followed by the table name and a `WHERE` clause identifying the rows to delete: 

~~~ sql
> DELETE FROM accounts WHERE id in (5, 6);

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
~~~

Just as with the `UPDATE` statement, if a table has a primary key, you can use that in the `WHERE` clause to reliably delete specific rows; otherwise, each row matching the `WHERE` clause is deleted. When there's no `WHERE` clause, all rows in the table are deleted. 

## What's Next?

- [Use the built-in SQL client](use-the-built-in-sql-client.html) to execute statements from a shell or directly from the command line
- [Install the client driver](install-client-drivers.html) for your preferred language and [build a test app](build-a-test-app.html)
- Explore our full [SQL grammar](sql-grammar.html)
