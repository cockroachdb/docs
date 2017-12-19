---
title: SHOW DATABASES
summary: The SHOW DATABASES statement lists all database in the CockroachDB cluster.
keywords: reflection
toc: false
---

The `SHOW DATABASES` [statement](sql-statements.html) lists all database in the CockroachDB cluster.

<div id="toc"></div>

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/show_databases.html %}

## Required Privileges

No [privileges](privileges.html) are required to list the databases in the CockroachDB cluster.

## Example

~~~ sql
> SHOW DATABASES;
~~~
~~~
+--------------------+
|      Database      |
+--------------------+
| bank               |
| crdb_internal      |
| information_schema |
| pg_catalog         |
| system             |
+--------------------+
(5 rows)
~~~

## See Also

- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
