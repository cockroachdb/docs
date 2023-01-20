---
title: Run Bulk Operations from Your Cluster
summary: Run backups, restores, and imports from your CockroachDB Cloud cluster.
toc: true
docs_area: manage
---

{{ site.data.products.serverless }} and {{ site.data.products.dedicated }} offer different levels of support for the following bulk operations. This page provides information on the availability of these operations in both types of {{ site.data.products.db }} cluster and examples.

- [`BACKUP`](../{{site.current_cloud_version}}/backup.html)
- [`RESTORE`](../{{site.current_cloud_version}}/restore.html)
- [`IMPORT`](../{{site.current_cloud_version}}/import.html)
- [`EXPORT`](../{{site.current_cloud_version}}/export.html)

{% include cockroachcloud/ccloud/backup-types.md %}

The examples on this page demonstrate how to take customer-owned backups.

For information on `userfile` commands, visit the following pages:

- [`cockroach userfile upload`](../{{site.current_cloud_version}}/cockroach-userfile-upload.html)
- [`cockroach userfile list`](../{{site.current_cloud_version}}/cockroach-userfile-list.html)
- [`cockroach userfile get`](../{{site.current_cloud_version}}/cockroach-userfile-get.html)
- [`cockroach userfile delete`](../{{site.current_cloud_version}}/cockroach-userfile-delete.html)

The cloud storage examples on this page use Amazon S3 for demonstration purposes. For guidance on connecting to other storage options or using other authentication parameters, read [Use Cloud Storage for Bulk Operations](../{{site.current_cloud_version}}/use-cloud-storage-for-bulk-operations.html).

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

Cockroach Labs runs the following managed-service backups:

- {{ site.data.products.dedicated }} clusters: [Full cluster backups](../{{site.current_cloud_version}}/take-full-and-incremental-backups.html#full-backups) daily and [incremental cluster backups](../{{site.current_cloud_version}}/take-full-and-incremental-backups.html#incremental-backups) hourly. The full backups are retained for 30 days, while incremental backups are retained for 7 days.
- {{ site.data.products.serverless }} clusters: [Full cluster backups](../{{site.current_cloud_version}}/take-full-and-incremental-backups.html#full-backups) every hour that are retained for 30 days.

For more information, read [Restore Data From a Backup](../cockroachcloud/backups-page.html).

The following examples show how to run manual backups and restores:

{% include cockroachcloud/backup-examples.md %}

{% include cockroachcloud/restore-examples.md %}

For more information on taking backups and restoring to your cluster, read the following pages:

- [`BACKUP`](../{{site.current_cloud_version}}/backup.html)
- [`RESTORE`](../{{site.current_cloud_version}}/restore.html)
- [Full and incremental backups](../{{site.current_cloud_version}}/take-full-and-incremental-backups.html)
- [Scheduled backups](../{{site.current_cloud_version}}/manage-a-backup-schedule.html)

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

Read the [`IMPORT`](../{{site.current_cloud_version}}/import.html) page for more examples and guidance.

</section>

### Export data out of {{ site.data.products.db }}

Using `EXPORT` with `userfile` is not recommended. If you want to export data to a local CSV file, you can use [`cockroach sql --execute`](../{{site.current_cloud_version}}/cockroach-sql.html#general). For example:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--url 'postgres://{username}:{password}@{host}:26257?sslmode=verify-full&sslrootcert={path/to/certs_dir}/cc-ca.crt' \
--execute "SELECT * FROM db.table" --format=csv > /Users/{username}/{path/to/file}/table.csv
~~~

The following example exports the `customers` table from the `bank` database into a cloud storage bucket in CSV format:

~~~sql
EXPORT INTO CSV
  's3://{BUCKET NAME}/{customer-export-data}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
  WITH delimiter = '|' FROM TABLE bank.customers;
~~~

Read the [`EXPORT`](../{{site.current_cloud_version}}/export.html) page for more examples and guidance.

## See also

- [Use Userfile for Bulk Operations](../{{site.current_cloud_version}}/use-userfile-for-bulk-operations.html)
- [Scheduled Backups](../{{site.current_cloud_version}}/manage-a-backup-schedule.html)
- [Take Full and Incremental Backups](../{{site.current_cloud_version}}/take-full-and-incremental-backups.html)
- [Use Bulk Operations for Cloud Storage](../{{site.current_cloud_version}}/use-cloud-storage-for-bulk-operations.html)
