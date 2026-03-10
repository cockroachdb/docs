---
title: Advanced Debug Page
summary: The Advanced Debug page provides links to advanced monitoring and troubleshooting reports and cluster configuration details.
toc: true
docs_area: reference.db_console
---

{% include {{ page.version.version }}/ui/admin-access-only.md %}

The **Advanced Debug** page of the DB Console provides links to advanced monitoring and troubleshooting reports and cluster configuration details. To view this page, [access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access) and click **Advanced Debug** in the left-hand navigation.

{{site.data.alerts.callout_info}}
These pages are experimental and largely undocumented. If you find an issue, let us know through [these channels](https://www.cockroachlabs.com/community/).
 {{site.data.alerts.end}}

## Required privileges

To view the **Advanced Debug** page, and work with the debugging and profiling endpoints hosted on this page, the user must be a member of the `admin` role or must have the `VIEWDEBUG` [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) defined.

## License and node information

On the right-side of the page, the following information is displayed:

- [**License type**]({% link {{ page.version.version }}/licensing-faqs.md %}): Determines if you have access to Enterprise features.
- **Web server**: Indicates the node currently serving your DB Console web session, and allows you to select a different node if desired. To cancel your selection of a different node, click **Reset**. You may also specify this directly in the URL with the `remote_node_id` parameter. For example, use `http://<host>:<http-port>/?remote_node_id=2` to select node `2`. The node selected here is also set as the target node for the **Profiling UI** section.

## Reports

The following debug reports are useful for monitoring and troubleshooting CockroachDB:

Report | Description | Access level
--------|-----|--------
[Custom Time Series Chart]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}) | Create a custom chart of time series data. | All users.
Problem Ranges | View ranges in your cluster that are unavailable, under-replicated, slow, paused, or have other problems. | On secure clusters, [`admin` user]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) or a SQL user with the [`VIEWCLUSTERMETADATA`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewclustermetadata) [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges).
Data Distribution and Zone Configs | View the distribution of table data across nodes and verify [zone configurations]({% link {{ page.version.version }}/configure-replication-zones.md %}). | On secure clusters, [`admin` user]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) or a SQL user with the [`VIEWCLUSTERMETADATA`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewclustermetadata) [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges).
<a id="diagnostics-history"></a>Diagnostics History  | Diagnostic bundles for statements and transactions executed on the cluster.  | On secure clusters, [`admin` user]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) or a SQL user with the [`VIEWACTIVITY`]({% link {{ page.version.version }}/security-reference/authorization.md %}#viewactivity) [system privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges).

## Configuration

The following configuration settings are useful for monitoring and troubleshooting CockroachDB:

Configuration | Description | Access level
--------|-----|--------
Cluster Settings | View cluster settings and their configured values. | All users can view data according to their privileges.
Localities | Check node localities for your cluster. | All users.

## Even More Advanced Debugging

The **Even More Advanced Debugging** section of the page lists advanced troubleshooting tools and reports that are generally of interest to CockroachDB developers and contributors, such as the [Key Visualizer]({% link {{ page.version.version }}/ui-key-visualizer.md %}), a tool for visualizing read and write traffic across your keyspace.

If you want to learn more about the tools in this section, contact us through [these channels](https://www.cockroachlabs.com/community/).

## Raw Status Endpoints (JSON)

{{site.data.alerts.callout_info}}
These endpoints are deprecated in favor of the [Cluster API]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#cluster-api).
{{site.data.alerts.end}}

Depending on your [access level]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access), the endpoints listed here provide access to:

- [Log files]({% link {{ page.version.version }}/logging-overview.md %})
- Metrics
- Node status
- Hot ranges
- Node-specific metrics
- Session data
- Cluster-wide range data
- Allocator runs

## See also

- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Support Resources]({% link {{ page.version.version }}/support-resources.md %})
- [Raw Status Endpoints]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#raw-status-endpoints)
