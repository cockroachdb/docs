---
title: BACKUP
summary: Back up your CockroachDB cluster to a cloud storage services such as AWS S3, Google Cloud Storage, or other NFS.
toc: true
---

CockroachDB's `BACKUP` [statement](sql-statements.html) allows you to create [full or incremental backups](take-full-and-incremental-backups.html) of your cluster's schema and data that are consistent as of a given timestamp.

You can [backup a full cluster](#backup-a-cluster), which includes:

- Relevant system tables
- All [databases](create-database.html)
- All [tables](create-table.html) (which automatically includes their [indexes](indexes.html))
- All [views](views.html)
- All [scheduled jobs](manage-a-backup-schedule.html#view-and-control-a-backup-initiated-by-a-schedule)

You can also back up:

- [An individual database](#backup-a-database), which includes all of its tables and views
- [An individual table](#backup-a-table-or-view), which includes its indexes and views

    `BACKUP` only backs up entire tables; it **does not** support backing up subsets of a table.

Because CockroachDB is designed with high fault tolerance, these backups are designed primarily for disaster recovery (i.e., if your cluster loses a majority of its nodes) through [`RESTORE`](restore.html). Isolated issues (such as small-scale node outages) do not require any intervention.

{{site.data.alerts.callout_info}}
The [`BACKUP ... TO`](../v20.2/backup.html) and [`RESTORE ... FROM`](../v20.2/restore.html) syntax is **deprecated** as of v22.1 and will be removed in a future release.

We recommend using the `BACKUP ... INTO {collectionURI}` syntax, which creates or adds to a [backup collection](take-full-and-incremental-backups.html#backup-collections) in your storage location. For restoring backups, we recommend using `RESTORE FROM {backup} IN {collectionURI}` with `{backup}` being [`LATEST`](restore.html#restore-the-most-recent-backup) or a specific [subdirectory](restore.html#subdir-param).

For guidance on the syntax for backups and restores, see the [`BACKUP`](backup.html#examples) and [`RESTORE`](restore.html#examples) examples.
{{site.data.alerts.end}}

## Considerations

- Core users can only take [full backups](take-full-and-incremental-backups.html#full-backups). To use the other backup features, you need an [Enterprise license](enterprise-licensing.html). You can also use [{{ site.data.products.dedicated }}](https://cockroachlabs.cloud/signup?referralId=docs-crdb-backup), which runs [full backups daily and incremental backups hourly](../cockroachcloud/backups-page.html).
- `BACKUP` is a blocking statement. To run a backup job asynchronously, use the `DETACHED` option. See the [options](#options) below.
- Backups will export [Enterprise license keys](enterprise-licensing.html) during a [full cluster backup](#backup-a-cluster). When you [restore](restore.html) a full cluster with an Enterprise license, it will restore the Enterprise license of the cluster you are restoring from.
- [Interleaving data](interleave-in-parent.html) is disabled in v21.1 by default, and will be permanently removed from CockroachDB in a future release. CockroachDB versions v21.2 and later will not be able to read or restore backups that include interleaved data. To backup interleaved data in v21.1, a `BACKUP` statement must include the [`INCLUDE_DEPRECATED_INTERLEAVES` option](#include-deprecated-interleaves).
- [Zone configurations](configure-zone.html) present on the destination cluster prior to a restore will be **overwritten** during a [cluster restore](restore.html#full-cluster) with the zone configurations from the [backed-up cluster](#backup-a-cluster). If there were no customized zone configurations on the cluster when the backup was taken, then after the restore the destination cluster will use the zone configuration from the [`RANGE DEFAULT` configuration](configure-replication-zones.html#view-the-default-replication-zone).
- You cannot restore a backup of a multi-region database into a single-region database.

{{site.data.alerts.callout_success}}
To view the contents of an Enterprise backup created with the `BACKUP` statement, use [`SHOW BACKUP`](show-backup.html).
{{site.data.alerts.end}}

## Required privileges

- [Full cluster backups](take-full-and-incremental-backups.html#full-backups) can only be run by members of the [`admin` role](authorization.html#admin-role). By default, the `root` user belongs to the `admin` role.
- For all other backups, the user must have [read access](authorization.html#assign-privileges) on all objects being backed up. Database and table backups require `SELECT` privileges. Backups of user-defined schemas, or backups containing user-defined types, require `USAGE` privileges.
- `BACKUP` requires full read and write (including delete and overwrite) permissions to its target destination.

### Destination privileges

{% include {{ page.version.version }}/backups/destination-file-privileges.md %}

## Synopsis

<div>
{% include {{ page.version.version }}/sql/generated/diagrams/backup.html %}
</div>

## Parameters

 Parameter | Description
-----------+-------------
`targets` | Back up the listed [targets](#targets).
`subdirectory` | The name of the specific backup (e.g., `2021/03/23-213101.37`) in the collection to which you want to add an [incremental backup](take-full-and-incremental-backups.html#incremental-backups). To view available backup subdirectories, use [`SHOW BACKUPS IN destination`](show-backup.html). If the backup `subdirectory` is not provided, a [full backup](take-full-and-incremental-backups.html#full-backups) will be created in the collection using a date-based naming scheme (i.e., `<year>/<month>/<day>-<timestamp>`).<br><br>**Warning:** If you use an arbitrary `STRING` as the subdirectory, a new full backup will be created, but it will never be shown in `SHOW BACKUPS IN`. We do not recommend using arbitrary strings as subdirectory names.
`LATEST` | Append an incremental backup to the latest completed full backup's subdirectory.
`destination` | The URL where you want to store the backup.<br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls).
`timestamp` | Back up data as it existed as of [`timestamp`](as-of-system-time.html). The `timestamp` must be more recent than your cluster's last garbage collection (which defaults to occur every 25 hours, but is [configurable per table](configure-replication-zones.html#replication-zone-variables)).
`backup_options` | Control the backup behavior with a comma-separated list of [these options](#options).

### Targets

Target                             | Description
-----------------------------------+-------------------------------------------------------------------------
N/A                                | Backup the cluster. For an example of a full cluster backup, [see Backup a cluster](#backup-a-cluster).
`DATABASE {database_name} [, ...]` | The name of the database(s) you want to back up (i.e., create backups of all tables and views in the database). For an example of backing up a database, see [Backup a database](#backup-a-database).
`TABLE {table_name} [, ...]`       | The name of the table(s) or [view(s)](views.html) you want to back up. For an example of backing up a table or view, see [Backup a table or view](#backup-a-table-or-view).

### Options

{% include {{ page.version.version }}/backups/backup-options.md %}

### Backup file URLs

CockroachDB uses the URL provided to construct a secure API call to the service you specify. The URL structure depends on the type of file storage you are using. For more information, see the following:

- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)

    {{site.data.alerts.callout_info}}
    HTTP storage is not supported for `BACKUP` and `RESTORE`.
    {{site.data.alerts.end}}

- [Use a Local File Server for Bulk Operations](use-a-local-file-server-for-bulk-operations.html)

## Functional details

### Object dependencies

Dependent objects must be backed up at the same time as the objects they depend on.

Object | Depends On
-------|-----------
Table with [foreign key](foreign-key.html) constraints | The table it `REFERENCES`; however, this dependency can be [removed during the restore](restore.html#skip_missing_foreign_keys).
Table with a [sequence](create-sequence.html) | The sequence it uses; however, this dependency can be [removed during the restore](restore.html#skip_missing_sequences).
[Views](views.html) | The tables used in the view's `SELECT` statement.
[Interleaved tables](interleave-in-parent.html) | The parent table in the [interleaved hierarchy](interleave-in-parent.html).

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

Per our guidance in the [Performance](#performance) section, we recommend starting backups from a time at least 10 seconds in the past using [`AS OF SYSTEM TIME`](as-of-system-time.html). Each example below follows this guidance.

{% include {{ page.version.version }}/backups/bulk-auth-options.md %}

<div class="filters clearfix">
  <button class="filter-button" data-scope="s3">Amazon S3</button>
  <button class="filter-button" data-scope="azure">Azure Storage</button>
  <button class="filter-button" data-scope="gcs">Google Cloud Storage</button>
</div>

<section class="filter-content" markdown="1" data-scope="s3">

The examples in this section use the **default** `AUTH=specified` parameter. For more detail on how to use `implicit` authentication with Amazon S3 buckets, read [Use Cloud Storage for Bulk Operations — Authentication](use-cloud-storage-for-bulk-operations.html#authentication).

{{site.data.alerts.callout_info}}
{% include_cached new-in.html version="v21.1" %} The syntax `BACKUP ... INTO` adds a backup to a collection within the backup destination. The path to the backup is created using a date-based naming scheme. Versions of CockroachDB prior to v21.1 used the syntax `BACKUP ... TO` to backup directly to a specific operator-chosen destination, rather than picking a date-based path. The `BACKUP ... TO` syntax will be **deprecated** in future releases. For more information on this soon-to-be deprecated syntax, [see the docs for v20.2](../v20.2/backup.html) or earlier.
{{site.data.alerts.end}}

### Backup a cluster

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of a cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP INTO \
's3://{BUCKET NAME}/{PATH}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

### Backup a database

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of a single database:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank \
INTO 's3://{BUCKET NAME}/{PATH}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of multiple databases:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank, employees \
INTO 's3://{BUCKET NAME}/{PATH}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

### Backup a table or view

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of a single table or view:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP bank.customers \
INTO 's3://{BUCKET NAME}/{PATH}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of multiple tables:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP bank.customers, bank.accounts \
INTO 's3://{BUCKET NAME}/{PATH}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

{{site.data.alerts.callout_danger}}
{% include {{page.version.version}}/backups/no-multiregion-table-backups.md %}
{{site.data.alerts.end}}

### Specify a subdirectory for backups

To store the backup in a specific subdirectory in the storage location:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP DATABASE bank INTO 'subdirectory' IN 's3://{BUCKET NAME}/{PATH}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

### Create incremental backups

If you backup to a destination already containing a [full backup](take-full-and-incremental-backups.html#full-backups), an [incremental backup](take-full-and-incremental-backups.html#incremental-backups) will be appended to the full backup's path with a date-based name (e.g., `20210324`):

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP INTO LATEST IN \
's3://{BUCKET NAME}/{PATH}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

### Run a backup asynchronously

Use the `DETACHED` [option](#options) to execute the backup [job](show-jobs.html) asynchronously:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP INTO \
's3://{BUCKET NAME}/{PATH}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}' \
AS OF SYSTEM TIME '-10s'
WITH DETACHED;
~~~

The job ID is returned after the backup [job creation](backup-architecture.html#job-creation-phase) completes:

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

</section>

<section class="filter-content" markdown="1" data-scope="azure">

{{site.data.alerts.callout_info}}
{% include_cached new-in.html version="v21.1" %} The syntax `BACKUP ... INTO` adds a backup to a collection within the backup destination. The path to the backup is created using a date-based naming scheme. Versions of CockroachDB prior to v21.1 used the syntax `BACKUP ... TO` to backup directly to a specific operator-chosen destination, rather than picking a date-based path. The `BACKUP ... TO` syntax will be **deprecated** in future releases. For more information on this soon-to-be deprecated syntax, [see the docs for v20.2](../v20.2/backup.html) or earlier.
{{site.data.alerts.end}}

### Backup a cluster

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of a cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP INTO \
'azure://{CONTAINER NAME}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={URL-ENCODED KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

### Backup a database

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of a single database:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank \
INTO 'azure://{CONTAINER NAME}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={URL-ENCODED KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of multiple databases:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank, employees \
INTO 'azure://{CONTAINER NAME}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={URL-ENCODED KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

### Backup a table or view

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of a single table or view:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP bank.customers \
INTO 'azure://{CONTAINER NAME}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={URL-ENCODED KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of multiple tables:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP bank.customers, bank.accounts \
INTO 'azure://{CONTAINER NAME}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={URL-ENCODED KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

{{site.data.alerts.callout_danger}}
{% include {{page.version.version}}/backups/no-multiregion-table-backups.md %}
{{site.data.alerts.end}}

### Specify a subdirectory for backups

To store the backup in a specific subdirectory in the storage location:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP DATABASE bank INTO 'subdirectory' IN 'azure://{CONTAINER NAME}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={URL-ENCODED KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

### Create incremental backups

If you backup to a destination already containing a [full backup](take-full-and-incremental-backups.html#full-backups), an [incremental backup](take-full-and-incremental-backups.html#incremental-backups) will be appended to the full backup's path with a date-based name (e.g., `20210324`):

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP INTO LATEST IN \
'azure://{CONTAINER NAME}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={URL-ENCODED KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

### Run a backup asynchronously

Use the `DETACHED` [option](#options) to execute the backup [job](show-jobs.html) asynchronously:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP INTO \
'azure://{CONTAINER NAME}?AZURE_ACCOUNT_NAME={ACCOUNT NAME}&AZURE_ACCOUNT_KEY={URL-ENCODED KEY}' \
AS OF SYSTEM TIME '-10s'
WITH DETACHED;
~~~

The job ID is returned after the backup [job creation](backup-architecture.html#job-creation-phase) completes:

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

</section>

<section class="filter-content" markdown="1" data-scope="gcs">

The examples in this section use the `AUTH=specified` parameter, which will be the default behavior in v21.2 and beyond for connecting to Google Cloud Storage. For more detail on how to pass your Google Cloud Storage credentials with this parameter, or, how to use `implicit` authentication, read [Use Cloud Storage for Bulk Operations — Authentication](use-cloud-storage-for-bulk-operations.html#authentication).

{{site.data.alerts.callout_info}}
{% include_cached new-in.html version="v21.1" %} The syntax `BACKUP ... INTO` adds a backup to a collection within the backup destination. The path to the backup is created using a date-based naming scheme. Versions of CockroachDB prior to v21.1 used the syntax `BACKUP ... TO` to backup directly to a specific operator-chosen destination, rather than picking a date-based path. The `BACKUP ... TO` syntax will be **deprecated** in future releases. For more information on this soon-to-be deprecated syntax, [see the docs for v20.2](../v20.2/backup.html) or earlier.
{{site.data.alerts.end}}

### Backup a cluster

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of a cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP INTO \
'gs://{BUCKET NAME}/{PATH}?AUTH=specified&CREDENTIALS={ENCODED KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

### Backup a database

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of a single database:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank \
INTO 'gs://{BUCKET NAME}/{PATH}?AUTH=specified&CREDENTIALS={ENCODED KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of multiple databases:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank, employees \
INTO 'gs://{BUCKET NAME}/{PATH}?AUTH=specified&CREDENTIALS={ENCODED KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

### Backup a table or view

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of a single table or view:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP bank.customers \
INTO 'gs://{BUCKET NAME}/{PATH}?AUTH=specified&CREDENTIALS={ENCODED KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

To take a [full backup](take-full-and-incremental-backups.html#full-backups) of multiple tables:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP bank.customers, bank.accounts \
INTO 'gs://{BUCKET NAME}/{PATH}?AUTH=specified&CREDENTIALS={ENCODED KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

{{site.data.alerts.callout_danger}}
{% include {{page.version.version}}/backups/no-multiregion-table-backups.md %}
{{site.data.alerts.end}}

### Specify a subdirectory for backups

To store the backup in a specific subdirectory in the storage location:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP DATABASE bank INTO 'subdirectory' IN 'gs://{BUCKET NAME}/{PATH}?AUTH=specified&CREDENTIALS={ENCODED KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

### Create incremental backups

If you backup to a destination already containing a [full backup](take-full-and-incremental-backups.html#full-backups), an [incremental backup](take-full-and-incremental-backups.html#incremental-backups) will be appended to the full backup's path with a date-based name (e.g., `20210324`):

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP INTO LATEST IN \
'gs://{BUCKET NAME}/{PATH}?AUTH=specified&CREDENTIALS={ENCODED KEY}' \
AS OF SYSTEM TIME '-10s';
~~~

### Run a backup asynchronously

Use the `DETACHED` [option](#options) to execute the backup [job](show-jobs.html) asynchronously:

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP INTO \
'gs://{BUCKET NAME}/{PATH}?AUTH=specified&CREDENTIALS={ENCODED KEY}' \
AS OF SYSTEM TIME '-10s'
WITH DETACHED;
~~~

The job ID is returned after the backup [job creation](backup-architecture.html#job-creation-phase) completes:

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

</section>

### Advanced examples

{% include {{ page.version.version }}/backups/advanced-examples-list.md %}

## Known limitations

### Using interleaved tables in backups

{% include {{ page.version.version }}/known-limitations/backup-interleaved.md %}

### `BACKUP` of multi-region tables

{% include {{page.version.version}}/backups/no-multiregion-table-backups.md %}

## See also

- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [Take and Restore Encrypted Backups](take-and-restore-encrypted-backups.html)
- [Take and Restore Locality-aware Backups](take-and-restore-locality-aware-backups.html)
- [Take Backups with Revision History and Restore from a Point-in-time](take-backups-with-revision-history-and-restore-from-a-point-in-time.html)
- [`SHOW BACKUP`](show-backup.html)
- [`CREATE SCHEDULE FOR BACKUP`](create-schedule-for-backup.html)
- [`RESTORE`](restore.html)
- [Configure Replication Zones](configure-replication-zones.html)
