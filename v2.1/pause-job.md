---
title: PAUSE JOB
summary: The PAUSE JOB statement lets you temporarily halt the process of potentially long-running jobs.
toc: true
---

The `PAUSE JOB` [statement](sql-statements.html) lets you pause [`BACKUP`](backup.html), [`RESTORE`](restore.html), and [`IMPORT`](import.html) jobs.

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

## Examples

### Pause a restore job

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
~~~ sql?nofmt
> PAUSE JOB 27536791415282;
~~~

## See also

- [`RESUME JOB`](resume-job.html)
- [`SHOW JOBS`](show-jobs.html)
- [`CANCEL JOB`](cancel-job.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`IMPORT`](import.html)
