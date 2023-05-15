## Transactions table

Click <img src="{{ 'images/common/ui-columns-button.png' | relative_url }}" alt="Column selector" /> to select the columns to display in the table.

The Transactions table gives details for each SQL statement fingerprint in the transaction:

Column | Description
-----|------------
Transactions | The [SQL statement fingerprints]({{ page_prefix }}statements-page.html#sql-statement-fingerprints) that make up the transaction. To view the transaction fingerprint and details, click to open the [Transaction Details page](#transaction-details-page).
Aggregation Interval (UTC) | The interval over which statistics are aggregated. <br><br>For example, if a transaction is executed at 1:23PM it will fall in the 1:00PM - 2:00PM interval.
Execution Count | Cumulative number of executions of this transaction within the aggregation interval. <br><br>The bar indicates the ratio of runtime success (gray) to [retries]({{ link_prefix }}transactions.html#transaction-retries) (red) for the transaction.
Rows Read | Average number of rows [read from disk]({{ link_prefix }}architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) while executing this transaction within the aggregation interval.<br><br>The gray bar indicates the mean number of rows returned. The blue bar indicates one standard deviation from the mean.
Bytes Read | Aggregation of all bytes [read from disk]({{ link_prefix }}architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) across all operators for this transaction within the aggregation interval. <br><br>The gray bar indicates the mean number of bytes read from disk. The blue bar indicates one standard deviation from the mean.
Rows Written  | Aggregation of all rows written to disk across all operators for transaction with this fingerprint within the specified aggregation interval. This column is not displayed by default. <br><br>The gray bar indicates the mean number of rows written to disk. The blue bar indicates one standard deviation from the mean.
Transaction Time | Average [planning and execution time]({{ link_prefix }}architecture/sql-layer.html#sql-parser-planner-executor) of this transaction within the aggregation interval. <br><br>The gray bar indicates the mean latency. The blue bar indicates one standard deviation from the mean.
Contention | Average time this transaction was [in contention]({{ link_prefix }}performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) with other transactions within the aggregation interval.
Max Memory | Maximum memory used by this transaction at any time during its execution within the aggregation interval. <br><br>The gray bar indicates the average max memory usage. The blue bar indicates one standard deviation from the mean.
Network | Amount of [data transferred over the network]({{ link_prefix }}architecture/reads-and-writes-overview.html) for this transaction within the aggregation interval. <br><br>If this value is 0, the transaction was executed on a single node. <br><br>The gray bar indicates the mean number of bytes sent over the network. The blue bar indicates one standard deviation from the mean.
Retries | Cumulative number of [retries]({{ link_prefix }}transactions.html#transaction-retries) of this transaction within the aggregation interval.
Regions/Nodes | The region and nodes in which the transaction was executed. <br><br>**Regions/Nodes** are not visible for {{ site.data.products.serverless }} clusters.
Statements | Number of SQL statements in the transaction.

{{site.data.alerts.callout_info}}
Significant transactions on your database are likely to have a high execution count or number of rows read.
{{site.data.alerts.end}}
