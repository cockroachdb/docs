## Statement Details page

Click a SQL statement fingerprint to open **Statement Details**. For each statement fingerprint, the details include:

- [Overview](#overview)
- [Explain Plans](#explain-plans)
- [Diagnostics](#diagnostics)
- [Execution Stats](#execution-stats)

### Overview

The **Overview** section displays the SQL statement fingerprint and essential statistics:

**Mean statement time** is the cumulative time taken to execute statements with this fingerprint within the [date range](#date-range).

  - **Planning time** is the cumulative time taken by the [planner]({{ link_prefix }}architecture/sql-layer.html#sql-parser-planner-executor) to create an execution plan for statements with this fingerprint within the specified time interval.
  - **Execution time** is the cumulative time taken to execute statements with this fingerprint in the specified time interval.

**Resource usage** displays statistics about storage, memory, and network usage for the SQL statement fingerprint.

  - **Mean rows/bytes read** displays the mean number of rows and bytes [read from the storage layer]({{ link_prefix }}architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) for statements with this fingerprint within the date range.
  - **Mean rows written** displays the mean number of rows written by statements with this fingerprint within the date range.
  - **Max memory usage** displays the maximum memory used by a statement with this fingerprint at any time during its execution within the date range or specified time interval.
  - **Network usage** displays the amount of [data transferred over the network]({{ link_prefix }}architecture/reads-and-writes-overview.html) for statements with this fingerprint within the date range. If this value is 0, the statement was executed on a single node.
  - **Max scratch disk usage** displays the maximum amount of data [spilled to temporary storage on disk]({{ link_prefix }}vectorized-execution.html#disk-spilling-operations) while executing statements with this fingerprint within the date range.

**Statement details** displays information about the execution of the statement.

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

  - **First attempts**: the cumulative number of first attempts at executing statements with this fingerprint within the date range.
  - **Total executions**: the total number of executions of statements with this fingerprint. It is calculated as the sum of first attempts and retries.
  - **Retries**: the cumulative number of [retries]({{ link_prefix }}transactions.html#transaction-retries) of statements with this fingerprint within the date range.
  - **Max retries**: the highest number of retries of a single statement with this fingerprint within the date range. For example, if three statements with the same fingerprint had to be retried 0, 1, and 5 times, then the Max Retries value for the fingerprint is 5.

### Explain Plans

{% include_cached new-in.html version="v22.1" %} The **Explain Plans** tab displays statement plans for an [explainable statement]({{ link_prefix }}sql-grammar.html#preparable_stmt) in the time interval selected [date range](#date-range). You can use this information to optimize the query. For more information about plans, see [`EXPLAIN`]({{ link_prefix }}explain.html).

{% if page.cloud == true %}
<img src="{{ 'images/cockroachcloud/statements_logical_plan.png' | relative_url }}" alt="{{ site.data.products.db }} Console Statements Page" style="border:1px solid #eee;max-width:100%" />
{% endif %}

{% if page.cloud != true %}
The following screenshot shows two executions of the query described in [Use the right index](apply-statement-performance-rules.html#rule-2-use-the-right-index).

<img src="{{ 'images/v22.1/ui_plan_table.png' | relative_url }}" alt="Plan table" style="border:1px solid #eee;max-width:80%" />

The plan table shows statistics for the execution and whether the execution was distributed or used the [vectorized execution engine]({{ link_prefix }}vectorized-execution.html). In the screenshot, the **Average Execution Time** column show that the second execution, which uses the index, takes less time than the first execution.

To display the plan that was executed, click a plan ID. When you click the plan ID `13929609339379026000`, the following plan displays:

<img src="{{ 'images/v22.1/ui_statement_plan.png' | relative_url }}" alt="Plan table" style="border:1px solid #eee;max-width:80%" />
{% endif %}

### Diagnostics

The **Diagnostics** tab allows you to activate and download diagnostics for a SQL statement fingerprint.

{{site.data.alerts.callout_info}}
The **Diagnostics** tab is not visible:

- On {{ site.data.products.serverless }} clusters.
- For roles with the `VIEWACTIVITYREDACTED` [role option]({{ link_prefix }}alter-role.html#role-options).
{{site.data.alerts.end}}

When you activate diagnostics for a fingerprint, CockroachDB waits for the next SQL query that matches this fingerprint to be run on any node. On the next match, information about the SQL statement is written to a diagnostics bundle that you can download. This bundle consists of [statement traces]({{ link_prefix }}show-trace.html) in various formats (including a JSON file that can be [imported to Jaeger]({{ link_prefix }}query-behavior-troubleshooting.html#visualize-statement-traces-in-jaeger)), a physical query plan, execution statistics, and other information about the query. The bundle contents are identical to those produced by [`EXPLAIN ANALYZE (DEBUG)`]({{ link_prefix }}explain-analyze.html#debug-option). You can use the information collected in the bundle to diagnose problematic SQL statements, such as [slow queries]({{ link_prefix }}query-behavior-troubleshooting.html#query-is-always-slow). We recommend that you share the diagnostics bundle with our [support team]({{ link_prefix }}support-resources.html), which can help you interpret the results.

{{site.data.alerts.callout_success}}
Diagnostics will be collected a maximum of *N* times for a given activated fingerprint where *N* is the number of nodes in your cluster.
{{site.data.alerts.end}}

{% include common/sql/statement-bundle-warning.md %}

#### Activate diagnostics collection and download bundles

<img src="{{ 'images/v22.1/ui_activate_diagnostics.png' | relative_url }}" alt="Statements diagnostics" style="border:1px solid #eee;max-width:80%" />

To activate diagnostics collection:

1. Click the **Activate diagnostics** button. {% include_cached new-in.html version="v22.1" %} The **Activate statement diagnostics** dialog displays.

    <img src="{{ 'images/v22.1/ui_activate_diagnostics_dialog.png' | relative_url }}" alt="Statements diagnostics" style="border:1px solid #eee;max-width:80%" />

1. Choose whether to activate collection on the next statement execution (default) or if execution latency exceeds a certain time. If you choose the latter, accept the default latency of 100 milliseconds, or specify a different time. All executions of the statement fingerprint will run slower until diagnostics are collected.
1. Choose whether the request should expire after 15 minutes, or after a different the time, or disable automatic expiration by deselecting the checkbox.
1. Click **Activate**.

A row  with the activation time and collection status is added to the **Statement diagnostics** table.

<img src="{{ 'images/v22.1/ui_statements_diagnostics.png' | relative_url }}" alt="Statements diagnostics" style="border:1px solid #eee;max-width:80%" />

The collection status values are:

- **READY**: indicates that the diagnostics have been collected. To download the diagnostics bundle, click <img src="{{ 'images/v22.1/ui-download-button.png' | relative_url }}" alt="Download bundle" /> **Bundle (.zip)**.
- **WAITING**: indicates that a SQL statement matching the fingerprint has not yet been recorded. {% include_cached new-in.html version="v22.1" %} To cancel diagnostics collection, click the **Cancel request** button.
- **ERROR**: indicates that the attempt at diagnostics collection failed.

#### View and download diagnostic bundles for all statement fingerprints

Although fingerprints are periodically cleared from the Statements page, all diagnostics bundles are preserved. To view and download diagnostic bundles for all statement fingerprints, do one of the following:

- On the **Diagnostics** tab for a statement fingerprint, click the **All statement diagnostics** link.
{% if page.cloud != true %}
- Click **Advanced Debug** in the left-hand navigation and click [Statement Diagnostics History](ui-debug-pages.html#reports).
{% endif %}

Click <img src="{{ 'images/v22.1/ui-download-button.png' | relative_url }}" alt="Download bundle" /> **Bundle (.zip)** to download any diagnostics bundle.

### Execution Stats

The Execution Stats tab has three subsections:

- **Execution Latency by Phase** displays the service latency of statements matching this fingerprint, broken down by [phase]({{ link_prefix }}architecture/sql-layer.html#sql-parser-planner-executor) (parse, plan, run, overhead), as well as the overall service latency. Overhead comprises the statements that remain after subtracting parse, plan, and run latencies from the overall latency. These might include fetching table descriptors that were not cached, or other background tasks required to execute the query.

    {% if page.cloud != true %}
    {{site.data.alerts.callout_info}}
    Service latency can be affected by network latency, which is displayed for your cluster on the [Network Latency](ui-network-latency-page.html) page.
    {{site.data.alerts.end}}
    {% endif %}

- **Other Execution Statistics** displays the following statistics.

    Statistic | Description
    ----------|------------
    Rows Read | The number of rows read by the statement.
    Disk Bytes Read | The size of the data read by the statement.
    Rows Written | The number of rows written by the statement.

- **Stats by Node** provides a breakdown of the number of statements of the selected fingerprint per gateway node. You can use this table to determine whether, for example, you are executing queries on a node that is far from the data you are requesting (see [Optimize Statement Performance]({{ link_prefix }}make-queries-fast.html#cluster-topology)). <br><br>**Stats by Node** are not visible for {{ site.data.products.serverless }} clusters.

## See also

- [Troubleshoot Query Behavior]({{ link_prefix }}query-behavior-troubleshooting.html)
- [Transaction retries]({{ link_prefix }}transactions.html#transaction-retries)
- [Optimize Statement Performance]({{ link_prefix }}make-queries-fast.html)
- [Support Resources]({{ link_prefix }}support-resources.html)
- [Raw Status Endpoints]({{ link_prefix }}monitoring-and-alerting.html#raw-status-endpoints)
- [Transactions Page]({{ page_prefix }}transactions-page.html)
