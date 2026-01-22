---
title: Monitoring and Alerting
summary: Monitor the health and performance of a cluster and alert on critical events and metrics.
toc: true
docs_area: manage
---

In addition to CockroachDB's [built-in safeguards against failure]({% link {{ page.version.version }}/frequently-asked-questions.md %}#how-does-cockroachdb-survive-failures), it is critical to actively monitor the overall health and performance of a cluster running in production and to create alerting rules that promptly send notifications when there are events that require investigation or intervention.

This page describes the monitoring and observability tools that are built into CockroachDB {{ site.data.products.core }} and shows how to collect your cluster's metrics using external tools like Prometheus's AlertManager for event-based alerting. To export metrics from a CockroachDB {{ site.data.products.cloud }} cluster, refer to [Export Metrics From a CockroachDB {{ site.data.products.advanced }} Cluster]({% link cockroachcloud/export-metrics.md %}) instead of this page. For more details, refer to:

- [Monitor CockroachDB with Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %})
- [Third-party Monitoring Tools]({% link {{ page.version.version }}/third-party-monitoring-tools.md %})

{% include {{ page.version.version }}/prod-deployment/cluster-unavailable-monitoring.md %}

<a id="monitoring-tools"></a>

## Built-in monitoring tools

CockroachDB includes several tools to help you monitor your cluster's workloads and performance.

{{site.data.alerts.callout_danger}}
If a cluster becomes unavailable, most of the monitoring tools in the following sections become unavailable. In that case, Cockroach Labs recommends that you consult the [cluster logs]({% link {{ page.version.version }}/logging-overview.md %}). To maintain access to a cluster's historical metrics when the cluster is unavailable, configure a [third-party monitoring tool]({% link {{ page.version.version }}/third-party-monitoring-tools.md %}) like Prometheus or Datadog to collect metrics periodically from the [Prometheus endpoint](#prometheus-endpoint). The metrics are stored outside the cluster, and can be used to help troubleshoot what led up to an outage.
{{site.data.alerts.end}}

### DB Console

The [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) collects time-series cluster metrics and displays basic information about a cluster's health, such as node status, number of unavailable ranges, and queries per second and service latency across the cluster. This tool is designed to help you optimize cluster performance and troubleshoot issues. The DB Console is accessible from every node at `http://<host>:<http-port>`, or `http://<host>:8080` by default.

The DB Console automatically runs in the cluster. The following sections describe some of the pages that can help you to monitor and observe your cluster. For more information on accessing the DB Console, see [Access DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access).

#### Metrics dashboards

The [Metrics dashboards]({% link {{ page.version.version }}/ui-overview-dashboard.md %}), which are located within **Metrics** in DB Console, provide information about a cluster's performance, load, and resource utilization. The Metrics dashboards are built using time-series metrics collected from the cluster. By default, metrics are collected every 10 minutes and stored within the cluster, and data is retained at 10-second granularity for 10 days , and at 30-minute granularity for 90 days.

To learn more, refer to [Overview Dashboard]({% link {{ page.version.version }}/ui-overview-dashboard.md %}).

