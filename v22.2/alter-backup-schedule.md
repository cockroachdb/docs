---
title: ALTER BACKUP SCHEDULE
summary: Use the ALTER BACKUP SCHEDULE statement to change an existing backup schedule.
toc: true
docs_area: reference.sql
---

{{site.data.alerts.callout_info}}
Core users can only use backup scheduling for [full backups](create-schedule-for-backup.html#create-a-schedule-for-full-backups-only-core) of clusters, databases, or tables. If you do not specify the `FULL BACKUP ALWAYS` clause when you schedule a backup, you will receive a warning that the schedule will only run full backups. 

To use the other backup features, you need an [Enterprise license](enterprise-licensing.html).
{{site.data.alerts.end}}

{% include_cached new-in.html version="v22.2" %} The `ALTER BACKUP SCHEDULE` statement modifies an existing [backup schedule](manage-a-backup-schedule.html). You can use `ALTER BACKUP SCHEDULE` to do the following:

- Set a different name for a backup schedule.
- Change a scheduled backup's storage location.
- Apply additional backup options or schedule options to backups and schedules.
- Adjust the cadence and type of scheduled backups.

## Required privileges

To alter a backup schedule, you must be the owner of the backup schedule, i.e., the user that [created the backup schedule](create-schedule-for-backup.html).

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/master/grammar_svg/alter_backup_schedule.html %}
</div>

## Parameters

