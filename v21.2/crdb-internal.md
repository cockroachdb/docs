---
title: crdb_internal
summary: The crdb_internal schema contains read-only views that you can use for introspection into CockroachDB internals.
toc: true
docs_area: reference.sql
---

The `crdb_internal` [system catalog](system-catalogs.html) is a schema that contains information about internal objects, processes, and metrics related to a specific database. `crdb_internal` tables are read-only.

<a id="data-exposed-by-crdb_internal"></a>

## Tables

{{site.data.alerts.callout_danger}}
Do not use the `crdb_internal` tables marked with ✗ in production environments for the following reasons:

- The contents of these tables are unstable, and subject to change in new releases of CockroachDB, without prior notice.
- There are memory and latency costs associated with each table in `crdb_internal`. Accessing the tables in the schema can impact cluster stability and performance.
{{site.data.alerts.end}}

To view the schema and query examples for a table supported in production, click the table name.

Table name | Description| Use in production
-----------|------------|-------------------
`active_range_feeds` | Contains information about [range feeds](architecture/distribution-layer.html) on nodes in your cluster. | ✗
`backward_dependencies` | Contains information about backward dependencies.| ✗
`builtin_functions` | Contains information about supported [functions](functions-and-operators.html).| ✗
[`cluster_contended_indexes`](#cluster_contended_indexes) | Contains information about [contended](performance-best-practices-overview.html#transaction-contention) indexes in your cluster.| ✓
[`cluster_contended_keys`](#cluster_contended_keys)  | Contains information about [contended](performance-best-practices-overview.html#transaction-contention) keys in your cluster.| ✓
[`cluster_contended_tables`](#cluster_contended_tables)  | Contains information about [contended](performance-best-practices-overview.html#transaction-contention) tables in your cluster.| ✓
[`cluster_contention_events`](#cluster_contention_events)  | Contains information about [contention](performance-best-practices-overview.html#transaction-contention) in your cluster.| ✓
`cluster_database_privileges` | Contains information about the [database privileges](security-reference/authorization.html#privileges) on your cluster.| ✗
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
`default_privileges` | Contains information about per-database default [privileges](security-reference/authorization.html#privileges).| ✗
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
[`statement_statistics`](#statement_statistics) | Aggregates in-memory and persisted [statistics](ui-statements-page.html#statement-statistics) from `system.statement_statistics` within hourly time intervals based on UTC time, rounded down to the nearest hour. To reset the statistics call `SELECT crdb_internal.reset_sql_stats()`.| ✓
`table_columns` | Contains information about table columns in your cluster.| ✗
`table_indexes` | Contains information about table indexes in your cluster.| ✗
`table_row_statistics` | Contains row count statistics for tables in the current database.| ✗
`tables` | Contains information about tables in your cluster.| ✗
[`transaction_statistics`](#transaction_statistics) | Aggregates in-memory and persisted [statistics](ui-transactions-page.html#transaction-statistics) from `system.transaction_statistics` within hourly time intervals based on UTC time, rounded down to the nearest hour. To reset the statistics call `SELECT crdb_internal.reset_sql_stats()`.| ✓
`zones` | Contains information about [zone configurations](configure-replication-zones.html) in your cluster.| ✗


## List `crdb_internal` tables

To list the `crdb_internal` tables for the [current database](sql-name-resolution.html#current-database), use the following [`SHOW TABLES`](show-tables.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM crdb_internal;
~~~

~~~
   schema_name  |         table_name          | type  | owner | estimated_row_count | locality
----------------+-----------------------------+-------+-------+---------------------+-----------
  crdb_internal | active_range_feeds          | table | NULL  |                NULL | NULL
  crdb_internal | backward_dependencies       | table | NULL  |                NULL | NULL
  crdb_internal | builtin_functions           | table | NULL  |                NULL | NULL
  crdb_internal | cluster_contended_indexes   | view  | NULL  |                NULL | NULL
  crdb_internal | cluster_contended_keys      | view  | NULL  |                NULL | NULL
  crdb_internal | cluster_contended_tables    | view  | NULL  |                NULL | NULL
  crdb_internal | cluster_contention_events   | table | NULL  |                NULL | NULL
  crdb_internal | cluster_database_privileges | table | NULL  |                NULL | NULL
  crdb_internal | cluster_distsql_flows       | table | NULL  |                NULL | NULL
  crdb_internal | cluster_inflight_traces     | table | NULL  |                NULL | NULL
  ...
~~~

## Query `crdb_internal` tables

To get detailed information about objects, processes, or metrics related to your database, you can read from the `crdb_internal` table that corresponds to the item of interest.

{{site.data.alerts.callout_success}}
- To ensure that you can view all of the tables in `crdb_internal`, query the tables as a user with the [`admin` role](security-reference/authorization.html#admin-role).
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
~~~

## Table schema

This section provides the schema and examples for tables supported in production.

### `cluster_contended_indexes`

Column | Type | Description
------------|-----|------------
`database_name`  | `STRING`  | The name of the database experiencing contention.
`schema_name`  | `STRING`  | The name of the schema experiencing contention.
`table_name` | `STRING` | The name of the table experiencing contention.
`index_name` | `STRING` | The name of the index experiencing contention.
`num_contention_events` | `INT8` | The number of contention events.

#### Example

##### View all indexes that have experienced contention

~~~sql
SELECT * FROM movr.crdb_internal.cluster_contended_indexes;
~~~
~~~

  database_name | schema_name | table_name |              index_name               | num_contention_events
----------------+-------------+------------+---------------------------------------+------------------------
  movr          | public      | vehicles   | vehicles_auto_index_fk_city_ref_users |                     2
~~~

### `cluster_contended_keys`

Column | Type | Description
------------|-----|------------
`database_name`  | `STRING`  | The name of the database experiencing contention.
`schema_name`  | `STRING`  | The name of the schema experiencing contention.
`table_name` | `STRING` | The name of the table experiencing contention.
`index_name` | `STRING` | The name of the index experiencing contention.
`key` | `BYTES` | The key experiencing contention.
`num_contention_events` | `INT8` | The number of contention events.

#### Example

##### View all keys that have experienced contention

~~~sql
SELECT * FROM movr.crdb_internal.cluster_contended_keys;
~~~

~~~
  database_name | schema_name | table_name |              index_name               |                                                          key                                                           | num_contention_events
----------------+-------------+------------+---------------------------------------+------------------------------------------------------------------------------------------------------------------------+------------------------
  movr          | public      | vehicles   | vehicles_auto_index_fk_city_ref_users | /54/2/"amsterdam"/"\xb5~g\x0e,\x12@\x00\x80\x00\x00\x00\x00\x00\"\x9e"/"n\xe7\xc4\xc8P|J\xfc\x80\xc8\xe5\xf7X\xe2,="/0 |                     1
  movr          | public      | vehicles   | rides_auto_index_fk_city_ref_users    | /54/2/"amsterdam"/"\xb5~g\x0e,\x12@\x00\x80\x00\x00\x00\x00\x00\"\x9e"/"n\xe7\xc4\xc8P|J\xfc\x80\xc8\xe5\xf7X\xe2,="/0 |                     1
  movr          | public      | vehicles   | vehicles_auto_index_fk_city_ref_users | /54/2/"seattle"/"Cm\t\xec\xcf\xf0E\u008f\xab\x97\xfa+\x02\x03p"/"\xef/ӎ\xe9RGǄa\xee萖\x94\x16"/0                      |                     1
  movr          | public      | vehicles   | rides_auto_index_fk_city_ref_users    | /54/2/"seattle"/"Cm\t\xec\xcf\xf0E\u008f\xab\x97\xfa+\x02\x03p"/"\xef/ӎ\xe9RGǄa\xee萖\x94\x16"/0                      |                     1
  system        | public      | jobs       | primary                               | /15/1/717080975699410945/0                                                                                             |                     6
  system        | public      | jobs       | primary                               | /15/1/717080975812100097/0                                                                                             |                     6
~~~

### `cluster_contended_tables`

Column | Type | Description
------------|-----|------------
`database_name`  | `STRING`  | The name of the database experiencing contention.
`schema_name`  | `STRING`  | The name of the schema experiencing contention.
`table_name` | `STRING` | The name of the table experiencing contention.
`num_contention_events` | `INT8` | The number of contention events.

#### Example

##### View all tables that have experienced contention

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM movr.crdb_internal.cluster_contended_tables;
~~~
~~~
  database_name | schema_name | table_name | num_contention_events
----------------+-------------+------------+------------------------
  system        | public      | jobs       |                     4
~~~

### `cluster_contention_events`

Column | Type | Description
------------|-----|------------
`table_id`  | `INT8`  | Unique table identifier.
`index_id`  | `INT8`  | Unique index identifier.
`num_contention_events` | `INT8` | The number of contention events.
`cumulative_contention_time` | `INTERVAL` | The cumulative time that the transaction spends waiting in contention.
`key` | `BYTES` | The key experiencing contention.
`txn_id` | `UUID` | Unique transaction identifier.
`count` | `INT8` | The number of contention events.

#### Example

##### View all contention events

~~~sql
SELECT * FROM crdb_internal.cluster_contention_events;
~~~
~~~
  table_id | index_id | num_contention_events | cumulative_contention_time |                                                                          key                                                                           |                txn_id                | count
-----------+----------+-----------------------+----------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------+--------------------------------------+--------
        15 |        1 |                     3 | 00:00:00.013012            | \x97\x89\xfd\t\xf4}\xe3\xf5\xc0\x80\x01\x88                                                                                                            | 621bf72d-a5e6-439e-9eee-1646271cef1e |     1
        15 |        1 |                     3 | 00:00:00.013012            | \x97\x89\xfd\t\xf4}\xe3\xfb\x8c\x00\x01\x88                                                                                                            | e2e5cdd7-3112-4b78-ba15-7ce856ed55b2 |     1
        15 |        1 |                     3 | 00:00:00.013012            | \x97\x89\xfd\t\xf4\x7f`=\x80\x80\x01\x88                                                                                                               | 58a722f6-b7d8-4d1d-aefc-98394f85d283 |     1
        15 |        4 |                     1 | 00:00:00.003049            | \x97\x8c\x12&@\xdbFF\xedE\x19\x9f\x89\xb3@JS&\xe3\x00\x01\x12running\x00\x01\x14\xf9a\xb0\xe9\xef\xf9\t\x87\xcd\xd8\xfd\t\xf4}\xe3\xf5\xc0\x80\x01\x88 | 621bf72d-a5e6-439e-9eee-1646271cef1e |     1
~~~

### `cluster_queries`

Column | Type | Description
------------|-----|------------
`query_id` | `STRING` | Unique query identifier.
`txn_id` | `UUID` | Unique transaction identifier.
`node_id` | `INT8` | The ID of the node on which the query is executed.
`session_id` | `STRING` | Unique session identifier.
`user_name` | `STRING` | The name of the user that executed the query.
`start` | `TIMESTAMP` | The time that the query started.
`query` | `STRING` | The query string.
`client_address` | `STRING` | The address of the client that initiated the query.
`application_name` | `STRING` | The name of the application that initiated the query.
`distributed` | `BOOLEAN` | Whether the query is executing in a distributed cluster.
`phase` | `STRING` | The phase that the query is in.


#### Example

##### View all active queries

{% include_cached copy-clipboard.html %}
~~~sql
SELECT * FROM crdb_internal.cluster_queries;
~~~
~~~
              query_id             |                txn_id                | node_id |            session_id            | user_name |           start            |                    query                    | client_address  | application_name | distributed |   phase
-----------------------------------+--------------------------------------+---------+----------------------------------+-----------+----------------------------+---------------------------------------------+-----------------+------------------+-------------+------------
  16bed963d5b663a80000000000000001 | 7e36e3ed-128c-4b20-930e-695aa8266630 |       1 | 16bed77359b325f80000000000000001 | demo      | 2021-12-08 17:58:57.219848 | SELECT * FROM crdb_internal.cluster_queries | 127.0.0.1:56206 | $ cockroach demo |    false    | executing
~~~

### `cluster_sessions`

Column | Type | Description
------------|-----|------------
`node_id` | `INT8` | The ID of the node the session is connected to.
`session_id` | `STRING` | The ID of the session.
`user_name` | `STRING` | The name of the user that initiated the session.
`client_address` | `STRING` | The address of the client that initiated the session.
`application_name` | `STRING` | The name of the application that initiated the session.
`active_queries` | `STRING` | The SQL queries active in the session.
`last_active_query` | `STRING` | The most recently completed SQL query in the session.
`session_start` | `TIMESTAMP` | The timestamp at which the session started.
`oldest_query_start` | `TIMESTAMP` | The timestamp at which the oldest currently active SQL query in the session started.
`kv_txn` | `STRING` | The ID of the current key-value transaction for the session.
`alloc_bytes` | `INT8` | The number of bytes allocated by the session.
`max_alloc_bytes` | `INT8` | The maximum number of bytes allocated by the session.

#### Example

##### View all open SQL sessions

{% include_cached copy-clipboard.html %}
~~~sql
SELECT * FROM crdb_internal.cluster_sessions;
~~~
~~~
  node_id |            session_id            | user_name | client_address  | application_name |                active_queries                | last_active_query |       session_start        |    oldest_query_start     |                kv_txn                | alloc_bytes | max_alloc_bytes
----------+----------------------------------+-----------+-----------------+------------------+----------------------------------------------+-------------------+----------------------------+---------------------------+--------------------------------------+-------------+------------------
        1 | 16bed77359b325f80000000000000001 | demo      | 127.0.0.1:56206 | $ cockroach demo | SELECT * FROM crdb_internal.cluster_sessions | SHOW database     | 2021-12-08 17:23:24.835429 | 2021-12-08 18:01:54.23473 | 37da8b13-c476-4014-863b-527baa3120f9 |       10240 |        11519280
~~~

### `cluster_transactions`

Column | Type | Description
------------|-----|------------
`id` | `UUID` | The unique ID that identifies the transaction.
`node_id` | `INT8` | The ID of the node the transaction is connected to.
`session_id` | `STRING` | The ID of the session running the transaction.
`start` | `TIMESTAMP` | The time the transaction started.
`txn_string` | `STRING` | The transaction string.
`application_name` | `STRING` | The name of the application that ran the transaction.
`num_stmts` | `INT8` | The number of statements in the transaction.
`num_retries` | `INT8` | The number of times the transaction was retried.
`num_auto_retries` | `INT8` | The number of times the transaction was automatically retried.

#### Examples

##### View all active transactions

{% include_cached copy-clipboard.html %}
~~~sql
SELECT * FROM crdb_internal.cluster_transactions;
~~~
~~~
                   id                  | node_id |            session_id            |           start            |                                                                                                  txn_string                                                                                                   | application_name | num_stmts | num_retries | num_auto_retries
---------------------------------------+---------+----------------------------------+----------------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------------+-----------+-------------+-------------------
  d00d38d9-d1dd-4e15-a4d7-16d5b241d13a |       1 | 16bed77359b325f80000000000000001 | 2021-12-08 18:03:21.154766 | "sql txn" meta={id=d00d38d9 key=/Min pri=0.01545423 epo=0 ts=1638986601.154752000,0 min=1638986601.154752000,0 seq=0} lock=false stat=PENDING rts=1638986601.154752000,0 wto=false gul=1638986601.654752000,0 | $ cockroach demo |         1 |           0 |                0
~~~

### `index_usage_statistics`

Contains one row for each index in the current database surfacing usage statistics for that specific index. This view is updated every time a transaction is committed. Each user-submitted statement on the specified index is counted as a use of that index and increments corresponding counters in this view. System and internal queries (such as scans for gathering statistics) are not counted.

Column | Type | Description
------------|-----|------------
`table_id` | `INT8` | Unique table identifier.
`index_id` | `INT8` | Unique index identifier.
`total_reads` | `INT8` | Number of times an index was selected for a read.
`last_read` | `TIMESTAMPTZ` | Time of last read.

#### Examples

##### Are there any indexes that have become stale and are no longer needed? Which indexes haven't been used during the past week?

{% include_cached copy-clipboard.html %}
~~~sql
SELECT  ti.descriptor_name as table_name, ti.index_name, total_reads
FROM  crdb_internal.index_usage_statistics AS us
JOIN crdb_internal.table_indexes ti
ON us.index_id = ti.index_id AND us.table_id = ti.descriptor_id
WHERE last_read < NOW() - INTERVAL '1 WEEK'
ORDER BY total_reads desc;
~~~

##### Which indexes are infrequently used? Are there any unused indexes?

{% include_cached copy-clipboard.html %}
~~~sql
SELECT  ti.descriptor_name as table_name, ti.index_name, total_reads
FROM crdb_internal.index_usage_statistics AS us
JOIN crdb_internal.table_indexes ti
ON us.index_id = ti.index_id AND us.table_id = ti.descriptor_id
WHERE total_reads = 0;
~~~

### `statement_statistics`

Column | Type | Description
------------|-----|------------
`aggregated_ts` | `TIMESTAMPTZ NOT NULL` | The time that statistics aggregation started.
`fingerprint_id` | `BYTES NOT NULL` | Unique identifier of the statement statistics. This is constructed using the statement fingerprint text, and statement metadata (e.g., query type, database name, etc.)
`transaction_fingerprint_id` | `BYTES NOT NULL` | Uniquely identifies a transaction statistics. The transaction fingerprint ID that this statement statistic belongs to.
`plan_hash` | `BYTES NOT NULL` | Uniquely identifies a query plan that was executed by the current statement. The query plan can be retrieved from the `sampled_plan` column.
`app_name` | `STRING NOT NULL`| The name of the application that executed the statement.
`metadata` | `JSONB NOT NULL` | Metadata that describes the statement. See [`metadata` column](#metadata-column).
`statistics` | `JSONB NOT NULL` | Statistics for the statement. See [`statistics` column](#statistics-column).
`sampled_plan` | `JSONB NOT NULL` | The sampled query plan of the current statement statistics. This column is unfilled if there is no sampled query plan.
`aggregation_interval` | `INTERVAL NOT NULL` | The interval over which statistics are aggregated.

#### `metadata` column

Field | Type | Description
------------|-----|------------
`db` | `STRING` | The database on which the statement is executed.
`distsql` | `BOOLEAN` | Whether the statement is being executed by the Distributed SQL (DistSQL) engine.
`failed` | `BOOLEAN` | Whether the statement execution failed.
`fullScan` | `BOOLEAN` | Whether the statement performed a full scan of the table.
`implicitTxn` | `BOOLEAN` | Whether the statement executed in an implicit transaction.
`query` | `STRING` | The statement string.
`querySummary` | `STRING` | The statement string summary.
`stmtTyp` | `SQLType` | The type of statement: `TypeDDL`, `TypeDML`, `TypeDCL`, or `TypeTCL`.
`vec` | `BOOLEAN` | Whether the statement executed in the vectorized query engine.

#### `statistics` column

The [DB Console](ui-overview.html) [Statements](ui-statements-page.html) and [Statement Details](ui-statements-page.html#statement-details-page) pages display information from `statistics`.

The `statistics` column contains a JSONB object with `statistics` and `execution_statistics` subobjects. [`statistics`](ui-statements-page.html#statement-statistics) are always populated and are updated each time a new statement of that statement fingerprint is executed. [`execution_statistics`](ui-statements-page.html#execution-stats) are collected using sampling. CockroachDB probablistically runs a query with tracing enabled to collect fine-grained statistics of the query execution.

The `NumericStat` type tracks two running values: the running mean `mean` and the running sum of squared differences `sqDiff` from the mean. You can use these statistics along with the total number of values to compute the variance using Welford's method. CockroachDB computes the variance and displays it along with `mean` in the [Statements table](ui-statements-page.html#statements-table).

Field | Type | Description
------------|-----|------------
`execution_statistics -> cnt` | `INT64` | The number of times execution statistics were recorded.
<code>execution_statistics -> contentionTime -> [mean&#124;sqDiff]</code> | `NumericStat` | The time the statement spent contending for resources before being executed.
<code>execution_statistics -> maxDiskUsage -> [mean&#124;sqDiff]</code> | `NumericStat` | The maximum temporary disk usage that occurred while executing this statement. This is set in cases where a query had to spill to disk, e.g., when performing a large sort where not all of the tuples fit in memory.
<code>execution_statistics -> maxMemUsage -> [mean&#124;sqDiff]</code> | `NumericStat` | The maximum memory usage that occurred on a node.
<code>execution_statistics -> networkBytes -> [mean&#124;sqDiff]</code> | `NumericStat` | The number of bytes sent over the network.
<code>execution_statistics -> networkMsgs -> [mean&#124;sqDiff]</code> | `NumericStat` | The number of messages sent over the network.
<code>statistics -> bytesRead -> [mean&#124;sqDiff]</code> | `NumericStat` | The number of bytes read from disk.
`statistics -> cnt` | `INT8` | The total number of times this statement was executed since the begin of the aggregation period.
`statistics -> firstAttemptCnt` | `INT8` | The total number of times a first attempt was executed (either the one time in explicitly committed statements, or the first time in implicitly committed statements with implicit retries).
`statistics -> lastExecAt` | `TIMESTAMP` | The last timestamp the statement was executed.
`statistics -> maxRetries` | `INT8` | The maximum observed number of automatic retries in the aggregation period.
`statistics -> nodes` | Array of `INT64` | An ordered list of nodes IDs on which the statement was executed.
<code>statistics -> numRows -> [mean&#124;sqDiff]</code> | `NumericStat` | The number of rows returned or observed.
<code>statistics -> ovhLat -> [mean&#124;sqDiff]</code> | `NumericStat` | The difference between `svcLat` and the sum of `parseLat+planLat+runLat` latencies.
<code>statistics -> parseLat -> [mean&#124;sqDiff]</code> | `NumericStat` | The time to transform the SQL string into an abstract syntax tree (AST).
<code>statistics -> planLat -> [mean&#124;sqDiff]</code> | `NumericStat` | The time to transform the AST into a logical query plan.
<code>statistics -> rowsRead -> [mean&#124;sqDiff]</code> | `NumericStat` | The number of rows read from disk.
<code>statistics -> rowsWritten -> [mean&#124;sqDiff]</code> | `NumericStat` | The number of rows written to disk.
<code>statistics -> runLat -> [mean&#124;sqDiff]</code> | `NumericStat` | The time to run the query and fetch or compute the result rows.
<code>statistics -> svcLat -> [mean&#124;sqDiff]</code> | `NumericStat` | The time to service the query, from start of parse to end of execute.

#### View historical statement statistics and the sampled logical plan per fingerprint

This example command shows how to query the two most important JSON columns: `metadata` and `statistics`. It displays
the first 60 characters of query text, statement statistics, and sampled plan for DDL and DML statements for the [`movr`](movr.html) demo database:

{% include_cached copy-clipboard.html %}
~~~sql
SELECT substring(metadata ->> 'query',1,60) AS statement_text,
   metadata ->> 'stmtTyp' AS statement_type,
   metadata -> 'distsql' AS is_distsql,
   metadata -> 'fullScan' AS has_full_scan,
   metadata -> 'vec' AS used_vec,
   statistics -> 'execution_statistics' -> 'contentionTime' -> 'mean' AS contention_time_mean,
   statistics -> 'statistics' -> 'cnt' AS execution_count,
   statistics -> 'statistics' -> 'firstAttemptCnt' AS num_first_attempts,
   statistics -> 'statistics' -> 'numRows' -> 'mean' AS num_rows_returned_mean,
   statistics -> 'statistics' -> 'rowsRead' -> 'mean' AS num_rows_read_mean,
   statistics -> 'statistics' -> 'runLat' -> 'mean' AS runtime_latency_mean,
   jsonb_pretty(sampled_plan) AS sampled_plan
FROM movr.crdb_internal.statement_statistics
WHERE metadata @> '{"db":"movr"}' AND (metadata @> '{"stmtTyp":"TypeDDL"}' OR metadata @> '{"stmtTyp":"TypeDML"}') LIMIT 20;
~~~
~~~
                         statement_text                        | statement_type | is_distsql | has_full_scan | used_vec | contention_time_mean | execution_count | num_first_attempts | num_rows_returned_mean | num_rows_read_mean | runtime_latency_mean |                                                         sampled_plan
---------------------------------------------------------------+----------------+------------+---------------+----------+----------------------+-----------------+--------------------+------------------------+--------------------+----------------------+--------------------------------------------------------------------------------------------------------------------------------
  ALTER TABLE rides ADD FOREIGN KEY (city, rider_id) REFERENCE | TypeDDL        | false      | false         | true     |                    0 |               1 |                  1 |                      0 |                  0 |             0.007348 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "alter table"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  ALTER TABLE rides ADD FOREIGN KEY (vehicle_city, vehicle_id) | TypeDDL        | false      | false         | true     |                    0 |               1 |                  1 |                      0 |                  0 |             0.006618 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "alter table"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  ALTER TABLE rides SCATTER FROM ('_', '_') TO ('_', '_')      | TypeDML        | false      | false         | true     |                    0 |               8 |                  8 |                      1 |                  0 |           0.00066175 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "scatter"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  ALTER TABLE rides SPLIT AT VALUES ('_', '_')                 | TypeDML        | false      | false         | true     |                    0 |               8 |                  8 |                      1 |                  0 |          0.031441875 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |         {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |             "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |             "Name": "values",
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |             "Size": "2 columns, 1 row"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |         }
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     ],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "split"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  ALTER TABLE user_promo_codes ADD FOREIGN KEY (city, user_id) | TypeDDL        | false      | false         | true     |                    0 |               1 |                  1 |                      0 |                  0 |             0.008143 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "alter table"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  ALTER TABLE users SCATTER FROM ('_', '_') TO ('_', '_')      | TypeDML        | false      | false         | true     |                    0 |               8 |                  8 |                      1 |                  0 |             0.001272 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "scatter"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  ALTER TABLE users SPLIT AT VALUES ('_', '_')                 | TypeDML        | false      | false         | true     |                    0 |               8 |                  8 |                      1 |                  0 |          0.179651125 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |         {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |             "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |             "Name": "values",
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |             "Size": "2 columns, 1 row"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |         }
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     ],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "split"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  ALTER TABLE vehicle_location_histories ADD FOREIGN KEY (city | TypeDDL        | false      | false         | true     |                    0 |               1 |                  1 |                      0 |                  0 |             0.007684 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "alter table"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  ALTER TABLE vehicles ADD FOREIGN KEY (city, owner_id) REFERE | TypeDDL        | false      | false         | true     |                    0 |               1 |                  1 |                      0 |                  0 |             0.004085 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "alter table"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  ALTER TABLE vehicles SCATTER FROM ('_', '_') TO ('_', '_')   | TypeDML        | false      | false         | true     |                    0 |               8 |                  8 |                      1 |                  0 |             0.000702 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "scatter"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  ALTER TABLE vehicles SPLIT AT VALUES ('_', '_')              | TypeDML        | false      | false         | true     |                    0 |               8 |                  8 |                      1 |                  0 |          0.008966375 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |         {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |             "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |             "Name": "values",
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |             "Size": "2 columns, 1 row"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |         }
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     ],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "split"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  CREATE DATABASE movr                                         | TypeDDL        | false      | false         | true     |                    0 |               1 |                  1 |                      0 |                  0 |             0.001397 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "create database"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  CREATE TABLE IF NOT EXISTS promo_codes (code VARCHAR NOT NUL | TypeDDL        | false      | false         | true     |                    0 |               1 |                  1 |                      0 |                  0 |             0.001789 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "create table"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  CREATE TABLE IF NOT EXISTS rides (id UUID NOT NULL, city VAR | TypeDDL        | false      | false         | true     |                    0 |               1 |                  1 |                      0 |                  0 |             0.002374 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "create table"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  CREATE TABLE IF NOT EXISTS user_promo_codes (city VARCHAR NO | TypeDDL        | false      | false         | true     |                    0 |               1 |                  1 |                      0 |                  0 |             0.006318 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "create table"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  CREATE TABLE IF NOT EXISTS users (id UUID NOT NULL, city VAR | TypeDDL        | false      | false         | true     |                    0 |               1 |                  1 |                      0 |                  0 |             0.002014 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "create table"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  CREATE TABLE IF NOT EXISTS vehicle_location_histories (city  | TypeDDL        | false      | false         | true     |                    0 |               1 |                  1 |                      0 |                  0 |             0.001906 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "create table"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  CREATE TABLE IF NOT EXISTS vehicles (id UUID NOT NULL, city  | TypeDDL        | false      | false         | true     |                    0 |               1 |                  1 |                      0 |                  0 |             0.003346 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "create table"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  INSERT INTO promo_codes VALUES ($1, $2, __more3__), (__more9 | TypeDML        | false      | false         | true     |                    0 |             250 |                250 | 1E+3                   |                  0 | 0.010470284000000002 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Auto Commit": "",
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Into": "promo_codes(code, description, creation_time, expiration_time, rules)",
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "insert fast path",
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Size": "5 columns, 1000 rows"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }
  INSERT INTO rides VALUES ($1, $2, __more8__), (__more900__)  | TypeDML        | false      | false         | true     |                    0 |             125 |                125 | 1E+3                   |                  0 | 0.054189928000000005 | {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Auto Commit": "",
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Children": [
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |         {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |             "Children": [
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |                 {
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |                     "Children": [],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |                     "Name": "values",
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |                     "Size": "10 columns, 1000 rows"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |                 }
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |             ],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |             "Estimated Row Count": "1,000",
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |             "Name": "render"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |         }
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     ],
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Into": "rides(id, city, vehicle_city, rider_id, vehicle_id, start_address, end_address, start_time, end_time, revenue)",
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      |     "Name": "insert"
                                                               |                |            |               |          |                      |                 |                    |                        |                    |                      | }

~~~

### `transaction_statistics`

Column | Type | Description
------------|-----|------------
`aggregated_ts` | `TIMESTAMPTZ` | The time that statistics aggregation started.
`fingerprint_id` | `BYTES` | The ID of the transaction fingerprint.
`app_name` | `STRING`| The name of the application that executed the transaction.
`metadata` | `JSONB` | Metadata that describes the transaction. See [`metadata` column](#metadata-column).
`statistics` | `JSONB` | Statistics for the transaction. See [`statistics` column](#statistics-column).
`aggregation_interval` | `INTERVAL` | The interval of time over which statistics are aggregated.

#### View historical transaction statistics per fingerprint

This example command shows how to query the two most important JSON columns: `metadata` and `statistics`. It displays
the statistics for transactions on the [`movr`](movr.html) demo database:

{% include_cached copy-clipboard.html %}
~~~sql
SELECT
   metadata -> 'stmtFingerprintIDs' AS statement_fingerprint_id,
   statistics -> 'execution_statistics' -> 'cnt' AS execution_count,
   statistics -> 'execution_statistics' -> 'contentionTime' -> 'mean' AS contention_time_mean,
   statistics -> 'execution_statistics' -> 'maxDiskUsage'  -> 'mean' AS max_disk_usage_mean,
   statistics -> 'execution_statistics' -> 'maxMemUsage'  -> 'mean' AS max_mem_usage_mean,
   statistics -> 'execution_statistics' -> 'networkBytes' -> 'mean' AS num_ntwk_bytes_mean,
   statistics -> 'execution_statistics' -> 'networkMsgs' -> 'mean' AS num_ntwk_msgs_mean,
   statistics -> 'statistics' -> 'bytesRead' -> 'mean' AS bytes_read_mean,
   statistics -> 'statistics' -> 'cnt' AS count,
   statistics -> 'statistics' -> 'commitLat' -> 'mean' AS commit_lat_mean,
   statistics -> 'statistics' -> 'maxRetries' AS max_retries,
   statistics -> 'statistics' -> 'numRows'  -> 'mean' AS num_rows_mean,
   statistics -> 'statistics' -> 'retryLat' -> 'mean' AS retry_latency_mean,
   statistics -> 'statistics' -> 'rowsRead' -> 'mean' AS num_rows_read_mean,
   statistics -> 'statistics' -> 'rowsWritten' -> 'mean' AS num_rows_written_mean,
   statistics -> 'statistics' -> 'svcLat' -> 'mean' AS service_lat_mean
FROM crdb_internal.transaction_statistics WHERE app_name = 'movr' LIMIT 20;
~~~
~~~
  statement_fingerprint_id | execution_count | contention_time_mean | max_disk_usage_mean | max_mem_usage_mean | num_ntwk_bytes_mean | num_ntwk_msgs_mean |  bytes_read_mean   | count |     commit_lat_mean      | max_retries | num_rows_mean | retry_latency_mean | num_rows_read_mean | num_rows_written_mean |   service_lat_mean
---------------------------+-----------------+----------------------+---------------------+--------------------+---------------------+--------------------+--------------------+-------+--------------------------+-------------+---------------+--------------------+--------------------+-----------------------+------------------------
  ["ae6bf00068ea788b"]     |               7 |                    0 |                   0 | 2.048E+4           |                   0 |                  0 | 299.35812133072403 |   511 |   0.00000699021526418786 |           0 |             1 |                  0 | 1.9315068493150669 |                     0 | 0.0020743385518591003
  ["ae6bf00068ea788b"]     |               7 |                    0 |                   0 | 2.048E+4           |                   0 |                  0 | 300.61684210526295 |   475 |   0.00000655368421052631 |           0 |             1 |                  0 | 1.9389473684210534 |                     0 | 0.0019613578947368414
  ["bd6cff84f3c76319"]     |               6 |                    0 |                   0 | 2.048E+4           |                   0 |                  0 | 215.77310924369766 |   714 |  0.000008922969187675072 |           0 |             1 |                  0 | 1.9621848739495786 |                     0 |   0.00228533193277311
  ["bd6cff84f3c76319"]     |               7 |                    0 |                   0 | 2.048E+4           |                   0 |                  0 |  214.7635658914728 |   774 | 0.0000071511627906976775 |           0 |             1 |                  0 | 1.9547803617571062 |                     0 |  0.002103399224806201
  ["cfc8fc0503422c76"]     |               3 |                    0 |                   0 | 1.024E+4           |                   0 |                  0 |                  0 |   368 |    0.0013085163043478267 |           0 |             1 |                  0 |                  0 |                     1 |  0.001331747282608696
  ["cfc8fc0503422c76"]     |               4 |                    0 |                   0 | 1.024E+4           |                   0 |                  0 |                  0 |   361 |    0.0011630997229916886 |           0 |             1 |                  0 |                  0 |                     1 | 0.0019714072022160665
  ["dc9d9b4fcdd7511e"]     |               1 |                    0 |                   0 | 4.096E+4           |                 152 |                  3 |                  0 |   116 |  0.000006956896551724138 |           0 |             1 |                  0 |                  0 |                     0 | 0.0014110603448275855
  ["dc9d9b4fcdd7511e"]     |               1 |                    0 |                   0 | 4.096E+4           |                 152 |                  3 |                  0 |   126 |  0.000006730158730158729 |           0 |             1 |                  0 |                  0 |                     0 | 0.0013825634920634914
  ["22295b56d9b279f5"]     |               4 |                    0 |                   0 | 1.024E+4           |                   0 |                  0 |                  0 |   140 |  0.000007021428571428573 |           0 |             1 |                  0 |                  0 |                     1 | 0.0021642071428571432
  ["22295b56d9b279f5"]     |               0 |                    0 |                   0 |                  0 |                   0 |                  0 |                  0 |   116 |  0.000008215517241379309 |           0 |             1 |                  0 |                  0 |                     1 | 0.0021244137931034483
  ["051aca13769620d3"]     |               0 |                    0 |                   0 |                  0 |                   0 |                  0 |                  0 |    95 |    0.0012012000000000008 |           0 |             1 |                  0 |                  1 |                     1 |  0.002633694736842105
  ["051aca13769620d3"]     |               0 |                    0 |                   0 |                  0 |                   0 |                  0 |                  0 |    93 |     0.001323118279569892 |           0 |             1 |                  0 |                  1 |                     1 | 0.0024401720430107525
  ["1b8e962ebb4b2c5c"]     |               2 |                    0 |                   0 | 1.024E+4           |                   0 |                  0 |                  0 |   132 |    0.0011926818181818182 |           0 |             1 |                  0 |                  0 |                     1 | 0.0023831893939393945
  ["1b8e962ebb4b2c5c"]     |               0 |                    0 |                   0 |                  0 |                   0 |                  0 |                  0 |   110 |    0.0013019909090909092 |           0 |             1 |                  0 |                  0 |                     1 | 0.0026221727272727276
  ["15489d7704332101"]     |             125 |                    0 |                   0 | 5.12E+4            |                   0 |                  0 |                  0 | 12199 |    0.0014255228297401419 |           0 |             1 |                  0 |                  1 |                     1 |  0.004390958439216331
  ["15489d7704332101"]     |             114 |                    0 |                   0 | 5.12E+4            |                   0 |                  0 |                  0 | 12380 |    0.0014023091276251975 |           0 |             1 |                  0 |                  1 |                     1 |  0.004440339660743126
  ["1165541b8979eb40"]     |               1 |                    0 |                   0 | 3.072E+4           |                 208 |                  3 | 482.75193798449624 |   129 | 0.0000073410852713178325 |           0 |             1 |                  0 |  1.984496124031008 |                     0 |  0.002383465116279069
  ["1165541b8979eb40"]     |               1 |                    0 |                   0 | 2.048E+4           |                   0 |                  0 | 473.58394160583924 |   137 |  0.000006656934306569342 |           0 |             1 |                  0 | 1.9416058394160585 |                     0 |  0.001756532846715328
  ["485a374e9e1c11d0"]     |              11 |                    0 |                   0 | 1.024E+4           |                   0 |                  0 |                  0 |   480 |    0.0014361895833333342 |           0 |             1 |                  0 |                  0 |                     1 | 0.0027399666666666684
  ["485a374e9e1c11d0"]     |               9 |                    0 |                   0 | 1.024E+4           |                   0 |                  0 |                  0 |   465 |    0.0011626645161290328 |           0 |             1 |                  0 |                  0 |                     1 | 0.0026638344086021525
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
