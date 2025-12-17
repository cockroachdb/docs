---
title: Metrics Overview
summary: This page gives an overview of the ways you can monitor the performance of your Cloud cluster's SQL queries.
toc: true
docs_area: manage
---

Depending on your CockroachDB {{ site.data.products.cloud }} deployment, you can monitor the performance of your CockroachDB cluster in the following ways:

- For all CockroachDB {{ site.data.products.cloud }} deployments, you can use the [CockroachDB {{ site.data.products.cloud }} Console **Metrics** page](#cockroachdb-cloud-console-metrics-page).
- For CockroachDB {{ site.data.products.standard }} and CockroachDB {{ site.data.products.advanced }} deployments, you can [export metrics](#export-metrics) to a third-party cloud sink.

Viewing metrics on a cluster requires the [Metrics Viewer]({% link "cockroachcloud/authorization.md" %}#metrics-viewer), [Cluster Operator]({% link "cockroachcloud/authorization.md" %}#cluster-operator), or [Cluster Admin]({% link "cockroachcloud/authorization.md" %}#cluster-admin) role.

To understand how to make both practical and actionable use of the metrics in a production deployment, refer to the following documentation:

- [Essential Metrics for CockroachDB {{ site.data.products.standard }} Deployments]({% link "cockroachcloud/metrics-essential.md" %})
- [Essential Metrics for CockroachDB {{ site.data.products.advanced }} Deployments]({% link "{{ site.current_cloud_version }}/essential-metrics-advanced.md" %})

## CockroachDB {{ site.data.products.cloud }} Console Metrics page

To view this page, select a cluster from the [**Clusters** page]({% link "cockroachcloud/cluster-management.md" %}#view-clusters-page), and click **Metrics** in the **Monitoring** section of the left side navigation.

Depending on your CockroachDB {{ site.data.products.cloud }} deployment, the **Metrics** page will have the following tabs on which you can view time-series graphs:

 Metrics Tab | CockroachDB Basic | CockroachDB Standard | CockroachDB Advanced
:------------|:--------------------:|:--------------------:|:-----------------:
 [**Overview**]({% link "cockroachcloud/metrics-overview.md" %}) | ✔ | ✔ | ✔
 [**SQL**]({% link "cockroachcloud/metrics-sql.md" %}) | ✔ | ✔ | ✔
 [**Changefeeds**]({% link "cockroachcloud/metrics-changefeeds.md" %}) | ✔ | ✔ | ✔
 [**Row-Level TTL**]({% link "cockroachcloud/metrics-row-level-ttl.md" %}) | ✔ | ✔ | ✔
 [**Request Units**]({% link "cockroachcloud/metrics-request-units.md" %}) | ✔ |  |
 [**Custom**]({% link "cockroachcloud/custom-metrics-chart-page.md" %}) | ✔ | ✔ | ✔

### Time interval selection

The time interval selector at the top of each tab allows you to filter the view for a predefined or custom time interval. Use the navigation buttons to move to the previous, next, or current time interval. When you select a time interval, the same interval is selected for all charts on the **Metrics** page.

## Export Metrics

CockroachDB {{ site.data.products.standard }} and CockroachDB {{ site.data.products.advanced }} users can export metrics to the following third-party cloud sinks:

- Amazon CloudWatch
- Datadog
- Prometheus

For more information, refer to:

- [Export Metrics From a CockroachDB {{ site.data.products.standard }} Cluster]({% link "cockroachcloud/export-metrics.md" %})
- [Export Metrics From a CockroachDB {{ site.data.products.advanced }} Cluster]({% link "cockroachcloud/export-metrics-advanced.md" %})
