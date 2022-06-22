---
title: Statements Page
toc: true
---

{{site.data.alerts.callout_info}}
On a secure cluster, this area of the Admin UI can only be accessed by an `admin` user. See [Admin UI access](admin-ui-overview.html#admin-ui-access).
{{site.data.alerts.end}}

The **Statements** page helps you identify frequently executed or high latency [SQL statements](sql-statements.html). The **Statements** page also allows you to view the details of an individual SQL statement by clicking on the statement to view the **Statement Details** page.

To view the **Statements** page, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) and then click **Statements** on the left.

<img src="{{ 'images/v19.2/admin-ui-statements-page.png' | relative_url }}" alt="CockroachDB Admin UI Statements Page" style="border:1px solid #eee;max-width:100%" />

## Limitation

The **Statements** page displays the details of the SQL statements executed within a specified time interval. At the end of the interval, the display is wiped clean, and you'll not see any statements on the page until the next set of statements is executed. By default, the time interval is set to one hour; however, you can customize the interval using the [`diagnostics.reporting.interval`](cluster-settings.html#settings) cluster setting.

## Filtering by application

If you have multiple applications running on the cluster, the **Statements** page shows the statements from all of the applications by default. To view the statements pertaining to a particular application, select the [application name](connection-parameters.html#additional-connection-parameters) from the **App** dropdown menu. If you haven't set the application name in the connection string, it appears as `unset` in the dropdown menu.

## Understanding the Statements page

### SQL statement fingerprint

The **Statements** page displays the details of SQL statement fingerprints instead of individual SQL statements.

A statement fingerprint is a grouping of similar SQL statements in their abstracted form by replacing the literal values with underscores (`_`). Grouping similar SQL statements as fingerprints helps you quickly identify frequently executed SQL statements and their latencies.

A statement fingerprint is generated when two or more statements are the same after any literal values in them (e.g.,numbers and strings) are replaced with underscores. For example, the following statements have the same once their numbers have been replaced with underscores:

- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (192, 891, 20)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (784, 452, 78)`

Thus, they can have the same fingerprint:

`INSERT INTO new_order(product_id, customer_id, no_w_id) VALUES (_, _, _)`

The following statements are different enough to not have the same fingerprint:

- `INSERT INTO orders(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, 11, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, $2, 11098)`
- `INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, $2, $3)`

### Parameters

The **Statements** page displays the time, execution count, number of [retries](transactions.html#transaction-retries), number of rows affected, and latency for each statement fingerprint. By default, the statement fingerprints are sorted by time; however, you can sort the table by execution count, retries, rows affected, and latency.

The following details are provided for each statement fingerprint:

Parameter | Description
-----|------------
Statement | The SQL statement or the fingerprint of similar SQL statements.<br><br>To view additional details of a statement fingerprint, click on the statement fingerprint in the **Statement** column to see the [**Statement Details** page](#statement-details-page).
TXN Type | <span class="version-tag">New in v19.2:</span> The type of transaction (implicit or explicit). Explicit transactions refer to the statements that are wrapped by [`BEGIN`](https://www.cockroachlabs.com/docs/dev/begin-transaction.html) and [`COMMIT`](https://www.cockroachlabs.com/docs/v19.2/commit-transaction.html) statements by the client. For statements not in explicit transactions, CockroachDB wraps each statement in individual implicit transactions. Explicit transactions employ [transactional pipelining](architecture/transaction-layer.html#transaction-pipelining) and therefore report latencies that do not account for replication.
Time | The cumulative time taken to execute the SQL statement (or multiple statements having the same fingerprint) within the last hour or the [specified time interval](#limitation).
Execution Count | The total number of times the SQL statement (or multiple statements having the same fingerprint) is executed within the last hour or the [specified time interval](#limitation). <br><br>The execution count is displayed in numerical value as well as in the form of a horizontal bar. The bar is color-coded to indicate the ratio of runtime success (indicated by blue) to runtime failure (indicated by red) of the execution count for the fingerprint. The bar also helps you compare the execution count across all SQL fingerprints in the table. <br><br>You can sort the table by count.
Retries | The cumulative number of retries to execute the SQL statement (or multiple statements having the same fingerprint) within the last hour or the [specified time interval](#limitation).
Rows Affected | The average number of rows returned while executing the SQL statement (or multiple statements having the same fingerprint) within the last hour or the [specified time interval](#limitation). <br><br>The number of rows returned are represented in two ways: The numerical value shows the number of rows returned, while the horizontal bar is color-coded (blue indicates the mean value and yellow indicates one standard deviation of the mean value of the number of rows returned). The bar helps you compare the mean rows across all SQL fingerprints in the table. <br><br>You can sort the table by rows returned.
Latency | The average service latency of the SQL statement (or multiple statements having the same fingerprint) within the last hour or the [specified time interval](#limitation). <br><br>The latency is represented in two ways: The numerical value shows the mean latency, while the horizontal bar is color-coded (blue indicates the mean value and yellow indicates one standard deviation of the mean value of latency). The bar also helps you compare the mean latencies across all SQL fingerprints in the table. <br><br>You can sort the table by latency.

## Statement Details page

The **Statement Details** page displays the logical plan as well as the details of the time, execution count, retries, rows returned, and latency by phase and by gateway node for the selected statement fingerprint.

<img src="{{ 'images/v19.2/admin_ui_statements_details_page.png' | relative_url }}" alt="CockroachDB Admin UI Statements Page" style="border:1px solid #eee;max-width:100%" />

### Logical plan

The **Logical Plan** section displays CockroachDB's query plan for an [explainable statement](sql-grammar.html#preparable_stmt). You can then use this information to optimize the query. For more information about logical plans, see [`EXPLAIN`](explain.html).

By default, the logical plan for each fingerprint is sampled every 5 minutes. You can use the `sql.metrics.statement_details.plan_collection.period` [cluster setting](cluster-settings.html) to change this time interval. For example, to change the interval to 2 minutes, run the following [`SET CLUSTER SETTING`](set-cluster-setting.html) command:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.metrics.statement_details.plan_collection.period  = '2m0s';
~~~

### Latency by Phase

The **Latency by Phase** table provides the mean value and one standard deviation of the mean value of the overall service latency as well as latency for each execution phase (parse, plan, run) for the SQL statement (or multiple statements having the same fingerprint). The table provides the service latency details in numerical values as well as color-coded bar graphs: blue indicates the mean value and yellow indicates one standard deviation of the mean value of latency.

### Statistics by Gateway Node

The **Statistics by Gateway Node** table provides a breakdown of the number of statements of the selected fingerprint per gateway node. For each gateway node, the table also provides the following details:

Parameter | Description
-----|------------
Node | The ID of the gateway node.
Time | The cumulative time taken to execute the statement within the last hour or the [specified time interval](#limitation).
Execution Count | The total number of times the SQL statement (or multiple statements having the same fingerprint) is executed.
Retries | The cumulative number of retries to execute the SQL statement (or multiple statements having the same fingerprint) within the last hour or the [specified time interval](#limitation).
Rows Affected | The average number of rows returned while executing the SQL statement (or multiple statements having the same fingerprint) within the last hour or the [specified time interval](#limitation). <br><br>The number of rows returned are represented in two ways: The numerical value shows the number of rows returned, while the horizontal bar is color-coded (blue indicates the mean value and yellow indicates one standard deviation of the mean value of the number of rows returned). The bar helps you compare the mean rows across all SQL fingerprints in the table. <br><br>You can sort the table by rows returned.
Latency | The average service latency of the SQL statement (or multiple statements having the same fingerprint) within the last hour or the [specified time interval](#limitation). <br><br>The latency is represented in two ways: The numerical value shows the mean latency, while the horizontal bar is color-coded (blue indicates the mean value and yellow indicates one standard deviation of the mean value). The bar also helps you compare the mean latencies across all SQL fingerprints in the table. <br><br>You can sort the table by latency.

### Execution Count

The **Execution Count** table provides information about the following parameters in numerical values as well as bar graphs:

Parameter | Description
-----|------------
First Attempts | The cumulative number of first attempts to execute the SQL statement (or multiple statements having the same fingerprint) within the last hour or the [specified time interval](#limitation).
Retries | The cumulative number of retries to execute the SQL statement (or multiple statements having the same fingerprint) within the last hour or the [specified time interval](#limitation).
Max Retries | The highest number of retries for a single SQL statement with this fingerprint within the last hour or the [specified time interval](#limitation). <br><br>For example, if three statements having the same fingerprint had to be retried 0, 1, and 5 times, then the Max Retries value for the fingerprint is 5.
Total | The total number of executions of statements with this fingerprint. It is calculated as the sum of first attempts and cumulative retries.

### Row Count

The **Row Count** table provides the mean value and one standard deviation of the mean value of cumulative count of rows returned by the SQL statement (or multiple statements having the same fingerprint). The table provides the service latency details in numerical values as well as a bar graph.

### Statistics

The statistics box on the right-hand side of the **Statements Details** page provides the following details for the statement fingerprint:

Parameter | Description
-----|------------
Total time | The cumulative time taken to execute the SQL statement (or multiple statements having the same fingerprint) within the last hour or the [specified time interval](#limitation).
Execution count | The total number of times the SQL statement (or multiple statements having the same fingerprint) is executed within the last hour or the [specified time interval](#limitation).
Executed without retry | The percentage of successful executions of the SQL statement (or multiple statements having the same fingerprint) on the first attempt within the last hour or the [specified time interval](#limitation).
Mean service latency | The average service latency of the SQL statement (or multiple statements having the same fingerprint) within the last hour or the [specified time interval](#limitation).
Mean number of rows | The average number of rows returned while executing the SQL statement (or multiple statements having the same fingerprint) within the last hour or the [specified time interval](#limitation).

The table below the statistics box provides the following details:

Parameter | Description
-----|------------
App | Name of the application specified by the [`application_name`](https://www.cockroachlabs.com/docs/dev/show-vars.html#supported-variables) session setting. The **Statements Details** page shows the details for this application.
Transaction Type | <span class="version-tag">New in v19.2:</span> The type of transaction (implicit or explicit). Explicit transactions refer to the statements that are wrapped by `BEGIN` and `COMMIT` statements by the client. For statements not in explicit transactions, CockroachDB wraps each statement in individual implicit transactions. Explicit transactions employ [transactional pipelining](architecture/transaction-layer.html#transaction-pipelining) and therefore report latencies that do not account for replication.
Distributed execution? | Indicates whether the statement execution was distributed.
Used cost-based optimizer? | Indicates whether the statement (or multiple statements having the same fingerprint) were executed using the [cost-based optimizer](cost-based-optimizer.html).
Failed? | Indicate if the statement (or multiple statements having the same fingerprint) were executed successfully.

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
