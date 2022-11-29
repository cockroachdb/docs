---
title: RESTORE
summary: Restore your CockroachDB cluster to a cloud storage services such as AWS S3, Google Cloud Storage, or other NFS.
toc: true
docs_area: reference.sql
---

The `RESTORE` [statement](sql-statements.html) restores your cluster's schemas and data from [a `BACKUP`](backup.html) stored on services such as AWS S3, Google Cloud Storage, or NFS.

Because CockroachDB is designed with high fault tolerance, restores are designed primarily for disaster recovery, i.e., restarting your cluster if it loses a majority of its nodes. Isolated issues (such as small-scale node outages) do not require any intervention.

You can restore:

- [A full cluster](#full-cluster)
- [Databases](#databases)
- [Tables](#tables)

{% include {{ page.version.version }}/backups/backup-to-deprec.md %}

## Considerations

- `RESTORE` cannot restore backups made by newer versions of CockroachDB.
- `RESTORE` is a blocking statement. To run a restore job asynchronously, use the `DETACHED` option. See [Options](#options) for more usage detail.
- `RESTORE` no longer requires an {{ site.data.products.enterprise }} license, regardless of the options passed to it or to the backup it is restoring.
- [Zone configurations](configure-zone.html) present on the destination cluster prior to a restore will be **overwritten** during a [cluster restore](restore.html#full-cluster) with the zone configurations from the [backed up cluster](backup.html#backup-a-cluster). If there were no customized zone configurations on the cluster when the backup was taken, then after the restore the destination cluster will use the zone configuration from the [`RANGE DEFAULT` configuration](configure-replication-zones.html#view-the-default-replication-zone).
- You cannot restore a backup of a multi-region database into a single-region database.
- When the [`exclude_data_from_backup`](take-full-and-incremental-backups.html#exclude-a-tables-data-from-backups) parameter is set on a table, the table will not contain row data when restored.

## Required privileges

{{site.data.alerts.callout_info}}
Starting in v22.2, CockroachDB introduces a new restore privilege model that provides finer control over a user's privilege to restore backups. 

There is continued support for the [legacy privilege model](#required-privileges-using-the-legacy-privilege-model) in v22.2, however it **will be removed** in a future release. We recommend implementing the new privilege model that follows in this section for all restores.
{{site.data.alerts.end}}

{% include_cached new-in.html version="v22.2" %} You can grant the `RESTORE` privilege to a user or role depending on the type of restore required:

Restore | Privilege
-------+-----------
Cluster | Grant a user the system level `RESTORE` privilege. For example, `GRANT SYSTEM RESTORE TO user;`.
Database | Grant a user the system level `RESTORE` privilege to restore databases onto the cluster. For example, `GRANT SYSTEM RESTORE TO user;`.
Table | Grant a user the database level `RESTORE` privilege to restore schema objects into the database. For example, `GRANT RESTORE ON DATABASE nonadmin TO user;`.

The listed privileges do not cascade to objects lower in the schema tree. For example, if you are granted system-level restore privileges, this does not give you the privilege to restore a table. If you need the `RESTORE` privilege on a database to apply to all newly created tables in that database, use [`DEFAULT PRIVILEGES`](security-reference/authorization.html#default-privileges). You can add `RESTORE` to the user or role's default privileges with [`ALTER DEFAULT PRIVILEGES`](alter-default-privileges.html#grant-default-privileges-to-a-specific-role). 

Members of the [`admin` role](security-reference/authorization.html#admin-role) can run all three types of restore (cluster, database, and table) without the need to grant a specific `RESTORE` privilege.  However, we recommend using the `RESTORE` privilege model to create users or roles and grant them `RESTORE` privileges as necessary for stronger access control.

See [`GRANT`](grant.html) for detail on granting privileges to a role or user.

## Required privileges using the legacy privilege model

The following details the existing privilege model that CockroachDB supports in v22.2 and earlier. Support for this privilege model will be removed in a future release:

- [Full cluster restores](#full-cluster) can only be run by members of the [`ADMIN` role](security-reference/authorization.html#admin-role). By default, the `root` user belongs to the `admin` role.
- For all other restores, the user must have [write access](security-reference/authorization.html#managing-privileges) (`CREATE` or `INSERT`) on all objects affected.

See the [Required privileges](#required-privileges) section for the updated privilege model.

## Source privileges

{% include {{ page.version.version }}/misc/external-io-privilege.md %}

Either the `EXTERNALIOIMPLICITACCESS` system privilege or the [`admin`](security-reference/authorization.html#admin-role) role is required for the following scenarios:

- To interact with a cloud storage resource using [`IMPLICIT` authentication](cloud-storage-authentication.html).
- Use of a [custom endpoint](https://docs.aws.amazon.com/sdk-for-go/api/aws/endpoints/) on S3.
- [Nodelocal](cockroach-nodelocal-upload.html)

No special privilege is required for: 

- Interacting with an Amazon S3 and Google Cloud Storage resource using `SPECIFIED` credentials. Azure Storage is always `SPECIFIED` by default.
- Using [Userfile](use-userfile-for-bulk-operations.html) storage.

{% include {{ page.version.version }}/misc/bulk-permission-note.md %}

{% include {{ page.version.version }}/misc/s3-compatible-warning.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/restore.html %}
</div>

## Parameters

 Parameter | Description
-----------|-------------
 `table_pattern` | The table or [view](views.html) you want to restore.
 `database_name` | The name of the database you want to restore (i.e., restore all tables and views in the database). You can restore an entire database only if you had backed up the entire database.
 `collectionURI` | The [collection](take-full-and-incremental-backups.html#backup-collections) URI where the [full backup](take-full-and-incremental-backups.html#full-backups) (and appended [incremental backups](take-full-and-incremental-backups.html#incremental-backups), if applicable) is stored. <br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls).
 `LATEST` | Restore the most recent backup in the given collection URI. See the [Restore from the most recent backup](#restore-from-the-most-recent-backup) example.
 <a name="subdir-param"></a>`subdirectory` | Restore from a specific subdirectory in the given collection URI. See the [Restore a specific backup](#restore-a-specific-backup) example.
 `localityURI` | The URI where a [locality-aware backup](take-and-restore-locality-aware-backups.html) is stored. When restoring from an incremental locality-aware backup, you need to include **every** locality ever used, even if it was only used once.<br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls).
 <a name="as-of-system-time"></a>`AS OF SYSTEM TIME timestamp` | Restore data as it existed as of [`timestamp`](as-of-system-time.html). You can restore point-in-time data only if you had taken full or incremental backup [with revision history](take-backups-with-revision-history-and-restore-from-a-point-in-time.html).
 `restore_options_list` | Control your backup's behavior with [these options](#options).

### Options

You can control `RESTORE` behavior using any of the following in the `restore_options_list`. To set multiple `RESTORE` options, use a comma-separated list:

 Option                                                             | <div style="width:75px">Value</div>         | Description
 -------------------------------------------------------------------+---------------+-------------------------------------------------------
<a name="into_db"></a>`into_db`                                     | Database name                               | Use to [change the target database](#restore-tables-into-a-different-database) for table restores. (Does not apply to database or cluster restores.)<br><br>Example: `WITH into_db = 'newdb'`
<a name="skip_missing_foreign_keys"></a>`skip_missing_foreign_keys` | N/A                                         | Use to remove the missing [foreign key](foreign-key.html) constraints before restoring.<br><br>Example: `WITH skip_missing_foreign_keys`
<a name="skip_missing_sequences"></a>`skip_missing_sequences`       | N/A                                         | Use to ignore [sequence](show-sequences.html) dependencies (i.e., the `DEFAULT` expression that uses the sequence).<br><br>Example: `WITH skip_missing_sequences`
`skip_missing_sequence_owners`                                      | N/A                                         | Must be used when restoring either a table that was previously a [sequence owner](create-sequence.html#owned-by) or a sequence that was previously owned by a table.<br><br>Example: `WITH skip_missing_sequence_owners`
`skip_missing_views`                                                | N/A                                         | Use to skip restoring [views](views.html) that cannot be restored because their dependencies are not being restored at the same time.<br><br>Example: `WITH skip_missing_views`
<a name="skip-localities-check"></a>`skip_localities_check`         | N/A                                         |  Use to skip checking localities of a cluster before a restore when there are mismatched [cluster regions](multiregion-overview.html#cluster-regions) between the backup's cluster and the target cluster. <br><br>Example: `WITH skip_localities_check`
`encryption_passphrase`                                             | Passphrase used to create the [encrypted backup](take-and-restore-encrypted-backups.html) |  The passphrase used to decrypt the file(s) that were encrypted by the [`BACKUP`](take-and-restore-encrypted-backups.html) statement.
`DETACHED`                                                          | N/A                                         |  When `RESTORE` runs with `DETACHED`, the job will execute asynchronously. The job ID is returned after the restore job creation completes. Note that with `DETACHED` specified, further job information and the job completion status will not be returned. For more on the differences between the returned job data, see the [example](restore.html#restore-a-backup-asynchronously) below. To check on the job status, use the [`SHOW JOBS`](show-jobs.html) statement. <br><br>To run a restore within a [transaction](transactions.html), use the `DETACHED` option.
`debug_pause_on`                                                    | `"error" `                                    |  Use to have a `RESTORE` [job](show-jobs.html) self pause when it encounters an error. The `RESTORE` job can then be [resumed](resume-job.html) after the error has been fixed or [canceled](cancel-job.html) to rollback the job. <br><br>Example: `WITH debug_pause_on='error'`
`incremental_location`<a name="incr-location"></a> | [`STRING`](string.html) | Restore an incremental backup from the alternate collection URI the backup was originally taken with. <br><br>See [Restore incremental backups](#restore-from-incremental-backups) for more detail.
<a name="new-db-name"></a>`new_db_name`                             | Database name                                 | Rename a database during a restore with `RESTORE DATABASE movr ... WITH new_db_name = new_movr`. The existing backed-up database can remain active while the same database is restored with a different name. <br><br> See [Rename a database on restore](#rename-a-database-on-restore).
<span class="version-tag">New in v22.2:</span> `schema_only` | N/A | Verify that a backup is valid by running `RESTORE ... schema_only`, which will restore the backed-up schema without any user data. See [Backup Validation](backup-validation.html#validate-a-backup-is-restorable) for detail and an example. For specifics around cluster backups using `schema_only`, see [Cluster-level backup validation](backup-validation.html#cluster-level-backup-validation).
<span class="version-tag">New in v22.2:</span> `verify_backup_table_data` | N/A | Run a `schema_only` restore **and** have the restore read all user data from external storage, verify checksums, and discard the user data before writing it to disk. You must also include the `schema_only` option in the `RESTORE` statement with `verify_backup_table_data`. For more detail, see [Backup Validation](backup-validation.html#validate-backup-table-data-is-restorable).

### Backup file URLs

CockroachDB uses the URL provided to construct a secure API call to the service you specify. The URL structure depends on the type of file storage you are using. For more information, see the following:

- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)

    {{site.data.alerts.callout_info}}
    HTTP storage is not supported for `BACKUP` and `RESTORE`.
    {{site.data.alerts.end}}

- [Use a Local File Server for Bulk Operations](use-a-local-file-server-for-bulk-operations.html)

{% include {{ page.version.version }}/misc/external-connection-note.md %}

## Functional details

You can restore:

- [A full cluster](#full-cluster)
- [Databases](#databases)
- [Tables](#tables)

`RESTORE` will only restore the latest data in an object (table, database, cluster), or the latest data as per an [`AS OF SYSTEM TIME` restore](#as-of-system-time). That is, a restore will not include historical data even if you ran your backup with [`revision_history`](backup.html#with-revision-history). This means that if you issue an `AS OF SYSTEM TIME` query on a restored object, the query will fail or the response will be incorrect because there is no historical data to query. For example, if you restore a table at `2022-07-13 10:38:00`, it is not then possible to read or [back up](backup.html) that table at `2022-07-13 10:37:00` or earlier. This is also the case for backups with `revision_history` that might try to initiate a revision start time earlier than `2022-07-13 10:38:00`.

{{site.data.alerts.callout_info}}
You can exclude a table's row data from a backup using the [`exclude_data_from_backup`](take-full-and-incremental-backups.html#exclude-a-tables-data-from-backups) parameter. With this parameter set, a table will be empty when restored.
{{site.data.alerts.end}}

#### Full cluster

 A full cluster restore can only be run on a target cluster with no user-created databases or tables. Restoring a full cluster includes:

- All user tables
- Relevant system tables
- All [databases](create-database.html)
- All [tables](create-table.html) (which automatically includes their [indexes](indexes.html))
- All [views](views.html)

Also, a full cluster restore will:

- Restore [temporary tables](temporary-tables.html) to their original database during a full cluster restore.
- Drop the cluster's `defaultdb` and `postgres` [pre-loaded databases](show-databases.html#preloaded-databases) before the restore begins. You can only restore `defaultdb` and `postgres` if they are present in the original [backup](take-full-and-incremental-backups.html).

{{site.data.alerts.callout_info}}
When you restore a full cluster with an {{ site.data.products.enterprise }} license, it will restore the [{{ site.data.products.enterprise }} license](enterprise-licensing.html) of the cluster you are restoring from. If you want to use a different license in the new cluster, make sure to [update the license](licensing-faqs.html#set-a-license) **after** the restore is complete.
{{site.data.alerts.end}}

#### Databases

Restoring a database will create a new database and restore all of its tables and views. The created database will have the name of the database in the backup.

~~~ sql
RESTORE DATABASE backup_database_name FROM LATEST in 'your_backup_collection_URI';
~~~

To restore a database that already exists in a cluster, use the `new_db_name` option with `RESTORE` to provide a new name for the database. See the [Rename a database on restore](#rename-a-database-on-restore) example.

{{site.data.alerts.callout_success}}
If [dropping](drop-database.html) or [renaming](rename-database.html) an existing database is not an option, you can use [_table_ restore](#restore-a-table) to restore all tables into the existing database by using the [`WITH into_db` option](#options).
{{site.data.alerts.end}}

#### Tables

You can also restore individual tables (which automatically includes their indexes) or [views](views.html) from a backup. This process uses the data stored in the backup to create entirely new tables or views in the target database.

By default, tables and views are restored into a target database matching the name of the database from which they were backed up. If the target database does not exist, you must [create it](create-database.html). You can choose to change the target database with the [`into_db` option](#into_db).

The target database must not have tables or views with the same name as the tables or views you're restoring. If any of the restore target's names are being used, you can:

- [`DROP TABLE`](drop-table.html), [`DROP VIEW`](drop-view.html), or [`DROP SEQUENCE`](drop-sequence.html) and then restore them. Note that a sequence cannot be dropped while it is being used in a column's `DEFAULT` expression, so those expressions must be dropped before the sequence is dropped, and recreated after the sequence is recreated. The `setval` [function](functions-and-operators.html#sequence-functions) can be used to set the value of the sequence to what it was previously.
- [Restore the table or view into a different database](#into_db).

{{site.data.alerts.callout_info}}
`RESTORE` only offers table-level granularity; it **does not** support restoring subsets of a table.
{{site.data.alerts.end}}

When restoring an individual table that references a user-defined type (e.g., [`ENUM`](enum.html)), CockroachDB will first check to see if the type already exists. The restore will attempt the following for each user-defined type within a table backup:

- If there is _not_ an existing type in the cluster with the same name, CockroachDB will create the user-defined type as it exists in the backup.
- If there is an existing type in the cluster with the same name that is compatible with the type in the backup, CockroachDB will map the type in the backup to the type in the cluster.
- If there is an existing type in the cluster with the same name but it is _not_ compatible with the type in the backup, the restore will not succeed and you will be asked to resolve the naming conflict. You can do this by either [dropping](drop-type.html) or [renaming](alter-type.html) the existing user-defined type.

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

### Users and privileges

The owner of restored objects will be the user running the restore job. To restore your users and privilege [grants](grant.html), you can do a cluster backup and restore the cluster to a fresh cluster with no user data.

If you are not doing a full cluster restore, the table-level privileges need to be granted to the users after the restore is complete. (By default, the user restoring will become the owner of the restored objects.) To grant table-level privileges after a restore, backup the `system.users` table, [restore users and their passwords](restore.html#restoring-users-from-system-users-backup), and then [grant](grant.html) the table-level privileges.

### Restore types

You can either restore from a full backup or from a full backup with incremental backups, based on the backup files you include:

Restore Type | Parameters
-------------|----------
Full backup | Include the path to the full backup destination and the [subdirectory](#view-the-backup-subdirectories) of the backup. See the [Examples](#examples) section for syntax of [cluster](#restore-a-cluster), [database](#restore-a-database), and [table](#restore-a-table) restores.
Full backup + <br>incremental backups | Include the path that contains the backup collection and the [subdirectory](#view-the-backup-subdirectories) containing the incremental backup. See [Restore from incremental backups](#restore-from-incremental-backups) for an example.

{{site.data.alerts.callout_info}}
CockroachDB does **not** support incremental-only restores.
{{site.data.alerts.end}}

## Performance

- The `RESTORE` process minimizes its impact to the cluster's performance by distributing work to all nodes. Subsets of the restored data (known as ranges) are evenly distributed among randomly selected nodes, with each range initially restored to only one node. Once the range is restored, the node begins replicating it others.
- When a `RESTORE` fails or is canceled, partially restored data is properly cleaned up. This can have a minor, temporary impact on cluster performance.
- A restore job will pause if a node in the cluster runs out of disk space. See [Viewing and controlling restore jobs](#viewing-and-controlling-restore-jobs) for information on resuming and showing the progress of restore jobs.
- A restore job will [pause](pause-job.html) instead of entering a `failed` state if it continues to encounter transient errors once it has retried a maximum number of times. Once the restore has paused, you can either [resume](resume-job.html) or [cancel](cancel-job.html) it.

## Restoring to multi-region databases

 Restoring to a [multi-region database](multiregion-overview.html) is supported with some limitations. This section outlines details and settings that should be considered when restoring into multi-region databases:

- A [cluster's regions](multiregion-overview.html#cluster-regions) will be checked before a restore. Mismatched regions between backup and restore clusters will be flagged before the restore begins, which allows for a decision between updating the [cluster localities](cockroach-start.html#locality) or restoring with the [`skip_localities_check`](#skip-localities-check) option to continue with the restore regardless.

- A database that is restored with the `sql.defaults.primary_region` [cluster setting](cluster-settings.html) will have the [`PRIMARY REGION`](set-primary-region.html) from this cluster setting assigned to the target database.

- `RESTORE` supports restoring **non**-multi-region tables into a multi-region database and sets the table locality as [`REGIONAL BY TABLE`](multiregion-overview.html#regional-tables) to the primary region of the target database.

- Restoring tables from multi-region databases with table localities set to [`REGIONAL BY ROW`](multiregion-overview.html#regional-by-row-tables), `REGIONAL BY TABLE`, [`REGIONAL BY TABLE IN PRIMARY REGION`](set-locality.html#regional-by-table), and [`GLOBAL`](set-locality.html#global) to another multi-region database is supported.

- When restoring a `REGIONAL BY TABLE IN PRIMARY REGION` table, if the primary region is different in the source database to the target database this will be implicitly changed on restore.

- Restoring a [partition](partitioning.html) of a `REGIONAL BY ROW` table is not supported.

- {% include {{ page.version.version }}/known-limitations/restore-multiregion-match.md %}

The ordering of regions and how region matching is determined is a known limitation. See the [Known Limitations](#known-limitations) section for the tracking issues on limitations around `RESTORE` and multi-region support.

For more on multi-region databases, see the [Multi-Region Capabilities Overview](multiregion-overview.html).

{% include {{page.version.version}}/sql/sql-defaults-cluster-settings-deprecation-notice.md %}

## Viewing and controlling restore jobs

After CockroachDB successfully initiates a restore, it registers the restore as a job, which you can view with [`SHOW JOBS`](show-jobs.html).

After the restore has been initiated, you can control it with [`PAUSE JOB`](pause-job.html), [`RESUME JOB`](resume-job.html), and [`CANCEL JOB`](cancel-job.html).

{{site.data.alerts.callout_info}}
If initiated correctly, the statement returns when the restore is finished or if it encounters an error. In some cases, the restore can continue after an error has been returned (the error message will tell you that the restore has resumed in background).
{{site.data.alerts.end}}

## Examples

{% include {{ page.version.version }}/backups/bulk-auth-options.md %}

{% include {{ page.version.version }}/misc/external-connection-note.md %}

<div class="filters clearfix">
  <button class="filter-button" data-scope="s3">Amazon S3</button>
  <button class="filter-button" data-scope="azure">Azure Storage</button>
  <button class="filter-button" data-scope="gcs">Google Cloud Storage</button>
</div>

There are two ways to specify a backup to restore:

- [Restoring from the most recent backup](#restore-from-the-most-recent-backup)
- [Restoring from a specific backup](#restore-from-a-specific-backup)

The examples in this section demonstrate restoring from the most recent backup using the `LATEST` syntax.

<section class="filter-content" markdown="1" data-scope="s3">

{% include {{ page.version.version }}/misc/auth-intro-examples.md %}

### View the backup subdirectories

`BACKUP ... INTO` adds a backup to a [backup collection](take-full-and-incremental-backups.html#backup-collections) location. To view the backup paths in a given collection location, use [`SHOW BACKUPS`](show-backup.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUPS IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}';
~~~

~~~
       path
-------------------------
/2021/12/14-190909.83
/2021/12/20-155249.37
/2021/12/21-142943.73
(3 rows)
~~~

When you want to [restore a specific backup](#restore-a-specific-backup), add the backup's subdirectory path (e.g., `/2021/12/21-142943.73`) to the `RESTORE` statement. For details on viewing the most recent backup, see [`SHOW BACKUP FROM {subdirectory} in {collectionURI}`](show-backup.html#show-the-most-recent-backup).

### Restore the most recent backup

To restore from the most recent backup in the collection's location, use the `LATEST` syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM LATEST IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}';
~~~

### Restore a specific backup

To restore a specific backup, use the backup's subdirectory in the collection's location:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM '2021/03/23-213101.37' IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}';
~~~

To view the available subdirectories, use [`SHOW BACKUPS`](#view-the-backup-subdirectories).

### Restore a cluster

To restore a full cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM LATEST IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}';
~~~

To view the available subdirectories, use [`SHOW BACKUPS`](#view-the-backup-subdirectories).

### Restore a database

To restore a database:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE DATABASE bank FROM LATEST IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}';
~~~

To view the available subdirectories, use [`SHOW BACKUPS`](#view-the-backup-subdirectories).

{{site.data.alerts.callout_info}}
`RESTORE DATABASE` can only be used if the entire database was backed up.
{{site.data.alerts.end}}

### Restore a table

To restore a single table:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE TABLE bank.customers FROM LATEST IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}';
~~~

To restore multiple tables:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE TABLE bank.customers, bank.accounts FROM LATEST IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}';
~~~

To view the available subdirectories, use [`SHOW BACKUPS`](#view-the-backup-subdirectories).

### Restore from incremental backups

To restore the most recent [incremental backup](take-full-and-incremental-backups.html#incremental-backups) from a location containing the full and incremental backup:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE DATABASE bank FROM LATEST IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}';
~~~

{% include {{ page.version.version }}/backups/no-incremental-restore.md %}

{{site.data.alerts.callout_info}}
 `RESTORE` will re-validate [indexes](indexes.html) when [incremental backups](take-full-and-incremental-backups.html) are created from an older version (v20.2.2 and earlier or v20.1.4 and earlier), but restored by a newer version (v21.1.0+). These earlier releases may have included incomplete data for indexes that were in the process of being created.
{{site.data.alerts.end}}

### Restore a backup asynchronously

Use the `DETACHED` [option](#options) to execute the restore [job](show-jobs.html) asynchronously:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE FROM LATEST IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}'
WITH DETACHED;
~~~

The job ID is returned after the restore job creation completes:

~~~
        job_id
----------------------
  592786066399264769
(1 row)
~~~

**Without** the `DETACHED` option, `RESTORE` will block the SQL connection until the job completes. Once finished, the job status and more detailed job data is returned:

~~~
job_id             |  status   | fraction_completed | rows | index_entries | bytes
---------------------+-----------+--------------------+------+---------------+--------
652471804772712449 | succeeded |                  1 |   50 |             0 |  4911
(1 row)
~~~

### Other restore usages

#### Restore tables into a different database

By default, tables and views are restored to the database they originally belonged to. However, using the [`into_db` option](#into_db), you can control the target database.

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers FROM LATEST IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}'
WITH into_db = 'newdb';
~~~

#### Rename a database on restore

To rename a database on restore, use the [`new_db_name`](#new-db-name) option:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE DATABASE bank FROM LATEST IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}'
WITH new_db_name = new_bank;
~~~

When you run `RESTORE` with `new_db_name`, the existing database that was originally backed up can remain active:

~~~
database_name
--------------+
defaultdb
bank
new_bank
postgres
system
~~~

#### Remove the foreign key before restore

By default, tables with [foreign key](foreign-key.html) constraints must be restored at the same time as the tables they reference. However, using the [`skip_missing_foreign_keys`](restore.html#skip_missing_foreign_keys) option you can remove the foreign key constraint from the table and then restore it.

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE bank.accounts FROM LATEST IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}'
WITH skip_missing_foreign_keys;
~~~

#### Restoring users from `system.users` backup

The `system.users` table stores your cluster's usernames and their hashed passwords. To restore them, you must restore the `system.users` table into a new database because you cannot drop the existing `system.users` table.

After it's restored into a new database, you can write the restored `users` table data to the cluster's existing `system.users` table.

First, create the new database that you'll restore the `system.users` table into:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE newdb;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE system.users  FROM LATEST IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}'
WITH into_db = 'newdb';
~~~

After the restore completes, add the `users` to the existing `system.users` table:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO system.users SELECT * FROM newdb.users;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TABLE newdb.users;
~~~

#### Restore from incremental backups in a different location

To restore an incremental backup that was taken using the [`incremental_location` option](backup.html#incr-location), you must run the `RESTORE` statement with both:

- the collection URI of the full backup
- the `incremental_location` option referencing the incremental backup's collection URI, as passed in the original `BACKUP` statement

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE TABLE movr.users FROM LATEST IN 's3://{bucket_name}?AWS_ACCESS_KEY_ID={key_id}&AWS_SECRET_ACCESS_KEY={access_key}' WITH incremental_location = '{incremental_backup_URI}';
~~~

For more detail on using this option with `BACKUP`, see [Incremental backups with explicitly specified destinations](take-full-and-incremental-backups.html#incremental-backups-with-explicitly-specified-destinations).

</section>

<section class="filter-content" markdown="1" data-scope="azure">

### View the backup subdirectories

`BACKUP ... INTO` adds a backup to a [backup collection](take-full-and-incremental-backups.html#backup-collections) location. To view the backup paths in a given collection location, use [`SHOW BACKUPS`](show-backup.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUPS IN 'azure://{container name}?AZURE_ACCOUNT_NAME={account name}&AZURE_ACCOUNT_KEY={url-encoded key}';
~~~

~~~
       path
-------------------------
/2021/12/14-190909.83
/2021/12/20-155249.37
/2021/12/21-142943.73
(3 rows)
~~~

When you want restore a specific backup, add the backup's subdirectory path (e.g., `/2021/12/21-142943.73`) to the `RESTORE` statement. For details on viewing the most recent backup, see [`SHOW BACKUP FROM {subdirectory} in {collectionURI}`](show-backup.html#show-the-most-recent-backup).

### Restore from the most recent backup

To restore from the most recent backup in the collection's location, use the `LATEST` syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM LATEST IN 'azure://{container name}?AZURE_ACCOUNT_NAME={account name}&AZURE_ACCOUNT_KEY={url-encoded key}';
~~~

### Restore from a specific backup

To restore a specific backup, use the backup's subdirectory in the collection's location:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM '2021/03/23-213101.37' IN 'azure://{container name}?AZURE_ACCOUNT_NAME={account name}&AZURE_ACCOUNT_KEY={url-encoded key}';
~~~

To view the available subdirectories, use [`SHOW BACKUPS`](#view-the-backup-subdirectories).

### Restore a cluster

To restore a full cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE FROM LATEST IN 'azure://{container name}?AZURE_ACCOUNT_NAME={account name}&AZURE_ACCOUNT_KEY={url-encoded key}';
~~~

To view the available subdirectories, use [`SHOW BACKUPS`](#view-the-backup-subdirectories).

### Restore a database

To restore a database:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE DATABASE bank FROM LATEST IN 'azure://{container name}?AZURE_ACCOUNT_NAME={account name}&AZURE_ACCOUNT_KEY={url-encoded key}';
~~~

To view the available subdirectories, use [`SHOW BACKUPS`](#view-the-backup-subdirectories).

{{site.data.alerts.callout_info}}
`RESTORE DATABASE` can only be used if the entire database was backed up.
{{site.data.alerts.end}}

### Restore a table

To restore a single table:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE TABLE bank.customers FROM LATEST IN 'azure://{container name}?AZURE_ACCOUNT_NAME={account name}&AZURE_ACCOUNT_KEY={url-encoded key}';
~~~

To restore multiple tables:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE TABLE bank.customers, bank.accounts FROM LATEST IN 'azure://{container name}?AZURE_ACCOUNT_NAME={account name}&AZURE_ACCOUNT_KEY={url-encoded key}';
~~~

To view the available subdirectories, use [`SHOW BACKUPS`](#view-the-backup-subdirectories).

### Restore from incremental backups

To restore the most recent [incremental backup](take-full-and-incremental-backups.html#incremental-backups) from a location containing the full and incremental backup:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE DATABASE bank FROM LATEST IN 'azure://{container name}?AZURE_ACCOUNT_NAME={account name}&AZURE_ACCOUNT_KEY={url-encoded key}';
~~~

{{site.data.alerts.callout_info}}
 `RESTORE` will re-validate [indexes](indexes.html) when [incremental backups](take-full-and-incremental-backups.html) are created from an older version (v20.2.2 and earlier or v20.1.4 and earlier), but restored by a newer version (v21.1.0+). These earlier releases may have included incomplete data for indexes that were in the process of being created.
{{site.data.alerts.end}}

### Restore a backup asynchronously

Use the `DETACHED` [option](#options) to execute the restore [job](show-jobs.html) asynchronously:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE FROM LATEST IN 'azure://{container name}?AZURE_ACCOUNT_NAME={account name}&AZURE_ACCOUNT_KEY={url-encoded key}' WITH DETACHED;
~~~

The job ID is returned after the restore job creation completes:

~~~
        job_id
----------------------
  592786066399264769
(1 row)
~~~

**Without** the `DETACHED` option, `RESTORE` will block the SQL connection until the job completes. Once finished, the job status and more detailed job data is returned:

~~~
job_id             |  status   | fraction_completed | rows | index_entries | bytes
---------------------+-----------+--------------------+------+---------------+--------
652471804772712449 | succeeded |                  1 |   50 |             0 |  4911
(1 row)
~~~

### Other restore usages

#### Restore tables into a different database

By default, tables and views are restored to the database they originally belonged to. However, using the [`into_db` option](#into_db), you can control the target database.

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers FROM LATEST IN 'azure://{container name}?AZURE_ACCOUNT_NAME={account name}&AZURE_ACCOUNT_KEY={url-encoded key}' WITH into_db = 'newdb';
~~~

#### Rename a database on restore

To rename a database on restore, use the [`new_db_name`](#new-db-name) option:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE DATABASE bank FROM LATEST IN 'azure://{container name}?AZURE_ACCOUNT_NAME={account name}&AZURE_ACCOUNT_KEY={url-encoded key}'
WITH new_db_name = new_bank;
~~~

When you run `RESTORE` with `new_db_name`, the existing database that was originally backed up can remain active:

~~~
database_name
--------------+
defaultdb
bank
new_bank
postgres
system
~~~

#### Remove the foreign key before restore

By default, tables with [foreign key](foreign-key.html) constraints must be restored at the same time as the tables they reference. However, using the [`skip_missing_foreign_keys`](restore.html#skip_missing_foreign_keys) option you can remove the foreign key constraint from the table and then restore it.

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE bank.accounts FROM LATEST IN 'azure://{container name}?AZURE_ACCOUNT_NAME={account name}&AZURE_ACCOUNT_KEY={url-encoded key}' WITH skip_missing_foreign_keys;
~~~

#### Restoring users from `system.users` backup

The `system.users` table stores your cluster's usernames and their hashed passwords. To restore them, you must restore the `system.users` table into a new database because you cannot drop the existing `system.users` table.

After it's restored into a new database, you can write the restored `users` table data to the cluster's existing `system.users` table.

First, create the new database that you'll restore the `system.users` table into:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE newdb;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE system.users FROM LATEST IN 'azure://{container name}?AZURE_ACCOUNT_NAME={account name}&AZURE_ACCOUNT_KEY={url-encoded key}' WITH into_db = 'newdb';
~~~

After the restore completes, add the `users` to the existing `system.users` table:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO system.users SELECT * FROM newdb.users;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TABLE newdb.users;
~~~

#### Restore from incremental backups in a different location

To restore an incremental backup that was taken using the [`incremental_location` option](backup.html#incr-location), you must run the `RESTORE` statement with both:

- the collection URI of the full backup
- the `incremental_location` option referencing the incremental backup's collection URI, as passed in the original `BACKUP` statement

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE TABLE movr.users FROM LATEST IN 'azure://{container name}?AZURE_ACCOUNT_NAME={account name}&AZURE_ACCOUNT_KEY={url-encoded key}' WITH incremental_location = '{incremental_backup_URI}';
~~~

For more detail on using this option with `BACKUP`, see [Incremental backups with explicitly specified destinations](take-full-and-incremental-backups.html#incremental-backups-with-explicitly-specified-destinations).

</section>

<section class="filter-content" markdown="1" data-scope="gcs">

{{site.data.alerts.callout_info}}
The examples in this section use the `AUTH=specified` parameter, which will be the default behavior in v21.2 and beyond for connecting to Google Cloud Storage. For more detail on how to pass your Google Cloud Storage credentials with this parameter, or, how to use `implicit` authentication, read [Cloud Storage Authentication](cloud-storage-authentication.html).
{{site.data.alerts.end}}

### View the backup subdirectories

`BACKUP ... INTO` adds a backup to a [backup collection](take-full-and-incremental-backups.html#backup-collections) location. To view the backup paths in a given collection location, use [`SHOW BACKUPS`](show-backup.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUPS IN 'gs://{bucket name}?AUTH=specified&CREDENTIALS={encoded key}';
~~~

~~~
       path
-------------------------
/2021/12/14-190909.83
/2021/12/20-155249.37
/2021/12/21-142943.73
(3 rows)
~~~

When you want restore a specific backup, add the backup's subdirectory path (e.g., `/2021/12/21-142943.73`) to the `RESTORE` statement. For details on viewing the most recent backup, see [`SHOW BACKUP FROM {subdirectory} in {collectionURI}`](show-backup.html#show-the-most-recent-backup).

### Restore from the most recent backup

To restore from the most recent backup in the collection's location, use the `LATEST` syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM LATEST IN 'gs://{bucket name}?AUTH=specified&CREDENTIALS={encoded key}';
~~~

### Restore from a specific backup

To restore a specific backup, use the backup's subdirectory in the collection's location:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM '2021/03/23-213101.37' IN 'gs://{bucket name}?AUTH=specified&CREDENTIALS={encoded key}';
~~~

To view the available subdirectories, use [`SHOW BACKUPS`](#view-the-backup-subdirectories).

### Restore a cluster

To restore a full cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE FROM LATEST IN 'gs://{bucket name}?AUTH=specified&CREDENTIALS={encoded key}';
~~~

To view the available subdirectories, use [`SHOW BACKUPS`](#view-the-backup-subdirectories).

### Restore a database

To restore a database:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE DATABASE bank FROM LATEST IN 'gs://{bucket name}?AUTH=specified&CREDENTIALS={encoded key}';
~~~

To view the available subdirectories, use [`SHOW BACKUPS`](#view-the-backup-subdirectories).

{{site.data.alerts.callout_info}}
`RESTORE DATABASE` can only be used if the entire database was backed up.
{{site.data.alerts.end}}

### Restore a table

To restore a single table:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE TABLE bank.customers FROM LATEST IN 'gs://{bucket name}?AUTH=specified&CREDENTIALS={encoded key}';
~~~

To restore multiple tables:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE TABLE bank.customers, bank.accounts FROM LATEST IN 'gs://{bucket name}?AUTH=specified&CREDENTIALS={encoded key}';
~~~

To view the available subdirectories, use [`SHOW BACKUPS`](#view-the-backup-subdirectories).

### Restore from incremental backups

To restore the most recent [incremental backup](take-full-and-incremental-backups.html#incremental-backups) from a location containing the full and incremental backup:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE DATABASE bank FROM LATEST IN 'gs://{bucket name}?AUTH=specified&CREDENTIALS={encoded key}';
~~~

{{site.data.alerts.callout_info}}
 `RESTORE` will re-validate [indexes](indexes.html) when [incremental backups](take-full-and-incremental-backups.html) are created from an older version (v20.2.2 and earlier or v20.1.4 and earlier), but restored by a newer version (v21.1.0+). These earlier releases may have included incomplete data for indexes that were in the process of being created.
{{site.data.alerts.end}}

### Restore a backup asynchronously

Use the `DETACHED` [option](#options) to execute the restore [job](show-jobs.html) asynchronously:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE FROM LATEST IN 'gs://{bucket name}?AUTH=specified&CREDENTIALS={encoded key}' WITH DETACHED;
~~~

The job ID is returned after the restore job creation completes:

~~~
        job_id
----------------------
  592786066399264769
(1 row)
~~~

**Without** the `DETACHED` option, `RESTORE` will block the SQL connection until the job completes. Once finished, the job status and more detailed job data is returned:

~~~
job_id             |  status   | fraction_completed | rows | index_entries | bytes
---------------------+-----------+--------------------+------+---------------+--------
652471804772712449 | succeeded |                  1 |   50 |             0 |  4911
(1 row)
~~~

### Other restore usages

#### Restore tables into a different database

By default, tables and views are restored to the database they originally belonged to. However, using the [`into_db` option](#into_db), you can control the target database.

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE bank.customers FROM LATEST IN 'gs://{bucket name}?AUTH=specified&CREDENTIALS={encoded key}' WITH into_db = 'newdb';
~~~

#### Rename a database on restore

To rename a database on restore, use the [`new_db_name`](#new-db-name) option:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE DATABASE bank FROM LATEST IN 'gs://{bucket name}?AUTH=specified&CREDENTIALS={encoded key}'
WITH new_db_name = new_bank;
~~~

When you run `RESTORE` with `new_db_name`, the existing database that was originally backed up can remain active:

~~~
database_name
--------------+
defaultdb
bank
new_bank
postgres
system
~~~

#### Remove the foreign key before restore

By default, tables with [foreign key](foreign-key.html) constraints must be restored at the same time as the tables they reference. However, using the [`skip_missing_foreign_keys`](restore.html#skip_missing_foreign_keys) option you can remove the foreign key constraint from the table and then restore it.

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE bank.accounts FROM LATEST IN 'gs://{bucket name}?AUTH=specified&CREDENTIALS={encoded key}' WITH skip_missing_foreign_keys;
~~~

#### Restoring users from `system.users` backup

The `system.users` table stores your cluster's usernames and their hashed passwords. To restore them, you must restore the `system.users` table into a new database because you cannot drop the existing `system.users` table.

After it's restored into a new database, you can write the restored `users` table data to the cluster's existing `system.users` table.

First, create the new database that you'll restore the `system.users` table into:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE DATABASE newdb;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE system.users FROM LATEST IN 'gs://{bucket name}?AUTH=specified&CREDENTIALS={encoded key}' WITH into_db = 'newdb';
~~~

After the restore completes, add the `users` to the existing `system.users` table:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO system.users SELECT * FROM newdb.users;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TABLE newdb.users;
~~~

#### Restore from incremental backups in a different location

To restore an incremental backup that was taken using the [`incremental_location` option](backup.html#incr-location), you must run the `RESTORE` statement with both:

- the collection URI of the full backup
- the `incremental_location` option referencing the incremental backup's collection URI, as passed in the original `BACKUP` statement

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE TABLE movr.users FROM LATEST IN 'gs://{bucket name}?AUTH=specified&CREDENTIALS={encoded key}' WITH incremental_location = '{incremental_backup_location}';
~~~

For more detail on using this option with `BACKUP`, see [Incremental backups with explicitly specified destinations](take-full-and-incremental-backups.html#incremental-backups-with-explicitly-specified-destinations).

</section>

## Known limitations

- To successfully [restore a table into a multi-region database](#restoring-to-multi-region-databases), it is necessary for the order and regions to match between the source and destination database. See the [Known Limitations](known-limitations.html#using-restore-with-multi-region-table-localities) page for detail on ordering and matching regions. [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/71071)
- {% include {{ page.version.version }}/known-limitations/restore-tables-non-multi-reg.md %}

## See also

- [`BACKUP`](backup.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [Take and Restore Encrypted Backups](take-and-restore-encrypted-backups.html)
- [Take and Restore Locality-aware Backups](take-and-restore-locality-aware-backups.html)
- [Take Backups with Revision History and Restore from a Point-in-time](take-backups-with-revision-history-and-restore-from-a-point-in-time.html)
- [Manage a Backup Schedule](manage-a-backup-schedule.html)
- [Configure Replication Zones](configure-replication-zones.html)
- [`ENUM`](enum.html)
- [`CREATE TYPE`](create-type.html)
- [`DROP TYPE`](drop-type.html)
