---
title: RESTORE
summary: Restore your CockroachDB cluster to a cloud storage services such as AWS S3, Google Cloud Storage, or other NFS.
toc: true
---

{{site.data.alerts.callout_info}}
`RESTORE` is an [enterprise-only](https://www.cockroachlabs.com/product/cockroachdb/) feature. For non-enterprise restores, see [Perform core backup and restore](backup-and-restore.html#perform-core-backup-and-restore).
{{site.data.alerts.end}}

The `RESTORE` [statement](sql-statements.html) restores your cluster's schemas and data from [an enterprise `BACKUP`][backup] stored on a services such as AWS S3, Google Cloud Storage, NFS, or HTTP storage.

Because CockroachDB is designed with high fault tolerance, restores are designed primarily for disaster recovery, i.e., restarting your cluster if it loses a majority of its nodes. Isolated issues (such as small-scale node outages) do not require any intervention.

You can restore:

- <span class="version-tag">New in v20.1:</span> [A full cluster](#full-cluster)
- [Databases](#databases)
- [Tables](#tables)

## Required privileges

Only members of the `admin` role can run `RESTORE`. By default, the `root` user belongs to the `admin` role.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/restore.html %}
</div>

## Parameters

 Parameter | Description
-----------|-------------
 `table_pattern` | The table or [view](views.html) you want to restore.
 `database_name` | The name of the database you want to restore (i.e., restore all tables and views in the database). You can restore an entire database only if you had backed up the entire database.
 `full_backup_location` | The URL where the full backup is stored. <br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls).
 `incremental_backup_location` | The URL where an incremental backup is stored.  <br/><br/>Lists of incremental backups must be sorted from oldest to newest. The newest incremental backup's timestamp must be within the table's garbage collection period.<br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). <br/><br/>For more information about garbage collection, see [Configure Replication Zones](configure-replication-zones.html#replication-zone-variables).
 `AS OF SYSTEM TIME timestamp` | Restore data as it existed as of [`timestamp`](as-of-system-time.html). You can restore point-in-time data only if you had taken full or incremental backup [with revision history](backup-and-restore.html).
 `kv_option_list` | Control your backup's behavior with [these options](#options).

{{site.data.alerts.callout_info}}
The `RESTORE` statement is a blocking statement and cannot be used within a [transaction](transactions.html).
{{site.data.alerts.end}}

### Options

You can include the following options as key-value pairs in the `kv_option_list` to control the restore process's behavior:

 Option                                                             | <div style="width:75px">Value</div>         | Description
 -------------------------------------------------------------------+---------------+-------------------------------------------------------
<a name="into_db"></a>`into_db`                                     | Database name                               | Use to change the target database for table restores. (Does not apply to database or cluster restores.)<br><br>Example: `WITH into_db = 'newdb'`
<a name="skip_missing_foreign_keys"></a>`skip_missing_foreign_keys` | N/A                                         | Use to remove the [foreign key](foreign-key.html) constraints before restoring.<br><br>Example: `WITH skip_missing_foreign_keys`
<a name="skip_missing_sequences"></a>`skip_missing_sequences`       | N/A                                         | Use to ignore [sequence](show-sequences.html) dependencies (i.e., the `DEFAULT` expression that uses the sequence).<br><br>Example: `WITH skip_missing_sequences`
`skip_missing_views`                                                | N/A                                         | Use to skip restoring [views](views.html) that cannot be restored because their dependencies are not being restored at the same time.<br><br>Example: `WITH skip_missing_views`
`encryption_passphrase`                                             | Passphrase used to create the [encrypted backup](backup-and-restore.html) | <span class="version-tag">New in v20.1:</span> The passphrase used to decrypt the file(s) that were encrypted by the [`BACKUP`](backup-and-restore.html) statement.

### Backup file URLs

The URL for your backup's locations must use the following format:

{% include {{ page.version.version }}/misc/external-urls.md %}

## Functional details

You can restore:

- <span class="version-tag">New in v20.1:</span> [A full cluster](#full-cluster)
- [Databases](#databases)
- [Tables](#tables)

#### Full cluster

<span class="version-tag">New in v20.1:</span> A full cluster restore can only be run on a target cluster with no user-created databases or tables. Restoring a full cluster includes:

- All user tables
- Relevant system tables
- All [databases](create-database.html)
- All [tables](create-table.html) (which automatically includes their [indexes](indexes.html))
- All [views](views.html)

{{site.data.alerts.callout_info}}
When you do a full cluster restore, it will restore the [enterprise license](enterprise-licensing.html) of the cluster you are restoring from. If you want to use a different license in the new cluster, make sure to [update the license](licensing-faqs.html#set-a-license) _after_ the restore is complete.
{{site.data.alerts.end}}

#### Databases

Restoring a database will create a new database and restore all of its tables and views.

The created database will have the name of the database in the backup. The database cannot already exist in the target cluster.

If [dropping](drop-database.html) or [renaming](rename-database.html) an existing database is not an option, you can use _table_ restore to restore all tables into the existing database:

```sql
RESTORE backup_database_name.* FROM 'your_backup_location'
WITH into_db = 'your_target_db'
```

{{site.data.alerts.callout_info}}
The [`into_db`](#into_db) option only applies to [table restores](#tables).
{{site.data.alerts.end}}

#### Tables

You can also restore individual tables (which automatically includes their indexes) or [views](views.html) from a backup. This process uses the data stored in the backup to create entirely new tables or views in the target database.

By default, tables and views are restored into a target database matching the name of the database from which they were backed up. If the target database does not exist, you must [create it](create-database.html). You can choose to change the target database with the [`into_db` option](#into_db).

The target database must not have tables or views with the same name as the tables or views you're restoring. If any of the restore target's names are being used, you can:

- [`DROP TABLE`](drop-table.html), [`DROP VIEW`](drop-view.html), or [`DROP SEQUENCE`](drop-sequence.html) and then restore them. Note that a sequence cannot be dropped while it is being used in a column's `DEFAULT` expression, so those expressions must be dropped before the sequence is dropped, and recreated after the sequence is recreated. The `setval` [function](functions-and-operators.html#sequence-functions) can be used to set the value of the sequence to what it was previously.
- [Restore the table or view into a different database](#into_db).

{{site.data.alerts.callout_info}}
`RESTORE` only offers table-level granularity; it _does not_ support restoring subsets of a table.
{{site.data.alerts.end}}

### Object dependencies

Dependent objects must be restored at the same time as the objects they depend on.

Object | Depends On
-------|-----------
Table with [foreign key](foreign-key.html) constraints | The table it `REFERENCES` (however, this dependency can be [removed during the restore](#skip_missing_foreign_keys)).
Table with a [sequence](create-sequence.html) | The sequence.
[Views](views.html) | The tables used in the view's `SELECT` statement.
[Interleaved tables](interleave-in-parent.html) | The parent table in the [interleaved hierarchy](interleave-in-parent.html#interleaved-hierarchy).

### Users and privileges

To restore your users and privilege [grants](grant.html), you can do a cluster backup and restore the cluster to a fresh cluster with no user data.

If you are not doing a full cluster restore, the table-level privileges need to be granted to the users after the restore is complete. To do this, backup the `system.users` table, [restore users and their passwords](backup-and-restore.html), and then [grant](grant.html) the table-level privileges.

### Restore types

You can either restore from a full backup or from a full backup with incremental backups, based on the backup files you include:

Restore Type | Parameters
-------------|----------
Full backup | Include only the path to the full backup.
Full backup + <br>incremental backups | If the full backup and incremental backups were sent to the same destination, include only the path to the full backup (e.g., `RESTORE FROM 'full_backup_location';`).<br><br>If the incremental backups were sent to a different destination from the full backup, include the path to the full backup as the first argument and the subsequent incremental backups from oldest to newest as the following arguments (e.g., `RESTORE FROM 'full_backup_location', 'incremental_location_1', 'incremental_location_2';`).

## Performance

The `RESTORE` process minimizes its impact to the cluster's performance by distributing work to all nodes. Subsets of the restored data (known as ranges) are evenly distributed among randomly selected nodes, with each range initially restored to only one node. Once the range is restored, the node begins replicating it others.

{{site.data.alerts.callout_info}}
When a `RESTORE` fails or is canceled, partially restored data is properly cleaned up. This can have a minor, temporary impact on cluster performance.
{{site.data.alerts.end}}

## Viewing and controlling restore jobs

After CockroachDB successfully initiates a restore, it registers the restore as a job, which you can view with [`SHOW JOBS`](show-jobs.html).

After the restore has been initiated, you can control it with [`PAUSE JOB`](pause-job.html), [`RESUME JOB`](resume-job.html), and [`CANCEL JOB`](cancel-job.html).

{{site.data.alerts.callout_info}}
If initiated correctly, the statement returns when the restore is finished or if it encounters an error. In some cases, the restore can continue after an error has been returned (the error message will tell you that the restore has resumed in background).
{{site.data.alerts.end}}

## Examples

### Restore a cluster

<span class="version-tag">New in v20.1:</span> To restore a full cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE FROM 'gs://acme-co-backup/test-cluster';
~~~

### Restore a database

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE DATABASE bank FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly';
~~~

{{site.data.alerts.callout_info}}
`RESTORE DATABASE` can only be used if the entire database was backed up.
{{site.data.alerts.end}}

### Restore a table

To restore a single table:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly';
~~~

To restore multiple tables:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers, bank.accounts FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly';
~~~

### Restore from incremental backups

<span class="version-tag">New in v20.1:</span> Restoring from incremental backups requires previous full and incremental backups. To restore from a destination containing the full backup, as well as the incremental backups (stored as subdirectories):

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE FROM 'gs://acme-co-backup/test-cluster';
~~~

To explicitly point to where your incremental backups are, provide the previous full and incremental backup locations in a comma-separated list. In this example, `-weekly` is the full backup and the two `-nightly` are incremental backups.

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers \
FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly', 'gs://acme-co-backup/database-bank-2017-03-28-nightly', 'gs://acme-co-backup/database-bank-2017-03-29-nightly';
~~~

{{site.data.alerts.callout_info}}
If you are restoring from HTTP storage, provide the previous full and incremental backup locations in a comma-separated list. You cannot use the simplified syntax.
{{site.data.alerts.end}}

### Advanced examples

{% include {{ page.version.version }}/backups/advanced-examples-list.md %}

## See also

- [`BACKUP`][backup]
- [Backup and Restore Data](backup-and-restore.html)
- [Back up and Restore Data - Advanced Options](backup-and-restore.html)
- [Configure Replication Zones](configure-replication-zones.html)

<!-- Reference links -->

[backup]:  backup.html
[restore]: restore.html