Each cluster automatically exposes its metrics at an [endpoint in Prometheus format](#prometheus-endpoint), enabling you to collect them in an external tool like Datadog or your own Prometheus, Grafana, and AlertManager instances. These tools:

- Collect metrics from the cluster's Prometheus endpoint at an interval you define.
- Store historical metrics according to your data retention requirements.
- Allow you to create and share dashboards, reports, and alerts based on metrics.
- Do not run within the cluster, and can help you to investigate a situation that led up to cluster outage even if the cluster is unavailable.

Metrics collected by the DB Console are stored within the cluster, and the SQL queries that create the reports on the Metrics dashboards also impose load on the cluster.

#### SQL Activity pages

The SQL Activity pages, which are located within **SQL Activity** in DB Console, provide information about SQL [statements]({% link {{ page.version.version }}/ui-statements-page.md %}), [transactions]({% link {{ page.version.version }}/ui-transactions-page.md %}), and [sessions]({% link {{ page.version.version }}/ui-sessions-page.md %}).

The information on the SQL Activity pages comes from the cluster's [`crdb_internal` system catalog](#crdb_internal-system-catalog). It is not exported via the cluster's [Prometheus endpoint](#prometheus-endpoint).

### Cluster API

The [Cluster API]({% link {{ page.version.version }}/cluster-api.md %}) is a REST API that runs in the cluster and provides much of the same information about your cluster and nodes as is available from the [DB Console](#db-console) or the [Prometheus endpoint](#prometheus-endpoint), and is accessible from each node at the same address and port as the DB Console.

If the cluster is unavailable, the Cluster API is also unavailable.

For more information, see the Cluster API [overview]({% link {{ page.version.version }}/cluster-api.md %}) and [reference](https://www.cockroachlabs.com/docs/api/cluster/v2).

### `crdb_internal` system catalog

The `crdb_internal` system catalog is a schema in each database that contains information about internal objects, processes, and metrics about that database. [DBMarlin](https://docs.dbmarlin.com/docs/Monitored-Technologies/Databases/cockroachdb) provides a third-party tool that collects metrics from a cluster's `crdb_internal` system catalogs rather than the cluster's Prometheus endpoint. Refer to [Monitor CockroachDB with DBmarlin]({% link {{ page.version.version }}/dbmarlin.md %}).

If the cluster is unavailable, a database's `crdb_internal` system catalog cannot be queried.

For details, see [`crdb_internal`]({% link {{ page.version.version }}/crdb-internal.md %}).

### Health endpoints

CockroachDB provides two HTTP endpoints for checking the health of individual nodes.

These endpoints are also available through the [Cluster API]({% link {{ page.version.version }}/cluster-api.md %}) under `/v2/health/`.

If the cluster is unavailable, these endpoints are also unavailable.

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

- The node is in the [wait phase of the node shutdown sequence]({% link {{ page.version.version }}/node-shutdown.md %}#draining). This causes load balancers and connection managers to reroute traffic to other nodes before the node is drained of SQL client connections and leases, and is a necessary check during [rolling upgrades]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}).

    {{site.data.alerts.callout_success}}
    If you find that your load balancer's health check is not always recognizing a node as unready before the node shuts down, you can increase the `server.shutdown.initial_wait` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) (previously named `server.shutdown.drain_wait`) to cause a node to return `503 Service Unavailable` even before it has started shutting down.
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
The JSON endpoints are deprecated in favor of the [Cluster API](#cluster-api).

The `/_status/vars` metrics endpoint is in Prometheus format and is not deprecated. For more information, refer to [Prometheus endpoint](#prometheus-endpoint).
{{site.data.alerts.end}}

Several endpoints return raw status meta information in JSON at `http://<host>:<http-port>/#/debug`. You can investigate and use these endpoints, but note that they are subject to change.

<img src="{{ 'images/{{ page.version.version }}/raw-status-endpoints.png' | relative_url }}" alt="Raw Status Endpoints" style="border:1px solid #eee;max-width:100%" />

### Node status command

The [`cockroach node status`]({% link {{ page.version.version }}/cockroach-node.md %}) command gives you metrics about the health and status of each node.

- With the `--ranges` flag, you get granular range and replica details, including unavailability and under-replication.
- With the `--stats` flag, you get granular disk usage details.
- With the `--decommission` flag, you get details about the [node decommissioning](node-shutdown.html?filters=decommission#cockroach-node-status) process.
- With the `--all` flag, you get all of the above.

### Prometheus endpoint

Every node of a CockroachDB cluster exports granular time-series metrics at `http://<host>:<http-port>/_status/vars`. The metrics are formatted for easy integration with [Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}), a tool for storing, aggregating, and querying time-series data. The Prometheus format is human-readable and can be processed to work with other third-party monitoring systems such as [Sysdig](https://sysdig.atlassian.net/wiki/plugins/servlet/mobile?contentId=64946336#content/view/64946336) and [stackdriver](https://github.com/GoogleCloudPlatform/k8s-stackdriver/tree/master/prometheus-to-sd). Many of the [third-party monitoring integrations]({% link {{ page.version.version }}/third-party-monitoring-tools.md %}), such as [Datadog]({% link {{ page.version.version }}/datadog.md %}) and [Kibana]({% link {{ page.version.version }}/kibana.md %}), collect metrics from a cluster's Prometheus endpoint.

To access the Prometheus endpoint of a cluster running on `localhost:8080`:

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

If you rely on external tools for storing and visualizing your cluster's time-series metrics, Cockroach Labs recommends that you [disable the DB Console's storage of time-series metrics]({% link {{ page.version.version }}/operational-faqs.md %}#disable-time-series-storage).

When storage of time-series metrics is disabled, the DB Console Metrics dashboards in the DB Console are still available, but their visualizations are blank. This is because the dashboards rely on data that is no longer available.

### Critical nodes endpoint

The critical nodes status endpoint is used to:

- Check if any of your nodes are in a critical state.  A node is _critical_ if that node becoming unreachable would cause [replicas to become unavailable]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#replication-status).
- Check if any ranges are [under-replicated or unavailable]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#replication-status). This is useful when determining whether a node is ready for [decommissioning]({% link {{ page.version.version }}/node-shutdown.md %}#decommissioning).
- Check if any of your cluster's data placement constraints (set via [multi-region SQL]({% link {{ page.version.version }}/multiregion-overview.md %}) or direct [configuration of replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %})) are being violated. This is useful when implementing [data domiciling]({% link {{ page.version.version }}/data-domiciling.md %}) or [troubleshooting zone configurations]({% link {{ page.version.version }}/troubleshoot-replication-zones.md %}) generally.

If you find under-replicated ranges or constraint violations, you will need to [Troubleshoot your replication zones]({% link {{ page.version.version }}/troubleshoot-replication-zones.md %}).

#### Fields

The JSON object returned by the critical nodes status endpoint contains the following top-level fields.

| Field                         | Description                                                                                                   |
|-------------------------------+---------------------------------------------------------------------------------------------------------------|
| `criticalNodes`               | A list of nodes that are critical. Critical nodes are not safe to terminate because data loss could occur.    |
| `report.overReplicated`       | A list of ranges that are over-replicated vs. your [zone config settings]({% link {{ page.version.version }}/configure-replication-zones.md %}).  |
| `report.violatingConstraints` | A list of ranges that are in violation of your [zone config settings]({% link {{ page.version.version }}/configure-replication-zones.md %}).      |
| `report.unavailable`          | A list of ranges that are unavailable.                                                                        |
| `report.unavailableNodeIds`   | A list of node IDs with unavailable ranges.                                                                   |
| `report.underReplicated`      | A list of ranges that are under-replicated vs. your [zone config settings]({% link {{ page.version.version }}/configure-replication-zones.md %}). |

The `criticalNodes` portion of the response contains a (possibly empty) list of objects, each of which has the following fields.

| Field           | Example                 | Description                                                                                                    |
|-----------------+-------------------------+----------------------------------------------------------------------------------------------------------------|
| `nodeId`        | `2`                     | The node ID of the critical node.                                                                              |
| `address`       | `{...}`                 | An object representing the network address of the node.                                                        |
| `locality`      | `{...}`                 | An object representing the [locality]({% link {{ page.version.version }}/cockroach-start.md %}#locality) of the node.                              |
| `ServerVersion` | `{...}`                 | An object representing the CockroachDB version of the node.                                                    |
| `buildTag`      | `"v23.1.0-rc.2"`        | The git build tag of the CockroachDB release of the node.                                                      |
| `startedAt`     | `"1683655799845426000"` | The UNIX epoch timestamp at which the node was started.                                                        |
| `clusterName`   | `""`                    | The [name of the cluster]({% link {{ page.version.version }}/cockroach-start.md %}#flags-cluster-name) (if any) with which the node is associated. |
| `sqlAddress`    | `{...}`                 | The [network address for SQL connections]({% link {{ page.version.version }}/cockroach-start.md %}#flags-sql-addr) to the node.                    |
| `httpAddress`   | `{...}`                 | The [address for DB Console HTTP connections]({% link {{ page.version.version }}/cockroach-start.md %}#flags-http-addr) to the node.               |

Each report subtype (e.g., `report.unavailable`, `report.violatingConstraints`, etc.) returns a (possibly empty) list of objects describing the [ranges]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) that report applies to. Each object contains a `rangeDescriptor` and a `config` that describes the range.

| Field                          | Example                                                      | Description                                                                                                                                    |
|--------------------------------+--------------------------------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------|
| `rangeDescriptor.rangeId`      | `"89"`                                                       | The [range ID]({% link {{ page.version.version }}/alter-range.md %}#find-range-id-and-leaseholder-information) this section of the report is referring to.                         |
| `rangeDescriptor.startKey`     | `"8okSYW1zdGVyZGFtAAE="`                                     | The [start key for the range]({% link {{ page.version.version }}/show-ranges.md %}#start-key).                                                                                     |
| `rangeDescriptor.endKey`       | `"8okSYW1zdGVyZGFtAAESszMzMzMzQAD/gAD/AP8A/wD/AP8A/yMAAQ=="` | The [end key for the range]({% link {{ page.version.version }}/show-ranges.md %}#end-key).                                                                                         |
| `config.rangeMinBytes`         | `134217728`                                                  | The [target minimum size]({% link {{ page.version.version }}/configure-replication-zones.md %}#range-min-bytes) for the range.                                                     |
| `config.rangeMaxBytes`         | `536870912`                                                  | The [target maximum size]({% link {{ page.version.version }}/configure-replication-zones.md %}#range-min-bytes) for the range.                                                     |
| `config.gcPolicy`              | `{...}`                                                      | An object representing the garbage collection settings for the range (e.g. [`gc.ttlseconds`]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds)). |
| `config.globalReads`           | `false`                                                      | Whether the range enables fast [global reads]({% link {{ page.version.version }}/configure-replication-zones.md %}#global_reads).                                                  |
| `config.numReplicas`           | `9`                                                          | The [replication factor]({% link {{ page.version.version }}/configure-replication-zones.md %}#num_replicas) for the range.                                                         |
| `config.numVoters`             | `0`                                                          | The [number of voting replicas]({% link {{ page.version.version }}/configure-replication-zones.md %}#num_voters) for the range.                                                    |
| `config.constraints`           | `[...]`                                                      | The [constraints]({% link {{ page.version.version }}/configure-replication-zones.md %}#constraints) for the range.                                                                 |
| `config.voterConstraints`      | `[...]`                                                      | The [voting replica constraints]({% link {{ page.version.version }}/configure-replication-zones.md %}#voter_constraints) for the range.                                            |
| `config.leasePreferences`      | `[...]`                                                      | The [lease preferences]({% link {{ page.version.version }}/configure-replication-zones.md %}#lease_preferences) for the range.                                                     |
| `config.rangefeedEnabled`      | `false`                                                      | Whether [rangefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds) are enabled for this range.                                      |
| `config.excludeDataFromBackup` | `false`                                                      | Whether this range's data should be excluded from [backups]({% link {{ page.version.version }}/backup.md %}).                                                                      |

#### Examples

- [Replication status - normal](#replication-status-normal)
- [Replication status - constraint violation](#replication-status-constraint-violation)
- [Replication status - under-replicated ranges](#replication-status-under-replicated-ranges)
- [Replication status - ranges in critical localities](#replication-status-ranges-in-critical-localities)

##### Replication status - normal

The following example assumes you are running a newly started, local multi-region [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) cluster started using the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach demo --global --nodes 9 --insecure
~~~

Execute the following statements to set the [database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions) for the [`movr` database]({% link {{ page.version.version }}/movr.md %}#the-movr-database):

{% include_cached copy-clipboard.html %}
~~~ sql
 ALTER DATABASE movr SET PRIMARY REGION "us-east1";
 ALTER DATABASE movr ADD REGION "us-west1";
 ALTER DATABASE movr ADD REGION "europe-west1";
~~~


{% include_cached copy-clipboard.html %}
~~~ shell
curl -X POST http://localhost:8080/_status/critical_nodes
~~~

~~~ json
{
  "criticalNodes": [
  ],
  "report": {
    "underReplicated": [
    ],
    "overReplicated": [
    ],
    "violatingConstraints": [
    ],
    "unavailable": [
    ],
    "unavailableNodeIds": [
    ]
  }
}
~~~

{{site.data.alerts.callout_info}}
You may have to wait a few minutes after setting the database regions before getting the 'all clear' output above. This can happen because it takes time for [replica movement]({% link {{ page.version.version }}/architecture/replication-layer.md %}) to occur in order to meet the constraints given by the [multi-region SQL abstractions]({% link {{ page.version.version }}/multiregion-overview.md %}).
{{site.data.alerts.end}}

##### Replication status - constraint violation

The following example assumes you are running a newly started, local multi-region [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) cluster started using the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach demo --global --nodes 9 --insecure
~~~

Execute the following statements to set the [database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions) for the [`movr` database]({% link {{ page.version.version }}/movr.md %}#the-movr-database):

{% include_cached copy-clipboard.html %}
~~~ sql
 ALTER DATABASE movr SET PRIMARY REGION "us-east1";
 ALTER DATABASE movr ADD REGION "us-west1";
 ALTER DATABASE movr ADD REGION "europe-west1";
~~~

By default, this multi-region demo cluster will not have any constraint violations.

To introduce a violation that you can then query for, you'll [set the table locality to `REGIONAL BY TABLE`]({% link {{ page.version.version }}/alter-table.md %}#set-the-table-locality-to-regional-by-table) for the [`movr.users`]({% link {{ page.version.version }}/movr.md %}#the-movr-database) table.

You can use [`SHOW CREATE TABLE`]({% link {{ page.version.version }}/show-create.md %}) to see what existing [table locality]({% link {{ page.version.version }}/table-localities.md %}) is attached to the `users` table, so you know what to modify.

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE TABLE users;
~~~

~~~
  table_name |                     create_statement
-------------+-----------------------------------------------------------
  users      | CREATE TABLE public.users (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     name VARCHAR NULL,
             |     address VARCHAR NULL,
             |     credit_card VARCHAR NULL,
             |     CONSTRAINT users_pkey PRIMARY KEY (city ASC, id ASC)
             | ) LOCALITY REGIONAL BY TABLE IN PRIMARY REGION
(1 row)
~~~

To create a constraint violation, use the [`ALTER TABLE ... SET LOCALITY`]({% link {{ page.version.version }}/alter-table.md %}#set-the-table-locality-to-regional-by-table) statement to tell the [ranges]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) in the `PRIMARY REGION` (`us-east1`) that they are supposed to be in the `europe-west1` locality:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE users SET LOCALITY REGIONAL BY TABLE IN "europe-west1";
~~~

Once the statement above executes, the ranges currently stored in the `us-east1` locality will now be in a state where they are explicitly now supposed to be in the `europe-west1` locality, and are thus in violation of a constraint.

In other words, this tells the ranges that "where you are now is *not* where you are supposed to be". This will cause the cluster to rebalance the ranges, which will take some time. During the time it takes for the rebalancing to occur, the ranges will be in violation of a constraint.

The critical nodes endpoint should now report a constraint violation in the `violatingConstraints` field of the response, similar to the one shown below.

{{site.data.alerts.callout_success}}
Use the [`SHOW RANGES`]({% link {{ page.version.version }}/show-ranges.md %}) statement to find out more information about the ranges that are in violation of constraints.

In a real life constraint violation scenario, you will need to [Troubleshoot your replication zones]({% link {{ page.version.version }}/troubleshoot-replication-zones.md %}).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl -X POST http://localhost:8080/_status/critical_nodes
~~~

~~~ json
{
  "criticalNodes": [
  ],
  "report": {
    "underReplicated": [
    ],
    "overReplicated": [
    ],
    "violatingConstraints": [
      {
        "rangeDescriptor": {
          "rangeId": "71",
          "startKey": "8okSYW1zdGVyZGFtAAESszMzMzMzQAD/gAD/AP8A/wD/AP8A/yMAAQ==",
          "endKey": "8okSYm9zdG9uAAESMzMzMzMzRAD/gAD/AP8A/wD/AP8A/woAAQ==",
          "internalReplicas": [
            {
              "nodeId": 8,
              "storeId": 8,
              "replicaId": 9,
              "type": 0
            },
            {
              "nodeId": 7,
              "storeId": 7,
              "replicaId": 8,
              "type": 0
            },
            {
              "nodeId": 1,
              "storeId": 1,
              "replicaId": 7,
              "type": 5
            },
            {
              "nodeId": 2,
              "storeId": 2,
              "replicaId": 5,
              "type": 0
            },
            {
              "nodeId": 6,
              "storeId": 6,
              "replicaId": 6,
              "type": 5
            }
          ],
          "nextReplicaId": 10,
          "generation": "32",
          "stickyBit": {
            "wallTime": "9223372036854775807",
            "logical": 2147483647,
            "synthetic": false
          }
        },
        "config": {
          "rangeMinBytes": "134217728",
          "rangeMaxBytes": "536870912",
          "gcPolicy": {
            "ttlSeconds": 14400,
            "protectionPolicies": [
            ],
            "ignoreStrictEnforcement": false
          },
          "globalReads": false,
          "numReplicas": 5,
          "numVoters": 3,
          "constraints": [
            {
              "numReplicas": 1,
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "europe-west1"
                }
              ]
            },
            {
              "numReplicas": 1,
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "us-east1"
                }
              ]
            },
            {
              "numReplicas": 1,
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "us-west1"
                }
              ]
            }
          ],
          "voterConstraints": [
            {
              "numReplicas": 0,
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "europe-west1"
                }
              ]
            }
          ],
          "leasePreferences": [
            {
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "europe-west1"
                }
              ]
            }
          ],
          "rangefeedEnabled": false,
          "excludeDataFromBackup": false
        }
      },
      ...
    ],
    "unavailable": [
    ],
    "unavailableNodeIds": [
    ]
  }
}
~~~

##### Replication status - under-replicated ranges

The following example assumes you are running a newly started, local multi-region [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) cluster started using the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach demo --global --nodes 9 --insecure
~~~

Execute the following statements to set the [database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions) for the [`movr` database]({% link {{ page.version.version }}/movr.md %}#the-movr-database):

{% include_cached copy-clipboard.html %}
~~~ sql
 ALTER DATABASE movr SET PRIMARY REGION "us-east1";
 ALTER DATABASE movr ADD REGION "us-west1";
 ALTER DATABASE movr ADD REGION "europe-west1";
~~~

By default, this multi-region demo cluster will not have any [under-replicated ranges]({% link {{ page.version.version }}/ui-replication-dashboard.md %}#under-replicated-ranges).

To put the cluster into a state where some [ranges]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) are under-replicated, issue the following [`ALTER DATABASE ... ALTER LOCALITY ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-database.md %}#alter-locality) statement, which tells it to store 9 copies of each range underlying the `movr` database.

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr ALTER LOCALITY REGIONAL IN "us-east1" CONFIGURE ZONE USING num_replicas = 9;
~~~

Once the statement above executes, the cluster will rebalance so that it's storing 9 copies of each range underlying the `movr` database. During the time it takes for the rebalancing to occur, these ranges will be considered under-replicated, since there are not yet as many copies (9) of each range as you have just specified.

The critical nodes endpoint should now report ranges in the `underReplicated` field of the response, similar to the one shown below.

{{site.data.alerts.callout_success}}
Use the [`SHOW RANGES`]({% link {{ page.version.version }}/show-ranges.md %}) statement to find out more information about the under-replicated ranges.

In a real life under-replication scenario, you may need to [Troubleshoot your replication zones]({% link {{ page.version.version }}/troubleshoot-replication-zones.md %}).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ shell
curl -X POST http://localhost:8080/_status/critical_nodes
~~~

~~~ json
{
  "criticalNodes": [
    {
      "nodeId": 3,
      "address": {
        "networkField": "tcp",
        "addressField": "127.0.0.1:26359"
      },
      "attrs": {
        "attrs": [
        ]
      },
      "locality": {
        "tiers": [
          {
            "key": "region",
            "value": "us-east1"
          },
          {
            "key": "az",
            "value": "d"
          }
        ]
      },
      "ServerVersion": {
        "majorVal": 23,
        "minorVal": 2,
        "patch": 0,
        "internal": 0
      },
      "buildTag": "v23.2.0-rc.2",
      "startedAt": "1705098699112441000",
      "localityAddress": [
      ],
      "clusterName": "",
      "sqlAddress": {
        "networkField": "tcp",
        "addressField": "127.0.0.1:26259"
      },
      "httpAddress": {
        "networkField": "tcp",
        "addressField": "127.0.0.1:8082"
      }
    },
    ...
  ],
  "report": {
    "underReplicated": [
      {
        "rangeDescriptor": {
          "rangeId": "74",
          "startKey": "84kSc2FuIGZyYW5jaXNjbwABEnd3d3d3d0gA/4AA/wD/AP8A/wD/AP8HAAE=",
          "endKey": "84kSc2FuIGZyYW5jaXNjbwABEoiIiIiIiEgA/4AA/wD/AP8A/wD/AP8IAAE=",
          "internalReplicas": [
            {
              "nodeId": 3,
              "storeId": 3,
              "replicaId": 1,
              "type": 0
            },
            {
              "nodeId": 1,
              "storeId": 1,
              "replicaId": 6,
              "type": 0
            },
            {
              "nodeId": 2,
              "storeId": 2,
              "replicaId": 7,
              "type": 0
            },
            {
              "nodeId": 4,
              "storeId": 4,
              "replicaId": 4,
              "type": 5
            },
            {
              "nodeId": 8,
              "storeId": 8,
              "replicaId": 5,
              "type": 5
            },
            {
              "nodeId": 5,
              "storeId": 5,
              "replicaId": 8,
              "type": 5
            },
            {
              "nodeId": 9,
              "storeId": 9,
              "replicaId": 9,
              "type": 5
            },
            {
              "nodeId": 6,
              "storeId": 6,
              "replicaId": 10,
              "type": 5
            }
          ],
          "nextReplicaId": 11,
          "generation": "43",
          "stickyBit": {
            "wallTime": "9223372036854775807",
            "logical": 2147483647,
            "synthetic": false
          }
        },
        "config": {
          "rangeMinBytes": "134217728",
          "rangeMaxBytes": "536870912",
          "gcPolicy": {
            "ttlSeconds": 14400,
            "protectionPolicies": [
            ],
            "ignoreStrictEnforcement": false
          },
          "globalReads": false,
          "numReplicas": 9,
          "numVoters": 3,
          "constraints": [
            {
              "numReplicas": 1,
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "europe-west1"
                }
              ]
            },
            {
              "numReplicas": 1,
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "us-east1"
                }
              ]
            },
            {
              "numReplicas": 1,
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "us-west1"
                }
              ]
            }
          ],
          "voterConstraints": [
            {
              "numReplicas": 0,
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "us-east1"
                }
              ]
            }
          ],
          "leasePreferences": [
            {
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "us-east1"
                }
              ]
            }
          ],
          "rangefeedEnabled": false,
          "excludeDataFromBackup": false
        }
      },
      ...
    ],
    "overReplicated": [
    ],
    "violatingConstraints": [
    ],
    "unavailable": [
    ],
    "unavailableNodeIds": [
    ]
  }
}
~~~

##### Replication status - ranges in critical localities

The following example assumes you are running a newly started, local multi-region [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) cluster started using the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach demo --global --nodes 9 --insecure
~~~

Execute the following statements to set the [database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions) for the [`movr` database]({% link {{ page.version.version }}/movr.md %}#the-movr-database):

{% include_cached copy-clipboard.html %}
~~~ sql
 ALTER DATABASE movr SET PRIMARY REGION "us-east1";
 ALTER DATABASE movr ADD REGION "us-west1";
 ALTER DATABASE movr ADD REGION "europe-west1";
~~~

By default, this multi-region demo cluster will not have any [nodes]({% link {{ page.version.version }}/architecture/overview.md %}#node) in a critical state. A node is _critical_ if that node becoming unreachable would cause [replicas to become unavailable]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}#replication-status).

The status endpoint describes which of your nodes (if any) are critical via the `criticalNodes` field in the response.

To artificially put the nodes in this demo cluster in "critical" status, we can issue the following SQL statement, which uses [`ALTER DATABASE ... ALTER LOCALITY ... CONFIGURE ZONE`]({% link {{ page.version.version }}/alter-database.md %}#alter-locality) to tell the cluster to store more copies of each range underlying the `movr` database than there are nodes in the cluster.

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr ALTER LOCALITY REGIONAL IN "us-east1" CONFIGURE ZONE USING num_replicas = 128;
~~~

The critical nodes endpoint should now report that all of the cluster's nodes are critical by listing them in the `criticalNodes` field of the response.

{{site.data.alerts.callout_success}}
Use the [`SHOW RANGES`]({% link {{ page.version.version }}/show-ranges.md %}) statement to find out more information about the ranges in critical localities.

In a real life critical localities scenario, you may need to [Troubleshoot your replication zones]({% link {{ page.version.version }}/troubleshoot-replication-zones.md %}).
{{site.data.alerts.end}}


{% include_cached copy-clipboard.html %}
~~~ shell
curl -X POST http://localhost:8080/_status/critical_nodes
~~~

~~~ json
{
  "criticalNodes": [
    {
      "nodeId": 3,
      "address": {
        "networkField": "tcp",
        "addressField": "127.0.0.1:26359"
      },
      "attrs": {
        "attrs": [
        ]
      },
      "locality": {
        "tiers": [
          {
            "key": "region",
            "value": "us-east1"
          },
          {
            "key": "az",
            "value": "d"
          }
        ]
      },
      "ServerVersion": {
        "majorVal": 23,
        "minorVal": 2,
        "patch": 0,
        "internal": 0
      },
      "buildTag": "v23.2.0-rc.2",
      "startedAt": "1705098699112441000",
      "localityAddress": [
      ],
      "clusterName": "",
      "sqlAddress": {
        "networkField": "tcp",
        "addressField": "127.0.0.1:26259"
      },
      "httpAddress": {
        "networkField": "tcp",
        "addressField": "127.0.0.1:8082"
      }
    },
    ...
  ],
  "report": {
    "underReplicated": [
      {
        "rangeDescriptor": {
          "rangeId": "100",
          "startKey": "8w==",
          "endKey": "84kSYm9zdG9uAAESIiIiIiIiQgD/gAD/AP8A/wD/AP8A/wIAAQ==",
          "internalReplicas": [
            {
              "nodeId": 3,
              "storeId": 3,
              "replicaId": 1,
              "type": 0
            },
            {
              "nodeId": 5,
              "storeId": 5,
              "replicaId": 2,
              "type": 5
            },
            {
              "nodeId": 1,
              "storeId": 1,
              "replicaId": 3,
              "type": 0
            },
            {
              "nodeId": 2,
              "storeId": 2,
              "replicaId": 4,
              "type": 0
            },
            {
              "nodeId": 9,
              "storeId": 9,
              "replicaId": 5,
              "type": 5
            },
            {
              "nodeId": 4,
              "storeId": 4,
              "replicaId": 6,
              "type": 5
            },
            {
              "nodeId": 7,
              "storeId": 7,
              "replicaId": 7,
              "type": 5
            },
            {
              "nodeId": 6,
              "storeId": 6,
              "replicaId": 8,
              "type": 5
            },
            {
              "nodeId": 8,
              "storeId": 8,
              "replicaId": 9,
              "type": 5
            }
          ],
          "nextReplicaId": 10,
          "generation": "38",
          "stickyBit": {
            "wallTime": "0",
            "logical": 0,
            "synthetic": false
          }
        },
        "config": {
          "rangeMinBytes": "134217728",
          "rangeMaxBytes": "536870912",
          "gcPolicy": {
            "ttlSeconds": 14400,
            "protectionPolicies": [
            ],
            "ignoreStrictEnforcement": false
          },
          "globalReads": false,
          "numReplicas": 128,
          "numVoters": 3,
          "constraints": [
            {
              "numReplicas": 1,
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "europe-west1"
                }
              ]
            },
            {
              "numReplicas": 1,
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "us-east1"
                }
              ]
            },
            {
              "numReplicas": 1,
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "us-west1"
                }
              ]
            }
          ],
          "voterConstraints": [
            {
              "numReplicas": 0,
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "us-east1"
                }
              ]
            }
          ],
          "leasePreferences": [
            {
              "constraints": [
                {
                  "type": 0,
                  "key": "region",
                  "value": "us-east1"
                }
              ]
            }
          ],
          "rangefeedEnabled": false,
          "excludeDataFromBackup": false
        }
      },
      ...
    ],
    "overReplicated": [
    ],
    "violatingConstraints": [
    ],
    "unavailable": [
    ],
    "unavailableNodeIds": [
    ]
  }
}
~~~

### Store status endpoint

The store status endpoint at `/_status/stores` provides information about the [stores]({% link {{ page.version.version }}/cockroach-start.md %}#store) attached to each [node]({% link {{ page.version.version }}/architecture/overview.md %}#node) of your cluster.

The response is a JSON object containing a `stores` array of objects.  Each store object has the following fields:

Field | Description
------|------------
`storeId` | The [store ID]({% link {{ page.version.version }}/alter-range.md %}#find-the-cluster-store-ids) associated with this [store]({% link {{ page.version.version }}/cockroach-start.md %}#store).
`nodeId` | The [node ID]({% link {{ page.version.version }}/cockroach-node.md %}#list-node-ids) associated with this [store]({% link {{ page.version.version }}/cockroach-start.md %}#store).
`encryptionStatus` | The [encryption status]({% link {{ page.version.version }}/encryption.md %}#checking-encryption-status) of this [store]({% link {{ page.version.version }}/cockroach-start.md %}#store).
`totalFiles` | If the store is [encrypted]({% link {{ page.version.version }}/encryption.md %}), the total number of encrypted files on the store.
`totalBytes` | If the store is [encrypted]({% link {{ page.version.version }}/encryption.md %}), the total number of encrypted bytes on the store.
`activeKeyFiles` | If the store is [encrypted]({% link {{ page.version.version }}/encryption.md %}),, the number of files using the [active data key]({% link {{ page.version.version }}/encryption.md %}#changing-encryption-algorithm-or-keys).
`activeKeyBytes` | If the store is [encrypted]({% link {{ page.version.version }}/encryption.md %}),, the number of bytes using the [active data key]({% link {{ page.version.version }}/encryption.md %}#changing-encryption-algorithm-or-keys).
`dir` | The directory on disk where the [store]({% link {{ page.version.version }}/cockroach-start.md %}#store) is located.
`walFailoverPath` | If [WAL failover is enabled]({% link {{ page.version.version }}/cockroach-start.md %}#enable-wal-failover), this field encodes the path to the secondary WAL directory used for failover in the event of high write latency to the primary WAL.

For example, to get the status of the stores of nodeID `1`, use the following:

{% include_cached copy-clipboard.html %}
~~~ shell
curl http://localhost:8080/_status/stores/1
~~~

~~~ json
{
  "stores": [
    {
      "storeId": 1,
      "nodeId": 1,
      "encryptionStatus": null,
      "totalFiles": "0",
      "totalBytes": "0",
      "activeKeyFiles": "0",
      "activeKeyBytes": "0",
      "dir": "/tmp/node0",
      "walFailoverPath": ""
    }
  ]
}
~~~

## Alerting tools

In addition to actively monitoring the overall health and performance of a cluster, it is also essential to configure alerting rules that promptly send notifications when CockroachDB experiences events that require investigation or intervention.

Many of the [third-party monitoring integrations]({% link {{ page.version.version }}/third-party-monitoring-tools.md %}), such as [Datadog]({% link {{ page.version.version }}/datadog.md %}) and [Kibana]({% link {{ page.version.version }}/kibana.md %}), also support event-based alerting using metrics collected from a cluster's [Prometheus endpoint](#prometheus-endpoint). Refer to the documentation for an integration for more details. This section identifies the most important events that you might want to create alerting rules for, and provides pre-defined rules definitions for these events appropriate for use with Prometheus's [Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/) service.

### Alertmanager

If you have configured [Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}) to monitor your CockroachDB instance, you can also configure alerting rule definitions to have Alertmanager detect [important events](#events-to-alert-on) and alert you when they occur.

#### Prometheus alerting rules endpoint

Every CockroachDB node exports an alerting rules template at `http://<host>:<http-port>/api/v2/rules/`. These rule definitions are formatted for easy integration with Alertmanager.

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

If you already followed the steps from [Monitor CockroachDB with Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}), you should already have a `alerts.rules.yml` file. If you are creating a new `alerts.rules.yml` file, be sure that it begins with the following three lines:

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

If you already followed the steps from [Monitor CockroachDB with Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}), this reference is already present in your `prometheus.yml` file.

Start Prometheus and Alertmanager to begin watching for events to alert on. You can view imported rules on your Prometheus server's web interface at `http://<host>:<http-port>/rules`. Use the "State" column to verify that the rules were imported correctly.

### Events to alert on

{{site.data.alerts.callout_info}}
Currently, not all events listed have corresponding alert rule definitions available from the `api/v2/rules/` endpoint. Many events not yet available in this manner are defined in the <a href="https://github.com/cockroachdb/cockroach/blob/master/monitoring/rules/alerts.rules.yml">pre-defined alerting rules</a>. For more details, see [Monitor CockroachDB with Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}).
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

{% include {{page.version.version}}/storage/free-up-disk-space.md %}

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

- **Rule:** Send an alert when the latency of any changefeed running on any node is higher than the set threshold, which depends on the [`gc.ttlseconds`]({% link {{ page.version.version }}/configure-replication-zones.md %}#replication-zone-variables) variable set in the cluster.

- **How to detect:** Calculate this using a threshold, where the threshold is less than the value of the [`gc.ttlseconds`]({% link {{ page.version.version }}/configure-replication-zones.md %}#replication-zone-variables) variable. For example, `changefeed.max_behind_nanos > [some threshold]`.

#### Unavailable ranges

- **Rule:** Send an alert when the number of ranges with fewer live replicas than needed for quorum is non-zero for too long.

- **How to detect:** Calculate this using the `ranges_unavailable` metric in the node's `_status/vars` output.

- **Rule definition:** Use the `UnavailableRanges` alerting rule from your cluster's [`api/v2/rules/` metrics endpoint](#alertmanager).

#### Tripped replica circuit breakers

- **Rule:** Send an alert when a replica stops serving traffic due to other replicas being offline for too long.

- **How to detect:** Calculate this using the `kv_replica_circuit_breaker_num_tripped_replicas` metric in the node's `_status/vars` output.

- **Rule definition:** Use the `TrippedReplicaCircuitBreakers` alerting rule from your cluster's [`api/v2/rules/` metrics endpoint](#alertmanager).

#### Under-replicated ranges

- **Rule:** Send an alert when the number of ranges with replication below the [replication factor]({% link {{ page.version.version }}/configure-replication-zones.md %}#num_replicas) is non-zero for too long.

- **How to detect:** Calculate this using the `ranges_underreplicated` metric in the node's `_status/vars` output.

- **Rule definition:** Use the `UnderreplicatedRanges` alerting rule from your cluster's [`api/v2/rules/` metrics endpoint](#alertmanager).

#### Requests stuck in Raft

- **Rule:** Send an alert when requests are taking a very long time in replication. This can be a symptom of a [leader-leaseholder split]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leader-leaseholder-splits).

- **How to detect:** Calculate this using the `requests_slow_raft` metric in the node's `_status/vars` output.

- **Rule definition:** Use the `RequestsStuckInRaft` alerting rule from your cluster's [`api/v2/rules/` metrics endpoint](#alertmanager).

#### High open file descriptor count

- **Rule:** Send an alert when a cluster is getting close to the [open file descriptor limit]({% link {{ page.version.version }}/recommended-production-settings.md %}#file-descriptors-limit).

- **How to detect:** Calculate this using the `sys_fd_softlimit` metric in the node's `_status/vars` output.

- **Rule definition:** Use the `HighOpenFDCount` alerting rule from your cluster's [`api/v2/rules/` metrics endpoint](#alertmanager).

## See also

- [Production Checklist]({% link {{ page.version.version }}/recommended-production-settings.md %})
- [Manual Deployment]({% link {{ page.version.version }}/manual-deployment.md %})
- [Orchestrated Deployment]({% link {{ page.version.version }}/kubernetes-overview.md %})
- [Local Deployment]({% link {{ page.version.version }}/start-a-local-cluster.md %})
- [Third-Party Monitoring Integrations]({% link {{ page.version.version }}/third-party-monitoring-tools.md %})
- [Metrics]({% link {{ page.version.version }}/metrics.md %})
- [Troubleshoot Replication Zones]({% link {{ page.version.version }}/troubleshoot-replication-zones.md %})
