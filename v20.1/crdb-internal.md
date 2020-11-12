---
title: crdb_internal
summary: The crdb_internal schema contains read-only views that you can use for introspection into your database's tables, columns, indexes, and views.
toc: true
---

CockroachDB provides a [virtual schema](virtual-schemas.html) called `crdb_internal` that contains information about CockroachDB internals related to a specific cluster. `crdb_internal` tables are read-only.

{{site.data.alerts.callout_info}}
The `crdb_internal` views typically represent objects that the current user has privilege to access. To ensure you can view all the objects in a database, access it as the `root` user.
{{site.data.alerts.end}}

## Data exposed by `crdb_internal`

To perform introspection on objects related to your database, you can read from the `crdb_internal` table that corresponds to the object of interest. For example, to get information about the status of long-running [jobs](show-jobs.html) on your cluster, you can query the `crdb_internal.jobs` table, which includes detailed information about all jobs running on your cluster. Similarly, to get information about [table partitions](partitioning.html), you would query the `crdb_internal.partitions` table, or for [zone constraints](configure-replication-zones.html), the `crdb_internal.zones` table.

Unless specified otherwise, queries to `crdb_internal` assume the [current database](sql-name-resolution.html#current-database). For example, if the current database is set as [`movr`](movr.html), to return the `crdb_internal` table for the ranges of the `movr` database, you can use the following statement:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM crdb_internal.ranges;
~~~
~~~
  range_id |                                                                         start_key                                                                          |                                        start_pretty                                         |                                                                          end_key                                                                           |                                         end_pretty                                          | database_name |           table_name            | index_name | replicas |    replica_localities    | learner_replicas |       split_enforced_until       | lease_holder | range_size
-----------+------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------------+---------------+---------------------------------+------------+----------+--------------------------+------------------+----------------------------------+--------------+-------------
         1 |                                                                                                                                                            | /Min                                                                                        | \004\000liveness-                                                                                                                                          | /System/NodeLiveness                                                                        |               |                                 |            | {1}      | {"region=us-east1,az=b"} | {}               | NULL                             |            1 |       8323
         2 | \004\000liveness-                                                                                                                                          | /System/NodeLiveness                                                                        | \004\000liveness.                                                                                                                                          | /System/NodeLivenessMax                                                                     |               |                                 |            | {1}      | {"region=us-east1,az=b"} | {}               | NULL                             |            1 |        118
         3 | \004\000liveness.                                                                                                                                          | /System/NodeLivenessMax                                                                     | \004tsd                                                                                                                                                    | /System/tsd                                                                                 |               |                                 |            | {1}      | {"region=us-east1,az=b"} | {}               | NULL                             |            1 |      29658
         4 | \004tsd                                                                                                                                                    | /System/tsd                                                                                 | \004tse                                                                                                                                                    | /System/"tse"                                                                               |               |                                 |            | {1}      | {"region=us-east1,az=b"} | {}               | NULL                             |            1 |      67586
...
(62 rows)
~~~

## Tables in `crdb_internal`

`crdb_internal` tables reflect the internals of CockroachDB. As such, the number of tables, and the contents of the tables, in `crdb_internal` can change across CockroachDB versions.

For stability guidance, we have assigned each table one of following levels of stability:

- **Public and programmable** tables are suitable for scripting, testing, and other programmatic purposes

- **Public and non-programmable** tables are suitable for end-user consumption, but are subject to change across major versions and should not be used for programmatic purposes.

- **Reserved** tables are intended for use by CockroachDB developers and are subject to change across minor versions. We do not recommend using reserved tables.

In CockroachDB {{ page.release_info.version }}, `crdb_internal` includes the following tables:

Table | Description | Stability
-------|-------|-----
`backward_dependencies` | Contains information about backward dependencies. | Reserved  
`builtin_functions` | Contains information about supported [functions](functions-and-operators.html). | Reserved (use `pg_catalog.pg_proc`)
`cluster_queries` | Contains information about queries running on your cluster. | Public and programmable
`cluster_sessions` | Contains information about cluster sessions, including current and past queries. | See `node_sessions`
`cluster_settings` | Contains information about [cluster settings](cluster-settings.html). | Public and programmable
`cluster_transactions` | Contains information about the transactions running on your cluster. | Public and programmable
`create_statements` | Contains information about tables and indexes in your database. | The following columns of this table are public and programmable:<br/>`database_name`, `schema_name`, `descriptor_id`, `descriptor_type`, `descriptor_name`, `create_statement`, `alter_statements`, `validate_statements`<br/>All other columns are reserved.
`feature_usage` | Contains information about feature usage on your cluster. | Public and non-programmable
`forward_dependencies` | Contains information about forward dependencies. | Reserved
`gossip_alerts` | Contains information about gossip alerts. | Reserved
`gossip_liveness` | Contains information about your cluster's gossip liveness. | The following columns of this table are public and programmable:<br/>`node_id`, `draining`, `decommissioning`, `updated_at`<br/>All other columns are reserved.
`feature_usage` | Contains information about feature usage on your cluster.
`gossip_network` | Contains information about your cluster's gossip network. | Reserved
`gossip_nodes` | Contains information about nodes in your cluster's gossip network. | The following columns of this table are public and programmable:<br/>`node_id`, `is_live`, `ranges`, `leases`<br/>All other columns are reserved.
`index_columns` | Contains information about indexed columns in your cluster. | Public and programmable
`jobs` | Contains information about [jobs](show-jobs.html) running on your cluster. | The following columns of this table are public and programmable:<br/>`job_id`, `job_type`, `description`, `statement`, `user_name`, `status`, `created`, `started`, `finished`, `fraction_completed`, `error`<br/>All other columns are reserved.
`kv_node_status` | Contains information about node status at the [key-value layer](architecture/storage-layer.html). | The following columns of this table are public and programmable:<br/>`node_id`, `network`, `address`, `attrs`, `locality`, `server_version`, `tag`, `platform`, `distribution`, `type`, `started_at`<br/>All other columns are reserved.
`kv_store_status` | Contains information about the key-value store for your cluster. | The following columns of this table are public and programmable:<br/>`node_id`, `store_id`, `attrs`, `capacity`, `available`, `used`, `logical_bytes`, `range_count`, `lease_count`<br/>All other columns are reserved.
`leases` | Contains information about [leases](architecture/replication-layer.html#leases) in your cluster. | Reserved
`node_build_info` | Contains information about nodes in your cluster. | Public and programmable
`node_metrics` | Contains metrics for nodes in your cluster. | Reserved
`node_queries` | Contains information about queries running on nodes in your cluster. | Public and programmable
`node_runtime_info` | Contains runtime information about nodes in your cluster. | Public and programmable
`node_sessions` | Contains information about sessions to nodes in your cluster. | The following columns of this table are public and programmable:<br/>`node_id`, `session_id`, `user_name`, `client_address`, `application_name`, `active_queries`,`last_active_query`, `session_start`<br/>All other columns are reserved.
`node_statement_statistics` | Contains statement statistics for nodes in your cluster. | Public and programmable
`node_transactions` | Contains information about the transactions running on nodes in your cluster. | Public and programmable
`node_txn_stats` | Contains transaction statistics for nodes in your cluster. | Public and programmable
`partitions` | Contains information about [partitions](partitioning.html) in your cluster. | Reserved
`predefined_comments` | Contains predefined comments about your cluster. | Reserved
`ranges` | Contains information about ranges in your cluster. | The following columns of this table are public and programmable:<br/>`range_id`, `start_key`, `end_key`, `database_name`, `table_name`, `index_name`, `replicas`, `lease_holder`<br/>The following columns are public and *non*-programmable:<br/>`start_pretty`, `end_pretty`<br/>All other columns are reserved.
`ranges_no_leases` | Contains information about ranges in your cluster, without leases. | See `ranges`
`schema_changes` | Contains information about schema changes in your cluster. | Reserved
`session_trace` | Contains session trace information for your cluster. | Reserved
`session_variables` | Contains information about [session variables](set-vars.html) in your cluster. | Public and programmable
`table_columns` | Contains information about table columns in your cluster. | Public and programmable
`table_indexes` | Contains information about table indexes in your cluster. | Public and programmable
`tables` | Contains information about tables in your cluster. | The following columns of this table are public and programmable:<br/>`table_id`, `name`, `database_name`, `schema_name`<br/>All other columns are reserved.
`zones` | Contains information about [zone configurations](configure-replication-zones.html) in your cluster. | The following columns of this table are public and programmable:<br/>`zone_id`, `zone_name`, `config_sql`<br/>All other columns are reserved.                   |

## See also

- [`SHOW`](show-vars.html)
- [`SHOW COLUMNS`](show-columns.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`SHOW CREATE`](show-create.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW INDEX`](show-index.html)
- [`SHOW SCHEMAS`](show-schemas.html)
- [`SHOW TABLES`](show-tables.html)
- [SQL Name Resolution](sql-name-resolution.html)
- [Virtual Schemas](virtual-schemas.html)
