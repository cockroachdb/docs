---
title: Physical Cluster Replication Technical Overview
summary: Understand the technical details of CockroachDB physical cluster replication.
toc: true
docs_area: manage
---

[**Physical cluster replication (PCR)**]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) continuously and asynchronously replicates data from an active _primary_ CockroachDB cluster to a passive _standby_ cluster. When both clusters are virtualized, each cluster contains a _system virtual cluster_ and an application [virtual cluster]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}) during the PCR stream:

{% include {{ page.version.version }}/physical-replication/interface-virtual-cluster.md %}

If you utilize the [read on standby](#start-up-sequence-with-read-on-standby) feature in PCR, the standby cluster has an additional reader virtual cluster that safely serves read requests on the replicating virtual cluster. 

### PCR stream start-up sequence

[Starting a physical replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}) stream consists of two jobs: one each on the standby and primary cluster:

- Standby consumer job: Communicates with the primary cluster via an ordinary SQL connection and is responsible for initiating the replication stream. The consumer job ingests updates from the primary cluster producer job.
- Primary producer job: Protects data on the primary cluster and sends updates to the standby cluster.

The stream initialization proceeds as follows:

1. The standby's consumer job connects to the primary cluster via the standby's system virtual cluster and starts the primary cluster's `REPLICATION STREAM PRODUCER` job.
1. The primary cluster chooses a timestamp at which to start the physical replication stream. Data on the primary is protected from [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection) until it is replicated to the standby using a [protected timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps).
1. The primary cluster returns the timestamp and a [job ID]({% link {{ page.version.version }}/show-jobs.md %}#response) for the replication job.
1. The standby cluster retrieves a list of all nodes in the primary cluster. It uses this list to distribute work across all nodes in the standby cluster.
1. The initial scan runs on the primary and backfills all data from the primary virtual cluster as of the starting timestamp of the replication stream.
1. Once the initial scan is complete, the primary then begins streaming all changes from the point of the starting timestamp.

<img src="{{ 'images/v24.2/physical-rep-to.png' | relative_url }}" alt="Two virtualized clusters with system virtual cluster and application virtual cluster showing the directional stream." style="border:0px solid #eee;max-width:100%" />

#### Start-up sequence with read on standby

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

You can start a PCR stream with the `READ VIRTUAL CLUSTER` option, which allows you to perform reads on the standby's replicating virtual cluster. When this option is specified, the following additional steps occur during the PCR stream start-up sequence:

1. The system virtual cluster on the standby also creates a `readonly` virtual cluster alongside the replicating virtual cluster. The `readonly` virtual cluster will be offline initially.
1. After the initial scan of the primary completes, the standby's replicating virtual cluster has a complete snapshot of the latest data on the primary. The PCR job will then start the `readonly` virtual cluster.
1. When the startup completes, the `readonly` virtual cluster will be available to serve read queries. The queries will read from historical data on the replicating virtual cluster. The historical time is determined by the [`replicated_time`]({% link {{ page.version.version }}/show-virtual-cluster.md %}#responses) of the PCR job (the latest time at which the standby cluster has consistent data). The `replicated_time` will move forward as the PCR job continues to run.

### During the PCR stream

The replication happens at the byte level, which means that the job is unaware of databases, tables, row boundaries, and so on. However, when a [failover](#failover-and-promotion-process) to the standby cluster is initiated, the replication job ensures that the cluster is in a transactionally consistent state as of a certain point in time. Beyond the application data, the job will also replicate users, privileges, basic zone configuration, and schema changes.

During the job, [rangefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds) are periodically emitting resolved timestamps, which is the time where the ingested data is known to be consistent. Resolved timestamps provide a guarantee that there are no new writes from before that timestamp. This allows the standby cluster to move the [protected timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) forward as the replicated timestamp advances. This information is sent to the primary cluster, which allows for [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection) to continue as the replication stream on the standby cluster advances.

{{site.data.alerts.callout_info}}
If the primary cluster does not receive replicated time information from the standby after 24 hours, it cancels the replication job. This ensures that an inactive replication job will not prevent garbage collection.
{{site.data.alerts.end}}

### Failover and promotion process

The tracked replicated time and the advancing protected timestamp allow the replication stream to also track _retained time_, which is a timestamp in the past indicating the lower bound that the replication stream could fail over to. The retained time can be up to 4 hours in the past, due to the protected timestamp. Therefore, the _failover window_ for a replication job falls between the retained time and the replicated time.

<img src="{{ 'images/v25.3/failover.svg' | relative_url }}" alt="Timeline showing how the failover window is between the retained time and replicated time." style="border:0px solid #eee;width:100%" />

_Replication lag_ is the time between the most up-to-date replicated time and the actual time. While the replication keeps as current as possible to the actual time, this replication lag window is where there is potential for data loss.

For the [failover process]({% link {{ page.version.version }}/failover-replication.md %}), the standby cluster waits until it has reached the specified failover time, which can be in the [past]({% link {{ page.version.version }}/failover-replication.md %}#fail-over-to-a-point-in-time) (retained time), the [`LATEST`]({% link {{ page.version.version }}/failover-replication.md %}#fail-over-to-the-most-recent-replicated-time) timestamp, or in the [future]({% link {{ page.version.version }}/failover-replication.md %}#fail-over-to-a-point-in-time). Once that timestamp has been reached, the replication stream stops and any data in the standby cluster that is **above** the failover time is removed. Depending on how much data the standby needs to revert, this can affect the duration of RTO (recovery time objective).

{{site.data.alerts.callout_info}}
When a PCR stream is started with a `readonly` virtual cluster, the job will delete the `readonly` virtual cluster automatically if a failover is initiated with a [historical timestamp]({% link {{ page.version.version }}/failover-replication.md %}#fail-over-to-a-point-in-time). If the failover is initiated with the [most recent replicated time]({% link {{ page.version.version }}/failover-replication.md %}#fail-over-to-the-most-recent-replicated-time), the `readonly` virtual cluster will remain on the standby cluster.
{{site.data.alerts.end}}

After reverting any necessary data, the standby virtual cluster is promoted as available to serve traffic and the replication job ends.

For details on failing back to the primary cluster following a failover, refer to [Fail back to the primary cluster]({% link {{ page.version.version }}/failover-replication.md %}#failback).

### Multi-region behavior and best practices

You can use PCR to replicate between clusters with different [cluster regions]({% link {{ page.version.version }}/multiregion-overview.md %}#cluster-regions), [database regions]({% link {{ page.version.version }}/multiregion-overview.md %}#database-regions), and [table localities]({% link {{ page.version.version }}/table-localities.md %}). Mismatched regions and localities do not impact the [failover process]({% link {{ page.version.version }}/failover-replication.md %}) or ability to access clusters after failover, but they do impact [leaseholders]({% link {{ page.version.version }}/architecture/glossary.md %}#leaseholder) and locality-dependent settings.

If the localities on the primary cluster do not match the localities on the standby cluster, the standby cluster may be unable to satisfy replicating locality constraints. For example, if a replicated `REGIONAL BY ROW` table has partitions in `us-east`, `us-central`, and `us-west`, and the standby cluster only has nodes with the locality tags `us-east` and `us-central`, the standby cluster cannot satisfy the `REGIONAL BY ROW` `us-west` partition constraint. Data with unsatisfiable partition constraints is placed in an arbitrary location on the standby cluster, which can cause performance issues in the case of a failover event due to latency between regions.

After a failover event involving clusters in different regions, do not change any configurations on your standby cluster if you plan to [fail back to the original primary cluster]({% link {{ page.version.version }}/failover-replication.md %}#failback). If you plan to start using the standby cluster for long-running production traffic rather than performing a failback, adjust the configurations on the standby cluster to optimize for your traffic. When adjusting configurations, ensure that the new settings can be satisfied on the standby cluster. In particular, ensure that the cluster does not have pinned leaseholders for a region that does not exist on the cluster.
