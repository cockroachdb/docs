---
title: Take and Restore Customer-Owned Backups on CockroachDB Cloud
summary: Run backups and restores from your CockroachDB Cloud cluster.
toc: true
docs_area: manage
---

This page describes how to take and restore [customer-owned backups](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/backup-and-restore-overview#cockroachdb-backup-types) from **CockroachDB {{ site.data.products.serverless }}** and **CockroachDB {{ site.data.products.dedicated }}** clusters. 

The examples demonstrate how to back up and restore from cloud storage and `userfile` storage. We recommend using cloud storage for your backups.

{{site.data.alerts.callout_danger}}
You cannot restore a backup of a multi-region database into a single-region database.
{{site.data.alerts.end}}

## Examples

Before you begin, connect to your cluster. For guidance on connecting to your CockroachDB {{ site.data.products.cloud }} cluster, visit [Connect to a CockroachDB {{ site.data.products.serverless }} Cluster]({% link cockroachcloud/connect-to-a-serverless-cluster.md %}) or [Connect to Your CockroachDB {{ site.data.products.dedicated }} Cluster]({% link cockroachcloud/connect-to-your-cluster.md %}).

The examples on this page demonstrate how to take customer-owned backups.

### Back up data

<div class="filters clearfix">
  <button class="filter-button" data-scope="userfile"><code>userfile</code></button>
  <button class="filter-button" data-scope="cloud">Cloud storage</button>
</div>

<section class="filter-content" markdown="1" data-scope="userfile">

For information on `userfile` commands, visit the following pages:

- [`cockroach userfile upload`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-userfile-upload)
- [`cockroach userfile list`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-userfile-list)
- [`cockroach userfile get`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-userfile-get)
- [`cockroach userfile delete`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/cockroach-userfile-delete)

{% include cockroachcloud/userfile-examples/backup-userfile.md %}

</section>

<section class="filter-content" markdown="1" data-scope="cloud">

The cloud storage examples on this page use Amazon S3 for demonstration purposes. For guidance on connecting to other storage options or using other authentication parameters, read [Use Cloud Storage](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-cloud-storage).

{% include cockroachcloud/backup-examples.md %}

For more information on taking backups, read the following pages:

- [`BACKUP`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/backup)
- [Full and incremental backups](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-full-and-incremental-backups)
- [Scheduled backups](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/manage-a-backup-schedule)

</section>


### Restore data

<div class="filters clearfix">
  <button class="filter-button" data-scope="userfile"><code>userfile</code></button>
  <button class="filter-button" data-scope="cloud">Cloud storage</button>
</div>

<section class="filter-content" markdown="1" data-scope="userfile">

{{site.data.alerts.callout_info}}
Only database and table-level backups are possible when using `userfile` as storage. Restoring cluster-level backups will not work because `userfile` data is stored in the `defaultdb` database, and you cannot restore a cluster with existing table data.
{{site.data.alerts.end}}

In cases when you need to restore a specific backup, add the backup subdirectory to the `RESTORE` statement:

{% include_cached copy-clipboard.html %}
~~~sql
RESTORE DATABASE bank FROM '2021/03/24-210532.53' IN 'userfile://defaultdb.public.userfiles_$user/bank-backup';
~~~

It is also possible to run `userfile:///bank-backup` as `userfile:///` refers to the default path `userfile://defaultdb.public.userfiles_$user/`.

To restore from the most recent backup, use [`RESTORE FROM LATEST IN ...`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/restore#restore-the-most-recent-backup):

{% include_cached copy-clipboard.html %}
~~~sql
RESTORE FROM LATEST IN 'userfile://defaultdb.public.userfiles_$user/bank-backup';
~~~

Once the backup data is no longer needed, delete from the `userfile` storage:

{% include_cached copy-clipboard.html %}
~~~shell
cockroach userfile delete bank-backup --url {CONNECTION STRING}
~~~

If you use `cockroach userfile delete {file}`, it will take as long as the [garbage collection](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/configure-replication-zones#gc-ttlseconds) to be removed from disk.

To resolve database or table naming conflicts during a restore, see [Troubleshooting naming conflicts]({% link cockroachcloud/use-managed-service-backups.md %}#troubleshooting).

</section>

<section class="filter-content" markdown="1" data-scope="cloud">

The following examples show how to run manual restores:

{% include cockroachcloud/restore-examples.md %}

For more information on restoring to your cluster, read the [`RESTORE`](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/restore) page. 

</section>

## See also

- [Use Userfile Storage](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-userfile-storage)
- [Scheduled Backups](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/manage-a-backup-schedule)
- [Take Full and Incremental Backups](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/take-full-and-incremental-backups)
- [Use Cloud Storage](https://www.cockroachlabs.com/docs/{{site.current_cloud_version}}/use-cloud-storage)
