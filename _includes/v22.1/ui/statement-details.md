<a id="statement-details-page"></a>

## Statement Fingerprint page

### Overview

The **Overview** section displays the SQL statement fingerprint and execution attributes:

- **Nodes**: the nodes on which the statements executed. Click a node ID to view node statistics. **Nodes** are not displayed for {{ site.data.products.serverless }} clusters.
- **Regions**: the regions on which the statements executed. **Regions** are not displayed for {{ site.data.products.serverless }} clusters.
- **Database**: the database on which the statements executed.
- **App**: the name specified by the [`application_name`]({{ link_prefix }}show-vars.html#supported-variables) session setting. Click the name to view all statements run by that application.
- **Failed?**: whether the statement failed to execute.
- **Full scan?**: whether the execution performed a full scan of the table.
- **Vectorized execution?**: whether the execution used the [vectorized execution engine]({{ link_prefix }}vectorized-execution.html).
- **Transaction type**: the type of transaction ([implicit]({{ link_prefix }}transactions.html#individual-statements) or [explicit]({{ link_prefix }}transactions.html#sql-statements)).
- **Last execution time**: when the statement was last executed.

The following screenshot shows the statement fingerprint of the query described in [Use the right index]({{ link_prefix }}apply-statement-performance-rules.html#rule-2-use-the-right-index):

<img src="{{ 'images/v22.1/ui_statement_fingerprint_overview.png' | relative_url }}" alt="Statement fingerprint overview" style="border:1px solid #eee;max-width:100%" />

#### Charts

Charts following the execution attributes display the following statistics for statements with the fingerprint during the selected [time interval](#time-interval):

- **Statement Execution and Planning Time**: the time taken by the [planner]({{ link_prefix }}architecture/sql-layer.html#sql-parser-planner-executor) to create an execution plan and for CockroachDB to execute statements.
- **Rows Processed**: the total number of rows read and written.
- **Execution Retries**: the number of [retries]({{ link_prefix }}transactions.html#transaction-retries).
- **Execution Count**: the total number of executions. It is calculated as the sum of first attempts and retries.
- **Contention**: the amount of time spent waiting for resources.

The following charts summarize the executions of the statement fingerprint illustrated in the preceding section:

<img src="{{ 'images/v22.1/ui_statement_fingerprint_charts.png' | relative_url }}" alt="Statement fingerprint charts" style="border:1px solid #eee;max-width:100%" />

### Explain Plans

{% include_cached new-in.html version="v22.1" %} The **Explain Plans** tab displays statement plans for an [explainable statement]({{ link_prefix }}sql-grammar.html#preparable_stmt) in the selected time interval [time interval](#time-interval). You can use this information to optimize the query. For more information about plans, see [`EXPLAIN`]({{ link_prefix }}explain.html).

The following screenshot shows two executions of the query discussed in the preceding sections:

<img src="{{ 'images/v22.1/ui_plan_table.png' | relative_url }}" alt="Plan table" style="border:1px solid #eee;max-width:100%" />

The plan table shows statistics for the execution and whether the execution was distributed or used the [vectorized execution engine]({{ link_prefix }}vectorized-execution.html). In the screenshot, the **Average Execution Time** column show that the second execution at `20:37`, which uses the index, takes less time than the first execution.

To display the plan that was executed, click a plan ID. When you click the plan ID `13182663282122740000`, the following plan displays:

<img src="{{ 'images/v22.1/ui_statement_plan.png' | relative_url }}" alt="Plan table" style="border:1px solid #eee;max-width:100%" />

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

<img src="{{ 'images/v22.1/ui_activate_diagnostics.png' | relative_url }}" alt="Statements diagnostics" style="border:1px solid #eee;max-width:100%" />

To activate diagnostics collection:

1. Click the **Activate diagnostics** button. {% include_cached new-in.html version="v22.1" %} The **Activate statement diagnostics** dialog displays.

    <img src="{{ 'images/v22.1/ui_activate_diagnostics_dialog.png' | relative_url }}" alt="Statements diagnostics" style="border:1px solid #eee;max-width:100%" />

1. Choose whether to activate collection on the next statement execution (default) or if execution latency exceeds a certain time. If you choose the latter, accept the default latency of 100 milliseconds, or specify a different time. All executions of the statement fingerprint will run slower until diagnostics are collected.
1. Choose whether the request should expire after 15 minutes, or after a different the time, or disable automatic expiration by deselecting the checkbox.
1. Click **Activate**.

A row  with the activation time and collection status is added to the **Statement diagnostics** table.

<img src="{{ 'images/v22.1/ui_statement_diagnostics.png' | relative_url }}" alt="Statement diagnostics" style="border:1px solid #eee;max-width:100%" />

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

## See also

- [Troubleshoot Query Behavior]({{ link_prefix }}query-behavior-troubleshooting.html)
- [Transaction retries]({{ link_prefix }}transactions.html#transaction-retries)
- [Optimize Statement Performance]({{ link_prefix }}make-queries-fast.html)
- [Support Resources]({{ link_prefix }}support-resources.html)
- [Raw Status Endpoints]({{ link_prefix }}monitoring-and-alerting.html#raw-status-endpoints)
- [Transactions Page]({{ page_prefix }}transactions-page.html)
