---
title: Advanced Debugging Page
toc: true
---

The **Advanced Debugging** page of the Admin UI provides links to advanced monitoring and troubleshooting reports and cluster configuration details. To view the **Advanced Debugging** page, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) and then click the gear icon on the left-hand navigation bar.

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

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
