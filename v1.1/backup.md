---
title: BACKUP
summary: Back up your CockroachDB cluster to a cloud storage services such as AWS S3, Google Cloud Storage, or other NFS.
toc: false
---

{{site.data.alerts.callout_danger}}The <code>BACKUP</code> feature is only available to <a href="https://www.cockroachlabs.com/pricing/">enterprise license</a> users. For non-enterprise backups, see <a href="sql-dump.html"><code>cockroach dump</code></a>.{{site.data.alerts.end}}

CockroachDB's `BACKUP` [statement](sql-statements.html) creates full or incremental backups of your cluster's schemas and data that are consistent as of a given timestamp. These backups can be stored on the platforms you're already using, including AWS S3, Google Cloud Storage, NFS, or HTTP storage.

Because CockroachDB is designed with high fault tolerance, these backups are designed primarily for disaster recovery (i.e., if your cluster loses a majority of its nodes) through [`RESTORE`](restore.html). Isolated issues (such as small-scale node outages) do not require any intervention.

<div id="toc"></div>

## Functional Details

### Backup Targets

You can backup entire tables (which automatically includes their indexes) or [views](views.html). Backing up a database simply backs up all of its tables and views.

{{site.data.alerts.callout_info}}<code>BACKUP</code> only offers table-level granularity; it <em>does not</em> support backing up subsets of a table.{{site.data.alerts.end}}

### Object Dependencies

Dependent objects should be backed up at the same time as the objects they depend on; otherwise, you cannot restore the dependent objects.

