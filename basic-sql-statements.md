---
title: Basic SQL Statements
toc: false
---

This page walks you through some of the most essential CockroachDB SQL statements. For a complete list of statements and their options, as well as details about data types and other concepts, see [SQL Reference](sql-reference.html).

{{site.data.alerts.callout_info}}CockroachDB aims to provide standard SQL with extensions, but some standard SQL functionality is not yet available. Joins, for example, will be built into version 1.0. See our <a href="https://github.com/cockroachdb/cockroach/issues/2132">Product Roadmap</a> for more details.{{site.data.alerts.end}}   

<img src="images/catrina_ramen.png" style="max-width: 200px;" />

## Create a Database

CockroachDB comes with a single default `system` database, which contains CockroachDB metadata and is read-only. To create a new database, use the `CREATE DATABASE` statement followed by a database name:

```sql
CREATE DATABASE db1;
```

Database names must follow [these rules](identifiers.html). To avoid an error in case the database already exists, you can include `IF NOT EXISTS`:

```sql
CREATE DATABASE IF NOT EXISTS db1;
```

When you no longer need a database, use the `DROP DATABASE` statement followed by the database name to remove the database and all its objects:

```sql
DROP DATABASE db1;
```

## Show Databases

To see all databases, use the `SHOW DATABASES` statement:

```sql
SHOW DATABASES;
```
```
+----------+
| Database |
+----------+
| db1      |
| system   |
+----------+
```

## Set the Default Database

To set the default database, use the `SET DATABASE` statement:

```sql
SET DATABASE = db1;
```

When working with the default database, you don't need to reference it explicitly in statements. To see which database is currently the default, use the `SHOW DATABASE` statement (note the singular form):

```sql
SHOW DATABASE;
```
```
+----------+
| DATABASE |
+----------+
| db1      |
+----------+
```

## Create a Table

To create a table, use the `CREATE TABLE` statement followed by a table name, the column names, the data type for each column, and the primary key constraint:

```sql
CREATE TABLE table1 (
    column_a INT PRIMARY KEY,
    column_b FLOAT,
    column_c DATE,
    column_d STRING
);
```

Table and column names must follow [these rules](identifiers.html). Also, when you don't explicitly define a `PRIMARY KEY`, CockroachDB will automatically add a hidden `rowid` column as the primary key.

To avoid an error in case the table already exists, you can include `IF NOT EXISTS`:

```sql
CREATE TABLE IF NOT EXISTS table1 (
    column_a INT PRIMARY KEY,
    column_b FLOAT,
    column_c DATE,
    column_d STRING
);
```

To show all of the columns from a table, use the `SHOW COLUMNS FROM` statement followed by the table name:

```sql
SHOW COLUMNS FROM table1;
```
```
+----------+--------+-------+---------+
|  Field   |  Type  | Null  | Default |
+----------+--------+-------+---------+
| column_a | INT    | false | NULL    |
| column_b | FLOAT  | true  | NULL    |
| column_c | DATE   | true  | NULL    |
| column_d | STRING | true  | NULL    |
+----------+--------+-------+---------+
```

When you no longer need a table, use the `DROP TABLE` statement followed by table name to remove the table and all its data:

```sql
DROP TABLE table1;
```

## Show Tables

To see all tables in the active database, use the `SHOW TABLES` statement:

```sql
SHOW TABLES;
```
```
+--------+
| Table  |
+--------+
| table1 |
| table2 |
+--------+
```

To view tables in a database that's not active, use `SHOW TABLES FROM` followed by the name of the database:

```sql
SHOW TABLES FROM db2;
```
```
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
```

## Insert Rows into a Table

To insert a row into a table, use the `INSERT INTO` statement followed by the table name and then the column values listed in the order in which the columns appear in the table:

```sql
INSERT INTO table1 VALUES (12345, 1.1, DATE '2016-01-01', 'aaaa');
```

If you want to pass column values in a different order, list the column names explicitly and provide the column values in the same order:

```sql
INSERT INTO table1 (column_d, column_c, column_b, column_a) VALUES 
    ('aaaa', DATE '2016-01-01', 1.1, 12345);
```

To insert multiple rows into a table, use a comma-separated list of parentheses, each containing column values for one row:

```sql
INSERT INTO table1 (column_d, column_c, column_b, column_a) VALUES 
    ('aaaa', DATE '2016-01-01', 1.1, 12345),
    ('bbbb', DATE '2016-01-01', 1.2, 54321);
```

[Defaults values](default-values.html) are used when you leave specific columns out of your statement, or when you explicitly request default values. For example, either of the following statements would create a row with `column_b` filled with its default value, in this case `NULL`:

