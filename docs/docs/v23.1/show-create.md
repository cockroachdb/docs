---
title: SHOW CREATE
summary: The SHOW CREATE statement shows the CREATE statement for an existing database, function, table, view, or sequence.
toc: true
docs_area: reference.sql
---

The `SHOW CREATE` [statement](sql-statements.html) shows the `CREATE` statement for an existing [database](create-database.html), [function](create-function.html), [table](create-table.html), [view](create-view.html), or [sequence](create-sequence.html).

## Required privileges

The user must have any [privilege](security-reference/authorization.html#managing-privileges) on the target database, function, table, view, or sequence.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_create.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`object_name` | The name of the database, function, table, view, or sequence for which to show the `CREATE` statement.
`ALL TABLES` | Show the `CREATE` statements for all tables, views, and sequences in the current database.<br>This option is intended to provide the statements required to recreate the objects in the current database. As a result, `SHOW CREATE ALL TABLES` also returns the [`ALTER` statements](alter-table.html) that add, modify, and validate an object's [constraints](constraints.html). The `ALTER` statements follow the `CREATE` statements to guarantee that all objects are added before their references.
`ALL SCHEMAS` | Show the `CREATE` statements for all [schemas](create-schema.html) in the current database.
`ALL TYPES` | Show the `CREATE` statements for all [types](create-type.html) in the current database.

## Response

Field | Description
------|------------
`table_name` | The name of the table, view, or sequence.
`database_name` | The name of the database.
`function_name` | The name of the function.
`create_statement` | The `CREATE` statement for the database, function, table, view, or sequence.

## Example

{% include {{page.version.version}}/sql/movr-statements-nodes.md %}

### Show the `CREATE TABLE` statement for a table

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE drivers (
    id UUID NOT NULL,
    city STRING NOT NULL,
    name STRING,
    dl STRING UNIQUE,
    address STRING,
    CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC)
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE drivers;
~~~

~~~
  table_name |                     create_statement
-------------+-----------------------------------------------------------
  drivers    | CREATE TABLE public.drivers (
             |     id UUID NOT NULL,
             |     city STRING NOT NULL,
             |     name STRING NULL,
             |     dl STRING NULL,
             |     address STRING NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     UNIQUE INDEX drivers_dl_key (dl ASC)
             | )
(1 row)
~~~

To return just the `create_statement` value:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW CREATE TABLE drivers) SELECT create_statement FROM x;
~~~

~~~
                      create_statement
------------------------------------------------------------
  CREATE TABLE public.drivers (
      id UUID NOT NULL,
      city STRING NOT NULL,
      name STRING NULL,
      dl STRING NULL,
      address STRING NULL,
      CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
      UNIQUE INDEX drivers_dl_key (dl ASC)
  )
(1 row)
~~~

{{site.data.alerts.callout_info}}
`SHOW CREATE TABLE` also lists any partitions and zone configurations defined on primary and secondary indexes of a table. If partitions are defined, but no zones are configured, the `SHOW CREATE TABLE` output includes a warning.
{{site.data.alerts.end}}

### Show the `CREATE TABLE` statement for a table with a hidden column

If one or more columns is [`NOT VISIBLE`](create-table.html#not-visible-property) within a table, `SHOW CREATE` will display the `NOT VISIBLE` flag after those columns.

Start by setting the `credit_card` field to `NOT VISIBLE`:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE public.users ALTER COLUMN credit_card SET NOT VISIBLE;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
table_name   |                      create_statement
-------------+--------------------------------------------------------------
users        | CREATE TABLE public.users (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     name VARCHAR NULL,
             |     address VARCHAR NULL,
             |     credit_card VARCHAR NOT VISIBLE NULL,
             |     CONSTRAINT users_pkey PRIMARY KEY (city ASC, id ASC)
             | )
(1 row)
~~~

### Show the `CREATE VIEW` statement for a view

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE VIEW user_view (city, name) AS SELECT city, name FROM users;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE user_view;
~~~

~~~
  table_name |                                   create_statement
-------------+----------------------------------------------------------------------------------------
  user_view  | CREATE VIEW public.user_view (city, name) AS SELECT city, name FROM movr.public.users
(1 row)
~~~

To return just the `create_statement` value:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW CREATE VIEW user_view) SELECT create_statement FROM x;
~~~

