---
title: CANCEL JOB
summary: The CANCEL JOB statement stops long-running jobs.
toc: true
---

The `CANCEL JOB` [statement](sql-statements.html) lets you stop long-running jobs, which include [`IMPORT`](import.html) jobs, enterprise [`BACKUP`](backup.html) and [`RESTORE`](restore.html) jobs, and as of v2.1, schema changes.


## Limitations

When an enterprise [`RESTORE`](restore.html) is canceled, partially restored data is properly cleaned up. This can have a minor, temporary impact on cluster performance.

## Required privileges

By default, only the `root` user can cancel a job.

## Synopsis

{% include {{ page.version.version }}/sql/diagrams/cancel_job.html %}

## Parameters

Parameter | Description
----------|------------
`job_id` | The ID of the job you want to cancel, which can be found with [`SHOW JOBS`](show-jobs.html).

## Examples

### Cancel a restore

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
~~~ sql?nofmt
> CANCEL JOB 27536791415282;
~~~

## See also

- [`SHOW JOBS`](show-jobs.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`IMPORT`](import.html)
