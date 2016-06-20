---
title: CREATE DATABASE
toc: false
---

The `CREATE DATABASE` [statement](sql-statements.html) creates a new CockroachDB database.  

<div id="toc"></div>

## Required Privileges

Only the `root` user can create databases.

## Synopsis

{% include sql/diagrams/create_database.html %}

## Parameters

Parameter | Description
----------|------------
`IF NOT EXISTS` | Create a new database only if a database of the same name does not already exist; if one does exist, do not return an error. 
`name` | The name of the database to create, which [must be unique](#create-fails-name-already-in-use) and follow these [identifier rules](keywords-and-identifiers.html#identifiers).
`encoding` | The `CREATE DATABASE` statement accepts an optional `ENCODING` clause for compatibility with PostgreSQL, but `UTF-8` is the only supported encoding. The aliases `UTF8` and `UNICODE` are also accepted. Values should be enclosed in single quotes and are case insensitive. Example: `CREATE DATABASE bank ENCODING = 'UTF-8'`.

## Example


### Create a Database
~~~
CREATE DATABASE bank;
CREATE DATABASE

SHOW DATABASES;
+----------+
| Database |
+----------+
| bank     |
| system   |
+----------+
~~~


### Create Fails (Name Already In Use)

~~~
SHOW DATABASES;
+----------+
| Database |
+----------+
| bank     |
| system   |
+----------+

CREATE DATABASE bank;
pq: database "bank" already exists

SHOW DATABASES;
+----------+
| Database |
+----------+
| bank     |
| system   |
+----------+

CREATE DATABASE IF NOT EXISTS bank;
CREATE DATABASE

SHOW DATABASES;
+----------+
| Database |
+----------+
| bank     |
| system   |
+----------+
~~~

## See Also

- [`SHOW DATABASES`](show-databases.html)
- [`RENAME DATABASE`](rename-database.html)
- [`SET DATABASE`](set-database.html)
- [`DROP DATABASE`](drop-database.html)
- [Other SQL Statements](sql-statements.html)