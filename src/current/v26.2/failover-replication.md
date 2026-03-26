---
title: Fail Over from a Primary Cluster to a Standby Cluster
summary: A guide to complete physical cluster replication and fail over from a primary to a standby cluster.
toc: true
key: cutover-replication.html
---

_Failover_ in [**physical cluster replication (PCR)**]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) allows you to move application traffic from the active primary cluster to the passive standby cluster. When you complete the replication stream to initiate a failover, the job stops replicating data from the primary, sets the standby [virtual cluster]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}) to a point in time (in the past or future) where all ingested data is consistent, and then makes the standby virtual cluster ready to accept traffic.

After a failover event, you may want to return your operations to the original primary cluster (or a new cluster). _Failback_ in PCR does this by replicating new application traffic back onto the original primary cluster. When you initiate a failback, the job ensures the original primary is up to date with writes from the standby that happened after failover. The original primary cluster is then set as ready to accept application traffic once again.

This page describes:

- [**Failover**](#failover) from the primary cluster to the standby cluster.
- [**Failback**](#failback): 
    - From the original standby cluster (after it was promoted during failover) to the original primary cluster.
    - After the PCR stream used an existing cluster as the primary cluster.
- [**Job management**](#job-management) after a failover or failback.

{{site.data.alerts.callout_info}}
Failover and failback do **not** redirect traffic automatically to the standby cluster. Once the failover or failback is complete, you must redirect application traffic to the standby cluster.
{{site.data.alerts.end}}

## Failover

The failover is a two-step process on the standby cluster:

1. [Initiating the failover](#step-1-initiate-the-failover).
1. [Completing the failover](#step-2-complete-the-failover).

### Before you begin

During PCR, jobs running on the primary cluster will replicate to the standby cluster. Before you fail over to the standby cluster, or fail back to the original primary cluster, consider how you will manage running (replicated) jobs between the clusters. Refer to [Job management](#job-management) for instructions.

### Step 1. Initiate the failover

To initiate a failover to the standby cluster, specify the point in time for its promotion. At failover, the standby cluster’s data will reflect the state of the primary at the specified moment. Refer to the following sections for steps:

- [`LATEST`](#fail-over-to-the-most-recent-replicated-time): The most recent replicated timestamp. This minimizes any data loss from the replication lag in asynchronous replication.
- [Point-in-time](#fail-over-to-a-point-in-time):
    - Past: A past timestamp within the [failover window]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}#failover-and-promotion-process) of up to 4 hours in the past.
    {{site.data.alerts.callout_success}}
    Failing over to a past point in time is useful if you need to recover from a recent human error.
    {{site.data.alerts.end}}
    - Future: A future timestamp for planning a failover.

#### Fail over to the most recent replicated time

To initiate a failover to the most recent replicated timestamp, specify `LATEST`. Due to [_replication lag_]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %}#failover-and-promotion-process), the most recent replicated time may be behind the current actual time. Replication lag is the time difference between the most recent replicated time and the actual time.

1. To view the current replication timestamp, use:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW VIRTUAL CLUSTER main WITH REPLICATION STATUS;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~
    id | name | source_tenant_name |              source_cluster_uri                 |         retained_time           |    replicated_time     | replication_lag | failover_time |   status
    ---+------+--------------------+-------------------------------------------------+---------------------------------+------------------------+-----------------+--------------+--------------
    3  | main | main               | postgresql://user@hostname or IP:26257?redacted | 2024-04-18 10:07:45.000001+00   | 2024-04-18 14:07:45+00 | 00:00:19.602682 |         NULL | replicating
    (1 row)
    ~~~

    {{site.data.alerts.callout_success}}
    You can view the [**Replication Lag** graph]({% link {{ page.version.version }}/ui-physical-cluster-replication-dashboard.md %}#replication-lag) in the standby cluster's DB Console.
    {{site.data.alerts.end}}

1. Run the following from the standby cluster's SQL shell to start the failover:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER main COMPLETE REPLICATION TO LATEST;
    ~~~

    The `failover_time` is the timestamp at which the replicated data is consistent. The cluster will revert any replicated data above this timestamp to ensure that the standby is consistent with the primary at that timestamp:

    ~~~
            failover_time
    ----------------------------------
    1695922878030920020.0000000000
    (1 row)
    ~~~

#### Fail over to a point in time

You can control the point in time that the PCR stream will fail over to.

1. To select a [specific time]({% link {{ page.version.version }}/as-of-system-time.md %}) in the past, use:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW VIRTUAL CLUSTER main WITH REPLICATION STATUS;
    ~~~

    The `retained_time` response provides the earliest time to which you can fail over. This is up to four hours in the past.

    ~~~
    id | name | source_tenant_name |              source_cluster_uri                 |         retained_time         |    replicated_time     | replication_lag | failover_time |   status
    ---+------+--------------------+-------------------------------------------------+-------------------------------+------------------------+-----------------+--------------+--------------
    3  | main | main               | postgresql://user@hostname or IP:26257?redacted | 2024-04-18 10:07:45.000001+00 | 2024-04-18 14:07:45+00 | 00:00:19.602682 |         NULL | replicating
    (1 row)
    ~~~

1. Specify a timestamp:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER main COMPLETE REPLICATION TO SYSTEM TIME '-1h';
    ~~~

    Refer to [Using different timestamp formats]({% link {{ page.version.version }}/as-of-system-time.md %}#using-different-timestamp-formats) for more information.

    Similarly, to fail over to a specific time in the future:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER main COMPLETE REPLICATION TO SYSTEM TIME '+5h';
    ~~~

    A future failover will proceed once the replicated data has reached the specified time.

{{site.data.alerts.callout_info}}
To monitor for when the PCR stream completes, do the following:

1. Find the PCR stream's `job_id` using `SELECT * FROM [SHOW JOBS] WHERE job_type = 'REPLICATION STREAM INGESTION';`
1. Run `SHOW JOB WHEN COMPLETE job_id`. Refer to the `SHOW JOBS` page for [details]({% link {{ page.version.version }}/show-jobs.md %}#parameters) and an [example]({% link {{ page.version.version }}/show-jobs.md %}#show-job-when-complete).
{{site.data.alerts.end}}

### Step 2. Complete the failover

1. The completion of the replication is asynchronous; to monitor its progress use:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW VIRTUAL CLUSTER main WITH REPLICATION STATUS;
    ~~~
    ~~~
    id | name | source_tenant_name |              source_cluster_uri                 |         retained_time         |    replicated_time           | replication_lag | failover_time                   |   status
    ---+------+--------------------+-------------------------------------------------+-------------------------------+------------------------------+-----------------+--------------------------------+--------------
    3  | main | main               | postgresql://user@hostname or IP:26257?redacted | 2023-09-28 16:09:04.327473+00 | 2023-09-28 17:41:18.03092+00 | 00:00:19.602682 | 1695922878030920020.0000000000 | replication pending failover
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

To enable PCR again, from the new primary to the original primary (or a completely different cluster), refer to [Fail back to the primary cluster](#failback).

## Failback

After failing over to the standby cluster, you may want to return to your original configuration by failing back to the original primary-standby cluster setup. Depending on the configuration of the primary cluster in the original PCR stream, use one of the following workflows:

- [From the original standby cluster (after it was promoted during failover) to the original primary cluster](#fail-back-to-the-original-primary-cluster). If this failback is initiated within 24 hours of the failover, PCR replicates the net-new changes from the standby cluster to the primary cluster, rather than fully replacing the existing data in the primary cluster.
- [After the PCR stream used an existing cluster as the primary cluster](#fail-back-after-replicating-from-an-existing-primary-cluster).

{{site.data.alerts.callout_info}}
To move back to a different cluster that was not involved in the original PCR stream, set up a new PCR stream following the PCR [setup]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}) guide.
{{site.data.alerts.end}}

### Fail back to the original primary cluster

This section illustrates the steps to fail back to the original primary cluster from the promoted standby cluster that is currently serving traffic.

- **Cluster A** = original primary cluster
- **Cluster B** = original standby cluster

**Cluster B** is serving application traffic after the [failover](#step-2-complete-the-failover).

1. To begin the failback to **Cluster A**, the virtual cluster must first stop accepting connections. Connect to the system virtual on **Cluster A**:

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

1. Open another terminal window and generate a connection string for **Cluster B** using [`cockroach encode-uri`]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-3-manage-cluster-certificates-and-generate-connection-strings):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach encode-uri {replication user}:{password}@{cluster B node IP or hostname}:26257 --ca-cert certs/ca.crt --inline
    ~~~

    Copy the output ready for starting the PCR stream, which requires the connection string to **Cluster B**:

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

    {{site.data.alerts.callout_info}}
    ([**Preview**]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}#features-in-preview)) If you want to start the PCR stream with a read-only virtual cluster on the standby after failing back to the original primary cluster, run the [`ALTER VIRTUAL CLUSTER`]({% link {{ page.version.version }}/alter-virtual-cluster.md %}) statement in this step with the `READ VIRTUAL CLUSTER` option.
    {{site.data.alerts.end}}

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

1. From **Cluster A**, start the failover:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER {cluster_a} COMPLETE REPLICATION TO LATEST;
    ~~~

    After the failover has successfully completed, it returns a `failover_time` timestamp, representing the time at which the replicated data is consistent. Note that the cluster reverts any replicated data above the `failover_time` to ensure that the standby is consistent with the primary at that time:

    ~~~
               failover_time
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

At this point, **Cluster A** has caught up to **Cluster B**. The clusters are entirely independent. To enable PCR again from the primary to the standby, refer to [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}).

### Fail back after replicating from an existing primary cluster

You can replicate data from an existing CockroachDB cluster that does not have [cluster virtualization]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}) enabled to a standby cluster with cluster virtualization enabled. For instructions on setting up a PCR in this way, refer to [Set up PCR from an existing cluster]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#set-up-pcr-from-an-existing-cluster).

After a [failover](#failover) to the standby cluster, you may want to set up PCR from the original standby cluster, which is now the primary, to another cluster, which will become the standby. There are multiple ways to set up a new standby, and some considerations.

In the example, the clusters are named for reference:

- **A** = The original primary cluster, which started without virtualization.
- **B** = The original standby cluster, which started with virtualization.

1. You run a PCR stream from cluster **A** to cluster **B**.
1. You initiate a failover from cluster **A** to cluster **B**.
1. You promote the `main` virtual cluster on cluster **B** and start serving application traffic from **B** (that acts as the primary).
1. You need to create a standby cluster for cluster **B** to replicate changes to. You can do one of the following:
    - [Create a new virtual cluster]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-4-start-replication) (`main`) on cluster **A** from the replication of cluster **B**. Cluster **A** is now virtualized. This will start an initial scan because the PCR stream will ignore the former workload tables in the system virtual cluster that were [originally replicated to **B**]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#set-up-pcr-from-an-existing-cluster). You can [drop the tables]({% link {{ page.version.version }}/drop-table.md %}) that were in the system virtual cluster, because the new virtual cluster will now hold the workload replicating from cluster **B**.
    - [Start an entirely new cluster]({% link {{ page.version.version }}/cockroach-start.md %}) **C** and [create]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-4-start-replication) a `main` virtual cluster on it from the replication of cluster **B**. This will start an initial scan because cluster **C** is empty.

## Job management

During PCR, jobs running on the primary cluster replicate to the standby cluster. Once you have [completed a failover](#step-2-complete-the-failover) (or a [failback](#failback)), refer to the following sections for details on resuming jobs on the promoted cluster.

### Backup schedules

[Backup schedules]({% link {{ page.version.version }}/manage-a-backup-schedule.md %}) pause after failover on the promoted standby cluster. Take the following steps to resume jobs:

1. Verify that there are no other schedules running backups to the same [collection of backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#backup-collections), i.e., the schedule that was running on the original primary cluster.
1. [Resume]({% link {{ page.version.version }}/resume-schedules.md %}) the backup schedule on the promoted cluster.

{{site.data.alerts.callout_info}}
If your backup schedule was created on a cluster in v23.1 or earlier, it will **not** pause automatically on the promoted cluster after failover. In this case, you must [pause]({% link {{ page.version.version }}/pause-schedules.md %}) the schedule manually on the promoted cluster and then take the outlined steps.
{{site.data.alerts.end}}

### Changefeeds

Currently running [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) will fail on the promoted cluster immediately after failover to avoid two clusters running the same changefeed to one sink. We recommend that you recreate changefeeds on the promoted cluster.

To avoid multiple clusters running the same schedule concurrently, [changefeed schedules]({% link {{ page.version.version }}/create-schedule-for-changefeed.md %}) will [pause]({% link {{ page.version.version }}/pause-schedules.md %}) after physical cluster replication has completed.

{{site.data.alerts.callout_info}}
If your changefeed schedule was created on a cluster in v24.1 or earlier, it will **not** pause automatically on the promoted cluster after failover. In this case, you will need to manage [pausing]({% link {{ page.version.version }}/pause-schedules.md %}) or [canceling]({% link {{ page.version.version }}/drop-schedules.md %}) the schedule on the promoted standby cluster to avoid two clusters running the same changefeed to one sink.
{{site.data.alerts.end}}

## See also

- [Physical Cluster Replication Overview]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})
- [Physical Cluster Replication Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %})
