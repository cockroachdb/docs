---
title: Identify SQL Problems metrics
summary: Identify SQL Problems metrics let you identify SQL problems.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
These graphs are available for CockroachDB {{ site.data.products.advanced }} and CockroachDB {{ site.data.products.basic }} deployments. For graphs available to CockroachDB {{ site.data.products.standard }} deployments, refer to the [Metrics Overview]({% link cockroachcloud/metrics-page.md %}#cockroachdb-cloud-console-metrics-page).
{{site.data.alerts.end}}

To view these graphs, select a cluster from the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page), and click **Metrics** in the **Monitoring** section of the left side navigation. On the **Metrics** page, click the **Identify SQL Problems** tab.

## Time interval selection

The time interval selector at the top of each tab allows you to filter the view for a predefined or custom time interval. Use the navigation buttons to move to the previous, next, or current time interval. When you select a time interval, the same interval is selected for all charts on the **Metrics** page.

## Transaction Restarts

This graph shows the number of [transactions restarted](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/common-errors#restart-transaction) across the cluster.

See the [Transaction Retry Error Reference](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/transaction-retry-error-reference) for details on the errors that caused the transaction to restart.

## SQL Statement Errors

This graph shows a moving average of the number of SQL statements that returned a [planning](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/sql-layer#sql-parser-planner-executor), [runtime](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/sql-layer#sql-parser-planner-executor), or [retry error](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/transactions#error-handling) across all nodes.

See the [Statements page]({% link cockroachcloud/statements-page.md %}) for more details on the cluster's SQL statements.

## SQL Statement Full Scans 

This graph shows a moving average of the number of statements with [full table and index scans](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/show-full-table-scans) across all nodes in the cluster.

[Examine the statements](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/sql-tuning-with-explain) that result in full table scans and consider adding [secondary indexes](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/schema-design-indexes#create-a-secondary-index).

## SQL Statement Contention 

This graph shows a moving average of the number of SQL statements that experienced [contention](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/performance-best-practices-overview#transaction-contention) across the cluster.

See the [Statements page]({% link cockroachcloud/statements-page.md %}) for more details on the cluster's SQL statements.

## See also

- [Metrics Overview]({% link cockroachcloud/metrics-page.md %})
- [Statements Page]({% link cockroachcloud/statements-page.md %})
- [Transactions Page]({% link cockroachcloud/transactions-page.md %})
- [Sessions Page]({% link cockroachcloud/sessions-page.md %})
- [Jobs Page]({% link cockroachcloud/jobs-page.md %})
