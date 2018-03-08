---
title: Access and Navigate the Admin UI 
summary: Use the Admin UI to monitor and optimize cluster performance.
toc: false
redirect_from: explore-the-admin-ui.html
key: explore-the-admin-ui.html
---

The CockroachDB Admin UI provides details about your cluster and database configuration, and helps you optimize cluster performance by monitoring the following areas:

Area | Description
--------|----
[Node Map](admin-ui-node-map.html) | View and monitor the metrics and geographical configuration of your cluster.
[Cluster Health](admin-ui-access-and-navigate.html#cluster-overview-panel) | View essential metrics about the cluster's health, such as the number of live, dead, and suspect nodes, the number of unavailable ranges, and the queries per second and service latency across the cluster.
[Overview Metrics](admin-ui-overview-dashboard.html) | View important SQL performance, replication, and storage metrics.
[Runtime Metrics](admin-ui-runtime-dashboard.html) | View metrics about node count, CPU time, and memory usage.
[SQL Performance](admin-ui-sql-dashboard.html) | View metrics about SQL connections, byte traffic, queries, transactions, and service latency.
[Storage Utilization](admin-ui-storage-dashboard.html) | View metrics about storage capacity and file descriptors.
[Replication Details](admin-ui-replication-dashboard.html) | View metrics about how data is replicated across the cluster, such as range status, replicas per store, and replica quiescence.
[Nodes Details](admin-ui-access-and-navigate.html#summary-panel) | View details of live, dead, and decommissioned nodes.
[Events](admin-ui-access-and-navigate.html#events-panel) | View a list of recent cluster events.
[Database Details](admin-ui-databases-page.html) | View details about the system and user databases in the cluster.
[Jobs Details](admin-ui-jobs-page.html) | View details of the jobs running in the cluster.

The Admin UI also provides details about the way data is **Distributed**, the state of specific **Queues**, and metrics for **Slow Queries**, but these details are largely internal and intended for use by CockroachDB developers.

{{site.data.alerts.callout_info}}By default, the Admin UI shares anonymous usage details with Cockroach Labs. For information about the details shared and how to opt-out of reporting, see <a href="diagnostics-reporting.html">Diagnostics Reporting</a>.{{site.data.alerts.end}}

## Access the Admin UI

You can access the Admin UI from any node in the cluster.

By default, you can access it via HTTP on port `8080` of the hostname or IP address you configured using the `--host` flag while [starting the node](https://www.cockroachlabs.com/docs/stable/start-a-node.html#general). For example, `http://<any node host>:8080`. If you are running a secure cluster, use `https://<any node host>:8080`.

You can also set the CockroachDB Admin UI to a custom port using `--http-port` or a custom hostname using `--http-host` when [starting each node](start-a-node.html). For example, if you set both a custom port and hostname, `http://<http-host value>:<http-port value>`. For a secure cluster, `https://<http-host value>:<http-port value>`.

For additional guidance on accessing the Admin UI in the context of cluster deployment, see [Start a Local Cluster](start-a-local-cluster.html) and [Manual Deployment](manual-deployment.html).

## Navigate the Admin UI

The left-hand navigation bar allows you to navigate to the [Cluster Overview page](admin-ui-access-and-navigate.html), [Cluster metrics dashboards](admin-ui-overview.html), [Databases page](admin-ui-databases-page.html), and [Jobs page](admin-ui-jobs-page.html).

The main panel displays changes for each page: 

Page | Main Panel Component
-----------|------------
Cluster Overview | <ul><li>[Cluster Overview panel](admin-ui-access-and-navigate.html#cluster-overview-panel)</li><li>Either the [Node List](admin-ui-access-and-navigate.html#nodes-list) (for Core users) or [Cluster Visualization]() (for enterprise users)</li></ul>
Cluster Metrics | <ul><li>[Time Series graphs](admin-ui-access-and-navigate.html#time-series-graphs)</li><li>[Events List](admin-ui-time-series.html#events-panel)</li></ul>
Databases | Information about the Tables or Grants in your [databases](admin-ui-databases-page.html).
Jobs | Information about all currently active schema changes and backup/restore [jobs](admin-ui-jobs-page.html).

<img src="{{ 'images/admin_ui_overview.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />
