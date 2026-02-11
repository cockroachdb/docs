{% assign version = page.version.version | replace: ".", "" %}
{% assign metrics = site.data[version].metrics.multi-dimensional-metrics | where_exp: "metrics", "metrics.feature contains feature" | sort: "multi_dimensional_metric_id" %} 
{% comment %} Fetch multi-dimensional-metrics for given feature. {% endcomment %}

Following is a list of the metrics that have multi-dimensional metrics:

<table>
    <thead>
        <tr>
            <td><b>CockroachDB Metric Name</b></td>
            <td><b>{% if feature == "ldr" or feature == "detailed-latency" %}Description{% else %}Description When Aggregated{% endif %}</b></td>
            <td><b>Type</b></td>
            <td><b>Unit</b></td>
        </tr>
    </thead>
    <tbody>    
    {% for m in metrics %} {% comment %} Iterate through the metrics. {% endcomment %}
        {% comment %} Get the row from the metrics.yaml with the given multi_dimensional_metric_id. {% endcomment %}

        {% assign metrics-yaml = site.data[version].metrics.metrics %}
        {%- comment -%} Looks for a metric anywhere in the nested structure: layers -> categories -> metrics{%- endcomment -%}

        {%- assign found = "" -%}

        {%- for layer in metrics-yaml.layers -%}
            {%- for category in layer.categories -%}
                {%- assign metric = category.metrics | where: "name", m.multi_dimensional_metric_id | first -%}
                {%- if metric -%}
                    {%- assign found = metric -%}
                {%- endif -%}
            {%- endfor -%}
        {%- endfor -%}

            <tr>
            <td><div id="{{ m.multi_dimensional_metric_id }}" class="anchored"><code>{{ m.multi_dimensional_metric_id }}</code></div></td>
            <td>{% if found.description == null %}{{ m.description }}{% else %}{{ found.description }}{% endif %}</td>
            <td>{% if found.type == null %}{{ m.type }}{% else %}{{ found.type }}{% endif %}</td>
            <td>{% if found.unit == null %}{{ m.unit }}{% else %}{{ found.unit }}{% endif %}</td>
        </tr>
    {% endfor %} {% comment %} metrics {% endcomment %}
    </tbody>
</table>