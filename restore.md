---
title: RESTORE
summary: Restore your CockroachDB cluster to a cloud storage services such as AWS S3, Google Cloud Storage, or other NFS.
toc: false
---

{{site.data.alerts.callout_danger}}The <code>RESTORE</code> feature is only available to our enterprise license users. For non-enterprise restores, see <a href="restore-data.html">restoring data</a>.{{site.data.alerts.end}}

The `RESTORE` [statement](sql-statements.html) restores your cluster's data from [an enterprise license-generated backup](backup.html) stored on a services such as AWS S3, Google Cloud Storage, NFS, or other HTTP storage.

Because CockroachDB is designed with high fault tolerance, this backup is designed primarily for use in disaster recovery. Normal issues (such as small server outages) do not require any intervention.

<div id="toc"></div>

## Functional Details

- When restoring from CockroachDB enterprise backups, you can either restore from a full backup or from a full backup with incremental backups.
	- **Full backup**: Include the path to the full backup.
	- **Full backup + incremental backups**: Include the path to the full backup as the first argument and the subsequent incremental backups in the order they were created as the following arguments.

- You can restore only individual databases or tables in a backup. `RESTORE` *does not* support:

	- Row-level restores
	- [Views](views.html) (though CockroachDB can technically back up Views, it cannot restore them; you can follow our progress on this feature through [GitHub](https://github.com/cockroachdb/cockroach/issues/14521))

- Restored tables must exist in the target database. If the table does currently exist, you can [`DROP`](drop-table.html) it.

- Restoring a database also restores the `users` system table, which stores your cluster's users and their privileges. However, the other derived system tables will be repopulated.

- If you use [interleaved tables](interleave-in-parent.html), you must restore all tables in the interleaved hierarchy in the same `RESTORE`. (This means all of the tables must have also been backed up at the same time, as well.)

## Cluster Performance

Because the process initiated by `RESTORE` is distributed to all nodes in the cluster, it only slightly impacts your cluster's overall performance.

## Synopsis

{% include sql/diagrams/restore.html %}

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the table. 

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_pattern` | The table you want to restore. |
| `name` | The name of the database you want to restore (restores all tables in the database).|
| `full_backup_location` | The URL where the full backup is stored. <br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). |
| `incremental_backup_location` | The URL where each incremental backup is stored. The list of incremental backups must cover a contiguous portion of time starting at the end of the listed full backup, sorted from oldest to newest.<br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). |
| **AS OF SYSTEM TIME** `timestamp` | Restore the data as it existed as of [`timestamp`](timestamp.html).<br/><br/>For more information, see [this example](#select-historical-data-time-travel) or our blog post [Time-Travel Queries](https://www.cockroachlabs.com/blog/time-travel-queries-select-witty_subtitle-the_future/). |

### Backup Destinations

The URL for your backup's destination/locations must use the following structure:

~~~
[scheme]://[host]/[path to backup]?[parameters]
~~~

`[path to backup]` is unique for each backup, but the other values depend on where you stored the backup.

| Location | `scheme` | `host` | Parameters |
|----------|----------|--------|------------|
| Amazon S3 | `s3` | Bucket name | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| Azure | `azure` | Container name | `AZURE_ACCOUNT_KEY`, `AZURE_ACCOUNT_NAME` |
| GCE | `gce` | Bucket name | None––only supports instance auth |
| HTTP | `http` | Remote host | N/A |
| NFS | `file` | File system location | N/A |

## Examples

### Restore a Single Table

``` sql
> RESTORE customers FROM 'azure://acme-co-backup/table-customer-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
```

### Restore Multiple Tables

``` sql
> RESTORE customers, accounts FROM 'azure://acme-co-backup/tables-accounts-customers-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
```

### Restore an Entire Database

``` sql
> RESTORE DATABASE bank FROM 'azure://acme-co-backup/database-bank-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
```

### Restore from Incremental Backups

``` sql
> RESTORE DATABASE bank FROM 'azure://acme-co-backup/database-bank-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
, 'azure://acme-co-backup/database-bank-2017-03-28-incremental?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
, 'azure://acme-co-backup/database-bank-2017-03-29-incremental?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
```

## See Also

- [`BACKUP`](backup.html)
- [Configure Replication Zones](configure-replication-zones.html)
