---
title: Custom Metrics Chart Page
summary: The Custom Metrics Chart page lets you create custom charts showing the time series data for an available metric or combination of metrics.
toc: true
---

The **Custom Metrics Chart** page allows you to create custom charts showing the time-series data for an available metric or combination of metrics. To view this page, select a cluster from the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page), and click **Metrics** in the **Monitoring** section of the left side navigation. Navigate to the **Custom** tab.

{{site.data.alerts.callout_info}}
{% include_cached feature-phases/preview.md %}
{{site.data.alerts.end}}

## Use the Custom Metrics Chart page

<img src="{{ 'images/cockroachcloud/custom-metrics-chart.png' | relative_url }}" alt="Custom Metrics Chart" style="border:1px solid #eee;max-width:100%" />

On the **Custom Metrics Chart** page, you can set the time range for all charts, add new custom charts, and edit or remove existing charts:

- To set the time range for the page, use the time interval selector at the top right of the page to filter the view for a predefined or custom time interval. Use the navigation buttons to move to the previous, next, or current time interval. When you select a time interval, the same interval is selected for all charts on all tabs of the [**Metrics** page]({% link cockroachcloud/metrics-page.md %}).
- To add a chart, click **Create** to create the first custom chart or **Add Chart** to create subsequent custom charts. The [**Create custom chart** dialog](#create-custom-chart-dialog) is displayed.
- To edit a chart, click the pencil icon to display the [**Edit custom chart** dialog](#create-custom-chart-dialog).
- To delete a chart, click the trash icon.

## Create custom chart dialog

In the **Create custom chart** dialog, you can customize each chart.

<img src="{{ 'images/cockroachcloud/custom-metrics-chart-create.png' | relative_url }}" alt="Create Custom Chart" style="border:1px solid #eee;max-width:70%" />

- Under **Select metrics**, add the metrics to be queried, and how they'll be combined and displayed. Options include:
{% include cockroachcloud/ui-custom-metrics-chart-page.html %}
- To reset the dialog to a blank state - no metrics, aggregators or units set, click **Clear all metrics**.
- Under **Provide a chart name**, enter title text or keep default title with names of selected metrics.
- The **Preview** shows data, if available, for the selected metrics in the time range set by the **Metrics** page's time interval selector.
- Once the chart is verified in the **Preview**, click **Submit** to add the new custom chart or click **Close** to return to the existing **Custom Metrics Chart** page.

## Available metrics

{% include cockroachcloud/metric-names-serverless.md %}

## See also

- [Metrics Page]({% link cockroachcloud/metrics-page.md %})
