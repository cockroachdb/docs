---
title: CREATE TABLE AS
summary: The CREATE TABLE AS statement persists the result of a query into the database for later reuse.
toc: true
docs_area: reference.sql
---

The `CREATE TABLE ... AS` [statement]({% link {{ page.version.version }}/sql-statements.md %}) creates a new table from a [selection query]({% link {{ page.version.version }}/selection-queries.md %}).

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Intended use

Tables created with `CREATE TABLE ... AS` are intended to persist the result of a query for later reuse.

This can be more efficient than a [view]({% link {{ page.version.version }}/create-view.md %}) when the following two conditions are met:

- The result of the query is used as-is multiple times.
- The copy needs not be kept up-to-date with the original table over time.

When the results of a query are reused multiple times within a larger query, a view is advisable instead. The query optimizer can "peek"into the view and optimize the surrounding query using the primary key and indices of the tables mentioned in the view query.

A view is also advisable when the results must be up-to-date; a view always retrieves the current data from the tables that the view query mentions.

Use `CREATE TABLE t AS ...` with the [`AS OF SYSTEM TIME` clause](#populate-create-table-as-with-historical-data-using-as-of-system-time) to leverage [historical reads]({% link {{ page.version.version }}/as-of-system-time.md %}) to reduce contention and improve performance.

{{site.data.alerts.callout_info}}
The default rules for [column families]({% link {{ page.version.version }}/column-families.md %}) apply.
{{site.data.alerts.end}}

## Required privileges

The user must have the `CREATE` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the parent database.

## Synopsis
<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="basic">Basic</button>
  <button style="width: 15%" class="filter-button" data-scope="expanded">Expanded</button>
</div><p></p>

<div class="filter-content" markdown="1" data-scope="basic">
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_table_as.html %}
</div>

<div class="filter-content" markdown="1" data-scope="expanded">

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_table_as.html %}
</div>

**create_as_col_qual_list ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_as_col_qual_list.html %}
</div>

**create_as_constraint_def ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_as_constraint_def.html %}
</div>

**opt_with_storage_parameter_list ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/opt_with_storage_parameter_list.html %}
</div>

</div>

## Parameters

 Parameter | Description
