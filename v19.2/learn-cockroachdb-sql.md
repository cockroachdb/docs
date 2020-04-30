---
title: Learn CockroachDB SQL
summary: Learn some of the most essential CockroachDB SQL statements on a local cluster.
toc: true
---

{% unless site.cockroachcloud %}

This tutorial walks you through some of the most essential CockroachDB SQL statements, using the `movr` dataset.

For a complete list of supported SQL statements and related details, see [SQL Statements](sql-statements.html).

For more information about the `movr` dataset and the MovR example application, see [MovR: A Global Ride-sharing App](movr.html).

## Before you begin

Do one of the following:

{% include {{page.version.version}}/sql/movr-start.md %}

## Show tables

To see all tables in the active database, use the [`SHOW TABLES`](show-tables.html) statement or the `\dt` [shell command](cockroach-sql.html#commands):

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
          table_name
+----------------------------+
  promo_codes
  rides
  user_promo_codes
  users
  vehicle_location_histories
  vehicles
(6 rows)
~~~

## Create a table

Suppose that you want MovR to offer ride-sharing services, in addition to vehicle-sharing services. You'll need to add a table for drivers to the `movr` database. To create a table, use [`CREATE TABLE`](create-table.html) followed by a table name, the column names, and the [data type](data-types.html) and [constraint](constraints.html), if any, for each column:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE drivers (
    id UUID NOT NULL,
    city STRING NOT NULL,
    name STRING,
    dl STRING UNIQUE,
    address STRING,
    CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC)
);
~~~

Table and column names must follow [these rules](keywords-and-identifiers.html#identifiers). Also, when you do not explicitly define a [primary key](primary-key.html), CockroachDB will automatically add a hidden `rowid` column as the primary key.

To avoid an error in case the table already exists, you can include `IF NOT EXISTS`:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS drivers (
    id UUID NOT NULL,
    city STRING NOT NULL,
    name STRING,
    dl STRING UNIQUE,
    address STRING,
    CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC)
);
~~~

To show all of the columns from a table, use the [`SHOW COLUMNS FROM <table>`](show-columns.html) statement or the `\d <table>` [shell command](cockroach-sql.html#commands):

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM drivers;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
+-------------+-----------+-------------+----------------+-----------------------+-----------+-----------+
  id          | UUID      |    false    | NULL           |                       | {primary} |   false
  city        | STRING    |    false    | NULL           |                       | {primary} |   false
  name        | STRING    |    true     | NULL           |                       | {}        |   false
  dl          | STRING    |    true     | NULL           |                       | {}        |   false
  address     | STRING    |    true     | NULL           |                       | {}        |   false
(5 rows)
~~~


## Insert rows into a table

To insert a row into a table, use [`INSERT INTO`](insert.html) followed by the table name and then the column values listed in the order in which the columns appear in the table:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO drivers VALUES
    ('c28f5c28-f5c2-4000-8000-000000000026', 'new york', 'Petee', 'ABC-1234', '101 5th Ave');
~~~

If you want to pass column values in a different order, list the column names explicitly and provide the column values in the corresponding order:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO drivers (name, city, dl, address, id) VALUES
    ('Adam Driver', 'chicago', 'DEF-5678', '201 E Randolph St', '1eb851eb-851e-4800-8000-000000000006');
~~~

To insert multiple rows into a table, use a comma-separated list of parentheses, each containing column values for one row:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO drivers VALUES
    ('8a3d70a3-d70a-4000-8000-00000000001b', 'seattle', 'Eric', 'GHI-9123', '400 Broad St'),
    ('9eb851eb-851e-4800-8000-00000000001f', 'new york', 'Harry Potter', 'JKL-456', '214 W 43rd St');
~~~

[Defaults values](default-value.html) are used when you leave specific columns out of your statement, or when you explicitly request default values. For example, both of the following statements create a row where the `name`, `dl`, and `address` entries each contain their default value, in this case `NULL`:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO drivers (id, city) VALUES
    ('70a3d70a-3d70-4400-8000-000000000016', 'chicago');
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO drivers (id, city, name, dl, address) VALUES
    ('b851eb85-1eb8-4000-8000-000000000024', 'seattle', DEFAULT, DEFAULT, DEFAULT);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM drivers WHERE id in ('70a3d70a-3d70-4400-8000-000000000016', 'b851eb85-1eb8-4000-8000-000000000024');
~~~

~~~
                   id                  |  city   | name |  dl  | address
+--------------------------------------+---------+------+------+---------+
  70a3d70a-3d70-4400-8000-000000000016 | chicago | NULL | NULL | NULL
  b851eb85-1eb8-4000-8000-000000000024 | seattle | NULL | NULL | NULL
(2 rows)
~~~

## Create an index

[Indexes](indexes.html) help locate data without having to look through every row of a table. They're automatically created for the [primary key](primary-key.html) of a table and any columns with a [`UNIQUE` constraint](unique.html).

To create an index for non-unique columns, use [`CREATE INDEX`](create-index.html) followed by an optional index name and an `ON` clause identifying the table and column(s) to index.  For each column, you can choose whether to sort ascending (`ASC`) or descending (`DESC`).

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX name_idx ON users (name DESC);
~~~

You can create indexes during table creation as well; just include the `INDEX` keyword followed by an optional index name and the column(s) to index:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS drivers (
    id UUID NOT NULL,
    city STRING NOT NULL,
    name STRING,
    dl STRING,
    address STRING,
    INDEX name_idx (name),
    CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC)
);
~~~

