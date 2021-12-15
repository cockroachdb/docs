---
title: DB Console Overview
summary: Use the DB Console to monitor and optimize cluster performance.
toc: true
key: explore-the-admin-ui.html
---

The DB Console provides details about your cluster and database configuration, and helps you optimize cluster performance.

## DB Console areas

Area | Description
--------|----
[Cluster Overview](ui-cluster-overview-page.html) | Essential metrics about the cluster and nodes, including liveness status, replication status, uptime, and hardware usage.
[Node Map](ui-cluster-overview-page.html#node-map-enterprise) | Geographical configuration of your cluster and metrics at the locality and node levels, visualized on a map.
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

### DB Console URL

The DB Console is accessible from every node at `http://<host>:<http-port>`, or `http://<host>:8080` by default.

- If you included the [`--http-addr`](cockroach-start.html#networking) flag when starting nodes, use the IP address or hostname and port specified by that flag.
- If you didn't include the [`--http-addr`](cockroach-start.html#networking) flag when starting nodes, use the IP address or hostname specified by the [`--listen-addr`](cockroach-start.html#networking) flag and port `8080`.
- If you are running a [secure cluster](#cluster-security), use `https` instead of `http`.

For guidance on accessing the DB Console in the context of cluster deployment, see [Start a Local Cluster](start-a-local-cluster.html) and [Manual Deployment](manual-deployment.html).

Access to DB Console is a function of cluster security and the role of the accessing user.

### Cluster security

On insecure clusters, all areas of the DB Console are accessible to all users.

On secure clusters, for each user who should have access to the DB Console, you must [create a user with a password](create-user.html#create-a-user-with-a-password) and optionally [`GRANT`](grant.html#grant-role-membership) the user membership to the `admin` role.

### Role-based security

All users have access to data over which they have privileges (e.g., [jobs](ui-jobs-page.html) and [list of sessions](ui-sessions-page.html)), and data that does not require privileges (e.g., [cluster health, node status](ui-cluster-overview-page.html), [metrics](ui-overview-dashboard.html)).

[`admin` users](authorization.html#admin-role) also have access to the following areas. These area display information from privileged HTTP endpoints that operate with `admin` privilege.

DB Console areas | Privileged information
-----|-----
[Node Map](enable-node-map.html) | Database and table names
[Databases](ui-databases-page.html) | Stored table data
[Statements](ui-statements-page.html) | SQL statements
[Transactions](ui-transactions-page.html) | Transactions
[Advanced Debug](ui-debug-pages.html) (some reports) | Stored table data, operational details, internal IP addresses, names, credentials, application data (depending on report)

## Diagnostics reporting

By default, the DB Console shares anonymous usage details with Cockroach Labs. For information about the details shared and how to opt-out of reporting, see [Diagnostics Reporting](diagnostics-reporting.html).

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
