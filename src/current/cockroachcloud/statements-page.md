---
title: Statements Page
summary: How to use the Statements page to view and manage SQL statements on CockroachDB Cloud.
toc: true
cloud: true
docs_area: manage
---

{% capture version_prefix %}{{site.current_cloud_version}}/{% endcapture %}

Viewing the Statements page requires the [Cluster Monitor]({% link cockroachcloud/authorization.md %}#cluster-monitor), [Cluster Operator]({% link cockroachcloud/authorization.md %}#cluster-operator), or [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin) role.

{% include {{version_prefix}}ui/statements-views.md %}

{% include {{version_prefix}}ui/statements-filter.md %}

## Statement statistics

{% include {{version_prefix}}ui/statistics.md %}

{% include {{version_prefix}}ui/statement-fingerprints.md %}

{% include {{version_prefix}}ui/statements-table.md %}

{% include {{version_prefix}}ui/statement-details.md %}

{% include {{version_prefix}}ui/active-statement-executions.md %}
