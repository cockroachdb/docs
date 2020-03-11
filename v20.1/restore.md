---
title: RESTORE
summary: Restore your CockroachDB cluster to a cloud storage services such as AWS S3, Google Cloud Storage, or other NFS.
toc: true
---

{{site.data.alerts.callout_info}}
`RESTORE` is an [enterprise-only](https://www.cockroachlabs.com/product/cockroachdb/) feature. For non-enterprise restores, see [Restore Data](restore-data.html).
{{site.data.alerts.end}}

The `RESTORE` [statement](sql-statements.html) restores your cluster's schemas and data from [an enterprise `BACKUP`][backup] stored on a services such as AWS S3, Google Cloud Storage, NFS, or HTTP storage.

Because CockroachDB is designed with high fault tolerance, restores are designed primarily for disaster recovery, i.e., restarting your cluster if it loses a majority of its nodes. Isolated issues (such as small-scale node outages) do not require any intervention.

## Functional details

### Restore targets

<span class="version-tag">New in v20.1</span> You can restore a full cluster, which includes:

- All user tables
- Relevant system tables
- All [databases](create-database.html)
- All [tables](create-table.html) (which automatically includes their [indexes](indexes.html))
- All [views](views.html)

Because this process is designed for disaster recovery, a full cluster restore can only be run on a target cluster with no databases or tables.

You can also restore individual tables (which automatically includes their indexes) or [views](views.html) from a backup. This process uses the data stored in the backup to create entirely new tables or views in the [target database](#target-database). Restoring a database will restore all of its tables and views, but does not create the database. For more information, see [Target Database](#target-database).

To restore individual tables, the tables can not already exist in the [target database](#target-database). This means the target database must have not have tables or views with the same name as the restored table or view. If any of the restore target's names are being used, you can:

- [`DROP TABLE`](drop-table.html), [`DROP VIEW`](drop-view.html), or [`DROP SEQUENCE`](drop-sequence.html) and then restore them. Note that a sequence cannot be dropped while it is being used in a column's `DEFAULT` expression, so those expressions must be dropped before the sequence is dropped, and recreated after the sequence is recreated. The `setval` [function](functions-and-operators.html#sequence-functions) can be used to set the value of the sequence to what it was previously.
- [Restore the table or view into a different database](#into_db).

{{site.data.alerts.callout_info}}
`RESTORE` only offers table-level granularity; it _does not_ support restoring subsets of a table.
{{site.data.alerts.end}}

#### Target database

By default, tables and views are restored into a database with the name of the database from which they were backed up. However, also consider:

- You can choose to [change the target database](#into_db).
- If it no longer exists, you must [create the target database](create-database.html).

The target database must have not have tables or views with the same name as the tables or views you're restoring.

### Object dependencies

Dependent objects must be restored at the same time as the objects they depend on.

Object | Depends On
-------|-----------
Table with [foreign key](foreign-key.html) constraints | The table it `REFERENCES` (however, this dependency can be [removed during the restore](#skip_missing_foreign_keys)).
Table with a [sequence](create-sequence.html) | The sequence.
[Views](views.html) | The tables used in the view's `SELECT` statement.
[Interleaved tables](interleave-in-parent.html) | The parent table in the [interleaved hierarchy](interleave-in-parent.html#interleaved-hierarchy).

### Users and privileges

To restore your users and privilege [grants](grant.html), do a full cluster backup and restore the cluster to a fresh cluster with no user data.

You can also backup the `system.users` table, and then [restore users and their passwords](#restoring-users-from-system-users-backup).

### Restore types

You can either restore from a full backup or from a full backup with incremental backups, based on the backup files you include:

Restore Type | Parameters
-------------|----------
Full backup | Include only the path to the full backup.
Full backup + <br>incremental backups | If the full backup and incremental backups were sent to the same destination, include only the path to the full backup (e.g., `RESTORE FROM 'full_backup_location';`).<br><br>If the incremental backups were sent to a different destination from the full backup, include the path to the full backup as the first argument and the subsequent incremental backups from oldest to newest as the following arguments (e.g., `RESTORE FROM 'full_backup_location', 'incremental_location_1', 'incremental_location_2';`).

### Point-in-time restore

If the full or incremental backup was taken [with revision history](backup.html#backups-with-revision-history), you can restore the data as it existed at the specified point-in-time within the revision history captured by that backup.

If you do not specify a point-in-time, the data will be restored to the backup timestamp; that is, the restore will work as if the data was backed up without revision history.

#### Example - Point-in-time restore

{% include copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly' \
AS OF SYSTEM TIME '2017-02-26 10:00:00';
~~~

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

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/restore.html %}
</div>

{{site.data.alerts.callout_info}}
The `RESTORE` statement cannot be used within a [transaction](transactions.html).
{{site.data.alerts.end}}

## Required privileges

Only members of the `admin` role can run `RESTORE`. By default, the `root` user belongs to the `admin` role.

## Parameters

 Parameter | Description
-----------|-------------
 `table_pattern` | The table or [view](views.html) you want to restore.
 `database_name` | The name of the database you want to restore (i.e., restore all tables and views in the database). You can restore an entire database only if you had backed up the entire database.
 `full_backup_location` | The URL where the full backup is stored. <br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls).
 `incremental_backup_location` | The URL where an incremental backup is stored.  <br/><br/>Lists of incremental backups must be sorted from oldest to newest. The newest incremental backup's timestamp must be within the table's garbage collection period.<br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). <br/><br/>For more information about garbage collection, see [Configure Replication Zones](configure-replication-zones.html#replication-zone-variables).
 `AS OF SYSTEM TIME timestamp` | Restore data as it existed as of [`timestamp`](as-of-system-time.html). You can restore point-in-time data only if you had taken full or incremental backup [with revision history](backup.html#backups-with-revision-history).
 `kv_option_list` | Control your backup's behavior with [these options](#options).

### Backup file URLs

The URL for your backup's locations must use the following format:

{% include {{ page.version.version }}/misc/external-urls.md %}

### Options

You can include the following options as key-value pairs in the `kv_option_list` to control the restore process's behavior:

 Option                                                             | <div style="width:75px">Value</div>         | Description
 -------------------------------------------------------------------+---------------+-------------------------------------------------------
<a name="into_db"></a>`into_db`                                     | Database name                               | Use to [change the target database](#restore-into-a-different-database). This is useful if you want to restore a table that currently exists, but do not want to drop it.<br><br>Example: `WITH into_db = 'newdb'`
<a name="skip_missing_foreign_keys"></a>`skip_missing_foreign_keys` | N/A                                         | Use to remove the [foreign key](foreign-key.html) constraints before restoring.<br><br>Example: `WITH skip_missing_foreign_keys`
<a name="skip_missing_sequences"></a>`skip_missing_sequences`       | N/A                                         | Use to ignore [sequence](show-sequences.html) dependencies (i.e., the `DEFAULT` expression that uses the sequence).<br><br>Example: `WITH skip_missing_sequences`
`skip_missing_views`                                                | N/A                                         | Use to skip restoring [views](views.html) that cannot be restored because their dependencies are not being restored at the same time.<br><br>Example: `WITH skip_missing_views`

## Examples

### Restore a cluster

<span class="version-tag">New in v20.1</span> To restore a full cluster:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE FROM 'gs://acme-co-backup/test-cluster';
~~~

### Restore a single table

{% include copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly';
~~~

### Restore multiple tables

{% include copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers, bank.accounts FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly';
~~~

### Restore a database

{% include copy-clipboard.html %}
~~~ sql
> RESTORE DATABASE bank FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly';
~~~

{{site.data.alerts.callout_info}}<code>RESTORE DATABASE</code> can only be used if the entire database was backed up.{{site.data.alerts.end}}

### Restore from incremental backups

<span class="version-tag">New in v20.1</span> Restoring from incremental backups requires previous full and incremental backups. To restore from a destination containing the full backup, as well as the incremental backups (stored as subdirectories):

{% include copy-clipboard.html %}
~~~ sql
> RESTORE FROM 'gs://acme-co-backup/test-cluster';
~~~

To explicitly point to where your incremental backups are, use the `INCREMENTAL FROM` syntax. In this example, `-weekly` is the full backup and the two `-nightly` are incremental backups.

{% include copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers \
FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly', 'gs://acme-co-backup/database-bank-2017-03-28-nightly', 'gs://acme-co-backup/database-bank-2017-03-29-nightly';
~~~

### Point-in-time restore from incremental backups

Restoring from incremental backups requires previous full and incremental backups. In this example, `-weekly` is the full backup and the two `-nightly` are incremental backups:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE bank \
FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly', 'gs://acme-co-backup/database-bank-2017-03-28-nightly', 'gs://acme-co-backup/database-bank-2017-03-29-nightly' \
AS OF SYSTEM TIME '2017-02-28 10:00:00';
~~~

### Restore into a different database

By default, tables and views are restored to the database they originally belonged to. However, using the [`into_db`](#into_db) option, you can control the target database.

{% include copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers \
FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly' \
WITH into_db = 'newdb';
~~~

### Remove the foreign key before restore

By default, tables with [Foreign Key](foreign-key.html) constraints must be restored at the same time as the tables they reference. However, using the [`skip_missing_foreign_keys`](#skip_missing_foreign_keys) option you can remove the Foreign Key constraint from the table and then restore it.

{% include copy-clipboard.html %}
~~~ sql
> RESTORE bank.accounts \
FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly' \
WITH skip_missing_foreign_keys;
~~~

### Restoring users from `system.users` backup

The `system.users` table stores your cluster's usernames and their hashed passwords. To restore them, you must restore the `system.users` table into a new database because you cannot drop the existing `system.users` table.

After it's restored into a new database, you can write the restored `users` table data to the cluster's existing `system.users` table.

{% include copy-clipboard.html %}
~~~ sql
> RESTORE system.users \
FROM 'azure://acme-co-backup/table-users-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co' \
WITH into_db = 'newdb';
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO system.users SELECT * FROM newdb.users;
~~~

{% include copy-clipboard.html %}
~~~ sql
> DROP TABLE newdb.users;
~~~

### Restore from a locality-aware backup

You can create locality-aware backups such that each node writes files only to the backup destination that matches the [node locality](configure-replication-zones.html#descriptive-attributes-assigned-to-nodes) configured at [node startup](cockroach-start.html).

A locality-aware backup is specified by a list of URIs, each of which has a `COCKROACH_LOCALITY` URL parameter whose single value is either `default` or a single locality key-value pair such as `region=us-east`. At least one `COCKROACH_LOCALITY` must be the `default`. Given a list of URIs that together contain the locations of all of the files for a single locality-aware backup, [`RESTORE`][restore] can read in that backup.

Note that the list of URIs passed to [`RESTORE`][restore] may be different from the URIs originally passed to [`BACKUP`][backup]. This is because it's possible to move the contents of one of the parts of a locality-aware backup (i.e., the files written to that destination) to a different location, or even to consolidate all the files for a locality-aware backup into a single location.

{{site.data.alerts.callout_info}}
[`RESTORE`][restore] is not truly locality-aware; while restoring from backups, a node may read from a store that does not match its locality. This can happen because [`BACKUP`][backup] does not back up [zone configurations](configure-replication-zones.html), so [`RESTORE`][restore] has no way of knowing how to take node localities into account when restoring data from a backup.
{{site.data.alerts.end}}

#### Example - Restore from a locality-aware backup

For example, a backup created with

{% include copy-clipboard.html %}
~~~ sql
> BACKUP bank TO
	  ('s3://us-east-bucket?COCKROACH_LOCALITY=default', 's3://us-west-bucket?COCKROACH_LOCALITY=region%3Dus-west');
~~~

can be restored by running:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE bank FROM ('s3://us-east-bucket', 's3://us-west-bucket');
~~~

Note that the first URI in the list has to be the URI specified as the `default` URI when the backup was created. If you have moved your backups to a different location since the backup was originally taken, the first URI must be the new location of the files originally written to the `default` location.

#### Example - Restore from an incremental locality-aware backup

A locality-aware backup URI can also be used in place of any incremental backup URI in [`RESTORE`][restore].

For example, an incremental locality-aware backup created with

{% include copy-clipboard.html %}
~~~ sql
> BACKUP bank TO
	  ('s3://us-east-bucket/database-bank-2019-10-08-nightly?COCKROACH_LOCALITY=default', 's3://us-west-bucket/database-bank-2019-10-08-nightly?COCKROACH_LOCALITY=region%3Dus-west')
  INCREMENTAL FROM
	  's3://us-east-bucket/database-bank-2019-10-07-weekly';
~~~

can be restored by running:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE bank FROM
  	('s3://us-east-bucket/database-bank-2019-10-07-weekly', 's3://us-west-bucket/database-bank-2019-10-07-weekly'),
	  ('s3://us-east-bucket/database-bank-2019-10-08-nightly', 's3://us-west-bucket/database-bank-2019-10-08-nightly');
~~~

## See also

- [`BACKUP`][backup]
- [Backup and Restore Data](backup-and-restore.html)
- [Configure Replication Zones](configure-replication-zones.html)

<!-- Reference links -->

[backup]:  backup.html
[restore]: restore.html
