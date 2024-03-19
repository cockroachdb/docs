---
title: Backup and Restore in CockroachDB Cloud Overview
summary: An overview of backup and restore for CockroachDB Cloud.
toc: true
---

CockroachDB is built to be [fault-tolerant through automatic recovery](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/demo-fault-tolerance-and-recovery), but unforeseen disasters can happen. Backup and restore is an important part of a resilient disaster recovery plan. CockroachDB Cloud clusters run routine _managed-service backups_ to Cockroach Labs' cloud storage. Additionally, you can also manually create _customer-owned backups_ using [CockroachDB's backup features](#backup-and-restore-support).

## CockroachDB Cloud backups

CockroachDB Cloud clusters can run two types of backups:

- Automated [managed-service backups](#managed-service-backups)
- Manual [customer-owned backups](#customer-owned-backups)

### Managed-service backups

Cockroach Labs takes automated backups of CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }} clusters that are stored in Cockroach Labs' cloud storage. This table outlines how frequently CockroachDB {{ site.data.products.cloud }} clusters run automated backups and the retention period for each type of backup:

{% include cockroachcloud/backups/managed-service-backups-frequency.md %}

You can interact with managed-service backups through the **Backup and Restore** menu in the Cloud Console. Refer to [Use Managed-Service Backups]({% link cockroachcloud/use-managed-service-backups.md %}) for instructions on using the Cloud console to work with managed-service backups for both CockroachDB {{ site.data.products.cloud }} clusters.

{{site.data.alerts.callout_info}}
Once a cluster is deleted, Cockroach Labs retains the full backups for 30 days and incremental backups for 7 days. The retained backups are not available for restore using the Cloud Console. To restore a backup from a deleted cluster, you must contact the [Cockroach Labs Support team](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/support-resources). If an organization is deleted, you will lose access to all of the managed-service backups that Cockroach Labs has taken of the cluster.
{{site.data.alerts.end}}

### Customer-owned backups

You can take manual backups and store them in your [cloud storage buckets](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-cloud-storage) using the [`BACKUP`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/backup) statement. Customer-owned backups are supported in CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }}. Refer to the [Backup and restore support](#backup-and-restore-support) table for a list of the types of manual backups that are available.

## Backup and restore support

<table border="1">
  <thead>
    <tr>
      <th>Backup / Restore</th>
      <th>Description</th>
      <th>CockroachDB Cloud support</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-full-and-incremental-backups#full-backups">Full backup</a>
      </td>
      <td>An un-replicated copy of your cluster, database, or table's data. A full backup is the base for any further backups.</td>
      <td>
        <ul>
          <li>Managed-service backups in CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }}.</li>
          <li>Customer-owned backups in CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }}.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-full-and-incremental-backups#incremental-backups">Incremental backup</a>
      </td>
      <td>A copy of the changes in your data since the specified base backup (either a full backup or a full backup plus an incremental backup).</td>
      <td>
        <ul>
          <li>Managed-service backups in CockroachDB {{ site.data.products.dedicated }}.</li>
          <li>Customer-owned backups in CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }}.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/manage-a-backup-schedule">Scheduled backup</a>
      </td>
      <td>A schedule for periodic backups.</td>
      <td>
        <ul>
          <li>Customer-owned backups in CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }}.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-backups-with-revision-history-and-restore-from-a-point-in-time">Backups with revision history</a>
      </td>
      <td>A backup with revision history allows you to back up every change made within the garbage collection period leading up to and including the given timestamp.</td>
      <td>
        <ul>
          <li>Customer-owned backups in CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }}.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-backups-with-revision-history-and-restore-from-a-point-in-time">Point-in-time restore</a>
      </td>
      <td>A restore from an arbitrary point in time within the revision history of a backup.</td>
      <td>
        <ul>
          <li>Customer-owned backups in CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }}.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-and-restore-encrypted-backups">Encrypted backup and restore</a>
      </td>
      <td>An encrypted backup using a KMS or passphrase.</td>
      <td>
        <ul>
          <li>Customer-owned backups in CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }}.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-and-restore-locality-aware-backups">Locality-aware backup and restore</a>
      </td>
      <td>A backup where each node writes files to the backup destination that matches the node locality configured at node startup.</td>
      <td>
        <ul>
          <li>Customer-owned backups in CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }}.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <a href="https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-locality-restricted-backups">Locality-restricted backup execution</a>
      </td>
      <td>A backup with the <code>EXECUTION LOCALITY</code> option restricts the nodes that can execute a backup job with a defined locality filter.</td>
      <td>
        <ul>
          <li>Customer-owned backups in CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }}.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

## Get started with customer-owned backups

