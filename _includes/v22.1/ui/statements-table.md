## Statements table

Click <img src="{{ 'images/common/ui-columns-button.png' | relative_url }}" alt="Column selector" /> to select the columns to display in the table.

The Statements table gives details for each SQL statement fingerprint:

Column | Description
-----|------------
Statements | SQL statement [fingerprint](#sql-statement-fingerprints). To view additional details, click the SQL statement fingerprint to open its [Statement Fingerprint page]({{ page_prefix }}statements-page.html#statement-fingerprint-page).
Execution Count | Cumulative number of executions of statements with this fingerprint within the [time interval](#time-interval). <br><br>The bar indicates the ratio of runtime success (gray) to [retries]({{ link_prefix }}transactions.html#transaction-retries) (red) for the SQL statement fingerprint.
Database | The database in which the statement was executed.
Rows Processed | **New in v22.1.3:** Average number of rows read and written while executing statements with this fingerprint within the time interval.
Bytes Read | Aggregation of all bytes [read from disk]({{ link_prefix }}architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) across all operators for statements with this fingerprint within the time interval. <br><br>The gray bar indicates the mean number of bytes read from disk. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Statement Time | Average [planning and execution time]({{ link_prefix }}architecture/sql-layer.html#sql-parser-planner-executor) of statements with this statement fingerprint within the time interval. <br><br>The gray bar indicates the mean latency. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Contention | Average time statements with this fingerprint were [in contention]({{ link_prefix }}performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) with other transactions within the time interval. <br><br>The gray bar indicates mean contention time. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Max Memory | Maximum memory used by a statement with this fingerprint at any time during its execution within the time interval. <br><br>The gray bar indicates the average max memory usage. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Network | Amount of [data transferred over the network]({{ link_prefix }}architecture/reads-and-writes-overview.html) for statements with this fingerprint within the time interval. If this value is 0, the statement was executed on a single node. <br><br>The gray bar indicates the mean number of bytes sent over the network. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
Retries | Cumulative number of automatic (internal) [retries]({{ link_prefix }}transactions.html#transaction-retries) by CockroachDB of statements with this fingerprint within the time interval.
% of All Runtime | How much time this statement fingerprint took to execute compared to all other statements that were executed within the time period. It is expressed as a percentage. The runtime is the mean execution latency multiplied by the execution count.
Regions/Nodes | The regions and nodes on which statements with this fingerprint executed. <br><br>Regions/Nodes is not visible for {{ site.data.products.serverless }} clusters.
Diagnostics | Activate and download [diagnostics](#diagnostics) for this fingerprint. To activate, click the **Activate** button. **New in v22.1:** The [Activate statement diagnostics](#activate-diagnostics-collection-and-download-bundles) dialog displays. After you complete the dialog, the column displays the status of diagnostics collection (**WAITING**, **READY**, or **ERROR**). Click <img src="{{ 'images/common/ui-ellipsis-button.png' | relative_url }}" alt="Bundle selector" /> and select a bundle to download or select **Cancel request** to cancel diagnostics bundle collection. <br><br>Statements are periodically cleared from the Statements page based on the start time. To access the full history of diagnostics for the fingerprint, see the [Diagnostics](#diagnostics) tab of the Statement Details page. <br><br>Diagnostics is not visible for {{ site.data.products.serverless }} clusters.

{{site.data.alerts.callout_info}}
To obtain the execution statistics, CockroachDB samples a percentage of the executions. If you see `no samples` displayed in the **Contention**, **Max Memory**, or **Network** columns, there are two possibilities:
- Your statement executed successfully but wasn't sampled because there were too few executions of the statement.
- Your statement has failed (the most likely case). You can confirm by clicking the statement and viewing the value for **Failed?**.
{{site.data.alerts.end}}

To view statement details, click a SQL statement fingerprint in the **Statements** column to open the **Statement Fingerprint** page.
