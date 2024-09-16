---
title: Metrics Page
summary: The Metrics page lets you monitor the performance of your Serverless cluster's SQL queries.
toc: true
docs_area: manage
---

The **Metrics** page of the CockroachDB Cloud Console allows you to:

- [**Monitor SQL Activity**](#monitor-sql-activity)
- [**Identify SQL Problems**](#identify-sql-problems)
- [Create **Custom** metrics charts](#create-custom-metrics-charts)

To view this page, select a cluster from the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page), and click **Metrics** in the **Monitoring** section of the left side navigation.

## Time interval selection

The time interval selector at the top of each tab allows you to filter the view for a predefined or custom time interval. Use the navigation buttons to move to the previous, next, or current time interval. When you select a time interval, the same interval is selected for all charts on the page.

## Monitor SQL Activity

On the **Monitor SQL Activity** tab, you can view the following time series graphs:

### Open SQL Transactions

The graph shows the total number of open [SQL transactions]({% link {{site.current_cloud_version}}/transactions.md %}) across the cluster.

See the [**Transactions** page]({% link cockroachcloud/transactions-page.md %}) for more details on the transactions.

### SQL Statements

- The graph shows a moving average of the number of [`SELECT`]({% link {{site.current_cloud_version}}/selection-queries.md %})/[`INSERT`]({% link {{site.current_cloud_version}}/insert.md %})/[`UPDATE`]({% link {{site.current_cloud_version}}/update.md %})/[`DELETE`]({% link {{site.current_cloud_version}}/delete.md %}) statements per second issued by SQL clients on the cluster.

See the [**Statements** page]({% link cockroachcloud/statements-page.md %}) for more details on the statements.

### SQL Statement Latency

SQL statement latency is calculated as the total time in nanoseconds a [statement]({% link {{site.current_cloud_version}}/sql-statements.md %}) took to complete. This graph shows the p50-p99.99 latencies for statements issued on the cluster.

### SQL Open Sessions

This graph shows the total number of SQL [client connections]({% link {{site.current_cloud_version}}/show-sessions.md %}) across the cluster.

See the [**Sessions** page]({% link cockroachcloud/sessions-page.md %}) for more details on the sessions.

### SQL Connection Latency

Connection latency is calculated as the time in nanoseconds between when the cluster receives a connection request and establishes the connection to the client, including [authentication]({% link cockroachcloud/authentication.md %}). This graph shows the p90-p99.99 latencies for [SQL connections]({% link {{site.current_cloud_version}}/show-sessions.md %}) to the cluster.

### SQL Connection Attempts

This graph shows a moving average of new SQL connection attempts to the cluster per second.

## Identify SQL Problems

On the **Identify SQL Problems** tab, you can view the following time series graphs:

### Transaction Restarts

This graph shows the number of [transactions restarted]({% link {{site.current_cloud_version}}/common-errors.md %}#restart-transaction) across the cluster.

See the [Transaction Retry Error Reference]({% link {{site.current_cloud_version}}/transaction-retry-error-reference.md %}) for details on the errors that caused the transaction to restart.

### SQL Statement Errors

This graph shows a moving average of the number of SQL statements that returned a [planning]({% link {{site.current_cloud_version}}/architecture/sql-layer.md %}#sql-parser-planner-executor), [runtime]({% link {{site.current_cloud_version}}/architecture/sql-layer.md %}#sql-parser-planner-executor), or [retry error]({% link {{site.current_cloud_version}}/transactions.md %}#error-handling) across all nodes.

See the [Statements page]({% link cockroachcloud/statements-page.md %}) for more details on the cluster's SQL statements.

### SQL Statement Full Scans 

This graph shows a moving average of the number of statements with [full table and index scans]({% link {{site.current_cloud_version}}/show-full-table-scans.md %}) across all nodes in the cluster.

[Examine the statements]({% link {{site.current_cloud_version}}/sql-tuning-with-explain.md %}) that result in full table scans and consider adding [secondary indexes]({% link {{site.current_cloud_version}}/schema-design-indexes.md %}#create-a-secondary-index).

### SQL Statement Contention 

This graph shows a moving average of the number of SQL statements that experienced [contention]({% link {{site.current_cloud_version}}/performance-best-practices-overview.md %}#transaction-contention) across the cluster.

See the [Statements page]({% link cockroachcloud/statements-page.md %}) for more details on the cluster's SQL statements.

## Create Custom metrics charts

On the **Custom** tab, you can create one or multiple custom charts showing the time series data for an available metric or combination of metrics.

See the [Custom Metrics Chart page]({% link cockroachcloud/custom-metrics-chart-page.md %}) for more details.

## See also

- [Statements Page]({% link cockroachcloud/statements-page.md %})
- [Transactions Page]({% link cockroachcloud/transactions-page.md %})
- [Sessions Page]({% link cockroachcloud/sessions-page.md %})
- [Jobs Page]({% link cockroachcloud/jobs-page.md %})
