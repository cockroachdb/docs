---
title: Run Bulk Operations from Your Cluster
summary: Run backups, restores, and imports from your CockroachCloud cluster.
toc: true
---

The CockroachCloud tiers offer different levels of support for the following bulk operations. This page provides information on the availability of these operations in each CockroachCloud cluster tier and examples.

- [`BACKUP`](../{{site.versions["stable"]}}/backup.html)
- [`RESTORE`](../{{site.versions["stable"]}}/restore.html)
- [`IMPORT`](../{{site.versions["stable"]}}/import.html)
- [`EXPORT`](../{{site.versions["stable"]}}/export.html)
- [`CREATE CHANGEFEED`](../{{site.versions["stable"]}}/create-changefeed.html)

The examples below include details on the storage options available with each of the CockroachCloud tiers.

## Examples

<div class="filters clearfix">
  <button class="filter-button" data-scope="ccfree">{{ site.data.products.serverless }} </button>
  <button class="filter-button" data-scope="ccded">{{ site.data.products.dedicated }}</button>
</div>

<section class="filter-content" markdown="1" data-scope="ccfree">

For guidance on connecting to your {{ site.data.products.serverless }} cluster, visit [Connect to a {{ site.data.products.serverless }} Cluster](connect-to-a-free-cluster.html).

In {{ site.data.products.serverless }} clusters, [`userfile`](../{{site.versions["stable"]}}/use-userfile-for-bulk-operations.html), a per-user bulk file storage, is the **only available storage option** for `BACKUP`, `RESTORE`, and `IMPORT` operations.

{{site.data.alerts.callout_info}}
`userfile` is only available as storage for `BACKUP`, `RESTORE`, and `IMPORT` operations on {{ site.data.products.serverless }} [**after upgrading to v21.1.**](upgrade-to-v21.1.html)
{{site.data.alerts.end}}

For information on `userfile` commands, visit the following pages:

- [`cockroach userfile upload`](../{{site.versions["stable"]}}/cockroach-userfile-upload.html)
- [`cockroach userfile list`](../{{site.versions["stable"]}}/cockroach-userfile-list.html)
- [`cockroach userfile get`](../{{site.versions["stable"]}}/cockroach-userfile-get.html)
- [`cockroach userfile delete`](../{{site.versions["stable"]}}/cockroach-userfile-delete.html)

### Backup and restore with `userfile`

{% include cockroachcloud/userfile-examples/backup-userfile.md %}

### Import data into your {{ site.data.products.serverless }} cluster

{% include cockroachcloud/userfile-examples/import-into-userfile.md %}

### Stream data out of your {{ site.data.products.serverless }} cluster

Core changefeeds stream row-level changes to a client until the underlying SQL connection is closed.

{{site.data.alerts.callout_info}}
Only core changefeeds are available on {{ site.data.products.serverless }}. To create a changefeed into a configurable sink, like cloud storage or Kafka, use {{ site.data.products.dedicated }}, which has this feature enabled by default.
{{site.data.alerts.end}}

To create a core changefeed in {{ site.data.products.serverless }}, use the following example.

{% include cockroachcloud/cdc/create-core-changefeed.md %}

For further information on changefeeds, read [Stream Data Out of CockroachDB](../{{site.versions["stable"]}}/stream-data-out-of-cockroachdb-using-changefeeds.html) and [`CHANGEFEED FOR`](../{{site.versions["stable"]}}/changefeed-for.html).

## See also

- [Use Userfile for Bulk Operations](../{{site.versions["stable"]}}/use-userfile-for-bulk-operations.html)
- [Scheduled Backups](../{{site.versions["stable"]}}/manage-a-backup-schedule.html)
- [Take Full and Incremental Backups](../{{site.versions["stable"]}}/take-full-and-incremental-backups.html)

</section>

<section class="filter-content" markdown="1" data-scope="ccded">

For guidance on connecting to your {{ site.data.products.dedicated }} cluster, visit [Connect to Your {{ site.data.products.dedicated }} Cluster](connect-to-your-cluster.html).

The examples below use Amazon S3 for demonstration purposes. For guidance on connecting to other storage options or using other authentication parameters, read [Use Cloud Storage for Bulk Operations](../{{site.versions["stable"]}}/use-cloud-storage-for-bulk-operations.html).

### Backup and restore your CockroachCloud data

Cockroach Labs runs [full backups](../{{site.versions["stable"]}}/take-full-and-incremental-backups.html#full-backups) daily and [incremental backups](../{{site.versions["stable"]}}/take-full-and-incremental-backups.html#incremental-backups) hourly for every CockroachCloud cluster. The full backups are retained for 30 days, while incremental backups are retained for 7 days. For more information, read [Restore Data From a Backup](../cockroachcloud/backups-page.html).

The following examples show how to run manual backups and restores:

{% include cockroachcloud/backup-examples.md %}

{% include cockroachcloud/restore-examples.md %}

For more information on taking backups and restoring to your cluster, read the following pages:

- [`BACKUP`](../{{site.versions["stable"]}}/backup.html)
- [`RESTORE`](../{{site.versions["stable"]}}/restore.html)
- [Full and incremental backups](../{{site.versions["stable"]}}/take-full-and-incremental-backups.html)
- [Scheduled backups](../{{site.versions["stable"]}}/manage-a-backup-schedule.html)

### Import data into your {{ site.data.products.dedicated }} cluster

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

### Export data out of {{ site.data.products.dedicated }}

The following example exports the `customers` table from the `bank` database into a cloud storage bucket in CSV format:

~~~sql
EXPORT INTO CSV
  's3://{BUCKET NAME}/{customer-export-data}?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}'
  WITH delimiter = '|' FROM TABLE bank.customers;
~~~

Read the [`EXPORT`](../{{site.versions["stable"]}}/export.html) page for more examples and guidance.

### Stream data out of CockroachCloud

{% include cockroachcloud/cdc/cdc-bulk-examples.md %}

## See also

- [Scheduled Backups](../{{site.versions["stable"]}}/manage-a-backup-schedule.html)
- [Take Full and Incremental Backups](../{{site.versions["stable"]}}/take-full-and-incremental-backups.html)
- [Use Bulk Operations for Cloud Storage](../{{site.versions["stable"]}}/use-cloud-storage-for-bulk-operations.html)

</section>
