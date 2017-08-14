---
title: Overview
toc: false
feedback: false
---

CockroachDB's Admin UI provides details about your cluster and database configuration. It helps you optimize cluster performance by monitoring: 


- [Runtime metrics](http://https://www.cockroachlabs.com/docs/dev/admin_ui_runtime_dashboard.html) 
- [SQL metrics](http://https://www.cockroachlabs.com/docs/dev/admin_ui_sql_dashboard.html)
- [Storage metrics](http://https://www.cockroachlabs.com/docs/dev/admin_ui_storage_dashboard.html)
- [Replication metrics](http://https://www.cockroachlabs.com/docs/dev/admin_ui_replication_dashboard.html)
- [Nodes]()
- [Events]()
- [Database configuration]()
- [Jobs]()

<div id="toc"></div>

## Access the Admin UI

You can access the UI from any node in the cluster, each of which will show nearly identical data.

By default, you can access it via HTTP on port `8080` of whatever value you used for the node's `--host` value. For example, `http://<any node host>:8080`.

However, you can also set the CockroachDB Admin UI to a custom port using `--http-port` or a custom hostname using `--http-host` when [starting each node](start-a-node.html) (i.e., each node's values are dependent on how it's started; there is no cluster-level configuration for non-default values). For example, if you set both a custom port and hostname, `http://<http-host value>:<http-port value>`.

For additional guidance on accessing the Admin UI, see [Start a Local Cluster](start-a-local-cluster.html) and [Manual Deployment](manual-deployment.html).

On accessing the Admin UI, you can view the [Cluster details](http://https://www.cockroachlabs.com/docs/dev/explore-the-admin-ui.html#cluster-overview), [Database details](https://www.cockroachlabs.com/docs/dev/explore-the-admin-ui.html#databases-overview), or [Jobs details]().

## Cluster Overview

Cluster Overview is the first page you see when you access the Admin UI. 

The page consists of three panels:

- 	[Time series graphs](https://www.cockroachlabs.com/docs/dev/explore-the-admin-ui.html#time-series-graphs)
- 	[Summary panel](https://www.cockroachlabs.com/docs/dev/explore-the-admin-ui.html#summary-panel)
- 	[Events list](https://www.cockroachlabs.com/docs/dev/explore-the-admin-ui.html#events-list)

<img src="{{ 'images/admin_ui.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

### Time Series Graphs

The Admin UI displays time-series graphs of key metrics. Time series graphs are useful to visualize and monitor data trends. You can hover over each graph to see actual point-in-time values. 

You can also change the time range by clicking the left and right arrows on the time window.
<img src="{{ 'images/admin_ui_change_time.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:40%" />

By default, the time series panel displays the metrics for the entire cluster. To view the metrics for an individual node, select the node from the **Graph** drop-down list.
<img src="{{ 'images/admin_ui_select_node.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:40%" />

{{site.data.alerts.callout_info}}The Admin UI shows UTC time, even if you set a different time zone for your cluster. {{site.data.alerts.end}}

The time series panel displays the graphs for the following key metrics:

#### SQL Queries
<img src="{{ 'images/admin_ui_sql_queries.png' | relative_url }}" alt="CockroachDB Admin UI SQL Queries graph" style="border:1px solid #eee;max-width:100%" />
The graph displays the average number of SELECT, INSERT, UPDATE, and DELETE statements per second across all nodes in the cluster.

#### Service Latency: SQL, 99th percentile
<img src="{{ 'images/admin_ui_service_latency_99_percentile.png' | relative_url }}" alt="CockroachDB Admin UI Service Latency graph" style="border:1px solid #eee;max-width:100%" />
The graph displays the time required for each node to execute 99% of the queries over the last minute. The service latency is calculated as the time between receiving a query and returning a response. This time does not include network latency between the node and client.  

The 99th percentile graph shows the query execution time for the slowest (that is, longest-running) queries. 

#### Replicas per Node
<img src="{{ 'images/admin_ui_replicas_per_node.png' | relative_url }}" alt="CockroachDB Admin UI Replicas per Node graph" style="border:1px solid #eee;max-width:100%" />
The graph displays the number of range replicas on each node. 

Ranges are subsets of your data, which are replicated to ensure survivability. Ranges are replicated to a configurable number of additional CockroachDB nodes. 

By default, the cluster-wide replication zone is set to replicate data to any three nodes in your cluster, with ranges in each replica splitting once they get larger than 64 MB. The replicas are balanced evenly across the nodes. You can [Configure replication zones](https://www.cockroachlabs.com/docs/stable/configure-replication-zones.html) to set the number and location of replicas. You can monitor the changes in configuration using the Admin UI, as described in [Fault tolerance and recovery](https://www.cockroachlabs.com/docs/stable/demo-fault-tolerance-and-recovery.html).

For more information on replicas, see [Replication](https://www.cockroachlabs.com/docs/stable/high-availability.html#replication), or read the [CockroachDB design document](https://github.com/cockroachdb/cockroach/blob/master/docs/design.md#architecture).

#### Capacity
<img src="{{ 'images/admin_ui_capacity.png' | relative_url }}" alt="CockroachDB Admin UI Capacity graph" style="border:1px solid #eee;max-width:100%" />
The graph displays the maximum allocated as well as available storage capacity for CockroachDB across all nodes.
You can monitor this graph to determine when additional storage needs to be provided. 

On hovering over the graph, you can see the Capacity and Available values across all nodes:

Metric | Description
--------|----
Capacity | The maximum storage capacity allocated to CockroachDB across all nodes.
Available | The free storage capacity available to CockroachDB across all nodes.
 
You can configure the maximum allocated storage capacity for CockroachDB using the --store flag. For more information, see [Start a Node](https://www.cockroachlabs.com/docs/stable/start-a-node.html#store).
 

In addition to the Overview dashboard, you can also monitor the following dashboards to gain insight into your cluster’s health and performance:


-	[Runtime dashboard](http://https://www.cockroachlabs.com/docs/dev/admin_ui_runtime_dashboard.html)
-	[SQL dashboard](http://https://www.cockroachlabs.com/docs/dev/admin_ui_sql_dashboard.html)
-	[Storage dashboard](http://https://www.cockroachlabs.com/docs/dev/admin_ui_storage_dashboard.html)
-	[Replication dashboard](http://https://www.cockroachlabs.com/docs/dev/admin_ui_replication_dashboard.html)

{{site.data.alerts.callout_info}}The CockroachDB Admin UI has three additional dashboards: Distributed, Queues, and Slow Requests. These dashboards are important for CockroachDB developers. For monitoring CockroachDB, it is sufficient to monitor the Overview, Runtime, SQL, Storage, and Replication dashboards.{{site.data.alerts.end}}

### Summary panel
<img src="{{ 'images/admin_ui_summary_panel.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:100%" />

The Summary panel provides information about:

Metric | Description
--------|----
Total Nodes | Total number of nodes in the cluster.<br><br>You can further drill down into the nodes details by clicking on **View nodes list**.
Dead Nodes | The number of dead nodes in the cluster.
Capacity Used | Storage capacity used as a percentage of total storage capacity allocated across all nodes.<br><br>
Unavailable Ranges | <Any non-zero number is bad. That means cluster is not stable. Go troubleshoot the cluster.>
Queries per second | Number of SQL queries executed per second. 
P50 Latency | 50th percentile of service latency. This is the average query execution time.
P99 Latency | 99th percentile of service latency. This is the query execution time for the slowest (that is, longest-running) queries.

{{site.data.alerts.callout_info}}[Decommissioned nodes]() are not included in the Total Nodes count. Hence if nodes are decommissioned, there appears to be a mismatch between the total nodes and dead nodes.{{site.data.alerts.end}}

To see details of nodes in your cluster, click **View nodes list** on the Summary panel. The following page is displayed:
<img src="{{ 'images/recovery3.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

#### Live Nodes
Live nodes are nodes that are online and responding. They are indicated with a green dot next to them. If a node is removed, after about 1 minute, the dot next to the removed node will turn yellow, indicating that the node is not responding. After about 10 minutes, the removed node is moved to the Dead Nodes section, indicating that the node is not expected to come back. 

#### Decommissioned Nodes
<Link to decommissioned nodes doc>
The total nodes count on the Summary panel does not include the decommissioned nodes. The Summary panel does not include Decommissioned nodes at all.

#### Dead Nodes
The Dead Nodes table shows the dead nodes in the cluster. A node is considered to be dead if it does not respond for 10 minutes and is not expected to come back online. 

You can click on any of the nodes to view details about the node.

You can click on **View Logs** to see the logs for that node.


### Events list
<img src="{{ 'images/admin_ui_events.png' | relative_url }}" alt="CockroachDB Admin UI Events" style="border:1px solid #eee;max-width:100%" />

The Events panel displays the 10 most recent events logged for the all nodes across the cluster.
To see the list of all events, click **View all events** on the Events panel. 
<Insert screenshot>