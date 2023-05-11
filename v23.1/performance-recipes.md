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

<table>
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
      <li>The Transactions page in the <a href="../cockroachcloud/transactions-page.html">{{ site.data.products.db }} Console</a> or <a href="ui-transactions-page.html#active-executions-table">DB Console</a> shows transactions with <code>Waiting</code> status.</li>
      <li>Your application is experiencing degraded performance with <code>SQLSTATE: 40001</code> and a <a href="transaction-retry-error-reference.html#transaction-retry-error-reference">transaction retry error</a> message.</li>
      <li>Querying the <a href="crdb-internal.html#transaction_contention_events"><code>crdb_internal.transaction_contention_events</code></a> table indicates that your transactions have experienced contention.</li>
      <li>The SQL Statement Contention graph in the <a href="../cockroachcloud/metrics-page.html#sql-statement-contention">{{ site.data.products.db }} Console</a> or <a href="ui-sql-dashboard.html#sql-statement-contention">DB Console</a> is showing spikes over time.</li>
      <li>The Transaction Restarts graph in the <a href="../cockroachcloud/metrics-page.html#transaction-restarts">{{ site.data.products.db }} Console</a> or <a href="ui-sql-dashboard.html#transaction-restarts">DB Console</a> is showing spikes in retries over time.</li>
    </td>
    <td><ul><li>Your application is experiencing <a href="performance-best-practices-overview.html#transaction-contention">transaction contention</a>.</li></ul></td>
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
    <td><ul><li>Your cluster has <a href="performance-best-practices-overview.html#hot-spots">hot spots</a>.</li></ul></td>
    <td><ul><li><a href="#hot-spots">Reduce hot spots</a>.</li></ul></td>
  </tr>
  <tr>
    <td><ul>
      <li>The statement plan produced by <a href="explain.html"><code>EXPLAIN</code></a> or <a href="explain-analyze.html"><code>EXPLAIN ANALYZE</code></a> indicates that the statement uses a full table scan.</li>
      <li>Querying the <code>crdb_internal.node_statement_statistics</code> table indicates that you have full table scans in some statement's plans.</li>
      <li>Viewing the statement plan on the <a href="ui-statements-page.html#statement-fingerprint-page">Statement Fingerprint page</a> in the DB Console indicates that the plan contains full table scans.</li>
      <li>Running the <a href="show-full-table-scans.html"><code>SHOW FULL TABLE SCANS</code></a> statement returns results.</li>
      <li>The <a href="ui-sql-dashboard.html#full-table-index-scans">Full Table/Index Scans graph</a> in the DB Console is showing spikes over time.</li>
    </ul>
    </td>
    <td><ul><li>Poor quality statement plans retrieve more rows than are required, leading to longer execution times.</li></ul></td>
    <td><ul><li><a href="#statements-with-full-table-scans">Use indexes to reduce full table scans.</a></li></ul></td>
  </tr>
  <tr>
    <td><ul>
      <li>The <a href="ui-hardware-dashboard.html">Hardware metrics dashboard</a> in the DB Console shows high resource usage per node.</li>
      <li>The Problem Ranges report on the <a href="ui-debug-pages.html">Advanced Debug page</a> in the DB Console indicates a high number of queries per second on a subset of ranges or nodes.</li>
    </ul>
    </td>
    <td><ul><li>You have resource contention.</li></ul></td>
    <td><ul><li><a href="#suboptimal-primary-keys">Improve primary key usage.</a></li></ul></td>
  </tr>
  <tr>
    <td><ul><li>The <a href="ui-overview-dashboard.html#">Overview dashboard</a> in the DB Console shows high service latency and QPS for <code>INSERT</code> and <code>UPDATE</code> statements.</li></ul></td>
    <td><ul><li>Your tables have long write times.</li></ul></td>
    <td><ul><li><a href="#slow-writes">Remove unnecessary indexes.</a></li></ul></td>
  </tr>
  <tr>
    <td><ul><li>You experience high latency on queries that cannot be explained by high contention or a suboptimal query plan. You might also see high CPU on one or more nodes.</li></ul></td>
    <td><ul><li>You may be scanning over large numbers of <a href="architecture/storage-layer.html#mvcc">MVCC versions</a>. This is similar to how a full table scan can be slow.</li></ul></td>
    <td><ul><li><a href="#too-many-mvcc-values">Configure CockroachDB to purge unneeded MVCC values.</a></li></ul></td>
  </tr>
