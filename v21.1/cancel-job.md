---
title: CANCEL JOB
summary: The CANCEL JOB statement stops long-running jobs.
toc: true
---

The `CANCEL JOB` [statement](sql-statements.html) lets you stop long-running jobs, which include:

- [`IMPORT`](import.html) jobs
- [`BACKUP`](backup.html) and [`RESTORE`](restore.html) jobs
- [User-created table statistics](create-statistics.html) jobs
- [Automatic table statistics](cost-based-optimizer.html#table-statistics) jobs
- [Changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html)
- [Schema change](online-schema-changes.html) jobs
-  [Scheduled backup](manage-a-backup-schedule.html) jobs

## Limitations

When an enterprise [`RESTORE`](restore.html) is canceled, partially restored data is properly cleaned up. This can have a minor, temporary impact on cluster performance.

## Required privileges

To cancel a job, the user must be a member of the `admin` role or must have the [`CONTROLJOB`](create-user.html#create-a-user-that-can-pause-resume-and-cancel-non-admin-jobs) parameter set. Non-admin users can't cancel admin users' jobs.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/cancel_job.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`job_id` | The ID of the job you want to cancel, which can be found with [`SHOW JOBS`](show-jobs.html).
`select_stmt` | A [selection query](selection-queries.html) that returns `job_id`(s) to cancel.
`for_schedules_clause` |  The schedule you want to cancel jobs for. You can cancel jobs for a specific schedule (`FOR SCHEDULE id`) or cancel jobs for multiple schedules by nesting a [`SELECT` clause](select-clause.html) in the statement (`FOR SCHEDULES <select_clause>`). See the [examples](#cancel-jobs-for-a-schedule) below.

## Examples

### Cancel a single job

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
~~~ sql
> CANCEL JOB 27536791415282;
~~~

### Cancel multiple jobs

To cancel multiple jobs, nest a [`SELECT` clause](select-clause.html) that retrieves `job_id`(s) inside the `CANCEL JOBS` statement:

{% include copy-clipboard.html %}
~~~ sql
> CANCEL JOBS (SELECT job_id FROM [SHOW JOBS]
      WHERE user_name = 'maxroach');
~~~

All jobs created by `maxroach` will be cancelled.

### Cancel automatic table statistics jobs

Canceling an automatic table statistics job is not useful since the system will automatically restart the job immediately. To permanently disable automatic table statistics jobs, disable the `sql.stats.automatic_collection.enabled` [cluster setting](cluster-settings.html):

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.stats.automatic_collection.enabled = false;
~~~

### Cancel jobs for a schedule

 To cancel jobs for a specific [backup schedule](create-schedule-for-backup.html), use the schedule's `id`:

{% include copy-clipboard.html %}
~~~ sql
> CANCEL JOBS FOR SCHEDULE 590204387299262465;
~~~
~~~
CANCEL JOBS FOR SCHEDULES 1
~~~

You can also CANCEL multiple schedules by nesting a [`SELECT` clause](select-clause.html) that retrieves `id`(s) inside the `CANCEL JOBS` statement:

{% include copy-clipboard.html %}
~~~ sql
> CANCEL JOBS FOR SCHEDULES SELECT id FROM [SHOW SCHEDULES] WHERE label = 'test_schedule';
~~~

~~~
CANCEL JOBS FOR SCHEDULES 2
~~~

## See also

- [`SHOW JOBS`](show-jobs.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`IMPORT`](import.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
