---
title: SHOW TABLES
summary: The SHOW TABLES statement lists the tables in a schema or database.
keywords: reflection
toc: true
docs_area: reference.sql
---

The `SHOW TABLES` [statement](sql-statements.html) lists the schema, table name, table type, owner, and estimated row count for the tables or [views](views.html) in a schema or database.

{{site.data.alerts.callout_info}}
While a table or view is being [dropped](drop-table.html), `SHOW TABLES` will list the object with a `(dropped)` suffix.
{{site.data.alerts.end}}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_tables.html %}
</div>

## Required privileges

The `CONNECT` [privilege](security-reference/authorization.html#managing-privileges) on the database of the concerned table is required to list it with SHOW TABLES.

## Parameters

Parameter | Description
----------|------------
`database_name` | The name of the database for which to show tables.
`schema_name` | The name of the schema for which to show tables.

When a `database_name` and `schema_name` are omitted, the tables of the [current schema](sql-name-resolution.html#current-schema) in the [current database](sql-name-resolution.html#current-database) are listed.

`SHOW TABLES` will attempt to find a schema with the specified name first. If that fails, it will try to find a database with that name instead, and list the tables of its `public` schema. For more details, see [Name Resolution](sql-name-resolution.html).

## Performance

To optimize the performance of the `SHOW TABLES` statement, you can do the following:

- Disable table row-count estimation by setting the `sql.show_tables.estimated_row_count.enabled` [cluster setting](cluster-settings.html) to `false` before executing a `SHOW TABLES` statement.
- Avoid running `SHOW TABLES` on databases with a large number of tables (e.g., more than 10,000 tables).

## Examples

{% include {{page.version.version}}/sql/movr-statements-nodes.md %}

### Show tables in the current database

`SHOW TABLES` uses the [current schema](sql-name-resolution.html#current-schema) `public` set by default in `search_path`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
  schema_name |         table_name         | type  | owner | estimated_row_count | locality
--------------+----------------------------+-------+-------+---------------------+-----------
  public      | promo_codes                | table | demo  |                   0 | NULL
  public      | rides                      | table | demo  |                   0 | NULL
  public      | user_promo_codes           | table | demo  |                   0 | NULL
  public      | users                      | table | demo  |                   0 | NULL
  public      | vehicle_location_histories | table | demo  |                   0 | NULL
  public      | vehicles                   | table | demo  |                   0 | NULL
(6 rows)
~~~

Alternatively, within the built-in SQL shell, you can use the `\dt` [shell command](cockroach-sql.html#commands):

{% include_cached copy-clipboard.html %}
~~~ sql
> \dt
~~~

~~~
  schema_name |         table_name         | type  | owner | estimated_row_count | locality
--------------+----------------------------+-------+-------+---------------------+-----------
  public      | promo_codes                | table | demo  |                   0 | NULL
  public      | rides                      | table | demo  |                   0 | NULL
  public      | user_promo_codes           | table | demo  |                   0 | NULL
  public      | users                      | table | demo  |                   0 | NULL
  public      | vehicle_location_histories | table | demo  |                   0 | NULL
  public      | vehicles                   | table | demo  |                   0 | NULL
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
     schema_name     |              table_name               | type  | owner | estimated_row_count | locality
---------------------+---------------------------------------+-------+-------+---------------------+-----------
  information_schema | administrable_role_authorizations     | table | NULL  |                NULL | NULL
  information_schema | applicable_roles                      | table | NULL  |                NULL | NULL
  information_schema | attributes                            | table | NULL  |                NULL | NULL
  information_schema | character_sets                        | table | NULL  |                NULL | NULL
  ...
(86 rows)
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
  schema_name |           table_name            | type  | owner | estimated_row_count | locality
--------------+---------------------------------+-------+-------+---------------------+-----------
  public      | comments                        | table | NULL  |                   0 | NULL
  public      | database_role_settings          | table | NULL  |                   0 | NULL
  public      | descriptor                      | table | NULL  |                   0 | NULL
  public      | eventlog                        | table | NULL  |                   0 | NULL
  ...
(36 rows)
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
  schema_name |         table_name         | type  | owner | estimated_row_count | locality |                   comment
--------------+----------------------------+-------+-------+---------------------+----------+-----------------------------------------------
  public      | promo_codes                | table | demo  |                1000 | NULL     |
  public      | rides                      | table | demo  |                 500 | NULL     |
  public      | user_promo_codes           | table | demo  |                   0 | NULL     |
  public      | users                      | table | demo  |                  50 | NULL     | This table contains information about users.
  public      | vehicle_location_histories | table | demo  |                1000 | NULL     |
  public      | vehicles                   | table | demo  |                  15 | NULL     |
(6 rows)
~~~

You can also view comments on a table with [`SHOW CREATE`](show-create.html):

{% include_cached copy-clipboard.html %}
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
             |     CONSTRAINT users_pkey PRIMARY KEY (city ASC, id ASC)
             | );
             | COMMENT ON TABLE users IS 'This table contains information about users.'
(1 row)
~~~

For more information, see [`COMMENT ON`](comment-on.html).

### Show virtual tables with comments

The virtual tables in the `pg_catalog`, `information_schema`, and `crdb_internal` schemas contain useful comments, often with links to further documentation.

To view virtual tables with comments and documentation links, use `SHOW TABLES FROM <virtual schema> WITH COMMENT`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM information_schema WITH COMMENT;
~~~

~~~
     schema_name     |              table_name               | type  | owner | estimated_row_count | locality |                                                              comment
---------------------+---------------------------------------+-------+-------+---------------------+----------+-------------------------------------------------------------------------------------------------------------------------------------
  information_schema | administrable_role_authorizations     | table | NULL  |                NULL | NULL     | roles for which the current user has admin option
                     |                                       |       |       |                     |          | https://www.cockroachlabs.com/docs/{{ page.version.version }}/information-schema.html#administrable_role_authorizations
                     |                                       |       |       |                     |          | https://www.postgresql.org/docs/9.5/infoschema-administrable-role-authorizations.html
  information_schema | applicable_roles                      | table | NULL  |                NULL | NULL     | roles available to the current user
                     |                                       |       |       |                     |          | https://www.cockroachlabs.com/docs/{{ page.version.version }}/information-schema.html#applicable_roles
                     |                                       |       |       |                     |          | https://www.postgresql.org/docs/9.5/infoschema-applicable-roles.html
  information_schema | attributes                            | table | NULL  |                NULL | NULL     | attributes was created for compatibility and is currently unimplemented
  information_schema | character_sets                        | table | NULL  |                NULL | NULL     | character sets available in the current database
                     |                                       |       |       |                     |          | https://www.cockroachlabs.com/docs/{{ page.version.version }}/information-schema.html#character_sets
                     |                                       |       |       |                     |          | https://www.postgresql.org/docs/9.5/infoschema-character-sets.html
  information_schema | check_constraint_routine_usage        | table | NULL  |                NULL | NULL     | check_constraint_routine_usage was created for compatibility and is currently unimplemented
  information_schema | check_constraints                     | table | NULL  |                NULL | NULL     | check constraints
                     |                                       |       |       |                     |          | https://www.cockroachlabs.com/docs/{{ page.version.version }}/information-schema.html#check_constraints
                     |                                       |       |       |                     |          | https://www.postgresql.org/docs/9.5/infoschema-check-constraints.html
  ...
(86 rows)
~~~

### Show locality of tables

For [multi-region](multiregion-overview.html) tables, you can display the locality of each table using the `SHOW TABLES` command.

{% include enterprise-feature.md %}

First, [set the primary region](alter-database.html#set-primary-region) on `movr` to `us-east`:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER DATABASE movr SET PRIMARY REGION "us-east";
~~~

All tables will be [`REGIONAL BY TABLE`](alter-table.html#set-the-table-locality-to-regional-by-table) in the primary region by default.

Next, configure the `users` table to be [`REGIONAL BY ROW`](alter-table.html#set-the-table-locality-to-regional-by-row):

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users SET LOCALITY REGIONAL BY ROW;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES;
~~~

~~~
  schema_name |         table_name         | type  | owner | estimated_row_count |              locality
--------------+----------------------------+-------+-------+---------------------+--------------------------------------
  public      | promo_codes                | table | demo  |                1000 | REGIONAL BY TABLE IN PRIMARY REGION
  public      | rides                      | table | demo  |                 500 | REGIONAL BY TABLE IN PRIMARY REGION
  public      | user_promo_codes           | table | demo  |                   0 | REGIONAL BY TABLE IN PRIMARY REGION
  public      | users                      | table | demo  |                  50 | REGIONAL BY ROW
  public      | vehicle_location_histories | table | demo  |                1000 | REGIONAL BY TABLE IN PRIMARY REGION
  public      | vehicles                   | table | demo  |                  15 | REGIONAL BY TABLE IN PRIMARY REGION
(6 rows)
~~~

{{site.data.alerts.callout_info}}
Locality information for tables is also available in the `locality` column within the [`crdb_internal.tables`](crdb-internal.html) table.
{{site.data.alerts.end}}

## See also

- [`SHOW DATABASES`](show-databases.html)
- [`SHOW SCHEMAS`](show-schemas.html)
- [`CREATE TABLE`](create-table.html)
- [`CREATE VIEW`](create-view.html)
- [`COMMENT ON`](comment-on.html)
- [Information Schema](information-schema.html)
