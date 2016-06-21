---
title: DROP DATABASE
summary: The DROP DATABASE statement removes a database and all its objects from a CockroachDB cluster.
toc: false
---

The `DROP DATABASE` [statement](sql-statements.html) removes a database and all its objects from a CockroachDB cluster. 

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/drop_database.html %}

## Required Privileges

The user must have the `DROP` [privilege](privileges.html) on the database and on all tables in the database. 

## Usage

To remove a database from a CockroachDB cluster, use the `DROP DATABASE` statement followed by a database name:

~~~ sql
DROP DATABASE db1;
~~~

To avoid an error in case the database does not exist, you can include `IF EXISTS`:

~~~ sql
DROP DATABASE IF EXISTS db1;
~~~

## Example

~~~
SHOW DATABASES;
+----------+
| Database |
+----------+
| db1      |
| system   |
+----------+

DROP DATABASE db1;
DROP DATABASE

DROP DATABASE db2;
pq: database "db2" does not exist

DROP DATABASE IF EXISTS db2;
DROP DATABASE

SHOW DATABASES;
+----------+
| Database |
+----------+
| system   |
+----------+
~~~

## See Also

- [`CREATE DATABASE`](create-database.html)
- [`SHOW DATABASES`](show-databases.html)
- [`RENAME DATABASE`](rename-database.html)
- [`SET DATABASE`](set-database.html)
- [Other SQL Statements](sql-statements.html)