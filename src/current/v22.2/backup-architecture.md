---
title: Backup Architecture
summary: Learn about how CockroachDB processes backup jobs.
toc: true
docs_area: manage
---

CockroachDB backups operate as _jobs_, which are potentially long-running operations that could span multiple SQL sessions. Unlike regular SQL statements, which CockroachDB routes to the [optimizer](cost-based-optimizer.html) for processing, a [`BACKUP`](backup.html) statement will move into a job workflow. A backup job has four main phases:

1. [Job creation](#job-creation-phase)
1. [Resolution](#resolution-phase)
1. [Export data](#export-phase)
1. [Metadata writing](#metadata-writing-phase)

The [Overview](#overview) section that follows provides an outline of a backup job's process. For a more detailed explanation of how a backup job works, read from the [Job creation phase](#job-creation-phase) section.

## Overview

At a high level, CockroachDB performs the following tasks when running a backup job:

1. Validates the parameters of the `BACKUP` statement then writes them to a job in the jobs system describing the backup.
1. Based on the parameters recorded in the job, and any previous backups found in the storage location, determines which key spans and time ranges of data in the [storage layer](architecture/storage-layer.html) need to be backed up.
1. Instructs various nodes in the cluster to each read those keys and writes the row data to the backup storage location.
1. Records any additional metadata about what was backed up to the backup storage location.

The following diagram illustrates the flow from `BACKUP` statement through to a complete backup in cloud storage:

<img src="{{ 'images/v22.2/backup-overview.png' | relative_url }}" alt="A flow diagram representing the process of a backup job from statement through to backup data stored." style="border:0px solid #eee;max-width:100%" />

## Job creation phase

A backup begins by validating the general sense of the proposed backup.

Let's take the following statement to start the backup process:

~~~ sql
BACKUP DATABASE movr INTO 's3://bucket' WITH revision_history;
~~~

This statement is a request for a [full backup](take-full-and-incremental-backups.html#full-backups) of the `movr` database with the `revision_history` [option](backup.html#options).

CockroachDB will verify the options passed in the `BACKUP` statement and check that the user has the [required privileges](backup.html#required-privileges) to take the backup. The tables are identified along with the set of key spans to back up. In this example, the backup will identify all the tables within the `movr` database and note that the `revision_history` option is required.

The ultimate aim of the job creation phase is to complete all of these checks and write the detail of what the backup job should complete to a _job record_.

If a [`detached`](backup.html#detached) backup was requested, the `BACKUP` statement is complete as it has created an uncommitted, but otherwise ready-to-run backup job. You'll find the job ID returned as output. Without the `detached` option, the job is committed and the statement waits to return the results until the backup job starts, runs (as described in the following sections), and terminates.

Once the job record is committed, the cluster will try to run the backup job even if a client disconnects or the node handling the `BACKUP` statement terminates. From this point, the backup is a persisted job that any node in the cluster can take over executing to ensure it runs. The job record will move to the system jobs table, ready for a node to claim it.

## Resolution phase

Once one of the nodes has claimed the job from the system jobs table, it will take the job record’s information and outline a plan. This node becomes the _coordinator_. In our example, **Node 2** becomes the coordinator and starts to complete the following to prepare and resolve the targets for distributed backup work:

- Test the connection to the storage bucket URL (`'s3://bucket'`).
- Determine the specific subdirectory for this backup, including if it should be incremental from any discovered existing directories.
- Calculate the keys of the backup data, as well as the time ranges if the backup is incremental.
- Determine the [leaseholder](architecture/overview.html#architecture-leaseholder) nodes for the keys to back up.
- Provide a plan to the nodes that will execute the data export (typically the leaseholder node).

To map out the storage location's directory to which the nodes will write the data, the coordinator identifies the [type](backup-and-restore-overview.html#backup-and-restore-product-support) of backup. This determines the name of the new (or edited) directory to store the backup files in. For example, if there is an existing full backup in the target storage location, the upcoming backup will be [incremental](take-full-and-incremental-backups.html#incremental-backups) and therefore append to the full backup after any existing incremental layers discovered in it.

For more information on how CockroachDB structures backups in storage, see [Backup collections](take-full-and-incremental-backups.html#backup-collections).

### Key and time range resolution

In this part of the resolution phase, the coordinator will calculate all the necessary spans of keys and their time ranges that the cluster needs to export for this backup. It divides the key spans based on which node is the [leaseholder](architecture/overview.html#architecture-leaseholder) of the range for that key span. Every node has a SQL processor on it to process the backup plan that the coordinator will pass to it. Typically, it is the backup SQL processor on the leaseholder node for the key span that will complete the export work.

Each of the node's backup SQL processors are responsible for:

1. Asking the [storage layer](architecture/storage-layer.html) for the content of each key span.
1. Receiving the content from the storage layer.
1. Writing it to the backup storage location or [locality-specific location](take-and-restore-locality-aware-backups.html) (whichever locality best matches the node).

Since any node in a cluster can become the coordinator and all nodes could be responsible for exporting data during a backup, it is necessary that all nodes can connect to the backup storage location.

## Export phase

Once the coordinator has provided a plan to each of the backup SQL processors that specifies the backup data, the distributed export of the backup data begins.

In the following diagram, **Node 2** and **Node 3** contain the leaseholders for the **R1** and **R2** [ranges](architecture/overview.html#architecture-range). Therefore, in this example backup job, the backup data will be exported from these nodes to the specified storage location.

While processing, the nodes emit progress data that tracks their backup work to the coordinator. In the diagram, **Node 3** will send progress data to **Node 2**. The coordinator node will then aggregate the progress data into checkpoint files in the storage bucket. The checkpoint files provide a marker for the backup to resume after a retryable state, such as when it has been [paused](pause-job.html).

<img src="{{ 'images/v22.2/backup-processing.png' | relative_url }}" alt="Three-node cluster exporting backup data from the leaseholders" style="border:0px solid #eee;max-width:100%" />

## Metadata writing phase

Once each of the nodes have fully completed their data export work, the coordinator will conclude the backup job by writing the backup metadata files. In the diagram, **Node 2** is exporting the backup data for **R1** as that range's leaseholder, but this node also exports the backup's metadata as the coordinator.

The backup metadata files describe everything a backup contains. That is, all the information a [restore](restore.html) job will need to complete successfully. A backup without metadata files would indicate that the backup did not complete properly and would not be restorable.

With the full backup complete, the specified storage location will contain the backup data and its metadata ready for a potential [restore](restore.html). After subsequent backups of the `movr` database to this storage location, CockroachDB will create a _backup collection_. See [Backup collections](take-full-and-incremental-backups.html#backup-collections) for information on how CockroachDB structures a collection of multiple backups.

## Backup jobs with locality

CockroachDB supports [locality-aware backup](#job-coordination-and-export-of-locality-aware-backups) that use a node's locality to determine how a backup job runs or where the backup data is stored. This section provides a technical overview of how the backup job process works for this backup type.

### Job coordination and export of locality-aware backups

When you create a [locality-aware backup](take-and-restore-locality-aware-backups.html) job, any node in the cluster can [claim the backup job](#job-creation-phase). A successful locality-aware backup job requires that each node in the cluster has access to each storage location. This is because any node in the cluster can claim the job and become the coordinator node. Once each node informs the coordinator node that it has completed exporting the row data, the coordinator will start to write metadata, which involves writing to each locality bucket a partial manifest recording what row data was written to that [storage bucket](use-cloud-storage.html).

Every node involved in the backup is responsible for backing up the ranges for which it was the [leaseholder](architecture/replication-layer.html#leases) at the time the coordinator planned the [distributed backup flow](#resolution-phase).

Every node backing up a [range](architecture/overview.html#cockroachdb-architecture-terms) will back up to the storage bucket that most closely matches that node's locality. The backup job attempts to back up ranges through nodes matching the range's locality. As a result, there is no guarantee that all ranges will be backed up to their locality's storage bucket. For additional detail on locality-aware backups in the context of a CockroachDB {{ site.data.products.serverless }} cluster, refer to [Job coordination on Serverless clusters](#job-coordination-on-serverless-clusters).

The node exporting the row data, and the leaseholder of the range being backed up, are usually the same. However, these nodes can differ when lease transfers have occurred during the [execution](#export-phase) of the backup. In this case, the leaseholder node returns the files to the node exporting the backup data (usually a local transfer), which then writes the file to the external storage location with a locality that usually matches its own localities (with an overall preference for more specific values in the locality hierarchy). If there is no match, the `default` locality is used.

For example, in the following diagram there is a three-node cluster split across three regions. The leaseholders write the ranges to be backed up to the external storage in the same region. As **Nodes 1** and **3** complete their work, they send updates to the coordinator node (**Node 2**). The coordinator will then [write the partial manifest files](#metadata-writing-phase) containing metadata about the backup work completed on each external storage location, which is stored with the backup SST files written to that storage location.

During a [restore](restore.html) job, the job creation statement will need access to each of the storage locations to read the metadata files in order to complete a successful restore.

<img src="{{ 'images/v23.1/locality-aware-backups.png' | relative_url }}" alt="How a locality-aware backup writes to storage buckets in each region" style="border:0px solid #eee;max-width:100%" />

#### Job coordination on Serverless clusters

{% include {{ page.version.version }}/backups/serverless-locality-aware.md %}

## See also

- CockroachDB's general [Architecture Overview](architecture/overview.html)
- [Storage layer](architecture/storage-layer.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
