---
title: SHOW CREATE SCHEDULE
summary: SHOW CREATE SCHEDULE statement shows the CREATE SCHEDULE statement for a scheduled job.
toc: true
docs_area: reference.sql
---

The `SHOW CREATE SCHEDULE` [statement](sql-statements.html) displays the `CREATE` statement for an existing scheduled job, which can be used to recreate a schedule.

## Required privileges

Only members of the [`admin` role](security-reference/authorization.html#admin-role) can show a [`CREATE SCHEDULE`](create-schedule-for-backup.html) statement. By default, the [`root`](security-reference/authorization.html#root-user) user belongs to the `admin` role.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/master/grammar_svg/show_create_schedules.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`schedule_id` | Use the schedule `id` to show the [`CREATE SCHEDULE`](create-schedule-for-backup.html) for a particular schedule.
`ALL` |  Use to show the `CREATE SCHEDULE` statements for all _existing_ schedules. This includes [paused](pause-schedules.html) schedules.

## Response

Field | Description
------|------------
`schedule_id` | The `id` of the schedule.
`create_statement` | The `CREATE` statement of the schedule.

## Examples

`SHOW CREATE SCHEDULE` will display existing schedules including schedules that have been paused.

### Show the `CREATE SCHEDULE` statement for a schedule

Use the schedule `id` for a particular schedule to view its `CREATE` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE SCHEDULE 702856921622544385;
~~~

~~~
schedule_id        |                                                                                                                                                                create_statement
-------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
702856921622544385 | CREATE SCHEDULE 'scheduled_first_run' FOR BACKUP TABLE movr.public.vehicles INTO 'gs://bucket-name/backup-test?AUTH=specified&CREDENTIALS=redacted' WITH detached RECURRING '@daily' FULL BACKUP ALWAYS WITH SCHEDULE OPTIONS first_run = '2021-10-19 00:00:00+00:00', on_execution_failure = 'RESCHEDULE', on_previous_running = 'WAIT'
(1 row)
~~~

To list all the currently active schedules, use [`SHOW SCHEDULES`](show-schedules.html).

### Show the `CREATE SCHEDULE` statement for all schedules

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE ALL SCHEDULES;
~~~

~~~
schedule_id        |                                                                                                                                                            create_statement
-------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
698901570078113793 | SELECT crdb_internal.schedule_sql_stats_compact()
699244489678356481 | CREATE SCHEDULE 'BACKUP 1633462883' FOR BACKUP INTO 'nodelocal://0/test' WITH detached RECURRING '@hourly' FULL BACKUP ALWAYS WITH SCHEDULE OPTIONS first_run = '2021-10-05 20:00:00+00:00', on_execution_failure = 'RESCHEDULE', on_previous_running = 'WAIT'
699246220072812545 | CREATE SCHEDULE 'scheduled_first_run' FOR BACKUP TABLE movr.public.vehicles INTO 's3://bucket-name/backup-test?AWS_ACCESS_KEY_ID={AWS_ACCESS_KEY}&AWS_SECRET_ACCESS_KEY=redacted' WITH detached RECURRING '@daily' FULL BACKUP '@weekly' WITH SCHEDULE OPTIONS first_run = '2021-10-05 19:50:11.497459+00:00', on_execution_failure = 'RESCHEDULE', on_previous_running = 'WAIT'
699246220077694977 | CREATE SCHEDULE 'scheduled_first_run' FOR BACKUP TABLE movr.public.vehicles INTO 's3://bucket-name/backup-test?AWS_ACCESS_KEY_ID={AWS_ACCESS_KEY}&AWS_SECRET_ACCESS_KEY=redacted' WITH detached RECURRING '@daily' FULL BACKUP '@weekly' WITH SCHEDULE OPTIONS first_run = '2021-10-05 19:50:11.497459+00:00', on_execution_failure = 'RESCHEDULE', on_previous_running = 'WAIT'
(4 rows)
~~~

## See also

* [`CREATE SCHEDULE FOR BACKUP`](create-schedule-for-backup.html)
* [`PAUSE SCHEDULES`](pause-schedules.html)
* [`RESUME SCHEDULES`](resume-schedules.html)
* [`DROP SCHEDULES`](drop-schedules.html)
* [`BACKUP`](backup.html)
* [`RESTORE`](restore.html)
* [Manage a Backup Schedule](manage-a-backup-schedule.html)
