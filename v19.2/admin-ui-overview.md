---
title: Admin UI Overview
summary: Use the Admin UI to monitor and optimize cluster performance.
toc: true
key: explore-the-admin-ui.html
---

The CockroachDB Admin UI provides details about your cluster and database configuration, and helps you optimize cluster performance.

## Admin UI areas

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
[Changefeed Details](admin-ui-cdc-dashboard.html) | View metrics about the [changefeeds](change-data-capture.html) created across your cluster.
[Nodes Details](admin-ui-access-and-navigate.html#summary-panel) | View details of live, dead, and decommissioned nodes.
[Events](admin-ui-access-and-navigate.html#events-panel) | View a list of recent cluster events.
[Database Details](admin-ui-databases-page.html) | View details about the system and user databases in the cluster.
[Statements Details](admin-ui-statements-page.html) | Identify frequently executed or high latency [SQL statements](sql-statements.html)
[Jobs Details](admin-ui-jobs-page.html) | View details of the jobs running in the cluster.
[Advanced Debugging Pages](admin-ui-debug-pages.html) | View advanced monitoring and troubleshooting reports. These include details about data distribution, the state of specific queues, and slow query metrics. These details are largely intended for use by CockroachDB developers.

## Admin UI access

On insecure clusters, all areas of the Admin UI are accessible to all users.

On secure clusters, certain areas of the Admin UI can only be accessed by [`admin` users](authorization.html#admin-role). These areas display information from privileged HTTP endpoints that operate with `admin` privilege.

For security reasons, non-admin users access only the data over which they have privileges (e.g., their tables and list of sessions), and data that does not require privileges (e.g., cluster health, node status, metrics).

{{site.data.alerts.callout_info}}
The default `root` user is a member of the `admin` role, but on CockroachDB clusters prior to v20.1, the Admin UI cannot be accessed by `root`. To access the secure Admin UI areas, [grant a user membership to the `admin` role](grant-roles.html):

<code style="white-space:pre-wrap">GRANT admin TO \<sql_user\>;</code>
{{site.data.alerts.end}}

Secure area | Privileged information
-----|-----
[Node Map](enable-node-map.html) | Database and table names
[Database Details](admin-ui-databases-page.html) | Stored table data
[Statements Details](admin-ui-statements-page.html) | SQL statements
[Jobs Details](admin-ui-jobs-page.html) | SQL statements and operational details
[Advanced Debugging Pages](admin-ui-debug-pages.html) (some reports) | Stored table data, operational details, internal IP addresses, names, credentials, application data (depending on report)

{{site.data.alerts.callout_info}}
By default, the Admin UI shares anonymous usage details with Cockroach Labs. For information about the details shared and how to opt-out of reporting, see [Diagnostics Reporting](diagnostics-reporting.html).
{{site.data.alerts.end}}

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
