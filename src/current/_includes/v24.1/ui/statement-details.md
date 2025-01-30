<a id="statement-details-page"></a>

## Statement Fingerprint page

The details displayed on the **Statement Fingerprint** page reflect the [time interval](#time-interval) selected on the **Statements** page and the application name and database specified in the selected row of the [Statements table](#statements-table).

### Overview

The **Overview** section displays the SQL statement fingerprint and execution attributes:

 Attribute | Description
-----------|-------------
**Nodes** | The nodes on which the statements executed. Click a node ID to view node statistics. **Nodes** are not displayed for CockroachDB {{ site.data.products.standard }} clusters.
**Regions** | The regions on which the statements executed. **Regions** are not displayed for CockroachDB {{ site.data.products.standard }} clusters.
**Database** | The database on which the statements executed.
**Application Name** | The name specified by the [`application_name`]({{ link_prefix }}show-vars.html#supported-variables) session setting. Click the name to view all statements run by that application.
**Fingerprint ID** | The ID of the statement fingerprint in hexadecimal format. It may be used to query the [`crdb_internal.statement_statistics`]({{ link_prefix }}crdb-internal.html#fingerprint_id-column) table.
**Failure Count** | The total number of failed executions of this statement fingerprint.
**Full scan?** | Whether the execution performed a full scan of the table.
**Vectorized execution?** | Whether the execution used the [vectorized execution engine]({{ link_prefix }}vectorized-execution.html).
**Transaction type** | The type of transaction ([implicit]({{ link_prefix }}transactions.html#individual-statements) or [explicit]({{ link_prefix }}transactions.html#sql-statements)).
**Last execution time** | The timestamp when the statement was last executed.

The **Overview** section also displays the SQL statement fingerprint statistics that correspond to the [charts](#charts) below:

|<div style="width:150px">Statistic</div>| Description |
|-----------|-------------|
|**Statement Time** | The time taken by the [planner]({{ link_prefix }}architecture/sql-layer.html#sql-parser-planner-executor) to create an execution plan and for CockroachDB to execute statements. |
|**Rows Processed** | The total number of rows read and written. |
|**Execution Retries** | The number of [retries]({{ link_prefix }}transactions.html#transaction-retries). |
|**Execution Count** | The total number of executions. It is calculated as the sum of first attempts and retries. |
|**Contention Time** | The amount of time spent waiting for resources. For more information about contention, see [Understanding and avoiding transaction contention]({{ link_prefix }}performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention). |
|**SQL CPU Time** | The amount of SQL CPU time spent executing the statement. The SQL CPU time represents the time spent and work done within SQL execution operators. It does not include SQL planning time or KV execution time. |
|**Client Wait Time** | The time spent waiting for the client to send the statement while holding the transaction open. A high wait time indicates that you should revisit the entire transaction and [batch your statements]({{ link_prefix }}transactions.html#batched-statements). |

The following screenshot shows the statement fingerprint of the query described in [Use the right index]({{ link_prefix }}apply-statement-performance-rules.html#rule-2-use-the-right-index):

![Statement fingerprint overview](/images/v24.1/ui_statement_fingerprint_overview.png)

#### Insights

The **Insights** table is displayed when CockroachDB has detected a problem with the statement fingerprint.

- **Insights**: Provides the [Workload Insight type]({{ link_prefix }}ui-insights-page.html#workload-insight-types).
- **Details**: Provides a description and possible recommendation.
- **Latest Execution ID**: The ID of the latest statement execution. To display the details of the [statement execution]({{ link_prefix }}ui-insights-page.html#statement-execution-details), click the ID.

The following screenshot shows the insights of the statement fingerprint illustrated in [Overview](#overview):

![Statement fingerprint overview](/images/v24.1/ui_statement_fingerprint_insights.png)

#### Charts

Charts following the execution attributes display statement fingerprint statistics:

|<div style="width:150px">Statistic</div>| Description |
|-----------|-------------|
|**Statement Time** | The time taken by the [planner]({{ link_prefix }}architecture/sql-layer.html#sql-parser-planner-executor) to create an execution plan and for CockroachDB to execute statements. |
|**Rows Processed** | The total number of rows read and written. |
|**Execution Retries** | The number of [retries]({{ link_prefix }}transactions.html#transaction-retries). |
|**Execution Count** | The total number of executions. It is calculated as the sum of first attempts and retries. |
|**Contention Time** | The amount of time spent waiting for resources. For more information about contention, see [Understanding and avoiding transaction contention]({{ link_prefix }}performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention). |
|**SQL CPU Time** | The amount of SQL CPU time spent executing the statement. The SQL CPU time represents the time spent and work done within SQL execution operators. It does not include SQL planning time or KV execution time. |
|**Client Wait Time** | The time spent waiting for the client to send the statement while holding the transaction open. A high wait time indicates that you should revisit the entire transaction and [batch your statements]({{ link_prefix }}transactions.html#batched-statements). |

The following charts summarize the executions of the statement fingerprint illustrated in [Overview](#overview):

![Statement fingerprint charts](/images/v24.1/ui_statement_fingerprint_charts.png)

### Explain Plans

The **Explain Plans** tab displays statement plans for an [explainable statement]({{ link_prefix }}sql-grammar.html#preparable_stmt) in the selected [time interval](#time-interval). You can use this information to optimize the query. For more information about plans, see [`EXPLAIN`]({{ link_prefix }}explain.html).

The following screenshot shows an execution of the query discussed in [Overview](#overview):

![Plan table](/images/v24.1/ui_plan_table.png)

The plan table shows the following details:

Column | Description
-----|----
Plan Gist | A sequence of bytes representing the flattened tree of operators and operator-specific metadata of the statement plan.
Used Indexes | The table [indexes]({{ link_prefix }}indexes.html) used by the plan. To see [table details]({{ link_prefix }}ui-databases-page.html#table-details), click on the table name. To see [index details]({{ link_prefix }}ui-databases-page.html#index-details), click on the index name.
Insights | The number of [insights](#insights) for the plan. To configure when to trigger insights, see [Schema insights settings]({{ link_prefix }}ui-insights-page.html#schema-insights-settings).
Last Execution Time | The timestamp when the statement was last executed.
Average Execution Time | The average execution time for all the executions of the plan.
Execution Count | The number of times the plan was executed.
Average Rows Read | The average number of rows read when the plan was executed.
Full Scan | Whether the execution performed a full scan of the table.
Min Latency | The lowest latency value for all statement executions with this Explain Plan.
Max Latency | The highest latency value for all statement executions with this Explain Plan.
P50 Latency | The 50th latency percentile for sampled statement executions with this Explain Plan.
P90 Latency | The 90th latency percentile for sampled statement executions with this Explain Plan.
P99 Latency | The 99th latency percentile for sampled statement executions with this Explain Plan.
Distributed | Whether the execution was distributed.
Vectorized | Whether the execution used the [vectorized execution engine]({{ link_prefix }}vectorized-execution.html).

To display the plan that was executed, click the plan gist. For the plan gist `AgHUAQIABQAAAAHYAQIAiA...`, the following plan displays:

![Plan table](/images/v24.1/ui_statement_plan.png)

#### Insights

The plan table displays the number of insights related to the plan. If a plan has at least 1 insight, when you click the plan gist, a table of insights that describe how to improve the performance will follow the plan.

The following screenshot shows 1 insight found after running the query discussed in [Overview](#overview) 6 or more times:

![Plan with insight](/images/v24.1/plan_with_insight.png)

{{site.data.alerts.callout_info}}
CockroachDB uses the threshold of 6 executions before offering an insight because it assumes that you are no longer merely experimenting with a query at that point.
{{site.data.alerts.end}}

In this case the insight is recommending that you create an index on the `start_time` column of the `rides` table and storing the `rider_id`.

If you click **Create Index**, a confirmation dialog displays a warning about the cost of [online schema changes]({{ link_prefix }}online-schema-changes.html) and a button to copy the SQL statement for later execution in a SQL client.

If you click **Apply** to create the index and then execute the statement again, the **Explain Plans** tab will show that the second execution (in this case at `19:40`), which uses the index and has no insight, takes less time than the first 6 executions.

![Plan table after index](/images/v24.1/ui_statement_plan_2.png)

### Diagnostics

The **Diagnostics** tab allows you to activate and download diagnostics for a SQL statement fingerprint.

{{site.data.alerts.callout_info}}
The **Diagnostics** tab is only visible to [`admin` users]({{ link_prefix }}security-reference/authorization.html#admin-role) or SQL users with the [`VIEWACTIVITY` system privilege]({{ link_prefix }}security-reference/authorization.html#viewactivity). The tab is not visible for roles with the [`VIEWACTIVITYREDACTED` system privilege]({{ link_prefix }}security-reference/authorization.html#viewactivityredacted) (or the legacy `VIEWACTIVITYREDACTED` [role option]({{ link_prefix }}security-reference/authorization.html#role-options)) defined.
{{site.data.alerts.end}}

When you activate diagnostics for a fingerprint, CockroachDB waits for the next SQL query that matches this fingerprint to be run on any node. On the next match, information about the SQL statement is written to a diagnostics bundle that you can download. This bundle consists of [statement traces]({{ link_prefix }}show-trace.html) in various formats (including a JSON file that can be [imported to Jaeger]({{ link_prefix }}query-behavior-troubleshooting.html#visualize-statement-traces-in-jaeger)), a physical query plan, execution statistics, and other information about the query. The bundle contents are identical to those produced by [`EXPLAIN ANALYZE (DEBUG)`]({{ link_prefix }}explain-analyze.html#debug-option). You can use the information collected in the bundle to diagnose problematic SQL statements, such as [slow queries]({{ link_prefix }}query-behavior-troubleshooting.html#query-is-always-slow). We recommend that you share the diagnostics bundle with our [support team]({{ link_prefix }}support-resources.html), which can help you interpret the results.

{{site.data.alerts.callout_success}}
Diagnostics will be collected a maximum of *N* times for a given activated fingerprint where *N* is the number of nodes in your cluster.
{{site.data.alerts.end}}

{% include "_includes/common/sql/statement-bundle-warning.md" %}

#### Activate diagnostics collection and download bundles

![Activate statement diagnostics](/images/v24.1/ui_activate_diagnostics.png)

{{site.data.alerts.callout_danger}}
Collecting diagnostics has an impact on performance. All executions of the statement fingerprint will run slower until diagnostics are collected.
{{site.data.alerts.end}}

To activate diagnostics collection:

1. Click the **Activate diagnostics** button. The **Activate statement diagnostics** dialog displays.

1. Choose whether to:
   1. trace and collect diagnostics at the default sampled rate of 1% (or specify a different rate) when the statement execution latency exceeds the default time of 100 milliseconds (or specify a different time), or
   1. trace and collect diagnostics on the next statement execution.
1. Choose whether to collect diagnostics:
   1. For all plan gists, or
   1. For a particular plan gist (select one from the dropdown list).
1. Choose whether the request should expire after 15 minutes, or after a different time, or disable automatic expiration by deselecting the checkbox. Executions of the same statement fingerprint will run slower while diagnostics are activated, so it is recommended to set an expiration time if collecting according to a latency threshold.
1. Click **Activate**.

When the statement fingerprint is executed according to the statement diagnostic options selected, a row with the activation time and collection status is added to the **Statement diagnostics** table.

![Statement diagnostics table](/images/v24.1/ui_statement_diagnostics.png)

The collection status values are:

- **READY**: indicates that the diagnostics have been collected. To download the diagnostics bundle, click ![Down arrow](/images/v24.1/ui-download-button.png) **Bundle (.zip)**.
- **WAITING**: indicates that a SQL statement matching the fingerprint has not yet been recorded. To cancel diagnostics collection, click the **Cancel request** button.
- **ERROR**: indicates that the attempt at diagnostics collection failed.

#### View and download diagnostic bundles for all statement fingerprints

Although fingerprints are periodically cleared from the Statements page, all diagnostics bundles are preserved. To view and download diagnostic bundles for all statement fingerprints, do one of the following:

- On the **Diagnostics** tab for a statement fingerprint, click the **All statement diagnostics** link.
{% if page.cloud != true %}
- Click **Advanced Debug** in the left-hand navigation and click [Statement Diagnostics History]({{ page.version.version }}/ui-debug-pages.md#reports).
{% endif %}

Click ![Down arrow](/images/v24.1/ui-download-button.png) **Bundle (.zip)** to download any diagnostics bundle.
