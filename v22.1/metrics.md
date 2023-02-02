---
title: Metrics
summary: Learn about available metrics for monitoring your CockroachDB cluster.
toc: false
docs_area: reference.metrics
---

As part of normal operation, CockroachDB continuously records metrics that track performance, latency, usage, and many other runtime indicators. These metrics are often useful in diagnosing problems, troubleshooting performance, or planning cluster infrastructure modifications. This page documents locations where metrics are exposed for analysis, and includes the full list of available metrics in CockroachDB.

## Available metrics

Select your CockroachDB deployment to see the metrics available: 

{{site.data.alerts.callout_info}}
This list is taken directly from the source code and is subject to change.
{{site.data.alerts.end}}

<div class="filters clearfix">
  <button class="filter-button" data-scope="metric-names">Self-Hosted and Dedicated</button>
  <button class="filter-button" data-scope="metric-names-serverless">Serverless</button>
</div>

<section class="filter-content" markdown="1" data-scope="metric-names">

{% include {{page.version.version}}/metric-names.md %}

</section>

<section class="filter-content" markdown="1" data-scope="metric-names-serverless">

{% include {{page.version.version}}/metric-names-serverless.md %}

</section>

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
