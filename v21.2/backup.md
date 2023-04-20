---
title: BACKUP
summary: Back up your CockroachDB cluster to a cloud storage services such as AWS S3, Google Cloud Storage, or other NFS.
toc: true
docs_area: reference.sql
---

CockroachDB's `BACKUP` [statement](sql-statements.html) allows you to create [full or incremental backups](take-full-and-incremental-backups.html) of your cluster's schema and data that are consistent as of a given timestamp.

You can [backup a full cluster](#backup-a-cluster), which includes:

- Relevant system tables
- All [databases](create-database.html)
- All [tables](create-table.html) (which automatically includes their [indexes](indexes.html))
- All [views](views.html)
- All [scheduled jobs](manage-a-backup-schedule.html#view-and-control-a-backup-initiated-by-a-schedule)

You can also backup:

- [An individual database](#backup-a-database), which includes all of its tables and views.
- [An individual table](#backup-a-table-or-view), which includes its indexes and views.

    `BACKUP` only backs up entire tables; it **does not** support backing up subsets of a table.

Because CockroachDB is designed with high fault tolerance, these backups are designed primarily for disaster recovery (i.e., if your cluster loses a majority of its nodes) through [`RESTORE`](restore.html). Isolated issues (such as small-scale node outages) do not require any intervention.

{{site.data.alerts.callout_info}}
The [`BACKUP ... TO`](../v20.2/backup.html) and [`RESTORE ... FROM`](../v20.2/restore.html) syntax is **deprecated** as of v22.1 and will be removed in a future release.

We recommend using the `BACKUP ... INTO {collectionURI}` syntax, which creates or adds to a [backup collection](take-full-and-incremental-backups.html#backup-collections) in your storage location. For restoring backups, we recommend using `RESTORE FROM {backup} IN {collectionURI}` with `{backup}` being [`LATEST`](restore.html#restore-the-most-recent-backup) or a specific [subdirectory](restore.html#subdir-param).

For guidance on the syntax for backups and restores, see the [`BACKUP`](backup.html#examples) and [`RESTORE`](restore.html#examples) examples.
{{site.data.alerts.end}}

## Considerations

- Core users can only take [full backups](take-full-and-incremental-backups.html#full-backups). To use the other backup features, you need an [Enterprise license](enterprise-licensing.html). You can also use [{{ site.data.products.dedicated }}](https://cockroachlabs.cloud/signup?referralId=docs-crdb-backup), which runs [full backups daily and incremental backups hourly](../cockroachcloud/use-managed-service-backups.html).
- `BACKUP` is a blocking statement. To run a backup job asynchronously, use the `DETACHED` option. See the [options](#options) below.
- Backups will export [Enterprise license keys](enterprise-licensing.html) during a [full cluster backup](#backup-a-cluster). When you [restore](restore.html) a full cluster with an Enterprise license, it will restore the Enterprise license of the cluster you are restoring from.
- [Zone configurations](configure-zone.html) present on the destination cluster prior to a restore will be **overwritten** during a [cluster restore](restore.html#full-cluster) with the zone configurations from the [backed up cluster](#backup-a-cluster). If there were no customized zone configurations on the cluster when the backup was taken, then after the restore the destination cluster will use the zone configuration from the [`RANGE DEFAULT` configuration](configure-replication-zones.html#view-the-default-replication-zone).
- You cannot restore a backup of a multi-region database into a single-region database.
- While Cockroach Labs actively tests Amazon S3, Google Cloud Storage, and Azure Storage, we **do not** test [S3-compatible services](use-cloud-storage-for-bulk-operations.html) (e.g., [MinIO](https://min.io/), [Red Hat Ceph](https://docs.ceph.com/en/pacific/radosgw/s3/)).

{{site.data.alerts.callout_success}}
To view the contents of a backup created with the `BACKUP` statement, use [`SHOW BACKUP`](show-backup.html).
{{site.data.alerts.end}}

## Required privileges

- [Full cluster backups](take-full-and-incremental-backups.html#full-backups) can only be run by members of the [`admin` role](security-reference/authorization.html#admin-role). By default, the `root` user belongs to the `admin` role.
- For all other backups, the user must have [read access](security-reference/authorization.html#managing-privileges) on all objects being backed up. Database backups require `CONNECT` privileges, and table backups require `SELECT` privileges. Backups of user-defined schemas, or backups containing user-defined types, require `USAGE` privileges.
- `BACKUP` requires full read and write (including delete and overwrite) permissions to its target destination.

### Destination privileges

{% include {{ page.version.version }}/backups/destination-file-privileges.md %}

{% include {{ page.version.version }}/misc/s3-compatible-warning.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/backup.html %}
</div>

## Parameters

 Parameter | Description
-----------+-------------
`targets` | Back up the listed [targets](#targets).
`subdirectory` | The name of the specific backup (e.g., `2021/03/23-213101.37`) in the collection to which you want to add an [incremental backup](take-full-and-incremental-backups.html#incremental-backups). To view available backup subdirectories, use [`SHOW BACKUPS IN destination`](show-backup.html). If the backup `subdirectory` is not provided, a [full backup](take-full-and-incremental-backups.html#full-backups) will be created in the collection using a date-based naming scheme (i.e., `<year>/<month>/<day>-<timestamp>`).<br><br>**Warning:** If you use an arbitrary `STRING` as the subdirectory, a new full backup will be created, but it will never be shown in `SHOW BACKUPS IN`. We do not recommend using arbitrary strings as subdirectory names.
`LATEST` | Append an incremental backup to the latest completed full backup's subdirectory.
`destination` | The URL where you want to store the backup.<br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls).
`timestamp` | Back up data as it existed as of [`timestamp`](as-of-system-time.html). The `timestamp` must be more recent than your data's garbage collection TTL (which is controlled by the [`gc.ttlseconds` replication zone variable](configure-replication-zones.html#gc-ttlseconds)).
`backup_options` | Control the backup behavior with a comma-separated list of [these options](#options).

### Targets

Target                             | Description
-----------------------------------+-------------------------------------------------------------------------
N/A                                | Backup the cluster. For an example of a full cluster backup, [see Backup a cluster](#backup-a-cluster).
`DATABASE {database_name} [, ...]` | The name of the database(s) you want to backup (i.e., create backups of all tables and views in the database). For an example of backing up a database, see [Backup a database](#backup-a-database).
`TABLE {table_name} [, ...]`       | The name of the table(s) or [view(s)](views.html) you want to backup. For an example of backing up a table or view, see [Backup a table or view](#backup-a-table-or-view).

### Options

{% include {{ page.version.version }}/backups/backup-options.md %}

### Backup file URLs

CockroachDB uses the URL provided to construct a secure API call to the service you specify. The URL structure depends on the type of file storage you are using. For more information, see the following:

- [URL format](use-cloud-storage-for-bulk-operations.html#url-format)
- [Example file URLs](use-cloud-storage-for-bulk-operations.html#example-file-urls)
- [Authentication parameters](use-cloud-storage-for-bulk-operations.html#authentication)

{{site.data.alerts.callout_success}}
Backups support [Amazon S3 storage classes](#back-up-with-an-s3-storage-class). For more detail, see [Additional cloud storage feature support](use-cloud-storage-for-bulk-operations.html#additional-cloud-storage-feature-support).
{{site.data.alerts.end}}

## Functional details

### Object dependencies

Dependent objects must be backed up at the same time as the objects they depend on.

Object | Depends On
-------|-----------
Table with [foreign key](foreign-key.html) constraints | The table it `REFERENCES`; however, this dependency can be [removed during the restore](restore.html#skip_missing_foreign_keys).
Table with a [sequence](create-sequence.html) | The sequence it uses; however, this dependency can be [removed during the restore](restore.html#skip_missing_sequences).
[Views](views.html) | The tables used in the view's `SELECT` statement.

### Users and privileges

The `system.users` table stores your users and their passwords. To restore your users and privilege [grants](grant.html), do a cluster backup and restore the cluster to a fresh cluster with no user data. You can also backup the `system.users` table, and then use [this procedure](restore.html#restoring-users-from-system-users-backup).

## Performance

The `BACKUP` process minimizes its impact to the cluster's performance by distributing work to all nodes. Each node backs up only a specific subset of the data it stores (those for which it serves writes; more details about this architectural concept forthcoming), with no two nodes backing up the same data.

`BACKUP`, like any read, cannot export a range if the range contains an [unresolved intent](architecture/transaction-layer.html#resolving-write-intents). While you typically will want bulk, background jobs like `BACKUP` to have as little impact on your foreground traffic as possible, it's more important for backups to actually complete (which maintains your [recovery point objective (RPO)](https://en.wikipedia.org/wiki/Disaster_recovery#Recovery_Point_Objective)). Unlike a normal read transaction that will block until any uncommitted writes it encounters are resolved, `BACKUP` will block only for a configurable duration before invoking priority to ensure it can complete on-time.

We recommend always starting backups with a specific [timestamp](timestamp.html) at least 10 seconds in the past. For example:

~~~ sql
> BACKUP...AS OF SYSTEM TIME '-10s';
~~~

This improves performance by decreasing the likelihood that the `BACKUP` will be [retried because it contends with other statements/transactions](transactions.html#transaction-retries). However, because `AS OF SYSTEM TIME` returns historical data, your reads might be stale. Taking backups with `AS OF SYSTEM TIME '-10s'` is a good best practice to reduce the number of still-running transactions you may encounter, since the backup will take priority and will force still-running transactions to restart after the backup is finished.

`BACKUP` will initially ask individual ranges to backup but to skip if they encounter an intent. Any range that is skipped is placed at the end of the queue. When `BACKUP` has completed its initial pass and is revisiting ranges, it will ask any range that did not resolve within the given time limit (default 1 minute) to attempt to resolve any intents that it encounters and to _not_ skip. Additionally, the backup's transaction priority is then set to `high`, which causes other transactions to abort until the intents are resolved and the backup is finished.

{% include {{ page.version.version }}/backups/file-size-setting.md %}

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
The presence of the `BACKUP MANIFEST` file in the backup subdirectory is an indicator that the backup job completed successfully.
{{site.data.alerts.end}}

## Examples

Per our guidance in the [Performance](#performance) section, we recommend starting backups from a time at least 10 seconds in the past using [`AS OF SYSTEM TIME`](as-of-system-time.html).

{% include {{ page.version.version }}/backups/bulk-auth-options.md %}

{{site.data.alerts.callout_info}}
The [`BACKUP ... TO`](../v20.2/backup.html) and [`RESTORE ... FROM`](../v20.2/restore.html) syntax is **deprecated** as of v22.1 and will be removed in a future release.

We recommend using the `BACKUP ... INTO {collectionURI}` syntax, which creates or adds to a [backup collection](take-full-and-incremental-backups.html#backup-collections) in your storage location. For restoring backups, we recommend using `RESTORE FROM {backup} IN {collectionURI}` with `{backup}` being [`LATEST`](restore.html#restore-the-most-recent-backup) or a specific [subdirectory](restore.html#subdir-param).

For guidance on the syntax for backups and restores, see the [`BACKUP`](backup.html#examples) and [`RESTORE`](restore.html#examples) examples.
{{site.data.alerts.end}}

### Backup a cluster

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of a cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP INTO \
's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

### Backup a database

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of a single database:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank \
INTO 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of multiple databases:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank, employees \
INTO 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

### Backup a table or view

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of a single table or view:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP bank.customers \
INTO 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of multiple tables:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP bank.customers, bank.accounts \
INTO 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

### Specify a subdirectory for backups

To store the backup in a specific subdirectory in the storage location:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP DATABASE bank INTO 'subdirectory' IN 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

### Backup all tables in a schema

{% include_cached new-in.html version="v21.2" %} To back up all tables in a [specified schema](create-schema.html), use a wildcard with the schema name:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP test_schema.*
INTO 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

Alternatively, use a [fully qualified name](sql-name-resolution.html#lookup-with-fully-qualified-names): `database.schema.*`.

With this syntax, schemas will be resolved before databases. `test_object.*` will resolve to a _schema_ of `test_object` within the set current database before matching to a database of `test_object`.

If a database and schema have the same name, such as `bank.bank`, running `BACKUP bank.*` will result in the schema resolving first. All the tables within that schema will be backed up. However, if this were to be run from a different database that does not have a `bank` schema, all tables in the `bank` database will be backed up.

See [Name Resolution](sql-name-resolution.html) for more details on how naming hierarchy and name resolution work in CockroachDB.

### Create incremental backups

If you backup to a destination already containing a [full backup](take-full-and-incremental-backups.html#full-backups), an [incremental backup](take-full-and-incremental-backups.html#incremental-backups) will be appended to the full backup's path with a date-based name (e.g., `20210324`):

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP INTO LATEST IN \
's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

### Run a backup asynchronously

Use the `DETACHED` [option](#options) to execute the backup [job](show-jobs.html) asynchronously:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP INTO \
's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s'
WITH DETACHED;
~~~

The job ID is returned after the backup job creation completes: 

~~~
        job_id
----------------------
  592786066399264769
(1 row)
~~~

**Without** the `DETACHED` option, `BACKUP` will block the SQL connection until the job completes. Once finished, the job status and more detailed job data is returned:

~~~
job_id             |  status   | fraction_completed | rows | index_entries | bytes
---------------------+-----------+--------------------+------+---------------+--------
652471804772712449 | succeeded |                  1 |   50 |             0 |  4911
(1 row)
~~~

### Back up with an S3 storage class

{% include_cached new-in.html version="v21.2.6" %} To associate your backup objects with a [specific storage class](use-cloud-storage-for-bulk-operations.html#amazon-s3-storage-classes) in your Amazon S3 bucket, use the `S3_STORAGE_CLASS` parameter with the class. For example, the following S3 connection URI specifies the `INTELLIGENT_TIERING` storage class:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP DATABASE movr INTO 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}&S3_STORAGE_CLASS=INTELLIGENT_TIERING' AS OF SYSTEM TIME '-10s';
~~~

{% include {{ page.version.version }}/misc/storage-classes.md %}

{% include {{ page.version.version }}/misc/storage-class-glacier-incremental.md %}

### Advanced examples

{% include {{ page.version.version }}/backups/advanced-examples-list.md %}

## See also

- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [Take and Restore Encrypted Backups](take-and-restore-encrypted-backups.html)
- [Take and Restore Locality-aware Backups](take-and-restore-locality-aware-backups.html)
- [Take Backups with Revision History and Restore from a Point-in-time](take-backups-with-revision-history-and-restore-from-a-point-in-time.html)
- [`SHOW BACKUP`](show-backup.html)
- [`CREATE SCHEDULE FOR BACKUP`](create-schedule-for-backup.html)
- [`RESTORE`](restore.html)
- [Configure Replication Zones](configure-replication-zones.html)
