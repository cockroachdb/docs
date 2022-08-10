---
title: SHOW JOBS
summary: The SHOW JOBS statement lists all currently active schema changes and backup/restore jobs.
toc: true
docs_area: reference.sql
---

The `SHOW JOBS` [statement](sql-statements.html) lists all of the types of long-running tasks your cluster has performed in the last 12 hours, including:

{% include {{ page.version.version }}/sql/schema-changes.md %}
- [`IMPORT`](import.html).
- Enterprise [`BACKUP`](backup.html) and [`RESTORE`](restore.html).
- [Scheduled backups](manage-a-backup-schedule.html).
- [User-created table statistics](create-statistics.html) created for use by the [cost-based optimizer](cost-based-optimizer.html). To view [automatic table statistics](cost-based-optimizer.html#table-statistics), use [`SHOW AUTOMATIC JOBS`](#show-automatic-jobs).
-  `SHOW JOBS` now displays newly added columns from `crdb_internal.jobs` (`last_run`, `next_run`, `num_runs`, and `execution_errors`). The columns capture state related to retries, failures, and exponential backoff.

    These details can help you understand the status of crucial tasks that can impact the performance of your cluster, as well as help you control them.

 Details for [enterprise changefeeds](create-changefeed.html), including the [sink URI](create-changefeed.html#sink-uri) and full table name, are not displayed on running the `SHOW JOBS` statement. For details about [enterprise changefeeds](create-changefeed.html), including the [sink URI](create-changefeed.html#sink-uri) and the full table name, use [`SHOW CHANGEFEED JOBS`](#show-changefeed-jobs).

To block a call to `SHOW JOBS` that returns after all specified job ID(s) have a terminal state, use [`SHOW JOBS WHEN COMPLETE`](#show-job-when-complete). The statement will return a row per job ID, which provides details of the job execution. Note that while this statement is blocking, it will time out after 24 hours.

## Considerations

- The `SHOW JOBS` statement shows only long-running tasks.
- For jobs older than 12 hours, query the `crdb_internal.jobs` table.
- Jobs are deleted after 14 days. This interval can be changed via the `jobs.retention_time` [cluster setting](cluster-settings.html).
- While the `SHOW JOBS WHEN COMPLETE` statement is blocking, it will time out after 24 hours.
- Garbage collection jobs are created for [dropped tables](drop-table.html) and [dropped indexes](drop-index.html), and will execute after the [GC TTL](configure-replication-zones.html#replication-zone-variables) has elapsed (default is 25 hours). These jobs cannot be canceled.
-  CockroachDB automatically retries jobs that fail due to [retry errors](transaction-retry-error-reference.html) or job coordination failures, with [exponential backoff](https://en.wikipedia.org/wiki/Exponential_backoff). The `jobs.registry.retry.initial_delay` [cluster setting](cluster-settings.html) sets the initial delay between retries and `jobs.registry.retry.max_delay` sets the maximum delay.

## Required privileges

By default, only the `root` user can execute `SHOW JOBS`.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-{{ page.version.version | replace: "v", "" }}/grammar_svg/show_jobs.html %}
</div>

## Parameters

 Parameter | Description
-----------|-------------
`SHOW AUTOMATIC JOBS` | Show jobs performed for internal CockroachDB operations. See [Show automatic jobs](#show-automatic-jobs).
`SHOW JOBS WHEN COMPLETE` | Block `SHOW JOB` until the provided job ID reaches a terminal state. For an example, see [Show job when complete](#show-job-when-complete).
`select_stmt` | A [selection query](selection-queries.html) that specifies the `job_id`(s) to view.
`job_id` | The ID of the job to view.
`for_schedules_clause` |  The schedule you want to view jobs for. You can view jobs for a specific schedule (`FOR SCHEDULE id`) or view jobs for multiple schedules by nesting a [`SELECT` clause](select-clause.html) in the statement (`FOR SCHEDULES <select_clause>`). For an example, see [Show jobs for a schedule](#show-jobs-for-a-schedule).
`SHOW CHANGEFEED JOBS` |  Show details about [enterprise changefeeds](create-changefeed.html), including the [sink URI](create-changefeed.html#sink-uri) and the full table name. For an example, see [Show changefeed jobs](#show-changefeed-jobs).

## Response

The output of `SHOW JOBS` lists ongoing jobs first, then completed jobs within the last 12 hours. The list of ongoing jobs is sorted by starting time, whereas the list of completed jobs is sorted by finished time.

The following fields are returned for each job:

Field | Description
------|------------
`job_id` | A unique ID to identify each job. This value is used if you want to control jobs (i.e., [pause](pause-job.html), [resume](resume-job.html), or [cancel](cancel-job.html) it).
`job_type` | The type of job. Possible values: `SCHEMA CHANGE`, [`BACKUP`](backup.html), [`RESTORE`](restore.html), [`IMPORT`](import.html), and [`CREATE STATS`](create-statistics.html). <br><br> For job types for automatic jobs, see [Show automatic jobs](#show-automatic-jobs).
`description` | The statement that started the job, or a textual description of the job.
`statement` | When `description` is a textual description of the job, the statement that started the job is returned in this column. Currently, this field is populated only for the automatic table statistics jobs.
`user_name` | The name of the [user](security-reference/authorization.html#create-and-manage-users) who started the job.
`status` | The job's current state. Possible values: `pending`, `running`, `paused`, `failed`, `retrying`, `reverting`, `succeeded`, and `canceled`.
`running_status` | The job's detailed running status, which provides visibility into the progress of the dropping or truncating of tables (i.e., [`DROP TABLE`](drop-table.html), [`DROP DATABASE`](drop-database.html), or [`TRUNCATE`](truncate.html)). For dropping or truncating jobs, the detailed running status is determined by the status of the table at the earliest stage of the schema change. The job is completed when the GC TTL expires and both the table data and ID is deleted for each of the tables involved. Possible values: `draining names`, `waiting for GC TTL`, `RocksDB compaction`, or `NULL` (when the status cannot be determined). <br><br>For the `SHOW AUTOMATIC JOBS` statement, the value of this field is `NULL`.
`created` | The `TIMESTAMP` when the job was created.
`started` | The `TIMESTAMP` when the job began running first.
`finished` | The `TIMESTAMP` when the job was `succeeded`, `failed`, or `canceled`.
`modified` | The `TIMESTAMP` when the job had anything modified.
`fraction_completed` | The fraction (between `0.00` and `1.00`) of the job that's been completed.
`error` | If the job `failed`, the error generated by the failure.
`coordinator_id` | The ID of the node running the job.
`trace_id` |  The job's [trace ID](show-trace.html#trace-description), for inflight debugging.
`last_run` |  The `TIMESTAMP` of the last attempted execution.
`next_run` |  The `TIMESTAMP` of the next attempted execution.
`num_runs` |  The number of job execution attempts.
`execution_errors` |  A list of any execution errors that the job encountered.

For details of changefeed-specific responses, see [`SHOW CHANGEFEED JOBS`](#show-changefeed-jobs).

## Examples

### Show jobs

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW JOBS;
~~~

~~~
    job_id      | job_type  |               description                 |...
+---------------+-----------+-------------------------------------------+...
 27536791415282 |  RESTORE  | RESTORE db.* FROM 'azure://backup/db/tbl' |...
~~~

### Filter jobs

You can filter jobs by using `SHOW JOBS` as the data source for a [`SELECT`](select-clause.html) statement, and then filtering the values with the `WHERE` clause.

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x as (SHOW JOBS) SELECT * FROM x WHERE job_type = 'RESTORE' AND status IN ('running', 'failed') ORDER BY created DESC;
~~~

~~~
    job_id      | job_type  |              description                  |...
+---------------+-----------+-------------------------------------------+...
 27536791415282 |  RESTORE  | RESTORE db.* FROM 'azure://backup/db/tbl' |...

~~~

### Show automatic jobs

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW AUTOMATIC JOBS;
~~~

~~~
    job_id           |       job_type                  |                    description                       |...
+--------------------+---------------------------------+------------------------------------------------------+...
  786475982730133505 | AUTO SPAN CONFIG RECONCILIATION | reconciling span configurations                      |...
  786483120403382274 | AUTO SQL STATS COMPACTION       | automatic SQL Stats compaction                       |...
  786476180299579393 | AUTO CREATE STATS               | Table statistics refresh for movr.public.promo_codes |
...
(8 rows)
~~~

The job types of automatic jobs are:

- `AUTO SPAN CONFIG RECONCILIATION`: a continuously running job that ensures that all declared [zone configurations](configure-zone.html) (`ALTER … CONFIGURE ZONE …`) are applied. For example, when `num_replicas = 7` is set on a table, the reconciliation job listens in on those changes and then informs the underlying [storage layer](architecture/storage-layer.html) to maintain 7 replicas for the table.
- `AUTO SQL STATS COMPACTION`: an hourly job that truncates the internal `system.statement_statistics` and `system.transaction_statistics` table row count to the value in the `sql.stats.persisted_rows.max` [cluster setting](cluster-settings.html). Both tables contribute to the [`crdb_internal.statement_statistics`](crdb-internal.html#statement-statistics) and [`crdb_internal.transaction_statistics`](crdb-internal.html#transaction-statistics) tables respectively.
- `AUTO CREATE STATS`: creates and updates [table statistics](cost-based-optimizer.html#table-statistics).

### Filter automatic jobs

You can filter jobs by using `SHOW AUTOMATIC JOBS` as the data source for a [`SELECT`](select-clause.html) statement, and then filtering the values with the `WHERE` clause.

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW AUTOMATIC JOBS) SELECT * FROM x WHERE status = ('succeeded') ORDER BY created DESC;
~~~

~~~
        job_id       |         job_type          |                             description                             |                                         statement                                          | user_name |  status   | ...
  786483120403382274 | AUTO SQL STATS COMPACTION | automatic SQL Stats compaction                                      |                                                                                            | node      | succeeded | ...
  786476180299579393 | AUTO CREATE STATS         | Table statistics refresh for movr.public.promo_codes                | CREATE STATISTICS __auto__ FROM [110] WITH OPTIONS THROTTLING 0.9 AS OF SYSTEM TIME '-30s' | root      | succeeded | ...
...
(7 rows)
~~~

### Show changefeed jobs

You can display specific fields relating to changefeed jobs by running `SHOW CHANGEFEED JOBS`. These fields include:

* [`high_water_timestamp`](monitor-and-debug-changefeeds.html#monitor-a-changefeed): Guarantees all changes before or at this time have been emitted.
* [`sink_uri`](create-changefeed.html#sink-uri): The destination URI of the configured sink for a changefeed.
* `full_table_names`: The full [name resolution](sql-name-resolution.html) for a table. For example, `defaultdb.public.mytable` refers to the `defaultdb` database, the `public` schema, and the table `mytable` table.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CHANGEFEED JOBS;
~~~

~~~
    job_id             |                                                                                   description                                                                  | ...
+----------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------+ ...
  685724608744325121   | CREATE CHANGEFEED FOR TABLE mytable INTO 'kafka://localhost:9092' WITH confluent_schema_registry = 'http://localhost:8081', format = 'avro', resolved, updated | ...
  685723987509116929   | CREATE CHANGEFEED FOR TABLE mytable INTO 'kafka://localhost:9092' WITH confluent_schema_registry = 'http://localhost:8081', format = 'avro', resolved, updated | ...
(2 rows)
~~~

Changefeed jobs can be [paused](create-and-configure-changefeeds.html#pause), [resumed](create-and-configure-changefeeds.html#resume), [altered](alter-changefeed.html), or [canceled](create-and-configure-changefeeds.html#cancel).

### Filter changefeed jobs

You can filter jobs by using `SHOW CHANGEFEED JOBS` as the data source for a [`SELECT`](select-clause.html) statement, and then filtering the values with a `WHERE` clause. For example, you can filter by the `status` of changefeed jobs:

{% include_cached copy-clipboard.html %}
~~~ sql
WITH x AS (SHOW CHANGEFEED JOBS) SELECT * FROM x WHERE status = ('paused');
~~~

~~~
    job_id           |                                                              description         | ...
+--------------------+----------------------------------------------------------------------------------+ ...
  685723987509116929 | CREATE CHANGEFEED FOR TABLE mytable INTO 'kafka://localhost:9092' WITH confluent | ...
(1 row)
~~~

### Show schema changes

You can show just schema change jobs by using `SHOW JOBS` as the data source for a [`SELECT`](select-clause.html) statement, and then filtering the `job_type` value with the `WHERE` clause:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW JOBS) SELECT * FROM x WHERE job_type = 'SCHEMA CHANGE';
~~~

~~~
    job_id       | job_type        |              description                           |...
+----------------+-----------------+----------------------------------------------------+...
  27536791415282 |  SCHEMA CHANGE  | ALTER TABLE test.public.foo ADD COLUMN bar VARCHAR |...
~~~

 [Scheme change](online-schema-changes.html) jobs can be [paused](pause-job.html), [resumed](resume-job.html), and [canceled](cancel-job.html).

### Show job when complete

To block `SHOW JOB` until the provided job ID reaches a terminal state, use `SHOW JOB WHEN COMPLETE`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW JOB WHEN COMPLETE 27536791415282;
~~~
~~~
    job_id       | job_type  |               description                 |...
+----------------+-----------+-------------------------------------------+...
  27536791415282 |  RESTORE  | RESTORE db.* FROM 'azure://backup/db/tbl' |...
~~~

### Show jobs for a schedule

 To view jobs for a specific [backup schedule](create-schedule-for-backup.html), use the schedule's `id`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW JOBS FOR SCHEDULE 590204387299262465;
~~~
~~~
    job_id           | job_type |              description                                          |...
+--------------------+----------+-------------------------------------------------------------------+...
  590205481558802434 | BACKUP   | BACKUP INTO '/2020/09/15-161444.99' IN 's3://test/scheduled-backup| ...
(1 row)
~~~

You can also view multiple schedules by nesting a [`SELECT` clause](select-clause.html) that retrieves `id`(s) inside the `SHOW JOBS` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW JOBS FOR SCHEDULES WITH x AS (SHOW SCHEDULES) SELECT id FROM x WHERE label = 'test_schedule';
~~~

~~~
    job_id           | job_type  |              description                  |...
+--------------------+-----------+-------------------------------------------+...
  590204496007299074 | BACKUP    | BACKUP INTO '/2020/09/15-161444.99' IN'   |...
(2 rows)
~~~

## See also

- [`PAUSE JOB`](pause-job.html)
- [`RESUME JOB`](pause-job.html)
- [`CANCEL JOB`](cancel-job.html)
- [`ALTER TABLE`](alter-table.html)
- [`BACKUP`](backup.html)
- [`RESTORE`](restore.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
