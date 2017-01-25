---
title: RESTORE
summary: Restore your CockroachDB cluster to a cloud storage services such as AWS S3, Google Cloud Storage, or other NFS.
toc: false
---

{{site.data.alerts.callout_danger}}The <code>RESTORE</code> feature is only available to our [enterprise license](https://www.cockroachlabs.com/pricing/) only users. For non-enterprise restores, see <a href="restore-data.html">restoring data</a>.{{site.data.alerts.end}}

The `RESTORE` [statement](sql-statements.html) restores your cluster's data from [an enterprise license-generated backup](backup.html) stored on a services such as AWS S3, Google Cloud Storage, NFS, or HTTP storage.

Because CockroachDB is designed with high fault tolerance, this backup is designed primarily for use in disaster recovery, i.e. if your cluster loses a majority of its nodes. Isolated issues (such as small-scale node outages) do not require any intervention.

<div id="toc"></div>

## Functional Details

- You can restore only entire tables or views from a backup. 

  If the objects you're restoring have relationships to any other objects, they must be restored at the same time. For example, these object must be restored at the same time:

	- Tables with foreign key constraints and the tables they reference (this relationship can also)
	- Views and the tables they depend on
	- All tables in an interleave hierarchy

  To restore all of a database's tables, see [this example](#restore-all-tables-and-views-from-a-database).

- `RESTORE` *does not*:
	- Restore users and their privileges 
	- Support row-level restores

- Restored tables or views *must not* exist in the target database. If the table currently exists, you can [`DROP TABLE`](drop-table.html) or [`DROP VIEW`](drop-view.html) and then restore it.

- You can either restore from a full backup or from a full backup with incremental backups.
	- **Full backup**: Include the path to the full backup.
	- **Full backup + incremental backups**: Include the path to the full backup as the first argument and the subsequent incremental backups in the order they were created as the following arguments.

## Cluster Performance

The process initiated by `RESTORE` has been designed to have a minimal performance impact by distributing the work to all nodes in your cluster.

## Synopsis

{% include sql/diagrams/restore.html %}

## Required Privileges

Only the `root` user can run `RESTORE`.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_pattern` | The table or [view](views.html) you want to restore. |
| `full_backup_location` | The URL where the full backup is stored. <br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). |
| `incremental_backup_location` | The URL where each incremental backup is stored. The list of incremental backups must cover a contiguous portion of time starting at the end of the listed full backup, sorted from oldest to newest.<br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). |
| `kv_option_list` | Control your backup's behavior with [these options](#restore-option-list). |

### Backup File URLs

The URL for your backup's destination/locations must use the following structure:

~~~
[scheme]://[host]/[path to backup]?[parameters]
~~~

`[path to backup]` is unique for each backup, but the other values depend on where you stored the backup.

| Location | `scheme` | `host` | Parameters |
|----------|----------|--------|------------|
| Amazon S3 | `s3` | Bucket name | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| Azure | `azure` | Container name | `AZURE_ACCOUNT_KEY`, `AZURE_ACCOUNT_NAME` |
| Google Cloud Storage | `gs` | Bucket name | None––currnently only supports instance auth, but we can build non-instance auth at a customer's request |
| HTTP | `http` | Remote host | N/A |
| NFS | `file` | File system location | N/A |

### Restore Option List

You can include the following options as key-value pairs in the `kv_option_list` to control your backup's behavior.

Key | Value | Description
----|-------|------------
`restoreOptIntoDB` | The name of the database you want to use  | Restore into a different database.<br/><br/>[*Example*](#change-database-target)
`restoreOptSkipMissingFKs` | `skip_missing_foreign_keys` | Drop the Foreign Key constraint from restored tables.<br/><br/>[*Example*](#remove-the-foreign-key-on-restore)

## Examples

### Restore a Single Table

``` sql
> RESTORE customers FROM 'azure://acme-co-backup/table-customer-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
```

### Restore Multiple Tables

``` sql
> RESTORE customers, accounts FROM 'azure://acme-co-backup/tables-accounts-customers-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
```

### Restore All Tables and Views from a Database

``` sql
> RESTORE bank.* FROM 'azure://acme-co-backup/database-bank-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
```

### Restore from Incremental Backups

``` sql
> RESTORE customers FROM 'azure://acme-co-backup/database-bank-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
, 'azure://acme-co-backup/database-bank-2017-03-28-incremental?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
, 'azure://acme-co-backup/database-bank-2017-03-29-incremental?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
```

### Change Target Database

If you want to restore a table into a database other than the one it originally existed in, you can [change the database target](#restore-option-list). This is useful if you want to restore a table that currently exists, but don't want to drop it.

~~~ sql
> RESTORE customers FROM 'azure://acme-co-backup/table-customer-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
WITH OPTIONS ("restoreOptIntoDB" = "newdb")
~~~

### Remove the Foreign Key on Restore

If you want to restore a table with a foreign key, but don't want to restore the table it references, you can [drop the Foreign Key constraint from the restored table](#restore-option-list).

~~~ sql
> RESTORE accounts FROM 'azure://acme-co-backup/table-customer-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
WITH OPTIONS ("restoreOptSkipMissingFKs" = "skip_missing_foreign_keys");
~~~


## See Also

- [`BACKUP`](backup.html)
- [Configure Replication Zones](configure-replication-zones.html)
