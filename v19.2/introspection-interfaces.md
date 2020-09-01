---
title: SQL introspection interfaces
summary: Which interfaces can be queried to inspect CockroachDB from SQL and forward compatibility guarantees.
toc: true
---

The SQL introspection interfaces are pre-defined tables and system
views that provide access to the current state of a CockroachDB
clusters, including the SQL metaschema and other configuration
settings.

CockroachDB provides the following introspection interfaces:

- The virtual [`information_schema`](information-schema.html) in each
  database. This is the **recommended** primary introspection facility
  provided by CockroachDB. This is modeled after [PostgreSQL's own
  `information_schema`](https://www.postgresql.org/docs/11/information-schema.html),
  with some CockroachDB-specific extensions.

- The virtual `crdb_internal` schema shared by all databases.  This is
  an advanced introspection facility that is partially public and
  programmable but also still contains reserved components. Users are
  advised to use the [section
  below](#programmability-and-forward-compatibility-for-crdb_internal)
  for details.

- The virtual `pg_catalog` schema in each database. This is provided
  primarily for compatibility with extant PostgreSQL clients and may
  contain less information than `information_schema`, or information
  that is more difficult to consume. Only partial compatibility with
  [PostgreSQL's own
  `pg_catalog`](https://www.postgresql.org/docs/11/catalogs.html) is
  provided.

- The [`SHOW` statements](sql-statements.html). These produce output
  derived from other sources and optimized for human consumption, may
  change between versions without notice, and should thus always be
  considered a [public and non-programmable] interface.

Meanwhile the pre-defined `system` database should be considered a
[reserved] interface and should not be used directly by clients.

Summary:

| Component                                                                                                | Status if feature documented on this site                                                    | Status if not documented on this site |
|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|---------------------------------------|
| Table and column schema of `information_schema`, when also present in PostgreSQL                         | [public and programmable]                                                                    | [public and programmable]             |
| Table and column schema of `information_schema`, when CockroachDB-specific                               | [public and programmable]                                                                    | [reserved]                            |
| Table and column schema of `pg_catalog`, when same as PostgreSQL                                         | [public and programmable]                                                                    | [public and programmable]             |
| Table and column schema of `pg_catalog`, when incomplete/missing compared to PostgreSQL                  | [public and programmable]                                                                    | [reserved]                            |
| Table and column schema of `crdb_internal`                                                               | [See section below](#programmability-and-forward-compatibility-for-crdb_internal)            | [reserved]                            |
| Cell contents of `pg_catalog` and `information_schema`, when populated similarly as PostgreSQL           | [public and programmable]                                                                    | [public and programmable]             |
| Cell contents of `pg_catalog` and `information_schema`, when absent or incomplete compared to PostgreSQL | [public and programmable] with  [“experimental” status](experimental-feature-lifecycle.html) | [reserved]                            |
| Cell contents of `crdb_internal`                                                                         | [See section below](#programmability-and-forward-compatibility-for-crdb_internal)            | [reserved]                            |
| Tables and cell contents in the `system` database/catalog                                                | [reserved]                                                                                   | [reserved]                            |

## Programmability and forward compatibility for `crdb_internal`

Note: for the following system tables, the reader is invited to refer
to the output of `SHOW TABLES FROM crdb_internal WITH COMMENT`. The
comments describe the purpose of each table and also provide an
indication of the expected cost of access. Some of these tables incur
a non-negligible load on the entire cluster upon access.

Note: any `crdb_internal` table not listed below should be considered
[reserved].

| Table                                     | Columns                                                                                                                                              | Status                                    |
|-------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------|
| `crdb_internal.backward_dependencies`     | all                                                                                                                                                  | [reserved]                                |
| `crdb_internal.builtin_functions`         | all                                                                                                                                                  | [reserved], use `pg_catalog.pg_proc`      |
| `crdb_internal.cluster_queries`           | all                                                                                                                                                  | [public and programmable]                 |
| `crdb_internal.cluster_sessions`          | -                                                                                                                                                    | same as `crdb_internal.node_sessions`     |
| `crdb_internal.cluster_settings`          | all                                                                                                                                                  | [public and programmable], see note below |
| `crdb_internal.create_statements`         | `database_name`, `schema_name`, `descriptor_id`, `descriptor_type`, `descriptor_name`, `create_statement`, `alter_statements`, `validate_statements` | [public and programmable]                 |
| `crdb_internal.create_statements`         | other columns                                                                                                                                        | [reserved]                                |
| `crdb_internal.feature_usage`             | all                                                                                                                                                  | [public and non-programmable]             |
| `crdb_internal.forward_dependencies`      | all                                                                                                                                                  | [reserved]                                |
| `crdb_internal.gossip_alerts`             | all                                                                                                                                                  | [reserved]                                |
| `crdb_internal.gossip_liveness`           | `node_id`, `draining`, `decommissioning`, `updated_at`                                                                                               | [public and programmable]                 |
| `crdb_internal.gossip_liveness`           | other columns                                                                                                                                        | [reserved]                                |
| `crdb_internal.gossip_network`            | all                                                                                                                                                  | [public and programmable]                 |
| `crdb_internal.gossip_nodes`              | `node_id`, `is_live`, `ranges`, `leases`                                                                                                             | [public and programmable]                 |
| `crdb_internal.gossip_nodes`              | other columns                                                                                                                                        | [reserved]                                |
| `crdb_internal.index_columns`             | all                                                                                                                                                  | [public and programmable]                 |
| `crdb_internal.jobs`                      | `job_id`, `job_type`, `description`, `statement`, `user_name`, `status`, `created`, `started`, `finished`, `fraction_completed`, `error`             | [public and programmable]                 |
| `crdb_internal.jobs`                      | other columns                                                                                                                                        | [reserved]                                |
| `crdb_internal.kv_node_status`            | `node_id`, `network`, `address`, `attrs`, `locality`, `server_version`, `tag`, `platform`, `distribution`, `type`, `started_at`                      | [public and programmable]                 |
| `crdb_internal.kv_node_status`            | other columns                                                                                                                                        | [reserved]                                |
| `crdb_internal.kv_store_status`           | `node_id`, `store_id`, `attrs`, `capacity`, `available`, `used`, `logical_bytes`, `range_count`, `lease_count`                                       | [public and programmable]                 |
| `crdb_internal.kv_store_status`           | other columns                                                                                                                                        | [reserved]                                |
| `crdb_internal.leases`                    | all                                                                                                                                                  | [reserved]                                |
| `crdb_internal.node_build_info`           | all                                                                                                                                                  | [public and programmable]                 |
| `crdb_internal.node_metrics`              | all                                                                                                                                                  | [reserved]                                |
| `crdb_internal.node_queries`              | all                                                                                                                                                  | [public and programmable]                 |
| `crdb_internal.node_runtime_info`         | all                                                                                                                                                  | [public and programmable]                 |
| `crdb_internal.node_sessions`             | `node_id`, `session_id`, `user_name`, `client_address`, `application_name`, `active_queries`,`last_active_query`, `session_start`                    | [public and programmable]                 |
| `crdb_internal.node_sessions`             | other columns                                                                                                                                        | [reserved]                                |
| `crdb_internal.node_statement_statistics` | all                                                                                                                                                  | [public and programmable]                 |
| `crdb_internal.node_txn_stats`            | all                                                                                                                                                  | [public and programmable]                 |
| `crdb_internal.partitions`                | all                                                                                                                                                  | [reserved]                                |
| `crdb_internal.predefined_comments`       | all                                                                                                                                                  | [reserved]                                |
| `crdb_internal.ranges_no_leases`          | -                                                                                                                                                    | same as `crdb_internal.ranges`            |
| `crdb_internal.ranges`                    | `range_id`, `start_key`, `end_key`, `database_name`, `table_name`, `index_name`, `replicas`, `lease_holder`                                          | [public and programmable]                 |
| `crdb_internal.ranges`                    | `start_pretty`, `end_pretty`                                                                                                                         | [public and non-programmable]             |
| `crdb_internal.ranges`                    | other columnns                                                                                                                                       | [reserved]                                |
| `crdb_internal.schema_changes`            | all                                                                                                                                                  | [reserved]                                |
| `crdb_internal.session_trace`             | all                                                                                                                                                  | [reserved]                                |
| `crdb_internal.session_variables`         | all                                                                                                                                                  | [public and programmable], see note below |
| `crdb_internal.table_columns`             | all                                                                                                                                                  | [public and programmable]                 |
| `crdb_internal.table_indexes`             | all                                                                                                                                                  | [public and programmable]                 |
| `crdb_internal.tables`                    | `table_id`, `name`, `database_name`, `schema_name`                                                                                                   | [public and programmable]                 |
| `crdb_internal.tables`                    | other columns                                                                                                                                        | [reserved]                                |
| `crdb_internal.zones`                     | `zone_id`, `zone_name`, `config_sql`                                                                                                                 | [public and programmable]                 |
| `crdb_internal.zones`                     | other columns                                                                                                                                        | [reserved]                                |

Note on `crdb_internal.cluster_settings`: See also [Programmability and forward compatibility guarantees for cluster settings](programmability-of-other-interfaces.html#cluster-settings).

Note on `crdb_itnernal.session_variables`: See also [Programmability and forward compatibility guarantees for SQL session variables](programmability-of-session-variables.html).

## See also

- [`information_schema`](information-schema.html)
- [Interface types](interface-types.html)
- [Compatibility and programmability guarantees](compatibility-and-programmability-guarantees.html)
- [Experimental feature lifecycle](experimental-feature-lifecycle.html)
- [Overview of APIs and interfaces](overview-of-apis-and-interfaces.html)

[public and programmable]: interface-types.html#public-and-programmable-interfaces
[public and non-programmable]: interface-types.html#public-and-non-programmable-interfaces
[reserved]: interface-types.html#reserved-interfaces
