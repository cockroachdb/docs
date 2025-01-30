---
title: Insights Page
summary: The Insights page exposes problems that CockroachDB has detected in your workloads and schemas.
toc: true
cloud: true
docs_area: manage
---

{% capture link_prefix %}../{{site.current_cloud_version}}/{% endcapture %}
{% assign page_prefix = "" %}
{% capture version_prefix %}{{site.current_cloud_version}}/{% endcapture %}

The **Insights** page of the CockroachDB {{ site.data.products.cloud }} Console helps you:

- Identify SQL statements with [high retry counts]({{ site.current_cloud_version }}/transactions.md#automatic-retries), [slow execution]({{ site.current_cloud_version }}/query-behavior-troubleshooting.md#identify-slow-queries), or [suboptimal plans]({{ site.current_cloud_version }}/cost-based-optimizer.md).
- Identify [indexes]({{ site.current_cloud_version }}/indexes.md) that should be created, altered, replaced, or dropped to improve performance.

To view this page, select a cluster from the [**Clusters** page](cluster-management.md#view-clusters-page), and click **Insights** in the **Monitoring** section of the left side navigation.



## See also

- [Statements page](statements-page.md)
- [Transactions page](transactions-page.md)
- [Databases page](databases-page.md)
