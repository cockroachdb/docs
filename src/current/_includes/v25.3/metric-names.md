{% assign version = page.version.version | replace: ".", "" %}
{% assign list1 = site.data[version].metrics.available-metrics-in-metrics-list %}
{% assign list2 = site.data[version].metrics.available-metrics-not-in-metrics-list %}

{% assign available_metrics_combined = list1 | concat: list2 %}
{% assign available_metrics_sorted = available_metrics_combined | sort: "metric_id" %}

<table markdown="1">
    <thead>
        <tr>
            <td><b>CockroachDB Metric Name</b></td>
            <td><b>Description</b></td>
            <td><b>Type</b></td>
            <td><b>Unit</b></td>
        </tr>
    </thead>
    <tbody>    
    {% for m in available_metrics_sorted %} {% comment %} Iterate through the available_metrics. {% endcomment %}
        {% assign metrics-list = site.data[version].metrics.metrics-list | where: "metric", m.metric_id %}
        {% comment %} Get the row from the metrics-list with the given metric_id. {% endcomment %}
            <tr>
            <td><div id="{{ m.metric_id }}" class="anchored"><code>{{ m.metric_id }}</code></div></td>
            {% comment %} Use the value from the metrics-list, if any, followed by the value in the available-metrics-not-in-metrics-list, if any. {% endcomment %}
            <td>{{ metrics-list[0].description }}{{ m.description }}</td>
            <td>{{ metrics-list[0].type }}{{ m.type }}</td>
            <td>{{ metrics-list[0].unit }}{{ m.unit }}</td>
        </tr>
    {% endfor %} {% comment %} metrics {% endcomment %}
    </tbody>
</table>
