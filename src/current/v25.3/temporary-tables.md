---
title: Temporary Tables
summary: CockroachDB supports session-scoped temporary tables.
toc: true
docs_area: develop
---

 CockroachDB supports session-scoped temporary tables (also called "temp tables"). Unlike [persistent tables]({% link {{ page.version.version }}/create-table.md %}), temp tables can only be accessed from the session in which they were created, and they are dropped at the end of the session.

To create a temp table, add `TEMP`/`TEMPORARY` to a [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %}) or [`CREATE TABLE AS`]({% link {{ page.version.version }}/create-table-as.md %}) statement. For full syntax details, see the [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %}#synopsis) and [`CREATE TABLE AS`]({% link {{ page.version.version }}/create-table-as.md %}#synopsis) pages. For example usage, see [Examples](#examples).

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %} For details, see the tracking issue [cockroachdb/cockroach#46260](https://github.com/cockroachdb/cockroach/issues/46260).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
By default, temp tables are disabled in CockroachDB. To enable temp tables, set the `experimental_enable_temp_tables` [session variable]({% link {{ page.version.version }}/set-vars.md %}) to `on`.
{{site.data.alerts.end}}

CockroachDB also supports [temporary views]({% link {{ page.version.version }}/views.md %}#temporary-views) and [temporary sequences]({% link {{ page.version.version }}/create-sequence.md %}#temporary-sequences).

## Details

- Temp tables are automatically dropped at the end of the session.
- A temp table can only be accessed from the session in which it was created.
- Temp tables persist across transactions in the same session.
- Temp tables can reference persistent tables, but persistent tables cannot reference temp tables.
- Temp tables cannot be converted to persistent tables.
- For [PostgreSQL compatibility](https://www.postgresql.org/docs/current/sql-createtable.html), CockroachDB supports the clause `ON COMMIT PRESERVE ROWS` at the end of `CREATE TEMP TABLE` statements. CockroachDB only supports session-scoped temp tables, and does not support the clauses `ON COMMIT DELETE ROWS` and `ON COMMIT DROP`, which are used to define transaction-scoped temp tables in PostgreSQL.

By default, every 30 minutes CockroachDB cleans up all temporary objects that are not tied to an active session. You can change how often the cleanup job runs with the `sql.temp_object_cleaner.cleanup_interval` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}).

## Performance considerations

- Temporary tables are not optimized for performance. They use the same underlying mechanisms as "regular" tables, and may be slower than expected compared to alternatives such as [common table expressions (CTEs)]({% link {{ page.version.version }}/common-table-expressions.md %}).
- Avoid patterns that create and drop very large numbers of temp tables in rapid succession. Creating and dropping large numbers of temp tables can enqueue many [schema change GC jobs]({% link {{ page.version.version }}/show-jobs.md %}) and degrade overall cluster performance.
- Prefer [CTEs]({% link {{ page.version.version }}/common-table-expressions.md %}) for intermediate results where possible. If you do use temp tables instead of CTEs, consider reusing a small set of temp tables with [`TRUNCATE`]({% link {{ page.version.version }}/truncate.md %}) instead of repeatedly creating and dropping new ones. Always test both approaches for your workload.

## Temporary schemas

Temp tables are not part of the `public` schema. Instead, when you create the first temp table for a session, CockroachDB generates a single temporary schema (`pg_temp_<id>`) for all of the temp tables, [temporary views]({% link {{ page.version.version }}/views.md %}#temporary-views), and [temporary sequences]({% link {{ page.version.version }}/create-sequence.md %}#temporary-sequences) in the current session for a database. In a session, you can reference the session's temporary schema as `pg_temp`.

{{site.data.alerts.callout_info}}
Because the [`SHOW TABLES`]({% link {{ page.version.version }}/show-tables.md %}) statement defaults to the `public` schema (which doesn't include temp tables), using `SHOW TABLES` without specifying a schema will not return any temp tables.
{{site.data.alerts.end}}

## Examples

{{site.data.alerts.callout_info}}
For intermediate results, consider using [common table expressions (CTEs)]({% link {{ page.version.version }}/common-table-expressions.md %}#overview) instead of temp tables. For more information, see [Performance considerations](#performance-considerations).
{{site.data.alerts.end}}

To use temp tables, you need to set `experimental_enable_temp_tables` to `on`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET experimental_enable_temp_tables=on;
~~~

### Create a temp table

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TEMP TABLE users (
        id UUID,
        city STRING,
        name STRING,
        address STRING,
        CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC)
);
~~~

You can use [`SHOW CREATE`]({% link {{ page.version.version }}/show-create.md %}) to view temp tables:

{% include_cached copy-clipboard.html %}
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
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     FAMILY "primary" (id, city, name, address)
             | )
(1 row)
~~~

To show the newly created `pg_temp` schema, use [`SHOW SCHEMAS`]({% link {{ page.version.version }}/show-schemas.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
           schema_name
---------------------------------
  crdb_internal
  information_schema
  pg_catalog
  pg_extension
  pg_temp_1602087923187609000_1
  public
(6 rows)
~~~

### Create a temp table that references another temp table

To create another temp table that references `users`:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TEMP TABLE vehicles (
        id UUID NOT NULL,
        city STRING NOT NULL,
        type STRING,
        owner_id UUID,
        creation_time TIMESTAMP,
        CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
        CONSTRAINT fk_city_ref_users FOREIGN KEY (city, owner_id) REFERENCES users(city, id)
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE vehicles;
~~~

~~~
  table_name |                                     create_statement
-------------+--------------------------------------------------------------------------------------------
  vehicles   | CREATE TEMP TABLE vehicles (
             |     id UUID NOT NULL,
             |     city STRING NOT NULL,
             |     type STRING NULL,
             |     owner_id UUID NULL,
             |     creation_time TIMESTAMP NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     CONSTRAINT fk_city_ref_users FOREIGN KEY (city, owner_id) REFERENCES users(city, id),
             |     INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC),
             |     FAMILY "primary" (id, city, type, owner_id, creation_time)
             | )
(1 row)
~~~

### Show all temp tables in a session

To show all temp tables in a session's temporary schema, use `SHOW TABLES FROM pg_temp`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM pg_temp;
~~~

~~~
           schema_name          | table_name | type  | estimated_row_count
--------------------------------+------------+-------+----------------------
  pg_temp_1602087923187609000_1 | users      | table |                   0
  pg_temp_1602087923187609000_1 | vehicles   | table |                   0
(2 rows)
~~~

You can also use the full name of the temporary schema in the `SHOW` statement (e.g., `SHOW TABLES FROM pg_temp_1602087923187609000_1`).

### Show temp tables in `information_schema`

Although temp tables are not included in the `public` schema, metadata for temp tables is included in the [`information_schema`]({% link {{ page.version.version }}/information-schema.md %}) and `pg_catalog` schemas.

For example, the [`information_schema.tables`]({% link {{ page.version.version }}/information-schema.md %}#tables) table includes information about all tables in all schemas in all databases, including temp tables:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM information_schema.tables WHERE table_schema='pg_temp_1602087923187609000_1';
~~~

~~~
   table_catalog |         table_schema          | table_name |   table_type    | is_insertable_into | version
-----------------+-------------------------------+------------+-----------------+--------------------+----------
  defaultdb      | pg_temp_1602087923187609000_1 | users      | LOCAL TEMPORARY | YES                |       2
  defaultdb      | pg_temp_1602087923187609000_1 | vehicles   | LOCAL TEMPORARY | YES                |       2
(2 rows)
~~~

### Cancel a session

If you end the session, all temp tables are lost.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW session_id;
~~~

~~~
             session_id
------------------------------------
  15fd69f9831c1ed00000000000000001
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CANCEL SESSION '15fd69f9831c1ed00000000000000001';
~~~

~~~
ERROR: driver: bad connection
warning: connection lost!
opening new connection: all session settings will be lost
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
ERROR: relation "users" does not exist
SQLSTATE: 42P01
~~~

## See also

- [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %})
- [`CREATE TABLE AS`]({% link {{ page.version.version }}/create-table-as.md %})
- [`SHOW CREATE TABLE`]({% link {{ page.version.version }}/show-create.md %})
- [Temporary views]({% link {{ page.version.version }}/views.md %}#temporary-views)
- [Temporary sequences]({% link {{ page.version.version }}/create-sequence.md %}#temporary-sequences).
- [Common table expressions (CTEs)]({% link {{ page.version.version }}/common-table-expressions.md %})
