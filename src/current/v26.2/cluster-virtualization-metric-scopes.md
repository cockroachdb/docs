---
title: Cluster Metric Scopes with Cluster Virtualization enabled
summary: Learn which metrics are scoped to the system virtual cluster and to virtual clusters when Cluster Virtualization is enabled.
toc: true
docs_area: deploy
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}

Refer to the [Cluster Virtualization Overview]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}#known-limitations) for further detail.
{{site.data.alerts.end}}

When [cluster virtualization]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}) is enabled, each metric has a scope. For descriptions and details about each cluster metric, refer to [Metrics]({% link {{ page.version.version }}/metrics.md %}).

- When a metric is scoped to a non-system virtual cluster, the metric is tracked separately for each virtual cluster (including the system virtual cluster). Most metrics are scoped to a virtual cluster. Refer to [Metrics scoped to a virtual cluster](#metrics-scoped-to-a-virtual-cluster).
- When a metric is scoped to the system virtual cluster, it is included only in the metrics for the system virtual cluster. These metrics provide information about the underlying CockroachDB cluster's performance. Refer to [Metrics scoped to the system virtual cluster](#metrics-scoped-to-the-system-virtual-cluster).

{{site.data.alerts.callout_info}}
To retrieve both system (node-level) and virtual cluster metrics, scrape the [Prometheus endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}) with the `cluster=system` query parameter. If you set the [`server.controller.default_target_cluster` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}), the endpoint without this parameter exposes metrics only for the specified virtual cluster.
{{site.data.alerts.end}}

{% comment %}
Layers
APPLICATION: Scoped to a virtual cluster
STORAGE: Scoped to the system virtual cluster
SERVER: n/a
{% endcomment %}

{% assign version = page.version.version | replace: ".", "" %}
{% comment %}version: {{ version }}{% endcomment %}

## Metrics scoped to a virtual cluster

{% comment %}LAYER=APPLICATION{% endcomment %}

{% assign names_string = "" %}

{% for layer in site.data[version].metrics.metrics.layers %}
  {% comment %}layer: {{ layer.name }}{% endcomment %}
  {% if layer.name == "APPLICATION" %}
    {% for category in layer.categories %}
        {% comment %}category: {{ category.name }}{% endcomment %}
      {% for metric in category.metrics %}
        {% assign names_string = names_string | append: metric.name | append: "||" %}
      {% endfor %}
    {% endfor %}
  {% endif %}
{% endfor %}

{% comment %}names_string: {{ names_string }}{% endcomment %}

{% assign name_list = names_string | split: "||" | uniq | sort %}

<ul>
  {% for name in name_list %}
    {% unless name == "" %}
      <li><code>{{ name }}</code></li>
    {% endunless %}
  {% endfor %}
</ul>

## Metrics scoped to the system virtual cluster

{% comment %}LAYER=STORAGE{% endcomment %}

{% assign names_string = "" %}

{% for layer in site.data[version].metrics.metrics.layers %}
  {% comment %}layer: {{ layer.name }}{% endcomment %}
  {% if layer.name == "STORAGE" %}
    {% for category in layer.categories %}
        {% comment %}category: {{ category.name }}{% endcomment %}
      {% for metric in category.metrics %}
        {% assign names_string = names_string | append: metric.name | append: "||" %}
      {% endfor %}
    {% endfor %}
  {% endif %}
{% endfor %}

{% comment %}names_string: {{ names_string }}{% endcomment %}

{% assign name_list = names_string | split: "||" | uniq | sort %}

<ul>
  {% for name in name_list %}
    {% unless name == "" %}
      <li><code>{{ name }}</code></li>
    {% endunless %}
  {% endfor %}
</ul>

## See also

- [Cluster Virtualization Overview]({% link {{ page.version.version }}/cluster-virtualization-overview.md %})
- [Cluster Setting Scopes with Cluster Virtualization Enabled]({% link {{ page.version.version }}/cluster-virtualization-setting-scopes.md %})
- [Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})
