---
title: Request Unit metrics
summary: The Request Unit metrics let you monitor resource consumption.
toc: true
---

{{site.data.alerts.callout_info}}
These graphs are available for CockroachDB {{ site.data.products.basic }} deployments. For graphs available to CockroachDB {{ site.data.products.standard }} or {{ site.data.products.advanced }} deployments, refer to the [CockroachDB {{ site.data.products.cloud }} Console Metrics page]({% link "cockroachcloud/metrics.md" %}#cockroachdb-cloud-console-metrics-page).
{{site.data.alerts.end}}

The Request Unit metrics let you monitor [resource consumption]({% link "cockroachcloud/resource-usage-basic.md" %}). All cluster activity, including [SQL queries]({% link "{{ site.current_cloud_version }}/selection-queries.md" %}), bulk operations, and [background jobs]({% link "{{ site.current_cloud_version }}/show-jobs.md" %}), is measured in Request Units, or RUs. An RU is an abstracted metric that represents the compute and I/O resources used by a database operation. In addition to queries that you run, background activity, such as [automatic statistics]({% link "{{ site.current_cloud_version }}/cost-based-optimizer.md" %}#table-statistics) to optimize your queries or connecting a [changefeed]({% link "{{ site.current_cloud_version }}/change-data-capture-overview.md" %}) to an external sink, also consumes RUs.

To view these graphs, select a cluster from the [**Clusters** page]({% link "cockroachcloud/cluster-management.md" %}#view-clusters-page), and click **Metrics** in the **Monitoring** section of the left side navigation. On the **Metrics** page, click the **Request Units** tab.

{% include "cockroachcloud/metrics-time-interval-selection.md" %}

{% assign tab = "Request Units" %}
{% include "cockroachcloud/metrics-tab.md" %}

## See also

- [Metrics Overview]({% link "cockroachcloud/metrics.md" %})
- [Overview metrics tab]({% link "cockroachcloud/metrics-overview.md" %})
- [SQL metrics]({% link "cockroachcloud/metrics-sql.md" %})
- [Changefeed metrics]({% link "cockroachcloud/metrics-changefeeds.md" %})
- [Row-Level TTL metrics]({% link "cockroachcloud/metrics-row-level-ttl.md" %})
- [Essential Metrics for {{ site.data.products.standard }}]({% link "cockroachcloud/metrics-essential.md" %})