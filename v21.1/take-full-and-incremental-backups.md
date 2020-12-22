---
title: Take Full and Incremental Backups
summary: Learn how to back up and restore a CockroachDB cluster.
toc: true
redirect_from:
- back-up-data.html
- restore-data.html
- backup-and-restore.html
- backup-and-restore-advanced-options.html
---

Because CockroachDB is designed with high fault tolerance, backups are primarily needed for [disaster recovery](disaster-recovery.html) (i.e., if your cluster loses a majority of its nodes). Isolated issues (such as small-scale node outages) do not require any intervention. However, as an operational best practice, **we recommend taking regular backups of your data**.

There are two main types of backups:

- [Full backups](#full-backups)
- [Incremental backups](#incremental-backups)

## Perform backup and restore

You can use the [`BACKUP`][backup] statement to efficiently back up your cluster's schemas and data to popular cloud services such as AWS S3, Google Cloud Storage, or NFS, and the [`RESTORE`][restore] statement to efficiently restore schema and data as necessary.

{{site.data.alerts.callout_success}}
 You can create [schedules for periodic backups](manage-a-backup-schedule.html) in CockroachDB. We recommend using scheduled backups to automate daily backups of your cluster.
{{site.data.alerts.end}}

### Full backups

 Full backups are now available to both core and enterprise users.

In most cases, **it's recommended to take full nightly backups of your cluster**. A cluster backup allows you to do the following:

- Restore table(s) from the cluster
- Restore database(s) from the cluster
- Restore a full cluster

To do a cluster backup, use the [`BACKUP`](backup.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP TO '<backup_location>';
~~~

If it's ever necessary, you can use the [`RESTORE`][restore] statement to restore a table:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE TABLE bank.customers FROM '<backup_location>';
~~~

Or to restore a  database:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE DATABASE bank FROM '<backup_location>';
~~~

Or to restore your full cluster:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE FROM '<backup_location>';
~~~

{{site.data.alerts.callout_info}}
A full cluster restore can only be run on a target cluster that has _never_ had user-created databases or tables.
{{site.data.alerts.end}}

### Incremental backups

If your cluster grows too large for nightly full backups, you can take less frequent full backups (e.g., weekly) with nightly incremental backups. Incremental backups are storage efficient and faster than full backups for larger clusters.

{{site.data.alerts.callout_info}}
To take incremental backups, you need an [enterprise license](enterprise-licensing.html).
{{site.data.alerts.end}}

Periodically run the [`BACKUP`][backup] command to take a full backup of your cluster:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP TO '<backup_location>';
~~~

Then, create nightly incremental backups based off of the full backups you've already created. If you backup to a destination already containing a full backup, an incremental backup will be appended to the full backup in a subdirectory:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP TO '<backup_location>';
~~~

{{site.data.alerts.callout_info}}
For an example on how to specify the destination of an incremental backup, see [Take Full and Incremental Backups](take-full-and-incremental-backups.html#incremental-backups-with-explicitly-specified-destinations)
{{site.data.alerts.end}}

If it's ever necessary, you can then use the [`RESTORE`][restore] command to restore your cluster, database(s), and/or table(s). [Restoring from incremental backups](restore.html#restore-from-incremental-backups) requires previous full and incremental backups. To restore from a destination containing the full backup, as well as the automatically appended incremental backups (that are stored as subdirectories, like in the example above):

{% include copy-clipboard.html %}
~~~ sql
> RESTORE FROM '<backup_location>';
~~~

### Incremental backups with explicitly specified destinations

To explicitly control where your incremental backups go, use the [`INCREMENTAL FROM`](backup.html#synopsis) syntax:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank \
TO 'gs://acme-co-backup/db/bank/2017-03-29-nightly' \
AS OF SYSTEM TIME '-10s' \
INCREMENTAL FROM 'gs://acme-co-backup/database-bank-2017-03-27-weekly', 'gs://acme-co-backup/database-bank-2017-03-28-nightly' WITH revision_history;
~~~

{{site.data.alerts.callout_info}}
To take incremental backups, you need an [enterprise license](enterprise-licensing.html).
{{site.data.alerts.end}}

### Examples

#### Automated full backups

Both core and enterprise users can use backup scheduling for full backups of clusters, databases, or tables. To create schedules that only take full backups, included the `FULL BACKUP ALWAYS` clause. For example, to create a schedule for taking full cluster backups:

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEDULE core_schedule_label
  FOR BACKUP INTO 's3://test/schedule-test-core?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x'
    RECURRING '@daily'
    FULL BACKUP ALWAYS
    WITH SCHEDULE OPTIONS first_run = 'now';
~~~
~~~
     schedule_id     |        name         | status |         first_run         | schedule |                                                                                       backup_stmt
---------------------+---------------------+--------+---------------------------+----------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  588799238330220545 | core_schedule_label | ACTIVE | 2020-09-11 00:00:00+00:00 | @daily   | BACKUP INTO 's3://test/schedule-test-core?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x' WITH detached
(1 row)
~~~

For more examples on how to schedule backups that take full and incremental backups, see [`CREATE SCHEDULE FOR BACKUP`](create-schedule-for-backup.html).

#### Advanced examples

{% include {{ page.version.version }}/backups/advanced-examples-list.md %}

{{site.data.alerts.callout_info}}
To take incremental backups, backups with revision history, locality-aware backups, and encrypted backups, you need an [enterprise license](enterprise-licensing.html).
{{site.data.alerts.end}}

## See also

- [`BACKUP`][backup]
- [`RESTORE`][restore]
- [Take and Restore Encrypted Backups](take-and-restore-encrypted-backups.html)
- [Take and Restore Locality-aware Backups](take-and-restore-locality-aware-backups.html)
- [Take Backups with Revision History and Restore from a Point-in-time](take-backups-with-revision-history-and-restore-from-a-point-in-time.html)
- [`SQL DUMP`](cockroach-dump.html)
- [`IMPORT`](import-data.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [Other Cockroach Commands](cockroach-commands.html)

<!-- Reference links -->

[backup]:  backup.html
[restore]: restore.html
