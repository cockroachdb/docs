{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.versions["stable"]}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}

## Search and filter

By default, the Statements page shows SQL statements from all applications and databases running on the cluster.

### Search field

To search using the search field, type a string over `Search Statements` and press `Enter`. The list of statements is filtered by the string.

### Date range

To search by date, click the date range selector and pick a date range that is within the time period. Click **reset time** to reset the date to the last hour.

It's possible to select a date range for which no statement statistics exist. CockroachDB persists statement statistics up to 1 million rows before the oldest row is deleted. The retention period of statistics is reduced the more active a workload is and the more distinct statement fingerprints there are.

### Filter

To filter the statements, click the **Filters** field.

To filter by [application]({{ link_prefix }}connection-parameters.html#additional-connection-parameters), select **App** and choose one or more applications. When no application is selected internal statements **are not** displayed.

- Queries from the SQL shell are displayed under the `$ cockroach` app.
- If you haven't set `application_name` in a client connection string, it appears as `unset`.

You can also filter by one or more databases (**Database**), SQL statement types (**Statement Type**), and for [statement fingerprints](#sql-statement-fingerprints) that take longer than a specified time to run. To display only statements with queries that cause full table scans, click **Only show statements that contain queries with full table scans**.

The following screenshot shows the statements that contain the string `rides` for the `movr` application:

<img src="{{ 'images/v21.2/movr-statements-rides.png' | relative_url }}" alt="Movr rides statements" style="border:1px solid #eee;max-width:80%" />

## Statement statistics

{% include common/ui/statistics.md %}

### Example

See [View historical statement statistics and the sampled logical plan per fingerprint]({{ link_prefix }}crdb-internal.html#view-historical-statement-statistics-and-the-sampled-logical-plan-per-fingerprint).

## SQL statement fingerprints

The Statements page displays SQL statement fingerprints.

A _statement fingerprint_ represents one or more SQL statements by replacing literal values (e.g., numbers and strings) with underscores (`_`). This can help you quickly identify frequently executed SQL statements and their latencies.

For multiple SQL statements to be represented by a fingerprint, they must be identical aside from their literal values:

- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (192, 891, 20)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (784, 452, 78)`

The preceding SQL statements have the fingerprint:

`INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (_, _, _)`

The following statements cannot be represented by the same fingerprint:

- `INSERT INTO orders(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, 11, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, $2, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, $2, $3)`

It is possible to see the same fingerprint listed multiple times in the following scenarios:

- Statements with this fingerprint were executed by more than one [`application_name`]({{ link_prefix }}show-vars.html#supported-variables).
- Statements with this fingerprint were executed both successfully and unsuccessfully.

## Understand the Statements page

Use the Statements page to identify SQL statements that you want to [troubleshoot]({{ link_prefix }}query-behavior-troubleshooting.html). This might include statements that are experiencing high latencies, multiple [retries]({{ link_prefix }}transactions.html#transaction-retries), or execution failures. You can optionally create and retrieve [diagnostics](#diagnostics) for these statements.

{{site.data.alerts.callout_success}}
If you haven't yet executed any queries in the cluster as a user, this page will be blank.
{{site.data.alerts.end}}

<a id="statement-fingerprint-properties"></a>

### Statements table

Click <img src="{{ 'images/common/ui-columns-button.png' | relative_url }}" alt="Column selector" /> to select the columns to display in the table.

The Statements table gives details for each SQL statement fingerprint:

Column | Description
-----|------------
Statements | SQL statement [fingerprint](#sql-statement-fingerprints).<br><br>To view additional details, click the SQL statement fingerprint to open its [Transaction Details page]({{ page_prefix }}transactions-page.html#transaction-details-page).
Aggregation Interval (UTC) | The interval over which statistics are aggregated. <br><br>For example, if a statement is executed at 1:23PM it will fall in the 1:00PM - 2:00PM interval.
Execution Count | Cumulative number of executions of statements with this fingerprint within the aggregation interval. <br><br>The bar indicates the ratio of runtime success (gray) to [retries]({{ link_prefix }}transactions.html#transaction-retries) (red) for the SQL statement fingerprint.
Database | The database in which the statement was executed.
Rows Read | Average number of rows [read from disk]({{ link_prefix }}architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) while executing statements with this fingerprint within the aggregation interval).<br><br>The gray bar indicates the mean number of rows returned. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Bytes Read | Aggregation of all bytes [read from disk]({{ link_prefix }}architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) across all operators for statements with this fingerprint within the aggregation interval. <br><br>The gray bar indicates the mean number of bytes read from disk. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Rows Written  | Aggregation of all rows written to disk across all operators for statements with this fingerprint. This column is not displayed by default. <br><br>The gray bar indicates the mean latency. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Statement Time | Average [planning and execution time]({{ link_prefix }}architecture/sql-layer.html#sql-parser-planner-executor) of statements with this statement fingerprint within the aggregation interval. <br><br>The gray bar indicates the mean latency. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Contention | Average time statements with this fingerprint were [in contention]({{ link_prefix }}performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) with other transactions within the aggregation interval. <br><br>The gray bar indicates mean contention time. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Max Memory | Maximum memory used by a statement with this fingerprint at any time during its execution within the aggregation interval. <br><br>The gray bar indicates the average max memory usage. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Network | Amount of [data transferred over the network]({{ link_prefix }}architecture/reads-and-writes-overview.html) for statements with this fingerprint within the aggregation interval. <br><br>If this value is 0, the statement was executed on a single node. <br><br>The gray bar indicates the mean number of bytes sent over the network. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Retries | Cumulative number of automatic (internal) [retries]({{ link_prefix }}transactions.html#transaction-retries) by CockroachDB of statements with this fingerprint within the aggregation interval.
% of All Runtime  | How much time this statement fingerprint took to execute compared to all other statements that were executed within the time period. It is expressed as a percentage. The runtime is the mean execution latency multiplied by the execution count.
Regions/Nodes | The regions and nodes on which statements with this fingerprint executed. <br><br>**Regions/Nodes** are not visible for {{ site.data.products.serverless }} clusters.
Diagnostics | Activate and download [diagnostics](#diagnostics) for this fingerprint. To activate, click the **Activate** button. The column displays the status of diagnostics collection (`WAITING`, `READY`, OR `ERROR`). When the status is `READY`, click **Download bundle** to download the most recent diagnostics bundle. <br><br>Statements are periodically cleared from the Statements page based on the start time. To access the full history of diagnostics for the fingerprint, see the [Diagnostics](#diagnostics) section of the Statement Details page. <br><br>**Diagnostics** is not enabled for {{ site.data.products.serverless }} clusters.

## Statement Details page

Click a SQL statement fingerprint to open **Statement Details**. For each statement fingerprint, the details include:

- [Overview](#overview)
- [Diagnostics](#diagnostics)
- [Explain plan](#explain-plan)
- [Execution stats](#execution-stats)

The Statement Details page supports the search param `aggregated_ts`. If set, the page displays the statement statistics aggregated at that interval. If unset, the page displays the statement statistics aggregated over the date range specified on the Statements page.

### Overview

The **Overview** section displays the SQL statement fingerprint and essential statistics:

**Mean statement time** is the cumulative time taken to execute statements with this fingerprint within the aggregation interval.

  - **Planning time** is the cumulative time taken by the [planner]({{ link_prefix }}architecture/sql-layer.html#sql-parser-planner-executor) to create an execution plan for statements with this fingerprint within the specified time interval.
  - **Execution time** is the cumulative time taken to execute statements with this fingerprint in the specified time interval.

**Resource usage** displays statistics about storage, memory, and network usage for the SQL statement fingerprint.

  - **Mean rows/bytes read** displays the mean average number of rows and bytes [read from the storage layer]({{ link_prefix }}architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) for statements with this fingerprint within the aggregation interval .
  - **Max memory usage** displays the maximum memory used by a statement with this fingerprint at any time during its execution within the aggregation interval or specified time interval.
  - **Network usage** displays the amount of [data transferred over the network]({{ link_prefix }}architecture/reads-and-writes-overview.html) for statements with this fingerprint within the aggregation interval. If this value is 0, the statement was executed on a single node.
  - **Max scratch disk usage** displays the maximum amount of data [spilled to temporary storage on disk]({{ link_prefix }}vectorized-execution.html#disk-spilling-operations) while executing statements with this fingerprint within the aggregation interval.

**Statement details** displays information about the execution of the statement.

- **Interval start time** represents the start time of the statistics aggregation interval for a statement. For example, if a statement is executed at 1:23PM it will fall in the 1:00PM - 2:00PM time interval.
- **Nodes**: the nodes on which the statements executed. Click the node ID to view node statistics. <br><br>**Nodes** are not visible for {{ site.data.products.serverless }} clusters.
- **Regions**: the regions on which the statements executed. <br><br>**Regions** are not visible for {{ site.data.products.serverless }} clusters.
- **Database**: the database on which the statements executed.
- **App**: the name specified by the [`application_name`]({{ link_prefix }}show-vars.html#supported-variables) session setting.
- **Failed?**: whether the statement failed to execute.
- **Used cost-based optimizer?**: whether the execution used the [cost-based optimizer]({{ link_prefix }}cost-based-optimizer.html).
- **Distributed execution?**: whether the execution was distributed.
- **Vectorized execution?**: whether the execution used the [vectorized execution engine]({{ link_prefix }}vectorized-execution.html).
- **Transaction type**: the type of transaction (implicit or explicit).
- **Last execution time**: when the statement was last executed.

**Execution counts** displays execution statistics for the SQL statement fingerprint.

  - **First attempts**: the cumulative number of first attempts at executing statements with this fingerprint within the aggregation interval.
  - **Total executions**: the total number of executions of statements with this fingerprint. It is calculated as the sum of first attempts and retries.
  - **Retries**: the cumulative number of [retries]({{ link_prefix }}transactions.html#transaction-retries) of statements with this fingerprint within the aggregation interval.
  - **Max Retries**: the highest number of retries of a single statement with this fingerprint within the aggregation interval. For example, if three statements with the same fingerprint had to be retried 0, 1, and 5 times, then the Max Retries value for the fingerprint is 5.

### Diagnostics

The **Diagnostics** section allows you to activate and download diagnostics for the SQL statement fingerprint.

{{site.data.alerts.callout_info}}
The **Diagnostics** tab is not enabled for {{ site.data.products.serverless }} clusters.
{{site.data.alerts.end}}

When you activate diagnostics for a fingerprint, CockroachDB waits for the next SQL query that matches this fingerprint to be run on any node. On the next match, information about the SQL statement is written to a diagnostics bundle that you can download. This bundle consists of [statement traces]({{ link_prefix }}show-trace.html) in various formats (including a JSON file that can be [imported to Jaeger]({{ link_prefix }}query-behavior-troubleshooting.html#visualize-statement-traces-in-jaeger)), a physical query plan, execution statistics, and other information about the query. The bundle contents are identical to those produced by [`EXPLAIN ANALYZE (DEBUG)`]({{ link_prefix }}explain-analyze.html#debug-option). You can use the information collected in the bundle to diagnose problematic SQL statements, such as [slow queries]({{ link_prefix }}query-behavior-troubleshooting.html#query-is-always-slow). We recommend that you share the diagnostics bundle with our [support team]({{ link_prefix }}support-resources.html), which can help you interpret the results.

{{site.data.alerts.callout_success}}
Diagnostics will be collected a maximum of *N* times for a given activated fingerprint where *N* is the number of nodes in your cluster.
{{site.data.alerts.end}}

{% include common/sql/statement-bundle-warning.md %}

#### Activate diagnostics collection and download bundles

{% if page.cloud != true %}
<img src="{{ 'images/v21.2/ui_activate_diagnostics.png' | relative_url }}" alt="Statements diagnostics" style="border:1px solid #eee;max-width:80%" />
{% else %}
<img src="{{ 'images/cockroachcloud/statements_diagnostics.png' | relative_url }}" alt="{{ site.data.products.db }} Console Statements Page" style="border:1px solid #eee;max-width:100%" />
{% endif %}

To activate diagnostics collection, click the **Activate diagnostics** button.

A row  with the activation time and collection status is added to the **Statement diagnostics** table. The statuses are:

  - `WAITING` indicates that a SQL statement matching the fingerprint has not yet been recorded.
  - `ERROR` indicates that the attempt at diagnostics collection failed.
  - `READY` indicates that the diagnostics have been collected. Click <img src="{{ 'images/v21.2/ui-download-button.png' | relative_url }}" alt="Download bundle" /> **Bundle (.zip)** to download the diagnostics bundle.

{% if page.cloud != true %}
<img src="{{ 'images/v21.2/ui_statements_diagnostics.png' | relative_url }}" alt="Statements diagnostics" style="border:1px solid #eee;max-width:80%" />
{% endif %}

#### View and download diagnostic bundles for all statement fingerprints

Although fingerprints are periodically cleared from the Statements page, all diagnostics bundles are preserved. To view and download diagnostic bundles for all statement fingerprints do one of the following:

- On the Diagnostics page for a statement fingerprint, click the **All statement diagnostics** link.
{% if page.cloud != true %}
- Click **Advanced Debug** in the left-hand navigation and click [Statement Diagnostics History](ui-debug-pages.html#reports).
{% endif %}

{% if page.cloud != true %}
Click <img src="{{ 'images/v21.2/ui-download-button.png' | relative_url }}" alt="Download bundle" /> **Bundle (.zip)** to download any diagnostics bundle.
{% else %}
Click **Bundle(.zip)** to download any diagnostics bundle.
{% endif %}

### Explain Plan

The **Explain Plan** section displays CockroachDB's statement plan for an [explainable statement]({{ link_prefix }}sql-grammar.html#preparable_stmt). You can use this information to optimize the query. For more information about plans, see [`EXPLAIN`]({{ link_prefix }}explain.html).

{% if page.cloud == true %}
<img src="{{ 'images/cockroachcloud/statements_logical_plan.png' | relative_url }}" alt="{{ site.data.products.db }} Console Statements Page" style="border:1px solid #eee;max-width:100%" />
{% endif %}

By default, the explain plan for each fingerprint is sampled every 5 minutes. You can change the interval with the [`sql.metrics.statement_details.plan_collection.period`]({{ link_prefix }}cluster-settings.html#settings) cluster setting. For example, to change the interval to 2 minutes, run the following [`SET CLUSTER SETTING`]({{ link_prefix }}set-cluster-setting.html) command:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.metrics.statement_details.plan_collection.period  = '2m0s';
~~~

### Execution Stats

The Execution Stats section has three subsections:

- **Execution Latency by Phase** displays the service latency of statements matching this fingerprint, broken down by [phase]({{ link_prefix }}architecture/sql-layer.html#sql-parser-planner-executor) (parse, plan, run, overhead), as well as the overall service latency. Overhead comprises the statements that remain after subtracting parse, plan, and run latencies from the overall latency. These might include fetching table descriptors that were not cached, or other background tasks required to execute the query.

    {% if page.cloud != true %}
    {{site.data.alerts.callout_info}}
    Service latency can be affected by network latency, which is displayed for your cluster on the [Network Latency](ui-network-latency-page.html) page.
    {{site.data.alerts.end}}
    {% endif %}

- **Other Execution Statistics** displays the following statistics.

    Statistic | Description
    ----------|------------
    Rows Read | The number of rows read by the statement. The gray bar indicates the mean number of rows read. The blue bar indicates one standard deviation from the mean.
    Disk Bytes Read | The size of the data read by the statement. The gray bar indicates the mean number of bytes read. The blue bar indicates one standard deviation from the mean.

- **Stats by Node** provides a breakdown of the number of statements of the selected fingerprint per gateway node. You can use this table to determine whether, for example, you are executing queries on a node that is far from the data you are requesting (see [Optimize Statement Performance]({{ link_prefix }}make-queries-fast.html#cluster-topology)). <br><br>**Stats by Node** are not visible for {{ site.data.products.serverless }} clusters.

## See also

- [Troubleshoot Query Behavior]({{ link_prefix }}query-behavior-troubleshooting.html)
- [Transaction retries]({{ link_prefix }}transactions.html#transaction-retries)
- [Optimize Statement Performance]({{ link_prefix }}make-queries-fast.html)
- [Support Resources]({{ link_prefix }}support-resources.html)
- [Raw Status Endpoints]({{ link_prefix }}monitoring-and-alerting.html#raw-status-endpoints)
- [Transactions Page]({{ page_prefix }}transactions-page.html)
