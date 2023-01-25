---
title: Monitoring and Alerting
summary: Monitor the health and performance of a cluster and alert on critical events and metrics.
toc: true
docs_area: manage
---

In addition to CockroachDB's [built-in safeguards against failure](frequently-asked-questions.html#how-does-cockroachdb-survive-failures), it is critical to actively monitor the overall health and performance of a cluster running in production and to create alerting rules that promptly send notifications when there are events that require investigation or intervention.

This page explains available monitoring tools and critical events and metrics to alert on.

{% include {{ page.version.version }}/prod-deployment/cluster-unavailable-monitoring.md %}

## Monitoring tools

{{site.data.alerts.callout_danger}}
If a cluster becomes unavailable, most of the monitoring tools in the following sections become unavailable. In that case, Cockroach Labs recommends that you use the [Prometheus endpoint](#prometheus-endpoint) or consult the [cluster logs](logging-overview.html).
{{site.data.alerts.end}}

### DB Console

The [DB Console](ui-overview.html) displays essential metrics about a cluster's health, such as node status, number of unavailable ranges, and queries per second and service latency across the cluster. This tool is designed to help you optimize cluster performance and troubleshoot issues. The DB Console is accessible from every node at `http://<host>:<http-port>`, or `http://<host>:8080` by default.

For more information on accessing the DB Console, see [Access DB Console](ui-overview.html#db-console-access).

### Cluster API

The [Cluster API](cluster-api.html) is a REST API that provides much of the same information about your cluster and nodes as is available from the DB Console and is accessible from each node at the same address and port as the DB Console.

For more information, see the Cluster API [overview](cluster-api.html) and [reference](../api/cluster/v2.html).

### `crdb_internal` system catalog

The `crdb_internal` system catalog is a schema that contains information about internal objects, processes, and metrics related to a specific database.

For details, see [`crdb_internal`](crdb-internal.html).

### Health endpoints

CockroachDB provides two HTTP endpoints for checking the health of individual nodes.

These endpoints are also available through the [Cluster API](cluster-api.html) under `/v2/health/`.

#### /health

If a node is down, the `http://<host>:<http-port>/health` endpoint returns a `Connection refused` error:

{% include_cached copy-clipboard.html %}
~~~ shell
$ curl http://localhost:8080/health
~~~

~~~
curl: (7) Failed to connect to localhost port 8080: Connection refused
~~~

Otherwise, it returns an HTTP `200 OK` status response code with an empty body:

~~~
{

}
~~~

The `/health` endpoint does not returns details about the node such as its private IP address. These details could be considered privileged information in some deployments. If you need to retrieve node details, you can use the `/_status/details` endpoint along with a valid authentication cookie.

#### /health?ready=1

The `http://<node-host>:<http-port>/health?ready=1` endpoint returns an HTTP `503 Service Unavailable` status response code with an error in the following scenarios:

- The node is in the [wait phase of the node shutdown sequence](node-shutdown.html#draining). This causes load balancers and connection managers to reroute traffic to other nodes before the node is drained of SQL client connections and leases, and is a necessary check during [rolling upgrades](upgrade-cockroach-version.html).

    {{site.data.alerts.callout_success}}
    If you find that your load balancer's health check is not always recognizing a node as unready before the node shuts down, you can increase the `server.shutdown.drain_wait` [cluster setting](cluster-settings.html) to cause a node to return `503 Service Unavailable` even before it has started shutting down.
    {{site.data.alerts.end}}

- The node is unable to communicate with a majority of the other nodes in the cluster, likely because the cluster is unavailable due to too many nodes being down.

{% include_cached copy-clipboard.html %}
~~~ shell
$ curl http://localhost:8080/health?ready=1
~~~

~~~
{
  "error": "node is not healthy",
  "code": 14,
  "message": "node is not healthy",
  "details": [
  ]
}
~~~

Otherwise, it returns an HTTP `200 OK` status response code with an empty body:

~~~
{

}
~~~

### Raw status endpoints

{{site.data.alerts.callout_info}}
These endpoints are deprecated in favor of the [Cluster API](#cluster-api).
{{site.data.alerts.end}}

Several endpoints return raw status metrics in JSON at `http://<host>:<http-port>/#/debug`. Feel free to investigate and use these endpoints, but note that they are subject to change.

<img src="{{ 'images/v22.2/raw-status-endpoints.png' | relative_url }}" alt="Raw Status Endpoints" style="border:1px solid #eee;max-width:100%" />

### Node status command

The [`cockroach node status`](cockroach-node.html) command gives you metrics about the health and status of each node.

- With the `--ranges` flag, you get granular range and replica details, including unavailability and under-replication.
- With the `--stats` flag, you get granular disk usage details.
- With the `--decommission` flag, you get details about the [node decommissioning](node-shutdown.html?filters=decommission#cockroach-node-status) process.
- With the `--all` flag, you get all of the above.

### Prometheus endpoint

Every node of a CockroachDB cluster exports granular time series metrics at `http://<host>:<http-port>/_status/vars`. The metrics are formatted for easy integration with [Prometheus](monitor-cockroachdb-with-prometheus.html), an open source tool for storing, aggregating, and querying time series data, but the format is **easy-to-parse** and can be processed to work with other third-party monitoring systems (e.g., [Sysdig](https://sysdig.atlassian.net/wiki/plugins/servlet/mobile?contentId=64946336#content/view/64946336) and [Stackdriver](https://github.com/GoogleCloudPlatform/k8s-stackdriver/tree/master/prometheus-to-sd)).

{% include_cached copy-clipboard.html %}
~~~ shell
$ curl http://localhost:8080/_status/vars
~~~

~~~
# HELP gossip_infos_received Number of received gossip Info objects
# TYPE gossip_infos_received counter
gossip_infos_received 0
# HELP sys_cgocalls Total number of cgo calls
# TYPE sys_cgocalls gauge
sys_cgocalls 3501
# HELP sys_cpu_sys_percent Current system cpu percentage
# TYPE sys_cpu_sys_percent gauge
sys_cpu_sys_percent 1.098855319644276e-10
# HELP replicas_quiescent Number of quiesced replicas
# TYPE replicas_quiescent gauge
replicas_quiescent{store="1"} 20
...
~~~

{{site.data.alerts.callout_info}}
In addition to using the exported time-series data to monitor a cluster via an external system, you can write alerting rules against them to make sure you are promptly notified of critical events or issues that may require intervention or investigation. See [Events to alert on](#events-to-alert-on) for more details.
{{site.data.alerts.end}}

## Alerting tools

In addition to actively monitoring the overall health and performance of a cluster, it is also essential to configure alerting rules that promptly send notifications when CockroachDB experiences events that require investigation or intervention.

This section identifies the most important events that you might want to create alerting rules for, and provides pre-defined rules definitions for these events appropriate for use with Prometheus's Alertmanager.

### Alertmanager

If you have configured [Prometheus](monitor-cockroachdb-with-prometheus.html) to monitor your CockroachDB instance, you can also configure alerting rule definitions to have Prometheus's Alertmanager detect [important events](#events-to-alert-on) and alert you when they occur.

#### Prometheus alerting rules endpoint

Every CockroachDB node exports an alerting rules template at `http://<host>:<http-port>/api/v2/rules/`. These rule definitions are formatted for easy integration with Prometheus's Alertmanager.

{% include_cached copy-clipboard.html %}
~~~ shell
$ curl http://localhost:8080/api/v2/rules/
~~~

~~~
rules/alerts:
    rules:
        - alert: UnavailableRanges
          expr: (sum by(instance, cluster) (ranges_unavailable)) > 0
          for: 10m0s
          annotations:
            {% raw %}summary: Instance {{ $labels.instance }} has {{ $value }} unavailable ranges{% endraw %}
        - alert: TrippedReplicaCircuitBreakers
          expr: (sum by(instance, cluster) (kv_replica_circuit_breaker_num_tripped_replicas)) > 0
          for: 10m0s
          annotations:
            {% raw %}summary: Instance {{ $labels.instance }} has {{ $value }} tripped per-Replica circuit breakers{% endraw %}
...
~~~

#### Working with Alertmanager rules

To add a rule from the `api/v2/rules/` rules endpoint, create or edit your `alerts.rules.yml` file and copy the rule definition for the event you want to alert on. For example, to add a rule to alert you when unavailable ranges are detected, copy the following from the rules endpoint into your `alerts.rules.yml` file:

{% include_cached copy-clipboard.html %}
~~~
- alert: UnavailableRanges
  expr: (sum by(instance, cluster) (ranges_unavailable)) > 0
  for: 10m0s
  annotations:
    {% raw %}summary: Instance {{ $labels.instance }} has {{ $value }} unavailable ranges{% endraw %}
~~~

If you already followed the steps from [Monitor CockroachDB with Prometheus](monitor-cockroachdb-with-prometheus.html), you should already have a `alerts.rules.yml` file. If you are creating a new `alerts.rules.yml` file, be sure that it begins with the following three lines:

{% include_cached copy-clipboard.html %}
~~~
groups:
- name: rules/alerts.rules
  rules:
~~~

Place your desired rule(s) underneath the `rules:` header. For example, the following shows an `alerts.rules.yml` file with the unavailable ranges rule defined:

{% include_cached copy-clipboard.html %}
~~~
groups:
- name: rules/alerts.rules
  rules:
  - alert: UnavailableRanges
    expr: (sum by(instance, cluster) (ranges_unavailable)) > 0
    for: 10m0s
    annotations:
      {% raw %}summary: Instance {{ $labels.instance }} has {{ $value }} unavailable ranges{% endraw %}
~~~

Once you have created or edited your `alerts.rules.yml` file, reference it in your `prometheus.yml` configuration file with the following:

{% include_cached copy-clipboard.html %}
~~~
rule_files:
- "rules/alerts.rules.yml"
~~~

If you already followed the steps from [Monitor CockroachDB with Prometheus](monitor-cockroachdb-with-prometheus.html), this reference is already present in your `prometheus.yml` file.

Start Prometheus and Alertmanager to begin watching for events to alert on. You can view imported rules on your Prometheus server's web interface at `http://<host>:<http-port>/rules`. Use the "State" column to verify that the rules were imported correctly.

### Events to alert on

{{site.data.alerts.callout_info}}
Currently, not all events listed have corresponding alert rule definitions available from the `api/v2/rules/` endpoint. Many events not yet available in this manner are defined in the <a href="https://github.com/cockroachdb/cockroach/blob/master/monitoring/rules/alerts.rules.yml">pre-defined alerting rules</a>. For more details, see [Monitor CockroachDB with Prometheus](monitor-cockroachdb-with-prometheus.html).
{{site.data.alerts.end}}

#### Node is down

- **Rule:** Send an alert when a node has been down for 15 minutes or more.

- **How to detect:** If a node is down, its `_status/vars` endpoint will return a `Connection refused` error. Otherwise, the `liveness_livenodes` metric will be the total number of live nodes in the cluster.

- **Rule definition:** Use the `InstanceDead` alert from our <a href="https://github.com/cockroachdb/cockroach/blob/master/monitoring/rules/alerts.rules.yml">pre-defined alerting rules</a>.

#### Node is restarting too frequently

- **Rule:** Send an alert if a node has restarted more than once in the last 10 minutes.

- **How to detect:** Calculate this using the number of times the `sys_uptime` metric in the node's `_status/vars` output was reset back to zero. The `sys_uptime` metric gives you the length of time, in seconds, that the `cockroach` process has been running.

- **Rule definition:** Use the `InstanceFlapping` alert from our <a href="https://github.com/cockroachdb/cockroach/blob/master/monitoring/rules/alerts.rules.yml">pre-defined alerting rules</a>.

#### Node is running low on disk space

- **Rule:** Send an alert when a node has less than 15% of free space remaining.

- **How to detect:** Divide the `capacity` metric by the `capacity_available` metric in the node's `_status/vars` output.

- **Rule definition:** Use the `StoreDiskLow` alert from our <a href="https://github.com/cockroachdb/cockroach/blob/master/monitoring/rules/alerts.rules.yml">pre-defined alerting rules</a>.

#### Node is not executing SQL

- **Rule:** Send an alert when a node is not executing SQL despite having connections.

- **How to detect:** The `sql_conns` metric in the node's `_status/vars` output will be greater than `0` while the `sql_query_count` metric will be `0`. You can also break this down by statement type using `sql_select_count`, `sql_insert_count`, `sql_update_count`, and `sql_delete_count`.

#### CA certificate expires soon

- **Rule:** Send an alert when the CA certificate on a node will expire in less than a year.

- **How to detect:** Calculate this using the `security_certificate_expiration_ca` metric in the node's `_status/vars` output.

- **Rule definition:** Use the `CACertificateExpiresSoon` alert from our <a href="https://github.com/cockroachdb/cockroach/blob/master/monitoring/rules/alerts.rules.yml">pre-defined alerting rules</a>.

#### Node certificate expires soon

- **Rule:** Send an alert when a node's certificate will expire in less than a year.

- **How to detect:** Calculate this using the `security_certificate_expiration_node` metric in the node's `_status/vars` output.

- **Rule definition:** Use the `NodeCertificateExpiresSoon` alert from our <a href="https://github.com/cockroachdb/cockroach/blob/master/monitoring/rules/alerts.rules.yml">pre-defined alerting rules</a>.

#### Changefeed is experiencing high latency

- **Rule:** Send an alert when the latency of any changefeed running on any node is higher than the set threshold, which depends on the [`gc.ttlseconds`](configure-replication-zones.html#replication-zone-variables) variable set in the cluster.

- **How to detect:** Calculate this using a threshold, where the threshold is less than the value of the [`gc.ttlseconds`](configure-replication-zones.html#replication-zone-variables) variable. For example, `changefeed.max_behind_nanos > [some threshold]`.

#### Unavailable ranges

- **Rule:** Send an alert when the number of ranges with fewer live replicas than needed for quorum is non-zero for too long.

- **How to detect:** Calculate this using the `ranges_unavailable` metric in the node's `_status/vars` output.

- **Rule definition:** Use the `UnavailableRanges` alerting rule from your cluster's [`api/v2/rules/` metrics endpoint](#alertmanager).

#### Tripped replica circuit breakers

- **Rule:** Send an alert when a replica stops serving traffic due to other replicas being offline for too long.

- **How to detect:** Calculate this using the `kv_replica_circuit_breaker_num_tripped_replicas` metric in the node's `_status/vars` output.

- **Rule definition:** Use the `TrippedReplicaCircuitBreakers` alerting rule from your cluster's [`api/v2/rules/` metrics endpoint](#alertmanager).

#### Under-replicated ranges

- **Rule:** Send an alert when the number of ranges with replication below the [replication factor](configure-replication-zones.html#num_replicas) is non-zero for too long.

- **How to detect:** Calculate this using the `ranges_underreplicated` metric in the node's `_status/vars` output.

- **Rule definition:** Use the `UnderreplicatedRanges` alerting rule from your cluster's [`api/v2/rules/` metrics endpoint](#alertmanager).

#### Requests stuck in Raft

- **Rule:** Send an alert when requests are taking a very long time in replication.

- **How to detect:** Calculate this using the `requests_slow_raft` metric in the node's `_status/vars` output.

- **Rule definition:** Use the `RequestsStuckInRaft` alerting rule from your cluster's [`api/v2/rules/` metrics endpoint](#alertmanager).

#### High open file descriptor count

- **Rule:** Send an alert when a cluster is getting close to the [open file descriptor limit](recommended-production-settings.html#file-descriptors-limit).

- **How to detect:** Calculate this using the `sys_fd_softlimit` metric in the node's `_status/vars` output.

- **Rule definition:** Use the `HighOpenFDCount` alerting rule from your cluster's [`api/v2/rules/` metrics endpoint](#alertmanager).

## See also

- [Production Checklist](recommended-production-settings.html)
- [Manual Deployment](manual-deployment.html)
- [Orchestrated Deployment](kubernetes-overview.html)
- [Local Deployment](start-a-local-cluster.html)
- [Third-Party Monitoring Integrations](third-party-monitoring-tools.html)
