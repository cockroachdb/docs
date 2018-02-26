---
title: Monitoring and Alerting
summary:
toc: false
---

CockroachDB has various [built-in safeguards against failure](high-availability.html), but it's nonetheless critical to actively monitor the overall health and performance of a cluster running in production. This page explains available monitoring tools and critical events and metrics to alert on.

<div id="toc"></div>

## Monitoring Tools

### Admin UI

The [built-in Admin UI](admin-ui-overview.html) gives you essential metrics about a cluster's health, such as the number of live, dead, and suspect nodes, the number of unavailable ranges, and the queries per second and service latency across the cluster. It is accessible from every node at `http://<host>:<http-port>`, or `http://<host>:8080` by default.

{{site.data.alerts.callout_danger}}Because the Admin UI is built into CockroachDB, if a cluster becomes unavailable, the Admin UI becomes unavailable as well. Therefore, it's essential to plan additional methods of monitoring cluster health as described below.{{site.data.alerts.end}}

### Prometheus Endpoint

Every node of a CockroachDB cluster exports granular timeseries metrics at `http://<host>:<http-port>/_status/vars`. The metrics are formatted for easy integration with [Prometheus](https://prometheus.io/), an open source tool for storing, aggregating, and querying timeseries data, but the format is **easy-to-parse** and can be massaged to work with other third-party monitoring systems. For a tutorial on using Prometheus, see [Monitor CockroachDB with Prometheus](monitor-cockroachdb-with-prometheus.html).

~~~ shell
$ curl -i http://localhost:8080/_status/vars
~~~

~~~
HTTP/1.1 200 OK
Cache-Control: no-cache
Content-Type: text/plain
Date: Mon, 26 Feb 2018 22:46:30 GMT
Transfer-Encoding: chunked

# HELP range_snapshots_preemptive_applied Number of applied pre-emptive snapshots
# TYPE range_snapshots_preemptive_applied counter
range_snapshots_preemptive_applied{store="1"} 0
# HELP raftlog_behind Number of Raft log entries followers on other stores are behind
# TYPE raftlog_behind gauge
raftlog_behind{store="1"} 1178
# HELP queue_replicate_process_success Number of replicas successfully processed by the replicate queue
# TYPE queue_replicate_process_success counter
queue_replicate_process_success{store="1"} 2620
...
~~~

{{site.data.alerts.callout_info}}In addition to using the exported timeseries data to monitor a cluster via an external system, you can write alerting rules against them to make sure you are promptly notified of critical events or issues that may require intervention or investigation. See <a href="#alerting">Alerting</a> for more details.{{site.data.alerts.end}}

### Health Endpoints

CockroachDB provides two HTTP endpoints for checking the health of individual nodes.

#### /health

If a node is down, the `http://<host>:<http-port>/health` endpoint returns a `Connnection refused` error:

~~~ shell
$ curl -i http://localhost:8080/health
~~~

~~~
curl: (7) Failed to connect to localhost port 8080: Connection refused
~~~

Otherwise, it returns an HTTP `200 OK` status response code with details about the node:

~~~
HTTP/1.1 200 OK
Cache-Control: no-cache
Content-Type: application/json
Date: Mon, 26 Feb 2018 22:11:02 GMT
Content-Length: 487

{
  "nodeId": 1,
  "address": {
    "networkField": "tcp",
    "addressField": "JESSEs-MBP:26257"
  },
  "buildInfo": {
    "goVersion": "go1.9",
    "tag": "v2.0-alpha.20180212-629-gf1271b232-dirty",
    "time": "2018/02/21 04:09:53",
    "revision": "f1271b2322a4a1060461707bdccd77b6d5a1843e",
    "cgoCompiler": "4.2.1 Compatible Apple LLVM 9.0.0 (clang-900.0.39.2)",
    "platform": "darwin amd64",
    "distribution": "CCL",
    "type": "development",
    "dependencies": null
  }
}
~~~

#### /&#95;admin/v1/health

If a node is unable to communicate with a majority of the other nodes in the cluster, the  `http://<node-host>:<http-port>/_admin/v1/health` endpoint returns an HTTP `503 Service Unavailable` status response code with an error:

~~~ shell
$ curl -i http://localhost:8080/_admin/v1/health
~~~

~~~
HTTP/1.1 503 Service Unavailable
Cache-Control: no-cache
Content-Type: application/json
Date: Mon, 26 Feb 2018 22:35:22 GMT
Content-Length: 50

{
  "error": "node is not healthy",
  "code": 14
}
~~~

Otherwise, it returns an HTTP `200 OK` status response code with an empty body:

~~~
HTTP/1.1 200 OK
Cache-Control: no-cache
Content-Type: application/json
Date: Mon, 26 Feb 2018 22:37:41 GMT
Content-Length: 4

{

}
~~~

### Raw Status Endpoints

Several endpoints return raw status metrics in JSON at `http://<host>:<http-port>/#/debug`. Feel free to investigate and use these endpoints, but note that they are subject to change.  

<img src="{{ 'images/raw-status-endpoints.png' | relative_url }}" alt="Raw Status Endpoints" style="border:1px solid #eee;max-width:100%" />

### Node Status Command

The [`cockroach node status`](view-node-details.html) command gives you metrics about the health and status of each node.

- With the `--ranges` flag, you get granular range and replica details, including unavailability and under-replication.
- With the `--stats` flag, you get granular disk usage details.
- With the `--all` flag, you get all of the above.

## Events to Alert On

Active monitoring helps you spot problems early to ensure the overall performance and health of a cluster, but it is also essential to create alerting rules that promptly send notifications when there are events that require investigation or intervention. This section identifies the most important events to create alerting rules for, with the [Prometheus Endpoint](#prometheus-endpoint) metrics to use for detecting the event.

{{site.data.alerts.callout_success}}If you use Prometheus for monitoring, you can also use our pre-defined <a href="https://github.com/cockroachdb/cockroach/blob/master/monitoring/rules/alerts.rules">alerting rules</a> with Alertmanager. See <a href="monitor-cockroachdb-with-prometheus.html">Monitor CockroachDB with Prometheus</a> for guidance.{{site.data.alerts.end}}

### Node is down

- **Rule:** Send an alert when a node has been down for 5 minutes or more.

- **How to detect:**
    - If a node is down, its `_status/vars` endpoint will return a `Connection refused` error. Otherwise, the `liveness_livenodes` metric will be the total number of live nodes in the cluster.

### Node is running low on disk space

- **Rule:** Send an alert when a node has less than 15% of free space remaining.

- **How to detect:**
    - Divide the `capacity` metric by the `capacity_available` metric in the node's `_status/vars` output.
    - As an alternative to the Prometheus Endpint, you can alert

### Node is not executing SQL

- **Rule:** Send an alert when a node is not executing SQL despite having connections.

- **How to detect:** The `sql_conns` metric in the node's `_status/vars` output will be great than `0` while the the `sql_query_count` metric will be `0`. You can also break this down by statement type using `sql_select_count`, `sql_insert_count`, `sql_update_count`, and `sql_delete_count`.

### CA certificate expires soon

- **Rule:** Send an alert when the CA certificate on a node will expire in less than a year.

- **How to detect:** Calculate this using the `security_certificate_expiration_ca` metric in the node's `_status/vars` output.

### Node certificate expires soon

- **Rule:** Send an alert when a node's certificate will expire in less than a year.

- **How to detect:** Calculate this using the `security_certificate_expiration_node` metric in the node's `_status/vars` output.
