---
title: SQL Dashboard
summary: The SQL dashboard lets you monitor the performance of your SQL queries.
toc: true
redirect_from: admin-ui-sql-dashboard.html
---

The **SQL** dashboard in the DB Console lets you monitor the performance of your SQL queries. To view this dashboard, [access the DB Console](ui-overview.html#db-console-access), click **Metrics** on the left-hand navigation bar, and then select **Dashboard** > **SQL**.

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

The **SQL** dashboard displays the following time series graphs:

## SQL Connections

<img src="{{ 'images/v21.1/ui_sql_connections.png' | relative_url }}" alt="DB Console SQL Connections" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the number of connections currently open between the client and the selected node.

- In the cluster view, the graph shows the total number of SQL client connections to all nodes combined.

## SQL Byte Traffic

<img src="{{ 'images/v21.1/ui_sql_byte_traffic.png' | relative_url }}" alt="DB Console SQL Byte Traffic" style="border:1px solid #eee;max-width:100%" />

The **SQL Byte Traffic** graph helps you correlate SQL query count to byte traffic, especially in bulk data inserts or analytic queries that return data in bulk.

- In the node view, the graph shows the current byte throughput (bytes/second) between all the currently connected SQL clients and the node.

- In the cluster view, the graph shows the aggregate client throughput across all nodes.

## SQL Queries

<img src="{{ 'images/v21.1/ui_sql_queries.png' | relative_url }}" alt="DB Console SQL Queries" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of `SELECT`/`INSERT`/`UPDATE`/`DELETE` queries per second issued by SQL clients on the node.

- In the cluster view, the graph shows the sum of the per-node averages, that is, an aggregate estimation of the current query load over the cluster, assuming the last 10 seconds of activity per node are representative of this load.

## SQL Query Errors

<img src="{{ 'images/v21.1/ui_sql_query_errors.png' | relative_url }}" alt="DB Console SQL Query Errors" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of SQL statements issued to the node that returned a [planning](architecture/sql-layer.html#sql-parser-planner-executor),  [runtime](architecture/sql-layer.html#sql-parser-planner-executor), or [retry error](transactions.html#error-handling).

- In the cluster view, the graph shows the 10-second average of the number of SQL statements that returned a [planning](architecture/sql-layer.html#sql-parser-planner-executor),  [runtime](architecture/sql-layer.html#sql-parser-planner-executor), or [retry error](transactions.html#error-handling) across all nodes.

## Service Latency: SQL, 99th percentile

<img src="{{ 'images/v21.1/ui_service_latency_99_percentile.png' | relative_url }}" alt="DB Console Service Latency" style="border:1px solid #eee;max-width:100%" />

Service latency is calculated as the time between when the cluster receives a query and finishes executing the query. This time does not include returning results to the client.

- In the node view, the graph displays the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency for the selected node.

- In the cluster view, the graph displays the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency for each node in the cluster.

## Transactions

<img src="{{ 'images/v21.1/ui_transactions.png' | relative_url }}" alt="DB Console Transactions" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the 10-second average of the number of opened, committed, aborted, and rolled back [transactions](transactions.html) per second issued by SQL clients on the node.

- In the cluster view, the graph shows the sum of the per-node averages, that is, an aggregate estimation of the current [transactions](transactions.html) load over the cluster, assuming the last 10 seconds of activity per node are representative of this load.

If the graph shows excessive aborts or rollbacks, it might indicate issues with the SQL queries. In that case, re-examine queries to lower contention.

Additionally, per-application average transaction times are displayed for each node, at the 90th and 99th percentiles.

<img src="{{ 'images/v21.1/ui_transaction_latency.png' | relative_url }}" alt="DB Console Transaction Latencies" style="border:1px solid #eee;max-width:100%" />

## Other graphs

The **SQL** dashboard shows other time series graphs that are important for CockroachDB developers:

- KV Execution Latency
- Active Distributed SQL Queries
- Active Flows for Distributed SQL Queries
- Service Latency: DistSQL
- Schema Changes

For monitoring CockroachDB, it is sufficient to use the [**SQL Connections**](#sql-connections), [**SQL Byte Traffic**](#sql-byte-traffic), [**SQL Queries**](#sql-queries), [**Service Latency**](#service-latency-sql-99th-percentile), and [**Transactions**](#transactions) graphs.

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
