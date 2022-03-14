---
title: Take Full and Incremental Backups
summary: Learn how to back up and restore a CockroachDB cluster.
toc: true
docs_area: manage
---

Because CockroachDB is designed with high fault tolerance, backups are primarily needed for [disaster recovery](disaster-recovery.html) (i.e., if your cluster loses a majority of its nodes). Isolated issues (such as small-scale node outages) do not require any intervention. However, as an operational best practice, **we recommend taking regular backups of your data**.

There are two main types of backups:

- [Full backups](#full-backups)
- [Incremental backups](#incremental-backups)

You can use the [`BACKUP`](backup.html) statement to efficiently back up your cluster's schemas and data to popular cloud services such as AWS S3, Google Cloud Storage, or NFS, and the [`RESTORE`](restore.html) statement to efficiently restore schema and data as necessary. For more information, see [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html).

{% include {{ page.version.version }}/backups/backup-to-deprec.md %}

{{site.data.alerts.callout_success}}
 You can create [schedules for periodic backups](manage-a-backup-schedule.html) in CockroachDB. We recommend using scheduled backups to automate daily backups of your cluster.
{{site.data.alerts.end}}

## Backup collections

When running a [full backup](#full-backups) to a specified storage location, a _backup collection_ will be created in that storage location. A backup collection defines a **logical** set of backups, which can contain multiple full backups and their subsequent [incremental backups](#incremental-backups). (If a full backup is not present in a collection when you run an incremental backup, then a full backup will be taken.) The path to a backup is created using a date-based naming scheme.

As of v22.1, it is possible to store incremental backups in a [different storage location](#incremental-backups-with-explicitly-specified-destinations) to the related full backup. This means that one or multiple storage locations can hold one backup collection.

In the following example, one storage bucket is holding the backup collection. The full backups are stored at the root of the collection's location in a date-based path. The `/incrementals` directory holds all incremental backups by default.

~~~
Collection:
|—— 2022
  |—— 02
    |—— 09-155340.13/
      |—— Full backup files
[...]
|—— incrementals
~~~

[`SHOW BACKUPS IN {collection-location}`](show-backup.html#view-a-list-of-the-available-full-backup-subdirectories) will display a list of the full backup subdirectories in the collection's storage location.

Alternately, the following directories also constitute a backup collection. There are multiple backups in two separate storage locations. Each individual backup is a full backup and its related incremental backup(s). Despite using the [`incremental_location`](#incremental-backups-with-explicitly-specified-destinations) option to store the incremental backup in an alternative location, that incremental backup is still part of this collection as it depends on the full backup in the first cloud storage bucket:

~~~
Cloud storage bucket 1
|—— 2022
  |—— 02
    |—— 09-155340.13/
      |—— Full backup files
      |—— 20220210/
        |—— 155530.50/
        |—— 16-143018.72/
          |—— Full backup files
|—— incrementals
~~~

~~~
Cloud storage bucket 2
|—— 2022
  |—— 02
    |—— 25-172907.21/
      |—— 20220325
        |—— 17921.23
          |—— incremental_location backup files
~~~

In the examples on this page, `{collection location}` is a placeholder for the storage location that will contain the example backup.

## Full backups

Full backups are now available to both core and Enterprise users.

Full backups contain an un-replicated copy of your data and can always be used to restore your cluster. These files are roughly the size of your data and require greater resources to produce than incremental backups. You can take full backups as of a given timestamp. Optionally, you can include the available [revision history](take-backups-with-revision-history-and-restore-from-a-point-in-time.html) in the backup.

In most cases, **it's recommended to take nightly full backups of your cluster**. A cluster backup allows you to do the following:

- Restore table(s) from the cluster
- Restore database(s) from the cluster
- Restore a full cluster

Backups will export [Enterprise license keys](enterprise-licensing.html) during a [full cluster backup](backup.html#backup-a-cluster). When you [restore](restore.html) a full cluster with an Enterprise license, it will restore the Enterprise license of the cluster you are restoring from.

{% include {{ page.version.version }}/backups/file-size-setting.md %}

### Take a full backup

To do a cluster backup, use the [`BACKUP`](backup.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP INTO '{collection location}';
~~~

If it's ever necessary, you can use the [`RESTORE`][restore] statement with `LATEST` to restore the most recent backup added to the [collection](#backup-collections):

To restore a table:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE TABLE bank.customers FROM LATEST IN '{collection location}';
~~~

To restore a database:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE DATABASE bank FROM LATEST IN '{collection location}';
~~~

To restore your full cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE FROM LATEST IN '{collection location}';
~~~

{{site.data.alerts.callout_info}}
A full cluster restore can only be run on a target cluster that has **never** had user-created databases or tables.
{{site.data.alerts.end}}

To restore a backup from a specific subdirectory:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE DATABASE bank FROM {subdirectory} IN '{collection location}';
~~~

To view the available backup subdirectories, use [`SHOW BACKUPS`](show-backup.html).

## Incremental backups

{{site.data.alerts.callout_info}}
To take incremental backups, you need an [Enterprise license](enterprise-licensing.html).
{{site.data.alerts.end}}

If your cluster grows too large for nightly [full backups](#full-backups), you can take less frequent full backups (e.g., weekly) with nightly incremental backups. Incremental backups are storage efficient and faster than full backups for larger clusters.

Incremental backups are smaller and faster to produce than full backups because they contain only the data that has changed since a base set of backups you specify (which must include one full backup, and can include many incremental backups). You can take incremental backups either as of a given timestamp or with full [revision history](take-backups-with-revision-history-and-restore-from-a-point-in-time.html).

{{site.data.alerts.callout_danger}}
Incremental backups can only be created within the garbage collection period of the base backup's most recent timestamp. This is because incremental backups are created by finding which data has been created or modified since the most recent timestamp in the base backup––that timestamp data, though, is deleted by the garbage collection process.

You can configure garbage collection periods using the `ttlseconds` [replication zone setting](configure-replication-zones.html#gc-ttlseconds).
{{site.data.alerts.end}}

### Take an incremental backup

Periodically run the [`BACKUP`][backup] command to take a full backup of your cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP INTO '{collection location}';
~~~

Then, create nightly incremental backups based off of the full backups you've already created. To append an incremental backup to the most recent full backup created in the [collection's](#backup-collections) storage location, use the `LATEST` syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP INTO LATEST IN '{collection location}';
~~~

<span class="version-tag">New in v22.1:</span> This will add the incremental backup to the default `/incrementals` directory at the root of the backup collection's directory. With incremental backups in the `/incrementals` directory, you can apply different lifecycle policies from cloud storage providers to the `/incrementals` directory as needed.

{{site.data.alerts.callout_info}}
If there are existing incremental backups in the storage location taken with v21.2 or earlier, new incremental backups will add to the existing incremental directory, (e.g., `{collection location}/{subdirectory}`). This follows how [incremental backups](take-full-and-incremental-backups.html#take-an-incremental-backup) were stored by default in v21.2 and earlier. To back up using the prior behavior, see this [example](#backup-earlier-behavior) for details on using the `incremental_location` option to achieve this.
{{site.data.alerts.end}}

If it's ever necessary, you can then use the [`RESTORE`][restore] statement to restore your cluster, database(s), and/or table(s). Restoring from incremental backups requires previous full and incremental backups.

To restore from an incremental backup, stored in the default `/incrementals` collection directory, run:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE FROM LATEST IN '{collection location}';
~~~

To define a specific subdirectory in the collection to restore from:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE FROM '{subdirectory}' IN '{collection location}';
~~~

{{site.data.alerts.callout_info}}
`RESTORE` will re-validate [indexes](indexes.html) when [incremental backups](take-full-and-incremental-backups.html) are created from an older version (v20.2.2 and earlier or v20.1.4 and earlier), but restored by a newer version (v21.1.0+). These earlier releases may have included incomplete data for indexes that were in the process of being created.
{{site.data.alerts.end}}

## Incremental backups with explicitly specified destinations

<span class="version-tag">New in v22.1:</span> To explicitly control where your incremental backups go, use the [`incremental_location`](backup.html#options) option.

In the following examples, the `{full_backup_location}` specifies the collection location containing the full backup. The `{incremental_backup_location}` is the alternative location that you can store an incremental backup:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO LATEST IN '{full_backup_location}' AS OF SYSTEM TIME '-10s' WITH incremental_location = '{incremental_backup_location}';
~~~

Although the incremental backup will be in a different storage location, it is still part of the logical [backup collection](#backup-collections).

A full backup must be present in the `{full_backup_location}` in order to take an incremental backup to the alternative `{incremental_backup_location}`. If there isn't a full backup present in `{full_backup_location}` when taking an incremental backup with `incremental_location`, the error `path does not contain a completed latest backup` will be returned.

<a name="backup-earlier-behavior"></a> To take incremental backups to a subdirectory in the collection location that you define (rather than the default `/incrementals` directory), use the `incremental_location` option:

~~~ sql
BACKUP INTO LATEST IN '{full_backup_location}' AS OF SYSTEM TIME '-10s' WITH incremental_location = '{full_backup_location/subdirectory}';
~~~

To restore an incremental backup that was taken using the [`incremental_location` option](restore.html#incr-location), you must run `RESTORE` with the full backup's location and the `incremental_location` option referencing the location passed in the original `BACKUP` statement:

~~~ sql
RESTORE TABLE movr.users FROM LATEST IN '{full_backup_location}' WITH incremental_location = '{incremental_backup_location}';
~~~

For details on cloud storage URLs, see [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html).

## Examples

<div class="filters clearfix">
  <button class="filter-button" data-scope="s3">Amazon S3</button>
  <button class="filter-button" data-scope="azure">Azure Storage</button>
  <button class="filter-button" data-scope="gcs">Google Cloud Storage</button>
</div>

{% include {{ page.version.version }}/backups/bulk-auth-options.md %}

<section class="filter-content" markdown="1" data-scope="s3">

### Automated full backups

Both core and Enterprise users can use backup scheduling for full backups of clusters, databases, or tables. To create schedules that only take full backups, include the `FULL BACKUP ALWAYS` clause. For example, to create a schedule for taking full cluster backups:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEDULE core_schedule_label
  FOR BACKUP INTO 's3://{BUCKET NAME}/{PATH}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    RECURRING '@daily'
    FULL BACKUP ALWAYS
    WITH SCHEDULE OPTIONS first_run = 'now';
~~~
~~~
     schedule_id     |        name         | status |         first_run         | schedule |                                                                                       backup_stmt
---------------------+---------------------+--------+---------------------------+----------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  588799238330220545 | core_schedule_label | ACTIVE | 2020-09-11 00:00:00+00:00 | @daily   | BACKUP INTO 's3://{BUCKET NAME}/{PATH}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' WITH detached
(1 row)
~~~

</section>

<section class="filter-content" markdown="1" data-scope="azure">

### Automated full backups

Both core and Enterprise users can use backup scheduling for full backups of clusters, databases, or tables. To create schedules that only take full backups, include the `FULL BACKUP ALWAYS` clause. For example, to create a schedule for taking full cluster backups:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEDULE core_schedule_label
  FOR BACKUP INTO 'azure://{CONTAINER NAME}/{PATH}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={URL-ENCODED KEY}'
    RECURRING '@daily'
    FULL BACKUP ALWAYS
    WITH SCHEDULE OPTIONS first_run = 'now';
~~~
~~~
     schedule_id     |        name         | status |         first_run         | schedule |                                                                                       backup_stmt
---------------------+---------------------+--------+---------------------------+----------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  588799238330220545 | core_schedule_label | ACTIVE | 2020-09-11 00:00:00+00:00 | @daily   | BACKUP INTO 'azure://{CONTAINER NAME}/{PATH}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={URL-ENCODED KEY}' WITH detached
(1 row)
~~~

</section>

<section class="filter-content" markdown="1" data-scope="gcs">

### Automated full backups

Both core and Enterprise users can use backup scheduling for full backups of clusters, databases, or tables. To create schedules that only take full backups, include the `FULL BACKUP ALWAYS` clause. For example, to create a schedule for taking full cluster backups:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEDULE core_schedule_label
  FOR BACKUP INTO 'gs://{BUCKET NAME}/{PATH}?AUTH=specified&CREDENTIALS={ENCODED KEY}'
    RECURRING '@daily'
    FULL BACKUP ALWAYS
    WITH SCHEDULE OPTIONS first_run = 'now';
~~~
~~~
     schedule_id     |        name         | status |         first_run         | schedule |                                                                                       backup_stmt
---------------------+---------------------+--------+---------------------------+----------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  588799238330220545 | core_schedule_label | ACTIVE | 2020-09-11 00:00:00+00:00 | @daily   | BACKUP INTO 'gs://{BUCKET NAME}/{PATH}?AUTH=specified&CREDENTIALS={ENCODED KEY}' WITH detached
(1 row)
~~~

</section>

For more examples on how to schedule backups that take full and incremental backups, see [`CREATE SCHEDULE FOR BACKUP`](create-schedule-for-backup.html).

### Advanced examples

{% include {{ page.version.version }}/backups/advanced-examples-list.md %}

{{site.data.alerts.callout_info}}
To take incremental backups, backups with revision history, locality-aware backups, and encrypted backups, you need an [Enterprise license](enterprise-licensing.html).
{{site.data.alerts.end}}

## See also

- [`BACKUP`][backup]
- [`RESTORE`][restore]
- [Take and Restore Encrypted Backups](take-and-restore-encrypted-backups.html)
- [Take and Restore Locality-aware Backups](take-and-restore-locality-aware-backups.html)
- [Take Backups with Revision History and Restore from a Point-in-time](take-backups-with-revision-history-and-restore-from-a-point-in-time.html)
- [`IMPORT`](migration-overview.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [`cockroach` Commands Overview](cockroach-commands.html)

<!-- Reference links -->

[backup]:  backup.html
[restore]: restore.html
