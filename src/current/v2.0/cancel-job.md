---
title: CANCEL JOB
summary: The CANCEL JOB statement stops long-running jobs such as imports, backups, and schema changes.
toc: true
---

<span class="version-tag">New in v1.1:</span> The `CANCEL JOB` [statement](sql-statements.html) lets you stop long-running jobs, which include [`IMPORT`](import.html) jobs and enterprise [`BACKUP`](backup.html) and [`RESTORE`](restore.html) tasks.


## Limitations

When an enterprise [`RESTORE`](restore.html) is canceled, partially restored data is properly cleaned up. This can have a minor, temporary impact on cluster performance.

## Required Privileges

By default, only the `root` user can cancel a job.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/cancel_job.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`job_id` | The ID of the job you want to cancel, which can be found with [`SHOW JOBS`](show-jobs.html).

## Examples

### Cancel a Restore

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

## See Also

- [`SHOW JOBS`](show-jobs.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`IMPORT`](import.html)