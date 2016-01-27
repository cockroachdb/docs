---
title: Basic SQL Commands
toc: false
---

This page walks you through some of the most essential CockroachDB SQL commands. For a complete list of commands and their options, as well as details about data types and other concepts, see [SQL Reference](/sql-reference.html).

{{site.data.alerts.callout_info}}CockroachDB aims to provide standard SQL with extensions, but some standard SQL functionality is yet not available in our Beta version. Joins and interleaved tables, for example, will be built into v 1.0. See our <a href="https://github.com/cockroachdb/cockroach/issues/2132">Product Roadmap</a> for more details.{{site.data.alerts.end}}    

## Create a Database

CockroachDB comes with a single default `system` database, which contains CockroachDB metadata and is read-only. To create a new database, use the [`CREATE DATABASE`](/create-database.html) command followed by a database name:

```postgres
CREATE DATABASE books;
```

Database names must follow [these rules](/identifiers.html). To avoid an error in case the database already exists, you can include `IF NOT EXISTS`:

```postgres
CREATE DATABASE IF NOT EXISTS books;
```

When you no longer need a database, use the [`DROP DATABASE`](/drop-database.html) command followed by the database name to remove the database and all its objects:

```postgres
DROP DATABASE books;
```

## Show Available Databases

To see all available databases, use the [`SHOW DATABASES`](show-databases.html) command:

```postgres
SHOW DATABASES;
```
```
+----------+
| Database |
+----------+
| system   |
| books    |
| animals  |
+----------+
```

## Set a Database

To set a database as active, use the [`SET DATABASE`](/set-database.html) command:

```postgres
SET DATABASE = bank;
```

When a database is active, you don't need to reference it explicitly in subsequent statements. To see which database is currently active, use the `SHOW DATABASE` command (note the singular form):

```postgres
SHOW DATABASE;
```
```
+----------+
| DATABASE |
+----------+
| bank     |
+----------+
```

## Create a Table

To create a table, use the [`CREATE TABLE`](/create-table.html) command followed by a table name, the columns in the table, and the [data type](/data-types.html) for each column:

```postgres
CREATE TABLE accounts (
    account_num     int,
    balance         decimal,
    created_on      date,
    last_modified   timestamp
);
```

Table and column names must follow [these rules](/identifiers.html). Also, white space is not semantically meaningful, so you can format the command differently than above (e.g., all on one line).

To avoid an error in case the table already exists, you can include `IF NOT EXISTS`:

```postgres
CREATE TABLE IF NOT EXISTS accounts (
    account_num     int,
    balance         decimal,
    created_on      date,
    last_modified   timestamp
);
```

To verify that all columns were created correctly, use the [`SHOW COLUMNS FROM`](/show-columns.html) command followed by the table name:

```postgres
SHOW COLUMNS FROM accounts;
```
```
+---------------+-----------+-------+---------------------------+
|     Field     |   Type    | Null  |          Default          |
+---------------+-----------+-------+---------------------------+
| account_num   | INT       | true  | NULL                      |
| balance       | DECIMAL   | true  | NULL                      |
| created_on    | DATE      | true  | NULL                      |
| last_modified | TIMESTAMP | true  | NULL                      |
| rowid         | INT       | false | experimental_unique_int() |
+---------------+-----------+-------+---------------------------+
```

You'll notice the `rowid` column, which wasn't present in the `CREATE TABLE` command above. If you don't specify a `PRIMARY KEY` when creating a table, CockroachDB automatically adds the `rowid` column as the primary key. To see the primary index for a table, use the [`SHOW INDEX FROM`](/show-index.html) command followed by the name of the table:

```postgres
SHOW INDEX FROM poetry;
```
```
+-------+---------+--------+-----+--------+-----------+---------+
| Table |  Name   | Unique | Seq | Column | Direction | Storing |
+-------+---------+--------+-----+--------+-----------+---------+
| books | primary | true   |   1 | rowid  | ASC       | false   |
+-------+---------+--------+-----+--------+-----------+---------+
```

When you no longer need a table, use the [`DROP TABLE`](/drop-table.html) command followed by the table name to remove the table and all its data:

```postgres
DROP TABLE poetry;
```

## Show Available Tables

To see all tables in the active database, use the [`SHOW TABLES`](/show-tables.html) command:

```postgres
SHOW TABLES;
```
```
+-----------+
|  Table    |
+-----------+
| poetry    |
| fiction   |
| biography |
+-----------+
```

To view tables in a database that's not active, use `SHOW TABLES FROM` followed by the name of the database:

```postgres
SHOW TABLES FROM animals;
```
```
+------------+
|   Table    |
+------------+
| elephants  |
| turtles    |
| pandas     |
| frogs      |
| aardvarks  |
| moles      |
+------------+
```

## Insert Rows into a Table

To insert a row into a table, use the [`INSERT INTO`](/insert.html) command followed by the table name and then the column values listed in the order in which the columns appear in the table:

```postgres
INSERT INTO poetry VALUES ('Way', 'Leslie Scalapino', DATE '1988-04-01', 'North Point Press', 9780865473201, 148);
```

If you want to pass column values in a different order, list the column names explicitly and provide the column values in the same order:

```postgres
INSERT INTO poetry (author, isbn, title, publisher, pub_date, pages) VALUES ('Leslie Scalapino', 9780865473201, 'Way', 'North Point Press', DATE '1988-04-01', 148);
```

To insert multiple rows into a table, use a comma-separated list of parentheses, each containing column values for one row:

```postgres
INSERT INTO poetry (author, isbn, title, publisher, pub_date, pages) VALUES 
    ('Leslie Scalapino', 9780865473201, 'Way', 'North Point Press', DATE '1988-04-01', 148),
    ('Laura Sims', 1934200239, 'Stranger', 'Fence Books', DATE '2009-03-01', 77);
```

[Defaults values](/default-values.html) are used when you leave specific columns out of your statement, or when you explicitly request default values. For example, either of the following statements would create a row with the `isbn` column filled with its default value, in this case `NULL`:

```postgres
INSERT INTO poetry (author, title, publisher, pub_date, pages) VALUES ('Leslie Scalapino', 'Way', 'North Point Press', DATE '1988-04-01', 148);

INSERT INTO poetry (author, isbn, title, publisher, pub_date, pages) VALUES ('Leslie Scalapino', DEFAULT, 'Way', 'North Point Press', DATE '1988-04-01', 148);
```
```
+-------+------------------+------------+-------------------+---------------+-------+
| title |      author      |  pub_date  |     publisher     |     isbn      | pages |
+-------+------------------+------------+-------------------+---------------+-------+
| Way   | Leslie Scalapino | 1988-04-01 | North Point Press | NULL          |   148 |
+-------+------------------+------------+-------------------+---------------+-------+

```

## Query a Table

xxx

## Update Existing Rows

xxx

## Delete Existing Rows

xxx

