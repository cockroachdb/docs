---
title: Logical Data Replication Monitoring
summary: Monitor and observe LDR jobs between a source and destination table.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
Logical data replication is only supported in CockroachDB {{ site.data.products.core }} clusters.
{{site.data.alerts.end}}

You can monitor [**logical data replication (LDR)**]({% link {{ page.version.version }}/logical-data-replication-overview.md %}) using:

- [`SHOW LOGICAL REPLICATION JOBS`](#sql-shell) in the SQL shell to view a list of LDR jobs on the cluster.
- The [**Logical Data Replication** dashboard]({% link {{ page.version.version }}/ui-logical-data-replication-dashboard.md %}) on the [DB Console](#db-console) to view metrics at the cluster level.
- [Prometheus and Alertmanager](#prometheus) to track and alert on LDR metrics.
- Metrics export with [Datadog](#datadog).
- [Metrics labels](#metrics-labels) to view metrics at the job level.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/ldr/multiple-tables.md %}
{{site.data.alerts.end}}

When you start an LDR stream, one job is created on each cluster:

- The _history retention job_ on the source cluster, which runs while the LDR job is active to protect changes in the table from [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection) until they have been applied to the destination cluster. The history retention job is viewable in the [DB Console](#db-console) or with [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}). Any manual changes to the history retention job could disrupt the LDR job.
- The `logical replication` job on the destination cluster. You can view the status of this job in the SQL shell with `SHOW LOGICAL REPLICATION JOBS` and the DB Console [**Jobs** page](#jobs-page).

## SQL Shell

In the destination cluster's SQL shell, you can query `SHOW LOGICAL REPLICATION JOBS` to view the LDR jobs running on the cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW LOGICAL REPLICATION JOBS;
~~~
~~~
        job_id        | status  |          tables           | replicated_time
----------------------+---------+---------------------------+------------------
1012877040439033857   | running | {database.public.table}   | NULL
(1 row)
~~~

For additional detail on each LDR job, use the `WITH details` option:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW LOGICAL REPLICATION JOBS WITH details;
~~~
~~~
        job_id        |  status  |            tables              |        replicated_time        |    replication_start_time     | conflict_resolution_type |                                      command
----------------------+----------+--------------------------------+-------------------------------+-------------------------------+--------------------------+-----------------------------------------------------------------------------------------
  1010959260799270913 | running  | {movr.public.promo_codes}      | 2024-10-24 17:50:05+00        | 2024-10-10 20:04:42.196982+00 | LWW                      | LOGICAL REPLICATION STREAM into movr.public.promo_codes from external://cluster_a
  1014047902397333505 | canceled | {defaultdb.public.office_dogs} | 2024-10-24 17:30:25+00        | 2024-10-21 17:54:20.797643+00 | LWW                      | LOGICAL REPLICATION STREAM into defaultdb.public.office_dogs from external://cluster_a
~~~

You can also use [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}) for general job details.

### Responses

{% include {{ page.version.version }}/ldr/show-logical-replication-responses.md %}

## Recommended LDR metrics to track

- Replication latency: The commit-to-commit replication latency, which is tracked from when a row is committed on the source cluster, to when it is applied on the destination cluster. An LDR _commit_ is when the job either applies a row successfully to the destination cluster or adds a row to the [dead letter queue (DLQ)]({% link {{ page.version.version }}/manage-logical-data-replication.md %}#dead-letter-queue-dlq).
    - `logical_replication.commit_latency-p50`
    - `logical_replication.commit_latency-p99`
- Replication lag: How far behind the source cluster is from the destination cluster at a specific point in time. The replication lag is equivalent to [RPO]({% link {{ page.version.version }}/disaster-recovery-overview.md %}) during a disaster. Calculate the replication lag with this metric. For example, `time.now() - replicated_time_seconds`.
    - `logical_replication.replicated_time_seconds`
- Row updates applied: These metrics indicate whether the destination cluster is actively receiving and applying data from the source cluster.
    - `logical_replication.events_ingested`
    - `logical_replication.events_dlqed`

## DB Console

In the DB Console, you can use:

- The [**Metrics** dashboard]({% link {{ page.version.version }}/ui-logical-data-replication-dashboard.md %}) for LDR to view metrics for the job on the destination cluster.
- The [**Jobs** page]({% link {{ page.version.version }}/ui-jobs-page.md %}) to view the history retention job on the source cluster and the LDR job on the destination cluster

The metrics for LDR in the DB Console metrics are at the **cluster** level. This means that if there are multiple LDR jobs running on a cluster the DB Console will show the average metrics across jobs.   

### Metrics dashboard

You can use the [**Logical Data Replication** dashboard]({% link {{ page.version.version }}/ui-logical-data-replication-dashboard.md %}) of the destination cluster to monitor the following metric graphs at the **cluster** level:

- Replication latency
- Replication lag
- Row updates applied
- Logical bytes received
- Batch application processing time: 50th percentile
- Batch application processing time: 99th percentile
- DLQ causes
- Retry queue size

To track replicated time, ingested events, and events added to the DLQ at the **job** level, refer to [Metrics labels](#metrics-labels).

### Jobs page

On the [**Jobs** page]({% link {{ page.version.version }}/ui-jobs-page.md %}), select:

- The **Replication Producer** in the source cluster's DB Console to view the _history retention job_.
- The **Logical Replication Ingestion** job in the destination cluster's DB Console. When you start LDR, the **Logical Replication Ingestion** job will show a bar that tracks the initial scan progress of the source table's existing data.

## Monitoring and alerting

### Prometheus

You can use Prometheus and Alertmanager to track and alert on LDR metrics. Refer to the [Monitor CockroachDB with Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}) tutorial for steps to set up Prometheus.

#### Metrics labels

To view metrics at the job level, you can use the `label` option when you start LDR to add a metrics label to the LDR job. This enables [child metric]({% link {{ page.version.version }}/multi-dimensional-metrics.md %}) export, which are Prometheus time series with extra labels. You can track the following metrics for an LDR job with labels:

- `logical_replication.catchup_ranges_by_label`
- `logical_replication.events_dlqed_by_label`
- `logical_replication.events_ingested_by_label`
- `logical_replication.replicated_time_by_label`
- `logical_replication.scanning_ranges_by_label`

To use metrics labels, ensure you have enabled the child metrics cluster setting:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.child_metrics.enabled = true;
~~~

When you start LDR, include the `label` option:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE LOGICAL REPLICATION STREAM FROM TABLE {database.public.table_name} 
ON 'external://{source_external_connection}' 
INTO TABLE {database.public.table_name} WITH label=ldr_job;
~~~

For a full reference on tracking metrics with labels, refer to the [Multi-dimensional Metrics]({% link {{ page.version.version }}/multi-dimensional-metrics.md %}#clusters-with-logical-data-replication-jobs) page.

### Datadog

You can export metrics to Datadog for LDR jobs. For steps to set up metrics export, refer to the [Monitor CockroachDB Self-Hosted with Datadog]({% link {{ page.version.version }}/datadog.md %}).

## See also

- [Set Up Logical Data Replication]({% link {{ page.version.version }}/set-up-logical-data-replication.md %})
- [Manage Logical Data Replcation]({% link {{ page.version.version }}/manage-logical-data-replication.md %})
