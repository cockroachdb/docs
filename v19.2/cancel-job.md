---
title: CANCEL JOB
summary: The CANCEL JOB statement stops long-running jobs such as imports, backups, and schema changes.
toc: true
---

The `CANCEL JOB` [statement](sql-statements.html) lets you stop long-running jobs, which include [`IMPORT`](import.html) jobs, enterprise [`BACKUP`](backup.html) and [`RESTORE`](restore.html) jobs, schema changes, [user-created table statistics](create-statistics.html) jobs, [automatic table statistics](cost-based-optimizer.html#table-statistics) jobs, and [changefeeds](change-data-capture.html).


## Limitations

When an enterprise [`RESTORE`](restore.html) is canceled, partially restored data is properly cleaned up. This can have a minor, temporary impact on cluster performance.

## Required privileges

Only members of the `admin` role can cancel a job. By default, the `root` user belongs to the `admin` role.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/cancel_job.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`job_id` | The ID of the job you want to cancel, which can be found with [`SHOW JOBS`](show-jobs.html).
`select_stmt` | A [selection query](selection-queries.html) that returns `job_id`(s) to cancel.

## Examples

### Cancel a single job

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

### Cancel multiple jobs

To cancel multiple jobs, nest a [`SELECT` clause](select-clause.html) that retrieves `job_id`(s) inside the `CANCEL JOBS` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> CANCEL JOBS (SELECT job_id FROM [SHOW JOBS]
      WHERE user_name = 'maxroach');
~~~

All jobs created by `maxroach` will be cancelled.

### Cancel automatic table statistics jobs

Canceling an automatic table statistics job is not useful since the system will automatically restart the job immediately. To permanently disable automatic table statistics jobs, disable the `sql.stats.automatic_collection.enabled` [cluster setting](cluster-settings.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.stats.automatic_collection.enabled = false;
~~~

## See also

- [`SHOW JOBS`](show-jobs.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`IMPORT`](import.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
