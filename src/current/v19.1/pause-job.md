---
title: PAUSE JOB
summary: The PAUSE JOB statement lets you temporarily halt the process of potentially long-running jobs.
toc: true
---

The `PAUSE JOB` [statement](sql-statements.html) lets you pause [`IMPORT`](import.html) jobs, enterprise [`BACKUP`](backup.html) and [`RESTORE`](restore.html) jobs, [user-created table statistics](create-statistics.html) jobs, [automatic table statistics](cost-based-optimizer.html#table-statistics) jobs, and [`changefeeds`](change-data-capture.html).

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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
> PAUSE JOB 27536791415282;
~~~

### Pause multiple jobs

To pause multiple jobs, nest a [`SELECT` clause](select-clause.html) that retrieves `job_id`(s) inside the `PAUSE JOBS` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> PAUSE JOBS (SELECT job_id FROM [SHOW JOBS]
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
+--------------------+---------------------+-----------------------------------------------------+...
  438235476849557505 | AUTO CREATE STATS   | Table statistics refresh for defaultdb.public.users |...
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

## See also

- [`RESUME JOB`](resume-job.html)
- [`SHOW JOBS`](show-jobs.html)
- [`CANCEL JOB`](cancel-job.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`IMPORT`](import.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
