---
title: Child Metrics
summary: Learn about high-cardinality child metrics enabled by the cluster setting server.child_metrics.enabled.
toc: false
docs_area: reference.metrics
---

The following is a list of high-cardinality child metrics enabled by the [cluster setting `server.child_metrics.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-child-metrics-enabled).

{% assign metrics = site.data.child-metrics %}
{% comment %} Fetch all child-metrics. {% endcomment %}

<table>
    <thead>
        <tr>
            <td><b>CockroachDB Metric Name</b></td>
            <td><b>Description</b></td>
            <td><b>Type</b></td>
            <td><b>Unit</b></td>
        </tr>
    </thead>
    <tbody>    
    {% for m in metrics %} {% comment %} Iterate through the metrics. {% endcomment %}
        {% assign metrics-list = site.data.metrics-list | where: "metric", m.child_metric_id %}
        {% comment %} Get the row from the metrics-list with the given child_metric_id. {% endcomment %}
            <tr>
            <td><div id="{{ m.child_metric_id }}" class="anchored"><code>{{ m.child_metric_id }}</code></div></td>
            <td>{% if metrics-list[0].description == null %}{{ m.description }}{% else %}{{ metrics-list[0].description }}{% endif %}</td>
            <td>{% if metrics-list[0].type == null %}{{ m.type }}{% else %}{{ metrics-list[0].type }}{% endif %}</td>
            <td>{% if metrics-list[0].unit == null %}{{ m.unit }}{% else %}{{ metrics-list[0].unit }}{% endif %}</td>
        </tr>
    {% endfor %} {% comment %} metrics {% endcomment %}
    </tbody>
</table>

