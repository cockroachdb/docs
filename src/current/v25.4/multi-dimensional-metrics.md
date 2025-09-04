---
title: Multi-dimensional Metrics
summary: Learn about high-cardinality multi-dimensional metrics enabled by the applicable cluster settings.
toc: true
docs_area: reference.metrics
---

Multi-dimensional metrics are additional [Prometheus]({% link {{ page.version.version }}/prometheus-endpoint.md %}) time series with extra labels. This page will help you understand the potential size of the Prometheus scrape payload for your workload when multi-dimensional metrics are enabled. The number of multi-dimensional metrics can significantly increase based on their associated labels, which increases cardinality.

The export of multi-dimensional metrics can be enabled by two [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}):

- [`server.child_metrics.enabled`](#enable-child-metrics)
- [`sql.metrics.database_name.enabled`](#enable-database-and-application_name-labels)
- [`sql.metrics.application_name.enabled`](#enable-database-and-application_name-labels)
- [`sql.stats.detailed_latency_metrics.enabled`](#enable-detailed-latency-metrics)

## Enable child metrics

Child metrics are specific, detailed metrics that are usually related to a higher-level (parent or aggregate) metric. They often provide more granular or specific information about a particular aspect of the parent metric. The parent metrics and their potential child metrics are determined by the specific feature the cluster is using.

The [cluster setting `server.child_metrics.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-child-metrics-enabled) is disabled by default. To enable it, use the [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %}) statement.

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.child_metrics.enabled = true;
~~~

The [cluster setting `server.child_metrics.include_aggregate.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-child-metrics-include-aggregate-enabled) (default: `true`) reports an aggregate time series for applicable multi-dimensional metrics. When set to `false`, it stops reporting the aggregate time series, preventing double counting when querying those metrics.

### All clusters

An RPC (Remote Procedure Call) connection is a communication method used in distributed systems, like CockroachDB, to allow one program to request a service from a program located in another computer on a network without having to understand the network's details. In the context of CockroachDB, RPC connections are used for inter-node communication. For instance, if Node 1 sends a request to Node 2, and Node 2 dials back (sends request back to Node 1), it ensures that communication is healthy in both directions. This is referred to as a "bidirectionally connected" and "heartbeating" RPC connection.

When child metrics is enabled, for all clusters the `rpc.connection.*` metrics are exported per-peer with labels for `remote_node_id`, `remote_addr`, and `class`. The `class` label may have the following values: `system`, `default`, and `raft`. The cardinality increases with the number of nodes. An aggregated metric is also included.

For example:

~~~
# HELP rpc_connection_healthy Gauge of current connections in a healthy state (i.e. bidirectionally connected and heartbeating)
# TYPE rpc_connection_healthy gauge
rpc_connection_healthy{node_id="1"} 10
rpc_connection_healthy{node_id="1",remote_node_id="0",remote_addr="127.0.0.1:29004",class="system"} 1
rpc_connection_healthy{node_id="1",remote_node_id="0",remote_addr="crlMBP-X3HQX3YY6JMTMz.local:29000",class="system"} 0
rpc_connection_healthy{node_id="1",remote_node_id="0",remote_addr="crlMBP-X3HQX3YY6JMTMz.local:29002",class="system"} 1
rpc_connection_healthy{node_id="1",remote_node_id="1",remote_addr="crlMBP-X3HQX3YY6JMTMz.local:29004",class="default"} 1
rpc_connection_healthy{node_id="1",remote_node_id="1",remote_addr="crlMBP-X3HQX3YY6JMTMz.local:29004",class="system"} 1
rpc_connection_healthy{node_id="1",remote_node_id="2",remote_addr="crlMBP-X3HQX3YY6JMTMz.local:29002",class="default"} 1
rpc_connection_healthy{node_id="1",remote_node_id="2",remote_addr="crlMBP-X3HQX3YY6JMTMz.local:29002",class="raft"} 1
rpc_connection_healthy{node_id="1",remote_node_id="2",remote_addr="crlMBP-X3HQX3YY6JMTMz.local:29002",class="system"} 1
rpc_connection_healthy{node_id="1",remote_node_id="3",remote_addr="crlMBP-X3HQX3YY6JMTMz.local:29000",class="default"} 1
rpc_connection_healthy{node_id="1",remote_node_id="3",remote_addr="crlMBP-X3HQX3YY6JMTMz.local:29000",class="raft"} 1
rpc_connection_healthy{node_id="1",remote_node_id="3",remote_addr="crlMBP-X3HQX3YY6JMTMz.local:29000",class="system"} 1
~~~

{% assign feature = "all" %}
{% include {{ page.version.version }}/multi-dimensional-metrics-table.md %}

### Secure clusters

When child metrics is enabled, for [secure clusters]({% link {{ page.version.version }}/secure-a-cluster.md %}) the `security.certificate.expiration.client` is exported per SQL user with a label for `sql_user`. The `sql_user` label may have the values of the cluster's users who are logged into a node using client security certificates. The cardinality increases with the number of SQL users. An aggregated metric is also included, however since this is a sum of the child metric values which represent timestamps, it is not usable.

For example:

~~~
# HELP security_certificate_expiration_client Minimum expiration for client certificates, labeled by SQL user. 0 means no certificate or error. 
# TYPE security_certificate_expiration_client gauge
security_certificate_expiration_client{node_id="1"} 3.756110141e+09
security_certificate_expiration_client{node_id="1",sql_user="florence"} 1.878055127e+09
security_certificate_expiration_client{node_id="1",sql_user="root"} 1.878055014e+09
~~~

{% assign feature = "secure" %}
{% include {{ page.version.version }}/multi-dimensional-metrics-table.md %}

### Virtual clusters

When child metrics is enabled, for [virtual clusters]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}) the `kv.tenant_rate_limit.*` metrics and other kv-related metrics are exported per virtual cluster with a label for `tenant_id`. The `tenant_id` label may have the values: `system` or the id of the virtual cluster. The cardinality increases with the number of virtual clusters. An aggregated metric is also included.

{{site.data.alerts.callout_info}}
With virtual clusters, while the `tenant_id` label on kv metrics is only exported when child metrics is enabled, [the `tenant` label on SQL metrics]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#work-with-metrics-with-cluster-virtualization-enabled) is exported whether child metrics is enabled or disabled. 
{{site.data.alerts.end}}

For example:

~~~
# HELP kv_tenant_rate_limit_read_bytes_admitted Number of read bytes admitted by the rate limiter
# TYPE kv_tenant_rate_limit_read_bytes_admitted counter
kv_tenant_rate_limit_read_bytes_admitted{store="1",node_id="1"} 41
kv_tenant_rate_limit_read_bytes_admitted{store="1",node_id="1",tenant_id="3"} 41
kv_tenant_rate_limit_read_bytes_admitted{store="1",node_id="1",tenant_id="4"} 0
kv_tenant_rate_limit_read_bytes_admitted{store="1",node_id="1",tenant_id="system"} 0

# HELP sysbytes Number of bytes in system KV pairs
# TYPE sysbytes gauge
sysbytes{store="1",node_id="1"} 41979
sysbytes{store="1",node_id="1",tenant_id="3"} 278
sysbytes{store="1",node_id="1",tenant_id="4"} 225
sysbytes{store="1",node_id="1",tenant_id="system"} 41476
~~~

{% assign feature = "virtual" %}
{% include {{ page.version.version }}/multi-dimensional-metrics-table.md %}

### Clusters with changefeeds

When child metrics is enabled and [changefeeds with metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels) are created on the cluster, the `changefeed.*` metrics are exported per changefeed metric label with a label for `scope`. The `scope` label may have the values set using the `metrics_label` option. The cardinality increases with the number of changefeed metric labels. An aggregated metric is also included.

For example, when you create two changefeeds with the metrics labels `employees` and `office_dogs`, the counter metric `changefeed_error_retries` exports child metrics with a `scope` for `employees` and `office_dogs`. In addition, the `default` scope will also be exported which includes changefeeds started without a metrics label.

~~~
 HELP changefeed_error_retries Total retryable errors encountered by all changefeeds
# TYPE changefeed_error_retries counter
changefeed_error_retries{node_id="1"} 0
changefeed_error_retries{node_id="1",scope="default"} 0
changefeed_error_retries{node_id="1",scope="employees"} 0
changefeed_error_retries{node_id="1",scope="office_dogs"} 0
~~~

{% assign feature = "changefeed" %}
{% include {{ page.version.version }}/multi-dimensional-metrics-table.md %}

### Clusters with logical data replication jobs

When child metrics is enabled and [logical data replication (LDR) jobs with metrics labels]({% link {{ page.version.version }}/logical-data-replication-monitoring.md %}#metrics-labels) are created on the cluster, the `logical_replication_*_by_label` metrics are exported per LDR metric label. The `label` may have the values set using the `label` option. The cardinality increases with the number of LDR metric labels.

For example, when you create two LDR jobs with the metrics labels `ldr_job1` and `ldr_job2`, the metrics `logical_replication_*_by_label` export child metrics with a `label` for `ldr_job1` and `ldr_job2`.

~~~
# HELP logical_replication_replicated_time_by_label Replicated time of the logical replication stream by label
# TYPE logical_replication_replicated_time_by_label gauge
logical_replication_replicated_time_by_label{label="ldr_job2",node_id="2"} 1.73411035e+09
logical_replication_replicated_time_by_label{label="ldr_job1",node_id="2"} 1.73411035e+09
# HELP logical_replication_catchup_ranges_by_label Source side ranges undergoing catch up scans
# TYPE logical_replication_catchup_ranges_by_label gauge
logical_replication_catchup_ranges_by_label{label="ldr_job1",node_id="2"} 0
logical_replication_catchup_ranges_by_label{label="ldr_job2",node_id="2"} 0
# HELP logical_replication_scanning_ranges_by_label Source side ranges undergoing an initial scan
# TYPE logical_replication_scanning_ranges_by_label gauge
logical_replication_scanning_ranges_by_label{label="ldr_job1",node_id="2"} 0
logical_replication_scanning_ranges_by_label{label="ldr_job2",node_id="2"} 0
~~~

Note that the `logical_replication_*` metrics without the `_by_label` suffix may be `inaccurate with multiple LDR jobs`.

~~~
# HELP logical_replication_catchup_ranges Source side ranges undergoing catch up scans (inaccurate with multiple LDR jobs)
# TYPE logical_replication_catchup_ranges gauge
logical_replication_catchup_ranges{node_id="2"} 0
# HELP logical_replication_scanning_ranges Source side ranges undergoing an initial scan (inaccurate with multiple LDR jobs)
# TYPE logical_replication_scanning_ranges gauge
logical_replication_scanning_ranges{node_id="2"} 0
~~~

{% assign feature = "ldr" %}
{% include {{ page.version.version }}/multi-dimensional-metrics-table.md %}

### Clusters with row-level TTL jobs

When child metrics is enabled and [row-level TTL jobs]({% link {{ page.version.version }}/row-level-ttl.md %}) are created on the cluster with the [`ttl_label_metrics` storage parameter enabled]({% link {{ page.version.version }}/row-level-ttl.md %}#ttl-metrics), the `jobs.row_level_ttl.*` metrics are exported per TTL job with `ttl_label_metrics` enabled with a label for `relation`. The value of the `relation` label may have the format: `{database}_{schema}_{table}_{primary key}`. The cardinality increases with the number of TTL jobs with `ttl_label_metrics` enabled. An aggregated metric is also included.

For example:

~~~
# HELP jobs_row_level_ttl_total_rows Approximate number of rows on the TTL table.
# TYPE jobs_row_level_ttl_total_rows gauge
jobs_row_level_ttl_total_rows{node_id="1"} 0
jobs_row_level_ttl_total_rows{node_id="1",relation="default"} 0
jobs_row_level_ttl_total_rows{node_id="1",relation="defaultdb_public_events__events_pkey_"} 0
jobs_row_level_ttl_total_rows{node_id="1",relation="defaultdb_public_events_using_date__events_using_date_pkey_"} 0
~~~

{% assign feature = "row-level-ttl" %}
{% include {{ page.version.version }}/multi-dimensional-metrics-table.md %}

### Metrics of type histogram

When child metrics is enabled with changefeeds or row-level TTL jobs, be aware that metrics of type HISTOGRAM will increase cardinality quickly.

For example, when you create two changefeeds with the metrics labels `employees` and `office_dogs`, the histogram metric `changefeed_flush_hist_nanos` exports child metrics for each bucket for each metrics label. In addition, the `default` scope will also be exported which includes changefeeds started without a metrics label. Therefore, in this example, `changefeed_flush_hist_nanos` exports child metrics for each bucket for the scope values: `default`, `employees` and `office_dogs`:

~~~
# HELP changefeed_flush_hist_nanos Time spent flushing messages across all changefeeds
# TYPE changefeed_flush_hist_nanos histogram
changefeed_flush_hist_nanos_bucket{node_id="1",le="5e+08"} 1
changefeed_flush_hist_nanos_bucket{node_id="1",le="5.572592853587432e+08"} 1
changefeed_flush_hist_nanos_bucket{node_id="1",le="6.210758222370743e+08"} 1
changefeed_flush_hist_nanos_bucket{node_id="1",le="6.922005377068515e+08"} 1
changefeed_flush_hist_nanos_bucket{node_id="1",le="7.714703539349157e+08"} 1
changefeed_flush_hist_nanos_bucket{node_id="1",le="8.598180362184556e+08"} 1
changefeed_flush_hist_nanos_bucket{node_id="1",le="9.582831688033088e+08"} 1
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.0680243876372875e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.1903330140009282e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.326648249442152e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.4785741108131227e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.6478983046833196e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.8366132632234223e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="2.046939589088547e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="2.2813521851760063e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="2.5426093767255764e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="2.833785368441068e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="3.1583064185550647e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="3.5199911554958534e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="3.9230955115614314e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="4.372362802333632e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="4.873079541115184e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="5.431137645156319e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="6.053103765649553e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="6.746296557296375e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="7.518872796674253e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="8.37992336275598e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="9.339580208980864e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.0409135585614676e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.1601174915283792e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.2929724885225649e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.4410418498852003e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.6060679028781363e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.789992503590971e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.9949798866972237e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="2.2234421319319225e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="2.478067546953807e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="2.7618523005723442e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="3.0781356785666904e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="3.4306393769506477e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="3.823511295046164e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="4.261374343677016e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="4.749380842807073e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="5.2932731487183495e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="5.899451224126824e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="6.575047946331352e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="7.328013039544164e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="8.167206619031862e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="9.102503447797786e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.0144909132590578e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.1306689626513626e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.2601515562088194e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.4044623113132697e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.5652993278314426e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.7445551695997415e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="1.9443391341601053e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="2.167002072794196e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="2.415164052912417e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="2.691745188300199e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="3.0000000000000085e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",le="+Inf"} 2
changefeed_flush_hist_nanos_sum{node_id="1"} 9.79696709e+08
changefeed_flush_hist_nanos_count{node_id="1"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="5e+08"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="5.572592853587432e+08"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="6.210758222370743e+08"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="6.922005377068515e+08"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="7.714703539349157e+08"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="8.598180362184556e+08"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="9.582831688033088e+08"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.0680243876372875e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.1903330140009282e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.326648249442152e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.4785741108131227e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.6478983046833196e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.8366132632234223e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="2.046939589088547e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="2.2813521851760063e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="2.5426093767255764e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="2.833785368441068e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="3.1583064185550647e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="3.5199911554958534e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="3.9230955115614314e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="4.372362802333632e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="4.873079541115184e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="5.431137645156319e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="6.053103765649553e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="6.746296557296375e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="7.518872796674253e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="8.37992336275598e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="9.339580208980864e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.0409135585614676e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.1601174915283792e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.2929724885225649e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.4410418498852003e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.6060679028781363e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.789992503590971e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.9949798866972237e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="2.2234421319319225e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="2.478067546953807e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="2.7618523005723442e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="3.0781356785666904e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="3.4306393769506477e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="3.823511295046164e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="4.261374343677016e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="4.749380842807073e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="5.2932731487183495e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="5.899451224126824e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="6.575047946331352e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="7.328013039544164e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="8.167206619031862e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="9.102503447797786e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.0144909132590578e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.1306689626513626e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.2601515562088194e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.4044623113132697e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.5652993278314426e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.7445551695997415e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="1.9443391341601053e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="2.167002072794196e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="2.415164052912417e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="2.691745188300199e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="3.0000000000000085e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="default",le="+Inf"} 0
changefeed_flush_hist_nanos_sum{node_id="1",scope="default"} 0
changefeed_flush_hist_nanos_count{node_id="1",scope="default"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="5e+08"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="5.572592853587432e+08"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="6.210758222370743e+08"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="6.922005377068515e+08"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="7.714703539349157e+08"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="8.598180362184556e+08"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="9.582831688033088e+08"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.0680243876372875e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.1903330140009282e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.326648249442152e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.4785741108131227e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.6478983046833196e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.8366132632234223e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="2.046939589088547e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="2.2813521851760063e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="2.5426093767255764e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="2.833785368441068e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="3.1583064185550647e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="3.5199911554958534e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="3.9230955115614314e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="4.372362802333632e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="4.873079541115184e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="5.431137645156319e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="6.053103765649553e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="6.746296557296375e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="7.518872796674253e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="8.37992336275598e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="9.339580208980864e+09"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.0409135585614676e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.1601174915283792e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.2929724885225649e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.4410418498852003e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.6060679028781363e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.789992503590971e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.9949798866972237e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="2.2234421319319225e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="2.478067546953807e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="2.7618523005723442e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="3.0781356785666904e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="3.4306393769506477e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="3.823511295046164e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="4.261374343677016e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="4.749380842807073e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="5.2932731487183495e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="5.899451224126824e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="6.575047946331352e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="7.328013039544164e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="8.167206619031862e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="9.102503447797786e+10"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.0144909132590578e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.1306689626513626e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.2601515562088194e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.4044623113132697e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.5652993278314426e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.7445551695997415e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="1.9443391341601053e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="2.167002072794196e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="2.415164052912417e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="2.691745188300199e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="3.0000000000000085e+11"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="employees",le="+Inf"} 0
changefeed_flush_hist_nanos_sum{node_id="1",scope="employees"} 0
changefeed_flush_hist_nanos_count{node_id="1",scope="employees"} 0
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="5e+08"} 1
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="5.572592853587432e+08"} 1
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="6.210758222370743e+08"} 1
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="6.922005377068515e+08"} 1
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="7.714703539349157e+08"} 1
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="8.598180362184556e+08"} 1
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="9.582831688033088e+08"} 1
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.0680243876372875e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.1903330140009282e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.326648249442152e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.4785741108131227e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.6478983046833196e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.8366132632234223e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="2.046939589088547e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="2.2813521851760063e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="2.5426093767255764e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="2.833785368441068e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="3.1583064185550647e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="3.5199911554958534e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="3.9230955115614314e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="4.372362802333632e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="4.873079541115184e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="5.431137645156319e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="6.053103765649553e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="6.746296557296375e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="7.518872796674253e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="8.37992336275598e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="9.339580208980864e+09"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.0409135585614676e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.1601174915283792e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.2929724885225649e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.4410418498852003e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.6060679028781363e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.789992503590971e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.9949798866972237e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="2.2234421319319225e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="2.478067546953807e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="2.7618523005723442e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="3.0781356785666904e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="3.4306393769506477e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="3.823511295046164e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="4.261374343677016e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="4.749380842807073e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="5.2932731487183495e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="5.899451224126824e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="6.575047946331352e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="7.328013039544164e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="8.167206619031862e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="9.102503447797786e+10"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.0144909132590578e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.1306689626513626e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.2601515562088194e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.4044623113132697e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.5652993278314426e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.7445551695997415e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="1.9443391341601053e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="2.167002072794196e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="2.415164052912417e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="2.691745188300199e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="3.0000000000000085e+11"} 2
changefeed_flush_hist_nanos_bucket{node_id="1",scope="office_dogs",le="+Inf"} 2
changefeed_flush_hist_nanos_sum{node_id="1",scope="office_dogs"} 9.79696709e+08
changefeed_flush_hist_nanos_count{node_id="1",scope="office_dogs"} 2
~~~

