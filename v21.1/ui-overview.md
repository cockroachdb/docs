---
title: DB Console Overview
summary: Use the DB Console to monitor and optimize cluster performance.
toc: true
redirect_from:
- explore-the-db-console.html
- admin-ui-access-and-navigate.html
- admin-ui-overview.html
key: explore-the-db-console.html
---

The DB Console provides details about your cluster and database configuration, and helps you optimize cluster performance.

## DB Console areas

Area | Description
--------|----
[Cluster Overview](ui-cluster-overview-page.html) | Essential metrics about the cluster and nodes, including liveness status, replication status, uptime, and hardware usage.
[Node Map](enable-node-map.html) | Geographical configuration of your cluster and metrics at the locality and node levels, visualized on a map.
[Overview Dashboard](ui-overview-dashboard.html) | Metrics about SQL performance, replication, and storage.
[Hardware Dashboard](ui-hardware-dashboard.html) | Metrics about CPU usage, disk throughput, network traffic, storage capacity, and memory.
[Runtime Dashboard](ui-runtime-dashboard.html) | Metrics about node count, CPU time, and memory usage.
[SQL Dashboard](ui-sql-dashboard.html) | Metrics about SQL connections, byte traffic, queries, transactions, and service latency.
[Storage Dashboard](ui-storage-dashboard.html) | Metrics about storage capacity and file descriptors.
[Replication Dashboard](ui-replication-dashboard.html) | Metrics about how data is replicated across the cluster, e.g., range status, replicas per store, and replica quiescence.
[Changefeeds Dashboard](ui-cdc-dashboard.html) | Metrics about the [changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html) created across your cluster.
[Databases](ui-databases-page.html) | Details about the system and user databases in the cluster.
[Sessions](ui-sessions-page.html) |  Details about open sessions in the cluster.
[Statements](ui-statements-page.html) | Frequently executed and high latency [SQL statements](sql-statements.html), with the option to collect statement diagnostics.
[Transactions](ui-transactions-page.html) |  Details about transactions running on the cluster.
[Network Latency](ui-network-latency-page.html) | Latencies and lost connections between all nodes in your cluster.
[Jobs](ui-jobs-page.html) | Details of jobs running in the cluster.
[Advanced Debug](ui-debug-pages.html) | Advanced monitoring and troubleshooting reports. These include details about data distribution, the state of specific queues, and slow query metrics. These details are largely intended for use by CockroachDB developers.

## DB Console access

The DB Console is accessible from every node at `http://<host>:<http-port>`, or `http://<host>:8080` by default.

- If you included the [`--http-addr`](cockroach-start.html#networking) flag when starting nodes, use the IP address/hostname and port specified by that flag.
- If you didn't include the [`--http-addr`](cockroach-start.html#networking) flag when starting nodes, use the IP address/hostname specified by the [`--listen-addr`](cockroach-start.html#networking) flag and port `8080`.
- If you are running a [secure cluster](#db-console-security), use `https` instead of `http`. You will also need to [create a user with a password](create-user.html#create-a-user-with-a-password) to log in.

{{site.data.alerts.callout_success}}
For guidance on accessing the DB Console in the context of cluster deployment, see [Start a Local Cluster](start-a-local-cluster.html) and [Manual Deployment](manual-deployment.html).
{{site.data.alerts.end}}

### DB Console security

On insecure clusters, all areas of the DB Console are accessible to all users.

On secure clusters, for each user who should have access to the DB Console, you must [create a user with a password](create-user.html#create-a-user-with-a-password) and optionally [grant the user membership to the `admin` role](grant-roles.html).

{{site.data.alerts.callout_info}}
The default `root` user is a member of the `admin` role. Use the following command to [grant users membership to the `admin` role](grant-roles.html):

<code style="white-space:pre-wrap">GRANT admin TO \<sql_user\>;</code>
{{site.data.alerts.end}}

For security reasons, non-admin users access only the data over which they have privileges (e.g., their tables, jobs, and list of sessions), and data that does not require privileges (e.g., cluster health, node status, metrics).

The following areas of the DB Console can only be accessed by [`admin` users](authorization.html#admin-role). These areas display information from privileged HTTP endpoints that operate with `admin` privilege.

Secure area | Privileged information
-----|-----
[Node Map](enable-node-map.html) | Database and table names
[Databases](ui-databases-page.html) | Stored table data
[Statements](ui-statements-page.html) | SQL statements
[Advanced Debug](ui-debug-pages.html) (some reports) | Stored table data, operational details, internal IP addresses, names, credentials, application data (depending on report)

{{site.data.alerts.callout_info}}
By default, the DB Console shares anonymous usage details with Cockroach Labs. For information about the details shared and how to opt-out of reporting, see [Diagnostics Reporting](diagnostics-reporting.html).
{{site.data.alerts.end}}

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
