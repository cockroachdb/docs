---
title: RESTORE
summary: Restore your CockroachDB cluster to a cloud storage services such as AWS S3, Google Cloud Storage, or other NFS.
toc: true
---

{{site.data.alerts.callout_info}}
 `RESTORE` no longer requires an enterprise license, regardless of the options passed to it or to the backup it is restoring.
{{site.data.alerts.end}}

The `RESTORE` [statement](sql-statements.html) restores your cluster's schemas and data from [a `BACKUP`][backup] stored on a services such as AWS S3, Google Cloud Storage, NFS, or HTTP storage.

Because CockroachDB is designed with high fault tolerance, restores are designed primarily for disaster recovery, i.e., restarting your cluster if it loses a majority of its nodes. Isolated issues (such as small-scale node outages) do not require any intervention.

You can restore:

- [A full cluster](#full-cluster)
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
 `AS OF SYSTEM TIME timestamp` | Restore data as it existed as of [`timestamp`](as-of-system-time.html). You can restore point-in-time data only if you had taken full or incremental backup [with revision history](take-backups-with-revision-history-and-restore-from-a-point-in-time.html).
 `kv_option_list` | Control your backup's behavior with [these options](#options).

{{site.data.alerts.callout_info}}
The `RESTORE` statement cannot be used within a [transaction](transactions.html).
{{site.data.alerts.end}}

### Options

You can include the following options as key-value pairs in the `kv_option_list` to control the restore process's behavior:

 Option                                                             | <div style="width:75px">Value</div>         | Description
 -------------------------------------------------------------------+---------------+-------------------------------------------------------
<a name="into_db"></a>`into_db`                                     | Database name                               | Use to [change the target database](restore.html#restore-into-a-different-database). This is useful if you want to restore a table that currently exists, but do not want to drop it.<br><br>Example: `WITH into_db = 'newdb'`
<a name="skip_missing_foreign_keys"></a>`skip_missing_foreign_keys` | N/A                                         | Use to remove the [foreign key](foreign-key.html) constraints before restoring.<br><br>Example: `WITH skip_missing_foreign_keys`
<a name="skip_missing_sequences"></a>`skip_missing_sequences`       | N/A                                         | Use to ignore [sequence](show-sequences.html) dependencies (i.e., the `DEFAULT` expression that uses the sequence).<br><br>Example: `WITH skip_missing_sequences`
`skip_missing_views`                                                | N/A                                         | Use to skip restoring [views](views.html) that cannot be restored because their dependencies are not being restored at the same time.<br><br>Example: `WITH skip_missing_views`
`encryption_passphrase`                                             | Passphrase used to create the [encrypted backup](take-and-restore-encrypted-backups.html) |  The passphrase used to decrypt the file(s) that were encrypted by the [`BACKUP`](take-and-restore-encrypted-backups.html) statement.
`detached`                                                          | N/A                                         |  When a restore runs in `detached` mode, the restore job will execute asynchronously and the job ID will be returned immediately without waiting for the job to finish. Note that the job completion status will not be returned. To check on the job status, use the [`SHOW JOBS`](show-jobs.html) statement.

### Backup file URLs

CockroachDB uses the URL provided to construct a secure API call to the service you specify. The URL structure depends on the type of file storage you are using. For more information, see the following:

- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
- [Use a Local File Server for Bulk Operations](use-a-local-file-server-for-bulk-operations.html)

## Functional details

### Restore targets

You can restore:

- [A full cluster](#full-cluster)
- [Databases](#databases)
- [Tables](#tables)

#### Full cluster

 A full cluster restore can only be run on a target cluster with no user-created databases or tables. Restoring a full cluster includes:

- All user tables
- Relevant system tables
- All [databases](create-database.html)
- All [tables](create-table.html) (which automatically includes their [indexes](indexes.html))
- All [views](views.html)

{{site.data.alerts.callout_info}}
When you restore a full cluster with an enterprise license, it will restore the [enterprise license](enterprise-licensing.html) of the cluster you are restoring from. If you want to use a different license in the new cluster, make sure to [update the license](enterprise-licensing.html#set-a-license) _after_ the restore is complete.
{{site.data.alerts.end}}

#### Databases

To restore a database, the database cannot already exist in the target cluster. Restoring a database will create the database and restore all of its tables and views. By default, tables and views are restored into a database with the name of the database from which they were backed up. However, also consider:

- You can choose to [change the target database](#into_db).
- If it no longer exists, you must [create the target database](create-database.html).

The target database must have not have tables or views with the same name as the tables or views you're restoring.

#### Tables

You can also restore individual tables (which automatically includes their indexes) or [views](views.html) from a backup. This process uses the data stored in the backup to create entirely new tables or views in the [target database](#databases).

{{site.data.alerts.callout_info}}
`RESTORE` only offers table-level granularity; it _does not_ support restoring subsets of a table.
{{site.data.alerts.end}}

To restore individual tables, the tables can not already exist in the [target database](#databases). This means the target database must not have tables or views with the same name as the restored table or view. If any of the restore target's names are being used, you can:

- [`DROP TABLE`](drop-table.html), [`DROP VIEW`](drop-view.html), or [`DROP SEQUENCE`](drop-sequence.html) and then restore them. Note that a sequence cannot be dropped while it is being used in a column's `DEFAULT` expression, so those expressions must be dropped before the sequence is dropped, and recreated after the sequence is recreated. The `setval` [function](functions-and-operators.html#sequence-functions) can be used to set the value of the sequence to what it was previously.
- [Restore the table or view into a different database](#into_db).

 When restoring an individual table that references a user-defined type (e.g., [`ENUM`](enum.html)), CockroachDB will first check to see if the type already exists. The restore will attempt the following for each user-defined type within a table backup:

- If there is _not_ an existing type in the cluster with the same name, CockroachDB will create the user-defined type as it exists in the backup.
- If there is an existing type in the cluster with the same name that is compatible with the type in the backup, CockroachDB will map the type in the backup to the type in the cluster.
- If there is an existing type in the cluster with the same name but it is _not_ compatible with the type in the backup, the restore will not succeed and you will be asked to resolve the naming conflict. You can do this by either dropping or renaming the existing user-defined type.

In general, two types are compatible if they are the same kind (e.g., an enum is only compatible with other enums). Additionally, enums are only compatible if they have the same ordered set of elements that have also been [created in the same way](https://github.com/cockroachdb/cockroach/blob/master/docs/RFCS/20200331_enums.md#physical-layout). For example:

- `CREATE TYPE t1 AS ENUM ('yes', 'no')` and `CREATE TYPE t2 AS ENUM ('yes', 'no')` are compatible.
- `CREATE TYPE t1 AS ENUM ('yes', 'no')` and `CREATE TYPE t2 AS ENUM ('no', 'yes')` are not compatible.
- `CREATE TYPE t1 AS ENUM ('yes', 'no')` and `CREATE TYPE t2 AS ENUM ('yes'); ALTER TYPE t2 ADD VALUE ('no')` are not compatible because they were not created in the same way.


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

If you are not doing a full cluster restore, the table-level privileges need to be granted to the users after the restore is complete. To do this, backup the `system.users` table, [restore users and their passwords](restore.html#restoring-users-from-system-users-backup), and then [grant](grant.html) the table-level privileges.

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

 To restore a full cluster:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE FROM 'gs://acme-co-backup/test-cluster';
~~~

### Restore a database

{% include copy-clipboard.html %}
~~~ sql
> RESTORE DATABASE bank FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly';
~~~

{{site.data.alerts.callout_info}}
`RESTORE DATABASE` can only be used if the entire database was backed up.
{{site.data.alerts.end}}

### Restore a table

To restore a single table:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly';
~~~

To restore multiple tables:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers, bank.accounts FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly';
~~~

### Restore from incremental backups

Restoring from incremental backups requires previous full and incremental backups. To restore from a destination containing the full backup, as well as the incremental backups (stored as subdirectories):

{% include copy-clipboard.html %}
~~~ sql
> RESTORE FROM 'gs://acme-co-backup/test-cluster';
~~~

To explicitly point to where your incremental backups are, provide the previous full and incremental backup locations in a comma-separated list. In this example, `-weekly` is the full backup and the two `-nightly` are incremental backups.

{% include copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers \
FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly', 'gs://acme-co-backup/database-bank-2017-03-28-nightly', 'gs://acme-co-backup/database-bank-2017-03-29-nightly';
~~~

{{site.data.alerts.callout_info}}
If you are restoring from HTTP storage, provide the previous full and incremental backup locations in a comma-separated list. You cannot use the simplified syntax.
{{site.data.alerts.end}}

### Restore a backup asynchronously

 Use the `detached` [option](#options) to execute the restore job asynchronously:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE FROM \
'gs://acme-co-backup/test-cluster' \
WITH detached;
~~~

The job ID is returned immediately without waiting for the job to finish:

~~~
        job_id
----------------------
  592786066399264769
(1 row)
~~~

### Other restore usages

#### Restore into a different database

By default, tables and views are restored to the database they originally belonged to. However, using the [`into_db`](restore.html#into_db) option, you can control the target database.

{% include copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers \
FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly' \
WITH into_db = 'newdb';
~~~

#### Remove the foreign key before restore

By default, tables with [Foreign Key](foreign-key.html) constraints must be restored at the same time as the tables they reference. However, using the [`skip_missing_foreign_keys`](restore.html#skip_missing_foreign_keys) option you can remove the Foreign Key constraint from the table and then restore it.

{% include copy-clipboard.html %}
~~~ sql
> RESTORE bank.accounts \
FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly' \
WITH skip_missing_foreign_keys;
~~~

#### Restoring users from `system.users` backup

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

## See also

- [`BACKUP`][backup]
- [Take Full and Incremental Backups](take-and-restore-encrypted-backups.html)
- [Take and Restore Encrypted Backups](take-and-restore-encrypted-backups.html)
- [Take and Restore Locality-aware Backups](take-and-restore-locality-aware-backups.html)
- [Take Backups with Revision History and Restore from a Point-in-time](take-backups-with-revision-history-and-restore-from-a-point-in-time.html)
-  [Manage a Backup Schedule](manage-a-backup-schedule.html)
- [Configure Replication Zones](configure-replication-zones.html)
- [`ENUM`](enum.html)
- [`CREATE TYPE`](create-type.html)
- [`DROP TYPE`](drop-type.html)

<!-- Reference links -->

[backup]:  backup.html
[restore]: restore.html
