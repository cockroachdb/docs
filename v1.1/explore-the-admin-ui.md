---
title: Overview
toc: false
feedback: false
---

CockroachDB's Admin UI provides details about your cluster and database configuration. It helps you optimize cluster performance by monitoring: 


- [Cluster Overview](admin_ui_cluster_overview.html)
- [Runtime metrics](admin_ui_runtime_dashboard.html) 
- [SQL metrics](admin_ui_sql_dashboard.html)
- [Storage metrics](admin_ui_storage_dashboard.html)
- [Replication metrics](admin_ui_replication_dashboard.html)
- [Nodes](explore-the-admin-ui.html#summary-panel)
- [Events](explore-the-admin-ui.html#events-list)
- [Database configuration](admin_ui_databases_page.html)
- [Jobs](admin_ui_jobs_page.html)

<div id="toc"></div>

## Access the Admin UI

You can access the Admin UI from any node in the cluster, each of which will show nearly identical data.

By default, you can access it via HTTP on port `8080` of whatever value you used for the node's `--host` value. For example, `http://<any node host>:8080`. If you are running a secure cluster, use `https://<any node host>:8080`.

However, you can also set the CockroachDB Admin UI to a custom port using `--http-port` or a custom hostname using `--http-host` when [starting each node](start-a-node.html) (i.e., each node's values are dependent on how it's started; there is no cluster-level configuration for non-default values). For example, if you set both a custom port and hostname, `http://<http-host value>:<http-port value>`. For a secure cluster, `https://<http-host value>:<http-port value>`.

For additional guidance on accessing the Admin UI, see [Start a Local Cluster](start-a-local-cluster.html) and [Manual Deployment](manual-deployment.html).

{{site.data.alerts.callout_info}}By default, the Admin UI shares anonymous usage details with Cockroach Labs. For an explanation of the details that get shared and how to opt-out of reporting, see <a href="diagnostics-reporting.html">Diagnostics Reporting</a>{{site.data.alerts.end}}

## Navigate the Admin UI

The Admin UI is divided into three areas:

- The left-hand navigation bar that lets you view the [Cluster details](explore-the-admin-ui.html#cluster-overview), [Database details](explore-the-admin-ui.html#databases-overview), or [Jobs details](admin_ui_jobs_page.html).
- The main page which consists of the [Time series graphs](explore-the-admin-ui.html#time-series-graphs).
- The right-hand side panel which shows the [Summary panel](explore-the-admin-ui.html#summary-panel) and [Events list](explore-the-admin-ui.html#events-list).

<img src="{{ 'images/admin_ui_overview.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

### Time Series Graphs

The Admin UI displays time-series graphs of key metrics. Time series graphs are useful to visualize and monitor data trends. You can hover over each graph to see actual point-in-time values. 

<img src="{{ 'images/admin_ui_hovering.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

#### Change time range

You can change the time range by clicking on the time window.
<img src="{{ 'images/admin_ui_time_range.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}The Admin UI shows UTC time, even if you set a different time zone for your cluster. {{site.data.alerts.end}}

#### View metrics for a single node

By default, the time series panel displays the metrics for the entire cluster. To view the metrics for an individual node, select the node from the **Graph** drop-down list.
<img src="{{ 'images/admin_ui_single_node.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

### Summary Panel
<img src="{{ 'images/admin_ui_summary_panel.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:40%" />

The Summary panel provides information about:

Metric | Description
--------|----
Total Nodes | Total number of nodes in the cluster.<br><br>You can further drill down into the nodes details by clicking on **View nodes list**.
Dead Nodes | The number of dead nodes in the cluster.  
Capacity Used | Storage capacity used as a percentage of total storage capacity allocated across all nodes.<br><br> Same note as available capacity.
Unavailable Ranges | Number of unavailable ranges in the cluster. A non-zero number indicates an unstable cluster. 50% or more replicas are missing. 
Queries per second | Number of SQL queries executed per second. 
P50 Latency | 50th percentile of service latency. 
P99 Latency | 99th percentile of service latency. 

{{site.data.alerts.callout_info}}<a href='explore-the-admin-ui.html#decommissioned-nodes'>Decommissioned nodes</a> are not included in the Total Nodes count.{{site.data.alerts.end}}

To see details of nodes in your cluster, click **View nodes list** on the Summary panel. The following page is displayed:
<img src="{{ 'images/admin_ui_nodes_page.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

#### Live Nodes
Live nodes are nodes that are online and responding. They are indicated with a green dot next to them. If a node is removed, after about 1 minute, the dot next to the removed node will turn yellow, indicating that the node is not responding. By default, after 5 minutes, the removed node is moved to the Dead Nodes section, indicating that the node is not expected to come back. 

You can click on any of the nodes to view details about the node.

You can click **Logs** to see the logs for that node.

#### Dead Nodes
The Dead Nodes table lists the dead nodes in the cluster. A node is considered to be dead if it does not respond for 5 minutes. At this point, the automated repair starts, wherein CockroachDB automatically rebalances replicas from the dead node, using the unaffected replicas as sources. See [Fault Tolerance and Recovery](demo-fault-tolerance-and-recovery.html) for more information.

#### Decommissioned Nodes
The Decommissioned Nodes table lists the decommissioned nodes in the cluster. 

<img src="{{ 'images/cluster-status-after-decommission2.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

When you decommission a node, CockroachDB lets the node finish in-flight requests, rejects any new requests, and transfers all range replicas and range leases off the node so that it can be safely shut down. See [Remove Nodes](remove-nodes.html) for more information.

The total nodes count on the Summary panel does not include the decommissioned nodes.

### Events List
<img src="{{ 'images/admin_ui_events.png' | relative_url }}" alt="CockroachDB Admin UI Events" style="border:1px solid #eee;max-width:100%" />

The Events panel displays the 10 most recent events logged for the all nodes across the cluster.
To see the list of all events, click **View all events** on the Events panel. The following types of events are listed:

- Database created
- Database dropped
- Table created
- Table dropped
- Table altered
- Index created
- Index dropped
- View created
- View dropped
- Schema change reversed
- Schema change finished
- Node joined
- Node decommissioned
- Node restarted
- Cluster setting changed 
