---
title: Statements Page
summary: How to use the Statements page to view and manage SQL statements on CockroachDB Cloud.
toc: true
cloud: true
docs_area: manage
---

{% capture version_prefix %}{{site.current_cloud_version}}/{% endcapture %}

Viewing the Statements page requires the [Cluster Monitor]({% link "cockroachcloud/authorization.md" %}#cluster-monitor), [Cluster Operator]({% link "cockroachcloud/authorization.md" %}#cluster-operator), or [Cluster Admin]({% link "cockroachcloud/authorization.md" %}#cluster-admin) role.

{% dynamic_include version_prefix, "ui/statements-views.md" %}

{% dynamic_include version_prefix, "ui/statements-filter.md" %}

## Statement statistics

{% dynamic_include version_prefix, "ui/statistics.md" %}

{% dynamic_include version_prefix, "ui/statement-fingerprints.md" %}

{% dynamic_include version_prefix, "ui/statements-table.md" %}

{% dynamic_include version_prefix, "ui/statement-details.md" %}

{% dynamic_include version_prefix, "ui/active-statement-executions.md" %}
