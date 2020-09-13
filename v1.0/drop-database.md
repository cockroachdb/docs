---
title: DROP DATABASE
summary: The DROP DATABASE statement removes a database and all its objects from a CockroachDB cluster.
toc: true
---

The `DROP DATABASE` [statement](sql-statements.html) removes a database and all its objects from a CockroachDB cluster.


## Synopsis

{% include {{ page.version.version }}/sql/diagrams/drop_database.html %}

## Required Privileges

The user must have the `DROP` [privilege](privileges.html) on the database and on all tables in the database. 

## Parameters

Parameter | Description
----------|------------
`IF EXISTS`   | Drop the database if it exists; if it does not exist, do not return an error.
`name`  | The name of the database you want to drop.


## Examples

~~~ sql
> SHOW DATABASES;
~~~
~~~
+----------+
| Database |
+----------+
| db1      |
| system   |
+----------+
~~~
~~~ sql
> DROP DATABASE db1;

> DROP DATABASE db2;
~~~
~~~
pq: database "db2" does not exist
~~~

To avoid an error in case the database does not exist, you can include `IF EXISTS`:

~~~ sql
> DROP DATABASE IF EXISTS db2;

> SHOW DATABASES;
~~~
~~~
+----------+
| Database |
+----------+
| system   |
+----------+
~~~

{{site.data.alerts.callout_danger}}<code>DROP DATABASE</code> drops <em>all</em> tables within the database as well as objects dependent on the tables without listing the tables or the dependent objects. This can lead to inadvertent and difficult-to-recover losses. To avoid potential harm, we recommend dropping objects individually in most cases.{{site.data.alerts.end}}


## See Also

- [`CREATE DATABASE`](create-database.html)
- [`SHOW DATABASES`](show-databases.html)
- [`RENAME DATABASE`](rename-database.html)
- [`SET DATABASE`](set-vars.html)
- [Other SQL Statements](sql-statements.html)
