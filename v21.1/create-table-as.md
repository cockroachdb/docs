---
title: CREATE TABLE AS
summary: The CREATE TABLE AS statement persists the result of a query into the database for later reuse.
toc: true
---

The `CREATE TABLE ... AS` [statement](sql-statements.html) creates a new table from a [selection query](selection-queries.html).


## Intended use

Tables created with `CREATE TABLE ... AS` are intended to persist the
result of a query for later reuse.

This can be more efficient than a [view](create-view.html) when the
following two conditions are met:

- The result of the query is used as-is multiple times.
- The copy needs not be kept up-to-date with the original table over time.

When the results of a query are reused multiple times within a larger
query, a view is advisable instead. The query optimizer can "peek"
into the view and optimize the surrounding query using the primary key
and indices of the tables mentioned in the view query.

A view is also advisable when the results must be up-to-date; a view
always retrieves the current data from the tables that the view query
mentions.

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the parent database.

## Synopsis
<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="basic">Basic</button>
  <button style="width: 15%" class="filter-button" data-scope="expanded">Expanded</button>
</div><p></p>

<div class="filter-content" markdown="1" data-scope="basic">
{% include {{ page.version.version }}/sql/diagrams/create_table_as.html %}
</div>

<div class="filter-content" markdown="1" data-scope="expanded">

<div>
  {% include {{ page.version.version }}/sql/diagrams/create_table_as.html %}
</div>

**create_as_col_qual_list ::=**

<div>
  {% include {{ page.version.version }}/sql/diagrams/create_as_col_qual_list.html %}
</div>

**create_as_constraint_def ::=**

<div>
  {% include {{ page.version.version }}/sql/diagrams/create_as_constraint_def.html %}
</div>

**opt_with_storage_parameter_list ::=**

<div>
  {% include {{ page.version.version }}/sql/diagrams/opt_with_storage_parameter_list.html %}
</div>

</div>

## Parameters

<style>
table td:first-child {
    min-width: 225px;
}
</style>

 Parameter | Description
