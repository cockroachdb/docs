---
title: Metrics Page
summary: The Metrics page lets you monitor the performance of your Serverless cluster's SQL queries.
toc: true
docs_area: manage
---

The **Metrics** page is available for {{ site.data.products.serverless }} clusters. To view this page, select a cluster from the [**Clusters** page](cluster-management.html#view-clusters-page), and click **Metrics** in the **Monitoring** section of the left side navigation. From this page, you can:

- [**Monitor SQL Activity**](#monitor-sql-activity)
- [**Identify SQL Problems**](#identify-sql-problems)

## Time interval selection

The time interval selector at the top of each tab allows you to filter the view for a predefined or custom time interval. Use the navigation buttons to move to the previous, next, or current time interval. When you select a time interval, the same interval is selected for all charts on the page.

## Monitor SQL Activity

On the **Monitor SQL Activity** tab, you can view the following time series graphs:

### Open SQL Transactions

The graph shows the total number of open [SQL transactions](../{{site.versions["stable"]}}/transactions.html) across the cluster.

See the [**Transactions** page](transactions-page.html) for more details on the transactions.

### SQL Statements

- The graph shows a moving average of the number of [`SELECT`](../{{site.versions["stable"]}}/selection-queries.html)/[`INSERT`](../{{site.versions["stable"]}}/insert.html)/[`UPDATE`](../{{site.versions["stable"]}}/update.html)/[`DELETE`](../{{site.versions["stable"]}}/delete.html) statements per second issued by SQL clients on the cluster.

See the [**Statements** page](statements-page.html) for more details on the statements.

### SQL Statement Latency

SQL statement latency is calculated as the total time in nanoseconds a [statement](../{{site.versions["stable"]}}/sql-statements.html) took to complete. This graph shows the p50-p99.99 latencies for statements issues on the cluster.

### SQL Open Sessions

This graph shows the total number of SQL client connections across the cluster.

See the [**Sessions** page](sessions-page.html) for more details on the sessions.

### SQL Connection Latency

Connection latency is calculated as the time in nanoseconds between when the cluster receives a connection request and establishes the connection to the client, including authentication. This graph shows the p90-p99.99 latencies for SQL connections to the cluster.

### SQL Connection Attempts

This graph shows a moving average of new SQL connection attempts to the cluster per second.

## Identify SQL Problems

On the **Identify SQL Problems** tab, you can view the following time series graphs:

### Transaction Restarts

This graph shows the number of transactions restarted across the cluster.

See the [Transaction Retry Error Reference](../{{site.versions["stable"]}}/transaction-retry-error-reference.html) for details on the errors that caused the transaction to restart.

### SQL Statement Errors

This graph shows a moving average of the number of SQL statements that returned a [planning](../{{site.versions["stable"]}}/architecture/sql-layer.html#sql-parser-planner-executor), [runtime](../{{site.versions["stable"]}}/architecture/sql-layer.html#sql-parser-planner-executor), or [retry error](../{{site.versions["stable"]}}/transactions.html#error-handling) across all nodes.

See the [Statements page](statements-page.html) for more details on the cluster's SQL statements.

### SQL Statement Full Scans 

This graph shows a moving average of the number of statements with full table and index scans across all nodes in the cluster.

[Examine the statements](../{{site.versions["stable"]}}/sql-tuning-with-explain.html) that result in full table scans and consider adding [secondary indexes](../{{site.versions["stable"]}}/schema-design-indexes.html#create-a-secondary-index).

### SQL Statement Contention 

This graph shows a moving average of the number of SQL statements that experienced [contention](../{{site.versions["stable"]}}/transactions.html#transaction-contention) across the cluster.

See the [Statements page](statements-page.html) for more details on the cluster's SQL statements.

## See also

- [Available metrics](../{{site.versions["stable"]}}/ui-custom-chart-debug-page.html?filters=metric-names-serverless#available-metrics)
- [Statements Page](statements-page.html)
- [Transactions Page](transactions-page.html)
- [Sessions Page](sessions-page.html)
- [Jobs Page](jobs-page.html)
