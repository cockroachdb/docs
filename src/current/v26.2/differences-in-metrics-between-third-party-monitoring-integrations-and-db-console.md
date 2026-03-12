---
title: Differences in Metrics between Third-Party Monitoring Integrations and DB Console
summary: Learn how metrics can differ between third-party monitoring tools that are integrated with CockroachDB and the DB Console of CockroachDB.
toc: true
---

When using [Third-Party Monitoring Integrations]({% link {{ page.version.version }}/third-party-monitoring-tools.md %}), such as the [metrics export feature]({% link cockroachcloud/export-metrics.md %}), discrepancies may be seen when comparing those metrics charts to ones found on the [Metrics dashboards]({% link {{ page.version.version }}/ui-overview.md %}#metrics) or [custom charts]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}) of the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}). This page explains why these different systems may yield different results.

## CockroachDB’s Timeseries Database

CockroachDB stores metrics data in its own internal timeseries database (TSDB). While CockroachDB exposes [point-in-time metrics]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}) via its [Prometheus endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}), it also periodically scrapes and writes this information to its own timeseries database storage. This data is scraped every 10 seconds and stored at that resolution. After a period of time determined by the [`timeseries.storage.resolution_10s.ttl` cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-timeseries-storage-resolution-10s-ttl), that 10 second resolution data is compacted into a 30 minute resolution. After another period of time determined by the [`timeseries.storage.resolution_30m.ttl cluster setting`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-timeseries-storage-resolution-30m-ttl), the 30 minute resolution data is deleted.

The data in TSDB is used to populate metrics charts in DB Console. TSDB provides its own implementations to compute functions, such as rate-of-change, maximum, sum, etc. It also provides its own implementation to perform downsampling.

## Different implementations 

Systems such as Datadog, Amazon CloudWatch, and Prometheus/Grafana have their own flavor of timeseries database technology. The way they store data on disk, the query languages they expose to explore the data, and their implementations of downsampling and functions, such as rate-of-change, may differ from one another and from TSDB. 

## Different resolutions

Depending on the time range selected, the resolution in DB Console will be either 10-second or 30-minute. The data that is exported to third-party systems may be provided at different resolutions. For example, you might have a 10-second resolution in Prometheus, but the same metric in Amazon CloudWatch might have a 1-minute resolution. The resolution in Datadog can differ as well.

Different systems have different polling frequencies. Since TSDB is fairly high fidelity, polling and storing values every 10 seconds, it can capture small changes. A third-party system, such as Datadog, may poll less frequently so it is possible for it to not capture a small change. 

In the following example, given the timeline and values for unavailable ranges, the count for the unavailable ranges metric briefly was non-zero at times `t3` and `t4` as scraped by TSDB. Since Datadog polled for data at times `t0` and `t6`, it did not capture the sudden unavailable range burst because the change was not long enough for the times that Datadog made its scrape. 

time | t0 | t1 | t2 | t3 | t4 | t5 | t6
-----|----|----|----|----|----|----|----
TSDB scrapes every 10s | 0 | 0 | 0 | 5 | 4 | 0 | 0
Datadog scrapes every 60s | 0 | - | - | - | - | - | 0

## Cockroach Labs support scope

Since Cockroach Labs does not own the third-party systems, we can not be expected to have intimate knowledge about how each system’s different query language and timeseries database works.

The [metrics export feature]({% link cockroachcloud/export-metrics.md %}) scrapes the Prometheus endpoint every 30 seconds, and forwards the data along to the third-party system. The metrics export does no intermediate aggregation, downsampling, or modification of the timeseries values at any point. The raw metrics export data is at a 30-second resolution, but how that data is processed once received by the third party system is unknown to us.

It is within our scope to understand and support our own timeseries database. If you have problems receiving metrics in your third-party system, [our support]({% link {{ page.version.version }}/support-resources.md %}) can help troubleshoot those problems. However, once the data is ingested into the third-party system, please contact your representative at that third-party company to support issues found on those systems. For example, assuming the raw metric data has been ingested as expected, Cockroach Labs does not support writing queries in third-party systems, such as using Datadog's Metrics Explorer or Datadog Query Language (DQL).

## See Also

- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [DB Console Overview]({% link {{ page.version.version }}/ui-overview.md %})
- [Third-Party Monitoring Integrations]({% link {{ page.version.version }}/third-party-monitoring-tools.md %})
- [Monitor CockroachDB with Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %})
- [Export Metrics From a CockroachDB {{ site.data.products.advanced }} cluster]({% link cockroachcloud/export-metrics.md %})