---
title: Third-Party Monitoring Integrations
summary: Learn about third-party monitoring tools that are integrated with CockroachDB.
toc: true
docs_area: manage
---

CockroachDB is officially integrated with the following third-party monitoring platforms. These integrations enable external tools and interfaces to collect, visualize, and alert on CockroachDB metrics.

| CockroachDB Deployment | Platform | Integration | Metrics from  | Tutorial |
| -------- | -----------------------|------------ | ------------- | -------- |
| {{ site.data.products.dedicated }}  | AWS CloudWatch | [AWS CloudWatch metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/working_with_metrics.html) | [Prometheus endpoint](monitoring-and-alerting.html#prometheus-endpoint) | [Export Metrics From a {{ site.data.products.dedicated }} Cluster](../cockroachcloud/export-metrics.html?filters=aws-metrics-export) |
| {{ site.data.products.dedicated }}  | Datadog | [{{ site.data.products.dedicated }} integration for Datadog](https://docs.datadoghq.com/integrations/cockroachdb_dedicated/) | [Prometheus endpoint](monitoring-and-alerting.html#prometheus-endpoint) | [Export Metrics From a {{ site.data.products.dedicated }} Cluster](../cockroachcloud/export-metrics.html?filters=datadog-metrics-export) |
| {{ site.data.products.core }}  | Datadog | [CockroachDB check for Datadog Agent](https://docs.datadoghq.com/integrations/cockroachdb/?tab=host) | [Prometheus endpoint](monitoring-and-alerting.html#prometheus-endpoint) | [Monitor {{ site.data.products.core }} with Datadog](datadog.html) |
| {{ site.data.products.core }} | DBmarlin | [DBmarlin](https://docs.dbmarlin.com/docs/Monitored-Technologies/Databases/cockroachdb) | [`crdb_internal`](monitoring-and-alerting.html#crdb_internal-system-catalog) | [Monitor {{ site.data.products.core }} with DBmarlin](dbmarlin.html) |
| {{ site.data.products.core }}   | Kibana | [CockroachDB module for Metricbeat](https://www.elastic.co/guide/en/beats/metricbeat/current/metricbeat-module-cockroachdb.html) | [Prometheus endpoint](monitoring-and-alerting.html#prometheus-endpoint) | [Monitor {{ site.data.products.core }} with Kibana](kibana.html) |

## See Also

- [Monitoring and Alerting](monitoring-and-alerting.html)
- [DB Console Overview](ui-overview.html)
- [Logging Overview](logging-overview.html)
- [Metrics](metrics.html)
