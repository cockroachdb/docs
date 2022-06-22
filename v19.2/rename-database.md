---
title: ALTER DATABASE ... RENAME TO
summary: The ALTER DATABASE ... RENAME TO statement changes the name of a database.
toc: true
---

The `RENAME TO` [statement](sql-statements.html) is part of [`ALTER DATABASE`](alter-database.html), and changes the name of a database.

{{site.data.alerts.callout_info}}It is not possible to rename a database referenced by a view. For more details, see <a href="views.html#view-dependencies">View Dependencies</a>.{{site.data.alerts.end}}

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/rename_database.html %}
</div>

## Required privileges

Only members of the `admin` role can rename databases. By default, the `root` user belongs to the `admin` role.

## Parameters

Parameter | Description
----------|------------
`name` | The first instance of `name` is the current name of the database. The second instance is the new name for the database. The new name [must be unique](#rename-fails-new-name-already-in-use) and follow these [identifier rules](keywords-and-identifiers.html#identifiers). You cannot rename a database if it is set as the [current database](sql-name-resolution.html#current-database) or if [`sql_safe_updates = true`](set-vars.html).

## Limitations

If an `ALTER DATABASE ... RENAME` statement is issued on a single [gateway node](architecture/sql-layer.html#overview) and a successful result is returned, it is possible to observe the old database names in [transactions](transactions.html) on other gateway nodes for a short amount of time after the rename is executed. This issue is specific to databases, which have their metadata stored in an incoherent cache, unlike tables. Note that this issue is [resolved in v20.2](https://github.com/cockroachdb/cockroach/pull/52975).

## Examples

### Rename a Database

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
+---------------+
| database_name |
+---------------+
| db1           |
| db2           |
| defaultdb     |
| postgres      |
| system        |
+---------------+
(5 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER DATABASE db1 RENAME TO db3;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
+---------------+
| database_name |
+---------------+
| db2           |
| db3           |
| defaultdb     |
| postgres      |
| system        |
+---------------+
(5 rows)
~~~

### Rename fails (new name already in use)

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER DATABASE db2 RENAME TO db3;
~~~

~~~
pq: the new database name "db3" already exists
~~~

## See also

- [`CREATE DATABASE`](create-database.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SET DATABASE`](set-vars.html)
- [`DROP DATABASE`](drop-database.html)
- [Other SQL Statements](sql-statements.html)
