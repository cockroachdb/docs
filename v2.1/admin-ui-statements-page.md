---
title: Statements Page
toc: false
---

The **Statements** page helps you identify the frequently executed or high latency [SQL statements](sql-statements.html). To view the **Statements** page, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) and then click **Statements** on the left-hand navigation bar.

{{site.data.alerts.callout_danger}}
**This feature is a work in progress**. It will change leading up to the v2.1 release.
{{site.data.alerts.end}}

<div id="toc"></div>

The **Statements** page displays the details of SQL statement fingerprints instead of individual SQL statements to help you easily identify which SQL statements are executed frequently and their latencies.

## SQL Statement fingerprint

A statement fingerprint is a skeleton of a [SQL statement](sql-statements.html) with the parameter values replaced by `_`.

A statement fingerprint is generated when two or more statements have similar skeletons to have the same fingerprint. For instance, the following statements have similar skeletons:

`INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)`
`INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (192, 891, 20)`
`INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (784, 452, 78)`

Thus they can have the same fingerprint:

`INSERT INTO new_order(product_id, customer_id, no_w_id) VALUES (_, _, _)`

The following statements have enough differences that prevent the statements from having the same fingerprint:

`INSERT INTO new_order(product_id, customer_id, transaction_id) VALUES (380, 11, 11098)`
`INSERT INTO new_order VALUES ($1, $2, $3)`
`INSERT INTO order_line VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`

## Understanding the Statements page

The **Statements** page provides the execution time, count, and mean rows and latency for each statement fingerprint. By default, the statement fingerprints are sorted by their execution time; however, you can choose to sort by count, mean rows, and mean latency.

The following details are provided for each statement fingerprint:

Parameter | Description
-----|------------
Statement | The fingerprint of the SQL statement(s).
Time | The total time spent on servicing the statement fingerprint. <!---(Need to clarify this further)--->
Count | The total number of times the statement fingerprint is executed. The column also includes the bar graph for the statement execution count. You can sort the table by count.
<!---
How are the means calculated?
-->
Mean Rows | The average number of rows returned or affected. The column also includes the bar graph for the mean rows. You can sort the table by Mean Rows.
Mean Latency | Latency to parse, plan, and execute the statement. The column also includes the bar graph for the Mean Latency. You can sort the table by Mean Latency.

{{site.data.alerts.callout_danger}}
As of v2.1, the **Statements** page displays the details of the SQL statements executed within the previous hour only. This limitation will be removed in subsequent releases.
{{site.data.alerts.end}}

To view additional details of a statement fingerprint, click on the statement fingerprint in the **Statement** column to see the **Statement Details** page.

## Statement Details page

The **Statement Details** page provides the following information for a statement fingerprint:

### Execution count

The Execution Count table provides information about the following parameters:

Parameter | Description
-----|------------
First Attempts |
Retries |
Max Retries |
Total |

### Latency by phase

The Latency by Phase table provides the mean and standard deviation values of the time taken to parse, plan, and run the statement fingerprint, along with the overhead and overall time taken by the statement fingerprint.

### Row count

The mean and variance count of rows affected by the statement fingerprint. (How are they calculated?)

### Statistics

The statistics box on the right-hand side of the Statements Details page provides the following details for the statement fingerprint:

Parameter | Description
-----|------------
Total time |
Execution count |
Executed without retry |
Mean service latency |
Mean number of rows

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
