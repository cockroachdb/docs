---
title: Backup and Restore Overview
summary: An overview of features in backup and restore at CockroachDB.
toc: true
docs_area: manage
---

CockroachDB is built to be [fault-tolerant with automatic recovery]({% link {{ page.version.version }}/demo-cockroachdb-resilience.md %}), but sometimes disasters happen. Backup and restore is an important part of a robust disaster recovery plan. CockroachDB {{ site.data.products.core }} clusters provide a range of [backup and restore features](#backup-and-restore-support).

- [Backup and restore support](#backup-and-restore-support)
  - [Additional backup and restore features](#additional-backup-and-restore-features)
- [Scheduled backups](#scheduled-backups)
- [Backup jobs with locality requirements](#backup-jobs-with-locality-requirements)
- [Backup and restore SQL statements](#backup-and-restore-sql-statements)
- [Backup storage](#backup-storage)
- [Backup and restore observability](#backup-and-restore-observability)
- [Video demo](#video-demo)
- [See also](#see-also)

You can create full or incremental backups of a [cluster]({% link {{ page.version.version }}/backup.md %}#back-up-a-cluster), [database]({% link {{ page.version.version }}/backup.md %}#back-up-a-database), or [table]({% link {{ page.version.version }}/backup.md %}#back-up-a-table-or-view). Taking regular backups of your data is an operational best practice.

For a technical explanation of how a backup works, refer to the [Backup Architecture]({% link {{ page.version.version }}/backup-architecture.md %}) page.

## Backup and restore support

This table outlines the level of product support for backup and restore features in CockroachDB. See each of the pages linked in the table for usage examples:

<table border="1">
  <thead>
    <tr>
      <th>Backup / Restore</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <a href="{% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups">Full backup</a>
      </td>
      <td>An un-replicated copy of your cluster, database, or table's data. A full backup is the base for any further backups.</td>
    </tr>
    <tr>
      <td>
        <a href="{% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#incremental-backups">Incremental backup</a>
      </td>
      <td>A copy of the changes in your data since the specified base backup (either a full backup or a full backup plus an incremental backup).</td>
    </tr>
    <tr>
      <td>
        <a href="{% link {{ page.version.version }}/manage-a-backup-schedule.md %}">Scheduled backup</a>
      </td>
      <td>A schedule for periodic backups.</td>
    </tr>
    <tr>
      <td>
        <a href="{% link {{ page.version.version }}/take-backups-with-revision-history-and-restore-from-a-point-in-time.md %}">Backups with revision history</a>
      </td>
      <td>A backup with revision history allows you to back up every change made within the garbage collection period leading up to and including the given timestamp.</td>
    </tr>
    <tr>
      <td>
        <a href="{% link {{ page.version.version }}/take-backups-with-revision-history-and-restore-from-a-point-in-time.md %}">Point-in-time restore</a>
      </td>
      <td>A restore from an arbitrary point in time within the revision history of a backup.</td>
    </tr>
    <tr>
      <td>
        <a href="{% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %}">Encrypted backup and restore</a>
      </td>
      <td>An encrypted backup using a KMS or passphrase.</td>
    </tr>
    <tr>
      <td>
        <a href="{% link {{ page.version.version }}/take-and-restore-locality-aware-backups.md %}">Locality-aware backup and restore</a>
      </td>
      <td>A backup where each node writes files to the backup destination that matches the node locality configured at node startup.</td>
    </tr>
    <tr>
      <td>
        <a href="{% link {{ page.version.version }}/take-locality-restricted-backups.md %}">Locality-restricted backup execution</a>
      </td>
      <td>A backup with the <code>EXECUTION LOCALITY</code> option restricts the nodes that can execute a backup job with a defined locality filter.</td>
    </tr>
  </tbody>
</table>

### Additional backup and restore features

- [Incremental backups with explicitly specified destinations]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#incremental-backups-with-explicitly-specified-destinations)
- [Exclude a table's data from backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#exclude-a-tables-data-from-backups)

## Scheduled backups

{% include {{ page.version.version }}/backups/scheduled-backups-tip.md %}

CockroachDB supports [creating schedules for periodic backups]({% link {{ page.version.version }}/create-schedule-for-backup.md %}). Scheduled backups ensure that the data to be backed up is protected from garbage collection until it has been successfully backed up. This active management of [protected timestamps]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) means that you can run scheduled backups at a cadence independent from the [GC TTL]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds) of the data.

For detail on scheduled backup features CockroachDB supports:

- [Set up monitoring for the backup schedule]({% link {{ page.version.version }}/manage-a-backup-schedule.md %}#set-up-monitoring-for-the-backup-schedule)
- [View]({% link {{ page.version.version }}/manage-a-backup-schedule.md %}#view-the-schedule), [pause]({% link {{ page.version.version }}/manage-a-backup-schedule.md %}#pause-the-schedule), [resume]({% link {{ page.version.version }}/manage-a-backup-schedule.md %}#resume-the-schedule), or [drop]({% link {{ page.version.version }}/manage-a-backup-schedule.md %}#drop-the-schedule) the schedule

## Backup jobs with locality requirements

CockroachDB supports two backup features that use a node's locality to determine how a backup job runs or where the backup data is stored:

- [Locality-restricted backup execution]({% link {{ page.version.version }}/take-locality-restricted-backups.md %}): Specify a set of locality filters for a backup job in order to restrict the nodes that can participate in the backup process to that locality. This ensures that the backup job is executed by nodes that meet certain requirements, such as being located in a specific region or having access to a certain storage bucket.
- [Locality-aware backup]({% link {{ page.version.version }}/take-and-restore-locality-aware-backups.md %}): Partition and store backup data in a way that is optimized for locality. When you run a locality-aware backup, nodes write backup data to the [cloud storage]({% link {{ page.version.version }}/use-cloud-storage.md %}) bucket that is closest to the node locality configured at [node startup]({% link {{ page.version.version }}/cockroach-start.md %}).

## Backup and restore SQL statements

The following table outlines SQL statements you can use to create, configure, pause, and show backup and restore jobs:

 SQL Statement  | Description
----------------|---------------------------------------------------------------------------------------------
[`BACKUP`]({% link {{ page.version.version }}/backup.md %})       | Create full and incremental backups.
[`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %})    | Show a list of all running jobs or show the details of a specific job by its `job ID`.
[`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %})    | Pause a backup or restore job with its `job ID`.
[`RESUME JOB`]({% link {{ page.version.version }}/resume-job.md %})   | Resume a backup or restore job with its `job ID`.
[`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %})   | Cancel a backup or restore job with its `job ID`.
[`SHOW BACKUP`]({% link {{ page.version.version }}/show-backup.md %})  | Show a backup's details at the [backup collection's]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#backup-collections) storage location.
[`RESTORE`]({% link {{ page.version.version }}/restore.md %})      | Restore full and incremental backups.
[`ALTER BACKUP`]({% link {{ page.version.version }}/alter-backup.md %}) | Add a new [KMS encryption key]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %}#use-key-management-service) to an encrypted backup.
[`CREATE SCHEDULE FOR BACKUP`]({% link {{ page.version.version }}/create-schedule-for-backup.md %}) | Create a schedule for periodic backups.
[`ALTER BACKUP SCHEDULE`]({% link {{ page.version.version }}/alter-backup-schedule.md %}) | Alter an existing backup schedule.
[`SHOW SCHEDULES`]({% link {{ page.version.version }}/show-schedules.md %}) | View information on backup schedules.
[`PAUSE SCHEDULES`]({% link {{ page.version.version }}/pause-schedules.md %}) | Pause backup schedules.
[`RESUME SCHEDULES`]({% link {{ page.version.version }}/resume-schedules.md %}) | Resume paused backup schedules.
[`DROP SCHEDULES`]({% link {{ page.version.version }}/drop-schedules.md %}) | Drop backup schedules.

## Backup storage

We recommend taking backups to [cloud storage]({% link {{ page.version.version }}/use-cloud-storage.md %}) and enabling object locking to protect the validity of your backups. CockroachDB supports Amazon S3, Azure Storage, and Google Cloud Storage for backups. Read the following usage information:

- [Example file URLs]({% link {{ page.version.version }}/use-cloud-storage.md %}#example-file-urls) to form the URL that you pass to `BACKUP` and `RESTORE` statements.
- [Authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}) to set up authentication to a cloud storage bucket and include those credentials in the URL.

{% include common/s3-support-notice.md %}

For detail on additional cloud storage features CockroachDB supports:

- Prevent backups from being overwritten or deleted with [immutable storage buckets]({% link {{ page.version.version }}/use-cloud-storage.md %}#immutable-storage).
- Set a specific storage class for your backups with [Storage Class (AWS S3 only)]({% link {{ page.version.version }}/use-cloud-storage.md %}#amazon-s3-storage-classes).
- [Expire past backups]({% link {{ page.version.version }}/expire-past-backups.md %}) from cloud storage

## Backup and restore observability

You can verify that your stored backups are restorable with backup validation. While a successful restore completely validates a backup, the validation tools offer a faster alternative and return an error message if a backup is not valid. There are three "levels" of verifying backups that give increasing validation coverage depending on the amount of runtime you want to invest in validating backups.

See the [Backup Validation]({% link {{ page.version.version }}/backup-validation.md %}) page for detail and examples.

You can track backup jobs using metrics that cover scheduled backups, status of running jobs, and details on completed or failed jobs. You can alert on these metrics via the Prometheus endpoint or the Datadog integration.

See the [Backup and Restore Monitoring]({% link {{ page.version.version }}/backup-and-restore-monitoring.md %}) page for product availability and a list of the available metrics.

## Video demo

For practical examples of running backup and restore jobs, watch the following video:

{% include_cached youtube.html video_id="t_ocOi_iYQ8" %}

## See also

- Considerations for using [backup]({% link {{ page.version.version }}/backup.md %}#considerations) and [restore]({% link {{ page.version.version }}/restore.md %}#considerations).
- [Backup collections]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#backup-collections) for details on how CockroachDB stores backups.
- [Restoring backups]({% link {{ page.version.version }}/restoring-backups-across-versions.md %}) across major versions of CockroachDB.
