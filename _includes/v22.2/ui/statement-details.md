<a id="statement-details-page"></a>

## Statement Fingerprint page

The details displayed on the **Statement Fingerprint** page reflect the [time interval](#time-interval) selected on the **Statements** page.

### Overview

The **Overview** section displays the SQL statement fingerprint and execution attributes:

- **Nodes**: The nodes on which the statements executed. Click a node ID to view node statistics. **Nodes** are not displayed for {{ site.data.products.serverless }} clusters.
- **Regions**: The regions on which the statements executed. **Regions** are not displayed for {{ site.data.products.serverless }} clusters.
- **Database**: The database on which the statements executed.
- **Application Name**: The name specified by the [`application_name`]({{ link_prefix }}show-vars.html#supported-variables) session setting. Click the name to view all statements run by that application.
- **Failed?**: Whether the statement failed to execute.
- **Full scan?**: Whether the execution performed a full scan of the table.
- **Vectorized execution?**: Whether the execution used the [vectorized execution engine]({{ link_prefix }}vectorized-execution.html).
- **Transaction type**: The type of transaction ([implicit]({{ link_prefix }}transactions.html#individual-statements) or [explicit]({{ link_prefix }}transactions.html#sql-statements)).
- **Last execution time**: The timestamp when the statement was last executed.

Run the query described in [Use the right index]({{ link_prefix }}apply-statement-performance-rules.html#rule-2-use-the-right-index):

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

The following screenshot shows the statement fingerprint of the query described in [Use the right index]({{ link_prefix }}apply-statement-performance-rules.html#rule-2-use-the-right-index):

<img src="{{ 'images/v22.2/ui_statement_fingerprint_overview.png' | relative_url }}" alt="Statement fingerprint overview" style="border:1px solid #eee;max-width:100%" />

#### Charts

Charts following the execution attributes display statement fingerprint statistics:

- **Statement Execution and Planning Time**: The time taken by the [planner]({{ link_prefix }}architecture/sql-layer.html#sql-parser-planner-executor) to create an execution plan and for CockroachDB to execute statements.
- **Rows Processed**: The total number of rows read and written.
- **Execution Retries**: The number of [retries]({{ link_prefix }}transactions.html#transaction-retries).
- **Execution Count**: The total number of executions. It is calculated as the sum of first attempts and retries.
- **Contention Time**: The amount of time spent waiting for resources.

The following charts summarize the executions of the statement fingerprint illustrated in [Overview](#overview):

<img src="{{ 'images/v22.2/ui_statement_fingerprint_charts.png' | relative_url }}" alt="Statement fingerprint charts" style="border:1px solid #eee;max-width:100%" />

### Explain Plans

The **Explain Plans** tab displays statement plans for an [explainable statement]({{ link_prefix }}sql-grammar.html#preparable_stmt) in the selected [time interval](#time-interval). You can use this information to optimize the query. For more information about plans, see [`EXPLAIN`]({{ link_prefix }}explain.html).

The following screenshot shows an execution of the query discussed in [Overview](#overview):

<img src="{{ 'images/v22.2/ui_plan_table.png' | relative_url }}" alt="Plan table" style="border:1px solid #eee;max-width:100%" />

The plan table shows the following details:

Column | Description
-----|----
Plan Gist | A sequence of bytes representing the flattened tree of operators and operator-specific metadata of the statement plan.
Insights | The number of [insights](#insights) for the plan. To configure when to trigger insights, see [Schema insights settings](ui-insights-page.html#schema-insights-settings).
Last Execution Time | The timestamp when the statement was last executed.
Average Execution Time | The average execution time for all the executions of the plan.
Execution Count | The number of times the plan was executed.
Average Rows Read | The average number of rows read when the plan was executed.
Full Scan | Whether the execution performed a full scan of the table.
Distributed | Whether the execution was distributed.
Vectorized | Whether the execution used the [vectorized execution engine]({{ link_prefix }}vectorized-execution.html).

To display the plan that was executed, click the plan gist. For the plan gist `AgHUAQIABQAAAAHYAQIAiA...`, the following plan displays:

<img src="{{ 'images/v22.2/ui_statement_plan.png' | relative_url }}" alt="Plan table" style="border:1px solid #eee;max-width:100%" />

#### Insights

{% include_cached new-in.html version="v22.2" %} The plan table displays the number of insights related to the plan. If a plan has at least 1 insight, when you click the plan gist, a table of insights that describe how to improve the performance will follow the plan.

The following screenshot shows 1 insight found after running the query discussed in [Overview](#overview) 6 or more times:

<img src="{{ 'images/v22.2/plan_with_insight.png' | relative_url }}" alt="Plan with insight" style="border:1px solid #eee;max-width:100%" />

CockroachDB uses the threshold of 6 executions before offering an insight because it assumes that you are no longer merely experimenting with a query at that point.

In this case the insight is recommending that you create an index on the `start_time` column of the `rides` table and storing the `rider_id`.

If you click **Create Index**, a confirmation dialog displays a warning about the cost of [online schema changes](online-schema-changes.html) and a button to copy the SQL statement for later execution in a SQL client.

If you click **Apply** to create the index and then execute the statement again, the **Explain Plans** tab will show that the second execution (in this case at `19:40`), which uses the index and has no insight, takes less time than the first 6 executions.

<img src="{{ 'images/v22.2/ui_statement_plan_2.png' | relative_url }}" alt="Plan table after index" style="border:1px solid #eee;max-width:100%" />

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

<img src="{{ 'images/v22.2/ui_activate_diagnostics.png' | relative_url }}" alt="Activate statement diagnostics" style="border:1px solid #eee;max-width:100%" />

To activate diagnostics collection:

1. Click the **Activate diagnostics** button. The **Activate statement diagnostics** dialog displays.

    <img src="{{ 'images/v22.2/ui_activate_diagnostics_dialog.png' | relative_url }}" alt="Statements diagnostics dialog" style="border:1px solid #eee;max-width:100%" />

1. Choose whether to activate collection on the next statement execution (default) or if execution latency exceeds a certain time. If you choose the latter, accept the default latency of 100 milliseconds, or specify a different time. All executions of the statement fingerprint will run slower until diagnostics are collected.
1. Choose whether the request should expire after 15 minutes, or after a different the time, or disable automatic expiration by deselecting the checkbox.
1. Click **Activate**.

A row  with the activation time and collection status is added to the **Statement diagnostics** table.

<img src="{{ 'images/v22.2/ui_statement_diagnostics.png' | relative_url }}" alt="Statement diagnostics table" style="border:1px solid #eee;max-width:100%" />

The collection status values are:

- **READY**: indicates that the diagnostics have been collected. To download the diagnostics bundle, click <img src="{{ 'images/v22.2/ui-download-button.png' | relative_url }}" alt="Down arrow" /> **Bundle (.zip)**.
- **WAITING**: indicates that a SQL statement matching the fingerprint has not yet been recorded. To cancel diagnostics collection, click the **Cancel request** button.
- **ERROR**: indicates that the attempt at diagnostics collection failed.

#### View and download diagnostic bundles for all statement fingerprints

Although fingerprints are periodically cleared from the Statements page, all diagnostics bundles are preserved. To view and download diagnostic bundles for all statement fingerprints, do one of the following:

- On the **Diagnostics** tab for a statement fingerprint, click the **All statement diagnostics** link.
{% if page.cloud != true %}
- Click **Advanced Debug** in the left-hand navigation and click [Statement Diagnostics History](ui-debug-pages.html#reports).
{% endif %}

Click <img src="{{ 'images/v22.2/ui-download-button.png' | relative_url }}" alt="Down arrow" /> **Bundle (.zip)** to download any diagnostics bundle.

## See also

- [Troubleshoot Query Behavior]({{ link_prefix }}query-behavior-troubleshooting.html)
- [Transaction retries]({{ link_prefix }}transactions.html#transaction-retries)
- [Optimize Statement Performance]({{ link_prefix }}make-queries-fast.html)
- [Support Resources]({{ link_prefix }}support-resources.html)
- [Raw Status Endpoints]({{ link_prefix }}monitoring-and-alerting.html#raw-status-endpoints)
- [Transactions Page]({{ page_prefix }}transactions-page.html)
