---
title: SQL Dashboard
summary: The SQL dashboard lets you monitor the performance of your SQL queries.
toc: true
---

The **SQL** dashboard in the CockroachDB Admin UI lets you monitor the performance of your SQL queries. To view this dashboard, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui), click **Metrics** on the left-hand navigation bar, and then select **Dashboard** > **SQL**.


The **SQL** dashboard displays the following time series graphs:

## SQL Connections

<img src="{{ 'images/v2.0/admin_ui_sql_connections.png' | relative_url }}" alt="CockroachDB Admin UI SQL Connections" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the number of connections currently open between the client and the selected node.

- In the cluster view, the graph shows the total number of SQL client connections to all nodes combined.

## SQL Byte Traffic

<img src="{{ 'images/v2.0/admin_ui_sql_byte_traffic.png' | relative_url }}" alt="CockroachDB Admin UI SQL Byte Traffic" style="border:1px solid #eee;max-width:100%" />

The **SQL Byte Traffic** graph helps you correlate SQL query count to byte traffic, especially in bulk data inserts or analytic queries that return data in bulk.

- In the node view, the graph shows the current byte throughput (bytes/second) between all the currently connected SQL clients and the node.

- In the cluster view, the graph shows the aggregate client throughput across all nodes.

## SQL Queries

<img src="{{ 'images/v2.0/admin_ui_sql_queries.png' | relative_url }}" alt="CockroachDB Admin UI SQL Queries" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the current moving average, over the last 10 seconds, of the number of `SELECT`/`INSERT`/`UPDATE`/`DELETE` queries per second issued by SQL clients on the node.

- In the cluster view, the graph shows the sum of the per-node averages, that is, an aggregate estimation of the current query load over the cluster, assuming the last 10 seconds of activity per node are representative of this load.

## Transactions

<img src="{{ 'images/v2.0/admin_ui_transactions.png' | relative_url }}" alt="CockroachDB Admin UI Transactions" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows separately the current moving average, over the last 10 seconds, of the number of opened, committed, aborted and rolled back transactions per second issued by SQL clients on the node.

- In the cluster view, the graph shows the sum of the per-node averages, that is, an aggregate estimation of the current transactions load over the cluster, assuming the last 10 seconds of activity per node are representative of this load.

If the graph shows excessive aborts or rollbacks, it might indicate issues with the SQL queries. In that case, re-examine queries to lower contention.

## Service Latency

<img src="{{ 'images/v2.0/admin_ui_service_latency_99_percentile.png' | relative_url }}" alt="CockroachDB Admin UI Service Latency" style="border:1px solid #eee;max-width:100%" />

Service latency is calculated as the time between when the cluster receives a query and finishes executing the query. This time does not include returning results to the client.

- In the node view, the graph displays the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency for the selected node.

- In the cluster view, the graph displays the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency for each node in the cluster.

## Other Graphs

The **SQL** dashboard shows other time series graphs that are important for CockroachDB developers:

- Execution Latency
- Active Distributed SQL Queries
- Active Flows for Distributed SQL Queries
- Service Latency: DistSQL
- Schema Changes

For monitoring CockroachDB, it is sufficient to use the [**SQL Connections**](#sql-connections), [**SQL Byte Traffic**](#sql-byte-traffic), [**SQL Queries**](#sql-queries), [**Service Latency**](#service-latency), and [**Transactions**](#transactions) graphs.
