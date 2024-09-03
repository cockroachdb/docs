---
title: Third-Party Monitoring Integrations
summary: Learn about third-party monitoring tools that are integrated with CockroachDB.
toc: true
docs_area: manage
---

CockroachDB is officially integrated with the following third-party monitoring platforms. These integrations enable external tools and interfaces to collect, visualize, and alert on CockroachDB metrics.

| CockroachDB Deployment | Platform | Integration | Metrics from  | Tutorial |
| -------- | -----------------------|------------ | ------------- | -------- |
| CockroachDB {{ site.data.products.dedicated }}  | AWS CloudWatch | [AWS CloudWatch metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/working_with_metrics.html) | [Prometheus endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#prometheus-endpoint) | [Export Metrics From a CockroachDB {{ site.data.products.dedicated }} Cluster]({% link cockroachcloud/export-metrics.md %}?filters=aws-metrics-export) |
| CockroachDB {{ site.data.products.dedicated }}  | Datadog | [CockroachDB {{ site.data.products.dedicated }} integration for Datadog](https://docs.datadoghq.com/integrations/cockroachdb_dedicated/) | [Prometheus endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#prometheus-endpoint) | [Export Metrics From a CockroachDB {{ site.data.products.dedicated }} Cluster]({% link cockroachcloud/export-metrics.md %}?filters=datadog-metrics-export) |
| CockroachDB {{ site.data.products.core }}  | Datadog | [CockroachDB check for Datadog Agent](https://docs.datadoghq.com/integrations/cockroachdb/?tab=host) | [Prometheus endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#prometheus-endpoint) | [Monitor CockroachDB {{ site.data.products.core }} with Datadog]({% link {{ page.version.version }}/datadog.md %}) |
| CockroachDB {{ site.data.products.core }} | DBmarlin | [DBmarlin](https://docs.dbmarlin.com/docs/Monitored-Technologies/Databases/cockroachdb) | [`crdb_internal`]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#crdb_internal-system-catalog) | [Monitor CockroachDB {{ site.data.products.core }} with DBmarlin]({% link {{ page.version.version }}/dbmarlin.md %}) |
| CockroachDB {{ site.data.products.core }}   | Kibana | [CockroachDB module for Metricbeat](https://www.elastic.co/guide/en/beats/metricbeat/current/metricbeat-module-cockroachdb.html) | [Prometheus endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#prometheus-endpoint) | [Monitor CockroachDB {{ site.data.products.core }} with Kibana](kibana.html) |

## See Also

- [Monitoring and Alerting]({% link {{ page.version.version }}/monitoring-and-alerting.md %})
- [DB Console Overview]({% link {{ page.version.version }}/ui-overview.md %})
- [Logging Overview]({% link {{ page.version.version }}/logging-overview.md %})
- [Metrics]({% link {{ page.version.version }}/metrics.md %})
- [Differences in Metrics between Third-Party Monitoring Integrations and DB Console]({% link {{ page.version.version }}/differences-in-metrics-between-third-party-monitoring-integrations-and-db-console.md %})
