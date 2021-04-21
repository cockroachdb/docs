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

You can use the [`BACKUP`][backup] statement to efficiently back up your cluster's schemas and data to popular cloud services such as AWS S3, Google Cloud Storage, or NFS, and the [`RESTORE`][restore] statement to efficiently restore schema and data as necessary.

{{site.data.alerts.callout_success}}
 You can create [schedules for periodic backups](manage-a-backup-schedule.html) in CockroachDB. We recommend using scheduled backups to automate daily backups of your cluster.
{{site.data.alerts.end}}

## Full backups

Full backups are now available to both core and enterprise users.

Full backups contain an un-replicated copy of your data and can always be used to restore your cluster. These files are roughly the size of your data and require greater resources to produce than incremental backups. You can take full backups as of a given timestamp. Optionally, you can include the available [revision history](take-backups-with-revision-history-and-restore-from-a-point-in-time.html) in the backup.

In most cases, **it's recommended to take nightly full backups of your cluster**. A cluster backup allows you to do the following:

- Restore table(s) from the cluster
- Restore database(s) from the cluster
- Restore a full cluster

### Take a full backup

To do a cluster backup, use the [`BACKUP`](backup.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP INTO '{destination}';
~~~

If it's ever necessary, you can use the [`RESTORE`][restore] statement to restore a table:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE TABLE bank.customers FROM '{destination}';
~~~

Or to restore a  database:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE DATABASE bank FROM '{destination}';
~~~

Or to restore your full cluster:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE FROM '{destination}';
~~~

{{site.data.alerts.callout_info}}
A full cluster restore can only be run on a target cluster that has _never_ had user-created databases or tables.
{{site.data.alerts.end}}

## Incremental backups

{{site.data.alerts.callout_info}}
To take incremental backups, you need an [enterprise license](enterprise-licensing.html).
{{site.data.alerts.end}}

If your cluster grows too large for nightly [full backups](#full-backups), you can take less frequent full backups (e.g., weekly) with nightly incremental backups. Incremental backups are storage efficient and faster than full backups for larger clusters.

Incremental backups are smaller and faster to produce than full backups because they contain only the data that has changed since a base set of backups you specify (which must include one full backup, and can include many incremental backups). You can take incremental backups either as of a given timestamp or with full [revision history](take-backups-with-revision-history-and-restore-from-a-point-in-time.html).

{{site.data.alerts.callout_danger}}
Incremental backups can only be created within the garbage collection period of the base backup's most recent timestamp. This is because incremental backups are created by finding which data has been created or modified since the most recent timestamp in the base backup––that timestamp data, though, is deleted by the garbage collection process.

You can configure garbage collection periods using the `ttlseconds` [replication zone setting](configure-replication-zones.html#gc-ttlseconds).
{{site.data.alerts.end}}

### Take an incremental backup

Periodically run the [`BACKUP`][backup] command to take a full backup of your cluster:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP INTO '{destination}';
~~~

Then, create nightly incremental backups based off of the full backups you've already created. To append an incremental backup to the most recent full backup created in the given destination, use `LATEST`:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP INTO LATEST IN '{destination}';
~~~

{{site.data.alerts.callout_info}}
For an example on how to specify the destination of an incremental backup, see [Incremental backups with explicitly specified destinations](#incremental-backups-with-explicitly-specified-destinations)
{{site.data.alerts.end}}

If it's ever necessary, you can then use the [`RESTORE`][restore] command to restore your cluster, database(s), and/or table(s). Restoring from incremental backups requires previous full and incremental backups. To restore from a destination containing the full backup, as well as the appended incremental backups:

{% include copy-clipboard.html %}
~~~ sql
> RESTORE FROM '{subdirectory}' IN '{destination}';
~~~

## Incremental backups with explicitly specified destinations

To explicitly control where your incremental backups go, use the [`INCREMENTAL FROM`](backup.html#synopsis) syntax:

{% include copy-clipboard.html %}
~~~ sql
> BACKUP DATABASE bank INTO '{subdirectory}' IN '{destination}' \
    AS OF SYSTEM TIME '-10s' \
    WITH revision_history;
~~~

{{site.data.alerts.callout_info}}
To take incremental backups, you need an [enterprise license](enterprise-licensing.html).
{{site.data.alerts.end}}

## Examples

### Automated full backups

Both core and enterprise users can use backup scheduling for full backups of clusters, databases, or tables. To create schedules that only take full backups, include the `FULL BACKUP ALWAYS` clause. For example, to create a schedule for taking full cluster backups:

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

### Advanced examples

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
