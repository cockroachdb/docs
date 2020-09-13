---
title: Troubleshoot SQL Behavior
summary: Learn how to troubleshoot issues with specific SQL statements with CockroachDB
toc: true
---

If a SQL statement returns an unexpected result or takes longer than expected to process, this page will help you troubleshoot the issue.

## `SELECT` statement performance issues

The common reasons for a sub-optimal `SELECT` performance are inefficient scans, full scans, and incorrect use of indexes. To improve the performance of `SELECT` statements, refer to the following documents:

-  [Table scan best practices](performance-best-practices-overview.html#table-scans-best-practices)

-  [Indexes best practices](performance-best-practices-overview.html#indexes-best-practices)

## Query is always slow

To detect whether your cluster has slow queries, check the [service latency graph](admin-ui-sql-dashboard.html#service-latency-sql-99th-percentile) and the [CPU graph](admin-ui-hardware-dashboard.html#cpu-percent). If the graphs show latency spikes or CPU usage spikes, it might indicate slow queries in your cluster.

Once you determine that you do have slow queries in your cluster, use the [Statements page](admin-ui-statements-page.html) to identify the high latency [SQL statements](sql-statements.html). To view the Statements page, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) and then click Statements on the left.

You can then use the [Statements Details](admin-ui-statements-page.html#statement-details-page) page to drill down to individual statements. You can also use [`EXPLAIN ANALYZE`](explain-analyze.html) statement, which executes a SQL query and returns a physical query plan with execution statistics. Query plans provide information around SQL execution, which can be used to troubleshoot slow queries by figuring out where time is being spent, how long a processor (i.e., a component that takes streams of input rows and processes them according to a specification) is not doing work, etc.

If you need help interpreting the output of the `EXPLAIN ANALYZE` statement, [contact us](file-an-issue.html).

## Query is sometimes slow

If the query performance is irregular:

1.  Run [`SHOW TRACE`](show-trace.html) for the query twice: once when the query is performing as expected and once when the query is slow.

2.  [Contact us](file-an-issue.html) to analyze the outputs of the `SHOW TRACE` command.

## Cancelling running queries

See [Cancel query](manage-long-running-queries.html#cancel-long-running-queries)

## Low throughput

Throughput is affected by the disk I/O, CPU usage, and network latency. Use the Admin UI to check the following metrics:

- Disk I/O: [Disk IOPS in progress](admin-ui-hardware-dashboard.html#disk-iops-in-progress)

- CPU usage: [CPU percent](admin-ui-hardware-dashboard.html#cpu-percent)

- Network latency: [Service latency SQL 99th percentile](admin-ui-overview-dashboard.html#service-latency-sql-99th-percentile)

## Single hot node

A hot node is one that has much higher resource usage than other nodes. To determine if you have a hot node in your cluster, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui), click **Metrics** on the left, and navigate to the following graphs. Hover over each of the following graphs to see the per-node values of the metrics. If one of the nodes has a higher value, you have a hot node in your cluster.

-   Replication dashboard > Average queries per store graph.

-   Overview Dashboard > Service Latency graph

-   Hardware Dashboard > CPU percent graph

-   SQL Dashboard > SQL Connections graph

-   Hardware Dashboard > Disk IOPS in Progress graph

**Solution:**

-   If you have a small table that fits into one range, then only one of the nodes will be used. This is expected behavior. However, you can [split your range](split-at.html) to distribute the table across multiple nodes.

-   If the **SQL Connections** graph shows that one node has a higher number of SQL connections and other nodes have zero connections, check if your app is set to talk to only one node.

-   Check load balancer settings.

-   Check for [transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention).

-   If you have a monotonically increasing index column or Primary Key, then your index or Primary Key should be redesigned. See [Unique ID best practices](performance-best-practices-overview.html#unique-id-best-practices) for more information.

## INSERT/UPDATE statements are slow

Use the [Statements page](admin-ui-statements-page.html) to identify the slow [SQL statements](sql-statements.html). To view the Statements page, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) and then click Statements on the left.

Refer to the following documents to improve `INSERT` / `UPDATE` performance:

-   [Multi-row DML](performance-best-practices-overview.html#multi-row-dml-best-practices)

-   [Bulk-Insert best practices](performance-best-practices-overview.html#bulk-insert-best-practices)

## Per-node queries per second (QPS) is high

If a cluster is not idle, it is useful to monitor the per-node queries per second. Cockroach will automatically distribute load throughout the cluster. If one or more nodes is not performing any queries there is likely something to investigate. See `exec_success` and `exec_errors` which track operations at the KV layer and `sql_{select,insert,update,delete}_count` which track operations at the SQL layer.

## Increasing number of nodes does not improve performance

See [Why would increasing the number of nodes not result in more operations per second?](operational-faqs.html#why-would-increasing-the-number-of-nodes-not-result-in-more-operations-per-second)

## `bad connection` & `closed` responses

If you receive a response of `bad connection` or `closed`, this normally indicates that the node you connected to died. You can check this by connecting to another node in the cluster and running [`cockroach node status`](view-node-details.html#show-the-status-of-all-nodes).

Once you find the downed node, you can check its [logs](debug-and-error-logs.html) (stored in `cockroach-data/logs` by default).

Because this kind of behavior is entirely unexpected, you should [file an issue](file-an-issue.html).

## SQL logging

{% include {{ page.version.version }}/faq/sql-query-logging.md %}

## Something else?

Try searching the rest of our docs for answers or using our other [support resources](support-resources.html), including:

- [CockroachDB Community Forum](https://forum.cockroachlabs.com)
- [CockroachDB Community Slack](https://cockroachdb.slack.com)
- [StackOverflow](http://stackoverflow.com/questions/tagged/cockroachdb)
- [CockroachDB Support Portal](https://support.cockroachlabs.com)
