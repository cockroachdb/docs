---
title: DROP SCHEDULES
summary: The DROP SCHEDULES statement lets you remove specified backup schedules.
toc: true
---

 The `DROP SCHEDULES` [statement](sql-statements.html) can be used to remove [backup schedules](create-schedule-for-backup.html).

{{site.data.alerts.callout_danger}}
`DROP SCHEDULE` does **not** cancel any in-progress jobs started by the schedule. Before you drop a schedule, [cancel any in-progress jobs](cancel-job.html) first, as you will not be able to look up the job ID once the schedule is dropped.
{{site.data.alerts.end}}

## Required privileges

Only members of the [`admin` role](authorization.html#default-roles) can drop a schedule. By default, the `root` user belongs to the `admin` role.

## Synopsis

~~~
DROP SCHEDULES <selectclause>
  select clause: select statement returning schedule id to pause.
DROP SCHEDULE <scheduleID>
~~~

## Parameters

 Parameter     | Description
---------------+------------
`selectclause` | A [selection query](selection-queries.html) that returns `id`(s) to drop.
`scheduleID`   | The `id` of the schedule you want to drop, which can be found with [`SHOW SCHEDULES`](show-schedules.html).

## Examples

### Drop a schedule

{% include copy-clipboard.html %}
~~~ sql
> DROP SCHEDULE 589963390487363585;
~~~

~~~
DROP SCHEDULES 1
~~~

### Drop multiple schedules

To drop multiple schedules, nest a [`SELECT` clause](select-clause.html) that retrieves `id`(s) inside the `DROP SCHEDULES` statement:

{% include copy-clipboard.html %}
~~~ sql
> DROP SCHEDULES SELECT id FROM [SHOW SCHEDULES] WHERE label = 'schedule_database';
~~~

~~~
DROP SCHEDULES 4
~~~

In this example, all schedules with the label `schedule_database` are dropped.

## See also

- [Manage a Backup Schedule](manage-a-backup-schedule.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`SHOW BACKUP`](show-backup.html)
- [`SHOW SCHEDULES`](show-schedules.html)
- [`PAUSE SCHEDULES`](pause-schedules.html)
- [`RESUME SCHEDULES`](resume-schedules.html)
- [`PAUSE JOB`](pause-job.html)
- [`RESUME JOB`](pause-job.html)
- [`CANCEL JOB`](cancel-job.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [Other Cockroach Commands](cockroach-commands.html)
