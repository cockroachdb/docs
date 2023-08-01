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

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
