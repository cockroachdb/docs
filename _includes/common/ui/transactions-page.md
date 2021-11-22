{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.versions["stable"]}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}

The **Transactions** page helps you:

- Identify frequently retried or high latency transactions.
- View transaction [details](#transaction-details-page).

{{site.data.alerts.callout_success}}
In contrast to the [**Statements** page]({{ page_prefix }}statements-page.html), which displays [SQL statement fingerprints]({{ page_prefix }}statements-page.html#sql-statement-fingerprints), the **Transactions** page displays SQL statement fingerprints grouped by [transaction]({{ link_prefix }}transactions.html).
{{site.data.alerts.end}}

{% if page.cloud != true %}
To view this page, [access the DB Console](ui-overview.html#db-console-access) and click **Transactions** in the left-hand navigation.
{% else %}
To view this page, click **SQL Activity** in the left-hand navigation of the {{ site.data.products.db }} Console and then click the **Transactions** tab.
{% endif %}

## Search and filter

By default, this page shows transactions from all applications and databases running on the cluster.

You can search for transactions using the search field or using the date field.

To search by date, pick a date range that is within the time period since the statistics were last cleared. Click **reset time** to reset the date.

To filter the transactions by [`application_name`]({{ link_prefix }}connection-parameters.html#additional-connection-parameters), select **App** and choose one or more applications. When no application is selected internal transactions **are not** displayed.

{{site.data.alerts.callout_info}}
- Internal transactions are displayed under the `$ internal` app.
- Transactions from the SQL shell are displayed under the `$ cockroach` app.
- If you haven't set `application_name` in a client connection string, it appears as `unset`.
{{site.data.alerts.end}}

To filter transactions in which a SQL statement fingerprint exceeds a specified latency value, fill in the fields in **Query fingerprint runs longer than**.

## Transaction statistics

{% include common/ui/statistics.md %}

For an example of querying the statistics table, see [Example]({{ page_prefix}}statements-page.html#example).

## Understand the Transactions page

Use the Transactions page to identify transactions that you want to [troubleshoot]({{ link_prefix }}query-behavior-troubleshooting.html), such as transactions that are experiencing high latencies, multiple [retries]({{ link_prefix }}transactions.html#transaction-retries), or execution failures.

{{site.data.alerts.callout_success}}
If you haven't yet executed any transactions in the cluster as a user, this page will be blank.
{{site.data.alerts.end}}

<a id="statement-fingerprint-properties"></a>

### Transactions table

The Transactions table gives details for each SQL statement fingerprint in the transaction:

Column | Description
-----|------------
Transactions | The [SQL statement fingerprints]({{ page_prefix }}statements-page.html#sql-statement-fingerprints) that make up the transaction.<br><br>To view the transaction fingerprint and details, click to open the [Transaction Details page](#transaction-details-page).
Interval Start Time (UTC) | The start time of the statistics aggregation interval for a transaction. <br><br>For example, if a statement is executed at 1:23PM it will fall in the 1:00PM - 2:00PM time interval.  |
Execution Count | Cumulative number of executions of this transaction within the last hour. <br><br>The bar indicates the ratio of runtime success (gray) to [retries]({{ link_prefix }}transactions.html#transaction-retries) (red) for the transaction.
Rows Read | Average number of rows [read from disk]({{ link_prefix }}architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) while executing this transaction within the last hour.<br><br>The gray bar indicates the mean number of rows returned. The blue bar indicates one standard deviation from the mean.
Bytes Read | Aggregation of all bytes [read from disk]({{ link_prefix }}architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) across all operators for this transaction within the last hour. <br><br>The gray bar indicates the mean number of bytes read from disk. The blue bar indicates one standard deviation from the mean.
Transaction Time | Average [planning and execution time]({{ link_prefix }}architecture/sql-layer.html#sql-parser-planner-executor) of this transaction within the last hour. <br><br>The gray bar indicates the mean latency. The blue bar indicates one standard deviation from the mean.
Contention | Average time this transaction was [in contention]({{ link_prefix }}performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention) with other transactions within the last hour.
Max Memory | Maximum memory used by this transaction at any time during its execution within the last hour. <br><br>The gray bar indicates the average max memory usage. The blue bar indicates one standard deviation from the mean.
Network | Amount of [data transferred over the network]({{ link_prefix }}architecture/reads-and-writes-overview.html) for this transaction within the last hour. <br><br>If this value is 0, the transaction was executed on a single node. <br><br>The gray bar indicates the mean number of bytes sent over the network. The blue bar indicates one standard deviation from the mean.
Retries | Cumulative number of [retries]({{ link_prefix }}transactions.html#transaction-retries) of this transaction within the last hour.
Regions/Nodes | The region and nodes in which the transaction was executed. <br><br>**Regions/Nodes** are not visible for {{ site.data.products.serverless }} clusters.
Statements | Number of SQL statements in the transaction.

{{site.data.alerts.callout_info}}
Significant transactions on your database are likely to have a high execution count or number of rows read.
{{site.data.alerts.end}}

## Transaction Details page

Click a transaction fingerprint to open **Transaction Details**.

- The _transaction fingerprint_ is displayed as a list of the individual [SQL statement fingerprints]({{ page_prefix }}statements-page.html#sql-statement-fingerprints) in the transaction.
- The **Mean transaction time** is the mean average time it took to execute the transaction within the last hour.
- **Transaction resource** usage shows overall statistics about the transaction.
    - **Mean rows/bytes read** shows the mean average number of rows and bytes [read from the storage layer]({{ link_prefix }}architecture/life-of-a-distributed-transaction.html#reads-from-the-storage-layer) during the execution of the transaction within the last hour.
    - **Bytes read over network** displays the amount of [data transferred over the network]({{ link_prefix }}architecture/reads-and-writes-overview.html) for this transaction within the last hour. <br><br>If this value is 0, the statement was executed on a single node.
    - **Max memory usage** is the maximum memory used by this transaction at any time during its execution within the last hour or specified time interval.
    - **Max scratch disk usage** displays the maximum amount of data [spilled to temporary storage on disk]({{ link_prefix }}vectorized-execution.html#disk-spilling-operations) while executing this transaction within the last hour or specified time interval.


The Statements table displays the statement fingerprints of all the statements in the transaction. To display the [details of a statement]({{ page_prefix }}statements-page.html#statement-details-page), click a statement fingerprint.

## See also

- [Transactions]({{ link_prefix }}transactions.html)
- [Transaction Layer]({{ link_prefix }}architecture/transaction-layer.html)
- [Run Multi-Statement Transactions]({{ link_prefix }}run-multi-statement-transactions.html)
{% if page.cloud != true %}
- [Transaction latency graphs](ui-sql-dashboard.html#transactions)
{% endif %}
- [Transaction retries]({{ link_prefix }}transactions.html#transaction-retries)
- [Statements Page]({{ page_prefix }}statements-page.html)
