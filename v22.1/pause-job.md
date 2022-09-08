---
title: PAUSE JOB
summary: The PAUSE JOB statement lets you temporarily halt the process of potentially long-running jobs.
toc: true
docs_area: reference.sql
---

The `PAUSE JOB` [statement](sql-statements.html) lets you pause the following types of jobs:

- [`IMPORT`](import.html) jobs
- [`BACKUP`](backup.html) and [`RESTORE`](restore.html) jobs
- [User-created table statistics](create-statistics.html) jobs
- [Automatic table statistics](cost-based-optimizer.html#table-statistics) jobs
- [Changefeeds](create-changefeed.html)
- [Schema change](online-schema-changes.html) jobs
- [Scheduled backup](manage-a-backup-schedule.html) jobs

After pausing jobs, you can resume them with [`RESUME JOB`](resume-job.html).

{{site.data.alerts.callout_info}}
If a schema change job is paused, any jobs waiting on that schema change will stop waiting and return an error.
{{site.data.alerts.end}}

## Required privileges

To pause a job, the user must be a member of the `admin` role or must have the [`CONTROLJOB`](create-user.html#create-a-user-that-can-pause-resume-and-cancel-non-admin-jobs) parameter set.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/pause_job.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`job_id` | The ID of the job you want to pause, which can be found with [`SHOW JOBS`](show-jobs.html).
`select_stmt` | A [selection query](selection-queries.html) that returns `job_id`(s) to pause.
`for_schedules_clause` |  The schedule you want to pause jobs for. You can pause jobs for a specific schedule (`FOR SCHEDULE id`) or pause jobs for multiple schedules by nesting a [`SELECT` clause](select-clause.html) in the statement (`FOR SCHEDULES <select_clause>`). See the [examples](#pause-jobs-for-a-schedule) below.
`WITH REASON = ...` |  The reason to pause the job. CockroachDB stores the reason in the job's metadata, but there is no way to display it.

## Examples

### Pause a single job

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW JOBS;
~~~

~~~
      job_id     |  job_type |               description                 |...
-----------------+-----------+-------------------------------------------+...
  27536791415282 |  RESTORE  | RESTORE db.* FROM 'azure://backup/db/tbl' |...
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> PAUSE JOB 27536791415282;
~~~

### Pause multiple jobs

To pause multiple jobs, nest a [`SELECT` clause](select-clause.html) that retrieves `job_id`(s) inside the `PAUSE JOBS` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> PAUSE JOBS (WITH x AS (SHOW JOBS) SELECT job_id FROM x
      WHERE user_name = 'maxroach');
~~~

All jobs created by `maxroach` will be paused.

### Pause automatic table statistics jobs

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW AUTOMATIC JOBS;
~~~

~~~
        job_id       |       job_type      |                    description                      |...
---------------------+---------------------+-----------------------------------------------------+...
  438235476849557505 |  AUTO CREATE STATS  | Table statistics refresh for defaultdb.public.users |...
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> PAUSE JOB 438235476849557505;
~~~

To permanently disable automatic table statistics jobs, disable the `sql.stats.automatic_collection.enabled` [cluster setting](cluster-settings.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.stats.automatic_collection.enabled = false;
~~~

### Pause jobs for a schedule

 To pause jobs for a specific [backup schedule](create-schedule-for-backup.html), use the schedule's `id`:

{% include_cached copy-clipboard.html %}
~~~ sql
> PAUSE JOBS FOR SCHEDULE 590204387299262465;
~~~

~~~
PAUSE JOBS FOR SCHEDULES 1
~~~

You can also pause multiple schedules by nesting a [`SELECT` clause](select-clause.html) that retrieves `id`(s) inside the `PAUSE JOBS` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> PAUSE JOBS FOR SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'test_schedule';
~~~

~~~
PAUSE JOBS FOR SCHEDULES 2
~~~

## See also

- [`RESUME JOB`](resume-job.html)
- [`SHOW JOBS`](show-jobs.html)
- [`CANCEL JOB`](cancel-job.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`IMPORT`](import.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
