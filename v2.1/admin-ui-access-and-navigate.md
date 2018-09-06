---
title: Use the CockroachDB Admin UI
summary: Learn how to access and navigate the Admin UI.
toc: true
---

The built-in Admin UI gives you essential metrics about a cluster's health, such as the number of live, dead, and suspect nodes, the number of unavailable ranges, and the queries per second and service latency across the cluster.


## Access the Admin UI

For insecure clusters, anyone can access and view the Admin UI. For secure clusters, only authorized users can [access and view the Admin UI](#accessing-the-admin-ui-for-a-secure-cluster).

You can access the Admin UI from any node in the cluster.

By default, you can access it via HTTP on port `8080` of the hostname or IP address you configured using the `--host` flag while [starting the node](https://www.cockroachlabs.com/docs/stable/start-a-node.html#general). For example, `http://<any node host>:8080`. If you are running a secure cluster, use `https://<any node host>:8080`.

You can also set the CockroachDB Admin UI to a custom port using `--http-port` or a custom hostname using `--http-host` when [starting each node](start-a-node.html). For example, if you set both a custom port and hostname, `http://<http-host value>:<http-port value>`. For a secure cluster, `https://<http-host value>:<http-port value>`.

For additional guidance on accessing the Admin UI in the context of cluster deployment, see [Start a Local Cluster](start-a-local-cluster.html) and [Manual Deployment](manual-deployment.html).

### Accessing the Admin UI for a secure cluster

For each user who should have access to the Admin UI for a secure cluster, [create a user with a password](create-user.html). On accessing the Admin UI, these users will see a Login screen, where they will need to enter their usernames and passwords.

To log out of the Admin UI, click the **Sign Out** link at the bottom of the left-hand navigation bar.

## Navigate the Admin UI

The left-hand navigation bar allows you to navigate to the [Cluster Overview page](admin-ui-access-and-navigate.html), [cluster metrics dashboards](admin-ui-overview.html), [Databases page](admin-ui-databases-page.html), and [Jobs page](admin-ui-jobs-page.html).

The main panel displays changes for each page:

Page | Main Panel Component
-----------|------------
Cluster Overview | <ul><li>[Cluster Overview panel](admin-ui-cluster-overview-page.html)</li><li>[Node List](admin-ui-cluster-overview-page.html#node-list) </li> <li>[Enterprise users](enterprise-licensing.html) can enable and switch to the [Node Map](admin-ui-cluster-overview-page.html#node-map-enterprise) view. </li></ul>
Cluster Metrics | <ul><li>[Time Series graphs](admin-ui-access-and-navigate.html#cluster-metrics)</li><li>[Summary Panel](admin-ui-access-and-navigate.html#summary-panel)</li><li>[Events List](admin-ui-access-and-navigate.html#events-panel)</li></ul>
Databases | Information about the tables and grants in your [databases](admin-ui-databases-page.html).
Statements | Information about the SQL [statements](admin-ui-statements-page.html) running in the cluster.
Jobs | Information about all currently active schema changes and backup/restore [jobs](admin-ui-jobs-page.html).

### Cluster Metrics

The **Cluster Metrics** dashboards display the time series graphs that are useful to visualize and monitor data trends. To access the time series graphs, click **Metrics** on the left-hand navigation bar.

You can hover over each graph to see actual point-in-time values.

<img src="{{ 'images/v2.1/admin_ui_hovering.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}
By default, CockroachDB stores timeseries metrics for the last 30 days, but you can reduce the interval for timeseries storage. Alternately, if you are exclusively using a third-party tool such as [Prometheus](monitor-cockroachdb-with-prometheus.html) for timeseries monitoring, you can disable timeseries storage entirely. For more details, see this [FAQ](operational-faqs.html#can-i-reduce-or-disable-the-storage-of-timeseries-data).
{{site.data.alerts.end}}

#### Change time range

You can change the time range by clicking on the time window.
<img src="{{ 'images/v2.1/admin-ui-time-range.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}The Admin UI shows time in UTC, even if you set a different time zone for your cluster. {{site.data.alerts.end}}

#### View metrics for a single node

By default, the time series panel displays the metrics for the entire cluster. To view the metrics for an individual node, select the node from the **Graph** drop-down list.
<img src="{{ 'images/v2.1/admin-ui-single-node.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

### Summary panel

The **Cluster Metrics** dashboards display the **Summary** panel of key metrics. To view the **Summary** panel, click **Metrics** on the left-hand navigation bar.

<img src="{{ 'images/v2.1/admin_ui_summary_panel.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:40%" />

The **Summary** panel provides the following metrics:

Metric | Description
--------|----
Total Nodes | The total number of nodes in the cluster. <a href='admin-ui-cluster-overview-page.html#decommissioned-nodes'>Decommissioned nodes</a> are not included in the Total Nodes count. <br><br>You can further drill down into the nodes details by clicking on [**View nodes list**](admin-ui-cluster-overview-page.html#node-list).
Dead Nodes | The number of [dead nodes](admin-ui-cluster-overview-page.html#dead-nodes) in the cluster.
Capacity Used | The storage capacity used as a percentage of total storage capacity allocated across all nodes.
Unavailable Ranges | The number of unavailable ranges in the cluster. A non-zero number indicates an unstable cluster.
Queries per second | The number of SQL queries executed per second.
P50 Latency | The 50th percentile of service latency. Service latency is calculated as the time between when the cluster receives a query and finishes executing the query. This time does not include returning results to the client.
P99 Latency | The 99th percentile of service latency.

{{site.data.alerts.callout_info}}
{% include v2.1/misc/available-capacity-metric.md %}
{{site.data.alerts.end}}

### Events panel

The **Cluster Metrics** dashboards display the **Events** panel that lists the 10 most recent events logged for the all nodes across the cluster. To view the **Events** panel, click **Metrics** on the left-hand navigation bar. To see the list of all events, click **View all events** in the **Events** panel.

<img src="{{ 'images/v2.1/admin_ui_events.png' | relative_url }}" alt="CockroachDB Admin UI Events" style="border:1px solid #eee;max-width:100%" />

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

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
