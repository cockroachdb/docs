---
title: Third-Party Monitoring Integrations
summary: Learn about third-party monitoring tools that are integrated with CockroachDB.
toc: true
docs_area: manage
---

CockroachDB is officially integrated with the following third-party monitoring platforms. These integrations enable external tools and interfaces to collect, visualize, and alert on CockroachDB metrics.

| Platform | Integration                                                                                          | Metrics from                                                            | Tutorial                                         |
| -------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ |
| Datadog  | [CockroachDB check for Datadog Agent](https://docs.datadoghq.com/integrations/cockroachdb/?tab=host) | [Prometheus endpoint](monitoring-and-alerting.html#prometheus-endpoint) | [Monitor CockroachDB with Datadog](datadog.html) |
| DBmarlin | [DBmarlin](https://docs.dbmarlin.com/docs/Monitored-Technologies/Databases/cockroachdb) | [`crdb_internal`](monitoring-and-alerting.html#crdb_internal-system-catalog) | [Monitor CockroachDB with DBmarlin](dbmarlin.html) |
| Kibana   | [CockroachDB module for Metricbeat](https://www.elastic.co/guide/en/beats/metricbeat/current/metricbeat-module-cockroachdb.html) | [Prometheus endpoint](monitoring-and-alerting.html#prometheus-endpoint) | [Monitor CockroachDB with Kibana](kibana.html) |

## See Also

- [Monitoring and Alerting](monitoring-and-alerting.html)
- [DB Console Overview](ui-overview.html)
- [Logging Overview](logging-overview.html)
