---
title: Cluster Setting Scopes with Cluster Virtualization enabled
summary: Learn which cluster settings are scoped to the system virtual cluster and to virtual clusters when Cluster Virtualization is enabled.
toc: true
docs_area: deploy
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}

Refer to the [Cluster Virtualization Overview]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}#known-limitations) for further detail.
{{site.data.alerts.end}}

When [cluster virtualization]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}) is enabled, each cluster setting has a scope, which may be a virtual cluster or the system virtual cluster. This page categorizes each public cluster setting by scope. For descriptions and details about each public cluster setting, refer to [Cluster Settings]({% link {{ page.version.version }}/cluster-settings.md %}).

- When a cluster setting is scoped to a virtual cluster, it affects only a virtual cluster and not the system virtual cluster. To configure a cluster setting that is scoped to a virtual cluster, you must have the `admin` role on it, and you must connect to it before configuring the setting. The majority of cluster settings are scoped to a virtual cluster and are visible only when connected to it.
- When a cluster setting is scoped to the system virtual cluster, it affects the entire CockroachDB cluster. To configure a cluster setting that is scoped to the system virtual cluster, you must have the `admin` role on the system virtual cluster, and you must connect to the system virtual cluster before configuring the setting. For example, the cluster setting `admission.disk_bandwidth_tokens.elastic.enabled` is scoped to the system virtual cluster.
- When a cluster setting is system-visible, it can be set only from the system virtual cluster but can be queried from any virtual cluster. For example, a virtual cluster can query a system-visible cluster setting's value, such as `storage.max_sync_duration`, to help adapt to the CockroachDB cluster's configuration.

{% comment %}
Src: `cockroach gen settings-list --show-class --format=csv > cluster-settings.csv` against cockroach-{version}.darwin-11.0-arm64;
lower-case headers of cluster-settings.csv: setting,type,default,description,class
copy cluster-settings.csv to _data/{version}/

Also saved in https://docs.google.com/spreadsheets/d/1HIalzAhwU0CEYzSuG2m1aXSJRpiIyQPJdt8SusHpJ_U/edit?usp=sharing
(shared CRL-internal). Sort by the Class column, then Settings column, and paste into the correct section below.

application: Scoped to a virtual cluster
system-only: Scoped to the system virtual cluster
system-visible: Can be set / modified only from the system virtual cluster, but can be viewed from a VC
{% endcomment %}

{% assign version = page.version.version | replace: ".", "" %}
{% comment %}version: {{ version }}{% endcomment %}

## Cluster settings scoped to a virtual cluster

{% comment %}Class=application{% endcomment %}

{% assign app_settings_string = "" %}

{% for row in site.data[version].cluster-settings %}
  {% if row.class == "application" %}
    {% assign app_settings_string = app_settings_string | append: row.setting | append: "||" %}
  {% endif %}
{% endfor %}

{% assign app_settings = app_settings_string | split: "||" | uniq | sort %}

<ul>
  {% for setting in app_settings %}
    {% unless setting == "" %}
      <li><code>{{ setting }}</code></li>
    {% endunless %}
  {% endfor %}
</ul>

## Cluster settings scoped to the system virtual cluster

{% comment %}Class=system-only{% endcomment %}

{% assign app_settings_string = "" %}

{% for row in site.data[version].cluster-settings %}
  {% if row.class == "system-only" %}
    {% assign app_settings_string = app_settings_string | append: row.setting | append: "||" %}
  {% endif %}
{% endfor %}

{% assign app_settings = app_settings_string | split: "||" | uniq | sort %}

<ul>
  {% for setting in app_settings %}
    {% unless setting == "" %}
      <li><code>{{ setting }}</code></li>
    {% endunless %}
  {% endfor %}
</ul>

## System-visible cluster settings

{% comment %}Class=system-visible{% endcomment %}

{% assign app_settings_string = "" %}

{% for row in site.data[version].cluster-settings %}
  {% if row.class == "system-visible" %}
    {% assign app_settings_string = app_settings_string | append: row.setting | append: "||" %}
  {% endif %}
{% endfor %}

{% assign app_settings = app_settings_string | split: "||" | uniq | sort %}

<ul>
  {% for setting in app_settings %}
    {% unless setting == "" %}
      <li><code>{{ setting }}</code></li>
    {% endunless %}
  {% endfor %}
</ul>

## See also

- [Cluster Virtualization Overview]({% link {{ page.version.version }}/cluster-virtualization-overview.md %})
- [Cluster Metric Scopes with Cluster Virtualization Enabled]({% link {{ page.version.version }}/cluster-virtualization-metric-scopes.md %})
- [Physical Cluster Replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})
