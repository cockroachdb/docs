---
title: Insights Page
summary: The Insights page exposes problems that CockroachDB has detected in your workloads and schemas.
toc: true
cloud: true
docs_area: manage
---

{% if page.cloud == true %}
  {% capture link_prefix %}../{{site.current_cloud_version}}/{% endcapture %}
  {% assign page_prefix = "" %}
{% else %}
  {% assign link_prefix = "" %}
  {% assign page_prefix = "ui-" %}
{% endif %}

{% capture version_prefix %}{{site.versions["stable"]}}/{% endcapture %}

The **Insights** page of the {{ site.data.products.db }} Console helps you:

- Identify SQL statements with [high retry counts](transactions.html#automatic-retries), [slow execution](query-behavior-troubleshooting.html#identify-slow-queries), or [suboptimal plans](cost-based-optimizer.html).
- Identify [indexes](indexes.html) that should be created, altered, replaced, or dropped to improve performance.

To view this page, select a cluster from the [**Clusters** page](cluster-management.html#view-clusters-page), and click **Insights** in the **Monitoring** section of the left side navigation.

{% include {{version_prefix}}ui/insights.md %}

## See also

- [Statements page](statements-page.html)
- [Transactions page](transactions-page.html)
- [Databases page](databases-page.html)
