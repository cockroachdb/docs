---
title: DROP DATABASE
summary: The DROP DATABASE statement removes a database and all its objects from a CockroachDB cluster.
toc: true
docs_area: reference.sql
---

The `DROP DATABASE` [statement]({{ page.version.version }}/sql-statements.md) removes a database and all its objects from a CockroachDB cluster.



## Required privileges

The user must have the `DROP` [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the database and on all tables in the database.

## Synopsis


## Parameters

Parameter | Description
----------|------------
`IF EXISTS`   | Drop the database if it exists; if it does not exist, do not return an error.
`name`  | The name of the database you want to drop. You cannot drop a database if it is set as the [current database]({{ page.version.version }}/sql-name-resolution.md#current-database) or if [`sql_safe_updates = true`]({{ page.version.version }}/set-vars.md).
`CASCADE` | _(Default)_ Drop all tables and views in the database as well as all objects (such as [constraints]({{ page.version.version }}/constraints.md) and [views]({{ page.version.version }}/views.md)) that depend on those tables.<br><br>`CASCADE` does not list objects it drops, so should be used cautiously.
`RESTRICT` | Do not drop the database if it contains any [tables]({{ page.version.version }}/create-table.md) or [views]({{ page.version.version }}/create-view.md).

## Viewing schema changes


## Examples


### Drop a database and its objects (`CASCADE`)

For non-interactive sessions (e.g., client applications), `DROP DATABASE` applies the `CASCADE` option by default, which drops all tables and views in the database as well as all objects (such as [constraints]({{ page.version.version }}/constraints.md) and [views]({{ page.version.version }}/views.md)) that depend on those tables.

For interactive sessions from the [built-in SQL client]({{ page.version.version }}/cockroach-sql.md), either the `CASCADE` option must be set explicitly or the `--unsafe-updates` flag must be set when starting the shell.

~~~ sql
> SHOW TABLES FROM movr;
~~~

~~~
  schema_name |         table_name         | type  | estimated_row_count
--------------+----------------------------+-------+----------------------
  public      | promo_codes                | table |                1000
  public      | rides                      | table |                 500
  public      | user_promo_codes           | table |                   0
  public      | users                      | table |                  50
  public      | vehicle_location_histories | table |                1000
  public      | vehicles                   | table |                  15
(6 rows)
~~~

~~~ sql
> DROP DATABASE movr;
~~~

~~~
ERROR: rejected (sql_safe_updates = true): DROP DATABASE on current database
SQLSTATE: 01000
~~~

~~~ sql
> USE defaultdb;
~~~

~~~ sql
> DROP DATABASE movr;
~~~

~~~
ERROR: rejected (sql_safe_updates = true): DROP DATABASE on non-empty database without explicit CASCADE
SQLSTATE: 01000
~~~

~~~ sql
> DROP DATABASE movr CASCADE;
~~~

~~~ sql
> SHOW TABLES FROM movr;
~~~

~~~
ERROR: target database or schema does not exist
SQLSTATE: 3F000
~~~

### Prevent dropping a non-empty database (`RESTRICT`)

When a database is not empty, the `RESTRICT` option prevents the database from being dropped:

~~~ sql
> SHOW TABLES FROM movr;
~~~

~~~
  schema_name |         table_name         | type  | estimated_row_count
--------------+----------------------------+-------+----------------------
  public      | promo_codes                | table |                1000
  public      | rides                      | table |                 500
  public      | user_promo_codes           | table |                   0
  public      | users                      | table |                  50
  public      | vehicle_location_histories | table |                1000
  public      | vehicles                   | table |                  15
(6 rows)
~~~

~~~ sql
> USE defaultdb;
~~~

~~~ sql
> DROP DATABASE movr RESTRICT;
~~~

~~~
ERROR: database "movr" is not empty and RESTRICT was specified
SQLSTATE: 2BP01
~~~

## See also

- [`CREATE DATABASE`]({{ page.version.version }}/create-database.md)
- [`SHOW DATABASES`]({{ page.version.version }}/show-databases.md)
- [`ALTER DATABASE ... RENAME TO`]({{ page.version.version }}/alter-database.md#rename-to)
- [`SET DATABASE`]({{ page.version.version }}/set-vars.md)
- [`SHOW JOBS`]({{ page.version.version }}/show-jobs.md)
- [SQL Statements]({{ page.version.version }}/sql-statements.md)
- [Online Schema Changes]({{ page.version.version }}/online-schema-changes.md)