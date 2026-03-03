---
title: DB Console Overview
summary: Use the DB Console to monitor and optimize cluster performance.
toc: true
key: explore-the-admin-ui.html
docs_area: reference.db_console
---

The DB Console provides details about your cluster and database configuration, and helps you optimize cluster performance.

{{site.data.alerts.callout_info}}
Authorized CockroachDB {{ site.data.products.advanced }} cluster users can visit the DB Console at a URL provisioned for the cluster.

Refer to: [Network Authorization for CockroachDB Cloud Clusters&mdash;DB Console]({% link cockroachcloud/network-authorization.md %}#db-console)
{{site.data.alerts.end}}

## Authentication

The DB Console supports username/password login and single sign-on (SSO) for {{ site.data.products.advanced }} and {{ site.data.products.enterprise }} clusters.

The DB Console sign-on page can also be used to provision authentication tokens for SQL client access.

Refer to:

- [Single Sign-on (SSO) for DB Console]({% link {{ page.version.version }}/sso-db-console.md %})
- [Cluster Single Sign-on (SSO) using JSON web tokens (JWTs)]({% link {{ page.version.version }}/sso-sql.md %})

## DB Console areas

### Overview

The Overview page provides a cluster overview and node list and map.

- [Cluster Overview]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}) has essential metrics about the cluster and nodes, including liveness status, replication status, uptime, and hardware usage.
- [Node List]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#node-map) has a list of cluster metrics at the locality and node levels.
- [Node Map]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#node-map) displays a geographical configuration of your cluster and metrics at the locality and node levels, visualized on a map.

### Metrics

The Metrics page provides dashboards for all types of CockroachDB metrics.

- [Overview dashboard]({% link {{ page.version.version }}/ui-overview-dashboard.md %}) has metrics about SQL performance, replication, and storage.
- [Hardware dashboard]({% link {{ page.version.version }}/ui-hardware-dashboard.md %}) has metrics about CPU usage, disk throughput, network traffic, storage capacity, and memory.
- [Runtime dashboard]({% link {{ page.version.version }}/ui-runtime-dashboard.md %}) has metrics about node count, CPU time, and memory usage.
- [SQL dashboard]({% link {{ page.version.version }}/ui-sql-dashboard.md %}) has metrics about SQL connections, byte traffic, queries, transactions, and service latency.
- [Storage dashboard]({% link {{ page.version.version }}/ui-storage-dashboard.md %}) has metrics about storage capacity and file descriptors.
- [Replication dashboard]({% link {{ page.version.version }}/ui-replication-dashboard.md %}) has metrics about how data is replicated across the cluster, e.g., range status, replicas per store, etc.
- [Distributed dashboard]({% link {{ page.version.version }}/ui-distributed-dashboard.md %}) has metrics about distribution tasks across the cluster, including RPCs and transactions.
- [Queues dashboard]({% link {{ page.version.version }}/ui-queues-dashboard.md %}) has metrics about the health and performance of various queueing systems in CockroachDB, including the garbage collection and Raft log queues.
- [Slow requests dashboard]({% link {{ page.version.version }}/ui-slow-requests-dashboard.md %}) has metrics about important cluster tasks that take longer than expected to complete, including Raft proposals and lease acquisitions.
- [Changefeeds dashboard]({% link {{ page.version.version }}/ui-cdc-dashboard.md %}) has metrics about the [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) created across your cluster.
- [Overload dashboard]({% link {{ page.version.version }}/ui-overload-dashboard.md %}) has metrics about the performance of the parts of your cluster relevant to the cluster's [admission control system]({% link {{ page.version.version }}/admission-control.md %}).
- [TTL dashboard]({% link {{ page.version.version }}/ui-ttl-dashboard.md %}) has metrics about the progress and performance of [batch deleting expired data using Row-Level TTL]({% link {{ page.version.version }}/row-level-ttl.md %}) from your cluster.
- [Physical Cluster Replication dashboard]({% link {{ page.version.version }}/ui-physical-cluster-replication-dashboard.md %}) has metrics about the [physical cluster replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) streams between a primary and standby cluster.

### Databases

The [Databases]({% link {{ page.version.version }}/ui-databases-page.md %}) page shows details about the system and user databases in the cluster.

### SQL Activity

The **SQL Activity** page summarizes SQL activity in your cluster.

