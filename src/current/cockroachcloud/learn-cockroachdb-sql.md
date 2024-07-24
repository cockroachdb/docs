---
title: Learn CockroachDB SQL
summary: Learn some of the most essential CockroachDB SQL statements on a local cluster.
toc: true
docs_area: get_started
---

This tutorial walks you through some of the most important CockroachDB SQL statements. For a list of all supported SQL statements, see [SQL Statements](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/sql-statements).

{{site.data.alerts.callout_info}}
This tutorial is for {{site.data.products.dedicated}} or {{site.data.products.serverless}} users.
{{site.data.alerts.end}}

## Before you begin

Make sure that you can connect the [`cockroach-sql`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-sql-binary) client to a [{{site.data.products.serverless}}](connect-to-a-serverless-cluster.html?filters=cockroachdb-client) or [{{site.data.products.dedicated}}]({% link cockroachcloud/connect-to-your-cluster.md %}) cluster.

## Create a database

Your CockroachDB {{ site.data.products.cloud }} cluster comes with a database called `defaultdb`. This is used for testing and some internal databases.

To create a new database, use [`CREATE DATABASE`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/create-database) followed by a database name:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DATABASE bank;
~~~

Database names must follow [these identifier rules](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/keywords-and-identifiers#identifiers). To avoid an error in case the database already exists, use the `IF NOT EXISTS` clause:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DATABASE IF NOT EXISTS bank;
~~~

## Show databases

To see all databases, use the [`SHOW DATABASES`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/show-databases) statement or the `\l` [shell command](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-sql#commands):

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW DATABASES;
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

It's best to set the default database directly in your connection string. Refer to [Connect to your cluster]({% link cockroachcloud/connect-to-your-cluster.md %}#connect-to-your-cluster).

{% include_cached copy-clipboard.html %}
~~~ sql
SET DATABASE = bank;
~~~

When working in the default database, you do not need to reference it explicitly in statements. To see which database is currently the default, use the `SHOW DATABASE` statement (note the singular form):

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW DATABASE;
~~~

~~~
  database
+----------+
  bank
(1 row)
~~~

## Create a table

To create a table, use [`CREATE TABLE`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/create-table) followed by a table name, the column names, and the [data type](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/data-types) and [constraint](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/constraints), if any, for each column:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE accounts (id INT8 PRIMARY KEY, balance DECIMAL);
~~~

Table and column names must follow [these rules](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/keywords-and-identifiers#identifiers). Also, when you do not explicitly define a [primary key](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/primary-key), CockroachDB will automatically add a hidden `rowid` column as the primary key.

To avoid an error in case the table already exists, you can include `IF NOT EXISTS`:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE IF NOT EXISTS accounts (
    id INT8 PRIMARY KEY, balance DECIMAL
);
~~~

To show all of the columns from a table, use the [`SHOW COLUMNS FROM <table>`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/show-columns) statement or the `\d <table>` [shell command](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-sql#commands):

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW COLUMNS FROM accounts;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |   indices   | is_hidden
+-------------+-----------+-------------+----------------+-----------------------+-------------+-----------+
  id          | INT       |    false    | NULL           |                       | {"primary"} |   false
  balance     | DECIMAL   |    true     | NULL           |                       | {}          |   false
(2 rows)
~~~

## Show tables

To see all tables in the active database, use the [`SHOW TABLES`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/show-tables) statement or the `\dt` [shell command](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-sql#commands):

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW TABLES;
~~~

~~~
  table_name
+------------+
  accounts
(1 row)
~~~

## Insert rows

To insert a row into a table, use [`INSERT INTO`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/insert) followed by the table name and then the column values listed in the order in which the columns appear in the table:

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO accounts VALUES (1, 10000.50);
~~~

If you want to pass column values in a different order, list the column names explicitly and provide the column values in the corresponding order:

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO accounts (balance, id) VALUES (25000.00, 2);
~~~

To insert multiple rows into a table, use a comma-separated list of parentheses, each containing column values for one row:

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO accounts VALUES (3, 8100.73), (4, 9400.10);
~~~

[Default values](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/default-value) are used when you leave specific columns out of your statement, or when you explicitly request default values. For example, both of the following statements would create a row with `balance` filled with its default value, in this case `NULL`:

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO accounts (id) VALUES (5);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO accounts (id, balance) VALUES (6, DEFAULT);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM accounts WHERE id IN (5, 6);
~~~

~~~
  id | balance
+----+---------+
   5 | NULL
   6 | NULL
(2 rows)
~~~

## Create an index

[Indexes](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/indexes) help locate data without having to look through every row of a table. They're automatically created for the [primary key](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/primary-key) of a table and any columns with a [`UNIQUE` constraint](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/unique).

To create an index for non-unique columns, use [`CREATE INDEX`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/create-index) followed by an optional index name and an `ON` clause identifying the table and column(s) to index. For each column, you can choose whether to sort ascending (`ASC`) or descending (`DESC`).

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INDEX balance_idx ON accounts (balance DESC);
~~~

You can create indexes during table creation as well; just include the `INDEX` keyword followed by an optional index name and the column(s) to index:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE IF NOT EXISTS accounts (
    id INT8 PRIMARY KEY, balance DECIMAL,
    INDEX balance_idx (balance)
);
~~~

## Show indexes

To show the indexes on a table, use [`SHOW INDEX FROM`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/show-index) followed by the name of the table:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW INDEX FROM accounts;
~~~

~~~
  table_name | index_name  | non_unique | seq_in_index | column_name | direction | storing | implicit
+------------+-------------+------------+--------------+-------------+-----------+---------+----------+
  accounts   | balance_idx |    true    |            1 | balance     | DESC      |  false  |  false
  accounts   | balance_idx |    true    |            2 | id          | ASC       |  false  |   true
  accounts   | primary     |   false    |            1 | id          | ASC       |  false  |  false
  accounts   | primary     |   false    |            2 | balance     | N/A       |  true   |  false
(4 rows)
~~~

## Query a table

To query a table, use [`SELECT`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/select-clause) followed by a comma-separated list of the columns to be returned and the table from which to retrieve the data:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT balance FROM accounts;
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

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM accounts;
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

To filter the results, add a [`WHERE` clause](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/select-clause#where-clause) identifying the columns and values to filter on:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT id, balance FROM accounts WHERE balance > 9000;
~~~

~~~
  id | balance
+----+----------+
   2 | 25000.00
   1 | 10000.50
   4 |  9400.10
(3 rows)
~~~

To sort the results, add an [`ORDER BY`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/order-by) clause identifying the columns to sort by. For each column, you can choose whether to sort ascending (`ASC`) or descending (`DESC`).

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT id, balance FROM accounts ORDER BY balance DESC;
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

To update rows in a table, use [`UPDATE`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/update) followed by the table name, a `SET` clause identifying the columns to update and their new values, and a [`WHERE` clause](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/select-clause#where-clause) identifying the rows to update:

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE
    accounts
SET
    balance = balance - 5.50
WHERE
    balance < 10000;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM accounts;
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

If a table has a primary key, you can use that in the [`WHERE` clause](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/select-clause#where-clause) to reliably update specific rows; otherwise, each row matching the [`WHERE` clause](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/select-clause#where-clause) is updated. When there's no [`WHERE` clause](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/select-clause#where-clause), all rows in the table are updated.

## Delete rows

To delete rows from a table, use [`DELETE FROM`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/delete) followed by the table name and a [`WHERE` clause](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/select-clause#where-clause) identifying the rows to delete:

{% include_cached copy-clipboard.html %}
~~~ sql
DELETE FROM accounts WHERE id in (5, 6);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM accounts;
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

Just as with the `UPDATE` statement, if a table has a primary key, you can use that in the [`WHERE` clause](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/select-clause#where-clause) to reliably delete specific rows; otherwise, each row matching the [`WHERE` clause](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/select-clause#where-clause) is deleted. When there's no [`WHERE` clause](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/select-clause#where-clause), all rows in the table are deleted.

## Drop a table

When you no longer need a table, use [`DROP TABLE`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/drop-table) followed by the table name to remove the table and all its data:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP TABLE accounts;
~~~

## Drop a database

When you no longer need a database, use [`DROP DATABASE`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/drop-database) followed by the database name to remove the database and all its objects:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP DATABASE bank;
~~~

## See also

- [Developer Guide Overview](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/developer-guide-overview)
- [Deploy a Netlify App Built on CockroachDB](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/deploy-app-netlify)
- [Deploy a Web App built on CockroachDB with Vercel](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/deploy-app-vercel)
- [Build a Simple CRUD Node.js App with CockroachDB and the node-postgres Driver](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-nodejs-app-with-cockroachdb)
- [Build a Simple CRUD Python App with CockroachDB and SQLAlchemy](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-python-app-with-cockroachdb-sqlalchemy)
- [Build a Python App with CockroachDB and Django](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-python-app-with-cockroachdb-django)
- [Build a Simple CRUD Go App with CockroachDB and the Go pgx Driver](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/build-a-go-app-with-cockroachdb)
- [Connect to a {{site.data.products.serverless}} cluster](connect-to-a-serverless-cluster.html?filters=cockroachdb-client)
- [Connect to a {{site.data.products.dedicated}} cluster]({% link cockroachcloud/connect-to-your-cluster.md %})
- [Serverless FAQs]({% link cockroachcloud/serverless-faqs.md %})
- [Dedicated FAQs]({% link cockroachcloud/frequently-asked-questions.md %})
- [SQL FAQs](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/drop-database)
- [SQL Statements](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/sql-statements)
