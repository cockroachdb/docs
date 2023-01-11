---
title: OWNER TO
summary: The OWNER TO subcommand changes the owner of an object.
toc: true
docs_area: reference.sql
---

`OWNER TO` is a subcommand of [`ALTER DATABASE`](alter-database.html), [`ALTER FUNCTION`](alter-function.html), [`ALTER TABLE`](alter-table.html), [`ALTER SCHEMA`](alter-schema.html), [`ALTER SEQUENCE`](alter-sequence.html), [`ALTER TYPE`](alter-type.html), and [`ALTER VIEW`](alter-view.html), and is used to change the owner of an object in a cluster.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

{{site.data.alerts.callout_info}}
This page documents `ALTER DATABASE ... OWNER TO` and `ALTER TABLE ... OWNER TO`. For details on the `ALTER FUNCTION ... OWNER TO`, `ALTER SCHEMA ... OWNER TO`, `ALTER SEQUENCE ... OWNER TO`, `ALTER TYPE ... OWNER TO`, and `ALTER VIEW ... OWNER TO`, see the [`ALTER FUNCTION`](alter-function.html), [`ALTER SCHEMA`](alter-schema.html), [`ALTER SEQUENCE`](alter-sequence.html), [`ALTER TYPE`](alter-type.html), and [`ALTER VIEW`](alter-view.html) pages.
{{site.data.alerts.end}}

## Required privileges

- To change the owner of a database, the user must be an `admin` user, or the current owner of the database and a member of the new owner [role](security-reference/authorization.html#roles). The user must also have the `CREATEDB` [privilege](security-reference/authorization.html#managing-privileges).
- To change the owner of a table, the user must be an `admin` user, or the current owner of the table and a member of the new owner [role](security-reference/authorization.html#roles). The new owner role must also have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the schema to which the table belongs.

## Syntax

### Databases

~~~
ALTER DATABASE <name> OWNER TO <newowner>
~~~

### Tables

~~~
ALTER TABLE <name> OWNER TO <newowner>
~~~

## Parameters

Parameter | Description
----------|------------
`name` | The name of the table or database.
`newowner` | The name of the new owner.

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Change a database's owner

Suppose that the current owner of the `movr` database is `root` and you want to change the owner to a new user named `max`.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER DATABASE movr OWNER TO max;
~~~

To verify that the owner is now `max`, query the `pg_catalog.pg_database` and `pg_catalog.pg_roles` tables:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT rolname FROM pg_catalog.pg_database d JOIN pg_catalog.pg_roles r ON d.datdba = r.oid WHERE datname = 'movr';
~~~

~~~
  rolname
-----------
  max
(1 row)
~~~

{{site.data.alerts.callout_info}}
If the user running the command is not an admin user, they must own the database and be a member of the new owning role. They must also have the `CREATEDB` [privilege](security-reference/authorization.html#managing-privileges).
{{site.data.alerts.end}}

### Change a table's owner

Suppose that the current owner of the `rides` table is `root` and you want to change the owner to a new user named `max`.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE promo_codes OWNER TO max;
~~~

To verify that the owner is now `max`, query the `pg_catalog.pg_tables` table:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT tableowner FROM pg_catalog.pg_tables WHERE tablename = 'promo_codes';
~~~

~~~
  tableowner
--------------
  max
(1 row)
~~~

{{site.data.alerts.callout_info}}
If the user running the command is not an admin user, they must own the table and be a member of the new owning role. Also, the new owner role must also have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the schema to which the table belongs.
{{site.data.alerts.end}}



## See also

- [`CREATE DATABASE`](create-database.html)
- [`SHOW DATABASES`](show-databases.html)
- [`CREATE TABLE`](create-table.html)
- [`SHOW TABLES`](show-tables.html)
- [SQL Statements](sql-statements.html)
- [Online Schema Changes](online-schema-changes.html)
