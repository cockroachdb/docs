---
title: Use the CockroachDB Admin UI
summary: Learn how to access and navigate the Admin UI.
toc: true
---

The built-in Admin UI helps you monitor and troubleshoot CockroachDB by providing information about the cluster's health, configuration, and operations.

## Access the Admin UI

For insecure clusters, anyone can access and view the Admin UI. For secure clusters, only authorized users can [access and view the Admin UI](#accessing-the-admin-ui-for-a-secure-cluster). In addition, certain areas of the Admin UI can only be [accessed by `admin` users](admin-ui-overview.html#admin-ui-access).

You can access the Admin UI from any node in the cluster.

The Admin UI is reachable at the IP address/hostname and port set via the `--http-addr` flag when [starting each node](cockroach-start.html), for example, `http://<address from --http-addr>:<port from --http-addr>` for an insecure cluster or `https://<address from --http-addr>:<port from --http-addr>` for a secure cluster.

If `--http-addr` is not specified when starting a node, the Admin UI is reachable at the IP address/hostname set via the `--listen-addr` flag and port `8080`.

For additional guidance on accessing the Admin UI in the context of cluster deployment, see [Start a Local Cluster](start-a-local-cluster.html) and [Manual Deployment](manual-deployment.html).

### Accessing the Admin UI for a secure cluster

Note that on secure clusters, certain areas of the Admin UI can only be accessed by `admin` users. For details on providing access to users, see [this page](admin-ui-overview.html#admin-ui-access).

On [accessing the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui), your browser will consider the CockroachDB-created certificate invalid, so you’ll need to click through a warning message to get to the UI. For secure clusters, you can avoid getting the warning message by using a certificate issued by a public CA. For more information, refer to [Use a UI certificate and key to access the Admin UI](create-security-certificates-custom-ca.html#accessing-the-admin-ui-for-a-secure-cluster).

For each user who should have access to the Admin UI for a secure cluster, [create a user with a password](create-user.html). On accessing the Admin UI, the users will see a Login screen, where they will need to enter their usernames and passwords.

{{site.data.alerts.callout_info}}
This login information is stored in a system table that is replicated like other data in the cluster. If a majority of the nodes with the replicas of the system table data go down, users will be locked out of the Admin UI.
{{site.data.alerts.end}}

To log out of the Admin UI, click the **Log Out** link at the bottom of the left-hand navigation bar.

## Navigate the Admin UI

The left-hand navigation bar allows you to navigate to the [Cluster Overview page](admin-ui-access-and-navigate.html), [cluster metrics dashboards](admin-ui-overview.html), the [Databases page](admin-ui-databases-page.html), the [Statements page](admin-ui-statements-page.html), the [Jobs page](admin-ui-jobs-page.html), and the [Advanced Debugging page](admin-ui-debug-pages.html).

The main panel display changes for each page:

Page | Main Panel Component
-----------|------------
Cluster Overview | <ul><li>[Cluster Overview panel](admin-ui-cluster-overview-page.html)</li><li>[Node List](admin-ui-cluster-overview-page.html#node-list) </li> <li>[Enterprise users](enterprise-licensing.html) can enable and switch to the [Node Map](admin-ui-cluster-overview-page.html#node-map-enterprise) view. </li></ul>
Cluster Metrics | <ul><li>[Time Series graphs](admin-ui-access-and-navigate.html#cluster-metrics)</li><li>[Summary Panel](admin-ui-access-and-navigate.html#summary-panel)</li><li>[Events List](admin-ui-access-and-navigate.html#events-panel)</li></ul>
Databases | Information about the tables and grants in your [databases](admin-ui-databases-page.html).
Statements | Information about the SQL [statements](admin-ui-statements-page.html) running in the cluster.
Jobs | Information about all currently active schema changes and backup/restore [jobs](admin-ui-jobs-page.html).
Advanced Debugging | Advanced monitoring and troubleshooting [reports](admin-ui-debug-pages.html). These pages are experimental. If you find an issue, let us know through [these channels](https://www.cockroachlabs.com/community/).

### Cluster Metrics

The **Cluster Metrics** dashboards display the time series graphs that are useful to visualize and monitor data trends. To access the time series graphs, click **Metrics** on the left.

You can hover over each graph to see actual point-in-time values.

<img src="{{ 'images/v19.2/admin_ui_hovering.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}
By default, CockroachDB stores time series metrics for the last 30 days, but you can reduce the interval for timeseries storage. Alternatively, if you are exclusively using a third-party tool such as [Prometheus](monitor-cockroachdb-with-prometheus.html) for time series monitoring, you can disable time series storage entirely. For more details, see this [FAQ](operational-faqs.html#can-i-reduce-or-disable-the-storage-of-timeseries-data).
{{site.data.alerts.end}}

#### Change time range

You can change the time range by clicking on the time window.
<img src="{{ 'images/v19.2/admin-ui-time-range.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}The Admin UI shows time in UTC, even if you set a different time zone for your cluster. {{site.data.alerts.end}}

#### View metrics for a single node

By default, the time series panel displays the metrics for the entire cluster. To view the metrics for an individual node, select the node from the **Graph** drop-down list.
<img src="{{ 'images/v19.2/admin-ui-single-node.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

### Summary panel

The **Cluster Metrics** dashboards display the **Summary** panel of key metrics. To view the **Summary** panel, click **Metrics** on the left.

<img src="{{ 'images/v19.2/admin_ui_summary_panel.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:40%" />

The **Summary** panel provides the following metrics:

Metric | Description
--------|----
Total Nodes | The total number of nodes in the cluster. <a href='admin-ui-cluster-overview-page.html#decommissioned-nodes'>Decommissioned nodes</a> are not included in the Total Nodes count. <br><br>You can further drill down into the nodes details by clicking on [**View nodes list**](admin-ui-cluster-overview-page.html#node-list).
Dead Nodes | The number of [dead nodes](admin-ui-cluster-overview-page.html#dead-nodes) in the cluster.
Capacity Used | The storage capacity used as a percentage of total storage capacity allocated across all nodes.
Unavailable Ranges | The number of unavailable ranges in the cluster. A non-zero number indicates an unstable cluster.
Queries per second | The total number of `SELECT`, `UPDATE`, `INSERT`, and `DELETE` queries executed per second across the cluster.
P50 Latency | The 50th percentile of service latency. Service latency is calculated as the time between when the cluster receives a query and finishes executing the query. This time does not include returning results to the client.
P99 Latency | The 99th percentile of service latency.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/misc/available-capacity-metric.md %}
{{site.data.alerts.end}}

### Events panel

The **Cluster Metrics** dashboards display the **Events** panel that lists the 10 most recent events logged for the all nodes across the cluster. To view the **Events** panel, click **Metrics** on the left-hand navigation bar. To see the list of all events, click **View all events** in the **Events** panel.

<img src="{{ 'images/v19.2/admin_ui_events.png' | relative_url }}" alt="CockroachDB Admin UI Events" style="border:1px solid #eee;max-width:100%" />

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
