---
title: Physical Cluster Replication Technical Overview
summary: Understand the technical details of CockroachDB physical cluster replication.
toc: true
docs_area: manage
---

[**Physical cluster replication (PCR)**]({% link {{ page.version.version }}/physical-cluster-replication-overview.md %}) automatically and continuously streams data from an active _primary_ CockroachDB cluster to a passive _standby_ cluster. Each cluster contains: a _system virtual cluster_ and an application [virtual cluster]({% link {{ page.version.version }}/cluster-virtualization-overview.md %}):

{% include {{ page.version.version }}/physical-replication/interface-virtual-cluster.md %}

This separation of concerns means that the replication stream can operate without affecting work happening in a virtual cluster.

### Replication stream start-up sequence

[Starting a physical replication]({% link {{ page.version.version }}/set-up-physical-cluster-replication.md %}) stream consists of two jobs: one each on the standby and primary cluster:

- Standby consumer job: Communicates with the primary cluster via an ordinary SQL connection and is responsible for initiating the replication stream. The consumer job ingests updates from the primary cluster producer job.
- Primary producer job: Protects data on the primary cluster and sends updates to the standby cluster.

The stream initialization proceeds as follows:

1. The standby's consumer job connects via its system virtual cluster to the primary cluster and starts the primary cluster's physical stream producer job.
1. The primary cluster chooses a timestamp at which to start the physical replication stream. Data on the primary is protected from [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection) until it is replicated to the standby using a [protected timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps).
1. The primary cluster returns the timestamp and a [job ID]({% link {{ page.version.version }}/show-jobs.md %}#response) for the replication job.
1. The standby cluster retrieves a list of all nodes in the primary cluster. It uses this list to distribute work across all nodes in the standby cluster.
1. The initial scan runs on the primary and backfills all data from the primary virtual cluster as of the starting timestamp of the replication stream.
1. Once the initial scan is complete, the primary then begins streaming all changes from the point of the starting timestamp.

<img src="/docs/images/{{ page.version.version }}/physical-rep-to.png" alt="Two virtualized clusters with system virtual cluster and application virtual cluster showing the directional stream." style="border:0px solid #eee;max-width:100%" />

### During the replication stream

The replication happens at the byte level, which means that the job is unaware of databases, tables, row boundaries, and so on. However, when a [cutover](#cutover-and-promotion-process) to the standby cluster is initiated, the replication job ensures that the cluster is in a transactionally consistent state as of a certain point in time. Beyond the application data, the job will also replicate users, privileges, basic zone configuration, and schema changes.

During the job, [rangefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds) are periodically emitting resolved timestamps, which is the time where the ingested data is known to be consistent. Resolved timestamps provide a guarantee that there are no new writes from before that timestamp. This allows the standby cluster to move the [protected timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) forward as the replicated timestamp advances. This information is sent to the primary cluster, which allows for [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection) to continue as the replication stream on the standby cluster advances.

{{site.data.alerts.callout_info}}
If the primary cluster does not receive replicated time information from the standby after 24 hours, it cancels the replication job. This ensures that an inactive replication job will not prevent garbage collection.
{{site.data.alerts.end}}

### Cutover and promotion process

The tracked replicated time and the advancing protected timestamp allows the replication stream to also track _retained time_, which is a timestamp in the past indicating the lower bound that the replication stream could cut over to. Therefore, the _cutover window_ for a replication job falls between the retained time and the replicated time.

<img src="/docs/images/{{ page.version.version }}/cutover-window.png" alt="Timeline showing how the cutover window is between the retained time and replicated time." style="border:0px solid #eee;max-width:100%" />

_Replication lag_ is the time between the most up-to-date replicated time and the actual time. While the replication keeps as current as possible to the actual time, this replication lag window is where there is potential for data loss.

For the [cutover process]({% link {{ page.version.version }}/cutover-replication.md %}), the standby cluster waits until it has reached the specified cutover time, which can be in the [past]({% link {{ page.version.version }}/cutover-replication.md %}#cut-over-to-a-point-in-time) (retained time), the [`LATEST`]({% link {{ page.version.version }}/cutover-replication.md %}#cut-over-to-the-most-recent-replicated-time) timestamp, or in the [future]({% link {{ page.version.version }}/cutover-replication.md %}#cut-over-to-a-point-in-time). Once that timestamp has been reached, the replication stream stops and any data in the standby cluster that is **above** the cutover time is removed. Depending on how much data the standby needs to revert, this can affect the duration of RTO (recovery time objective).

After reverting any necessary data, the standby virtual cluster is promoted as available to serve traffic and the replication job ends.

{{site.data.alerts.callout_info}}
For detail on cutting back to the primary cluster following a cutover, refer to [Cut back to the primary cluster]({% link {{ page.version.version }}/cutover-replication.md %}#cut-back-to-the-original-primary-cluster).
{{site.data.alerts.end}}