## Enable `database` and `application_name` labels

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

The following cluster settings enable the `database` and `application_name` labels for certain metrics, along with their internal counterparts if they exist:

- [`sql.metrics.database_name.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-metrics-database-name-enabled)
- [`sql.metrics.application_name.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-metrics-application-name-enabled)

By default, these cluster settings are disabled. To enable them, use the [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %}) statement. Because these labels use aggregate metrics, you must enable the [`server.child_metrics.enabled`](#enable-child-metrics) cluster setting to use them.

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.child_metrics.enabled = true;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.metrics.database_name.enabled = true;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.metrics.application_name.enabled = true;
~~~

Toggling the `sql.metrics.database_name.enabled` and `sql.metrics.application_name.enabled` cluster settings clears existing metric values for current label combinations and reinitializes the affected metrics to reflect the new label configuration.

When toggling the `sql.metrics.database_name.enabled` and `sql.metrics.application_name.enabled` cluster settings, only the values for existing metric label combinations will be cleared. Aggregated metric values for the affected metrics will not be cleared.

{{site.data.alerts.callout_info}}
Child metrics (metrics with the `database` and `application_name` labels) are independent from the parent (aggregated metric). The child metrics are initialized when the cluster settings are enabled.

For this reason, child `COUNTER` metrics may not always add up to the parent `COUNTER` metric. For an example, refer to [Examples 1 through 6](#1-all-cluster-settings-disabled).
    
For `GAUGE` metrics, values may be different and potentially unexpected depending on when a setting is enabled. For an example, refer to [7. `GAUGE` metric example](#7-gauge-metric-example).
{{site.data.alerts.end}}

These labels affect only the metrics emitted via [Prometheus export]({% link {{ page.version.version }}/prometheus-endpoint.md %}). They are not visible in the [DB Console Metrics dashboards]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#metrics-dashboards).

The system retains up to 5,000 recently used label combinations.

{% assign feature = "database-and-application_name-labels" %}
{% include {{ page.version.version }}/multi-dimensional-metrics-table.md %}

### Examples

This section demonstrates the impact of enabling and disabling the relevant cluster settings.

[Examples 1 through 6](#1-all-cluster-settings-disabled) show the effect on the `COUNTER` metric `sql.select.count`. During these examples, the [`movr` workload]({% link {{ page.version.version }}/cockroach-workload.md %}#run-the-movr-workload) was running on node 1. The aggregated metric consistently increases as the examples progress.

[Example 7](#7-gauge-metric-example) shows a possible effect on the `GAUGE` metric `sql.txn.open`.

#### 1. All cluster settings disabled

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.child_metrics.enabled = false;
SET CLUSTER SETTING sql.metrics.database_name.enabled = false;
SET CLUSTER SETTING sql.metrics.application_name.enabled = false;
~~~

The Prometheus export only gives the aggregated metric for the node.

~~~
# HELP sql_select_count Number of SQL SELECT statements successfully executed
# TYPE sql_select_count counter
sql_select_count{node_id="1"} 2030
~~~

#### 2. Only child metrics enabled

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.child_metrics.enabled = true;
SET CLUSTER SETTING sql.metrics.database_name.enabled = false;
SET CLUSTER SETTING sql.metrics.application_name.enabled = false;
~~~

The Prometheus export still only gives the aggregated metric for the node.

~~~
sql_select_count{node_id="1"} 6568
~~~

#### 3. Child metrics and `database_name` label enabled

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.child_metrics.enabled = true;
SET CLUSTER SETTING sql.metrics.database_name.enabled = true;
SET CLUSTER SETTING sql.metrics.application_name.enabled = false;
~~~

The aggregated metric and a child metric with only the `database` label are emitted.

~~~
sql_select_count{node_id="1"} 10259
sql_select_count{node_id="1",database="movr"} 816
~~~

#### 4. Child metrics and `application_name` label enabled

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.child_metrics.enabled = true;
SET CLUSTER SETTING sql.metrics.database_name.enabled = false;
SET CLUSTER SETTING sql.metrics.application_name.enabled = true;
~~~

The aggregated metric and a child metric with only the `application_name` label are emitted. Note that even though the aggregated metric has increased, the child metric with `application_name` label has a value less than the child metric with `database` label in the [preceding example](#3-child-metrics-and-database_name-label-enabled). This is because the labeled metrics have been reset, while the aggregated metric was not reset.

~~~
sql_select_count{node_id="1"} 14077
sql_select_count{node_id="1",application_name="movr"} 718
~~~

#### 5. Child metrics and both `database` and `application_name` label enabled

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.child_metrics.enabled = true;
SET CLUSTER SETTING sql.metrics.database_name.enabled = true;
SET CLUSTER SETTING sql.metrics.application_name.enabled = true;
~~~

The aggregated metric and a child metric with both `database` and `application_name` labels are emitted.

~~~
sql_select_count{node_id="1"} 21085
sql_select_count{node_id="1",database="movr",application_name="movr"} 3962
~~~

#### 6. Aggregate metric disabled

The [cluster setting `server.child_metrics.include_aggregate.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-child-metrics-include-aggregate-enabled) (default: `true`) reports an aggregate time series for applicable multi-dimensional metrics. When set to `false`, it stops reporting the aggregate time series, preventing double counting when querying those metrics.

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.child_metrics.enabled = true;
SET CLUSTER SETTING sql.metrics.database_name.enabled = true;
SET CLUSTER SETTING sql.metrics.application_name.enabled = true;
SET CLUSTER SETTING server.child_metrics.include_aggregate.enabled = false;
~~~

No aggregated metric emitted.
Only the child metric with both the `database` and `application_name` labels is emitted.

~~~
sql_select_count{node_id="1",database="movr",application_name="movr"} 8703
~~~

#### 7. `GAUGE` metric example

Changes to cluster settings may take time to reinitialize affected metrics. As a result, some `GAUGE` metrics might briefly show unexpected values.

`GAUGE` values for both aggregated and child metrics increase and decrease as transactions are opened and closed. This example uses the `GAUGE` metric `sql.txn.open`.

Consider the following scenario:

Time | Action | `sql.txn.open` aggregated metric | `sql.txn.open` child metric
:---:|--------|:--------------------------------:|:---------------------------:
1 | Open a transaction. The value of the `sql.txn.open` aggregated metric is incremented. | 1 | -
2 | Enable `sql.metrics.database_name.enabled` and `sql.metrics.application_name.enabled`.<br>Re-initialize child metrics. | 1 | 0
3 | Close a transaction.<br>The values of both the aggregated and child `sql.txn.open` metrics are decremented. | 0 | -1

To avoid negative values in child metrics, use the [Prometheus `clamp_min` function](https://prometheus.io/docs/prometheus/latest/querying/functions/#clamp_min) to set the metric to zero.

## Enable detailed latency metrics

The [cluster setting `sql.stats.detailed_latency_metrics.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-stats-detailed-latency-metrics-enabled) labels the latency metric `sql.exec.latency.detail` with the [statement fingerprint]({% link {{ page.version.version }}/ui-statements-page.md %}#sql-statement-fingerprints). To estimate the cardinality of the set of all statement fingerprints, use the `sql.query.unique.count` metric. For most workloads, this metric ranges from dozens to hundreds.

`sql.stats.detailed_latency_metrics.enabled` is disabled by default. To enable it, use the [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %}) statement.

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.stats.detailed_latency_metrics.enabled = true;
~~~

{{site.data.alerts.callout_danger}}
Be aware that the `sql.exec.latency.detail` metric is of type HISTOGRAM and will quickly increase the cardinality of exported metrics. For workloads with over a couple thousand statement fingerprints, exercise caution when enabling `sql.stats.detailed_latency_metrics.enabled`. For workloads with tens of thousands of distinct query fingerprints, leave this cluster setting set to `false`.
{{site.data.alerts.end}}

{% assign feature = "detailed-latency" %}
{% include {{ page.version.version }}/multi-dimensional-metrics-table.md %}

For example:

~~~
# HELP sql_query_unique_count Cardinality estimate of the set of statement fingerprints
# TYPE sql_query_unique_count counter
sql_query_unique_count{node_id="1"} 48
...
# HELP sql_exec_latency_detail Latency of SQL statement execution, by statement fingerprint
# TYPE sql_exec_latency_detail histogram
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="10000"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="12638.482029342978"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="15973.122800602541"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="20187.602546790382"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="25514.065200312878"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="32245.90545296394"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="40753.92965871775"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="51506.78076168121"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="65096.75230458167"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="82272.41341700466"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="103979.84184814895"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="131414.73626117557"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="166088.27826277143"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="209910.3720108553"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="265294.8464431894"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="335292.41492495546"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="423758.7160604059"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="535566.6917706894"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="676875.0009458527"} 0
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="855467.2535565672"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="1.0811807510766068e+06"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="1.3664483492953242e+06"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="1.7269832906594332e+06"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="2.182644728397485e+06"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="2.7585316176291797e+06"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="3.4863652276780806e+06"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="4.406236427773566e+06"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="5.568813990945262e+06"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="7.038135554931545e+06"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="8.89513497310822e+06"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="1.1242100350620849e+07"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="1.4208308325339198e+07"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="1.795714494371637e+07"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="2.269510536694665e+07"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="2.868316813342006e+07"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="3.625117049988527e+07"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="4.581597669054482e+07"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="5.790443980602476e+07"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="7.318242219076161e+07"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="9.249147277217315e+07"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="1.1689518164985757e+08"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="1.4773776525985083e+08"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="1.8671810912919158e+08"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="2.359833466782189e+08"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="2.9824712862168837e+08"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="3.769390975388353e+08"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="4.7639380104013294e+08"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="6.020894493336115e+08"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="7.609496685459859e+08"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="9.61724871115294e+08"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="1.2154742500762835e+09"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="1.5361749466718242e+09"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="1.941491945743876e+09"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="2.453751106639811e+09"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="3.10116892657477e+09"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="3.919406774847209e+09"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="4.953535208959157e+09"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="6.260516572014802e+09"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="7.912342618981298e+09"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="9.99999999999997e+09"} 1
sql_exec_latency_detail_bucket{fingerprint="SHOW database",node_id="1",le="+Inf"} 1
sql_exec_latency_detail_sum{fingerprint="SHOW database",node_id="1"} 723750
sql_exec_latency_detail_count{fingerprint="SHOW database",node_id="1"} 1
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="10000"} 0
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="12638.482029342978"} 0
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="15973.122800602541"} 0
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="20187.602546790382"} 0
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="25514.065200312878"} 0
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="32245.90545296394"} 0
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="40753.92965871775"} 55
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="51506.78076168121"} 319
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="65096.75230458167"} 801
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="82272.41341700466"} 1503
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="103979.84184814895"} 2307
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="131414.73626117557"} 2975
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="166088.27826277143"} 3439
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="209910.3720108553"} 3779
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="265294.8464431894"} 3912
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="335292.41492495546"} 4039
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="423758.7160604059"} 4156
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="535566.6917706894"} 4236
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="676875.0009458527"} 4293
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="855467.2535565672"} 4308
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="1.0811807510766068e+06"} 4323
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="1.3664483492953242e+06"} 4330
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="1.7269832906594332e+06"} 4343
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="2.182644728397485e+06"} 4347
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="2.7585316176291797e+06"} 4348
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="3.4863652276780806e+06"} 4349
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="4.406236427773566e+06"} 4349
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="5.568813990945262e+06"} 4349
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="7.038135554931545e+06"} 4349
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="8.89513497310822e+06"} 4349
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="1.1242100350620849e+07"} 4350
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="1.4208308325339198e+07"} 4350
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="1.795714494371637e+07"} 4350
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="2.269510536694665e+07"} 4351
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="2.868316813342006e+07"} 4354
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="3.625117049988527e+07"} 4359
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="4.581597669054482e+07"} 4363
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="5.790443980602476e+07"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="7.318242219076161e+07"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="9.249147277217315e+07"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="1.1689518164985757e+08"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="1.4773776525985083e+08"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="1.8671810912919158e+08"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="2.359833466782189e+08"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="2.9824712862168837e+08"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="3.769390975388353e+08"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="4.7639380104013294e+08"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="6.020894493336115e+08"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="7.609496685459859e+08"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="9.61724871115294e+08"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="1.2154742500762835e+09"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="1.5361749466718242e+09"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="1.941491945743876e+09"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="2.453751106639811e+09"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="3.10116892657477e+09"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="3.919406774847209e+09"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="4.953535208959157e+09"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="6.260516572014802e+09"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="7.912342618981298e+09"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="9.99999999999997e+09"} 4367
sql_exec_latency_detail_bucket{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1",le="+Inf"} 4367
sql_exec_latency_detail_sum{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1"} 1.27599889e+09
sql_exec_latency_detail_count{fingerprint="SELECT city, id FROM vehicles WHERE city = _",node_id="1"} 4367
~~~
