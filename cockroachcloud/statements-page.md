---
title: Statements Page
summary: How to use the Statements page to view and manage SQL statements on CockroachCloud.
toc: true
---

The **Statements** page helps you:

- Identify frequently executed or high latency [SQL statements](../stable/sql-statements.html).
- View SQL statement [details](#statement-details-page).
- Download SQL statement [diagnostics](#diagnostics) for troubleshooting.

To view this page, click **Statements** in the left-hand navigation of the CockroachCloud Console.

## Search and filter by application

By default, this page shows SQL statements from all applications running on the cluster, and hides internal CockroachCloud queries.

To filter the statements by [`application_name`](../stable/connection-parameters.html#additional-connection-parameters), use the **App** menu. If you haven't set `application_name` in the client connection string, it appears as `unset`. 

CockroachCloud's internal queries are only displayed under the `(internal)` app. Queries from the SQL shell are displayed under the `$ cockroach sql` app.

You can also search for statements using the search bar.

## Understand the Statements page

Use this page to identify SQL statements that you may want to [troubleshoot](../stable/query-behavior-troubleshooting.html). This might include statements that are experiencing high latencies, multiple [retries](../stable/transactions.html#transaction-retries), or execution failures. You can optionally create and retrieve [diagnostics](#diagnostics) for these statements.

{{site.data.alerts.callout_success}}
This page is initially blank on clusters where no queries have yet been executed.
{{site.data.alerts.end}}

<img src="{{ 'images/cockroachcloud/statements_page.png' | relative_url }}" alt="CockroachCloud Console Statements Page" style="border:1px solid #eee;max-width:100%" />

Parameter | Description
-----|------------
Statement | SQL statement [fingerprint](#sql-statement-fingerprints).<br><br>To view additional details, click the SQL statement fingerprint to open its [**Statement Details** page](#statement-details-page).
Txn Type | Type of transaction (implicit or explicit). Explicit transactions refer to statements that are wrapped by [`BEGIN`](../stable/begin-transaction.html) and [`COMMIT`](../stable/commit-transaction.html) statements by the client. Explicit transactions employ [transactional pipelining](../stable/architecture/transaction-layer.html#transaction-pipelining) and therefore report latencies that do not account for replication.<br><br>For statements not in explicit transactions, CockroachCloud wraps each statement in individual implicit transactions.
Retries | Cumulative number of [retries](../stable/transactions.html#transaction-retries) of statements with this fingerprint within the last hour or specified [time interval](#time-interval).
Execution Count | Cumulative number of executions of statements with this fingerprint within the last hour or specified [time interval](#time-interval).<br><br>The bar indicates the ratio of runtime success (gray) to [retries](../stable/transactions.html#transaction-retries) (red) for the SQL statement fingerprint.
Rows Affected | Average number of rows returned while executing statements with this fingerprint within the last hour or specified [time interval](#time-interval).<br><br>The gray bar indicates the mean number of rows returned. The blue bar indicates one standard deviation from the mean.
Latency | Average service latency of statements with this fingerprint within the last hour or specified [time interval](#time-interval). Service latency is the time taken to execute a query once it is received by the cluster. It does not include the time taken to send the query to the cluster or return the result to the client.<br><br>The gray bar indicates the mean latency. The blue bar indicates one standard deviation from the mean.
Diagnostics | Option to activate [diagnostics](#diagnostics) for this fingerprint. If activated, this displays the status of diagnostics collection (`WAITING FOR QUERY`, `READY`, OR `ERROR`). When `READY`, the most recent diagnostics bundle can be downloaded here. Access the full history of diagnostics for the fingerprint in the [**Statement Details**](#statement-details-page) page.

### Time interval

By default, the Statements page displays all SQL statements executed within a one-hour time interval. The display is cleared at the end of each interval. You can change the interval with the [`diagnostics.reporting.interval`](../stable/cluster-settings.html#settings) cluster setting.

### SQL statement fingerprints

The Statements page displays SQL statement *fingerprints*. 

A statement fingerprint represents one or more SQL statements by replacing literal values (e.g., numbers and strings) with underscores (`_`). This can help you quickly identify frequently executed SQL statements and their latencies.

For multiple SQL statements to be represented by a fingerprint, they must be identical aside from their literal values:

- <code style="white-space:pre-wrap">INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)</code>
- <code style="white-space:pre-wrap">INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (192, 891, 20)</code>
- <code style="white-space:pre-wrap">INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (784, 452, 78)</code>

The above SQL statements have the fingerprint: 

<code style="white-space:pre-wrap">INSERT INTO new_order(product_id, customer_id, no_w_id) VALUES (_, _, _)</code>

The following statements cannot be represented by the same fingerprint:

- <code style="white-space:pre-wrap">INSERT INTO orders(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)</code>
- <code style="white-space:pre-wrap">INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)</code>
- <code style="white-space:pre-wrap">INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, 11, 11098)</code>
- <code style="white-space:pre-wrap">INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, $2, 11098)</code>
- <code style="white-space:pre-wrap">INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, $2, $3)</code>

It is possible to see the same fingerprint listed multiple times in the following scenarios:

- Statements with this fingerprint were executed by more than one [`application_name`](../stable/show-vars.html#supported-variables).
- Statements with this fingerprint were executed both successfully and unsuccessfully.

## Statement Details page

Click on a SQL statement fingerprint to open **Statement Details**. For each statement fingerprint, the details include:

- [Overview](#overview)
- [Diagnostics](#diagnostics)
- [Logical plan](#logical-plan)
- [Statistics](#execution-stats)

<img src="{{ 'images/cockroachcloud/statements_details_page.png' | relative_url }}" alt="CockroachCloud Statements Page" style="border:1px solid #eee;max-width:100%" />

### Overview

The **Overview** section displays the SQL statement fingerprint and essential statistics on the right-hand side of the page:

- **Total Time** is the cumulative time taken to execute statements with this fingerprint within the [specified time interval](#time-interval).
- **Mean Service Latency** is the average service latency of statements with this fingerprint within the [specified time interval](#time-interval).
- **App** displays the name specified by the [`application_name`](../stable/show-vars.html#supported-variables) session setting.
- **Transaction Type** displays the type of transaction (implicit or explicit).
- **Distributed execution?** indicates whether the execution was distributed.
- **Vectorized execution?** indicates whether the execution used the [vectorized execution engine](../stable/vectorized-execution.html).
- **Used cost-based optimizer?** indicates whether the execution used the [cost-based optimizer](../stable/cost-based-optimizer.html).
- **Failed?** indicates whether the execution was successful.

**Execution Count** displays execution statistics for the SQL statement fingerprint.

- **First Attempts** is the cumulative number of first attempts at executing statements with this fingerprint within the [specified time interval](#time-interval).
- **Retries** is the cumulative number of [retries](../stable/transactions.html#transaction-retries) of statements with this fingerprint within the [specified time interval](#time-interval).
- **Max Retries** is the highest number of retries of a single statement with this fingerprint within the [specified time interval](#time-interval). For example, if three statements with the same fingerprint had to be retried 0, 1, and 5 times, then the Max Retries value for the fingerprint is 5.
- **Total** is the total number of executions of statements with this fingerprint. It is calculated as the sum of first attempts and retries.

**Rows Affected** displays statistics on rows returned for the SQL statement fingerprint.

- **Mean Rows** is the average number of rows returned while executing statements with this fingerprint within the [specified time interval](#time-interval).
- **Standard Deviation** is the value of one standard deviation of the mean.

### Diagnostics

The **Diagnostics** section of the Statement Details page allows you to activate and view diagnostics for the SQL statement fingerprint.

When you activate diagnostics for a fingerprint, CockroachCloud waits for the next SQL query that matches this fingerprint to be run on any node. On the next match, information about the SQL statement is written to a diagnostics bundle that you can download. This bundle consists of [statement traces](../stable/show-trace.html) in various formats (including a JSON file that can be [imported to Jaeger](../stable/query-behavior-troubleshooting.html#visualize-statement-traces-in-jaeger)), a physical query plan, execution statistics, and other information about the query. The bundle contents are identical to those produced by [`EXPLAIN ANALYZE (DEBUG)`](../stable/explain-analyze.html#debug-option).

{{site.data.alerts.callout_success}}
Diagnostics will be collected a maximum of *N* times for a given activated fingerprint where *N* is the number of nodes in your cluster.
{{site.data.alerts.end}}

<img src="{{ 'images/cockroachcloud/statements_diagnostics.png' | relative_url }}" alt="CockroachCloud Console Statements Page" style="border:1px solid #eee;max-width:100%" />

- Click the **Activate** button to begin collecting diagnostics for the fingerprint. This will open the list of **Statement diagnostics** with a status next to each activated diagnostic.
	- `WAITING FOR QUERY` indicates that a SQL statement matching the fingerprint has not yet been recorded.
	- `ERROR` indicates that the attempt at diagnostics collection failed.
	- `READY` indicates that the diagnostics have run and can be downloaded. A download link will appear beside the status.
- For any row with a `READY` status, click **Bundle (.zip)** to retrieve the diagnostics.

The information collected in the bundle can be used to diagnose problematic SQL statements, such as [slow queries](../stable/query-behavior-troubleshooting.html#query-is-always-slow). We recommend that you share the diagnostics bundle with our [support team](../stable/support-resources.html), which can help you interpret the results. You can also import `trace-jaeger.json` into Jaeger to [visualize the statement traces](../stable/query-behavior-troubleshooting.html#visualize-statement-traces-in-jaeger).

### Logical Plan

The **Logical Plan** section displays CockroachCloud's query plan for an [explainable statement](../stable/sql-grammar.html#preparable_stmt). You can use this information to optimize the query. For more information about logical plans, see [`EXPLAIN`](../stable/explain.html).

<img src="{{ 'images/cockroachcloud/statements_logical_plan.png' | relative_url }}" alt="CockroachCloud Console Statements Page" style="border:1px solid #eee;max-width:100%" />

By default, the logical plan for each fingerprint is sampled every 5 minutes. You can change the interval with the [`sql.metrics.statement_details.plan_collection.period`](../stable/cluster-settings.html#settings) cluster setting. For example, to change the interval to 2 minutes, run the following [`SET CLUSTER SETTING`](../stable/set-cluster-setting.html) command:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.metrics.statement_details.plan_collection.period  = '2m0s';
~~~

### Execution Stats

**Execution Latency by Phase** displays the service latency of statements matching this fingerprint, broken down by [phase](../stable/architecture/sql-layer.html#sql-parser-planner-executor) (parse, plan, run, overhead), as well as the overall service latency. The gray bar indicates the mean latency. The blue bar indicates one standard deviation from the mean.

{{site.data.alerts.callout_success}}
"Overhead" comprises the statements that remain after subtracting parse, plan, and run latencies from the overall latency. These might include fetching table descriptors that were not cached, or other background tasks required to execute the query.
{{site.data.alerts.end}}

**Other Execution Statistics** displays the following statistics.

Parameter | Description
----------|------------
Rows Read | The number of rows read by the statement. The gray bar indicates the mean number of rows read. The blue bar indicates one standard deviation from the mean.
Disk Bytes Read | The size of the data read by the statement. The gray bar indicates the mean number of bytes read. The blue bar indicates one standard deviation from the mean.

The **Statistics by Node** table provides a breakdown of the number of statements of the selected fingerprint per gateway node. You can use this table to determine whether, for example, you are executing queries on a node that is far from the data you are requesting (see [Make Queries Fast](../stable/make-queries-fast.html#cluster-topology)).

Parameter | Description
-----|------------
Node | ID of the gateway node.
Retries | Cumulative number of [retries](../stable/transactions.html#transaction-retries) of statements with this fingerprint within the last hour or specified [time interval](#time-interval).
Execution Count | Cumulative number of executions of statements with this fingerprint within the last hour or specified [time interval](#time-interval).
Rows Affected | Average number of rows returned while executing statements with this fingerprint within the last hour or specified [time interval](#time-interval). <br><br>The gray bar indicates the mean number of rows returned. The blue bar indicates one standard deviation from the mean.
Latency | Average service latency of statements with this fingerprint within the last hour or specified [time interval](#time-interval). Service latency is the time taken to execute a query once it is received by the cluster. It does not include the time taken to return the result to the client. <br><br>The gray bar indicates the mean latency. The blue bar indicates one standard deviation from the mean.