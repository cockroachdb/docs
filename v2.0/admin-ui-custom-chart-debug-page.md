---
title: Custom Chart Debug Page
toc: false
---

<span class="version-tag">New in v2.0:</span> The **Custom Chart** debug page of the Admin UI can be used to create a custom chart showing any combination of over [200 available metrics](#available-metrics) that you wish.

The definition of the customized dashboard is encoded in the URL. To share the dashboard with a colleague, send them the the URL. Just like any other URL it can be bookmarked, sit in a pinned tab in your browser, etc.

<div id="toc"></div>

## Getting There

To get to the **Custom Chart** debug page, [open the Admin UI](admin-ui-access-and-navigate.html), and either:

- Click on **Custom Time-Series Chart** in the **UI Debugging** section at the bottom of the node's Admin UI debug page. For a locally running node this page will be at <http://localhost:8888/#/debug>.

- Open <http://localhost:8888/#/debug/chart> in your browser (replacing `localhost` and `8888` with your node's host and port).

## Query Options

The dropdown menus above the chart are used to set:

- The time span to chart
- The units to display

The table below the chart shows which metrics are being queried, and how they'll be combined and displayed.

Options include:

{% include {{page.version.version}}/admin-ui-custom-chart-debug-page-00.html %}

## Examples

### Query User and System CPU Usage

<img src="{{ 'images/v2.0/admin-ui-custom-chart-debug-00.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

To compare system vs. userspace CPU usage, select the following values under **Metric Name**:

+ `sys.cpu.sys.percent`
+ `sys.cpu.user.percent`

The Y-axis label is the **Count**. A count of 1 represents 100% utilization. The **Aggregator** of **Sum** can show the count to be above 1, which would mean CPU utilization is greater than 100%.

Checking **Per Node** displays statistics for each node, which could show whether an individual node's CPU usage was higher or lower than the average.

## Available Metrics

{{site.data.alerts.callout_info}}
This list is taken directly from the source code and is subject to change. Some of the metrics listed below are already visible in other areas of the [Admin UI](admin-ui-overview.html).
{{site.data.alerts.end}}

{% include {{page.version.version}}/metric-names.md %}

## See Also

+ [Troubleshooting Overview](troubleshooting-overview.html)
+ [Support Resources](support-resources.html)
+ [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
