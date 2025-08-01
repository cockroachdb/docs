---
title: PAUSE JOB
summary: The PAUSE JOB statement lets you temporarily halt the process of potentially long-running jobs.
toc: true
docs_area: reference.sql
---

The `PAUSE JOB` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lets you pause the following types of jobs:

- [`IMPORT`]({% link {{ page.version.version }}/import-into.md %}) jobs
- [`BACKUP`]({% link {{ page.version.version }}/backup.md %}) and [`RESTORE`]({% link {{ page.version.version }}/restore.md %}) jobs
- [User-created table statistics]({% link {{ page.version.version }}/create-statistics.md %}) jobs
- [Automatic table statistics]({% link {{ page.version.version }}/cost-based-optimizer.md %}#table-statistics) jobs
- [Changefeeds]({% link {{ page.version.version }}/create-changefeed.md %})
- [Schema change]({% link {{ page.version.version }}/online-schema-changes.md %}) jobs
- [Scheduled backup]({% link {{ page.version.version }}/manage-a-backup-schedule.md %}) jobs

After pausing jobs, you can resume them with [`RESUME JOB`]({% link {{ page.version.version }}/resume-job.md %}).

{{site.data.alerts.callout_info}}
If a schema change job is paused, any jobs waiting on that schema change will stop waiting and return an error.
{{site.data.alerts.end}}

## Required privileges

To pause a job, the user must be a member of the `admin` role or must have the [`CONTROLJOB`]({% link {{ page.version.version }}/create-user.md %}#create-a-user-that-can-pause-resume-and-cancel-non-admin-jobs) [role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-options) set. Non-admin users cannot pause admin users' jobs.

For changefeeds, users with the [`CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}#required-privileges) privilege on a set of tables can pause changefeed jobs running on those tables.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/pause_job.html %}
</div>

### Pause all jobs by type

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/pause_all_jobs.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`job_id` | The ID of the job you want to pause, which can be found with [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}).
`select_stmt` | A [selection query]({% link {{ page.version.version }}/selection-queries.md %}) that returns `job_id`(s) to pause.
`for_schedules_clause` |  The schedule you want to pause jobs for. You can pause jobs for a specific schedule (`FOR SCHEDULE id`) or pause jobs for multiple schedules by nesting a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) in the statement (`FOR SCHEDULES <select_clause>`). See the [examples](#pause-jobs-for-a-schedule) below.
`WITH REASON = ...` |  The reason to pause the job. CockroachDB stores the reason in the job's metadata, but there is no way to display it.
`BACKUP`, `CHANGEFEED`, `RESTORE`, `IMPORT` | The job type to pause.

## Monitoring paused jobs

We recommend monitoring paused jobs. Jobs that are paused for a long period of time can start to affect the cluster in the following ways:

- A paused [backup]({% link {{ page.version.version }}/backup.md %}), [restore]({% link {{ page.version.version }}/restore.md %}), or index backfill job ([schema change]({% link {{ page.version.version }}/online-schema-changes.md %})) will continue to hold a [protected timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) record on the data the job is operating on. This could result in data accumulation as the older versions of the keys cannot be [garbage collected]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection). In turn, this may cause increased disk usage and degraded performance for some workloads. See [Protected timestamps and scheduled backups]({% link {{ page.version.version }}/create-schedule-for-backup.md %}#protected-timestamps-and-scheduled-backups) for more detail.
- A paused [changefeed]({% link {{ page.version.version }}/create-changefeed.md %}) job, if [`protect_data_from_gc_on_pause`]({% link {{ page.version.version }}/create-changefeed.md %}#protect-data-from-gc-on-pause) is set, will also hold a protected timestamp record on the data the job is operating on. Depending on the value of [`gc_protect_expires_after`]({% link {{ page.version.version }}/create-changefeed.md %}#gc-protect-expires-after), this can lead to data accumulation. Once `gc_protect_expires_after` elapses, the protected timestamp record will be released and the changefeed job will be canceled. See [Garbage collection and changefeeds]({% link {{ page.version.version }}/protect-changefeed-data.md %}) for more detail.

To avoid these issues, use the `jobs.{job_type}.currently_paused` metric to track the number of jobs (for each job type) that are currently considered paused.

You can monitor protected timestamps relating to particular CockroachDB jobs with the following metrics:

- `jobs.{job_type}.protected_age_sec` tracks the oldest protected timestamp record protecting `{job_type}` jobs. As this metric increases, garbage accumulation increases. Garbage collection will not progress on a table, database, or cluster if the protected timestamp record is present.
- `jobs.{job_type}.protected_record_count` tracks the	number of protected timestamp records held by `{job_type}` jobs.

For a full list of the available job types, access your cluster's [Prometheus endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}).

See the following pages for details on metrics:

- [Monitor and Debug Changefeeds]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %})
- [Backup and Restore Monitoring]({% link {{ page.version.version }}/backup-and-restore-monitoring.md %})
- [Metrics]({% link {{ page.version.version }}/metrics.md %})

## Examples

### Pause a single job

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

### Pause multiple jobs

To pause multiple jobs, nest a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) that retrieves `job_id`(s) inside the `PAUSE JOBS` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> PAUSE JOBS (WITH x AS (SHOW JOBS) SELECT job_id FROM x
      WHERE user_name = 'maxroach');
~~~

All jobs created by `maxroach` will be paused.

### Pause by job type

To pause all jobs by the type of job, use the `PAUSE ALL {job} JOBS` statement. You can pause all `BACKUP`, `RESTORE`, `CHANGEFEED`, `IMPORT` jobs using this statement, for example:

{% include_cached copy-clipboard.html %}
~~~ sql
PAUSE ALL BACKUP JOBS;
~~~

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

To permanently disable automatic table statistics jobs, disable the `sql.stats.automatic_collection.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.stats.automatic_collection.enabled = false;
~~~

### Pause jobs for a schedule

 To pause jobs for a specific [backup schedule]({% link {{ page.version.version }}/create-schedule-for-backup.md %}), use the schedule's `id`:

{% include_cached copy-clipboard.html %}
~~~ sql
> PAUSE JOBS FOR SCHEDULE 590204387299262465;
~~~

~~~
PAUSE JOBS FOR SCHEDULES 1
~~~

You can also pause multiple schedules by nesting a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) that retrieves `id`(s) inside the `PAUSE JOBS` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> PAUSE JOBS FOR SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'test_schedule';
~~~

~~~
PAUSE JOBS FOR SCHEDULES 2
~~~

## See also

- [`RESUME JOB`]({% link {{ page.version.version }}/resume-job.md %})
- [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %})
- [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %})
- [`BACKUP`]({% link {{ page.version.version }}/backup.md %})
- [`RESTORE`]({% link {{ page.version.version }}/restore.md %})
- [`IMPORT INTO`]({% link {{ page.version.version }}/import-into.md %})
- [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %})
