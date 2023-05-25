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

To pause a job, the user must be a member of the `admin` role or must have the [`CONTROLJOB`](create-user.html#create-a-user-that-can-pause-resume-and-cancel-non-admin-jobs) [role option](security-reference/authorization.html#role-options) set. Non-admin users cannot pause admin users' jobs.

For changefeeds, users with the [`CHANGEFEED`](create-changefeed.html#required-privileges) privilege on a set of tables can pause changefeed jobs running on those tables.

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

## Monitoring paused jobs

We recommend monitoring paused jobs. Jobs that are paused for a long period of time can start to affect the cluster in the following ways:

- A paused [backup](backup.html), [restore](restore.html), or index backfill job ([schema change](online-schema-changes.html)) will continue to hold a [protected timestamp](architecture/storage-layer.html#protected-timestamps) record on the data the job is operating on. This could result in data accumulation as the older versions of the keys cannot be [garbage collected](architecture/storage-layer.html#garbage-collection). In turn, this may cause increased disk usage and degraded performance for some workloads. See [Protected timestamps and scheduled backups](create-schedule-for-backup.html#protected-timestamps-and-scheduled-backups) for more detail.
- A paused [changefeed](create-changefeed.html) job, if [`protect_data_from_gc_on_pause`](create-changefeed.html#protect-pause) is set, will also hold a protected timestamp record on the data the job is operating on. Depending on the value of [`gc_protect_expires_after`](create-changefeed.html#gc-protect-expire), this can lead to data accumulation. Once `gc_protect_expires_after` elapses, the protected timestamp record will be released and the changefeed job will be canceled. See [Garbage collection and changefeeds](changefeed-messages.html#garbage-collection-and-changefeeds) for more detail.

{% include_cached new-in.html version="v23.1" %} To avoid these issues, use the `jobs.{job_type}.currently_paused` metric to track the number of jobs (for each job type) that are currently considered paused.

You can monitor protected timestamps relating to particular CockroachDB jobs with the following metrics:

- `jobs.{job_type}.protected_age_sec` tracks the oldest protected timestamp record protecting `{job_type}` jobs. As this metric increases, garbage accumulation increases. Garbage collection will not progress on a table, database, or cluster if the protected timestamp record is present.
- `jobs.{job_type}.protected_record_count` tracks the	number of protected timestamp records held by `{job_type}` jobs.

For a full list of the available job types, access your cluster's [`/_status/vars`](monitoring-and-alerting.html#prometheus-endpoint) endpoint.

See the following pages for details on metrics:

- [Monitor and Debug Changefeeds](monitor-and-debug-changefeeds.html)
- [Backup and Restore Monitoring](backup-and-restore-monitoring.html)
- [Metrics](metrics.html)

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
