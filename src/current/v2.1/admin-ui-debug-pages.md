---
title: Advanced Debugging Page
toc: true
---

The **Advanced Debugging** page of the Admin UI provides links to advanced monitoring and troubleshooting reports and cluster configuration details. To view the **Advanced Debugging** page, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) and then click the gear icon on the left-hand navigation bar.

{{site.data.alerts.callout_info}}
These pages are experimental and undocumented. If you find an issue, let us know through [these channels](https://www.cockroachlabs.com/community/).
 {{site.data.alerts.end}}

## Reports and Configuration

The following debug reports and configuration views are useful for monitoring and troubleshooting CockroachDB:

Report | Description
--------|----
[Custom Time Series Chart](admin-ui-custom-chart-debug-page.html) | Create a custom chart of time series data.
Problem Ranges | View ranges in your cluster that are unavailable, underreplicated, slow, or have other problems.
Network Latency | Check latencies between all nodes in your cluster.
Data Distribution and Zone Configs | View the distribution of table data across nodes and verify zone configuration.
Cluster Settings | View all cluster settings and their configured values.
Localities | Check node localities for your cluster.

## Even More Advanced Debugging

The **Even More Advanced Debugging** section of the page lists additional reports that are largely internal and intended for use by CockroachDB developers. You can ignore this section while monitoring and troubleshooting CockroachDB. Alternatively, if you want to learn how to use these pages, feel free to contact us through [these channels](https://www.cockroachlabs.com/community/).

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
