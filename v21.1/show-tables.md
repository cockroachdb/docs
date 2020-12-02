---
title: SHOW TABLES
summary: The SHOW TABLES statement lists the tables in a schema or database.
keywords: reflection
toc: true
---

The `SHOW TABLES` [statement](sql-statements.html) lists the schema, table name, table type, owner, and estimated row count for the tables or [views](views.html) in a schema or database.

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

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
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

Alternatively, within the built-in SQL shell, you can use the `\dt` [shell command](cockroach-sql.html#commands):

{% include copy-clipboard.html %}
~~~ sql
> \dt
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
     schema_name     |            table_name             | type  | estimated_row_count
---------------------+-----------------------------------+-------+----------------------
  information_schema | administrable_role_authorizations | table |                NULL
  information_schema | applicable_roles                  | table |                NULL
  information_schema | check_constraints                 | table |                NULL
  information_schema | column_privileges                 | table |                NULL
  ...
(23 rows)
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
  schema_name |           table_name            | type  | estimated_row_count
--------------+---------------------------------+-------+----------------------
  public      | comments                        | table |                NULL
  public      | descriptor                      | table |                NULL
  public      | eventlog                        | table |                NULL
  public      | jobs                            | table |                NULL
  ...
(29 rows)
~~~

### Show user-defined tables with comments

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
  schema_name |         table_name         | type  | estimated_row_count |                   comment
--------------+----------------------------+-------+---------------------+-----------------------------------------------
  public      | promo_codes                | table |                1000 |
  public      | rides                      | table |                 500 |
  public      | user_promo_codes           | table |                   0 |
  public      | users                      | table |                  50 | This table contains information about users.
  public      | vehicle_location_histories | table |                1000 |
  public      | vehicles                   | table |                  15 |
(6 rows)
~~~

 You can also view comments on a table with [`SHOW CREATE`](show-create.html):

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                             create_statement
-------------+---------------------------------------------------------------------------
  users      | CREATE TABLE users (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     name VARCHAR NULL,
             |     address VARCHAR NULL,
             |     credit_card VARCHAR NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     FAMILY "primary" (id, city, name, address, credit_card)
             | );
             | COMMENT ON TABLE users IS 'This table contains information about users.'
(1 row)
~~~

For more information, see [`COMMENT ON`](comment-on.html).

### Show virtual tables with comments

The virtual tables in the `pg_catalog`, `information_schema`, and `crdb_internal` schemas contain useful comments, often with links to further documentation.

To view virtual tables with comments and documentation links, use `SHOW TABLES FROM <virtual schema> WITH COMMENT`:

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM information_schema WITH COMMENT;
~~~

~~~
     schema_name     |            table_name             | type  | estimated_row_count |                                                              comment
---------------------+-----------------------------------+-------+---------------------+-------------------------------------------------------------------------------------------------------------------------------------
  information_schema | administrable_role_authorizations | table |                NULL | roles for which the current user has admin option
                     |                                   |       |                     | https://www.cockroachlabs.com/docs/v21.1/information-schema.html#administrable_role_authorizations
                     |                                   |       |                     | https://www.postgresql.org/docs/9.5/infoschema-administrable-role-authorizations.html
  information_schema | applicable_roles                  | table |                NULL | roles available to the current user
                     |                                   |       |                     | https://www.cockroachlabs.com/docs/v21.1/information-schema.html#applicable_roles
                     |                                   |       |                     | https://www.postgresql.org/docs/9.5/infoschema-applicable-roles.html
  information_schema | check_constraints                 | table |                NULL | check constraints
                     |                                   |       |                     | https://www.cockroachlabs.com/docs/v21.1/information-schema.html#check_constraints
                     |                                   |       |                     | https://www.postgresql.org/docs/9.5/infoschema-check-constraints.html
...
(23 rows)
~~~

## See also

- [`SHOW DATABASES`](show-databases.html)
- [`SHOW SCHEMAS`](show-schemas.html)
- [`CREATE TABLE`](create-table.html)
- [`CREATE VIEW`](create-view.html)
- [`COMMENT ON`](comment-on.html)
- [Information Schema](information-schema.html)
