---
title: Take and Restore Customer-Owned Backups 
summary: Run backups and restores from your CockroachDB Cloud cluster.
toc: true
docs_area: manage
---

{% include cockroachcloud/ccloud/backup-types.md %}

This page describes how to take and restore customer-owned backups from {{ site.data.products.serverless }} and {{ site.data.products.dedicated }} clusters. 

The examples demonstrate how to back up and restore from cloud storage and userfile storage. We recommend using cloud storage for your backups, however, if you don't have [billing information](billing-management.html) on file, [userfile](../{{site.current_cloud_version}}/use-userfile-for-bulk-operations.html) is your **only available storage option** for backup operations. 

{{site.data.alerts.callout_danger}}
You cannot restore a backup of a multi-region database into a single-region database.
{{site.data.alerts.end}}

## Examples

Before you begin, connect to your cluster. For guidance on connecting to your {{ site.data.products.db }} cluster, visit [Connect to a {{ site.data.products.serverless }} Cluster](connect-to-a-serverless-cluster.html) or [Connect to Your {{ site.data.products.dedicated }} Cluster](connect-to-your-cluster.html).

The examples on this page demonstrate how to take customer-owned backups.

### Back up data

<div class="filters clearfix">
  <button class="filter-button" data-scope="userfile"><code>userfile</code></button>
  <button class="filter-button" data-scope="cloud">Cloud storage</button>
</div>

<section class="filter-content" markdown="1" data-scope="userfile">

For information on `userfile` commands, visit the following pages:

- [`cockroach userfile upload`](../{{site.current_cloud_version}}/cockroach-userfile-upload.html)
- [`cockroach userfile list`](../{{site.current_cloud_version}}/cockroach-userfile-list.html)
- [`cockroach userfile get`](../{{site.current_cloud_version}}/cockroach-userfile-get.html)
- [`cockroach userfile delete`](../{{site.current_cloud_version}}/cockroach-userfile-delete.html)

{% include cockroachcloud/userfile-examples/backup-userfile.md %}

</section>

<section class="filter-content" markdown="1" data-scope="cloud">

{{site.data.alerts.callout_info}}
For {{ site.data.products.serverless }} clusters, you must have [billing information](billing-management.html) on file for your organization to have access to [cloud storage](../{{site.current_cloud_version}}/use-cloud-storage-for-bulk-operations.html). If you don't have billing set up, [`userfile`](../{{site.current_cloud_version}}/use-userfile-for-bulk-operations.html) is your **only available storage option** for bulk operations. {{ site.data.products.dedicated }} users can run bulk operations with `userfile` or cloud storage.
{{site.data.alerts.end}}

The cloud storage examples on this page use Amazon S3 for demonstration purposes. For guidance on connecting to other storage options or using other authentication parameters, read [Use Cloud Storage for Bulk Operations](../{{site.current_cloud_version}}/use-cloud-storage-for-bulk-operations.html).

{% include cockroachcloud/backup-examples.md %}

For more information on taking backups, read the following pages:

- [`BACKUP`](../{{site.current_cloud_version}}/backup.html)
- [Full and incremental backups](../{{site.current_cloud_version}}/take-full-and-incremental-backups.html)
- [Scheduled backups](../{{site.current_cloud_version}}/manage-a-backup-schedule.html)

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

To restore from the most recent backup, use [`RESTORE FROM LATEST IN ...`](../{{site.current_cloud_version}}/restore.html#restore-the-most-recent-backup):

{% include_cached copy-clipboard.html %}
~~~sql
RESTORE FROM LATEST IN 'userfile://defaultdb.public.userfiles_$user/bank-backup';
~~~

Once the backup data is no longer needed, delete from the `userfile` storage:

{% include_cached copy-clipboard.html %}
~~~shell
cockroach userfile delete bank-backup --url {CONNECTION STRING}
~~~

If you use `cockroach userfile delete {file}`, it will take as long as the [garbage collection](../{{site.current_cloud_version}}/configure-replication-zones.html#gc-ttlseconds) to be removed from disk.

To resolve database or table naming conflicts during a restore, see [Troubleshooting naming conflicts](use-managed-service-backups.html#troubleshooting).

</section>

<section class="filter-content" markdown="1" data-scope="cloud">

The following examples show how to run manual restores:

{% include cockroachcloud/restore-examples.md %}

For more information on restoring to your cluster, read the [`RESTORE`](../{{site.current_cloud_version}}/restore.html) page. 

</section>


## See also

- [Use Userfile for Bulk Operations](../{{site.current_cloud_version}}/use-userfile-for-bulk-operations.html)
- [Scheduled Backups](../{{site.current_cloud_version}}/manage-a-backup-schedule.html)
- [Take Full and Incremental Backups](../{{site.current_cloud_version}}/take-full-and-incremental-backups.html)
- [Use Bulk Operations for Cloud Storage](../{{site.current_cloud_version}}/use-cloud-storage-for-bulk-operations.html)
