---
title: DROP DATABASE
summary: The DROP DATABASE statement removes a database and all its objects from a CockroachDB cluster.
toc: true
---

The `DROP DATABASE` [statement](sql-statements.html) removes a database and all its objects from a CockroachDB cluster.

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `DROP` [privilege](authorization.html#assign-privileges) on the database and on all tables in the database.

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/drop_database.html %} </section>

## Parameters

Parameter | Description
----------|------------
`IF EXISTS`   | Drop the database if it exists; if it does not exist, do not return an error.
`name`  | The name of the database you want to drop. You cannot drop a database if it is set as the [current database](sql-name-resolution.html#current-database) or if [`sql_safe_updates = true`](set-vars.html).
`CASCADE` | _(Default)_ Drop all tables and views in the database as well as all objects (such as [constraints](constraints.html) and [views](views.html)) that depend on those tables.<br><br>`CASCADE` does not list objects it drops, so should be used cautiously.
`RESTRICT` | Do not drop the database if it contains any [tables](create-table.html) or [views](create-view.html).

## Examples

### Drop a database and its objects (`CASCADE`)

For non-interactive sessions (e.g., client applications), `DROP DATABASE` applies the `CASCADE` option by default, which drops all tables and views in the database as well as all objects (such as [constraints](constraints.html) and [views](views.html)) that depend on those tables.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM db2;
~~~

~~~
+------------+
| table_name |
+------------+
| t1         |
| v1         |
+------------+
(2 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP DATABASE db2;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM db2;
~~~

~~~
pq: database "db2" does not exist
~~~

For interactive sessions from the [built-in SQL client](use-the-built-in-sql-client.html), either the `CASCADE` option must be set explicitly or the `--unsafe-updates` flag must be set when starting the shell.

### Prevent dropping a non-empty database (`RESTRICT`)

When a database is not empty, the `RESTRICT` option prevents the database from being dropped:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM db2;
~~~

~~~
+------------+
| table_name |
+------------+
| t1         |
| v1         |
+------------+
(2 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP DATABASE db2 RESTRICT;
~~~

~~~
pq: database "db2" is not empty and CASCADE was not specified
~~~

## See also

- [`CREATE DATABASE`](create-database.html)
- [`SHOW DATABASES`](show-databases.html)
- [`RENAME DATABASE`](rename-database.html)
- [`SET DATABASE`](set-vars.html)
- [Other SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
