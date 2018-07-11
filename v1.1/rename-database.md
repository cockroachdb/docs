---
title: RENAME DATABASE
summary: The RENAME DATABASE statement changes the name of a database.
toc: true
---

The `RENAME DATABASE` [statement](sql-statements.html) changes the name of a database.

{{site.data.alerts.callout_info}}It is not possible to rename a database referenced by a view. For more details, see <a href="views.html#view-dependencies">View Dependencies</a>.{{site.data.alerts.end}}


## Synopsis

{% include {{ page.version.version }}/sql/diagrams/rename_database.html %}

## Required Privileges

Only the `root` user can rename databases.

## Parameters

Parameter | Description
----------|------------
`name` | The first instance of `name` is the current name of the database. The second instance is the new name for the database. The new name [must be unique](#rename-fails-new-name-already-in-use) and follow these [identifier rules](keywords-and-identifiers.html#identifiers).

## Examples

### Rename a Database

~~~ sql
> SHOW DATABASES;
~~~
~~~
+----------+
| Database |
+----------+
| db1      |
| db2      |
| system   |
+----------+
~~~
~~~ sql
> ALTER DATABASE db1 RENAME TO db3;
~~~
~~~
RENAME DATABASE
~~~
~~~ sql
> SHOW DATABASES;
~~~
~~~
+----------+
| Database |
+----------+
| db2      |
| db3      |
| system   |
+----------+
~~~

### Rename Fails (New Name Already In Use)

~~~ sql
> SHOW DATABASES;
~~~
~~~
+----------+
| Database |
+----------+
| db2      |
| db3      |
| system   |
+----------+
~~~
~~~ sql
> ALTER DATABASE db2 RENAME TO db3;
~~~
~~~
pq: the new database name "db3" already exists
~~~

## See Also

- [`CREATE DATABASE`](create-database.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SET DATABASE`](set-vars.html)
- [`DROP DATABASE`](drop-database.html)
- [Other SQL Statements](sql-statements.html)
