---
title: Statements Page
toc: true
---

The **Statements** page helps you identify the frequently executed or high latency [SQL statements](sql-statements.html). The **Statements** page also allows you to view the details of an individual SQL statement by clicking on the statement to view the **Statement Details** page.

To view the **Statements** page, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) and then click **Statements** on the left-hand navigation bar.

{{site.data.alerts.callout_danger}}
**This feature is a work in progress**. It will change leading up to the v2.1 release.
{{site.data.alerts.end}}

## Limitation

The **Statements** page displays the details of the SQL statements executed only within a specified time interval. At the end of the specified time interval, the display is wiped clean, and you'll not see any statements on the **Statements** page until the next set of statements is executed. By default, the time interval is set to one hour; however, you can customize the interval using the [`diagnostics.reporting.interval`](cluster-settings.html#settings) cluster setting.

## Selecting an application

If you have multiple applications running on the cluster, the **Statements** page shows the statements from all of the applications by default. To view the statements pertaining to a particular application, select the particular application from the **App** dropdown menu.

## Understanding the Statements page

### SQL statement fingerprint

The **Statements** page displays the details of SQL statement fingerprints instead of individual SQL statements.

A statement fingerprint is a grouping of similar SQL statements in their abstracted form by replacing the literal values with underscores (`_`). Grouping similar SQL statements as fingerprints helps you quickly identify the frequently executed SQL statements and their latencies.

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

The **Statements** page displays the time, count, and mean rows and latency for each statement fingerprint. By default, the statement fingerprints are sorted by time; however, you can sort the table by count, mean rows, and mean latency.

The following details are provided for each statement fingerprint:

Parameter | Description
-----|------------
Statement | The SQL statement or the fingerprint of similar SQL statements.<br><br>To view additional details of a statement fingerprint, click on the statement fingerprint in the **Statement** column to see the [**Statement Details** page](#statement-details-page).
Time | The cumulative time taken to execute the SQL statement (or multiple statements having the same fingerprint).
Count | The total number of times the SQL statement (or multiple statements having the same fingerprint) is executed. <br><br>The execution count is displayed in numerical value as well as in the form of a horizontal bar. The bar is color-coded to indicate the ratio of runtime success (indicated by blue) to runtime failure (indicated by red) of the execution count for the fingerprint. The bar also helps you compare the execution count across all SQL fingerprints in the table. <br><br>You can sort the table by count.
Mean Rows | The average number of rows returned or affected while executing the SQL statement (or multiple statements having the same fingerprint). <br><br>The number of mean rows is displayed in numerical value as well as in the form of a horizontal bar. The bar helps you compare the mean rows across all SQL fingerprints in the table. <br><br>You can sort the table by mean rows.
Mean Latency | The average service latency of the SQL statement (or multiple statements having the same fingerprint). <br><br> The mean latency is displayed in numerical value as well as in the form of a horizontal bar. The bar is color-coded to indicate the latency across the execution phases: parse (indicated by red), plan (indicated by yellow), execute (indicated by blue), and overhead (indicated by red). The bar also helps you compare the mean latencies across all SQL fingerprints in the table. <br><br>You can sort the table by mean latency.

## Statement Details page

The **Statement Details** page displays the details of the execution count, latency by phase, row count, and statistics for the selected statement fingerprint.

### Execution Count

The **Execution Count** table provides information about the following parameters in numerical values as well as bar graphs:

Parameter | Description
-----|------------
First Attempts | The cumulative number of first attempts to execute the SQL statement (or multiple statements having the same fingerprint).
Retries | The cumulative number of retries to execute the SQL statement (or multiple statements having the same fingerprint).
Max Retries | The highest number of retries for a single SQL statement with this fingerprint. <br><br>For example, if three statements having the same fingerprint had to be retried 0, 1, and 5 times, then the Max Retries value for the fingerprint is 5.
Total | The total number of executions of statements with this fingerprint. It is calculated as the sum of first attempts and cumulative retries.

### Latency by Phase

The **Latency by Phase** table provides the mean and standard deviation values of the overall service latency as well as latency for each execution phase (parse, plan, run, and overhead) for the SQL statement (or multiple statements having the same fingerprint). The table provides the service latency details in numerical values as well as bar graphs. The bar graphs are color-coded per execution phase:

Phase | Color code
-----|------------
Parse | Red
Plan | Yellow
Run | Blue
Overhead | Red

### Row Count

The **Row Count** table provides the mean and standard deviation values of cumulative count of rows returned or affected by the SQL statement (or multiple statements having the same fingerprint). The table provides the service latency details in numerical values as well as a bar graph.

### By Gateway Node

The **By Gateway Node** table provides a breakdown of the number of statements of the selected fingerprint per gateway node. For each gateway node, the table also provides details about the cumulative time taken to execute the statement, the total number of times the SQL statement (or multiple statements having the same fingerprint) is executed, the mean number of rows affected, and the mean latency.

### Statistics

The statistics box on the right-hand side of the **Statements Details** page provides the following details for the statement fingerprint:

Parameter | Description
-----|------------
Total time | The cumulative time taken to execute the SQL statement (or multiple statements having the same fingerprint).
Execution count | The total number of times the SQL statement (or multiple statements having the same fingerprint) is executed.
Executed without retry | The percentage of successful executions of the SQL statement (or multiple statements having the same fingerprint) on the first attempt.
Mean service latency | The average service latency of the SQL statement (or multiple statements having the same fingerprint).
Mean number of rows | The average number of rows returned or affected while executing the SQL statement (or multiple statements having the same fingerprint).

The table below the statistics box provides the following details:

Parameter | Description
-----|------------
App | Name of the application specified by the [`application_name`](https://www.cockroachlabs.com/docs/dev/show-vars.html#supported-variables) session setting. The **Statements Details** page shows the details for this application.
Distributed execution? | Indicates whether the statement (or multiple statements having the same fingerprint) were executed using DistSQL.
Used cost-based optimizer? | Indicates whether the statement (or multiple statements having the same fingerprint) were executed using the cost-based optimizer.
Failed? | Indicate if the statement (or multiple statements having the same fingerprint) were executed successfully.

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
