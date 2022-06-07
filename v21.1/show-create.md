---
title: SHOW CREATE
summary: The SHOW CREATE statement shows the CREATE statement for an existing table, view, or sequence.
toc: true
---

The `SHOW CREATE` [statement](sql-statements.html) shows the `CREATE` statement for an existing [table](create-table.html), [view](create-view.html), or [sequence](create-sequence.html).

## Required privileges

The user must have any [privilege](authorization.html#assign-privileges) on the target table, view, or sequence.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/generated/diagrams/show_create.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`object_name` | The name of the table, view, or sequence for which to show the `CREATE` statement.
`ALL TABLES` | <span class="version-tag">New in v21.1:</span> Show the `CREATE` statements for all tables, views, and sequences in the current database.<br>This option is intended to provide the statements required to recreate the objects in the current database. As a result, `SHOW CREATE ALL TABLES` also returns the [`ALTER` statements](alter-table.html) that add, modify, and validate an object's [constraints](constraints.html). The `ALTER` statements follow the `CREATE` statements to guarantee that all objects are added before their references.

## Response

Field | Description
------|------------
`table_name` | The name of the table, view, or sequence.
`create_statement` | The `CREATE` statement for the table, view, or sequence.

## Example

{% include {{page.version.version}}/sql/movr-statements-nodes.md %}

### Show the `CREATE TABLE` statement for a table

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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
             |     UNIQUE INDEX drivers_dl_key (dl ASC),
             |     FAMILY "primary" (id, city, name, dl, address)
             | )
(1 row)
~~~

To return just the `create_statement` value:

{% include copy-clipboard.html %}
~~~ sql
> SELECT create_statement FROM [SHOW CREATE TABLE drivers];
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
      UNIQUE INDEX drivers_dl_key (dl ASC),
      FAMILY "primary" (id, city, name, dl, address)
  )
(1 row)
~~~

{{site.data.alerts.callout_info}}
`SHOW CREATE TABLE` also lists any partitions and zone configurations defined on primary and secondary indexes of a table. If partitions are defined, but no zones are configured, the `SHOW CREATE TABLE` output includes a warning.
{{site.data.alerts.end}}

### Show the `CREATE VIEW` statement for a view

{% include copy-clipboard.html %}
~~~ sql
> CREATE VIEW user_view (city, name) AS SELECT city, name FROM users;
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> SELECT create_statement FROM [SHOW CREATE VIEW user_view];
~~~

~~~
                                    create_statement
-----------------------------------------------------------------------------------------
  CREATE VIEW public.user_view (city, name) AS SELECT city, name FROM movr.public.users
(1 row)
~~~

### Show just a view's `SELECT` statement

To get just a view's `SELECT` statement, you can query the `views` table in the built-in `information_schema` database and filter on the view name:

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> CREATE SEQUENCE desc_customer_list START -1 INCREMENT -2;
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> SELECT create_statement FROM [SHOW CREATE desc_customer_list];
~~~

~~~
                                              create_statement
-------------------------------------------------------------------------------------------------------------
  CREATE SEQUENCE public.desc_customer_list MINVALUE -9223372036854775808 MAXVALUE -1 INCREMENT -2 START -1
(1 row)
~~~

### Show the `CREATE TABLE` statement for a table with a comment

If you [add a comment](comment-on.html) on a table, `SHOW CREATE TABLE` will display the comment.

{% include copy-clipboard.html %}
~~~ sql
> COMMENT ON TABLE users IS 'This table contains information about users.';
~~~

{% include copy-clipboard.html %}
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
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     FAMILY "primary" (id, city, name, address, credit_card)
             | );
             | COMMENT ON TABLE public.users IS 'This table contains information about users.'
(1 row)
~~~

To return just the `create_statement` value:

{% include copy-clipboard.html %}
~~~ sql
> SELECT create_statement FROM [SHOW CREATE TABLE users];
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
      CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
      FAMILY "primary" (id, city, name, address, credit_card)
  );
  COMMENT ON TABLE public.users IS 'This table contains information about users.'
(1 row)
~~~

For more information, see [`COMMENT ON`](comment-on.html).

### Show the `CREATE TABLE` statement for a table with a multi-region locality

{% include_cached new-in.html version="v21.1" %} Use the `SHOW CREATE TABLE` command to view [multi-region-defined](multiregion-overview.html) table localities.

{% include enterprise-feature.md %}

