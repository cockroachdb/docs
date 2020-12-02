---
title: Custom Chart Debug Page
toc: true
redirect_from: admin-ui-custom-chart-debug-page.html
---

The **Custom Chart** debug page in the DB Console can be used to create one or multiple custom charts showing any combination of over [200 available metrics](#available-metrics).

The definition of the customized dashboard is encoded in the URL. To share the dashboard with someone, send them the URL. Like any other URL, it can be bookmarked, sit in a pinned tab in your browser, etc.


## Accessing the **Custom Chart** page

To access the **Custom Chart** debug page, [access the DB Console](ui-overview.html), and either:

- Open <a href="http://localhost:8080/#/debug/chart" data-proofer-ignore>http://localhost:8080/#/debug/chart</a> in your browser (replacing `localhost` and `8080` with your node's host and port).

- Click the gear icon on the left to access the **Advanced Debugging Page**. In the **Reports** section, click **Custom TimeSeries Chart**.

## Using the **Custom Chart** page

<img src="{{ 'images/v21.1/ui-custom-chart-debug-00.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

On the **Custom Chart** page, you can set the time span for all charts, add new custom charts, and customize each chart:

- To set the time span for the page, use the dropdown menu above the charts and select the desired time span.

- To add a chart, click **Add Chart** and customize the new chart.

- To customize each chart, use the **Units** dropdown menu to set the units to display. Then use the table below the chart to select the metrics being queried, and how they'll be combined and displayed. Options include:
{% include {{page.version.version}}/ui-custom-chart-debug-page-00.html %}

## Examples

### Query user and system CPU usage

<img src="{{ 'images/v21.1/ui-custom-chart-debug-01.png' | relative_url }}" alt="DB Console" style="border:1px solid #eee;max-width:100%" />

To compare system vs. userspace CPU usage, select the following values under **Metric Name**:

- `sys.cpu.sys.percent`
- `sys.cpu.user.percent`

The Y-axis label is the **Count**. A count of 1 represents 100% utilization. The **Aggregator** of **Sum** can show the count to be above 1, which would mean CPU utilization is greater than 100%.

Checking **Per Node** displays statistics for each node, which could show whether an individual node's CPU usage was higher or lower than the average.

## Available metrics

{{site.data.alerts.callout_info}}
This list is taken directly from the source code and is subject to change. Some of the metrics listed below are already visible in other areas of the [DB Console](ui-overview.html).
{{site.data.alerts.end}}

{% include {{page.version.version}}/metric-names.md %}

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
