---
title: pg_catalog
summary: The pg_catalog schema contains read-only views that you can use for introspection into your database.
toc: true
---

For PostgreSQL compatibility, CockroachDB includes a [system catalog schema](system-catalogs.html) called `pg_catalog`. The tables in the `pg_catalog` schema roughly correspond to the [system catalogs in PostgreSQL](https://www.postgresql.org/docs/13/catalogs.html). `pg_catalog` tables are read-only.

## Data exposed by `pg_catalog`

The tables in CockroachDB's `pg_catalog` schema correspond to a subset of the virtual tables and views that make up the PostgreSQL system catalogs. Not all PostgreSQL system catalogs have a corresponding table in `pg_catalog`, and some of the `pg_catalog` tables are empty. See the following table for a detailed comparison between PostgreSQL 13 system catalogs and `pg_catalog` tables.

PostgreSQL 13 system catalog | `pg_catalog` table  
-----------------------------|--------------
`pg_aggregate` | `pg_aggregate`
`pg_am` | `pg_am`
`pg_amop` | `pg_amop` (empty)
`pg_amproc` | `pg_amproc` (empty)
`pg_attrdef` | `pg_attrdef`
`pg_attribute` | `pg_attribute`
`pg_auth_members` | `pg_auth_members`
`pg_authid` | `pg_authid`
`pg_available_extension_versions` | `pg_available_extension_versions` (empty)
`pg_available_extensions` | `pg_available_extensions`
`pg_cast` | `pg_cast`
`pg_class` | `pg_class`
`pg_collation` | `pg_collation`
`pg_config` | `pg_config` (empty)
`pg_constraint` | `pg_constraint`
`pg_conversion` | `pg_conversion`
`pg_cursors` | `pg_cursors` (empty)
`pg_database` | `pg_database`
`pg_db_role_setting` | `pg_db_role_setting` (empty)
`pg_default_acl` | `pg_default_acl`
`pg_depend` | `pg_depend`
`pg_description` | `pg_description`
`pg_enum` | `pg_enum`
`pg_event_trigger` | `pg_event_trigger`
`pg_extension` | `pg_extension`
`pg_file_settings` | `pg_file_settings` (empty)
`pg_foreign_data_wrapper` | `pg_foreign_data_wrapper`
`pg_foreign_server` | `pg_foreign_server`
`pg_foreign_table` | `pg_foreign_table`
`pg_group` | `pg_group` (empty)
`pg_hba_file_rules` | `pg_hba_file_rules` (empty)
`pg_index` | `pg_index`
`pg_indexes` | `pg_indexes`
`pg_inherits` | `pg_inherits`
`pg_init_privs` | None
`pg_language` | `pg_language` (empty)
`pg_largeobject` | `pg_largeobject` (empty)
`pg_largeobject_metadata` | None
`pg_locks` | `pg_locks`
`pg_matviews` | `pg_matviews`
`pg_namespace` | `pg_namespace`
`pg_opclass` | `pg_opclass` (empty)
`pg_operator` | `pg_operator`
`pg_opfamily` | `pg_opfamily` (empty)
`pg_partitioned_table` | None
`pg_policies` | `pg_policies` (empty)
`pg_policy` | None
`pg_prepared_statements` | `pg_prepared_statements` (empty)
`pg_prepared_xacts` | `pg_prepared_xacts` (empty)
`pg_proc` | `pg_proc`
`pg_publication` | `pg_publication` (empty)
`pg_publication_rel` | `pg_publication_rel` (empty)
`pg_publication_tables` | `pg_publication_tables` (empty)
`pg_range` | `pg_range`
`pg_replication_origin` | `pg_replication_origin` (empty)
`pg_replication_origin_status` | None
`pg_replication_slots` | None
`pg_rewrite` | `pg_rewrite`
`pg_roles` | `pg_roles`
`pg_rules` | `pg_rules` (empty)
`pg_seclabel` | `pg_seclabel`
`pg_seclabels` | `pg_seclabels`
`pg_sequence` | `pg_sequence`
`pg_sequences` | None
`pg_settings` | `pg_settings`
`pg_shadow` | `pg_shadow` (empty)
`pg_shdepend` | `pg_shdepend` (empty)
`pg_shdescription` | `pg_shdescription`
`pg_shmem_allocations` | `pg_shmem_allocations` (empty)
`pg_shseclabel` | `pg_shseclabel`
`pg_stat_activity` | `pg_stat_activity`
`pg_statistic` | None
`pg_statistic_ext` | `pg_statistic_ext` (empty)
`pg_statistic_ext_data` | None
`pg_stats` | None
`pg_stats_ext` | None
`pg_subscription` | `pg_subscription` (empty)
`pg_subscription_rel` | None
`pg_tables` | `pg_tables`
`pg_tablespace` | `pg_tablespace`
`pg_timezone_abbrevs` | `pg_timezone_abbrevs` (empty)
`pg_timezone_names` | `pg_timezone_names` (empty)
`pg_transform` | `pg_transform` (empty)
`pg_trigger` | `pg_trigger`
`pg_ts_config` | `pg_ts_config` (empty)
`pg_ts_config_map` | `pg_ts_config_map` (empty)
`pg_ts_dict` | `pg_ts_dict` (empty)
`pg_ts_parser` | `pg_ts_parser` (empty)
`pg_ts_template` | `pg_ts_template` (empty)
`pg_type` | `pg_type`
`pg_user` | `pg_user`
`pg_user_mapping` | `pg_user_mapping`
`pg_user_mappings` | `pg_user_mappings` (empty)
`pg_views` | `pg_views`

To list the tables in `pg_catalog` for the [current database](sql-name-resolution.html#current-database), use the following [`SHOW TABLES`](show-tables.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM pg_catalog;
~~~

~~~
  schema_name |       table_name        | type  | owner | estimated_row_count
--------------+-------------------------+-------+-------+----------------------
  pg_catalog  | pg_aggregate            | table | NULL  |                NULL
  pg_catalog  | pg_am                   | table | NULL  |                NULL
  ...
~~~

{{site.data.alerts.callout_info}}
To prohibit queries against empty tables, set the `stub_catalog_tables` [session variable](set-vars.html) to `off`.
{{site.data.alerts.end}}

## Query `pg_catalog` tables

You can run [`SELECT` queries](selection-queries.html) on the tables in `pg_catalog`.

{{site.data.alerts.callout_success}}
To ensure that you can view all of the tables in `pg_catalog`, query the tables as a user with [`admin` privileges](authorization.html#admin-role).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Unless specified otherwise, queries to `pg_catalog` assume the [current database](sql-name-resolution.html#current-database).
{{site.data.alerts.end}}

For example, to return the `pg_catalog` table with additional information about indexes in [`movr` database](movr.html), you can query the `pg_catalog.pg_indexes` table:

{% include_cached copy-clipboard.html %}
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
- [System Catalogs](system-catalogs.html)
