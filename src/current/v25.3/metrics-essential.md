---
title: Essential Metrics for CockroachDB Self-Hosted Deployments
summary: Learn about the recommended essential metrics for monitoring your CockroachDB self-hosted cluster.
toc: true
---

These essential CockroachDB metrics let you monitor your CockroachDB {{ site.data.products.core }} cluster.

These essential CockroachDB metrics enable you to build custom dashboards with the following tools:

- [Grafana]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}#step-5-visualize-metrics-in-grafana)
- [Datadog Integration]({% link {{ page.version.version }}/datadog.md %}): The [**Datadog Integration Metric Name**](https://docs.datadoghq.com/integrations/cockroachdb/?tab=host#metrics) column lists the corresponding Datadog metric which requires the `cockroachdb.` prefix.

The **Usage** column explains why each metric is important to visualize and how to make both practical and actionable use of the metric in a production deployment.

{% assign version = page.version.version | replace: ".", "" %}
{% comment %}{{ version }}{% endcomment %}

{% for layer in site.data[version].metrics.metrics.layers %}
{% comment %}{{ layer.name }}{% endcomment %}

{% for category in layer.categories %}

{% assign essential_metrics = category.metrics | where: "essential", true %}
{% if essential_metrics.size > 0 %}

## {{ category.name }}

<table markdown="1">
    <thead>
        <tr>
            <td><b>CockroachDB Metric Name</b></td>
            <td><b>Description</b></td>
            <td><b>Usage</b></td>
        </tr>
    </thead>
    <tbody>
    {% for metric in essential_metrics %}

        <tr>
            <td><div id="{{ metric.name }}" class="anchored"><code>{{ metric.name }}</code></div>
            <br>{% if metric.labeled_name %}<code>metrics</code> endpoint:<br><code>{{ metric.labeled_name }}</code>{% endif %}
            </td>
            <td>{{ metric.description}}</td>
            <td>{{ metric.how_to_use }}</td>
        </tr>

    {% endfor %} {% comment %} essential_metrics {% endcomment %}
    </tbody>
</table>

{% endif %}  {% comment %} essential_metrics > 0 {% endcomment %}
{% endfor %} {% comment %} categories {% endcomment %}
{% endfor %} {% comment %} layers {% endcomment %}

## See also

- [Available Metrics]({% link {{ page.version.version }}/metrics.md %}#available-metrics)
- [Monitor CockroachDB with Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %})
- [Visualize metrics in Grafana]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}#step-5-visualize-metrics-in-grafana)
- [Custom Chart Debug Page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %})
- [Cluster API]({% link {{ page.version.version }}/cluster-api.md %})
- [Essential Alerts]({% link {{ page.version.version }}/essential-alerts-self-hosted.md %})