---
title: Transactions Page
summary: The Transactions page helps you identify frequently retried or high latency transactions and view transaction details.
toc: true
---

{{site.data.alerts.callout_info}}
On a secure cluster, this area of the DB Console can only be accessed by an `admin` user. See [Access the DB Console](ui-overview.html#access-the-db-console).
{{site.data.alerts.end}}

 The **Transactions** page helps you:

- Identify frequently retried or high latency transactions.
- View transaction [details](#transaction-details-page).

{{site.data.alerts.callout_success}}
In contrast with the [**Statements** page](ui-statements-page.html), which displays [SQL statement fingerprints](ui-statements-page.html#sql-statement-fingerprints), the **Transactions** page displays SQL statement fingerprints grouped by [transaction](transactions.html).
{{site.data.alerts.end}}

To view this page, [access the DB Console](ui-overview.html#access-the-db-console) and click **Transactions** in the left-hand navigation.

## Search and filter by application

By default, this page shows transactions from all applications running on the cluster, and hides internal CockroachDB transactions.

To filter the transactions by [`application_name`](connection-parameters.html#additional-connection-parameters), use the **App** pulldown in the **Filters** menu. If you haven't set `application_name` in the client connection string, it appears as `unset`.

- CockroachDB's internal transactions are only displayed under the `$ internal` app.
- Transactions from the SQL shell are displayed under the `$ cockroach sql` app.

You can also search for transactions using the search bar.

## Filter by transaction latency

You can filter transactions in which a SQL statement fingerprint exceeds a specified latency value. Use the pulldown in the **Filters** menu.

## Understand the Transactions page

Use this page to identify transactions that you may want to [troubleshoot](query-behavior-troubleshooting.html), such as transactions that are experiencing high latencies, multiple [retries](transactions.html#transaction-retries), or execution failures.

{{site.data.alerts.callout_success}}
If you haven't yet run any transactions in the cluster as a user, this page will display a blank table.
{{site.data.alerts.end}}

Column | Description
-----|------------
Transactions | The [SQL statement fingerprints](ui-statements-page.html#sql-statement-fingerprints) that make up the transaction.<br><br>To view the transaction fingerprint and details, click this to open the [**Transaction Details** page](#transaction-details-page).
Execution Count | Cumulative number of executions of this transaction within the last hour or specified [time interval](#time-interval). <br><br>The bar indicates the ratio of runtime success (gray) to [retries](transactions.html#transaction-retries) (red) for the transaction.
Rows Read | Average number of rows [read from disk](architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) while executing this transaction within the last hour or specified [time interval](#time-interval).<br><br>The gray bar indicates the mean number of rows returned. The blue bar indicates one standard deviation from the mean.
Bytes Read | Aggregation of all bytes [read from disk](architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) across all operators for this transaction within the last hour or specified [time interval](#time-interval). <br><br>The gray bar indicates the mean number of bytes read from disk. The blue bar indicates one standard deviation from the mean.
Statement Time | Average [planning and execution time](architecture/sql-layer.html#sql-parser-planner-executor) of this transaction within the last hour or specified [time interval](#time-interval). <br><br>The gray bar indicates the mean latency. The blue bar indicates one standard deviation from the mean.
Contention | Average time this transaction was [in contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) with other transactions within the last hour or specified [time interval](#time-interval). <br><br>The gray bar indicates mean contention time. The blue bar indicates one standard deviation from the mean.
Max Memory | Maximum memory used by this transaction at any time during its execution within the last hour or specified [time interval](#time-interval). <br><br>The gray bar indicates the average max memory usage. The blue bar indicates one standard deviation from the mean.
Network | Amount of [data transferred over the network](architecture/reads-and-writes-overview.html) (e.g., between regions and nodes) for this transaction within the last hour or specified [time interval](#time-interval). <br><br>If this value is 0, the transaction was executed on a single node. <br><br>The gray bar indicates the mean number of bytes sent over the network. The blue bar indicates one standard deviation from the mean.
Retries | Cumulative number of [retries](transactions.html#transaction-retries) of this transaction within the last hour or specified [time interval](#time-interval).
Statements | Number of SQL statements in the transaction.

{{site.data.alerts.callout_info}}
Significant transactions on your database are likely to have a high execution count or number of rows read.
{{site.data.alerts.end}}

### Time interval

By default, the Transactions page displays all transactions executed within a one-hour time interval. The display is cleared at the end of each interval. You can change the interval with the [`diagnostics.reporting.interval`](cluster-settings.html#settings) cluster setting.

## Transaction Details page

Click on a transaction fingerprint to open **Transaction Details**.

- The **transaction fingerprint** is displayed as a list of the individual [SQL statement fingerprints](ui-statements-page.html#sql-statement-fingerprints) in the transaction.
- The **mean transaction time** is the mean average time it took to execute the transaction within the last hour or specified [time interval](#time-interval).
- **Transaction resource** usage shows overall statistics about the transaction.
    - **Mean rows/bytes read** shows the mean average number of rows and bytes [read from the storage layer](architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) during the execution of the transaction within the last hour or specified [time interval](#time-interval).
    - **Bytes read over network** displays the amount of [data transferred over the network](architecture/reads-and-writes-overview.html) (e.g., between regions and nodes) for this transaction within the last hour or specified [time interval](#time-interval). <br><br>If this value is 0, the statement was executed on a single node.
    - **Max memory usage** is the maximum memory used by this transaction at any time during its execution within the last hour or specified time interval.
    - **Max scratch disk usage** displays the maximum amount of data [spilled to temporary storage on disk](vectorized-execution.html#disk-spilling-operations) while executing this transaction within the last hour or specified time interval.

The statement table gives details for each SQL statement in the transaction:

Column | Description
-------|------------
{% include {{ page.version.version }}/ui/statement_table.md %}

## See also

- [Transactions](transactions.html)
- [Transaction Layer](architecture/transaction-layer.html)
- [Run Multi-Statement Transactions](run-multi-statement-transactions.html)
- [Transaction latency graphs](ui-sql-dashboard.html#transactions)
- [Transaction retries](transactions.html#transaction-retries)
- [DB Console Statements Page](ui-statements-page.html)
