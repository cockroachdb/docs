---
title: Metrics
summary: Learn about available metrics for monitoring your CockroachDB cluster.
toc: false
docs_area: reference.metrics
---

As part of normal operation, CockroachDB continuously records metrics that track performance, latency, usage, and many other runtime indicators. These metrics are often useful in diagnosing problems, troubleshooting performance, or planning cluster infrastructure modifications. This page documents locations where metrics are exposed for analysis.

## Available metrics

{% include {{page.version.version}}/metric-names.md %}

## See also

- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Support Resources]({% link {{ page.version.version }}/support-resources.md %})
- [Raw Status Endpoints]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#raw-status-endpoints)
- [Essential Metrics for CockroachDB {{ site.data.products.core }} Deployments]({% link {{ page.version.version }}/essential-metrics-self-hosted.md %})
- [Essential Metrics for CockroachDB {{ site.data.products.advanced }} Deployments]({% link {{ page.version.version }}/essential-metrics-advanced.md %})
