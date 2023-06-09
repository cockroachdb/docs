---
title: Access and Navigate the CockroachDB Admin UI
summary: Learn how to access and navigate the Admin UI.
toc: true
---


## Access the Admin UI

You can access the Admin UI from any node in the cluster.

By default, you can access it via HTTP on port `8080` of the hostname or IP address you configured using the `--host` flag while [starting the node](start-a-node.html#general). For example, `http://<any node host>:8080`. If you are running a secure cluster, use `https://<any node host>:8080`.

You can also set the CockroachDB Admin UI to a custom port using `--http-port` or a custom hostname using `--http-host` when [starting each node](start-a-node.html). For example, if you set both a custom port and hostname, `http://<http-host value>:<http-port value>`. For a secure cluster, `https://<http-host value>:<http-port value>`.

For additional guidance on accessing the Admin UI in the context of cluster deployment, see [Start a Local Cluster](start-a-local-cluster.html) and [Manual Deployment](manual-deployment.html).

## Navigate the Admin UI

The Admin UI is divided into three areas:

- The left-hand navigation bar that allows you to navigate to the **[Cluster Metrics dashboards](admin-ui-overview.html)**, **[Database page](admin-ui-databases-page.html)**, and **[Jobs page](admin-ui-jobs-page.html)**.
- The main panel that shows the **[Time Series graphs](admin-ui-access-and-navigate.html#time-series-graphs)**.
- The right-hand side panel that shows the **[Summary panel](admin-ui-access-and-navigate.html#summary-panel)** and **[Events panel](admin-ui-access-and-navigate.html#events-panel)**.

<img src="{{ 'images/v1.1/admin_ui_overview.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

### Time Series Graphs

The Admin UI displays time series graphs of key metrics. Time series graphs are useful to visualize and monitor data trends. You can hover over each graph to see actual point-in-time values.

<img src="{{ 'images/v1.1/admin_ui_hovering.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

#### Change time range

You can change the time range by clicking on the time window.
<img src="{{ 'images/v1.1/admin_ui_time_range.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}The Admin UI shows time in UTC, even if you set a different time zone for your cluster. {{site.data.alerts.end}}

#### View metrics for a single node

By default, the time series panel displays the metrics for the entire cluster. To view the metrics for an individual node, select the node from the **Graph** drop-down list.
<img src="{{ 'images/v1.1/admin_ui_single_node.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

### Summary Panel
<img src="{{ 'images/v1.1/admin_ui_summary_panel.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:40%" />

The **Summary** panel provides the following metrics:

Metric | Description
--------|----
Total Nodes | The total number of nodes in the cluster. <a href='admin-ui-access-and-navigate.html#decommissioned-nodes'>Decommissioned nodes</a> are not included in the Total Nodes count. <br><br>You can further drill down into the nodes details by clicking on [**View nodes list**](#nodes-list).
Dead Nodes | The number of [dead nodes](admin-ui-access-and-navigate.html#dead-nodes) in the cluster.
Capacity Used | The storage capacity used as a percentage of total storage capacity allocated across all nodes.
Unavailable Ranges | The number of unavailable ranges in the cluster. A non-zero number indicates an unstable cluster.
Queries per second | The number of SQL queries executed per second.
P50 Latency | The 50th percentile of service latency. Service latency is calculated as the time between when the cluster receives a query and finishes executing the query. This time does not include returning results to the client.
P99 Latency | The 99th percentile of service latency.

{{site.data.alerts.callout_info}}
{% include v1.1/misc/available-capacity-metric.md %}
{{site.data.alerts.end}}

### Nodes List

To see basic details about the nodes in your cluster, click **View nodes list** in the **Summary** panel.
<img src="{{ 'images/v1.1/admin_ui_nodes_page.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

#### Live Nodes
Live nodes are nodes that are online and responding. They are marked with a green dot. If a node is removed or dies, the dot turns yellow to indicate that it is not responding. If the node remains unresponsive for a certain amount of time (5 minutes by default), the node turns red and is moved to the [**Dead Nodes**](#dead-nodes) section, indicating that it is no longer expected to come back.

The following details are shown for each live node:

Column | Description
-------|------------
ID | The ID of the node.
Address | The address of the node. You can click on the address to view further details about the node.
Uptime | How long the node has been running.
Bytes | The used capacity for the node.
Replicas | The number of replicas on the node.
Mem Usage | The memory usage for the node.
Version | The build tag of the CockroachDB version installed on the node.
Logs | Click **Logs** to see the logs for the node.

#### Dead Nodes

Nodes are considered dead once they have not responded for a certain amount of time (5 minutes by default). At this point, the automated repair process starts, wherein CockroachDB automatically rebalances replicas from the dead node, using the unaffected replicas as sources. See [Stop a Node](stop-a-node.html#how-it-works) for more information.

The following details are shown for each dead node:

Column | Description
-------|------------
ID | The ID of the node.
Address | The address of the node. You can click on the address to view further details about the node.
Down Since | How long the node has been down.

#### Decommissioned Nodes

<span class="version-tag">New in v1.1:</span> Nodes that have been decommissioned for permanent removal from the cluster are listed in the **Decommissioned Nodes** table.

<img src="{{ 'images/v1.1/cluster-status-after-decommission2.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

When you decommission a node, CockroachDB lets the node finish in-flight requests, rejects any new requests, and transfers all range replicas and range leases off the node so that it can be safely shut down. See [Remove Nodes](remove-nodes.html) for more information.

### Events Panel

<img src="{{ 'images/v1.1/admin_ui_events.png' | relative_url }}" alt="CockroachDB Admin UI Events" style="border:1px solid #eee;max-width:100%" />

The **Events** panel lists the 10 most recent events logged for the all nodes across the cluster. To see the list of all events, click **View all events**.

The following types of events are listed:

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
