---
title: Backup and Restore Overview
summary: An overview of features in backup and restore at CockroachDB.
toc: true
docs_area: manage
---

This page provides an overview of the backup and restore features available in CockroachDB:

- The [types of backup and restore](#backup-and-restore-types) and their product availability
- [Storage](#backup-storage) for backups
- [SQL statements](#backup-and-restore-sql-statements) for working with backups and restores

You can create full or incremental backups of a [cluster](backup.html#backup-a-cluster), [database](backup.html#backup-a-database), or [table](backup.html#backup-a-table-or-view). Taking regular backups of your data is an operational best practice.

## Backup and restore types

The following table outlines the available backup and restore types in CockroachDB. See each of the pages linked in the table for usage examples:

| Backup / Restore Type             | Description                                                                                                                                                  | Product                                                                                                                                                                                                                                                                                    |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Full backup](take-full-and-incremental-backups.html)                       | An un-replicated copy of your cluster, database, or table's data. A full backup is the base for any further backups.                                         | All products
| [Incremental backup](take-full-and-incremental-backups.html)               | A copy of the changes in your data since the specified base backup (a full or full and incremental).                                                         | {{ site.data.products.dedicated }} or with an [{{ site.data.products.enterprise }} license](enterprise-licensing.html) in CockroachDB |
| [Backups with revision history](take-backups-with-revision-history-and-restore-from-a-point-in-time.html)     | A backup with revision history allows you to back up every change made within the garbage collection period leading up to and including the given timestamp. | {{ site.data.products.dedicated }} or with an [{{ site.data.products.enterprise }} license](enterprise-licensing.html) in CockroachDB                                                                                                                                      |
| [Point-in-time restore](take-backups-with-revision-history-and-restore-from-a-point-in-time.html)             | A restore from an arbitrary point in time within the revision history of a backup.                                                                           | {{ site.data.products.dedicated }} or with an [{{ site.data.products.enterprise }} license](enterprise-licensing.html) in CockroachDB   
| [Encrypted backup and restore](take-and-restore-encrypted-backups.html)      | An encrypted backup using a KMS or passphrase.                                                                                                               | {{ site.data.products.dedicated }} or with an [{{ site.data.products.enterprise }} license](enterprise-licensing.html) in CockroachDB |
| [Locality-aware backup and restore](take-and-restore-locality-aware-backups.html) | A backup where each node writes files only to the backup destination that matches the node locality configured at node startup.                              | {{ site.data.products.dedicated }} or with an [{{ site.data.products.enterprise }} license](enterprise-licensing.html) in CockroachDB.                                                                                                                                       |
| [Scheduled backup](manage-a-backup-schedule.html)                  | A schedule for periodic backups.                                                                                                                             | {{ site.data.products.dedicated }} or with an [{{ site.data.products.enterprise }} license](enterprise-licensing.html) in CockroachDB  
| [Automated Backups](../cockroachcloud/backups-page.html)                 | Cockroach Labs runs full backups daily and incremental backups hourly for every CockroachDB Cloud cluster.                                                   | {{ site.data.products.db }} clusters                                                                                                                                     

## Backup and restore SQL statements

The following table outlines SQL statements you can use to create, configure, pause, and show backup and restore jobs:

| SQL Statement  | Description                                                                                 |
|----------------|---------------------------------------------------------------------------------------------|
| [`ALTER BACKUP`](alter-backup.html) | Add a new [KMS encryption key](take-and-restore-encrypted-backups.html#use-key-management-service) to an encrypted backup.                                        |
| [`BACKUP`](backup.html)       | Create full and incremental backups.                                                        |
| [`CANCEL JOB`](cancel-job.html)   | Use with the `job ID` to cancel a backup or restore job.                                    |
| [`PAUSE JOB`](pause-job.html)    | Use with the `job ID` to pause a backup or restore job.                                     |
| [`RESTORE`](restore.html)      | Restore full and incremental backups.                                                       |
| [`RESUME JOB`](resume-job.html)   | Use with the `job ID` to resume a backup or restore job.                                    |
| [`SHOW BACKUP`](show-backup.html)  | Show a backup's details at the [backup collection's](take-full-and-incremental-backups.html#backup-collections) storage location.                        |
| [`SHOW JOBS`](show-jobs.html)    | Use to show a list of jobs or with the `job ID` to show details of a backup or restore job. |

## Backup storage

We recommend taking backups to [cloud storage](use-cloud-storage-for-bulk-operations.html) and enabling object locking to protect the validity of your backups. CockroachDB supports Amazon S3, Azure Storage, and Google Cloud Storage for backups.

- To form the URL that you pass to `BACKUP` and `RESTORE` statements, read [Example file URLs](use-cloud-storage-for-bulk-operations.html#example-file-urls).
- To set up authentication to a cloud storage bucket and credentials to pass in the URL, read [Authentication](use-cloud-storage-for-bulk-operations.html#authentication).

For detail on additional cloud storage features CockroachDB supports:

- [Object locking](use-cloud-storage-for-bulk-operations.html#object-locking) to prevent backups from being overwritten or deleted.
- [Storage Class (AWS S3 only)](use-cloud-storage-for-bulk-operations.html#amazon-s3-storage-classes) to set a specific storage class for your backups.

## See also

- Considerations for using [backup](backup.html#considerations) and [restore](restore.html#considerations)
- [Backup collections](take-full-and-incremental-backups.html#backup-collections) for details on how CockroachDB stores backups
