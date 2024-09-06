---
title: Row-Level TTL metrics
summary: The Row-Level TTL metrics let you monitor the performance of your Row-Level TTL jobs.
toc: true
---

{{site.data.alerts.callout_info}}
These graphs are available for CockroachDB {{ site.data.products.standard }} deployments. For graphs available to CockroachDB {{ site.data.products.advanced }} or {{ site.data.products.basic }} deployments, refer to the [CockroachDB {{ site.data.products.cloud }} Console Metrics page]({% link cockroachcloud/metrics.md %}#cockroachdb-cloud-console-metrics-page).
{{site.data.alerts.end}}

The Row-Level TTL metrics let you monitor the performance of your [Row-Level TTL jobs]({% link {{site.current_cloud_version}}/row-level-ttl.md %}).

To view these graphs, select a cluster from the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page), and click **Metrics** in the **Monitoring** section of the left side navigation. On the **Metrics** page, click the **Row-Level TTL** tab.

## Time interval selection

The time interval selector at the top of each tab allows you to filter the view for a predefined or custom time interval. Use the navigation buttons to move to the previous, next, or current time interval. When you select a time interval, the same interval is selected for all charts on the **Metrics** page.

{% assign tab = "Row-Level TTL" %}
{% assign graphs = site.data.metrics | where_exp: "graphs", "graphs.metric_ui_tab contains tab" | map: "metric_ui_graph" | uniq %}

{% for g in graphs %} {% comment %} Iterate through the graphs. {% endcomment %}

## {{ g }}

{% assign metrics = site.data.metrics | where: "metric_ui_graph", g %}
{% comment %} Fetch all metrics for given metric_ui_tab. {% endcomment %}

<table markdown="1">
    <thead>
        <tr>
            <td><b>Short Name</b></td>
            <td><b>CockroachDB Metric Name</b></td>
            <td><b>Description</b></td>
            <td><b>Usage</b></td>
        </tr>
    </thead>
    <tbody>    
    {% for m in metrics %} {% comment %} Iterate through the metrics. {% endcomment %}
        {% assign metrics-list = site.data.metrics-list | where: "metric", m.metric_id %}
        {% comment %} Get the row from the metrics-list with the given metric_id. {% endcomment %}
            <tr>
            <td>{{ m.short_name }}</td>
            <td><div id="{{ m.metric_id }}" class="anchored"><code>{{ m.metric_id }}</code></div></td>
            <td>{{ metrics-list[0].description}}</td>
            <td>{% include metrics-usage/{{ m.metric_id }}.md %}</td>
        </tr>
    {% endfor %} {% comment %} metrics {% endcomment %}
    </tbody>
</table>

{% endfor %} {% comment %} charts {% endcomment %}

## See also

- [Metrics Overview]({% link cockroachcloud/metrics.md %})
- [Overview metrics tab]({% link cockroachcloud/metrics-overview.md %})
- [Request Unit metrics]({% link cockroachcloud/metrics-request-units.md %})
- [SQL metrics]({% link cockroachcloud/metrics-sql.md %})
- [Changefeed metrics]({% link cockroachcloud/metrics-changefeeds.md %})
- [Essential Metrics for {{ site.data.products.standard }}]({% link cockroachcloud/metrics-essential.md %})