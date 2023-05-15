---
title: Advanced Debug Page
toc: true
---

The **Advanced Debug** page of the Admin UI provides links to advanced monitoring and troubleshooting reports and cluster configuration details. To view this page, [access the Admin UI](admin-ui-overview.html#admin-ui-access) and click **Advanced Debug** in the left-hand navigation.

{{site.data.alerts.callout_info}}
These pages are experimental and undocumented. If you find an issue, let us know through [these channels](https://www.cockroachlabs.com/community/).
 {{site.data.alerts.end}}

## License and node information

On the right-side of the page, the following information is displayed:

- CockroachDB license type: Helps determine if you have access to Enterprise features.
- Current node ID: Helps identify the current node when viewing the Admin UI through a load balancer.

## Reports and Configuration

The following debug reports and configuration views are useful for monitoring and troubleshooting CockroachDB:

Report | Description | Access level
--------|-----|--------
[Custom Time Series Chart](admin-ui-custom-chart-debug-page.html) | Create a custom chart of time series data. | All users
Problem Ranges | View ranges in your cluster that are unavailable, underreplicated, slow, or have other problems. | [`admin` users only on secure clusters](admin-ui-overview.html#admin-ui-access)
Network Latency | Check latencies between all nodes in your cluster. | All users
Data Distribution and Zone Configs | View the distribution of table data across nodes and verify zone configuration. | [`admin` users only on secure clusters](admin-ui-overview.html#admin-ui-access)
Cluster Settings | View cluster settings and their configured values. | All users can view data according to their privileges
Localities | Check node localities for your cluster. | [`admin` users only on secure clusters](admin-ui-overview.html#admin-ui-access)

## Even More Advanced Debugging

The **Even More Advanced Debugging** section of the page lists additional reports that are largely internal and intended for use by CockroachDB developers. You can ignore this section while monitoring and troubleshooting CockroachDB. Alternatively, if you want to learn how to use these pages, feel free to contact us through [these channels](https://www.cockroachlabs.com/community/).

## Raw Status Endpoints (JSON)

Depending on your [access level](admin-ui-overview.html#admin-ui-access), the endpoints listed here provide access to:

- [Log files](debug-and-error-logs.html#write-to-file)
- Secondary log files (e.g., RocksDB logs, [execution logs](query-behavior-troubleshooting.html#cluster-wide-execution-logs), [slow query logs](query-behavior-troubleshooting.html#using-the-slow-query-log), [authentication logs](query-behavior-troubleshooting.html#authentication-logs))
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
