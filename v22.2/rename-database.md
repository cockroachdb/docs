---
title: ALTER DATABASE ... RENAME TO
summary: The ALTER DATABASE ... RENAME TO statement changes the name of a database.
toc: true
docs_area: reference.sql
---

{% assign rd = site.data.releases | where_exp: "rd", "rd.major_version == page.version.version" | first %}

{% if rd %}
{% assign remote_include_version = page.version.version | replace: "v", "" %}
{% else %}
{% assign remote_include_version = site.versions["stable"] | replace: "v", "" %}
{% endif %}

The `RENAME TO` clause is part of [`ALTER DATABASE`](alter-database.html), and changes the name of a database.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/rename_database.html %}
</div>

## Required privileges

To rename a database, the user must be a member of the `admin` role or must have the [`CREATEDB`](create-role.html#create-a-role-that-can-create-and-rename-databases) parameter set.

## Parameters

Parameter | Description
----------|------------
`name` | The first instance of `name` is the current name of the database. The second instance is the new name for the database. The new name [must be unique](#rename-fails-new-name-already-in-use) and follow these [identifier rules](keywords-and-identifiers.html#identifiers). You cannot rename a database if it is set as the [current database](sql-name-resolution.html#current-database) or if [`sql_safe_updates = true`](set-vars.html).

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Limitations

- It is not possible to rename a database if the database is referenced by a [view](views.html). For more details, see [View Dependencies](views.html#view-dependencies).

## Examples

### Rename a database

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE db1;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
  database_name
-----------------
  db1
  defaultdb
  movr
  postgres
  system
(5 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER DATABASE db1 RENAME TO db2;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
  database_name
-----------------
  db2
  defaultdb
  movr
  postgres
  system
(5 rows)
~~~

### Rename fails (new name already in use)

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER DATABASE db2 RENAME TO movr;
~~~

~~~
ERROR: the new database name "movr" already exists
SQLSTATE: 42P04
~~~

## See also

- [`CREATE DATABASE`](create-database.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SET DATABASE`](set-vars.html)
- [`DROP DATABASE`](drop-database.html)
- [SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
