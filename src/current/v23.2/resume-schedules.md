---
title: RESUME SCHEDULES
summary: The RESUME SCHEDULES statement lets you resume jobs that were previously paused with PAUSE SCHEDULE.
toc: true
docs_area: reference.sql
---

 The `RESUME SCHEDULES` [statement]({% link {{ page.version.version }}/sql-statements.md %}) can be used to resume [paused schedules]({% link {{ page.version.version }}/pause-schedules.md %}): 
 
 - [Backup schedule]({% link {{ page.version.version }}/create-schedule-for-backup.md %})
 - [Changefeed schedule]({% link {{ page.version.version }}/create-schedule-for-changefeed.md %})
 
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
`selectclause` | A [selection query]({% link {{ page.version.version }}/selection-queries.md %}) that returns `id`(s) to resume.
`scheduleID`   | The `id` of the schedule you want to resume, which can be found with [`SHOW SCHEDULES`]({% link {{ page.version.version }}/show-schedules.md %}).

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

To resume multiple schedules, nest a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) that retrieves `id`(s) inside the `RESUME SCHEDULES` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESUME SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'schedule_database';
~~~

~~~
RESUME SCHEDULES 4
~~~

All schedules with the label `schedule_database` are resumed.

## See also

- [Manage a Backup Schedule]({% link {{ page.version.version }}/manage-a-backup-schedule.md %})
- [`BACKUP`]({% link {{ page.version.version }}/backup.md %})
- [`RESTORE`]({% link {{ page.version.version }}/restore.md %})
- [`SHOW BACKUP`]({% link {{ page.version.version }}/show-backup.md %})
- [`SHOW SCHEDULES`]({% link {{ page.version.version }}/show-schedules.md %})
- [`PAUSE SCHEDULES`]({% link {{ page.version.version }}/pause-schedules.md %})
- [`DROP SCHEDULES`]({% link {{ page.version.version }}/drop-schedules.md %})
- [`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %})
- [`RESUME JOB`]({% link {{ page.version.version }}/pause-job.md %})
- [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %})
- [Take Full and Incremental Backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
- [Use the Built-in SQL Client]({% link {{ page.version.version }}/cockroach-sql.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
