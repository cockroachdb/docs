---
title: SHOW SCHEDULES
summary: The SHOW SCHEDULES statement lists all currently active backup schedules.
toc: true
---

 The `SHOW SCHEDULES` [statement](sql-statements.html) lists all of the currently active [backup schedules](create-schedule-for-backup.html).

## Required privileges

Only members of the [`admin` role](authorization.html#default-roles) can resume a schedule. By default, the `root` user belongs to the `admin` role.

## Synopsis

~~~
SHOW [RUNNING | PAUSED] SCHEDULES [FOR BACKUP];
SHOW SCHEDULE <schedule_id>;
~~~

## Parameters

 Parameter      | Description
----------------+-------------
`schedule_id`   | The ID of the schedule you want to view.

## Response

The output of `SHOW SCHEDULES` is sorted by creation time. The following fields are returned for each schedule:

Field | Description
------+------------
`id` | A unique ID to identify each schedule. This value is used if you want to control schedules (i.e., [pause](pause-schedules.html), [resume](resume-schedules.html), or [drop](drop-schedules.html) it).
`label` | The name used to identify the backup schedule, given at the time of schedule creation.
`schedule_status` | The schedule's current status.
`next_run`  | The [`TIMESTAMP`](timestamp.html) at which the next backup in the schedule is slated to run.
`state` | Displays last-known errors or messages about the backup schedule.
`recurrence` | How often the backup is taken, which is set at the time of schedule creation.
`jobsrunning` | The number of [jobs](show-jobs.html) currently running for the schedule.
`owner` | The [user](create-user.html) who created the backup schedule. Users with active schedules cannot be dropped.
`created` | The [`TIMESTAMP`](timestamp.html) when the job was created.
`command` | The command that the schedule will run to take the backup. This is derived from the [`CREATE SCHEDULE FOR BACKUP`](create-schedule-for-backup.html) statement used.

## Examples

### Show schedules

{% include copy-clipboard.html %}
~~~ sql
> SHOW SCHEDULES;
~~~

~~~
          id         |        label        | schedule_status |         next_run          |                 state                  | recurrence | jobsrunning | owner |             created              |                                                                                                                     command
---------------------+---------------------+-----------------+---------------------------+----------------------------------------+------------+-------------+-------+----------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  588796190000218113 | schedule_name       | ACTIVE          | 2020-09-15 00:00:00+00:00 |                  NULL                  | @daily     |           0 | root  | 2020-09-10 16:52:16.846944+00:00 | {"backup_statement": "BACKUP INTO LATEST IN 's3://test/schedule-test2?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' WITH revision_history, detached", "backup_type": 1}
  588819866656997377 | schedule_database   | ACTIVE          | 2020-09-15 00:01:00+00:00 |                  NULL                  | 1 0 * * *  |           0 | root  | 2020-09-10 18:52:42.339026+00:00 | {"backup_statement": "BACKUP DATABASE movr INTO LATEST IN 's3://test/schedule-database?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' WITH revision_history, detached", "backup_type": 1}
  588820615348027393 | schedule_database   | ACTIVE          | 2020-09-14 22:00:00+00:00 |                  NULL                  | @hourly    |           0 | root  | 2020-09-10 18:56:30.919388+00:00 | {"backup_statement": "BACKUP TABLE movr.vehicles INTO LATEST IN 's3://test/schedule-table?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' WITH revision_history, detached", "backup_type": 1}
  589963390457741313 | scheduled_first_run | PAUSED          | NULL                      | Waiting for initial backup to complete | @hourly    |           0 | root  | 2020-09-14 19:48:58.042612+00:00 | {"backup_statement": "BACKUP TABLE movr.vehicles INTO LATEST IN 's3://test/scheduled-first-run?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' WITH revision_history, detached", "backup_type": 1}
  588796190012702721 | schedule_name       | ACTIVE          | 2020-09-20 00:00:00+00:00 |                  NULL                  | @weekly    |           0 | root  | 2020-09-10 16:52:16.846944+00:00 | {"backup_statement": "BACKUP INTO 's3://test/schedule-test2?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' WITH revision_history, detached"}
  588819866674233345 | schedule_database   | ACTIVE          | 2020-09-20 00:00:00+00:00 |                  NULL                  | @weekly    |           0 | root  | 2020-09-10 18:52:42.339026+00:00 | {"backup_statement": "BACKUP DATABASE movr INTO 's3://test/schedule-database?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' WITH revision_history, detached"}
  588820615382302721 | schedule_database   | ACTIVE          | 2020-09-15 00:00:00+00:00 |                  NULL                  | @daily     |           0 | root  | 2020-09-10 18:56:30.919388+00:00 | {"backup_statement": "BACKUP TABLE movr.vehicles INTO 's3://test/schedule-table?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' WITH revision_history, detached"}
  589963390487363585 | scheduled_first_run | ACTIVE          | 2020-09-15 00:00:00+00:00 |                  NULL                  | @daily     |           0 | root  | 2020-09-14 19:48:58.042612+00:00 | {"backup_statement": "BACKUP TABLE movr.vehicles INTO 's3://test/scheduled-first-run?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' WITH revision_history, detached", "unpause_on_success": 589963390457741313}
(8 rows)
~~~

### Show running schedules

{% include copy-clipboard.html %}
~~~ sql
> SHOW RUNNING SCHEDULES;
~~~

~~~
          id         |        label        | schedule_status |         next_run          |   state  | recurrence | jobsrunning | owner |             created              |                                                                                      command
---------------------+---------------------+-----------------+---------------------------+----------+------------+-------------+-------+----------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------
  588796190000218113 | schedule_name       | ACTIVE          | 2020-09-15 00:00:00+00:00 |   NULL   | @daily     |           0 | root  | 2020-09-10 16:52:16.846944+00:00 | BACKUP INTO LATEST IN 's3://test/schedule-test2?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' WITH revision_history, detached
  588819866656997377 | schedule_database   | ACTIVE          | 2020-09-15 00:01:00+00:00 |   NULL   | 1 0 * * *  |           0 | root  | 2020-09-10 18:52:42.339026+00:00 | BACKUP DATABASE movr INTO LATEST IN 's3://test/schedule-database?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' WITH revision_history, detached
  588820615348027393 | schedule_database   | ACTIVE          | 2020-09-14 22:00:00+00:00 |   NULL   | @hourly    |           0 | root  | 2020-09-10 18:56:30.919388+00:00 | BACKUP TABLE movr.vehicles INTO LATEST IN 's3://test/schedule-table?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' WITH revision_history, detached
  588796190012702721 | schedule_name       | ACTIVE          | 2020-09-20 00:00:00+00:00 |   NULL   | @weekly    |           0 | root  | 2020-09-10 16:52:16.846944+00:00 | BACKUP INTO 's3://test/schedule-test2?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' WITH revision_history, detached
  588819866674233345 | schedule_database   | ACTIVE          | 2020-09-20 00:00:00+00:00 |   NULL   | @weekly    |           0 | root  | 2020-09-10 18:52:42.339026+00:00 | BACKUP DATABASE movr INTO 's3://test/schedule-database?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' WITH revision_history, detached
  588820615382302721 | schedule_database   | ACTIVE          | 2020-09-15 00:00:00+00:00 |   NULL   | @daily     |           0 | root  | 2020-09-10 18:56:30.919388+00:00 | BACKUP TABLE movr.vehicles INTO 's3://test/schedule-table?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' WITH revision_history, detached
  589963390487363585 | scheduled_first_run | ACTIVE          | 2020-09-15 00:00:00+00:00 |   NULL   | @daily     |           0 | root  | 2020-09-14 19:48:58.042612+00:00 | BACKUP TABLE movr.vehicles INTO 's3://test/scheduled-first-run?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' WITH revision_history, detached
(7 rows)
~~~

### Show paused schedules

{% include copy-clipboard.html %}
~~~ sql
> SHOW PAUSED SCHEDULES;
~~~
~~~
          id         |        label        | schedule_status | next_run |                 state                  | recurrence | jobsrunning | owner |             created              |                                                                                                              command
---------------------+---------------------+-----------------+----------+----------------------------------------+------------+-------------+-------+----------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  589963390457741313 | scheduled_first_run | PAUSED          | NULL     | Waiting for initial backup to complete | @hourly    |           0 | root  | 2020-09-14 19:48:58.042612+00:00 | {"backup_statement": "BACKUP TABLE movr.vehicles INTO LATEST IN 's3://test/scheduled-first-run?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' WITH revision_history, detached", "backup_type": 1}
(1 row)
~~~

### Show a specific schedule

To view a specific schedule, use the schedule's `id`:

{% include copy-clipboard.html %}
~~~ sql
> SHOW SCHEDULE 588796190012702721;
~~~

~~~
          id         |     label     | schedule_status |         next_run          |  state  | recurrence | jobsrunning | owner |             created              |                                                                                   command
---------------------+---------------+-----------------+---------------------------+---------+------------+-------------+-------+----------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------
  588796190012702721 | schedule_name | ACTIVE          | 2020-09-20 00:00:00+00:00 |  NULL   | @weekly    |           0 | root  | 2020-09-10 16:52:16.846944+00:00 | {"backup_statement": "BACKUP INTO 's3://test/schedule-test2?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' WITH revision_history, detached"}
(1 row)
~~~

## See also

- [Manage a Backup Schedule](manage-a-backup-schedule.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`SHOW BACKUP`](show-backup.html)
- [`PAUSE SCHEDULES`](pause-schedules.html)
- [`RESUME SCHEDULES`](resume-schedules.html)
- [`DROP SCHEDULES`](drop-schedules.html)
- [`PAUSE JOB`](pause-job.html)
- [`RESUME JOB`](pause-job.html)
- [`CANCEL JOB`](cancel-job.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [Other Cockroach Commands](cockroach-commands.html)
