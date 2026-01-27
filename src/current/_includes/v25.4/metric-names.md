{% assign version = page.version.version | replace: ".", "" %}
{% assign list1 = site.data[version].metrics.available-metrics-in-metrics-list %}
{% assign list2 = site.data[version].metrics.available-metrics-not-in-metrics-list %}

{% assign available_metrics_combined = list1 | concat: list2 %}
{% assign available_metrics_sorted = available_metrics_combined | sort: "metric_id" %}

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
            <td><div id="{{ m.metric_id }}" class="anchored"><code>{{ m.metric_id }}</code></div></td>
            {% comment %} Use the found value from the metrics-yaml, if any, followed by the value in the available-metrics-not-in-metrics-list, if any. {% endcomment %}
            <td>{{ found.description }}{{ m.description }}</td>
            <td>{{ found.type }}{{ m.type }}</td>
            <td>{{ found.unit }}{{ m.unit }}</td>
            {%- if page.name != "ui-custom-chart-debug-page.md" -%}
            <td>
                {%- assign key = m.metric_id | replace: '.', '_'  | replace: '-', '_'-%}{%- comment -%} Replace periods and hyphens with underscores to normalize. {%- endcomment -%}
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