Object | Depends On
-------|-----------
Table with [foreign key](foreign-key.html) constraints | The table it `REFERENCES` (however, this dependency can be [removed during the restore](restore.html#skip_missing_foreign_keys))
[Views](views.html) | The tables used in the view's `SELECT` statement
[Interleaved tables](interleave-in-parent.html) | The parent table in the [interleaved hierarchy](interleave-in-parent.html#interleaved-hierarchy)

### Users and Privileges

Every backup you create includes `system.users`, which stores your users and their passwords. To restore your users, you must use [this procedure](restore.html#restoring-users-from-system-users-backup).

Restored tables inherit privilege grants from the target database; they do not preserve privilege grants from the backed up table because the restoring cluster may have different users.

Table-level privileges must be [granted to users](grant.html) after the restore is complete.

### Backup Types

CockroachDB offers two types of backups: full and incremental.

#### Full Backups

Full backups contain an unreplicated copy of your data and can always be used to restore your cluster. These files are roughly the size of your data and require greater resources to produce than incremental backups.

#### Incremental Backups

Incremental backups are smaller and faster to produce than full backups because they contain only the data that has changed since a base set of backups you specify (which must include one full backup, and can include many incremental backups).

You can only create incremental backups within the garbage collection period of the base backup's most recent timestamp. This is because incremental backups are created by finding which data has been created or modified since the most recent timestamp in the base backup––that timestamp data, though, is deleted by the garbage collection process.

You can configure garbage collection periods on a per-table basis using the `ttlseconds` [replication zone setting](configure-replication-zones.html).

## Performance

The `BACKUP` process minimizes its impact to the cluster's performance by distributing work to all nodes. Each node backs up only a specific subset of the data it stores (those for which it serves writes; more details about this architectural concept forthcoming), with no two nodes backing up the same data.

For best performance, we also recommend always starting backups with a specific [timestamp](timestamp.html) at least 10 seconds in the past. For example:

~~~ sql
> BACKUP...AS OF SYSTEM TIME '2017-06-09 16:13:55.571516+00:00';
~~~

This improves performance by decreasing the likelihood that the `BACKUP` will be [retried because it contends with other statements/transactions](transactions.html#transaction-retries).

## Automating Backups

We recommend automating daily backups of your cluster.

To automate backups, you must have a client send the `BACKUP` statement to the cluster.

Once the backup is complete, your client will receive a `BACKUP` response.

## Viewing and Controlling Backups Jobs

Whenever you initiate a backup, CockroachDB registers it as a job, which you can view with [`SHOW JOBS`](show-jobs.html).

After the backup has been initiated, you can control it with [`PAUSE JOB`](pause-job.html), [`RESUME JOB`](resume-job.html), and [`CANCEL JOB`](cancel-job.html).

{{site.data.alerts.callout_info}}Job-related statements require CockroachDB v1.1 or greater.{{site.data.alerts.end}}

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/backup.html %}

## Required Privileges

Only the `root` user can run `BACKUP`.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_pattern` | The table or [view](views.html) you want to back up. |
| `name` | The name of the database you want to back up (i.e., create backups of all tables and views in the database).|
| `destination` | The URL where you want to store the backup.<br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). |
| `AS OF SYSTEM TIME timestamp` | Back up data as it existed as of [`timestamp`](timestamp.html). However, the `timestamp` must be more recent than your cluster's last garbage collection (which defaults to occur every 24 hours, but is [configurable per table](configure-replication-zones.html#replication-zone-format)). |
| `INCREMENTAL FROM full_backup_location` | Create an incremental backup using the full backup stored at the URL `full_backup_location` as its base.<br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). |
| `incremental_backup_location` | Create an incremental backup that includes all backups listed at the provided URLs. <br/><br/>Lists of incremental backups must be sorted from oldest to newest. The newest incremental backup's timestamp must be within the table's garbage collection period. <br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). <br/><br/>For more information about garbage collection, see [Configure Replication Zones](configure-replication-zones.html#replication-zone-format). |

### Backup File URLs

The URL for your backup's destination/locations must use the following format:

~~~
[scheme]://[host]/[path to backup]?[parameters]
~~~

`[path to backup]` must be unique for each backup, but the other values depend on where you want to store the backup.

| Backup Location | scheme | host | parameters |
|-----------------|--------|------|------------|
| Amazon S3 | `s3` | Bucket name | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| Azure | `azure` | Container name | `AZURE_ACCOUNT_KEY`, `AZURE_ACCOUNT_NAME` |
| Google Cloud Storage | `gs` | Bucket name | None––currently only supports instance auth, but we can build non-instance auth at a customer's request |
| HTTP | `http` | Remote host | N/A |
| NFS | `nodelocal` | File system location | N/A |

{{site.data.alerts.callout_info}}Because CockroachDB is a distributed system, you cannot meaningfully store backups "locally" on nodes. The entire backup file must be stored in a single location, so attempts to store backups locally must point to an NFS drive to be useful.{{site.data.alerts.end}}

## Examples

Per our guidance in the [Performance](#performance) section, we recommend starting backups from a time at least 10 seconds in the past using `AS OF SYSTEM TIME`.

### Backup a Single Table or View

~~~ sql
> BACKUP bank.customers TO 'azure://acme-co-backup/table-customer-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
AS OF SYSTEM TIME '2017-06-09 16:13:55.571516+00:00';
~~~

### Backup Multiple Tables

~~~ sql
> BACKUP bank.customers, bank.accounts TO 'azure://acme-co-backup/tables-accounts-customers-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
AS OF SYSTEM TIME '2017-06-09 16:13:55.571516+00:00');
~~~

### Backup an Entire Database

~~~ sql
> BACKUP DATABASE bank TO 'azure://acme-co-backup/database-bank-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
AS OF SYSTEM TIME '2017-06-09 16:13:55.571516+00:00';
~~~

### Create Incremental Backups

Incremental backups must be based off of full backups you've already created.

~~~ sql
> BACKUP DATABASE bank TO 'azure://acme-co-backup/database-bank-2017-03-29-incremental?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
INCREMENTAL FROM 'azure://acme-co-backup/database-bank-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
, 'azure://acme-co-backup/database-bank-2017-03-28-incremental?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co'
AS OF SYSTEM TIME '2017-06-09 16:13:55.571516+00:00'
~~~

## See Also

- [`RESTORE`](restore.html)
- [Configure Replication Zones](configure-replication-zones.html)
