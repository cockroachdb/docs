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
[`cluster_locks`](#cluster_locks) | Contains information about [locks](architecture/transaction-layer.html#concurrency-control) held by [transactions](transactions.html) on specific [keys](architecture/overview.html#architecture-range). | ✓
`cluster_database_privileges` | Contains information about the [database privileges](security-reference/authorization.html#privileges) on your cluster.| ✗
`cluster_execution_insights` | Contains information about SQL statement executions on your cluster.| ✗
`cluster_distsql_flows` | Contains information about the flows of the [DistSQL execution](architecture/sql-layer.html#distsql) scheduled in your cluster.| ✗
`cluster_inflight_traces` | Contains information about in-flight [tracing](show-trace.html) in your cluster.| ✗
[`cluster_queries`](#cluster_queries) | Contains information about queries running on your cluster.| ✓
[`cluster_sessions`](#cluster_sessions) | Contains information about cluster sessions, including current and past queries.| ✓
`cluster_settings` | Contains information about [cluster settings](cluster-settings.html).| ✗
[`cluster_transactions`](#cluster_transactions) | Contains information about transactions running on your cluster.| ✓
`create_statements` | Contains information about tables and indexes in your database.| ✗
`create_function_statements` | <a name="create_function_statements"></a> Contains information about [user-defined functions](user-defined-functions.html) in your database.| ✗
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
`invalid_objects` | Contains information about invalid objects in your cluster.| ✗
`jobs` | Contains information about [jobs](show-jobs.html) running on your cluster.| ✗
`kv_node_liveness` | Contains information about [node liveness](cluster-setup-troubleshooting.html#node-liveness-issues).| ✗
`kv_node_status` | Contains information about node status at the [key-value layer](architecture/storage-layer.html).| ✗
`kv_store_status` | Contains information about the key-value store for your cluster.| ✗
`leases` | Contains information about [leases](architecture/replication-layer.html#leases) in your cluster.| ✗
`lost_descriptors_with_data` | Contains information about table descriptors that have been deleted but still have data left over in storage.| ✗
`node_build_info` | Contains information about nodes in your cluster.| ✗
`node_contention_events`| Contains information about contention on the gateway node of your cluster.| ✗
`node_execution_insights` | Contains information about SQL statement executions on the gateway node of your cluster.| ✗
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
[`transaction_contention_events`](#transaction_contention_events)| Contains information about historical transaction contention events. | ✓
[`transaction_statistics`](#transaction_statistics) | Aggregates in-memory and persisted [statistics](ui-transactions-page.html#transaction-statistics) from `system.transaction_statistics` within hourly time intervals based on UTC time, rounded down to the nearest hour. To reset the statistics, call `SELECT crdb_internal.reset_sql_stats()`.| ✓
`zones` | Contains information about [zone configurations](configure-replication-zones.html) in your cluster.| ✗

## List `crdb_internal` tables

To list the `crdb_internal` tables for the [current database](sql-name-resolution.html#current-database), use the following [`SHOW TABLES`](show-tables.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM crdb_internal;
~~~

~~~
   schema_name  |         table_name              | type  | owner | estimated_row_count | locality
----------------+---------------------------------+-------+-------+---------------------+-----------
  crdb_internal | active_range_feeds              | table | NULL  |                NULL | NULL
  crdb_internal | backward_dependencies           | table | NULL  |                NULL | NULL
  crdb_internal | builtin_functions               | table | NULL  |                NULL | NULL
  crdb_internal | cluster_contended_indexes       | view  | NULL  |                NULL | NULL
  crdb_internal | cluster_contended_keys          | view  | NULL  |                NULL | NULL
  crdb_internal | cluster_contended_tables        | view  | NULL  |                NULL | NULL
  crdb_internal | cluster_contention_events       | table | NULL  |                NULL | NULL
  crdb_internal | cluster_database_privileges     | table | NULL  |                NULL | NULL
  crdb_internal | cluster_distsql_flows           | table | NULL  |                NULL | NULL
  crdb_internal | cluster_inflight_traces         | table | NULL  |                NULL | NULL
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

#### View all indexes that have experienced contention

{% include_cached copy-clipboard.html %}
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

#### View all keys that have experienced contention

{% include_cached copy-clipboard.html %}
~~~sql
SELECT table_name, index_name, key, num_contention_events FROM movr.crdb_internal.cluster_contended_keys where database_name = 'movr';
~~~

~~~
  table_name |              index_name               |                                                             key                                                             | num_contention_events
-------------+---------------------------------------+-----------------------------------------------------------------------------------------------------------------------------+------------------------
  vehicles   | vehicles_auto_index_fk_city_ref_users | /107/2/"amsterdam"/"\xe2\xc2\xdcJ$\xf3A\xa2\x98\xad.\xe6<Y\x05\xef"/"\x98\x05\xe1B\x82sE\x13\xba\xfe+,k\xd3\xc6\xd3"/0      |                     1
  vehicles   | vehicles_auto_index_fk_city_ref_users | /107/2/"seattle"/"v\xd4J%\x90\x1bF\v\x97\x02v\xc7\xee\xa9\xc7R"/"s\xa1\xad\x8c\xca\xe4G\t\xadG\x91\xa3\xa4\xae\xb7\xc7"/0   |                     1
  vehicles   | vehicles_auto_index_fk_city_ref_users | /107/2/"seattle"/"7\xfe\x953~\x94F\x95\xacàP\x8e_A\x18"/"\xccέ\xa0\xcaoAژ\x81\xab\xe9\xb6'ɐ"/0                              |                     1
  vehicles   | vehicles_auto_index_fk_city_ref_users | /107/2/"rome"/"oAņ\xd8\xcdE\xfb\xb6\xb7\x8e9\xb4\xae\xc1,"/"ڲ@\x1f\x1d\x05LɌ\xba\xb9\x97\x84\x9e\x98\x1d"/0                 |                     1
  vehicles   | vehicles_auto_index_fk_city_ref_users | /107/2/"paris"/"^\xefĦ\xed\vFI\x89\xe7\xfe\xbd\x8em\xe0\xb8"/"F%\xffZ\xe8\x93N\xfc\xa6\x17\xc0S\xb6\x86\xdd\xec"/0          |                     1
  vehicles   | vehicles_auto_index_fk_city_ref_users | /107/2/"new york"/"\xfd\x81\xc0UK\x9cEE\xa7\x14b\xdb\x02\xad\x80\xe8"/"a\xc0q\x82\x8e)@\x89\xa2\x9c\xcc\xdb\x01\x1d\x8e_"/0 |                     1
  vehicles   | vehicles_auto_index_fk_city_ref_users | /107/2/"new york"/"\xe9\xf9<\x99\\\x18K\xa2\x8d\xd2a\xa1d\x937\n"/"ͮ\x18\xd4\xe9\xb3A\xf3\xb5\x9c\x177\x8c\xf6\x0e\xc5"/0    |                     1
  vehicles   | vehicles_auto_index_fk_city_ref_users | /107/2/"new york"/"\x0f\x05\x9b\x1a[\xda@\x13\x83v\xfb\x8b\xdf4\"\xbd"/"N\xe0>\x1e\xf4gLݷ95\xfc0\x95\xea["/0                |                     1
  vehicles   | vehicles_auto_index_fk_city_ref_users | /107/2/"los angeles"/"h\xc8\xfa\xc5J\xf8A7\xbe\x98\xa3\x94\x8e\xf4\x991"/",\u007fh)\"\x92G̞\xde\xeb\x973\xdfK\xb4"/0         |                     1
  vehicles   | rides_auto_index_fk_city_ref_users    | /107/2/"amsterdam"/"\xe2\xc2\xdcJ$\xf3A\xa2\x98\xad.\xe6<Y\x05\xef"/"\x98\x05\xe1B\x82sE\x13\xba\xfe+,k\xd3\xc6\xd3"/0      |                     1
  vehicles   | rides_auto_index_fk_city_ref_users    | /107/2/"seattle"/"v\xd4J%\x90\x1bF\v\x97\x02v\xc7\xee\xa9\xc7R"/"s\xa1\xad\x8c\xca\xe4G\t\xadG\x91\xa3\xa4\xae\xb7\xc7"/0   |                     1
  vehicles   | rides_auto_index_fk_city_ref_users    | /107/2/"seattle"/"7\xfe\x953~\x94F\x95\xacàP\x8e_A\x18"/"\xccέ\xa0\xcaoAژ\x81\xab\xe9\xb6'ɐ"/0                              |                     1
  vehicles   | rides_auto_index_fk_city_ref_users    | /107/2/"rome"/"oAņ\xd8\xcdE\xfb\xb6\xb7\x8e9\xb4\xae\xc1,"/"ڲ@\x1f\x1d\x05LɌ\xba\xb9\x97\x84\x9e\x98\x1d"/0                 |                     1
  vehicles   | rides_auto_index_fk_city_ref_users    | /107/2/"paris"/"^\xefĦ\xed\vFI\x89\xe7\xfe\xbd\x8em\xe0\xb8"/"F%\xffZ\xe8\x93N\xfc\xa6\x17\xc0S\xb6\x86\xdd\xec"/0          |                     1
  vehicles   | rides_auto_index_fk_city_ref_users    | /107/2/"new york"/"\xfd\x81\xc0UK\x9cEE\xa7\x14b\xdb\x02\xad\x80\xe8"/"a\xc0q\x82\x8e)@\x89\xa2\x9c\xcc\xdb\x01\x1d\x8e_"/0 |                     1
  vehicles   | rides_auto_index_fk_city_ref_users    | /107/2/"new york"/"\xe9\xf9<\x99\\\x18K\xa2\x8d\xd2a\xa1d\x937\n"/"ͮ\x18\xd4\xe9\xb3A\xf3\xb5\x9c\x177\x8c\xf6\x0e\xc5"/0    |                     1
  vehicles   | rides_auto_index_fk_city_ref_users    | /107/2/"new york"/"\x0f\x05\x9b\x1a[\xda@\x13\x83v\xfb\x8b\xdf4\"\xbd"/"N\xe0>\x1e\xf4gLݷ95\xfc0\x95\xea["/0                |                     1
  vehicles   | rides_auto_index_fk_city_ref_users    | /107/2/"los angeles"/"h\xc8\xfa\xc5J\xf8A7\xbe\x98\xa3\x94\x8e\xf4\x991"/",\u007fh)\"\x92G̞\xde\xeb\x973\xdfK\xb4"/0         |                     1
(18 rows)             6
~~~

### `cluster_contended_tables`

Column | Type | Description
------------|-----|------------
`database_name`  | `STRING`  | The name of the database experiencing contention.
`schema_name`  | `STRING`  | The name of the schema experiencing contention.
`table_name` | `STRING` | The name of the table experiencing contention.
`num_contention_events` | `INT8` | The number of contention events.

#### View all tables that have experienced contention

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM movr.crdb_internal.cluster_contended_tables;
~~~
~~~
  database_name | schema_name | table_name | num_contention_events
----------------+-------------+------------+------------------------
  movr          | public      | vehicles   |                     9
(1 row)
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

#### View all contention events

{% include_cached copy-clipboard.html %}
~~~sql
SELECT * FROM crdb_internal.cluster_contention_events;
~~~
~~~
  table_id | index_id | num_contention_events | cumulative_contention_time |                                                                               key                                                                               |                txn_id                | count
-----------+----------+-----------------------+----------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------+--------------------------------------+--------
       107 |        2 |                     9 | 00:00:00.039563            | \xf3\x8a\x12amsterdam\x00\x01\x12\xe2\xc2\xdcJ$\xf3A\xa2\x98\xad.\xe6<Y\x05\xef\x00\x01\x12\x98\x05\xe1B\x82sE\x13\xba\xfe+,k\xd3\xc6\xd3\x00\x01\x88           | 2701fe08-44bf-44ca-a2f7-6d2c9b652f9f |     1
       107 |        2 |                     9 | 00:00:00.039563            | \xf3\x8a\x12los angeles\x00\x01\x12h\xc8\xfa\xc5J\xf8A7\xbe\x98\xa3\x94\x8e\xf4\x991\x00\x01\x12,\x7fh)"\x92G\xcc\x9e\xde\xeb\x973\xdfK\xb4\x00\x01\x88         | 2595e2d5-84b1-47a6-acc3-e6fdab47da41 |     1
       107 |        2 |                     9 | 00:00:00.039563            | \xf3\x8a\x12new york\x00\x01\x12\x0f\x05\x9b\x1a[\xda@\x13\x83v\xfb\x8b\xdf4"\xbd\x00\x01\x12N\xe0>\x1e\xf4gL\xdd\xb795\xfc0\x95\xea[\x00\x01\x88               | 58b59e88-87b8-45eb-bc9b-34e6a6b53a2c |     1
       107 |        2 |                     9 | 00:00:00.039563            | \xf3\x8a\x12new york\x00\x01\x12\xe9\xf9<\x99\\\x18K\xa2\x8d\xd2a\xa1d\x937\n\x00\x01\x12\xcd\xae\x18\xd4\xe9\xb3A\xf3\xb5\x9c\x177\x8c\xf6\x0e\xc5\x00\x01\x88 | 9af8a934-7ffa-4715-b802-f532f15bea9c |     1
       107 |        2 |                     9 | 00:00:00.039563            | \xf3\x8a\x12new york\x00\x01\x12\xfd\x81\xc0UK\x9cEE\xa7\x14b\xdb\x02\xad\x80\xe8\x00\x01\x12a\xc0q\x82\x8e)@\x89\xa2\x9c\xcc\xdb\x01\x1d\x8e_\x00\x01\x88      | af7ee3f2-23b8-46ef-bef7-a11b1be73443 |     1
       107 |        2 |                     9 | 00:00:00.039563            | \xf3\x8a\x12paris\x00\x01\x12^\xef\xc4\xa6\xed\x0bFI\x89\xe7\xfe\xbd\x8em\xe0\xb8\x00\x01\x12F%\xffZ\xe8\x93N\xfc\xa6\x17\xc0S\xb6\x86\xdd\xec\x00\x01\x88      | 594bec92-af85-4a8d-bb4d-cc17d5bbd905 |     1
       107 |        2 |                     9 | 00:00:00.039563            | \xf3\x8a\x12rome\x00\x01\x12oA\xc5\x86\xd8\xcdE\xfb\xb6\xb7\x8e9\xb4\xae\xc1,\x00\x01\x12\xda\xb2@\x1f\x1d\x05L\xc9\x8c\xba\xb9\x97\x84\x9e\x98\x1d\x00\x01\x88 | 815dcf03-7a0a-4c3a-98df-be7d84c1fd13 |     1
       107 |        2 |                     9 | 00:00:00.039563            | \xf3\x8a\x12seattle\x00\x01\x127\xfe\x953~\x94F\x95\xac\xc3\xa0P\x8e_A\x18\x00\x01\x12\xcc\xce\xad\xa0\xcaoA\xda\x98\x81\xab\xe9\xb6\'\xc9\x90\x00\x01\x88      | 5d382859-e88d-497a-830b-613fd20ef304 |     1
       107 |        2 |                     9 | 00:00:00.039563            | \xf3\x8a\x12seattle\x00\x01\x12v\xd4J%\x90\x1bF\x0b\x97\x02v\xc7\xee\xa9\xc7R\x00\x01\x12s\xa1\xad\x8c\xca\xe4G\t\xadG\x91\xa3\xa4\xae\xb7\xc7\x00\x01\x88      | e83df970-a01a-470f-914d-f5615eeec620 |     1
(9 rows)
~~~

#### View the tables/indexes with the most time under contention

To view the [tables](create-table.html) and [indexes](indexes.html) with the most cumulative time under [contention](performance-best-practices-overview.html#transaction-contention) since the last server restart, run the query below.

{{site.data.alerts.callout_info}}
The default tracing behavior captures a small percent of transactions so not all contention events will be recorded. When investigating transaction contention, you can set the `sql.trace.txn.enable_threshold` [cluster setting](cluster-settings.html#setting-sql-trace-txn-enable-threshold) to always capture contention events.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
WITH c AS (SELECT DISTINCT ON (table_id, index_id) table_id, index_id, num_contention_events AS events, cumulative_contention_time AS time FROM crdb_internal.cluster_contention_events) SELECT i.descriptor_name, i.index_name, c.events, c.time FROM crdb_internal.table_indexes AS i JOIN c ON i.descriptor_id = c.table_id AND i.index_id = c.index_id ORDER BY c.time DESC LIMIT 10;
~~~

~~~
  descriptor_name |   index_name   | events |      time
------------------+----------------+--------+------------------
  warehouse       | warehouse_pkey |      7 | 00:00:01.046293
  district        | district_pkey  |      1 | 00:00:00.191346
  stock           | stock_pkey     |      1 | 00:00:00.158207
  order           | order_pkey     |      1 | 00:00:00.155404
  new_order       | new_order_pkey |      1 | 00:00:00.100949
(5 rows)
~~~

(The output above is for a [local cluster](start-a-local-cluster.html) running the [TPC-C workload](cockroach-workload.html#tpcc-workload) at a `--concurrency` of 256.)

### `cluster_locks`

The `crdb_internal.cluster_locks` schema contains information about [locks](architecture/transaction-layer.html#concurrency-control) held by [transactions](transactions.html) on specific [keys](architecture/overview.html#architecture-range). Queries acquire locks on keys within transactions, or they wait until they can acquire locks until other transactions have released locks on those keys.

For more information, see the following sections.

- [Cluster locks columns](#cluster-locks-columns)
- [Cluster locks - basic example](#cluster-locks-basic-example)
- [Cluster locks - intermediate example](#cluster-locks-intermediate-example)
- [Blocked vs. blocking transactions](#blocked-vs-blocking-transactions)
- [Client sessions holding locks](#client-sessions-holding-locks)
- [Count locks held by sessions](#count-locks-held-by-sessions)
- [Count queries waiting on locks](#count-queries-waiting-on-locks)

#### Cluster locks columns

The `crdb_internal.cluster_locks` table has the following columns that describe each lock:

| Column            | Type                          | Description                                                                                                                                                                   |
|-------------------+-------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `range_id`        | [`INT`](int.html)             | The ID of the [range](architecture/overview.html#architecture-range) that stores the key the lock is being acquired on.                                                       |
| `table_id`        | [`INT`](int.html)             | The ID of the [table](create-table.html) that includes the key the lock is being acquired on.                                                                                 |
| `database_name`   | [`STRING`](string.html)       | The name of the [database](create-database.html) that includes the key the lock is being acquired on.                                                                         |
| `schema_name`     | [`STRING`](string.html)       | The name of the [schema](create-schema.html) that includes the key this lock is being acquired on.                                                                            |
| `table_name`      | [`STRING`](string.html)       | The name of the [table](create-table.html) that includes the key this lock is being acquired on.                                                                              |
| `index_name`      | [`STRING`](string.html)       | The name of the [index](indexes.html) that includes the key this lock is being acquired on.                                                                                   |
| `lock_key`        | [`BYTES`](bytes.html)         | The actual key that this lock is being acquired on.                                                                                                                           |
| `lock_key_pretty` | [`STRING`](string.html)       | A string representation of the key this lock is being acquired on.                                                                                                            |
| `txn_id`          | [`UUID`](uuid.html)           | The ID of the [transaction](transactions.html) that is acquiring this lock.                                                                                                   |
| `ts`              | [`TIMESTAMP`](timestamp.html) | The [timestamp](timestamp.html) at which this lock was acquired.                                                                                                              |
| `lock_strength`   | [`STRING`](string.html)       | The strength of this lock. Allowed values: `"Exclusive"` or `"None"` (read-only requests don't need an exclusive lock).                                                                                                         |
| `durability`      | [`STRING`](string.html)       | Whether the lock is one of: `Replicated` or `Unreplicated`. For more information about lock replication, see [types of locking](architecture/transaction-layer.html#writing). |
| `granted`         | [`BOOLEAN`](bool.html)        | Whether this lock has been granted to the [transaction](transactions.html) requesting it.                                                                                     |
| `contended`       | [`BOOLEAN`](bool.html)        | Whether multiple [transactions](transactions.html) are trying to acquire a lock on this key.                                                                                  |
| `duration`        | [`INTERVAL`](interval.html)   | The length of time this lock has been held for.                                                                                                                               |

{{site.data.alerts.callout_success}}
You can see the types and default values of columns in this and other tables using [`SHOW COLUMNS FROM {table}`](show-columns.html).
{{site.data.alerts.end}}

#### Cluster locks - basic example

In this example, we'll use the [`SELECT FOR UPDATE`](select-for-update.html) statement to order two transactions by controlling concurrent access to a table. Then, we will look at the data in `cluster_locks` to see the locks being held by these transactions on the objects they are accessing.

{% include {{page.version.version}}/sql/select-for-update-example-partial.md %}

Now that we have two transactions both trying to update the `kv` table, let's query the data in `crdb_internal.cluster_locks`. We should see two locks:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT database_name, table_name, txn_id, ts, lock_key_pretty, lock_strength, granted, contended FROM crdb_internal.cluster_locks WHERE table_name = 'kv';
~~~

~~~
  database_name | table_name |                txn_id                |             ts             | lock_key_pretty  | lock_strength | granted | contended
----------------+------------+--------------------------------------+----------------------------+------------------+---------------+---------+------------
  defaultdb     | kv         | d11a08c4-a3a2-4bdb-bf10-8d2373426faf | 2022-07-27 18:57:06.808046 | /Table/107/1/1/0 | Exclusive     |  true   |   true
  defaultdb     | kv         | 34ebadb6-99f1-4547-b487-4b322506b7fe | 2022-07-27 18:57:13.173556 | /Table/107/1/1/0 | Exclusive     |  false  |   true
(2 rows)
~~~

As expected, there are two locks. This is the case because:

- The transaction with the [`SELECT FOR UPDATE`](select-for-update.html) query in Terminal 1 asked for an `Exclusive` lock on a row in the `defaultdb.kv` table, as shown in the `lock_strength` column. We can see that it was able to get that lock, since the `granted` column is `true`.
- The transaction in Terminal 2 is also trying to lock the same row in the `kv` table with a `lock_strength` of `Exclusive`. However, the value of the `granted` column is `false`, which means it could not get the exclusive lock yet, and is waiting on the lock from the query in Terminal 1 to be released before it can proceed.

Further, both transactions show the `contended` column as `true`, since these transactions are both trying to update rows in the `defaultdb.kv` table at the same time.

The following more complex query shows additional information about lockholders, sessions, and waiting queries. This may be useful on a busy cluster for figuring out which transactions from which clients are trying to grab locks. Note that joining with `cluster_queries` will only show queries currently in progress.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT
    sessions.session_id,
    sessions.client_address,
    sessions.application_name,
    locks.txn_id,
    queries.query_id AS waiting_query_id,
    queries.query AS waiting_query,
    locks.lock_key_pretty,
    locks.ts,
    locks.database_name,
    locks.schema_name,
    locks.table_name,
    locks.lock_strength,
    locks.granted,
    locks.contended
FROM
    crdb_internal.cluster_locks AS locks
    JOIN crdb_internal.cluster_sessions AS sessions ON
            locks.txn_id::STRING = sessions.kv_txn
    LEFT JOIN crdb_internal.cluster_queries AS queries ON
            locks.txn_id = queries.txn_id
~~~

~~~
              session_id            | client_address  | application_name |                txn_id                |         waiting_query_id         |              waiting_query              | lock_key_pretty  |             ts             | database_name | schema_name | table_name | lock_strength | granted | contended
-----------------------------------+-----------------+------------------+--------------------------------------+----------------------------------+-----------------------------------------+------------------+----------------------------+---------------+-------------+------------+---------------+---------+------------
  17056bb535ead9a00000000000000001 | 127.0.0.1:51093 | $ cockroach sql  | ca692f0a-deca-4d4a-9a15-86f25c3b837f | NULL                             | NULL                                    | /Table/107/1/1/0 | 2022-07-26 15:48:08.294631 | defaultdb     | public      | kv         | Exclusive     |  true   |   true
  17056bb7e47a6ec00000000000000003 | 127.0.0.1:51094 | $ cockroach sql  | 771fe98f-9e39-4ce4-90da-8ecb06d2a856 | 17056bbd362852780000000000000003 | SELECT * FROM kv WHERE k = 1 FOR UPDATE | /Table/107/1/1/0 | 2022-07-26 15:48:18.145594 | defaultdb     | public      | kv         | Exclusive     |  false  |   true
(2 rows)
~~~

The output is similar to querying `cluster_locks` alone, except you can see the text of the SQL queries whose transactions are waiting on other transactions to finish, with additional information about the clients that initiated those transactions.

{{site.data.alerts.callout_info}}
Locks are held by transactions, not queries. A lock can be acquired by a transaction as a result of a query, but CockroachDB does not track which query in a transaction caused that transaction to acquire a lock.
{{site.data.alerts.end}}

#### Cluster locks - intermediate example

This example assumes you have a cluster in the state it was left in by [the previous example](#cluster-locks-basic-example).

In this example you will run a workload on the cluster with multiple concurrent transactions using the [bank workload](cockroach-workload.html#run-the-bank-workload). With a sufficiently high concurrency setting, the bank workload will frequently attempt to update multiple accounts at the same time. This will create plenty of locks to view in the `crdb_internal.cluster_locks` table.

1. Initialize the workload:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach workload init bank 'postgresql://root@localhost:26257/bank?sslmode=disable'
    ~~~

1. Run it at a high concurrency setting:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach workload run bank --concurrency=128 --duration=3m 'postgresql://root@localhost:26257/bank?sslmode=disable'
    ~~~

1. While the workload is running, issue the following query to view a subset of the locks being requested:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT
        database_name,
        table_name,
        txn_id,
        ts,
        lock_key_pretty,
        lock_strength,
        granted,
        contended
    FROM
        crdb_internal.cluster_locks
    WHERE table_name = 'bank'
    LIMIT
        10
    ~~~

    ~~~
      database_name | table_name |                txn_id                |             ts             |  lock_key_pretty   | lock_strength | granted | contended
    ----------------+------------+--------------------------------------+----------------------------+--------------------+---------------+---------+------------
      bank          | bank       | 7f0e262f-78e6-4a52-ad4e-d3cd5a851c82 | 2022-07-27 18:59:09.358877 | /Table/110/1/82/0  | Exclusive     |  true   |   false
      bank          | bank       | c5bdc305-5940-43e1-8017-95260b4a1a39 | 2022-07-27 18:59:06.071559 | /Table/110/1/110/0 | Exclusive     |  true   |   true
      bank          | bank       | ec872809-06b6-4320-b416-88b37c656f28 | 2022-07-27 18:59:05.843786 | /Table/110/1/110/0 | Exclusive     |  false  |   true
      bank          | bank       | 7f4cd00d-2765-4b8d-b2e3-96e1c20e515e | 2022-07-27 18:59:06.345931 | /Table/110/1/110/0 | Exclusive     |  false  |   true
      bank          | bank       | d6683639-a529-43b1-89ce-e7f0aa268426 | 2022-07-27 18:59:06.800857 | /Table/110/1/110/0 | Exclusive     |  false  |   true
      bank          | bank       | ffbeb239-9fba-4cd8-8f20-ccebe3a069cd | 2022-07-27 18:59:07.485126 | /Table/110/1/110/0 | Exclusive     |  false  |   true
      bank          | bank       | 7f64b1f5-e70e-4257-9d5b-5a26e48001cf | 2022-07-27 18:59:07.77492  | /Table/110/1/110/0 | Exclusive     |  false  |   true
      bank          | bank       | 3e4ca7d5-77ef-474b-8ffa-4eeeffa0d190 | 2022-07-27 18:59:08.888788 | /Table/110/1/110/0 | Exclusive     |  false  |   true
      bank          | bank       | 57d984d7-54a9-4c7f-893d-a8c67e748bbe | 2022-07-27 18:59:05.117683 | /Table/110/1/110/0 | Exclusive     |  false  |   true
      bank          | bank       | 3c06319f-31c3-43ba-8323-9807e2c6de04 | 2022-07-27 18:59:05.117683 | /Table/110/1/110/0 | Exclusive     |  false  |   true
    (10 rows)
    ~~~

As in the [basic example](#cluster-locks-basic-example), you can see that some transactions that wanted locks on the `bank` table are having to wait (`granted` is `false`), usually because they are trying to operate on the same rows as one or more other transactions (`contended` is `true`).

The following more complex query shows additional information about lockholders, sessions, and waiting queries. This may be useful on a busy cluster for figuring out which transactions from which clients are trying to grab locks. Note that joining with `cluster_queries` will only show queries currently in progress.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT
    sessions.session_id,
    sessions.client_address,
    sessions.application_name,
    locks.txn_id,
    queries.query_id AS waiting_query_id,
    queries.query AS waiting_query,
    locks.lock_key_pretty,
    locks.ts,
    locks.database_name,
    locks.schema_name,
    locks.table_name,
    locks.lock_strength,
    locks.granted,
    locks.contended
FROM
    crdb_internal.cluster_locks AS locks
    JOIN crdb_internal.cluster_sessions AS sessions ON
            locks.txn_id::STRING = sessions.kv_txn
    LEFT JOIN crdb_internal.cluster_queries AS queries ON
            locks.txn_id = queries.txn_id
WHERE
    locks.table_name = 'bank'
LIMIT
    10
~~~

~~~
             session_id            | client_address  | application_name |                txn_id                |         waiting_query_id         |                                                    waiting_query                                                     |  lock_key_pretty   |             ts             | database_name | schema_name | table_name | lock_strength | granted | contended
-----------------------------------+-----------------+------------------+--------------------------------------+----------------------------------+----------------------------------------------------------------------------------------------------------------------+--------------------+----------------------------+---------------+-------------+------------+---------------+---------+------------
  17056cb7396db5900000000000000001 | 127.0.0.1:51220 | bank             | 3bee08fd-636e-4d41-b28d-104bd0a4235b | 17056cded0850d800000000000000001 | UPDATE bank SET balance = CASE id WHEN 351 THEN balance - 725 WHEN 412 THEN balance + 725 END WHERE id IN (351, 412) | /Table/110/1/351/0 | 2022-07-26 16:09:31.215922 | bank          | public      | bank       | Exclusive     |  false  |   true
  17056cb7396db5900000000000000001 | 127.0.0.1:51220 | bank             | 3bee08fd-636e-4d41-b28d-104bd0a4235b | 17056cded0850d800000000000000001 | UPDATE bank SET balance = CASE id WHEN 351 THEN balance - 725 WHEN 412 THEN balance + 725 END WHERE id IN (351, 412) | /Table/110/1/412/0 | 2022-07-26 16:09:31.215922 | bank          | public      | bank       | Exclusive     |  false  |   true
  17056cb73972ab180000000000000001 | 127.0.0.1:51221 | bank             | 5c27678d-3acb-4d9d-8b98-774c5a10f933 | 17056ce6f3db1d080000000000000001 | UPDATE bank SET balance = CASE id WHEN 627 THEN balance - 794 WHEN 867 THEN balance + 794 END WHERE id IN (627, 867) | /Table/110/1/627/0 | 2022-07-26 16:09:36.945352 | bank          | public      | bank       | Exclusive     |  true   |   false
  17056cb73972ab180000000000000001 | 127.0.0.1:51221 | bank             | 5c27678d-3acb-4d9d-8b98-774c5a10f933 | 17056ce6f3db1d080000000000000001 | UPDATE bank SET balance = CASE id WHEN 627 THEN balance - 794 WHEN 867 THEN balance + 794 END WHERE id IN (627, 867) | /Table/110/1/867/0 | 2022-07-26 16:09:36.945352 | bank          | public      | bank       | Exclusive     |  true   |   false
  17056cb739738da80000000000000001 | 127.0.0.1:51222 | bank             | 1768cc1d-0929-490b-86bd-f39b9f78cc84 | 17056cdc278d47580000000000000001 | UPDATE bank SET balance = CASE id WHEN 351 THEN balance - 412 WHEN 412 THEN balance + 412 END WHERE id IN (351, 412) | /Table/110/1/351/0 | 2022-07-26 16:09:31.215922 | bank          | public      | bank       | Exclusive     |  false  |   true
  17056cb739738da80000000000000001 | 127.0.0.1:51222 | bank             | 1768cc1d-0929-490b-86bd-f39b9f78cc84 | 17056cdc278d47580000000000000001 | UPDATE bank SET balance = CASE id WHEN 351 THEN balance - 412 WHEN 412 THEN balance + 412 END WHERE id IN (351, 412) | /Table/110/1/412/0 | 2022-07-26 16:09:31.215922 | bank          | public      | bank       | Exclusive     |  false  |   true
  17056cb739737e080000000000000001 | 127.0.0.1:51223 | bank             | bf6ab816-67b7-4125-bf88-3d5c36986885 | 17056ce55b0065580000000000000001 | UPDATE bank SET balance = CASE id WHEN 137 THEN balance - 500 WHEN 895 THEN balance + 500 END WHERE id IN (137, 895) | /Table/110/1/137/0 | 2022-07-26 16:09:25.957139 | bank          | public      | bank       | Exclusive     |  false  |   true
  17056cb739772b700000000000000001 | 127.0.0.1:51226 | bank             | a9cff324-00bd-4e33-afc6-ff3341988c7e | 17056cd1cb394ab00000000000000001 | UPDATE bank SET balance = CASE id WHEN 498 THEN balance - 584 WHEN 690 THEN balance + 584 END WHERE id IN (498, 690) | /Table/110/1/690/0 | 2022-07-26 16:09:30.318277 | bank          | public      | bank       | Exclusive     |  false  |   true
  17056cb7397b03d00000000000000001 | 127.0.0.1:51225 | bank             | 5a591e0d-ba25-424f-aa13-502a7044355b | 17056cdb5243ea200000000000000001 | UPDATE bank SET balance = CASE id WHEN 110 THEN balance - 641 WHEN 895 THEN balance + 641 END WHERE id IN (110, 895) | /Table/110/1/110/0 | 2022-07-26 16:09:02.283466 | bank          | public      | bank       | Exclusive     |  false  |   true
  17056cb7397bdaa80000000000000001 | 127.0.0.1:51227 | bank             | 40a7f865-c6a6-40e2-8956-01f3f52b19f2 | 17056ccea1c21de00000000000000001 | UPDATE bank SET balance = CASE id WHEN 895 THEN balance - 506 WHEN 786 THEN balance + 506 END WHERE id IN (895, 786) | /Table/110/1/786/0 | 2022-07-26 16:08:19.842191 | bank          | public      | bank       | Exclusive     |  false  |   true
(10 rows)
~~~

The output is similar to querying `cluster_locks` alone, except you can see the text of the SQL queries whose transactions are waiting on other transactions to finish, with additional information about the clients that initiated those transactions.

{{site.data.alerts.callout_info}}
Locks are held by transactions, not queries. A lock can be acquired by a transaction as a result of a query within that transaction, but CockroachDB does not track which query in a transaction caused that transaction to acquire a lock.
{{site.data.alerts.end}}

#### Blocked vs. blocking transactions

Run the query below to display a list of pairs of [transactions](transactions.html) that are holding and waiting on locks for the same [keys](architecture/overview.html#architecture-range).

This example assumes you are running the `bank` workload as described in the [intermediate example](#cluster-locks-intermediate-example).

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT
    lh.database_name,
    lh.table_name,
    lh.range_id,
    lh.lock_key_pretty,
    lh.txn_id AS lock_holder,
    lw.txn_id AS lock_waiter,
    q.query AS waiting_query,
    lw.duration AS wait_duration
FROM
    crdb_internal.cluster_locks AS lh
    JOIN crdb_internal.cluster_locks AS lw ON
            lh.lock_key = lw.lock_key
    JOIN crdb_internal.cluster_queries AS q ON
            lw.txn_id = q.txn_id
WHERE
    lh.granted = true
    AND lh.txn_id IS DISTINCT FROM lw.txn_id
    AND lh.table_name = 'bank'
LIMIT
    10
~~~

~~~
  database_name | table_name | range_id |  lock_key_pretty   |             lock_holder              |             lock_waiter              |                                                    waiting_query                                                     |  wait_duration
----------------+------------+----------+--------------------+--------------------------------------+--------------------------------------+----------------------------------------------------------------------------------------------------------------------+------------------
  bank          | bank       |       50 | /Table/110/1/412/0 | 89d8f3a6-463b-4119-89e9-c797680f35bb | ea5a95cc-923c-4262-b0f7-81014fd19ee1 | UPDATE bank SET balance = CASE id WHEN 351 THEN balance - 39 WHEN 412 THEN balance + 39 END WHERE id IN (351, 412)   | 00:00:01.236359
  bank          | bank       |       50 | /Table/110/1/412/0 | 89d8f3a6-463b-4119-89e9-c797680f35bb | d4a80a8b-ede9-48ea-a7e1-375255f5aabe | UPDATE bank SET balance = CASE id WHEN 351 THEN balance - 551 WHEN 412 THEN balance + 551 END WHERE id IN (351, 412) | 00:00:01.268718
  bank          | bank       |       50 | /Table/110/1/412/0 | 89d8f3a6-463b-4119-89e9-c797680f35bb | 5406a762-1975-4346-ab7d-f32a4ff06469 | UPDATE bank SET balance = CASE id WHEN 351 THEN balance - 395 WHEN 412 THEN balance + 395 END WHERE id IN (351, 412) | 00:00:01.265879
  bank          | bank       |       50 | /Table/110/1/412/0 | 89d8f3a6-463b-4119-89e9-c797680f35bb | be93bcc1-921e-4b8a-9253-98f0848eef2c | UPDATE bank SET balance = CASE id WHEN 351 THEN balance - 725 WHEN 412 THEN balance + 725 END WHERE id IN (351, 412) | 00:00:01.273119
  bank          | bank       |       50 | /Table/110/1/412/0 | 89d8f3a6-463b-4119-89e9-c797680f35bb | a513d77f-9773-48c4-b888-1abbecba12ad | UPDATE bank SET balance = CASE id WHEN 351 THEN balance - 317 WHEN 412 THEN balance + 317 END WHERE id IN (351, 412) | 00:00:01.269164
  bank          | bank       |       50 | /Table/110/1/412/0 | 89d8f3a6-463b-4119-89e9-c797680f35bb | 56d14710-d40f-4bd3-a3f6-f8cc34996bad | UPDATE bank SET balance = CASE id WHEN 351 THEN balance - 758 WHEN 412 THEN balance + 758 END WHERE id IN (351, 412) | 00:00:01.271509
  bank          | bank       |       48 | /Table/110/1/839/0 | 1dd5d45e-98dd-4645-a1c2-9d1656a7c1e2 | 19ecea86-219d-4979-a7ed-04c6fa81e6db | UPDATE bank SET balance = CASE id WHEN 839 THEN balance - 830 WHEN 758 THEN balance + 830 END WHERE id IN (839, 758) | 00:00:00.775891
  bank          | bank       |       50 | /Table/110/1/412/0 | 89d8f3a6-463b-4119-89e9-c797680f35bb | 1a7ce7a8-6145-4d71-a05a-6a22e641a3d5 | UPDATE bank SET balance = CASE id WHEN 351 THEN balance - 711 WHEN 412 THEN balance + 711 END WHERE id IN (351, 412) | 00:00:01.268693
  bank          | bank       |       50 | /Table/110/1/412/0 | 89d8f3a6-463b-4119-89e9-c797680f35bb | 9c9da2b9-a468-45b6-af7f-88f0ade5c9f9 | UPDATE bank SET balance = CASE id WHEN 351 THEN balance - 642 WHEN 412 THEN balance + 642 END WHERE id IN (351, 412) | 00:00:01.267889
  bank          | bank       |       50 | /Table/110/1/412/0 | 89d8f3a6-463b-4119-89e9-c797680f35bb | 997183e4-f1c7-46eb-882b-5b4cf76ff1ab | UPDATE bank SET balance = CASE id WHEN 351 THEN balance - 296 WHEN 412 THEN balance + 296 END WHERE id IN (351, 412) | 00:00:01.269917
(10 rows)
~~~

#### Client sessions holding locks

Run the query below to display a list of [sessions](show-sessions.html) that are holding and waiting on locks for the same [keys](architecture/overview.html#architecture-range).

This example assumes you are running the `bank` workload as described in the [intermediate example](#cluster-locks-intermediate-example).

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT
    l.database_name,
    l.table_name,
    l.range_id,
    l.lock_key_pretty,
    l.txn_id,
    l.granted,
    s.node_id,
    s.user_name,
    s.client_address
FROM
    crdb_internal.cluster_locks AS l
    JOIN crdb_internal.cluster_transactions AS t ON
            l.txn_id = t.id
    JOIN crdb_internal.cluster_sessions AS s ON
            t.session_id = s.session_id
WHERE
    l.granted = true AND l.table_name = 'bank';
~~~

~~~
  database_name | table_name | range_id |  lock_key_pretty   |                txn_id                | granted | node_id | user_name | client_address
----------------+------------+----------+--------------------+--------------------------------------+---------+---------+-----------+------------------
  bank          | bank       |       54 | /Table/110/1/140/0 | 7aa534d6-c6df-4a98-9ef5-33ddb7c20618 |  true   |       1 | root      | 127.0.0.1:51398
  bank          | bank       |       53 | /Table/110/1/786/0 | 92490011-e63b-4157-b7e5-6bd17ac6e94c |  true   |       1 | root      | 127.0.0.1:51400
  bank          | bank       |       50 | /Table/110/1/457/0 | 2e815ed3-4178-4eff-a5c5-b04fd6e76d50 |  true   |       1 | root      | 127.0.0.1:51412
  bank          | bank       |       54 | /Table/110/1/137/0 | fd735721-d8a0-4157-b370-00f132bb6263 |  true   |       1 | root      | 127.0.0.1:51425
  bank          | bank       |       54 | /Table/110/1/110/0 | e7acec14-dbf9-4cd9-9ae6-43adac826810 |  true   |       1 | root      | 127.0.0.1:51443
  bank          | bank       |       49 | /Table/110/1/351/0 | 2ff62140-62d8-46e7-9c4a-c3f778519549 |  true   |       1 | root      | 127.0.0.1:51427
  bank          | bank       |       50 | /Table/110/1/412/0 | 2ff62140-62d8-46e7-9c4a-c3f778519549 |  true   |       1 | root      | 127.0.0.1:51427
  bank          | bank       |       48 | /Table/110/1/895/0 | bd676999-37f5-42b4-9278-7b3de5451abe |  true   |       1 | root      | 127.0.0.1:51439
  bank          | bank       |       65 | /Table/110/1/60/0  | 51aacef3-370e-4760-8e8f-60e6e9db4a19 |  true   |       1 | root      | 127.0.0.1:51461
  bank          | bank       |       54 | /Table/110/1/134/0 | 51aacef3-370e-4760-8e8f-60e6e9db4a19 |  true   |       1 | root      | 127.0.0.1:51461
  bank          | bank       |       49 | /Table/110/1/316/0 | 5bffc2fa-43f1-4b76-acfa-2d1d4e09c793 |  true   |       1 | root      | 127.0.0.1:51472
  bank          | bank       |       47 | /Table/110/1/504/0 | 5bffc2fa-43f1-4b76-acfa-2d1d4e09c793 |  true   |       1 | root      | 127.0.0.1:51472
(12 rows)
~~~

#### Count locks held by sessions

Run the query below to show a list of lock counts being held by different [sessions](show-sessions.html).

This example assumes you are running the `bank` workload as described in the [intermediate example](#cluster-locks-intermediate-example).

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT
    l.database_name,
    l.table_name,
    s.user_name,
    s.client_address,
    s.session_id,
    count(lock_key_pretty) AS lock_count
FROM
    crdb_internal.cluster_locks AS l
    JOIN crdb_internal.cluster_transactions AS t ON
            l.txn_id = t.id
    JOIN crdb_internal.cluster_sessions AS s ON
            t.session_id = s.session_id
WHERE
    l.granted = true AND l.table_name = 'bank'
GROUP BY
    l.database_name,
    l.table_name,
    s.user_name,
    s.client_address,
    s.session_id
~~~

~~~
  database_name | table_name | user_name | client_address  |            session_id            | lock_count
----------------+------------+-----------+-----------------+----------------------------------+-------------
  bank          | bank       | root      | 127.0.0.1:51403 | 17056d4b2f62aeb80000000000000001 |          1
  bank          | bank       | root      | 127.0.0.1:51405 | 17056d4b2f6cc8a80000000000000001 |          1
  bank          | bank       | root      | 127.0.0.1:51421 | 17056d4b2f8acc400000000000000001 |          1
  bank          | bank       | root      | 127.0.0.1:51425 | 17056d4b2f96ab500000000000000001 |          1
  bank          | bank       | root      | 127.0.0.1:51492 | 17056d4b3019be000000000000000001 |          1
  bank          | bank       | root      | 127.0.0.1:51485 | 17056d4b3026f8b80000000000000001 |          2
(6 rows)
~~~

#### Count queries waiting on locks

Run the query below to show a list of [keys](architecture/overview.html#architecture-range) ordered by how many transactions are waiting on the locks on those keys.

This example assumes you are running the `bank` workload as described in the [intermediate example](#cluster-locks-intermediate-example).

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT
    l.database_name,
    l.table_name,
    l.range_id,
    l.lock_key_pretty,
    count(*) AS waiter_count,
    max(duration) AS longest_wait_duration
FROM
    crdb_internal.cluster_locks AS l
WHERE
    l.granted = false AND l.table_name = 'bank'
GROUP BY
    l.database_name,
    l.table_name,
    l.range_id,
    l.lock_key_pretty
ORDER BY
    waiter_count DESC, longest_wait_duration DESC
LIMIT
    30
~~~

~~~
  database_name | table_name | range_id |  lock_key_pretty   | waiter_count | longest_wait_duration
----------------+------------+----------+--------------------+--------------+------------------------
  bank          | bank       |       48 | /Table/110/1/895/0 |           81 | 00:00:02.91943
  bank          | bank       |       54 | /Table/110/1/110/0 |           69 | 00:00:02.074832
  bank          | bank       |       53 | /Table/110/1/786/0 |           41 | 00:01:16.871542
  bank          | bank       |       54 | /Table/110/1/137/0 |           10 | 00:01:49.082237
  bank          | bank       |       55 | /Table/110/1/690/0 |            2 | 00:00:44.526906
  bank          | bank       |       50 | /Table/110/1/498/0 |            2 | 00:00:43.473285
(6 rows)
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

#### View all active queries for the `movr` application

{% include_cached copy-clipboard.html %}
~~~sql
SELECT * FROM crdb_internal.cluster_queries where application_name = 'movr';
~~~
~~~
              query_id             |                txn_id                | node_id |            session_id            | user_name |           start            |                                                          query                                                           | client_address  | application_name | distributed |   phase
-----------------------------------+--------------------------------------+---------+----------------------------------+-----------+----------------------------+--------------------------------------------------------------------------------------------------------------------------+-----------------+------------------+-------------+------------
  16f762fea4cb17180000000000000001 | 7d55d442-6ae6-4062-ba3b-90656e9a6544 |       1 | 16f762c2af917e800000000000000001 | root      | 2022-06-10 22:30:33.907888 | UPSERT INTO vehicle_location_histories VALUES ('amsterdam', '69db0184-4192-4355-99b0-2e2abe7212c2', now(), 109.0, -45.0) | 127.0.0.1:49198 | movr             |    false    | executing
(1 row)
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
`active_query_start` | `TIMESTAMP` | The timestamp at which the currently active SQL query in the session started.
`kv_txn` | `STRING` | The ID of the current key-value transaction for the session.
`alloc_bytes` | `INT8` | The number of bytes allocated by the session.
`max_alloc_bytes` | `INT8` | The maximum number of bytes allocated by the session.

#### View all open SQL sessions for the `movr` application

{% include_cached copy-clipboard.html %}
~~~sql
SELECT * FROM crdb_internal.cluster_sessions where application_name = 'movr';
~~~
~~~
  node_id |            session_id            | user_name | client_address  | application_name |                       active_queries                       |               last_active_query               |       session_start       |     active_query_start     |                kv_txn                | alloc_bytes | max_alloc_bytes
----------+----------------------------------+-----------+-----------------+------------------+------------------------------------------------------------+-----------------------------------------------+---------------------------+----------------------------+--------------------------------------+-------------+------------------
        1 | 16f762c2af917e800000000000000001 | root      | 127.0.0.1:49198 | movr             | SELECT city, id FROM vehicles WHERE city = 'washington dc' | SELECT city, id FROM vehicles WHERE city = $1 | 2022-06-10 22:26:16.39059 | 2022-06-10 22:28:00.646594 | 7883cbe3-7cf3-4155-a1a8-82d1211c9ffa |      133120 |          163840
(1 row)
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

#### View all active transactions for the `movr` application

{% include_cached copy-clipboard.html %}
~~~sql
SELECT * FROM crdb_internal.cluster_transactions where application_name = 'movr';
~~~
~~~
                   id                  | node_id |            session_id            |           start            |                                                                                                                                            txn_string                                                                                                                                            | application_name | num_stmts | num_retries | num_auto_retries
---------------------------------------+---------+----------------------------------+----------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------------+-----------+-------------+-------------------
  9cfb2bbe-e1d8-4650-95d5-7a3fd052c6a7 |       1 | 16f762c2af917e800000000000000001 | 2022-06-10 22:26:20.370946 | "sql txn" meta={id=9cfb2bbe key=/Table/109/1/"rome"/"\xbf\x92\xe2<̯D\v\x94M\x83b0\x1b-\x82"/2022-06-10T22:26:20.370935Z/0 pri=0.00109794 epo=0 ts=1654899980.370940000,0 min=1654899980.370940000,0 seq=1} lock=true stat=PENDING rts=1654899980.370940000,0 wto=false gul=1654899980.870940000,0 | movr             |         1 |           0 |                0
(1 row)
~~~

### `index_usage_statistics`

Contains one row for each index in the current database surfacing usage statistics for that specific index. This view is updated every time a transaction is committed. Each user-submitted statement on the specified index is counted as a use of that index and increments corresponding counters in this view. System and internal queries (such as scans for gathering statistics) are not counted.

Column | Type | Description
------------|-----|------------
`table_id` | `INT8` | Unique table identifier.
`index_id` | `INT8` | Unique index identifier.
`total_reads` | `INT8` | Number of times an index was selected for a read.
`last_read` | `TIMESTAMPTZ` | Time of last read.

You can reset the index usages statistics by invoking the function `crdb_internal.reset_index_usage_stats()`. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT crdb_internal.reset_index_usage_stats();
~~~

~~~
  crdb_internal.reset_index_usage_stats
-----------------------------------------
                  true
(1 row)
~~~

#### View index statistics by table and index name

To view index usage statistics by table and index name, join with `table_indexes`:

{% include_cached copy-clipboard.html %}
~~~sql
SELECT  ti.descriptor_name as table_name, ti.index_name, total_reads
FROM  crdb_internal.index_usage_statistics AS us
JOIN crdb_internal.table_indexes ti
ON us.index_id = ti.index_id AND us.table_id = ti.descriptor_id
ORDER BY total_reads desc;
~~~

~~~
          table_name         |                  index_name                   | total_reads
-----------------------------+-----------------------------------------------+--------------
  vehicles                   | vehicles_auto_index_fk_city_ref_users         |      412266
  rides                      | rides_pkey                                    |      216137
  users                      | users_pkey                                    |       25709
  vehicles                   | vehicles_pkey                                 |       17185
  promo_codes                | promo_codes_pkey                              |        4274
  user_promo_codes           | user_promo_codes_pkey                         |        2138
  rides                      | rides_auto_index_fk_city_ref_users            |           1
  rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |           1
  vehicle_location_histories | vehicle_location_histories_pkey               |           1
(9 rows)
~~~

#### Determine which indexes haven't been used in the past week

To determine if there are indexes that have become stale and are no longer needed, show which indexes haven't been used during the past week with the following query:

{% include_cached copy-clipboard.html %}
~~~sql
SELECT  ti.descriptor_name as table_name, ti.index_name, total_reads
FROM  crdb_internal.index_usage_statistics AS us
JOIN crdb_internal.table_indexes ti
ON us.index_id = ti.index_id AND us.table_id = ti.descriptor_id
WHERE last_read < NOW() - INTERVAL '1 WEEK'
ORDER BY total_reads desc;
~~~

#### Determine which indexes are no longer used

View which indexes are no longer used with the following query:

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
`index_recommendations` | `STRING[] NOT NULL` | An array of strings containing [index recommendations](ui-insights-page.html#schema-insights-view) of the format `{type} : {sql query}`.

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
`stmtTyp` | `STRING` | The type of SQL statement: `"TypeDDL"`, `"TypeDML"`, `"TypeDCL"`, or `"TypeTCL"`. These types map to the CockroachDB statement types [data definition language (DDL)](sql-statements.html#data-definition-statements), [data manipulation language (DML)](sql-statements.html#data-manipulation-statements), [data control language (DCL)](sql-statements.html#data-control-statements), and [transaction control language (TCL)](sql-statements.html#transaction-control-statements).
`vec` | `BOOLEAN` | Whether the statement executed in the vectorized query engine.

#### `statistics` column

The [DB Console](ui-overview.html) [Statements](ui-statements-page.html) and [Statement Fingerprint](ui-statements-page.html#statement-fingerprint-page) pages display information from `statistics`.

The `statistics` column contains a JSONB object with `statistics` and `execution_statistics` subobjects. [`statistics`](ui-statements-page.html#statement-statistics) are always populated and are updated each time a new statement of that statement fingerprint is executed. [`execution_statistics`](ui-statements-page.html#charts) are collected using sampling. CockroachDB probabilistically runs a query with tracing enabled to collect fine-grained statistics of the query execution.

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
<code>statistics -> planGists | `String` | A sequence of bytes representing the flattened tree of operators and various operator specific metadata of the statement plan.
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

#### Detect suboptimal and regressed plans

Historical plans are stored in plan gists in `statistics->'statistics'->'planGists'`. To detect suboptimal and regressed plans over time you can compare plans for the same query by extracting them from the plan gists.

Suppose you wanted to compare plans of the following query:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT
  name, count(rides.id) AS sum
FROM
  users JOIN rides ON users.id = rides.rider_id
WHERE
  rides.start_time BETWEEN '2018-12-31 00:00:00' AND '2020-01-01 00:00:00'
GROUP BY
  name
ORDER BY
  sum DESC
LIMIT
  10;
~~~

To decode plan gists, use the `crdb_internal.decode_plan_gist` function, as shown in the following query. The example shows the performance impact of adding an [index on the `start_time` column in the `rides` table](apply-statement-performance-rules.html#rule-2-use-the-right-index). The first row of the output shows the improved performance (reduced number of rows read and latency) after the index was added. The second row shows the query, which performs a full scan on the `rides` table, before the index was added.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT
substring(metadata ->> 'query',1,60) AS statement_text,
  string_agg(  crdb_internal.decode_plan_gist(statistics->'statistics'->'planGists'->>0), '
  ') AS plan,
  max(aggregated_ts) as timestamp_interval,
  max(statistics -> 'statistics' -> 'rowsRead' -> 'mean') AS num_rows_read_mean,
  max(statistics -> 'statistics' -> 'runLat' -> 'mean') AS runtime_latency_mean,
  statistics->'statistics'->'planGists'->>0 as plan_id
FROM movr.crdb_internal.statement_statistics
WHERE substring(metadata ->> 'query',1,35)='SELECT name, count(rides.id) AS sum'
group by metadata ->> 'query', statistics->'statistics'->'planGists'->>0;
~~~

~~~
                         statement_text                        |                        plan                         |   timestamp_interval   | num_rows_read_mean | runtime_latency_mean |                     plan_id
---------------------------------------------------------------+-----------------------------------------------------+------------------------+--------------------+----------------------+---------------------------------------------------
  SELECT name, count(rides.id) AS sum FROM users JOIN rides ON | • top-k                                             | 2022-04-12 22:00:00+00 |              24786 |             0.028525 | AgHYAQgAiAECAAAB1AEEAAUAAAAJAAICAAAFAgsCGAYE
                                                               |   │ order                                           |                        |                    |                      |
                                                               |   │                                                 |                        |                    |                      |
                                                               |   └── • group (hash)                                |                        |                    |                      |
                                                               |       │ group by: rider_id                          |                        |                    |                      |
                                                               |       │                                             |                        |                    |                      |
                                                               |       └── • hash join                               |                        |                    |                      |
                                                               |           │ equality: (rider_id) = (id)             |                        |                    |                      |
                                                               |           │                                         |                        |                    |                      |
                                                               |           ├── • scan                                |                        |                    |                      |
                                                               |           │     table: rides@rides_start_time_idx   |                        |                    |                      |
                                                               |           │     spans: 1 span                       |                        |                    |                      |
                                                               |           │                                         |                        |                    |                      |
                                                               |           └── • scan                                |                        |                    |                      |
                                                               |                 table: users@users_city_id_name_key |                        |                    |                      |
                                                               |                 spans: FULL SCAN                    |                        |                    |                      |
  SELECT name, count(rides.id) AS sum FROM users JOIN rides ON | • top-k                                             | 2022-04-12 22:00:00+00 | 1.375E+5           |             0.279083 | AgHYAQIAiAEAAAADAdQBBAAFAAAACQACAgAABQILAhgGBA==
                                                               |   │ order                                           |                        |                    |                      |
                                                               |   │                                                 |                        |                    |                      |
                                                               |   └── • group (hash)                                |                        |                    |                      |
                                                               |       │ group by: rider_id                          |                        |                    |                      |
                                                               |       │                                             |                        |                    |                      |
                                                               |       └── • hash join                               |                        |                    |                      |
                                                               |           │ equality: (rider_id) = (id)             |                        |                    |                      |
                                                               |           │                                         |                        |                    |                      |
                                                               |           ├── • filter                              |                        |                    |                      |
                                                               |           │   │                                     |                        |                    |                      |
                                                               |           │   └── • scan                            |                        |                    |                      |
                                                               |           │         table: rides@rides_pkey         |                        |                    |                      |
                                                               |           │         spans: FULL SCAN                |                        |                    |                      |
                                                               |           │                                         |                        |                    |                      |
                                                               |           └── • scan                                |                        |                    |                      |
                                                               |                 table: users@users_city_id_name_key |                        |                    |                      |
                                                               |                 spans: FULL SCAN                    |                        |                    |                      |
(2 rows)
~~~

### `transaction_contention_events`

Contains one row for each transaction contention event.

Requires either the `VIEWACTIVITY` or `VIEWACTIVITYREDACTED` [role option](alter-role.html#role-options) to access. If you have the `VIEWACTIVITYREDACTED` role, `contending_key` will be redacted.

Contention events are stored in memory. You can control the amount of contention events stored per node via the `sql.contention.event_store.capacity` [cluster setting](cluster-settings.html).

The `sql.contention.event_store.duration_threshold` [cluster setting](cluster-settings.html) specifies the minimum contention duration to cause the contention events to be collected into the `crdb_internal.transaction_contention_events` table. The default value is `0`. If contention event collection is overwhelming the CPU or memory you can raise this value to reduce the load.

Column | Type | Description
------------|-----|------------
`collection_ts` | `TIMESTAMPTZ NOT NULL` | The timestamp when the transaction contention event was collected.
`blocking_txn_id` | `UUID NOT NULL` | The ID of the blocking transaction. You can join this column into the [`cluster_contention_events`](#cluster_contention_events) table.
`blocking_txn_fingerprint_id` | `BYTES NOT NULL`| The ID of the blocking transaction fingerprint. To surface historical information about the transactions that caused the contention, you can join this column into the [`statement_statistics`](#statement_statistics) and [`transaction_statistics`](#transaction_statistics) tables to surface historical information about the transactions that caused the contention.
`waiting_txn_id` | `UUID NOT NULL` | The ID of the waiting transaction. You can join this column into the [`cluster_contention_events`](#cluster_contention_events) table.
`waiting_txn_fingerprint_id` | `BYTES NOT NULL` | The ID of the waiting transaction fingerprint. To surface historical information about the transactions that caused the contention, you can join this column into the [`statement_statistics`](#statement_statistics) and [`transaction_statistics`](#transaction_statistics) tables.
`contention_duration` | `INTERVAL NOT NULL` | The interval of time the waiting transaction spent waiting for the blocking transaction.
`contending_key` | `BYTES NOT NULL` | The key on which the transactions contended.

#### Example

The following example shows how to join the `transaction_contention_events` table with `transaction_statistics` and `statement_statistics` tables to extract blocking and waiting transaction information.

1. Display contention table removing in-progress transactions.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT
      collection_ts,
      blocking_txn_id,
      encode(blocking_txn_fingerprint_id, 'hex') as blocking_txn_fingerprint_id,
      waiting_txn_id,
      encode(waiting_txn_fingerprint_id, 'hex') as waiting_txn_fingerprint_id
    FROM
      crdb_internal.transaction_contention_events
    WHERE
      encode(blocking_txn_fingerprint_id, 'hex') != '0000000000000000' AND encode(waiting_txn_fingerprint_id, 'hex') != '0000000000000000';
    ~~~

    ~~~
              collection_ts         |           blocking_txn_id            | blocking_txn_fingerprint_id |            waiting_txn_id            | waiting_txn_fingerprint_id
    --------------------------------+--------------------------------------+-----------------------------+--------------------------------------+-----------------------------
      2022-04-11 23:41:56.951687+00 | 921e3d5b-22ab-4a94-a7a4-407e143cfa73 | 79ac4a19cff03b60            | 74ac5efa-a1e4-4c24-a648-58b82a192f9d | b7a98a63d6932458
      2022-04-12 22:55:55.968825+00 | 25c75267-c091-44d4-8c33-8f5247409da5 | f07b4a806f8b7a2e            | 5397acb0-69f3-4c5c-b7a3-75d51180df44 | b7a98a63d6932458
    (2 rows)
    ~~~

1. Display counts for each blocking and waiting transaction fingerprint pair.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT
      encode(hce.blocking_txn_fingerprint_id, 'hex') as blocking_txn_fingerprint_id,
      encode(hce.waiting_txn_fingerprint_id, 'hex') as waiting_txn_fingerprint_id,
      count(*) AS contention_count
    FROM
      crdb_internal.transaction_contention_events hce
    WHERE
      encode(blocking_txn_fingerprint_id, 'hex') != '0000000000000000' AND encode(waiting_txn_fingerprint_id, 'hex') != '0000000000000000'
    GROUP BY
      hce.blocking_txn_fingerprint_id, hce.waiting_txn_fingerprint_id
    ORDER BY
      contention_count
    DESC;
    ~~~

    ~~~
      blocking_txn_fingerprint_id | waiting_txn_fingerprint_id | contention_count
    ------------------------------+----------------------------+-------------------
      79ac4a19cff03b60            | b7a98a63d6932458           |                1
      f07b4a806f8b7a2e            | b7a98a63d6932458           |                1
    (3 rows)
    ~~~

1. Join to show blocking statements text.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT DISTINCT
      hce.blocking_statement,
      substring(ss2.metadata ->> 'query', 1, 60) AS waiting_statement,
      hce.contention_count
    FROM (SELECT
            blocking_txn_fingerprint_id,
            waiting_txn_fingerprint_id,
            contention_count,
            substring(ss.metadata ->> 'query', 1, 60) AS blocking_statement
          FROM (SELECT
                  encode(blocking_txn_fingerprint_id, 'hex') as blocking_txn_fingerprint_id,
                  encode(waiting_txn_fingerprint_id, 'hex') as waiting_txn_fingerprint_id,
                  count(*) AS contention_count
                FROM
                  crdb_internal.transaction_contention_events
                GROUP BY
                  blocking_txn_fingerprint_id, waiting_txn_fingerprint_id
                ),
              crdb_internal.statement_statistics ss
          WHERE
            blocking_txn_fingerprint_id = encode(ss.transaction_fingerprint_id, 'hex')) hce,
          crdb_internal.statement_statistics ss2
    WHERE
      hce.blocking_txn_fingerprint_id != '0000000000000000' AND
      hce.waiting_txn_fingerprint_id != '0000000000000000' AND
      hce.waiting_txn_fingerprint_id = encode(ss2.transaction_fingerprint_id, 'hex')
    ORDER BY
      contention_count
    DESC;
    ~~~

    ~~~
                       blocking_statement                   |                      waiting_statement                       | contention_count
    --------------------------------------------------------+--------------------------------------------------------------+-------------------
      CREATE UNIQUE INDEX ON users (city, id, name)         | SELECT status, payload, progress, crdb_internal.sql_liveness |                1
      CREATE INDEX ON rides (start_time) STORING (rider_id) | SELECT status, payload, progress, crdb_internal.sql_liveness |                1
    (2 rows)
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
