---
title: RESTORE
summary: Restore your CockroachDB cluster to a cloud storage services such as AWS S3, Google Cloud Storage, or other NFS.
toc: true
---

{{site.data.alerts.callout_danger}}The <code>RESTORE</code> feature is only available to <a href="https://www.cockroachlabs.com/product/cockroachdb/">enterprise</a> users. For non-enterprise restores, see <a href="backup-and-restore.html">Restore Data</a>.{{site.data.alerts.end}}

The `RESTORE` [statement](sql-statements.html) restores your cluster's schemas and data from [an enterprise `BACKUP`](backup.html) stored on a services such as AWS S3, Google Cloud Storage, NFS, or HTTP storage.

Because CockroachDB is designed with high fault tolerance, restores are designed primarily for disaster recovery, i.e., restarting your cluster if it loses a majority of its nodes. Isolated issues (such as small-scale node outages) do not require any intervention.

## Functional details

### Restore targets

You can restore entire tables (which automatically includes their indexes) or [views](views.html) from a backup. This process uses the data stored in the backup to create entirely new tables or views in the [target database](#target-database).

The notion of "restoring a database" simply restores all of the tables and views that belong to the database, but does not create the database. For more information, see [Target Database](#target-database).

{{site.data.alerts.callout_info}}<code>RESTORE</code> only offers table-level granularity; it <em>does not</em> support restoring subsets of a table.{{site.data.alerts.end}}

Because this process is designed for disaster recovery, CockroachDB expects that the tables do not currently exist in the [target database](#target-database). This means the target database must have not have tables or views with the same name as the restored table or view. If any of the restore target's names are being used, you can:

- [`DROP TABLE`](drop-table.html), [`DROP VIEW`](drop-view.html), or [`DROP SEQUENCE`](drop-sequence.html) and then restore them. Note that a sequence cannot be dropped while it is being used in a column's `DEFAULT` expression, so those expressions must be dropped before the sequence is dropped, and recreated after the sequence is recreated. The `setval` [function](functions-and-operators.html#sequence-functions) can be used to set the value of the sequence to what it was previously.
- [Restore the table or view into a different database](#into_db).

### Object dependencies

Dependent objects must be restored at the same time as the objects they depend on.

Object | Depends On
-------|-----------
Table with [foreign key](foreign-key.html) constraints | The table it `REFERENCES` (however, this dependency can be [removed during the restore](#skip_missing_foreign_keys)).
Table with a [sequence](create-sequence.html) | The sequence.
[Views](views.html) | The tables used in the view's `SELECT` statement.
[Interleaved tables](interleave-in-parent.html) | The parent table in the [interleaved hierarchy](interleave-in-parent.html#interleaved-hierarchy).

### Target database

By default, tables and views are restored into a database with the name of the database from which they were backed up. However, also consider:

- You can choose to [change the target database](#into_db).
- If it no longer exists, you must [create the target database](create-database.html).

The target database must have not have tables or views with the same name as the tables or views you're restoring.

### Users and privileges

Table and view users/privileges are not restored. Restored tables and views instead inherit the privileges of the database into which they're restored.

However, every backup includes `system.users`, so you can [restore users and their passwords](#restoring-users-from-system-users-backup).

Table-level privileges must be [granted to users](grant.html) after the restore is complete.

### Restore types

You can either restore from a full backup or from a full backup with incremental backups, based on the backup files you include.

Restore Type | Parameters
----|----------
**Full backup** | Include only the path to the full backup.
**Full backup + <br/>incremental backups** | Include the path to the full backup as the first argument and the subsequent incremental backups from oldest to newest as the following arguments.

### Point-in-time restore

{% include {{ page.version.version }}/misc/beta-warning.md %}

If the full or incremental backup was taken [with revision history](backup.html#backups-with-revision-history), you can restore the data as it existed at the specified point-in-time within the revision history captured by that backup.

If you do not specify a point-in-time, the data will be restored to the backup timestamp; that is, the restore will work as if the data was backed up without revision history.

## Performance

The `RESTORE` process minimizes its impact to the cluster's performance by distributing work to all nodes. Subsets of the restored data (known as ranges) are evenly distributed among randomly selected nodes, with each range initially restored to only one node. Once the range is restored, the node begins replicating it others.

{{site.data.alerts.callout_info}}When a <code>RESTORE</code> fails or is canceled, partially restored data is properly cleaned up. This can have a minor, temporary impact on cluster performance.{{site.data.alerts.end}}

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

{{site.data.alerts.callout_info}}The <code>RESTORE</code> statement cannot be used within a <a href=transactions.html>transaction</a>.{{site.data.alerts.end}}

## Required privileges

Only members of the `admin` role can run `RESTORE`. By default, the `root` user belongs to the `admin` role.

## Parameters

 Parameter | Description |
-----------|-------------|
 `table_pattern` | The table or [view](views.html) you want to restore.
 `database_name` | The name of the database you want to restore (i.e., restore all tables and views in the database). You can restore an entire database only if you had backed up the entire database.
 `full_backup_location` | The URL where the full backup is stored. <br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls).
 `incremental_backup_location` | The URL where an incremental backup is stored.  <br/><br/>Lists of incremental backups must be sorted from oldest to newest. The newest incremental backup's timestamp must be within the table's garbage collection period.<br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls). <br/><br/>For more information about garbage collection, see [Configure Replication Zones](configure-replication-zones.html#replication-zone-variables).
 `AS OF SYSTEM TIME timestamp` | Restore data as it existed as of [`timestamp`](as-of-system-time.html). You can restore point-in-time data only if you had taken full or incremental backup [with revision history](backup.html#backups-with-revision-history).
 `kv_option_list` | Control your backup's behavior with [these options](#restore-option-list).

### Backup file URLs

The URL for your backup's locations must use the following format:

{% include {{ page.version.version }}/misc/external-urls.md %}

### Restore option list

You can include the following options as key-value pairs in the `kv_option_list` to control the restore process's behavior.

#### `into_db`

- **Description**: If you want to restore a table or view into a database other than the one it originally existed in, you can [change the target database](#restore-into-a-different-database). This is useful if you want to restore a table that currently exists, but do not want to drop it.
- **Key**: `into_db`
- **Value**: The name of the database you want to use
- **Example**: `WITH into_db = 'newdb'`

#### `skip_missing_foreign_keys`

- **Description**: If you want to restore a table with a foreign key but do not want to restore the table it references, you can drop the Foreign Key constraint from the table and then have it restored.
- **Key**: `skip_missing_foreign_keys`
- **Value**: *No value*
- **Example**: `WITH skip_missing_foreign_keys`

#### `skip_missing_sequences`

- **Description**: If you want to restore a table that depends on a sequence but do not want to restore the sequence it references, you can drop the sequence dependency from a table (i.e., the `DEFAULT` expression that uses the sequence) and then have it restored.
- **Key**: `skip_missing_sequences`
- **Value**: *No value*
- **Example**: `WITH skip_missing_sequences`

## Examples

### Restore a single table

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly';
~~~

### Restore multiple tables

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers, bank.accounts FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly';
~~~

### Restore an entire database

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE DATABASE bank FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly';
~~~

{{site.data.alerts.callout_info}}<code>RESTORE DATABASE</code> can only be used if the entire database was backed up.{{site.data.alerts.end}}

### Point-in-time restore

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly' \
AS OF SYSTEM TIME '2017-02-26 10:00:00';
~~~

### Restore from incremental backups

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers \
FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly', 'gs://acme-co-backup/database-bank-2017-03-28-nightly', 'gs://acme-co-backup/database-bank-2017-03-29-nightly';
~~~

{{site.data.alerts.callout_success}}
Restoring from incremental backups requires previous full and incremental backups. In this example, `-weekly` is the full backup and the two `-nightly` are incremental backups.
{{site.data.alerts.end}}

### Point-in-time restore from incremental backups

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers \
FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly', 'gs://acme-co-backup/database-bank-2017-03-28-nightly', 'gs://acme-co-backup/database-bank-2017-03-29-nightly' \
AS OF SYSTEM TIME '2017-02-28 10:00:00';
~~~

{{site.data.alerts.callout_success}}
Restoring from incremental backups requires previous full and incremental backups. In this example, `-weekly` is the full backup and the two `-nightly` are incremental backups.
{{site.data.alerts.end}}

### Restore into a different database

By default, tables and views are restored to the database they originally belonged to. However, using the [`into_db`](#into_db) option, you can control the target database.

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers \
FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly' \
WITH into_db = 'newdb';
~~~

### Remove the foreign key before restore

By default, tables with [Foreign Key](foreign-key.html) constraints must be restored at the same time as the tables they reference. However, using the [`skip_missing_foreign_keys`](#skip_missing_foreign_keys) option you can remove the Foreign Key constraint from the table and then restore it.

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE bank.accounts \
FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly' \
WITH skip_missing_foreign_keys;
~~~

### Restoring users from `system.users` backup

The `system.users` table stores your cluster's usernames and their hashed passwords. To restore them, you must restore the `system.users` table into a new database because you cannot drop the existing `system.users` table.

After it's restored into a new database, you can write the restored `users` table data to the cluster's existing `system.users` table.

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE system.users \
FROM 'azure://acme-co-backup/table-users-2017-03-27-full?AZURE_ACCOUNT_KEY=hash&AZURE_ACCOUNT_NAME=acme-co' \
WITH into_db = 'newdb';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO system.users SELECT * FROM newdb.users;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TABLE newdb.users;
~~~

## See also

- [`BACKUP`](backup.html)
- [Configure Replication Zones](configure-replication-zones.html)