Parameter | Description
----------+-------------
`schedule_id` | The schedule's ID that [`CREATE SCHEDULE FOR BACKUP`](create-schedule-for-backup.html) and [`SHOW SCHEDULES`](show-schedules.html) display.
`schedule_label` | The name or label given to the backup schedule.
`collectionURI` | The URI where you want to store the backup. See [Backup file URLs](backup.html#backup-file-urls) for detail on forming the URI.
`option` | Control the backup behavior with a comma-separated list of these [options](#backup-options).
`RECURRING crontab` | Specify when the backup should be taken. By default, these are incremental backups. A separate schedule may be created automatically to write full backups at a regular cadence, depending on the frequency of the incremental backups. You can likewise modify this separate schedule with `ALTER BACKUP SCHEDULE`. Define the schedule as a `STRING` in [crontab format](https://en.wikipedia.org/wiki/Cron). All times in UTC. <br><br>Example: `'@daily'` (run daily at midnight)
`FULL BACKUP crontab / ALWAYS` | Specify when to take a new full backup. Define the schedule as a `STRING` in [crontab format](https://en.wikipedia.org/wiki/Cron) or as `ALWAYS`. <br><br>`FULL BACKUP ALWAYS` will trigger `RECURRING` to always take full backups. <br>**Note:** If you do not have an Enterprise license then you can only take full backups. `ALWAYS` is the only accepted value of `FULL BACKUP`. <br><br>If you omit the `FULL BACKUP` clause, the default backup schedule will be as follows: <ul><li>If `RECURRING` <= 1 hour: Default to `FULL BACKUP '@daily'`</li><li>If `RECURRING` <= 1 day: Default to `FULL BACKUP '@weekly'`</li><li>Otherwise: Default to `FULL BACKUP ALWAYS`</li></ul>
`schedule_option` | Control the schedule behavior with a comma-separated list of these [schedule options](#schedule-options).

### Backup options

You can use the backup options in this table to control the behavior of your backups. See [Apply different options to scheduled backups](#apply-different-options-to-scheduled-backups) for an example.

{% include {{ page.version.version }}/backups/backup-options-for-schedules.md %}

### Schedule options

{{site.data.alerts.callout_danger}}
**The following schedule options are in preview.**  Their interface, options, and outputs are subject to change, and there may be bugs.

If you encounter a bug, [file an issue](file-an-issue.html).
{{site.data.alerts.end}}

You can use the schedule options in this table to control the behavior of your backup schedule. See [Apply different options to scheduled backups](#apply-different-options-to-scheduled-backups) for an example.

{% include {{ page.version.version }}/backups/schedule-options.md %}

## Examples

The examples in this section start with the following created backup schedule. Each section follows on from the previous example's schedule state.

First, create a schedule that will take daily full backups of the cluster: 

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE SCHEDULE aws_backups
  FOR BACKUP INTO 'external://s3_storage'
    RECURRING '@daily'
    FULL BACKUP ALWAYS
    WITH SCHEDULE OPTIONS first_run = 'now', ignore_existing_backups;
~~~

This statement specifies:

- `'external://s3_storage'`: Use the storage location represented by this [external connection](create-external-connection.html) URI.
- `first_run = 'now'`: Take the first full backup immediately rather than wait for its next `RECURRING` time.
- `ignore_existing_backups`: Ignore any existing backups already present in the storage location.

The command returns the following output. Note that the [`detached` option](#detached) is implicitly added, because this backup has been configured to run on a schedule:

~~~
     schedule_id     |   label     | status |           first_run           | schedule |                    backup_stmt
---------------------+-------------+--------+-------------------------------+----------+----------------------------------------------------
  814155335856521217 | aws_backups | ACTIVE | 2022-11-15 16:48:10.667767+00 | @daily   | BACKUP INTO 'external://s3_storage' WITH detached
(1 row)
~~~

### Change the storage location for scheduled backups

You can change the storage location to which your backup schedule is taking backups with the `SET INTO` command. Use the schedule ID to specify the schedule to modify and the new storage location URI. This statement also changes the schedule's label to match the change in backup location:  

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER BACKUP SCHEDULE 814155335856521217 SET INTO 'external://gcs_storage', SET LABEL gcs_backups;
~~~
~~~
     schedule_id     |    label    | status |       first_run        | schedule |                    backup_stmt
---------------------+-------------+--------+------------------------+----------+-----------------------------------------------------
  814155335856521217 | gcs_backups | ACTIVE | 2022-11-16 00:00:00+00 | @daily   | BACKUP INTO 'external://gcs_storage' WITH detached
(1 row)
~~~

{{site.data.alerts.callout_info}}
[Incremental backups](take-full-and-incremental-backups.html#incremental-backups) require a full backup in the storage location. Therefore, when you change the storage location for a backup schedule, CockroachDB will pause any scheduled incremental backups until the next full backup runs on its regular schedule cadence. Consider that if you change the storage location and then adjust the frequency of your scheduled backups before the next full backup, any newly added incremental backups will not be part of the pause after a storage location change. This could result in a reported error state for the incremental backups, which will not resolve until the next scheduled full backup.
{{site.data.alerts.end}}

### Adjust frequency of scheduled backups

To adjust the frequency of your scheduled backups, use `SET` with `FULL BACKUP` and `RECURRING` for full and incremental backups. You can either define the frequency as a `STRING` or in [crontab](https://en.wikipedia.org/wiki/Cron) format. See the [Parameters](#parameters) table for more detail.

The following command adds incremental backups to the schedule occurring hourly:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER BACKUP SCHEDULE 814155335856521217 SET FULL BACKUP '@daily', SET RECURRING '@hourly';
~~~

The output shows the two scheduled jobs:

~~~
     schedule_id     |    label    | status |       first_run        | schedule |                         backup_stmt
---------------------+-------------+--------+------------------------+----------+---------------------------------------------------------------
  814168045421199361 | gcs_backups | ACTIVE | 2022-11-15 18:00:00+00 | @hourly  | BACKUP INTO LATEST IN 'external://gcs_storage' WITH detached
  814155335856521217 | gcs_backups | ACTIVE | 2022-11-16 00:00:00+00 | @daily   | BACKUP INTO 'external://gcs_storage' WITH detached
(2 rows)
~~~

You can use the `SHOW SCHEDULE` statement with one of the schedule IDs to show details for each of the jobs. For the full backup job:

~~~sql
SHOW SCHEDULE 814155335856521217;
~~~

This shows that the full backup has a dependent schedule, which lists the incremental backup's schedule ID:

~~~
          id         |    label    | schedule_status |        next_run        | state | recurrence | jobsrunning | owner |            created            |                                                                                       command
---------------------+-------------+-----------------+------------------------+-------+------------+-------------+-------+-------------------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  814155335856521217 | gcs_backups | ACTIVE          | 2022-11-18 00:00:00+00 | NULL  | @daily     |           0 | root  | 2022-11-15 16:48:10.667783+00 | {"backup_statement": "BACKUP INTO 'external://gcs_storage' WITH detached, "dependent_schedule_id": 814168045421199361}
(1 row)
~~~

For the incremental backup:

~~~sql
SHOW SCHEDULE 814168045421199361;
~~~

The following includes the `backup_type` as `1`. This signifies that this schedule is for an incremental backup: 

~~~
          id         |    label    | schedule_status |        next_run        | state | recurrence | jobsrunning | owner |            created            |                                                                       command
---------------------+-------------+-----------------+------------------------+-------+------------+-------------+-------+-------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------
  814168045421199361 | gcs_backups | ACTIVE          | 2022-11-15 19:00:00+00 | NULL  | @hourly    |           0 | root  | 2022-11-15 17:52:49.327263+00 | {"backup_statement": "BACKUP INTO LATEST IN 'external://gcs_storage' WITH detached", "backup_type": 1, "dependent_schedule_id": 814155335856521217}
(1 row)
~~~

Full backups are implicitly of `backup_type` `0`, and so does not display in the schedule details.

### Apply different options to scheduled backups

You can modify the behavior of your backup schedule and the backup jobs with `SET SCHEDULE OPTION` and `SET WITH`. See the [Schedule options](#schedule-options) table and the [Backup options](#backup-options) table for a list of the available options. 

This statement changes the default `wait` value for the `on_previous_running` schedule option to `start`. If a previous backup started by the schedule is still running, the scheduled job will now start the new backup anyway, rather than waiting. The backup option [`incremental_location`](take-full-and-incremental-backups.html#incremental-backups-with-explicitly-specified-destinations) modifies the storage location for incremental backups:

~~~sql
ALTER BACKUP SCHEDULE 814168045421199361 SET SCHEDULE OPTION on_previous_running = 'start', SET WITH incremental_location = 'external://gcs_incremental_storage';
~~~

The incremental backup schedule's `BACKUP` statement shows that it will read files in the full backup location `'external://gcs_storage'` and ultimately store the incremental backup in `'external://gcs_incremental_storage'` on an hourly basis:

~~~
     schedule_id     |    label    | status |       first_run        | schedule |                                                        backup_stmt
---------------------+-------------+--------+------------------------+----------+----------------------------------------------------------------------------------------------------------------------------
  814168045421199361 | gcs_backups | ACTIVE | 2022-11-15 21:00:00+00 | @hourly  | BACKUP INTO LATEST IN 'external://gcs_storage' WITH detached, incremental_location = 'external://gcs_incremental_storage'
  814155335856521217 | gcs_backups | ACTIVE | 2022-11-16 00:00:00+00 | @daily   | BACKUP INTO 'external://gcs_storage' WITH detached, incremental_location = 'external://gcs_incremental_storage'
(2 rows)
~~~

## See also

- [`CREATE SCHEDULE FOR BACKUP`](create-schedule-for-backup.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [Manage a Backup Schedule](manage-a-backup-schedule.html)
- [`BACKUP`](backup.html)
- [Use Cloud Storage for Bulk Operations](use-cloud-storage-for-bulk-operations.html)
- [`CREATE EXTERNAL CONNECTION`](create-external-connection.html)