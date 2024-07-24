## Transaction Details page

The details displayed on the **Transaction Details** page reflect the [time interval](#time-interval) selected on the **Transactions** page and the application name and database specified in the selected row of the [Transactions table](#transactions-table).

- The _transaction fingerprint_ is displayed as a list of the individual [SQL statement fingerprints]({{ page_prefix }}statements-page.html#sql-statement-fingerprints) in the transaction.
- The **Mean transaction time**: The mean average time it took to execute the transaction within the aggregation interval.
- The **Application name**: The name specified by the [`application_name`]({{ link_prefix }}show-vars.html#supported-variables) session setting.
- **Transaction resource usage** shows overall statistics about the transaction.
    - **Mean rows/bytes read**: The mean average number of rows and bytes [read from the storage layer]({{ link_prefix }}architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) during the execution of the transaction within the specified aggregation interval.
    - **Bytes read over network**: The amount of [data transferred over the network]({{ link_prefix }}architecture/reads-and-writes-overview.html) for this transaction within the aggregation interval. <br><br>If this value is 0, the statement was executed on a single node.
    - **Mean rows written**: The mean number of rows written by this transaction.
    - **Max memory usage**: The maximum memory used by this transaction at any time during its execution within the aggregation interval.
    - **Max scratch disk usage**: The maximum amount of data [spilled to temporary storage on disk]({{ link_prefix }}vectorized-execution.html#disk-spilling-operations) while executing this transaction within the aggregation interval.

The **Insights** table is displayed when CockroachDB has detected a problem with the transaction fingerprint.

- **Insights**: Provides the [Workload Insight type]({{ link_prefix }}ui-insights-page.html#workload-insight-types).
- **Details**: Provides a description and possible recommendation.
- **Latest Execution ID**: The ID of the latest transaction execution. To display the [details of the transaction execution]({{ link_prefix }}ui-insights-page.html#transaction-execution-details), click the ID.

The **Statements Fingerprints** table displays the statement fingerprints of all the statements in the transaction. To display the [details of a statement fingerprint]({{ page_prefix }}statements-page.html#statement-fingerprint-page), click a statement fingerprint.
