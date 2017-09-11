---
title: DROP DATABASE
summary: The DROP DATABASE statement removes a database and all its objects from a CockroachDB cluster.
toc: false
---

The `DROP DATABASE` [statement](sql-statements.html) removes a database and all its objects from a CockroachDB cluster.

<div id="toc"></div>

## Required Privileges

The user must have the `DROP` [privilege](privileges.html) on the database and on all tables in the database.

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/drop_database.html %}

## Parameters

Parameter | Description
----------|------------
`IF EXISTS`   | Drop the database if it exists; if it does not exist, do not return an error.
`name`  | The name of the database you want to drop.
`CASCADE` | Drop all tables and views in the database as well as all objects (such as [constraints](constraints.html) and [views](views.html)) that depend on those tables.<br><br>`CASCADE` does not list objects it drops, so should be used cautiously.
`RESTRICT`    | _(Default)_ Do not drop the database if it contains any [tables](create-table.html) or [views](create-view.html).

## Examples

### Drop an empty database

When a database is empty, the default `RESTRICT` option is sufficient to drop the database:

~~~ sql
> SHOW TABLES FROM db1;
~~~

~~~
+-------+
| Table |
+-------+
+-------+
(0 rows)
~~~

~~~ sql
> DROP DATABASE db1 RESTRICT;
~~~

To avoid an error in case the database does not exist, you can include `IF EXISTS`:

~~~ sql
> DROP DATABASE db_missing;
~~~

~~~
pq: database "db_missing" does not exist
~~~

~~~ sql
> DROP DATABASE IF EXISTS db_missing;
~~~

### Drop a database and dependent objects

When a database is not empty, the default `RESTRICT` option prevents the database from being dropped:

~~~ sql
> SHOW TABLES FROM db2;
~~~

~~~
+-------+
| Table |
+-------+
| t1    |
| v1    |
+-------+
(2 rows)
~~~

~~~ sql
> DROP DATABASE db2 RESTRICT;
~~~

~~~
pq: database "db2" is not empty and CASCADE was not specified
~~~

In this case, you must use the `CASCADE` option to drop the database and all the tables and views it contains:

~~~ sql
> DROP DATABASE db2 CASCADE;
~~~

~~~ sql
> SHOW TABLES FROM db2;
~~~

~~~
pq: database "db2" does not exist
~~~

{{site.data.alerts.callout_info}}It's important to note that any objects dependent on dropped tables and views are also dropped. In the example above, if the <code>db2.t1</code> table had a view dependent on it in another database, that view would have been dropped as well.{{site.data.alerts.end}}

## See Also

- [`CREATE DATABASE`](create-database.html)
- [`SHOW DATABASES`](show-databases.html)
- [`RENAME DATABASE`](rename-database.html)
- [`SET DATABASE`](set-vars.html)
- [Other SQL Statements](sql-statements.html)
