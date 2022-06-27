---
title: Backup Architecture
summary: Learn about how the process of a CockroachDB backup job works.
toc: true
docs_area: manage
---

CockroachDB backups operate as _jobs_, which are potentially long-running operations that could span multiple SQL sessions. Unlike regular SQL statements, which CockroachDB routes to the [optimizer](cost-based-optimizer.html) for processing, a [`BACKUP`](backup.html) statement will move into a job workflow. A backup job has two phases: [planning](#backup-job-planning) and [execution](#backup-job-execution).

## Overview

The general workflow of a backup:

1. Validate the `BACKUP` statement
1. Determine the keys in the [storage layer](architecture/storage-layer.html) to back up
1. Write the backup data (SSTs) to the destination storage location
1. Write the metadata of the backup job

<img src="{{ 'images/v22.1/backup-overview.png' | relative_url }}" alt="A flow diagram representing the process of a backup job from statement through to backup data stored." style="border:0px solid #eee;max-width:100%" />

### Glossary 

Term         | Description
-------------+-----------------------------
coordinator  | The node that adopts the job and coordinates the distributed work for the backup job.
job record   | Details of the backup job that are defined in the planning phase of the backup.
job registry | On each node, this polls the cluster's system jobs table to find adoptable jobs.
manifest     | A metadata representation of the backup, which is stored with the backup data in the storage location.

As we run through how a backup works, we'll use a backup job example that will run on a three-node cluster.

## Backup job planning

A backup job begins with a planning phase that validates the general sense of the proposed backup.

Let's take the following statement to start the backup process:

~~~ sql
BACKUP DATABASE movr INTO 's3://bucket' WITH revision_history;
~~~

During planning, CockroachDB will verify the [options](backup.html#options) (e.g., `revision_history`) passed in the `BACKUP` statement and check that the user has the [required privileges](backup.html#required-privileges) to take the backup. The tables are identified along with the set of keys to back up. In this example, the backup will identify all the tables within the `movr` database and note that the `revision_history` option is required.

The ultimate aim of the planning phase is to complete all of these checks and write the detail of what the backup job should complete to a _job record_.

Planning happens within a single transaction in which the job record is written and committed as part of the transaction. As a result, [pausing](pause-job.html) and [canceling](cancel-job.html) a backup is not possible during the planning component since it is not yet a job. 

Once the statement has been passed through the planning phase a `job ID` output will return, which represents that the job has started executing.

 ~~~
        job_id
----------------------
  592786066399264769
(1 row)
 ~~~

## Backup job execution

As soon as the detail of the backup is written to the job record, the planning phase’s transaction will commit and the backup job will then be adoptable by nodes in the cluster.

Clusters have system tables that are visible to each of their nodes. One of these tables, the `system.jobs` table, is a list of all adoptable jobs. Each row in this table represents a job, which is described by the job record created in the planning phase.

Each node at startup contains a _job registry_ that tracks the jobs a node can do and what jobs the node is currently completing. The job registry polls the `system.jobs` table to check if it can adopt any of the available job records. The node that claims the job is not necessarily the node that wrote the backup's job record in the first place. 

In the following diagram, each node has a job registry polling the cluster's `system.jobs` table, which holds job records. The backup job record that was written from the example statement waits for a node to adopt it.

<!--TODO Adapt this diagram to focus on better reflect the text and example. -->
<img src="{{ 'images/v22.1/backup-job-registry.png' | relative_url }}" alt="Three-node cluster with job registries on each node and the system.jobs table across the cluster" style="border:0px solid #eee;max-width:75%" />

Once one of the nodes has claimed the job, it will take the job record’s information and outline a plan. This node becomes the _coordinator_. In our scenario, **Node 2** becomes the coordinator and start to complete several tasks to start the distributed backup work: 

- Test the connection to the storage bucket URL (`'s3://bucket'`).
- Map out the directory to which the nodes will write.
- Gather all the leaseholders of the keys to be backed up.

To map out the directory to which the nodes will write, the coordinator identifies the [type](backup-and-restore-overview.html#backup-and-restore-types) of backup. This determines the name resolution of the new (or edited) directory to store the backup files in. For example, if there is a full backup existing in the target storage location, the upcoming backup will be [incremental](take-full-and-incremental-backups.html#incremental-backups) and therefore append to the [full](take-full-and-incremental-backups.html#full-backups) backup.

From the cluster, the coordinator will gather all the [leaseholders](architecture/reads-and-writes-overview.html) of the keys that will be part of the backup. The leaseholder is responsible for serving the data from the storage layer because all [writes](architecture/reads-and-writes-overview.html#write-scenario) go through a leaseholder. Since any node in a cluster can become the coordinator and all nodes could be responsible for exporting data during a backup, it is necessary that all nodes can connect to the storage location.

With this information, the coordinator sets up a [DistSQL](architecture/sql-layer.html#distsql) flow with specifications, which will define the distributed work in the job’s execution for each node. Next, the coordinator sends the specifications to the determined nodes and the cluster then begins to process the backup. 

In the following diagram, **node 2** and **node 3** contains the leaseholders for the **R1** and **R2** ranges. Therefore, for the example backup job, these nodes will export the backup data to the specified storage location.

<!--TODO Edit the diagram to match the scenario -->
<img src="{{ 'images/v22.1/backup-export.png' | relative_url }}" alt="Three-node cluster exporting backup data from the leaseholders" style="border:0px solid #eee;max-width:75%" />

While processing, the nodes write checkpoint progress to track its backup work. The coordinating node will aggregate the progress data into checkpoint files in the storage bucket. The checkpoint files provide a marker for the backup to resume after a retryable state, such as when it has been paused.

The coordinator will begin to write the backup manifest file only after each of the nodes have completed their work. In the previous diagram, **node 2** is exporting the backup data for **R1** as its leaseholder, but this node also exports the backup's metadata as the coordinator.

The backup manifest file is a metadata representation of everything a backup contains. That is, all the information a [restore](restore.html) job will need to complete successfully. A backup without a manifest file would indicate that the backup did not complete properly and would not be restorable.

With multiple backups complete, the specified storage location will contain a set of backups, which CockroachDB defines as a [_backup collection_](take-full-and-incremental-backups.html#backup-collections).

## See also

- CockroachDB's general [Architecture Overview](architecture/overview.html)
- [Storage Layer](architecture/storage-layer.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
