---
title: BACKUP
summary: Back up your CockroachDB cluster to a cloud storage services such as AWS S3, Google Cloud Storage, or other NFS.
toc: true
---

{{site.data.alerts.callout_info}}
Core users can only take [full backups](take-full-and-incremental-backups.html#full-backups). To use the other backup features, you need an [enterprise license](enterprise-licensing.html).
{{site.data.alerts.end}}

CockroachDB's `BACKUP` [statement](sql-statements.html) allows you to create [full or incremental backups](take-full-and-incremental-backups.html) of your cluster's schema and data that are consistent as of a given timestamp.

You can [backup a full cluster](#backup-a-cluster), which includes:

- All user tables
- Relevant system tables
- All [databases](create-database.html)
- All [tables](create-table.html) (which automatically includes their [indexes](indexes.html))
- All [views](views.html)

You can also back up:

- [An individual database](#backup-a-database), which includes all of its tables and views
- [An individual table](#backup-a-table-or-view), which includes its indexes and views

Because CockroachDB is designed with high fault tolerance, these backups are designed primarily for disaster recovery (i.e., if your cluster loses a majority of its nodes) through [`RESTORE`](restore.html). Isolated issues (such as small-scale node outages) do not require any intervention.

{{site.data.alerts.callout_info}}
`BACKUP` only offers table-level granularity; it _does not_ support backing up subsets of a table.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
To view the contents of an enterprise backup created with the `BACKUP` statement, use [`SHOW BACKUP`](show-backup.html).
{{site.data.alerts.end}}

## Required privileges

- Only members of the `admin` role can run `BACKUP`. By default, the `root` user belongs to the `admin` role.
- `BACKUP` requires full read and write (including delete and overwrite) permissions to its target destination.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/backup.html %}
</div>

## Parameters

 Parameter | Description
------------|-------------
`table_pattern` | The table(s) or [view(s)](views.html) you want to back up.
`database_name` | The name of the database(s) you want to back up (i.e., create backups of all tables and views in the database).|
`destination` | The URL where you want to store the backup.<br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls).
`timestamp` | Back up data as it existed as of [`timestamp`](as-of-system-time.html). The `timestamp` must be more recent than your cluster's last garbage collection (which defaults to occur every 25 hours, but is [configurable per table](configure-replication-zones.html#replication-zone-variables)).
`full_backup_location` | Create an incremental backup using the backup stored at the URL `full_backup_location` as its base. For information about this URL structure, see [Backup File URLs](#backup-file-urls).<br><br>**Note:** After a full backup for an explicit list of tables and/or databases, it is not possible to create an incremental backup if one or more tables were [created](create-table.html), [dropped](drop-table.html), or [truncated](truncate.html). In these cases, you must create a new [full backup](#full-backups) before more incremental backups can be created. To avoid this, [backup the cluster](#backup-a-cluster) instead of the explicit list of tables/databases.
`incremental_backup_location` | Create an incremental backup that includes all backups listed at the provided URLs. <br/><br/>Lists of incremental backups must be sorted from oldest to newest. The newest incremental backup's timestamp must be within the table's garbage collection period. <br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). <br/><br/>For more information about garbage collection, see [Configure Replication Zones](configure-replication-zones.html#replication-zone-variables).
`kv_option_list` | Control the backup behavior with a comma-separated list of [these options](#options).

{{site.data.alerts.callout_info}}
The `BACKUP` statement cannot be used within a [transaction](transactions.html).
{{site.data.alerts.end}}

### Options

{% include {{ page.version.version }}/backups/backup-options.md %}

### Backup file URLs

CockroachDB uses the URL provided to construct a secure API call to the service you specify. The URL structure depends on the type of file storage you are using. For more information, see the following:

- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
- [Use a Local File Server for Bulk Operations](use-a-local-file-server-for-bulk-operations.html)

## Functional details

### Object dependencies

Dependent objects must be backed up at the same time as the objects they depend on.

Object | Depends On
-------|-----------
Table with [foreign key](foreign-key.html) constraints | The table it `REFERENCES`; however, this dependency can be [removed during the restore](restore.html#skip_missing_foreign_keys).
Table with a [sequence](create-sequence.html) | The sequence it uses; however, this dependency can be [removed during the restore](restore.html#skip_missing_sequences).
[Views](views.html) | The tables used in the view's `SELECT` statement.
[Interleaved tables](interleave-in-parent.html) | The parent table in the [interleaved hierarchy](interleave-in-parent.html#interleaved-hierarchy).

### Users and privileges

The `system.users` table stores your users and their passwords. To restore your users and privilege [grants](grant.html), do a cluster backup and restore the cluster to a fresh cluster with no user data. You can also backup the `system.users` table, and then use [this procedure](restore.html#restoring-users-from-system-users-backup).

### Backup types

CockroachDB offers two types of backups: [full](#full-backups) and [incremental](#incremental-backups).

#### Full backups

Full backups contain an un-replicated copy of your data and can always be used to restore your cluster. These files are roughly the size of your data and require greater resources to produce than incremental backups. You can take full backups as of a given timestamp and (optionally) include the available [revision history](take-backups-with-revision-history-and-restore-from-a-point-in-time.html).

#### Incremental backups

Incremental backups are smaller and faster to produce than full backups because they contain only the data that has changed since a base set of backups you specify (which must include one full backup, and can include many incremental backups). You can take incremental backups either as of a given timestamp or with full [revision history](take-backups-with-revision-history-and-restore-from-a-point-in-time.html).

{{site.data.alerts.callout_danger}}
Incremental backups can only be created within the garbage collection period of the base backup's most recent timestamp. This is because incremental backups are created by finding which data has been created or modified since the most recent timestamp in the base backup––that timestamp data, though, is deleted by the garbage collection process.

You can configure garbage collection periods using the `ttlseconds` [replication zone setting](configure-replication-zones.html).
{{site.data.alerts.end}}

For an example of an incremental backup, see the [Create incremental backups](#create-incremental-backups) example below.

## Performance

The `BACKUP` process minimizes its impact to the cluster's performance by distributing work to all nodes. Each node backs up only a specific subset of the data it stores (those for which it serves writes; more details about this architectural concept forthcoming), with no two nodes backing up the same data.

`BACKUP`, like any read, cannot export a range if the range contains an [unresolved intent](architecture/transaction-layer.html#resolving-write-intents). While you typically will want bulk, background jobs like `BACKUP` to have as little impact on your foreground traffic as possible, it's more important for backups to actually complete (which maintains your [recovery point objective (RPO)](https://en.wikipedia.org/wiki/Disaster_recovery#Recovery_Point_Objective)). Unlike a normal read transaction that will block until any uncommitted writes it encounters are resolved, `BACKUP` will block only for a configurable duration before invoking priority to ensure it can complete on-time.

We recommend always starting backups with a specific [timestamp](timestamp.html) at least 10 seconds in the past. For example:

~~~ sql
> BACKUP...AS OF SYSTEM TIME '-10s';
~~~

This improves performance by decreasing the likelihood that the `BACKUP` will be [retried because it contends with other statements/transactions](transactions.html#transaction-retries). However, because `AS OF SYSTEM TIME` returns historical data, your reads might be stale. Taking backups with `AS OF SYSTEM TIME '-10s'` is a good best practice to reduce the number of still-running transactions you may encounter, since the backup will take priority and will force still-running transactions to restart after the backup is finished.

 `BACKUP` will initially ask individual ranges to backup but to skip if they encounter an intent. Any range that is skipped is placed at the end of the queue. When `BACKUP` has completed its initial pass and is revisiting ranges, it will ask any range that did not resolve within the given time limit (default 1 minute) to attempt to resolve any intents that it encounters and to _not_ skip. Additionally, the backup's transaction priority is then set to `high`, which causes other transactions to abort until the intents are resolved and the backup is finished.

## Viewing and controlling backups jobs

After CockroachDB successfully initiates a backup, it registers the backup as a job, and you can do the following:

 Action                | SQL Statement
-----------------------+-----------------
View the backup status | [`SHOW JOBS`](show-jobs.html)
Pause the backup       | [`PAUSE JOB`](pause-job.html)
Resume the backup      | [`RESUME JOB`](resume-job.html)
Cancel the backup      | [`CANCEL JOB`](cancel-job.html)

You can also visit the [**Jobs** page](ui-jobs-page.html) of the DB Console to view job details. The `BACKUP` statement will return when the backup is finished or if it encounters an error.

{{site.data.alerts.callout_info}}
The presence of a `BACKUP-CHECKPOINT` file in the backup destination usually means the backup is not complete. This file is created when a backup is initiated, and is replaced with a `BACKUP` file once the backup is finished.
{{site.data.alerts.end}}

## Examples

Per our guidance in the [Performance](#performance) section, we recommend starting backups from a time at least 10 seconds in the past using [`AS OF SYSTEM TIME`](as-of-system-time.html). Each example below follows this guidance.

### Backup a cluster

 To backup a full cluster:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP TO \
'gs://acme-co-backup/test-cluster' \
AS OF SYSTEM TIME '-10s';
~~~

### Backup a database

To backup a single database:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank \
TO 'gs://acme-co-backup/database-bank-2017-03-27-weekly' \
AS OF SYSTEM TIME '-10s';
~~~

To backup multiple databases:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank, employees \
TO 'gs://acme-co-backup/database-bank-2017-03-27-weekly' \
AS OF SYSTEM TIME '-10s';
~~~

### Backup a table or view

To backup a single table or view:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP bank.customers \
TO 'gs://acme-co-backup/bank-customers-2017-03-27-weekly' \
AS OF SYSTEM TIME '-10s';
~~~

To backup multiple tables:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP bank.customers, bank.accounts \
TO 'gs://acme-co-backup/database-bank-2017-03-27-weekly' \
AS OF SYSTEM TIME '-10s';
~~~

### Create incremental backups

If you backup to a destination already containing a full backup, an incremental backup will be produced in a subdirectory with a date-based name (e.g., `destination/day/time_1`, `destination/day/time_2`):

{% include copy-clipboard.html %}
~~~ sql
> BACKUP TO \
'gs://acme-co-backup/test-cluster' \
AS OF SYSTEM TIME '-10s';
~~~

{{site.data.alerts.callout_info}}
This incremental backup syntax does not work for backups using HTTP storage; you must [explicitly control where your incremental backups go](take-full-and-incremental-backups.html#incremental-backups-with-explicitly-specified-destinations) by using the [`INCREMENTAL FROM` syntax](#synopsis).
{{site.data.alerts.end}}

### Run a backup asynchronously

 Use the `detached` [option](#options) to execute the backup job asynchronously:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP TO \
'gs://acme-co-backup/test-cluster' \
AS OF SYSTEM TIME '-10s'
WITH detached;
~~~

The job ID is returned immediately without waiting for the job to finish:

~~~
        job_id
----------------------
  592786066399264769
(1 row)
~~~

### Advanced examples

{% include {{ page.version.version }}/backups/advanced-examples-list.md %}

## See also

- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [Take Full and Incremental Backups](take-and-restore-encrypted-backups.html)
- [Take and Restore Locality-aware Backups](take-and-restore-locality-aware-backups.html)
- [Take Backups with Revision History and Restore from a Point-in-time](take-backups-with-revision-history-and-restore-from-a-point-in-time.html)
- [`SHOW BACKUP`](show-backup.html)
- [`CREATE SCHEDULE FOR BACKUP`](create-schedule-for-backup.html)
- [`RESTORE`](restore.html)
- [Configure Replication Zones](configure-replication-zones.html)

<!-- Reference links -->

[backup]:  backup.html
[restore]: restore.html
