---
title: SQL metrics
summary: The SQL metrics let you monitor SQL performance.
toc: true
---

The SQL metrics let you monitor [SQL performance]({% link "{{site.current_cloud_version}}/make-queries-fast.md" %}).

To view these graphs, select a cluster from the [**Clusters** page]({% link "cockroachcloud/cluster-management.md" %}#view-clusters-page), and click **Metrics** in the **Monitoring** section of the left side navigation. On the **Metrics** page, click the **SQL** tab.

{% include "cockroachcloud/metrics-time-interval-selection.md" %}

{% assign tab = "SQL" %}
{% include "cockroachcloud/metrics-tab.md" %}

## See also

- [Metrics Overview]({% link "cockroachcloud/metrics.md" %})
- [Overview metrics tab]({% link "cockroachcloud/metrics-overview.md" %})
- [Request Unit metrics]({% link "cockroachcloud/metrics-request-units.md" %})
- [Changefeed metrics]({% link "cockroachcloud/metrics-changefeeds.md" %})
- [Row-Level TTL metrics]({% link "cockroachcloud/metrics-row-level-ttl.md" %})
- [Essential Metrics for {{ site.data.products.standard }}]({% link "cockroachcloud/metrics-essential.md" %})