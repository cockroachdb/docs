{% assign version = page.version.version | replace: ".", "" %}
{% comment %}DEBUG: {{ version }}{% endcomment %}

These essential CockroachDB metrics let you monitor your CockroachDB {{ site.data.products.core }} cluster. Use them to build custom dashboards with the following tools:

{% comment %} Assign variables specific to deployment {% endcomment %}
{% if include.deployment == 'self-hosted' %}
  {% assign metrics_datadog = site.data[version].metrics.datadog-cockroachdb %}
  {% assign datadog_link = "https://docs.datadoghq.com/integrations/cockroachdb/?tab=host#metrics" %}
  {% assign datadog_prefix = "cockroachdb" %}
  {% assign category_order = "HARDWARE,STORAGE,OVERLOAD,NETWORKING,DISTRIBUTED,REPLICATION,SQL,CHANGEFEEDS,TTL,UNSET," %}

- [Grafana]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}#step-5-visualize-metrics-in-grafana)
- [Datadog Integration]({% link {{ page.version.version }}/datadog.md %}): The [**Datadog Integration Metric Name**]({{ datadog_link }}) column lists the corresponding Datadog metric which requires the `{{ datadog_prefix }}.` prefix.

{% elsif include.deployment == 'advanced' %}
  {% assign metrics_datadog = site.data[version].metrics.datadog-crdb-dedicated %}
  {% assign datadog_link = "https://docs.datadoghq.com/integrations/cockroach-cloud/#metrics" %}
  {% assign datadog_prefix = "crdb_dedicated" %}
  {% comment %} Removed NETWORKING category {% endcomment %}
  {% assign category_order = "HARDWARE,STORAGE,OVERLOAD,DISTRIBUTED,REPLICATION,SQL,CHANGEFEEDS,TTL,UNSET," %}

