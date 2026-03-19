---
title: Take Backups with Revision History and Restore from a Point-in-time
summary: Learn about the advanced options you can use when you backup and restore a CockroachDB cluster.
toc: true
docs_area: manage
---

This page provides information about how to take backups with revision history and restore from a point-in-time.

You can create full or incremental backups [with revision history]({% link {{ page.version.version }}/backup.md %}#with-revision-history):

- Taking full backups with revision history allows you to back up every change made within the garbage collection period leading up to and including the given timestamp.
- Taking incremental backups with revision history allows you to back up every change made since the last backup and within the garbage collection period leading up to and including the given timestamp. You can take incremental backups with revision history even when your previous full or incremental backups were taken without revision history.

You can configure garbage collection periods using the `ttlseconds` [replication zone setting]({% link {{ page.version.version }}/configure-replication-zones.md %}). Taking backups with revision history allows for point-in-time restores within the revision history. 

{% include {{ page.version.version }}/backups/pts-schedules-incremental.md %}

{% include {{ page.version.version }}/backups/support-products.md %}

## Create a backup with revision history

{% include_cached copy-clipboard.html %}
~~~ sql
> BACKUP INTO '{collectionURI}' AS OF SYSTEM TIME '-10s' WITH revision_history;
~~~

For guidance on connecting to Amazon S3, Google Cloud Storage, Azure Storage, and other storage options, read [Use Cloud Storage]({% link {{ page.version.version }}/use-cloud-storage.md %}).

## Point-in-time restore

{{site.data.alerts.callout_danger}}
`RESTORE` will only restore the latest data in an object (table, database, cluster), or the latest data as per an `AS OF SYSTEM TIME` restore. A restore will not include historical data even if you ran your backup with `revision_history`. This means that if you issue an `AS OF SYSTEM TIME` query on a restored object, the query will fail or the response will be incorrect because there is no historical data to query.
{{site.data.alerts.end}}

If the full or incremental backup was taken [with revision history](#create-a-backup-with-revision-history), you can restore the data as it existed at an arbitrary point-in-time within the revision history captured by that backup. Use the [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) clause to specify the point-in-time.

Additionally, if you want to restore a specific incremental backup, you can do so by specifying the `end_time` of the backup by using the [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %}) clause. To find the incremental backup's `end_time`, use [`SHOW BACKUP`]({% link {{ page.version.version }}/show-backup.md %}).

If you do not specify a point-in-time, the data will be restored to the backup timestamp; that is, the restore will work as if the data was backed up without revision history.

{% include_cached copy-clipboard.html %}
~~~ sql
> RESTORE FROM '/2021/12/13-211056.62' IN '{collectionURI}' AS OF SYSTEM TIME '2021-12-13 10:00:00';
~~~

To view the available backup subdirectories you can restore from, use [`SHOW BACKUPS`]({% link {{ page.version.version }}/restore.md %}#view-the-backup-subdirectories).

## See also

- [`BACKUP`][backup]
- [`RESTORE`][restore]
- [Take Full and Incremental Backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
- [Take and Restore Encrypted Backups]({% link {{ page.version.version }}/take-and-restore-encrypted-backups.md %})
- [Take and Restore Locality-aware Backups]({% link {{ page.version.version }}/take-and-restore-locality-aware-backups.md %})
- [Use the Built-in SQL Client]({% link {{ page.version.version }}/cockroach-sql.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})

{% comment %} Reference links {% endcomment %}

[backup]:  {% link {{ page.version.version }}/backup.md %}
[restore]: restore.html
