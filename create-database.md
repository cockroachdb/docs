---
title: CREATE DATABASE
toc: true
---

## Description

The `CREATE DATABASE` [statement](sql-statements.html) creates a new CockroachDB database.  

## Privileges

Only the `root` user can create a database.

## Synopsis

{% include sql/diagrams/create_database.html %}

## Parameters

Parameter | Description
----------|------------
`name` | The name of the database to create. Names must follow [these rules](data-definition.html#identifiers).

## Examples

~~~
CREATE DATABASE bank;

SHOW DATABASES;
+----------+
| Database |
+----------+
| bank     |
| system   |
+----------+
~~~

## See Also

[SQL Statements](sql-statements.html)