- [Datadog integration]({% link cockroachcloud/tools-page.md %}#monitor-cockroachdb-cloud-with-datadog) - The [**Datadog Integration Metric Name**]({{ datadog_link }}) column lists the corresponding Datadog metric which requires the `{{ datadog_prefix }}` prefix.
- [Metrics export]({% link cockroachcloud/export-metrics-advanced.md %})

{% endif %}

The **Usage** column explains why each metric is important to visualize and how to make both practical and actionable use of the metric in a production deployment.

{% assign layers = site.data[version].metrics.metrics.layers %}

{% comment %} Create layer name array {% endcomment %}
{% assign layer_names_string = "" %}
{% for layer in layers %}
  {% assign layer_names_string = layer_names_string | append: layer.name | append: "," %}
{% endfor %}
{% comment %} Order layers {% endcomment %}
{% comment %}DEBUG: layer_names_string = {{ layer_names_string }}{% endcomment %}
{% assign layer_names_array = layer_names_string | split: "," %}

{% comment %} Create string of unique category names {% endcomment %}
{% assign category_names_string = "" %}
{% for layer_name in layer_names_array %}
  {% assign layer = layers | where_exp: "l", "l.name == layer_name" %} 
  {% comment %}DEBUG: layer_name = {{ layer_name }}{% endcomment %}

  {% for category in layer[0].categories %}
    {% comment %}DEBUG: category.name = {{ category.name }}{% endcomment %}
    {% unless category_names_string contains category.name %}
      {% assign category_names_string = category_names_string | append: category.name | append: "," %}
    {% endunless %}

  {% endfor %}

{% endfor %}

{% comment %} Order categories, NOTE: new categories may break this order, however all relevant categories will be displayed though not in the desired order{% endcomment %}
{% comment %}DEBUG: category_names_string = {{ category_names_string }}{% endcomment %}
{% assign category_names_string_ordered = category_names_string | replace: "CHANGEFEEDS,DISTRIBUTED,NETWORKING,SQL,TTL,UNSET,HARDWARE,OVERLOAD,REPLICATION,STORAGE,", category_order  %}
{% comment %}DEBUG: category_names_string_ordered = {{ category_names_string_ordered }}{% endcomment %}
{% assign category_names_array = category_names_string_ordered | split: "," %}

{% comment %} Create sections for each unique category. For example, both APPLICATION and STORAGE layers have a SQL category. {% endcomment %}
{% for category_name in category_names_array %}
  {% if category_name != "" %}

    {% comment %} Create sections for each unique category {% endcomment %}
    {% comment %} Loop 1 to count essential metrics {% endcomment %}
    {% assign essential_metrics_total = 0 %}
    {% for layer_name in layer_names_array %}
      
      {% assign layer = layers | where_exp: "l", "l.name == layer_name" %}      
      {% assign category = layer[0].categories | where_exp: "c", "c.name == category_name" %}
      {% assign essential_metrics = category[0].metrics | where: "essential", true %}     
      {% if essential_metrics.size > 0 %}
        {% comment %}DEBUG: 1 {{ layer_name }} 2 {{ layer[0].name }} 3 {{ category[0].name }} {{ essential_metrics.size }}{% endcomment %}
        {% assign essential_metrics_total = essential_metrics_total | plus: essential_metrics.size %}
      {% endif %}{% comment %}if essential_metrics.size > 0{% endcomment %}

    {% endfor %}{% comment %}for layer in layer_names_array{% endcomment %}

    {% comment %} Only create a section for a category if essential metrics exist. For example, the UNSET category does not have any essential metrics.{% endcomment %}
    {% if essential_metrics_total > 0 %}

      {% if category_name == "HARDWARE" %}{% assign category_display_name = "Platform" %}
      {% elsif category_name == "STORAGE" %}{% assign category_display_name = "Storage" %}
      {% elsif category_name == "OVERLOAD" %}{% assign category_display_name = "Health" %}
      {% elsif category_name == "NETWORKING" %}{% assign category_display_name = "Network" %}
      {% elsif category_name == "DISTRIBUTED" %}{% assign category_display_name = "KV Distributed" %}
      {% elsif category_name == "REPLICATION" %}{% assign category_display_name = "KV Replication" %}
      {% elsif category_name == "CHANGEFEEDS" %}{% assign category_display_name = "Changefeeds" %}
      {% elsif category_name == "TTL" %}{% assign category_display_name = "Row-level TTL" %}
      {% else %}{% assign category_display_name = category_name %}{% comment %} For example, SQL {% endcomment %}
      {% endif %}

## {{ category_display_name }}
{% comment %}DEBUG: {{ essential_metrics_total }} essential metrics{% endcomment %}

<table markdown="1">
    <thead>
        <tr>
            <th>CockroachDB Metric Name</th>
            <th>[Datadog Integration Metric Name]({{ datadog_link }})<br>(add `{{ datadog_prefix }}.` prefix)</th>
            <th>Description</th>
            <th>Usage</th>
        </tr>
    </thead>
    <tbody>

      {% comment %} Loop 2 to print essential metrics for category{% endcomment %}
      {% for layer_name in layer_names_array %}
        
        {% assign layer = layers | where_exp: "l", "l.name == layer_name" %}      
        {% assign category = layer[0].categories | where_exp: "c", "c.name == category_name" %}
        {% assign essential_metrics = category[0].metrics | where: "essential", true %}     
        {% comment %}DEBUG: 1 {{ layer_name }} 2 {{ layer[0].name }} 3 {{ category[0].name }}{% endcomment %} 

        {% for metric in essential_metrics %}

          {% comment %} Transforms to match datadog_id {% endcomment %}
          {% assign input_metric = metric.name %}
          {% assign match1 = metrics_datadog | where: "datadog_id", input_metric | first %}
          {% assign input_metric = metric.name | replace: "-", "." %}
          {% assign match2 = metrics_datadog | where: "datadog_id", input_metric | first %}
          {% assign input_metric = metric.name | append: ".count" %}
          {% assign match3 = metrics_datadog | where: "datadog_id", input_metric | first %}
          {% assign input_metric = metric.name | replace: "_", "." %}
          {% assign match4 = metrics_datadog | where: "datadog_id", input_metric | first %}
          {% assign input_metric = metric.name | replace: "-", "_" | append: ".count"  %}
          {% assign match5 = metrics_datadog | where: "datadog_id", input_metric | first %}
          {% assign input_metric = metric.name | replace: "-", "_" %}
          {% assign match6 = metrics_datadog | where: "datadog_id", input_metric | first %}
          {% assign input_metric = metric.name | append: ".total" %}
          {% assign match7 = metrics_datadog | where: "datadog_id", input_metric | first %}
        
          {% assign metric_link = metric.name | replace: "_", "-" | replace: ".", "-" %}

        <tr>
            <td><div id="{{ metric_link }}" class="anchored"><code>{{ metric.name }}</code></div>
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

        {% endfor %}{% comment %}for metric in essential_metrics{% endcomment %}
      {% endfor %}{% comment %}for layer in layer_names_array{% endcomment %}

    </tbody>
</table>
    {% endif %}{% comment %}essential_metrics_total > 0{% endcomment %}
  {% endif %}{% comment %}if category_name != ""{% endcomment %}
{% endfor %}{% comment %}for category_name in category_names_array{% endcomment %}

{% comment %} Add category for metrics that are not in metrics.yaml{% endcomment %}
{% if include.deployment == 'self-hosted' %}
  {% assign essential_metrics = site.data[version].metrics.available-metrics-not-in-metrics-list | where: "essential", true %}
## Expiration of license and certificates

<table markdown="1">
    <thead>
        <tr>
            <th>CockroachDB Metric Name</th>
            <th>[Datadog Integration Metric Name]({{ datadog_link }})<br>(add `{{ datadog_prefix }}.` prefix)</th>
            <th>Description</th>
            <th>Usage</th>
        </tr>
    </thead>
    <tbody>
        
        {% for metric in essential_metrics %}
        
          {% assign metric_link = metric.metric_id | replace: "_", "-" | replace: ".", "-" %}

        <tr>
            <td><div id="{{ metric_link }}" class="anchored"><code>{{ metric.metric_id }}</code></div>
            <br>{% if metric.labeled_name %}<code>metrics</code> endpoint:<br><code>{{ metric.labeled_name }}</code>{% endif %}
            </td>
            <td><code>{{ metric.metric_id }}</code>
            </td>
            <td>{{ metric.description }}</td>
            <td>{{ metric.how_to_use }}</td>
        </tr>

        {% endfor %}{% comment %}for metric in essential_metrics{% endcomment %}

    </tbody>
</table>
{% endif %}{% comment %}if include.deployment == 'self-hosted'{% endcomment %}

## See also

- [Available Metrics]({% link {{ page.version.version }}/metrics.md %}#available-metrics)
- [Monitor CockroachDB with Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %})
- [Visualize metrics in Grafana]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}#step-5-visualize-metrics-in-grafana)
- [Custom Chart Debug Page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %})
- [Cluster API]({% link {{ page.version.version }}/cluster-api.md %})
- [Essential Alerts]({% link {{ page.version.version }}/essential-alerts-self-hosted.md %})