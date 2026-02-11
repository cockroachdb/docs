---
title: Prometheus Endpoint
summary: Export granular time-series metrics in Prometheus format to monitor a cluster's health and performance.
toc: true
---

Each node in a CockroachDB cluster exports granular time-series metrics to two available Prometheus-compatible endpoints:

- [`http://<host>:<http-port>/_status/vars`](#_status-vars)
- [`http://<host>:<http-port>/metrics`](#metrics): an enhanced endpoint with additional [static labels](#static-labels)

The metrics are formatted for integration with [Prometheus](https://prometheus.io/), an open-source tool for storing, aggregating, and querying time-series data. For details on how to pull these metrics into Prometheus, refer to [Monitor CockroachDB with Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}). The Prometheus format is human-readable and can be processed to work with other Prometheus-compatible third-party monitoring systems, such as [Sysdig](https://sysdig.com/integrations/prometheus/) and [Google Cloud Managed Service for Prometheus](https://cloud.google.com/stackdriver/docs/managed-prometheus). Many of the [third-party monitoring integrations]({% link {{ page.version.version }}/third-party-monitoring-tools.md %}), such as [Datadog]({% link {{ page.version.version }}/datadog.md %}) and [Kibana]({% link {{ page.version.version }}/kibana.md %}), collect metrics from the cluster's Prometheus endpoint.

{{site.data.alerts.callout_info}}
In addition to using the exported time-series data to monitor a cluster through an external system, you can write alerting rules to ensure prompt notification of critical events or issues requiring intervention or investigation. Refer to [Essential Alerts]({% link {{ page.version.version }}/essential-alerts-self-hosted.md %}) for more details.
{{site.data.alerts.end}}

Even if you rely on external tools for storing and visualizing your cluster's time-series metrics, CockroachDB continues to store time-series metrics for its [DB Console Metrics dashboards]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#metrics-dashboards). These stored time-series metrics may be used to generate a [tsdump]({% link {{ page.version.version }}/cockroach-debug-tsdump.md %}), which may be critical during investigations with Cockroach Labs support.

## `_status/vars`

To access the `_status/vars` Prometheus endpoint of a cluster running on `localhost:8080`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ curl http://localhost:8080/_status/vars
~~~

The output will be similar to the following. Note that the metric names are unique for `sql_*_count*`.

~~~
# HELP sys_cgocalls Total number of cgo calls
# TYPE sys_cgocalls counter
sys_cgocalls{node_id="1",tenant="demoapp"} 13737
# HELP sys_cpu_sys_percent Current system cpu percentage consumed by the CRDB process
# TYPE sys_cpu_sys_percent gauge
sys_cpu_sys_percent{node_id="1",tenant="demoapp"} 0.0021986027879282717
...
# HELP sql_select_count_internal Number of SQL SELECT statements successfully executed (internal queries)
# TYPE sql_select_count_internal counter
sql_select_count_internal{node_id="1",tenant="demoapp"} 2115
...
# HELP sql_delete_count Number of SQL DELETE statements successfully executed
# TYPE sql_delete_count counter
sql_delete_count{node_id="1",tenant="demoapp"} 0
...
# HELP sql_delete_count_internal Number of SQL DELETE statements successfully executed (internal queries)
# TYPE sql_delete_count_internal counter
sql_delete_count_internal{node_id="1",tenant="demoapp"} 996
...
# HELP sql_select_count Number of SQL SELECT statements successfully executed
# TYPE sql_select_count counter
sql_select_count{node_id="1",tenant="demoapp"} 9
...
# HELP sql_insert_count_internal Number of SQL INSERT statements successfully executed (internal queries)
# TYPE sql_insert_count_internal counter
sql_insert_count_internal{node_id="1",tenant="demoapp"} 1201
...
# HELP sql_update_count Number of SQL UPDATE statements successfully executed
# TYPE sql_update_count counter
sql_update_count{node_id="1",tenant="demoapp"} 0
...
# HELP sql_update_count_internal Number of SQL UPDATE statements successfully executed (internal queries)
# TYPE sql_update_count_internal counter
sql_update_count_internal{node_id="1",tenant="demoapp"} 1907
...
# HELP sql_insert_count Number of SQL INSERT statements successfully executed
# TYPE sql_insert_count counter
sql_insert_count{node_id="1",tenant="system"} 12
sql_insert_count{node_id="1",tenant="demoapp"} 15
...
~~~

## `metrics`



{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

The `metrics` Prometheus endpoint is commonly used and is the default in Prometheus configurations.

To access the `metrics` Prometheus endpoint of a cluster running on `localhost:8080`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ curl http://localhost:8080/metrics
~~~

The output will be similar to the following. Note that there is one metric name for `sql_count`, with static labels for `query_type` (with values of `insert`, `select`, `update`, and `delete`) and `query_internal` (with value of `true`).

~~~
# HELP sys_cgocalls Total number of cgo calls
# TYPE sys_cgocalls counter
sys_cgocalls{node_id="1",tenant="demoapp"} 13737
# HELP sys_cpu_sys_percent Current system cpu percentage consumed by the CRDB process
# TYPE sys_cpu_sys_percent gauge
sys_cpu_sys_percent{node_id="1",tenant="demoapp"} 0.0021986027879282717
...
# HELP sql_count Number of SQL INSERT statements successfully executed (internal queries)
# TYPE sql_count counter
sql_count{node_id="1",tenant="demoapp",query_type="insert",query_internal="true"} 1281
sql_count{node_id="1",tenant="demoapp",query_type="delete"} 0
sql_count{node_id="1",tenant="demoapp",query_type="update"} 0
sql_count{node_id="1",tenant="demoapp",query_type="select",query_internal="true"} 2280
sql_count{node_id="1",tenant="demoapp",query_type="select"} 9
sql_count{node_id="1",tenant="demoapp",query_type="insert"} 15
sql_count{node_id="1",tenant="demoapp",query_type="update",query_internal="true"} 2102
sql_count{node_id="1",tenant="demoapp",query_type="delete",query_internal="true"} 1067
...
~~~

### Static labels

One common use of static labels is to allow segmentation of a metric across various facets for later querying and aggregation. For example, rather than emitting separate metrics for `INSERT`, `SELECT`, `UPDATE`, and `DELETE` statements, the single metric `sql_count` uses the `query_type` label to distinguish between these operations. This enables operators to easily aggregate across query types (e.g., summing a metric for all SQL operations) or filter for a specific type using the appropriate value for the `query_type` label.

The following tables contrast unlabeled metrics from the `_status/vars` endpoint with their labeled counterparts from the `metrics` endpoint:

Unlabeled metrics from the `_status/vars` endpoint | Labeled metrics from the `metrics` endpoint
-----------------------------------------------|-----------------------------------------
`sql_insert_count` | `sql_count{query_type="insert"}`
`sql_select_count` | `sql_count{query_type="select"}`
`sql_update_count` | `sql_count{query_type="update"}`
`sql_delete_count` | `sql_count{query_type="delete"}`

At metrics query time, labels provide a more seamless user experience:

Unlabeled sum query from the `_status/vars` endpoint | Labeled sum query from the `metrics` endpoint
-----------------------------------------------|-------------------------------
`sum(sql_insert_count, sql_delete_count, sql_select_count)` | `sum(sql_count)`
This query must be updated if new types are added, as each will have a unique metric name. | This query is resilient to new type additions.
Related metrics can be found via autocomplete in a third-party tool, but the results may be ambiguous. | All label values can be found through a third-party query engine and used to easily construct a graph with individual lines for each label value.

In other cases, label values can represent distinct categories not intended for aggregation. For example, certificate expiration metrics differ only by the specific certificate type they represent. Operators are unlikely to sum or average these, but may still want to display them side by side on a dashboard for visibility.

In this case, a single metric name like `security_certificate_expiration` is reused, with the certificate type expressed as a label. The `metrics` endpoint returns output similar to the following:

~~~
# HELP security_certificate_expiration Expiration for the CA certificate
# TYPE security_certificate_expiration gauge
security_certificate_expiration{node_id="1",tenant="demoapp",certificate_type="ca"} 1.998766953e+09
security_certificate_expiration{node_id="1",tenant="demoapp",certificate_type="ca-client-tenant"} 0
security_certificate_expiration{node_id="1",tenant="demoapp",certificate_type="node-client"} 0
security_certificate_expiration{node_id="1",tenant="demoapp",certificate_type="client-tenant"} 0
security_certificate_expiration{node_id="1",tenant="demoapp",certificate_type="ui"} 0
security_certificate_expiration{node_id="1",tenant="demoapp",certificate_type="client"} 1.840654953e+09
security_certificate_expiration{node_id="1",tenant="demoapp",certificate_type="client-ca"} 0
security_certificate_expiration{node_id="1",tenant="demoapp",certificate_type="ui-ca"} 0
security_certificate_expiration{node_id="1",tenant="demoapp",certificate_type="node"} 1.840654953e+09
~~~

This approach avoids a proliferation of metric names and allows third-party tools to display each certificate’s expiration as a separate line in a single graph or table.

## See also

- [Monitor CockroachDB with Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %})
- [Third-party Monitoring Integrations]({% link {{ page.version.version }}/third-party-monitoring-tools.md %})
- [Monitor CockroachDB Self-Hosted Clusters with Datadog]({% link {{ page.version.version }}/datadog.md %})
- [Monitor CockroachDB with Kibana]({% link {{ page.version.version }}/kibana.md %})
- [Essential Metrics]({% link {{ page.version.version }}/essential-metrics-self-hosted.md %})
- [Essential Alerts]({% link {{ page.version.version }}/essential-alerts-self-hosted.md %})
