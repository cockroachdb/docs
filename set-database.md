---
title: SET DATABASE
summary: The SET DATABASE statement sets the default database for the current session.
toc: false
---

The `SET DATABASE` [statement](sql-statements.html) sets the default database for the current session. When connected to the default database, you don't need to reference it explicitly in statements.

{{site.data.alerts.callout_danger}}In rare cases, CockroachDB may reset session configurations, so it's most reliable to set the database in the client's connection string. For examples in different languages, see <a href="build-a-test-app.html">Build a Test App</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/set_database.html %}

## Required Privileges

No [privileges](privileges.html) are required to set the default database. 

## Examples

### Set the default database via the client connection (recommended)

~~~ shell
$ cockroach sql --database=db1
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
~~~
~~~ sql
> CREATE TABLE t3 (a INT PRIMARY KEY, b STRING(20)); 
> SHOW TABLES;
~~~
~~~ shell
+-------+
| Table |
+-------+
| t1    |
| t2    |
| t3    |
+-------+
(3 rows)
~~~

### Set the default database via `SET DATABASE`

~~~ shell
$ cockroach sql
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
~~~
~~~ sql
> SET DATABASE = db1;
> CREATE TABLE t3 (a INT PRIMARY KEY, b STRING(20)); 
> SHOW TABLES;
~~~
~~~ shell
+-------+
| Table |
+-------+
| t1    |
| t2    |
| t3    |
+-------+
(3 rows)
~~~

### Use a non-default database

~~~ shell
$ cockroach sql --database=db1
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
~~~
~~~ sql
> CREATE TABLE db2.t1 (a SERIAL PRIMARY KEY, b DECIMAL); 
> SHOW TABLES FROM db2;
~~~
~~~ shell
+-------+
| Table |
+-------+
| t1    |
+-------+
(1 row)
~~~

## See Also

- [`SET TIME ZONE`](set-time-zone.html)
- [`SET TRANSACTION`](set-transaction.html)
 