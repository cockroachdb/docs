---
title: SQL metrics
summary: The SQL metrics let you monitor SQL performance.
toc: true
---

The SQL metrics let you monitor [SQL performance]({{site.current_cloud_version}}/make-queries-fast.md).

To view these graphs, select a cluster from the [**Clusters** page](cluster-management.md#view-clusters-page), and click **Metrics** in the **Monitoring** section of the left side navigation. On the **Metrics** page, click the **SQL** tab.

{% include "_includes/cockroachcloud/metrics-time-interval-selection.md" %}

{% assign tab = "SQL" %}
{% include "_includes/cockroachcloud/metrics-tab.md" %}

## See also

- [Metrics Overview](metrics.md)
- [Overview metrics tab](metrics-overview.md)
- [Request Unit metrics](metrics-request-units.md)
- [Changefeed metrics](metrics-changefeeds.md)
- [Row-Level TTL metrics](metrics-row-level-ttl.md)
- [Essential Metrics for {{ site.data.products.standard }}](metrics-essential.md)