-----------|-------------
 `IF NOT EXISTS` | Create a new table only if a table of the same name does not already exist in the database; if one does exist, do not return an error.<br><br>Note that `IF NOT EXISTS` checks the table name only; it does not check if an existing table has the same columns, indexes, constraints, etc., of the new table.
 `table_name` | The name of the table to create, which must be unique within its database and follow these [identifier rules]({% link {{ page.version.version }}/keywords-and-identifiers.md %}#identifiers). When the parent database is not set as the default, the name must be formatted as `database.name`.<br><br>The [`UPSERT`]({% link {{ page.version.version }}/upsert.md %}) and [`INSERT ON CONFLICT`]({% link {{ page.version.version }}/insert.md %}) statements use a temporary table called `excluded` to handle uniqueness conflicts during execution. It's therefore not recommended to use the name `excluded` for any of your tables.
 `column_name` | The name of the column you want to use instead of the name of the column from `select_stmt`.
 `create_as_col_qual_list` | An optional column definition, which may include [primary key constraints]({% link {{ page.version.version }}/primary-key.md %}) and [column family assignments]({% link {{ page.version.version }}/column-families.md %}).
 `family_def` | An optional [column family definition]({% link {{ page.version.version }}/column-families.md %}). Column family names must be unique within the table but can have the same name as columns, constraints, or indexes.
 `create_as_constraint_def` | An optional [primary key constraint]({% link {{ page.version.version }}/primary-key.md %}).
 `select_stmt` | A [selection query]({% link {{ page.version.version }}/select-clause.md %}) to provide the data.
 `opt_persistence_temp_table` |  Defines the table as a session-scoped temporary table. For more information, see [Temporary Tables]({% link {{ page.version.version }}/temporary-tables.md %}).<br><br>Note that the `LOCAL`, `GLOBAL`, and `UNLOGGED` options are no-ops, allowed by the parser for PostgreSQL compatibility.<br><br>**Support for temporary tables is [in preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}#temporary-objects)**.
 `opt_with_storage_parameter_list` |  A comma-separated list of [spatial index tuning parameters]({% link {{ page.version.version }}/spatial-indexes.md %}#index-tuning-parameters). Supported parameters include `fillfactor`, `s2_max_level`, `s2_level_mod`, `s2_max_cells`, `geometry_min_x`, `geometry_max_x`, `geometry_min_y`, and `geometry_max_y`. The `fillfactor` parameter is a no-op, allowed for PostgreSQL-compatibility.<br><br>For details, see [Spatial index tuning parameters]({% link {{ page.version.version }}/spatial-indexes.md %}#index-tuning-parameters). For an example, see [Create a spatial index that uses all of the tuning parameters]({% link {{ page.version.version }}/spatial-indexes.md %}#create-a-spatial-index-that-uses-all-of-the-tuning-parameters).
 `ON COMMIT PRESERVE ROWS` | This clause is a no-op, allowed by the parser for PostgreSQL compatibility. CockroachDB only supports session-scoped [temporary tables]({% link {{ page.version.version }}/temporary-tables.md %}), and does not support the clauses `ON COMMIT DELETE ROWS` and `ON COMMIT DROP`, which are used to define transaction-scoped temporary tables in PostgreSQL.

## Known limitations

{% include {{ page.version.version }}/known-limitations/create-table-as-limitations.md %}

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Create a table from a `SELECT` query

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users WHERE city = 'new york';
~~~
~~~
                   id                  |   city   |       name       |           address           | credit_card
+--------------------------------------+----------+------------------+-----------------------------+-------------+
  00000000-0000-4000-8000-000000000000 | new york | Robert Murphy    | 99176 Anderson Mills        | 8885705228
  051eb851-eb85-4ec0-8000-000000000001 | new york | James Hamilton   | 73488 Sydney Ports Suite 57 | 8340905892
  0a3d70a3-d70a-4d80-8000-000000000002 | new york | Judy White       | 18580 Rosario Ville Apt. 61 | 2597958636
  0f5c28f5-c28f-4c00-8000-000000000003 | new york | Devin Jordan     | 81127 Angela Ferry Apt. 8   | 5614075234
  147ae147-ae14-4b00-8000-000000000004 | new york | Catherine Nelson | 1149 Lee Alley              | 0792553487
  19999999-9999-4a00-8000-000000000005 | new york | Nicole Mcmahon   | 11540 Patton Extensions     | 0303726947
(6 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users_ny AS SELECT * FROM users WHERE city = 'new york';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users_ny;
~~~
~~~
                   id                  |   city   |       name       |           address           | credit_card
+--------------------------------------+----------+------------------+-----------------------------+-------------+
  00000000-0000-4000-8000-000000000000 | new york | Robert Murphy    | 99176 Anderson Mills        | 8885705228
  051eb851-eb85-4ec0-8000-000000000001 | new york | James Hamilton   | 73488 Sydney Ports Suite 57 | 8340905892
  0a3d70a3-d70a-4d80-8000-000000000002 | new york | Judy White       | 18580 Rosario Ville Apt. 61 | 2597958636
  0f5c28f5-c28f-4c00-8000-000000000003 | new york | Devin Jordan     | 81127 Angela Ferry Apt. 8   | 5614075234
  147ae147-ae14-4b00-8000-000000000004 | new york | Catherine Nelson | 1149 Lee Alley              | 0792553487
  19999999-9999-4a00-8000-000000000005 | new york | Nicole Mcmahon   | 11540 Patton Extensions     | 0303726947
(6 rows)
~~~

### Change column names

This statement creates a copy of an existing table but with changed column names:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users_ny_names (user_id, user_name) AS SELECT id, name FROM users WHERE city = 'new york';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users_ny_names;
~~~
~~~
                user_id                |    user_name
+--------------------------------------+------------------+
  00000000-0000-4000-8000-000000000000 | Robert Murphy
  051eb851-eb85-4ec0-8000-000000000001 | James Hamilton
  0a3d70a3-d70a-4d80-8000-000000000002 | Judy White
  0f5c28f5-c28f-4c00-8000-000000000003 | Devin Jordan
  147ae147-ae14-4b00-8000-000000000004 | Catherine Nelson
  19999999-9999-4a00-8000-000000000005 | Nicole Mcmahon
(6 rows)
~~~

### Create a table from a `VALUES` clause

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE drivers (id, city, name) AS VALUES (gen_random_uuid(), 'new york', 'Harry Potter'), (gen_random_uuid(), 'seattle', 'Evelyn Martin');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM drivers;
~~~
~~~
                   id                  |   city   |     name
+--------------------------------------+----------+---------------+
  146eebc4-c913-4678-8ea3-c5797d2b7f83 | new york | Harry Potter
  43cafd3b-2537-4fd8-a987-8138f88a22a4 | seattle  | Evelyn Martin
(2 rows)
~~~

### Create a copy of an existing table

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users_ny_copy AS TABLE users_ny;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users_ny_copy;
~~~
~~~
                   id                  |   city   |       name       |           address           | credit_card
+--------------------------------------+----------+------------------+-----------------------------+-------------+
  00000000-0000-4000-8000-000000000000 | new york | Robert Murphy    | 99176 Anderson Mills        | 8885705228
  051eb851-eb85-4ec0-8000-000000000001 | new york | James Hamilton   | 73488 Sydney Ports Suite 57 | 8340905892
  0a3d70a3-d70a-4d80-8000-000000000002 | new york | Judy White       | 18580 Rosario Ville Apt. 61 | 2597958636
  0f5c28f5-c28f-4c00-8000-000000000003 | new york | Devin Jordan     | 81127 Angela Ferry Apt. 8   | 5614075234
  147ae147-ae14-4b00-8000-000000000004 | new york | Catherine Nelson | 1149 Lee Alley              | 0792553487
  19999999-9999-4a00-8000-000000000005 | new york | Nicole Mcmahon   | 11540 Patton Extensions     | 0303726947
(6 rows)
~~~

When a table copy is created this way, the copy is not associated to
any primary key, secondary index, or constraint that was present on the
original table.

### Specify a primary key

You can specify the [primary key]({% link {{ page.version.version }}/primary-key.md %}) of a new table created from a selection query:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users_ny_pk (id, city, name PRIMARY KEY) AS SELECT id, city, name FROM users WHERE city = 'new york';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users_ny_pk;
~~~
~~~
                   id                  |   city   |       name
+--------------------------------------+----------+------------------+
  147ae147-ae14-4b00-8000-000000000004 | new york | Catherine Nelson
  0f5c28f5-c28f-4c00-8000-000000000003 | new york | Devin Jordan
  051eb851-eb85-4ec0-8000-000000000001 | new york | James Hamilton
  0a3d70a3-d70a-4d80-8000-000000000002 | new york | Judy White
  19999999-9999-4a00-8000-000000000005 | new york | Nicole Mcmahon
  00000000-0000-4000-8000-000000000000 | new york | Robert Murphy
(6 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users_ny_pk;
~~~
~~~
    table_name   |                 create_statement
+----------------+--------------------------------------------------+
  users_ny_extra | CREATE TABLE users_ny_extra (
                 |     id UUID NULL,
                 |     city VARCHAR NULL,
                 |     name VARCHAR NOT NULL,
                 |     CONSTRAINT "primary" PRIMARY KEY (name ASC),
                 |     FAMILY "primary" (id, city, name)
                 | )
(1 row)
~~~

### Define column families

You can define the [column families]({% link {{ page.version.version }}/column-families.md %}) of a new table created from a selection query:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users_ny_alt (id PRIMARY KEY FAMILY ids, name, city FAMILY locs, address, credit_card FAMILY payments) AS SELECT id, name, city, address, credit_card FROM users WHERE city = 'new york';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users_ny_alt;
~~~
~~~
                   id                  |       name       |   city   |           address           | credit_card
+--------------------------------------+------------------+----------+-----------------------------+-------------+
  00000000-0000-4000-8000-000000000000 | Robert Murphy    | new york | 99176 Anderson Mills        | 8885705228
  051eb851-eb85-4ec0-8000-000000000001 | James Hamilton   | new york | 73488 Sydney Ports Suite 57 | 8340905892
  0a3d70a3-d70a-4d80-8000-000000000002 | Judy White       | new york | 18580 Rosario Ville Apt. 61 | 2597958636
  0f5c28f5-c28f-4c00-8000-000000000003 | Devin Jordan     | new york | 81127 Angela Ferry Apt. 8   | 5614075234
  147ae147-ae14-4b00-8000-000000000004 | Catherine Nelson | new york | 1149 Lee Alley              | 0792553487
  19999999-9999-4a00-8000-000000000005 | Nicole Mcmahon   | new york | 11540 Patton Extensions     | 0303726947
(6 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users_ny_alt;
~~~
~~~
   table_name  |                create_statement
+--------------+------------------------------------------------+
  users_ny_alt | CREATE TABLE users_ny_alt (
               |     id UUID NOT NULL,
               |     name VARCHAR NULL,
               |     city VARCHAR NULL,
               |     address VARCHAR NULL,
               |     credit_card VARCHAR NULL,
               |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
               |     FAMILY ids (id, name, address),
               |     FAMILY locs (city),
               |     FAMILY payments (credit_card)
               | )
(1 row)
~~~

### Populate `CREATE TABLE AS` with historical data using `AS OF SYSTEM TIME`

CockroachDB supports creating a table using historical data using the [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) clause. You can use this to create a new table based on the state of an existing table as of a specific [timestamp]({% link {{ page.version.version }}/timestamp.md %}) in the past. This is useful for:

- Generating static datasets for reporting or analytical workloads without increasing contention on production tables or otherwise impacting performance.
- Analyzing data changes over time.
- Preserving historical data for regulatory or investigative purposes.
- Undoing an [accidental table deletion](#undo-an-accidental-table-deletion).

{{site.data.alerts.callout_info}}
The timestamp must be within the [garbage collection (GC) window]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection) of the source table for the data to be available.
{{site.data.alerts.end}}

The following example creates a new table from the [`movr`]({% link {{ page.version.version }}/movr.md %}) dataset at the most recent timestamp that can perform a [follower read]({% link {{ page.version.version }}/follower-reads.md %}).

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE analysis_vehicle_location_histories
  AS SELECT * FROM movr.vehicle_location_histories
  AS OF SYSTEM TIME follower_read_timestamp();
~~~

~~~
NOTICE: CREATE TABLE ... AS does not copy over indexes, default expressions, or constraints; the new table has a hidden rowid primary key column
CREATE TABLE AS
~~~

#### Undo an accidental table deletion

The following steps use a table from the [`movr`]({% link {{ page.version.version }}/movr.md %}) dataset to show how to undo an accidental table deletion using `CREATE TABLE AS ... AS OF SYSTEM TIME`.

1. Get a timestamp before the table is deleted in an upcoming step:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT now();
    ~~~

    ~~~
                  now
    --------------------------------
      2025-06-17 15:04:15.82632+00
    (1 row)
    ~~~

1. Wait a few seconds to simulate time passing (adjust as needed):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT pg_sleep(5);
    ~~~

    ~~~
      pg_sleep
    ------------
         t
    (1 row)
    ~~~

1. Drop the original table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    DROP TABLE movr.vehicle_location_histories;
    ~~~

    ~~~
    DROP TABLE
    ~~~

1. Restore the table using the [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) clause and the timestamp you obtained before dropping the table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE movr.vehicle_location_histories AS SELECT * FROM movr.vehicle_location_histories AS OF SYSTEM TIME '2025-06-17 15:04:15.82632+00';
    ~~~

    ~~~
    NOTICE: CREATE TABLE ... AS does not copy over indexes, default expressions, or constraints; the new table has a hidden rowid primary key column
    CREATE TABLE AS
    ~~~

For more information about historical reads at a given timestamp, refer to [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}).

## See also

- [Selection Queries]({% link {{ page.version.version }}/selection-queries.md %})
- [Simple `SELECT` Clause]({% link {{ page.version.version }}/select-clause.md %})
- [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %})
- [`CREATE VIEW`]({% link {{ page.version.version }}/create-view.md %})
- [`INSERT`]({% link {{ page.version.version }}/insert.md %})
- [`DROP TABLE`]({% link {{ page.version.version }}/drop-table.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})
- [`ALTER PRIMARY KEY`]({% link {{ page.version.version }}/alter-table.md %}#alter-primary-key)
- [`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})
- [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %})
- [Follower Reads]({% link {{ page.version.version }}/follower-reads.md %})
- [Disaster Recovery Planning]({% link {{ page.version.version }}/disaster-recovery-planning.md %})
