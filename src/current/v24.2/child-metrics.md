---
title: Child Metrics
summary: Learn about high-cardinality child metrics enabled by the cluster setting server.child_metrics.enabled.
toc: true
docs_area: reference.metrics
---

The [cluster setting `server.child_metrics.enabled`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-child-metrics-enabled) enables the exporting of child metrics, which are additional [Prometheus]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#prometheus-endpoint) time series with extra labels.

The metrics and their potential child metrics are determined by the specific feature the cluster is using. The number of child metrics can significantly increase based on their associated labels, which increases cardinality. This page will help you understand the potential size of the Prometheus scrape payload for your workload when child metrics are enabled.

## Enable child metrics

`server.child_metrics.enabled` is disabled by default. To enable it, use the [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.child_metrics.enabled = true;
~~~

## All clusters

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
{% include {{ page.version.version }}/child-metrics-table.md %}

## Secure clusters

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
{% include {{ page.version.version }}/child-metrics-table.md %}

## Virtual clusters

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
{% include {{ page.version.version }}/child-metrics-table.md %}

## Clusters with changefeeds

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
{% include {{ page.version.version }}/child-metrics-table.md %}

## Clusters with row-level TTL jobs

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
{% include {{ page.version.version }}/child-metrics-table.md %}

## Metrics of type histogram

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