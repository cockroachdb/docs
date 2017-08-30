---
title: PAUSE JOB
summary: The PAUSE JOB statement lets you temporarily halt the process of potentially long-running jobs, such as schema changes and enterprise backups.
toc: false
---

<span class="version-tag">New in v1.1:</span> The `PAUSE JOB` [statement](sql-statements.html) lets you pause enterprise [`BACKUP`](backup.html) and [`RESTORE`](restore.html) jobs.

{{site.data.alerts.callout_info}}As of v1.1, you cannot pause schema changes or enterprise <code>IMPORT</code> jobs.{{site.data.alerts.end}}

<div id="toc"></div>

## Required Privileges

By default, only the `root` user can control a job.

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/pause_job.html %}

## Parameters

Parameter | Description
----------|------------
`job_id` | The ID of the job you want to cancel, which can be found with [`SHOW JOBS`](show-jobs.html).

## Examples

### Pause a Restore

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

