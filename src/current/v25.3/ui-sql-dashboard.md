---
title: SQL Dashboard
summary: The SQL dashboard lets you monitor the performance of your SQL queries.
toc: true
docs_area: reference.db_console
---

The **SQL** dashboard in the DB Console lets you monitor the performance of your SQL queries.

To view this dashboard, [access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access), click **Metrics** in the left-hand navigation, and then select **Dashboard** > **SQL**.

## Dashboard navigation

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

For monitoring CockroachDB, it is sufficient to use the [**Open SQL Sessions**](#open-sql-sessions), [**Active SQL Statements**](#active-sql-statements), [**SQL Byte Traffic**](#sql-byte-traffic), [**SQL Queries Per Second**](#sql-queries-per-second), [**Service Latency**](#service-latency-sql-99th-percentile), and [**Transactions**](#transactions) graphs.

---

The **SQL** dashboard displays the following time series graphs.

## Open SQL Sessions

- In the node view, the graph shows the number of connections open between the client and the selected node.

  - {% include {{page.version.version}}/sql/server-side-connection-limit.md %}

- In the cluster view, the graph shows the total number of SQL client connections to all nodes combined, with lines for each node.

## SQL Connection Rate

The **SQL Connection Rate** is an average of the number of connection attempts per second over an aggregation window.

- In the node view, the graph shows the rate of SQL connection attempts between clients and the selected node.

- In the cluster view, the graph shows the rate of SQL connection attempts to all nodes, with lines for each node.

## Upgrades of SQL Transaction Isolation Level

- In the node view, the graph shows the total number of times a SQL transaction was upgraded to a stronger isolation level on the selected node.

- In the cluster view, the graph shows the total number of times a SQL transaction was upgraded to a stronger isolation level across all nodes.

If this metric is non-zero, then transactions are being [upgraded to stronger isolation levels]({% link {{ page.version.version }}/transactions.md %}#isolation-level-upgrades).

## Open SQL Transactions

- In the node view, the graph shows the total number of open SQL transactions on the node.

- In the cluster view, the graph shows the total number of open SQL transactions across all nodes in the cluster.

See the [Transactions page]({% link {{ page.version.version }}/ui-transactions-page.md %}) for more details on the transactions.

## Active SQL Statements

- In the node view, the graph shows the total number of SQL statements running on that node.

- In the cluster view, the graph shows the total number of SQL statements running across all nodes in the cluster.

See the [Statements page]({% link {{ page.version.version }}/ui-statements-page.md %}) for more details on the cluster's SQL statements.

## SQL Byte Traffic

The **SQL Byte Traffic** graph helps you correlate SQL query count to byte traffic, especially in bulk data inserts or analytic queries that return data in bulk.

- In the node view, the graph shows the current byte throughput (bytes/second) between all the connected SQL clients and the node. There are lines for bytes in and bytes out.

- In the cluster view, the graph shows the aggregate client throughput across all nodes. There are lines for bytes in and bytes out.

## SQL Queries Per Second

- In the node view, the graph shows the 10-second moving average of the number of `SELECT`/`INSERT`/`UPDATE`/`DELETE` queries issued by SQL clients and successfully executed per second on the node. `Total Queries`, a sum of all four averages, is also displayed as a general Queries Per Second (QPS) metric.

- In the cluster view, the graph shows the sum of the per-node averages, that is, an aggregate estimation of the current statement load over the cluster, assuming the last 10 seconds of activity per node are representative of this load.

See the [Statements page]({% link {{ page.version.version }}/ui-statements-page.md %}) for more details on the cluster's SQL statements.

Metrics: `sql.select.count`, `sql.update.count`, `sql.insert.count`, `sql.delete.count`, `sql.crud_query.count`

The following SQL statements update the `INSERT` metric (`sql.insert.count`):

- [`INSERT ... ON CONFLICT DO UPDATE ...`]({% link {{ page.version.version }}/insert.md %}#on-conflict-clause): Even when the `DO UPDATE` clause is actually executed, the root of the [abstract syntax tree (AST)]({% link {{ page.version.version }}/architecture/sql-layer.md %}#parsing) is used to increment the metric, rather than the actual execution details.

- [`UPSERT`]({% link {{ page.version.version }}/upsert.md %})

{{site.data.alerts.callout_info}}
[Data manipulation statements]({% link {{ page.version.version }}/sql-statements.md %}#data-manipulation-statements) other than  `SELECT`/`INSERT`/`UPDATE`/`DELETE`/`UPSERT` update the `sql.misc.count` metric, which is *not* displayed on this graph.
{{site.data.alerts.end}}

## SQL Statement Errors

- In the node view, the graph shows the 10-second average of the number of SQL statements issued to the node that returned a [planning]({% link {{ page.version.version }}/architecture/sql-layer.md %}#sql-parser-planner-executor),  [runtime]({% link {{ page.version.version }}/architecture/sql-layer.md %}#sql-parser-planner-executor), or [retry error]({% link {{ page.version.version }}/transactions.md %}#error-handling).

- In the cluster view, the graph shows the 10-second average of the number of SQL statements that returned a [planning]({% link {{ page.version.version }}/architecture/sql-layer.md %}#sql-parser-planner-executor),  [runtime]({% link {{ page.version.version }}/architecture/sql-layer.md %}#sql-parser-planner-executor), or [retry error]({% link {{ page.version.version }}/transactions.md %}#error-handling) across all nodes.

See the [Statements page]({% link {{ page.version.version }}/ui-statements-page.md %}) for more details on the cluster's SQL statements.

## SQL Statement Contention

The statement contention metric is a counter that represents the number of statements that have experienced [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention). If a statement experiences at least one contention "event" (i.e., the statement is forced to wait for another transaction), the counter is incremented at most once.

- In the node view, the graph shows the total number of SQL statements that experienced [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) on that node.

- In the cluster view, the graph shows the total number of SQL statements that experienced [contention]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#transaction-contention) across all nodes in the cluster.

    See the [Statements page]({% link {{ page.version.version }}/ui-statements-page.md %}) for more details on the cluster's SQL statements.

## Full Table/Index Scans

- In the node view, the graph shows the total number of full table and index scans per second on that node. This is a non-negative rate.

- In the cluster view, the graph shows the total number of full table and index scans per second across all nodes in the cluster. This is a non-negative rate.

You can [identify the specific statements]({% link {{ page.version.version }}/ui-statements-page.md %}#filter) that result in full table scans by filtering for them on the **Statements** page. [Examine these statements]({% link {{ page.version.version }}/sql-tuning-with-explain.md %}) that result in full table scans and consider adding [secondary indexes]({% link {{ page.version.version }}/schema-design-indexes.md %}#create-a-secondary-index).

## Active Flows for Distributed SQL Statements

- In the node view, the graph shows the number of flows on that node contributing to the running [distributed SQL]({% link {{ page.version.version }}/architecture/sql-layer.md %}#distsql) statements.

- In the cluster view, the graph shows the number of flows across all nodes in the cluster contributing to the running [distributed SQL]({% link {{ page.version.version }}/architecture/sql-layer.md %}#distsql) statements.

## Connection Latency: 99th Percentile

Connection latency is calculated as the time in nanoseconds between when the cluster receives a connection request and establishes the connection to the client, including authentication. This metric characterizes the database connection latency which can affect the application performance, for example, by having slow startup times. Connection failures are not recorded in these metrics.

- In the node view, the graph shows the 99th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of connection latency for the node. Over the last minute this node established 99% of connections within this time, not including network latency between the node and the client.

- In the cluster view, the graph shows the 99th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of connection latency across all nodes in the cluster. There are lines for each node in the cluster. Over the last minute the nodes of the cluster established 99% of connections within this time, not including network latency between the node and the client.

Metrics: `sql.conn.latency-p99`

## Connection Latency: 90th Percentile

Connection latency is calculated as the time in nanoseconds between when the cluster receives a connection request and establishes the connection to the client, including authentication. This metric characterizes the database connection latency which can affect the application performance, for example, by having slow startup times. Connection failures are not recorded in these metrics.

- In the node view, the graph shows the 90th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of connection latency for the node. Over the last minute this node established 90% of connections within this time, not including network latency between the node and the client.

- In the cluster view, the graph shows the 90th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of connection latency across all nodes in the cluster. There are lines for each node in the cluster. Over the last minute the nodes of the cluster established 90% of connections within this time, not including network latency between the node and the client.

Metrics: `sql.conn.latency-p90`

## Service Latency: SQL, 99.99th percentile

Service latency is calculated as the time in nanoseconds between when the cluster [receives a query and finishes executing the query]({% link {{ page.version.version }}/architecture/sql-layer.md %}). This time does not include returning results to the client. Service latency includes metrics only from DML  (`SELECT`,` INSERT`, `UPDATE`, and `DELETE`) statements.

- In the node view, the graph shows the 99.99th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency for the node. Over the last minute this node executed 99.99% of queries within this time, not including network latency between the node and the client.

- In the cluster view, the graph shows the 99.99th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency across all nodes in the cluster. There are lines for each node in the cluster. Over the last minute the cluster executed 99.99% of queries within this time, not including network latency between the node and the client.

## Service Latency: SQL, 99.9th percentile

Service latency is calculated as the time in nanoseconds between when the cluster [receives a query and finishes executing the query]({% link {{ page.version.version }}/architecture/sql-layer.md %}). This time does not include returning results to the client. Service latency includes metrics only from DML  (`SELECT`,` INSERT`, `UPDATE`, and `DELETE`) statements.

- In the node view, the graph shows the 99.9th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency for the node. Over the last minute this node executed 99.9% of queries within this time, not including network latency between the node and the client.

- In the cluster view, the graph shows the 99.9th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency across all nodes in the cluster. There are lines for each node in the cluster. Over the last minute the cluster executed 99.9% of queries within this time, not including network latency between the node and the client.

## Service Latency: SQL, 99th percentile

{% include {{ page.version.version }}/ui/ui-sql-latency-99th-percentile.md %}

## Service Latency: SQL, 90th percentile

Service latency is calculated as the time in nanoseconds between when the cluster [receives a query and finishes executing the query]({% link {{ page.version.version }}/architecture/sql-layer.md %}). This time does not include returning results to the client. Service latency includes metrics only from DML  (`SELECT`,` INSERT`, `UPDATE`, and `DELETE`) statements.

- In the node view, the graph shows the 90th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency for the node. Over the last minute this node executed 90% of queries within this time, not including network latency between the node and the client.

- In the cluster view, the graph shows the 90th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency across all nodes in the cluster. There are lines for each node in the cluster. Over the last minute the cluster executed 90% of queries within this time, not including network latency between the node and the client.

## KV Execution Latency: 99th percentile

KV execution latency is calculated as the time in milliseconds between when the [KV layer]({% link {{ page.version.version }}/architecture/overview.md %}) receives the request and delivers a response.

- In the node view, the graph shows the 99th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of KV execution latency for the node. Over the last minute the node executed 99% of requests within this time.

- In the cluster view, the graph shows the 99th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of KV execution latency for each node in the cluster. There are lines for each node in the cluster. Over the last minute the node executed 99% of requests within this time.

## KV Execution Latency: 90th percentile

KV execution latency is calculated as the time in milliseconds between when the [KV layer]({% link {{ page.version.version }}/architecture/overview.md %}) receives the request and delivers a response.

- In the node view, the graph shows the 90th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of KV execution latency for the node. Over the last minute the node executed 90% of requests within this time.

- In the cluster view, the graph shows the 90th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of KV execution latency for each node in the cluster. There are lines for each node in the cluster. Over the last minute the node executed 90% of requests within this time.

## Transactions

- In the node view, the graph shows the 10-second average of the number of opened (`Begin`), committed (`Commits`), rolled back (`Rollbacks`), and aborted (`Aborts`) [transactions]({% link {{ page.version.version }}/transactions.md %}) per second issued by SQL clients on the node.

- In the cluster view, the graph shows the sum of the per-node averages, that is, an aggregate estimation of the current [transactions]({% link {{ page.version.version }}/transactions.md %}) load over the cluster, assuming the last 10 seconds of activity per node are representative of this load.

If the graph shows excessive aborts or rollbacks, it might indicate issues with the SQL statements. In that case, re-examine [statements]({% link {{ page.version.version }}/ui-statements-page.md %}) to lower contention.

See the [Transactions page]({% link {{ page.version.version }}/ui-transactions-page.md %}) for more details on the transactions.

## Transaction Restarts

- In the node view, the graph shows the number of transactions restarted on that node broken down by the errors that caused the restart.

- In the cluster view, the graph shows the number of transactions restarted across the cluster broken down by the errors that caused the restart.

See the [Transaction Retry Error Reference]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}) for details on the errors that caused the transaction to restart.

## Transaction Latency: 99th percentile

Transaction latency is calculated as the total time in nanoseconds a [transaction]({% link {{ page.version.version }}/transactions.md %}) took to complete.

- In the node view, the graph shows the 99th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of transaction time over a 1 minute period for the node. Over the last minute the node completed 99% of transactions within this time.

- In the cluster view, the graph shows the 99th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of transaction time over a 1 minute period for each node in the cluster. Over the last minute the node completed 99% of transactions within this time.

See the [Transactions page]({% link {{ page.version.version }}/ui-transactions-page.md %}) for more details on the transactions.

## Transaction Latency: 90th percentile

Transaction latency is calculated as the total time in nanoseconds a [transaction]({% link {{ page.version.version }}/transactions.md %}) took to complete.

- In the node view, the graph shows the 90th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of transaction time over a 1 minute period for the node. Over the last minute the node completed 90% of transactions within this time.

- In the cluster view, the graph shows the 90th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of transaction time over a 1 minute period for each node in the cluster. Over the last minute the node completed 90% of transactions within this time.

See the [Transactions page]({% link {{ page.version.version }}/ui-transactions-page.md %}) for more details on the transactions.

## SQL Memory

- In the node view, the graph shows the current amount of memory in KiB allocated to the SQL layer on this node. This amount is what is compared against the node's [`--max-sql-memory` flag]({% link {{ page.version.version }}/cockroach-start.md %}#general).

- In the cluster view, the graph shows the current amount of memory in KiB allocated to the SQL layer on all nodes in the cluster. This amount is what is compared against the node's [`--max-sql-memory` flag]({% link {{ page.version.version }}/cockroach-start.md %}#general).

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/prod-deployment/healthy-sql-memory.md %}
{{site.data.alerts.end}}

## Schema Changes

- In the node view, the graph shows the total number of [DDL statements]({% link {{ page.version.version }}/online-schema-changes.md %}) per second on the node.

- In the cluster view, the graph shows the total number of [DDL statements]({% link {{ page.version.version }}/online-schema-changes.md %}) per second across all nodes in the cluster.

## Statement Denials: Cluster Settings

Statement denials are statements that were denied due to a [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) with the following format:

```
{feature}.{statement_type}.enabled = FALSE
```

- In the node view, the graph shows the total number of statements denied per second on this node.

- In the cluster view, the graph shows the total number of statements denied per second across all nodes in the cluster.

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Support Resources]({% link {{ page.version.version }}/support-resources.md %})
- [Raw Status Endpoints]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#raw-status-endpoints)
