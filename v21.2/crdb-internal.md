---
title: crdb_internal
summary: The crdb_internal schema contains read-only views that you can use for introspection into CockroachDB internals.
toc: true
docs_area: 
---

The `crdb_internal` [system catalog](system-catalogs.html) is a schema that contains information about internal objects, processes, and metrics related to a specific database. `crdb_internal` tables are read-only.

<a id="data-exposed-by-crdb_internal"></a>

## Tables

{{site.data.alerts.callout_danger}}
Do not use the `crdb_internal` tables marked with ✗ in production environments for the following reasons:

- The contents of these tables are unstable, and subject to change in new releases of CockroachDB, without prior notice.
- There are memory and latency costs associated with each table in `crdb_internal`. Accessing the tables in the schema can impact cluster stability and performance.
{{site.data.alerts.end}}

To view the schema for a table supported in production, click the table name.

Table name | Description| Use in production
-----------|------------|-------------------
`active_range_feeds` | Contains information about [range feeds](architecture/distribution-layer.html) on nodes in your cluster. | ✗
`backward_dependencies` | Contains information about backward dependencies.| ✗
`builtin_functions` | Contains information about supported [functions](functions-and-operators.html).| ✗
`cluster_contended_indexes` | Contains information about [contended](performance-best-practices-overview.html#transaction-contention) indexes in your cluster.| ✗
[`cluster_contended_keys`](#cluster_contended_keys)  | Contains information about [contended](performance-best-practices-overview.html#transaction-contention) keys in your cluster.| ✓
[`cluster_contended_tables`](#cluster_contended_tables)  | Contains information about [contended](performance-best-practices-overview.html#transaction-contention) tables in your cluster.| ✓
[`cluster_contention_events`](#cluster_contention_events)  | Contains information about [contention](performance-best-practices-overview.html#transaction-contention) in your cluster.| ✓
`cluster_database_privileges` | Contains information about the [database privileges](authorization.html#privileges) on your cluster.| ✗
`cluster_distsql_flows` | Contains information about the flows of the [DistSQL execution](architecture/sql-layer.html#distsql) scheduled in your cluster.| ✗
`cluster_inflight_traces` | Contains information about in-flight [tracing](show-trace.html) in your cluster.| ✗
[`cluster_queries`](#cluster_queries) | Contains information about queries running on your cluster.| ✓
[`cluster_sessions`](#cluster_sessions) | Contains information about cluster sessions, including current and past queries.| ✓
`cluster_settings` | Contains information about [cluster settings](cluster-settings.html).| ✗
[`cluster_transactions`](#cluster_transactions) | Contains information about transactions running on your cluster.| ✓
`create_statements` | Contains information about tables and indexes in your database.| ✗
`create_type_statements` | <a name="create_type_statements"></a> Contains information about [user-defined types](enum.html) in your database.| ✗
`cross_db_references` | Contains information about objects that reference other objects, such as [foreign keys](foreign-key.html) or [views](views.html), across databases in your cluster.| ✗
`databases` | Contains information about the databases in your cluster.| ✗
`default_privileges` | Contains information about per-database default [privileges](authorization.html#privileges).| ✗
`feature_usage` | Contains information about feature usage on your cluster.| ✗
`forward_dependencies` | Contains information about forward dependencies.| ✗
`gossip_alerts` | Contains information about gossip alerts.| ✗
`gossip_liveness` | Contains information about your cluster's gossip liveness.| ✗
`gossip_network` | Contains information about your cluster's gossip network.| ✗
`gossip_nodes` | Contains information about nodes in your cluster's gossip network.| ✗
`index_columns` | Contains information about [indexed](indexes.html) columns in your cluster.| ✗
[`index_usage_statistics`](#index_usage_statistics) | Contains statistics about the primary and secondary indexes used in statements.| ✓
`interleaved` | Contains information about [interleaved objects](interleave-in-parent.html) in your cluster.| ✗
`invalid_objects` | Contains information about invalid objects in your cluster.| ✗
`jobs` | Contains information about [jobs](show-jobs.html) running on your cluster.| ✗
`kv_node_liveness` | Contains information about [node liveness](cluster-setup-troubleshooting.html#node-liveness-issues).| ✗
`kv_node_status` | Contains information about node status at the [key-value layer](architecture/storage-layer.html).| ✗
`kv_store_status` | Contains information about the key-value store for your cluster.| ✗
`leases` | Contains information about [leases](architecture/replication-layer.html#leases) in your cluster.| ✗
`lost_descriptors_with_data` | Contains information about table descriptors that have been deleted but still have data left over in storage.| ✗
`node_build_info` | Contains information about nodes in your cluster.| ✗
`node_contention_events` | Contains information about contention on the gateway node of your cluster.| ✗
`node_distsql_flows` | Contains information about the flows of the [DistSQL execution](architecture/sql-layer.html#distsql) scheduled on nodes in your cluster.| ✗
`node_inflight_trace_spans` | Contains information about currently in-flight spans in the current node.| ✗
`node_metrics` | Contains metrics for nodes in your cluster.| ✗
`node_queries` | Contains information about queries running on nodes in your cluster.| ✗
`node_runtime_info` | Contains runtime information about nodes in your cluster.| ✗
`node_sessions` | Contains information about sessions to nodes in your cluster.| ✗
`node_statement_statistics` | Contains statement statistics for nodes in your cluster.| ✗
`node_transaction_statistics` | Contains transaction statistics for nodes in your cluster.| ✗
`node_transactions` | Contains information about transactions for nodes in your cluster.| ✗
`node_txn_stats` | Contains transaction statistics for nodes in your cluster.| ✗
`partitions` | Contains information about [partitions](partitioning.html) in your cluster.| ✗
`predefined_comments` | Contains predefined comments about your cluster.| ✗
`ranges` | Contains information about ranges in your cluster.| ✗
`ranges_no_leases` | Contains information about ranges in your cluster, without leases.| ✗
`regions` | Contains information about [cluster regions](multiregion-overview.html#cluster-regions).| ✗
`schema_changes` | Contains information about schema changes in your cluster.| ✗
`session_trace` | Contains session trace information for your cluster.| ✗
`session_variables` | Contains information about [session variables](set-vars.html) in your cluster.| ✗
[`statement_statistics`](#statement_statistics) | Aggregates in-memory and persisted [statistics](ui-statements-page.html) from `system.statement_statistics` within hourly time intervals based on UTC time, rounded down to the nearest hour. You can manually reset the statistics by calling `SELECT crdb_internal.reset_sql_stats()`.| ✓
`table_columns` | Contains information about table columns in your cluster.| ✗
`table_indexes` | Contains information about table indexes in your cluster.| ✗
`table_row_statistics` | Contains row count statistics for tables in the current database.| ✗
`tables` | Contains information about tables in your cluster.| ✗
[`transaction_statistics`](#transaction_statistics) | Aggregates in-memory and persisted [statistics](ui-transactions-page.html) from `system.transaction_statistics` within hourly time intervals based on UTC time, rounded down to the nearest hour. You can manually reset the statistics by calling `SELECT crdb_internal.reset_sql_stats()`.| ✓
`zones` | Contains information about [zone configurations](configure-replication-zones.html) in your cluster.| ✗

## List `crdb_internal` tables

To list the `crdb_internal` tables for the [current database](sql-name-resolution.html#current-database), use the following [`SHOW TABLES`](show-tables.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM crdb_internal;
~~~

~~~
   schema_name  |         table_name          | type  | owner | estimated_row_count
----------------+-----------------------------+-------+-------+----------------------
  crdb_internal | backward_dependencies       | table | NULL  |                NULL
  crdb_internal | builtin_functions           | table | NULL  |                NULL
  ...
~~~

## Query `crdb_internal` tables

To get detailed information about objects, processes, or metrics related to your database, you can read from the `crdb_internal` table that corresponds to the item of interest.

{{site.data.alerts.callout_success}}
- To ensure that you can view all of the tables in `crdb_internal`, query the tables as a user with [`admin` privileges](authorization.html#admin-role).
- Unless specified otherwise, queries to `crdb_internal` assume the [current database](sql-name-resolution.html#current-database).
{{site.data.alerts.end}}

For example, to return the `crdb_internal` table for the index usage statistics of the [`movr`](movr.html) database, you can use the following statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM movr.crdb_internal.index_usage_statistics;
~~~

~~~
  table_id | index_id | total_reads |           last_read
-----------+----------+-------------+--------------------------------
        53 |        1 |       36792 | 2021-12-02 22:35:39.270713+00
        54 |        1 |       24527 | 2021-12-02 22:35:39.053428+00
        54 |        2 |      582120 | 2021-12-02 22:35:39.985883+00
        55 |        1 |      309194 | 2021-12-02 22:35:39.619138+00
        55 |        2 |           1 | 2021-12-02 00:28:26.176012+00
        55 |        3 |           1 | 2021-12-02 00:28:31.122689+00
        56 |        1 |           1 | 2021-12-02 00:28:32.074418+00
        57 |        1 |        6116 | 2021-12-02 22:34:50.446242+00
        58 |        1 |        3059 | 2021-12-02 22:34:50.447769+00
(9 rows)


Time: 9ms total (execution 8ms / network 0ms)
~~~

## Table schema

This section lists the schema for tables supported in production.

### `statement_statistics`

~~~sql
aggregated_ts TIMESTAMPTZ NOT NULL,
fingerprint_id BYTES NOT NULL,
transaction_fingerprint_id BYTES NOT NULL,
plan_hash BYTES NOT NULL,
app_name STRING NOT NULL,
metadata JSONB NOT NULL,
statistics JSONB NOT NULL,
sampled_plan JSONB NOT NULL,
aggregation_interval INTERVAL NOT NULL
~~~

### `transaction_statistics`

~~~sql
aggregated_ts TIMESTAMPTZ NOT NULL,
fingerprint_id BYTES NOT NULL,
app_name STRING NOT NULL,
metadata JSONB NOT NULL,
statistics JSONB NOT NULL,
aggregation_interval INTERVAL NOT NULL
~~~

### `index_usage_statistics`

~~~sql
table_id INT8 NOT NULL,
index_id INT8 NOT NULL,
total_reads INT8 NOT NULL,
last_read TIMESTAMPTZ NULL
~~~

### `cluster_contended_tables`

~~~sql
CREATE VIEW crdb_internal.cluster_contended_tables (database_name, schema_name, table_name, num_contention_events)
AS SELECT database_name, schema_name, name, sum(num_contention_events)
FROM (SELECT DISTINCT database_name, schema_name, name, index_id, num_contention_events FROM crdb_internal.cluster_contention_events JOIN crdb_internal.tables ON crdb_internal.cluster_contention_events.table_id = crdb_internal.tables.table_id)
GROUP BY database_name, schema_name, name
~~~

### `cluster_contended_keys`

~~~sql
CREATE VIEW crdb_internal.cluster_contended_keys (database_name, schema_name, table_name, index_name, key, num_contention_events)
AS SELECT database_name, schema_name, name, index_name, crdb_internal.pretty_key(key, 0), sum(count)
FROM crdb_internal.cluster_contention_events, crdb_internal.tables, crdb_internal.table_indexes
WHERE (crdb_internal.cluster_contention_events.index_id = crdb_internal.table_indexes.index_id) AND (crdb_internal.cluster_contention_events.table_id = crdb_internal.tables.table_id)
GROUP BY database_name, schema_name, name, index_name, key
~~~

### `cluster_contention_events`

~~~sql
table_id INT8 NULL,
index_id INT8 NULL,
num_contention_events INT8 NOT NULL,
cumulative_contention_time INTERVAL NOT NULL,
key BYTES NOT NULL,
txn_id UUID NOT NULL,
count INT8 NOT NULL
~~~

### `cluster_queries`

~~~sql
query_id STRING NULL,
txn_id UUID NULL,
node_id INT8 NOT NULL,
session_id STRING NULL,
user_name STRING NULL,
start TIMESTAMP NULL,
query STRING NULL,
client_address STRING NULL,
application_name STRING NULL,
distributed BOOL NULL,
phase STRING NULL
~~~

### `cluster_sessions`

~~~sql
node_id INT8 NOT NULL,
session_id STRING NULL,
user_name STRING NULL,
client_address STRING NULL,
application_name STRING NULL,
active_queries STRING NULL,
last_active_query STRING NULL,
session_start TIMESTAMP NULL,
oldest_query_start TIMESTAMP NULL,
kv_txn STRING NULL,
alloc_bytes INT8 NULL,
max_alloc_bytes INT8 NULL
~~~

### `cluster_transactions`

~~~sql
id UUID NULL,
node_id INT8 NULL,
session_id STRING NULL,
start TIMESTAMP NULL,
txn_string STRING NULL,
application_name STRING NULL,
num_stmts INT8 NULL,
num_retries INT8 NULL,
num_auto_retries INT8 NULL
~~~

## Examples

### View all open SQL sessions

{% include_cached copy-clipboard.html %}
~~~sql
SELECT * FROM crdb_internal.cluster_sessions;
~~~

### View all active transactions

{% include_cached copy-clipboard.html %}
~~~sql
SELECT * FROM crdb_internal.cluster_transactions;
~~~

### View historical transaction statistics per fingerprint

{% include_cached copy-clipboard.html %}
~~~sql
SELECT * FROM crdb_internal.transaction_statistics;
~~~

### View all active queries

{% include_cached copy-clipboard.html %}
~~~sql
SELECT * FROM crdb_internal.cluster_queries;
~~~

### View historical statement statistics and the sampled logical plan per fingerprint

{% include_cached copy-clipboard.html %}
~~~sql
 SELECT aggregated_ts,
   fingerprint_id,
   app_name,
   metadata -> 'query' AS statement_text,
   metadata -> 'stmtTyp' AS statement_type,
   metadata -> 'db' AS database_name,
   metadata -> 'distsql' AS is_distsql,
   metadata -> 'fullScan' AS has_full_scan,
   metadata -> 'vec' AS used_vec,
   statistics -> 'execution_statistics' -> 'contentionTime' -> 'mean' AS contention_time_mean,
   statistics -> 'statistics' -> 'cnt' AS execution_count,
   statistics -> 'statistics' -> 'firstAttemptCnt' AS number_first_attempts,
   statistics -> 'statistics' -> 'numRows' -> 'mean' AS number_rows_returned_mean,
   statistics -> 'statistics' -> 'rowsRead' -> 'mean' AS number_rows_read_mean,
   statistics -> 'statistics' -> 'runLat' -> 'mean' AS runtime_latecy_mean,
   sampled_plan
FROM crdb_internal.statement_statistics;
~~~


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
- [System Catalogs](system-catalogs.html)
