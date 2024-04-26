---
title: Physical Cluster Replication Monitoring
summary: Monitor and observe replication streams between a primary and standby cluster.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

You can monitor a physical cluster replication stream using:

- [`SHOW VIRTUAL CLUSTER ... WITH REPLICATION STATUS`](#sql-shell) in the SQL shell.
- The [Physical Replication dashboard](#db-console) on the DB Console.
- [Prometheus and Alertmanager](#prometheus) to track and alert on replication metrics.
- [`SHOW EXPERIMENTAL_FINGERPRINTS`](#data-verification) to verify data at a point in time is correct on the standby cluster.

When you complete a [cutover]({% link {{ page.version.version }}/cutover-replication.md %}), there will be a gap in the primary cluster's metrics whether you are monitoring via the [DB Console](#db-console) or [Prometheus](#prometheus).

The standby cluster will also require separate monitoring to ensure observability during the cutover period. You can use the DB console to track the relevant metrics, or you can use a tool like [Grafana]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}#step-5-visualize-metrics-in-grafana) to create two separate dashboards, one for each cluster, or a single dashboard with data from both clusters.

## SQL Shell

In the standby cluster's SQL shell, you can query `SHOW VIRTUAL CLUSTER ... WITH REPLICATION STATUS` for detail on status and timestamps for planning [cutover]({% link {{ page.version.version }}/cutover-replication.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTER main WITH REPLICATION STATUS;
~~~

Refer to [Responses](#responses) for a description of each field.

~~~
id | name | source_tenant_name |              source_cluster_uri                 |         retained_time         |    replicated_time           | replication_lag | cutover_time                   |   status
---+------+--------------------+-------------------------------------------------+-------------------------------+------------------------------+-----------------+--------------------------------+--------------
3  | main | main               | postgresql://user@hostname or IP:26257?redacted | 2023-09-28 16:09:04.327473+00 | 2023-09-28 17:41:18.03092+00 | 00:00:19.602682 | 1695922878030920020.0000000000 | replicating
(1 row)
~~~

### Responses

{% include {{ page.version.version }}/physical-replication/show-virtual-cluster-responses.md %}

#### Data state

{% include {{ page.version.version }}/physical-replication/show-virtual-cluster-data-state.md %}

## DB Console

You can access the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) for your standby cluster at `https://{your IP or hostname}:8080/`. Select the **Metrics** page from the left-hand navigation bar, and then select **Physical Cluster Replication** from the **Dashboard** dropdown. The user that accesses the DB Console must have `admin` privileges to view this dashboard.

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

{{site.data.alerts.callout_info}}
The **Physical Cluster Replication** dashboard tracks metrics related to physical cluster replication jobs. This is distinct from the [**Replication** dashboard]({% link {{ page.version.version }}/ui-replication-dashboard.md %}), which tracks metrics related to how data is replicated across the cluster, e.g., range status, replicas per store, and replica quiescence.
{{site.data.alerts.end}}

The **Physical Cluster Replication** dashboard contains graphs for monitoring:

### Logical bytes

<img src="{{ 'images/v24.1/ui-logical-bytes.png' | relative_url }}" alt="DB Console Logical Bytes graph showing results over the past hour" style="border:1px solid #eee;max-width:100%" />

The **Logical Bytes** graph shows you the throughput of the replicated bytes.

Hovering over the graph displays:

- The date and time.
- The number of logical bytes replicated in MiB.

{{site.data.alerts.callout_info}}
When you [start a replication stream]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-4-start-replication), the **Logical Bytes** graph will record a spike of throughput as the initial scan completes. {% comment %}link to technical details here{% endcomment %}
{{site.data.alerts.end}}

### SST bytes

<img src="{{ 'images/v24.1/ui-sst-bytes.png' | relative_url }}" alt="DB Console SST bytes graph showing results over the past hour" style="border:1px solid #eee;max-width:100%" />

The **SST Bytes** graph shows you the rate at which all [SST]({% link {{ page.version.version }}/architecture/storage-layer.md %}#ssts) bytes are sent to the [KV layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}) by physical cluster replication jobs.

Hovering over the graph displays:

- The date and time.
- The number of SST bytes replicated in MiB.

## Prometheus

You can use Prometheus and Alertmanager to track and alert on physical cluster replication metrics. Refer to the [Monitor CockroachDB with Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}) tutorial for steps to set up Prometheus.

We recommend tracking the following metrics:

- `physical_replication.logical_bytes`: The logical bytes (the sum of all keys and values) ingested by all physical cluster replication jobs.
- `physical_replication.sst_bytes`: The [SST]({% link {{ page.version.version }}/architecture/storage-layer.md %}#ssts) bytes (compressed) sent to the KV layer by all physical cluster replication jobs.
- `physical_replication.replicated_time_seconds`: The [replicated time]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}#cutover-and-promotion-process) of the physical replication stream in seconds since the Unix epoch.

## Data verification

{{site.data.alerts.callout_info}}
**This feature is in [preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}).** It is in active development and subject to change.

The `SHOW EXPERIMENTAL_FINGERPRINTS` statement verifies that the data transmission and ingestion is working as expected while a replication stream is running. Any checksum mismatch likely represents corruption or a bug in CockroachDB. Should you encounter such a mismatch, contact [Support](https://support.cockroachlabs.com/hc/en-us).
{{site.data.alerts.end}}

To verify that the data at a certain point in time is correct on the standby cluster, you can use the [current replicated time]({% link {{ page.version.version }}/show-virtual-cluster.md %}#responses) from the replication job information to run a point-in-time fingerprint on both the primary and standby clusters. This will verify that the transmission and ingestion of the data on the standby cluster, at that point in time, is correct.

1. Retrieve the current replicated time of the replication job on the standby cluster with [`SHOW VIRTUAL CLUSTER`]({% link {{ page.version.version }}/show-virtual-cluster.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT replicated_time FROM [SHOW VIRTUAL CLUSTER standbymain WITH REPLICATION STATUS];
    ~~~
    ~~~
         replicated_time
    ----------------------------
    2024-01-09 16:15:45.291575+00
    (1 row)
    ~~~

    For detail on connecting to the standby cluster, refer to [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#connect-to-the-standby-cluster-system-virtual-cluster).

1. From the **primary cluster's system virtual cluster**, specify a timestamp at or earlier than the current `replicated_time` to retrieve the fingerprint. This example uses the current `replicated_time`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT * FROM [SHOW EXPERIMENTAL_FINGERPRINTS FROM VIRTUAL CLUSTER main] AS OF SYSTEM TIME '2024-01-09 16:15:45.291575+00';
    ~~~
    ~~~
    tenant_name |             end_ts             |     fingerprint
    ------------+--------------------------------+----------------------
    main        | 1704816945291575000.0000000000 | 2646132238164576487
    (1 row)
    ~~~

    For detail on connecting to the primary cluster, refer to [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#connect-to-the-primary-cluster-system-virtual-cluster).

1. From the **standby cluster's system virtual cluster**, specify the same timestamp used on the primary cluster to retrieve the standby cluster's fingerprint:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT * FROM [SHOW EXPERIMENTAL_FINGERPRINTS FROM VIRTUAL CLUSTER standbymain] AS OF SYSTEM TIME '2024-01-09 16:15:45.291575+00';
    ~~~
    ~~~
        tenant_name     |             end_ts             |     fingerprint
    --------------------+--------------------------------+----------------------
    standbymain         | 1704816945291575000.0000000000 | 2646132238164576487
    (1 row)
    ~~~

1. Compare the fingerprints of the primary and standby clusters to verify the data. The same value for the fingerprints indicates the data is correct.

## See also

- [DB Console Overview]({% link {{ page.version.version }}/ui-overview.md %})
- [Monitoring and Alerting]({% link {{ page.version.version }}/monitoring-and-alerting.md %})
- [Physical Cluster Replication Overview]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})
- [Cluster Virtualization Overview]({% link {{ page.version.version }}/cluster-virtualization-overview.md %})
