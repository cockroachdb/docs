---
title: PAUSE SCHEDULES
summary: The PAUSE SCHEDULES statement lets you temporarily halt the process of a backup schedule.
toc: true
docs_area: reference.sql
---

 The `PAUSE SCHEDULES` [statement]({% link {{ page.version.version }}/sql-statements.md %}) can be used to pause [backup schedules]({% link {{ page.version.version }}/create-schedule-for-backup.md %}) and [changefeed schedules]({% link {{ page.version.version }}/create-schedule-for-changefeed.md %}).

After pausing a schedule, you can resume it with [`RESUME SCHEDULES`]({% link {{ page.version.version }}/resume-schedules.md %}).

## Required privileges

The following users can pause a schedule:

{% include {{page.version.version}}/backups/control-schedule-privileges.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/pause_schedule.html %}
</div>

## Parameters

 Parameter     | Description
---------------+------------
`selectclause` | A [selection query]({% link {{ page.version.version }}/selection-queries.md %}) that returns `id`(s) to pause.
`scheduleID`   | The `id` of the schedule you want to pause, which can be found with [`SHOW SCHEDULES`]({% link {{ page.version.version }}/show-schedules.md %}).

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

To pause multiple schedules, nest a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) that retrieves `id`(s) inside the `PAUSE SCHEDULES` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> PAUSE SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'schedule_database';
~~~

~~~
PAUSE SCHEDULES 4
~~~

In this example, all schedules with the label `schedule_database` are paused.

## See also

- [Manage a Backup Schedule]({% link {{ page.version.version }}/manage-a-backup-schedule.md %})
- [`BACKUP`]({% link {{ page.version.version }}/backup.md %})
- [`RESTORE`]({% link {{ page.version.version }}/restore.md %})
- [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %})
- [`SHOW BACKUP`]({% link {{ page.version.version }}/show-backup.md %})
- [`SHOW SCHEDULES`]({% link {{ page.version.version }}/show-schedules.md %})
- [`RESUME SCHEDULES`]({% link {{ page.version.version }}/resume-schedules.md %})
- [`DROP SCHEDULES`]({% link {{ page.version.version }}/drop-schedules.md %})
- [`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %})
- [`RESUME JOB`]({% link {{ page.version.version }}/pause-job.md %})
- [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %})
- [Take Full and Incremental Backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %})
- [Use the Built-in SQL Client]({% link {{ page.version.version }}/cockroach-sql.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
