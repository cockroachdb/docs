---
title: crdb_internal
summary: The crdb_internal schema contains read-only views that you can use for introspection into your database's tables, columns, indexes, and views.
toc: true
---

CockroachDB provides a [virtual schema](virtual-schemas.html) called `crdb_internal` that contains information about CockroachDB internals related to a specific database or cluster. `crdb_internal` tables are read-only.

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
  range_id |     start_key     |         start_pretty          |      end_key      |          end_pretty           | database_name |         table_name         | index_name |  replicas   |                                                        replica_localities                                                        | learner_replicas | split_enforced_until | lease_holder | range_size
+----------+-------------------+-------------------------------+-------------------+-------------------------------+---------------+----------------------------+------------+-------------+----------------------------------------------------------------------------------------------------------------------------------+------------------+----------------------+--------------+------------+
         1 |                   | /Min                          | \004\000liveness- | /System/NodeLiveness          |               |                            |            | {1}         | {"region=us-east1,az=b"}                                                                                                         | {}               | NULL                 |            1 |      12174
         2 | \004\000liveness- | /System/NodeLiveness          | \004\000liveness. | /System/NodeLivenessMax       |               |                            |            | {1,2,4,5,8} | {"region=us-east1,az=b","region=us-east1,az=c","region=us-west1,az=a","region=us-west1,az=b","region=europe-west1,az=c"}         | {}               | NULL                 |            5 |        747
         3 | \004\000liveness. | /System/NodeLivenessMax       | \004tsd           | /System/tsd                   |               |                            |            | {2,3,4,5,8} | {"region=us-east1,az=c","region=us-east1,az=d","region=us-west1,az=a","region=us-west1,az=b","region=europe-west1,az=c"}         | {}               | NULL                 |            2 |     241720
         4 | \004tsd           | /System/tsd                   | \004tse           | /System/"tse"                 |               |                            |            | {1}         | {"region=us-east1,az=b"}                                                                                                         | {}               | NULL                 |            1 |     290601
         5 | \004tse           | /System/"tse"                 | \210              | /Table/SystemConfigSpan/Start |               |                            |            | {1}         | {"region=us-east1,az=b"}                                                                                                         | {}               | NULL                 |            1 |          0
         6 | \210              | /Table/SystemConfigSpan/Start | \223              | /Table/11                     |               |                            |            | {1}         | {"region=us-east1,az=b"}                                                                                                         | {}               | NULL                 |            1 |      45202
         7 | \223              | /Table/11                     | \224              | /Table/12                     | system        | lease                      |            | {2,6,7,8,9} | {"region=us-east1,az=c","region=us-west1,az=c","region=europe-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"} | {}               | NULL                 |            9 |       1467
         8 | \224              | /Table/12                     | \225              | /Table/13                     | system        | eventlog                   |            | {2,3,4,6,9} | {"region=us-east1,az=c","region=us-east1,az=d","region=us-west1,az=a","region=us-west1,az=c","region=europe-west1,az=d"}         | {}               | NULL                 |            2 |      20576
         9 | \225              | /Table/13                     | \226              | /Table/14                     | system        | rangelog                   |            | {3,5,6,7,9} | {"region=us-east1,az=d","region=us-west1,az=b","region=us-west1,az=c","region=europe-west1,az=b","region=europe-west1,az=d"}     | {}               | NULL                 |            5 |     127402
        10 | \226              | /Table/14                     | \227              | /Table/15                     | system        | ui                         |            | {1}         | {"region=us-east1,az=b"}                                                                                                         | {}               | NULL                 |            1 |          0
        11 | \227              | /Table/15                     | \230              | /Table/16                     | system        | jobs                       |            | {2,3,4,7,9} | {"region=us-east1,az=c","region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=b","region=europe-west1,az=d"}     | {}               | NULL                 |            3 |       5257
        12 | \230              | /Table/16                     | \231              | /Table/17                     |               |                            |            | {1}         | {"region=us-east1,az=b"}                                                                                                         | {}               | NULL                 |            1 |          0
        13 | \231              | /Table/17                     | \232              | /Table/18                     |               |                            |            | {1}         | {"region=us-east1,az=b"}                                                                                                         | {}               | NULL                 |            1 |          0
        14 | \232              | /Table/18                     | \233              | /Table/19                     |               |                            |            | {1}         | {"region=us-east1,az=b"}                                                                                                         | {}               | NULL                 |            1 |          0
        15 | \233              | /Table/19                     | \234              | /Table/20                     | system        | web_sessions               |            | {1,3,5,6,7} | {"region=us-east1,az=b","region=us-east1,az=d","region=us-west1,az=b","region=us-west1,az=c","region=europe-west1,az=b"}         | {}               | NULL                 |            7 |          0
        16 | \234              | /Table/20                     | \235              | /Table/21                     | system        | table_statistics           |            | {2,5,6,7,8} | {"region=us-east1,az=c","region=us-west1,az=b","region=us-west1,az=c","region=europe-west1,az=b","region=europe-west1,az=c"}     | {}               | NULL                 |            5 |          0
        17 | \235              | /Table/21                     | \236              | /Table/22                     | system        | locations                  |            | {3,4,5,8,9} | {"region=us-east1,az=d","region=us-west1,az=a","region=us-west1,az=b","region=europe-west1,az=c","region=europe-west1,az=d"}     | {}               | NULL                 |            8 |        326
        18 | \236              | /Table/22                     | \237              | /Table/23                     |               |                            |            | {1}         | {"region=us-east1,az=b"}                                                                                                         | {}               | NULL                 |            1 |          0
        19 | \237              | /Table/23                     | \240              | /Table/24                     | system        | role_members               |            | {1,3,4,5,8} | {"region=us-east1,az=b","region=us-east1,az=d","region=us-west1,az=a","region=us-west1,az=b","region=europe-west1,az=c"}         | {}               | NULL                 |            3 |        146
        20 | \240              | /Table/24                     | \275              | /Table/53                     | system        | comments                   |            | {2,5,6,7,9} | {"region=us-east1,az=c","region=us-west1,az=b","region=us-west1,az=c","region=europe-west1,az=b","region=europe-west1,az=d"}     | {}               | NULL                 |            2 |          0
        21 | \275              | /Table/53                     | \276              | /Table/54                     | movr          | users                      |            | {2,6,9}     | {"region=us-east1,az=c","region=us-west1,az=c","region=europe-west1,az=d"}                                                       | {}               | NULL                 |            6 |       5611
        22 | \276              | /Table/54                     | \277              | /Table/55                     | movr          | vehicles                   |            | {1,6,7}     | {"region=us-east1,az=b","region=us-west1,az=c","region=europe-west1,az=b"}                                                       | {}               | NULL                 |            6 |       3585
        23 | \277              | /Table/55                     | \300              | /Table/56                     | movr          | rides                      |            | {2,5,9}     | {"region=us-east1,az=c","region=us-west1,az=b","region=europe-west1,az=d"}                                                       | {}               | NULL                 |            5 |     176867
        24 | \300              | /Table/56                     | \301              | /Table/57                     | movr          | vehicle_location_histories |            | {3,6,9}     | {"region=us-east1,az=d","region=us-west1,az=c","region=europe-west1,az=d"}                                                       | {}               | NULL                 |            6 |      87799
        25 | \301              | /Table/57                     | \302              | /Table/58                     | movr          | promo_codes                |            | {3,4,7}     | {"region=us-east1,az=d","region=us-west1,az=a","region=europe-west1,az=b"}                                                       | {}               | NULL                 |            7 |     229083
        26 | \302              | /Table/58                     | \377\377          | /Max                          | movr          | user_promo_codes           |            | {1,4,8}     | {"region=us-east1,az=b","region=us-west1,az=a","region=europe-west1,az=c"}                                                       | {}               | NULL                 |            4 |         81
(26 rows)
~~~

## Tables in `crdb_internal`


For stability, we recommend that you use the public and programmable internal tables for scripting, testing, and other programmatic purposes over the standard CockroachDB [SQL statements](sql-statements.html).

`crdb_internal` includes the following tables:

Table | Description | Stability
-------|-------|-----
`backward_dependencies` | Contains information about backward dependencies. | Reserved  
`builtin_functions` | Contains information about supported [functions](functions-and-operators.html). | Reserved (use `pg_catalog.pg_proc`)
`cluster_queries` | Contains information about queries running on your cluster. | Public and programmable
`cluster_sessions` | Contains information about cluster sessions, including current and past queries. | See `node_sessions`
`cluster_settings` | Contains information about [cluster settings](cluster-settings.html). | Public and programmable
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

{{site.data.alerts.callout_danger}}
`crdb_internal` reflects the internals of CockroachDB and may thus change across CockroachDB versions. For a list of all tables currently stored in the `crdb_internal` schema, use the `SHOW TABLES FROM crdb_internal;` statement.
{{site.data.alerts.end}}

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
- [Logical Schemas and Namespaces](sql-name-resolution.html#logical-schemas-and-namespaces)
- [Virtual Schemas](virtual-schemas.html)
