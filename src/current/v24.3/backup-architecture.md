---
title: Backup Architecture
summary: Learn about how CockroachDB processes backup jobs.
toc: true
docs_area: manage
---

CockroachDB backups operate as _jobs_, which are potentially long-running operations that could span multiple SQL sessions. Unlike regular SQL statements, which CockroachDB routes to the [optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}) for processing, a [`BACKUP`]({% link {{ page.version.version }}/backup.md %}) statement will move into a job workflow. A backup job has four main phases:

1. [Job creation](#job-creation-phase)
1. [Resolution](#resolution-phase)
1. [Export data](#export-phase)
1. [Metadata writing](#metadata-writing-phase)

The [Overview](#overview) section that follows provides an outline of a backup job's process. For a more detailed explanation of how a backup job works, read from the [Job creation phase](#job-creation-phase) section.

For a technical overview of [locality-aware backups]({% link {{ page.version.version }}/take-and-restore-locality-aware-backups.md %}) or [locality-restricted backup execution]({% link {{ page.version.version }}/take-locality-restricted-backups.md %}), refer to the [Backup jobs with locality requirements](#backup-jobs-with-locality) section.

## Overview

At a high level, CockroachDB performs the following tasks when running a backup job:

1. Validates the parameters of the `BACKUP` statement then writes them to a job in the jobs system describing the backup.
1. Based on the parameters recorded in the job, and any previous backups found in the storage location, determines which key spans and time ranges of data in the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}) need to be backed up.
1. Instructs various nodes in the cluster to each read those keys and writes the row data to the backup storage location.
1. Records any additional metadata about what was backed up to the backup storage location.

The following diagram illustrates the flow from `BACKUP` statement through to a complete backup in cloud storage:

<img src="/docs/images/{{ page.version.version }}/backup-overview.png" alt="A flow diagram representing the process of a backup job from statement through to backup data stored." style="border:0px solid #eee;max-width:100%" />

## Job creation phase

A backup begins by validating the general sense of the proposed backup.

Let's take the following statement to start the backup process:

~~~ sql
BACKUP DATABASE movr INTO 's3://bucket' WITH revision_history;
~~~

This statement is a request for a [full backup]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups) of the `movr` database with the `revision_history` [option]({% link {{ page.version.version }}/backup.md %}#options).

CockroachDB will verify the options passed in the `BACKUP` statement and check that the user has the [required privileges]({% link {{ page.version.version }}/backup.md %}#required-privileges) to take the backup. The tables are identified along with the set of key spans to back up. In this example, the backup will identify all the tables within the `movr` database and note that the `revision_history` option is required.

The ultimate aim of the job creation phase is to complete all of these checks and write the detail of what the backup job should complete to a _job record_.

If a [`detached`]({% link {{ page.version.version }}/backup.md %}#detached) backup was requested, the `BACKUP` statement is complete as it has created an uncommitted, but otherwise ready-to-run backup job. You'll find the job ID returned as output. Without the `detached` option, the job is committed and the statement waits to return the results until the backup job starts, runs (as described in the following sections), and terminates.

Once the job record is committed, the cluster will try to run the backup job even if a client disconnects or the node handling the `BACKUP` statement terminates. From this point, the backup is a persisted job that any node in the cluster can take over executing to ensure it runs. The job record will move to the system jobs table, ready for a node to claim it.

## Resolution phase

Once one of the nodes has claimed the job from the system jobs table, it will take the job record’s information and outline a plan. This node becomes the _coordinator_. In our example, **Node 2** becomes the coordinator and starts to complete the following to prepare and resolve the targets for distributed backup work:

- Test the connection to the storage bucket URL (`'s3://bucket'`).
- Determine the specific subdirectory for this backup, including if it should be incremental from any discovered existing directories.
- Calculate the keys of the backup data, as well as the time ranges if the backup is incremental.
- Determine the [leaseholder]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-leaseholder) nodes for the keys to back up.
- Provide a plan to the nodes that will execute the data export.

To map out the storage location's directory where the nodes will write the data, the coordinator identifies the [type]({% link {{ page.version.version }}/backup-and-restore-overview.md %}#backup-and-restore-support) of backup. This determines the name of the new (or edited) directory to store the backup files in. For example, if there is an existing full backup already exists in the target storage location, the next backup will be [incremental]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#incremental-backups) and therefore will be appended to the full backup after any existing incremental layers discovered in it.

To restrict the execution of the job to nodes that match a specific locality filter, you can set the `EXECUTION LOCALITY` option. For detail on how this option affects the process of a backup job and an example, refer to [Take Locality-restricted backups]({% link {{ page.version.version }}/take-locality-restricted-backups.md %}).

For more information on how CockroachDB structures backups in storage, refer to [Backup collections]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#backup-collections).

### Key and time range resolution

In this part of the resolution phase, the coordinator will calculate all the necessary spans of keys and their time ranges that the cluster needs to export for this backup. It divides the key spans to distribute the work to a node that has a replica of the range to back up. If a locality filter is specified, work is distributed to a node from those that match the locality filter and has the most locality tiers in common with a node that has a replica. (For more details on backups and locality, refer to [Backup jobs with locality](#backup-jobs-with-locality).)

Every node has a SQL processor on it to process the backup plan that the coordinator will pass to it. Each of the node's backup SQL processors are responsible for:

1. Asking the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}) for the content of each key span.
1. Receiving the content from the storage layer.
1. Writing it to the backup storage location or [locality-specific location]({% link {{ page.version.version }}/take-and-restore-locality-aware-backups.md %}) (whichever locality best matches the node).

Since any node in a cluster can become the coordinator and all nodes could be responsible for exporting data during a backup, it is necessary that all nodes can connect to the backup storage location.

## Export phase

Once the coordinator has provided a plan to each of the backup SQL processors that specifies the backup data, the distributed export of the backup data begins.

In the following diagram, nodes that contain replicas of the relevant key spans will export the data to the specified storage location.

While processing, the nodes emit progress data that tracks their backup work to the coordinator. In the diagram, **Node 3** and **Node 1** will send progress data to **Node 2**. The coordinator node will then aggregate the progress data into checkpoint files in the storage bucket. The checkpoint files provide a marker for the backup to resume after a retryable state, such as when it has been [paused]({% link {{ page.version.version }}/pause-job.md %}).

<img src="/docs/images/{{ page.version.version }}/backup-processing.png" alt="Three-node cluster exporting backup data from the leaseholders" style="border:0px solid #eee;max-width:100%" />

## Metadata writing phase

Once each of the nodes have fully completed their data export work, the coordinator will conclude the backup job by writing the backup metadata files. In the diagram, **Node 2** is exporting the backup data for **R2** as it holds the replica containing the data, but this node also exports the backup's metadata as the coordinator.

The backup metadata files describe everything a backup contains. That is, all the information a [restore]({% link {{ page.version.version }}/restore.md %}) job will need to complete successfully. A backup without metadata files would indicate that the backup did not complete properly and would not be restorable.

With the full backup complete, the specified storage location will contain the backup data and its metadata ready for a potential [restore]({% link {{ page.version.version }}/restore.md %}). After subsequent backups of the `movr` database to this storage location, CockroachDB will create a _backup collection_. Refer to [Backup collections]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#backup-collections) for information on how CockroachDB structures a collection of multiple backups.

## Backup jobs with locality

CockroachDB supports two backup features that use a node's locality to determine how a backup job runs or where the backup data is stored. This section provides a technical overview of how the backup job process works for each of these backup features:

- [Locality-aware backup](#job-coordination-and-export-of-locality-aware-backups): Partition and store backup data in a way that is optimized for locality. This means that nodes write backup data to the cloud storage bucket that is closest to the node's locality.
- [Locality-restricted backup execution](#job-coordination-using-the-execution-locality-option): Specify a set of locality filters for a backup job in order to restrict the nodes that can participate in the backup process to that locality. This ensures that the backup job is executed by nodes that meet certain requirements, such as being located in a specific region or having access to a certain storage bucket.

### Job coordination and export of locality-aware backups

When you create a [locality-aware backup]({% link {{ page.version.version }}/take-and-restore-locality-aware-backups.md %}) job, any node in the cluster can [claim the backup job](#job-creation-phase). A successful locality-aware backup job requires that each node in the cluster has access to each storage location. This is because any node in the cluster can claim the job and become the coordinator node. Once each node informs the coordinator node that it has completed exporting the row data, the coordinator will start to write metadata, which involves writing to each locality bucket a partial manifest recording what row data was written to that [storage bucket]({% link {{ page.version.version }}/use-cloud-storage.md %}).

Every node backing up a [range]({% link {{ page.version.version }}/architecture/overview.md %}#range) will back up to the storage bucket that most closely matches that node's locality. The backup job attempts to back up ranges through nodes matching the range's locality. As a result, there is no guarantee that all ranges will be backed up to their locality's storage bucket. For additional detail on locality-aware backups in the context of a CockroachDB {{ site.data.products.standard }} or CockroachDB {{ site.data.products.basic }} cluster, refer to [Job coordination on CockroachDB {{ site.data.products.standard }} and {{ site.data.products.basic }} clusters](#job-coordination-on-cockroachdb-standard-and-basic-clusters).

For example, in the following diagram there is a three-node cluster split across three regions. The leaseholders write the ranges to be backed up to the external storage in the same region. As **Nodes 1** and **3** complete their work, they send updates to the coordinator node (**Node 2**). The coordinator will then [write the partial manifest files](#metadata-writing-phase) containing metadata about the backup work completed on each external storage location, which is stored with the backup SST files written to that storage location.

During a [restore]({% link {{ page.version.version }}/restore.md %}) job, the job creation statement will need access to each of the storage locations to read the metadata files in order to complete a successful restore.

<img src="/docs/images/{{ page.version.version }}/locality-aware-backups.png" alt="How a locality-aware backup writes to storage buckets in each region" style="border:0px solid #eee;max-width:100%" />

#### Job coordination on CockroachDB Standard and Basic clusters

{% include {{ page.version.version }}/backups/locality-aware-multi-tenant.md %}

### Job coordination using the `EXECUTION LOCALITY` option

When you start or [resume]({% link {{ page.version.version }}/resume-job.md %}) a backup with [`EXECUTION LOCALITY`]({% link {{ page.version.version }}/take-locality-restricted-backups.md %}), the backup job must determine the [coordinating node for the job](#job-creation-phase). If a node that does not match the locality filter is the first node to claim the job, the node is responsible for finding a node that does match the filter and transferring the execution to it. This transfer can result in a short delay in starting or resuming a backup job that has execution locality requirements.

If you create a backup job on a [gateway node]({% link {{ page.version.version }}/architecture/sql-layer.md %}#overview) with a locality filter that does **not** meet the filter requirement in `EXECUTION LOCALITY`, and the job does not use the [`DETACHED`]({% link {{ page.version.version }}/backup.md %}#detached) option, the job will return an error indicating that it moved execution to another node. This error is returned because when you create a job without the [`DETACHED`]({% link {{ page.version.version }}/backup.md %}#detached) option, the [job execution]({% link {{ page.version.version }}/backup-architecture.md %}#resolution-phase) must run to completion by the gateway node while it is still attached to the SQL client to return the result.

Once the coordinating node is determined, it will [assign chunks of row data]({% link {{ page.version.version }}/backup-architecture.md %}#resolution-phase) to eligible nodes, and each node reads its assigned row data and backs it up.

During the resolution phase of the backup job, the coordinator will plan the [distributed backup flow]({% link {{ page.version.version }}/backup-architecture.md %}#resolution-phase). When there is a locality filter specified, the coordinator will choose a node holding a replica that either matches the filter, or has the most locality tiers in common with the filter. This node will be responsible for backing up those ranges.

When the coordinator assigns row data to a node matching the locality filter to back up, that node will read from the closest [replica]({% link {{ page.version.version }}/architecture/reads-and-writes-overview.md %}#architecture-replica). If the node is itself a replica, it can read from itself. In the scenario where no replicas are available in the region of the assigned node, it may then read from a replica in a different region. As a result, you may want to consider [placing replicas]({% link {{ page.version.version }}/configure-replication-zones.md %}), including potentially non-voting replicas that will have less impact on read latency, in the locality or region you plan on pinning for backup job execution.

{{site.data.alerts.callout_info}}
Similarly to [locality-aware backups]({% link {{ page.version.version }}/take-and-restore-locality-aware-backups.md %}), the backup job will send [ranges]({% link {{ page.version.version }}/architecture/overview.md %}#range) to the cloud storage bucket matching the node's locality.
{{site.data.alerts.end}}

## See also

- CockroachDB's general [Architecture Overview]({% link {{ page.version.version }}/architecture/overview.md %})
- [Storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %})
- [Take Full and Incremental Backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
- [`BACKUP`]({% link {{ page.version.version }}/backup.md %})
- [`RESTORE`]({% link {{ page.version.version }}/restore.md %})
