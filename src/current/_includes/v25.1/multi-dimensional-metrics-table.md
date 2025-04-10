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
        {% assign metrics-list = site.data[version].metrics.metrics-list | where: "metric", m.multi_dimensional_metric_id %}
        {% comment %} Get the row from the metrics-list with the given child_metric_id. {% endcomment %}
            <tr>
            <td><div id="{{ m.child_metric_id }}" class="anchored"><code>{{ m.multi_dimensional_metric_id }}</code></div></td>
            <td>{% if metrics-list[0].description == null %}{{ m.description }}{% else %}{{ metrics-list[0].description }}{% endif %}</td>
            <td>{% if metrics-list[0].type == null %}{{ m.type }}{% else %}{{ metrics-list[0].type }}{% endif %}</td>
            <td>{% if metrics-list[0].unit == null %}{{ m.unit }}{% else %}{{ metrics-list[0].unit }}{% endif %}</td>
        </tr>
    {% endfor %} {% comment %} metrics {% endcomment %}
    </tbody>
</table>