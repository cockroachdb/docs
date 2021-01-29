---
title: Learn CockroachDB SQL
summary: Learn some of the most essential CockroachDB SQL statements on a local cluster.
toc: true
---

This tutorial walks you through some of the most essential CockroachDB SQL statements. For a complete list of supported SQL statements and related details, see [SQL Statements](../v20.1/sql-statements.html).

## Before you begin

Make sure you have already [connected the CockroachDB SQL client](connect-to-your-cluster.html#step-4-connect-to-your-cluster) to your cluster. Alternatively, you can [use a local demo cluster](../stable/learn-cockroachdb-sql.html) or click below to run through the tutorial entirely in your browser.

<div class=" clearfix">
  <a class="btn btn-outline-primary" href="../tutorials/learn-cockroachdb-sql-interactive.html" target="_blank">Run this in your browser &rarr;</a>
</div>

## Create a database

Your CockroachCloud cluster comes with a `defaultdb` for testing and some internal databases.

To create a new database, connect with your initial "admin" user and use [`CREATE DATABASE`](../v20.1/create-database.html) followed by a database name:

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

Database names must follow [these identifier rules](../v20.1/keywords-and-identifiers.html#identifiers). To avoid an error in case the database already exists, you can include `IF NOT EXISTS`:

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE IF NOT EXISTS bank;
~~~

When you no longer need a database, use [`DROP DATABASE`](../v20.1/drop-database.html) followed by the database name to remove the database and all its objects:

{% include copy-clipboard.html %}
~~~ sql
> DROP DATABASE bank;
~~~

## Show databases

To see all databases, use the [`SHOW DATABASES`](../v20.1/show-databases.html) statement or the `\l` [shell command](../v20.1/cockroach-sql.html#commands):

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
  database_name
+---------------+
  bank
  defaultdb
  postgres
  system
(4 rows)
~~~

## Set the default database

It's best to set the default database directly in your [connection string](connect-to-your-cluster.html#step-3-select-a-connection-method).

{% include copy-clipboard.html %}
~~~ sql
> SET DATABASE = bank;
~~~

When working in the default database, you do not need to reference it explicitly in statements. To see which database is currently the default, use the `SHOW DATABASE` statement (note the singular form):

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASE;
~~~

~~~
  database
+----------+
  bank
(1 row)
~~~

## Create a table

To create a table, use [`CREATE TABLE`](../v20.1/create-table.html) followed by a table name, the column names, and the [data type](../v20.1/data-types.html) and [constraint](../v20.1/constraints.html), if any, for each column:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE accounts (
    id INT PRIMARY KEY,
    balance DECIMAL
);
~~~

Table and column names must follow [these rules](../v20.1/keywords-and-identifiers.html#identifiers). Also, when you do not explicitly define a [primary key](../v20.1/primary-key.html), CockroachDB will automatically add a hidden `rowid` column as the primary key.

To avoid an error in case the table already exists, you can include `IF NOT EXISTS`:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS accounts (
    id INT PRIMARY KEY,
    balance DECIMAL
);
~~~

To show all of the columns from a table, use the [`SHOW COLUMNS FROM <table>`](../v20.1/show-columns.html) statement or the `\d <table>` [shell command](../v20.1/cockroach-sql.html#commands):

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM accounts;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |   indices   | is_hidden
+-------------+-----------+-------------+----------------+-----------------------+-------------+-----------+
  id          | INT       |    false    | NULL           |                       | {"primary"} |   false
  balance     | DECIMAL   |    true     | NULL           |                       | {}          |   false
(2 rows)
~~~

When you no longer need a table, use [`DROP TABLE`](../v20.1/drop-table.html) followed by the table name to remove the table and all its data:

{% include copy-clipboard.html %}
~~~ sql
> DROP TABLE accounts;
~~~

## Show tables

To see all tables in the active database, use the [`SHOW TABLES`](../v20.1/show-tables.html) statement or the `\dt` [shell command](../v20.1/cockroach-sql.html#commands):

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
  table_name
+------------+
  accounts
(1 row)
~~~

## Insert rows

To insert a row into a table, use [`INSERT INTO`](../v20.1/insert.html) followed by the table name and then the column values listed in the order in which the columns appear in the table:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts VALUES (1, 10000.50);
~~~

If you want to pass column values in a different order, list the column names explicitly and provide the column values in the corresponding order:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (balance, id) VALUES
    (25000.00, 2);
~~~

To insert multiple rows into a table, use a comma-separated list of parentheses, each containing column values for one row:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts VALUES
    (3, 8100.73),
    (4, 9400.10);
~~~

[Defaults values](../v20.1/default-value.html) are used when you leave specific columns out of your statement, or when you explicitly request default values. For example, both of the following statements would create a row with `balance` filled with its default value, in this case `NULL`:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (id) VALUES
    (5);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts (id, balance) VALUES
    (6, DEFAULT);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts WHERE id in (5, 6);
~~~

~~~
  id | balance
+----+---------+
   5 | NULL
   6 | NULL
(2 rows)
~~~

## Create an index

[Indexes](../v20.1/indexes.html) help locate data without having to look through every row of a table. They're automatically created for the [primary key](../v20.1/primary-key.html) of a table and any columns with a [`UNIQUE` constraint](../v20.1/unique.html).

To create an index for non-unique columns, use [`CREATE INDEX`](../v20.1/create-index.html) followed by an optional index name and an `ON` clause identifying the table and column(s) to index.  For each column, you can choose whether to sort ascending (`ASC`) or descending (`DESC`).

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX balance_idx ON accounts (balance DESC);
~~~

You can create indexes during table creation as well; just include the `INDEX` keyword followed by an optional index name and the column(s) to index:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE accounts (
    id INT PRIMARY KEY,
    balance DECIMAL,
    INDEX balance_idx (balance)
);
~~~

## Show indexes

To show the indexes on a table, use [`SHOW INDEX FROM`](../v20.1/show-index.html) followed by the name of the table:

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM accounts;
~~~

~~~
  table_name | index_name  | non_unique | seq_in_index | column_name | direction | storing | implicit
+------------+-------------+------------+--------------+-------------+-----------+---------+----------+
  accounts   | primary     |   false    |            1 | id          | ASC       |  false  |  false
  accounts   | balance_idx |    true    |            1 | balance     | DESC      |  false  |  false
  accounts   | balance_idx |    true    |            2 | id          | ASC       |  false  |   true
(3 rows)
~~~

## Query a table

To query a table, use [`SELECT`](../v20.1/select-clause.html) followed by a comma-separated list of the columns to be returned and the table from which to retrieve the data:

{% include copy-clipboard.html %}
~~~ sql
> SELECT balance FROM accounts;
~~~

~~~
  balance
+----------+
  10000.50
  25000.00
   8100.73
   9400.10
  NULL
  NULL
(6 rows)
~~~

To retrieve all columns, use the `*` wildcard:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
  id | balance
+----+----------+
   1 | 10000.50
   2 | 25000.00
   3 |  8100.73
   4 |  9400.10
   5 | NULL
   6 | NULL
(6 rows)
~~~

To filter the results, add a `WHERE` clause identifying the columns and values to filter on:

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, balance FROM accounts WHERE balance > 9000;
~~~

~~~
  id | balance
+----+----------+
   2 | 25000.00
   1 | 10000.50
   4 |  9400.10
(3 rows)
~~~

To sort the results, add an `ORDER BY` clause identifying the columns to sort by. For each column, you can choose whether to sort ascending (`ASC`) or descending (`DESC`).

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, balance FROM accounts ORDER BY balance DESC;
~~~

~~~
  id | balance
+----+----------+
   2 | 25000.00
   1 | 10000.50
   4 |  9400.10
   3 |  8100.73
   5 | NULL
   6 | NULL
(6 rows)
~~~

## Update rows

To update rows in a table, use [`UPDATE`](../v20.1/update.html) followed by the table name, a `SET` clause identifying the columns to update and their new values, and a `WHERE` clause identifying the rows to update:

{% include copy-clipboard.html %}
~~~ sql
> UPDATE accounts SET balance = balance - 5.50 WHERE balance < 10000;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
  id | balance
+----+----------+
   1 | 10000.50
   2 | 25000.00
   3 |  8095.23
   4 |  9394.60
   5 | NULL
   6 | NULL
(6 rows)
~~~

If a table has a primary key, you can use that in the `WHERE` clause to reliably update specific rows; otherwise, each row matching the `WHERE` clause is updated. When there's no `WHERE` clause, all rows in the table are updated.

## Delete rows

To delete rows from a table, use [`DELETE FROM`](../v20.1/delete.html) followed by the table name and a `WHERE` clause identifying the rows to delete:

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM accounts WHERE id in (5, 6);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
  id | balance
+----+----------+
   1 | 10000.50
   2 | 25000.00
   3 |  8095.23
   4 |  9394.60
(4 rows)
~~~

Just as with the `UPDATE` statement, if a table has a primary key, you can use that in the `WHERE` clause to reliably delete specific rows; otherwise, each row matching the `WHERE` clause is deleted. When there's no `WHERE` clause, all rows in the table are deleted.
