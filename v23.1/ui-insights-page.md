---
title: Insights Page
summary: The Insights page exposes problems that CockroachDB has detected in your workloads and schemas.
toc: true
docs_area: reference.db_console
---

{% include {{ page.version.version }}/ui/admin-access.md %}

The **Insights** page exposes problems that CockroachDB has detected in your workloads and schemas. The page also offers recommendations to improve the performance of your workloads. These are called *insights* in the DB Console.

The **Insights** page helps you:

- Identify SQL statements with [high retry counts](transactions.html#automatic-retries), [slow execution](query-behavior-troubleshooting.html#identify-slow-queries), or [suboptimal plans](cost-based-optimizer.html).
- Identify [indexes](indexes.html) that should be created, altered, replaced, or dropped to improve performance.

## Workload Insights tab

The **Workload Insights** tab displays insights related to transaction and statement executions.

### Transaction Executions view

To display this view, click **Insights** in the left-hand navigation of the DB Console.

The **Transaction Executions** view provides an overview of all transaction executions that have been flagged with insights.

{{site.data.alerts.callout_info}}
The rows in this page are populated from the [`crdb_internal.transaction_contention_events`](crdb-internal.html#transaction_contention_events) table.

- The results displayed in the **Transaction Executions** view will be available as long as the corresponding row in the `crdb_internal.transaction_contention_events` table exists and as long as the rows in each node use less space than `sql.contention.event_store.capacity`.
- The default tracing behavior captures a small percent of transactions so not all contention events will be recorded. When investigating transaction contention, you can set the `sql.trace.txn.enable_threshold` [cluster setting](cluster-settings.html) to always capture contention events.
{{site.data.alerts.end}}

Transaction executions with the **High Contention** insight are transactions that experienced [contention](transactions.html#transaction-contention).

The following screenshot shows the execution of a transaction flagged with **High Contention**:

<img src="{{ 'images/v23.1/transaction_execution.png' | relative_url }}" alt="Transaction execution" style="border:1px solid #eee;max-width:100%" />

To view [details of the execution](#transaction-execution-details), click an execution ID in the **Latest Transaction Execution ID** column.

- **Latest Transaction Execution ID**: The execution ID of the latest execution with the transaction fingerprint.
- **Transaction Fingerprint ID**: The transaction fingerprint ID of the latest transaction execution.
- **Transaction Execution**: The transaction fingerprint of the latest transaction execution.
- **Insights**: The insight for the transaction execution.
  - **High Contention**: The transaction execution experienced high contention time according to the threshold set in `sql.insights.latency_threshold`.
- **Start Time (UTC)**: The timestamp when the transaction execution started.
- **Contention Time**: The amount of time the transaction execution spent waiting in contention.
- **Application Name**: The name specified by the [`application_name` session setting](show-vars.html#supported-variables).

#### Transaction execution details

The transaction execution details view provides more details on a transaction execution insight.

The following screenshot shows the execution details of the transaction execution in the preceding section:

<img src="{{ 'images/v23.1/transaction_execution_details.png' | relative_url }}" alt="Transaction execution details" style="border:1px solid #eee;max-width:100%" />

The **Insights** column shows the name of the insight, in this case **High Contention**; the **Details** column provides details on the insight.

- **Start Time (UTC)**: The time the transaction execution started.
- **Transaction Fingerprint ID**: The transaction fingerprint ID of the transaction execution.

##### Transaction with ID {transaction ID} waited on

This section provides details of the transaction executions that block the transaction ID flagged with **High Contention**:

- **Transaction Execution ID**: The execution ID of the blocking transaction execution.
- **Transaction Fingerprint ID**: The transaction fingerprint ID of the blocking transaction execution.
- **Transaction Execution**: The queries attempted in the transaction.
- **Contention Start Time (UTC)**: The timestamp at which contention was detected for the transaction.
- **Contention Time**: The time transactions with this execution ID was [in contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) with other transactions within the specified time interval.
- **Schema Name**: The name of the contended schema.
- **Database Name**: The name of the contended database.
- **Table Name**: The name of the contended table.
- **Index Name**: The name of the contended index.

### Statement Executions view

The **Statement Executions** view provides an overview of all statement executions that have been flagged with insights.

To display this view, click **Insights** in the left-hand navigation of the DB Console and select **Workload Insights > Statement Executions**.

{{site.data.alerts.callout_info}}
The rows in this page are populated from the [`crdb_internal.cluster_execution_insights`](crdb-internal.html) table.

- The results displayed on the **Statement Executions** view will be available as long as the number of rows in each node is less than `sql.insights.execution_insights_capacity`.
- The default tracing behavior enables captures a small percent of transactions so not all contention events will be recorded. When investigating query latency, you can set the `sql.trace.txn.enable_threshold` [cluster setting](cluster-settings.html) to always capture contention events.

{{site.data.alerts.end}}

The following screenshot shows the statement execution of the query described in [Use the right index]({{ link_prefix }}apply-statement-performance-rules.html#rule-2-use-the-right-index):

<img src="{{ 'images/v23.1/statement_executions.png' | relative_url }}" alt="Statement execution" style="border:1px solid #eee;max-width:100%" />

To view [details of the execution](#statement-execution-details), click an execution ID in the **Statement Execution ID** column.

- **Statement Execution ID**: The execution ID of the latest execution with the statement fingerprint.
- **Statement Fingerprint ID**: The statement fingerprint ID of the latest statement execution.
- **Statement Execution**: The [statement fingerprint](ui-statements-page.html#sql-statement-fingerprints) of the latest statement execution.
- **Insights**: The insight for the statement execution.
  - **High Contention**: The statement execution experienced high contention time according to the threshold set in `sql.insights.latency_threshold`.
  - **High Retry Count**: The statement execution experienced a high number of retries according to the threshold set in `sql.insights.high_retry_count.threshold`.
  - **Suboptimal Plan**: The statement execution has resulted in one or more [index recommendations](#schema-insights-view) that would improve the plan.
  - **Failed**: The statement execution failed.
  - **Slow Execution**: The statement experienced slow execution. Depending on the settings in [Configuration](#configuration), either of the following conditions trigger this insight:

      - Execution time is greater than the value of `sql.insights.latency_threshold`.
      - Anomaly detection is enabled (`sql.insights.anomaly_detection.enabled`), execution time is greater than the value of `sql.insights.anomaly_detection.latency_threshold`, and [execution latency](ui-sql-dashboard.html#kv-execution-latency-99th-percentile) is `> p99 && > 2*p50`. For details, see [Detect slow executions](#detect-slow-executions).
- **Start Time (UTC)**: The timestamp when the statement execution started.
- **Elapsed Time**: The time that elapsed to complete the statement execution.
- **User Name**: The name of the user that invoked the statement execution.
- **Application Name**: The name specified by the [`application_name`](show-vars.html#supported-variables) session setting.
- **Rows Processed**: The total number of rows read and written.
- **Retries**: The number of times the statement execution was retried.
- **Contention Time**: The amount of time the statement execution spent waiting in contention.
- **Full Scan**: Whether the execution performed a full scan of the table.
- **Transaction Execution ID**: The ID of the transaction execution for the statement execution.
- **Transaction Fingerprint ID**: The ID of the transaction fingerprint for the statement execution.

#### Statement execution details

The statement execution details view provides more details on a statement execution insight.

The following screenshot shows the execution details of the statement execution in the preceding section:

<img src="{{ 'images/v23.1/statement_execution_details.png' | relative_url }}" alt="Statement execution details" style="border:1px solid #eee;max-width:100%" />

The **Insights** column shows the name of the insight, in this case **Suboptimal Plan**; the **Details** column provides details on the insight; and the final column contains a **Create Index** button. Click the **Create Index** button to perform a query to mitigate the cause of the insight, in this case to create an index on the ride `start_time` that stores the `rider_id`.

- **Start Time**: The timestamp when the statement execution started.
- **End Time**: The timestamp when the statement execution ended.
- **Elapsed Time**: The time that elapsed during statement execution.
- **Rows Read**: The total number of rows read.
- **Rows Written**: The total number of rows written.
- **Transaction Priority**: The [priority](transactions.html#set-transaction-priority) of the transaction for the statement execution.
- **Full Scan**: Whether the execution performed a full scan of the table.
- **Session ID**: The ID of the [session](ui-sessions-page.html) the statement was executed from.
- **Transaction Fingerprint ID**: The ID of the transaction fingerprint for the statement execution.
- **Transaction Execution ID**: The ID of the transaction execution for the statement execution.
- **Statement Fingerprint ID**: The fingerprint ID of the statement fingerprint for the statement execution.

## Schema Insights view

To display this view, click **Insights** in the left-hand navigation of the DB Console and select **Schema Insights**.

This view lists the indexes that have not been used and should be dropped, and/or the ones that should be created, altered, or replaced (based on statement execution).

- The drop recommendations are the same as those on the [**Databases**](ui-databases-page.html) page.
- The create, alter, and replace recommendations are the same as those on the [Explain Plans tab](ui-statements-page.html#insights) on the Statements page. Whereas the **Explain Plans** tab shows all recommendations, the **Schema Insights** view shows only the latest recommendations for that statement fingerprint. If you execute a statement again after creating or updating an index, the recommendation disappears.

The following screenshot shows the insight that displays after you run the query described in [Use the right index]({{ link_prefix }}apply-statement-performance-rules.html#rule-2-use-the-right-index) 6 or more times:

<img src="{{ 'images/v23.1/schema_insight.png' | relative_url }}" alt="Schema insight" style="border:1px solid #eee;max-width:100%" />

CockroachDB uses the threshold of 6 executions before offering an insight because it assumes that you are no longer merely experimenting with a query at that point.

- **Insights:** Contains one of the following insight types: **Create Index**, **Alter Index**, **Replace Index**, **Drop Unused Index**.
- **Details:** Details for each insight. Different insight types display different details fields:

    - **Create Index**, **Alter Index**, or **Replace Index**: A **Statement Fingerprint** field displays the statement fingerprint that would be optimized with the creation, alteration, or replacement of the index; and a **Recommendation** field displays the SQL query to create, alter, or replace the index.
    - **Drop Unused Index**: An **Index** field displays the name of the index to drop; and a **Description** field displays the reason for dropping the index.

To realize the schema insight, click the action button in the final column to execute the SQL statement. A confirmation dialog displays a warning about the cost of [online schema changes](online-schema-changes.html) and a button to copy the SQL statement for later execution in a SQL client.

## Configuration

You can configure the behavior of insights using the following [cluster settings](cluster-settings.html).

### Workload insights settings

You can configure [**Workload Insights**](#workload-insights-tab) with the following cluster settings.

| Setting                                                                | Default value | Description                                                                                                                                                                                   | Where used                           |
|------------------------------------------------------------------------|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
|`sql.insights.anomaly_detection.enabled`                                | `true`        | Whether or not anomaly insight detection is enabled. When true, CockroachDB checks if [execution latency](ui-sql-dashboard.html#kv-execution-latency-99th-percentile) was `> p99 && > 2*p50`. | Statement executions                 |
|`sql.insights.anomaly_detection.latency_threshold`                      | `50 ms`       | The latency threshold that triggers monitoring a statement fingerprint for unusually slow execution.                                                                                          | Statement executions                 |
|`sql.insights.anomaly_detection.memory_limit`                           | `1` MiB       | The maximum amount of memory allowed for tracking statement latencies.                                                                                                                        | Statement executions                 |
|`sql.insights.latency_threshold`                                        | `100 ms`      | The threshold at which the contention duration of a contended transaction is considered **High Contention** or statement execution is flagged for insights.                                   | Statement and Transaction executions |
|`sql.insights.high_retry_count.threshold`                               | `10`          | The threshold at which a retry count is considered **High Retry Count**.                                                                                                                      | Statement executions                 |
|`sql.insights.execution_insights_capacity`                              | `1000`        | The maximum number of execution insights stored in each node.                                                                                                                                 | Statement executions                 |
|`sql.contention.event_store.capacity`                                   | `64 MiB`      | The in-memory storage capacity of the contention event store in each nodes.                                                                                                                   | Transaction executions               |
|`sql.contention.event_store.duration_threshold`                         | `0`           | The minimum contention duration to cause contention events to be collected into the `crdb_internal.transaction_contention_events` table.                                                      | Transaction executions               |

#### Detect slow executions

There are two different methods for detecting slow executions. By default, they are both enabled and you can configure them based on your workload.

The first method flags all executions running longer than `sql.insights.latency_threshold`. This is analogous to checking the [slow query log](logging-use-cases.html#sql_perf).

The second method attempts to detect **unusually slow executions**. You can enable this detection with `sql.insights.anomaly_detection.enabled` and configure it with `sql.insights.anomaly_detection.latency_threshold`.
CockroachDB will then keep a streaming histogram in memory for each distinct statement fingerprint that has seen an execution latency longer than `sql.insights.anomaly_detection.latency_threshold`, and will flag any execution with a latency in the 99th percentile (`> p99`) for its fingerprint.

Additional controls filter out executions that are less actionable:

- The execution's latency must also be longer than twice the median latency (`> 2*p50`) for that fingerprint. This ensures that the elevated latency is significant enough to warrant attention.
- The execution's latency must also be longer than `sql.insights.anomaly_detection.latency_threshold`. Some executions are slower than usual, but are still fast enough for the workload.

The `sql.insights.anomaly_detection.memory_limit` cluster setting limits the amount of memory available for tracking these streaming latency histograms. When this threshold is surpassed, the least-recently touched histogram is evicted. The default of `1 MiB` is sufficient for tracking about 1,000 fingerprints.

You can track the `sql.insights.anomaly_detection.memory` and `sql.insights.anomaly_detection.evictions` [metrics](ui-custom-chart-debug-page.html) to determine if the settings are appropriate for your workload. If you see a steady stream of evictions or churn, you can either raise the `sql.insights.anomaly_detection.memory_limit` cluster setting, to allow for more storage; or raise the `sql.insights.anomaly_detection.latency_threshold` cluster setting, to examine fewer statement fingerprints.

### Schema insights settings

You can configure the index recommendations in the [**Schema Insights** view](#schema-insights-view), [**Explain Plans** tab](ui-statements-page.html#insights), and [**Databases** page](ui-databases-page.html) with the following cluster settings.

| Setting                                                                | Default value | Description                                                                                                             | Where used                           |
|------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
|`sql.metrics.statement_details.index_recommendation_collection.enabled` | `true`        | Whether or not index recommendations are enabled for indexes that could be or are used during statement execution.      | Schema Insights and Explain Plans tab|
|`sql.index_recommendation.drop_unused_duration`                         | `7 days`      | The duration of time an index must be unused before a recommendation to drop it.                                            | Schema Insights and Databases        |
|`sql.metrics.statement_details.max_mem_reported_idx_recommendations`    | `5000`        | The maximum number of reported index recommendations stored in memory.                                                  | Schema Insights and Explain Plans tab|

## See also

- [Statements page](ui-statements-page.html)
- [Transactions page](ui-transactions-page.html)
- [Databases page](ui-databases-page.html)
- [Assign privileges](security-reference/authorization.html#managing-privileges)
