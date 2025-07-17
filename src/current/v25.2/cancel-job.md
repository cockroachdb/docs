---
title: CANCEL JOB
summary: The CANCEL JOB statement stops long-running jobs such as imports, backups, and schema changes.such as imports, backups, and schema changes.
toc: true
docs_area: reference.sql
---

The `CANCEL JOB` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lets you stop long-running jobs, which include:

- [`IMPORT`]({% link {{ page.version.version }}/import-into.md %}) jobs
- [`BACKUP`]({% link {{ page.version.version }}/backup.md %}) and [`RESTORE`]({% link {{ page.version.version }}/restore.md %}) jobs
- [User-created table statistics]({% link {{ page.version.version }}/create-statistics.md %}) jobs
- [Automatic table statistics]({% link {{ page.version.version }}/cost-based-optimizer.md %}#table-statistics) jobs
- [Changefeeds]({% link {{ page.version.version }}/create-changefeed.md %})
- [Scheduled backup]({% link {{ page.version.version }}/manage-a-backup-schedule.md %}) jobs
- [Schema change]({% link {{ page.version.version }}/online-schema-changes.md %}) jobs (see [Known limitations](#known-limitations) for exceptions)

## Known limitations

{% include {{ page.version.version }}/known-limitations/cancel-job-limitations.md %}

## Required privileges

To cancel a job, the user must be a member of the `admin` role or must have the [`CONTROLJOB`]({% link {{ page.version.version }}/create-user.md %}#create-a-user-that-can-pause-resume-and-cancel-non-admin-jobs) [role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-options) set. Non-admin users cannot cancel admin users' jobs.

For changefeeds, users with the [`CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}#required-privileges) privilege on a set of tables can cancel changefeed jobs running on those tables.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/cancel_job.html %}
</div>

### Cancel all jobs by type

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/cancel_all_jobs.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`job_id` | The ID of the job you want to cancel, which can be found with [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}).
`select_stmt` | A [selection query]({% link {{ page.version.version }}/selection-queries.md %}) that returns `job_id`(s) to cancel.
`for_schedules_clause` |  The schedule you want to cancel jobs for. You can cancel jobs for a specific schedule (`FOR SCHEDULE id`) or cancel jobs for multiple schedules by nesting a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) in the statement (`FOR SCHEDULES <select_clause>`). See the [examples](#cancel-jobs-for-a-schedule) below.
`BACKUP`, `CHANGEFEED`, `RESTORE`, `IMPORT` | The job type to cancel.

## Examples

### Cancel a single job

~~~ sql
> SHOW JOBS;
~~~
~~~
+----------------+---------+------------------------------------------------+...
|       id       |  type   |               description                      |...
+----------------+---------+------------------------------------------------+...
| 27536791415282 | RESTORE | RESTORE db.* FROM 'azure-blob://backup/db/tbl' |...
+----------------+---------+------------------------------------------------+...
~~~
~~~ sql
> CANCEL JOB 27536791415282;
~~~

### Cancel multiple jobs

To cancel multiple jobs, nest a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) that retrieves `job_id`(s) inside the `CANCEL JOBS` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> CANCEL JOBS (WITH x AS (SHOW JOBS) SELECT job_id FROM x
      WHERE user_name = 'maxroach');
~~~

All jobs created by `maxroach` will be cancelled.

### Cancel by job type

To cancel all jobs by the type of job, use the `CANCEL ALL {job} JOBS` statement. You can cancel all `BACKUP`, `RESTORE`, `CHANGEFEED`, `IMPORT` jobs using this statement, for example:

{% include_cached copy-clipboard.html %}
~~~ sql
CANCEL ALL BACKUP JOBS;
~~~

### Cancel automatic table statistics jobs

Canceling an automatic table statistics job is not useful since the system will automatically restart the job immediately. To permanently disable automatic table statistics jobs, disable the `sql.stats.automatic_collection.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.stats.automatic_collection.enabled = false;
~~~

### Cancel jobs for a schedule

 To cancel jobs for a specific [backup schedule]({% link {{ page.version.version }}/create-schedule-for-backup.md %}), use the schedule's `id`:

{% include_cached copy-clipboard.html %}
~~~ sql
> CANCEL JOBS FOR SCHEDULE 590204387299262465;
~~~
~~~
CANCEL JOBS FOR SCHEDULES 1
~~~

You can also CANCEL multiple schedules by nesting a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) that retrieves `id`(s) inside the `CANCEL JOBS` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> CANCEL JOBS FOR SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'test_schedule';
~~~

~~~
CANCEL JOBS FOR SCHEDULES 2
~~~

## See also

- [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %})
- [`BACKUP`]({% link {{ page.version.version }}/backup.md %})
- [`RESTORE`]({% link {{ page.version.version }}/restore.md %})
- [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %})
- [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %})
