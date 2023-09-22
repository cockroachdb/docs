---
title: Physical Cluster Replication Monitoring
summary: Monitor and observe replication streams between a primary and standby cluster.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

{% include_cached new-in.html version="v23.2" %} You can monitor a physical cluster replication stream using:

- [`SHOW VIRTUAL CLUSTER ... WITH REPLICATION STATUS`](#sql-shell) in the SQL shell.
- The [Physical Replication dashboard](#db-console) on the DB Console.
- [Prometheus and Alertmanager](#prometheus) to track and alert on replication metrics.

{% comment %}Add data verification on standby here?{% endcomment %}


{% comment %}This page describes the available monitoring for physical cluster replication, for information on how replication works, refer to:{% endcomment %}

{% include {{ page.version.version }}/physical-replication/reference-links-replication.md %}

## SQL Shell

In the standby cluster's SQL shell, you can query `SHOW VIRTUAL CLUSTER ... WITH REPLICATION STATUS` for detail on status and timestamps for planning [cutover]({% link {{ page.version.version }}/cutover-replication.md %}):


{% include_cached copy-clipboard.html %}
~~~ sql
 SHOW VIRTUAL CLUSTER standbyapplication WITH REPLICATION STATUS;
~~~

Refer to the [Responses](#responses) for a description of each field.

{% include_cached copy-clipboard.html %}
~~~
id |        name        |     data_state     | service_mode | source_tenant_name |                                                     source_cluster_uri                                               | replication_job_id |        replicated_time        |         retained_time         | cutover_time
---+--------------------+--------------------+--------------+--------------------+----------------------------------------------------------------------------------------------------------------------+--------------------+-------------------------------+-------------------------------+---------------
3  | standbyapplication | replicating        | none         | application        | postgresql://{user}:{password}@{hostname}:26257/?options=-ccluster%3Dsystem&sslmode=verify-full&sslrootcert=redacted | 899090689449132033 | 2023-09-11 22:29:35.085548+00 | 2023-09-11 16:51:43.612846+00 |     NULL
(1 row)
~~~

### Responses

Field    | Response
---------+----------
`id` | The ID of the virtual cluster.
`name` | The name of the standby (destination) virtual cluster.
`data_state` | The state of the data on the virtual cluster. This can show one of the following: `initializing replication`, `ready`, `replicating`, `replication paused`, `replication pending cutover`, `replication cutting over`, `replication error`. Refer to [Data state](#data-state) for more detail on each response.
`service_mode` | The service mode shows whether the virtual cluster is ready to accept SQL requests. This can show one of the following: `none`, `shared`.
`source_tenant_name` | The name of the primary (source) virtual cluster.
`source_cluster_uri` | The URI of the primary (source) cluster. This is the URI that connects to the primary cluster to [start a replication stream]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-4-start-replication).
`replication_job_id` | The ID of the replication job.
`replicated_time` | The latest timestamp at which the standby cluser has consistent data — that is, the latest time you can cut over to. This time advances while the replication proceeds without error. `replicated_time` is updated periodically (every `30s`).
`retained_time` | The earliest timestamp at which the standby cluster has consistent data — that is, the earliest time you can cut over to.
`cutover_time` | The time at which the cutover will begin.

{% comment %}Add responses to include for SQL statement page{% endcomment %}

#### Data state

State      | Description
-----------+----------------
`initializing replication` | The replication job is completing the initial scan of data from the primary cluster before it starts replicating data in real time.
`ready` | The virtual cluster's data is ready for use.
`replicating` | The replication job has started and is replicating data.
`replication paused` | The replication job is paused due to an error or a manual request with `ALTER VIRTUAL CLUSTER ... PAUSE REPLICATION`.
`replication pending cutover` | The replication job is running and a cutover time has been set. Once the the replication reaches the cutover time, the will begin automatically.
`replication cutting over` | The job has started cutting over. The cutover time can no longer be changed. Once complete, the virtual cluster will be available for use with `ALTER VIRTUAL CLUSTER ... START SHARED SERVICE`.
`replication error` | An error has occurred. You can find more detail in the error message and the logs.

## DB Console

You can access the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) for your standby cluster at `https://{your IP or hostname}:8080/`. The **Physical Replication** dashboard under **Metrics** on the left-hand navigation bar.

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

The **Physical Replication** dashboard contains two graphs for monitoring:

### Replication lag

<img src="{{ 'images/v23.2/ui-replication-lag.png' | relative_url }}" alt="DB Console Replication Lag graph showing results over the past hour" style="border:1px solid #eee;max-width:100%" />

The **Replication Lag** graph shows you the amount of time the replication is behind the current time.

Hovering over the graph displays:

- The date and time.
- The amount of time in seconds the replication is behind the current date and time.

### Logical bytes

<img src="{{ 'images/v23.2/ui-logical-bytes.png' | relative_url }}" alt="DB Console Logical Bytes graph showing results over the past hour" style="border:1px solid #eee;max-width:100%" />

The **Logical Bytes** graph shows you the throughput of the replicated bytes.

Hovering over the graph displays:

- The date and time.
- The number of logical bytes replicated in MiB.

{{site.data.alerts.callout_info}}
When you [start a replication stream]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-4-start-replication), the **Logical Bytes** graph will record a spike of throughput as the initial scan completes. {% comment %}link to technical details here{% endcomment %}
{{site.data.alerts.end}}

### SST bytes

<img src="{{ 'images/v23.2/ui-sst-bytes.png' | relative_url }}" alt="DB Console SST bytes graph showing results over the past hour" style="border:1px solid #eee;max-width:100%" />

The **SST Bytes** graph shows you the rate at which all [SST]({% link {{ page.version.version }}/architecture/storage-layer.md %}#ssts) bytes are sent to the [KV layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}) by physical cluster replication jobs.

Hovering over the graph displays:

- The date and time.
- The number of SST bytes replicated in MiB.

## Prometheus

You can use Prometheus and Alertmanager to track and alert on physical cluster replication metrics. Refer to the [Monitor CockroachDB with Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}) tutorial for steps to set up Prometheus.

We recommend tracking the following metrics:

- `replication.logical_bytes`: The logical bytes (the sum of all keys and values) ingested by all physical cluster replication jobs.
- `replication.sst_bytes`: The [SST]({% link {{ page.version.version }}/architecture/storage-layer.md %}#ssts) bytes (compressed) sent to the KV layer by all physical cluster replication jobs.

## See also

- [DB Console Overview]({% link {{ page.version.version }}/ui-overview.md %})
- [Monitoring and Alerting]({% link {{ page.version.version }}/monitoring-and-alerting.md %})