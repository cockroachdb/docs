## Transactions table

Click **Columns** to select the columns to display in the table.

The Transactions table gives details for each transaction fingerprint in the transaction:

Column | Description
-----|------------
Transactions | The [SQL statement fingerprints]({{ page_prefix }}statements-page.html#sql-statement-fingerprints) that make up the transaction. To view the transaction fingerprint and details, click to open the [Transaction Details page](#transaction-details-page).<br><br>Transaction fingerprints are displayed per application rather than grouped into a single fingerprint. This may result in multiple rows for the same transaction fingerprint, one per application name.
Execution Count | Cumulative number of executions of this transaction within the [time interval](#time-interval). <br><br>The bar indicates the ratio of runtime success (gray) to [retries]({{ link_prefix }}transactions.html#transaction-retries) (red) for the transaction.
Application Name | The name specified by the [`application_name` session setting]({{ link_prefix }}show-vars.html#supported-variables).
Rows Processed | Average number of rows read and written while executing statements with this fingerprint within the time interval.
Bytes Read | Aggregation of all bytes [read from disk]({{ link_prefix }}architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) across all operators for this transaction within the time interval. <br><br>The gray bar indicates the mean number of bytes read from disk. The blue bar indicates one standard deviation from the mean.
Transaction Time | Average [planning and execution time]({{ link_prefix }}architecture/sql-layer.html#sql-parser-planner-executor) of this transaction within the time interval. <br><br>The gray bar indicates the mean latency. The blue bar indicates one standard deviation from the mean.
Contention Time | Average time this transaction was [in contention]({{ link_prefix }}performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) with other transactions within the time interval.<br><br>The gray bar indicates mean contention time. The blue bar indicates one standard deviation from the mean. Hover over the bar to display exact values.
SQL CPU Time | Average SQL CPU time spent executing within the specified time interval. The SQL CPU time includes time spent in the [SQL layer]({{ link_prefix }}architecture/sql-layer.html).<br><br>The gray bar indicates mean SQL CPU time. The blue bar indicates one standard deviation from the mean.
Admission Wait Time | Average time spent waiting in [admission control]({{ link_prefix }}admission-control.html) queues within the specified time interval. The gray bar indicates mean admission wait time. The blue bar indicates one standard deviation from the mean.
KV CPU Time | Average KV CPU time spent executing within the specified time interval. This represents [KV]({{ link_prefix }}architecture/overview.html#layers) work that is on the critical path of serving the query. It excludes time spent on asynchronous replication and in the [storage layer]({{ link_prefix }}architecture/storage-layer.html).<br><br>The gray bar indicates mean KV CPU time. The blue bar indicates one standard deviation from the mean.
Max Memory | Maximum memory used by this transaction at any time during its execution within the time interval. <br><br>The gray bar indicates the average max memory usage. The blue bar indicates one standard deviation from the mean.
Network | Amount of [data transferred over the network]({{ link_prefix }}architecture/reads-and-writes-overview.html) for this transaction within the time interval. <br><br>If this value is 0, the transaction was executed on a single node. <br><br>The gray bar indicates the mean number of bytes sent over the network. The blue bar indicates one standard deviation from the mean.
Retries | Cumulative number of [retries]({{ link_prefix }}transactions.html#transaction-retries) of this transaction within the time interval.
Regions/Nodes | The region and nodes in which the transaction was executed. <br><br>Nodes are not visible for CockroachDB {{ site.data.products.basic }} clusters.
Statements | Number of SQL statements in the transaction.
Transaction Fingerprint ID | The ID of the transaction fingerprint.

{{site.data.alerts.callout_info}}
Significant transactions on your database are likely to have a high execution count or number of rows read.
{{site.data.alerts.end}}

To view details of a transaction, click a transaction fingerprint in the **Transactions** column to open the **Transaction Details** page.