```sql
INSERT INTO table1 (column_d, column_c, column_a) VALUES 
    ('aaaa', DATE '2016-01-01', 12345);

INSERT INTO table1 (column_d, column_c, column_b, column_a) VALUES 
    ('aaaa', DATE '2016-01-01', DEFAULT, 12345);
```
```
+----------+----------+---------------------------------+----------+
| column_a | column_b |            column_c             | column_d |
+----------+----------+---------------------------------+----------+
|    12346 | NULL     | 2016-01-01 00:00:00 +0000 +0000 | aaaa     |
+----------+----------+---------------------------------+----------+
```

## Create an Index

Indexes are used to quickly locate data without having to look through every row of a table. They are automatically created for the primary key of a table and any columns with a unique constraint.

To create an index for non-unique columns, use the `CREATE INDEX` statement followed by an optional index name and an `ON` clause identifying the table and column(s) to index.  For each column, you can choose whether to sort ascending (`ASC`) or descending (`DESC`).

```sql
CREATE INDEX d_idx ON table1 (column_d DESC);
```

You can create indexes during table creation as well; just include the `INDEX` keyword followed by an optional index name and the column(s) to index:

```sql
CREATE TABLE table1 (
    column_a INT PRIMARY KEY,
    column_b FLOAT,
    column_c DATE,
    column_d STRING,
    INDEX d_idx (column_d)
);
```

## Show Indexes on a Table

To show the indexes on a table, use the `SHOW INDEX FROM` statement followed by the name of the table:

```sql
SHOW INDEX FROM table1;
```
```
+--------+---------+--------+-----+----------+-----------+---------+
| Table  |  Name   | Unique | Seq |  Column  | Direction | Storing |
+--------+---------+--------+-----+----------+-----------+---------+
| table1 | primary | true   |   1 | column_a | ASC       | false   |
| table1 | d_idx   | false  |   1 | column_d | DESC      | false   |
+--------+---------+--------+-----+----------+-----------+---------+
```

## Query a Table

To query a table, use the `SELECT` statement followed by the columns to be returned and the table from which to retrieve the data:

```sql
SELECT column_a, column_b FROM table1;
```
```
+----------+----------+
| column_a | column_b |
+----------+----------+
|    12345 |      1.1 |
|    54321 |      1.2 |
|    67890 |      1.3 |
+----------+----------+
```

To retrieve all columns, use the `*` wildcard:

```sql
SELECT * FROM table1;
```
```
+----------+----------+---------------------------------+----------+
| column_a | column_b |            column_c             | column_d |
+----------+----------+---------------------------------+----------+
|    12345 |      1.1 | 2016-01-01 00:00:00 +0000 +0000 | aaaa     |
|    54321 |      1.2 | 2016-01-01 00:00:00 +0000 +0000 | bbbb     |
|    67890 |      1.3 | 2016-01-01 00:00:00 +0000 +0000 | cccc     |
+----------+----------+---------------------------------+----------+
```

To filter the results, add a `WHERE` clause identifying the columns and values to filter on: 

```sql
SELECT column_a, column_b FROM table1 WHERE column_b < 1.3;
```
```
+----------+----------+
| column_a | column_b |
+----------+----------+
|    12345 |      1.1 |
|    54321 |      1.2 |
+----------+----------+
```

To sort the results, add an `ORDER BY` clause identifying the columns to sort by. For each column, you can choose whether to sort ascending (`ASC`) or descending (`DESC`).

```sql
SELECT * FROM table1 ORDER BY column_a DESC;
```
```
+----------+----------+---------------------------------+----------+
| column_a | column_b |            column_c             | column_d |
+----------+----------+---------------------------------+----------+
|    67890 |      1.3 | 2016-01-01 00:00:00 +0000 +0000 | cccc     |
|    54321 |      1.2 | 2016-01-01 00:00:00 +0000 +0000 | bbbb     |
|    12345 |      1.1 | 2016-01-01 00:00:00 +0000 +0000 | aaaa     |
+----------+----------+---------------------------------+----------+
``` 

## Update Rows in a Table

To update rows in a table, use the `UPDATE` statement followed by the table name, a `SET` clause specifying the columns to update and their new values, and a `WHERE` clause identifying the rows to update:

```sql
UPDATE table1 SET column_a = column_a + 1, column_d = 'cccc' WHERE column_b > 0;
```

If a table has a primary key, you can use that in the `WHERE` clause to reliably update specific rows; otherwise, each row matching the `WHERE` clause is updated. When there's no `WHERE` clause, all rows in the table are updated. 

## Delete Rows in a Table

To delete rows in a table, use the `DELETE FROM` statement followed by the table name and a `WHERE` clause identifying the rows to delete: 

```sql
DELETE FROM table1 WHERE column_b = 2.5;
```

Just as with the `UPDATE` statement, if a table has a primary key, you can use that in the `WHERE` clause to reliably delete specific rows; otherwise, each row matching the `WHERE` clause is deleted. When there's no `WHERE` clause, all rows in the table are deleted. 