## Show indexes on a table

To show the indexes on a table, use [`SHOW INDEX FROM`](show-index.html) followed by the name of the table:

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM users;
~~~

~~~
  table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
  users      | primary    |   false    |            1 | city        | ASC       |  false  |  false
  users      | primary    |   false    |            2 | id          | ASC       |  false  |  false
  users      | name_idx   |    true    |            1 | name        | DESC      |  false  |  false
  users      | name_idx   |    true    |            2 | city        | ASC       |  false  |   true
  users      | name_idx   |    true    |            3 | id          | ASC       |  false  |   true
(5 rows)
~~~


## Query a table

To query a table, use [`SELECT`](select-clause.html) followed by a comma-separated list of the columns to be returned and the table from which to retrieve the data. You can also use the [`LIMIT`](https://www.cockroachlabs.com/docs/dev/limit-offset.html) clause to restrict the number of rows retrieved:

{% include copy-clipboard.html %}
~~~ sql
> SELECT name FROM users LIMIT 10;
~~~

~~~
        name
+-------------------+
  William Wood
  Victoria Jennings
  Tyler Dalton
  Tony Ortiz
  Tina Miller
  Taylor Cunningham
  Susan Morse
  Steven Lara
  Stephen Diaz
  Sarah Wang DDS
(10 rows)
~~~

To retrieve all columns, use the `*` wildcard:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users LIMIT 10;
~~~

~~~
                   id                  |   city    |        name        |            address             | credit_card
+--------------------------------------+-----------+--------------------+--------------------------------+-------------+
  c28f5c28-f5c2-4000-8000-000000000026 | amsterdam | Maria Weber        | 14729 Karen Radial             | 5844236997
  c7ae147a-e147-4000-8000-000000000027 | amsterdam | Tina Miller        | 97521 Mark Extensions          | 8880478663
  cccccccc-cccc-4000-8000-000000000028 | amsterdam | Taylor Cunningham  | 89214 Jennifer Well            | 5130593761
  d1eb851e-b851-4800-8000-000000000029 | amsterdam | Kimberly Alexander | 48474 Alfred Hollow            | 4059628542
  19999999-9999-4a00-8000-000000000005 | boston    | Nicole Mcmahon     | 11540 Patton Extensions        | 0303726947
  1eb851eb-851e-4800-8000-000000000006 | boston    | Brian Campbell     | 92025 Yang Village             | 9016427332
  23d70a3d-70a3-4800-8000-000000000007 | boston    | Carl Mcguire       | 60124 Palmer Mews Apt. 49      | 4566257702
  28f5c28f-5c28-4600-8000-000000000008 | boston    | Jennifer Sanders   | 19121 Padilla Brooks Apt. 12   | 1350968125
  80000000-0000-4000-8000-000000000019 | chicago   | Matthew Clay       | 49220 Lisa Junctions           | 9132291015
  851eb851-eb85-4000-8000-00000000001a | chicago   | Samantha Coffey    | 6423 Jessica Underpass Apt. 87 | 9437219051
(10 rows)
~~~

To filter the results, add a `WHERE` clause identifying the columns and values to filter on:

{% include copy-clipboard.html %}
~~~ sql
> SELECT id, name FROM users WHERE city = 'chicago';
~~~

~~~
                   id                  |       name
+--------------------------------------+------------------+
  80000000-0000-4000-8000-000000000019 | Matthew Clay
  851eb851-eb85-4000-8000-00000000001a | Samantha Coffey
  8a3d70a3-d70a-4000-8000-00000000001b | Jessica Martinez
  8f5c28f5-c28f-4000-8000-00000000001c | John Hines
  947ae147-ae14-4800-8000-00000000001d | Kenneth Barnes
(5 rows)
~~~

To sort the results, add an `ORDER BY` clause identifying the columns to sort by. For each column, you can choose whether to sort ascending (`ASC`) or descending (`DESC`).

{% include copy-clipboard.html %}
~~~ sql
> SELECT city, type, current_location FROM vehicles ORDER BY city, type DESC;
~~~

~~~
      city      |    type    |        current_location
+---------------+------------+--------------------------------+
  amsterdam     | skateboard | 19202 Edward Pass
  boston        | scooter    | 19659 Christina Ville
  chicago       | skateboard | 69721 Noah River
  detroit       | scooter    | 43051 Jonathan Fords Suite 36
  los angeles   | skateboard | 49164 Anna Mission Apt. 38
  minneapolis   | scooter    | 62609 Stephanie Route
  minneapolis   | scooter    | 57637 Mitchell Shoals Suite 59
  new york      | skateboard | 64110 Richard Crescent
  new york      | scooter    | 86667 Edwards Valley
  paris         | skateboard | 2505 Harrison Parkway Apt. 89
  rome          | bike       | 64935 Matthew Flats Suite 55
  san francisco | skateboard | 81472 Morris Run
  san francisco | scooter    | 91427 Steven Spurs Apt. 49
  seattle       | bike       | 37754 Farmer Extension
  washington dc | scooter    | 47259 Natasha Cliffs
(15 rows)
~~~

## Update rows in a table

To update rows in a table, use [`UPDATE`](update.html) followed by the table name, a `SET` clause identifying the columns to update and their new values, and a `WHERE` clause identifying the rows to update:

{% include copy-clipboard.html %}
~~~ sql
> UPDATE promo_codes SET (description, rules) = ('EXPIRED', '{"type": "percent_discount", "value": "0%"}') WHERE expiration_time < '2019-01-22 03:04:05+00:00';
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT code, description, rules FROM promo_codes LIMIT 10;
~~~

~~~
            code            |                                                                                                   description                                                                                                    |                    rules
+---------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------------------------------------------+
  a_blue_member             | Yard send you end kitchen. High politics only support certainly. Reflect these agree travel bag myself. Month data magazine its trade water reality.                                                             | {"type": "percent_discount", "value": "10%"}
  a_down_man                | EXPIRED                                                                                                                                                                                                          | {"type": "percent_discount", "value": "0%"}
  ability_until_student     | Set hot parent statement organization charge. Wide new bag easy note each trial. Act compare information marriage. Through they speech top.                                                                      | {"type": "percent_discount", "value": "10%"}
  about_mission_pull        | Main serious education economy situation turn. Away senior realize evidence. Far himself against look. Husband skin pick within. Sense garden sister draw theory remain.                                         | {"type": "percent_discount", "value": "10%"}
  about_stuff_city          | Skill sing rich glass store whatever teach.                                                                                                                                                                      | {"type": "percent_discount", "value": "10%"}
  accept_gas_hundred        | Listen much get art popular.                                                                                                                                                                                     | {"type": "percent_discount", "value": "10%"}
  accept_resource_something | EXPIRED                                                                                                                                                                                                          | {"type": "percent_discount", "value": "0%"}
  according_share_door      | Region difference letter now huge next any. Nothing hotel gas election hospital hope give. Capital can address look. Window off beyond success couple PM as hair. Side who understand indeed future system vote. | {"type": "percent_discount", "value": "10%"}
  account_interest_next     | EXPIRED                                                                                                                                                                                                          | {"type": "percent_discount", "value": "0%"}
  act_even_camera           | EXPIRED                                                                                                                                                                                                          | {"type": "percent_discount", "value": "0%"}
(10 rows)
~~~

If a table has a primary key, you can use that in the `WHERE` clause to reliably update specific rows; otherwise, each row matching the `WHERE` clause is updated. When there's no `WHERE` clause, all rows in the table are updated.

## Delete rows in a table

To delete rows from a table, use [`DELETE FROM`](delete.html) followed by the table name and a `WHERE` clause identifying the rows to delete:

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM promo_codes WHERE description = 'EXPIRED';
~~~
~~~
DELETE 669
~~~

Just as with the `UPDATE` statement, if a table has a primary key, you can use that in the `WHERE` clause to reliably delete specific rows; otherwise, each row matching the `WHERE` clause is deleted. When there's no `WHERE` clause, all rows in the table are deleted.

## Remove a table

When you no longer need a table, use [`DROP TABLE`](drop-table.html) followed by the table name to remove the table and all its data:

{% include copy-clipboard.html %}
~~~ sql
> DROP TABLE drivers;
~~~

## What's next?

- Explore all [SQL Statements](sql-statements.html)
- [Use the built-in SQL client](cockroach-sql.html) to execute statements from a shell or directly from the command line
- [Install the client driver](install-client-drivers.html) for your preferred language and [build an app](build-an-app-with-cockroachdb.html)
- [Explore core CockroachDB features](demo-data-replication.html) like automatic replication, rebalancing, and fault tolerance
{% endunless %}

{% if site.cockroachcloud %}

This page walks you through some of the most essential CockroachDB SQL statements. For a complete list and related details, see [SQL Statements](sql-statements.html).

## Before you begin

Make sure you have already [connected the CockroachDB SQL client](cockroachcloud-connect-to-your-cluster.html#use-the-cockroachdb-sql-client) to your cluster.

## Create a database

Your CockroachCloud cluster comes with a `defaultdb` for testing and some internal databases.

To create a new database, connect with your initial "admin" user and use [`CREATE DATABASE`](create-database.html) followed by a database name:

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

Database names must follow [these identifier rules](keywords-and-identifiers.html#identifiers). To avoid an error in case the database already exists, you can include `IF NOT EXISTS`:

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE IF NOT EXISTS bank;
~~~

When you no longer need a database, use [`DROP DATABASE`](drop-database.html) followed by the database name to remove the database and all its objects:

{% include copy-clipboard.html %}
~~~ sql
> DROP DATABASE bank;
~~~

## Show databases

To see all databases, use the [`SHOW DATABASES`](show-databases.html) statement or the `\l` [shell command](cockroach-sql.html#commands):

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

It's best to set the default database directly in your [connection string](cockroachcloud-connect-to-your-cluster.html#step-3-select-a-connection-method).

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

To create a table, use [`CREATE TABLE`](create-table.html) followed by a table name, the column names, and the [data type](data-types.html) and [constraint](constraints.html), if any, for each column:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE accounts (
    id INT PRIMARY KEY,
    balance DECIMAL
);
~~~

Table and column names must follow [these rules](keywords-and-identifiers.html#identifiers). Also, when you do not explicitly define a [primary key](primary-key.html), CockroachDB will automatically add a hidden `rowid` column as the primary key.

To avoid an error in case the table already exists, you can include `IF NOT EXISTS`:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS accounts (
    id INT PRIMARY KEY,
    balance DECIMAL
);
~~~

To show all of the columns from a table, use the [`SHOW COLUMNS FROM <table>`](show-columns.html) statement or the `\d <table>` [shell command](cockroach-sql.html#commands):

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

When you no longer need a table, use [`DROP TABLE`](drop-table.html) followed by the table name to remove the table and all its data:

{% include copy-clipboard.html %}
~~~ sql
> DROP TABLE accounts;
~~~

## Show tables

To see all tables in the active database, use the [`SHOW TABLES`](show-tables.html) statement or the `\dt` [shell command](cockroach-sql.html#commands):

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

## Insert rows into a table

To insert a row into a table, use [`INSERT INTO`](insert.html) followed by the table name and then the column values listed in the order in which the columns appear in the table:

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

[Defaults values](default-value.html) are used when you leave specific columns out of your statement, or when you explicitly request default values. For example, both of the following statements would create a row with `balance` filled with its default value, in this case `NULL`:

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

[Indexes](indexes.html) help locate data without having to look through every row of a table. They're automatically created for the [primary key](primary-key.html) of a table and any columns with a [`UNIQUE` constraint](unique.html).

To create an index for non-unique columns, use [`CREATE INDEX`](create-index.html) followed by an optional index name and an `ON` clause identifying the table and column(s) to index.  For each column, you can choose whether to sort ascending (`ASC`) or descending (`DESC`).

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

To show the indexes on a table, use [`SHOW INDEX FROM`](show-index.html) followed by the name of the table:

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

To query a table, use [`SELECT`](select-clause.html) followed by a comma-separated list of the columns to be returned and the table from which to retrieve the data:

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

## Update rows in a table

To update rows in a table, use [`UPDATE`](update.html) followed by the table name, a `SET` clause identifying the columns to update and their new values, and a `WHERE` clause identifying the rows to update:

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

## Delete rows in a table

To delete rows from a table, use [`DELETE FROM`](delete.html) followed by the table name and a `WHERE` clause identifying the rows to delete:

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

{% endif %}
