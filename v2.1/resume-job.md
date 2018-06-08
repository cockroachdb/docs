---
title: RESUME JOB
summary: The RESUME JOB statement lets you resume jobs that were previously paused with PAUSE JOB.
toc: false
---

 The `RESUME JOB` [statement](sql-statements.html) lets you resume [paused](pause-job.html) [`BACKUP`](backup.html), [`RESTORE`](restore.html), and [`IMPORT`](import.html) jobs.

{{site.data.alerts.callout_info}}You cannot pause schema changes.{{site.data.alerts.end}}

<div id="toc"></div>

## Required privileges

By default, only the `root` user can control a job.

## Synopsis

<div>
  {% include sql/{{ page.version.version }}/diagrams/resume_job.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`job_id` | The ID of the job you want to resume, which can be found with [`SHOW JOBS`](show-jobs.html).

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
~~~ sql
> PAUSE JOB 27536791415282;
~~~

### Resume a restore job

{% include copy-clipboard.html %}
~~~ sql
> RESUME JOB 27536791415282;
~~~

## See also

- [`PAUSE JOB`](pause-job.html)
- [`SHOW JOBS`](show-jobs.html)
- [`CANCEL JOB`](cancel-job.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`IMPORT`](import.html)
