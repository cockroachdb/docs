---
title: DROP SCHEDULES
summary: The DROP SCHEDULES statement lets you remove specified backup schedules.
toc: true
docs_area: reference.sql
---

 The `DROP SCHEDULES` [statement]({{ page.version.version }}/sql-statements.md) can be used to remove [backup schedules]({{ page.version.version }}/create-schedule-for-backup.md) or [changefeed schedules]({{ page.version.version }}/create-schedule-for-changefeed.md).

When `DROP SCHEDULES` removes a [full backup schedule]({{ page.version.version }}/create-schedule-for-backup.md#create-a-schedule-for-full-backups-only), it removes the associated [incremental backup schedule]({{ page.version.version }}/create-schedule-for-backup.md#incremental-backup-schedules), if it exists. 

{{site.data.alerts.callout_danger}}
`DROP SCHEDULE` does **not** cancel any in-progress jobs started by the schedule. Before you drop a schedule, [cancel any in-progress jobs]({{ page.version.version }}/cancel-job.md) first, as you will not be able to look up the job ID once the schedule is dropped.
{{site.data.alerts.end}}

## Required privileges

The following users can drop a schedule:


## Synopsis

<div>
</div>

## Parameters

 Parameter     | Description
---------------+------------
`selectclause` | A [selection query]({{ page.version.version }}/selection-queries.md) that returns `id`(s) to drop.
`scheduleID`   | The `id` of the schedule you want to drop, which can be found with [`SHOW SCHEDULES`]({{ page.version.version }}/show-schedules.md).

## Examples

### Drop a schedule

~~~ sql
> DROP SCHEDULE 589963390487363585;
~~~

~~~
DROP SCHEDULES 1
~~~

### Drop multiple schedules

To drop multiple schedules, nest a [`SELECT` clause]({{ page.version.version }}/select-clause.md) that retrieves `id`(s) inside the `DROP SCHEDULES` statement:

~~~ sql
> DROP SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'schedule_database';
~~~

~~~
DROP SCHEDULES 4
~~~

In this example, all schedules with the label `schedule_database` are dropped.

## See also

- [Manage a Backup Schedule]({{ page.version.version }}/manage-a-backup-schedule.md)
- [`BACKUP`]({{ page.version.version }}/backup.md)
- [`RESTORE`]({{ page.version.version }}/restore.md)
- [`CREATE CHANGEFEED`]({{ page.version.version }}/create-changefeed.md)
- [`CREATE SCHEDULE FOR CHANGEFEED`]({{ page.version.version }}/create-schedule-for-changefeed.md)
- [`SHOW BACKUP`]({{ page.version.version }}/show-backup.md)
- [`SHOW SCHEDULES`]({{ page.version.version }}/show-schedules.md)
- [`PAUSE SCHEDULES`]({{ page.version.version }}/pause-schedules.md)
- [`RESUME SCHEDULES`]({{ page.version.version }}/resume-schedules.md)
- [`PAUSE JOB`]({{ page.version.version }}/pause-job.md)
- [`RESUME JOB`]({{ page.version.version }}/pause-job.md)
- [`CANCEL JOB`]({{ page.version.version }}/cancel-job.md)
- [Take Full and Incremental Backups]({{ page.version.version }}/take-full-and-incremental-backups.md)
- [Use the Built-in SQL Client]({{ page.version.version }}/cockroach-sql.md)
- [`cockroach` Commands Overview]({{ page.version.version }}/cockroach-commands.md)