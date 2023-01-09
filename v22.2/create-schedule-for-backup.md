---
title: CREATE SCHEDULE FOR BACKUP
summary: The CREATE SCHEDULE FOR BACKUP statement creates a schedule for periodic backups.
toc: true
docs_area: reference.sql
---

 The `CREATE SCHEDULE FOR BACKUP` [statement](sql-statements.html) creates a schedule for periodic [backups](backup.html).

For more information about creating, managing, monitoring, and restoring from a scheduled backup, see [Manage a Backup Schedule](manage-a-backup-schedule.html).

{{site.data.alerts.callout_info}}
Core users can only use backup scheduling for [full backups](#create-a-schedule-for-full-backups-only-core) of clusters, databases, or tables. Scheduling backups without the `FULL BACKUP ALWAYS` clause will result in a warning. 

To use the other backup features, you need an [Enterprise license](enterprise-licensing.html).
{{site.data.alerts.end}}

## Required privileges

{% include {{ page.version.version }}/backups/updated-backup-privileges.md %}

## Required privileges using the legacy privilege model

The following details the legacy privilege model that CockroachDB supports in v22.2 and earlier. Support for this privilege model will be removed in a future release of CockroachDB:

- [Full cluster backups](take-full-and-incremental-backups.html#full-backups) can only be run by members of the [`admin` role](security-reference/authorization.html#admin-role). By default, the `root` user belongs to the `admin` role.
- For all other backups, the user must have [read access](security-reference/authorization.html#managing-privileges) on all objects being backed up. Database backups require `CONNECT` privileges, and table backups require `SELECT` privileges. Backups of user-defined schemas, or backups containing user-defined types, require `USAGE` privileges.

See the [Required privileges](#required-privileges) section for the updated privilege model.

## Destination privileges

{% include {{ page.version.version }}/backups/destination-privileges.md %}

## Synopsis

~~~
CREATE SCHEDULE [IF NOT EXISTS] <label>
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
`IF NOT EXISTS`                         |  Use to specify that a scheduled backup should not be created if the [`label`](#label) already exists. Produces an error if the schedule label already exists, or if the `label` is not specified.
<a name="label"></a>`label`             | The name used to identify the backup schedule. This is optional and does not need to be unique. If not provided, the schedule will be assigned the name `BACKUP`.
`targets`                               | The targets you want to back up: <ul><li>[cluster](#create-a-scheduled-backup-for-a-cluster) `[ ]`</li><li>[database](#create-a-scheduled-backup-for-a-database) `DATABASE <database_name> [, ...]`</li><li>[table](#create-a-scheduled-backup-for-a-table) `TABLE <table_pattern> [, ...]`</li></ul>
`table_pattern`                         | The [table(s)](create-table.html) or [view(s)](views.html) you want to back up.
`database_name`                         | The name of the [database(s)](create-database.html) you want to back up (i.e., create backups of all tables and views in the database).
`location`                              | The URI where you want to store the backup. The backup files will be stored in year > month > day subdirectories. The location can be [cloud storage](use-cloud-storage-for-bulk-operations.html), or `nodelocal`.<br><br><b>Note:</b> If you want to schedule a backup using temporary credentials, we recommend that you use `implicit` authentication; otherwise, you'll need to drop and then recreate schedules each time you need to update the credentials.
`backup_options`                        | Control the backup behavior with a comma-separated list of [options](#backup-options).
`RECURRING crontab`                     | Specifies when the backup should be taken. A separate schedule may be created automatically to write full backups at a regular cadence, depending on the frequency of the incremental backups. You can likewise modify this separate schedule with [`ALTER BACKUP SCHEDULE`](alter-backup-schedule.html). The schedule is specified as a [`STRING`](string.html) in [crontab format](https://en.wikipedia.org/wiki/Cron). All times in UTC. <br><br>Example: `'@daily'` (run daily at midnight)
<a name="full-backup-clause"></a>`FULL BACKUP crontab` | Specifies when to take a new full backup. The schedule is specified as a [`STRING`](string.html) in [crontab format](https://en.wikipedia.org/wiki/Cron) or as `ALWAYS`. <br><br>If `FULL BACKUP ALWAYS` is specified, then the backups triggered by the `RECURRING` clause will always be full backups. For free users, `ALWAYS` is the only accepted value of `FULL BACKUP`. If `ALWAYS` is not specified, free users will receive a warning.<br><br>If the `FULL BACKUP` clause is omitted, CockroachDB will default to the following full backup schedule: <ul><li>`RECURRING` <= 1 hour: Default to `FULL BACKUP '@daily'`</li><li>`RECURRING` <= 1 day: Default to `FULL BACKUP '@weekly'`</li><li>Otherwise: Default to `FULL BACKUP ALWAYS`</li></ul>
`WITH SCHEDULE OPTIONS schedule_option` | _Experimental feature._ Control the schedule behavior with a comma-separated list of [these options](#schedule-options).

{{site.data.alerts.callout_info}}
For schedules that include both [full and incremental backups](take-full-and-incremental-backups.html), CockroachDB will create two schedules (one for each type).
{{site.data.alerts.end}}

### Backup options

{% include {{ page.version.version }}/backups/backup-options-for-schedules.md %}

### Schedule options

{% include feature-phases/preview.md %}

{% include {{ page.version.version }}/backups/schedule-options.md %}

## Considerations

- We recommend that you schedule your backups at a cadence that your cluster can keep up with; for example, if a previous backup is still running when it is time to start the next one, adjust the schedule so the backups do not end up falling behind or update the [`on_previous_running` option](#on-previous-running-option).
- To prevent scheduled backups from falling behind, first determine how long a single backup takes and use that as your starting point for the schedule's cadence.
- Ensure you are monitoring your backup schedule (e.g., [Prometheus](monitor-cockroachdb-with-prometheus.html)) and alerting metrics that will confirm that your backups are completing, but also that they're not running more concurrently than you expect.
- The `AS OF SYSTEM TIME` clause cannot be set on scheduled backups. Scheduled backups are started shortly after the scheduled time has passed by an internal polling mechanism and are automatically run with `AS OF SYSTEM TIME` set to the time at which the backup was scheduled to run.
- If you want to schedule a backup using temporary credentials, we recommend that you use `implicit` authentication; otherwise, you'll need to drop and then recreate schedules each time you need to update the credentials.

### Protected timestamps and scheduled backups 

{% include_cached new-in.html version="v22.2" %} Scheduled backups ensure that the data to be backed up is protected from garbage collection until it has been successfully backed up. This active management of [protected timestamps](architecture/storage-layer.html#protected-timestamps) means that you can run scheduled backups at a cadence independent from the [GC TTL](configure-replication-zones.html#gc-ttlseconds) of the data. This is unlike non-scheduled backups that are tightly coupled to the GC TTL. See [Garbage collection and backups](take-full-and-incremental-backups.html#garbage-collection-and-backups) for more detail.

The data being backed up will not be eligible for garbage collection until a successful backup completes. At this point, the schedule will release the existing protected timestamp record and write a new one to protect data for the next backup that is scheduled to run. It is important to consider that when a scheduled backup fails there will be an accumulation of data until the next successful backup. Resolving the backup failure or [dropping the backup schedule](drop-schedules.html) will make the data eligible for garbage collection once again.

You can also use the `exclude_data_from_backup` option with a scheduled backup as a way to prevent protected timestamps from prolonging garbage collection on a table. See the example [Exclude a table's data from backups](take-full-and-incremental-backups.html#exclude-a-tables-data-from-backups) for usage information.

We recommend monitoring for your backup schedule to alert for failed backups. See [Set up monitoring for the backup schedule](manage-a-backup-schedule.html#set-up-monitoring-for-the-backup-schedule) for more detail.

## View and control backup schedules

Once a backup schedule is successfully created, you can do the following:

 Action                | SQL Statement
-----------------------+-----------------
View the schedule      | [`SHOW SCHEDULES`](show-schedules.html)
Pause the schedule     | [`PAUSE SCHEDULES`](pause-schedules.html)
Resume the schedule    | [`RESUME SCHEDULES`](resume-schedules.html)
Drop the schedule      | [`DROP SCHEDULES`](drop-schedules.html)
Alter the schedule     | [`ALTER BACKUP SCHEDULE`](alter-backup-schedule.html)

## View and control a backup initiated by a schedule

After CockroachDB successfully initiates a scheduled backup, it registers the backup as a job. You can do the following with each individual backup job:

 Action                | SQL Statement
-----------------------+-----------------
View the backup status | [`SHOW JOBS`](show-jobs.html)
Pause the backup       | [`PAUSE JOB`](pause-job.html)
Resume the backup      | [`RESUME JOB`](resume-job.html)
Cancel the backup      | [`CANCEL JOB`](cancel-job.html)

You can also visit the [**Jobs** page](ui-jobs-page.html) of the DB Console to view job details. The `BACKUP` statement will return when the backup is finished or if it encounters an error.

## Examples

### Create a schedule for full backups only (core)

Core users can only use backup scheduling for full backups of clusters, databases, or tables. Full backups are taken with the `FULL BACKUP ALWAYS` clause, for example:

{% include_cached copy-clipboard.html %}
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

To use the other backup features, you need an [Enterprise license](enterprise-licensing.html).

### Create a scheduled backup for a cluster

This example creates a schedule for a cluster backup with revision history that's taken every day at midnight:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE SCHEDULE schedule_label
  FOR BACKUP INTO 's3://test/backups/schedule_test?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x'
    WITH revision_history
    RECURRING '@daily';
~~~

~~~
     schedule_id     |     name       |                     status                     |            first_run             | schedule |                                                                               backup_stmt
---------------------+----------------+------------------------------------------------+----------------------------------+----------+---------------------------------------------------------------------------------------------------------------------------------------------------------
  588796190000218113 | schedule_label | PAUSED: Waiting for initial backup to complete | NULL                             | @daily   | BACKUP INTO LATEST IN 's3://test/schedule-test?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x' WITH revision_history, detached
  588796190012702721 | schedule_label | ACTIVE                                         | 2020-09-10 16:52:17.280821+00:00 | @weekly  | BACKUP INTO 's3://test/schedule-test?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=x' WITH revision_history, detached
(2 rows)
~~~

Because the [`FULL BACKUP` clause](#full-backup-clause) was not included, CockroachDB also scheduled a full backup to run `@weekly`. This is the default cadence for incremental backups `RECURRING` > 1 hour but <= 1 day.

### Create a scheduled backup for a database

This example creates a schedule for a backup of the database `movr` with revision history that's taken every day 1 minute past midnight (`00:00:01`):

{% include_cached copy-clipboard.html %}
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

Because the [`FULL BACKUP` clause](#full-backup-clause) was not included, CockroachDB also scheduled a full backup to run `@weekly`. This is the default cadence for incremental backups `RECURRING` > 1 hour but <= 1 day.

### Create a scheduled backup for a table

This example creates a schedule for a backup of the table `movr.vehicles` with revision history that's taken every hour:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

Because the [`FULL BACKUP` clause](#full-backup-clause) was not included, CockroachDB also scheduled a full backup to run `@daily`. This is the default cadence for incremental backups `RECURRING` <= 1 hour.

### View scheduled backup details

{% include {{ page.version.version }}/backups/view-scheduled-backups.md %}

## See also

- [Manage a Backup Schedule](manage-a-backup-schedule.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`SHOW BACKUP`](show-backup.html)
- [`SHOW SCHEDULES`](show-schedules.html)
- [`PAUSE SCHEDULES`](pause-schedules.html)
- [`RESUME SCHEDULES`](resume-schedules.html)
- [`DROP SCHEDULES`](drop-schedules.html)
- [`ALTER BACKUP SCHEDULE`](alter-backup-schedule.html)
- [`PAUSE JOB`](pause-job.html)
- [`RESUME JOB`](pause-job.html)
- [`CANCEL JOB`](cancel-job.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [`cockroach` Commands Overview](cockroach-commands.html)
