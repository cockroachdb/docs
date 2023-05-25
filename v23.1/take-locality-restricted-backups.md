---
title: Take Locality-restricted Backups
summary: Use the execution locality backup option with locality filters to restrict the nodes that can execute a backup job.
toc: true
docs_area: manage
---

{% include_cached new-in.html version="v23.1" %} The `EXECUTION LOCALITY` option allows you to restrict the nodes that can execute a [backup](backup.html) job by using a [locality filter](cockroach-start.html#locality) when you create the backup. This will pin the [coordination of the backup job](backup-architecture.html#job-creation-phase) and the nodes that [process the row data](backup-architecture.html#export-phase) to the defined locality filter. 

Defining an execution locality for a backup job is useful in the following cases:

- When nodes in a cluster operate in different locality tiers, networking rules can restrict nodes from accessing a storage bucket. For an example, refer to [Access backup storage restricted by network rules](#access-backup-storage-restricted-by-network-rules).
- When a multi-region cluster is running heavy workloads and an aggressive backup schedule, designating a region as the "backup" locality may improve latency. For an example, refer to [Create a non-primary region for backup jobs](#create-a-non-primary-region-for-backup-jobs).

{{site.data.alerts.callout_info}}
CockroachDB also supports _locality-aware backups_, which allow you to partition and store backup data in a way that is optimized for locality. This means that nodes write backup data to the cloud storage bucket that is closest to the node's locality. This is helpful if you want to reduce network costs or have data domiciling needs. Refer to [Take and Restore Locality-aware Backups](take-and-restore-locality-aware-backups.html) for more detail.
{{site.data.alerts.end}}

{% include {{ page.version.version }}/backups/support-products.md %}

## Syntax

To specify the locality filter for the coordinating node, run `EXECUTION LOCALITY` with key-value pairs. The key-value pairs correspond to the [locality designations](cockroach-start.html#locality) a node is configured to use when it starts.

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP DATABASE {database} INTO 'external://backup_storage' WITH EXECUTION LOCALITY = 'region={region},cloud={cloud}';
~~~

When you run a backup that uses `EXECUTION LOCALITY`, consider the following:

- The backup job will fail if no nodes match the locality filter.
- The backup job may take slightly more time to start, because it must select the node that coordinates the backup (the _coordinating node_). Refer to [Job coordination using the `EXECUTION LOCALITY` option](#job-coordination-using-the-execution-locality-option).
- Even after a backup job has been pinned to a locality filter, it may still read data from another locality if no replicas of the data are available in the locality specified by the backup job's locality filter.
- If the job is created on a node that does not match the locality filter, you will receive an error even when the **job creation was successful**. This error indicates that the job execution moved to another node. To avoid this error when creating a manual job (as opposed to a [scheduled job](create-schedule-for-backup.html)), you can use the [`DETACHED`](backup.html#detached) option with `EXECUTION LOCALITY`. Then, use the [`SHOW JOB WHEN COMPLETE`](show-jobs.html#show-job-when-complete) statement to determine when the job has finished. For more details, refer to [Job coordination using the `EXECUTION LOCALITY` option](#job-coordination-using-the-execution-locality-option).

## Job coordination using the `EXECUTION LOCALITY` option

When you start or [resume](resume-job.html) a backup with `EXECUTION LOCALITY`, the backup job must determine the [coordinating node for the job](backup-architecture.html#job-creation-phase). If a node that does not match the locality filter is the first node to claim the job, the node is responsible for finding a node that does match the filter and transferring the execution to it. This transfer can result in a short delay in starting or resuming a backup job that has execution locality requirements.

If you create a backup job on a [gateway node](architecture/sql-layer.html#overview) with a locality filter that does **not** meet the filter requirement in `EXECUTION LOCALITY`, and the job does not use the [`DETACHED`](backup.html#detached) option, the job will return an error indicating that it moved execution to another node. This error is returned because when you create a job without the [`DETACHED`](backup.html#detached) option, the [job execution](backup-architecture.html#resolution-phase) must run to completion by the gateway node while it is still attached to the SQL client to return the result. 

Once the coordinating node is determined, it will [assign chunks of row data](backup-architecture.html#resolution-phase) to eligible nodes, and each node reads its assigned row data and backs it up. The coordinator will assign row data only to those nodes that match the backup job's the locality filter in full. The following situations could occur:

- If the [leaseholder](architecture/reads-and-writes-overview.html#architecture-leaseholder) for part of the row data matches the filter, the coordinator will assign it the matching row data to process. 
- If the leaseholder does not match the locality filter, the coordinator will select a node from the eligible nodes with a preference for those with localities that are closest to the leaseholder.

When the coordinator assigns row data to a node matching the locality filter to back up, that node will read from the closest [replica](architecture/reads-and-writes-overview.html#architecture-replica). If the node is the leaseholder, or is itself a replica, it can read from itself. In the scenario where no replicas are available in the region of the assigned node, it may then read from a replica in a different region. As a result, you may want to consider [placing replicas](configure-replication-zones.html), including potentially non-voting replicas that will have less impact on read latency, in the locality or region you plan on pinning for backup job execution.

For an overview of the backup job phases, refer to the [Backup Architecture](backup-architecture.html) page.

## Examples

This section outlines some example uses of the `EXECUTION LOCALITY` option.

### Access backup storage restricted by network rules

For security or other reasons, a cluster may be subject to network rules across regions or to other locality requirements. For example, if you have a requirement that only nodes within the same region as the backup [cloud storage](use-cloud-storage.html) location can access the storage bucket, you can configure the backup job's `EXECUTION LOCALITY` to execute only on nodes with network access to the bucket.

The following diagram shows a CockroachDB cluster where each of the nodes can communicate with each other through a specific port, but any other network traffic between regions is blocked. Leaseholders in regions that do not match the cloud storage region (Node 2) cannot access the storage to [export backup data](backup-architecture.html#export-phase). 

Instead, Node 3's locality does match the backup job's `EXECUTION LOCALITY`. Leaseholders and replicas that match a backup job's locality designation and hold the backup job's row data will begin reading and exporting to cloud storage.

<img src="{{ 'images/v23.1/network-restriction.png' | relative_url }}" alt="Using execution locality when there is a network restriction between locality requirements" style="border:0px solid #eee;max-width:100%" />

To execute the backup only on nodes in the same region as the cloud storage location, you can specify [locality filters](cockroach-start.html#locality) that a node must match to take part in the backup job's execution.

For example, you can pin the execution of the backup job to `us-west-1`: 

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP DATABASE {database} INTO 'external://backup_storage_uswest' WITH EXECUTION LOCALITY = 'region=us-west-1', DETACHED;
~~~

Refer to the [`BACKUP`](backup.html) page for further detail on other parameters and options. 

### Create a non-primary region for backup jobs

Sometimes the execution of backup jobs can consume considerable resources when running [frequent full and incremental backups simultaneously](create-schedule-for-backup.html). One approach to minimize the impact of running background jobs on foreground application traffic is to restrict the execution of backup jobs to a designated subset of nodes that are not also serving application traffic.

This diagram shows a CockroachDB cluster in four regions. The node used to run the backup job was configured with [non-voting replicas](architecture/replication-layer.html#non-voting-replicas) to provide low-latency reads. The node in this region will complete the backup job coordination and data export to cloud storage.

<img src="{{ 'images/v23.1/background-work.png' | relative_url }}" alt="Using execution locality to create a non-primary region for backup jobs" style="border:0px solid #eee;max-width:100%" />

For details, refer to:

- The [`--locality`](cockroach-start.html#locality) flag to specify the locality tiers that describe the location of a node.
- The `num_voters` and `voter_constraints` variables on the [Configure Replication Zones](configure-replication-zones.html#num_voters) page to configure non-voting replicas via zone configurations.

After configuring the nodes in a specific region to use non-voting replicas, you can create the backup job and define its locality requirement for the nodes:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP DATABASE {database} INTO 'external://backup_storage' WITH EXECUTION LOCALITY = 'region={region},dc={datacenter}', DETACHED;
~~~

## See also

- [Backup and Restore Overview](backup-and-restore-overview.html)
- [Backup Architecture](backup-architecture.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)