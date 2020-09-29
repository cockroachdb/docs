---
title: CONVERT TO SCHEMA
summary: The CONVERT TO SCHEMA statement converts a database to a schema.
toc: true
---

<span class="version-tag">New in v20.2</span>: The `CONVERT TO SCHEMA` [statement](sql-statements.html) converts a database to a [schema](sql-name-resolution.html#logical-schemas-and-namespaces).

In CockroachDB versions < v20.2, [user-defined schemas](create-schema.html) are not supported, and all stored objects in a given database use the `public` schema. To provide a [multi-level structure for stored objects](sql-name-resolution.html#logical-schemas-and-namespaces) in earlier versions of CockroachDB, we've recommended using [database](create-database.html) namespaces instead of schema namespaces. The `CONVERT TO SCHEMA` statement is meant to help users who are upgrading to v20.2 and want to use schema namespaces in a way that is more similar to [PostgreSQL](http://www.postgresql.cn/docs/current/ddl-schemas.html).

{{site.data.alerts.callout_info}}
`CONVERT TO SCHEMA` is a subcommand of [`ALTER DATABASE`](alter-database.html).
{{site.data.alerts.end}}

## Required privileges

Only members of the `admin` role can convert databases to schemas. By default, the `root` user belongs to the `admin` role.

## Syntax

~~~
ALTER DATABASE <name> CONVERT TO SCHEMA WITH PARENT <name>
~~~

## Parameters

Parameter | Description
----------|------------
`name` | The first instance of `name` specifies the name of the database to convert. The second instance of `name` specifies the name of the parent database to which the new schema will belong.

## Limitations

A database cannot be converted to a schema if:

- The database is the [current database](sql-name-resolution.html#current-database).
- The database has a child schema other than the [`public` schema](sql-name-resolution.html#databases-with-special-names).

## Example

{% include {{page.version.version}}/sql/movr-statements.md %}

### Convert a database to a schema

By default, tables are stored in the `public` schema:

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM public;
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

Suppose that you want to convert `movr` to a schema, with a new database named `cockroach_labs` as its parent.

First, create the new database:

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE cockroach_labs;
~~~

Then, set the new database as the current database (recall that you cannot convert the current database to a schema):

{% include copy-clipboard.html %}
~~~ sql
> USE cockroach_labs;
~~~

Convert the `movr` database to a schema, with `cockroach_labs` as its parent database:

{% include copy-clipboard.html %}
~~~ sql
> ALTER DATABASE movr CONVERT TO SCHEMA WITH PARENT cockroach_labs;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name
----------------------
  crdb_internal
  information_schema
  movr
  pg_catalog
  pg_extension
  public
(6 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
  schema_name |         table_name         | type  | estimated_row_count
--------------+----------------------------+-------+----------------------
  movr        | promo_codes                | table |                1000
  movr        | rides                      | table |                 500
  movr        | user_promo_codes           | table |                   0
  movr        | users                      | table |                  50
  movr        | vehicle_location_histories | table |                1000
  movr        | vehicles                   | table |                  15
(6 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM public;
~~~

~~~
  schema_name | table_name | type | estimated_row_count
--------------+------------+------+----------------------
(0 rows)
~~~

## See also

- [`CREATE SCHEMA`](create-schema.html)
- [`SHOW SCHEMAS`](show-schemas.html)
- [`Name Resolution`](sql-name-resolution.html)
