---
title: RESUME JOB
summary: The RESUME JOB statement lets you resume jobs that were previously paused with PAUSE JOB.
toc: true
docs_area: reference.sql
---

 The `RESUME JOB` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lets you resume the following types of jobs:

 - [`IMPORT`]({% link {{ page.version.version }}/import-into.md %}) jobs
 - [`BACKUP`]({% link {{ page.version.version }}/backup.md %}) and [`RESTORE`]({% link {{ page.version.version }}/restore.md %}) jobs
 - [User-created table statistics]({% link {{ page.version.version }}/create-statistics.md %}) jobs
 - [Automatic table statistics]({% link {{ page.version.version }}/cost-based-optimizer.md %}#table-statistics) jobs
 - [Changefeeds]({% link {{ page.version.version }}/create-changefeed.md %})
 - [Schema change]({% link {{ page.version.version }}/online-schema-changes.md %}) jobs
 -  [Scheduled backup]({% link {{ page.version.version }}/manage-a-backup-schedule.md %}) jobs

## Required privileges

To resume a job, the user must be a member of the `admin` role or must have the [`CONTROLJOB`]({% link {{ page.version.version }}/create-user.md %}#create-a-user-that-can-pause-resume-and-cancel-non-admin-jobs) [role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-options) set. Non-admin users cannot resume admin users' jobs.

For changefeeds, users with the [`CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}#required-privileges) privilege on a set of tables can resume changefeed jobs running on those tables.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/resume_job.html %}
</div>

### Resume all jobs by type

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/resume_all_jobs.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`job_id` | The ID of the job you want to resume, which can be found with [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}).
`select_stmt` | A [selection query]({% link {{ page.version.version }}/selection-queries.md %}) that returns `job_id`(s) to resume.
`for_schedules_clause` |  The schedule you want to resume jobs for. You can resume jobs for a specific schedule (`FOR SCHEDULE id`) or resume jobs for multiple schedules by nesting a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) in the statement (`FOR SCHEDULES <select_clause>`). See the [examples](#resume-jobs-for-a-schedule) below.
`BACKUP`, `CHANGEFEED`, `RESTORE`, `IMPORT` | The job type to resume.

## Examples

### Pause a job

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW JOBS;
~~~

~~~
      job_id     |  job_type |               description                      |...
-----------------+-----------+------------------------------------------------+...
  27536791415282 |  RESTORE  | RESTORE db.* FROM 'azure-blob://backup/db/tbl' |...
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> PAUSE JOB 27536791415282;
~~~

### Resume a single job

{% include_cached copy-clipboard.html %}
~~~ sql
> RESUME JOB 27536791415282;
~~~

### Resume multiple jobs

To resume multiple jobs, nest a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) that retrieves `job_id`(s) inside the `RESUME JOBS` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESUME JOBS (WITH x AS (SHOW JOBS) SELECT job_id FROM x
      WHERE user_name = 'maxroach');
~~~

All jobs created by `maxroach` will be resumed.

### Resume by job type

To resume all jobs by the type of job, use the `RESUME ALL {job} JOBS` statement. You can resume all `BACKUP`, `RESTORE`, `CHANGEFEED`, `IMPORT` jobs using this statement, for example:

{% include_cached copy-clipboard.html %}
~~~ sql
RESUME ALL BACKUP JOBS;
~~~

### Resume jobs for a schedule

 To resume jobs for a specific [backup schedule]({% link {{ page.version.version }}/create-schedule-for-backup.md %}), use the schedule's `id`:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESUME JOBS FOR SCHEDULE 590204387299262465;
~~~
~~~
RESUME JOBS FOR SCHEDULES 1
~~~

You can also resume multiple schedules by nesting a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) that retrieves `id`(s) inside the `PAUSE JOBS` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESUME JOBS FOR SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'test_schedule';
~~~

~~~
RESUME JOBS FOR SCHEDULES 2
~~~

## See also

- [`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %})
- [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %})
- [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %})
- [`BACKUP`]({% link {{ page.version.version }}/backup.md %})
- [`RESTORE`]({% link {{ page.version.version }}/restore.md %})
- [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %})
- [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %})
