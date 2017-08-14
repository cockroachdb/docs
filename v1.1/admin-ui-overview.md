---
title: Overview
toc: false
---

The CockroachDB Admin UI provides details about your cluster and database configuration, and helps you optimize cluster performance by monitoring: 

Area | Description
--------|----
[Cluster Health](admin-ui-access-and-navigate.html#summary-panel) | View essential metrics about the cluster's health, such as the number of live, dead, and suspect nodes, the number of unavailable ranges, and the queries per second and service latency across the cluster. 
[Overview Metrics](admin-ui-overview-dashboard.html) | View important SQL performance, replication, and storage metrics.  
[Runtime Metrics](admin-ui-runtime-dashboard.html) | View metrics such as the Node Count, CPU Time, and Memory Usage.
[SQL Performance](admin-ui-sql-dashboard.html) | View metrics such as SQL Connections, SQL Byte Traffic, SQL Queries, Transactions, and Service Latency.
[Storage Utilization](admin-ui-storage-dashboard.html) | View metrics such as Capacity and File Descriptors.
[Replication Details](admin-ui-replication-dashboard.html) | View metrics about how data is replicated across the cluster, such as Range Quiescence, Replicas per Store, and Replicas.
[Nodes Details](admin-ui-access-and-navigate.html#summary-panel) | View details of live, dead, and decommissioned nodes.
[Events](admin-ui-access-and-navigate.html#events-list) | View list of cluster events.
[Database Details](admin-ui-databases-page.html) | View details about the system and user databases in the cluster.
[Jobs Details](admin-ui-jobs-page.html) | View details of the jobs running in the cluster.

The Admin UI also provides details about the way data is **Distributed**, the state of specific **Queues**, and metrics for **Slow Queries**, but these details are largely internal and intended for use by CockroachDB developers.

{{site.data.alerts.callout_info}}By default, the Admin UI shares anonymous usage details with Cockroach Labs. For information about the details shared and how to opt-out of reporting, see <a href="diagnostics-reporting.html">Diagnostics Reporting</a>.{{site.data.alerts.end}}
