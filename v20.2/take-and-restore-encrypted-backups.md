---
title: Take and Restore Encrypted Backups
summary: Learn about the advanced options you can use when you backup and restore a CockroachDB cluster.
toc: true
---

The ability to [backup a full cluster](backup.html#backup-a-cluster) has been added and the syntax for [incremental backups](backup.html#create-incremental-backups) is simplified. Because of these two changes, [basic backup usage](take-full-and-incremental-backups.html) is now sufficient for most CockroachDB clusters. However, you may want to control your backup and restore options more explicitly.

This doc provides information about how to take and restore encrypted backups.

{{site.data.alerts.callout_info}}
[`BACKUP`](backup.html) is an [enterprise-only](https://www.cockroachlabs.com/product/cockroachdb/) feature. For non-enterprise backups, see [`cockroach dump`](cockroach-dump.html).
{{site.data.alerts.end}}

{% include {{ page.version.version }}/backups/encrypted-backup-description.md %}

## Create an encrypted backup

To create an encrypted backup, use the `encryption_passphrase` option:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP TO \
'gs://acme-co-backup/test-cluster' \
WITH encryption_passphrase = 'password123';
~~~
~~~
        job_id       |  status   | fraction_completed | rows | index_entries | bytes
---------------------+-----------+--------------------+------+---------------+---------
  543214409874014209 | succeeded |                  1 | 2597 |          1028 | 467701
(1 row)
~~~

To [restore](restore.html), use the same `encryption_passphrase`:

## Restore from an encrypted backup

 To decrypt an [encrypted backup](#create-an-encrypted-backup), use the `encryption_passphrase` option and the same passphrase that was used to create the backup.

For example, the encrypted backup created in the [previous example](#create-an-encrypted-backup):

{% include copy-clipboard.html %}
~~~ sql
> BACKUP TO \
'gs://acme-co-backup/test-cluster' \
WITH encryption_passphrase = 'password123';
~~~

Can be restored with:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE FROM \
'gs://acme-co-backup/test-cluster' \
WITH encryption_passphrase = 'password123';
~~~
~~~
        job_id       |  status   | fraction_completed | rows | index_entries | bytes
---------------------+-----------+--------------------+------+---------------+---------
  543217488273801217 | succeeded |                  1 | 2597 |          1028 | 467701
(1 row)
~~~

## See also

- [`BACKUP`][backup]
- [`RESTORE`][restore]
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [Take and Restore Locality-aware Backups](take-and-restore-locality-aware-backups.html)
- [Take Backups with Revision History and Restore from a Point-in-time](take-backups-with-revision-history-and-restore-from-a-point-in-time.html)
- [`SQL DUMP`](cockroach-dump.html)
- [`IMPORT`](import-data.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [Other Cockroach Commands](cockroach-commands.html)

<!-- Reference links -->

[backup]:  backup.html
[restore]: restore.html
