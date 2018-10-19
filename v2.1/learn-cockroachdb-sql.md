---
title: Learn CockroachDB SQL
summary: Learn some of the most essential CockroachDB SQL statements.
toc: true
build_for: both
---

This page walks you through some of the most essential CockroachDB SQL statements. For a complete list and related details, see [SQL Statements]{% if site.managed %}(../../{{ page.version.version }}/sql-statements.html){% else %}(sql-statements.html){% endif %}.

{% unless site.managed %}
{{site.data.alerts.callout_success}}
Use an interactive SQL shell to try out these statements. If you have a cluster already running, use the [`cockroach sql`](use-the-built-in-sql-client.html) command. Otherwise, use the [`cockroach demo`](cockroach-demo.html) command to open a shell to a temporary, in-memory cluster.
{{site.data.alerts.end}}
{% endunless %}

{{site.data.alerts.callout_info}}
CockroachDB aims to provide standard SQL with extensions, but some standard SQL functionality is not yet available. See our [SQL Feature Support]{% if site.managed %}(../../{{ page.version.version }}/sql-feature-support.html){% else %}(sql-feature-support.html){% endif %} page for more details.
{{site.data.alerts.end}}

{% if site.managed %}
## Before you begin

Make sure you have already [connected CockroachDB SQL client](managed-connect-to-your-cluster.html#use-the-cockroachdb-sql-client) to your cluster.

## Create a database

Your Managed CockroachDB cluster comes with a pre-created database, mentioned in your [confirmation email](managed-sign-up-for-a-cluster.html#connection-details), as well as a `defaultdb` for testing and some internal databases. To create a new database, use [`CREATE DATABASE`]{% if site.managed %}(../../{{ page.version.version }}/create-database.html){% else %}(create-database.html){% endif %} followed by a database name:

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

Database names must follow [these identifier rules]{% if site.managed %}(../../{{ page.version.version }}/keywords-and-identifiers.html#identifiers){% else %}(keywords-and-identifiers.html#identifiers){% endif %}. To avoid an error in case the database already exists, you can include `IF NOT EXISTS`:

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE IF NOT EXISTS bank;
~~~

When you no longer need a database, use [`DROP DATABASE`]{% if site.managed %}(../../{{ page.version.version }}/drop-database.html){% else %}(drop-database.html){% endif %} followed by the database name to remove the database and all its objects:

{% include copy-clipboard.html %}
~~~ sql
> DROP DATABASE bank;
~~~

## Show databases

To see all databases, use the [`SHOW DATABASES`]{% if site.managed %}(../../{{ page.version.version }}/show-databases.html){% else %}(show-databases.html){% endif %} statement:

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

It's best to set the default database directly in your [connection string](managed-sign-up-for-a-cluster.html#connection-details), but once in a CockroachDB SQL shell, you can use the [`SET`]{% if site.managed %}(../../{{ page.version.version }}/set-vars.html#examples){% else %}(set-vars.html#examples){% endif %} statement to switch the default database:

{% include copy-clipboard.html %}
~~~ sql
> SET DATABASE = bank;
~~~

When working in the default database, you don't need to reference it explicitly in statements. To see which database is currently the default, use the `SHOW DATABASE` statement (note the singular form):

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
{% endif %}

## Create a table

To create a table, use [`CREATE TABLE`]{% if site.managed %}(../../{{ page.version.version }}/create-table.html){% else %}(create-table.html){% endif %} followed by a table name, the column names, and the [data type]{% if site.managed %}(../../{{ page.version.version }}/data-types.html){% else %}(data-types.html){% endif %} and [constraint]{% if site.managed %}(../../{{ page.version.version }}/constraints.html){% else %}(constraints.html){% endif %}, if any, for each column:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE accounts (
    id INT PRIMARY KEY,
    balance DECIMAL
);
~~~

Table and column names must follow [these rules]{% if site.managed %}(../../{{ page.version.version }}/keywords-and-identifiers.html#identifiers){% else %}(keywords-and-identifiers.html#identifiers){% endif %}. Also, when you do not explicitly define a [primary key]{% if site.managed %}(../../{{ page.version.version }}/primary-key.html){% else %}(primary-key.html){% endif %}, CockroachDB will automatically add a hidden `rowid` column as the primary key.

To avoid an error in case the table already exists, you can include `IF NOT EXISTS`:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS accounts (
    id INT PRIMARY KEY,
    balance DECIMAL
);
~~~

To show all of the columns from a table, use [`SHOW COLUMNS FROM`]{% if site.managed %}(../../{{ page.version.version }}/show-columns.html){% else %}(show-columns.html){% endif %} followed by the table name:

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM accounts;
~~~

~~~
+-------------+-----------+-------------+----------------+-----------------------+---------+
| column_name | data_type | is_nullable | column_default | generation_expression | indices |
+-------------+-----------+-------------+----------------+-----------------------+---------+
| id          | INT       |    true     | unique_rowid() |                       | {}      |
| balance     | DECIMAL   |    true     | NULL           |                       | {}      |
+-------------+-----------+-------------+----------------+-----------------------+---------+
(2 rows)
~~~

When you no longer need a table, use [`DROP TABLE`]{% if site.managed %}(../../{{ page.version.version }}/drop-table.html){% else %}(drop-table.html){% endif %} followed by the table name to remove the table and all its data:

{% include copy-clipboard.html %}
~~~ sql
> DROP TABLE accounts;
~~~

## Show tables

To see all tables in the active database, use the [`SHOW TABLES`]{% if site.managed %}(../../{{ page.version.version }}/show-tables.html){% else %}(show-tables.html){% endif %} statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
+----------+
|  Table   |
+----------+
| accounts |
+----------+
(1 row)
~~~

## Insert rows into a table

To insert a row into a table, use [`INSERT INTO`]{% if site.managed %}(../../{{ page.version.version }}/insert.html){% else %}(insert.html){% endif %} followed by the table name and then the column values listed in the order in which the columns appear in the table:

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

[Defaults values]{% if site.managed %}(../../{{ page.version.version }}/default-value.html){% else %}(default-value.html){% endif %} are used when you leave specific columns out of your statement, or when you explicitly request default values. For example, both of the following statements would create a row with `balance` filled with its default value, in this case `NULL`:

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
+----+---------+
| id | balance |
+----+---------+
|  5 | NULL    |
|  6 | NULL    |
+----+---------+
(2 rows)
~~~

## Create an index

[Indexes]{% if site.managed %}(../../{{ page.version.version }}/indexes.html){% else %}(indexes.html){% endif %} help locate data without having to look through every row of a table. They're automatically created for the [primary key]{% if site.managed %}(../../{{ page.version.version }}/primary-key.html){% else %}(primary-key.html){% endif %} of a table and any columns with a [`UNIQUE` constraint]{% if site.managed %}(../../{{ page.version.version }}/unique.html){% else %}(unique.html){% endif %}.

To create an index for non-unique columns, use [`CREATE INDEX`]{% if site.managed %}(../../{{ page.version.version }}/create-index.html){% else %}(create-index.html){% endif %} followed by an optional index name and an `ON` clause identifying the table and column(s) to index.  For each column, you can choose whether to sort ascending (`ASC`) or descending (`DESC`).

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

## Show indexes on a table

To show the indexes on a table, use [`SHOW INDEX FROM`]{% if site.managed %}(../../{{ page.version.version }}/show-index.html){% else %}(show-index.html){% endif %} followed by the name of the table:

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM accounts;
~~~

~~~
+------------+-------------+------------+--------------+-------------+-----------+---------+----------+
| table_name | index_name  | non_unique | seq_in_index | column_name | direction | storing | implicit |
+------------+-------------+------------+--------------+-------------+-----------+---------+----------+
| accounts   | primary     |   false    |            1 | id          | ASC       |  false  |  false   |
| accounts   | balance_idx |    true    |            1 | balance     | ASC       |  false  |  false   |
| accounts   | balance_idx |    true    |            2 | id          | ASC       |  false  |   true   |
+------------+-------------+------------+--------------+-------------+-----------+---------+----------+
(3 rows)
~~~

## Query a table

To query a table, use [`SELECT`]{% if site.managed %}(../../{{ page.version.version }}/select-clause.html){% else %}(select-clause.html){% endif %} followed by a comma-separated list of the columns to be returned and the table from which to retrieve the data:

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

## Update rows in a table

To update rows in a table, use [`UPDATE`]{% if site.managed %}(../../{{ page.version.version }}/update.html){% else %}(update.html){% endif %} followed by the table name, a `SET` clause identifying the columns to update and their new values, and a `WHERE` clause identifying the rows to update:

{% include copy-clipboard.html %}
~~~ sql
> UPDATE accounts SET balance = balance - 5.50 WHERE balance < 10000;
~~~

{% include copy-clipboard.html %}
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

## Delete rows in a table

To delete rows from a table, use [`DELETE FROM`]{% if site.managed %}(../../{{ page.version.version }}/delete.html){% else %}(delete.html){% endif %} followed by the table name and a `WHERE` clause identifying the rows to delete:

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM accounts WHERE id in (5, 6);
~~~

{% include copy-clipboard.html %}
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

{% unless site.managed %}
## What's next?

- Explore all [SQL Statements](sql-statements.html)
- [Use the built-in SQL client](use-the-built-in-sql-client.html) to execute statements from a shell or directly from the command line
- [Install the client driver](install-client-drivers.html) for your preferred language and [build an app](build-an-app-with-cockroachdb.html)
- [Explore core CockroachDB features](demo-data-replication.html) like automatic replication, rebalancing, and fault tolerance
{% endunless %}

<!-- Reference Links -->

[postgres]: migrate-from-postgres.html
[mysql]: migrate-from-mysql.html
[csv]: migrate-from-csv.html