To add the first region to the database, or to set an already-added region as the primary region, use a [`SET PRIMARY REGION`](set-primary-region.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> ALTER DATABASE movr SET PRIMARY REGION "us-east";
~~~

~~~
ALTER DATABASE PRIMARY REGION


Time: 49ms total (execution 48ms / network 0ms)
~~~

All tables will be [`REGIONAL BY TABLE`](set-locality.html#regional-by-table) in `us-east` by default. To configure the `users` table to be [`REGIONAL BY ROW`](set-locality.html#regional-by-row) instead:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users SET LOCALITY REGIONAL BY ROW;
~~~

{% include copy-clipboard.html %}
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
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     FAMILY "primary" (id, city, name, address, credit_card, crdb_region)
             | ) LOCALITY REGIONAL BY ROW;
             | COMMENT ON TABLE public.users IS 'This table contains information about users.'
(1 row)
~~~

### Show the `CREATE` statement for a table created with `PARTITION ALL BY`

{% include enterprise-feature.md %}

In this example, we create the `vehicles3` table and an index on the `status` column. In that same statement, we also configure the partition scheme for both the table and the index. We then run `CREATE TABLE` to display the table and index definition:

{% include copy-clipboard.html %}
~~~ sql
> SET experimental_enable_implicit_column_partitioning = true;
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE vehicles3 (
        id UUID NOT NULL,
        city STRING NOT NULL,
        type STRING,
        owner_id UUID,
        creation_time TIMESTAMP,
        status STRING,
        current_location STRING,
        ext JSONB,
        CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
        INDEX index_status (status),
        FAMILY "primary" (id, city, type, owner_id, creation_time, status, current_location, ext)
)   PARTITION ALL BY RANGE (creation_time) (
    PARTITION archived VALUES FROM (MINVALUE) TO ('2021-12-31'),
    PARTITION current VALUES FROM ('2022-01-01') TO (MAXVALUE)
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE vehicles3;
~~~

~~~
  table_name |                                       create_statement
-------------+------------------------------------------------------------------------------------------------
  vehicles3  | CREATE TABLE public.vehicles3 (
             |     id UUID NOT NULL,
             |     city STRING NOT NULL,
             |     type STRING NULL,
             |     owner_id UUID NULL,
             |     creation_time TIMESTAMP NOT NULL,
             |     status STRING NULL,
             |     current_location STRING NULL,
             |     ext JSONB NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     INDEX index_status (status ASC),
             |     FAMILY "primary" (id, city, type, owner_id, creation_time, status, current_location, ext)
             | ) PARTITION ALL BY RANGE (creation_time) (
             |     PARTITION archived VALUES FROM (MINVALUE) TO ('2021-12-31 00:00:00'),
             |     PARTITION current VALUES FROM ('2022-01-01 00:00:00') TO (MAXVALUE)
             | )
(1 row)
~~~

Note that any column specified within the `PARTITION ALL BY` statement is marked as `NOT NULL`.

### Show the statements needed to recreate all tables, views, and sequences in the current database

{% include_cached new-in.html version="v21.1" %} To return the `CREATE` statements for all of the tables, views, and sequences in the current database, use `SHOW CREATE ALL TABLES`.

Note that this statement also returns the [`ALTER` statements](alter-table.html) that add, modify, and validate an object's [constraints](constraints.html).

{% include copy-clipboard.html %}
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
      CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
      FAMILY "primary" (id, city, name, address, credit_card, crdb_region)
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
      CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
      INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC),
      FAMILY "primary" (id, city, type, owner_id, creation_time, status, current_location, ext)
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
      CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
      INDEX rides_auto_index_fk_city_ref_users (city ASC, rider_id ASC),
      INDEX rides_auto_index_fk_vehicle_city_ref_vehicles (vehicle_city ASC, vehicle_id ASC),
      FAMILY "primary" (id, city, vehicle_city, rider_id, vehicle_id, start_address, end_address, start_time, end_time, revenue),
      CONSTRAINT check_vehicle_city_city CHECK (vehicle_city = city)
  ) LOCALITY REGIONAL BY TABLE IN PRIMARY REGION;
  CREATE TABLE public.vehicle_location_histories (
      city VARCHAR NOT NULL,
      ride_id UUID NOT NULL,
      "timestamp" TIMESTAMP NOT NULL,
      lat FLOAT8 NULL,
      long FLOAT8 NULL,
      CONSTRAINT "primary" PRIMARY KEY (city ASC, ride_id ASC, "timestamp" ASC),
      FAMILY "primary" (city, ride_id, "timestamp", lat, long)
  ) LOCALITY REGIONAL BY TABLE IN PRIMARY REGION;
  CREATE TABLE public.promo_codes (
      code VARCHAR NOT NULL,
      description VARCHAR NULL,
      creation_time TIMESTAMP NULL,
      expiration_time TIMESTAMP NULL,
      rules JSONB NULL,
      CONSTRAINT "primary" PRIMARY KEY (code ASC),
      FAMILY "primary" (code, description, creation_time, expiration_time, rules)
  ) LOCALITY REGIONAL BY TABLE IN PRIMARY REGION;
  CREATE TABLE public.user_promo_codes (
      city VARCHAR NOT NULL,
      user_id UUID NOT NULL,
      code VARCHAR NOT NULL,
      "timestamp" TIMESTAMP NULL,
      usage_count INT8 NULL,
      CONSTRAINT "primary" PRIMARY KEY (city ASC, user_id ASC, code ASC),
      FAMILY "primary" (city, user_id, code, "timestamp", usage_count)
  ) LOCALITY REGIONAL BY TABLE IN PRIMARY REGION;
  CREATE TABLE public.drivers (
      id UUID NOT NULL,
      city STRING NOT NULL,
      name STRING NULL,
      dl STRING NULL,
      address STRING NULL,
      CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
      UNIQUE INDEX drivers_dl_key (dl ASC),
      FAMILY "primary" (id, city, name, dl, address)
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

## See also

- [`CREATE TABLE`](create-table.html)
- [`CREATE VIEW`](create-view.html)
- [`CREATE TABLE`](create-sequence.html)
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
