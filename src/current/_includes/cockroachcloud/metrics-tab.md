{% assign version = site.current_cloud_version | replace: ".", "" %}
{% assign graphs = site.data[version].metrics.metrics-cloud | where_exp: "graphs", "graphs.metric_ui_tab contains tab" | map: "metric_ui_graph" | uniq %}

{% for g in graphs %} {% comment %} Iterate through the graphs. {% endcomment %}

## {{ g }}

{% assign metrics = site.data[version].metrics.metrics-cloud | where: "metric_ui_graph", g %}
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

            <tr>
            <td>{{ m.short_name }}</td>
            <td><div id="{{ m.metric_id }}" class="anchored"><code>{{ m.metric_id }}</code></div></td>
            <td>{{ found.description}}</td>
            <td>{{ found.how_to_use }}{{ m.how_to_use }}</td>
        </tr>
    {% endfor %} {% comment %} metrics {% endcomment %}
    </tbody>
</table>

{% endfor %} {% comment %} graphs {% endcomment %}