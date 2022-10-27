---
title: Run Bulk Operations from Your Cluster
summary: Run backups, restores, and imports from your CockroachDB Cloud cluster.
toc: true
docs_area: manage
---

{% include cockroachcloud/ccloud/backup-types.md %}

{{ site.data.products.serverless }} and {{ site.data.products.dedicated }} offer different levels of support for the following bulk operations. This page provides information on the availability of these operations in both types of {{ site.data.products.db }} cluster and examples.

- [`BACKUP`](../{{site.versions["stable"]}}/backup.html)
- [`RESTORE`](../{{site.versions["stable"]}}/restore.html)
- [`IMPORT`](../{{site.versions["stable"]}}/import.html)
- [`EXPORT`](../{{site.versions["stable"]}}/export.html)


{{site.data.alerts.callout_info}}
For {{ site.data.products.serverless }} clusters, you must have [billing information](billing-management.html) on file for your organization to have access to [cloud storage](../{{site.versions["stable"]}}/use-cloud-storage-for-bulk-operations.html). If you don't have billing set up, [`userfile`](../{{site.versions["stable"]}}/use-userfile-for-bulk-operations.html) is your **only available storage option** for bulk operations. {{ site.data.products.dedicated }} users can run bulk operations with `userfile` or cloud storage.
{{site.data.alerts.end}}

For information on `userfile` commands, visit the following pages:

- [`cockroach userfile upload`](../{{site.versions["stable"]}}/cockroach-userfile-upload.html)
- [`cockroach userfile list`](../{{site.versions["stable"]}}/cockroach-userfile-list.html)
- [`cockroach userfile get`](../{{site.versions["stable"]}}/cockroach-userfile-get.html)
- [`cockroach userfile delete`](../{{site.versions["stable"]}}/cockroach-userfile-delete.html)

The cloud storage examples on this page use Amazon S3 for demonstration purposes. For guidance on connecting to other storage options or using other authentication parameters, read [Use Cloud Storage for Bulk Operations](../{{site.versions["stable"]}}/use-cloud-storage-for-bulk-operations.html).

{{site.data.alerts.callout_danger}}
You cannot restore a backup of a multi-region database into a single-region database.
{{site.data.alerts.end}}

## Examples

Before you begin, connect to your cluster. For guidance on connecting to your {{ site.data.products.db }} cluster, visit [Connect to a {{ site.data.products.serverless }} Cluster](connect-to-a-serverless-cluster.html) or [Connect to Your {{ site.data.products.dedicated }} Cluster](connect-to-your-cluster.html).

### Backup and restore data

<div class="filters clearfix">
  <button class="filter-button" data-scope="userfile"><code>userfile</code></button>
  <button class="filter-button" data-scope="cloud">Cloud storage</button>
</div>

<section class="filter-content" markdown="1" data-scope="userfile">

{% include cockroachcloud/userfile-examples/backup-userfile.md %}

</section>

<section class="filter-content" markdown="1" data-scope="cloud">

Cockroach Labs runs [full backups](../{{site.versions["stable"]}}/take-full-and-incremental-backups.html#full-backups) daily and [incremental backups](../{{site.versions["stable"]}}/take-full-and-incremental-backups.html#incremental-backups) hourly for every {{ site.data.products.db }} cluster. The full backups are retained for 30 days, while incremental backups are retained for 7 days. For more information, read [Restore Data From a Backup](../cockroachcloud/backups-page.html).

The following examples show how to run manual backups and restores:

{% include cockroachcloud/backup-examples.md %}

{% include cockroachcloud/restore-examples.md %}

For more information on taking backups and restoring to your cluster, read the following pages:

- [`BACKUP`](../{{site.versions["stable"]}}/backup.html)
- [`RESTORE`](../{{site.versions["stable"]}}/restore.html)
- [Full and incremental backups](../{{site.versions["stable"]}}/take-full-and-incremental-backups.html)
- [Scheduled backups](../{{site.versions["stable"]}}/manage-a-backup-schedule.html)

</section>

### Import data into your {{ site.data.products.db }} cluster

<div class="filters clearfix">
  <button class="filter-button" data-scope="userfile"><code>userfile</code></button>
  <button class="filter-button" data-scope="cloud">Cloud storage</button>
</div>

<section class="filter-content" markdown="1" data-scope="userfile">

{% include cockroachcloud/userfile-examples/import-into-userfile.md %}

</section>

<section class="filter-content" markdown="1" data-scope="cloud">

To import a table into your cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> IMPORT TABLE customers (
		id UUID PRIMARY KEY,
		name TEXT,
		INDEX name_idx (name)
)
CSV DATA ('s3://{BUCKET NAME}/{customer-data}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}')
;
~~~

Read the [`IMPORT`](../{{site.versions["stable"]}}/import.html) page for more examples and guidance.

</section>

### Export data out of {{ site.data.products.db }}

{{site.data.alerts.callout_info}}
Using `EXPORT` with `userfile` is not recommended. If you need to export data from a Serverless cluster, you can either [set up billing for your organization](billing-management.html) to access cloud storage or [export data to a local CSV file](migrate-from-serverless-to-dedicated.html#step-1-export-data-to-a-local-csv-file).
{{site.data.alerts.end}}

The following example exports the `customers` table from the `bank` database into a cloud storage bucket in CSV format:

~~~sql
EXPORT INTO CSV
  's3://{BUCKET NAME}/{customer-export-data}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
  WITH delimiter = '|' FROM TABLE bank.customers;
~~~

Read the [`EXPORT`](../{{site.versions["stable"]}}/export.html) page for more examples and guidance.

## See also

- [Use Userfile for Bulk Operations](../{{site.versions["stable"]}}/use-userfile-for-bulk-operations.html)
- [Scheduled Backups](../{{site.versions["stable"]}}/manage-a-backup-schedule.html)
- [Take Full and Incremental Backups](../{{site.versions["stable"]}}/take-full-and-incremental-backups.html)
- [Use Bulk Operations for Cloud Storage](../{{site.versions["stable"]}}/use-cloud-storage-for-bulk-operations.html)
