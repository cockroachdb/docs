---
title: SHOW TABLES
summary: The SHOW TABLES statement lists the tables in a schema or database.
keywords: reflection
toc: true
---

The `SHOW TABLES` [statement](sql-statements.html) lists the tables or [views](views.html) in a schema or database.

{{site.data.alerts.callout_info}}
While a table or view is being [dropped](drop-table.html), `SHOW TABLES` will list the object with a `(dropped)` suffix.
{{site.data.alerts.end}}

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/show_tables.html %}
</div>

## Required privileges

The `SELECT` [privilege](authorization.html#assign-privileges) on a table is required to list it with `SHOW TABLES`.

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

`SHOW TABLES` uses the [current schema](sql-name-resolution.html#current-schema) `public` set by default in `search_path`:

{% include_cached copy-clipboard.html %}
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

<span class="version-tag">New in v19.2:</span> Alternatively, within the built-in SQL shell, you can use the `\dt` [shell command](cockroach-sql.html#commands):

{% include_cached copy-clipboard.html %}
~~~ sql
> \dt
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

### Show tables in a different schema

You can show the tables in schemas other than the current schema. You can also show the schema by table:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM movr.information_schema;
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM system.public;
~~~

{% include_cached copy-clipboard.html %}
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

### Show user-defined tables with comments

You can use [`COMMENT ON`](comment-on.html) to add comments on a table.

{% include_cached copy-clipboard.html %}
~~~ sql
> COMMENT ON TABLE users IS 'This table contains information about users.';
~~~

To view a table's comments:

{% include_cached copy-clipboard.html %}
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

### Show virtual tables with comments

<span class="version-tag">New in v19.2:</span> The virtual tables in the `pg_catalog`, `information_schema`, and `crdb_internal` schemas contain useful comments, often with links to further documentation.

To view virtual tables with comments and documentation links, use `SHOW TABLES FROM <virtual schema> WITH COMMENT`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM information_schema WITH COMMENT;
~~~

~~~
             table_name             |                                                              comment
+-----------------------------------+------------------------------------------------------------------------------------------------------------------------------------+
  administrable_role_authorizations | roles for which the current user has admin option
                                    | https://www.cockroachlabs.com/docs/v19.2/information-schema.html#administrable_role_authorizations
                                    | https://www.postgresql.org/docs/9.5/infoschema-administrable-role-authorizations.html
  applicable_roles                  | roles available to the current user
                                    | https://www.cockroachlabs.com/docs/v19.2/information-schema.html#applicable_roles
                                    | https://www.postgresql.org/docs/9.5/infoschema-applicable-roles.html
  check_constraints                 | check constraints
                                    | https://www.cockroachlabs.com/docs/v19.2/information-schema.html#check_constraints
                                    | https://www.postgresql.org/docs/9.5/infoschema-check-constraints.html
  column_privileges                 | column privilege grants (incomplete)
                                    | https://www.cockroachlabs.com/docs/v19.2/information-schema.html#column_privileges
                                    | https://www.postgresql.org/docs/9.5/infoschema-column-privileges.html~~~
...
~~~

## See also

- [`SHOW DATABASES`](show-databases.html)
- [`SHOW SCHEMAS`](show-schemas.html)
- [`CREATE TABLE`](create-table.html)
- [`CREATE VIEW`](create-view.html)
- [`COMMENT ON`](comment-on.html)
- [Information Schema](information-schema.html)
