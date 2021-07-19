---
title: Run Bulk Operations from Your Cluster
summary: Run backups, restores, and imports from your CockroachCloud cluster.
toc: true
---

Your CockroachCloud cluster can perform the following bulk operations:

- [`BACKUP`](../{{site.versions["stable"]}}/backup.html)
- [`RESTORE`](../{{site.versions["stable"]}}/restore.html)
- [`IMPORT`](../{{site.versions["stable"]}}/import.html) / [`IMPORT INTO`](../{{site.versions["stable"]}}/import-into.html)
- [`EXPORT`](../{{site.versions["stable"]}}/export.html) <!--including?-->
- [`CREATE CHANGEFEED`](../{{site.versions["stable"]}}/create-changefeed.html) (Core and enterprise)

The CockroachCloud tiers offer different support for these bulk operations. This page provides information on the availability of these operations in each CockroachCloud cluster tier and examples. For more detailed information on performing these operations, read the individual pages.

<!--TODO Add sentence here on the backups that CockroachCloud cluster have automatically -->

## Examples

<div class="filters clearfix">
  <button class="filter-button" data-scope="cc-free">CockroachCloud Free (beta) </button>
  <button class="filter-button" data-scope="cc-ded">CockroachCloud</button>
</div>

<section class="filter-content" markdown="1" data-scope="cc-free">

{{site.data.alerts.callout_info}}
`userfile` is only available as storage for `BACKUP`, `RESTORE`, and `IMPORT` operations on CockroachCloud Free Tier after upgrading to v21.1.
{{site.data.alerts.end}}

In CockroachCloud Free clusters, `BACKUP`, `RESTORE`, and `IMPORT INTO` can be used with [`userfile`](../{{site.versions["stable"]}}/use-userfile-storage-for-bulk-operations.html) storage, a per-user bulk file storage.

For information on `userfile` commands, visit the following pages:

- [`cockroach userfile upload`](../{{site.versions["stable"]}}/cockroach-userfile-upload.html)
- [`cockroach userfile list`](../{{site.versions["stable"]}}/cockroach-userfile-list.html)
- [`cockroach userfile get`](../{{site.versions["stable"]}}/cockroach-userfile-get.html)
- [`cockroach userfile delete`](../{{site.versions["stable"]}}/cockroach-userfile-delete.html)

### Backup and restore with `userfile`

{% include v21.1/userfile-examples/backup-userfile.md %}

### Import data into your CockroachCloud cluster

{% include v21.1/userfile-examples/import-into-userfile.md %}

<!--TODO Add note or other on EXPORT process when on Free tier? -->

### Stream data out of CockroachCloud

Core changefeeds stream row-level changes to a client until the underlying SQL connection is closed.

To create a core changefeed in CockroachCloud Free, use the following example.

{{site.data.alerts.callout_info}}
Only core changefeeds are available on CockroachCloud Free. An [enterprise license](../{{site.versions["stable"]}}/enterprise-licensing.html) is required to create a changefeed into a configurable cloud storage sink, Kafka, etc.
{{site.data.alerts.end}}

For further general information on changefeeds, read [Stream Data Out of CockroachDB](../{{site.versions["stable"]}}/stream-data-out-of-cockroachdb.html)

{% include cockroachcloud/cdc/create-core-changefeed.md %}

</section>

<section class="filter-content" markdown="1" data-scope="cc-ded">

The examples below use Amazon S3 for demonstrations purposes. For guidance on connecting to other storage options or using other authentication parameters, read [Use Cloud Storage for Bulk Operations](../{{site.versions["stable"]}}/use-cloud-storage-for-bulk-operations.html#example-file-urls).

### Backup and restore your CockroachCloud data

Cockroach Labs runs [full backups](../{{site.versions["stable"]}}/take-full-and-incremental-backups.html#full-backups) daily and [incremental backups](../{{site.versions["stable"]}}/take-full-and-incremental-backups.html#incremental-backups) hourly for every CockroachCloud cluster. The full backups are retained for 30 days, while incremental backups are retained for 7 days.

{% include v21.1/backups/bulk-auth-options.md %}

{% include cockroachcloud/backup-examples.md %}

{% include cockroachcloud/restore-examples.md %}

For more information on taking backups and restoring to your cluster, read the following pages:

- [`BACKUP`](../{{site.versions["stable"]}}/backup.html)
- [`RESTORE`](../{{site.versions["stable"]}}/restore.html)
- [Full and incremental backups](../{{site.versions["stable"]}}/take-full-and-incremental-backups.html)
- [Scheduled backups](../{{site.versions["stable"]}}/manage-a-backup-schedule.html)

### Import data into your CockroachCloud cluster

To import a table, first create the table that you would like to import into:

{% include copy-clipboard.html %}
~~~sql
CREATE TABLE customers (
  id INT,
  dob DATE,
  first_name STRING,
  last_name STRING,
  joined DATE
);
~~~

Then, use `IMPORT INTO` to import data into the table:

{% include copy-clipboard.html %}
~~~sql
IMPORT INTO customers (id, dob, first_name, last_name, joined)
   CSV DATA ('s3://{BUCKET NAME}/{PATH}?AWS_ACCESS_KEY_ID={KEY ID}&AWS_SECRET_ACCESS_KEY={SECRET ACCESS KEY}');
~~~

~~~
        job_id       |  status   | fraction_completed |  rows  | index_entries |  bytes
---------------------+-----------+--------------------+--------+---------------+-----------
  599865027685613569 | succeeded |                  1 | 300024 |             0 | 13389972
(1 row)
~~~

For more import options and examples, see [`IMPORT INTO`](../{{site.versions["stable"]}}/import-into.html), [`IMPORT`](../{{site.versions["stable"]}}/import.html), and [Import Performance Best Practices](import-performance-best-practices.html).

{{site.data.alerts.callout_info}}
As of v21.2 `IMPORT TABLE` will be deprecated. We recommend using `IMPORT INTO` followed by `CREATE TABLE` like this example.
{{site.data.alerts.end}}

### Stream data out of CockroachCloud

{% include cockroachcloud/cdc/cdc-bulk-examples.md %}

</section>
