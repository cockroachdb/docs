## Statements table

Click **Columns** to select the columns to display in the table.

The Statements table gives details for each SQL statement fingerprint:

Column | Description
-----|------------
Statements | SQL statement [fingerprint](#sql-statement-fingerprints). To view additional details, click the SQL statement fingerprint to open its [Statement Fingerprint page]({{ page_prefix }}statements-page.html#statement-fingerprint-page).<br><br>Statement fingerprints are displayed per application rather than grouped into a single fingerprint. This may result in multiple rows for the same statement fingerprint, one per application name.
Execution Count | Cumulative number of executions of statements with this fingerprint within the [time interval](#time-interval). <br><br>The bar indicates the ratio of runtime success (gray) to [retries]({{ link_prefix }}transactions.html#transaction-retries) (red) for the SQL statement fingerprint.
Database | The database in which the statement was executed.
Application Name | The name specified by the [`application_name`]({{ link_prefix }}show-vars.html#supported-variables) session setting.
Statement Time | Average [planning and execution time]({{ link_prefix }}architecture/sql-layer.html#sql-parser-planner-executor) of statements with this statement fingerprint within the time interval. <br><br>The gray bar indicates the mean latency. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
<a id="percent-of-all-runtime"></a>% of All Runtime | The percentage of execution time taken by this statement fingerprint compared to all other statements executed within the time period, including those not displayed. Runtime is calculated as the mean execution latency multiplied by the execution count.<br><br><b>Note:</b> The sum of the values in this column may not equal 100%. Each fingerprint's percentage is calculated by dividing the fingerprint's runtime by the sum of the runtimes for all statement fingerprints in the time interval. "All statement fingerprints" means all user statement fingerprints (not only those displayed by the [search criteria](#search-criteria)), as well as internal statement fingerprints that are never included in the displayed result set. The search criteria are applied after the `% of All Runtime` calculation.
Contention Time | Average time statements with this fingerprint were [in contention]({{ link_prefix }}performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) with other transactions within the time interval.<br><br>The gray bar indicates mean contention time. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
SQL CPU Time | Average SQL CPU time spent executing within the specified time interval. The SQL CPU time includes time spent in the [SQL layer]({{ link_prefix }}architecture/sql-layer.html). It does not include SQL planning time, KV execution time, or time spent in the [storage layer]({{ link_prefix }}architecture/storage-layer.html). The gray bar indicates mean SQL CPU time. The blue bar indicates one standard deviation from the mean.
KV CPU Time | Average KV CPU time spent executing within the specified time interval. This represents [KV]({{ link_prefix }}architecture/overview.html#layers) work that is on the critical path of serving the query. It excludes time spent on asynchronous replication and in the [storage layer]({{ link_prefix }}architecture/storage-layer.html). The gray bar indicates mean KV CPU time. The blue bar indicates one standard deviation from the mean.
Admission Wait Time | Average time spent waiting in [admission control]({{ link_prefix }}admission-control.html) queues within the specified time interval. The gray bar indicates mean admission wait time. The blue bar indicates one standard deviation from the mean.
Min Latency | The lowest latency value for all statement executions with this fingerprint.
Max Latency | The highest latency value for all statement executions with this fingerprint.
Rows Processed | Average number of rows read and written while executing statements with this fingerprint within the time interval.
Bytes Read | Aggregation of all bytes [read from disk]({{ link_prefix }}architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) across all operators for statements with this fingerprint within the time interval. <br><br>The gray bar indicates the mean number of bytes read from disk. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Max Memory | Maximum memory used by a statement with this fingerprint at any time during its execution within the time interval. <br><br>The gray bar indicates the average max memory usage. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Network | Amount of [data transferred over the network]({{ link_prefix }}architecture/reads-and-writes-overview.html) for statements with this fingerprint within the time interval. If this value is 0, the statement was executed on a single node. <br><br>The gray bar indicates the mean number of bytes sent over the network. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Retries | Cumulative number of automatic (internal) [retries]({{ link_prefix }}transactions.html#transaction-retries) by CockroachDB of statements with this fingerprint within the time interval.
Regions/Nodes | The regions and nodes on which statements with this fingerprint executed. <br><br>Nodes are not visible for CockroachDB {{ site.data.products.basic }} clusters or for clusters that are not multi-region.
Last Execution Time (UTC)| The timestamp when the statement was last executed.
Statement Fingerprint ID | The ID of the statement fingerprint.
Diagnostics | Activate and download [diagnostics](#diagnostics) for this fingerprint. To activate, click the **Activate** button. The [Activate statement diagnostics](#activate-diagnostics-collection-and-download-bundles) dialog displays. After you complete the dialog, the column displays the status of diagnostics collection (**WAITING**, **READY**, or **ERROR**). Click <img src="{{ 'images/common/ui-ellipsis-button.png' | relative_url }}" alt="Vertical ellipsis" /> and select a bundle to download or select **Cancel request** to cancel diagnostics bundle collection. <br><br>Statements are periodically cleared from the Statements page based on the start time. To access the full history of diagnostics for the fingerprint, see the [Diagnostics](#diagnostics) tab of the Statement Details page.

{{site.data.alerts.callout_info}}
To obtain the execution statistics, CockroachDB samples a percentage of the executions. If you see `no samples` displayed in the **Contention**, **Max Memory**, or **Network** columns, there are two possibilities:
- Your statement executed successfully but wasn't sampled because there were too few executions of the statement.
- Your statement has failed (the most likely case). You can confirm by clicking the statement and viewing the value for **Failure Count**.
{{site.data.alerts.end}}

To view statement details, click a SQL statement fingerprint in the **Statements** column to open the **Statement Fingerprint** page.
