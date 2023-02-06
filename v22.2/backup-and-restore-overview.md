---
title: Backup and Restore Overview
summary: An overview of features in backup and restore at CockroachDB.
toc: true
docs_area: manage
---

This page provides an overview of the backup and restore features available in CockroachDB:

- [Types of backups supported](#cockroachdb-cloud-backup-types) in {{ site.data.products.db }} 
- [Backup and restore product support](#backup-and-restore-product-support)
- [SQL statements](#backup-and-restore-sql-statements) for working with backups and restores
- [Storage](#backup-storage) for backups

You can create full or incremental backups of a [cluster](backup.html#backup-a-cluster), [database](backup.html#backup-a-database), or [table](backup.html#backup-a-table-or-view). Taking regular backups of your data is an operational best practice.

For an explanation of how a backup works, see [Backup Architecture](backup-architecture.html).

## {{ site.data.products.db }} backup types

{% include cockroachcloud/ccloud/backup-types.md %} 

## Backup and restore product support

This table outlines the level of product support for backup and restore features in CockroachDB. See each of the pages linked in the table for usage examples:

Backup / Restore  | Description  | Product Support 
------------------+--------------+-----------------
[Full backup](take-full-and-incremental-backups.html) | An un-replicated copy of your cluster, database, or table's data. A full backup is the base for any further backups. | <ul><li>All products (Enterprise license not required)</li><ul>
[Incremental backup](take-full-and-incremental-backups.html) | A copy of the changes in your data since the specified base backup (either a full backup or a full backup plus an incremental backup). | <ul><li>{{ site.data.products.serverless }} — customer-owned backups</li><li>{{ site.data.products.dedicated }} — managed-service backups and customer-owned backups</li><li>{{ site.data.products.core }} with an [{{ site.data.products.enterprise }} license](enterprise-licensing.html)</li><ul>
[Scheduled backup](manage-a-backup-schedule.html) | A schedule for periodic backups. | <ul><li>{{ site.data.products.serverless }} — customer-owned backups</li><li>{{ site.data.products.dedicated }} — customer-owned backups</li><li>{{ site.data.products.core }} with an [{{ site.data.products.enterprise }} license](enterprise-licensing.html)</li><ul>
[Backups with revision history](take-backups-with-revision-history-and-restore-from-a-point-in-time.html) | A backup with revision history allows you to back up every change made within the garbage collection period leading up to and including the given timestamp. | <ul><li>{{ site.data.products.serverless }} — customer-owned backups</li><li>{{ site.data.products.dedicated }} — customer-owned backups</li><li>{{ site.data.products.core }} with an [{{ site.data.products.enterprise }} license](enterprise-licensing.html)</li><ul>
[Point-in-time restore](take-backups-with-revision-history-and-restore-from-a-point-in-time.html) | A restore from an arbitrary point in time within the revision history of a backup. | <ul><li>{{ site.data.products.serverless }} — customer-owned backups</li><li>{{ site.data.products.dedicated }} — customer-owned backups</li><li>{{ site.data.products.core }} with an [{{ site.data.products.enterprise }} license](enterprise-licensing.html)</li><ul>
[Encrypted backup and restore](take-and-restore-encrypted-backups.html) | An encrypted backup using a KMS or passphrase. | <ul><li>{{ site.data.products.serverless }} — customer-owned backups</li><li>{{ site.data.products.dedicated }} — customer-owned backups</li><li>{{ site.data.products.core }} with an [{{ site.data.products.enterprise }} license](enterprise-licensing.html)</li><ul>
[Locality-aware backup and restore](take-and-restore-locality-aware-backups.html) | A backup where each node writes files only to the backup destination that matches the node locality configured at node startup. | <ul><li>{{ site.data.products.serverless }} — customer-owned backups</li><li>{{ site.data.products.dedicated }} — customer-owned backups</li><li>{{ site.data.products.core }} with an [{{ site.data.products.enterprise }} license](enterprise-licensing.html)</li><ul> 

{% include {{ page.version.version }}/backups/scheduled-backups-tip.md %}

## Backup and restore SQL statements

The following table outlines SQL statements you can use to create, configure, pause, and show backup and restore jobs:

 SQL Statement  | Description                                                                                 
----------------|---------------------------------------------------------------------------------------------
[`BACKUP`](backup.html)       | Create full and incremental backups.
[`SHOW JOBS`](show-jobs.html)    | Show a list of all running jobs or show the details of a specific job by its `job ID`.
[`PAUSE JOB`](pause-job.html)    | Pause a backup or restore job with its `job ID`.
[`RESUME JOB`](resume-job.html)   | Resume a backup or restore job with its `job ID`.  
[`CANCEL JOB`](cancel-job.html)   | Cancel a backup or restore job with its `job ID`.
[`SHOW BACKUP`](show-backup.html)  | Show a backup's details at the [backup collection's](take-full-and-incremental-backups.html#backup-collections) storage location.     
[`RESTORE`](restore.html)      | Restore full and incremental backups.
[`ALTER BACKUP`](alter-backup.html) | Add a new [KMS encryption key](take-and-restore-encrypted-backups.html#use-key-management-service) to an encrypted backup.
[`CREATE SCHEDULE FOR BACKUP`](create-schedule-for-backup.html) | Create a schedule for periodic backups.
[`ALTER BACKUP SCHEDULE`](alter-backup-schedule.html) | Alter an existing backup schedule.
[`SHOW SCHEDULES`](show-schedules.html) | View information on backup schedules.
[`PAUSE SCHEDULES`](pause-schedules.html) | Pause backup schedules.
[`RESUME SCHEDULES`](resume-schedules.html) | Resume paused backup schedules.
[`DROP SCHEDULES`](drop-schedules.html) | Drop backup schedules.

## Backup storage

We recommend taking backups to [cloud storage](use-cloud-storage-for-bulk-operations.html) and enabling object locking to protect the validity of your backups. CockroachDB supports Amazon S3, Azure Storage, and Google Cloud Storage for backups. Read the following usage information:

- [Example file URLs](use-cloud-storage-for-bulk-operations.html#example-file-urls) to form the URL that you pass to `BACKUP` and `RESTORE` statements.
- [Authentication](cloud-storage-authentication.html) to set up authentication to a cloud storage bucket and include those credentials in the URL.

For detail on additional cloud storage features CockroachDB supports:

- [Object locking](use-cloud-storage-for-bulk-operations.html#object-locking) to prevent backups from being overwritten or deleted.
- [Storage Class (AWS S3 only)](use-cloud-storage-for-bulk-operations.html#amazon-s3-storage-classes) to set a specific storage class for your backups.

{% include {{ page.version.version }}/misc/note-egress-perimeter-cdc-backup.md %}

## See also

- Considerations for using [backup](backup.html#considerations) and [restore](restore.html#considerations)
- [Backup collections](take-full-and-incremental-backups.html#backup-collections) for details on how CockroachDB stores backups
