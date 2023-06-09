---
title: Statements Page
summary: The Statements page helps you identify frequently executed or high latency SQL statements, view statement details, and download statement diagnostics.
toc: true
---

{{site.data.alerts.callout_info}}
On a secure cluster, this area of the DB Console can only be accessed by an `admin` user. See [DB Console access](ui-overview.html#db-console-access).
{{site.data.alerts.end}}

The **Statements** page helps you:

- Identify frequently executed or high latency [SQL statements](sql-statements.html).
- View SQL statement [details](#statement-details-page).
- Download SQL statement [diagnostics](#diagnostics) for troubleshooting.

To view this page, [access the DB Console](ui-overview.html#db-console-access) and click **Statements** in the left-hand navigation.

## Search and filter by application

By default, this page shows SQL statements from all applications running on the cluster, including internal CockroachDB queries.

To filter the statements by [`application_name`](connection-parameters.html#additional-connection-parameters), use the **App** menu. If you haven't set `application_name` in the client connection string, it appears as `unset`.

CockroachDB's internal queries are displayed under the `(internal)` app. Queries from the SQL shell are displayed under the `$ cockroach sql` app.

You can also search for statements using the search bar.

## Understand the Statements page

Use this page to identify SQL statements that you may want to [troubleshoot](query-behavior-troubleshooting.html). This might include statements that are experiencing high latencies, multiple [retries](transactions.html#transaction-retries), or execution failures. You can optionally create and retrieve [diagnostics](#diagnostics) for these statements.

{{site.data.alerts.callout_success}}
If you haven't yet executed any queries in the cluster as a user, this page will initially be blank.
{{site.data.alerts.end}}

Columns | Description
-----|------------
{% include {{ page.version.version }}/ui/statement_table.md %}
Diagnostics | Option to activate [diagnostics](#diagnostics) for this fingerprint. If activated, this displays the status of diagnostics collection (`WAITING FOR QUERY`, `READY`, OR `ERROR`). When `READY`, the most recent diagnostics bundle can be downloaded here. Access the full history of diagnostics for the fingerprint in the [**Statement Details**](#statement-details-page) page.

### Time interval

By default, the Statements page displays all SQL statements executed within a one-hour time interval. The display is cleared at the end of each interval. You can change the interval with the [`diagnostics.reporting.interval`](cluster-settings.html#settings) cluster setting.

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

- Statements with this fingerprint were executed by more than one [`application_name`](show-vars.html#supported-variables).
- Statements with this fingerprint were executed both successfully and unsuccessfully.

## Statement Details page

Click on a SQL statement fingerprint to open **Statement Details**. For each statement fingerprint, the details include:

- [Overview](#overview)
- [Diagnostics](#diagnostics)
- [Logical plan](#logical-plan)
- [Execution stats](#execution-stats)

### Overview

The **Overview** section displays the SQL statement fingerprint and essential statistics on the right-hand side of the page:

- **Statement Time** is the cumulative time taken to execute statements with this fingerprint within the [specified time interval](#time-interval).
- **Planning Time** is the cumulative time taken by the [planner](architecture/sql-layer.html#sql-parser-planner-executor) to create an execution plan for statements with this fingerprint within the specified time interval.
- **Execution time** is the cumulative time taken to execute statements with this fingerprint in the specified time interval.

**Resource usage** displays statistics about storage, memory, and network usage for the SQL statement fingerprint.

- **Mean rows/bytes read** displays the mean average number of rows and bytes [read from the storage layer](architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) for statements with this fingerprint within the last hour or specified [time interval](#time-interval).
- **Max memory usage** displays the maximum memory used by a statement with this fingerprint at any time during its execution within the last hour or specified time interval.
- **Network usage** displays the amount of [data transferred over the network](architecture/reads-and-writes-overview.html) (e.g., between regions and nodes) for statements with this fingerprint within the last hour or specified [time interval](#time-interval). <br><br>If this value is 0, the statement was executed on a single node.
- **Max scratch disk usage** displays the maximum amount of data [spilled to temporary storage on disk](vectorized-execution.html#disk-spilling-operations) while executing statements with this fingerprint within the last hour or specified time interval.

**Statement details** displays information about the execution of the statement.

- **App** displays the name specified by the [`application_name`](show-vars.html#supported-variables) session setting.
- **Failed?** indicates whether the statement failed to execute.
- **Used cost-based optimizer?** indicates whether the execution used the [cost-based optimizer](cost-based-optimizer.html).
- **Distributed execution?** indicates whether the execution was distributed.
- **Vectorized execution?** indicates whether the execution used the [vectorized execution engine](vectorized-execution.html).
- **Transaction type** displays the type of transaction (implicit or explicit).

**Execution counts** displays execution statistics for the SQL statement fingerprint.

- **First Attempts** is the cumulative number of first attempts at executing statements with this fingerprint within the [specified time interval](#time-interval).
- **Total executions** is the total number of executions of statements with this fingerprint. It is calculated as the sum of first attempts and retries.
- **Retries** is the cumulative number of [retries](transactions.html#transaction-retries) of statements with this fingerprint within the [specified time interval](#time-interval).
- **Max Retries** is the highest number of retries of a single statement with this fingerprint within the [specified time interval](#time-interval). For example, if three statements with the same fingerprint had to be retried 0, 1, and 5 times, then the Max Retries value for the fingerprint is 5.

**Rows Affected** displays statistics on rows returned for the SQL statement fingerprint.

### Diagnostics

The **Diagnostics** section of the Statement Details page allows you to activate and view diagnostics for the SQL statement fingerprint.

When you activate diagnostics for a fingerprint, CockroachDB waits for the next SQL query that matches this fingerprint to be run on any node. On the next match, information about the SQL statement is written to a diagnostics bundle that you can download. This bundle consists of [statement traces](show-trace.html) in various formats (including a JSON file that can be [imported to Jaeger](query-behavior-troubleshooting.html#visualize-statement-traces-in-jaeger)), a physical query plan, execution statistics, and other information about the query. The bundle contents are identical to those produced by [`EXPLAIN ANALYZE (DEBUG)`](explain-analyze.html#debug-option).

{{site.data.alerts.callout_success}}
Diagnostics will be collected a maximum of *N* times for a given activated fingerprint where *N* is the number of nodes in your cluster.
{{site.data.alerts.end}}

{% include {{ page.version.version }}/sql/statement-bundle-warning.md %}

<img src="{{ 'images/v21.1/ui_statements_diagnostics.png' | relative_url }}" alt="DB Console Statements Page" style="border:1px solid #eee;max-width:100%" />

- Click the **Activate** button to begin collecting diagnostics for the fingerprint. This will open the list of **Statement diagnostics** with a status next to each activated diagnostic.
	- `WAITING FOR QUERY` indicates that a SQL statement matching the fingerprint has not yet been recorded.
	- `ERROR` indicates that the attempt at diagnostics collection failed.
	- `READY` indicates that the diagnostics have run and can be downloaded. A download link will appear beside the status.
- For any row with a `READY` status, click **Bundle (.zip)** to retrieve the diagnostics.

The information collected in the bundle can be used to diagnose problematic SQL statements, such as [slow queries](query-behavior-troubleshooting.html#query-is-always-slow). We recommend that you share the diagnostics bundle with our [support team](support-resources.html), which can help you interpret the results. You can also import `trace-jaeger.json` into Jaeger to [visualize the statement traces](query-behavior-troubleshooting.html#visualize-statement-traces-in-jaeger).

Click **All statement diagnostics** to view a complete history of your collected diagnostics, each of which can be downloaded. Although fingerprints are periodically cleared from the Statements page, all diagnostics bundles are preserved. If you need to access diagnostics that were collected for a fingerprint not present in the past [interval](#time-interval), you can find the bundle here.

### Logical Plan

The **Logical Plan** section displays CockroachDB's query plan for an [explainable statement](sql-grammar.html#preparable_stmt). You can use this information to optimize the query. For more information about logical plans, see [`EXPLAIN`](explain.html).

By default, the logical plan for each fingerprint is sampled every 5 minutes. You can change the interval with the [`sql.metrics.statement_details.plan_collection.period`](cluster-settings.html#settings) cluster setting. For example, to change the interval to 2 minutes, run the following [`SET CLUSTER SETTING`](set-cluster-setting.html) command:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.metrics.statement_details.plan_collection.period  = '2m0s';
~~~

### Execution Stats

**Execution Latency by Phase** displays the service latency of statements matching this fingerprint, broken down by [phase](architecture/sql-layer.html#sql-parser-planner-executor) (parse, plan, run, overhead), as well as the overall service latency. The gray bar indicates the mean latency. The blue bar indicates one standard deviation from the mean.

{{site.data.alerts.callout_success}}
"Overhead" comprises the statements that remain after subtracting parse, plan, and run latencies from the overall latency. These might include fetching table descriptors that were not cached, or other background tasks required to execute the query.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Service latency can be affected by network latency, which is displayed for your cluster on the [Network Latency](ui-network-latency-page.html) page.
{{site.data.alerts.end}}

**Other Execution Statistics** displays the following statistics.

Statistic | Description
----------|------------
Rows Read | The number of rows read by the statement. The gray bar indicates the mean number of rows read. The blue bar indicates one standard deviation from the mean.
Disk Bytes Read | The size of the data read by the statement. The gray bar indicates the mean number of bytes read. The blue bar indicates one standard deviation from the mean.

The **Statistics by Node** table provides a breakdown of the number of statements of the selected fingerprint per gateway node. You can use this table to determine whether, for example, you are executing queries on a node that is far from the data you are requesting (see [Optimize Statement Performance](make-queries-fast.html#cluster-topology)).

## See also

- [Troubleshoot Query Behavior](query-behavior-troubleshooting.html)
- [Transaction retries](transactions.html#transaction-retries)
- [Optimize Statement Performance](make-queries-fast.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
