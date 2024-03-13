---
title: Monitor SQL Activity metrics
summary: Monitor SQL Activity metrics let you monitor SQL activity.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
These graphs are available for CockroachDB {{ site.data.products.advanced }} and CockroachDB {{ site.data.products.basic }} deployments. For graphs available to CockroachDB {{ site.data.products.standard }} deployments, refer to the [Metrics Overview]({% link cockroachcloud/metrics-page.md %}#cockroachdb-cloud-console-metrics-page).
{{site.data.alerts.end}}

To view these graphs, select a cluster from the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page), and click **Metrics** in the **Monitoring** section of the left side navigation. On the **Metrics** page, click the **Monitor SQL Activity** tab.

## Time interval selection

The time interval selector at the top of each tab allows you to filter the view for a predefined or custom time interval. Use the navigation buttons to move to the previous, next, or current time interval. When you select a time interval, the same interval is selected for all charts on the **Metrics** page.

## Open SQL Transactions

The graph shows the total number of open [SQL transactions](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/transactions) across the cluster.

See the [**Transactions** page]({% link cockroachcloud/transactions-page.md %}) for more details on the transactions.

## SQL Statements

- The graph shows a moving average of the number of [`SELECT`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/selection-queries)/[`INSERT`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/insert)/[`UPDATE`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/update)/[`DELETE`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/delete) statements per second issued by SQL clients on the cluster.

See the [**Statements** page]({% link cockroachcloud/statements-page.md %}) for more details on the statements.

## SQL Statement Latency

SQL statement latency is calculated as the total time in nanoseconds a [statement](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/sql-statements) took to complete. This graph shows the p50-p99.99 latencies for statements issued on the cluster.

## SQL Open Sessions

This graph shows the total number of SQL [client connections](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/show-sessions) across the cluster.

See the [**Sessions** page]({% link cockroachcloud/sessions-page.md %}) for more details on the sessions.

## SQL Connection Latency

Connection latency is calculated as the time in nanoseconds between when the cluster receives a connection request and establishes the connection to the client, including [authentication]({% link cockroachcloud/authentication.md %}). This graph shows the p90-p99.99 latencies for [SQL connections](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/show-sessions) to the cluster.

## SQL Connection Attempts

This graph shows a moving average of new SQL connection attempts to the cluster per second.

## See also

- [Metrics Overview]({% link cockroachcloud/metrics-page.md %})
- [Statements Page]({% link cockroachcloud/statements-page.md %})
- [Transactions Page]({% link cockroachcloud/transactions-page.md %})
- [Sessions Page]({% link cockroachcloud/sessions-page.md %})
- [Jobs Page]({% link cockroachcloud/jobs-page.md %})
