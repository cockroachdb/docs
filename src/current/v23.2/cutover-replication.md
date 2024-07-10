---
title: Cut Over from a Primary Cluster to a Standby Cluster
summary: A guide to complete physical cluster replication and cut over from a primary to a standby cluster.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

{% include_cached new-in.html version="v23.2" %} [**Physical cluster replication (PCR)**]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) allows you to cut over from the active primary cluster to the passive standby cluster that has ingested replicated data. When you complete the replication, it will stop the stream of new data, reset the standby virtual cluster to a point in time where all ingested data is consistent, and then mark the standby virtual cluster as ready to accept traffic.

The cutover is a two-step process on the standby cluster:

1. [Initiating the cutover](#step-1-initiate-the-cutover).
1. [Completing the cutover](#step-2-complete-the-cutover).

{{site.data.alerts.callout_danger}}
Initiating a cutover is a manual process that makes the standby cluster ready to accept SQL connections. However, the cutover process does **not** automatically redirect traffic to the standby cluster. Once the cutover is complete, you must redirect application traffic to the standby (new) cluster. If you do not manually redirect traffic, writes to the primary (original) cluster may be lost.
{{site.data.alerts.end}}

After a cutover, you may want to _cut back_ to the original primary cluster. That is, set up the original primary cluster to once again accept application traffic. This requires you to configure another full replication stream in the opposite direction from the original standby (now primary) to the original primary. For more detail, refer to [Cut back to the primary cluster](#cut-back-to-the-primary-cluster).

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
SHOW VIRTUAL CLUSTER application WITH REPLICATION STATUS;
~~~

{% include_cached copy-clipboard.html %}
~~~
  id |     name           | data_state  | service_mode | source_tenant_name |                                                  source_cluster_uri                                 | replication_job_id |       replicated_time        |         retained_time         | cutover_time
-----+--------------------+-------------+--------------+--------------------+-----------------------------------------------------------------------------------------------------+--------------------+------------------------------+-------------------------------+---------------
   5 | application        | replicating | none         | application        | postgresql://user:redacted@host?options=-ccluster%3Dsystem&sslmode=verify-full&sslrootcert=redacted | 911803003607220225 | 2023-10-26 17:36:52.27978+00 | 2023-10-26 14:36:52.279781+00 |         NULL
~~~

Run the following from the standby cluster's SQL shell to start the cutover:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER application COMPLETE REPLICATION TO LATEST;
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
SHOW VIRTUAL CLUSTER application WITH REPLICATION STATUS;
~~~

The `retained_time` response provides the earliest time to which you can cut over.

{% include_cached copy-clipboard.html %}
~~~
id |        name        |     data_state     | service_mode | source_tenant_name |                                                     source_cluster_uri                                               | replication_job_id |        replicated_time        |         retained_time         | cutover_time
---+--------------------+--------------------+--------------+--------------------+----------------------------------------------------------------------------------------------------------------------+--------------------+-------------------------------+-------------------------------+---------------
3  | application        | replicating        | none         | application        | postgresql://{user}:redacted@{hostname}:26257?options=-ccluster%3Dsystem&sslmode=verify-full&sslrootcert=redacted    | 899090689449132033 | 2023-09-11 22:29:35.085548+00 | 2023-09-11 16:51:43.612846+00 |     NULL
(1 row)
~~~

Specify a timestamp:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER application COMPLETE REPLICATION TO SYSTEM TIME '-1h';
~~~

Refer to [Using different timestamp formats]({% link {{ page.version.version }}/as-of-system-time.md %}#using-different-timestamp-formats) for more information.

Similarly, to cut over to a specific time in the future:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER application COMPLETE REPLICATION TO SYSTEM TIME '+5h';
~~~

A future cutover will proceed once the replicated data has reached the specified time.

{{site.data.alerts.callout_info}}
To monitor for when the replication stream completes, use [`SHOW VIRTUAL CLUSTER ... WITH REPLICATION STATUS`]({% link {{ page.version.version }}/show-virtual-cluster.md %}) to find the replication stream's `replication_job_id`, which you can pass to `SHOW JOB WHEN COMPLETE job_id` as the `job_id`. Refer to the `SHOW JOBS` page for [details]({% link {{ page.version.version }}/show-jobs.md %}#parameters) and an [example]({% link {{ page.version.version }}/show-jobs.md %}#show-job-when-complete).
{{site.data.alerts.end}}

## Step 2. Complete the cutover

1. The completion of the replication is asynchronous; to monitor its progress use:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW VIRTUAL CLUSTER application WITH REPLICATION STATUS;
    ~~~
    ~~~
      id |        name         |         data_state          | service_mode | source_tenant_name |                                                source_cluster_uri                                                   | replication_job_id |       replicated_time        |         retained_time         |          cutover_time
    -----+---------------------+-----------------------------+--------------+--------------------+---------------------------------------------------------------------------------------------------------------------+--------------------+------------------------------+-------------------------------+---------------------------------
      4  | application         | replication pending cutover | none         | application        | postgresql://{user}:{password}@{hostname}:26257?options=-ccluster%3Dsystem&sslmode=verify-full&sslrootcert=redacted | 903895265809498113 | 2023-09-28 17:41:18.03092+00 | 2023-09-28 16:09:04.327473+00 | 1695922878030920020.0000000000
    (1 row)
    ~~~

    Refer to [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}) for the [Responses]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}#responses) and [Data state]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}#data-state) of `SHOW VIRTUAL CLUSTER ... WITH REPLICATION STATUS` fields.

1. Once complete, bring the standby's virtual cluster online with:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER application START SERVICE SHARED;
    ~~~

    ~~~
      id |        name         |     data_state     | service_mode
    -----+---------------------+--------------------+---------------
      1  | system              | ready              | shared
      2  | template            | ready              | none
      3  | application         | ready              | shared
    (3 rows)
    ~~~

1. To make the standby's virtual cluster the default for connection strings, set the following [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING server.controller.default_target_cluster='application';
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

After cutting over to the standby cluster, you may need to move back to the original primary cluster, or a completely different cluster. This process is manual and requires starting a new replication stream.

For example, if you had [set up PCR]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}) between a primary and standby cluster and then cut over to the standby, the workflow to cut back to the original primary cluster would be as follows:

- Original primary cluster = Cluster A
- Original standby cluster = Cluster B

1. Cluster B is now serving application traffic after the cutover.
1. Drop the application virtual cluster from the cluster A with `DROP VIRTUAL CLUSTER`. {% comment %}link here{% endcomment %}
1. Start a replication stream that sends updates from cluster B to cluster A. Refer to [Start replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-4-start-replication).

At this point, **Cluster A** is once again the primary and **Cluster B** is once again the standby. The clusters are entirely independent. To direct application traffic to the primary (**Cluster A**), you will need to use your own network load balancers, DNS servers, or other network configuration to direct application traffic to **Cluster A**. To manage replicated jobs on the promoted standby, refer to [Job management](#job-management).

To enable physical cluster replication again, from the primary to the standby (or a completely different cluster), refer to [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}).

## See also

- [Physical Cluster Replication Overview]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})
- [Physical Cluster Replication Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %})
