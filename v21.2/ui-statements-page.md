---
title: Statements Page
summary: The Statements page helps you identify frequently executed or high latency SQL statements, view statement details, and download statement diagnostics.
toc: true
---

{% include {{ page.version.version }}/ui/admin-access.md %}

The **Statements** page helps you:

- Identify frequently executed or high latency [SQL statements](sql-statements.html).
- View SQL statement [details](#statement-details-page).
- Download SQL statement [diagnostics](#diagnostics) for troubleshooting.

To view this page, [access the DB Console](ui-overview.html#db-console-access) and click **Statements** in the left-hand navigation.

## Search and filter by application

By default, the Statements page shows SQL statements from all applications running on the cluster, including internal CockroachDB queries.

To filter the statements by [`application_name`](connection-parameters.html#additional-connection-parameters), use the **App** field. If you haven't set `application_name` in the client connection string, it appears as `unset`.

CockroachDB's internal queries are displayed under the `(internal)` app. Queries from the SQL shell are displayed under the `$ cockroach sql` app.

You can search for statements using the search field or using the date field. To search by date, pick a date range that is within the time period since the statistics were last cleared. Click **reset time** to reset the date.

## Statement statistics

{% include {{ page.version.version }}/ui/statistics.md %}

### Example

This example command shows how to query the two most important JSON columns: metadata and statistics:

~~~sql
SELECT
  aggregated_ts,
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

## SQL statement fingerprints

The Statements page displays SQL statement fingerprints.

A _statement fingerprint_ represents one or more SQL statements by replacing literal values (e.g., numbers and strings) with underscores (`_`). This can help you quickly identify frequently executed SQL statements and their latencies.

For multiple SQL statements to be represented by a fingerprint, they must be identical aside from their literal values:

- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (192, 891, 20)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (784, 452, 78)`

The preceding SQL statements have the fingerprint:

`INSERT INTO new_order(product_id, customer_id, no_w_id) VALUES (_, _, _)`

The following statements cannot be represented by the same fingerprint:

- `INSERT INTO orders(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, 11, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, $2, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, $2, $3)`

It is possible to see the same fingerprint listed multiple times in the following scenarios:

- Statements with this fingerprint were executed by more than one [`application_name`](show-vars.html#supported-variables).
- Statements with this fingerprint were executed both successfully and unsuccessfully.

## Understand the Statements page

Use the Statements page to identify SQL statements that you want to [troubleshoot](query-behavior-troubleshooting.html). This might include statements that are experiencing high latencies, multiple [retries](transactions.html#transaction-retries), or execution failures. You can optionally create and retrieve [diagnostics](#diagnostics) for these statements.

{{site.data.alerts.callout_success}}
If you haven't yet executed any queries in the cluster as a user, this page will be blank.
{{site.data.alerts.end}}

<a id="statement-fingerprint-properties"></a>

### Statements table

The Statements table gives details for each SQL statement fingerprint:

Column | Description
-----|------------
Statements | SQL statement [fingerprint](ui-statements-page.html#sql-statement-fingerprints).<br><br>To view additional details, click the SQL statement fingerprint to open its [Transaction Details page](ui-transactions-page.html#transaction-details-page).
Interval Start Time (UTC) | The start time of the statistics aggregation interval for a statement. <br><br>For example, if a statement is executed at 1:23PM it will fall in the 1:00PM - 2:00PM time interval.
Execution Count | Cumulative number of executions of statements with this fingerprint within the last hour. <br><br>The bar indicates the ratio of runtime success (gray) to [retries](transactions.html#transaction-retries) (red) for the SQL statement fingerprint.
Rows Read | Average number of rows [read from disk](architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) while executing statements with this fingerprint within the last hour).<br><br>The gray bar indicates the mean number of rows returned. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Bytes Read | Aggregation of all bytes [read from disk](architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) across all operators for statements with this fingerprint within the last hour. <br><br>The gray bar indicates the mean number of bytes read from disk. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Statement Time | Average [planning and execution time](architecture/sql-layer.html#sql-parser-planner-executor) of statements with this statement fingerprint within the last hour. <br><br>The gray bar indicates the mean latency. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Contention | Average time statements with this fingerprint were [in contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) with other transactions within the last hour. <br><br>The gray bar indicates mean contention time. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Max Memory | Maximum memory used by a statement with this fingerprint at any time during its execution within the last hour. <br><br>The gray bar indicates the average max memory usage. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Network | Amount of [data transferred over the network](architecture/reads-and-writes-overview.html) (e.g., between regions and nodes) for statements with this fingerprint within the last hour. <br><br>If this value is 0, the statement was executed on a single node. <br><br>The gray bar indicates the mean number of bytes sent over the network. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Retries | Cumulative number of [retries](transactions.html#transaction-retries) of statements with this fingerprint within the last hour.
% of All Runtime  | How much time this statement fingerprint took to execute compared to all other statements that were executed within the time period. It is expressed as a percentage. The runtime is the mean execution latency multiplied by the execution count.
Regions/Nodes | The regions and nodes on which statements with this fingerprint executed.
Diagnostics | Activate and download [diagnostics](#diagnostics) for this fingerprint. To activate, click the **Activate** button. The column displays the status of diagnostics collection (`WAITING`, `READY`, OR `ERROR`). When the status is `READY`, click <img src="{{ 'images/v21.2/ui-download-button.png' | relative_url }}" alt="Download bundle" /> to download the most recent diagnostics bundle. <br><br>Statements are periodically cleared from the Statements page based on the start time. To access the full history of diagnostics for the fingerprint, see the [Diagnostics](#diagnostics) section of the Statement Details page.

## Statement Details page

Click a SQL statement fingerprint to open **Statement Details**. For each statement fingerprint, the details include:

- [Overview](#overview)
- [Diagnostics](#diagnostics)
- [Explain plan](#explain-plan)
- [Execution stats](#execution-stats)

The Statement Details page supports the search param `aggregated_ts`. If set, the page displays the statement statistics aggregated at that interval. If unset, the page displays the statement statistics aggregated over the date range specified on the Statements page.

### Overview

The **Overview** section displays the SQL statement fingerprint and essential statistics:

**Mean statement time** is the cumulative time taken to execute statements with this fingerprint within the last hour.

  - **Planning time** is the cumulative time taken by the [planner](architecture/sql-layer.html#sql-parser-planner-executor) to create an execution plan for statements with this fingerprint within the specified time interval.
  - **Execution time** is the cumulative time taken to execute statements with this fingerprint in the specified time interval.

**Resource usage** displays statistics about storage, memory, and network usage for the SQL statement fingerprint.

  - **Mean rows/bytes read** displays the mean average number of rows and bytes [read from the storage layer](architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) for statements with this fingerprint within the last hour .
  - **Max memory usage** displays the maximum memory used by a statement with this fingerprint at any time during its execution within the last hour or specified time interval.
  - **Network usage** displays the amount of [data transferred over the network](architecture/reads-and-writes-overview.html) (e.g., between regions and nodes) for statements with this fingerprint within the last hour. If this value is 0, the statement was executed on a single node.
  - **Max scratch disk usage** displays the maximum amount of data [spilled to temporary storage on disk](vectorized-execution.html#disk-spilling-operations) while executing statements with this fingerprint within the last hour or specified time interval.

**Statement details** displays information about the execution of the statement.


- **Interval start time** represents the start time of the statistics aggregation interval for a statement. For example, if a statement is executed at 1:23PM it will fall in the 1:00PM - 2:00PM time interval.
- **Nodes** displays the nodes on which the statements executed. Click the node ID to view node statistics.
- **Regions** displays the regions on which the statements executed.
- **Database** displays the database on which the statements executed.
- **App** displays the name specified by the [`application_name`](show-vars.html#supported-variables) session setting.
- **Failed?** indicates whether the statement failed to execute.
- **Used cost-based optimizer?** indicates whether the execution used the [cost-based optimizer](cost-based-optimizer.html).
- **Distributed execution?** indicates whether the execution was distributed.
- **Vectorized execution?** indicates whether the execution used the [vectorized execution engine](vectorized-execution.html).
- **Transaction type** displays the type of transaction (implicit or explicit).
- **Last execution time** shows when the statement was last executed.

**Execution counts** displays execution statistics for the SQL statement fingerprint.

  - **First attempts** is the cumulative number of first attempts at executing statements with this fingerprint within the last hour.
  - **Total executions** is the total number of executions of statements with this fingerprint. It is calculated as the sum of first attempts and retries.
  - **Retries** is the cumulative number of [retries](transactions.html#transaction-retries) of statements with this fingerprint within the last hour.
  - **Max Retries** is the highest number of retries of a single statement with this fingerprint within the last hour. For example, if three statements with the same fingerprint had to be retried 0, 1, and 5 times, then the Max Retries value for the fingerprint is 5.

### Diagnostics

The **Diagnostics** section allows you to activate and download diagnostics for the SQL statement fingerprint.

When you activate diagnostics for a fingerprint, CockroachDB waits for the next SQL query that matches this fingerprint to be run on any node. On the next match, information about the SQL statement is written to a diagnostics bundle that you can download. This bundle consists of [statement traces](show-trace.html) in various formats (including a JSON file that can be [imported to Jaeger](query-behavior-troubleshooting.html#visualize-statement-traces-in-jaeger)), a physical query plan, execution statistics, and other information about the query. The bundle contents are identical to those produced by [`EXPLAIN ANALYZE (DEBUG)`](explain-analyze.html#debug-option). You can use the information collected in the bundle to diagnose problematic SQL statements, such as [slow queries](query-behavior-troubleshooting.html#query-is-always-slow). We recommend that you share the diagnostics bundle with our [support team](support-resources.html), which can help you interpret the results.

{{site.data.alerts.callout_success}}
Diagnostics will be collected a maximum of *N* times for a given activated fingerprint where *N* is the number of nodes in your cluster.
{{site.data.alerts.end}}

{% include {{ page.version.version }}/sql/statement-bundle-warning.md %}

#### Activate diagnostics collection and download bundles

<img src="{{ 'images/v21.2/ui_activate_diagnostics.png' | relative_url }}" alt="Statements diagnostics" style="border:1px solid #eee;max-width:80%" />

To activate diagnostics collection, click the **Activate diagnostics** button.

A row  with the activation time and collection status is added to the **Statement diagnostics** table. The statuses are:

  - `WAITING` indicates that a SQL statement matching the fingerprint has not yet been recorded.
  - `ERROR` indicates that the attempt at diagnostics collection failed.
  - `READY` indicates that the diagnostics have been collected. Click <img src="{{ 'images/v21.2/ui-download-button.png' | relative_url }}" alt="Download bundle" /> **Bundle (.zip)** to download the diagnostics bundle.

<img src="{{ 'images/v21.2/ui_statements_diagnostics.png' | relative_url }}" alt="Statements diagnostics" style="border:1px solid #eee;max-width:80%" />

#### View and download diagnostic bundles for all statement fingerprints

Although fingerprints are periodically cleared from the Statements page, all diagnostics bundles are preserved. To view and download diagnostic bundles for all statement fingerprints do one of the following:

- On the Diagnostics page for a statement fingerprint, click the **All statement diagnostics** link.

- Click **Advanced Debug** in the left-hand navigation and click [Statement Diagnostics History](ui-debug-pages.html#reports).

Click <img src="{{ 'images/v21.2/ui-download-button.png' | relative_url }}" alt="Download bundle" /> **Bundle (.zip)** to download any diagnostics bundle.

### Explain Plan

The **Explain Plan** section displays CockroachDB's statement plan for an [explainable statement](sql-grammar.html#preparable_stmt). You can use this information to optimize the query. For more information about plans, see [`EXPLAIN`](explain.html).

By default, the explain plan for each fingerprint is sampled every 5 minutes. You can change the interval with the [`sql.metrics.statement_details.plan_collection.period`](cluster-settings.html#settings) cluster setting. For example, to change the interval to 2 minutes, run the following [`SET CLUSTER SETTING`](set-cluster-setting.html) command:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.metrics.statement_details.plan_collection.period  = '2m0s';
~~~

### Execution Stats

The Execution Stats section has three subsections:

- **Execution Latency by Phase** displays the service latency of statements matching this fingerprint, broken down by [phase](architecture/sql-layer.html#sql-parser-planner-executor) (parse, plan, run, overhead), as well as the overall service latency. Overhead comprises the statements that remain after subtracting parse, plan, and run latencies from the overall latency. These might include fetching table descriptors that were not cached, or other background tasks required to execute the query.

    {{site.data.alerts.callout_info}}
    Service latency can be affected by network latency, which is displayed for your cluster on the [Network Latency](ui-network-latency-page.html) page.
    {{site.data.alerts.end}}

- **Other Execution Statistics** displays the following statistics.

    Statistic | Description
    ----------|------------
    Rows Read | The number of rows read by the statement. The gray bar indicates the mean number of rows read. The blue bar indicates one standard deviation from the mean.
    Disk Bytes Read | The size of the data read by the statement. The gray bar indicates the mean number of bytes read. The blue bar indicates one standard deviation from the mean.

- **Stats by Node** provides a breakdown of the number of statements of the selected fingerprint per gateway node. You can use this table to determine whether, for example, you are executing queries on a node that is far from the data you are requesting (see [Make Queries Fast](make-queries-fast.html#cluster-topology)).

## See also

- [Troubleshoot Query Behavior](query-behavior-troubleshooting.html)
- [Transaction retries](transactions.html#transaction-retries)
- [Make Queries Fast](make-queries-fast.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
- [Transactions Page](ui-transactions-page.html)
