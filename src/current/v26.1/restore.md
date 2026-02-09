---
title: RESTORE
summary: Restore your CockroachDB cluster to a cloud storage services such as AWS S3, Google Cloud Storage, or other NFS.
toc: true
docs_area: reference.sql
---

The `RESTORE` [statement]({% link {{ page.version.version }}/sql-statements.md %}) restores your cluster's schemas and data from [a `BACKUP`]({% link {{ page.version.version }}/backup.md %}) stored on services such as AWS S3, Google Cloud Storage, or NFS.

Because CockroachDB is designed with high fault tolerance, restores are designed primarily for disaster recovery, i.e., restarting your cluster if it loses a majority of its nodes. Isolated issues (such as small-scale node outages) do not require any intervention.

You can restore:

- [A full cluster](#full-cluster)
- [Databases](#databases)
- [Tables](#tables)

For details on restoring across versions of CockroachDB, see [Restoring Backups Across Versions]({% link {{ page.version.version }}/restoring-backups-across-versions.md %}).

{% include {{ page.version.version }}/backups/old-syntax-removed.md %}

## Considerations

- `RESTORE` cannot restore backups made by newer versions of CockroachDB.
- `RESTORE` only supports backups taken on a cluster on a specific major version into a cluster that is on the same version or the next major version. Refer to the [Restoring Backups Across Versions]({% link {{ page.version.version }}/restoring-backups-across-versions.md %}) page for more detail.
- `RESTORE` is a blocking statement. To run a restore job asynchronously, use the [`DETACHED`](#detached) option.
- `RESTORE` no longer requires an {{ site.data.products.enterprise }} license, regardless of the options passed to it or to the backup it is restoring.
- You cannot restore a backup of a multi-region database into a single-region database.
- When the [`exclude_data_from_backup`]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#exclude-a-tables-data-from-backups) parameter is set on a table, the table will not contain row data when restored.
- {% include {{ page.version.version }}/backups/zone-configs-overwritten-during-restore.md %}

## Required privileges

{{site.data.alerts.callout_info}}
Starting in v22.2, CockroachDB introduces a new restore privilege model that provides finer control over a user's privilege to restore backups.

There is continued support for the [legacy privilege model](#required-privileges-using-the-legacy-privilege-model) in v22.2, however it **will be removed** in a future release of CockroachDB. We recommend implementing the new privilege model that follows in this section for all restores.
{{site.data.alerts.end}}

You can grant the `RESTORE` privilege to a user or role depending on the type of restore required:

Restore | Privilege
-------+-----------
Cluster | Grant a user the system level `RESTORE` privilege. For example, `GRANT SYSTEM RESTORE TO user;`.
Database | Grant a user the system level `RESTORE` privilege to restore databases onto the cluster. For example, `GRANT SYSTEM RESTORE TO user;`.
Table | Grant a user the database level `RESTORE` privilege to restore schema objects into the database. For example, `GRANT RESTORE ON DATABASE nonadmin TO user;`.

The listed privileges do not cascade to objects lower in the schema tree. For example, if you are granted system-level restore privileges, this does not give you the privilege to restore a table. If you need the `RESTORE` privilege on a database to apply to all newly created tables in that database, use [`DEFAULT PRIVILEGES`]({% link {{ page.version.version }}/security-reference/authorization.md %}#default-privileges). You can add `RESTORE` to the user or role's default privileges with [`ALTER DEFAULT PRIVILEGES`]({% link {{ page.version.version }}/alter-default-privileges.md %}#grant-default-privileges-to-a-specific-role).

Members of the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) can run all three types of restore (cluster, database, and table) without the need to grant a specific `RESTORE` privilege.  However, we recommend using the `RESTORE` privilege model to create users or roles and grant them `RESTORE` privileges as necessary for stronger access control.

### Privileges for managing a restore job

To manage a restore job with [`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %}), [`RESUME JOB`]({% link {{ page.version.version }}/resume-job.md %}), or [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %}), users must have at least one of the following:

- Be a member of the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role).
- The [`CONTROLJOB` role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-options).

To view a restore job with [`SHOW JOB`]({% link {{ page.version.version }}/show-jobs.md %}), users must have at least one of the following:

- The [`VIEWJOB` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges), which allows you to view all jobs (including `admin`-owned jobs).
- Be a member of the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role).
- The [`CONTROLJOB` role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-options).

See [`GRANT`]({% link {{ page.version.version }}/grant.md %}) for detail on granting privileges to a role or user.

## Required privileges using the legacy privilege model

The following details the existing privilege model that CockroachDB supports in v22.2 and earlier. Support for this privilege model will be removed in a future release of CockroachDB:

- [Full cluster restores](#full-cluster) can only be run by members of the [`ADMIN` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role). By default, the `root` user belongs to the `admin` role.
- For all other restores, the user must have [write access]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) (`CREATE` or `INSERT`) on all objects affected.

See the [Required privileges](#required-privileges) section for the updated privilege model.

## Source privileges

{% include {{ page.version.version }}/misc/external-io-privilege.md %}

Either the `EXTERNALIOIMPLICITACCESS` [system-level privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) or the [`admin`]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) role is required for the following scenarios:

- To interact with a cloud storage resource using [`IMPLICIT` authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}).
- Use of a [custom endpoint](https://docs.aws.amazon.com/sdk-for-go/api/aws/endpoints/) on S3.
- [Nodelocal]({% link {{ page.version.version }}/cockroach-nodelocal-upload.md %})

No special privilege is required for:

- Interacting with an Amazon S3 and Google Cloud Storage resource using `SPECIFIED` credentials. Azure Storage is always `SPECIFIED` by default.
- Using [Userfile]({% link {{ page.version.version }}/use-userfile-storage.md %}) storage.

{% include {{ page.version.version }}/misc/bulk-permission-note.md %}

{% include {{ page.version.version }}/misc/s3-compatible-warning.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/restore.html %}
</div>

## Parameters

 Parameter | Description
-----------|-------------
`table_pattern` | The table, [view]({% link {{ page.version.version }}/views.md %}), or [sequence]({% link {{ page.version.version }}/create-sequence.md %}) you want to restore. For details on how restore works with objects that are dependent on one another, refer to [Object dependencies](#object-dependencies).
`database_name` | The name of the database you want to restore (i.e., restore all tables and views in the database). You can restore an entire database only if you had backed up the entire database.
<a name="subdir-param"></a>`string_or_placeholder` | One of the following:<ul><li>`LATEST`: Restore the most recent backup in the given [collection]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#backup-collections) URI. Refer to the [Restore from the most recent backup](#restore-the-most-recent-full-or-incremental-backup) example.</li><li>`your_backup_subdirectory`: Restore from a specific subdirectory in the given collection URI. Refer to the [Restore a specific backup](#restore-a-specific-full-or-incremental-backup) example.</li></ul>
`string_or_placeholder_opt_list` | One of the following:<ul><li>`your_backup_collection_URI`: The [collection]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#backup-collections) URI where the [full backup]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups) (and appended [incremental backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#incremental-backups), if applicable) is stored.</li><li>`your_locality_aware_backup_URI`: The URI where a [locality-aware backup]({% link {{ page.version.version }}/take-and-restore-locality-aware-backups.md %}) is stored. When [restoring from an incremental locality-aware backup]({% link {{ page.version.version }}/take-and-restore-locality-aware-backups.md %}#restore-from-an-incremental-locality-aware-backup), include **every** locality ever used, even if it was only used once.</li></ul>
<a name="as-of-system-time"></a>`timestamp` | Restore data as it existed as of [`timestamp`]({% link {{ page.version.version }}/as-of-system-time.md %}). You can restore point-in-time data if you had taken a full or incremental backup [with revision history]({% link {{ page.version.version }}/take-backups-with-revision-history-and-restore-from-a-point-in-time.md %}). If the backup was not taken with `revision_history`, you can use [`SHOW BACKUP`]({% link {{ page.version.version }}/show-backup.md %}) to restore to a time that the backup covers (including in the full or incremental backup). Refer to the [Restore with as of system time](#restore-with-as-of-system-time) example.
`restore_options_list` | Control the backup job behavior with [these options](#options).

### Options

You can control `RESTORE` behavior using any of the following in the `restore_options_list`. To set multiple `RESTORE` options, use a comma-separated list:

 Option                                                             | <div style="width:75px">Value</div>         | Description
 -------------------------------------------------------------------+---------------+-------------------------------------------------------
<a name="detached"></a>`DETACHED`                                   | N/A                                         |  When `RESTORE` runs with `DETACHED`, the job will execute asynchronously. The job ID is returned after the restore job creation completes. Note that with `DETACHED` specified, further job information and the job completion status will not be returned. For more on the differences between the returned job data, see the [example]({% link {{ page.version.version }}/restore.md %}#restore-a-backup-asynchronously) below. To check on the job status, use the [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}) statement. <br><br>To run a restore within a [transaction]({% link {{ page.version.version }}/transactions.md %}), use the `DETACHED` option.
`encryption_passphrase`                                             | Passphrase used to create the [encrypted backup]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %}) |  The passphrase used to decrypt the file(s) that were encrypted by the [`BACKUP`]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %}) statement.
<a name="execution_locality"></a>`EXECUTION LOCALITY` | Key-value pairs                             | Restricts the execution of the restore to nodes that match the defined [locality filter]({% link {{ page.version.version }}/take-locality-restricted-backups.md %}) requirements. <br><br>Example: `WITH EXECUTION LOCALITY = 'region=us-west-1a,cloud=aws'`
<a name="incr-location"></a>`incremental_location` | [`STRING`]({% link {{ page.version.version }}/string.md %}) | Restore an incremental backup from the alternate collection URI the backup was originally taken with. <br><br>See [Restore incremental backups](#restore-a-specific-full-or-incremental-backup) for more detail.
<a name="into_db"></a>`into_db`                                     | Database name                               | Use to [change the destination database](#restore-tables-into-a-different-database) for table restores. The destination database must exist before a restore with `into_db`. (Does not apply to database or cluster restores.)<br><br>Example: `WITH into_db = 'newdb'`
<a name="kms"></a>`kms` | [`STRING`]({% link {{ page.version.version }}/string.md %}) |  The URI of the cryptographic key stored in a key management service (KMS), or a comma-separated list of key URIs, used to [take and restore encrypted backups]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %}#examples). Refer to [URI Formats]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %}#uri-formats) on the Encrypted Backups page. The key or keys are used to encrypt the manifest and data files that the `BACKUP` statement generates, decrypt them during a [restore]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %}#examples) operation, and list the contents of the backup when using [`SHOW BACKUP`]({% link {{ page.version.version }}/show-backup.md %}). <br/><br/>AWS KMS, Google Cloud KMS, and Azure Key Vault are supported.
<a name="new-db-name"></a>`new_db_name`                             | Database name                                 | [Rename a database during a restore](#rename-a-database-on-restore). The existing backed-up database can remain active while the same database is restored with a different name. <br><br>Example: `RESTORE DATABASE movr ... WITH new_db_name = 'new_movr'`
`schema_only` | N/A | Verify that a backup is valid by running `RESTORE ... schema_only`, which will restore the backed-up schema without any user data. Refer to [Backup Validation]({% link {{ page.version.version }}/backup-validation.md %}#validate-a-backup-is-restorable) for detail and an example.
<a name="skip-localities-check"></a>`skip_localities_check`         | N/A                                         | Use to skip checking localities of a cluster before a restore when there are mismatched [cluster regions]({% link {{ page.version.version }}/multiregion-overview.md %}#cluster-regions) between the backup's cluster and the destination cluster. For further details, refer to [Restoring to multi-region databases](#restoring-to-multi-region-databases).<br><br>Example: `WITH skip_localities_check`
<a name="skip_missing_foreign_keys"></a>`skip_missing_foreign_keys` | N/A                                         | Use to remove the missing [foreign key]({% link {{ page.version.version }}/foreign-key.md %}) constraints before restoring.<br><br>Example: `WITH skip_missing_foreign_keys`
<a name="skip-missing-sequences"></a>`skip_missing_sequences`       | N/A                                         | Use to ignore [sequence]({% link {{ page.version.version }}/show-sequences.md %}) dependencies (i.e., the `DEFAULT` expression that uses the sequence).<br><br>Example: `WITH skip_missing_sequences`
`skip_missing_sequence_owners`                                      | N/A                                         | Must be used when restoring either a table that was previously a [sequence owner]({% link {{ page.version.version }}/create-sequence.md %}#owned-by) or a sequence that was previously owned by a table.<br><br>Example: `WITH skip_missing_sequence_owners`
<a name="skip-missing-udfs"></a>`skip_missing_udfs` | N/A | Must be used when restoring a table with referenced [UDF]({% link {{ page.version.version }}/user-defined-functions.md %}) dependencies. Any column's `DEFAULT` expression using UDFs is dropped. <br><br>Example: `WITH skip_missing_udfs`
<a name="skip-missing-views"></a>`skip_missing_views`                                                | N/A                                         | Use to skip restoring [views]({% link {{ page.version.version }}/views.md %}) that cannot be restored because their dependencies are not being restored at the same time.<br><br>Example: `WITH skip_missing_views`
`verify_backup_table_data` | N/A | Run a `schema_only` restore **and** have the restore read all user data from external storage, verify checksums, and discard the user data before writing it to disk. You must also include the `schema_only` option in the `RESTORE` statement with `verify_backup_table_data`. For more detail, see [Backup Validation]({% link {{ page.version.version }}/backup-validation.md %}#validate-backup-table-data-is-restorable).

### Backup file URLs

CockroachDB uses the URL provided to construct a secure API call to the service you specify. The URL structure depends on the type of file storage you are using. For more information, see the following:

- [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %})

    {{site.data.alerts.callout_info}}
    HTTP storage is not supported for `BACKUP` and `RESTORE`.
    {{site.data.alerts.end}}

- [Use a Local File Server]({% link {{ page.version.version }}/use-a-local-file-server.md %})

{% include {{ page.version.version }}/misc/external-connection-note.md %}

## Functional details

CockroachDB uses checksums to ensure data integrity during both the [write and read]({% link {{ page.version.version }}/architecture/reads-and-writes-overview.md %}) processes. When data is [written to disk]({% link {{ page.version.version }}/architecture/storage-layer.md %}), CockroachDB calculates and stores checksums with the data. The checksums are then used to verify the integrity of the data when it is read back from disk. A restore job reads the data from the external backup storage and verifies the checksums to ensure that the data has not been corrupted during the storage or transfer of the backup.

You can restore:

- [A full cluster](#full-cluster)
- [Databases](#databases)
- [Tables](#tables)

`RESTORE` will only restore the latest data in an object (table, database, cluster), or the latest data as per an [`AS OF SYSTEM TIME` restore](#as-of-system-time). That is, a restore will not include historical data even if you ran your backup with [`revision_history`]({% link {{ page.version.version }}/backup.md %}#with-revision-history). This means that if you issue an `AS OF SYSTEM TIME` query on a restored object, the query will fail or the response will be incorrect because there is no historical data to query. For example, if you restore a table at `2022-07-13 10:38:00`, it is not then possible to read or [back up]({% link {{ page.version.version }}/backup.md %}) that table at `2022-07-13 10:37:00` or earlier. This is also the case for backups with `revision_history` that might try to initiate a revision start time earlier than `2022-07-13 10:38:00`.

{{site.data.alerts.callout_info}}
You can exclude a table's row data from a backup using the [`exclude_data_from_backup`]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#exclude-a-tables-data-from-backups) parameter. With this parameter set, a table will be empty when restored.
{{site.data.alerts.end}}

### Full cluster

 A full cluster restore can only be run on a destination cluster with no user-created databases or tables. Restoring a full cluster includes:

- All user tables
- Relevant system tables
- All [databases]({% link {{ page.version.version }}/create-database.md %})
- All [tables]({% link {{ page.version.version }}/create-table.md %}) (which automatically includes their [indexes]({% link {{ page.version.version }}/indexes.md %}))
- All [views]({% link {{ page.version.version }}/views.md %})

Also, consider that:

- [Temporary tables]({% link {{ page.version.version }}/temporary-tables.md %}) are restored to their original database during a full cluster restore.
- The restore drops the cluster's `defaultdb` and `postgres` [pre-loaded databases]({% link {{ page.version.version }}/show-databases.md %}#preloaded-databases) before the restore begins. You can only restore `defaultdb` and `postgres` if they are present in the original [backup]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}).
- [Changefeed jobs]({% link {{ page.version.version }}/change-data-capture-overview.md %}) do not resume automatically on the new cluster. It is necessary to manually [create changefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}) after a full-cluster restore.
- Newly restored [changefeed schedules]({% link {{ page.version.version }}/create-schedule-for-changefeed.md %}) and [backup schedules]({% link {{ page.version.version }}/create-schedule-for-backup.md %}) pause before running their scheduled jobs. To keep schedules running smoothly, either restart them with a new destination sink or pause the equivalent schedules on the backup cluster and restart them on the restored cluster with the same destination sink.
- When the cluster is in a mixed-version state during an [upgrade]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}), a full cluster restore fails. To perform a full cluster restore, it is necessary to first [finalize the upgrade]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#finalize-a-major-version-upgrade-manually).
- When you restore a full cluster with an {{ site.data.products.enterprise }} license, it restores the [{{ site.data.products.enterprise }} license]({% link {{ page.version.version }}/licensing-faqs.md %}#types-of-licenses) of the cluster you are restoring from. If you want to use a different license in the new cluster, make sure to [update the license]({% link {{ page.version.version }}/licensing-faqs.md %}#set-a-license) **after** the restore is complete.

### Databases

Restoring a database will create a new database and restore all of its tables and views. The created database will have the name of the database in the backup.

~~~ sql
RESTORE DATABASE backup_database_name FROM LATEST in 'your_backup_collection_URI';
~~~

To restore a database that already exists in a cluster, use the `new_db_name` option with `RESTORE` to provide a new name for the database. See the [Rename a database on restore](#rename-a-database-on-restore) example.

{{site.data.alerts.callout_success}}
If [dropping]({% link {{ page.version.version }}/drop-database.md %}) or [renaming]({% link {{ page.version.version }}/alter-database.md %}#rename-to) an existing database is not an option, you can use [_table_ restore](#restore-a-table) to restore all tables into the existing database by using the [`WITH into_db` option](#options).
{{site.data.alerts.end}}

### Tables

You can also restore individual tables (which automatically includes their indexes), [views]({% link {{ page.version.version }}/views.md %}), or [sequences]({% link {{ page.version.version }}/create-sequence.md %}) from a backup. This process uses the data stored in the backup to create entirely new tables, views, and sequences in the destination database.

By default, tables, views, and sequences are restored into a destination database matching the name of the database from which they were backed up. If the destination database does not exist, you must [create it]({% link {{ page.version.version }}/create-database.md %}). You can choose to change the destination database with the [`into_db` option](#into_db).

The destination database must not have tables, views, or sequences with the same name as the the object you're restoring. If any of the restore destination's names are being used, you can:

- [`DROP TABLE`]({% link {{ page.version.version }}/drop-table.md %}), [`DROP VIEW`]({% link {{ page.version.version }}/drop-view.md %}), or [`DROP SEQUENCE`]({% link {{ page.version.version }}/drop-sequence.md %}) and then restore them. Note that a sequence cannot be dropped while it is being used in a column's `DEFAULT` expression, so those expressions must be dropped before the sequence is dropped, and recreated after the sequence is recreated. The `setval` [function]({% link {{ page.version.version }}/functions-and-operators.md %}#sequence-functions) can be used to set the value of the sequence to what it was previously.
- [Restore the table, view, or sequence into a different database](#into_db).

{{site.data.alerts.callout_info}}
`RESTORE` only offers table-level granularity; it **does not** support restoring subsets of a table.
{{site.data.alerts.end}}

When restoring an individual table that references a user-defined type (e.g., [`ENUM`]({% link {{ page.version.version }}/enum.md %})), CockroachDB will first check to see if the type already exists. The restore will attempt the following for each user-defined type within a table backup:

- If there is _not_ an existing type in the cluster with the same name, CockroachDB will create the user-defined type as it exists in the backup.
- If there is an existing type in the cluster with the same name that is compatible with the type in the backup, CockroachDB will map the type in the backup to the type in the cluster.
- If there is an existing type in the cluster with the same name but it is _not_ compatible with the type in the backup, the restore will not succeed and you will be asked to resolve the naming conflict. You can do this by either [dropping]({% link {{ page.version.version }}/drop-type.md %}) or [renaming]({% link {{ page.version.version }}/alter-type.md %}) the existing user-defined type.

In general, two types are compatible if they are the same kind (e.g., an enum is only compatible with other enums). Additionally, enums are only compatible if they have the same ordered set of elements that have also been [created in the same way](https://github.com/cockroachdb/cockroach/blob/master/docs/RFCS/20200331_enums.md#physical-layout). For example:

- `CREATE TYPE t1 AS ENUM ('yes', 'no')` and `CREATE TYPE t2 AS ENUM ('yes', 'no')` are compatible.
- `CREATE TYPE t1 AS ENUM ('yes', 'no')` and `CREATE TYPE t2 AS ENUM ('no', 'yes')` are not compatible.
- `CREATE TYPE t1 AS ENUM ('yes', 'no')` and `CREATE TYPE t2 AS ENUM ('yes'); ALTER TYPE t2 ADD VALUE ('no')` are not compatible because they were not created in the same way.

### Object dependencies

{% include {{ page.version.version }}/backups/object-dependency.md %}

{{site.data.alerts.callout_info}}
Referenced UDFs are not restored and require the [`skip_missing_udfs`](#skip-missing-udfs) option.
{{site.data.alerts.end}}

### Users and privileges

The owner of restored objects will be the user running the restore job. To restore your users and privilege [grants]({% link {{ page.version.version }}/grant.md %}), you can do a cluster backup and restore the cluster to a fresh cluster with no user data.

If you are not doing a full cluster restore, the table-level privileges need to be granted to the users after the restore is complete. (By default, the user restoring will become the owner of the restored objects.) To grant table-level privileges after a restore, backup the `system.users` table, [restore users and their passwords]({% link {{ page.version.version }}/restore.md %}#restoring-users-from-system-users-backup), and then [grant]({% link {{ page.version.version }}/grant.md %}) the table-level privileges.

### Restore types

You can either restore from a full backup or from a full backup with incremental backups, based on the backup files you include:

Restore Type | Parameters
-------------|----------
Full backup | Include the path to the full backup destination and the [subdirectory](#view-the-backup-subdirectories) of the backup. See the [Examples](#examples) section for syntax of [cluster](#restore-a-cluster), [database](#restore-a-database), and [table](#restore-a-table) restores.
Full backup + <br>incremental backups | Include the path that contains the backup collection and the [subdirectory](#view-the-backup-subdirectories) containing the incremental backup. See [Restore from incremental backups](#restore-a-specific-full-or-incremental-backup) for an example.

{{site.data.alerts.callout_info}}
CockroachDB does **not** support incremental-only restores.
{{site.data.alerts.end}}

## Performance

- The `RESTORE` process minimizes its impact to the cluster's performance by distributing work to all nodes. Subsets of the restored data (known as ranges) are evenly distributed among randomly selected nodes, with each range initially restored to only one node. Once the range is restored, the node begins replicating it others.
- When a `RESTORE` fails or is canceled, partially restored data is properly cleaned up. This can have a minor, temporary impact on cluster performance.
- A restore job will pause if a node in the cluster runs out of disk space. See [Viewing and controlling restore jobs](#viewing-and-controlling-restore-jobs) for information on resuming and showing the progress of restore jobs. {% include {{page.version.version}}/storage/free-up-disk-space.md %}
- A restore job will [pause]({% link {{ page.version.version }}/pause-job.md %}) instead of entering a `failed` state if it continues to encounter transient errors once it has retried a maximum number of times. Once the restore has paused, you can either [resume]({% link {{ page.version.version }}/resume-job.md %}) or [cancel]({% link {{ page.version.version }}/cancel-job.md %}) it.

## Restoring to multi-region databases

 Restoring to a [multi-region database]({% link {{ page.version.version }}/multiregion-overview.md %}) is supported with some limitations. This section outlines details and settings that should be considered when restoring into multi-region databases:

- A [cluster's regions]({% link {{ page.version.version }}/multiregion-overview.md %}#cluster-regions) will be checked before a restore. Mismatched regions between backup and restore clusters will be flagged before the restore begins, which allows for a decision between updating the [cluster localities]({% link {{ page.version.version }}/cockroach-start.md %}#locality) or restoring with the [`skip_localities_check`](#skip-localities-check) option to continue with the restore regardless.

    {{site.data.alerts.callout_info}}
    Restoring a multi-region cluster into a single-region CockroachDB {{ site.data.products.standard }} or CockroachDB {{ site.data.products.basic }} cluster is not supported. {{ site.data.products.standard }} and CockroachDB {{ site.data.products.basic }} clusters do **not** support the `skip_localities_check` option with `RESTORE`. To restore a multi-region cluster, you must [create a new multi-region {{ site.data.products.standard }} or CockroachDB {{ site.data.products.basic }} cluster]({% link cockroachcloud/basic-cluster-management.md %}#move-cluster-to-a-new-region) with regions that match the backed-up multi-region cluster.
    {{site.data.alerts.end}}

- A database that is restored with the `sql.defaults.primary_region` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) will have the [`PRIMARY REGION`]({% link {{ page.version.version }}/alter-database.md %}#set-primary-region) from this cluster setting assigned to the destination database.

- `RESTORE` supports restoring **non**-multi-region tables into a multi-region database and sets the table locality as [`REGIONAL BY TABLE`]({% link {{ page.version.version }}/table-localities.md %}#regional-tables) to the primary region of the destination database.

- Restoring tables from multi-region databases with table localities set to [`REGIONAL BY ROW`]({% link {{ page.version.version }}/table-localities.md %}#regional-by-row-tables), `REGIONAL BY TABLE`, [`REGIONAL BY TABLE IN PRIMARY REGION`]({% link {{ page.version.version }}/alter-table.md %}#regional-by-table), and [`GLOBAL`]({% link {{ page.version.version }}/alter-table.md %}#global) to another multi-region database is supported.

- When restoring a `REGIONAL BY TABLE IN PRIMARY REGION` table, if the primary region is different in the source database to the destination database this will be implicitly changed on restore.

- Restoring a [partition]({% link {{ page.version.version }}/partitioning.md %}) of a `REGIONAL BY ROW` table is not supported.

- {% include {{ page.version.version }}/known-limitations/restore-multiregion-match.md %}

The ordering of regions and how region matching is determined is a known limitation. See the [Known Limitations](#known-limitations) section for the tracking issues on limitations around `RESTORE` and multi-region support.

For more on multi-region databases, see the [Multi-Region Capabilities Overview]({% link {{ page.version.version }}/multiregion-overview.md %}).

{% include {{page.version.version}}/sql/sql-defaults-cluster-settings-deprecation-notice.md %}

## Viewing and controlling restore jobs

After CockroachDB successfully initiates a restore, it registers the restore as a job, which you can view with [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}).

After the restore has been initiated, you can control it with [`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %}), [`RESUME JOB`]({% link {{ page.version.version }}/resume-job.md %}), and [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %}).

{{site.data.alerts.callout_info}}
If initiated correctly, the statement returns when the restore is finished or if it encounters an error. In some cases, the restore can continue after an error has been returned (the error message will tell you that the restore has resumed in background).
{{site.data.alerts.end}}

## Examples

There are two ways to specify a full or incremental backup to restore:

- [Restoring from the most recent backup](#restore-the-most-recent-full-or-incremental-backup)
- [Restoring from a specific backup](#restore-a-specific-full-or-incremental-backup)

{{site.data.alerts.callout_success}}
You can use external connections to represent an external storage or sink URI. This means that you can specify the external connection's name in statements rather than the provider-specific URI:

For detail on using external connections, refer to the [`CREATE EXTERNAL CONNECTION`]({% link {{ page.version.version }}/create-external-connection.md %}) page.
{{site.data.alerts.end}}

Some of the examples in this section use an [external connection]({% link {{ page.version.version }}/create-external-connection.md %}) to represent the external storage URI. For guidance on connecting to cloud storage or using other authentication parameters, read [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %}#example-file-urls).

If you need to limit the control specific users have over your storage buckets, refer to [Assume role authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}) for setup instructions.

### View the backup subdirectories

`BACKUP ... INTO` adds a backup to a [backup collection]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#backup-collections) location. To view the backup paths in a given collection location, use [`SHOW BACKUPS`]({% link {{ page.version.version }}/show-backup.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW BACKUPS IN 's3://bucket/path?AUTH=implicit';
~~~

~~~
       path
-------------------------
/2023/12/14-190909.83
/2023/12/20-155249.37
/2023/12/21-142943.73
(3 rows)
~~~

When you want to [restore a specific backup](#restore-a-specific-full-or-incremental-backup), add the backup's subdirectory path (e.g., `/2023/12/21-142943.73`) to the `RESTORE` statement. For details on viewing the most recent backup, see [`SHOW BACKUP FROM {subdirectory} in {collectionURI}`]({% link {{ page.version.version }}/show-backup.md %}#show-the-most-recent-backup).

### Restore the most recent full or incremental backup

To restore from the most recent backup ([full or incremental]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})) in the collection's location, use the `LATEST` syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM LATEST IN 's3://bucket/path?AUTH=implicit';
~~~

If you are restoring an incremental backup, the storage location **must** contain a full backup.

{% include {{ page.version.version }}/backups/no-incremental-restore.md %}

{{site.data.alerts.callout_info}}
`RESTORE` will re-validate [indexes]({% link {{ page.version.version }}/indexes.md %}) when [incremental backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}) are created from an older version (v20.2.2 and earlier or v20.1.4 and earlier), but restored by a newer version (v21.1.0+). These earlier releases may have included incomplete data for indexes that were in the process of being created.
{{site.data.alerts.end}}

### Restore a specific full or incremental backup

To restore a specific full or incremental backup, specify that backup's subdirectory in the `RESTORE` statement. To view the available subdirectories, use [`SHOW BACKUPS`](#view-the-backup-subdirectories). If you are restoring an incremental backup, the URI must point to the storage location that contains the full backup:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM '2023/03/23-213101.37' IN 's3://bucket/path?AUTH=implicit';
~~~

### Restore a cluster

To restore a full cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM LATEST IN 'external://backup_s3';
~~~

To view the available subdirectories, use [`SHOW BACKUPS`](#view-the-backup-subdirectories).

### Restore a database

To restore a database:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE DATABASE bank FROM LATEST IN 'external://backup_s3';
~~~

To view the available subdirectories, use [`SHOW BACKUPS`](#view-the-backup-subdirectories).

{{site.data.alerts.callout_info}}
`RESTORE DATABASE` can only be used if the entire database was backed up.
{{site.data.alerts.end}}

### Restore a table

To restore a single table:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE TABLE bank.customers FROM LATEST IN 'external://backup_s3';
~~~

To restore multiple tables:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE TABLE bank.customers, bank.accounts FROM LATEST IN 'external://backup_s3';
~~~

To view the available subdirectories, use [`SHOW BACKUPS`](#view-the-backup-subdirectories).

### Restore with `AS OF SYSTEM TIME`

{{site.data.alerts.callout_danger}}
`RESTORE` will only restore the latest data as per an `AS OF SYSTEM TIME` restore. The restore will not include historical data even if you ran your backup with `revision_history`.
{{site.data.alerts.end}}

Running a backup with [revision history]({% link {{ page.version.version }}/take-backups-with-revision-history-and-restore-from-a-point-in-time.md %}) captures every change made within the garbage collection period leading up to and including the given timestamp, which allows you to restore to an arbitrary point-in-time within the revision history.

If you ran a backup **without** `revision_history`, it is still possible to use `AS OF SYSTEM TIME` with `RESTORE` to target a particular time for the restore. However, your restore will be limited to the times of the full backup and each incremental backup in the chain. In this case, use the following example to restore to a particular time.

First, find the times that are available for a point-in-time-restore by listing the available backup directories in your storage location:

{% include_cached copy-clipboard.html %}
~~~sql
SHOW BACKUPS IN 'external://backup_s3';
~~~
~~~
          path
------------------------
  2023/01/18-141753.98
  2023/01/23-184816.10
  2023/01/23-185448.11
(3 rows)
~~~

From the output use the required date directory and run the following to get the details of the backup:

~~~sql
SHOW BACKUP '2023/01/23-185448.11' IN 'external://backup_s3';
~~~
~~~
  database_name | parent_schema_name |        object_name         | object_type | backup_type |         start_time         |          end_time          | size_bytes | rows | is_full_cluster
----------------+--------------------+----------------------------+-------------+-------------+----------------------------+----------------------------+------------+------+------------------
  movr          | public             | vehicle_location_histories | table       | full        | NULL                       | 2023-01-23 18:54:48.116975 |      85430 | 1092 |        t
  movr          | public             | promo_codes                | table       | full        | NULL                       | 2023-01-23 18:54:48.116975 |     225775 | 1003 |        t
  movr          | public             | user_promo_codes           | table       | full        | NULL                       | 2023-01-23 18:54:48.116975 |       1009 |   11 |        t
  NULL          | NULL               | system                     | database    | incremental | 2023-01-23 18:54:48.116975 | 2023-01-24 00:00:00        |       NULL | NULL |        t
  system        | public             | users                      | table       | incremental | 2023-01-23 18:54:48.116975 | 2023-01-24 00:00:00        |          0 |    0 |        t
  system        | public             | zones                      | table       | incremental | 2023-01-23 18:54:48.116975 | 2023-01-24 00:00:00        |          0 |    0 |
~~~

Finally, use the `start_time` and `end_time` detail to define the required time as part of the `AS OF SYSTEM TIME` clause. Run the restore, passing the directory and the timestamp:

{% include_cached copy-clipboard.html %}
~~~sql
RESTORE DATABASE movr FROM '2023/01/23-185448.11' IN 'external://backup_s3' AS OF SYSTEM TIME '2023-01-23 18:56:48';
~~~

### Restore a backup asynchronously

Use the [`DETACHED`](#detached) option to execute the restore [job]({% link {{ page.version.version }}/show-jobs.md %}) asynchronously:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE FROM LATEST IN 'external://backup_s3'
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

By default, tables and views are restored to the database they originally belonged to. However, using the [`into_db` option](#into_db), you can control the destination database. Note that the destination database must exist prior to the restore.

1. Create the new database that you'll restore the table or view into:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE newdb;
    ~~~

2. Restore the table into the newly created database with `into_db`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > RESTORE bank.customers FROM LATEST IN 'external://backup_s3'
    WITH into_db = 'newdb';
    ~~~

#### Rename a database on restore

To rename a database on restore, use the [`new_db_name`](#new-db-name) option:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE DATABASE bank FROM LATEST IN 'external://backup_s3'
WITH new_db_name = 'new_bank';
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

By default, tables with [foreign key]({% link {{ page.version.version }}/foreign-key.md %}) constraints must be restored at the same time as the tables they reference. However, using the [`skip_missing_foreign_keys`]({% link {{ page.version.version }}/restore.md %}#skip_missing_foreign_keys) option you can remove the foreign key constraint from the table and then restore it.

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE bank.accounts FROM LATEST IN 'external://backup_s3'
WITH skip_missing_foreign_keys;
~~~

#### Restoring users from `system.users` backup

The `system.users` table stores your cluster's usernames and their hashed passwords. To restore them, you must restore the `system.users` table into a new database because you cannot drop the existing `system.users` table.

After it's restored into a new database, you can write the restored `users` table data to the cluster's existing `system.users` table.

1. Create the new database that you'll restore the `system.users` table into:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE newdb;
    ~~~

1. Restore the `system.users` table into the new database:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > RESTORE system.users  FROM LATEST IN 'external://backup_s3'
    WITH into_db = 'newdb';
    ~~~

1. After the restore completes, add the `users` to the existing `system.users` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO system.users SELECT * FROM newdb.users;
    ~~~

1. Remove the temporary `users` table:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > DROP TABLE newdb.users;
    ~~~

#### Restore from incremental backups in a different location

{% include common/sql/incremental-location-warning.md %}

To restore an incremental backup that was taken using the [`incremental_location` option]({% link {{ page.version.version }}/backup.md %}#incr-location), you must run the `RESTORE` statement with both:

- the collection URI of the full backup
- the `incremental_location` option referencing the incremental backup's collection URI, as passed in the original `BACKUP` statement

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE TABLE movr.users FROM LATEST IN 'external://backup_s3' WITH incremental_location = '{incremental_backup_URI}';
~~~

For more detail on using this option with `BACKUP`, see [Incremental backups with explicitly specified destinations]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#incremental-backups-with-explicitly-specified-destinations).

## Known limitations

- {% include {{ page.version.version }}/known-limitations/restore-udf.md %}
- {% include {{ page.version.version }}/known-limitations/restore-tables-non-multi-reg.md %}
- {% include {{ page.version.version }}/known-limitations/restore-multiregion-match.md %}

## See also

- [`BACKUP`]({% link {{ page.version.version }}/backup.md %})
- [Take Full and Incremental Backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
- [Take and Restore Encrypted Backups]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %})
- [Take and Restore Locality-aware Backups]({% link {{ page.version.version }}/take-and-restore-locality-aware-backups.md %})
- [Take Backups with Revision History and Restore from a Point-in-time]({% link {{ page.version.version }}/take-backups-with-revision-history-and-restore-from-a-point-in-time.md %})
- [Manage a Backup Schedule]({% link {{ page.version.version }}/manage-a-backup-schedule.md %})
- [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %})
- [`ENUM`]({% link {{ page.version.version }}/enum.md %})
- [`CREATE TYPE`]({% link {{ page.version.version }}/create-type.md %})
- [`DROP TYPE`]({% link {{ page.version.version }}/drop-type.md %})
