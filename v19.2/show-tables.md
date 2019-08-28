---
title: SHOW TABLES
summary: The SHOW TABLES statement lists the tables in a schema or database.
keywords: reflection
toc: true
---

The `SHOW TABLES` [statement](sql-statements.html) lists the tables or [views](views.html) in a schema or database.

{{site.data.alerts.callout_info}}While a table or view is being <a href="drop-table.html">dropped</a>, <code>SHOW TABLES</code> will list the object with a <code>(dropped)</code> suffix.{{site.data.alerts.end}}

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/show_tables.html %}
</div>

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to list the tables in a schema or database.

## Parameters

Parameter | Description
----------|------------
`database_name` | The name of the database for which to show tables.
`schema_name` | The name of the schema for which to show tables.

When a `database_name` and `schema_name` are omitted, the tables of the [current schema](sql-name-resolution.html#current-schema) in the [current database](sql-name-resolution.html#current-database) are listed.

`SHOW TABLES` will attempt to find a schema with the specified name first. If that fails, it will try to find a database with that name instead, and list the tables of its `public` schema. For more details, see [Name Resolution](sql-name-resolution.html).

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Show tables in the current database

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
          table_name
+----------------------------+
  promo_codes
  rides
  user_promo_codes
  users
  vehicle_location_histories
  vehicles
(6 rows)
~~~

This uses the [current schema](sql-name-resolution.html#current-schema) `public` set by default in `search_path`.

### Show tables in a different schema

You can show the tables in schemas other than the current schema. You can also show the schema by table:

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM movr.information_schema;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM information_schema;
~~~

Because `movr` is the current database, these statements return the same output:

~~~
             table_name
+-----------------------------------+
  administrable_role_authorizations
  applicable_roles
  column_privileges
  columns
  constraint_column_usage
  enabled_roles
  key_column_usage
  parameters
  referential_constraints
  role_table_grants
  routines
  schema_privileges
  schemata
  sequences
  statistics
  table_constraints
  table_privileges
  tables
  user_privileges
  views
(20 rows)
~~~


### Show tables in a different database

You can also show tables from a different database.

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM system.public;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM system;
~~~

Because `public` is the current schema, these statements return the same output:

~~~
     table_name
+------------------+
  comments
  descriptor
  eventlog
  jobs
  lease
  locations
  namespace
  rangelog
  role_members
  settings
  table_statistics
  ui
  users
  web_sessions
  zones
(15 rows)
~~~

### Show tables with comments

You can use [`COMMENT ON`](comment-on.html) to add comments on a table.

{% include copy-clipboard.html %}
~~~ sql
> COMMENT ON TABLE users IS 'This table contains information about users.';
~~~

To view a table's comments:

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM movr WITH COMMENT;
~~~

~~~
          table_name         |                   comment
+----------------------------+----------------------------------------------+
  users                      | This table contains information about users.
  vehicles                   |
  rides                      |
  vehicle_location_histories |
  promo_codes                |
  user_promo_codes           |
(6 rows)
~~~

For more information, see [`COMMENT ON`](comment-on.html).

## See also

- [`SHOW DATABASES`](show-databases.html)
- [`SHOW SCHEMAS`](show-schemas.html)
- [`CREATE TABLE`](create-table.html)
- [`CREATE VIEW`](create-view.html)
- [`COMMENT ON`](comment-on.html)
- [Information Schema](information-schema.html)
