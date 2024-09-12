---
title: Take and Restore Customer-Owned Backups on CockroachDB Cloud
summary: Run backups and restores from your CockroachDB Cloud cluster.
toc: true
docs_area: manage
---

This page describes how to take and restore [_customer-owned backups_]({% link cockroachcloud/backup-and-restore-overview.md %}) from CockroachDB {{ site.data.products.serverless }} and CockroachDB {{ site.data.products.dedicated }} clusters.

The [examples](#examples) on this page provide a quick overview of the backup features you can run to your own storage bucket. For more technical detail on the complete list of backup features, refer to:

- [Full backup]({% link {{site.current_cloud_version}}/take-full-and-incremental-backups.md %}#full-backups)
- [Incremental backup]({% link {{site.current_cloud_version}}/take-full-and-incremental-backups.md %}#incremental-backups)
- [Scheduled backup]({% link {{site.current_cloud_version}}/manage-a-backup-schedule.md %})
- [Backups with revision history]({% link {{site.current_cloud_version}}/take-backups-with-revision-history-and-restore-from-a-point-in-time.md %})
- [Point-in-time restore]({% link {{site.current_cloud_version}}/take-backups-with-revision-history-and-restore-from-a-point-in-time.md %})
- [Encrypted backup and restore]({% link {{site.current_cloud_version}}/take-and-restore-encrypted-backups.md %})
- [Locality-aware backup and restore]({% link {{site.current_cloud_version}}/take-and-restore-locality-aware-backups.md %})
- [Locality-restricted backup execution]({% link {{site.current_cloud_version}}/take-locality-restricted-backups.md %})

## Examples

Before you begin, connect to your cluster. For guidance on connecting to your CockroachDB {{ site.data.products.cloud }} cluster, visit [Connect to a CockroachDB {{ site.data.products.serverless }} Cluster]({% link cockroachcloud/connect-to-a-serverless-cluster.md %}) or [Connect to Your CockroachDB {{ site.data.products.dedicated }} Cluster]({% link cockroachcloud/connect-to-your-cluster.md %}).

The examples on this page demonstrate how to back up and restore from your own storage bucket.

### Full backup

To take a [full backup]({% link {{site.current_cloud_version}}/take-full-and-incremental-backups.md %}#full-backups) of a cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO 'external://backup_s3' AS OF SYSTEM TIME '-10s';
~~~

To take a [full backup]({% link {{site.current_cloud_version}}/take-full-and-incremental-backups.md %}#full-backups) of a single database:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP DATABASE bank INTO 'external://backup_s3' AS OF SYSTEM TIME '-10s';
~~~

To take a [full backup]({% link {{site.current_cloud_version}}/take-full-and-incremental-backups.md %}#full-backups) of a single table or view:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP bank.customers INTO 'external://backup_s3' AS OF SYSTEM TIME '-10s';
~~~

### Backup subdirectories

`BACKUP ... INTO` adds a backup to a [backup collection]({% link {{site.current_cloud_version}}/take-full-and-incremental-backups.md %}#backup-collections) location. To view the backup paths in a given collection location (your storage bucket), use [`SHOW BACKUPS`]({% link {{site.current_cloud_version}}/show-backup.md %}):

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

When you want to restore a specific backup, add the backup's subdirectory path (e.g., `/2023/12/21-142943.73`) to the `RESTORE` statement.

### Restore

To restore from the most recent backup ([full or incremental]({% link {{site.current_cloud_version}}/take-full-and-incremental-backups.md %})) in the collection's location, use the `LATEST` syntax:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM LATEST IN 's3://bucket/path?AUTH=implicit';
~~~

If you are restoring an incremental backup, the storage location **must** contain a full backup.

{{site.data.alerts.callout_danger}}
You cannot restore a backup of a multi-region database into a single-region database.
{{site.data.alerts.end}}

To restore a specific full or incremental backup, specify that backup's subdirectory in the `RESTORE` statement. To view the available subdirectories, use [`SHOW BACKUPS`]({% link {{site.current_cloud_version}}/show-backup.md %}). If you are restoring an incremental backup, the URI must point to the storage location that contains the full backup:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM '2023/03/23-213101.37' IN 's3://bucket/path?AUTH=implicit';
~~~

### Incremental backup

When a `BACKUP` statement specifies an existing subdirectory in the collection, explicitly or via the `LATEST` keyword, an incremental backup will be added to the default `/incrementals` directory at the root of the [collection]({% link {{site.current_cloud_version}}/take-full-and-incremental-backups.md %}#backup-collections) storage location.

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

To explicitly control where you store your incremental backups, use the [`incremental_location`]({% link {{site.current_cloud_version}}/backup.md %}#options) option. For more detail, see [this example]({% link {{site.current_cloud_version}}/take-full-and-incremental-backups.md %}#incremental-backups-with-explicitly-specified-destinations) demonstrating the `incremental_location` option.

### Scheduled backup

This example [creates a schedule]({% link {{site.current_cloud_version}}/create-schedule-for-backup.md %}) for a cluster backup with revision history that is taken every day at midnight:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE SCHEDULE schedule_label
  FOR BACKUP INTO 's3://test/backups/schedule_test?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x'
    WITH revision_history
    RECURRING '@daily';
~~~

~~~
     schedule_id     |     name       |                     status                     |            first_run             | schedule |                                                                               backup_stmt
---------------------+----------------+------------------------------------------------+----------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------------------
  588796190000218113 | schedule_label | PAUSED: Waiting for initial backup to complete | NULL                             | @daily   | BACKUP INTO LATEST IN 's3://test/schedule-test?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x' WITH revision_history, detached
  588796190012702721 | schedule_label | ACTIVE                                         | 2020-09-10 16:52:17.280821+00:00 | @weekly  | BACKUP INTO 's3://test/schedule-test?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x' WITH revision_history, detached
(2 rows)
~~~

Because the `FULL BACKUP` clause is not included, CockroachDB also scheduled a full backup to run `@weekly`. This is the default cadence for incremental backups `RECURRING` > 1 hour but <= 1 day.

### Encrypted backup

You can take and restore encrypted backups in the following ways:

- [Using AWS Key Management Service (KMS)]({% link {{site.current_cloud_version}}/take-and-restore-encrypted-backups.md %}#aws-kms-uri-format)
- [Using Google Cloud Key Management Service (KMS)]({% link {{site.current_cloud_version}}/take-and-restore-encrypted-backups.md %}#google-cloud-kms-uri-format)
- [Using Azure Key Vault]({% link {{site.current_cloud_version}}/take-and-restore-encrypted-backups.md %}#azure-key-vault-uri-format)
- [Using a passphrase]({% link {{site.current_cloud_version}}/take-and-restore-encrypted-backups.md %}#use-a-passphrase)

Refer to the [Take and Restore Encrypted Backups]({% link {{site.current_cloud_version}}/take-and-restore-encrypted-backups.md %}) page for technical detail and a full list of examples.

For example, you can run a backup with AWS KMS with the `BACKUP` statement's `kms` option:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO 's3://{BUCKET NAME}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
    WITH kms = 'aws:///{key}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}&REGION=us-east-1';
~~~

### Locality-aware backup

{{site.data.alerts.callout_info}}
{% include {{ site.current_cloud_version }}/backups/serverless-locality-aware.md %}
{{site.data.alerts.end}}

For example, to create a [locality-aware backup]({% link {{site.current_cloud_version}}/take-and-restore-locality-aware-backups.md %}) where nodes with the locality `region=us-west` write backup files to `s3://us-west-bucket`, and all other nodes write to `s3://us-east-bucket` by default, run:

{% include_cached copy-clipboard.html %}
~~~ sql
BACKUP INTO
	  ('s3://us-east-bucket?COCKROACH_LOCALITY=default', 's3://us-west-bucket?COCKROACH_LOCALITY=region%3Dus-west');
~~~

When you run the `BACKUP` statement for a locality-aware backup, check the following:

- The locality query string parameters must be [URL-encoded](https://wikipedia.org/wiki/Percent-encoding).
- If you are creating an [external connection]({% link {{site.current_cloud_version}}/create-external-connection.md %}) with [`BACKUP` query parameters]({% link {{site.current_cloud_version}}/backup.md %}#query-parameters), you must pass them in uppercase otherwise you will receive an `unknown query parameters` error.
- A successful locality-aware backup job requires that each node in the cluster has access to each storage location. This is because any node in the cluster can claim the job and become the [_coordinator_]({% link {{site.current_cloud_version}}/backup-architecture.md %}#job-creation-phase) node.

You can restore the backup by running:

{% include_cached copy-clipboard.html %}
~~~ sql
RESTORE FROM LATEST IN ('s3://us-east-bucket', 's3://us-west-bucket');
~~~

Note that the first URI in the list has to be the URI specified as the `default` URI when the backup was created. If you have moved your backups to a different location since the backup was originally taken, the first URI must be the new location of the files originally written to the `default` location.

To restore from a specific backup, use [`RESTORE FROM {subdirectory} IN ...`]({% link {{site.current_cloud_version}}/restore.md %}#restore-a-specific-full-or-incremental-backup)

### Backup and restore data from `userfile` storage

To put files on your CockroachDB cluster without external servers, use [`userfile`]({% link {{site.current_cloud_version}}/use-userfile-storage.md %}), a per-user file storage.

For information on `userfile` commands, visit the following pages:

- [`cockroach userfile upload`]({% link {{site.current_cloud_version}}/cockroach-userfile-upload.md %})
- [`cockroach userfile list`]({% link {{site.current_cloud_version}}/cockroach-userfile-list.md %})
- [`cockroach userfile get`]({% link {{site.current_cloud_version}}/cockroach-userfile-get.md %})
- [`cockroach userfile delete`]({% link {{site.current_cloud_version}}/cockroach-userfile-delete.md %})

{% include cockroachcloud/userfile-examples/backup-userfile.md %}

{{site.data.alerts.callout_info}}
Only database and table-level backups are possible when using `userfile` as storage. Restoring cluster-level backups will not work because `userfile` data is stored in the `defaultdb` database, and you cannot restore a cluster with existing table data.
{{site.data.alerts.end}}

In cases when you need to restore a specific backup, add the backup subdirectory to the `RESTORE` statement:

{% include_cached copy-clipboard.html %}
~~~sql
RESTORE DATABASE bank FROM '2021/03/24-210532.53' IN 'userfile://defaultdb.public.userfiles_$user/bank-backup';
~~~

It is also possible to run `userfile:///bank-backup` as `userfile:///` refers to the default path `userfile://defaultdb.public.userfiles_$user/`.

To restore from the most recent backup, use [`RESTORE FROM LATEST IN ...`]({% link {{site.current_cloud_version}}/restore.md %}#restore-the-most-recent-full-or-incremental-backup):

{% include_cached copy-clipboard.html %}
~~~sql
RESTORE FROM LATEST IN 'userfile://defaultdb.public.userfiles_$user/bank-backup';
~~~

Once the backup data is no longer needed, delete from the `userfile` storage:

{% include_cached copy-clipboard.html %}
~~~shell
cockroach userfile delete bank-backup --url {CONNECTION STRING}
~~~

If you use `cockroach userfile delete {file}`, it will take as long as the [garbage collection]({% link {{site.current_cloud_version}}/configure-replication-zones.md %}#gc-ttlseconds) to be removed from disk.

To resolve database or table naming conflicts during a restore, see [Troubleshooting naming conflicts]({% link cockroachcloud/use-managed-service-backups.md %}#troubleshooting).

## See also

- [Use Userfile Storage]({% link {{site.current_cloud_version}}/use-userfile-storage.md %})
- [Scheduled Backups]({% link {{site.current_cloud_version}}/manage-a-backup-schedule.md %})
- [Take Full and Incremental Backups]({% link {{site.current_cloud_version}}/take-full-and-incremental-backups.md %})
- [Use Cloud Storage]({% link {{site.current_cloud_version}}/use-cloud-storage.md %})
