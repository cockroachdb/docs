---
title: pg_catalog
summary: The pg_catalog schema contains read-only views that you can use for introspection into your database's tables, columns, indexes, and views.
toc: true
---

For PostgreSQL compatibility, CockroachDB provides a [virtual schema](virtual-schemas.html) called `pg_catalog`. The read-only tables in the `pg_catalog` schema roughly correspond to the [system catalogs in PostgreSQL](https://www.postgresql.org/docs/10/catalogs-overview.html).

{{site.data.alerts.callout_info}}
To ensure that you can view all of the tables in `pg_catalog`, query the tables as a user with [`admin` privileges](authorization.html#admin-role).
{{site.data.alerts.end}}

## Data exposed by `pg_catalog`

As stated above, the tables in `pg_catalog` roughly correspond to the PostgreSQL system catalogs. However, not all PostgreSQL system catalogs have a corresponding table in `pg_catalog`, and not all `pg_catalog` tables correspond to a PostgreSQL system catalog.

To see the list of tables in `pg_catalog`, use the following [`SHOW TABLES`](show-tables.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM SCHEMA pg_catalog;
~~~

~~~
  schema_name |       table_name        | type  | owner | estimated_row_count
--------------+-------------------------+-------+-------+----------------------
  pg_catalog  | pg_aggregate            | table | NULL  |                NULL
  pg_catalog  | pg_am                   | table | NULL  |                NULL
  pg_catalog  | pg_attrdef              | table | NULL  |                NULL
  pg_catalog  | pg_attribute            | table | NULL  |                NULL
  ...
~~~

{{site.data.alerts.callout_info}}
Unless specified otherwise, queries to `pg_catalog` assume the [current database](sql-name-resolution.html#current-database).
{{site.data.alerts.end}}

The `pg_catalog` tables with no corresponding PostgreSQL system catalog offer additional information about the objects in a database.

For example, if the current database is set as [`movr`](movr.html), to return the `pg_catalog` table with additional information about indexes in `movr` database, you can query the `pg_catalog.pg_indexes` table:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM movr.pg_catalog.pg_indexes;
~~~

~~~
   crdb_oid  | schemaname |         tablename          |                   indexname                   | tablespace |                                                            indexdef
-------------+------------+----------------------------+-----------------------------------------------+------------+---------------------------------------------------------------------------------------------------------------------------------
  2055313241 | public     | users                      | primary                                       | NULL       | CREATE UNIQUE INDEX "primary" ON movr.public.users USING btree (city ASC, id ASC)
  1795576970 | public     | vehicles                   | primary                                       | NULL       | CREATE UNIQUE INDEX "primary" ON movr.public.vehicles USING btree (city ASC, id ASC)
  1795576969 | public     | vehicles                   | vehicles_auto_index_fk_city_ref_users         | NULL       | CREATE INDEX vehicles_auto_index_fk_city_ref_users ON movr.public.vehicles USING btree (city ASC, owner_id ASC)
   450499963 | public     | rides                      | primary                                       | NULL       | CREATE UNIQUE INDEX "primary" ON movr.public.rides USING btree (city ASC, id ASC)
   450499960 | public     | rides                      | rides_auto_index_fk_city_ref_users            | NULL       | CREATE INDEX rides_auto_index_fk_city_ref_users ON movr.public.rides USING btree (city ASC, rider_id ASC)
   450499961 | public     | rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles | NULL       | CREATE INDEX rides_auto_index_fk_vehicle_city_ref_vehicles ON movr.public.rides USING btree (vehicle_city ASC, vehicle_id ASC)
  2315049508 | public     | vehicle_location_histories | primary                                       | NULL       | CREATE UNIQUE INDEX "primary" ON movr.public.vehicle_location_histories USING btree (city ASC, ride_id ASC, "timestamp" ASC)
   969972501 | public     | promo_codes                | primary                                       | NULL       | CREATE UNIQUE INDEX "primary" ON movr.public.promo_codes USING btree (code ASC)
   710236230 | public     | user_promo_codes           | primary                                       | NULL       | CREATE UNIQUE INDEX "primary" ON movr.public.user_promo_codes USING btree (city ASC, user_id ASC, code ASC)
(9 rows)
~~~

## See also

- [`SHOW`](show-vars.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SHOW SCHEMAS`](show-schemas.html)
- [`SHOW TABLES`](show-tables.html)
- [SQL Name Resolution](sql-name-resolution.html)
- [Virtual Schemas](virtual-schemas.html)
