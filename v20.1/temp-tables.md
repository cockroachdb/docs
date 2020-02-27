---
title: Temporary Tables
summary: CockroachDB supports session-scoped temporary tables.
toc: true
---

<span class="version-tag">New in v20.1:</span> CockroachDB supports session-scoped temporary tables (also called "temp tables"). Unlike [persistent tables](create-table.html), temp tables can only be accessed from the session in which they were created, and they are dropped at the end of the session.

{{site.data.alerts.callout_danger}}
**This is an experimental feature**. The interface and output are subject to change. For details, see the tracking issue [cockroachdb/cockroach#46260](https://github.com/cockroachdb/cockroach/issues/46260).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
By default, temp tables are disabled in CockroachDB. To enable temp tables, set the `experimental_enable_temp_tables` [session variable](session-vars.html) to `on`.
{{site.data.alerts.end}}

## Details

- Temp tables are automatically dropped at the end of the session.
- A temp table can only be accessed from the session in which it was created.
- Temp tables persist across transactions in the same session.
- Persistent tables cannot reference temp tables, but temp tables can reference persistent tables.
- Temp tables cannot be converted to persistent tables.

## Temporary schemas

Temp tables are not part of the `public` schema. Instead, when you create the first temp table for a session, CockroachDB generates a single temporary schema (`pg_temp_<id>`) for all of the temp tables in the current session for a database. In a session, you can reference the session's temporary schema as `pg_temp`.

## Syntax

To create a temp table, add the following [`TEMP`/`TEMPORARY`](sql-grammar.html#opt_temp_create_table) clause to the beginning of a [`CREATE TABLE`](create-table.html) or [`CREATE TABLE AS`](create-table-as.html) statement:

<div>
  {% include {{ page.version.version }}/sql/diagrams/opt_temp_create_table.html %}
</div>

## Example

To turn on temp tables:

{% include copy-clipboard.html %}
~~~ sql
> SET experimental_enable_temp_tables=on;
~~~

To create a temp table:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TEMP TABLE users (
        id UUID PRIMARY KEY,
        city STRING,
        name STRING,
        address STRING
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                create_statement
-------------+-------------------------------------------------
  users      | CREATE TEMP TABLE users (
             |     id UUID NOT NULL,
             |     city STRING NULL,
             |     name STRING NULL,
             |     address STRING NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
             |     FAMILY "primary" (id, city, name, address)
             | )
(1 row)
~~~

To show the newly created `pg_temp` schema, use [`SHOW SCHEMAS`](show-schemas.html):

{% include copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
           schema_name
---------------------------------
  crdb_internal
  information_schema
  pg_catalog
  pg_temp_1584540651942455000_1
  public
~~~


To create another temp table that references `users`:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TEMP TABLE vehicles (
        id UUID NOT NULL,
        city STRING NOT NULL,
        type STRING,
        owner_id UUID,
        creation_time TIMESTAMP,
        CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
        INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC)
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE vehicles;
~~~

~~~
  table_name |                             create_statement
-------------+----------------------------------------------------------------------------
  vehicles   | CREATE TEMP TABLE vehicles (
             |     id UUID NOT NULL,
             |     city STRING NOT NULL,
             |     type STRING NULL,
             |     owner_id UUID NULL,
             |     creation_time TIMESTAMP NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC),
             |     FAMILY "primary" (id, city, type, owner_id, creation_time)
             | )
(1 row)
~~~

To show all temp tables in a session's temporary schema, use `SHOW TABLES FROM pg_temp`:

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM pg_temp;
~~~

~~~
  table_name
--------------
  users
  vehicles
(2 rows)
~~~

{{site.data.alerts.callout_info}}
The [`SHOW TABLES`](show-tables.html) statement defaults to the `public` schema, which doesn't include temp tables. As a result, using `SHOW TABLES` without specifying a schema won't return any temp tables.
{{site.data.alerts.end}}

Although temp tables are not included in the `public` schema, metadata for temp tables is included in the [`information_schema`](information-schema.html) and `pg_catalog` schemas.

For example, the [`information_schema.tables`](information-schema.html#tables) table includes information about all tables in all schemas in all databases, including temp tables:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM information_schema.tables WHERE table_schema='pg_temp_1584540651942455000_1';
~~~

~~~
  table_catalog |         table_schema          | table_name |   table_type    | is_insertable_into | version
----------------+-------------------------------+------------+-----------------+--------------------+----------
  defaultdb     | pg_temp_1584540651942455000_1 | users      | LOCAL TEMPORARY | YES                |       1
  defaultdb     | pg_temp_1584540651942455000_1 | vehicles   | LOCAL TEMPORARY | YES                |       1
(2 rows)
~~~

If you end the session, all temp tables are lost.

{% include copy-clipboard.html %}
~~~ sql
> SHOW session_id;
~~~

~~~
             session_id
------------------------------------
  15fd69f9831c1ed00000000000000001
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> CANCEL SESSION '15fd69f9831c1ed00000000000000001';
~~~

~~~
ERROR: driver: bad connection
warning: connection lost!
opening new connection: all session settings will be lost
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
ERROR: relation "users" does not exist
SQLSTATE: 42P01
~~~

## See also

- [`CREATE TABLE`](create-table.html)
- [`CREATE TABLE AS`](create-table-as.html)
- [`SHOW CREATE TABLE`](show-create-table.html)