~~~
                                    create_statement
-----------------------------------------------------------------------------------------
  CREATE VIEW public.user_view (city, name) AS SELECT city, name FROM movr.public.users
(1 row)
~~~

### Show just a view's `SELECT` statement

To get just a view's `SELECT` statement, you can query the `views` table in the built-in `information_schema` database and filter on the view name:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT view_definition
  FROM information_schema.views
  WHERE table_name = 'user_view';
~~~

~~~
              view_definition
--------------------------------------------
  SELECT city, name FROM movr.public.users
(1 row)
~~~

### Show the `CREATE SEQUENCE` statement for a sequence

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE desc_customer_list START -1 INCREMENT -2;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE desc_customer_list;
~~~

~~~
      table_name     |                                             create_statement
---------------------+------------------------------------------------------------------------------------------------------------
  desc_customer_list | CREATE SEQUENCE public.desc_customer_list MINVALUE -9223372036854775808 MAXVALUE -1 INCREMENT -2 START -1
(1 row)
~~~

To return just the `create_statement` value:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW CREATE desc_customer_list) SELECT create_statement FROM x;
~~~

~~~
                                              create_statement
-------------------------------------------------------------------------------------------------------------
  CREATE SEQUENCE public.desc_customer_list MINVALUE -9223372036854775808 MAXVALUE -1 INCREMENT -2 START -1
(1 row)
~~~

### Show the `CREATE TABLE` statement for a table with a comment

If you [add a comment](comment-on.html) on a table, `SHOW CREATE TABLE` will display the comment.

{% include_cached copy-clipboard.html %}
~~~ sql
> COMMENT ON TABLE users IS 'This table contains information about users.';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                                create_statement
-------------+----------------------------------------------------------------------------------
  users      | CREATE TABLE public.users (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     name VARCHAR NULL,
             |     address VARCHAR NULL,
             |     credit_card VARCHAR NULL,
             |     CONSTRAINT users_pkey PRIMARY KEY (city ASC, id ASC)
             | );
             | COMMENT ON TABLE public.users IS 'This table contains information about users.'
(1 row)
~~~

To return just the `create_statement` value:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW CREATE TABLE users) SELECT create_statement FROM x;
~~~

~~~
                                 create_statement
-----------------------------------------------------------------------------------
  CREATE TABLE public.users (
      id UUID NOT NULL,
      city VARCHAR NOT NULL,
      name VARCHAR NULL,
      address VARCHAR NULL,
      credit_card VARCHAR NULL,
      CONSTRAINT users_pkey PRIMARY KEY (city ASC, id ASC)
  );
  COMMENT ON TABLE public.users IS 'This table contains information about users.'
(1 row)
~~~

For more information, see [`COMMENT ON`](comment-on.html).

### Show the `CREATE TABLE` statement for a table with a multi-region locality

Use the `SHOW CREATE TABLE` command to view [multi-region-defined](multiregion-overview.html) table localities.

{% include enterprise-feature.md %}

