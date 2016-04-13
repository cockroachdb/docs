---
title: CREATE DATABASE
toc: false
---

The `CREATE DATABASE` [statement](sql-statements.html) creates a new CockroachDB database.  

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/create_database.html %}

## Required Privileges

Only the `root` user can create databases.

## Usage

To create a new database, use the `CREATE DATABASE` statement followed by a database name:

~~~ sql
CREATE DATABASE bank;
~~~

Database names must follow [these rules](data-definition.html#identifiers). To avoid an error in case the database already exists, you can include `IF NOT EXISTS`:

~~~ sql
CREATE DATABASE IF NOT EXISTS bank;
~~~

## Example

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

CREATE DATABASE bank;
pq: database "bank" already exists

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