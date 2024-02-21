---
title: Essential Metrics for CockroachDB Serverless Deployments
summary: Learn about the recommended essential metrics for monitoring your CockroachDB Serverless cluster.
toc: true
---

These essential CockroachDB metrics let you monitor your CockroachDB Serverless cluster. The metrics are available on graphs on the tabs listed in the **Metrics tabs** column. Where **Custom** is listed, the metric may be graphed in a [**Custom Metrics Chart**]({% link cockroachcloud/custom-metrics-chart-page.md %}).

{% assign types = site.data.metrics | map: "metric_type" | uniq %}
{% comment %} Fetch the list of all metric types {% endcomment %}

{% for t in types %} {% comment %} Iterate through the types. {% endcomment %}

## {{ t }}

    {% assign metrics = site.data.metrics | where: "metric_type", t | sort: "metric_id" | where_exp: "metrics", "metrics.deploy_serverless == true"%}
    {% comment %} Fetch all metrics for that metric_type. {% endcomment %}

<table>
    <thead>
        <tr>
            <td><b>CockroachDB Metric Name</b></td>
            <td><b>Short Name</b></td>
            <td><b>Description</b></td>
            <td><b>Usage</b></td>
            <td><b>Metrics tab</b></td>
        </tr>
    </thead>
    <tbody>    
    {% for m in metrics %} {% comment %} Iterate through the metrics. {% endcomment %}
        {% assign metrics-list = site.data.metrics-list | where: "metric", m.metric_id %}
        {% comment %} Get the row from the metrics-list with the given metric_id. {% endcomment %}
        {% comment %} The metrics-list is generated using: cockroach gen metric-list --format=csv > metrics-list.csv and then changing the case of the headers to lowercase to work with liquid. {% endcomment %}
        {% assign tab_array = m.metric_ui_tab | remove: '["' | remove: '"]'| split: "," %}
        
            <tr>
            <td><code>{{ m.metric_id }}</code><a id="{{ m.metric_id }}"></a></td>
            <td>{{ m.short_name }}</td>
            <td>{{ metrics-list[0].description}}</td>
            <td>{% include metrics-usage/{{ m.metric_id }}.md %}</td>
            <td>{% for t in tab_array %}
                    {% if t contains "Custom" %}
                        <a href="https://www.cockroachlabs.com/docs/cockroachcloud/custom-metrics-chart-page">{{ t | remove: '"' | strip }}</a>{%- unless forloop.last -%}, {% endunless %}
                    {% else %}
                        <a href="https://www.cockroachlabs.com/docs/cockroachcloud/metrics-{{ t | remove: '"' | strip | downcase | replace: ' ', '-' }}">{{ t | remove: '"' | strip }}</a>{%- unless forloop.last -%}, {% endunless %}
                    {% endif %}
                {% endfor %}</td>
        </tr>
    {% endfor %} {% comment %} metrics {% endcomment %}
    </tbody>
</table>

{% endfor %} {% comment %} types {% endcomment %}