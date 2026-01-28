## Workload Insights tab

The **Workload Insights** tab displays insights related to [transaction]({{ link_prefix }}transactions.html) and [statement]({{ link_prefix }}show-statements.html) executions.

### Transaction Executions view

{% if page.cloud != true -%}
To display this view, click **Insights** in the left-hand navigation of the DB Console and select **Workload Insights > Transaction Executions**.
{% endif -%}
{% if page.cloud == true -%}

To display this view, click **Insights** in the left-hand navigation of the Cloud Console and select **Workload Insights > Transaction Executions**.
{% endif -%}

The **Transaction Executions** view provides an overview of all [transaction executions]({{ link_prefix }}transactions.html) that have been flagged with insights.

{{site.data.alerts.callout_info}}
The rows in this page are populated from the [`crdb_internal.transaction_contention_events`]({{ link_prefix }}crdb-internal.html#transaction_contention_events) and  `crdb_internal.cluster_txn_execution_insights` tables.

- The results displayed in the **Transaction Executions** view will be available as long as a corresponding row in the `crdb_internal.transaction_contention_events` or `crdb_internal.cluster_txn_execution_insights` tables exists. The rows in `crdb_internal.transaction_contention_events` on each node must use less space than `sql.contention.event_store.capacity`, and the rows in `crdb_internal.transaction_contention_events` cannot exceed `sql.insights.execution_insights_capacity`.
- The default tracing behavior captures a small percent of transactions so not all contention events will be recorded. When investigating [transaction contention]({{ link_prefix }}performance-best-practices-overview.html#transaction-contention), you can set the [`sql.trace.txn.enable_threshold` cluster setting]({{ link_prefix }}cluster-settings.html#setting-sql-trace-txn-enable-threshold) to always capture contention events.
{{site.data.alerts.end}}

The transaction insights table has the following columns:

Column | Description
-------|------------
Latest Transaction Execution ID | The execution ID of the latest execution with the transaction fingerprint. To view [details of the execution](#transaction-execution-details), click the execution ID.
Transaction Fingerprint ID | The transaction fingerprint ID of the latest transaction execution.
Transaction Execution | The transaction fingerprint of the latest transaction execution.
Status | The status of the transaction: `Failed` or `Completed`.
Insights | The [insight type](#workload-insight-types) for the transaction execution.
Start Time (UTC) | The timestamp when the transaction execution started.
Contention Time | The amount of time the transaction execution spent waiting in [contention]({{ link_prefix }}performance-best-practices-overview.html#transaction-contention).
CPU Time | The amount of CPU time spent executing the transaction. The CPU time represents the time spent and work done within SQL execution operators.<br><br>{% if page.cloud != true -%}The CPU time includes time spent in the [SQL layer]({% link {{ page.version.version }}/architecture/sql-layer.md %}). It does not include time spent in the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}).{% endif -%}{% if page.cloud == true -%}The CPU time includes time spent in the [SQL layer](../stable/architecture/sql-layer.html). It does not include time spent in the [storage layer](../stable/architecture/storage-layer.html).{% endif %}
Application Name | The name specified by the [`application_name` session setting]({{ link_prefix }}show-vars.html#supported-variables).

### Transaction Execution details

The transaction execution details view provides more information on a transaction execution insight.

#### Default details

This information is displayed for all insight types.

Field/Column | Description
------|------------
Start Time | The timestamp when the transaction execution started.
End Time | The timestamp when the transaction execution ended.
Elapsed Time | The time that elapsed during transaction execution.
CPU Time | The amount of CPU time spent executing the transaction. The CPU time represents the time spent and work done within SQL execution operators. {% if page.cloud != true -%}The CPU time includes time spent in the [SQL layer]({% link {{ page.version.version }}/architecture/sql-layer.md %}). It does not include time spent in the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}).{% endif -%}{% if page.cloud == true %}The CPU time includes time spent in the [SQL layer](../stable/architecture/sql-layer.html). It does not include time spent in the [storage layer](../stable/architecture/storage-layer.html).{% endif %}
Rows Read | The total number of rows read by the transaction execution.
Rows Written | The total number of rows written by the transaction execution.
Priority | The [priority]({{ link_prefix }}transactions.html#set-transaction-priority) of the transaction execution.
Number of Retries | The total number of retries of the transaction.
Session ID | The ID of the [session]({{ link_prefix }}ui-sessions-page.html) the transaction was executed from.
Application | The name specified by the [`application_name` session setting]({{ link_prefix }}show-vars.html#supported-variables).
Transaction Fingerprint ID | The fingerprint ID of the transaction execution. To view [details of the transaction]({{ link_prefix }}ui-transactions-page.html#transaction-details-page), click the fingerprint ID.
Insights | The [insight type](#workload-insight-types).
Details | Provides details on the insight. For example, if the insight type is High Contention, **Time Spent Waiting** and **Description** are displayed. If the insight type is Failed Execution, **Error Code** and **Error Message** are displayed.

#### Conditional details

Additional information is displayed for the following insight types:

1. [**High Contention**](#high-contention):
All transaction executions flagged with this insight type will display a **Transaction with ID {transaction ID} waited on** section which provides details of the blocking transaction execution.
1. [**Failed Execution**](#failed-execution):
Certain transaction executions flagged with this insight type will display a **Failed Execution** section with **Conflicting Transaction** and **Conflicting Location** information. The following 3 conditions are required:
  - The [`sql.contention.record_serialization_conflicts.enabled`]({{ link_prefix }}cluster-settings.html#setting-sql-contention-record-serialization-conflicts-enabled) cluster setting is set to `true` (default).
  - **Error Code** is `40001`, a `serialization_failure`.
  - **Error Message** includes [`RETRY_SERIALIZABLE`]({{ link_prefix }}transaction-retry-error-reference.html#retry_serializable)` - failed preemptive refresh due to conflicting locks`.

|<div style="width:150px">Field/Column</div>|<div style="width:100px">Insight Type(s)</div>| Description |
-------------|-----------------|------------
| Transaction Execution [ID] | High Contention,<br />Failed Execution | The execution ID of the blocking or conflicting transaction execution. |
| Transaction Fingerprint [ID] | High Contention,<br />Failed Execution  |  The transaction fingerprint ID of the blocking or conflicting transaction execution. For a Failed Execution, view [details of the transaction fingerprint]({{ link_prefix }}ui-transactions-page.html#transaction-details-page) by clicking the transaction fingerprint ID. |
| Statement Waiting Execution ID | High Contention |  The execution ID of the waiting statement. |
| Statement Waiting Fingerprint ID | High Contention |  The statement fingerprint ID of the waiting statement. |
| Transaction Execution | High Contention |  The queries attempted in the transaction. |
| Contention Start Time (UTC) | High Contention |  The timestamp at which [contention]({{ link_prefix }}performance-best-practices-overview.html#transaction-contention) was detected for the transaction. |
| Contention Time | High Contention |  The time that transactions with this execution ID were [in contention]({{ link_prefix }}performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) with other transactions within the specified time interval. |
| Schema Name | High Contention |  The name of the contended schema. |
| Database [Name] | High Contention,<br />Failed Execution  |  The name of the contended or conflicting database. |
| Table [Name] | High Contention,<br />Failed Execution  |  The name of the contended or conflicting table. |
| Index [Name] | High Contention,<br />Failed Execution  |  The name of the contended or conflicting index. |

### Statement Executions view

The **Statement Executions** view provides an overview of all [statement executions]({{ link_prefix }}show-statements.html) that have been flagged with insights.

{% if page.cloud != true -%}
To display this view, click **Insights** in the left-hand navigation of the DB Console and select **Workload Insights > Statement Executions**.
{% endif -%}
{% if page.cloud == true -%}
To display this view, click **Insights** in the left-hand navigation of the Cloud Console and select **Workload Insights > Statement Executions**.
{% endif -%}

{{site.data.alerts.callout_info}}
The rows in this page are populated from the [`crdb_internal.cluster_execution_insights`]({{ link_prefix }}crdb-internal.html) table.

- The results displayed on the **Statement Executions** view will be available as long as the number of rows in each node is less than the [`sql.insights.execution_insights_capacity` cluster setting]({{ link_prefix }}cluster-settings.html#setting-sql-insights-execution-insights-capacity).
{% if include.version_prefix != nil %}
- {% include {{ include.version_prefix }}performance/sql-trace-txn-enable-threshold.md version_prefix=version_prefix %}
{% else %}
- {% include {{ page.version.version }}/performance/sql-trace-txn-enable-threshold.md %}
{% endif %}
{{site.data.alerts.end}}

Click **Columns** to select the columns to display in the table.

The statement insights table has the following columns available:

Column | Description
-----|------------
Latest Statement Execution ID | The execution ID of the latest execution with the statement fingerprint. To view [details of the execution](#statement-execution-details), click the execution ID.
Statement Fingerprint ID | The statement fingerprint ID of the latest statement execution.
Statement Execution | The [statement fingerprint]({{ link_prefix }}ui-statements-page.html#sql-statement-fingerprints) of the latest statement execution.
Status |  The status of the transaction: `Failed` or `Completed`.
Insights | The [insight type](#workload-insight-types) for the statement execution.
Start Time (UTC) | The timestamp when the statement execution started.
Elapsed Time | The time that elapsed to complete the statement execution.
User Name | The name of the user that invoked the statement execution.
Application Name | The name specified by the [`application_name`]({{ link_prefix }}show-vars.html#supported-variables) session setting.
Query Tags | The [query tags](#query-tags) extracted from comments in the statement query. When set appropriately, these tags can provide application context and help correlate query performance with client-side application state.
Rows Processed | The total number of rows read and written.
Retries | The number of times the statement execution was [retried]({{ link_prefix }}transactions.html#automatic-retries).
Contention Time | The amount of time the statement execution spent waiting in [contention]({{ link_prefix }}performance-best-practices-overview.html#transaction-contention).
SQL CPU Time | The amount of CPU time spent executing the statement. The CPU time represents the time spent and work done within SQL execution operators. <br /><br />{%- if page.cloud != true -%}The CPU time includes time spent in the [SQL layer]({% link {{ page.version.version }}/architecture/sql-layer.md %}). It does not include time spent in the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}).{%- endif -%}{%- if page.cloud == true -%}The CPU time includes time spent in the [SQL layer](../stable/architecture/sql-layer.html). It does not include time spent in the [storage layer](../stable/architecture/storage-layer.html).
{%- endif %}    
Full Scan | Whether the execution performed a full scan of the table.
Transaction Fingerprint ID | The ID of the transaction fingerprint for the statement execution.
Latest Transaction Execution ID | The ID of the transaction execution for the statement execution.

#### Query tags

The **Query Tags** column displays the comments embedded in SQL statements, as defined by the [SQL commenter specification](https://google.github.io/sqlcommenter/spec/). These comments, referred to as *query tags*, must be instrumented by the user and can include application context such as the application name, user ID, or feature flags. This information helps correlate slow query performance with specific application states. The **Query Tags** column is available in the **Statement Executions** view's **Statement Insights** table, but is hidden by default. To display it, use the **Columns** selector.

Query tags are also included in the following locations:

- The [**Statement Execution** details](#statement-execution-details) page
- All [log entries generated]({{ link_prefix }}logging-use-cases.html#sql_exec) during the execution of a SQL statement (prefixed with `querytag-`)
- [Traces]({{ link_prefix }}show-trace.html) (prefixed with `querytag-`)
- The `crdb_internal.cluster_execution_insights` and `crdb_internal.node_execution_insights` [virtual tables]({{ link_prefix }}crdb-internal.html), in a new `query_tags` JSONB column

This feature is disabled by default. To enable it, set the [`sql.sqlcommenter.enabled` cluster setting]({{ link_prefix }}cluster-settings.html#setting-sql-sqlcommenter-enabled) to `true`.

To test this functionality, you can generate a SQL query with a [Slow Execution](#slow-execution), then view it on the **Insights** page:

1. Enable SQL commenter query tagging:
    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING sql.sqlcommenter.enabled=true;
    ~~~
1. Check the value of cluster setting [`sql.insights.latency_threshold`]({{ link_prefix }}cluster-settings.html#setting-sql-insights-latency-threshold):
    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW CLUSTER SETTING sql.insights.latency_threshold;
    ~~~
1. Execute the following statement, using a `pg_sleep` value greater than the `latency_threshold`:
    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT pg_sleep(2) /*db_driver='test_driver',db_framework='test_framework',db_backend='cockroachdb'*/;
    ~~~
1. On the Insights page, in the **Columns** selector, check **Query Tags** and click **Apply**.
1. For the row where **Statement Execution** is `SELECT pg_sleep()`, scroll to the right to see the key-value pairs from the SQL comment displayed in the **Query Tags** column.
    <img src="{{ 'images/v26.1/query-tags.png' | relative_url }}" alt="Query tags" style="border:1px solid #eee;max-width:100%" />
1. On the same row, click on the **Latest Statement Execution ID** (the first column on the left) to open the [**Statement Execution** details](#statement-execution-details) page. These key-value pairs also appear on the **Overview** tab under **Query Tags**.

### Statement Execution details

The statement execution details view provides more information on a statement execution insight.

#### Default details

This information is displayed for all insight types.

Field/Column | Description
------|------------
Start Time | The timestamp when the statement execution started.
End Time | The timestamp when the statement execution ended.
Elapsed Time | The time that elapsed during statement execution.
SQL CPU Time | The amount of CPU time spent executing the statement. The CPU time represents the time spent and work done within SQL execution operators. {% if page.cloud != true -%}The CPU time includes time spent in the [SQL layer]({% link {{ page.version.version }}/architecture/sql-layer.md %}). It does not include time spent in the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}).{% endif %}{% if page.cloud == true -%}The CPU time includes time spent in the [SQL layer](../stable/architecture/sql-layer.html). It does not include time spent in the [storage layer](../stable/architecture/storage-layer.html).{% endif %}
Rows Read | The total number of rows read by the statement execution.
Rows Written | The total number of rows written by the statement execution.
Transaction Priority | The [priority]({{ link_prefix }}transactions.html#set-transaction-priority) of the transaction for the statement execution.
Full Scan | Whether the execution performed a full scan of the table.
Transaction Retries | The total number of retries of the transaction for the statement execution.
Session ID | The ID of the [session]({{ link_prefix }}ui-sessions-page.html) the statement was executed from.
Transaction Fingerprint ID | The ID of the transaction fingerprint for the statement execution.
Transaction Execution ID | The ID of the transaction execution for the statement execution.
Statement Fingerprint ID | The fingerprint ID of the statement fingerprint for the statement execution.
Query Tags | The [query tags](#query-tags) extracted from comments in the statement query. When set appropriately, these tags can provide application context and help correlate query performance with client-side application state.
Insights | The [insight type](#workload-insight-types).
Details | Provides details on the insight. For example, if the insight type is High Contention, **Time Spent Waiting** and **Description** are displayed. If the insight type is Failed Execution, **Error Code** and **Error Message** are displayed.

#### Conditional details

This information is displayed for only the [**High Contention**](#high-contention) insight type. All statement executions flagged with this insight type will display a **Statement with ID {statement ID} waited on** section which provides details of the blocking transaction execution.

Column | Description
-------|------------
Transaction Execution ID | The execution ID of the blocking transaction execution.
Transaction Fingerprint ID | The transaction fingerprint ID of the blocking transaction execution.
Contention Time | The time that transactions with this execution ID were [in contention]({{ link_prefix }}performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) with other transactions within the specified time interval.
Database Name | The name of the contended database.
Schema Name | The name of the contended schema.
Table Name | The name of the contended table.
Index Name | The name of the contended index.

## Workload Insight types

The Workload Insights tab surfaces the following type of insights:

- [Failed Execution](#failed-execution)
- [High Contention](#high-contention)
- [High Retry Count](#high-retry-count)
- [Slow Execution](#slow-execution)
- [Suboptimal Plan](#suboptimal-plan)

### Failed Execution

The transaction or statement execution failed. The following screenshot shows a failed transaction execution:

<img src="{{ 'images/v26.1/transaction_executions_failed.png' | relative_url }}" alt="Failed transaction execution" style="border:1px solid #eee;max-width:100%" />

The following screenshot shows the default details of the preceding failed transaction execution.

<img src="{{ 'images/v26.1/transaction_execution_details_failed.png' | relative_url }}" alt="Failed transaction execution details" style="border:1px solid #eee;max-width:100%" />

The **Insights** column shows the name of the insight, in this case **Failed Execution**. The **Details** column provides the **Error Code** and **Error Message**. CockroachDB uses [PostgreSQL Error Codes](https://www.postgresql.org/docs/current/errcodes-appendix.html). In this example, Error Code `40001` is a `serialization_failure`.

#### Serialization conflict due to transaction contention

The following screenshot shows the conditional details of the preceding failed transaction execution. In this case, there was a *serialization conflict*, also known as an *isolation conflict*, due to [transaction contention]({{ link_prefix }}performance-recipes.html#transaction-contention). (For transaction contention that causes *lock contention*, see [High Contention](#high-contention)).

<img src="{{ 'images/v26.1/transaction_execution_details_failed_conditional.png' | relative_url }}" alt="Failed transaction execution details conditional" style="border:1px solid #eee;max-width:100%" />

To capture more information in the event of a failed transaction execution due to a serialization conflict, set the [`sql.contention.record_serialization_conflicts.enabled`]({{ link_prefix }}cluster-settings.html#setting-sql-contention-record-serialization-conflicts-enabled) cluster setting to `true` (default). With this setting enabled, when the **Error Code** is `40001` and the **Error Message** specifically has [`RETRY_SERIALIZABLE - failed preemptive refresh`]({{ link_prefix }}transaction-retry-error-reference.html#failed_preemptive_refresh)` due to conflicting locks`, a conditional **Failed Execution** section is displayed with **Conflicting Transaction** and **Conflicting Location** information.

To troubleshoot, refer to the performance tuning recipe for [transaction retry errors]({{ link_prefix }}performance-recipes.html#transaction-retry-error).

### High Contention 

The transaction or statement execution experienced high [contention]({{ link_prefix }}performance-recipes.html#transaction-contention) time according to the threshold set in the [`sql.insights.latency_threshold` cluster setting]({{ link_prefix }}cluster-settings.html#setting-sql-insights-latency-threshold). This type of contention is also known as *lock contention*. (For transaction contention that causes *serialization conflict*, see [serialization conflict due to transaction contention](#serialization-conflict-due-to-transaction-contention).) 

To troubleshoot, refer to the performance tuning recipe for [identifying and unblocking a waiting transaction]({{ link_prefix }}performance-recipes.html#waiting-transaction).

The following screenshot shows the execution of a transaction flagged with **High Contention**:

<img src="{{ 'images/v26.1/transaction_execution.png' | relative_url }}" alt="Transaction execution" style="border:1px solid #eeqe;max-width:100%" />

The following screenshot shows the execution details of the preceding transaction execution:

<img src="{{ 'images/v26.1/transaction_execution_details.png' | relative_url }}" alt="Transaction execution details" style="border:1px solid #eee;max-width:100%" />

### High Retry Count

The statement execution experienced a high number of [retries]({{ link_prefix }}transactions.html#automatic-retries) according to the threshold set in the [`sql.insights.high_retry_count.threshold` cluster setting]({{ link_prefix }}cluster-settings.html#setting-sql-insights-high-retry-count-threshold).

### Slow Execution

The statement (or a statement in the transaction) experienced slow execution. Depending on the settings in [Configuration](#configuration), either of the following conditions trigger this insight:

- Execution time is greater than the value of the [`sql.insights.latency_threshold` cluster setting]({{ link_prefix }}cluster-settings.html#setting-sql-insights-latency-threshold).
- Anomaly detection is enabled (`sql.insights.anomaly_detection.enabled`), execution time is greater than the value of `sql.insights.anomaly_detection.latency_threshold`, and [execution latency]({{ link_prefix }}ui-sql-dashboard.html#kv-execution-latency-99th-percentile) is greater than the p99 latency and more than double the median latency. For details, see [Detect slow executions](#detect-slow-executions).

### Suboptimal Plan

The plan could be improved for some statement(s) in the transaction execution. Possible causes include outdated statistics and missing indexes.

The statement execution has resulted in one or more [index recommendations](#schema-insights-tab) that would improve the plan.

The following screenshot shows the statement execution of the query described in [Use the right index]({{ link_prefix }}apply-statement-performance-rules.html#rule-2-use-the-right-index):

<img src="{{ 'images/v26.1/statement_executions.png' | relative_url }}" alt="Statement execution" style="border:1px solid #eee;max-width:100%" />

The following screenshot shows the execution details of the preceding statement execution:

<img src="{{ 'images/v26.1/statement_execution_details.png' | relative_url }}" alt="Statement execution details" style="border:1px solid #eee;max-width:100%" />

The **Insights** column shows the name of the insight, in this case **Suboptimal Plan**. The **Details** column provides details on the insight, such as a **Description** with the cause of the suboptimal plan and a **Recommendation** with a `CREATE INDEX` statement. The final column contains a **Create Index** button. Click the **Create Index** button to execute the recommended statement to mitigate the cause of the insight.

## Schema Insights tab

{% if page.cloud != true -%}
To display this view, click **Insights** in the left-hand navigation of the DB Console and select  **Schema Insights**.
{% endif -%}
{% if page.cloud == true -%}
To display this view, click **Insights** in the left-hand navigation of the Cloud Console  and select **Schema Insights**.
{% endif -%}

This view lists the [indexes]({{ link_prefix }}indexes.html) that have not been used and should be dropped, and/or the ones that should be created, altered, or replaced (based on statement execution).

- The drop recommendations are the same as those on the [**Databases**]({{ link_prefix }}ui-databases-page.html#index-recommendations) page.
- The create, alter, and replace recommendations are the same as those on the [Explain Plans tab]({{ link_prefix }}ui-statements-page.html#insights) on the Statements page. Whereas the **Explain Plans** tab shows all recommendations, the **Schema Insights** view shows only the latest recommendations for that statement fingerprint. If you execute a statement again after creating or updating an index, the recommendation disappears.

<a id="schema-insights-example"></a>

The following screenshot shows the insight that displays after you run the query described in [Use the right index]({{ link_prefix }}apply-statement-performance-rules.html#rule-2-use-the-right-index) six or more times:

<img src="{{ 'images/v26.1/schema_insight.png' | relative_url }}" alt="Schema insight" style="border:1px solid #eee;max-width:100%" />

CockroachDB uses the threshold of six executions before offering an insight because it assumes that you are no longer merely experimenting with a query at that point.

- **Insights:** Contains one of the following insight types: **Create Index**, **Alter Index**, **Replace Index**, **Drop Unused Index**.
- **Details:** Details for each insight. Different insight types display different details fields:

    - **Create Index**, **Alter Index**, or **Replace Index**: A **Statement Fingerprint** field displays the statement fingerprint that would be optimized with the creation, alteration, or replacement of the index; and a **Recommendation** field displays the SQL query to create, alter, or replace the index.
    - **Drop Unused Index**: An **Index** field displays the name of the index to drop; and a **Description** field displays the reason for dropping the index.

[Admin users]({{ link_prefix }}security-reference/authorization.html#admin-role) will see an action button in the final column, which will execute the SQL statement suggested by the schema insight, for example "Create Index". Upon clicking the action button, a confirmation dialog displays a warning about the cost of [online schema changes]({{ link_prefix }}online-schema-changes.html) and the option to copy the SQL statement for later execution in a SQL client.

### `workload_index_recs` function

{{site.data.alerts.callout_info}}
{% include_cached feature-phases/preview.md %}
{{site.data.alerts.end}}

The SQL built-in function [`workload_index_recs`]({{ link_prefix }}functions-and-operators.html#workload_index_recs) returns index recommendations and the fingerprint IDs of the statements they impact. The function returns two columns:

- `index_rec` (`STRING`): Contains the index recommendation.
- `fingerprint_ids` (`BYTES[]`): Contains the fingerprint IDs of the affected statements.

You can use the `workload_index_recs` function to determine workload-level index recommendations.

By default, the function returns index recommendations sourced from all statement fingerprints in the [`crdb_internal.statement_statistics`]({{ link_prefix }}crdb-internal.html#statement_statistics) table. When passed an optional [`TIMESTAMPTZ`]({{ link_prefix }}timestamp.html) parameter, the function will provide workload-level index recommendations only for statements executed after the timestamp. For example, `SELECT workload_index_recs('2025-05-08 16:00:00+00');` returns index recommendations for statements executed after `'2025-05-08 16:00:00+00'`.

#### `workload_index_recs` example

After running the [query]({{ link_prefix }}apply-statement-performance-rules.html#rule-2-use-the-right-index) mentioned in the preceding [**Schema Insights** tab](#schema-insights-tab) section, run the following related query more than six times to generate another **Create Index** insight.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT
  name, users.city, rides.city, count(rides.id) AS sum
FROM
  users JOIN rides ON users.id = rides.rider_id
WHERE
  rides.start_time BETWEEN '2018-12-31 00:00:00' AND '2020-01-01 00:00:00'
GROUP BY
  name, users.city, rides.city
ORDER BY
  sum DESC
LIMIT
  10;
~~~

Run the `workload_index_recs` function to return the `CREATE INDEX` recommendation associated with two fingerprint IDs:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT workload_index_recs();
~~~

~~~
                                                       workload_index_recs
----------------------------------------------------------------------------------------------------------------------------------
  ("CREATE INDEX ON movr.public.rides (start_time) STORING (rider_id);","{""\\\\x95a325e25bdbdc06"",""\\\\x4784cb829aab2542""}")
~~~

To display the query strings corresponding to the fingerprint IDs, run a query that joins the `workload_index_recs` function with the [`crdb_internal.statement_statistics`]({{ link_prefix }}crdb-internal.html#statement_statistics) table.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT ss.index_recommendations,
(ss.statistics->'statistics'->>'lastExecAt')::TIMESTAMPTZ AS lastExecAt, -- Time the statement was last execut
ss.fingerprint_id,
ss.app_name,
ss.metadata->>'query' AS query
FROM crdb_internal.statement_statistics AS ss -- Return data from the statement_statistics table
JOIN (
    SELECT unnest((rec).fingerprint_ids) AS fingerprint_id -- Return each fingerprint ID from the array as a row
    FROM workload_index_recs() AS rec
) AS fids ON ss.fingerprint_id = fids.fingerprint_id
ORDER BY ss.index_recommendations, lastExecAt;
~~~

~~~
                                index_recommendations                               |          lastexecat           |   fingerprint_id   |     app_name     |                                                                                                         query
------------------------------------------------------------------------------------+-------------------------------+--------------------+------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  {"creation : CREATE INDEX ON movr.public.rides (start_time) STORING (rider_id);"} | 2025-05-08 15:59:21.969934+00 | \x4784cb829aab2542 | $ cockroach demo | SELECT name, count(rides.id) AS sum FROM users JOIN rides ON users.id = rides.rider_id WHERE rides.start_time BETWEEN _ AND _ GROUP BY name ORDER BY sum DESC LIMIT _
  {"creation : CREATE INDEX ON movr.public.rides (start_time) STORING (rider_id);"} | 2025-05-08 16:10:59.479173+00 | \x95a325e25bdbdc06 | $ cockroach demo | SELECT name, users.city, rides.city, count(rides.id) AS sum FROM users JOIN rides ON users.id = rides.rider_id WHERE rides.start_time BETWEEN _ AND _ GROUP BY name, users.city, rides.city ORDER BY sum DESC LIMIT _
~~~

## Search and filter

By default, the Workload Insights view shows all statements or transactions that have insights. By default, the Schema Insights view shows all Schema Insights.

### Search

To search using the search field:

1. Enter a string in the search box at the top of the tab. To search for exact terms in order, wrap the search string in quotes.
1. Press `Enter`.

    The list is filtered by the string.

### Time interval

In the Workload Insights view, to see transactions or statement executions within a specific time interval, select a time interval from the selector at the top of the tab. The time interval field supports preset time intervals (1 Hour, 6 Hours, 1 Day, etc.) and custom time intervals. To select a custom time interval, click the time interval field and select **Custom time interval**. In the **Start (UTC)** and **End (UTC)** fields select or type a date and time.

Use the arrow buttons to cycle through previous and next time intervals. To select the most recent interval, click **Now**. When you select a time interval, the same interval is selected in the [Metrics]({{ link_prefix }}ui-overview.html#metrics) page.

{{site.data.alerts.callout_info}}
It's possible to select an interval for which no workload insights exist.
{{site.data.alerts.end}}

### Filter

To filter the results on the **Workload Insights** or **Schema Insights** view:

1. Click the **Filters** field.
      - To filter by [application]({{ link_prefix }}connection-parameters.html#additional-connection-parameters), select **Application Name** and select one or more applications.

          - Queries from the SQL shell are displayed under the `$ cockroach` app.
          - If you haven't set `application_name` in a client connection string, it appears as `unset`.
      - To filter by one or more insight types, select **Workload Insight Type** or **Schema Insight Type** and select one or more types.
1. Click **Apply**

## Configuration

You can configure the behavior of insights using the following [cluster settings]({{ link_prefix }}cluster-settings.html).

### Workload insights settings

You can configure [**Workload Insights**](#workload-insights-tab) with the following [cluster settings]({{ link_prefix }}cluster-settings.html):

| Setting                                                                | Description                                                                                                                                                                                   | Where used                           |
|------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
|[`sql.insights.anomaly_detection.enabled`]({{ link_prefix }}cluster-settings.html#setting-sql-insights-anomaly-detection-enabled)                                | Whether or not anomaly insight detection is enabled. When true, CockroachDB checks if [execution latency]({{ link_prefix }}ui-sql-dashboard.html#kv-execution-latency-99th-percentile) was greater than the p99 latency and more than double the median latency. | [Statement executions](#statement-executions-view)                 |
|[`sql.insights.anomaly_detection.latency_threshold`]({{ link_prefix }}cluster-settings.html#setting-sql-insights-anomaly-detection-latency-threshold)                                  | The latency threshold that triggers monitoring a statement fingerprint for unusually slow execution.                                                                                          | [Statement executions](#statement-executions-view)                 |
|[`sql.insights.anomaly_detection.memory_limit`]({{ link_prefix }}cluster-settings.html#setting-sql-insights-anomaly-detection-memory-limit)                           | The maximum amount of memory allowed for tracking statement latencies.                                                                                                                        | [Statement executions](#statement-executions-view)                 |
|[`sql.insights.latency_threshold`]({{ link_prefix }}cluster-settings.html#setting-sql-insights-latency-threshold)                                          | The threshold at which the contention duration of a contended transaction is considered **High Contention** or statement execution is flagged for insights.                                   | [Statement](#statement-executions-view) and [Transaction executions](#transaction-executions-view) |
|[`sql.insights.high_retry_count.threshold`]({{ link_prefix }}cluster-settings.html#setting-sql-insights-high-retry-count-threshold)                               | The threshold at which a retry count is considered **High Retry Count**.                                                                                                                      | [Statement executions](#statement-executions-view)                 |
|[`sql.insights.execution_insights_capacity`]({{ link_prefix }}cluster-settings.html#setting-sql-insights-execution-insights-capacity)                              | The maximum number of execution insights stored in each node.                                                                                                                                 | [Statement executions](#statement-executions-view)                 |
|[`sql.contention.event_store.capacity`]({{ link_prefix }}cluster-settings.html#setting-sql-contention-event-store-capacity)                                   | The in-memory storage capacity of the contention event store in each nodes.                                                                                                                   | [Transaction executions](#transaction-executions-view)               |
|[`sql.contention.event_store.duration_threshold`]({{ link_prefix }}cluster-settings.html#setting-sql-contention-event-store-duration-threshold)                         | The minimum contention duration to cause contention events to be collected into the `crdb_internal.transaction_contention_events` table.                                                      | [Transaction executions](#transaction-executions-view)               |
|[`sql.contention.record_serialization_conflicts.enabled`]({{ link_prefix }}cluster-settings.html#setting-sql-contention-record-serialization-conflicts-enabled) | enables recording `40001` errors, along with metadata about conflicting transactions, as `SERIALIZATION_CONFLICT` contention events into `crdb_internal.transaction_contention_events`<br><br>**Default**: `true` | [Transaction executions](#transaction-executions-view)               |

#### Detect slow executions

There are two different methods for detecting slow executions. By default, they are both enabled and you can configure them based on your workload.

The first method flags all executions running longer than [`sql.insights.latency_threshold`]({{ link_prefix }}cluster-settings.html#setting-sql-insights-latency-threshold). This is analogous to checking the [slow query log]({{ link_prefix }}logging-use-cases.html#sql_perf).

The second method attempts to detect **unusually slow executions**. You can enable this detection with [`sql.insights.anomaly_detection.enabled`]({{ link_prefix }}cluster-settings.html#setting-sql-insights-anomaly-detection-enabled) and configure it with [`sql.insights.anomaly_detection.latency_threshold`]({{ link_prefix }}cluster-settings.html#setting-sql-insights-anomaly-detection-latency-threshold).
CockroachDB will then keep a streaming histogram in memory for each distinct statement fingerprint that has seen an execution latency longer than `sql.insights.anomaly_detection.latency_threshold`, and will flag any execution with a latency in the 99th percentile (greater than p99) for its fingerprint.

Additional controls filter out executions that are less actionable:

- The execution's latency must also be longer than twice the median latency (`> 2*p50`) for that fingerprint. This ensures that the elevated latency is significant enough to warrant attention.
- The execution's latency must also be longer than `sql.insights.anomaly_detection.latency_threshold`. Some executions are slower than usual, but are still fast enough for the workload.

The [`sql.insights.anomaly_detection.memory_limit` cluster setting]({{ link_prefix }}cluster-settings.html#setting-sql-insights-anomaly-detection-memory-limit) cluster setting limits the amount of memory available for tracking these streaming latency histograms. When this threshold is surpassed, the least-recently touched histogram is evicted. The default setting is sufficient for tracking about 1,000 fingerprints.

You can track the `sql.insights.anomaly_detection.memory` and `sql.insights.anomaly_detection.evictions` [metrics]({{ link_prefix }}ui-custom-chart-debug-page.html) to determine if the settings are appropriate for your workload. If you see a steady stream of evictions or churn, you can either raise the `sql.insights.anomaly_detection.memory_limit` cluster setting, to allow for more storage; or raise the `sql.insights.anomaly_detection.latency_threshold` cluster setting, to examine fewer statement fingerprints.

### Schema insights settings

You can configure the index recommendations in the [**Schema Insights** tab](#schema-insights-tab), [**Explain Plans** tab]({{ link_prefix }}ui-statements-page.html#insights), and [**Databases** page]({{ link_prefix }}ui-databases-page.html) with the following [cluster settings]({{ link_prefix }}cluster-settings.html):

| Setting                                                                | Description                                                                                                             | Where used                           |
|------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
|[`sql.metrics.statement_details.index_recommendation_collection.enabled`]({{ link_prefix }}cluster-settings.html#setting-sql-metrics-statement-details-index-recommendation-collection-enabled) | Whether or not index recommendations are enabled for indexes that could be or are used during statement execution.      | [Schema Insights](#schema-insights-tab) and [Explain Plans tab]({{ link_prefix }}ui-statements-page.html#explain-plans) |
|[`sql.index_recommendation.drop_unused_duration`]({{ link_prefix }}cluster-settings.html)                         | The duration of time an index must be unused before a recommendation to drop it.                                            | [Schema Insights](#schema-insights-tab) and [Databases]({{ link_prefix }}ui-databases-page.html)        |
|[`sql.metrics.statement_details.max_mem_reported_idx_recommendations`]({{ link_prefix }}cluster-settings.html#setting-sql-metrics-statement-details-max-mem-reported-idx-recommendations)    | The maximum number of reported index recommendations stored in memory.                                                  | [Schema Insights](#schema-insights-tab) and [Explain Plans tab]({{ link_prefix }}ui-statements-page.html#explain-plans) |
