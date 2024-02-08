---
title: Request Unit metrics
summary: The Request Unit metrics let you monitor resource consumption.
toc: true
---

{{site.data.alerts.callout_info}}
These graphs are only available for CockroachDB {{ site.data.products.serverless }} Deployments. For CockroachDB {{ site.data.products.dedicated }} Deployments, refer to [Metrics for {{ site.data.products.dedicated }}]({% link cockroachcloud/metrics-page.md %}).
{{site.data.alerts.end}}

The Request Unit metrics let you monitor [resource consumption]({% link cockroachcloud/serverless-resource-usage.md %}). All cluster activity, including SQL queries, bulk operations, and background jobs, is measured in Request Units, or RUs. An RU is an abstracted metric that represents the compute and I/O resources used by a database operation. In addition to queries that you run, background activity, such as automatic statistics to optimize your queries or connecting a changefeed to an external sink, also consumes RUs.

To view these graphs, select a cluster from the [**Clusters** page]({% link cockroachcloud/cluster-management.md %}#view-clusters-page), and click **Metrics** in the **Monitoring** section of the left side navigation. On the **Metrics** page, click the **Request Units** tab.

## Time interval selection

The time interval selector at the top of each tab allows you to filter the view for a predefined or custom time interval. Use the navigation buttons to move to the previous, next, or current time interval. When you select a time interval, the same interval is selected for all charts on the page.

{% assign tab = "Request Units" %}
{% assign graphs = site.data.metrics | where_exp: "graphs", "graphs.metric_ui_tab contains tab" | map: "metric_ui_graph" | uniq %}

{% for g in graphs %} {% comment %} Iterate through the graphs. {% endcomment %}

## {{ g }}

{% assign metrics = site.data.metrics | where: "metric_ui_graph", g %}
{% comment %} Fetch all metrics for given metric_ui_tab. {% endcomment %}

<table>
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
            <td><code>{{ m.metric_id }}</code></td>
            <td>{{ metrics-list[0].description}}</td>
            <td>{% include metrics-usage/{{ m.metric_id }}.md %}</td>
        </tr>
    {% endfor %} {% comment %} metrics {% endcomment %}
    </tbody>
</table>

{% endfor %} {% comment %} charts {% endcomment %}

## See also

- [Overview metrics]({% link cockroachcloud/metrics-overview.md %})
- [SQL metrics]({% link cockroachcloud/metrics-sql.md %})
- [Changefeed metrics]({% link cockroachcloud/metrics-changefeeds.md %})
- [Row-Level TTL metrics]({% link cockroachcloud/metrics-row-level-ttl.md %})
- [Essential Metrics for {{ site.data.products.serverless }}]({% link cockroachcloud/metrics-essential-serverless.md %})