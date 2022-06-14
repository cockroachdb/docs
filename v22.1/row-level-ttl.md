---
title: Batch Delete Expired Data with Row-Level TTL
summary: Automatically delete rows of expired data older than a specified interval.
toc: true
keywords: ttl,delete,deletion,bulk deletion,bulk delete,expired data,expire data,time to live,row-level ttl,row level ttl
docs_area: develop
---

{% include {{page.version.version}}/sql/row-level-ttl.md %}

Row-Level TTL is in preview because it may not satisfy all functional and performance requirements of your workload. For more information see [Limitations](row-level-ttl.html#limitations).

By using Row-Level TTL, you can avoid the complexity of writing and managing scheduled jobs from the application layer to mark rows as expired and perform the necessary deletions. Doing it yourself can become complicated due to the need to balance the timeliness of the deletions vs. the potentially negative performance impact of those deletions on foreground traffic from your application.

Use cases for Row-Level TTL include:

- Delete inactive data events to manage data size and performance: For example, you may want to delete order records from an online store after 90 days.

- Delete data no longer needed for compliance: For example, a banking application may need to keep some subset of data for a period of time due to financial regulations. Row-Level TTL can be used to remove data older than that period on a rolling, continuous basis.

- Outbox pattern: When events are written to an outbox table and published to an external system like [Kafka](https://en.wikipedia.org/wiki/Apache_Kafka), those events must be deleted to prevent unbounded growth in the size of the outbox table.

## How it works

At a high level, Row-Level TTL works by:

- Issuing a [selection query](selection-queries.html) at a [historical timestamp](as-of-system-time.html), yielding a set of rows that are eligible for deletion (also known as "expired").
- Issuing batched [`DELETE`](delete.html) statements for the expired rows.
- As part of the above process, deciding how many rows to [`SELECT`](select-clause.html) and [`DELETE`](delete.html) at once in each of the above queries.
- Running the SQL queries described above in parallel as [background jobs](show-jobs.html).
- To minimize the performance impact on foreground application queries, the background deletion queries are rate limited; they are also submitted at a lower priority level using the [admission control system](admission-control.html).

The process above is conceptually similar to the process described by [Batch delete on an indexed column](bulk-delete-data.html#batch-delete-on-an-indexed-column), except that Row-Level TTL is built into CockroachDB, so it saves you from having to write code to manage the process from your application and/or external job processing framework, including tuning the rate and performance of your background queries so they don't affect foreground application query performance.

## When are rows deleted?

Once rows are expired (that is, are older than the specified [TTL interval](#param-ttl-expire-after)), they are eligible to be deleted. However, eligible rows may not be deleted right away. Instead, they are scheduled for deletion using a [background job](#view-scheduled-ttl-jobs) that is run at the interval defined by the `ttl_job_cron` [storage parameter](#ttl-storage-parameters).

## Syntax overview

TTLs are defined on a per-table basis using SQL statements. The syntax for creating a table with an automatically managed TTL extends the [`storage_parameter` syntax](sql-grammar.html#opt_with_storage_parameter_list). For example, the SQL statement

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE ttl_test (
  id UUID PRIMARY KEY default gen_random_uuid(),
  description TEXT,
  inserted_at TIMESTAMP default current_timestamp()
) WITH (ttl_expire_after = '3 months');
~~~

has the following effects:

<a name="crdb-internal-expiration"></a>

1. Creates a repeating [scheduled job](#view-scheduled-ttl-jobs) for the `ttl_test` table.
2. Adds a `NOT VISIBLE` column called `crdb_internal_expiration` of type [`TIMESTAMPTZ`](timestamp.html) to represent the TTL.
3. Implicitly adds the `ttl` and `ttl_automatic_column` [storage parameters](#ttl-storage-parameters).

To see the hidden column and the storage parameters, enter the [`SHOW CREATE TABLE`](show-create.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE TABLE ttl_test;
~~~

~~~
  table_name |                                                                                           create_statement
-------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  ttl_test   | CREATE TABLE public.ttl_test (
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     description STRING NULL,
             |     inserted_at TIMESTAMP NULL DEFAULT current_timestamp():::TIMESTAMP,
             |     crdb_internal_expiration TIMESTAMPTZ NOT VISIBLE NOT NULL DEFAULT current_timestamp():::TIMESTAMPTZ + '00:03:00':::INTERVAL ON UPDATE current_timestamp():::TIMESTAMPTZ + '00:03:00':::INTERVAL,
             |     CONSTRAINT ttl_test_pkey PRIMARY KEY (id ASC)
             | ) WITH (ttl = 'on', ttl_automatic_column = 'on', ttl_expire_after = '3 mons':::INTERVAL)
(1 row)
~~~

## TTL storage parameters

The settings that control the behavior of Row-Level TTL are provided using [storage parameters](sql-grammar.html#opt_with_storage_parameter_list). These parameters can be set during table creation using [`CREATE TABLE`](#create-a-table-with-row-level-ttl), added to an existing table using the [`ALTER TABLE`](#add-row-level-ttl-to-an-existing-table) statement, or [reset to default values](#reset-a-storage-parameter-to-its-default-value).

| Description                                              | Option                                                                                                                                                                       | Associated cluster setting          |
|----------------------------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-------------------------------------|
| `ttl_expire_after` <a name="param-ttl-expire-after"></a> | The [interval](interval.html) when a TTL will expire. This parameter is required to enable TTL. Minimum value: `'1 microsecond'`.                                            | N/A                                 |
| `ttl` <a name="param-ttl"></a>                           | Signifies if a TTL is active. Automatically set.                                                                                                                             | N/A                                 |
| `ttl_select_batch_size`                                  | How many rows to [select](select-clause.html) at one time during the row expiration check. Default: 500. Minimum: 1.                                                         | `sql.ttl.default_select_batch_size` |
| `ttl_delete_batch_size`                                  | How many rows to [delete](delete.html) at a time. Default: 100. Minimum: 1.                                                                                                  | `sql.ttl.default_delete_batch_size` |
| `ttl_delete_rate_limit`                                  | Maximum number of rows to be deleted per second (rate limit). Default: 0 (no limit).                                                                                         | `sql.ttl.default_delete_rate_limit` |
| `ttl_range_concurrency`                                  | The Row-Level TTL queries split up scans by ranges, and this determines how many concurrent ranges are processed at a time. Default: 1. Minimum: 1.                          | `sql.ttl.default_range_concurrency` |
| `ttl_row_stats_poll_interval`                            | If set, counts rows and expired rows on the table to report as Prometheus metrics while the TTL job is running. Unset by default, meaning no stats are fetched and reported. | N/A                                 |
| `ttl_pause` <a name="param-ttl-pause"></a>               | If set, stops the TTL job from executing.                                                                                                                                    | N/A                                 |
| `ttl_job_cron` <a name="param-ttl-job-cron"></a>         | Frequency at which the TTL job runs, specified using [CRON syntax](https://cron.help). Default: `'@hourly'`.                                                                 | N/A                                 |
| `ttl_automatic_column`                                   | If set, use the value of the `crdb_internal_expiration` hidden column. (Currently always set.)                                                                               | N/A                                 |

For more information about TTL-related cluster settings, see [View TTL-related cluster settings](#view-ttl-related-cluster-settings).

## TTL metrics

The table below lists the metrics you can use to monitor the effectiveness of your TTL settings. These metrics are visible on the [Advanced Debug Page](ui-debug-pages.html), as well as at the `_status/vars` endpoint which can be scraped by [Prometheus](monitor-cockroachdb-with-prometheus.html).

| Name                                      | Description                                                      | Measurement          | Type      |
|-------------------------------------------+------------------------------------------------------------------+----------------------+-----------|
| `jobs.row_level_ttl.range_total_duration` | Duration for processing a range during row level TTL.            | `nanoseconds`        | Histogram |
| `jobs.row_level_ttl.select_duration`      | Duration for select requests during row level TTL.               | `nanoseconds`        | Histogram |
| `jobs.row_level_ttl.delete_duration`      | Duration for delete requests during row level TTL.               | `nanoseconds`        | Histogram |
| `jobs.row_level_ttl.rows_selected`        | Number of rows selected for deletion by the row level TTL job.   | `num_rows`           | Counter   |
| `jobs.row_level_ttl.rows_deleted`         | Number of rows deleted by the row level TTL job.                 | `num_rows`           | Counter   |
| `jobs.row_level_ttl.num_active_ranges`    | Number of active workers attempting to delete for row level TTL. | `num_active_workers` | Count     |
| `jobs.row_level_ttl.total_rows`           | Approximate number of rows on the TTL table.                     | `total_rows`         | Count     |
| `jobs.row_level_ttl.total_expired_rows`   | Approximate number of expired rows on the TTL table.             | `total_expired_rows` | Count     |

By default, these metrics are aggregated, meaning that all TTL tables will report the metrics under the same label. If you want to have metrics labelled by table name (at the risk of added cardinality), you must take the following steps:

- Set the `server.child_metrics.enabled` [cluster setting](cluster-settings.html) to `true`.
- Set the `ttl_label_metrics` storage parameter to `true`.

## Examples

### Create a table with Row-Level TTL

To specify a TTL when creating a table, use the SQL syntax shown below. For example, to create a new table with rows that expire after a 3 month [interval](interval.html), execute a statement like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE events (
  id UUID PRIMARY KEY default gen_random_uuid(),
  description TEXT,
  inserted_at TIMESTAMP default current_timestamp()
) WITH (ttl_expire_after = '3 months');
~~~

~~~
CREATE TABLE
~~~

Insert some data; it should work as expected:

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO events (description) VALUES ('a thing'), ('another thing'), ('yet another thing');
~~~

~~~
INSERT 3
~~~

To see the rows and their expirations, enter the following query:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT *, crdb_internal_expiration FROM events;
~~~

~~~
                   id                  |    description    |        inserted_at         |   crdb_internal_expiration
---------------------------------------+-------------------+----------------------------+--------------------------------
  117c35fe-97f6-43bc-919f-fcd2ea13779e | a thing           | 2022-04-19 18:29:53.846697 | 2022-07-19 18:29:53.846697+00
  c294890f-2f14-4e18-8001-5f806ed9bfd1 | yet another thing | 2022-04-19 18:29:53.846697 | 2022-07-19 18:29:53.846697+00
  ea72189c-2f17-4a8e-b479-6b050a87e3bb | another thing     | 2022-04-19 18:29:53.846697 | 2022-07-19 18:29:53.846697+00
(3 rows)
~~~

### Add Row-Level TTL to an existing table

To add a TTL to an existing table, use the SQL syntax shown below.

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE events SET (ttl_expire_after = '1 year');
~~~

~~~
ALTER TABLE
~~~

{{site.data.alerts.callout_info}}
Adding Row-Level TTL to an existing table will result in a [schema change](online-schema-changes.html) that sets the [`crdb_internal_expiration` column](#crdb-internal-expiration) for all rows. Depending on table size, this could be an expensive operation.
{{site.data.alerts.end}}

### View scheduled TTL jobs

You can use [`SHOW SCHEDULES`](show-schedules.html) to view all TTL-related scheduled jobs by executing the following query:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW SCHEDULES;
~~~

~~~
          id         |        label         | schedule_status |        next_run        |  state  | recurrence | jobsrunning | owner |            created            |     command
---------------------+----------------------+-----------------+------------------------+---------+------------+-------------+-------+-------------------------------+-------------------
  747608117920104449 | sql-stats-compaction | ACTIVE          | 2022-03-25 16:00:00+00 | pending | @hourly    |           0 | node  | 2022-03-25 15:31:31.444067+00 | {}
  747609229470433281 | row-level-ttl-112    | ACTIVE          | 2022-03-25 16:00:00+00 | NULL    | @hourly    |           0 | root  | 2022-03-25 15:37:10.613056+00 | {"tableId": 112}
(2 rows)
~~~

### View running TTL jobs

You can use [`SHOW JOBS`](show-jobs.html) to see any running TTL jobs by executing the following query:

{% include_cached copy-clipboard.html %}
~~~ sql
WITH x AS (SHOW JOBS) SELECT * from x WHERE job_type = 'ROW LEVEL TTL';
~~~

~~~
        job_id       |   job_type    | description | statement | user_name | status | running_status |          created           |          started           |          finished          |          modified          | fraction_completed |                                    error                                    | coordinator_id |      trace_id       |          last_run          |          next_run          | num_runs | execution_errors
---------------------+---------------+-------------+-----------+-----------+--------+----------------+----------------------------+----------------------------+----------------------------+----------------------------+--------------------+-----------------------------------------------------------------------------+----------------+---------------------+----------------------------+----------------------------+----------+-------------------
  751553547665211401 | ROW LEVEL TTL | ttl         |           | node      | failed | NULL           | 2022-04-08 13:59:00.008994 | 2022-04-08 13:59:02.730252 | 2022-04-08 13:59:03.367008 | 2022-04-08 13:59:02.587079 |                  0 | found a recent schema change on the table at 2022-04-08T13:58:35Z, aborting |              5 | 6643876482632317647 | 2022-04-08 13:59:03.224766 | 2022-04-08 13:59:33.224766 |        1 | {}
(1 row)
~~~

{{site.data.alerts.callout_success}}
You can also view running TTL jobs using the [Jobs page in the DB Console](ui-jobs-page.html)
{{site.data.alerts.end}}

### Reset a storage parameter to its default value

To reset a [TTL storage parameter](#ttl-storage-parameters) to its default value, use the [`ALTER TABLE`](alter-table.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE events RESET (ttl_job_cron);
~~~

~~~
ALTER TABLE
~~~

### View TTL storage parameters on a table

To view TTL storage parameters on a table, you can use [`SHOW CREATE TABLE`](show-create.html):

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE TABLE events;
~~~

~~~
  table_name |                                                                                          create_statement
-------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  events     | CREATE TABLE public.events (
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     description STRING NULL,
             |     inserted_at TIMESTAMP NULL DEFAULT current_timestamp():::TIMESTAMP,
             |     crdb_internal_expiration TIMESTAMPTZ NOT VISIBLE NOT NULL DEFAULT current_timestamp():::TIMESTAMPTZ + '90 days':::INTERVAL ON UPDATE current_timestamp():::TIMESTAMPTZ + '90 days':::INTERVAL,
             |     CONSTRAINT events_pkey PRIMARY KEY (id ASC)
             | ) WITH (ttl = 'on', ttl_automatic_column = 'on', ttl_expire_after = '90 days':::INTERVAL)
(1 row)
~~~

You can also use the following query:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT relname, reloptions FROM pg_class WHERE relname = 'events';
~~~

~~~
  relname |                                 reloptions
----------+-----------------------------------------------------------------------------
  events  | NULL
  events  | {ttl='on',ttl_automatic_column='on',ttl_expire_after='90 days':::INTERVAL}
(2 rows)
~~~

### Control how often the TTL job runs

Setting a TTL on a table controls when the rows therein are considered expired, but it only says that such rows _may_ be deleted at any time after the expiration. To control how often the TTL deletion job runs, use the [`ttl_job_cron` storage parameter](#param-ttl-job-cron), which supports [CRON syntax](https://cron.help).

To control the job interval at [`CREATE TABLE`](create-table.html) time, add the storage parameter as shown below:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE tbl (
  id UUID PRIMARY KEY default gen_random_uuid(),
  value TEXT
) WITH (ttl_expire_after = '3 weeks', ttl_job_cron = '@daily');
~~~

~~~
CREATE TABLE
~~~

{{site.data.alerts.callout_info}}
To set the [`ttl_job_cron` storage parameter](#param-ttl-job-cron) when creating a table with Row-Level TTL, you must also set the [`ttl_expire_after` parameter](#param-ttl-expire-after).
{{site.data.alerts.end}}

To update the TTL deletion job interval on a table that already has Row-Level TTL enabled, use [`ALTER TABLE`](alter-table.html):

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE tbl SET (ttl_job_cron = '@weekly');
~~~

~~~
ALTER TABLE
~~~

### Pause the TTL job from running

To pause the TTL job from running on a table, use the [`ttl_pause` storage parameter](#param-ttl-pause):

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE events SET (ttl_pause = 'on');
~~~

~~~
ALTER TABLE
~~~

If you run the TTL pausing statement above against a table that does not have TTL enabled, you will get the following error:

~~~
ERROR: "ttl_expire_after" must be set
SQLSTATE: 22023
~~~

### Filter out expired rows from a selection query

To fetch only those rows from a table that have not yet expired their TTL, use the [hidden `crdb_internal_expiration` column](#crdb-internal-expiration) as shown below:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM events WHERE crdb_internal_expiration > now();
~~~

{% include_cached copy-clipboard.html %}
~~~
                   id                  |    description    |        inserted_at
---------------------------------------+-------------------+-----------------------------
  6d25862e-2e48-4993-ac3a-a2abbebebf32 | yet another thing | 2022-03-17 20:01:56.138216
  a9404386-c4da-415f-b0b0-0dfad0f13c80 | a thing           | 2022-03-17 20:01:56.138216
  d4ebf8cd-e482-4abb-8968-2ba39c9197d9 | another thing     | 2022-03-17 20:01:56.138216
(3 rows)
~~~

### Remove Row-Level TTL from a table

To drop the TTL on an existing table, reset the [`ttl` storage parameter](#param-ttl).

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE events RESET (ttl);
~~~

### Set the Row-Level TTL for an individual row

Setting the TTL for an individual row can be useful for compliance reasons, or when troubleshooting your TTL settings.

To set (or change) the TTL for an individual row, issue a query like the one shown below. It updates the expiration of one of the rows you entered when you [created the table](#create-a-table-with-row-level-ttl) to use an [interval](interval.html) of `'1 year'`.

{% include_cached copy-clipboard.html %}
~~~ sql
UPDATE events SET crdb_internal_expiration = current_timestamp():::TIMESTAMPTZ + '1 year'::INTERVAL where id = 'a9404386-c4da-415f-b0b0-0dfad0f13c80';
~~~

~~~
UPDATE 1
~~~

You can view the new expiration by entering the following query:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT *, crdb_internal_expiration from events WHERE id = ' a9404386-c4da-415f-b0b0-0dfad0f13c80';
~~~

~~~
                   id                  | description |        inserted_at         |   crdb_internal_expiration
---------------------------------------+-------------+----------------------------+--------------------------------
  a9404386-c4da-415f-b0b0-0dfad0f13c80 | a thing     | 2022-04-19 19:53:00.037216 | 2023-04-19 19:57:27.592898+00
(1 row)
~~~

{{site.data.alerts.callout_danger}}
If a row with a row-level TTL override as described in this section is subsequently [updated](update.html), the overridden value of `crdb_internal_expiration` and will be replaced with `now()` + the table-wide TTL that was [set during table creation](#create-a-table-with-row-level-ttl) or [previously added to the table](#add-row-level-ttl-to-an-existing-table).
{{site.data.alerts.end}}

### Disable TTL jobs for the whole cluster

To disable TTL jobs for the whole cluster, set the `sql.ttl.job.enabled` [cluster setting](cluster-settings.html) to `false`:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.ttl.job.enabled = false;
~~~

~~~
SET CLUSTER SETTING
~~~

### View TTL-related cluster settings

To view the [cluster settings](cluster-settings.html) that control how Row-Level TTL works, issue the following query:

{% include_cached copy-clipboard.html %}
~~~ sql
WITH x AS (SHOW CLUSTER SETTINGS) SELECT * FROM x WHERE variable LIKE 'sql.ttl.%';
~~~

~~~
              variable              | value | setting_type |                                 description
------------------------------------+-------+--------------+------------------------------------------------------------------------------
  sql.ttl.default_delete_batch_size | 100   | i            | default amount of rows to delete in a single query during a TTL job
  sql.ttl.default_delete_rate_limit | 0     | i            | default delete rate limit for all TTL jobs. Use 0 to signify no rate limit.
  sql.ttl.default_range_concurrency | 1     | i            | default amount of ranges to process at once during a TTL delete
  sql.ttl.default_select_batch_size | 500   | i            | default amount of rows to select in a single query during a TTL job
  sql.ttl.job.enabled               | true  | b            | whether the TTL job is enabled
  sql.ttl.range_batch_size          | 100   | i            | amount of ranges to fetch at a time for a table during the TTL job
(6 rows)
~~~

## Common errors

If you attempt to update a [TTL storage parameter](#ttl-storage-parameters) on a table that does not have TTL enabled, you will get an error as shown below:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE events SET (ttl_job_cron = '@weekly');
~~~

~~~
ERROR: "ttl_expire_after" must be set
SQLSTATE: 22023
~~~

If you try to reset a [TTL storage parameter](#ttl-storage-parameters) but resetting that parameter would result in an invalid state of the TTL subsystem, CockroachDB will signal an error. For example, there is only one way to [remove Row-Level TTL from a table](#remove-row-level-ttl-from-a-table). If you try to remove the TTL from a table by resetting the `ttl_expire_after` storage parameter you set earlier, you will get the following error:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE tbl RESET (ttl_expire_after);
~~~

~~~
ERROR: resetting "ttl_expire_after" is not permitted
SQLSTATE: 22023
HINT: use `RESET (ttl)` to remove TTL from the table
~~~

## Changefeeds

Row-level TTL interacts with [changefeeds](use-changefeeds.html) in the following ways:

- When expired rows are deleted, a [changefeed delete message](use-changefeeds.html#delete-messages) is emitted.

## Backup and restore

Row-level TTL interacts with [backup and restore](backup-and-restore-overview.html) in the following ways:

- When you run a [`BACKUP`](backup.html), all row-level TTL information associated with the tables being backed up (including TTL expiration times) is also backed up.

- When you [`RESTORE`](restore.html) from a backup, all row-level TTL information associated with the tables being restored (including TTL expiration times) is also restored. Any expired rows in the restored tables are eligible to be [deleted](#when-are-rows-deleted) by the [TTL job](#how-it-works).

## Limitations

{% include {{page.version.version}}/known-limitations/row-level-ttl-limitations.md %}

## See also

- [Bulk-delete Data](bulk-delete-data.html)
- [Delete data](delete-data.html)
- [`DELETE`](delete.html)
- [`SELECT` clause](select-clause.html)
- [`AS OF SYSTEM TIME`](as-of-system-time.html)
- [`TIMESTAMP`](timestamp.html)
- [`INTERVAL`](interval.html)
- [SQL Performance Best Practices](performance-best-practices-overview.html)
- [Developer Guide Overview](developer-guide-overview.html)
