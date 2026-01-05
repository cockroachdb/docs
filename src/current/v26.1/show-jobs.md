---
title: SHOW JOBS
summary: The SHOW JOBS statement lists all currently active schema changes and backup/restore jobs.
toc: true
docs_area: reference.sql
---

The `SHOW JOBS` [statement]({% link {{ page.version.version }}/sql-statements.md %}) lists all of the types of long-running tasks your cluster has performed in the last 12 hours, including:

{% include {{ page.version.version }}/sql/schema-changes.md %}
- [`IMPORT`]({% link {{ page.version.version }}/import-into.md %}).
- Enterprise [`BACKUP`]({% link {{ page.version.version }}/backup.md %}) and [`RESTORE`]({% link {{ page.version.version }}/restore.md %}).
- [Scheduled backups]({% link {{ page.version.version }}/manage-a-backup-schedule.md %}).
- [User-created table statistics]({% link {{ page.version.version }}/create-statistics.md %}) created for use by the [cost-based optimizer]({% link {{ page.version.version }}/cost-based-optimizer.md %}). To view [automatic table statistics]({% link {{ page.version.version }}/cost-based-optimizer.md %}#table-statistics), use [`SHOW AUTOMATIC JOBS`](#show-automatic-jobs).

Details for [enterprise changefeeds]({% link {{ page.version.version }}/create-changefeed.md %}), including the [sink URI]({% link {{ page.version.version }}/create-changefeed.md %}#sink-uri) and full table name, are not displayed on running the `SHOW JOBS` statement. For details about [enterprise changefeeds]({% link {{ page.version.version }}/create-changefeed.md %}), including the [sink URI]({% link {{ page.version.version }}/create-changefeed.md %}#sink-uri) and the full table name, use [`SHOW CHANGEFEED JOBS`](#show-changefeed-jobs).

To block a call to `SHOW JOBS` that returns after all specified job ID(s) have a terminal state, use [`SHOW JOBS WHEN COMPLETE`](#show-job-when-complete). The statement will return a row per job ID, which provides details of the job execution. Note that while this statement is blocking, it will time out after 24 hours.

## Considerations

- The `SHOW JOBS` statement shows only long-running tasks.
- While the `SHOW JOBS WHEN COMPLETE` statement is blocking, it will time out after 24 hours.
- Garbage collection jobs are created for [dropped tables]({% link {{ page.version.version }}/drop-table.md %}) and [dropped indexes]({% link {{ page.version.version }}/drop-index.md %}), and will execute after the [GC TTL]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds) has elapsed. These jobs cannot be canceled.
-  CockroachDB automatically retries jobs that fail due to [retry errors]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}) or job coordination failures, with [exponential backoff](https://wikipedia.org/wiki/Exponential_backoff). The `jobs.registry.retry.initial_delay` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) sets the initial delay between retries and `jobs.registry.retry.max_delay` sets the maximum delay.

## Required privileges

You must have at least one of the following to run `SHOW JOBS`:

- The `VIEWJOB` privilege, which can view all jobs (including `admin`-owned jobs).
- Be a member of the `admin` role.
- The [`CONTROLJOB` role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-options).
- For changefeeds, users with the [`CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}#required-privileges) privilege on a set of tables can view changefeed jobs running on those tables.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_jobs.html %}
</div>

## Parameters

 Parameter | Description
-----------|-------------
`SHOW AUTOMATIC JOBS` | Show jobs performed for internal CockroachDB operations. See [Show automatic jobs](#show-automatic-jobs).
`SHOW JOBS WHEN COMPLETE` | Block `SHOW JOB` until the provided job ID reaches a terminal state. For an example, see [Show job when complete](#show-job-when-complete).
`select_stmt` | A [selection query]({% link {{ page.version.version }}/selection-queries.md %}) that specifies the `job_id`(s) to view.
`job_id` | The ID of the job to view.
`for_schedules_clause` |  The schedule you want to view jobs for. You can view jobs for a specific schedule (`FOR SCHEDULE id`) or view jobs for multiple schedules by nesting a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) in the statement (`FOR SCHEDULES <select_clause>`). For an example, see [Show jobs for a schedule](#show-jobs-for-a-schedule).
`SHOW CHANGEFEED JOBS` |  Show details about [enterprise changefeeds]({% link {{ page.version.version }}/create-changefeed.md %}), including the [sink URI]({% link {{ page.version.version }}/create-changefeed.md %}#sink-uri) and the full table name. For an example, see [Show changefeed jobs](#show-changefeed-jobs).

## Response

The output of `SHOW JOBS` lists ongoing jobs first, then completed jobs within the last 12 hours. The list of ongoing jobs is sorted by starting time, whereas the list of completed jobs is sorted by finished time.

To view details for jobs older than 12 hours, you can query the [`crdb_internal.jobs`]({% link {{ page.version.version }}/crdb-internal.md %}) table. The `jobs.retention_time` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}#setting-jobs-retention-time) defines how long jobs will be retained in the `crdb_internal.jobs` table. When CockroachDB checks the jobs table, it will [garbage collect]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection) jobs details for any completed job that has reached the configured retention time. The default value of `jobs.retention_time` is 14 days.

The following fields are returned for each job:

Field | Description
------|------------
`job_id` | A unique ID to identify each job. This value is used if you want to control jobs (i.e., [pause]({% link {{ page.version.version }}/pause-job.md %}), [resume]({% link {{ page.version.version }}/resume-job.md %}), or [cancel]({% link {{ page.version.version }}/cancel-job.md %}) it).
`job_type` | The type of job: [`SCHEMA CHANGE`]({% link {{ page.version.version }}/online-schema-changes.md %}), [`NEW SCHEMA CHANGE`]({% link {{ page.version.version }}/online-schema-changes.md %}), [`KEY VISUALIZER`]({% link {{ page.version.version }}/ui-key-visualizer.md %}), [`MIGRATION`]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}#overview), [`BACKUP`]({% link {{ page.version.version }}/backup.md %}), [`RESTORE`]({% link {{ page.version.version }}/restore.md %}), [`IMPORT`]({% link {{ page.version.version }}/import-into.md %}), [`CHANGEFEED`](#show-changefeed-jobs), [`CREATE STATS`]({% link {{ page.version.version }}/create-statistics.md %}), [`INSPECT`]({% link {{ page.version.version }}/inspect.md %}), [`ROW LEVEL TTL`]({% link {{ page.version.version }}/row-level-ttl.md %}), [`REPLICATION STREAM INGESTION`]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}), `REPLICATION STREAM PRODUCER`([physical cluster replication]({% link {{ page.version.version }}/physical-cluster-replication-monitoring.md %}) or [logical data replication]({% link {{ page.version.version }}/logical-data-replication-monitoring.md %})), [`LOGICAL REPLICATION`]({% link {{ page.version.version }}/logical-data-replication-monitoring.md %}). <br><br>For `INSPECT` jobs, you can use the `job_id` value with [`SHOW INSPECT ERRORS FOR JOB {job_id}`]({% link {{ page.version.version }}/show-inspect-errors.md %}). <br><br>For job types of automatic jobs, see [Show automatic jobs](#show-automatic-jobs).
`description` | The statement that started the job, or a textual description of the job. When you run `SHOW JOBS`, the `description` field is limited to 100 characters. To view the full description for a job, run `SHOW JOB {job ID}`.
`statement` | When `description` is a textual description of the job, the statement that started the job is returned in this column. Currently, this field is populated only for the automatic table statistics jobs.
`user_name` | The name of the [user]({% link {{ page.version.version }}/security-reference/authorization.md %}#create-and-manage-users) who started the job.
`status` | The job's current state. Possible values: `pending`, `paused`, `pause-requested`, `failed`, `succeeded`, `canceled`, `cancel-requested`, `running`, `retry-running`, `retry-reverting`, `reverting`, `revert-failed`.<br><br>Refer to [Jobs status](#job-status) for a description of each status.
`running_status` | The job's detailed running status, which provides visibility into the progress of the dropping or truncating of tables (i.e., [`DROP TABLE`]({% link {{ page.version.version }}/drop-table.md %}), [`DROP DATABASE`]({% link {{ page.version.version }}/drop-database.md %}), or [`TRUNCATE`]({% link {{ page.version.version }}/truncate.md %})). For dropping or truncating jobs, the detailed running status is determined by the status of the table at the earliest stage of the schema change. The job is completed when the GC TTL expires and both the table data and ID is deleted for each of the tables involved. Possible values: `waiting for MVCC GC`, `deleting data`, `waiting for GC TTL`, `waiting in DELETE-ONLY`, `waiting in DELETE-AND-WRITE_ONLY`, `waiting in MERGING`, `populating schema`, `validating schema`, or `NULL` (when the status cannot be determined). <br><br>For the `SHOW AUTOMATIC JOBS` statement, the value of this field is `NULL`.
`created` | The [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}) when the job was created.
`started` | The [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}) when the job first began running .
`finished` | The [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}) when the job was `succeeded`, `failed`, or `canceled`.
`modified` | The [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}) when the [job record](backup-architecture.html#job-creation-phase) was last updated with the job's progress, or when the job was paused or resumed.
`fraction_completed` | The fraction (between `0.00` and `1.00`) of the job that's been completed.
`error` | If the job `failed` with a terminal error, this column will contain the error generated by the failure.
`coordinator_id` | The ID of the node running the job.
`trace_id` |  The job's internal [trace ID]({% link {{ page.version.version }}/show-trace.md %}#trace-description) for inflight debugging. **Note**: This ID can only be used by the Cockroach Labs support team for internal observability.
`execution_errors` |  A list of any retryable errors that a job may have encountered during its lifetime.

For details of changefeed-specific responses, see [`SHOW CHANGEFEED JOBS`](#show-changefeed-jobs).

### Job status

Status | Description
-------|------------
`pending` | Job is created but has not started running.
`paused` | Job is [paused]({% link {{ page.version.version }}/pause-job.md %}).
`pause-requested` | A request has been issued to pause the job. The status will move to `paused` when the node running the job registers the request.
`failed` | Job failed to complete.
`succeeded` | Job successfully completed.
`canceled` | Job was [canceled]({% link {{ page.version.version }}/{{ link_prefix }}cancel-job.md %}).
`cancel-requested` | A request has been issued to cancel the job. The status will move to `canceled` when the node running the job registers the request.
`running`  | Job is running. A job that is running will be displayed with its percent completion and time remaining, rather than the `RUNNING` status.
`retry-running` | Job is retrying another job that failed.
`retry-reverting` | The retry failed or was canceled and its changes are being reverted.
`reverting`| Job failed or was canceled and its changes are being reverted.
`revert-failed` | Job encountered a non-retryable error when reverting the changes. It is necessary to manually clean up a job with this status.

{{site.data.alerts.callout_info}}
We recommend monitoring paused jobs to protect historical data from [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection), or potential data accumulation in the case of [changefeeds]({% link {{ page.version.version }}/protect-changefeed-data.md %}). See [Monitoring paused jobs]({% link {{ page.version.version }}/pause-job.md %}#monitoring-paused-jobs) for detail on metrics to track paused jobs and [protected timestamps]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps).
{{site.data.alerts.end}}

## Examples

### Show jobs

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW JOBS;
~~~

~~~
    job_id      | job_type  |               description                      |...
+---------------+-----------+------------------------------------------------+...
 27536791415282 |  RESTORE  | RESTORE db.* FROM 'azure-blob://backup/db/tbl' |...
~~~

### Filter jobs

You can filter jobs by using `SHOW JOBS` as the data source for a [`SELECT`]({% link {{ page.version.version }}/select-clause.md %}) statement, and then filtering the values with the `WHERE` clause.

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x as (SHOW JOBS) SELECT * FROM x WHERE job_type = 'RESTORE' AND status IN ('running', 'failed') ORDER BY created DESC;
~~~

~~~
    job_id      | job_type  |              description                       |...
+---------------+-----------+------------------------------------------------+...
 27536791415282 |  RESTORE  | RESTORE db.* FROM 'azure-blob://backup/db/tbl' |...

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
  786476180299579393 | AUTO CREATE STATS               | Table statistics refresh for movr.public.promo_codes |...
...
(8 rows)
~~~

The job types of automatic jobs are:

- `AUTO SPAN CONFIG RECONCILIATION`: A continuously running job that ensures that all declared [zone configurations]({% link {{ page.version.version }}/configure-replication-zones.md %}) (`ALTER … CONFIGURE ZONE …`) are applied. For example, when `num_replicas = 7` is set on a table, the reconciliation job listens in on those changes and then informs the underlying [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}) to maintain 7 replicas for the table.
- `AUTO SQL STATS COMPACTION`: An hourly job that truncates the internal `system.statement_statistics` and `system.transaction_statistics` table row counts to the value of the `sql.stats.persisted_rows.max` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}). Both tables contribute to the [`crdb_internal.statement_statistics`]({% link {{ page.version.version }}/crdb-internal.md %}#statement_statistics) and [`crdb_internal.transaction_statistics`]({% link {{ page.version.version }}/crdb-internal.md %}#transaction_statistics) tables, respectively.
- `AUTO CREATE STATS`: Creates and updates [table statistics]({% link {{ page.version.version }}/cost-based-optimizer.md %}#table-statistics).

### Filter automatic jobs

You can filter jobs by using `SHOW AUTOMATIC JOBS` as the data source for a [`SELECT`]({% link {{ page.version.version }}/select-clause.md %}) statement, and then filtering the values with the `WHERE` clause.

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

You can display specific fields relating to [changefeed]({% link {{ page.version.version }}/create-changefeed.md %}) jobs by running `SHOW CHANGEFEED JOBS`. These fields include:

- [`high_water_timestamp`]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#monitor-a-changefeed): Guarantees all changes before or at this time have been emitted.
- `readable_high_water_timestamptz`: The `high_water_timestamp` value in [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}) format for readability.
- [`sink_uri`]({% link {{ page.version.version }}/create-changefeed.md %}#sink-uri): The destination URI of the configured sink for a changefeed.
- `full_table_names`: The full [name resolution]({% link {{ page.version.version }}/sql-name-resolution.md %}) for a table. For example, `defaultdb.public.mytable` refers to the `defaultdb` database, the `public` schema, and the table `mytable`.
- `topics`: The topic name to which [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) and [Google Cloud Pub/Sub]({% link {{ page.version.version }}/changefeed-sinks.md %}#google-cloud-pub-sub) changefeed messages will emit. If you start a changefeed with the [`split_column_families`]({% link {{ page.version.version }}/create-changefeed.md %}#split-column-families) option targeting a table with [multiple column families]({% link {{ page.version.version }}/changefeeds-on-tables-with-column-families.md %}), the `SHOW CHANGEFEED JOBS` output will show the topic name with a family placeholder. For example, `topic.{family}`.
- [`format`]({% link {{ page.version.version }}/create-changefeed.md %}#format): The format of the changefeed messages, e.g., `json`, `avro`.

{% include {{ page.version.version }}/cdc/show-changefeed-job-retention.md %}

{% include {{ page.version.version }}/cdc/show-changefeed-job.md %}

Changefeed jobs can be [paused]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#pause), [resumed]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#resume), [altered]({% link {{ page.version.version }}/alter-changefeed.md %}), or [canceled]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#cancel).

### Filter changefeed jobs

You can filter jobs by using `SHOW CHANGEFEED JOBS` as the data source for a [`SELECT`]({% link {{ page.version.version }}/select-clause.md %}) statement, and then filtering the values with a `WHERE` clause. For example, you can filter by the `status` of changefeed jobs:

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

{% include {{ page.version.version }}/cdc/filter-show-changefeed-jobs-columns.md %}

### Show schema changes

You can show just schema change jobs by using `SHOW JOBS` as the data source for a [`SELECT`]({% link {{ page.version.version }}/select-clause.md %}) statement, and then filtering the `job_type` value with the `WHERE` clause:

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW JOBS) SELECT * FROM x WHERE job_type = 'SCHEMA CHANGE';
~~~

~~~
    job_id       | job_type        |              description                           |...
+----------------+-----------------+----------------------------------------------------+...
  27536791415282 |  SCHEMA CHANGE  | ALTER TABLE test.public.foo ADD COLUMN bar VARCHAR |...
~~~

 [Scheme change]({% link {{ page.version.version }}/online-schema-changes.md %}) jobs can be [paused]({% link {{ page.version.version }}/pause-job.md %}), [resumed]({% link {{ page.version.version }}/resume-job.md %}), and [canceled]({% link {{ page.version.version }}/cancel-job.md %}).

### Show job when complete

To block `SHOW JOB` until the provided job ID reaches a terminal state, use `SHOW JOB WHEN COMPLETE`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW JOB WHEN COMPLETE 27536791415282;
~~~
~~~
    job_id       | job_type  |               description                      |...
+----------------+-----------+------------------------------------------------+...
  27536791415282 |  RESTORE  | RESTORE db.* FROM 'azure-blob://backup/db/tbl' |...
~~~

### Show jobs for a schedule

 To view jobs for a specific [backup schedule]({% link {{ page.version.version }}/create-schedule-for-backup.md %}), use the schedule's `id`:

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

You can also view multiple schedules by nesting a [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %}) that retrieves `id`(s) inside the `SHOW JOBS` statement:

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

- [`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %})
- [`RESUME JOB`]({% link {{ page.version.version }}/pause-job.md %})
- [`CANCEL JOB`]({% link {{ page.version.version }}/cancel-job.md %})
- [`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %})
- [`BACKUP`]({% link {{ page.version.version }}/backup.md %})
- [`RESTORE`]({% link {{ page.version.version }}/restore.md %})
- [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %})
