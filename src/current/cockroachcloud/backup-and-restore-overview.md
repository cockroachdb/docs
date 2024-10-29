---
title: Backup and Restore in CockroachDB Cloud Overview
summary: An overview of backup and restore for CockroachDB Cloud.
toc: true
---

CockroachDB is built to be [fault-tolerant through automatic recovery]({% link {{site.current_cloud_version}}/demo-cockroachdb-resilience.md %}), but unforeseen disasters can happen. Backup and restore is an important part of a resilient disaster recovery plan. CockroachDB Cloud clusters run routine _managed backups_ that are stored by Cockroach Labs in cloud storage. Additionally, you can also manually create _self-managed backups_ using [CockroachDB's backup features](#get-started-with-self-managed-backups).

## CockroachDB Cloud backups

CockroachDB Cloud clusters can run two types of backups:

- Automated [managed backups](#managed-backups)
- Manual [self-managed backups](#self-managed-backups)

### Managed backups

{% include cockroachcloud/backups/managed-backup-description.md %} For details on the available settings for each cluster tier, refer to [Managed backup settings]({% link cockroachcloud/managed-backups.md %}#managed-backup-settings).

You can view and configure managed backups through the **Backup and Restore** menu in the Cloud Console and with the [CockroachDB Cloud API]({% link cockroachcloud/cloud-api.md %}).

{{site.data.alerts.callout_info}}
{% include cockroachcloud/backups/retention-deleted-cluster.md %}
{{site.data.alerts.end}}

### Self-managed backups

You can take manual backups and store them in your [cloud storage buckets]({% link {{site.current_cloud_version}}/use-cloud-storage.md %}) using the [`BACKUP`]({% link {{site.current_cloud_version}}/backup.md %}) statement. Self-managed backups are supported in all CockroachDB {{ site.data.products.cloud }} products. For a list of backup features that are available, refer to the following section [Get started with self-managed backups](#get-started-with-self-managed-backups).

## Get started with self-managed backups

The following sections outline some of the features and resources for taking backups to your own storage bucket. For more practical examples, refer to the [Take and Restore Self-Managed Backups]({% link cockroachcloud/take-and-restore-self-managed-backups.md %}) page and the [Video demo](#video-demo).

You can run the following types of self-managed backups:

- [Full backup]({% link {{site.current_cloud_version}}/take-full-and-incremental-backups.md %}#full-backups): An un-replicated copy of your cluster, database, or table's data. A full backup is the base for any further backups.
- [Incremental backup]({% link {{site.current_cloud_version}}/take-full-and-incremental-backups.md %}#incremental-backups): A copy of the changes in your data since the specified base backup (either a full backup or a full backup plus an incremental backup).
- [Scheduled backup]({% link {{site.current_cloud_version}}/manage-a-backup-schedule.md %}): A schedule for periodic backups.
- [Backup with revision history]({% link {{site.current_cloud_version}}/take-backups-with-revision-history-and-restore-from-a-point-in-time.md %}): A backup with revision history allows you to back up every change made within the garbage collection period leading up to and including the given timestamp.
- [Point-in-time restore]({% link {{site.current_cloud_version}}/take-backups-with-revision-history-and-restore-from-a-point-in-time.md %}): A restore from an arbitrary point in time within the revision history of a backup.
- [Encrypted backup and restore]({% link {{site.current_cloud_version}}/take-and-restore-encrypted-backups.md %}): An encrypted backup using a KMS or passphrase.
- [Locality-aware backup]({% link {{site.current_cloud_version}}/take-and-restore-locality-aware-backups.md %}): A backup where each node writes files to the backup destination that matches the node locality configured at node startup.
- [Locality-restricted backup execution]({% link {{site.current_cloud_version}}/take-locality-restricted-backups.md %}): A backup with the `EXECUTION LOCALITY` option restricts the nodes that can execute a backup job with a defined locality filter.

### Scheduled backups

{% include cockroachcloud/backups/scheduled-backups-tip.md %}

CockroachDB supports [creating schedules for periodic backups]({% link {{site.current_cloud_version}}/create-schedule-for-backup.md %}). Scheduled backups ensure that the data to be backed up is protected from garbage collection until it has been successfully backed up. This active management of [protected timestamps]({% link {{site.current_cloud_version}}/architecture/storage-layer.md %}#protected-timestamps) means that you can run scheduled backups at a cadence independent from the [GC TTL]({% link {{site.current_cloud_version}}/configure-replication-zones.md %}#gc-ttlseconds) of the data.

For detail on scheduled backup features CockroachDB supports:

- [Set up monitoring for the backup schedule]({% link {{site.current_cloud_version}}/manage-a-backup-schedule.md %}#set-up-monitoring-for-the-backup-schedule)
- [View]({% link {{site.current_cloud_version}}/manage-a-backup-schedule.md %}#view-the-schedule), [pause]({% link {{site.current_cloud_version}}/manage-a-backup-schedule.md %}#pause-the-schedule), [resume]({% link {{site.current_cloud_version}}/manage-a-backup-schedule.md %}#resume-the-schedule), or [drop]({% link {{site.current_cloud_version}}/manage-a-backup-schedule.md %}#drop-the-schedule) the schedule.

### Backup and restore SQL statements

The following table outlines SQL statements you can use to create, configure, pause, and show backup and restore jobs:

 SQL Statement  | Description
----------------|---------------------------------------------------------------------------------------------
[`BACKUP`]({% link {{site.current_cloud_version}}/backup.md %})       | Create full and incremental backups.
[`SHOW JOBS`]({% link {{site.current_cloud_version}}/show-jobs.md %})    | Show a list of all running jobs or show the details of a specific job by its `job ID`.
[`PAUSE JOB`]({% link {{site.current_cloud_version}}/pause-job.md %})    | Pause a backup or restore job with its `job ID`.
[`RESUME JOB`]({% link {{site.current_cloud_version}}/resume-job.md %})   | Resume a backup or restore job with its `job ID`.
[`CANCEL JOB`]({% link {{site.current_cloud_version}}/cancel-job.md %})   | Cancel a backup or restore job with its `job ID`.
[`SHOW BACKUP`]({% link {{site.current_cloud_version}}/show-backup.md %})  | Show a backup's details at the [backup collection's]({% link {{site.current_cloud_version}}/take-full-and-incremental-backups.md %}#backup-collections) storage location.
[`RESTORE`]({% link {{site.current_cloud_version}}/restore.md %})      | Restore full and incremental backups.
[`ALTER BACKUP`]({% link {{site.current_cloud_version}}/alter-backup.md %}) | Add a new [KMS encryption key]({% link {{site.current_cloud_version}}/take-and-restore-encrypted-backups.md %}#use-key-management-service) to an encrypted backup.
[`CREATE SCHEDULE FOR BACKUP`]({% link {{site.current_cloud_version}}/create-schedule-for-backup.md %}) | Create a schedule for periodic backups.
[`ALTER BACKUP SCHEDULE`]({% link {{site.current_cloud_version}}/alter-backup-schedule.md %}) | Alter an existing backup schedule.
[`SHOW SCHEDULES`]({% link {{site.current_cloud_version}}/show-schedules.md %}) | View information on backup schedules.
[`PAUSE SCHEDULES`]({% link {{site.current_cloud_version}}/pause-schedules.md %}) | Pause backup schedules.
[`RESUME SCHEDULES`]({% link {{site.current_cloud_version}}/resume-schedules.md %}) | Resume paused backup schedules.
[`DROP SCHEDULES`]({% link {{site.current_cloud_version}}/drop-schedules.md %}) | Drop backup schedules.

### Backup storage

We recommend taking backups to [cloud storage]({% link {{site.current_cloud_version}}/use-cloud-storage.md %}) and enabling object locking to protect the validity of your backups. CockroachDB supports Amazon S3, Azure Storage, and Google Cloud Storage for backups. Read the following usage information:

- [Example file URLs]({% link {{site.current_cloud_version}}/use-cloud-storage.md %}#example-file-urls) to form the URL that you pass to `BACKUP` and `RESTORE` statements.
- [Authentication]({% link {{site.current_cloud_version}}/cloud-storage-authentication.md %}) to set up authentication to a cloud storage bucket and include those credentials in the URL.

For detail on additional cloud storage features CockroachDB supports:

- Prevent backups from being overwritten or deleted with [immutable storage buckets]({% link {{site.current_cloud_version}}/use-cloud-storage.md %}#immutable-storage).
- Set a specific storage class for your backups with [Storage Class (AWS S3 only)]({% link {{site.current_cloud_version}}/use-cloud-storage.md %}#amazon-s3-storage-classes).
- [Expire past backups]({% link {{site.current_cloud_version}}/expire-past-backups.md %}) from cloud storage.

{% include cockroachcloud/note-egress-perimeter-cdc-backup.md %}

### Backup and restore observability

You can verify that your stored backups are restorable with backup validation. While a successful restore completely validates a backup, the validation tools offer a faster alternative and return an error message if a backup is not valid. There are three "levels" of verifying backups that give increasing validation coverage depending on the amount of runtime you want to invest in validating backups.

Refer to the [Backup Validation]({% link {{site.current_cloud_version}}/backup-validation.md %}) page for detail and examples.

You can track backup jobs using metrics that cover scheduled backups, status of running jobs, and details on completed or failed jobs. Depending on your CockroachDB {{ site.data.products.cloud }} deployment, you can track these metrics with:

|  | CockroachDB Standard | CockroachDB Advanced | CockroachDB Basic |
|-----------------------------|----------------------|----------------------|------|
| [Cloud Console Metrics page]({% link cockroachcloud/metrics.md %}#cockroachdb-cloud-console-metrics-page) | ✔ | ✔ | ✔ |
| [Prometheus]({% link cockroachcloud/backup-and-restore-monitoring.md %}#prometheus) | ✔ | ✔  |  |
| [Datadog]({% link cockroachcloud/backup-and-restore-monitoring.md %}#datadog) | ✔  | ✔  |  |

### Backup jobs with locality requirements

CockroachDB supports two backup features that use a node's locality to determine how a backup job runs or where the backup data is stored:

- [Locality-restricted backup execution]({% link {{site.current_cloud_version}}/take-locality-restricted-backups.md %}): Specify a set of locality filters for a backup job in order to restrict the nodes that can participate in the backup process to that locality. This ensures that the backup job is executed by nodes that meet certain requirements, such as being located in a specific region or having access to a certain storage bucket.
- [Locality-aware backup]({% link {{site.current_cloud_version}}/take-and-restore-locality-aware-backups.md %}): Partition and store backup data in a way that is optimized for locality. When you run a locality-aware backup, nodes write backup data to the [cloud storage]({% link {{site.current_cloud_version}}/use-cloud-storage.md %}) bucket that is closest to the node locality configured at [node startup]({% link {{site.current_cloud_version}}/cockroach-start.md %}).

{{site.data.alerts.callout_info}}
{% include cockroachcloud/backups/locality-aware-multi-tenant.md %}
{{site.data.alerts.end}}

## Video demo

For practical examples of running backup and restore jobs, watch the following video:

{% include_cached youtube.html video_id="t_ocOi_iYQ8" %}

## See also

- Considerations for using [backup]({% link {{site.current_cloud_version}}/backup.md %}#considerations) and [restore]({% link {{site.current_cloud_version}}/restore.md %}#considerations).
- [Backup collections]({% link {{site.current_cloud_version}}/take-full-and-incremental-backups.md %}#backup-collections) for details on how CockroachDB stores backups.
- [Restoring backups]({% link {{site.current_cloud_version}}/restoring-backups-across-versions.md %}) across major versions of CockroachDB.
