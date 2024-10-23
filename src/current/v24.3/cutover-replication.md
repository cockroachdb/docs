---
title: Cut Over from a Primary Cluster to a Standby Cluster
summary: A guide to complete physical cluster replication and cut over from a primary to a standby cluster.
toc: true
docs_area: manage
---

[**Physical cluster replication (PCR)**]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) allows you to cut over from the active primary cluster to the passive standby cluster that has ingested replicated data. When you complete the replication, it will stop the stream of new data, reset the standby virtual cluster to a point in time where all ingested data is consistent, and then mark the standby virtual cluster as ready to accept traffic.

The cutover is a two-step process on the standby cluster:

1. [Initiating the cutover](#step-1-initiate-the-cutover).
1. [Completing the cutover](#step-2-complete-the-cutover).

{{site.data.alerts.callout_danger}}
Initiating a cutover is a manual process that makes the standby cluster ready to accept SQL connections. However, the cutover process does **not** automatically redirect traffic to the standby cluster. Once the cutover is complete, you must redirect application traffic to the standby (new) cluster. If you do not manually redirect traffic, writes to the primary (original) cluster may be lost.
{{site.data.alerts.end}}

After a cutover, you may want to _cut back_ to the original primary cluster (or a different cluster) to set up the original primary cluster to once again accept application traffic. For more details, refer to [Cut back to the primary cluster](#cut-back-to-the-primary-cluster).

## Before you begin

During a replication stream, jobs running on the primary cluster will replicate to the standby cluster. Before you cut over to the standby cluster, or cut back to the original primary cluster, consider how you will manage running (replicated) jobs between the clusters. Refer to [Job management](#job-management) for instructions.

## Step 1. Initiate the cutover

To initiate a cutover to the standby cluster, there are different ways of specifying the point in time for the standby's promotion. That is, the standby cluster's live data at the point of cutover. Refer to the following sections for steps:

- [`LATEST`](#cut-over-to-the-most-recent-replicated-time): The most recent replicated timestamp.
- [Point-in-time](#cut-over-to-a-point-in-time):
    - Past: A timestamp in the past that is within the cutover window. {% comment %}Add link to technical overview (replicated timestamp + cutover window){% endcomment %}
    - Future: A timestamp in the future in order to plan a cutover.

### Cut over to the most recent replicated time

To initiate a cutover to the most recent replicated timestamp, you can specify `LATEST`. It is important to note that the latest replicated time may be behind the actual time if there is [_replication lag_]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}#cutover-and-promotion-process) in the stream. That is, the time between the most up-to-date replicated time and the actual time.

To view the current replication timestamp, use:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTER main WITH REPLICATION STATUS;
~~~

{% include_cached copy-clipboard.html %}
~~~
  id | name | source_tenant_name |              source_cluster_uri                 |         retained_time           |    replicated_time     | replication_lag | cutover_time |   status
-----+------+--------------------+-------------------------------------------------+---------------------------------+------------------------+-----------------+--------------+--------------
   3 | main | main               | postgresql://user@hostname or IP:26257?redacted | 2024-04-18 10:07:45.000001+00   | 2024-04-18 14:07:45+00 | 00:00:19.602682 |         NULL | replicating
(1 row)
~~~

{{site.data.alerts.callout_success}}
You can view the [**Replication Lag** graph]({% link {{ page.version.version }}/ui-physical-cluster-replication-dashboard.md %}#replication-lag) in the standby cluster's DB Console.
{{site.data.alerts.end}}

Run the following from the standby cluster's SQL shell to start the cutover:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER main COMPLETE REPLICATION TO LATEST;
~~~

The `cutover_time` is the timestamp at which the replicated data is consistent. The cluster will revert any data above this timestamp:

~~~
           cutover_time
----------------------------------
  1695922878030920020.0000000000
(1 row)
~~~

### Cut over to a point in time

You can control the point in time that the replication stream will cut over to.

To select a [specific time]({% link {{ page.version.version }}/as-of-system-time.md %}) in the past, use:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTER main WITH REPLICATION STATUS;
~~~

The `retained_time` response provides the earliest time to which you can cut over.

~~~
  id | name | source_tenant_name |              source_cluster_uri                 |         retained_time         |    replicated_time     | replication_lag | cutover_time |   status
-----+------+--------------------+-------------------------------------------------+-------------------------------+------------------------+-----------------+--------------+--------------
   3 | main | main               | postgresql://user@hostname or IP:26257?redacted | 2024-04-18 10:07:45.000001+00 | 2024-04-18 14:07:45+00 | 00:00:19.602682 |         NULL | replicating
(1 row)
~~~

Specify a timestamp:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER main COMPLETE REPLICATION TO SYSTEM TIME '-1h';
~~~

Refer to [Using different timestamp formats]({% link {{ page.version.version }}/as-of-system-time.md %}#using-different-timestamp-formats) for more information.

Similarly, to cut over to a specific time in the future:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER main COMPLETE REPLICATION TO SYSTEM TIME '+5h';
~~~

A future cutover will proceed once the replicated data has reached the specified time.

{{site.data.alerts.callout_info}}
To monitor for when the replication stream completes, do the following:

1. Find the replication stream's `job_id` using `SELECT * FROM [SHOW JOBS] WHERE job_type = 'REPLICATION STREAM INGESTION';`
1. Run `SHOW JOB WHEN COMPLETE job_id`. Refer to the `SHOW JOBS` page for [details]({% link {{ page.version.version }}/show-jobs.md %}#parameters) and an [example]({% link {{ page.version.version }}/show-jobs.md %}#show-job-when-complete).
{{site.data.alerts.end}}

## Step 2. Complete the cutover

1. The completion of the replication is asynchronous; to monitor its progress use:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW VIRTUAL CLUSTER main WITH REPLICATION STATUS;
    ~~~
    ~~~
    id | name | source_tenant_name |              source_cluster_uri                 |         retained_time         |    replicated_time           | replication_lag | cutover_time                   |   status
    ---+------+--------------------+-------------------------------------------------+-------------------------------+------------------------------+-----------------+--------------------------------+--------------
    3  | main | main               | postgresql://user@hostname or IP:26257?redacted | 2023-09-28 16:09:04.327473+00 | 2023-09-28 17:41:18.03092+00 | 00:00:19.602682 | 1695922878030920020.0000000000 | replication pending cutover
    (1 row)
    ~~~

    Refer to [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}) for the [Responses]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}#responses) and [Data state]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}#data-state) of `SHOW VIRTUAL CLUSTER ... WITH REPLICATION STATUS` fields.

1. Once complete, bring the standby's virtual cluster online with:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER main START SERVICE SHARED;
    ~~~

    ~~~
      id |        name         |     data_state     | service_mode
    -----+---------------------+--------------------+---------------
      1  | system              | ready              | shared
      3  | main                | ready              | shared
    (3 rows)
    ~~~

1. To make the standby's virtual cluster the default for connection strings, set the following [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING server.controller.default_target_cluster='main';
    ~~~

At this point, the primary and standby clusters are entirely independent. You will need to use your own network load balancers, DNS servers, or other network configuration to direct application traffic to the standby (now primary). To manage replicated jobs on the promoted standby, refer to [Job management](#job-management).

To enable PCR again, from the new primary to the original primary (or a completely different cluster), refer to [Cut back to the primary cluster](#cut-back-to-the-primary-cluster).

## Job management

During a replication stream, jobs running on the primary cluster will replicate to the standby cluster. Once you have [completed a cutover](#step-2-complete-the-cutover) (or a [cutback](#cut-back-to-the-primary-cluster)), refer to the following sections for details on resuming jobs on the promoted cluster.

### Backup schedules

[Backup schedules]({% link {{ page.version.version }}/manage-a-backup-schedule.md %}) will pause after cutover on the promoted cluster. Take the following steps to resume jobs:

1. Verify that there are no other schedules running backups to the same [collection of backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#backup-collections), i.e., the schedule that was running on the original primary cluster.
1. Resume the backup schedule on the promoted cluster.

{{site.data.alerts.callout_info}}
If your backup schedule was created on a cluster in v23.1 or earlier, it will **not** pause automatically on the promoted cluster after cutover. In this case, you must pause the schedule manually on the promoted cluster and then take the outlined steps.
{{site.data.alerts.end}}

### Changefeeds

[Changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) will fail on the promoted cluster immediately after cutover to avoid two clusters running the same changefeed to one sink. We recommend that you recreate changefeeds on the promoted cluster.

[Scheduled changefeeds]({% link {{ page.version.version }}/create-schedule-for-changefeed.md %}) will continue on the promoted cluster. You will need to manage [pausing]({% link {{ page.version.version }}/pause-schedules.md %}) or [canceling]({% link {{ page.version.version }}/drop-schedules.md %}) the schedule on the promoted standby cluster to avoid two clusters running the same changefeed to one sink.

## Cut back to the primary cluster

After cutting over to the standby cluster, you may need to cut back to the original primary cluster to serve your application.

{% include {{ page.version.version }}/physical-replication/fast-cutback-syntax.md %}

If the original primary cluster was an existing cluster without [virtualization enabled]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#set-up-pcr-from-an-existing-cluster), refer to [Cut back after PCR from an existing cluster](#cut-back-after-pcr-from-an-existing-cluster) for details on cutback.

{{site.data.alerts.callout_info}}
To move back to a different cluster, follow the PCR [setup]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}).
{{site.data.alerts.end}}

### Example

This section illustrates the steps to cut back to the original primary cluster from the promoted standby cluster that is currently serving traffic.

- **Cluster A** = original primary cluster
- **Cluster B** = original standby cluster

**Cluster B** is serving application traffic after the [cutover](#step-2-complete-the-cutover).

1. To begin the cutback to **Cluster A**, the virtual cluster must first stop accepting connections. Connect to the system virtual on **Cluster A**:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url \
    "postgresql://{user}@{node IP or hostname cluster A}:26257?options=-ccluster=system&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

1. From the system virtual cluster on **Cluster A**, ensure that service to the virtual cluster has stopped:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER {cluster_a} STOP SERVICE;
    ~~~

1. Open another terminal window and generate a connection string for **Cluster B** using `cockroach encode-uri`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach encode-uri {replication user}:{password}@{cluster B node IP or hostname}:26257 --ca-cert certs/ca.crt --inline
    ~~~

    Copy the output ready for starting the replication stream, which requires the connection string to **Cluster B**:

    {% include_cached copy-clipboard.html %}
    ~~~
    postgresql://{replication user}:{password}@{cluster B node IP or hostname}:26257/defaultdb?options=-ccluster%3Dsystem&sslinline=true&sslmode=verify-full&sslrootcert=-----BEGIN+CERTIFICATE-----{encoded_cert}-----END+CERTIFICATE-----%0A
    ~~~

    {{site.data.alerts.callout_success}}
    For details on connection strings, refer to the [Connection reference]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#connection-reference).
    {{site.data.alerts.end}}

1. Connect to the system virtual cluster for **Cluster B**:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url \
    "postgresql://{user}@{cluster B node IP or hostname}:26257?options=-ccluster=system&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

1. From the system virtual cluster on **Cluster B**, enable rangefeeds:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING kv.rangefeed.enabled = 'true';
    ~~~

1. From the system virtual cluster on **Cluster A**, start the replication from **Cluster B** to **Cluster A**. Include the connection string for **Cluster B**:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER {cluster_a} START REPLICATION OF {cluster_b} ON 'postgresql://{replication user}:{password}@{cluster B node IP or hostname}:26257/defaultdb?options=-ccluster%3Dsystem&sslinline=true&sslmode=verify-full&sslrootcert=-----BEGIN+CERTIFICATE-----{encoded_cert}-----END+CERTIFICATE-----%0A';
    ~~~

    This will reset the virtual cluster on **Cluster A** back to the time at which the same virtual cluster on **Cluster B** diverged from it. **Cluster A** will check with **Cluster B** to confirm that its virtual cluster was replicated from **Cluster A** as part of the original [PCR stream]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}).

1. Check the status of the virtual cluster on **A**:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW VIRTUAL CLUSTER {cluster_a};
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~
     id |  name  |     data_state     | service_mode
    ----+--------+--------------------+---------------
      1 | system | ready              | shared
      3 | {vc_a} | replicating        | none
      4 | test   | replicating        | none
      (2 rows)
    ~~~

1. From **Cluster A**, start the cutover:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER {cluster_a} COMPLETE REPLICATION TO LATEST;
    ~~~

    The `cutover_time` is the timestamp at which the replicated data is consistent. The cluster will revert any data above this timestamp:

    ~~~
               cutover_time
    ----------------------------------
      1714497890000000000.0000000000
    (1 row)
    ~~~

1. From **Cluster A**, bring the virtual cluster online:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER {cluster_a} START SERVICE SHARED;
    ~~~

1. To make **Cluster A's** virtual cluster the default for [connection strings]({% link {{ page.version.version }}/work-with-virtual-clusters.md %}#sql-clients), set the following [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING server.controller.default_target_cluster='{cluster_a}';
    ~~~

At this point, **Cluster A** is once again the primary and **Cluster B** is once again the standby. The clusters are entirely independent. To direct application traffic to the primary (**Cluster A**), you will need to use your own network load balancers, DNS servers, or other network configuration to direct application traffic to **Cluster A**. To enable PCR again, from the primary to the standby (or a completely different cluster), refer to [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}).

### Cut back after PCR from an existing cluster

You can replicate data from an existing CockroachDB cluster that does not have [cluster virtualization]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}) enabled to a standby cluster with cluster virtualization enabled. For instructions on setting up a replication stream in this way, refer to [Set up PCR from an existing cluster]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#set-up-pcr-from-an-existing-cluster).

After a [cutover]({% link {{ page.version.version }}/cutover-replication.md %}) to the standby cluster, you may want to then set up a replication stream from the original standby cluster, which is now the primary, to another cluster, which will become the standby. There are couple of ways to set up a new standby, and some considerations.

In the example, the clusters are named for reference:

- **A** = The original primary cluster, which started without virtualization.
- **B** = The original standby cluster, which started with virtualization.

1. You run a replication stream from cluster **A** to cluster **B**.
1. You initiate a cutover from cluster **A** to cluster **B**.
1. You promote the `main` virtual cluster on cluster **B** and start serving application traffic from **B** (that acts as the primary).
1. You need to create a standby cluster for cluster **B** to replicate changes to. You can do one of the following:
    - [Create a new virtual cluster]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-4-start-replication) (`main`) on cluster **A** from the replication of cluster **B**. Cluster **A** is now virtualized. This will start an initial scan because the replication stream will ignore the former workload tables in the system virtual cluster that were [originally replicated to **B**]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#set-up-pcr-from-an-existing-cluster). You can [drop the tables]({% link {{ page.version.version }}/drop-table.md %}) that were in the system virtual cluster, because the new virtual cluster will now hold the workload replicating from cluster **B**.
    - [Start an entirely new cluster]({% link {{ page.version.version }}/cockroach-start.md %}) **C** and [create]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-4-start-replication) a `main` virtual cluster on it from the replication of cluster **B**. This will start an initial scan because cluster **C** is empty.

## See also

- [Physical Cluster Replication Overview]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})
- [Physical Cluster Replication Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %})