</table>

## Solutions

This section provides solutions for common performance issues in your applications.

### Transaction contention

[Transaction contention](performance-best-practices-overview.html#transaction-contention) is a state of conflict that occurs when:

- A [transaction](transactions.html) is unable to complete due to another concurrent or recent transaction attempting to write to the same data. This is also called *lock contention*.
- A transaction is [automatically retried](transactions.html#automatic-retries) because it could not be placed into a [serializable ordering](demo-serializable.html) among all of the currently-executing transactions. If the automatic retry is not possible or fails, a [*transaction retry error*](transaction-retry-error-reference.html) is emitted to the client, requiring the client application to [retry the transaction](transaction-retry-error-reference.html#client-side-retry-handling).

#### Indicators that your application is experiencing transaction contention

##### Waiting transaction

These are indicators that a transaction is trying to access a row that has been ["locked"](architecture/transaction-layer.html#writing) by another, concurrent write transaction.

- The **Active Executions** table on the **Transactions** page ([{{ site.data.products.db }} Console](../cockroachcloud/transactions-page.html) or [DB Console](ui-transactions-page.html#active-executions-table)) shows transactions with `Waiting` in the **Status** column. You can sort the table by **Time Spent Waiting**.
- Querying the [`crdb_internal.cluster_locks`](crdb-internal.html#cluster_locks) table shows transactions where [`granted`](crdb-internal.html#cluster-locks-columns) is `false`.

These are indicators that lock contention occurred in the past:

- Querying the [`crdb_internal.transaction_contention_events`](crdb-internal.html#transaction_contention_events) table indicates that your transactions have experienced lock contention.

  - This is also shown in the **Transaction Executions** view on the **Insights** page ([{{ site.data.products.db }} Console](../cockroachcloud/insights-page.html#transaction-executions-view) and [DB Console](ui-insights-page.html#transaction-executions-view)). Transaction executions will display the **High Contention** insight. 
    {{site.data.alerts.callout_info}}
    {% include {{ page.version.version }}/performance/sql-trace-txn-enable-threshold.md %}
    {{site.data.alerts.end}}

- The **SQL Statement Contention** graph ([{{ site.data.products.db }} Console](../cockroachcloud/metrics-page.html#sql-statement-contention) and [DB Console](ui-sql-dashboard.html#sql-statement-contention)) is showing spikes over time.
  <img src="{{ 'images/v23.1/ui-statement-contention.png' | relative_url }}" alt="SQL Statement Contention graph in DB Console" style="border:1px solid #eee;max-width:100%" />

If a long-running transaction is waiting due to [lock contention](performance-best-practices-overview.html#transaction-contention): 

1. [Identify the blocking transaction](#identify-conflicting-transactions). 
1. Evaluate whether you can cancel the transaction. If so, [cancel it](#cancel-a-blocking-transaction) to unblock the waiting transaction.
1. Optimize the transaction to [reduce further contention](#reduce-transaction-contention). In particular, break down larger transactions such as [bulk deletes](bulk-delete-data.html) into smaller ones to have transactions hold locks for a shorter duration, and use [historical reads](as-of-system-time.html) when possible to reduce conflicts with other writes.

If lock contention occurred in the past, you can [identify the transactions and objects that experienced lock contention](#identify-transactions-and-objects-that-experienced-lock-contention).

##### Transaction retry error

These are indicators that a transaction has failed due to [contention](performance-best-practices-overview.html#transaction-contention).

- A [transaction retry error](transaction-retry-error-reference.html) with `SQLSTATE: 40001`, the string [`restart transaction`](common-errors.html#restart-transaction), and an error code such as [`RETRY_WRITE_TOO_OLD`](transaction-retry-error-reference.html#retry_write_too_old) or [`RETRY_SERIALIZABLE`](transaction-retry-error-reference.html#retry_serializable), is emitted to the client.
- An event with `TransactionRetryWithProtoRefreshError` is emitted to the CockroachDB [logs](logging-use-cases.html#example-slow-sql-query).

These are indicators that transaction retries occurred in the past:

- The **Transaction Restarts** graph ([{{ site.data.products.db }} Console](../cockroachcloud/metrics-page.html#transaction-restarts) and [DB Console](ui-sql-dashboard.html#transaction-restarts) is showing spikes in transaction retries over time.

{% include {{ page.version.version }}/performance/transaction-retry-error-actions.md %}

#### Fix transaction contention problems

Identify the transactions that are in conflict, and unblock them if possible. In general, take steps to [reduce transaction contention](#reduce-transaction-contention).

In addition, implement [client-side retry handling](transaction-retry-error-reference.html#client-side-retry-handling) so that your application can respond to [transaction retry errors](transaction-retry-error-reference.html) that are emitted when CockroachDB cannot [automatically retry](transactions.html#automatic-retries) a transaction.

##### Identify conflicting transactions

- In the **Active Executions** table on the **Transactions** page ([{{ site.data.products.db }} Console](../cockroachcloud/transactions-page.html) or [DB Console](ui-transactions-page.html#active-executions-table)), look for a **waiting** transaction (`Waiting` status).
  {{site.data.alerts.callout_success}}
  If you see many waiting transactions, a single long-running transaction may be blocking transactions that are, in turn, blocking others. In this case, sort the table by **Time Spent Waiting** to find the transaction that has been waiting for the longest amount of time. Unblocking this transaction may unblock the other transactions.
  {{site.data.alerts.end}}
  Click the transaction's execution ID and view the following transaction execution details:
  <img src="{{ 'images/v23.1/waiting-transaction.png' | relative_url }}" alt="Movr rides transactions" style="border:1px solid #eee;max-width:100%" />
  - **Last Retry Reason** shows the last [transaction retry error](#transaction-retry-error) received for the transaction, if applicable.
  - The details of the **blocking** transaction, directly below the **Contention Insights** section. Click the blocking transaction to view its details.

##### Cancel a blocking transaction

1. [Identify the **blocking** transaction](#identify-conflicting-transactions) and view its transaction execution details.
1. Click its **Session ID** to open the **Session Details** page.
  <img src="{{ 'images/v23.1/ui-sessions-details-page.png' | relative_url }}" alt="Sessions Details Page" style="border:1px solid #eee;max-width:100%" />
1. Click **Cancel Statement** to cancel the **Most Recent Statement** and thus the transaction, or click **Cancel Session** to cancel the session issuing the transaction.

##### Identify transactions and objects that experienced lock contention

To identify transactions that experienced [lock contention](performance-best-practices-overview.html#transaction-contention) in the past:

- In the **Transaction Executions** view on the **Insights** page ([{{ site.data.products.db }} Console](../cockroachcloud/insights-page.html#transaction-executions-view) and [DB Console](ui-insights-page.html#transaction-executions-view)), look for a transaction with the **High Contention** insight. Click the transaction's execution ID and view the transaction execution details, including the details of the blocking transaction.
- Visit the **Transactions** page ([{{ site.data.products.db }} Console](../cockroachcloud/transactions-page.html) and [DB Console](ui-transactions-page.html)) and sort transactions by **Contention Time**.

To view tables and indexes that experienced [contention](performance-best-practices-overview.html#transaction-contention):

- Query the [`crdb_internal.transaction_contention_events`](crdb-internal.html#transaction_contention_events) table to view [transactions that have blocked other transactions](crdb-internal.html#transaction-contention-example).
- Query the [`crdb_internal.cluster_contended_tables`](crdb-internal.html#cluster_contended_tables) table to [view all tables that have experienced contention](crdb-internal.html#view-all-tables-that-have-experienced-contention).
- Query the [`crdb_internal.cluster_contended_indexes`](crdb-internal.html#cluster_contended_indexes) table to [view all indexes that have experienced contention](crdb-internal.html#view-all-indexes-that-have-experienced-contention).
- Query the [`crdb_internal.cluster_contention_events`](crdb-internal.html#cluster_contention_events) table 
to [view the tables, indexes, and transactions with the most time under contention](crdb-internal.html#view-the-tables-indexes-with-the-most-time-under-contention).

##### Reduce transaction contention

[Contention](performance-best-practices-overview.html#transaction-contention) is often reported after it has already resolved. Therefore, preventing contention before it affects your cluster's performance is a more effective approach:

{% include {{ page.version.version }}/performance/reduce-contention.md %}

### Hot spots

[Hot spots](performance-best-practices-overview.html#hot-spots) are a symptom of *resource contention* and can create problems as requests increase, including excessive [transaction contention](#transaction-contention).

#### Indicators that your cluster has hot spots

- The **CPU Percent** graph on the [**Hardware**](ui-hardware-dashboard.html) and [**Overload**](ui-overload-dashboard.html) dashboards (DB Console) shows spikes in CPU usage.
- The **Hot Ranges** list on the [**Hot Ranges** page](ui-hot-ranges-page.html) (DB Console) displays a higher-than-expected QPS for a range.
- The [**Key Visualizer**](ui-key-visualizer.html) (DB Console) shows [ranges with much higher-than-average write rates](ui-key-visualizer.html#identifying-hot-spots) for the cluster.

If you find hot spots, use the [**Range Report**](ui-hot-ranges-page.html#range-report) and [**Key Visualizer**](ui-key-visualizer.html) to identify the ranges with excessive traffic. Then take steps to [reduce hot spots](#reduce-hot-spots).

#### Reduce hot spots

{% include {{ page.version.version }}/performance/reduce-hot-spots.md %}

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
* Viewing the statement plan on the [Statement details page](ui-statements-page.html#statement-fingerprint-page) in the DB Console indicates that the plan contains full table scans.
* The statement plans returned by the [`EXPLAIN`](sql-tuning-with-explain.html) and [`EXPLAIN ANALYZE` commands](explain-analyze.html) indicate that there are full table scans.
* The [Full Table/Index Scans graph](ui-sql-dashboard.html#full-table-index-scans) in the DB Console is showing spikes over time.

#### Fix full table scans in statements

Not every full table scan is an indicator of poor performance. The [cost-based optimizer](cost-based-optimizer.html) may decide on a full table scan when other [index](indexes.html) or [join scans](joins.html) would result in longer execution time.

[Examine the statements](sql-tuning-with-explain.html) that result in full table scans and consider adding [secondary indexes](schema-design-indexes.html#create-a-secondary-index).

Also see [Table scans best practices](performance-best-practices-overview.html#table-scan-best-practices).

### Suboptimal primary keys

#### Indicators that your tables are using suboptimal primary keys

* The [Hardware metrics dashboard](ui-hardware-dashboard.html) in the DB Console shows high resource usage per node.
* The Problem Ranges report on the [Advanced Debug page](ui-debug-pages.html) in the DB Console indicates a high number of queries per second on a subset of ranges or nodes.

#### Fix suboptimal primary keys

Evaluate the schema of your table to see if you can redistribute data more evenly across multiple ranges. Specifically, make sure you have followed [best practices when selecting your primary key](schema-design-table.html#primary-key-best-practices).

If your application with a small dataset (for example, a dataset that contains few index key values) is experiencing resource contention, consider splitting your tables and indexes to [distribute ranges across multiple nodes](alter-table.html#split-a-table) to reduce resource contention.

### Slow writes

#### Indicators that your tables are experiencing slow writes

If the [Overview dashboard](ui-overview-dashboard.html) in the DB Console shows high service latency when the QPS of `INSERT` and `UPDATE` statements is high, your tables are experiencing slow writes.

#### Fix slow writes

[Secondary indexes](schema-design-indexes.html) can improve application read performance. However, there is overhead in maintaining secondary indexes that can affect your write performance. You should profile your tables periodically to determine whether an index is worth the overhead. To identify infrequently accessed indexes that could be candidates to drop, do one of the following:

- In the DB Console, visit the [**Databases** page](ui-databases-page.html) and check databases and tables for [**Index Recommendations**](ui-databases-page.html#index-recommendations) to drop unused indexes.
- Run a join query against the [`crdb_internal.index_usage_statistics`](crdb-internal.html#index_usage_statistics) and `crdb_internal.table_indexes` tables:

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

In the [Databases](ui-databases-page.html#tables-view) page in the DB Console, the Tables view shows the percentage of live data for each table. For example:

<img src="{{ 'images/v23.1/ui_databases_live_data.png' | relative_url }}" alt="Table live data" style="border:1px solid #eee;max-width:100%" />

In this example, at `37.3%` the `vehicles` table would be considered to have a low percentage of live data. In the worst cases, the percentage can be `0%`.

A low percentage of live data can cause statements to scan more data ([MVCC values](architecture/storage-layer.html#mvcc)) than required, which can reduce performance.

#### Configure CockroachDB to purge MVCC values

Reduce the [`gc.ttlseconds`](configure-replication-zones.html#gc-ttlseconds) zone configuration of the table as much as possible.

## See also

If you aren't sure whether SQL query performance needs to be improved, see [Identify slow queries](query-behavior-troubleshooting.html#identify-slow-queries).
