---
title: Essential Metrics for CockroachDB Standard Deployments
summary: Learn about the recommended essential metrics for monitoring your CockroachDB Standard cluster.
toc: true
---

These essential CockroachDB metrics let you monitor your CockroachDB {{ site.data.products.standard }} cluster. The metrics are available on graphs on the tabs listed in the **Metrics tabs** column. Where **Custom** is listed, the metric may be graphed in a [**Custom Metrics Chart**]({% link cockroachcloud/custom-metrics-chart-page.md %}). The **Usage** column explains why each metric is important to visualize and how to make both practical and actionable use of the metric in a production deployment.

{% assign version = site.current_cloud_version | replace: ".", "" %}
{% assign types = site.data[version].metrics.metrics-cloud | map: "metric_type" | uniq %}
{% comment %} Fetch the list of all metric types {% endcomment %}

{% for t in types %} {% comment %} Iterate through the types. {% endcomment %}
{% unless t contains "Request Units" %} {% comment %} Request Units is only for Basic tier. {% endcomment %}
## {{ t }}

    {% assign metrics = site.data[version].metrics.metrics-cloud | where: "metric_type", t | sort: "metric_id" | where_exp: "metrics", "metrics.deploy_standard == true"%}
    {% comment %} Fetch all metrics for that metric_type. {% endcomment %}

<table markdown="1">
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
        {% comment %} Get the row from the metrics.yaml with the given metric_id. {% endcomment %}

        {% assign metrics-yaml = site.data[version].metrics.metrics %}
        {%- comment -%} Looks for a metric anywhere in the nested structure: layers -> categories -> metrics{%- endcomment -%}

        {%- assign found = "" -%}

        {%- for layer in metrics-yaml.layers -%}
            {%- for category in layer.categories -%}
                {%- assign metric = category.metrics | where: "name", m.metric_id | first -%}
                {%- if metric -%}
                    {%- assign found = metric -%}
                {%- endif -%}
            {%- endfor -%}
        {%- endfor -%}

        {% assign tab_array = m.metric_ui_tab | remove: '["' | remove: '"]'| split: "," %}
        
            <tr>
            <td><div id="{{ m.metric_id }}" class="anchored"><code>{{ m.metric_id }}</code></div></td>
            <td>{{ m.short_name }}</td>
            <td>{{ found.description}}</td>
            <td>{{ found.how_to_use }}{{ m.how_to_use }}</td>
            <td>{% for t in tab_array %}
                    {% if t contains "Custom" %}
                        [{{ t | remove: '"' | strip }}]({% link cockroachcloud/custom-metrics-chart-page.md %}){%- unless forloop.last -%}, {% endunless %}
                    {% else %}
                        [{{ t | remove: '"' | strip }}]({% link cockroachcloud/metrics-{{ t | remove: '"' | strip | downcase | replace: ' ', '-' }}.md %}){%- unless forloop.last -%}, {% endunless %}
                    {% endif %}
                {% endfor %}</td>
        </tr>
    {% endfor %} {% comment %} metrics {% endcomment %}
    </tbody>
</table>
{% endunless %}
{% endfor %} {% comment %} types {% endcomment %}

## See also

- [Metrics Overview]({% link cockroachcloud/metrics.md %})
- [Overview metrics]({% link cockroachcloud/metrics-overview.md %})
- [Request Unit metrics]({% link cockroachcloud/metrics-request-units.md %})
- [SQL metrics]({% link cockroachcloud/metrics-sql.md %})
- [Changefeed metrics]({% link cockroachcloud/metrics-changefeeds.md %})
- [Row-Level TTL metrics]({% link cockroachcloud/metrics-row-level-ttl.md %})