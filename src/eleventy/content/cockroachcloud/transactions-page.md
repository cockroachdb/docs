---
title: Transactions Page
summary: The Transactions page helps you identify frequently retried or high latency transactions and view transaction details.
toc: true
cloud: true
docs_area: manage
---

{% capture version_prefix %}{{site.current_cloud_version}}/{% endcapture %}

Viewing the Transactions page requires the [Cluster Monitor]({% link "cockroachcloud/authorization.md" %}#cluster-monitor), [Cluster Operator]({% link "cockroachcloud/authorization.md" %}#cluster-operator), or [Cluster Admin]({% link "cockroachcloud/authorization.md" %}#cluster-admin) role.

{% dynamic_include version_prefix, "ui/transactions-views.md" %}

{% dynamic_include version_prefix, "ui/transactions-filter.md" %}

## Transaction statistics

{% dynamic_include version_prefix, "ui/statistics.md" %}

{% include "common/ui/transactions-page.md" %}

{% dynamic_include version_prefix, "ui/transactions-table.md" %}

{% dynamic_include version_prefix, "ui/transaction-details.md" %}

{% dynamic_include version_prefix, "ui/active-transaction-executions.md" %}
