---
title: Admin UI Overview
summary: Use the Admin UI to monitor and optimize cluster performance.
toc: false
key: explore-the-admin-ui.html
---

The CockroachDB Admin UI provides details about your cluster and database configuration, and helps you optimize cluster performance by monitoring the following areas:

Area | Description
--------|----
[Node Map](enable-node-map.html) | View and monitor the metrics and geographical configuration of your cluster.
[Cluster Health](admin-ui-access-and-navigate.html#summary-panel) | View essential metrics about the cluster's health, such as the number of live, dead, and suspect nodes, the number of unavailable ranges, and the queries per second and service latency across the cluster.
[Overview Metrics](admin-ui-overview-dashboard.html) | View important SQL performance, replication, and storage metrics.
[Runtime Metrics](admin-ui-runtime-dashboard.html) | View metrics about node count, CPU time, and memory usage.
[SQL Performance](admin-ui-sql-dashboard.html) | View metrics about SQL connections, byte traffic, queries, transactions, and service latency.
[Storage Utilization](admin-ui-storage-dashboard.html) | View metrics about storage capacity and file descriptors.
[Replication Details](admin-ui-replication-dashboard.html) | View metrics about how data is replicated across the cluster, such as range status, replicas per store, and replica quiescence.
[Nodes Details](admin-ui-access-and-navigate.html#summary-panel) | View details of live, dead, and decommissioned nodes.
[Events](admin-ui-access-and-navigate.html#events-panel) | View a list of recent cluster events.
[Database Details](admin-ui-databases-page.html) | View details about the system and user databases in the cluster.
[Jobs Details](admin-ui-jobs-page.html) | View details of the jobs running in the cluster.
[Custom Chart Debug Page](admin-ui-custom-chart-debug-page.html) | Create a custom dashboard choosing from over 200 available metrics.

The Admin UI also provides details about the way data is **Distributed**, the state of specific **Queues**, and metrics for **Slow Queries**, but these details are largely internal and intended for use by CockroachDB developers.

{{site.data.alerts.callout_info}}By default, the Admin UI shares anonymous usage details with Cockroach Labs. For information about the details shared and how to opt-out of reporting, see <a href="diagnostics-reporting.html">Diagnostics Reporting</a>.{{site.data.alerts.end}}
