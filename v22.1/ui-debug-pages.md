---
title: Advanced Debug Page
summary: The Advanced Debug page provides links to advanced monitoring and troubleshooting reports and cluster configuration details.
toc: true
docs_area: reference.db_console
---

{% include {{ page.version.version }}/ui/admin-access.md %}

The **Advanced Debug** page of the DB Console provides links to advanced monitoring and troubleshooting reports and cluster configuration details. To view this page, [access the DB Console](ui-overview.html#db-console-access) and click **Advanced Debug** in the left-hand navigation.

{{site.data.alerts.callout_info}}
These pages are experimental and undocumented. If you find an issue, let us know through [these channels](https://www.cockroachlabs.com/community/).
 {{site.data.alerts.end}}

## License and node information

On the right-side of the page, the following information is displayed:

- [**License type**](licensing-faqs.html): Determines if you have access to Enterprise features.
- **Web server**: Allows you to route DB Console access from the currently accessed node to a specific node on the cluster. Afterward, identifies the node to which DB Console access is being routed. To cancel this behavior, click **Reset**. You may also specify this directly in the URL with the `remote_node_id` parameter, e.g., `http://<host>:<http-port>/?remote_node_id=2` to select node `2`. The node selected here is also set as the target node for the **Profiling UI** section.

## Reports

The following debug reports are useful for monitoring and troubleshooting CockroachDB:

Report | Description | Access level
--------|-----|--------
[Custom Time Series Chart](ui-custom-chart-debug-page.html) | Create a custom chart of time series data. | All users.
Problem Ranges | View ranges in your cluster that are unavailable, under-replicated, slow, or have other problems. | [`admin` users only on secure clusters](ui-overview.html#db-console-access).
Data Distribution and Zone Configs | View the distribution of table data across nodes and verify zone configuration. | [`admin` users only on secure clusters](ui-overview.html#db-console-access).
Statement Diagnostics History  | Diagnostic bundles for all statements executed on the cluster.  | [`admin` users only on secure clusters](ui-overview.html#db-console-access).

## Configuration

The following configuration settings are useful for monitoring and troubleshooting CockroachDB:

Configuration | Description | Access level
--------|-----|--------
Cluster Settings | View cluster settings and their configured values. | All users can view data according to their privileges.
Localities | Check node localities for your cluster. | [`admin` users only on secure clusters](ui-overview.html#db-console-access).

## Even More Advanced Debugging

The **Even More Advanced Debugging** section of the page lists additional reports that are largely internal and intended for use by CockroachDB developers. You can ignore this section while monitoring and troubleshooting CockroachDB. Alternatively, if you want to learn how to use these pages, feel free to contact us through [these channels](https://www.cockroachlabs.com/community/).

## Raw Status Endpoints (JSON)

{{site.data.alerts.callout_info}}
These endpoints are deprecated in favor of the [Cluster API](monitoring-and-alerting.html#cluster-api).
{{site.data.alerts.end}}

Depending on your [access level](ui-overview.html#db-console-access), the endpoints listed here provide access to:

- [Log files](logging-overview.html)
- Metrics
- Node status
- Hot ranges
- Node-specific metrics
- Session data
- Cluster-wide range data
- Allocator runs

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
