---
title: Execution Locality Backups
summary: Use the execution locality backup option with locality filters to determine the nodes that will execute the backup job.
toc: true
docs_area: manage
---

{% include_cached new-in.html version="v23.1" %} Using the `EXECUTION LOCALITY` option when you create a [backup](backup.html) job, you can set [locality filter](cockroach-start.html#locality) requirements that a node must meet in order to take part in executing a backup job. This will pin the [coordination of the backup job](backup-architecture.html#job-creation-phase) and the nodes that [process the row data](backup-architecture.html#export-phase) to the defined locality. 

Defining an execution locality for a backup job, could be useful in the following cases:

- When nodes in a cluster operate in different locality tiers, networking rules can restrict nodes from accessing a storage bucket. For an example, see [Access backup storage restricted by network rules](#access-backup-storage-restricted-by-network-rules).
- When a multi-region cluster is running heavy workloads and an aggressive backup schedule, designating a region as the "backup" locality may improve latency. For an example, see [Create a non-primary region for backup jobs](#create-a-non-primary-region-for-backup-jobs).

{{site.data.alerts.callout_info}}
See [Take and Restore Locality-aware Backups](take-and-restore-locality-aware-backups.html) to run backup jobs where each node writes files only to the backup storage bucket that matches the node locality configured at node startup.
{{site.data.alerts.end}}

## Syntax

To specify the locality requirements for the coordinating node, run `EXECUTION LOCALITY` with key-value pairs. The key-value pairs represent the [locality designations](cockroach-start.html#locality) assigned to the cluster at startup.

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP DATABASE {database} INTO 'external://backup_storage' WITH EXECUTION LOCALITY = 'region={region},cloud={cloud}';
~~~

When you run `EXECUTION LOCALITY`, consider the following:

- The backup job will fail if no nodes match the locality filter.
- Selection of the coordinating node that matches the locality filter may slightly increase the startup latency of the backup job.
- Even though a backup job has been pinned to a locality, it may still read data from another locality if there are no replicas in its locality.
- If the job is created on a node that does not match the locality filter, you will receive an error even when the **job creation was successful**. This error indicates that the job execution moved to another node. To avoid viewing this error, we recommend using the [`DETACHED`](backup.html#detached) option with `EXECUTION LOCALITY` when creating a manual job rather than a [scheduled job](create-schedule-for-backup.html). Then, use the [`SHOW JOB WHEN COMPLETE`](show-jobs.html#show-job-when-complete) statement to determine when the job has finished. See [Job coordination using the execution locality option](#job-coordination-using-the-execution-locality-option) for more detail.

## Job coordination using the execution locality option

When you start or [resume](resume-job.html) a backup with `EXECUTION LOCALITY`, it is necessary to determine the [coordinating node for the job](backup-architecture.html#job-creation-phase). If a node that does not match the locality filter is the first node to claim the job, it will find a node that does match the filter and transfer the execution to it. This can result in a short delay in starting or resuming a backup job that has execution locality requirements.

If you create a backup job on a [gateway node](architecture/sql-layer.html#overview) with a locality filter that does **not** meet the filter requirement in `EXECUTION LOCALITY`, the job will return an error indicating that it moved execution to another node. This error is returned because when you create a job without the [`DETACHED`](backup.html#detached) option, the [job execution](backup-architecture.html#resolution-phase) needs to be run to completion by the gateway node while it is still attached to the SQL client to return the result. 

Once the coordinating node is determined, it will [assign chunks of row data](backup-architecture.html#resolution-phase) to nodes that are then responsible for reading that row data and backing it up. The coordinator will only assign row data to nodes that match the locality filter. The following will happen in different cases:

- If the [leaseholder](architecture/reads-and-writes-overview.html#architecture-leaseholder) for part of the row data matches the filter, the coordinator will assign it that row data to process. 
- If the leaseholder does not match the locality filter, the coordinator will select a node from those that match the locality filter with a preference for nodes with localities that are more similar to the leaseholder.

When the coordinator assigns row data to a node matching the locality filter to back up, that node will read from the closest [replica](architecture/reads-and-writes-overview.html#architecture-replica). If the node is the leaseholder, or is itself a replica, it can read from itself. In the scenario where no replicas are available in the region of the assigned node, it may then read from a replica in a different region. As a result, you may want to consider [placing replicas](configure-replication-zones.html), including potentially non-voting replicas that will have less impact on read latency, in the locality or region you plan on pinning for backup job execution.

For an overview of the backup job phases, see the [Backup Architecture](backup-architecture.html) page.

## Examples

This section outlines some possible use cases for the `EXECUTION LOCALITY` option.

### Access backup storage restricted by network rules

In certain cases, a cluster could be restricted by network rules across regions (or another locality requirement) for security purposes. This means that only nodes within the same region as the backup [cloud storage](use-cloud-storage.html) location can access the storage bucket. With `EXECUTION LOCALITY`, you can set up the backup to pin execution of the job to only the nodes with access to the bucket.

The following diagram shows a CockroachDB cluster where each of the nodes can communicate with each other through a specific port, but any other network traffic between regions is blocked. Leaseholders in regions that do not match the cloud storage region (Node 2) cannot access the storage to [export backup data](backup-architecture.html#export-phase). 

Instead, Node 3's locality matches a backup job created with `EXECUTION LOCALITY`. Leaseholders and replicas within that locality designation holding the row data to back up will begin reading and exporting to cloud storage.

<img src="{{ 'images/v23.1/network-restriction.png' | relative_url }}" alt="Using execution locality when there is a network restriction between locality requirements" style="border:0px solid #eee;max-width:100%" />

To execute the backup from only the region with access to cloud storage, you can specify [locality filters](cockroach-start.html#locality) that a node must match to take part in the backup job's execution.

For example, you can pin the execution of the backup job to `us-west-1`: 

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP DATABASE {database} INTO 'external://backup_storage_uswest' WITH EXECUTION LOCALITY = 'region=us-west-1', DETACHED;
~~~

See the [`BACKUP`](backup.html) page for further detail on other parameters and options. 

### Create a non-primary region for backup jobs

Sometimes the execution of backup jobs can consume considerable resources when running [frequent full and incremental backups simultaneously](create-schedule-for-backup.html). One approach to minimize the impact of running background jobs on foreground application traffic is to restrict the execution of backup jobs to a designated subset of nodes that you are not using to serve application traffic.

This diagram shows a CockroachDB cluster in four regions. The node used to run the backup job was configured with [non-voting replicas](architecture/replication-layer.html#non-voting-replicas) to provide low-latency reads. The node(s) in this region will complete the backup job coordination and data export to cloud storage.

<img src="{{ 'images/v23.1/background-work.png' | relative_url }}" alt="Using execution locality to create a non-primary region for backup jobs" style="border:0px solid #eee;max-width:100%" />

For detail on configuring a cluster as per the example, see:

- The [`--locality`](cockroach-start.html#locality) flag to specify the locality tiers that describe the location of a node.
- The `num_voters` and `voter_constraints` variables on the [Configure Replication Zones](configure-replication-zones.html#num_voters) page to configure non-voting replicas via zone configurations.

With nodes in a specific region containing non-voting replicas, you can define the locality requirement for the nodes when creating the backup job:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP DATABASE {database} INTO 'external://backup_storage' WITH EXECUTION LOCALITY = 'region={region},dc={datacenter}', DETACHED;
~~~

## See also

- [`BACKUP`](backup.html)
- [Backup Architecture](backup-architecture.html)
- [`RESTORE`](restore.html)
- [Backup and Restore Overview](backup-and-restore-overview.html)