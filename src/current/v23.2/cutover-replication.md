---
title: Cut Over from a Primary Cluster to a Standby Cluster
summary: A guide to complete physical cluster replication and cut over from a primary to a standby cluster.
toc: true
docs_area: manage
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

{% include_cached new-in.html version="v23.2" %} Physical cluster replication allows you to cut over from the active primary cluster to the passive standby cluster that has ingested replicated data. When you complete the replication, it will stop the stream of new data, reset the standby virtual cluster to a point in time where all ingested data is consistent, and then mark the standby virtual cluster as ready to accept traffic.

The cutover is a two-step process on the standby cluster:

1. [Initiating the cutover](#step-1-initiating-the-cutover).
1. [Completing the cutover](#step-2-completing-the-cutover).

{{site.data.alerts.callout_danger}}
Initiating a cutover is a manual process that makes the standby cluster ready to accept SQL connections. However, the cutover process does **not** automatically redirect traffic to the standby cluster. Once the cutover is complete, you must redirect application traffic to the standby (new) cluster. If you do not manually redirect traffic, writes to the primary (original) cluster may be lost.
{{site.data.alerts.end}}

After a cutover, you may want to _cut back_ to the original primary cluster. That is, set up the original primary cluster to once again accept application traffic. This requires you to undertake another a full replication stream in the opposite direction from standby to primary. For more detail, refer to [Cut back to the primary cluster](#cut-back-to-the-primary-cluster).

{% comment %}This page describes how to cut over from the primary to the standby cluster, for information on how replication works, refer to:{% endcomment %}

{% include {{ page.version.version }}/physical-replication/reference-links-replication.md %}

## Step 1. Initiating the cutover

To initiate a cutover to the standby cluster, there are different ways of specifying the point in time for the standby's promotion. Refer to the following sections for steps:

- [`LATEST`](#cut-over-to-the-most-recent-replicated-time): The most recent replicated timestamp.
- [Point-in-time](#cut-over-to-a-point-in-time):
    - Past: A timestamp in the past that is within the cutover window. {% comment %}Add link to technical overview (replicated timestamp + cutover window){% endcomment %}
    - Future: A timestamp in the future in order to plan a cutover.

### Cut over to the most recent replicated time

To initiate a cutover to the most recent replicated timestamp, you can specify `LATEST`. It is important to note that the latest replicated time may be behind the actual time if there is _replication lag_ in the stream. That is, the time between the most up-to-date replicated time and the actual time.{% comment %}Link lag to technical overview{% endcomment %}

To view the current replication timestamp, use:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW VIRTUAL CLUSTER standbyapplication WITH REPLICATION STATUS;
~~~

{% include_cached copy-clipboard.html %}
~~~
  id |     name           | data_state  | service_mode | source_tenant_name |                                                  source_cluster_uri                                                   | replication_job_id |       replicated_time        |         retained_time         | cutover_time
-----+--------------------+-------------+--------------+--------------------+-----------------------------------------------------------------------------------------------------------------------+--------------------+------------------------------+-------------------------------+---------------
   5 | standbyapplication | replicating | none         | application        | postgresql://user:redacted@host/?options=-ccluster%3Dsystem&sslmode=verify-full&sslrootcert=redacted | 911803003607220225 | 2023-10-26 17:36:52.27978+00 | 2023-10-26 14:36:52.279781+00 |         NULL
~~~

Run the following from the standby cluster's SQL shell to start the cutover:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER standbyapplication COMPLETE REPLICATION TO LATEST;
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
SHOW VIRTUAL CLUSTER standbyapplication WITH REPLICATION STATUS;
~~~

The `retained_time` response provides the earliest time to which you can cut over.

{% include_cached copy-clipboard.html %}
~~~
id |        name        |     data_state     | service_mode | source_tenant_name |                                                     source_cluster_uri                                               | replication_job_id |        replicated_time        |         retained_time         | cutover_time
---+--------------------+--------------------+--------------+--------------------+----------------------------------------------------------------------------------------------------------------------+--------------------+-------------------------------+-------------------------------+---------------
3  | standbyapplication | replicating        | none         | application        | postgresql://{user}:redacted@{hostname}:26257/?options=-ccluster%3Dsystem&sslmode=verify-full&sslrootcert=redacted   | 899090689449132033 | 2023-09-11 22:29:35.085548+00 | 2023-09-11 16:51:43.612846+00 |     NULL
(1 row)
~~~

Specify a timestamp:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER standbyapplication COMPLETE REPLICATION TO SYSTEM TIME '-1h';
~~~

Refer to [Using different timestamp formats]({% link {{ page.version.version }}/as-of-system-time.md %}#using-different-timestamp-formats) for more information.

Similarly, to cut over to a specific time in the future:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER VIRTUAL CLUSTER standbyapplication COMPLETE REPLICATION TO SYSTEM TIME '+5h';
~~~

A future cutover will proceed once the replicated data has reached the specified time.

## Step 2. Completing the cutover

1. The completion of the replication is asynchronous; to monitor its progress use:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW VIRTUAL CLUSTER standbyapplication WITH REPLICATION STATUS;
    ~~~
    ~~~
      id |        name         |         data_state          | service_mode | source_tenant_name |                                                source_cluster_uri                                                 | replication_job_id |       replicated_time        |         retained_time         |          cutover_time
    -----+---------------------+-----------------------------+--------------+--------------------+-------------------------------------------------------------------------------------------------------------------+--------------------+------------------------------+-------------------------------+---------------------------------
      4  | standbyapplication  | replication pending cutover | none         | application        | postgresql://user:redacted@3ip:26257/?options=-ccluster%3Dsystem&sslmode=verify-full&sslrootcert=redacted         | 903895265809498113 | 2023-09-28 17:41:18.03092+00 | 2023-09-28 16:09:04.327473+00 | 1695922878030920020.0000000000
    (1 row)
    ~~~

    Refer to [Physical Cluster Replication Monitoring]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}) for more  detail.

1. Once complete, start the standby's virtual cluster with:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER VIRTUAL CLUSTER standbyapplication START SERVICE SHARED;
    ~~~

    ~~~
      id |        name         |     data_state     | service_mode
    -----+---------------------+--------------------+---------------
      1  | system              | ready              | shared
      2  | template            | ready              | none
      3  | standbyapplication  | ready              | shared
    (3 rows)
    ~~~

1. To make the standby's virtual cluster the default for connection strings. Set the following [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING server.controller.default_target_cluster='standbyapplication'
    ~~~

At this point, the primary and standby clusters are entirely independent. You will need to use your own orchestration to direct traffic to the standby.

## Cut back to the primary cluster

After cutting over to the standby cluster, you may need to move back to the original primary cluster, or a completely different cluster. This process is manual and requires starting a new replication stream.

For example, if you had [set up physical cluster replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}) between a primary and standby cluster and then cut over to the standby, the workflow to cut back to the original primary cluster would be as follows:

- Original primary cluster = Cluster A
- Original standby cluster = Cluster B

1. Cluster B is now serving application traffic after the cutover.
1. Drop the application virtual cluster from the cluster A with `DROP VIRTUAL CLUSTER`. {% comment %}link here{% endcomment %}
1. Start a replication stream that sends updates from cluster B to cluster A. Refer to [Start replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}#step-4-start-replication).


{% comment %}

## See also

- [Physical Cluster Replication Overview](physical-replication-overview)
- Technical overview

{% endcomment %}