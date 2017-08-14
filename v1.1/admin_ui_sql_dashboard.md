---
title: SQL Dashboard
toc: false
feedback: false
---

The Cockroach DB Admin UI enables you to monitor the performance of your SQL queries.

<div id="toc"></div>

To view the SQL Metrics for your cluster, [access the Admin UI](https://www.cockroachlabs.com/docs/dev/explore-the-admin-ui.html#access-the-admin-ui), then from the Dashboard drop-down box, select **SQL**. 

#### Viewing time-series graphs for each node
By default, the time series panel displays the metrics for the entire cluster. To view the metrics for an individual node, select the node from the **Graph** drop-down list.
<img src="{{ 'images/admin_ui_select_node.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:40%" />

The SQL dashboard displays the following time-series graphs:

## SQL Connections
<img src="{{ 'images/admin_ui_sql_connections.png' | relative_url }}" alt="CockroachDB Admin UI SQL Connections" style="border:1px solid #eee;max-width:100%" />
The graph shows the total number of active SQL client connections across all nodes. 

## SQL Byte Traffic
<img src="{{ 'images/admin_ui_sql_byte_traffic.png' | relative_url }}" alt="CockroachDB Admin UI SQL Byte Traffic" style="border:1px solid #eee;max-width:100%" />
The graph displays the total SQL client network traffic in bytes between the application server and the nodes, per second across all nodes. 

The graph helps you correlate SQL Query count to byte traffic, especially in bulk data inserts, or analytic queries that return data in bulk. 

## SQL Queries
<img src="{{ 'images/admin_ui_sql_queries.png' | relative_url }}" alt="CockroachDB Admin UI SQL Queries" style="border:1px solid #eee;max-width:100%" />
The graph displays the average number of SELECT, INSERT, UPDATE, and DELETE statements per second across all nodes.

## Transactions
<img src="{{ 'images/admin_ui_transactions.png' | relative_url }}" alt="CockroachDB Admin UI Transactions" style="border:1px solid #eee;max-width:100%" />
The graph displays the total number of transactions opened, committed, rolled back, or aborted across all nodes. The graph indicates the total number of transactions averaged over 10 seconds.

If the graph shows excessive aborts or rollbacks, it might indicate issues with the SQL queries. In that case, reexamine queries to lower contention. 
 
## Service Latency
<img src="{{ 'images/admin_ui_service_latency_99_percentile.png' | relative_url }}" alt="CockroachDB Admin UI Service Latency" style="border:1px solid #eee;max-width:100%" />
The graph displays the time required for each node to execute 99% of the queries over the last minute. The service latency is calculated as the time between receiving a query and returning a response. This time does not include network latency between the node and client. 

By default, the time series panel displays the metrics for the entire cluster. To view the metrics for an individual node, select the node from the **Graph** drop-down list.
<img src="{{ 'images/admin_ui_select_node.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:40%" />

{{site.data.alerts.callout_info}}The SQL dashboard displays time-series graphs for other metrics such as Execution Latency, Active Distributed SQL Queries, Active Flows for Distributed SQL Queries, Service Latency: DistSQL, and Schema Changes that are important for CockroachDB developers. For monitoring CockroachDB, it is sufficient to monitor the SQL Connections, SQL Byte Traffic, SQL Queries, Service Latency, and Transactions graphs.{{site.data.alerts.end}}