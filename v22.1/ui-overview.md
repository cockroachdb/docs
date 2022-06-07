---
title: DB Console Overview
summary: Use the DB Console to monitor and optimize cluster performance.
toc: true
key: explore-the-admin-ui.html
docs_area: reference.db_console
---

The DB Console provides details about your cluster and database configuration, and helps you optimize cluster performance.

## DB Console areas

### Overview

The Overview page provides a cluster overview and node list and map.

- [Cluster Overview](ui-cluster-overview-page.html) has essential metrics about the cluster and nodes, including liveness status, replication status, uptime, and hardware usage.
- [Node List](ui-cluster-overview-page.html#node-map-enterprise) has a list of cluster metrics at the locality and node levels.
- [Node Map](ui-cluster-overview-page.html#node-map-enterprise) displays a geographical configuration of your cluster and metrics at the locality and node levels, visualized on a map.

### Metrics

The Metrics page provides dashboards for all types of CockroachDB metrics.

- [Overview Dashboard](ui-overview-dashboard.html) has metrics about SQL performance, replication, and storage.
- [Hardware Dashboard](ui-hardware-dashboard.html) has metrics about CPU usage, disk throughput, network traffic, storage capacity, and memory.
- [Runtime Dashboard](ui-runtime-dashboard.html) has metrics about node count, CPU time, and memory usage.
- [SQL Dashboard](ui-sql-dashboard.html) has metrics about SQL connections, byte traffic, queries, transactions, and service latency.
- [Storage Dashboard](ui-storage-dashboard.html) has metrics about storage capacity and file descriptors.
- [Replication Dashboard](ui-replication-dashboard.html) has metrics about how data is replicated across the cluster, e.g., range status, replicas per store, and replica quiescence.
- [Distributed Dashboard](ui-distributed-dashboard.html) has metrics about distribution tasks across the cluster, e.g., RPCs, transactions, and node heartbeats.
- [Queues Dashboard](ui-queues-dashboard.html) has metrics about the health and performance of various queueing systems in CockroachDB, e.g., the garbage collection and Raft log queues.
- [Slow Requests Dashboard](ui-slow-requests-dashboard.html) has metrics about important cluster tasks that take longer than expected to complete, e.g., Raft proposals and lease acquisitions.
- [Changefeeds Dashboard](ui-cdc-dashboard.html) has metrics about the [changefeeds](change-data-capture-overview.html) created across your cluster.
- [Overload Dashboard](ui-overload-dashboard.html) has metrics about the performance of the parts of your cluster relevant to the cluster's [admission control system](admission-control.html).

### Databases

The [Databases](ui-databases-page.html) page shows details about the system and user databases in the cluster.

### SQL Activity

The SQL Activity page summarizes SQL activity in your cluster.

- [Statements](ui-statements-page.html) shows frequently executed and high latency [SQL statements](sql-statements.html), with the option to collect statement diagnostics.
- [Transactions](ui-transactions-page.html) show details about transactions running on the cluster.
- [Sessions](ui-sessions-page.html) shows details about open sessions in the cluster.

### Network Latency

The [Network Latency](ui-network-latency-page.html) page shows latencies and lost connections between all nodes in your cluster.

### Jobs

The [Jobs](ui-jobs-page.html) page shows details of jobs running in the cluster.

### Advanced Debug

The [Advanced Debug](ui-debug-pages.html) page provides advanced monitoring and troubleshooting reports. These include details about data distribution, the state of specific queues, and slow query metrics. These details are largely intended for use by CockroachDB developers.

## DB Console access

You can access the DB Console from every node at `http://<host>:<http-port>`, or `http://<host>:8080` by default.

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

[`admin` users](security-reference/authorization.html#admin-role) also have access to the following areas. These area display information from privileged HTTP endpoints that operate with `admin` privilege.

DB Console area | Privileged information
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