The following sections outline some of the features and resources for taking backups to your own storage bucket. For more practical examples, refer to the [Take and Restore Customer-Owned Backups]({% link cockroachcloud/take-and-restore-customer-owned-backups.md %}) page and the [Video demo](#video-demo).

### Scheduled backups

{% include cockroachcloud/backups/scheduled-backups-tip.md %}

CockroachDB supports [creating schedules for periodic backups](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/create-schedule-for-backup). Scheduled backups ensure that the data to be backed up is protected from garbage collection until it has been successfully backed up. This active management of [protected timestamps](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/architecture/storage-layer#protected-timestamps) means that you can run scheduled backups at a cadence independent from the [GC TTL](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/configure-replication-zones#gc-ttlseconds) of the data.

For detail on scheduled backup features CockroachDB supports:

- [Set up monitoring for the backup schedule](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/manage-a-backup-schedule#set-up-monitoring-for-the-backup-schedule)
- [View](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/manage-a-backup-schedule#view-the-schedule), [pause](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/manage-a-backup-schedule#pause-the-schedule), [resume](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/manage-a-backup-schedule#resume-the-schedule), or [drop](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/manage-a-backup-schedule#drop-the-schedule) the schedule.

### Backup and restore SQL statements

The following table outlines SQL statements you can use to create, configure, pause, and show backup and restore jobs:

 SQL Statement  | Description
----------------|---------------------------------------------------------------------------------------------
[`BACKUP`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/backup)       | Create full and incremental backups.
[`SHOW JOBS`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/show-jobs)    | Show a list of all running jobs or show the details of a specific job by its `job ID`.
[`PAUSE JOB`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/pause-job)    | Pause a backup or restore job with its `job ID`.
[`RESUME JOB`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/resume-job)   | Resume a backup or restore job with its `job ID`.
[`CANCEL JOB`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cancel-job)   | Cancel a backup or restore job with its `job ID`.
[`SHOW BACKUP`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/show-backup)  | Show a backup's details at the [backup collection's](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-full-and-incremental-backups#backup-collections) storage location.
[`RESTORE`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/restore)      | Restore full and incremental backups.
[`ALTER BACKUP`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/alter-backup) | Add a new [KMS encryption key](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-and-restore-encrypted-backups#use-key-management-service) to an encrypted backup.
[`CREATE SCHEDULE FOR BACKUP`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/create-schedule-for-backup) | Create a schedule for periodic backups.
[`ALTER BACKUP SCHEDULE`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/alter-backup-schedule) | Alter an existing backup schedule.
[`SHOW SCHEDULES`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/show-schedules) | View information on backup schedules.
[`PAUSE SCHEDULES`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/pause-schedules) | Pause backup schedules.
[`RESUME SCHEDULES`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/resume-schedules) | Resume paused backup schedules.
[`DROP SCHEDULES`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/drop-schedules) | Drop backup schedules.

### Backup storage

We recommend taking backups to [cloud storage](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-cloud-storage) and enabling object locking to protect the validity of your backups. CockroachDB supports Amazon S3, Azure Storage, and Google Cloud Storage for backups. Read the following usage information:

- [Example file URLs](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-cloud-storage#example-file-urls) to form the URL that you pass to `BACKUP` and `RESTORE` statements.
- [Authentication](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cloud-storage-authentication) to set up authentication to a cloud storage bucket and include those credentials in the URL.

For detail on additional cloud storage features CockroachDB supports:

- Prevent backups from being overwritten or deleted with [immutable storage buckets](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-cloud-storage#immutable-storage).
- Set a specific storage class for your backups with [Storage Class (AWS S3 only)](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-cloud-storage#amazon-s3-storage-classes).
- [Expire past backups](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/expire-past-backups) from cloud storage.

{% include cockroachcloud/note-egress-perimeter-cdc-backup.md %}

### Backup and restore observability

You can verify that your stored backups are restorable with backup validation. While a successful restore completely validates a backup, the validation tools offer a faster alternative and return an error message if a backup is not valid. There are three "levels" of verifying backups that give increasing validation coverage depending on the amount of runtime you want to invest in validating backups.

Refer to the [Backup Validation](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/backup-validation) page for detail and examples.

You can track backup jobs using metrics that cover scheduled backups, status of running jobs, and details on completed or failed jobs. Depending on your CockroachDB {{ site.data.products.cloud }} deployment, you can track these metrics with:

- Prometheus: Dedicated
- Datadog: Dedicated
- Cloud Console Metrics page: Serverless, Dedicated

### Backup jobs with locality requirements

CockroachDB supports two backup features that use a node's locality to determine how a backup job runs or where the backup data is stored:

- [Locality-restricted backup execution](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-locality-restricted-backups): Specify a set of locality filters for a backup job in order to restrict the nodes that can participate in the backup process to that locality. This ensures that the backup job is executed by nodes that meet certain requirements, such as being located in a specific region or having access to a certain storage bucket.
- [Locality-aware backup](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-and-restore-locality-aware-backups): Partition and store backup data in a way that is optimized for locality. When you run a locality-aware backup, nodes write backup data to the [cloud storage](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-cloud-storage) bucket that is closest to the node locality configured at [node startup](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-start).

{{site.data.alerts.callout_info}}
{% include {{ site.current_cloud_version }}/backups/serverless-locality-aware.md %}
{{site.data.alerts.end}}

## Video demo

For practical examples of running backup and restore jobs, watch the following video:

{% include_cached youtube.html video_id="t_ocOi_iYQ8" %}

## See also

- Considerations for using [backup](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/backup#considerations) and [restore](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/restore#considerations).
- [Backup collections](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-full-and-incremental-backups#backup-collections) for details on how CockroachDB stores backups.
- [Restoring backups](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/restoring-backups-across-versions) across major versions of CockroachDB.