---
title: Overview
toc: false
---

CockroachDB Admin UI provides details about your cluster and database configuration, and helps you optimize cluster performance by monitoring: 

Area | Description
--------|----
[Cluster Health](admin-ui-access-and-navigate.html#summary-panel) | Includes metrics such as number of Live, Dead, and Suspect nodes, Unavailable Ranges, Queries per Second, and Service Latency. 
[Overview](admin-ui-overview-dashboard.html) | Includes metrics such as SQL Queries, Service Latency, Replicas per Node, and Capacity.  
[Runtime Metrics](admin-ui-runtime-dashboard.html) | Includes runtime metrics such as the Node Count, CPU Time, and Memory Usage.
[SQL Performance](admin-ui-sql-dashboard.html) | Includes metrics such as SQL Connections, SQL Byte Traffic, SQL Queries, Transactions, and Service Latency.
[Storage Utilization](admin-ui-storage-dashboard.html) | Includes metrics such as Capacity and File Descriptors.
[Replication Details](admin-ui-replication-dashboard.html) | Includes metrics such as Ranges, Replicas per Store, and Replicas.
[Nodes Details](admin-ui-access-and-navigate.html#summary-panel) | Includes details of dead nodes, live nodes, and decommissioned nodes.
[Events](admin-ui-access-and-navigate.html#events-list) | Includes list of events for the cluster.
[Database Details](admin-ui-databases-page.html) | Includes details of the system and user databases configured in the cluster.
[Jobs Details](admin-ui-jobs-page.html) | Includes details of the jobs running in the cluster.

The Admin UI also provides details about the way data is **Distributed**, the state of specific **Queues**, and metrics for **Slow Queries** as well, but these details are largely internal and intended for use by CockroachDB developers.

{{site.data.alerts.callout_info}}By default, the Admin UI shares anonymous usage details with Cockroach Labs. For information about the details shared and how to opt-out of reporting, see <a href="diagnostics-reporting.html">Diagnostics Reporting</a>.{{site.data.alerts.end}}
