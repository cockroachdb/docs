---
title: RESUME JOB
summary: The RESUME JOB statement lets you resume jobs that were previously paused with PAUSE JOB.
toc: true
---

 The `RESUME JOB` [statement](sql-statements.html) lets you resume the following types of jobs:

 - [`IMPORT`](import.html) jobs
 - [`BACKUP`](backup.html) and [`RESTORE`](restore.html) jobs
 - [User-created table statistics](create-statistics.html) jobs
 - [Automatic table statistics](cost-based-optimizer.html#table-statistics) jobs
 - [Changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html)
 - [Schema change](online-schema-changes.html) jobs
 -  [Scheduled backup](manage-a-backup-schedule.html) jobs

## Required privileges

To resume a job, the user must be a member of the `admin` role or must have the [`CONTROLJOB`](create-user.html#create-a-user-that-can-pause-resume-and-cancel-non-admin-jobs) parameter set.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/resume_job.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`job_id` | The ID of the job you want to resume, which can be found with [`SHOW JOBS`](show-jobs.html).
`select_stmt` | A [selection query](selection-queries.html) that returns `job_id`(s) to resume.
`for_schedules_clause` |  The schedule you want to resume jobs for. You can resume jobs for a specific schedule (`FOR SCHEDULE id`) or resume jobs for multiple schedules by nesting a [`SELECT` clause](select-clause.html) in the statement (`FOR SCHEDULES <select_clause>`). See the [examples](#resume-jobs-for-a-schedule) below.

## Examples

### Pause a job

{% include copy-clipboard.html %}
~~~ sql
> SHOW JOBS;
~~~

~~~
+----------------+---------+-------------------------------------------+...
|       id       |  type   |               description                 |...
+----------------+---------+-------------------------------------------+...
| 27536791415282 | RESTORE | RESTORE db.* FROM 'azure://backup/db/tbl' |...
+----------------+---------+-------------------------------------------+...
~~~

{% include copy-clipboard.html %}
~~~ sql
> PAUSE JOB 27536791415282;
~~~

### Resume a single job

{% include copy-clipboard.html %}
~~~ sql
> RESUME JOB 27536791415282;
~~~

### Resume multiple jobs

To resume multiple jobs, nest a [`SELECT` clause](select-clause.html) that retrieves `job_id`(s) inside the `RESUME JOBS` statement:

{% include copy-clipboard.html %}
~~~ sql
> RESUME JOBS (SELECT job_id FROM [SHOW JOBS]
      WHERE user_name = 'maxroach');
~~~

All jobs created by `maxroach` will be resumed.

### Resume jobs for a schedule

 To resume jobs for a specific [backup schedule](create-schedule-for-backup.html), use the schedule's `id`:

{% include copy-clipboard.html %}
~~~ sql
> RESUME JOBS FOR SCHEDULE 590204387299262465;
~~~
~~~
RESUME JOBS FOR SCHEDULES 1
~~~

You can also resume multiple schedules by nesting a [`SELECT` clause](select-clause.html) that retrieves `id`(s) inside the `PAUSE JOBS` statement:

{% include copy-clipboard.html %}
~~~ sql
> RESUME JOBS FOR SCHEDULES SELECT id FROM [SHOW SCHEDULES] WHERE label = 'test_schedule';
~~~

~~~
RESUME JOBS FOR SCHEDULES 2
~~~

## See also

- [`PAUSE JOB`](pause-job.html)
- [`SHOW JOBS`](show-jobs.html)
- [`CANCEL JOB`](cancel-job.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`IMPORT`](import.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
