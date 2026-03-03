---
title: Third-Party Monitoring Integrations
summary: Learn about third-party monitoring tools that are integrated with CockroachDB.
toc: true
docs_area: manage
---

CockroachDB is officially integrated with the following third-party monitoring platforms. These integrations enable external tools and interfaces

- to collect, visualize, and alert on CockroachDB [metrics](#metrics) and
- to collect CockroachDB [logs](#logs).

## Monitoring integration availability

### Metrics

| Platform | CockroachDB Standard | CockroachDB Advanced | CockroachDB {{ site.data.products.core }} |
|----------|:--------------------:|:--------------------:|:-----------------------:|
| [Amazon CloudWatch](#amazon-cloudwatch-metrics) | ✔ | ✔ | ✔ |
| [DataDog](#datadog) | ✔ | ✔ | ✔ |
| [DBmarlin](#dbmarlin) |  |  | ✔ |
| [Kibana](#kibana) |  |  | ✔ |
| [Prometheus](#prometheus) | ✔ | ✔ | ✔ |

This list is not exhaustive. Any Prometheus-compatible third-party tool can consume metrics from a CockroachDB Advanced or {{ site.data.products.core }} cluster. For example, because [Amazon CloudWatch is Prometheus-compatible](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/ContainerInsights-Prometheus-Setup-configure-ECS.html), it can consume metrics from a CockroachDB {{ site.data.products.core }} cluster.

### Logs

| Platform | CockroachDB Standard | CockroachDB Advanced | CockroachDB {{ site.data.products.core }} |
|----------|:--------------------:|:--------------------:|:-----------------------:|
| [Amazon CloudWatch](#amazon-cloudwatch-logs) | ✔ | ✔ | ✔ |
| [GCP Logging](#gcp-logging) | ✔ | ✔ | ✔ |

This list is not exhaustive. Any third-party tool that can consume logs from [file-based or network sinks]({% link {{ page.version.version }}/configure-logs.md %}#configure-log-sinks) can also consume logs from a CockroachDB {{ site.data.products.core }} cluster.

## Monitoring integration resources

### Amazon CloudWatch

<a id="amazon-cloudwatch-metrics"></a>
#### Metrics

| CockroachDB Deployment | Integration | Metrics Source | Tutorial |
| ---------------------- | ----------- | -------------- | -------- |
| {{ site.data.products.standard }} | [Amazon CloudWatch metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/working_with_metrics.html) | [Prometheus endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}) | [Export Metrics From a CockroachDB {{ site.data.products.standard }} Cluster]({% link cockroachcloud/export-metrics.md %}?filters=aws-metrics-export) |
| {{ site.data.products.advanced }} | [Amazon CloudWatch metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/working_with_metrics.html) | [Prometheus endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}) | [Export Metrics From a CockroachDB {{ site.data.products.advanced }} Cluster]({% link cockroachcloud/export-metrics-advanced.md %}?filters=aws-metrics-export) |

<a id="amazon-cloudwatch-logs"></a>
#### Logs

| CockroachDB Deployment | Integration | Tutorial |
| ---------------------- | ----------- | -------- |
| {{ site.data.products.standard }} | [Amazon CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html) | [Export Logs From a CockroachDB {{ site.data.products.standard }} Cluster]({% link cockroachcloud/export-logs.md %}) |
| {{ site.data.products.advanced }} | [Amazon CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html) | [Export Logs From a CockroachDB {{ site.data.products.advanced }} Cluster]({% link cockroachcloud/export-logs-advanced.md %}) |

### DataDog

| CockroachDB Deployment | Integration | Metrics Source | Tutorial |
| ---------------------- | ----------- | -------------- | -------- |
| {{ site.data.products.standard }} | [CockroachDB {{ site.data.products.cloud }} integration for Datadog](https://docs.datadoghq.com/integrations/cockroachdb_dedicated/) | [Prometheus endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}) | [Export Metrics From a CockroachDB {{ site.data.products.standard }} Cluster]({% link cockroachcloud/export-metrics.md %}?filters=datadog-metrics-export) |
| {{ site.data.products.advanced }} | [CockroachDB {{ site.data.products.cloud }} integration for Datadog](https://docs.datadoghq.com/integrations/cockroachdb_dedicated/) | [Prometheus endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}) | [Export Metrics From a CockroachDB {{ site.data.products.advanced }} Cluster]({% link cockroachcloud/export-metrics-advanced.md %}?filters=datadog-metrics-export) |
| {{ site.data.products.core }} | [CockroachDB check for Datadog Agent](https://docs.datadoghq.com/integrations/cockroachdb/?tab=host) | [Prometheus endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}) | [Monitor CockroachDB {{ site.data.products.core }} with Datadog]({% link {{ page.version.version }}/datadog.md %}) |

### DBmarlin

| CockroachDB Deployment | Integration | Metrics Source | Tutorial |
| ---------------------- | ----------- | -------------- | -------- |
| {{ site.data.products.core }} | [DBmarlin](https://docs.dbmarlin.com/docs/Monitored-Technologies/Databases/cockroachdb) | [`crdb_internal`]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#crdb_internal-system-catalog) | [Monitor CockroachDB {{ site.data.products.core }} with DBmarlin]({% link {{ page.version.version }}/dbmarlin.md %}) |

### GCP Logging

| CockroachDB Deployment | Integration | Tutorial |
| ---------------------- | ----------- | -------- |
| {{ site.data.products.standard }} | [Google Cloud Logging](https://cloud.google.com/logging) | [Export Logs From a CockroachDB {{ site.data.products.standard }} Cluster]({% link cockroachcloud/export-logs.md %}?filters=gcp-log-export) |
| {{ site.data.products.advanced }} | [Google Cloud Logging](https://cloud.google.com/logging) | [Export Logs From a CockroachDB {{ site.data.products.advanced }} Cluster]({% link cockroachcloud/export-logs-advanced.md %}?filters=gcp-log-export) |

### Kibana

| CockroachDB Deployment | Integration | Metrics Source | Tutorial |
| ---------------------- | ----------- | -------------- | -------- |
| {{ site.data.products.core }} | [CockroachDB module for Metricbeat](https://www.elastic.co/guide/en/beats/metricbeat/current/metricbeat-module-cockroachdb.html) | [Prometheus endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}) | [Monitor CockroachDB {{ site.data.products.core }} with Kibana]({% link {{ page.version.version }}/kibana.md %}) |

### Prometheus

| CockroachDB Deployment | Integration | Metrics Source | Tutorial |
| ---------------------- | ----------- | -------------- | -------- |
| {{ site.data.products.standard }} | [Prometheus](https://prometheus.io/) | [Prometheus endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}) | [Export Metrics From a CockroachDB {{ site.data.products.standard }} Cluster]({% link cockroachcloud/export-metrics.md %}?filters=prometheus-metrics-export) |
| {{ site.data.products.advanced }} | [Prometheus](https://prometheus.io/) | [Prometheus endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}) | [Export Metrics From a CockroachDB {{ site.data.products.advanced }} Cluster]({% link cockroachcloud/export-metrics-advanced.md %}?filters=prometheus-metrics-export) |
| {{ site.data.products.core }} | [Prometheus](https://prometheus.io/) | [Prometheus endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}) | [Monitor CockroachDB {{ site.data.products.core }} with Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}) |

## See Also

- [Monitoring and Alerting]({% link {{ page.version.version }}/monitoring-and-alerting.md %})
- [DB Console Overview]({% link {{ page.version.version }}/ui-overview.md %})
- [Logging Overview]({% link {{ page.version.version }}/logging-overview.md %})
- [Metrics]({% link {{ page.version.version }}/metrics.md %})
- [Differences in Metrics between Third-Party Monitoring Integrations and DB Console]({% link {{ page.version.version }}/differences-in-metrics-between-third-party-monitoring-integrations-and-db-console.md %})
