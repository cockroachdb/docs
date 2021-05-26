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
[Hardware Metrics](admin-ui-hardware-dashboard.html) | View metrics about CPU usage, disk throughput, network traffic, storage capacity, and memory.
[Runtime Metrics](admin-ui-runtime-dashboard.html) | View metrics about node count, CPU time, and memory usage.
[SQL Performance](admin-ui-sql-dashboard.html) | View metrics about SQL connections, byte traffic, queries, transactions, and service latency.
[Storage Utilization](admin-ui-storage-dashboard.html) | View metrics about storage capacity and file descriptors.
[Replication Details](admin-ui-replication-dashboard.html) | View metrics about how data is replicated across the cluster, such as range status, replicas per store, and replica quiescence.
[Nodes Details](admin-ui-access-and-navigate.html#summary-panel) | View details of live, dead, and decommissioned nodes.
[Events](admin-ui-access-and-navigate.html#events-panel) | View a list of recent cluster events.
[Database Details](admin-ui-databases-page.html) | View details about the system and user databases in the cluster.
[Statements Details](admin-ui-statements-page.html) | Identify frequently executed or high latency [SQL statements](sql-statements.html)
[Jobs Details](admin-ui-jobs-page.html) | View details of the jobs running in the cluster.
[Advanced Debugging Pages](admin-ui-debug-pages.html) | View advanced monitoring and troubleshooting reports.

The Admin UI also provides details about the way data is **Distributed**, the state of specific **Queues**, and metrics for **Slow Queries**, but these details are largely internal and intended for use by CockroachDB developers.

{{site.data.alerts.callout_info}}
By default, the Admin UI shares anonymous usage details with Cockroach Labs. For information about the details shared and how to opt-out of reporting, see [Diagnostics Reporting](diagnostics-reporting.html).
{{site.data.alerts.end}}

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
