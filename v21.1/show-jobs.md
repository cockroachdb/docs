---
title: SHOW JOBS
summary: The SHOW JOBS statement lists all currently active schema changes and backup/restore jobs.
toc: true
---

The `SHOW JOBS` [statement](sql-statements.html) lists all of the types of long-running tasks your cluster has performed in the last 12 hours, including:

{% include {{ page.version.version }}/sql/schema-changes.md %}
- [`IMPORT`](import.html)
- Enterprise [`BACKUP`](backup.html) and [`RESTORE`](restore.html)
- [User-created table statistics](create-statistics.html) created for use by the [cost-based optimizer](cost-based-optimizer.html)
- The [automatic table statistics](cost-based-optimizer.html#table-statistics) are not displayed on running the `SHOW JOBS` statement. To view the automatic table statistics, use `SHOW AUTOMATIC JOBS`
-  [Scheduled backups](manage-a-backup-schedule.html)

These details can help you understand the status of crucial tasks that can impact the performance of your cluster, as well as help you control them.

To block a call to `SHOW JOBS` that returns after all specified job ID(s) have a terminal state, use `SHOW JOBS WHEN COMPLETE`. The statement will return a row per job ID, which provides details of the job execution. Note that while this statement is blocking, it will time out after 24 hours.

## Considerations

- The `SHOW JOBS` statement shows only long-running tasks.
- For jobs older than 12 hours, query the `crdb_internal.jobs` table.
- Jobs are deleted after 14 days. This interval can be changed via the `jobs.retention_time` [cluster setting](cluster-settings.html).
- While the `SHOW JOBS WHEN COMPLETE` statement is blocking, it will time out after 24 hours.
-  Garbage collection jobs are created for [dropped tables](drop-table.html) and [dropped indexes](drop-index.html), and will execute after the [GC TTL](configure-replication-zones.html#replication-zone-variables) has elapsed (default is 25 hours). These jobs cannot be canceled.

## Required privileges

By default, only the `root` user can execute `SHOW JOBS`.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/show_jobs.html %}
</div>

## Parameters

 Parameter | Description
-----------|-------------
`select_stmt` | A [selection query](selection-queries.html) that specifies the `job_id`(s) to view.
`job_id` | The ID of the job you want to view.
`for_schedules_clause` |  The schedule you want to view jobs for. You can view jobs for a specific schedule (`FOR SCHEDULE id`) or view jobs for multiple schedules by nesting a [`SELECT` clause](select-clause.html) in the statement (`FOR SCHEDULES <select_clause>`). See the [examples](#show-jobs-for-a-schedule) below.

## Response

The output of `SHOW JOBS` lists ongoing jobs first, then completed jobs within the last 12 hours. The list of ongoing jobs is sorted by starting time, whereas the list of completed jobs is sorted by finished time.

The following fields are returned for each job:

Field | Description
------|------------
`job_id` | A unique ID to identify each job. This value is used if you want to control jobs (i.e., [pause](pause-job.html), [resume](resume-job.html), or [cancel](cancel-job.html) it).
`job_type` | The type of job. Possible values: `SCHEMA CHANGE`, [`BACKUP`](backup.html), [`RESTORE`](restore.html), [`IMPORT`](import.html), and [`CREATE STATS`](create-statistics.html). <br><br> For `SHOW AUTOMATIC JOBS`, the possible value is [`AUTO CREATE STATS`](cost-based-optimizer.html#table-statistics).
`description` | The statement that started the job, or a textual description of the job.
`statement` | When `description` is a textual description of the job, the statement that started the job is returned in this column. Currently, this field is populated only for the automatic table statistics jobs.
`user_name` | The name of the [user](authorization.html#create-and-manage-users) who started the job.
`status` | The job's current state. Possible values: `pending`, `running`, `paused`, `failed`, `succeeded`, or `canceled`.
`running_status` | The job's detailed running status, which provides visibility into the progress of the dropping or truncating of tables (i.e., [`DROP TABLE`](drop-table.html), [`DROP DATABASE`](drop-database.html), or [`TRUNCATE`](truncate.html)). For dropping or truncating jobs, the detailed running status is determined by the status of the table at the earliest stage of the schema change. The job is completed when the GC TTL expires and both the table data and ID is deleted for each of the tables involved. Possible values: `draining names`, `waiting for GC TTL`, `RocksDB compaction`, or `NULL` (when the status cannot be determined). <br><br>For the `SHOW AUTOMATIC JOBS` statement, the value of this field is `NULL`.
`created` | The `TIMESTAMP` when the job was created.
`started` | The `TIMESTAMP` when the job began running first.
`finished` | The `TIMESTAMP` when the job was `succeeded`, `failed`, or `canceled`.
`modified` | The `TIMESTAMP` when the job had anything modified.
`fraction_completed` | The fraction (between `0.00` and `1.00`) of the job that's been completed.
`error` | If the job `failed`, the error generated by the failure.
`coordinator_id` | The ID of the node running the job.

## Examples

### Show jobs

{% include copy-clipboard.html %}
~~~ sql
> SHOW JOBS;
~~~

~~~
     job_id     | job_type  |               description                 |...
+---------------+-----------+-------------------------------------------+...
 27536791415282 |  RESTORE  | RESTORE db.* FROM 'azure://backup/db/tbl' |...
~~~

### Filter jobs

You can filter jobs by using `SHOW JOBS` as the data source for a [`SELECT`](select-clause.html) statement, and then filtering the values with the `WHERE` clause.

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW JOBS] WHERE job_type = 'RESTORE' AND status IN ('running', 'failed') ORDER BY created DESC;
~~~

~~~
     job_id     | job_type  |              description                  |...
+---------------+-----------+-------------------------------------------+...
 27536791415282 |  RESTORE  | RESTORE db.* FROM 'azure://backup/db/tbl' |...

~~~

### Show automatic jobs

{% include copy-clipboard.html %}
~~~ sql
> SHOW AUTOMATIC JOBS;
~~~

~~~
        job_id       |       job_type      |                    description                      |...
+--------------------+---------------------+-----------------------------------------------------+...
  438235476849557505 | AUTO CREATE STATS   | Table statistics refresh for defaultdb.public.users |...
(1 row)
~~~

### Filter automatic jobs

You can filter jobs by using `SHOW AUTOMATIC JOBS` as the data source for a [`SELECT`](select-clause.html) statement, and then filtering the values with the `WHERE` clause.

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW AUTOMATIC JOBS] WHERE status = ('succeeded') ORDER BY created DESC;
~~~

~~~
        job_id       |       job_type      |                    description                      | ...
+--------------------+---------------------+-----------------------------------------------------+ ...
  438235476849557505 | AUTO CREATE STATS   | Table statistics refresh for defaultdb.public.users | ...
(1 row)
~~~

### Show schema changes

You can show just schema change jobs by using `SHOW JOBS` as the data source for a [`SELECT`](select-clause.html) statement, and then filtering the `job_type` value with the `WHERE` clause:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM [SHOW JOBS] WHERE job_type = 'SCHEMA CHANGE';
~~~

~~~
     job_id     | job_type        |              description                           |...
+---------------+-----------------+----------------------------------------------------+...
 27536791415282 |  SCHEMA CHANGE  | ALTER TABLE test.public.foo ADD COLUMN bar VARCHAR |...
~~~

 [Scheme change](online-schema-changes.html) jobs can be [paused](pause-job.html), [resumed](resume-job.html), and [canceled](cancel-job.html).

### Show job when complete

To block `SHOW JOB` until the provided job ID reaches a terminal state, use `SHOW JOB WHEN COMPLETE`:

{% include copy-clipboard.html %}
~~~ sql
> SHOW JOB WHEN COMPLETE 27536791415282;
~~~
~~~
     job_id     | job_type  |               description                 |...
+---------------+-----------+-------------------------------------------+...
 27536791415282 |  RESTORE  | RESTORE db.* FROM 'azure://backup/db/tbl' |...
~~~

### Show jobs for a schedule

 To view jobs for a specific [backup schedule](create-schedule-for-backup.html), use the schedule's `id`:

{% include copy-clipboard.html %}
~~~ sql
> SHOW JOBS FOR SCHEDULE 590204387299262465;
~~~
~~~
        job_id       | job_type |                                                                                                             description                                                                                   | statement | user_name | status  | running_status |             created              | started | finished |             modified             | fraction_completed | error | coordinator_id
---------------------+----------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------+-----------+---------+----------------+----------------------------------+---------+----------+----------------------------------+--------------------+-------+-----------------
  590205481558802434 | BACKUP   | BACKUP INTO '/2020/09/15-161444.99' IN 's3://test/scheduled-backup-0915?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' AS OF SYSTEM TIME '2020-09-15 16:20:00+00:00' WITH revision_history, detached |           | root      | running | NULL           | 2020-09-15 16:20:18.347383+00:00 | NULL    | NULL     | 2020-09-15 16:20:18.347383+00:00 |                  0 |       |              0
(1 row)
~~~

You can also view multiple schedules by nesting a [`SELECT` clause](select-clause.html) that retrieves `id`(s) inside the `SHOW JOBS` statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW JOBS FOR SCHEDULES SELECT id FROM [SHOW SCHEDULES] WHERE label = 'test_schedule';
~~~

~~~
        job_id       | job_type |                                                                                                                 description                                                                                      | statement | user_name |  status   | running_status |             created              | started |             finished             |             modified             | fraction_completed | error | coordinator_id
---------------------+----------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------+-----------+-----------+----------------+----------------------------------+---------+----------------------------------+----------------------------------+--------------------+-------+-----------------
  590204496007299074 | BACKUP   | BACKUP INTO '/2020/09/15-161444.99' IN 's3://test/scheduled-backup-0915?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' AS OF SYSTEM TIME '2020-09-15 16:14:44.991631+00:00' WITH revision_history, detached |           | root      | succeeded | NULL           | 2020-09-15 16:15:17.720725+00:00 | NULL    | 2020-09-15 16:15:20.913789+00:00 | 2020-09-15 16:15:20.910594+00:00 |                  1 |       |              0
  590205481558802434 | BACKUP   | BACKUP INTO '/2020/09/15-161444.99' IN 's3://test/scheduled-backup-0915?AWS_ACCESS_KEY_ID=x&AWS_SECRET_ACCESS_KEY=redacted' AS OF SYSTEM TIME '2020-09-15 16:20:00+00:00' WITH revision_history, detached        |           | root      | succeeded | NULL           | 2020-09-15 16:20:18.347383+00:00 | NULL    | 2020-09-15 16:20:48.37873+00:00  | 2020-09-15 16:20:48.374256+00:00 |                  1 |       |              0
(2 rows)
~~~

## See also

- [`PAUSE JOB`](pause-job.html)
- [`RESUME JOB`](pause-job.html)
- [`CANCEL JOB`](cancel-job.html)
- [`ALTER TABLE`](alter-table.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
