---
title: Overview Dashboard
toc: false
---

On [accessing the CockroachDB Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui), the first dashboard you see by default is the **Overview** dashboard. The CockroachDB Admin UI lets you monitor metrics such as SQL Queries, Service Latency, Replicas per Node, and Capacity of your cluster.  

<div id="toc"></div>

#### Cluster and Node View for the Time Series Graphs
By default, the Time Series panel displays the cluster view, which shows the metrics for the entire cluster. 

To access the node view that shows the metrics for an individual node, select the node from the **Graph** drop-down list.

<img src="{{ 'images/admin_ui_select_node.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:40%"/>

The **Overview** dashboard displays the following time series graphs:

## SQL Queries
<img src="{{ 'images/admin_ui_sql_queries.png' | relative_url }}" alt="CockroachDB Admin UI SQL Queries graph" style="border:1px solid #eee;max-width:100%" />

In the node view, the SQL Queries metric depicts the current moving average, over the last 10 seconds, of the number of `SELECT`/`INSERT`/`UPDATE`/`DELETE` queries per second issued by SQL clients on the node. 

In the cluster view, the graph shows the sum of the per-node averages; that is, an aggregate estimation of the current query load over the cluster, assuming the last 10 seconds of activity per node are representative of this load.

## Service Latency: SQL, 99th percentile
<img src="{{ 'images/admin_ui_service_latency_99_percentile.png' | relative_url }}" alt="CockroachDB Admin UI Service Latency graph" style="border:1px solid #eee;max-width:100%" />

Service latency is calculated as the time between when the cluster receives a query and finishes executing the query. This time does not include returning results to the client. 

In the node view, the graph displays the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency for the node. 

In the cluster view, the graph displays the 99th [percentile](https://en.wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of service latency across all nodes in the cluster. 

## Replicas per Node
<img src="{{ 'images/admin_ui_replicas_per_node.png' | relative_url }}" alt="CockroachDB Admin UI Replicas per node graph" style="border:1px solid #eee;max-width:100%" />

Ranges are subsets of your data, which are replicated to ensure survivability. Ranges are replicated to a configurable number of CockroachDB nodes. 

In the node view, the graph displays the number of range replicas on the selected node.

In the cluster view, the graph displays the number of range replicas on each node in the cluster. 

You can [configure replication zones](configure-replication-zones.html) to set the number and location of replicas. You can monitor the changes in configuration using the Admin UI, as described in [Fault tolerance and recovery](demo-fault-tolerance-and-recovery.html).

For more information on replicas, see [Replication](high-availability.html#replication), or read the [CockroachDB design document](https://github.com/cockroachdb/cockroach/blob/master/docs/design.md#architecture).

## Capacity
<img src="{{ 'images/admin_ui_capacity.png' | relative_url }}" alt="CockroachDB Admin UI Capacity graph" style="border:1px solid #eee;max-width:100%" />

In the node view, the graph displays the maximum allocated capacity, available storage capacity, and capacity used by CockroachDB for the selected node.

In the cluster view, the graph displays the maximum allocated capacity, available storage capacity, and capacity used by CockroachDB across all nodes in the cluster.

You can monitor this graph to determine when additional storage needs to be provided. 

On hovering over the graph, the values for the following metrics are displayed:

Metric | Description
--------|----
Capacity | The maximum storage capacity allocated to CockroachDB.
Available | The free storage capacity available to CockroachDB.
Used | Disk space used by the data in the CockroachDB store. Note that this value is less than (Capacity - Available), because Capacity and Available metrics consider the entire disk and all applications on the disk including CockroachDB, whereas Used metric tracks only the store's disk usage.

{{site.data.alerts.callout_info}}If you are running multiple nodes on a single machine (not recommended), and haven't specified the maximum allocated storage capacity for each node using the --store flag, then the available capacity displayed in the graph is incorrect. This is because when multiple nodes are running on a single machine, the machine's hard disk is treated as available store for each node, while in reality, only one hard disk is available for all nodes. The total available capacity is then displayed as the hard disk size multiplied by the number of nodes on the machine.  {{site.data.alerts.end}}

You can configure the maximum allocated storage capacity for CockroachDB using the --store flag. For more information, see [Start a Node](start-a-node.html#store).