- [**Statements**]({% link {{ page.version.version }}/ui-statements-page.md %}) shows frequently executed and high-latency [SQL statements]({% link {{ page.version.version }}/sql-statements.md %}) with the option to collect statement [diagnostics]({% link {{ page.version.version }}/ui-statements-page.md %}#diagnostics).
- [**Transactions**]({% link {{ page.version.version }}/ui-transactions-page.md %}) shows details about transactions running on the cluster.
- [**Sessions**]({% link {{ page.version.version }}/ui-sessions-page.md %}) shows details about open sessions in the cluster.

### Insights

The [**Insights**]({% link {{ page.version.version }}/ui-insights-page.md %}) page exposes problematic health signals and enables you to quickly find optimization opportunities to maximize database efficiency. The **Insights** page contains workload-level and schema-level insights.

### Network Latency

The [Network Latency]({% link {{ page.version.version }}/ui-network-latency-page.md %}) page shows latencies and lost connections between all nodes in your cluster.

### Jobs

The [Jobs]({% link {{ page.version.version }}/ui-jobs-page.md %}) page shows details of jobs running in the cluster.

### Advanced Debug

The [Advanced Debug]({% link {{ page.version.version }}/ui-debug-pages.md %}) page provides advanced monitoring and troubleshooting reports. These include details about data distribution, the state of specific queues, and slow query metrics. These details are largely intended for use by CockroachDB developers. To access the **Advanced Debug** page, the user must be a member of the `admin` role or must have the `VIEWDEBUG` [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) defined.

## DB Console access

You can access the DB Console from every node at `http://<host>:<http-port>`, or `http://<host>:8080` by default.

- If you included the [`--http-addr`]({% link {{ page.version.version }}/cockroach-start.md %}#networking) flag when starting nodes, use the IP address or hostname and port specified by that flag.
- If you didn't include the [`--http-addr`]({% link {{ page.version.version }}/cockroach-start.md %}#networking) flag when starting nodes, use the IP address or hostname specified by the [`--listen-addr`]({% link {{ page.version.version }}/cockroach-start.md %}#networking) flag and port `8080`.
- If you are running a [secure cluster](#cluster-security), use `https` instead of `http`.

For guidance on accessing the DB Console in the context of cluster deployment, see [Start a Local Cluster]({% link {{ page.version.version }}/start-a-local-cluster.md %}) and [Manual Deployment]({% link {{ page.version.version }}/manual-deployment.md %}).

{{site.data.alerts.callout_danger}}
Accessing the DB Console for a secure cluster requires login information (i.e., username and password). This login information is stored in a system table that is replicated like other data in the cluster. If a majority of the nodes with the replicas of the system table data go down, users will be locked out of the DB Console.
{{site.data.alerts.end}}

### Proxy DB Console

If your CockroachDB cluster is behind a load balancer, you may wish to proxy your DB Console connection to a different node in the cluster from the node you first connect to. This is useful in deployments where a third-party load balancer otherwise determines which CockroachDB node you connect to in DB Console, or where web management access is limited to a subset of CockroachDB instances in a cluster.

You can accomplish this using one of these methods:

- Once connected to DB Console, use the **Web server** dropdown menu from the [**Advanced Debug**]({% link {{ page.version.version }}/ui-debug-pages.md %}#license-and-node-information) page to select a different node to proxy to.
- Use the `remote_node_id` parameter in your DB Console URL to proxy directly to a specific node. For example, use `http://<host>:<http-port>/?remote_node_id=2` to proxy directly to node `2`.

## DB Console security considerations

Access to DB Console is a function of cluster security and the privileges of the accessing user.

### Cluster security

On insecure clusters, all areas of the DB Console are accessible to all users.

On secure clusters, for each user who should have access to the DB Console, you must [create a user with a password]({% link {{ page.version.version }}/create-user.md %}#create-a-user-with-a-password) and optionally [`GRANT`]({% link {{ page.version.version }}/grant.md %}#grant-system-level-privileges-on-the-entire-cluster) the user [system-level privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) or membership to the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role).

### Role-based security

All users have access to data over which they have privileges (e.g., [jobs]({% link {{ page.version.version }}/ui-jobs-page.md %}) and [list of sessions]({% link {{ page.version.version }}/ui-sessions-page.md %})), and data that does not require privileges (e.g., [cluster health, node status]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}), [metrics]({% link {{ page.version.version }}/ui-overview-dashboard.md %})).

The following areas display information from privileged HTTP endpoints that require the user to have the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) or the specified [system-level privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges).

DB Console area | System-level privilege | Privileged information
----------------|------------------------|------------------------
[Statements]({% link {{ page.version.version }}/ui-statements-page.md %}) | [`VIEWACTIVITY`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewactivity) or [`VIEWACTIVITYREDACTED`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewactivityredacted) | SQL statements
[Transactions]({% link {{ page.version.version }}/ui-transactions-page.md %}) | [`VIEWACTIVITY`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewactivity) or [`VIEWACTIVITYREDACTED`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewactivityredacted) | Transactions
[Sessions]({% link {{ page.version.version }}/ui-sessions-page.md %}) | [`VIEWACTIVITY`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewactivity) or [`VIEWACTIVITYREDACTED`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewactivityredacted) | Sessions
[Insights]({% link {{ page.version.version }}/ui-insights-page.md %}) | [`VIEWACTIVITY`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewactivity) or [`VIEWACTIVITYREDACTED`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewactivityredacted) | Insights
[Top Ranges]({% link {{ page.version.version }}/ui-top-ranges-page.md %}) | [`VIEWCLUSTERMETADATA`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewclustermetadata) | Ranges
[Jobs]({% link {{ page.version.version }}/ui-jobs-page.md %}) | [`VIEWJOB`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewjob) | Jobs
[Advanced Debug]({% link {{ page.version.version }}/ui-debug-pages.md %}) | [`VIEWDEBUG`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewdebug) | Debugging and profiling endpoints
[Advanced Debug > Problem Ranges]({% link {{ page.version.version }}/ui-debug-pages.md %}#reports) | [`VIEWCLUSTERMETADATA`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewclustermetadata) | Ranges
[Advanced Debug > Data Distribution and Zone Configs]({% link {{ page.version.version }}/ui-debug-pages.md %}#reports) | [`VIEWCLUSTERMETADATA`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewclustermetadata) | Ranges
[Advanced Debug > Cluster Settings]({% link {{ page.version.version }}/ui-debug-pages.md %}#configuration) | [`VIEWCLUSTERSETTING`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewclustersetting) or [`MODIFYCLUSTERSETTING`]({% link {{ page.version.version }}/security-reference/authorization.md %}#modifyclustersetting) | Cluster Settings

## DB Console timezone configuration

To view timestamps in your preferred timezone in the DB Console, use the [`ui.default_timezone` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-ui-default-timezone). This setting supports all valid timezone identifiers, such as `America/New_York` and `Asia/Tokyo`.

{% include_cached copy-clipboard.html %}
~~~sql
SET CLUSTER SETTING ui.default_timezone = 'America/New_York';
~~~

If no value is set, the DB Console displays timestamps in UTC.

{{site.data.alerts.callout_info}}
The [`ui.display_timezone` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-ui-display-timezone) is now deprecated and will be removed in a future release. Avoid using `ui.display_timezone`. Use `ui.default_timezone` instead for full support and forward compatibility.
{{site.data.alerts.end}}

## DB Console troubleshooting

The DB Console stores temporary data in a time-series database in order to generate the various [metrics](#metrics) graphs. If your cluster is comprised of a large number of nodes where individual nodes have very limited memory available (e.g., under `8 GiB`), this underlying time-series database may not have enough memory available per-node to serve these requests quickly. If the DB Console experiences issues rendering these metrics graphs, consider increasing the value of the [`--max-tsdb-memory`]({% link {{ page.version.version }}/cockroach-start.md %}#flags-max-tsdb-memory) flag.

## Diagnostics reporting

By default, the DB Console shares anonymous usage details with Cockroach Labs. For information about the details shared and how to opt-out of reporting, see [Diagnostics Reporting]({% link {{ page.version.version }}/diagnostics-reporting.md %}).

## License expiration message

If you have [set a license]({% link {{ page.version.version }}/licensing-faqs.md %}#set-a-license), a license expiration message is displayed at the top-right of the DB Console. While the license is valid, the message will read `License expires in X days`, where `X` is the number of days. If the license is no longer valid, the message will read `License expired X days ago`. Hovering over either message displays a tooltip with the expiration date of the license.

{% include common/license-expiration-messages.md %}

## See also

- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Support Resources]({% link {{ page.version.version }}/support-resources.md %})
- [Raw Status Endpoints]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#raw-status-endpoints)