-----------|-------------
 `IF NOT EXISTS` | Create a new table only if a table of the same name does not already exist in the database; if one does exist, do not return an error.<br><br>Note that `IF NOT EXISTS` checks the table name only; it does not check if an existing table has the same columns, indexes, constraints, etc., of the new table.
 `table_name` | The name of the table to create, which must be unique within its database and follow these [identifier rules](keywords-and-identifiers.html#identifiers). When the parent database is not set as the default, the name must be formatted as `database.name`.<br><br>The [`UPSERT`](upsert.html) and [`INSERT ON CONFLICT`](insert.html) statements use a temporary table called `excluded` to handle uniqueness conflicts during execution. It's therefore not recommended to use the name `excluded` for any of your tables.
 `column_name` | The name of the column you want to use instead of the name of the column from `select_stmt`.
 `create_as_col_qual_list` | An optional column definition, which may include [primary key constraints](primary-key.html) and [column family assignments](column-families.html).
 `family_def` | An optional [column family definition](column-families.html). Column family names must be unique within the table but can have the same name as columns, constraints, or indexes.
 `create_as_constraint_def` | An optional [primary key constraint](primary-key.html).
 `select_stmt` | A [selection query](selection-queries.html) to provide the data.
 `opt_persistence_temp_table` |  Defines the table as a session-scoped temporary table. For more information, see [Temporary Tables](temporary-tables.html).<br><br>Note that the `LOCAL`, `GLOBAL`, and `UNLOGGED` options are no-ops, allowed by the parser for PostgresSQL compatibility.<br><br>**Support for temporary tables is [experimental](experimental-features.html#temporary-objects)**.
 `opt_with_storage_parameter_list` |  A comma-separated list of [spatial index tuning parameters](spatial-indexes.html#index-tuning-parameters). Supported parameters include `fillfactor`, `s2_max_level`, `s2_level_mod`, `s2_max_cells`, `geometry_min_x`, `geometry_max_x`, `geometry_min_y`, and `geometry_max_y`. The `fillfactor` parameter is a no-op, allowed for PostgreSQL-compatibility.<br><br>For details, see [Spatial index tuning parameters](spatial-indexes.html#index-tuning-parameters). For an example, see [Create a spatial index that uses all of the tuning parameters](spatial-indexes.html#create-a-spatial-index-that-uses-all-of-the-tuning-parameters).
 `ON COMMIT PRESERVE ROWS` | This clause is a no-op, allowed by the parser for PostgresSQL compatibility. CockroachDB only supports session-scoped [temporary tables](temporary-tables.html), and does not support the clauses `ON COMMIT DELETE ROWS` and `ON COMMIT DROP`, which are used to define transaction-scoped temporary tables in PostgreSQL.

## Limitations

Tables created with `CREATE TABLE ... AS` are not [interleaved](interleave-in-parent.html) with other tables.
The default rules for [column families](column-families.html) apply.

The [primary key](primary-key.html) of tables created with `CREATE TABLE ... AS` is not automatically derived from the query results. You must specify new primary keys at table creation. For examples, see [Specify a primary key](create-table-as.html#specify-a-primary-key) and [Specify a primary key for partitioning](create-table-as.html#specify-a-primary-key-for-partitioning).

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Create a table from a `SELECT` query

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE users_ny AS SELECT * FROM users WHERE city = 'new york';
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE users_ny_names (user_id, user_name) AS SELECT id, name FROM users WHERE city = 'new york';
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE drivers (id, city, name) AS VALUES (gen_random_uuid(), 'new york', 'Harry Potter'), (gen_random_uuid(), 'seattle', 'Evelyn Martin');
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE users_ny_copy AS TABLE users_ny;
~~~

{% include copy-clipboard.html %}
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

You can specify the [primary key](primary-key.html) of a new table created from a selection query:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE users_ny_pk (id, city, name PRIMARY KEY) AS SELECT id, city, name FROM users WHERE city = 'new york';
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

You can define the [column families](column-families.html) of a new table created from a selection query:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE users_ny_alt (id PRIMARY KEY FAMILY ids, name, city FAMILY locs, address, credit_card FAMILY payments) AS SELECT id, name, city, address, credit_card FROM users WHERE city = 'new york';
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

### Specify a primary key for partitioning

If you are [partitioning](partitioning.html) a table based on a [primary key](primary-key.html), the primary key must be properly defined. To change the primary key after table creation, you can use an [`ALTER TABLE ... ALTER PRIMARY KEY`](alter-primary-key.html) statement.

Suppose that you want to [geo-partition](demo-low-latency-multi-region-deployment.html) the `drivers` table that you created with the following statement:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE drivers (id, city, name) AS VALUES (gen_random_uuid(), 'new york', 'Harry Potter'), (gen_random_uuid(), 'seattle', 'Evelyn Martin');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE drivers;
~~~
~~~
  table_name |               create_statement
+------------+----------------------------------------------+
  drivers    | CREATE TABLE drivers (
             |     id UUID NULL,
             |     city STRING NULL,
             |     name STRING NULL,
             |     FAMILY "primary" (id, city, name, rowid)
             | )
(1 row)
~~~

In order for this table to be properly geo-partitioned with the other tables in the `movr` dataset, the table must have a composite primary key defined that includes the unique row identifier (`id`, in this case) and the row locality identifier (`city`). Use the following statement to change the primary key to a composite primary key:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE drivers_pk (id, city, name, PRIMARY KEY (id, city)) AS SELECT id, city, name FROM drivers;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE drivers_pk;
~~~
~~~
  table_name |                     create_statement
+------------+----------------------------------------------------------+
  drivers_pk | CREATE TABLE drivers_pk (
             |     id UUID NOT NULL,
             |     city STRING NOT NULL,
             |     name STRING NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (id ASC, city ASC),
             |     FAMILY "primary" (id, city, name)
             | )
(1 row)
~~~

## See also

- [Selection Queries](selection-queries.html)
- [Simple `SELECT` Clause](select-clause.html)
- [`CREATE TABLE`](create-table.html)
- [`CREATE VIEW`](create-view.html)
- [`INSERT`](insert.html)
- [`DROP TABLE`](drop-table.html)
- [Other SQL Statements](sql-statements.html)
- [`ALTER PRIMARY KEY`](alter-primary-key.html)
- [`ALTER TABLE`](alter-table.html)
