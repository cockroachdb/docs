{% assign version = page.version.version | replace: ".", "" %}
{% comment %}DEBUG: {{ version }}{% endcomment %}

{% comment %} STEP 1. Assign variables specific to deployment {% endcomment %}
{% if include.deployment == 'self-hosted' %}
  {% assign metrics_datadog = site.data[version].metrics.datadog-cockroachdb %}
  {% assign datadog_link = "https://docs.datadoghq.com/integrations/cockroachdb/?tab=host#metrics" %}
  {% assign datadog_prefix = "cockroachdb" %}
  {% assign category_order = "HARDWARE,STORAGE,OVERLOAD,NETWORKING,DISTRIBUTED,REPLICATION,SQL,CHANGEFEEDS,TTL,CROSS_CLUSTER_REPLICATION,LOGICAL_DATA_REPLICATION,UNSET," %}

These essential CockroachDB metrics let you monitor your CockroachDB {{ site.data.products.core }} cluster. Use them to build custom dashboards with the following tools:

- [Grafana]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}#step-5-visualize-metrics-in-grafana)
- [Datadog Integration]({% link {{ page.version.version }}/datadog.md %}): The [**Datadog Integration Metric Name**]({{ datadog_link }}) column lists the corresponding Datadog metric which requires the `{{ datadog_prefix }}.` prefix.

{% elsif include.deployment == 'advanced' %}
  {% assign metrics_datadog = site.data[version].metrics.datadog-crdb-dedicated %}
  {% assign datadog_link = "https://docs.datadoghq.com/integrations/cockroach-cloud/#metrics" %}
  {% assign datadog_prefix = "crdb_dedicated" %}
{% comment %} Removed NETWORKING AND LOGICAL_DATA_REPLICATION categories for advanced deployment {% endcomment %}
  {% assign category_order = "HARDWARE,STORAGE,OVERLOAD,DISTRIBUTED,REPLICATION,SQL,CHANGEFEEDS,TTL,CROSS_CLUSTER_REPLICATION,UNSET," %}

  {% comment %} Build list of allowed metrics from export YAML files {% endcomment %}
  {% assign crdb_metrics = site.data[version].metrics.export.crdb_metrics.metrics %}
  {% assign shared_metrics = site.data[version].metrics.export.shared_metrics.metrics %}

  {% comment %} Extract metric names into a combined string for lookup {% endcomment %}
  {% assign advanced_allowed_metrics = "|" %}
  {% for metric_pair in crdb_metrics %}
    {% assign metric_name = metric_pair[0] %}
    {% assign advanced_allowed_metrics = advanced_allowed_metrics | append: metric_name | append: "|" %}
  {% endfor %}
  {% for metric_pair in shared_metrics %}
    {% assign metric_name = metric_pair[0] %}
    {% assign advanced_allowed_metrics = advanced_allowed_metrics | append: metric_name | append: "|" %}
  {% endfor %}
  {% comment %}DEBUG: advanced_allowed_metrics length = {{ advanced_allowed_metrics | size }}{% endcomment %}

These essential CockroachDB metrics let you monitor your CockroachDB {{ site.data.products.advanced }} cluster. Use them to build custom dashboards with the following tools:

