---
title: Cut Over from a Primary Cluster to a Standby Cluster
summary: A guide to complete physical cluster replication and cut over from a primary to a standby cluster.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

[Physical cluster replication]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) allows you to cut over from the active primary cluster to the passive standby cluster that has ingested replicated data. When you complete the replication, it will stop the stream of new data, reset the standby virtual cluster to a point in time where all ingested data is consistent, and then mark the standby virtual cluster as ready to accept traffic.

The cutover is a two-step process on the standby cluster:

1. [Initiating the cutover](#step-1-initiate-the-cutover).
1. [Completing the cutover](#step-2-complete-the-cutover).

{{site.data.alerts.callout_danger}}
Initiating a cutover is a manual process that makes the standby cluster ready to accept SQL connections. However, the cutover process does **not** automatically redirect traffic to the standby cluster. Once the cutover is complete, you must redirect application traffic to the standby (new) cluster. If you do not manually redirect traffic, writes to the primary (original) cluster may be lost.
{{site.data.alerts.end}}

After a cutover, you may want to _cut back_ to the original primary cluster (or a different cluster). That is, set up the original primary cluster to once again accept application traffic. This requires you to either:

- Replicate any changes from the original standby (now primary) back to the original primary before it can accept application traffic again.
- Configure another full replication stream in the opposite direction from the original standby (now primary) to another cluster that will become the primary.

For more details, refer to [Cut back to the primary cluster](#cut-back-to-the-primary-cluster).

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

At this point, the primary and standby clusters are entirely independent. You will need to use your own network load balancers, DNS servers, or other network configuration to direct application traffic to the standby (now primary). To enable physical cluster replication again, from the new primary to the original primary (or a completely different cluster), refer to [Cut back to the primary cluster](#cut-back-to-the-primary-cluster).

## Cut back to the primary cluster

After cutting over to the standby cluster, you may need to move back to the original primary cluster, or a completely different cluster.

Refer to:

- {% include_cached new-in.html version="v24.1" %} [Cut back to the original primary cluster](#cut-back-to-the-original-primary-cluster).
- [Cut back to a different cluster](#cut-back-to-a-different-cluster).

### Cut back to the original primary cluster

{% include {{ page.version.version }}/physical-replication/fast-cutback-syntax.md %}

#### Example

The following is a step-by-step example of cutting back to the original primary cluster. This example assumes that a cutover from a primary to standby cluster has occurred, and the promoted standby has been serving traffic.

- **Cluster A** = original primary cluster
- **Cluster B** = original standby cluster

1. **Cluster B** is now serving application traffic after the [cutover](#step-2-complete-the-cutover).
1. To begin the cutback to the original primary cluster (**cluster A**), it is necessary that the virtual cluster (e.g., `vc_a`) is no longer serving traffic. Connect to the system virtual on **cluster A**:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url \
    "postgresql://{user}@{node IP or hostname cluster A}:26257?options=-ccluster=system&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

1. From the system virtual cluster on **cluster A**, ensure that service to the virtual cluster has stopped:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER vc_a STOP SERVICE;
    ~~~

1. Open another terminal window and connect to the system virtual cluster for **cluster B**:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url \
    "postgresql://{user}@{node IP or hostname cluster B}:26257?options=-ccluster=system&sslmode=verify-full" \
    --certs-dir "certs"
    ~~~

1. From the system virtual cluster on **cluster B**, enable rangefeeds:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING kv.rangefeed.enabled = 'true';
    ~~~

1. From the system virtual cluster on **cluster A**, start the replication from cluster B to cluster A:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER {vc_a} START REPLICATION OF {vc_b} ON 'postgresql://{user}@{ node IP or hostname cluster B}:26257?options=-ccluster=system&sslmode=verify-full&sslrootcert=certs/{standby cert}.crt';
    ~~~

    This will rewind the virtual cluster on **A** back to the time at which the same virtual cluster on **B** diverged from it. **Cluster A** will check with **cluster B** to confirm that its virtual cluster was replicated from **cluster A** as part of the original [physical cluster replication stream]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}).

    {{site.data.alerts.callout_success}}
    For details on connection strings, refer to the [Connection reference]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#connection-reference).
    {{site.data.alerts.end}}

1. Check the status of the virtual cluster on **A**:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW VIRTUAL CLUSTER {vc_a};
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

1. Run the following from **cluster A** to start the cutover:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER {vc_a} COMPLETE REPLICATION TO LATEST;
    ~~~

    The `cutover_time` is the timestamp at which the replicated data is consistent. The cluster will revert any data above this timestamp:

    ~~~
               cutover_time
    ----------------------------------
      1714497890000000000.0000000000
    (1 row)
    ~~~

1. From **cluster A**, bring the virtual cluster online with:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER {vc_a} START SERVICE SHARED;
    ~~~

1. To make **cluster A's** virtual cluster the default for connection strings, set the following [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING server.controller.default_target_cluster='{vc_a}';
    ~~~

At this point, **cluster A** is once again the primary and **cluster B** is once again the standby. The clusters are entirely independent. You will need to use your own network load balancers, DNS servers, or other network configuration to direct application traffic to the primary (**cluster A**). To enable physical cluster replication again, from the primary to the standby (or a completely different cluster), refer to [Set Up Physical Cluster Replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}).

### Cut back to a different cluster

To create a completely new virtual cluster in the original primary cluster, or another physical cluster, use the [`CREATE VIRTUAL CLUSTER`]({% link {{ page.version.version }}/create-virtual-cluster.md %}) syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE VIRTUAL CLUSTER new_vc FROM REPLICATION OF promoted_standby_vc ON connection_string_standby;
~~~

This command will start an initial backfill of all data from the source (the promoted standby) to the new cluster, and then continuously apply changes as they are streamed.

## See also

- [Physical Cluster Replication Overview]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %})
- [Physical Cluster Replication Technical Overview]({% link {{ page.version.version }}/physical-cluster-replication-technical-overview.md %})
