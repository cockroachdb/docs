---
title: pg_extension
summary: The pg_extension schema contains information about CockroachDB extensions.
toc: true
docs_area: reference.sql
---

The `pg_extension` [system catalogs](system-catalogs.html) provides information about CockroachDB extensions.

## Data exposed by `pg_extension`

In CockroachDB {{ page.version.version }}, `pg_extension` contains the following tables, all of which provide information about CockroachDB's [spatial extension](spatial-features.html):

- `geography_columns`
- `geometry_columns`
- `spatial_ref_sys`

{{site.data.alerts.callout_info}}
`pg_extension` tables are read-only.
{{site.data.alerts.end}}

To see the list of tables in `pg_extension` for the [current database](sql-name-resolution.html#current-database), use the following [`SHOW TABLES`](show-tables.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM pg_extension;
~~~

~~~
  schema_name  |    table_name     | type  | owner | estimated_row_count
---------------+-------------------+-------+-------+----------------------
  pg_extension | geography_columns | table | NULL  |                NULL
  pg_extension | geometry_columns  | table | NULL  |                NULL
  pg_extension | spatial_ref_sys   | table | NULL  |                NULL
(3 rows)
~~~

## Querying `pg_extension` tables

You can run [`SELECT` queries](selection-queries.html) on the tables in `pg_extension`.

{{site.data.alerts.callout_success}}
To ensure that you can view all of the tables in `pg_extension`, query the tables as a user with [`admin` privileges](security-reference/authorization.html#admin-role).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Unless specified otherwise, queries to `pg_extension` assume the [current database](sql-name-resolution.html#current-database).
{{site.data.alerts.end}}

For example, to return the `pg_extension` table with additional information about indexes in the `movr` database, you can query the `pg_extension.pg_indexes` table:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM movr.pg_extension.pg_indexes;
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
- [System Catalogs](system-catalogs.html)