To add the first region to the database, or to set an already-added region as the primary region, use a [`SET PRIMARY REGION`](alter-database.html#set-primary-region) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER DATABASE movr SET PRIMARY REGION "us-east";
~~~

~~~
ALTER DATABASE PRIMARY REGION


Time: 49ms total (execution 48ms / network 0ms)
~~~

All tables will be [`REGIONAL BY TABLE`](alter-table.html#regional-by-table) in `us-east` by default. Configure the `users` table to be [`REGIONAL BY ROW`](alter-table.html#regional-by-row) instead:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE users SET LOCALITY REGIONAL BY ROW;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                                                                      create_statement
-------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------
  users      | CREATE TABLE public.users (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     name VARCHAR NULL,
             |     address VARCHAR NULL,
             |     credit_card VARCHAR NULL,
             |     crdb_region public.crdb_internal_region NOT VISIBLE NOT NULL DEFAULT default_to_database_primary_region(gateway_region())::public.crdb_internal_region,
             |     CONSTRAINT users_pkey PRIMARY KEY (city ASC, id ASC)
             | ) LOCALITY REGIONAL BY ROW;
             | COMMENT ON TABLE public.users IS 'This table contains information about users.'
(1 row)
~~~

### Show the `CREATE FUNCTION` statement for a function

The following statement defines a function to return the number of rows in the `users` table.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE FUNCTION num_users() RETURNS INT AS 'SELECT count(*) from users' LANGUAGE SQL;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE FUNCTION num_users;
~~~

~~~
  function_name |              create_statement
----------------+----------------------------------------------
  num_users     | CREATE FUNCTION public.num_users()
                |     RETURNS INT8
                |     VOLATILE
                |     NOT LEAKPROOF
                |     CALLED ON NULL INPUT
                |     LANGUAGE SQL
                |     AS $$
                |     SELECT count(*) FROM movr.public.users;
                | $$
(1 row)
~~~

### Show the statements needed to recreate all tables, views, and sequences in the current database

To return the `CREATE` statements for all of the tables, views, and sequences in the current database, use `SHOW CREATE ALL TABLES`.

Note that this statement also returns the [`ALTER` statements](alter-table.html) that add, modify, and validate an object's [constraints](constraints.html).

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE ALL TABLES;
~~~

~~~
                                                                       create_statement
---------------------------------------------------------------------------------------------------------------------------------------------------------------
  CREATE TABLE public.users (
      id UUID NOT NULL,
      city VARCHAR NOT NULL,
      name VARCHAR NULL,
      address VARCHAR NULL,
      credit_card VARCHAR NULL,
      crdb_region public.crdb_internal_region NOT VISIBLE NOT NULL DEFAULT default_to_database_primary_region(gateway_region())::public.crdb_internal_region,
      CONSTRAINT users_pkey PRIMARY KEY (city ASC, id ASC)
  ) LOCALITY REGIONAL BY ROW;
  COMMENT ON TABLE public.users IS 'This table contains information about users.';
  CREATE TABLE public.vehicles (
      id UUID NOT NULL,
      city VARCHAR NOT NULL,
      type VARCHAR NULL,
      owner_id UUID NULL,
      creation_time TIMESTAMP NULL,
      status VARCHAR NULL,
      current_location VARCHAR NULL,
      ext JSONB NULL,
      CONSTRAINT vehicles_pkey PRIMARY KEY (city ASC, id ASC),
      INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC)
  ) LOCALITY REGIONAL BY TABLE IN PRIMARY REGION;
  CREATE TABLE public.rides (
      id UUID NOT NULL,
      city VARCHAR NOT NULL,
      vehicle_city VARCHAR NULL,
      rider_id UUID NULL,
      vehicle_id UUID NULL,
      start_address VARCHAR NULL,
      end_address VARCHAR NULL,
      start_time TIMESTAMP NULL,
      end_time TIMESTAMP NULL,
      revenue DECIMAL(10,2) NULL,
      CONSTRAINT rides_pkey PRIMARY KEY (city ASC, id ASC),
      INDEX rides_auto_index_fk_city_ref_users (city ASC, rider_id ASC),
      INDEX rides_auto_index_fk_vehicle_city_ref_vehicles (vehicle_city ASC, vehicle_id ASC),
      CONSTRAINT check_vehicle_city_city CHECK (vehicle_city = city)
  ) LOCALITY REGIONAL BY TABLE IN PRIMARY REGION;
  CREATE TABLE public.vehicle_location_histories (
      city VARCHAR NOT NULL,
      ride_id UUID NOT NULL,
      "timestamp" TIMESTAMP NOT NULL,
      lat FLOAT8 NULL,
      long FLOAT8 NULL,
      CONSTRAINT vehicle_location_histories_pkey PRIMARY KEY (city ASC, ride_id ASC, "timestamp" ASC)
  ) LOCALITY REGIONAL BY TABLE IN PRIMARY REGION;
  CREATE TABLE public.promo_codes (
      code VARCHAR NOT NULL,
      description VARCHAR NULL,
      creation_time TIMESTAMP NULL,
      expiration_time TIMESTAMP NULL,
      rules JSONB NULL,
      CONSTRAINT promo_codes_pkey PRIMARY KEY (code ASC)
  ) LOCALITY REGIONAL BY TABLE IN PRIMARY REGION;
  CREATE TABLE public.user_promo_codes (
      city VARCHAR NOT NULL,
      user_id UUID NOT NULL,
      code VARCHAR NOT NULL,
      "timestamp" TIMESTAMP NULL,
      usage_count INT8 NULL,
      CONSTRAINT user_promo_codes_pkey PRIMARY KEY (city ASC, user_id ASC, code ASC)
  ) LOCALITY REGIONAL BY TABLE IN PRIMARY REGION;
  CREATE TABLE public.drivers (
      id UUID NOT NULL,
      city STRING NOT NULL,
      name STRING NULL,
      dl STRING NULL,
      address STRING NULL,
      CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
      UNIQUE INDEX drivers_dl_key (dl ASC)
  ) LOCALITY REGIONAL BY TABLE IN PRIMARY REGION;
  CREATE VIEW public.user_view (city, name) AS SELECT city, name FROM movr.public.users;
  CREATE SEQUENCE public.desc_customer_list MINVALUE -9223372036854775808 MAXVALUE -1 INCREMENT -2 START -1;
  ALTER TABLE public.vehicles ADD CONSTRAINT fk_city_ref_users FOREIGN KEY (city, owner_id) REFERENCES public.users(city, id);
  ALTER TABLE public.rides ADD CONSTRAINT fk_city_ref_users FOREIGN KEY (city, rider_id) REFERENCES public.users(city, id);
  ALTER TABLE public.rides ADD CONSTRAINT fk_vehicle_city_ref_vehicles FOREIGN KEY (vehicle_city, vehicle_id) REFERENCES public.vehicles(city, id);
  ALTER TABLE public.vehicle_location_histories ADD CONSTRAINT fk_city_ref_rides FOREIGN KEY (city, ride_id) REFERENCES public.rides(city, id);
  ALTER TABLE public.user_promo_codes ADD CONSTRAINT fk_city_ref_users FOREIGN KEY (city, user_id) REFERENCES public.users(city, id);
  -- Validate foreign key constraints. These can fail if there was unvalidated data during the SHOW CREATE ALL TABLES
  ALTER TABLE public.vehicles VALIDATE CONSTRAINT fk_city_ref_users;
  ALTER TABLE public.rides VALIDATE CONSTRAINT fk_city_ref_users;
  ALTER TABLE public.rides VALIDATE CONSTRAINT fk_vehicle_city_ref_vehicles;
  ALTER TABLE public.vehicle_location_histories VALIDATE CONSTRAINT fk_city_ref_rides;
  ALTER TABLE public.user_promo_codes VALIDATE CONSTRAINT fk_city_ref_users;
(20 rows)
~~~

### Show the `CREATE DATABASE` statement for a database

To return the `CREATE DATABASE` statement for a database, use `SHOW CREATE DATABASE`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE DATABASE movr;
~~~

~~~
  database_name |   create_statement
----------------+-----------------------
  movr          | CREATE DATABASE movr
(1 row)
~~~

Suppose that you have a multi-region cluster, and you want to return the `SHOW CREATE DATABASE` statement for a [multi-region database](multiregion-overview.html).

In a new terminal, start a virtual multi-region demo cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo --global --nodes 9
~~~

In the SQL shell, [add regions to the database](alter-database.html#add-region):

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER DATABASE movr PRIMARY REGION "us-east1";
ALTER DATABASE movr ADD REGION "europe-west1";
ALTER DATABASE movr ADD REGION "us-west1";
~~~

The `SHOW CREATE DATABASE` output includes the database regions.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE DATABASE movr;
~~~

~~~
  database_name |                                                   create_statement
----------------+-----------------------------------------------------------------------------------------------------------------------
  movr          | CREATE DATABASE movr PRIMARY REGION "us-east1" REGIONS = "europe-west1", "us-east1", "us-west1" SURVIVE ZONE FAILURE
(1 row)
~~~

### Show the `CREATE SCHEMA` statement for all schemas within a database

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE ALL SCHEMAS;
~~~

~~~
    create_statement
-------------------------
  CREATE SCHEMA public;
(1 row)
~~~

## See also

- [`CREATE FUNCTION`](create-function.html)
- [`CREATE TABLE`](create-table.html)
- [`CREATE VIEW`](create-view.html)
- [`CREATE TABLE`](create-sequence.html)
- [Information Schema](information-schema.html)
- [SQL Statements](sql-statements.html)
