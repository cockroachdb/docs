---
title: BACKUP
summary: Back up your CockroachDB cluster to cloud storage services such as AWS S3, Google Cloud Storage, or other NFS.
toc: true
docs_area: reference.sql
---

CockroachDB's `BACKUP` [statement]({% link {{ page.version.version }}/sql-statements.md %}) allows you to create [full or incremental backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}) of your cluster's schema and data that are consistent as of a given timestamp.

You can [back up a full cluster](#back-up-a-cluster), which includes:

- Relevant system tables
- All [databases]({% link {{ page.version.version }}/create-database.md %})
- All [tables]({% link {{ page.version.version }}/create-table.md %}) (which automatically includes their [indexes]({% link {{ page.version.version }}/indexes.md %}))
- All [views]({% link {{ page.version.version }}/views.md %})
- All [scheduled jobs]({% link {{ page.version.version }}/manage-a-backup-schedule.md %}#view-and-control-a-backup-initiated-by-a-schedule)

You can also backup:

- [An individual database](#back-up-a-database), which includes all of its tables and views.
- [An individual table](#back-up-a-table-or-view), which includes its indexes and views.

    `BACKUP` only backs up entire tables; it **does not** support backing up subsets of a table.

Because CockroachDB is designed with high fault tolerance, these backups are designed primarily for disaster recovery (i.e., if your cluster loses a majority of its nodes) through [`RESTORE`]({% link {{ page.version.version }}/restore.md %}). Isolated issues (such as small-scale node outages) do not require any intervention. You can check that backups in external storage are valid by using a [backup validation]({% link {{ page.version.version }}/backup-validation.md %}) command.

To view the contents of an backup created with the `BACKUP` statement, use [`SHOW BACKUP`]({% link {{ page.version.version }}/show-backup.md %}).

{% include {{ page.version.version }}/backups/scheduled-backups-tip.md %}

{% include {{ page.version.version }}/backups/old-syntax-removed.md %}

## Considerations

- [Full cluster backups](#back-up-a-cluster) include [license keys]({% link {{ page.version.version }}/licensing-faqs.md %}#set-a-license). When you [restore]({% link {{ page.version.version }}/restore.md %}) a full cluster backup that includes a license, the license is also restored.
- You cannot restore a backup of a multi-region database into a single-region database.
- Exclude a table's row data from a backup using the [`exclude_data_from_backup`]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#exclude-a-tables-data-from-backups) parameter.
- `BACKUP` is a blocking statement. To run a backup job asynchronously, use the `DETACHED` option. See the [options](#options) below.
- {% include {{ page.version.version }}/backups/zone-configs-overwritten-during-restore.md %}

### Storage considerations

- Cockroach Labs tests functionality with AWS S3, Google Cloud Storage (GCS), and Azure Blob Storage. Other S3-compatible storage solutions are untested, but common compatibility issues in v24.3 and later may be fixed by adding the `AWS_SKIP_CHECKSUM` option to the S3 URLs.
- [HTTP storage]({% link {{ page.version.version }}/use-a-local-file-server.md %}) is not supported for `BACKUP` and `RESTORE`.
- Modifying backup files in the storage location could invalidate a backup, and therefore, prevent a restore. In v22.1 and later, **we recommend enabling [object locking]({% link {{ page.version.version }}/use-cloud-storage.md %}#immutable-storage) in your cloud storage bucket.**

{{site.data.alerts.callout_danger}}
Cockroach Labs does not officially support untested storage systems. If you encounter issues when using unsupported S3-compatible storage, drivers, or frameworks, contact the maintainer.
{{site.data.alerts.end}}
{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/backups/external-storage-check-tip.md %}
{{site.data.alerts.end}}

## Required privileges

{% include {{ page.version.version }}/backups/updated-backup-privileges.md %}

## Required privileges using the legacy privilege model

The following details the legacy privilege model that CockroachDB supports in v22.2 and earlier. Support for this privilege model will be removed in a future release of CockroachDB:

- [Full cluster backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups) can only be run by members of the [`admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role). By default, the `root` user belongs to the `admin` role.
- For all other backups, the user must have [read access]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on all objects being backed up. Database backups require `CONNECT` privileges, and table backups require `SELECT` privileges. Backups of user-defined schemas, or backups containing user-defined types, require `USAGE` privileges.

See the [Required privileges](#required-privileges) section for the updated privilege model.

## Destination privileges

{% include {{ page.version.version }}/backups/destination-privileges.md %}

{% include {{ page.version.version }}/misc/s3-compatible-warning.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/backup.html %}
</div>

## Parameters

CockroachDB stores full backups in a backup collection. Each full backup in a collection may also have incremental backups. For more detail on this, see [Backup collections]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#backup-collections).

 Parameter | Description
-----------+-------------
`targets` | Back up the listed [targets](#targets).
`subdirectory` <a name="subdirectory"></a> | The name of the specific backup (e.g., `2021/03/23-213101.37`) in the collection to which you want to add an [incremental backup]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#incremental-backups). To view available backup subdirectories, use [`SHOW BACKUPS IN collectionURI`]({% link {{ page.version.version }}/show-backup.md %}). If the backup `subdirectory` is not provided, incremental backups will be stored in the default `/incrementals` directory at the root of the collection URI. See the [Create incremental backups](#create-incremental-backups) example.<br><br>**Warning:** If you use an arbitrary `STRING` as the subdirectory, a new full backup will be created, but it will never be shown in `SHOW BACKUPS IN`. We do not recommend using arbitrary strings as subdirectory names.
`LATEST` | Append an incremental backup to the latest completed full backup's subdirectory.
<a name="collectionURI-param"></a> `collectionURI` | The URI where you want to store the backup. (Or, the default locality for a locality-aware backup.) The storage URI for each [backup collection]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#backup-collections) must be unique. You will encounter an error if you run multiple backup collections to the same storage URI.<br/><br/>For information about this URL structure, see [Backup File URLs](#backup-file-urls).
`localityURI`   | The URI containing the `COCKROACH_LOCALITY` parameter for a non-default locality that is part of a single locality-aware backup.
`timestamp` | Back up data as it existed as of [`timestamp`]({% link {{ page.version.version }}/as-of-system-time.md %}). The `timestamp` must be more recent than your data's garbage collection TTL (which is controlled by the [`gc.ttlseconds` replication zone variable]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds)).
`backup_options` | Control the backup behavior with a comma-separated list of [these options](#options).

### Targets

Target                             | Description
-----------------------------------+-------------------------------------------------------------------------
N/A                                | Back up the cluster. For an example of a full cluster backup, refer to [Back up a cluster](#back-up-a-cluster).
`DATABASE {database_name} [, ...]` | The names of the databases to back up. A database backup includes all tables and views in the database. Refer to [Back Up a Database](#back-up-a-database).
`TABLE {table_name} [, ...]`       | The names of the tables and [views]({% link {{ page.version.version }}/views.md %}) to back up. Refer to [Back Up a Table or View](#back-up-a-table-or-view).

### Query parameters

Query parameter | Value | Description
----------------+-------+------------
`ASSUME_ROLE` | [`STRING`]({% link {{ page.version.version }}/string.md %}) |{% include {{ page.version.version }}/misc/assume-role-description.md %} Refer to [Cloud Storage Authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}) for setup details.
`AUTH` | [`STRING`]({% link {{ page.version.version }}/string.md %}) | The authentication parameter can define either `specified` (default) or `implicit` authentication. To use `specified` authentication, pass your [Service Account](https://cloud.google.com/iam/docs/understanding-service-accounts) credentials with the URI. To use `implicit` authentication, configure these credentials via an environment variable. Refer to the [Cloud Storage Authentication page]({% link {{ page.version.version }}/cloud-storage-authentication.md %}) page for examples of each of these.
`AWS_ENDPOINT` | [`STRING`]({% link {{ page.version.version }}/string.md %}) | Specify a custom endpoint for Amazon S3 or S3-compatible services. Use to define a particular region or a Virtual Private Cloud (VPC) endpoint.
`AWS_SESSION_TOKEN` | [`STRING`]({% link {{ page.version.version }}/string.md %}) | (Optional) Use as part of temporary security credentials when accessing AWS S3. For more information, refer to Amazon's guide on [temporary credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp_use-resources.html).
`AWS_USE_PATH_STYLE` | [`STRING`]({% link {{ page.version.version }}/string.md %}) | Change the URL format to path style from the default AWS S3 virtual-hosted–style URLs when connecting to Amazon S3 or S3-compatible services.
`COCKROACH_LOCALITY` | Key-value pairs | Define a locality-aware backup with a list of URIs using `COCKROACH_LOCALITY`. The value is either `default` or a single locality key-value pair, such as `region=us-east`. At least one `COCKROACH_LOCALITY` must the `default` per locality-aware backup. Refer to [Take and Restore Locality-aware Backups]({% link {{ page.version.version }}/take-and-restore-locality-aware-backups.md %}) for more detail and examples.
`S3_STORAGE_CLASS` | [`STRING`]({% link {{ page.version.version }}/string.md %}) | Specify the Amazon S3 storage class for files created by the backup job. Refer to [Back up with an S3 storage class](#back-up-with-an-s3-storage-class) for the available classes and an example.

{% include {{ page.version.version }}/backups/cap-parameter-ext-connection.md %}

### Options

{% include {{ page.version.version }}/backups/backup-options.md %}

### Backup file URLs

CockroachDB uses the URL provided to construct a secure API call to the service you specify. The URL structure depends on the type of file storage you are using. For more information, see the following:

- [URL format]({% link {{ page.version.version }}/use-cloud-storage.md %}#url-format)
- [Example file URLs]({% link {{ page.version.version }}/use-cloud-storage.md %}#example-file-urls)
- [Authentication parameters]({% link {{ page.version.version }}/cloud-storage-authentication.md %})

{% include {{ page.version.version }}/misc/external-connection-note.md %}

{{site.data.alerts.callout_success}}
Backups support cloud object locking and [Amazon S3 storage classes](#back-up-with-an-s3-storage-class). For more detail, see [Additional cloud storage feature support]({% link {{ page.version.version }}/use-cloud-storage.md %}#additional-cloud-storage-feature-support).
{{site.data.alerts.end}}

## Functional details

### Object dependencies

{% include {{ page.version.version }}/backups/object-dependency.md %}

{{site.data.alerts.callout_info}}
To exclude a table's row data from a backup, use the `exclude_data_from_backup` parameter with [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %}#create-a-table-with-data-excluded-from-backup) or [`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %}#exclude-a-tables-data-from-backups).

For more detail, see the [Exclude a table's data from backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#exclude-a-tables-data-from-backups) example.
{{site.data.alerts.end}}

### Users and privileges

The `system.users` table stores your users and their passwords. To restore your users and privilege [grants]({% link {{ page.version.version }}/grant.md %}), do a cluster backup and restore the cluster to a fresh cluster with no user data. You can also backup the `system.users` table, and then use [this procedure]({% link {{ page.version.version }}/restore.md %}#restoring-users-from-system-users-backup).

## Performance

The backup job process minimizes its impact to the cluster's performance with:

- Even distribution of work to a node that has a replica of the range to back up. If a locality filter is specified, work is distributed to a node from those that match the locality filter and has the most locality tiers in common with a node that has a replica. Refer to the [Backup Architecture]({% link {{ page.version.version }}/backup-architecture.md %}) page for a detailed explanation of how a backup job works.
- Integration with elastic CPU limiter by default, which helps to minimize the impact backups have on foreground traffic. This integration will limit the amount of CPU time used by a backup thereby allowing foreground SQL traffic to continue largely unaffected.

A backup job, like any read, cannot export a range if the range contains an [unresolved intent]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#resolving-write-intents). While it is important to minimize the impact of bulk, background jobs like `BACKUP` on your foreground traffic, it is still crucial for backups to finish (in order to maintain your [recovery point objective (RPO)](https://en.wikipedia.org/wiki/Disaster_recovery#Recovery_Point_Objective)).

Unlike a normal [read transaction]({% link {{ page.version.version }}/architecture/reads-and-writes-overview.md %}#read-scenario) that will block until any uncommitted writes it encounters are resolved, a backup job's read request will be allotted a fixed amount of CPU time to read the required keys and values. Once the backup's read request has exhausted this time, the backup will resume once it has been allocated more CPU time. This process allows for other requests, such as foreground SQL traffic to continue, almost unaffected, because there is a cap on how much CPU a backup job will take.

You can monitor your cluster's [admission control system]({% link {{ page.version.version }}/admission-control.md %}) on the [Overload dashboard]({% link {{ page.version.version }}/ui-overload-dashboard.md %}). To monitor your backup jobs, refer to the [Backup and Restore Monitoring]({% link {{ page.version.version }}/backup-and-restore-monitoring.md %}) page.

For a more technical explanation of elastic CPU, refer to the [Rubbing control theory on the Go scheduler](https://www.cockroachlabs.com/blog/rubbing-control-theory/) blog post.

We recommend always starting backups with a specific [timestamp]({% link {{ page.version.version }}/timestamp.md %}) at least 10 seconds in the past. For example:

~~~ sql
BACKUP...AS OF SYSTEM TIME '-10s';
~~~

This improves performance by decreasing the likelihood that the `BACKUP` will be [retried because it contends with other statements/transactions]({% link {{ page.version.version }}/transactions.md %}#transaction-retries). However, because [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) returns historical data, your reads might be stale. Taking backups with `AS OF SYSTEM TIME '-10s'` is a good best practice to reduce the number of still-running transactions you may encounter, because a backup will eventually push the contending transactions to a higher timestamp, which causes the transactions to retry.

A backup job will initially ask individual ranges to back up but to skip if they encounter an intent. Any range that is skipped is placed at the end of the queue. When a backup job has completed its initial pass and is revisiting ranges, it will ask any range that did not resolve within the given time limit (default 1 minute) to attempt to resolve any intents that it encounters and to **not** skip. Additionally, the backup's read transaction priority is eventually set to `high`. This will result in contending transactions being pushed and retried at a higher timestamp.

{% include {{ page.version.version }}/backups/retry-failure.md %}

### Backup performance configuration

Cluster settings provide a means to tune a CockroachDB cluster. The following cluster settings are helpful for configuring backup files and performance:

#### `bulkio.backup.file_size`

Set a target for the amount of backup data written to each backup file. This is the maximum target size the backup will reach, but it is possible files of a smaller size are created during the backup job.

Note that if you lower `bulkio.backup.file_size` below the default, it will cause the backup job to create many small SST files, which could impact a restore job’s performance because it will need to keep track of so many small files.

**Default:** `128 MiB`

#### `cloudstorage.azure.concurrent_upload_buffers`

Improve the speed of backups to Azure Storage by increasing `cloudstorage.azure.concurrent_upload_buffers` to `3`. This setting configures the number of concurrent buffers that are used during file uploads to Azure Storage. Note that the higher this setting the more data that is held in memory, which can increase the risk of OOMs if there is not sufficient memory on each node.

**Default:** `1`

#### Cluster settings for cloud storage

The following cluster settings limit the read and write rates to [cloud storage]({% link {{ page.version.version }}/use-cloud-storage.md %}). A user may choose to use these settings if their backups overwhelm the network. These settings limit throughput and as a result backups and [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) will take longer. The designated `<provider>`s include `s3`, `gs`, and `azure`.

##### `cloudstorage.<provider>.write.node_rate_limit`

Limit the number of bytes per second per node across operations writing to the designated cloud storage provider if non-zero.

**Default:** unlimited, `0 B`

##### `cloudstorage.<provider>.write.node_burst_limit`

Limit the number of bytes per second per node handled concurrently across operations writing to the designated cloud storage provider if non-zero.

**Default:** unlimited, `0 B`

##### `cloudstorage.<provider>.read.node_rate_limit`

Limit the number of bytes per second per node across operations reading to the designated cloud storage provider if non-zero.

**Default:** unlimited, `0 B`

##### `cloudstorage.<provider>.read.node_burst_limit`

Limit the number of bytes per second per node handled concurrently across operations reading to the designated cloud storage provider if non-zero.

**Default:** unlimited, `0 B`

For a complete list, including all cluster settings related to backups, see the [Cluster Settings]({% link {{ page.version.version }}/cluster-settings.md %}) page.

## Viewing and controlling backups jobs

After CockroachDB successfully initiates a backup, it registers the backup as a job, and you can do the following:

 Action                | SQL Statement
-----------------------+-----------------
View the backup status | [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %})
Pause the backup       | [`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %})
Resume the backup      | [`RESUME JOB`]({% link {{ page.version.version }}/resume-job.md %})
Cancel the backup      | [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %})

You can also visit the [**Jobs** page]({% link {{ page.version.version }}/ui-jobs-page.md %}) of the DB Console to view job details. The `BACKUP` statement will return when the backup is finished or if it encounters an error.

{{site.data.alerts.callout_info}}
The presence of the `BACKUP MANIFEST` file in the backup subdirectory is an indicator that the backup job completed successfully.
{{site.data.alerts.end}}

## Examples

Per our guidance in the [Performance](#performance) section, we recommend starting backups from a time at least 10 seconds in the past using [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}).

{% include {{ page.version.version }}/backups/bulk-auth-options.md %}

If you need to limit the control specific users have over your storage buckets, see [Assume role authentication]({% link {{ page.version.version }}/cloud-storage-authentication.md %}) for setup instructions.

{% include {{ page.version.version }}/backups/old-syntax-removed.md %}

### Back up a cluster

To take a [full backup]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups) of a cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO 'external://backup_s3' AS OF SYSTEM TIME '-10s';
~~~

{% include {{ page.version.version }}/backups/backup-storage-collision.md %}

### Back up a database

To take a [full backup]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups) of a single database:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP DATABASE bank INTO 'external://backup_s3' AS OF SYSTEM TIME '-10s';
~~~

To take a [full backup]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups) of multiple databases:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP DATABASE bank, employees INTO 'external://backup_s3' AS OF SYSTEM TIME '-10s';
~~~

### Back up a table or view

To take a [full backup]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups) of a single table or view:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP bank.customers INTO 'external://backup_s3' AS OF SYSTEM TIME '-10s';
~~~

To take a [full backup]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups) of multiple tables:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP bank.customers, bank.accounts INTO 'external://backup_s3' AS OF SYSTEM TIME '-10s';
~~~

### Back up all tables in a schema

 To back up all tables in a [schema]({% link {{ page.version.version }}/create-schema.md %}), use a wildcard (`*`) with the schema name:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP test_schema.* INTO 'external://backup_s3' AS OF SYSTEM TIME '-10s';
~~~

Alternatively, use a [fully qualified name]({% link {{ page.version.version }}/sql-name-resolution.md %}#lookup-with-fully-qualified-names): `database.schema.*`.

With this syntax, schemas will be resolved before databases. `test_object.*` will resolve to a _schema_ of `test_object` within the set current database before matching to a database of `test_object`.

If a database and schema have the same name, such as `bank.bank`, running `BACKUP bank.*` will result in the schema resolving first. All the tables within that schema will be backed up. However, if this were to be run from a different database that does not have a `bank` schema, all tables in the `bank` database will be backed up.

See [Name Resolution]({% link {{ page.version.version }}/sql-name-resolution.md %}) for more details on how naming hierarchy and name resolution work in CockroachDB.

### Create incremental backups

{% include common/sql/incremental-location-warning.md %}

When a `BACKUP` statement specifies an existing subdirectory in the collection, explicitly or via the `LATEST` keyword, an incremental backup will be added to the default `/incrementals` directory at the root of the [collection]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#backup-collections) storage location.

To take an incremental backup using the `LATEST` keyword:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO LATEST IN 'external://backup_s3' AS OF SYSTEM TIME '-10s';
~~~

To store the backup in an existing subdirectory in the collection:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO {'subdirectory'} IN 'external://backup_s3' AS OF SYSTEM TIME '-10s';
~~~

{{site.data.alerts.callout_info}}
If you intend to take a **full** backup, we recommend running `BACKUP INTO {collectionURI}` without specifying a subdirectory.
{{site.data.alerts.end}}

To explicitly control where you store your incremental backups, use the [`incremental_location`]({% link {{ page.version.version }}/backup.md %}#options) option. For more detail, see [this example]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#incremental-backups-with-explicitly-specified-destinations) demonstrating the `incremental_location` option.

### Run a backup asynchronously

Use the `DETACHED` [option](#options) to execute the backup [job]({% link {{ page.version.version }}/show-jobs.md %}) asynchronously:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO 'external://backup_s3' AS OF SYSTEM TIME '-10s' WITH DETACHED;
~~~

The job ID is returned after the backup [job creation]({% link {{ page.version.version }}/backup-architecture.md %}#job-creation-phase) completes:

~~~
        job_id
----------------------
  592786066399264769
(1 row)
~~~

**Without** the `DETACHED` option, `BACKUP` will block the SQL connection until the job completes. Once finished, the job status and more detailed job data is returned:

~~~
job_id             |  status   | fraction_completed | rows | index_entries | bytes
-------------------+-----------+--------------------+------+---------------+--------
652471804772712449 | succeeded |                  1 |   50 |             0 |  4911
(1 row)
~~~

### Back up with an S3 storage class

To associate your backup objects with a [specific storage class]({% link {{ page.version.version }}/use-cloud-storage.md %}#amazon-s3-storage-classes) in your Amazon S3 bucket, use the `S3_STORAGE_CLASS` parameter with the class. For example, the following S3 connection URI specifies the `INTELLIGENT_TIERING` storage class:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP DATABASE movr INTO 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}&S3_STORAGE_CLASS=INTELLIGENT_TIERING' AS OF SYSTEM TIME '-10s';
~~~

To use an external connection URI to back up to cloud storage with an associated S3 storage class, you need to include the `S3_STORAGE_CLASS` parameter when you [create the external connection]({% link {{ page.version.version }}/create-external-connection.md %}).

{% include {{ page.version.version }}/misc/storage-classes.md %}

{% include {{ page.version.version }}/misc/storage-class-glacier-incremental.md %}

### Advanced examples

{% include {{ page.version.version }}/backups/advanced-examples-list.md %}

## See also

- [Take Full and Incremental Backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
- [Take and Restore Encrypted Backups]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %})
- [Take and Restore Locality-aware Backups]({% link {{ page.version.version }}/take-and-restore-locality-aware-backups.md %})
- [Take Backups with Revision History and Restore from a Point-in-time]({% link {{ page.version.version }}/take-backups-with-revision-history-and-restore-from-a-point-in-time.md %})
- [`SHOW BACKUP`]({% link {{ page.version.version }}/show-backup.md %})
- [`CREATE SCHEDULE FOR BACKUP`]({% link {{ page.version.version }}/create-schedule-for-backup.md %})
- [`RESTORE`]({% link {{ page.version.version }}/restore.md %})
- [Replication Controls]({% link {{ page.version.version }}/configure-replication-zones.md %})
- [Troubleshoot Replication Zones]({% link {{ page.version.version}}/troubleshoot-replication-zones.md %})
