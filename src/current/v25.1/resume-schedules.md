---
title: RESUME SCHEDULES
summary: The RESUME SCHEDULES statement lets you resume jobs that were previously paused with PAUSE SCHEDULE.
toc: true
docs_area: reference.sql
---

 The `RESUME SCHEDULES` [statement]({{ page.version.version }}/sql-statements.md) can be used to resume [paused schedules]({{ page.version.version }}/pause-schedules.md): 
 
 - [Backup schedule]({{ page.version.version }}/create-schedule-for-backup.md)
 - [Changefeed schedule]({{ page.version.version }}/create-schedule-for-changefeed.md)
 
 When a schedule is resumed, the `next_run` will be set to the next `TIMESTAMP` that conforms to the schedule.

## Required privileges

The following users can resume a schedule:


## Synopsis

<div>
</div>

## Parameters

 Parameter     | Description
---------------+------------
`selectclause` | A [selection query]({{ page.version.version }}/selection-queries.md) that returns `id`(s) to resume.
`scheduleID`   | The `id` of the schedule you want to resume, which can be found with [`SHOW SCHEDULES`]({{ page.version.version }}/show-schedules.md).

## Examples

### Pause a schedule

~~~ sql
> PAUSE SCHEDULE 589963390487363585;
~~~

~~~
PAUSE SCHEDULES 1
~~~

### Resume a single schedule

~~~ sql
> RESUME SCHEDULE 589963390487363585;
~~~

~~~
RESUME SCHEDULES 1
~~~

### Resume multiple schedules

To resume multiple schedules, nest a [`SELECT` clause]({{ page.version.version }}/select-clause.md) that retrieves `id`(s) inside the `RESUME SCHEDULES` statement:

~~~ sql
> RESUME SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'schedule_database';
~~~

~~~
RESUME SCHEDULES 4
~~~

All schedules with the label `schedule_database` are resumed.

## See also

- [Manage a Backup Schedule]({{ page.version.version }}/manage-a-backup-schedule.md)
- [`BACKUP`]({{ page.version.version }}/backup.md)
- [`RESTORE`]({{ page.version.version }}/restore.md)
- [`SHOW BACKUP`]({{ page.version.version }}/show-backup.md)
- [`SHOW SCHEDULES`]({{ page.version.version }}/show-schedules.md)
- [`PAUSE SCHEDULES`]({{ page.version.version }}/pause-schedules.md)
- [`DROP SCHEDULES`]({{ page.version.version }}/drop-schedules.md)
- [`PAUSE JOB`]({{ page.version.version }}/pause-job.md)
- [`RESUME JOB`]({{ page.version.version }}/pause-job.md)
- [`CANCEL JOB`]({{ page.version.version }}/cancel-job.md)
- [Take Full and Incremental Backups]({{ page.version.version }}/take-full-and-incremental-backups.md)
- [Use the Built-in SQL Client]({{ page.version.version }}/cockroach-sql.md)
- [`cockroach` Commands Overview]({{ page.version.version }}/cockroach-commands.md)