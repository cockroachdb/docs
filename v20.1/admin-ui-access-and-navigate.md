---
title: Use the CockroachDB Admin UI
summary: Learn how to access and navigate the Admin UI.
toc: true
---

Use the [Admin UI](admin-ui-overview.html) to monitor and troubleshoot CockroachDB by viewing the cluster's health, configuration, and operations.

## Access the Admin UI

For insecure clusters, anyone can access the Admin UI. For secure clusters, only authorized users can [access the Admin UI](#accessing-the-admin-ui-for-a-secure-cluster). In addition, certain areas of the Admin UI can only be [accessed by `admin` users](admin-ui-overview.html#admin-ui-access).

You can access the Admin UI from any node in the cluster.

The Admin UI is reachable at the IP address/hostname and port set via the `--http-addr` flag when [starting each node](cockroach-start.html). For example, `http://<address from --http-addr>:<port from --http-addr>` for an insecure cluster or `https://<address from --http-addr>:<port from --http-addr>` for a secure cluster.

If `--http-addr` is not specified when starting a node, the Admin UI is reachable at the IP address/hostname set via the `--listen-addr` flag and port `8080`.

For additional guidance on accessing the Admin UI in the context of cluster deployment, see [Start a Local Cluster](start-a-local-cluster.html) and [Manual Deployment](manual-deployment.html).

### Accessing the Admin UI for a secure cluster

On accessing the Admin UI, your browser will consider the CockroachDB-created certificate invalid, so you’ll need to click through a warning message to get to the UI. For secure clusters, you can avoid getting the warning message by using a certificate issued by a public CA. For more information, refer to [Use a UI certificate and key to access the Admin UI](create-security-certificates-custom-ca.html#accessing-the-admin-ui-for-a-secure-cluster).

For each user who should have access to the Admin UI for a secure cluster, [create a SQL user with a password](create-user.html). On accessing the Admin UI, the users will see a Login screen, where they will need to enter their usernames and passwords.

{{site.data.alerts.callout_info}}
This login information is stored in a system table that is replicated like other data in the cluster. If a majority of the nodes with the replicas of the system table data go down, users will be locked out of the Admin UI.
{{site.data.alerts.end}}

To log out of the Admin UI, click the user icon at the top-right corner and then **Logout**.

## Use the Admin UI

{{site.data.alerts.callout_success}}
See [Admin UI Overview](admin-ui-overview.html#admin-ui-areas) for a full list of Admin UI areas.
{{site.data.alerts.end}}

### Metrics

The Metrics dashboards display timeseries graphs that visualize data and enable you to monitor trends. To access the timeseries graphs, click **Metrics** on the left.

You can hover over each graph to see actual point-in-time values.

<img src="{{ 'images/v20.1/admin_ui_hovering.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}
By default, CockroachDB stores timeseries metrics for the last 30 days, but you can reduce the interval for timeseries storage. Alternatively, if you are exclusively using a third-party tool such as [Prometheus](monitor-cockroachdb-with-prometheus.html) for timeseries monitoring, you can disable timeseries storage entirely. For more details, see this [FAQ](operational-faqs.html#can-i-reduce-or-disable-the-storage-of-timeseries-data).
{{site.data.alerts.end}}

#### Change time range

You can change the time range by clicking on the time window.
<img src="{{ 'images/v20.1/admin-ui-time-range.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}
The Admin UI shows time in UTC, even if you set a different time zone for your cluster.
{{site.data.alerts.end}}

#### View metrics for a single node

By default, the Admin UI displays the metrics for the entire cluster. To view the metrics for an individual node, select the node from the **Graph** dropdown.

<img src="{{ 'images/v20.1/admin-ui-single-node.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

### Summary panel

A **Summary** panel of key metrics is displayed to the right of the timeseries graphs.

<img src="{{ 'images/v20.1/admin_ui_summary_panel.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:40%" />

The **Summary** panel provides the following metrics:

Metric | Description
--------|----
Total Nodes | The total number of nodes in the cluster. <a href='admin-ui-cluster-overview-page.html#decommissioned-nodes'>Decommissioned nodes</a> are not included in the Total Nodes count. <br><br>You can further drill down into the nodes details by clicking on [**View nodes list**](admin-ui-cluster-overview-page.html#node-list).
Capacity Used | The storage capacity used as a percentage of [usable capacity](admin-ui-cluster-overview-page.html#capacity-metrics) allocated across all nodes.
Unavailable Ranges | The number of unavailable ranges in the cluster. A non-zero number indicates an unstable cluster.
Queries per second | The total number of `SELECT`, `UPDATE`, `INSERT`, and `DELETE` queries executed per second across the cluster.
P50 Latency | The 50th percentile of service latency. Service latency is calculated as the time between when the cluster receives a query and finishes executing the query. This time does not include returning results to the client.
P99 Latency | The 99th percentile of service latency.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/misc/available-capacity-metric.md %}
{{site.data.alerts.end}}

### Events panel

Underneath the [Summary panel](#summary-panel), the **Events** panel lists the 5 most recent events logged for all nodes across the cluster. To list all events, click **View all events**.

<img src="{{ 'images/v20.1/admin_ui_events.png' | relative_url }}" alt="CockroachDB Admin UI Events" style="border:1px solid #eee;max-width:40%" />

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

### Statements page

Click **Statements** on the left to open the [Statements page](admin-ui-statements-page.html). This page helps you identify frequently executed or high latency [SQL statements](sql-statements.html), view SQL statement details, and download SQL statement diagnostics for troubleshooting.

### Network Latency page

Click **Network Latency** on the left to open the [Network Latency page](admin-ui-network-latency-page.html). This page displays round-trip latencies between all nodes in your cluster. Latency is the time required to transmit a packet across a network, and is highly dependent on your network topology. Use this page to determine whether your latency is appropriate for your [topology pattern](topology-patterns.html), or to identify nodes with unexpected latencies.

<img src="{{ 'images/v20.1/admin_ui_network_latency_matrix.png' | relative_url }}" alt="CockroachDB Admin UI Network Latency matrix" style="border:1px solid #eee;max-width:100%" />

## See also

- [Admin UI Overview](admin-ui-overview.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)