---
title: PAUSE SCHEDULES
summary: The PAUSE SCHEDULES statement lets you temporarily halt the process of a backup schedule.
toc: true
docs_area: reference.sql
---

 The `PAUSE SCHEDULES` [statement]({{ page.version.version }}/sql-statements.md) can be used to pause [backup schedules]({{ page.version.version }}/create-schedule-for-backup.md) and [changefeed schedules]({{ page.version.version }}/create-schedule-for-changefeed.md).

After pausing a schedule, you can resume it with [`RESUME SCHEDULES`]({{ page.version.version }}/resume-schedules.md).

## Required privileges

The following users can pause a schedule:


## Synopsis

<div>
</div>

## Parameters

 Parameter     | Description
---------------+------------
`selectclause` | A [selection query]({{ page.version.version }}/selection-queries.md) that returns `id`(s) to pause.
`scheduleID`   | The `id` of the schedule you want to pause, which can be found with [`SHOW SCHEDULES`]({{ page.version.version }}/show-schedules.md).

## Examples

### Pause a single schedule

~~~ sql
> PAUSE SCHEDULE 589963390487363585;
~~~

~~~
PAUSE SCHEDULES 1
~~~

### Pause multiple schedules

To pause multiple schedules, nest a [`SELECT` clause]({{ page.version.version }}/select-clause.md) that retrieves `id`(s) inside the `PAUSE SCHEDULES` statement:

~~~ sql
> PAUSE SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'schedule_database';
~~~

~~~
PAUSE SCHEDULES 4
~~~

In this example, all schedules with the label `schedule_database` are paused.

## See also

- [Manage a Backup Schedule]({{ page.version.version }}/manage-a-backup-schedule.md)
- [`BACKUP`]({{ page.version.version }}/backup.md)
- [`RESTORE`]({{ page.version.version }}/restore.md)
- [`CREATE CHANGEFEED`]({{ page.version.version }}/create-changefeed.md)
- [`SHOW BACKUP`]({{ page.version.version }}/show-backup.md)
- [`SHOW SCHEDULES`]({{ page.version.version }}/show-schedules.md)
- [`RESUME SCHEDULES`]({{ page.version.version }}/resume-schedules.md)
- [`DROP SCHEDULES`]({{ page.version.version }}/drop-schedules.md)
- [`PAUSE JOB`]({{ page.version.version }}/pause-job.md)
- [`RESUME JOB`]({{ page.version.version }}/pause-job.md)
- [`CANCEL JOB`]({{ page.version.version }}/cancel-job.md)
- [Take Full and Incremental Backups]({{ page.version.version }}/take-full-and-incremental-backups.md)
- [Use the Built-in SQL Client]({{ page.version.version }}/cockroach-sql.md)
- [`cockroach` Commands Overview]({{ page.version.version }}/cockroach-commands.md)