---
title: SQL Dashboard
summary: The SQL dashboard lets you monitor the performance of your SQL queries.
toc: true
docs_area: reference.db_console
---

The **SQL** dashboard in the DB Console lets you monitor the performance of your SQL queries.

To view this dashboard, [access the DB Console](ui-overview.html#access-the-db-console), click **Metrics** in the left-hand navigation, and then select **Dashboard** > **SQL**.

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

For monitoring CockroachDB, it is sufficient to use the [**Open SQL Sessions**](#open-sql-sessions), [**SQL Byte Traffic**](#sql-byte-traffic), [**SQL Statements**](#sql-statements), [**Service Latency**](#service-latency-sql-99th-percentile), and [**Transactions**](#transactions) graphs.

The **SQL** dashboard displays the following time series graphs:

## Open SQL Sessions

- In the node view, the graph shows the number of connections open between the client and the selected node.

  - {% include {{page.version.version}}/sql/server-side-connection-limit.md %}

- In the cluster view, the graph shows the total number of SQL client connections to all nodes combined, with lines for each node.

## Open SQL Transactions

- In the node view, the graph shows the total number of open SQL transactions on the node.

- In the cluster view, the graph shows the total number of open SQL transactions across all nodes in the cluster.

See the [Transactions page](ui-transactions-page.html) for more details on the transactions.

## Active SQL Statements

- In the node view, the graph shows the total number of SQL statements running on that node.

- In the cluster view, the graph shows the total number of SQL statements running across all nodes in the cluster.

See the [Statements page](ui-statements-page.html) for more details on the cluster's SQL statements.

## SQL Byte Traffic

The **SQL Byte Traffic** graph helps you correlate SQL query count to byte traffic, especially in bulk data inserts or analytic queries that return data in bulk.

- In the node view, the graph shows the current byte throughput (bytes/second) between all the connected SQL clients and the node. There are lines for bytes in and bytes out.

- In the cluster view, the graph shows the aggregate client throughput across all nodes. There are lines for bytes in and bytes out.

## SQL Statements

- In the node view, the graph shows the 10-second average of the number of `SELECT`/`INSERT`/`UPDATE`/`DELETE` statements per second issued by SQL clients on the node.

- In the cluster view, the graph shows the sum of the per-node averages, that is, an aggregate estimation of the current statement load over the cluster, assuming the last 10 seconds of activity per node are representative of this load.

## SQL Statement Errors

- In the node view, the graph shows the 10-second average of the number of SQL statements issued to the node that returned a [planning](architecture/sql-layer.html#sql-parser-planner-executor),  [runtime](architecture/sql-layer.html#sql-parser-planner-executor), or [retry error](transactions.html#error-handling).

- In the cluster view, the graph shows the 10-second average of the number of SQL statements that returned a [planning](architecture/sql-layer.html#sql-parser-planner-executor),  [runtime](architecture/sql-layer.html#sql-parser-planner-executor), or [retry error](transactions.html#error-handling) across all nodes.

See the [Statements page](ui-statements-page.html) for more details on the cluster's SQL statements.

## SQL Statement Contention

The statement contention metric is a counter that represents the number of statements that have experienced contention. If a statement experiences at least one contention "event" (i.e., the statement is forced to wait for another transaction), the counter is incremented at most once.

- In the node view, the graph shows the total number of SQL statements that experienced [contention](transactions.html#transaction-contention) on that node.

- In the cluster view, the graph shows the total number of SQL statements that experienced [contention](transactions.html#transaction-contention) across all nodes in the cluster.

    See the [Statements page](ui-statements-page.html) for more details on the cluster's SQL statements.

## Full Table/Index Scans

- In the node view, the graph shows the total number of full table and index scans on that node.

- In the cluster view, the graph shows the total number of full table and index scans across all nodes in the cluster.

[Examine the statements](sql-tuning-with-explain.html) that result in full table scans and consider adding [secondary indexes](schema-design-indexes.html#create-a-secondary-index).

## Active Flows for Distributed SQL Statements

- In the node view, the graph shows the number of flows on that node contributing to the running [distributed SQL](architecture/sql-layer.html#distsql) statements.

- In the cluster view, the graph shows the number of flows across all nodes in the cluster contributing to the running [distributed SQL](architecture/sql-layer.html#distsql) statements.

## Connection Latency: 99th Percentile

Connection latency is calculated as the time in nanoseconds between when the cluster receives a connection request and establishes the connection to the client, including authentication.

- In the node view, the graph shows the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of connection latency for the node. Over the last minute this node established 99% of connections within this time, not including network latency between the node and the client.

- In the cluster view, the graph shows the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency across all nodes in the cluster. There are lines for each node in the cluster. Over the last minute the cluster established 99% of connections within this time, not including network latency between the node and the client.

## Connection Latency: 90th Percentile

Connection latency is calculated as the time in nanoseconds between when the cluster receives a connection request and establishes the connection to the client, including authentication.

## Service Latency: SQL, 99th percentile

{% include {{ page.version.version }}/ui/ui-sql-latency-99th-percentile.md %}

## Service Latency: SQL, 90th percentile

Service latency is calculated as the time in nanoseconds between when the cluster [receives a query and finishes executing the query](architecture/sql-layer.html). This time does not include returning results to the client.

- In the node view, the graph shows the 90th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency for the node. Over the last minute this node executed 90% of queries within this time, not including network latency between the node and the client.

- In the cluster view, the graph shows the 90th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency across all nodes in the cluster. There are lines for each node in the cluster. Over the last minute the cluster executed 90% of queries within this time, not including network latency between the node and the client.

## KV Execution Latency: 99th percentile

KV execution latency is calculated as the time in milliseconds between when the [KV layer](architecture/overview.html) receives the request and delivers a response.

- In the node view, the graph shows the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of KV execution latency for the node. Over the last minute the node executed 99% of requests within this time.

- In the cluster view, the graph shows the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of KV execution latency for each node in the cluster. There are lines for each node in the cluster. Over the last minute the node executed 99% of requests within this time.

## KV Execution Latency: 90th percentile

KV execution latency is calculated as the time in milliseconds between when the [KV layer](architecture/overview.html) receives the request and delivers a response.

- In the node view, the graph shows the 90th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of KV execution latency for the node. Over the last minute the node executed 90% of requests within this time.

- In the cluster view, the graph shows the 90th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of KV execution latency for each node in the cluster. There are lines for each node in the cluster. Over the last minute the node executed 90% of requests within this time.

## Transactions

- In the node view, the graph shows the 10-second average of the number of opened (`Begin`), committed (`Commits`), rolled back (`Rollbacks`), and aborted (`Aborts`) [transactions](transactions.html) per second issued by SQL clients on the node.

- In the cluster view, the graph shows the sum of the per-node averages, that is, an aggregate estimation of the current [transactions](transactions.html) load over the cluster, assuming the last 10 seconds of activity per node are representative of this load.

If the graph shows excessive aborts or rollbacks, it might indicate issues with the SQL statements. In that case, re-examine [statements](ui-statements-page.html) to lower contention.

See the [Transactions page](ui-transactions-page.html) for more details on the transactions.

## Transaction Restarts

- In the node view, the graph shows the number of transactions restarted on that node broken down by the errors that caused the restart.

- In the cluster view, the graph shows the number of transactions restarted across the cluster broken down by the errors that caused the restart.

See the [Transaction Retry Error Reference](transaction-retry-error-reference.html) for details on the errors that caused the transaction to restart.

## Transaction Latency: 99th percentile

Transaction latency is calculated as the total time in nanoseconds a [transaction](transactions.html) took to complete.

- In the node view, the graph shows the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of transaction time over a 1 minute period for the node. Over the last minute the node completed 99% of transactions within this time.

- In the cluster view, the graph shows the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of transaction time over a 1 minute period for each node in the cluster. Over the last minute the node completed 99% of transactions within this time.

See the [Transactions page](ui-transactions-page.html) for more details on the transactions.

## Transaction Latency: 90th percentile

Transaction latency is calculated as the total time in nanoseconds a [transaction](transactions.html) took to complete.

- In the node view, the graph shows the 90th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of transaction time over a 1 minute period for the node. Over the last minute the node completed 90% of transactions within this time.

- In the cluster view, the graph shows the 90th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of transaction time over a 1 minute period for each node in the cluster. Over the last minute the node completed 90% of transactions within this time.

See the [Transactions page](ui-transactions-page.html) for more details on the transactions.

## SQL Memory

- In the node view, the graph shows the current amount of memory in KiB allocated to the SQL layer on this node. This amount is what is compared against the node's [`--max-sql-memory` flag](cockroach-start.html#general).

- In the cluster view, the graph shows the current amount of memory in KiB allocated to the SQL layer on all nodes in the cluster. This amount is what is compared against the node's [`--max-sql-memory` flag](cockroach-start.html#general).

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/prod-deployment/healthy-sql-memory.md %}
{{site.data.alerts.end}}

## Schema Changes

- In the node view, the graph shows the total number of [DDL statements](online-schema-changes.html) per second on the node.

- In the cluster view, the graph shows the total number of [DDL statements](online-schema-changes.html) per second across all nodes in the cluster.

## Statement Denials: Cluster Settings

Statement denials are statements that were denied due to a [cluster setting](cluster-settings.html) with the following format:

```
{feature}.{statement_type}.enabled = FALSE
```

- In the node view, the graph shows the total number of statements denied per second on this node.

- In the cluster view, the graph shows the total number of statements denied per second across all nodes in the cluster.

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