- [Datadog integration]({% link cockroachcloud/tools-page.md %}#monitor-cockroachdb-cloud-with-datadog) - The [**Datadog Integration Metric Name**]({{ datadog_link }}) column lists the corresponding Datadog metric which requires the `{{ datadog_prefix }}` prefix.
- [Metrics export]({% link cockroachcloud/export-metrics-advanced.md %})

{% endif %}

The **Usage** column explains why each metric is important to visualize and how to make both practical and actionable use of the metric in a production deployment.

{% assign layers = site.data[version].metrics.metrics.layers %}

{% comment %} STEP 2. Create array of layer names {% endcomment %}
{% assign layer_names_string = "" %}
{% for layer in layers %}
  {% assign layer_names_string = layer_names_string | append: layer.name | append: "," %}
{% endfor %}

{% comment %}DEBUG: layer_names_string = {{ layer_names_string }}{% endcomment %}
{% assign layer_names_array = layer_names_string | split: "," %}

{% comment %} STEP 3. Create array of unique category names {% endcomment %}
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
{% assign category_names_string_ordered = category_names_string | replace: "CHANGEFEEDS,CROSS_CLUSTER_REPLICATION,DISTRIBUTED,LOGICAL_DATA_REPLICATION,NETWORKING,SQL,TTL,UNSET,HARDWARE,OVERLOAD,STORAGE,", category_order  %}
{% comment %}DEBUG: category_names_string_ordered = {{ category_names_string_ordered }}{% endcomment %}
{% assign category_names_array = category_names_string_ordered | split: "," %}

{% comment %} STEP 4. Create sections for each unique category. For example, both APPLICATION and STORAGE layers have a SQL category, however only one SQL category will be created. {% endcomment %}
{% for category_name in category_names_array %}
  {% if category_name != "" %}

    {% comment %} STEP 4a. Loop 1 to count essential metrics {% endcomment %}
    {% assign essential_metrics_total = 0 %}
    {% for layer_name in layer_names_array %}
      
      {% assign layer = layers | where_exp: "l", "l.name == layer_name" %}      
      {% assign category = layer[0].categories | where_exp: "c", "c.name == category_name" %}
      {% assign essential_metrics = category[0].metrics | where_exp: "m", "m.essential == true or m.visibility == 'ESSENTIAL'" %}
      {% if essential_metrics.size > 0 %}
        {% comment %}DEBUG: 1 {{ layer_name }} 2 {{ layer[0].name }} 3 {{ category[0].name }} {{ essential_metrics.size }}{% endcomment %}
        {% assign essential_metrics_total = essential_metrics_total | plus: essential_metrics.size %}
      {% endif %}{% comment %}if essential_metrics.size > 0{% endcomment %}

    {% endfor %}{% comment %}for layer in layer_names_array{% endcomment %}

    {% comment %} STEP 4b. Only create a section for a category if essential metrics exist. For example, the UNSET category does not have any essential metrics.{% endcomment %}
    {% if essential_metrics_total > 0 %}

      {% comment %} Transform category_name to user-facing name. {% endcomment %}
      {% if category_name == "HARDWARE" %}{% assign category_display_name = "Platform" %}
      {% elsif category_name == "STORAGE" %}{% assign category_display_name = "Storage" %}
      {% elsif category_name == "OVERLOAD" %}{% assign category_display_name = "Health" %}
      {% elsif category_name == "NETWORKING" %}{% assign category_display_name = "Network" %}
      {% elsif category_name == "DISTRIBUTED" %}{% assign category_display_name = "KV Distributed" %}
      {% elsif category_name == "REPLICATION" %}{% assign category_display_name = "KV Replication" %}
      {% elsif category_name == "CHANGEFEEDS" %}{% assign category_display_name = "Changefeeds" %}
      {% elsif category_name == "TTL" %}{% assign category_display_name = "Row-level TTL" %}
      {% elsif category_name == "CROSS_CLUSTER_REPLICATION" %}{% assign category_display_name = "Physical Replication" %}
      {% elsif category_name == "LOGICAL_DATA_REPLICATION" %}{% assign category_display_name = "Logical Replication" %}
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

      {% comment %} STEP 4c. Loop 2 to create essential metric rows for category{% endcomment %}
      {% for layer_name in layer_names_array %}
        
        {% assign layer = layers | where_exp: "l", "l.name == layer_name" %}
        {% assign category = layer[0].categories | where_exp: "c", "c.name == category_name" %}
        {% assign essential_metrics = category[0].metrics | where_exp: "m", "m.essential == true or m.visibility == 'ESSENTIAL'" %}     
        {% comment %}DEBUG: 1 {{ layer_name }} 2 {{ layer[0].name }} 3 {{ category[0].name }}{% endcomment %} 

        {% for metric in essential_metrics %}
        {% comment %} STEP 4d. Exclude SQL metrics that will be placed in special categories {% endcomment %}
        {% unless category_name == SQL %}
          {% comment %} For advanced deployment, only show metrics that exist in export YAML files {% endcomment %}
          {% assign metric_normalized = metric.name | replace: ".", "_" | replace: "-", "_" %}
          {% assign show_metric = false %}
          {% if include.deployment == 'self-hosted' %}
            {% assign show_metric = true %}
          {% elsif advanced_allowed_metrics contains metric_normalized %}
            {% assign show_metric = true %}
          {% endif %}

          {% if show_metric %}
            {% unless metric.name contains "backup" or metric.name contains "BACKUP" or metric.name contains "create_stats" %}

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
            {% comment %} For self-hosted, add labeled_name if exists. advanced does not yet support metrics endpoint. {% endcomment %}
            <br>{% if include.deployment == 'self-hosted' %}{% if metric.labeled_name %}[<code>metrics</code> endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}#metrics):<br><code>{{ metric.labeled_name }}</code>{% endif %}{% endif %}
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

            {% endunless %}{% comment %}unless metric.name contains "backup" or metric.name contains "BACKUP" or metric.name contains "create_stats"{% endcomment %}
          {% endif %}{% comment %}if show_metric{% endcomment %}
        {% endunless %}{% comment %}unless category_name == SQL{% endcomment %}
        {% endfor %}{% comment %}for metric in essential_metrics{% endcomment %}
      {% endfor %}{% comment %}for layer in layer_names_array{% endcomment %}

    </tbody>
</table>

    {% endif %}{% comment %}essential_metrics_total > 0{% endcomment %}

    {% comment %} STEP 4e. Create SQL special categories {% endcomment %}
    {% if category_name == "SQL" %}
      {% assign layer = layers | where_exp: "l", "l.name == 'APPLICATION'" %}
      {% assign category = layer[0].categories | where_exp: "c", "c.name == category_name" %}
      {% assign essential_metrics = category[0].metrics | where_exp: "m", "m.essential == true or m.visibility == 'ESSENTIAL'" %}
    {% if include.deployment == 'self-hosted' %}
## Table Statistics

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
        {% if metric.name contains "create_stats" %}

          {% assign metric_link = metric.name | replace: "_", "-" | replace: ".", "-" %}

        <tr>
            <td><div id="{{ metric_link }}" class="anchored"><code>{{ metric.name }}</code></div>
            {% comment %} For self-hosted, add labeled_name if exists. advanced does not yet support metrics endpoint. {% endcomment %}
            <br>{% if include.deployment == 'self-hosted' %}{% if metric.labeled_name %}[<code>metrics</code> endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}#metrics):<br><code>{{ metric.labeled_name }}</code>{% endif %}{% endif %}
            </td>
            <td><code>{{ metric.name }}</code>
            </td>
            <td>{{ metric.description }}</td>
            <td>{{ metric.how_to_use }}</td>
        </tr>

        {% endif %}{% comment %}if metric.name contains "create_stats"{% endcomment %}
      {% endfor %}

    </tbody>
</table>
    {% endif %}{% comment %}if include.deployment == 'self-hosted' {% endcomment %}

## Disaster Recovery

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
        {% if metric.name contains "backup" or metric.name contains "BACKUP" %}
          {% comment %} For advanced deployment, only show metrics that exist in export YAML files {% endcomment %}
          {% assign metric_normalized = metric.name | replace: ".", "_" | replace: "-", "_" %}
          {% assign show_metric = false %}
          {% if include.deployment == 'self-hosted' %}
            {% assign show_metric = true %}
          {% elsif advanced_allowed_metrics contains metric_normalized %}
            {% assign show_metric = true %}
          {% endif %}

          {% if show_metric %}
          {% assign metric_link = metric.name | replace: "_", "-" | replace: ".", "-" %}

        <tr>
            <td><div id="{{ metric_link }}" class="anchored"><code>{{ metric.name }}</code></div>
            {% comment %} For self-hosted, add labeled_name if exists. advanced does not yet support metrics endpoint. {% endcomment %}
            <br>{% if include.deployment == 'self-hosted' %}{% if metric.labeled_name %}[<code>metrics</code> endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}#metrics):<br><code>{{ metric.labeled_name }}</code>{% endif %}{% endif %}
            </td>
            <td><code>{{ metric.name }}</code>
            </td>
            <td>{{ metric.description }}</td>
            <td>{{ metric.how_to_use }}</td>
        </tr>

          {% endif %}{% comment %}if show_metric{% endcomment %}
        {% endif %}{% comment %}if metric.name contains "backup" or metric.name contains "BACKUP"{% endcomment %}
      {% endfor %}

    </tbody>
</table>

    {% endif %}{% comment %}if category_name == "SQL"{% endcomment %}

  {% endif %}{% comment %}if category_name != ""{% endcomment %}
{% endfor %}{% comment %}for category_name in category_names_array{% endcomment %}

{% comment %} STEP 5. Add category for metrics that are not in metrics.yaml{% endcomment %}
{% if include.deployment == 'self-hosted' %}
  {% assign essential_metrics = site.data[version].metrics.available-metrics-not-in-metrics-list | where: "visibility", "ESSENTIAL" %}
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
        
          {% assign metric_link = metric.name | replace: "_", "-" | replace: ".", "-" %}

        <tr>
            <td><div id="{{ metric_link }}" class="anchored"><code>{{ metric.name }}</code></div>
            {% comment %} For self-hosted, add labeled_name if exists. advanced does not yet support metrics endpoint {% endcomment %}
            <br>{% if include.deployment == 'self-hosted' %}{% if metric.labeled_name %}[<code>metrics</code> endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}#metrics):<br><code>{{ metric.labeled_name }}</code>{% endif %}{% endif %}
            </td>
            <td><code>{{ metric.name }}</code>
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
