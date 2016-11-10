---
title: SHOW DATABASE
summary: The SHOW DATABASE statement lists the default database for the current session.
toc: false
---

The `SHOW DATABASE` [statement](sql-statements.html) lists the default database for the current session.

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/show_database.html %}

## Required Privileges

No [privileges](privileges.html) are required to list the default database.

## Example

~~~ shell
$ cockroach sql --database=test
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
~~~
~~~ sql
> SHOW DATABASE;
~~~
~~~
+----------+
| DATABASE |
+----------+
| test     |
+----------+
(1 row)
~~~

## See Also

- [`SET DATABASE`](set-database.html)
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
