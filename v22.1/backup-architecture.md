---
title: Backup Architecture
summary: Learn about how the process of a CockroachDB backup job works.
toc: true
docs_area: manage
---

CockroachDB backups operate as _jobs_, which are potentially long-running operations that could span multiple SQL sessions. Unlike regular SQL statements, which CockroachDB routes to the [optimizer](cost-based-optimizer.html) for processing, a [`BACKUP`](backup.html) statement will move into a job workflow. A backup job has two phases: [planning](#backup-job-planning) and [execution](#backup-job-execution).

The general workflow of a backup:

1. Validate the `BACKUP` statement
1. Determine the keys to backup in the [storage layer](architecture/storage-layer.html)
1. Write the backup data (SSTs) to the destination storage location
1. Write the metadata of the backup job

## Backup job planning

A backup begins with a planning phase that validates the general sense of the proposed backup. This includes verifying the options passed in the `BACKUP` statement and that the user has [permission](backup.html#required-privileges) to back up. During planning, the tables are identified along with the descriptors that contain the key spaces to back up. The ultimate aim of the planning phase is to complete all these checks and write the backup’s detail and metadata to a _job record_.

Planning happens within a single transaction in which the job record is written and committed as part of the transaction. As a result, [pausing](pause-job.html) and [canceling](cancel-job.html) a backup is not possible during the planning component since it is not yet a job.

Once detail of the backup is written to the job record, the planning phase’s transaction will commit and the backup job will then be adoptable by nodes in the cluster.

## Backup job execution

Clusters have system tables that are visible to each of their nodes. One of these tables, the `system.jobs` table, is a list of all adoptable jobs. Each row in this table represents a job, which is described by the job record created in the planning phase.

Each node at startup contains a _job registry_ that tracks the jobs a node can do and what jobs the node is currently completing. The job registry polls the `system.jobs` table to check if it can adopt any of the available job records. The node that claims the job is not necessarily the node that wrote the backup's job record in the first place. In the following diagram, each node has a job registry polling the cluster's `system.jobs` table, which holds job records.

<img src="{{ 'images/v22.1/backup-job-registry.png' | relative_url }}" alt="Three-node cluster with job registries on each node and the system.jobs table across the cluster" style="border:0px solid #eee;max-width:75%" />

Once one of the nodes has claimed the job, it will take the job record’s information and outline a plan. This node becomes the _coordinator_.

The coordinator will test connection to the storage bucket URL, which the original statement wrote to the job record. To map out the directory to which the nodes will write, the coordinator identifies the type of backup. This determines the name resolution of the new (or edited) directory to store the backup files in. For example, if there is a full backup existing in the target storage location, the upcoming backup will be [incremental](take-full-and-incremental-backups.html#incremental-backups) and therefore append to the [full](take-full-and-incremental-backups.html#full-backups) backup.

From the cluster, the coordinator will gather all the [leaseholders](architecture/reads-and-writes-overview.html) of the keys that will be part of the backup. The leaseholder is responsible for serving the data from the storage layer because all [writes](architecture/reads-and-writes-overview.html#write-scenario) go through a leaseholder. Since any node in a cluster can become the coordinator and all nodes could be responsible for exporting data during a backup, it is necessary that all nodes can connect to the storage location.

With this information, the coordinator sets up a [DistSQL](architecture/sql-layer.html#distsql) flow with specifications, which will define the distributed work in the job’s execution for each node. Next, the coordinator sends the specifications to the determined nodes and the cluster then begins to process the backup. In the following diagram, the **R1** and **R2** ranges are highlighted on the nodes holding the leaseholder and therefore these are the nodes exporting the backup data.

<img src="{{ 'images/v22.1/backup-export.png' | relative_url }}" alt="Three-node cluster exporting backup data from the leaseholders" style="border:0px solid #eee;max-width:75%" />

While processing, each of these nodes write checkpoint progress to track its backup work. The coordinating node will aggregate the progress data into checkpoint files in the storage bucket. The checkpoint files provide a marker for the backup to resume after a retryable state, such as when it has been paused.

The coordinator will begin to write the backup manifest file only after each of the nodes have completed their work. The backup manifest file is a metadata representation of everything a backup contains (the SST files written to the storage bucket, the descriptors, timestamps, etc.). That is, all the information a [restore](restore.html) job will need to complete successfully. A backup without a manifest file would indicate that the backup did not complete properly and would not be restorable.

With multiple backups complete, the specified storage location will contain a set of backups, which CockroachDB defines as a [_backup collection_](take-full-and-incremental-backups.html#backup-collections).

## See also

- CockroachDB's general [Architecture Overview](architecture/overview.html)
- [Storage Layer](architecture/storage-layer.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
