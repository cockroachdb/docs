---
title: RESUME SCHEDULES
summary: The RESUME SCHEDULES statement lets you resume jobs that were previously paused with PAUSE SCHEDULE.
toc: true
---

 The `RESUME SCHEDULES` [statement](sql-statements.html) can be used to resume [paused backup schedules](pause-schedules.html). When a schedule is resumed, the `next_run` will be set to the next `TIMESTAMP` that conforms to the schedule.

## Required privileges

Only members of the [`admin` role](authorization.html#default-roles) can resume a schedule. By default, the `root` user belongs to the `admin` role.

## Synopsis

~~~
RESUME SCHEDULES <selectclause>
 selectclause: select statement returning schedule IDs to resume.

RESUME SCHEDULE <scheduleID>
~~~

## Parameters

 Parameter     | Description
---------------+------------
`selectclause` | A [selection query](selection-queries.html) that returns `id`(s) to resume.
`scheduleID`   | The `id` of the schedule you want to resume, which can be found with [`SHOW SCHEDULES`](show-schedules.html).

## Examples

### Pause a schedule

{% include copy-clipboard.html %}
~~~ sql
> PAUSE SCHEDULE 589963390487363585;
~~~

~~~
PAUSE SCHEDULES 1
~~~

### Resume a single schedule

{% include copy-clipboard.html %}
~~~ sql
> RESUME SCHEDULE 589963390487363585;
~~~

~~~
RESUME SCHEDULES 1
~~~

### Resume multiple schedules

To resume multiple schedules, nest a [`SELECT` clause](select-clause.html) that retrieves `id`(s) inside the `RESUME SCHEDULES` statement:

{% include copy-clipboard.html %}
~~~ sql
> RESUME SCHEDULES SELECT id FROM [SHOW SCHEDULES] WHERE label = 'schedule_database';
~~~

~~~
RESUME SCHEDULES 4
~~~

All schedules with the label `schedule_database` are resumed.

## See also

- [Manage a Backup Schedule](manage-a-backup-schedule.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`SHOW BACKUP`](show-backup.html)
- [`SHOW SCHEDULES`](show-schedules.html)
- [`PAUSE SCHEDULES`](pause-schedules.html)
- [`DROP SCHEDULES`](drop-schedules.html)
- [`PAUSE JOB`](pause-job.html)
- [`RESUME JOB`](pause-job.html)
- [`CANCEL JOB`](cancel-job.html)
- [Take Full and Incremental Backups](take-full-and-incremental-backups.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
- [Other Cockroach Commands](cockroach-commands.html)
