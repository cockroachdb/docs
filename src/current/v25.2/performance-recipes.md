---
title: Performance Tuning Recipes
summary: Identify, diagnose, and fix common performance problems
toc: true
toc_not_nested: false
docs_area: develop
---

This page provides recipes for fixing performance issues in your applications.

## Problems

This section describes how to use CockroachDB commands and dashboards to identify performance problems in your applications.

<table markdown="1">
  <tr>
    <th>Observation</th>
    <th>Diagnosis</th>
    <th>Solution</th>
  </tr>
  <tr>
    <tr>
      <td><ul><li>Your application takes a long time to return results.</li></ul></td>
      <td><ul><li>Excess network latency.</li></ul></td>
      <td><ul><li>Use the correct <a href="topology-patterns.html">topology pattern</a> for your cluster.</li></ul></td>
    </tr>
    <td><ul>
      <li>The Transactions page in the <a href="{% link cockroachcloud/transactions-page.md %}">CockroachDB {{ site.data.products.cloud }} Console</a> or <a href="ui-transactions-page.html#active-executions-table">DB Console</a> shows transactions with <code>Waiting</code> status.</li>
      <li>Your application is experiencing degraded performance with <code>SQLSTATE: 40001</code> and a <a href="{% link {{ page.version.version }}/transaction-retry-error-reference.md %}#transaction-retry-error-reference">transaction retry error</a> message.</li>
      <li>Querying the <a href="{% link {{ page.version.version }}/crdb-internal.md %}#transaction_contention_events"><code>crdb_internal.transaction_contention_events</code></a> table indicates that your transactions have experienced contention.</li>
      <li>The SQL Statement Contention graph in the [CockroachDB {{ site.data.products.cloud }} Console]({% link cockroachcloud/metrics-sql.md %}#sql-statement-contention) or <a href="ui-sql-dashboard.html#sql-statement-contention">DB Console</a> is showing spikes over time.</li>
      <li>The Transaction Restarts graph in the [CockroachDB {{ site.data.products.cloud }} Console]({% link cockroachcloud/metrics-sql.md %}#transaction-restarts) or <a href="ui-sql-dashboard.html#transaction-restarts">DB Console</a> is showing spikes in retries over time.</li>
    </td>
    <td><ul><li>Your application is experiencing <a href="{% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention">transaction contention</a>.</li></ul></td>
    <td>
      <ul>
        <li><a href="#transaction-contention">Reduce transaction contention.</a></li>
      </ul></td>
  </tr>
  <tr>
    <td><ul>
      <li>The <b>Hot Ranges</b> page (DB Console) displays a higher-than-expected QPS for a range.</li>
      <li>The <b>Key Visualizer</b> (DB Console) shows ranges with much higher-than-average write rates for the cluster.</li>
    </ul></td>
    <td><ul><li>Your cluster has <a href="{% link {{ page.version.version }}/understand-hotspots.md %}">hotspots</a>.</li></ul></td>
    <td><ul><li><a href="#hotspots">Reduce hotspots</a>.</li></ul></td>
  </tr>
  <tr>
    <td><ul>
      <li>The statement plan produced by <a href="explain.html"><code>EXPLAIN</code></a> or <a href="explain-analyze.html"><code>EXPLAIN ANALYZE</code></a> indicates that the statement uses a full table scan.</li>
      <li>Querying the <code>crdb_internal.node_statement_statistics</code> table indicates that you have full table scans in some statement's plans.</li>
      <li>Viewing the statement plan on the <a href="{% link {{ page.version.version }}/ui-statements-page.md %}#statement-fingerprint-page">Statement Fingerprint page</a> in the DB Console indicates that the plan contains full table scans.</li>
      <li>Running the <a href="show-full-table-scans.html"><code>SHOW FULL TABLE SCANS</code></a> statement returns results.</li>
      <li>The <a href="{% link {{ page.version.version }}/ui-sql-dashboard.md %}#full-table-index-scans">Full Table/Index Scans graph</a> in the DB Console is showing spikes over time.</li>
    </ul>
    </td>
    <td><ul><li>Poor quality statement plans retrieve more rows than are required, leading to longer execution times.</li></ul></td>
    <td><ul><li><a href="#statements-with-full-table-scans">Use indexes to reduce full table scans.</a></li></ul></td>
  </tr>
  <tr>
    <td><ul>
      <li>The <a href="{% link {{ page.version.version }}/ui-hardware-dashboard.md %}">Hardware metrics dashboard</a> in the DB Console shows high resource usage per node.</li>
      <li>The Problem Ranges report on the <a href="{% link {{ page.version.version }}/ui-debug-pages.md %}">Advanced Debug page</a> in the DB Console indicates a high number of queries per second on a subset of ranges or nodes.</li>
    </ul>
    </td>
    <td><ul><li>You have resource contention.</li></ul></td>
    <td><ul><li><a href="#suboptimal-primary-keys">Improve primary key usage.</a></li></ul></td>
  </tr>
  <tr>
    <td><ul><li>The <a href="{% link {{ page.version.version }}/ui-overview-dashboard.md %}#">Overview dashboard</a> in the DB Console shows high service latency and QPS for <code>INSERT</code> and <code>UPDATE</code> statements.</li></ul></td>
    <td><ul><li>Your tables have long write times.</li></ul></td>
    <td><ul><li><a href="#slow-writes">Remove unnecessary indexes.</a></li></ul></td>
  </tr>
  <tr>
    <td><ul><li>You experience high latency on queries that cannot be explained by high contention or a suboptimal query plan. You might also see high CPU on one or more nodes.</li></ul></td>
    <td><ul><li>You may be scanning over large numbers of <a href="{% link {{ page.version.version }}/architecture/storage-layer.md %}#mvcc">MVCC versions</a>. This is similar to how a full table scan can be slow.</li></ul></td>
    <td><ul><li><a href="#too-many-mvcc-values">Configure CockroachDB to purge unneeded MVCC values.</a></li></ul></td>
  </tr>
  <tr>
    <td><ul><li>vCPU usage has plateaued (possibly around 70%) on your large cluster.</li></ul></td>
    <td><ul><li><a href="architecture/distribution-layer.html#distsender">KV layer DistSender</a> batches may be getting throttled; check if the <code>distsender.batches.async.throttled</code> metric is greater than <code>0</code>.</li></ul></td>
    <td><ul><li>Increase the <code>kv.dist_sender.concurrency_limit</code> <a href="cluster-settings.html">cluster setting</a>.</li></ul></td>
  </tr>
</table>

## Solutions

This section provides solutions for common performance issues in your applications.

### Transaction contention

[Transaction contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) is a state of conflict that occurs when:

- A [transaction]({% link {{ page.version.version }}/transactions.md %}) is unable to complete due to another concurrent or recent transaction attempting to write to the same data. This is also called *lock contention*.
- A transaction is [automatically retried]({% link {{ page.version.version }}/transactions.md %}#automatic-retries) because it could not be placed into a [serializable ordering]({% link {{ page.version.version }}/demo-serializable.md %}) among all of the currently-executing transactions. If the automatic retry is not possible or fails, a [*transaction retry error*]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}) is emitted to the client, requiring a client application running under [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) isolation to [retry the transaction]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#client-side-retry-handling). This is also called a *serialization conflict*, or an *isolation conflict*.

#### Indicators that your application is experiencing transaction contention

##### Waiting transaction

These are indicators that a transaction is trying to access a row that has been ["locked"]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#writing) by another, concurrent transaction issuing a [write]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#write-intents) or [locking read]({% link {{ page.version.version }}/select-for-update.md %}#lock-strengths).

- The **Active Executions** table on the **Transactions** page ([CockroachDB {{ site.data.products.cloud }} Console]({% link cockroachcloud/transactions-page.md %}) or [DB Console]({% link {{ page.version.version }}/ui-transactions-page.md %}#active-executions-table)) shows transactions with `Waiting` in the **Status** column. You can sort the table by **Time Spent Waiting**.
- Querying the [`crdb_internal.cluster_locks`]({% link {{ page.version.version }}/crdb-internal.md %}#cluster_locks) table shows transactions where [`granted`]({% link {{ page.version.version }}/crdb-internal.md %}#cluster-locks-columns) is `false`.

These are indicators that lock contention occurred in the past:

- Querying the [`crdb_internal.transaction_contention_events`]({% link {{ page.version.version }}/crdb-internal.md %}#transaction_contention_events) table `WHERE contention_type='LOCK_WAIT'` indicates that your transactions have experienced lock contention.

  - This is also shown in the **Transaction Executions** view on the **Insights** page ([CockroachDB {{ site.data.products.cloud }} Console]({% link cockroachcloud/insights-page.md %}#transaction-executions-view) and [DB Console]({% link {{ page.version.version }}/ui-insights-page.md %}#transaction-executions-view)). Transaction executions will display the [**High Contention** insight]({% link {{ page.version.version }}/ui-insights-page.md %}#high-contention).
    {{site.data.alerts.callout_info}}
    {%- include {{ page.version.version }}/performance/sql-trace-txn-enable-threshold.md -%}
    {{site.data.alerts.end}}

- The **SQL Statement Contention** graph ([CockroachDB {{ site.data.products.cloud }} Console]({% link cockroachcloud/metrics-sql.md %}#sql-statement-contention) and [DB Console]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#sql-statement-contention)) is showing spikes over time.
  <img src="/docs/images/{{ page.version.version }}/ui-statement-contention.png" alt="SQL Statement Contention graph in DB Console" style="border:1px solid #eee;max-width:100%" />

If a long-running transaction is waiting due to [lock contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention):

1. [Identify the blocking transaction](#identify-conflicting-transactions).
1. Evaluate whether you can cancel the transaction. If so, [cancel it](#cancel-a-blocking-transaction) to unblock the waiting transaction.
1. Optimize the transaction to [reduce further contention](#reduce-transaction-contention). In particular, break down larger transactions such as [bulk deletes]({% link {{ page.version.version }}/bulk-delete-data.md %}) into smaller ones to have transactions hold locks for a shorter duration, and use [historical reads]({% link {{ page.version.version }}/as-of-system-time.md %}) when possible to reduce conflicts with other writes.

If lock contention occurred in the past, you can [identify the transactions and objects that experienced lock contention](#identify-transactions-and-objects-that-experienced-lock-contention).

##### Transaction retry error

These are indicators that a transaction has failed due to [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention).

- A [transaction retry error]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}) with `SQLSTATE: 40001`, the string [`restart transaction`]({% link {{ page.version.version }}/common-errors.md %}#restart-transaction), and an error code such as [`RETRY_WRITE_TOO_OLD`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#retry_write_too_old) or [`RETRY_SERIALIZABLE`]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#retry_serializable), is emitted to the client. These errors are typically seen under [`SERIALIZABLE`]({% link {{ page.version.version }}/demo-serializable.md %}) and not [`READ COMMITTED`]({% link {{ page.version.version }}/read-committed.md %}) isolation.
- Querying the [`crdb_internal.transaction_contention_events`]({% link {{ page.version.version }}/crdb-internal.md %}#transaction_contention_events) table `WHERE contention_type='SERIALIZATION_CONFLICT'` indicates that your transactions have experienced serialization conflicts.
  - This is also shown in the **Transaction Executions** view on the **Insights** page ([CockroachDB {{ site.data.products.cloud }} Console]({% link cockroachcloud/insights-page.md %}#transaction-executions-view) and [DB Console]({% link {{ page.version.version }}/ui-insights-page.md %}#transaction-executions-view)). Transaction executions will display the [**Failed Execution** insight due to a serialization conflict]({% link {{ page.version.version }}/ui-insights-page.md %}#serialization-conflict-due-to-transaction-contention).

These are indicators that transaction retries occurred in the past:

- The **Transaction Restarts** graph ([CockroachDB {{ site.data.products.cloud }} Console]({% link cockroachcloud/metrics-sql.md %}#transaction-restarts) and [DB Console]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#transaction-restarts)) is showing spikes in transaction retries over time.

{% include {{ page.version.version }}/performance/transaction-retry-error-actions.md %}

#### Fix transaction contention problems

Identify the transactions that are in conflict, and unblock them if possible. In general, take steps to [reduce transaction contention](#reduce-transaction-contention).

When running under `SERIALIZABLE` isolation, implement [client-side retry handling]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}#client-side-retry-handling) so that your application can respond to [transaction retry errors]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}) that are emitted when CockroachDB cannot [automatically retry]({% link {{ page.version.version }}/transactions.md %}#automatic-retries) a transaction.

##### Identify conflicting transactions

- In the **Active Executions** table on the **Transactions** page ([CockroachDB {{ site.data.products.cloud }} Console]({% link cockroachcloud/transactions-page.md %}) or [DB Console]({% link {{ page.version.version }}/ui-transactions-page.md %}#active-executions-table)), look for a **waiting** transaction (`Waiting` status).
  {{site.data.alerts.callout_success}}
  If you see many waiting transactions, a single long-running transaction may be blocking transactions that are, in turn, blocking others. In this case, sort the table by **Time Spent Waiting** to find the transaction that has been waiting for the longest amount of time. Unblocking this transaction may unblock the other transactions.
  {{site.data.alerts.end}}
  Click the transaction's execution ID and view the following transaction execution details:
  <img src="/docs/images/{{ page.version.version }}/waiting-transaction.png" alt="Movr rides transactions" style="border:1px solid #eee;max-width:100%" />
  - **Last Retry Reason** shows the last [transaction retry error](#transaction-retry-error) received for the transaction, if applicable.
  - The details of the **blocking** transaction, directly below the **Contention Insights** section. Click the blocking transaction to view its details.

##### Cancel a blocking transaction

1. [Identify the **blocking** transaction](#identify-conflicting-transactions) and view its transaction execution details.
1. Click its **Session ID** to open the **Session Details** page.
  <img src="/docs/images/{{ page.version.version }}/ui-sessions-details-page.png" alt="Sessions Details Page" style="border:1px solid #eee;max-width:100%" />
1. Click **Cancel Statement** to cancel the **Most Recent Statement** and thus the transaction, or click **Cancel Session** to cancel the session issuing the transaction.

##### Identify transactions and objects that experienced lock contention

To identify transactions that experienced [lock contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) in the past:

- In the **Transaction Executions** view on the **Insights** page ([CockroachDB {{ site.data.products.cloud }} Console]({% link cockroachcloud/insights-page.md %}#transaction-executions-view) and [DB Console]({% link {{ page.version.version }}/ui-insights-page.md %}#transaction-executions-view)), look for a transaction with the **High Contention** insight. Click the transaction's execution ID and view the transaction execution details, including the details of the blocking transaction.
- Visit the **Transactions** page ([CockroachDB {{ site.data.products.cloud }} Console]({% link cockroachcloud/transactions-page.md %}) and [DB Console]({% link {{ page.version.version }}/ui-transactions-page.md %})) and sort transactions by **Contention Time**.

To view tables and indexes that experienced [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention):

- Query the [`crdb_internal.transaction_contention_events`]({% link {{ page.version.version }}/crdb-internal.md %}#transaction_contention_events) table to view [transactions that have blocked other transactions]({% link {{ page.version.version }}/crdb-internal.md %}#transaction-contention-example).
- Query the [`crdb_internal.cluster_contended_tables`]({% link {{ page.version.version }}/crdb-internal.md %}#cluster_contended_tables) table to [view all tables that have experienced contention]({% link {{ page.version.version }}/crdb-internal.md %}#view-all-tables-that-have-experienced-contention).
- Query the [`crdb_internal.cluster_contended_indexes`]({% link {{ page.version.version }}/crdb-internal.md %}#cluster_contended_indexes) table to [view all indexes that have experienced contention]({% link {{ page.version.version }}/crdb-internal.md %}#view-all-indexes-that-have-experienced-contention).
- Query the [`crdb_internal.cluster_contention_events`]({% link {{ page.version.version }}/crdb-internal.md %}#cluster_contention_events) table
to [view the tables, indexes, and transactions with the most time under contention]({% link {{ page.version.version }}/crdb-internal.md %}#view-the-tables-indexes-with-the-most-time-under-contention).

##### Reduce transaction contention

[Contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) is often reported after it has already resolved. Therefore, preventing contention before it affects your cluster's performance is a more effective approach:

{% include {{ page.version.version }}/performance/reduce-contention.md %}

### Hotspots

Hotspots are a symptom of *resource contention* and can create problems as requests increase, including excessive [transaction contention](#transaction-contention).

For a detailed explanation of hotspot causes and mitigation strategies, refer to the [Understand Hotspots]({% link {{ page.version.version }}/understand-hotspots.md %}) and the [Detect Hotspots]({% link {{ page.version.version }}/detect-hotspots.md %}) pages.

#### Indicators that your cluster has hotspots

- The **CPU Percent** graph on the [**Hardware**]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}) and [**Overload**]({% link {{ page.version.version }}/ui-overload-dashboard.md %}) dashboards (DB Console) shows spikes in CPU usage.
- The **Hot Ranges** list on the [**Hot Ranges** page]({% link {{ page.version.version }}/ui-hot-ranges-page.md %}) (DB Console) displays a higher-than-expected QPS for a range.
- The [**Key Visualizer**]({% link {{ page.version.version }}/ui-key-visualizer.md %}) (DB Console) shows [ranges with much higher-than-average write rates]({% link {{ page.version.version }}/ui-key-visualizer.md %}#identifying-hotspots) for the cluster.

If you find hotspots, use the [**Range Report**]({% link {{ page.version.version }}/ui-hot-ranges-page.md %}#range-report) and [**Key Visualizer**]({% link {{ page.version.version }}/ui-key-visualizer.md %}) to identify the ranges with excessive traffic. Then take steps to [reduce hotspots](#reduce-hotspots).

#### Reduce hotspots

{% include {{ page.version.version }}/performance/reduce-hotspots.md %}

### Statements with full table scans

Full table scans often result in poor statement performance.

#### Indicators that your application has statements with full table scans

* The following query returns statements with full table scans in their statement plan:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW FULL TABLE SCANS;
    ~~~
* The following query against the `crdb_internal.node_statement_statistics` table returns results:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT count(*) as total_full_scans
    FROM crdb_internal.node_statement_statistics
    WHERE full_scan = true;
    ~~~
* Viewing the statement plan on the [**Statement Fingerprint** page]({% link {{ page.version.version }}/ui-statements-page.md %}#statement-fingerprint-page) in the DB Console indicates that the plan contains full table scans.
* The statement plans returned by the [`EXPLAIN`]({% link {{ page.version.version }}/sql-tuning-with-explain.md %}) and [`EXPLAIN ANALYZE` commands]({% link {{ page.version.version }}/explain-analyze.md %}) indicate that there are full table scans.
* The [Full Table/Index Scans graph]({% link {{ page.version.version }}/ui-sql-dashboard.md %}#full-table-index-scans) in the DB Console is showing spikes over time.

#### Fix full table scans in statements

Not every full table scan is an indicator of poor performance. The [cost-based optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) may decide on a full table scan when other [index]({% link {{ page.version.version }}/indexes.md %}) or [join scans]({% link {{ page.version.version }}/joins.md %}) would result in longer execution time.

[Examine the statements]({% link {{ page.version.version }}/sql-tuning-with-explain.md %}) that result in full table scans and consider adding [secondary indexes]({% link {{ page.version.version }}/schema-design-indexes.md %}#create-a-secondary-index).

In the DB Console, visit the [**Schema Insights** tab]({% link {{ page.version.version }}/ui-insights-page.md %}#schema-insights-tab) on the [**Insights** page]({% link {{ page.version.version }}/ui-insights-page.md %}) and check if there are any insights to create missing indexes. These missing index recommendations are generated based on [slow statement execution]({% link {{ page.version.version }}/ui-insights-page.md %}#detect-slow-executions). A missing index may cause a statement to have a [suboptimal plan]({% link {{ page.version.version }}/ui-insights-page.md %}#suboptimal-plan). If the execution was slow, based on the insights threshold, then it's likely the create index recommendation is valid. If the plan had a full table scan, it's likely that it should be removed with an index.

Also see [Table scans best practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#table-scan-best-practices).

### Suboptimal primary keys

#### Indicators that your tables are using suboptimal primary keys

* The [Hardware metrics dashboard]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}) in the DB Console shows high resource usage per node.
* The Problem Ranges report on the [Advanced Debug page]({% link {{ page.version.version }}/ui-debug-pages.md %}) in the DB Console indicates a high number of queries per second on a subset of ranges or nodes.

#### Fix suboptimal primary keys

Evaluate the schema of your table to see if you can redistribute data more evenly across multiple ranges. Specifically, make sure you have followed [best practices when selecting your primary key]({% link {{ page.version.version }}/schema-design-table.md %}#primary-key-best-practices).

If your application with a small dataset (for example, a dataset that contains few index key values) is experiencing resource contention, consider splitting your tables and indexes to [distribute ranges across multiple nodes]({% link {{ page.version.version }}/alter-table.md %}#split-a-table) to reduce resource contention.

### Slow writes

#### Indicators that your tables are experiencing slow writes

If the [Overview dashboard]({% link {{ page.version.version }}/ui-overview-dashboard.md %}) in the DB Console shows high service latency when the QPS of `INSERT` and `UPDATE` statements is high, your tables are experiencing slow writes.

#### Fix slow writes

[Secondary indexes]({% link {{ page.version.version }}/schema-design-indexes.md %}) can improve application read performance. However, there is overhead in maintaining secondary indexes that can affect your write performance. You should profile your tables periodically to determine whether an index is worth the overhead. To identify infrequently accessed indexes that could be candidates to drop, do one of the following:

- In the DB Console, visit the [**Schema Insights** tab]({% link {{ page.version.version }}/ui-insights-page.md %}#schema-insights-tab) on the [**Insights** page]({% link {{ page.version.version }}/ui-insights-page.md %}) and check if there are any insights to drop unused indexes.
- In the DB Console, visit the [**Databases** page]({% link {{ page.version.version }}/ui-databases-page.md %}) and check databases and tables for [**Index Recommendations**]({% link {{ page.version.version }}/ui-databases-page.md %}#index-recommendations) to drop unused indexes.
- Run a join query against the [`crdb_internal.index_usage_statistics`]({% link {{ page.version.version }}/crdb-internal.md %}#index_usage_statistics) and `crdb_internal.table_indexes` tables:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT ti.descriptor_name as table_name, ti.index_name, total_reads, last_read
    FROM crdb_internal.index_usage_statistics AS us
    JOIN crdb_internal.table_indexes ti
    ON us.index_id = ti.index_id
    AND us.table_id = ti.descriptor_id
    ORDER BY total_reads ASC;
    ~~~

    ~~~
                  table_name     |                  index_name                   | total_reads |           last_read
    -----------------------------+-----------------------------------------------+-------------+--------------------------------
      vehicle_location_histories | vehicle_location_histories_pkey               |           1 | 2021-09-28 22:59:03.324398+00
      rides                      | rides_auto_index_fk_city_ref_users            |           1 | 2021-09-28 22:59:01.500962+00
      rides                      | rides_auto_index_fk_vehicle_city_ref_vehicles |           1 | 2021-09-28 22:59:02.470526+00
      user_promo_codes           | user_promo_codes_pkey                         |         456 | 2021-09-29 00:01:17.063418+00
      promo_codes                | promo_codes_pkey                              |         910 | 2021-09-29 00:01:17.062319+00
      vehicles                   | vehicles_pkey                                 |        3591 | 2021-09-29 00:01:18.261658+00
      users                      | users_pkey                                    |        5401 | 2021-09-29 00:01:18.260198+00
      rides                      | rides_pkey                                    |       45658 | 2021-09-29 00:01:18.258208+00
      vehicles                   | vehicles_auto_index_fk_city_ref_users         |       87119 | 2021-09-29 00:01:19.071476+00
    (9 rows)
    ~~~

    Use the values in the `total_reads` and `last_read` columns to identify indexes that have low usage or are stale and can be dropped.

### Too many MVCC values

#### Indicators that your tables have too many MVCC values

In the DB Console, the [Tables List Tab]({% link {{ page.version.version }}/ui-databases-page.md %}#tables-list-tab) of the [Database Details Page]({% link {{ page.version.version }}/ui-databases-page.md %}#database-details-page) for a given database shows the percentage of live data for each table. For example:

<img src="/docs/images/{{ page.version.version }}/ui_databases_live_data.png" alt="Table live data" style="border:1px solid #eee;max-width:100%" />

In this example, at `37.3%` the `vehicles` table would be considered to have a low percentage of live data. In the worst cases, the percentage can be `0%`.

A low percentage of live data can cause statements to scan more data ([MVCC values]({% link {{ page.version.version }}/architecture/storage-layer.md %}#mvcc)) than required, which can reduce performance.

#### Configure CockroachDB to purge MVCC values

Reduce the [`gc.ttlseconds`]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds) zone configuration of the table as much as possible.

### KV DistSender batches being throttled (performance impact to larger clusters)

If you see `distsender.batches.async.throttled` values that aren't zero (or aren't consistently near zero), experiment with increasing the [KV layer `DistSender`]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#distsender) and `Streamer` concurrency using the `kv.dist_sender.concurrency_limit` and `kv.streamer.concurrency_limit` [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}), respectively.  In v24.3, these default values were increased by 6x and 12x, respectively.  For versions prior to v24.3, increasing the values by 6x and 12x would be a good starting point.

To validate a successful result, you can increase the values of these cluster settings until you see no new throttled requests and no increase in tail latency (e.g., `p99.999`).

This does increase the amount of RAM consumption per node to handle the increased concurrency, but it's proportional to the load and an individual flow's memory consumption should not be significant. Bad outcomes include increased tail latency or too much memory consumption with no decrease in the number of throttled requests, in which case you should return the settings to their default values.

## See also

If you aren't sure whether SQL query performance needs to be improved, see [Identify slow queries]({% link {{ page.version.version }}/query-behavior-troubleshooting.md %}#identify-slow-queries).
