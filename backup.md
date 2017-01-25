---
title: BACKUP
summary: Back up your CockroachDB cluster to a cloud storage services such as AWS S3, Google Cloud Storage, or other NFS.
toc: false
---

{{site.data.alerts.callout_danger}}The <code>BACKUP</code> feature is only available to enterprise license users. For non-enterprise backups, see <a href="sql-dump.html"><code>cockroach dump</code></a>.{{site.data.alerts.end}}

The `BACKUP` [statement](sql-statements.html) backs up your cluster's databases or tables to storage services such as AWS S3, Google Cloud Storage, NFS, or other HTTP storage.

Because CockroachDB is designed with high fault tolerance, these backups are designed primarily for disaster recovery through [`RESTORE`](restore.html). Normal issues (such as small-scale server outages) do not require any intervention.

<div id="toc"></div>

## Functional Details

- CockroachDB offers two types of backups: full and incremental.

  - **Full backups** contain all of the data necessary to restore your data and can always be used to restore your data. However, they are very large and take longer to produce.
  - **Incremental backups** are much smaller in size and faster to produce, but require a base set of backups (which must include one full backup, and can include many incremental backups). Each incremental backup contains only the data that was updated since the timestamp of the most recent backup included in its base.

    Incremental backups and the backups you base them off of must cover contiguous portions of time starting with the full backup. Because of this, you must create incremental backups within the garbage collection period of the last backup you created. For example, if your cluster's garbage collection runs every 24 hours (CockroachDB's default), you must also generate an incremental backup at least once every 24 hours.

    You can configure garbage collection periods on a per-table basis using the `ttlseconds` [replication zone setting](configure-replication-zones.html).

- Only databases and tables can be backed up. `BACKUP` *does not* support:
	
	- Row-level backups
	- [Views](views.html) (though CockroachDB can technically back up Views, it cannot restore them; you can follow our progress on this feature through [GitHub](https://github.com/cockroachdb/cockroach/issues/14521))

- When backing up a database, system tables are not stored in the backup, except for the `user` table which stores your cluster's users and their privileges. However, the other derived system tables will be repopulated.

- If you use [interleaved tables](interleave-in-parent.html), you must include all tables in the interleaved hierarchy in the same backup.

## Performance

Because the process initiated by `BACKUP` is distributed to all nodes in the cluster, it only slightly impacts your cluster's overall performance.

## Automating Backups

To automate backups, you must have a client send the `BACKUP` statement to the cluster.

Once the backup is complete, your client will receive a `BACKUP` response.

## Synopsis

{% include sql/diagrams/backup.html %}

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the table. 

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_pattern` | The table you want to back up. |
| `name` | The name of the database you want to back up (creates backups of all tables in the database).|
| `destination` | The URL of the cloud service where you want to store the backup.<br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). |
| `AS OF SYSTEM TIME timestamp` | Back up data as it existed as of [`timestamp`](timestamp.html). However, the `timestamp` must be more recent than your cluster's last garbage collection (which defaults to occur every 24 hours, but is [configurable per table](configure-replication-zones.html#replicaton-zone-format)). |
| `INCREMENTAL FROM full_backup_location` | Create an incremental backup using the full backup stored at the URL `full_backup_location` as its base.<br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). |
| `incremental_backup_location` | Create an incremental backup that includes all backups listed at the URLs `incremental_backup_location`. The included incremental backups must cover a contiguous portion of time starting at the end of the listed full backup, sorted from oldest to newest.<br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). |

### Backup File URLs

The URL for your backup's destination/locations must use the following structure:

~~~
[scheme]://[host]/[path to backup]?[parameters]
~~~

`[path to backup]` should be unique for each backup, but the other values depend on where you want to store the backup.

| Location | `scheme` | `host` | Parameters |
|----------|----------|--------|------------|
| Amazon S3 | `s3` | Bucket name | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| Azure | `azure` | Container name | `AZURE_ACCOUNT_KEY`, `AZURE_ACCOUNT_NAME` |
| GCE | `gce` | Bucket name | None––only supports instance auth |
| HTTP | `http` | Remote host | N/A |
| NFS | `file` | File system location | N/A |

{{site.data.alerts.callout_info}}Because CockroachDB is a distributed system, you cannot meaningfully store backups "locally" on nodes. The entire backup file must be stored in a single location, so attempts to store backups locally must point to an NFS drive to be useful.{{site.data.alerts.end}}

## Examples

### Backup a Single Table

~~~ sql
> BACKUP customers TO 'azure://acme-co-backup/table-customer-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
~~~

### Backup Multiple Tables

~~~ sql
> BACKUP customers, accounts TO 'azure://acme-co-backup/tables-accounts-customers-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
~~~

### Backup an Entire Database

~~~ sql
> BACKUP DATABASE bank TO 'azure://acme-co-backup/database-bank-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
~~~

### Create Incremental Backups

~~~ sql
> BACKUP DATABASE bank TO 'azure://acme-co-backup/database-bank-2017-03-29-incremental?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co' 
INCREMENTAL FROM 'azure://acme-co-backup/database-bank-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
, 'azure://acme-co-backup/database-bank-2017-03-28-incremental?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co';
~~~

### Create Backups as of System Time

~~~ sql
> BACKUP customers TO 'azure://acme-co-backup/table-customer-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
AS OF SYSTEM TIME '2016-03-27 12:45:00';
~~~

If you create backups using `AS OF SYSTEM TIME`, you should also create incremental backups on top of them to ensure your backups cover a contiguous portion of time.

## See Also

- [`RESTORE`](restore.html)
- [Configure Replication Zones](configure-replication-zones.html)
