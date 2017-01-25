---
title: BACKUP
summary: Back up your CockroachDB cluster to a cloud storage services such as AWS S3, Google Cloud Storage, or other NFS.
toc: false
---

{{site.data.alerts.callout_danger}}The <code>BACKUP</code> feature is only available to [enterprise license](https://www.cockroachlabs.com/pricing/) users. For non-enterprise backups, see <a href="sql-dump.html"><code>cockroach dump</code></a>.{{site.data.alerts.end}}

CockroachDB's enterprise `BACKUP` [statement](sql-statements.html) offers a distributed backup tool that's consistent as of a timestamp and supports incremental backups. Your cluster's backups can be stored on the platforms you're already using, including AWS S3, Google Cloud Storage, NFS, or HTTP storage.

Because CockroachDB is designed with high fault tolerance, these backups are designed primarily for disaster recovery (i.e. if your cluster loses a majority of its nodes) through [`RESTORE`](restore.html). Isolated issues (such as small-scale node outages) do not require any intervention.

<div id="toc"></div>

## Functional Details

### Backup Types

CockroachDB offers two types of backups: full and incremental.

- **Full backups** contain all of the data necessary to restore your data and can always be used to restore your data. Because they contain all of the cluster's unreplicated data, full backups require a not-insubstantial amount of resources (including time) to produce.

- **Incremental backups** are smaller and faster to produce because they contain only the data that has changed since a base set of backups you specify (which must include one full backup, and can include many incremental backups). 

  You must create incremental backups within the garbage collection period of the most recent backup in the base set of backups. This is because incremental backups are created by comparing the cluster's current data with the data as it appeared at the most recent timestamp in the base backups––that timestamp data, though, is deleted by the garbage collection process.

  You can configure garbage collection periods on a per-table basis using the `ttlseconds` [replication zone setting](configure-replication-zones.html).

### Backup Targets & Related Tables

`BACKUP` supports backing up:
- Individual tables and views
- All of a database's tables and views

Backups also include each table's indexes.

`BACKUP` *does not*:
 - Back up your cluster's users and their privileges
 - Support row-level backups

However, when deciding which objects to back up, it's important to take relationships between objects into account. Relationships include:

- [Foreign keys](foreign-key.html) between tables
- [Interleaved tables](interleave-in-parent.html)
- [Views](views.html) and the tables they depend on

All related objects (e.g., all tables in the interleave hierarchy) must be backed up at the same time, and must also be restored together.

## Performance

The process initiated by `BACKUP` has been designed to have a minimal performance impact by distributing the work to all nodes in your cluster.

To decrease the likelihood of the `BACKUP` process contending with other transactions, which will also improve the operation's performance, we recommend always using `AS OF SYSTEM TIME` with a timestamp ~10 seconds in the past, e.g. `AS OF SYSTEM TIME (current_timestamp() - INTERVAL '0:0:10')`;

## Automating Backups

We recommend automating creating daily backups of your cluster.

To automate backups, you must have a client send the `BACKUP` statement to the cluster.

Once the backup is complete, your client will receive a `BACKUP` response.

## Synopsis

{% include sql/diagrams/backup.html %}

## Required Privileges

Only the `root` user can run `BACKUP`.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_pattern` | The table or [view](views.html) you want to back up. |
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
| Google Cloud Storage | `gs` | Bucket name | None––currnently only supports instance auth, but we can build non-instance auth at a customer's request |
| HTTP | `http` | Remote host | N/A |
| NFS | `file` | File system location | N/A |

{{site.data.alerts.callout_info}}Because CockroachDB is a distributed system, you cannot meaningfully store backups "locally" on nodes. The entire backup file must be stored in a single location, so attempts to store backups locally must point to an NFS drive to be useful.{{site.data.alerts.end}}

## Examples

Per our guidance in the [Performance](#performance) section, we always recommend starting backups from a time ~10 seconds in the past using `AS OF SYSTEM TIME`.

### Backup a Single Table or View

~~~ sql
> BACKUP customers TO 'azure://acme-co-backup/table-customer-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
AS OF SYSTEM TIME (current_timestamp() - INTERVAL '0:0:10');
~~~

### Backup Multiple Tables

~~~ sql
> BACKUP customers, accounts TO 'azure://acme-co-backup/tables-accounts-customers-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
AS OF SYSTEM TIME (current_timestamp() - INTERVAL '0:0:10');
~~~

### Backup an Entire Database

~~~ sql
> BACKUP DATABASE bank TO 'azure://acme-co-backup/database-bank-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
AS OF SYSTEM TIME (current_timestamp() - INTERVAL '0:0:10');
~~~

### Create Incremental Backups

~~~ sql
> BACKUP DATABASE bank TO 'azure://acme-co-backup/database-bank-2017-03-29-incremental?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co' 
INCREMENTAL FROM 'azure://acme-co-backup/database-bank-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
, 'azure://acme-co-backup/database-bank-2017-03-28-incremental?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
AS OF SYSTEM TIME (current_timestamp() - INTERVAL '0:0:10');
~~~

### Create Backups as of a Specific System Time

~~~ sql
> BACKUP customers TO 'azure://acme-co-backup/table-customer-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
AS OF SYSTEM TIME '2016-03-27 12:45:00';
~~~

## See Also

- [`RESTORE`](restore.html)
- [Configure Replication Zones](configure-replication-zones.html)
