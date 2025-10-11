---
title: Troubleshoot SQL Behavior
summary: Learn how to troubleshoot issues with specific SQL statements with CockroachDB
toc: true
---

If a [SQL statement](sql-statements.html) returns an unexpected result or takes longer than expected to process, this page will help you troubleshoot the issue.

{{site.data.alerts.callout_success}}
For a developer-centric walkthrough of optimizing SQL query performance, see [Optimize Query Performance](make-queries-fast.html).
{{site.data.alerts.end}}

## Identify slow queries

Use the [slow query log](#using-the-slow-query-log) or [Admin UI](#using-the-admin-ui) to detect slow queries in your cluster.

### Using the slow query log

<span class="version-tag">New in v20.1:</span> The slow query log is a record of SQL queries whose service latency exceeds a specified threshold value. When the `sql.log.slow_query.latency_threshold` [cluster setting](cluster-settings.html) is set to a non-zero value, each gateway node will log slow SQL queries to a secondary log file `cockroach-sql-slow.log` in the [log directory](debug-and-error-logs.html#write-to-file).

{{site.data.alerts.callout_info}}
Service latency is the time taken to execute a query once it is received by the cluster. It does not include the time taken to send the query to the cluster or return the result to the client.
{{site.data.alerts.end}}

1. Run the [`cockroach sql`](cockroach-sql.html) command against one of your nodes. This opens the interactive SQL shell.

2. Set the `sql.log.slow_query.latency_threshold` [cluster setting](cluster-settings.html) to a threshold of your choosing. For example, 100 milliseconds represents [the limit where a user feels the system is reacting instantaneously](https://www.nngroup.com/articles/response-times-3-important-limits/).

	{% include_cached copy-clipboard.html %}
	~~~ sql
	> SET CLUSTER SETTING sql.log.slow_query.latency_threshold = '100ms';
	~~~

3. Each node's slow query log is written by default in CockroachDB's standard [log directory](debug-and-error-logs.html#write-to-file).

4. When you open a slow query log, look for a line that corresponds to your earlier [`SET CLUSTER SETTING`](set-cluster-setting.html) command:

	~~~
	I200325 19:24:10.079675 380825 sql/exec_log.go:193  [n1,client=127.0.0.1:49712,hostnossl,user=root] 1532 9.217ms exec "$ cockroach sql" {} "SET CLUSTER SETTING \"sql.log.slow_query.latency_threshold\" = '100ms'" {} 0 "" 0
	~~~

	Slow queries will be logged after this line.

5. The slow query log generally shares the [SQL audit log file format](experimental-audit.html#audit-log-file-format). One exception is that service latency is found between the log entry counter and log message.

	For example, the below query was logged with a service latency of 166.807 milliseconds:

	~~~
	I200325 21:57:08.733963 388888 sql/exec_log.go:193  [n1,client=127.0.0.1:53663,hostnossl,user=root] 400 166.807ms exec "" {} "UPSERT INTO vehicle_location_histories VALUES ($1, $2, now(), $3, $4)" {$1:"'washington dc'", $2:"'c9e93223-fb27-4014-91ce-c60758476580'", $3:"-29.0", $4:"45.0"} 1 "" 0
	~~~

{{site.data.alerts.callout_info}}
Setting `sql.log.slow_query.latency_threshold` to a non-zero value enables tracing on all queries, which impacts performance. After debugging, set the value back to `0s` to disable the log.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/admin-ui/admin-ui-log-files.md %}
{{site.data.alerts.end}}

### Using the Admin UI

High latency SQL statements are displayed on the [**Statements page**](admin-ui-statements-page.html) of the Admin UI. To view the Statements page, [access the Admin UI](admin-ui-overview.html#admin-ui-access) and click **Statements** on the left.

You can also check the [service latency graph](admin-ui-sql-dashboard.html#service-latency-sql-99th-percentile) and the [CPU graph](admin-ui-hardware-dashboard.html#cpu-percent) on the SQL and Hardware Dashboards, respectively. If the graphs show latency spikes or CPU usage spikes, these might indicate slow queries in your cluster.

## Visualize statement traces in Jaeger

You can look more closely at the behavior of a statement by visualizing a statement trace in [Jaeger](https://www.jaegertracing.io/). A [statement trace](show-trace.html) contains messages and timing information from all nodes involved in the execution.

1. Activate [statement diagnostics](admin-ui-statements-page.html#diagnostics) on the Admin UI Statements Page or run [`EXPLAIN ANALYZE (DEBUG)`](explain-analyze.html#debug-option) to obtain a diagnostics bundle for the statement.

1. Start Jaeger:

  {% include_cached copy-clipboard.html %}
  ~~~ shell
  docker run -d --name jaeger -p 16686:16686 jaegertracing/all-in-one:1.17
  ~~~

1. Access the Jaeger UI at `http://localhost:16686/search`.

1. Click on **JSON File** in the Jaeger UI and upload `trace-jaeger.json` from the diagnostics bundle. The trace will appear in the list on the right. 

    <img src="{{ 'images/v20.1/jaeger-trace-json.png' | relative_url }}" alt="Jaeger Trace Upload JSON" style="border:1px solid #eee;max-width:40%" />

1. Click on the trace to view its details. It is visualized as a collection of spans with timestamps. These may include operations executed by different nodes.

    <img src="{{ 'images/v20.1/jaeger-trace-spans.png' | relative_url }}" alt="Jaeger Trace Spans" style="border:1px solid #eee;max-width:100%" />

    The full timeline displays the execution time and [execution phases](architecture/sql-layer.html#sql-parser-planner-executor) for the statement.

1. Click on a span to view details for that span and log messages.

    <img src="{{ 'images/v20.1/jaeger-trace-log-messages.png' | relative_url }}" alt="Jaeger Trace Log Messages" style="border:1px solid #eee;max-width:100%" />

1. You can troubleshoot [transaction contention](performance-best-practices-overview.html#understanding-and-avoiding-transaction-contention), for example, by gathering [diagnostics](admin-ui-statements-page.html#diagnostics) on statements with high latency and looking through the log messages in `trace-jaeger.json` for jumps in latency.

	In the example below, the trace shows that there is significant latency between a push attempt on a transaction that is holding a [lock](architecture/transaction-layer.html#writing) (56.85ms) and that transaction being committed (131.37ms).

    <img src="{{ 'images/v20.1/jaeger-trace-transaction-contention.png' | relative_url }}" alt="Jaeger Trace Log Messages" style="border:1px solid #eee;max-width:100%" />
    
## `SELECT` statement performance issues

The common reasons for a sub-optimal `SELECT` performance are inefficient scans, full scans, and incorrect use of indexes. To improve the performance of `SELECT` statements, refer to the following documents:

-  [Table scan best practices](performance-best-practices-overview.html#table-scans-best-practices)

-  [Indexes best practices](performance-best-practices-overview.html#indexes-best-practices)

## Query is always slow

If you have consistently slow queries in your cluster, use the [Statement Details](admin-ui-statements-page.html#statement-details-page) page to drill down to an individual statement and [collect diagnostics](admin-ui-statements-page.html#diagnostics) for the statement. A diagnostics bundle contains a record of transaction events across nodes for the SQL statement.

You can also use an [`EXPLAIN ANALYZE`](explain-analyze.html) statement, which executes a SQL query and returns a physical query plan with execution statistics. Query plans can be used to troubleshoot slow queries by indicating where time is being spent, how long a processor (i.e., a component that takes streams of input rows and processes them according to a specification) is not doing work, etc.

We recommend sending either the diagnostics bundle or the `EXPLAIN ANALYZE` output to our [support team](support-resources.html) for analysis.

## Query is sometimes slow

If the query performance is irregular:

1.  Run [`SHOW TRACE`](show-trace.html) for the query twice: once when the query is performing as expected and once when the query is slow.

2.  [Contact us](support-resources.html) to analyze the outputs of the `SHOW TRACE` command.

## Cancelling running queries

See [Cancel query](manage-long-running-queries.html#cancel-long-running-queries)

## Low throughput

Throughput is affected by the disk I/O, CPU usage, and network latency. Use the Admin UI to check the following metrics:

- Disk I/O: [Disk IOPS in progress](admin-ui-hardware-dashboard.html#disk-iops-in-progress)

- CPU usage: [CPU percent](admin-ui-hardware-dashboard.html#cpu-percent)

- Network latency: [Network Latency page](admin-ui-network-latency-page.html)

## Single hot node

A hot node is one that has much higher resource usage than other nodes. To determine if you have a hot node in your cluster, [access the Admin UI](admin-ui-overview.html#admin-ui-access), click **Metrics** on the left, and navigate to the following graphs. Hover over each of the following graphs to see the per-node values of the metrics. If one of the nodes has a higher value, you have a hot node in your cluster.

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

Use the [Statements page](admin-ui-statements-page.html) to identify the slow [SQL statements](sql-statements.html). To view the Statements page, [access the Admin UI](admin-ui-overview.html#admin-ui-access) and then click Statements on the left.

Refer to the following documents to improve `INSERT` / `UPDATE` performance:

-   [Multi-row DML](performance-best-practices-overview.html#multi-row-dml-best-practices)

-   [Bulk-Insert best practices](performance-best-practices-overview.html#bulk-insert-best-practices)

## Per-node queries per second (QPS) is high

If a cluster is not idle, it is useful to monitor the per-node queries per second. Cockroach will automatically distribute load throughout the cluster. If one or more nodes is not performing any queries there is likely something to investigate. See `exec_success` and `exec_errors` which track operations at the KV layer and `sql_{select,insert,update,delete}_count` which track operations at the SQL layer.

## Increasing number of nodes does not improve performance

See [Why would increasing the number of nodes not result in more operations per second?](operational-faqs.html#why-would-increasing-the-number-of-nodes-not-result-in-more-operations-per-second)

## `bad connection` & `closed` responses

If you receive a response of `bad connection` or `closed`, this normally indicates that the node you connected to died. You can check this by connecting to another node in the cluster and running [`cockroach node status`](cockroach-node.html#show-the-status-of-all-nodes).

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
