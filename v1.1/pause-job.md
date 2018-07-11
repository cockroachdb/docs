---
title: PAUSE JOB
summary: The PAUSE JOB statement lets you temporarily halt the process of potentially long-running jobs, such as schema changes and enterprise backups.
toc: true
---

<span class="version-tag">New in v1.1:</span> The `PAUSE JOB` [statement](sql-statements.html) lets you pause enterprise [`BACKUP`](backup.html) and [`RESTORE`](restore.html) jobs.

After pausing jobs, you can resume them with [`RESUME JOB`](resume-job.html).

{{site.data.alerts.callout_info}}As of v1.1, you cannot pause schema changes or enterprise <code>IMPORT</code> jobs.{{site.data.alerts.end}}


## Required Privileges

By default, only the `root` user can control a job.

## Synopsis

{% include {{ page.version.version }}/sql/diagrams/pause_job.html %}

## Parameters

Parameter | Description
----------|------------
`job_id` | The ID of the job you want to pause, which can be found with [`SHOW JOBS`](show-jobs.html).

## Examples

### Pause a Restore Job

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
> PAUSE JOB 27536791415282;
~~~

## See Also

- [`RESUME JOB`](resume-job.html)
- [`SHOW JOBS`](show-jobs.html)
- [`CANCEL JOB`](cancel-job.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)