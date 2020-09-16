---
title: CREATE SCHEDULE FOR BACKUP
summary: The CREATE SCHEDULE FOR BACKUP statement creates a schedule for periodic backups.
toc: true
---

<span class="version-tag">New in v20.2:</span> The `CREATE SCHEDULE FOR BACKUP` [statement](sql-statements.html) creates a schedule for periodic [backups](backup.html).

For more information about creating, managing, monitoring, and restoring from a scheduled backup, see [Manage a Backup Schedule](manage-a-backup-schedule.html).

## Required privileges

Only members of the `admin` role can run `CREATE SCHEDULE FOR BACKUP`. By default, the `root` user belongs to the `admin` role.

## Synopsis

~~~
CREATE SCHEDULE <label>
FOR BACKUP [<targets>] INTO <location>
[WITH <backup_options>[=<value>] [, ...]]
RECURRING [crontab] [FULL BACKUP <crontab|ALWAYS>]
[WITH SCHEDULE OPTIONS <schedule_option>[= <value>] [, ...] ]

Targets:
   Empty targets list: backup full cluster.
   TABLE <table_pattern> [, ...]
   DATABASE <database_name> [, ...]
~~~

## Parameters

 Parameter                              | Description
----------------------------------------+-------------------------------------------------------------------------------------------------------------------------
`label`                                 | The name used to identify the backup schedule. This is optional and does not need to be unique. If not provided, the schedule will be assigned the name `BACKUP`.
`table_pattern`                         | The [table(s)](create-table.html) or [view(s)](views.html) you want to back up.
`database_name`                         | The name of the [database(s)](create-database.html) you want to back up (i.e., create backups of all tables and views in the database).
`location`                              | The URI where you want to store the backup. The backup files will be stored in to be year > month > day subdirectories. The location can be [cloud storage](use-cloud-storage-for-bulk-operations.html), nodelocal, or userfile.
`backup_options`                        | Control the backup behavior with a comma-separated list of [options](#backup-options).
`RECURRING crontab`                     | Specifies when the backup should be taken. By default, these are incremental backups that capture changes since the last backup and append to the current full backup. The schedule is specified as a [`STRING`](string.html) in [crontab format](https://en.wikipedia.org/wiki/Cron). All times in UTC. <br><br>Example: `'@daily'` (run daily at midnight)
<a name="full-backup-clause"></a>`FULL BACKUP crontab` | Specifies when to take a new full backup. The schedule is specified as a [`STRING`](string.html) in [crontab format](https://en.wikipedia.org/wiki/Cron) or as `ALWAYS`. <br><br>If `FULL BACKUP ALWAYS` is specified, then the backups triggered by the `RECURRING` clause will always be full backups. For free users, `ALWAYS` is the only accepted value of `FULL BACKUP`.<br><br>If the `FULL BACKUP` clause is omitted, CockroachDB will default to the following full backup schedule: <ul><li>`RECURRING` <= 1 hour: Default to `FULL BACKUP '@daily'`</li><li>`RECURRING` <= 1 day: Default to `FULL BACKUP '@weekly'`</li><li>Otherwise: Default to `FULL BACKUP ALWAYS`</li></ul>
`WITH SCHEDULE OPTIONS schedule_option` | _Experimental feature._ Control the schedule behavior with a comma-separated list of [these options](#schedule-options).

{{site.data.alerts.callout_info}}
For schedules that include both [full and incremental backups](take-full-and-incremental-backups.html), CockroachDB will create two schedules (one for each type).
{{site.data.alerts.end}}

### Backup options

{% include {{ page.version.version }}/backups/backup-options.md %}

### Schedule options

{{site.data.alerts.callout_danger}}
**This is an experimental feature.**  Its interface, options, and outputs are subject to change, and there may be bugs.

If you encounter a bug, please [file an issue](file-an-issue.html).
{{site.data.alerts.end}}

 Option                     | Value                             | Description
----------------------------+-----------------------------------+------------------------------
`first_run`                 | [`TIMESTAMPTZ`](timestamp.html)   | Execute the schedule at the specified time in the future. If not specified, the default is to execute the scheduled based on it's next `RECURRING` time.
`on_execution_failure`      | `retry` / `reschedule` / `pause`  | If an error occurs during the backup execution, do the following: <ul><li>`retry`: Retry the backup right away.</li><li>`reschedule`: Retry the backup by rescheduling it based on the `RECURRING` expression.</li><li>`pause`: Pause the schedule. This requires manual intervention to [resume the schedule](resume-schedules.html).</li></ul><br>Default: `reschedule`
`on_previous_running`       | `start` / `skip` / `wait`         | If the previous backup started by the schedule is still running, do the following: <ul><li>`start`: Start the new backup anyway, even if the previous one still running.</li><li>`skip`: Skip the new backup and run the next backup based on the `RECURRING` expresssion.</li><li>`wait`: Wait for the previous backup to complete.</li></ul><br>Default: `wait`
`ignore_existing_backups`   | N/A                               | If backups were already created in the [destination](use-cloud-storage-for-bulk-operations.html) in which a new schedule references, this option must be passed to acknowledge that the new schedule may be backing up different objects.

## Considerations

- We recommend that you schedule your backups at a cadence that your cluster can keep up with; that is, if a previous backup is still running when it is time to start the next one, the schedule should be adjusted so the backups do not end up falling behind.
- Ensure you are monitoring your backup schedule (e.g., [Prometheus](monitor-cockroachdb-with-prometheus.html)) and alerting metrics that will confirm that your backups are completing, but also that they're not running more concurrently than you expect.
- Ensure that your [GC window](configure-replication-zones.html#gc-ttlseconds) is long enough to accommodate your backup schedule, otherwise your incremental backups will fail. For example, if you set up your schedule to be `RECURRING '@daily'` but your GC window is less than 1 day, all your incremental backups will fail.

## View and control backup schedules

Once a backup schedule is successfully created, you can do the following:

 Action                | SQL Statement
-----------------------+-----------------
View the schedule      | [`SHOW SCHEDULES`](show-schedules.html)
Pause the schedule     | [`PAUSE SCHEDULES`](pause-schedules.html)
Resume the schedule    | [`RESUME SCHEDULES`](resume-schedules.html)
Drop the schedule      | [`DROP SCHEDULES`](drop-schedules.html)

## View and control a backup initiated by a schedule

After CockroachDB successfully initiates a scheduled backup, it registers the backup as a job. You can do the following with each individual backup job:

 Action                | SQL Statement
-----------------------+-----------------
View the backup status | [`SHOW JOBS`](show-jobs.html)
Pause the backup       | [`PAUSE JOB`](pause-job.html)
Resume the backup      | [`RESUME JOB`](resume-job.html)
Cancel the backup      | [`CANCEL JOB`](cancel-job.html)

You can also visit the [**Jobs** page](admin-ui-jobs-page.html) of the Admin UI to view job details. The `BACKUP` statement will return when the backup is finished or if it encounters an error.

## Examples

### Create a schedule for full backups only (core)

Core users can only use backup scheduling for full backups:

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEDULE core_schedule_name
  FOR BACKUP INTO 's3://test/schedule-test-core?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x'
    WITH revision_history RECURRING '@daily'
    FULL BACKUP ALWAYS;
~~~
~~~
     schedule_id     |        name        | status |         first_run         | schedule |                                                                                       backup_stmt
---------------------+--------------------+--------+---------------------------+----------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  588799238330220545 | core_schedule_name | ACTIVE | 2020-09-11 00:00:00+00:00 | @daily   | BACKUP INTO 's3://test/schedule-test-core?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x' WITH revision_history, detached
(1 row)
~~~

To use the other backup scheduling features, you need an [enterprise license](enterprise-licensing.html).

### Create a scheduled backup for a cluster

This example creates a schedule for a cluster backup with revision history that's taken every day at midnight:

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEDULE schedule_name
  FOR BACKUP INTO 's3://test/backups/schedule_test?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x'
    WITH revision_history
    RECURRING '@daily';
~~~

~~~
     schedule_id     |     name      |                     status                     |            first_run             | schedule |                                                                               backup_stmt
---------------------+---------------+------------------------------------------------+----------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------------------
  588796190000218113 | schedule_name | PAUSED: Waiting for initial backup to complete | NULL                             | @daily   | BACKUP INTO LATEST IN 's3://test/schedule-test?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x' WITH revision_history, detached
  588796190012702721 | schedule_name | ACTIVE                                         | 2020-09-10 16:52:17.280821+00:00 | @weekly  | BACKUP INTO 's3://test/schedule-test?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x' WITH revision_history, detached
(2 rows)
~~~

Because the [`FULL BACKUP` clause](#full-backup-clause) was not included, CockroachDB also scheduled a full backup to run `@weekly`. This is the default cadence for incremental backups `RECURRING` <= 1 day.

### Create a scheduled backup for a database

This example creates a schedule for a backup of the database `movr` with revision history that's taken every day 1 minute past midnight (`00:00:01`):

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEDULE schedule_database
  FOR BACKUP DATABASE movr INTO 's3://test/schedule-database?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x'
    WITH revision_history
    RECURRING '1 0 * * *';
~~~

~~~
     schedule_id     |       name        |                     status                     |            first_run             | schedule  |                                                                           backup_stmt
---------------------+-------------------+------------------------------------------------+----------------------------------+-----------+-----------------------------------------------------------------------------------------------------------------------------------------------------
  588819866656997377 | schedule_database | PAUSED: Waiting for initial backup to complete | NULL                             | 1 0 * * * | BACKUP DATABASE movr INTO LATEST IN 's3://test/schedule-database?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x' WITH revision_history, detached
  588819866674233345 | schedule_database | ACTIVE                                         | 2020-09-10 18:52:42.823003+00:00 | @weekly   | BACKUP DATABASE movr INTO 's3://test/schedule-database?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x' WITH revision_history, detached
(2 rows)
~~~

Because the [`FULL BACKUP` clause](#full-backup-clause) was not included, CockroachDB also scheduled a full backup to run `@weekly`. This is the default cadence for incremental backups `RECURRING` <= 1 day.

### Create a scheduled backup for a table

This example creates a schedule for a backup of the table `movr.vehicles` with revision history that's taken every hour:

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEDULE schedule_table
  FOR BACKUP TABLE movr.vehicles INTO 's3://test/schedule-table?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x'
    WITH revision_history
    RECURRING '@hourly';
~~~

~~~
     schedule_id     |       name     |                     status                     |            first_run             | schedule |                                                                             backup_stmt
---------------------+----------------+------------------------------------------------+----------------------------------+----------+------------------------------------------------------------------------------------------------------------------------------------------------------
  588820615348027393 | schedule_table | PAUSED: Waiting for initial backup to complete | NULL                             | @hourly  | BACKUP TABLE movr.vehicles INTO LATEST IN 's3://test/schedule-table?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x' WITH revision_history, detached
  588820615382302721 | schedule_table | ACTIVE                                         | 2020-09-10 18:56:31.305782+00:00 | @daily   | BACKUP TABLE movr.vehicles INTO 's3://test/schedule-table?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x' WITH revision_history, detached
(2 rows)
~~~

Because the [`FULL BACKUP` clause](#full-backup-clause) was not included, CockroachDB also scheduled a full backup to run `@daily`. This is the default cadence for incremental backups `RECURRING` <= 1 hour.

### Create a scheduled backup with a scheduled first run

This example creates a schedule for a backup of the table `movr.vehicles` with revision history that's taken every hour, with its first run scheduled for `2020-09-15 00:00:00.00` (UTC):

{% include copy-clipboard.html %}
~~~ sql
> CREATE SCHEDULE scheduled_first_run
  FOR BACKUP TABLE movr.vehicles INTO 's3://test/schedule-table?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x'
    WITH revision_history
    RECURRING '@hourly'
    WITH SCHEDULE OPTIONS first_run = '2020-09-15 00:00:00.00';
~~~

~~~
     schedule_id     |        name         |                     status                     |         first_run         | schedule |                                                                                backup_stmt
---------------------+---------------------+------------------------------------------------+---------------------------+----------+----------------------------------------------------------------------------------------------------------------------------------------------------------
  589963390457741313 | scheduled_first_run | PAUSED: Waiting for initial backup to complete | NULL                      | @hourly  | BACKUP TABLE movr.vehicles INTO LATEST IN 's3://test/scheduled-first-run?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x' WITH revision_history, detached
  589963390487363585 | scheduled_first_run | ACTIVE                                         | 2020-09-15 00:00:00+00:00 | @daily   | BACKUP TABLE movr.vehicles INTO 's3://test/scheduled-first-run?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x' WITH revision_history, detached
(2 rows)
~~~

Because the [`FULL BACKUP` clause](#full-backup-clause) was not included, CockroachDB also scheduled a full backup to run `@daily`. This is the default cadence for incremental backups `RECURRING` <= 1 day.

## See also

- [Manage a Backup Schedule](manage-a-backup-schedule.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`SHOW BACKUP`](show-backup.html)
- [`SHOW SCHEDULES`](show-schedules.html)
- [`PAUSE SCHEDULES`](pause-schedules.html)
- [`RESUME SCHEDULES`](resume-schedules.html)
- [`DROP SCHEDULES`](drop-schedules.html)
- [`PAUSE JOB`](pause-job.html)
- [`RESUME JOB`](pause-job.html)
- [`CANCEL JOB`](cancel-job.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [Other Cockroach Commands](cockroach-commands.html)
