---
title: BACKUP
summary: Back up your CockroachDB cluster to a cloud storage services such as AWS S3, Google Cloud Storage, or other NFS.
toc: true
---

{{site.data.alerts.callout_danger}}
The `BACKUP` feature is only available to [enterprise](https://www.cockroachlabs.com/product/cockroachdb/) users. For non-enterprise backups, see [`cockroach dump`](sql-dump.html).
{{site.data.alerts.end}}

CockroachDB's `BACKUP` [statement](sql-statements.html) allows you to create full or incremental backups of your cluster's schema and data that are consistent as of a given timestamp. Backups can be with or without [revision history](backup.html#backups-with-revision-history).

Because CockroachDB is designed with high fault tolerance, these backups are designed primarily for disaster recovery (i.e., if your cluster loses a majority of its nodes) through [`RESTORE`](restore.html). Isolated issues (such as small-scale node outages) do not require any intervention.


## Functional details

### Backup targets

You can backup entire tables (which automatically includes their indexes) or [views](views.html). Backing up a database simply backs up all of its tables and views.

{{site.data.alerts.callout_info}}
`BACKUP` only offers table-level granularity; it _does not_ support backing up subsets of a table.
{{site.data.alerts.end}}

### Object dependencies

Dependent objects must be backed up at the same time as the objects they depend on.

Object | Depends On
-------|-----------
Table with [foreign key](foreign-key.html) constraints | The table it `REFERENCES`; however, this dependency can be [removed during the restore](restore.html#skip_missing_foreign_keys).
Table with a [sequence](create-sequence.html) | The sequence it uses; however, this dependency can be [removed during the restore](restore.html#skip_missing_sequences).
[Views](views.html) | The tables used in the view's `SELECT` statement.
[Interleaved tables](interleave-in-parent.html) | The parent table in the [interleaved hierarchy](interleave-in-parent.html#interleaved-hierarchy).

### Users and privileges

Every backup you create includes `system.users`, which stores your users and their passwords. To restore your users, you must use [this procedure](restore.html#restoring-users-from-system-users-backup).

Restored tables inherit privilege grants from the target database; they do not preserve privilege grants from the backed up table because the restoring cluster may have different users.

Table-level privileges must be [granted to users](grant.html) after the restore is complete.

### Backup types

CockroachDB offers two types of backups: full and incremental.

#### Full backups

Full backups contain an unreplicated copy of your data and can always be used to restore your cluster. These files are roughly the size of your data and require greater resources to produce than incremental backups. You can take full backups as of a given timestamp and (optionally) include the available [revision history](backup.html#backups-with-revision-history).

#### Incremental backups

Incremental backups are smaller and faster to produce than full backups because they contain only the data that has changed since a base set of backups you specify (which must include one full backup, and can include many incremental backups). You can take incremental backups either as of a given timestamp or with full [revision history](backup.html#backups-with-revision-history).

Note the following restrictions:

- Incremental backups can only be created within the garbage collection period of the base backup's most recent timestamp. This is because incremental backups are created by finding which data has been created or modified since the most recent timestamp in the base backup––that timestamp data, though, is deleted by the garbage collection process.

    You can configure garbage collection periods using the `ttlseconds` [replication zone setting](configure-replication-zones.html).

- It is not possible to create an incremental backup if one or more tables were [created](create-table.html), [dropped](drop-table.html), or [truncated](truncate.html) after the full backup. In this case, you must create a new [full backup](#full-backups).

### Backups with revision history

{% include {{ page.version.version }}/misc/beta-warning.md %}

You can create full or incremental backups with revision history:

- Taking full backups with revision history allows you to back up every change made within the garbage collection period leading up to and including the given timestamp.
- Taking incremental backups with revision history allows you to back up every change made since the last backup and within the garbage collection period leading up to and including the given timestamp. You can take incremental backups with revision history even when your previous full or incremental backups were taken without revision history.

You can configure garbage collection periods using the `ttlseconds` [replication zone setting](configure-replication-zones.html). Taking backups with revision history allows for point-in-time restores within the revision history.

## Performance

The `BACKUP` process minimizes its impact to the cluster's performance by distributing work to all nodes. Each node backs up only a specific subset of the data it stores (those for which it serves writes; more details about this architectural concept forthcoming), with no two nodes backing up the same data.

For best performance, we also recommend always starting backups with a specific [timestamp](timestamp.html) at least 10 seconds in the past. For example:

~~~ sql
> BACKUP...AS OF SYSTEM TIME '-10s';
~~~

This improves performance by decreasing the likelihood that the `BACKUP` will be [retried because it contends with other statements/transactions](transactions.html#transaction-retries). However, because `AS OF SYSTEM TIME` returns historical data, your reads might be stale.

## Automating backups

We recommend automating daily backups of your cluster.

To automate backups, you must have a client send the `BACKUP` statement to the cluster.

Once the backup is complete, your client will receive a `BACKUP` response.

## Viewing and controlling backups jobs

After CockroachDB successfully initiates a backup, it registers the backup as a job, which you can view with [`SHOW JOBS`](show-jobs.html).

After the backup has been initiated, you can control it with [`PAUSE JOB`](pause-job.html), [`RESUME JOB`](resume-job.html), and [`CANCEL JOB`](cancel-job.html).

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/backup.html %}
</div>

{{site.data.alerts.callout_info}}
The `BACKUP` statement cannot be used within a [transaction](transactions.html).
{{site.data.alerts.end}}

## Required privileges

Only members of the `admin` role can run `BACKUP`. By default, the `root` user belongs to the `admin` role.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_pattern` | The table or [view](views.html) you want to back up. |
| `name` | The name of the database you want to back up (i.e., create backups of all tables and views in the database).|
| `destination` | The URL where you want to store the backup.<br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). |
| `AS OF SYSTEM TIME timestamp` | Back up data as it existed as of [`timestamp`](as-of-system-time.html). The `timestamp` must be more recent than your cluster's last garbage collection (which defaults to occur every 25 hours, but is [configurable per table](configure-replication-zones.html#replication-zone-variables)). |
| `WITH revision_history` | Create a backup with full [revision history](backup.html#backups-with-revision-history) that records every change made to the cluster within the garbage collection period leading up to and including the given timestamp. |
| `INCREMENTAL FROM full_backup_location` | Create an incremental backup using the full backup stored at the URL `full_backup_location` as its base. For information about this URL structure, see [Backup File URLs](#backup-file-urls).<br><br>**Note:** It is not possible to create an incremental backup if one or more tables were [created](create-table.html), [dropped](drop-table.html), or [truncated](truncate.html) after the full backup. In this case, you must create a new [full backup](#full-backups). |
| `incremental_backup_location` | Create an incremental backup that includes all backups listed at the provided URLs. <br/><br/>Lists of incremental backups must be sorted from oldest to newest. The newest incremental backup's timestamp must be within the table's garbage collection period. <br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). <br/><br/>For more information about garbage collection, see [Configure Replication Zones](configure-replication-zones.html#replication-zone-variables). |

### Backup file URLs

We will use the URL provided to construct a secure API call to the service you specify. The path to each backup must be unique, and the URL for your backup's destination/locations must use the following format:

{% include {{ page.version.version }}/misc/external-urls.md %}

## Examples

Per our guidance in the [Performance](#performance) section, we recommend starting backups from a time at least 10 seconds in the past using [`AS OF SYSTEM TIME`](as-of-system-time.html).

### Backup a single table or view

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP bank.customers \
TO 'gs://acme-co-backup/database-bank-2017-03-27-weekly' \
AS OF SYSTEM TIME '-10s';
~~~

### Backup multiple tables

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP bank.customers, bank.accounts \
TO 'gs://acme-co-backup/database-bank-2017-03-27-weekly' \
AS OF SYSTEM TIME '-10s';
~~~

### Backup an entire database

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank \
TO 'gs://acme-co-backup/database-bank-2017-03-27-weekly' \
AS OF SYSTEM TIME '-10s';
~~~

### Backup with revision history

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank \
TO 'gs://acme-co-backup/database-bank-2017-03-27-weekly' \
AS OF SYSTEM TIME '-10s' WITH revision_history;
~~~

### Create incremental backups

Incremental backups must be based off of full backups you've already created.

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank \
TO 'gs://acme-co-backup/db/bank/2017-03-29-nightly' \
AS OF SYSTEM TIME '-10s' \
INCREMENTAL FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly', 'gs://acme-co-backup/database-bank-2017-03-28-nightly';
~~~

### Create incremental backups with revision history

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank \
TO 'gs://acme-co-backup/database-bank-2017-03-29-nightly' \
AS OF SYSTEM TIME '-10s' \
INCREMENTAL FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly', 'gs://acme-co-backup/database-bank-2017-03-28-nightly' WITH revision_history;
~~~

## See also

- [`RESTORE`](restore.html)
- [Configure Replication Zones](configure-replication-zones.html)
