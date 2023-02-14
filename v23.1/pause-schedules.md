---
title: PAUSE SCHEDULES
summary: The PAUSE SCHEDULES statement lets you temporarily halt the process of a backup schedule.
toc: true
docs_area: reference.sql
---

 The `PAUSE SCHEDULES` [statement](sql-statements.html) can be used to pause [backup schedules](create-schedule-for-backup.html).

After pausing a schedule, you can resume it with [`RESUME SCHEDULES`](resume-schedules.html).

## Required privileges

The following users can pause a schedule:

{% include {{page.version.version}}/backups/control-schedule-privileges.md %}

## Synopsis

~~~
PAUSE SCHEDULES <selectclause>
  select clause: select statement returning schedule id to pause.
PAUSE SCHEDULE <scheduleID>
~~~

## Parameters

 Parameter     | Description
---------------+------------
`selectclause` | A [selection query](selection-queries.html) that returns `id`(s) to pause.
`scheduleID`   | The `id` of the schedule you want to pause, which can be found with [`SHOW SCHEDULES`](show-schedules.html).

## Examples

### Pause a single schedule

{% include_cached copy-clipboard.html %}
~~~ sql
> PAUSE SCHEDULE 589963390487363585;
~~~

~~~
PAUSE SCHEDULES 1
~~~

### Pause multiple schedules

To pause multiple schedules, nest a [`SELECT` clause](select-clause.html) that retrieves `id`(s) inside the `PAUSE SCHEDULES` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> PAUSE SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'schedule_database';
~~~

~~~
PAUSE SCHEDULES 4
~~~

In this example, all schedules with the label `schedule_database` are paused.

## See also

- [Manage a Backup Schedule](manage-a-backup-schedule.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`SHOW BACKUP`](show-backup.html)
- [`SHOW SCHEDULES`](show-schedules.html)
- [`RESUME SCHEDULES`](resume-schedules.html)
- [`DROP SCHEDULES`](drop-schedules.html)
- [`PAUSE JOB`](pause-job.html)
- [`RESUME JOB`](pause-job.html)
- [`CANCEL JOB`](cancel-job.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [`cockroach` Commands Overview](cockroach-commands.html)
