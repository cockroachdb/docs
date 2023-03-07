---
title: RESUME SCHEDULES
summary: The RESUME SCHEDULES statement lets you resume jobs that were previously paused with PAUSE SCHEDULE.
toc: true
docs_area: reference.sql
---

 The `RESUME SCHEDULES` [statement](sql-statements.html) can be used to resume [paused schedules](pause-schedules.html): 
 
 - [Backup schedule](create-schedule-for-backup.html)
 - [Changefeed schedule](create-schedule-for-changefeed.html)
 
 When a schedule is resumed, the `next_run` will be set to the next `TIMESTAMP` that conforms to the schedule.

## Required privileges

The following users can resume a schedule:

{% include {{page.version.version}}/backups/control-schedule-privileges.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/resume_schedule.html %}
</div>

## Parameters

 Parameter     | Description
---------------+------------
`selectclause` | A [selection query](selection-queries.html) that returns `id`(s) to resume.
`scheduleID`   | The `id` of the schedule you want to resume, which can be found with [`SHOW SCHEDULES`](show-schedules.html).

## Examples

### Pause a schedule

{% include_cached copy-clipboard.html %}
~~~ sql
> PAUSE SCHEDULE 589963390487363585;
~~~

~~~
PAUSE SCHEDULES 1
~~~

### Resume a single schedule

{% include_cached copy-clipboard.html %}
~~~ sql
> RESUME SCHEDULE 589963390487363585;
~~~

~~~
RESUME SCHEDULES 1
~~~

### Resume multiple schedules

To resume multiple schedules, nest a [`SELECT` clause](select-clause.html) that retrieves `id`(s) inside the `RESUME SCHEDULES` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESUME SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'schedule_database';
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
- [`cockroach` Commands Overview](cockroach-commands.html)
