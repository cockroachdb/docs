---
title: Essential Metrics for CockroachDB Self-Hosted Deployments
summary: Learn about the recommended essential metrics for monitoring your CockroachDB self-hosted cluster.
toc: true
---

These essential CockroachDB metrics let you monitor your CockroachDB {{ site.data.products.core }} cluster. Use them to build custom dashboards with the following tools:

- [Grafana]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}#step-5-visualize-metrics-in-grafana)
- [Datadog Integration]({% link {{ page.version.version }}/datadog.md %}): The [**Datadog Integration Metric Name**](https://docs.datadoghq.com/integrations/cockroachdb/?tab=host#metrics) column lists the corresponding Datadog metric which requires the `cockroachdb.` prefix.

The **Usage** column explains why each metric is important to visualize and how to make both practical and actionable use of the metric in a production deployment.

{% assign version = page.version.version | replace: ".", "" %}
{% comment %}{{ version }}{% endcomment %}

{% for layer in site.data[version].metrics.metrics.layers %}
## {{ layer.name }}

{% for category in layer.categories %}

{% assign essential_metrics = category.metrics | where: "essential", true %}
{% if essential_metrics.size > 0 %}

{% comment %} Add 2 to second instance of header names so right nav link works {% endcomment %}
{% if layer.name == "STORAGE" %}
  {% if category.name == "SQL" or category.name == "STORAGE" %}
### {{ category.name }} 2
  {% else %}
### {{ category.name }}
  {% endif %}
{% else %}
### {{ category.name }}
{% endif %}

<table markdown="1">
    <thead>
        <tr>
            <th>CockroachDB Metric Name</th>
            <th>[Datadog Integration Metric Name](https://docs.datadoghq.com/integrations/cockroachdb/?tab=host#metrics)<br>(add `cockroachdb.` prefix)</th>
            <th>Description</th>
            <th>Usage</th>
        </tr>
    </thead>
    <tbody>
    {% for metric in essential_metrics %}

        {% comment %} Transforms to match datadog_id {% endcomment %}
            {% assign input_metric = metric.name %}
            {% assign match1 = site.data[version].metrics.datadog-cockroachdb | where: "datadog_id", input_metric | first %}
            {% assign input_metric = metric.name | replace: "-", "." %}
            {% assign match2 = site.data[version].metrics.datadog-cockroachdb | where: "datadog_id", input_metric | first %}
            {% assign input_metric = metric.name | append: ".count" %}
            {% assign match3 = site.data[version].metrics.datadog-cockroachdb | where: "datadog_id", input_metric | first %}
            {% assign input_metric = metric.name | replace: "_", "." %}
            {% assign match4 = site.data[version].metrics.datadog-cockroachdb | where: "datadog_id", input_metric | first %}
            {% assign input_metric = metric.name | replace: "-", "_" | append: ".count"  %}
            {% assign match5 = site.data[version].metrics.datadog-cockroachdb | where: "datadog_id", input_metric | first %}
            {% assign input_metric = metric.name | replace: "-", "_" %}
            {% assign match6 = site.data[version].metrics.datadog-cockroachdb | where: "datadog_id", input_metric | first %}
            {% assign input_metric = metric.name | append: ".total" %}
            {% assign match7 = site.data[version].metrics.datadog-cockroachdb | where: "datadog_id", input_metric | first %}

        <tr>
            <td><div id="{{ metric.name }}" class="anchored"><code>{{ metric.name }}</code></div>
            <br>{% if metric.labeled_name %}<code>metrics</code> endpoint:<br><code>{{ metric.labeled_name }}</code>{% endif %}
            </td>
            <td>
                {% if match1 %}{% comment %}Match1:{% endcomment %}<code>{{ match1.datadog_id }}</code>
                {% elsif match2 %}{% comment %}Match2:{% endcomment %}<code>{{ match2.datadog_id }}</code>
                {% elsif match3 %}{% comment %}Match3:{% endcomment %}<code>{{ match3.datadog_id }}</code>
                {% elsif match4 %}{% comment %}Match4:{% endcomment %}<code>{{ match4.datadog_id }}</code>
                {% elsif match5 %}{% comment %}Match5:{% endcomment %}<code>{{ match5.datadog_id }}</code>
                {% elsif match6 %}{% comment %}Match6:{% endcomment %}<code>{{ match6.datadog_id }}</code>
                {% elsif match7 %}{% comment %}Match7:{% endcomment %}<code>{{ match7.datadog_id }}</code>
                {% else %}NOT AVAILABLE
                {% endif %}
            </td>
            <td>{{ metric.description }}</td>
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