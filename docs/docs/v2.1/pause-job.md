---
title: PAUSE JOB
summary: The PAUSE JOB statement lets you temporarily halt the process of potentially long-running jobs.
toc: true
---

The `PAUSE JOB` [statement](sql-statements.html) lets you pause [`IMPORT`](import.html) jobs, enterprise [`BACKUP`](backup.html) and [`RESTORE`](restore.html) jobs, and, as of v2.1, [`changefeeds`](change-data-capture.html).

After pausing jobs, you can resume them with [`RESUME JOB`](resume-job.html).

{{site.data.alerts.callout_info}}You cannot pause schema changes.{{site.data.alerts.end}}


## Required privileges

By default, only the `root` user can control a job.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/pause_job.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`job_id` | The ID of the job you want to pause, which can be found with [`SHOW JOBS`](show-jobs.html).
`select_stmt` | A [selection query](selection-queries.html) that returns `job_id`(s) to pause.

## Examples

### Pause a single job

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

### Pause multiple jobs

<span class="version-tag">New in v2.1:</span> To pause multiple jobs, nest a [`SELECT` clause](select-clause.html) that retrieves `job_id`(s) inside the `PAUSE JOBS` statement:

{% include copy-clipboard.html %}
~~~ sql
> PAUSE JOBS (SELECT job_id FROM [SHOW JOBS]
      WHERE user_name = 'maxroach');
~~~

All jobs created by `maxroach` will be paused.

## See also

- [`RESUME JOB`](resume-job.html)
- [`SHOW JOBS`](show-jobs.html)
- [`CANCEL JOB`](cancel-job.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`IMPORT`](import.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
