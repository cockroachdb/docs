---
title: Statements Page
toc: false
---

The **Statements** page helps you identify the frequently executed or high latency [SQL statements](sql-statements.html). The **Statements** page also allows you to drill down to the details of an individual SQL statement by clicking on the statement to view the **Statement Details** page.

To view the **Statements** page, open [http://localhost:8080/#/statements](http://localhost:8080/#/statements) in your browser (replacing `localhost` and `8080` with your node's host and port).

<div id="toc"></div>

{{site.data.alerts.callout_danger}}
**This feature is a work in progress**. It will change leading up to the v2.1 release.
{{site.data.alerts.end}}

## Limitations

- If you have multiple applications running on the cluster, the **Statements** page shows cumulative parameter values across all applications, while the **Statements Details** page shows the values for the first application only.
- The **Statements** page provides the SQL statement details only for the [gateway node](architecture/sql-layer.html#overview). To view the details for other nodes, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) from that node and navigate to `http://<node address>:8080/#/statements` from the browser.
- The **Statements** page displays the details of the SQL statements executed only within a specified time interval. By default, the time interval is set to one hour; however, you can customize the interval using the [`diagnostics.reporting.interval`](cluster-settings.html#settings) cluster setting.

## Understanding the Statements page

### SQL statement fingerprint

Whenever possible, the **Statements** page displays the details of SQL statement fingerprints instead of individual SQL statements.

A statement fingerprint is a grouping of similar SQL statements in their abstracted form by replacing the parameter values with `_`. Grouping similar SQL statements as fingerprints helps you quickly identify the frequently executed SQL statements and their latencies.

A statement fingerprint is generated when two or more statements have the same abstractions. For example, the following statements have the same abstractions:

`INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)`
`INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (192, 891, 20)`
`INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (784, 452, 78)`

Thus they can have the same fingerprint:

`INSERT INTO new_order(product_id, customer_id, no_w_id) VALUES (_, _, _)`

The following statements are different enough to not have the same fingerprint:

`INSERT INTO orders(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)`
`INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)`
`INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, 11, 11098)`
`INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, $2, 11098)`
`INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES ($1, $2, $3)`

### Parameters

The **Statements** page displays the execution time, count, and mean rows and latency for each statement fingerprint. By default, the statement fingerprints are sorted by their execution time; however, you can sort the table by count, mean rows, and mean latency.

The following details are provided for each statement fingerprint:

Parameter | Description
-----|------------
Statement | The SQL statement or the fingerprint of similar SQL statements.
Time | The cumulative time taken to execute the SQL statement (or multiple statements having the same fingerprint).
Count | The total number of times the SQL statement (or multiple statements having the same fingerprint) is executed. <br><br>The execution count is displayed in numerical value as well as in the form of a horizontal bar. The bar is color-coded to indicate the ratio of runtime success (indicated by blue) to runtime failure (indicated by red) of the execution count for the fingerprint. The bar also helps you compare the execution count across all SQL fingerprints in the table. <br><br>You can sort the table by count.
Mean Rows | The average number of rows returned or affected while executing the SQL statement (or multiple statements having the same fingerprint). <br><br>The number of mean rows is displayed in numerical value as well as in the form of a horizontal bar. The bar helps you compare the mean rows across all SQL fingerprints in the table. <br><br>You can sort the table by mean rows.
Mean Latency | The average service latency of the SQL statement (or multiple statements having the same fingerprint). <br><br> The mean latency is displayed in numerical value as well as in the form of a horizontal bar. The bar is color-coded to indicate the latency across the execution phases: parse (indicated by red), plan (indicated by yellow), execute (indicated by blue), and overhead (indicated by red). The bar also helps you compare the mean latencies across all SQL fingerprints in the table. <br><br>You can sort the table by mean latency.

To view additional details of a statement fingerprint, click on the statement fingerprint in the **Statement** column to see the **Statement Details** page.

## Statement Details page

The **Statement Details** page displays the details of the execution count, latency by phase, row count, and statistics for the selected statement fingerprint.

### Execution count

The **Execution Count** table provides information about the following parameters in numerical values as well as bar graphs:

Parameter | Description
-----|------------
First Attempts | The cumulative number of first attempts to execute the SQL statement (or multiple statements having the same fingerprint).
Retries | The cumulative number of retries to execute the SQL statement (or multiple statements having the same fingerprint).
Max Retries |
Total |

### Latency by phase

The **Latency by Phase** table provides the mean and standard deviation values of the service latency for each execution phase (parse, plan, run, and overhead) for the SQL statement (or multiple statements having the same fingerprint). The table provides the service latency details in numerical values as well as bar graphs. The bar graphs are color-coded per execution phase:

Phase | Color code
-----|------------
Parse | Red
Plan | Yellow
Run | Blue
Overhead | Red

### Row count

The **Row Count** table provides the mean and standard deviation values of cumulative count of rows returned or affected by the SQL statement (or multiple statements having the same fingerprint). The table provides the service latency details in numerical values as well as a bar graph.

### Statistics

The statistics box on the right-hand side of the **Statements Details** page provides the following details for the statement fingerprint:

Parameter | Description
-----|------------
Total time | The cumulative time taken to execute the SQL statement (or multiple statements having the same fingerprint).
Execution count | The total number of times the SQL statement (or multiple statements having the same fingerprint) is executed.
Executed without retry | The total number of times the SQL statement (or multiple statements having the same fingerprint) is executed successfully on the first attempt.
Mean service latency | The average service latency of the SQL statement (or multiple statements having the same fingerprint).
Mean number of rows | The average number of rows returned or affected while executing the SQL statement (or multiple statements having the same fingerprint).

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
