{% assign version = page.version.version | replace: ".", "" %}

{% comment %} Build list1 from metrics.yaml where visibility is ESSENTIAL or SUPPORT {% endcomment %}
{% assign list1 = "" | split: "" %}
{% for layer in site.data[version].metrics.metrics.layers %}
  {% for category in layer.categories %}
    {% for metric in category.metrics %}
      {% if metric.visibility == 'ESSENTIAL' or metric.visibility == 'SUPPORT' %}
        {% assign list1 = list1 | push: metric %}
      {% endif %}
    {% endfor %}
  {% endfor %}
{% endfor %}

{% comment %} Build list2 from available-metrics-not-in-metrics-list.yaml where visibility is ESSENTIAL or SUPPORT {% endcomment %}
{% assign list2 = "" | split: "" %}
{% for metric in site.data[version].metrics.available-metrics-not-in-metrics-list %}
  {% if metric.visibility == 'ESSENTIAL' or metric.visibility == 'SUPPORT' %}
    {% assign list2 = list2 | push: metric %}
  {% endif %}
{% endfor %}

{% assign available_metrics_combined = list1 | concat: list2 %}
{% assign available_metrics_sorted = available_metrics_combined | sort: "name" %}

<table markdown="1">
    <thead>
        <tr>
            <th>CockroachDB Metric Name</th>
            <th>Description</th>
            <th>Type</th>
            <th>Unit</th>
            {%- if page.name != "ui-custom-chart-debug-page.md" -%}<th>Supported Deployments</th>{%- endif -%}
        </tr>
    </thead>
    <tbody>
    {% for m in available_metrics_sorted %} {% comment %} Iterate through the available_metrics. {% endcomment %}
            <tr>
            <td><div id="{{ m.name }}" class="anchored"><code>{{ m.name }}</code></div></td>
            <td>{{ m.description }}</td>
            <td>{{ m.type }}</td>
            <td>{{ m.unit }}</td>
            {%- if page.name != "ui-custom-chart-debug-page.md" -%}
            <td>
                {%- assign key = m.name | replace: '.', '_'  | replace: '-', '_'-%}{%- comment -%} Replace periods and hyphens with underscores to normalize. {%- endcomment -%}
                {%- comment -%}
                - If in shared_metrics.yaml      -> "Standard/Advanced/self-hosted"
                - Else if in crdb_metrics.yaml   -> "Advanced/self-hosted"
                - Else if in tenant_metrics.yaml -> "Standard/self-hosted"
                - Else                           -> "self-hosted"
                {%- endcomment -%}
    
                {%- assign shared_match  = site.data[version].metrics.export.shared_metrics.metrics[key] -%}
                {%- assign crdb_match    = site.data[version].metrics.export.crdb_metrics.metrics[key] -%}
                {%- assign tenant_match  = site.data[version].metrics.export.tenant_metrics.metrics[key] -%}

                {%- if shared_match -%}{{ site.data.products.standard }}/{{ site.data.products.advanced }}/{{ site.data.products.core }}
                {%- elsif crdb_match -%}{{ site.data.products.advanced }}/{{ site.data.products.core }}
                {%- elsif tenant_match -%}{{ site.data.products.standard }}/{{ site.data.products.core }}
                {%- else -%}{{ site.data.products.core }}
                {%- endif -%}
            </td>
            {%- endif -%}{% comment %} page.name {% endcomment %}
        </tr>
    {% endfor %} {% comment %} metrics {% endcomment %}
    </tbody>
</table>

{% assign total_metrics = available_metrics_sorted | size %}
**Total metrics ({{ total_metrics }})**
