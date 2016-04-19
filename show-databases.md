---
title: SHOW DATABASES
toc: false
---

The `SHOW DATABASES` [statement](sql-statements.html) lists all database in the CockroachDB cluster.

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/show_databases.html %}

## Required Privileges

No privileges are required to list the databases in the CockroachDB cluster.

## Usage

To list all databases in the cluster, use the `SHOW DATABASES` statement:

~~~ sql
SHOW DATABASES;
~~~
~~~
+----------+
| Database |
+----------+
| bank     |
| system   |
+----------+
~~~

## See Also

[SQL Statements](sql-statements.html)