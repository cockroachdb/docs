---
title: SQL Dashboard
toc: false
---

The **SQL** dashboard in the CockroachDB Admin UI lets you monitor the performance of your SQL queries. To view this dashboard, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui), then from the **Dashboard** drop-down box, select **SQL**. 

<div id="toc"></div>

The **SQL** dashboard displays the following time series graphs:

## SQL Connections
<img src="{{ 'images/admin_ui_sql_connections.png' | relative_url }}" alt="CockroachDB Admin UI SQL Connections" style="border:1px solid #eee;max-width:100%" />

In the node view, the graph shows the number of connections currently open between the client and the selected node.

In the cluster view, the graph shows the total number of SQL client connections to all nodes combined.

## SQL Byte Traffic
<img src="{{ 'images/admin_ui_sql_byte_traffic.png' | relative_url }}" alt="CockroachDB Admin UI SQL Byte Traffic" style="border:1px solid #eee;max-width:100%" />

In the node view, the graph shows the current byte throughput (bytes/second) between all the currently connected SQL clients and the node. 

In the cluster view, the graph shows the aggregate client throughput across all nodes.

The graph helps you correlate SQL Query count to byte traffic, especially in bulk data inserts, or analytic queries that return data in bulk. 

## SQL Queries
<img src="{{ 'images/admin_ui_sql_queries.png' | relative_url }}" alt="CockroachDB Admin UI SQL Queries" style="border:1px solid #eee;max-width:100%" />

In the node view, the SQL Queries metric depicts the current moving average, over the last 10 seconds, of the number of `SELECT`/`INSERT`/`UPDATE`/`DELETE` queries per second issued by SQL clients on the node. 

In the cluster view, the graph shows the sum of the per-node averages; that is, an aggregate estimation of the current query load over the cluster, assuming the last 10 seconds of activity per node are representative of this load.

## Transactions
<img src="{{ 'images/admin_ui_transactions.png' | relative_url }}" alt="CockroachDB Admin UI Transactions" style="border:1px solid #eee;max-width:100%" />

In the node view, shows separately the current moving average, over the last 10 seconds, of the number of opened, committed, aborted and rolled back transactions per second issued by SQL clients on the node. 

In the cluster view, the graph shows the sum of the per-node averages; that is, an aggregate estimation of the current transactions load over the cluster, assuming the last 10 seconds of activity per node are representative of this load.

If the graph shows excessive aborts or rollbacks, it might indicate issues with the SQL queries. In that case, re-examine queries to lower contention. 
 
## Service Latency
<img src="{{ 'images/admin_ui_service_latency_99_percentile.png' | relative_url }}" alt="CockroachDB Admin UI Service Latency" style="border:1px solid #eee;max-width:100%" />

Service latency is calculated as the time between when the cluster receives a query and finishes executing the query. This time does not include returning results to the client.

In the node view, the graph displays the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency for the selected node.

In the cluster view, the graph displays the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency for each node in the cluster. 

{{site.data.alerts.callout_info}}The <b>SQL</b> dashboard displays time-series graphs for other metrics such as <b>Execution Latency</b>, <b>Active Distributed SQL Queries</b>, <b>Active Flows for Distributed SQL Queries</b>, <b>Service Latency: DistSQL</b>, and <b>Schema Changes</b> that are important for CockroachDB developers. For monitoring CockroachDB, it is sufficient to monitor the <b>SQL Connections</b>, <b>SQL Byte Traffic</b>, <b>SQL Queries</b>, <b>Service Latency</b>, and <b>Transactions</b> graphs.{{site.data.alerts.end}}