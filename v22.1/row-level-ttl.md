---
title: Batch Delete Expired Data with Row-Level TTL
summary: Automatically delete rows of expired data older than a specified interval.
toc: true
keywords: ttl,delete,deletion,bulk deletion,bulk delete,expired data,expire data,time to live,row-level ttl,row level ttl
docs_area: develop
---

{% include {{page.version.version}}/sql/row-level-ttl.md %}

Row-Level TTL is in **beta** because it may not satisfy production requirements due to performance issues that may occur in large volume data sets.  For more information see [Limitations](row-level-ttl.html#limitations).

By using Row-Level TTL, you can avoid the complexity of writing and managing scheduled jobs from the application layer to mark rows as expired and perform the necessary deletions. Doing it yourself can become complicated due to the need to balance the timeliness of the deletions vs. the potentially negative performance impact of those deletions on foreground traffic from your application.

Use cases for row-level TTL include:

- Delete inactive data events to manage data size and performance: For example, you may want to delete order records from an online store after 90 days.

- Delete data no longer needed for compliance: For example, a banking application may need to keep some subset of data for a period of time due to financial regulations. Row-Level TTL can be used to remove data older than that period on a rolling, continuous basis.

- Outbox pattern: When events are written to an outbox table and published to an external system like [Kafka](https://en.wikipedia.org/wiki/Apache_Kafka), those events must be deleted to prevent unbounded growth in the size of the outbox table.

## How it works

At a high level, Row-Level TTL works by:

- Issuing a [selection query](selection-queries.html) at a [historical timestamp](as-of-system-time.html), yielding a set of rows that are eligible for deletion.
- Given the set of rows eligible for deletion, split what would logically be a single [`DELETE`](delete.html) statement to remove those rows into multiple SQL queries that will eventually have the equivalent effect by operating on a subset of the eligible rows.
- As part of the above process, deciding how many rows to [`SELECT`](select-clause.html) and [`DELETE`](delete.html) at once in each of the above queries.
- Running the SQL queries described above in parallel as [background jobs](show-jobs.html).
- To minimize the performance impact on foreground application queries, the background deletion queries are rate limited; they are also submitted at a lower priority level using the [admission control system](architecture/admission-control.html).

The process above is conceptually similar to the process described by [Batch delete on an indexed column](bulk-delete-data.html#batch-delete-on-an-indexed-column), except that Row-Level TTL is built into CockroachDB, so it saves you from having to write code to manage the process from your application and/or external job processing framework, including tuning the rate and performance of your background queries so they don't affect foreground application query performance.

## When are rows deleted?

Once rows are expired (that is, are older than the specified [TTL interval](#param-ttl-expire-after)), they are eligible to be deleted. However, eligible rows may not be deleted right away - instead, they are scheduled for deletion using a [background job](#view-ttl-jobs) that is run at the interval defined by the `ttl_job_cron` [storage parameter](#ttl-storage-parameters).

## Syntax overview

TTLs are defined on a per-table basis using SQL statements. The syntax for creating a table with an automatically managed TTL extends the [`storage_parameter` syntax](sql-grammar.html#opt_with_storage_parameter_list). For example, the SQL statement

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE ttl_test (
  id UUID PRIMARY KEY default gen_random_uuid(),
  description TEXT,
  inserted_at TIMESTAMP default current_timestamp()
) WITH (ttl_expire_after = '3 minutes');
~~~

has the following effects:

<a name="crdb-internal-expiration"></a>

1. Creates a repeating [scheduled job](#view-ttl-jobs) for the `ttl_test` table.
2. Adds a hidden column `crdb_internal_expiration` of type [`TIMESTAMPTZ`](timestamp.html) to represent the TTL.
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
             | ) WITH (ttl = 'on', ttl_automatic_column = 'on', ttl_expire_after = '00:03:00':::INTERVAL)
(1 row)
~~~

To view the scheduled job, use [`SHOW SCHEDULES`](show-schedules.html):

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

## TTL storage parameters

The settings that control the behavior of Row-Level TTL are provided using [storage parameters](sql-grammar.html#opt_with_storage_parameter_list). These parameters can be set during table creation using [`CREATE TABLE`](#create-a-table-with-row-level-ttl), added to an existing table using the [`ALTER TABLE`](#add-row-level-ttl-to-an-existing-table) statement, or [reset to default values](#reset-a-storage-parameter-to-its-default-value).

| Description                                              | Option                                                                                                                                                                       | Associated cluster setting          |
|----------------------------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-------------------------------------|
| `ttl_expire_after` <a name="param-ttl-expire-after"></a> | The [interval](interval.html) when a TTL will expire. Default: '30 days'. Minimum value: '1 microsecond'.                                                                    | N/A                                 |
| `ttl` <a name="param-ttl"></a>                           | Signifies if a TTL is active. Automatically set.                                                                                                                             | `sql.ttl.job.enabled`               |
| `ttl_select_batch_size`                                  | How many rows to [select](select-clause.html) at one time from the set of expired rows. Default: 500. Minimum: 1.                                                            | `sql.ttl.default_select_batch_size` |
| `ttl_delete_batch_size`                                  | How many rows to [delete](delete.html) at a time. Default: 100. Minimum: 1.                                                                                                  | `sql.ttl.default_delete_batch_size` |
| `ttl_delete_rate_limit`                                  | Maximum number of rows to be deleted per second (rate limit). Default: 0 (no limit).                                                                                         | `sql.ttl.default_delete_rate_limit` |
| `ttl_range_concurrency`                                  | The Row-Level TTL queries split up scans by ranges, and this determines how many concurrent ranges are processed at a time. Default: 1. Minimum: 1.                          | `sql.ttl.default_range_concurrency` |
| `ttl_row_stats_poll_interval`                            | If set, counts rows and expired rows on the table to report as Prometheus metrics while the TTL job is running. Unset by default, meaning no stats are fetched and reported. | N/A                                 |
| `ttl_pause` <a name="param-ttl-pause"></a>               | If set, stops the TTL job from executing.                                                                                                                                    | N/A                                 |
| `ttl_job_cron` <a name="param-ttl-job-cron"></a>         | Frequency at which the TTL job runs, specified using [CRON syntax](https://cron.help).                                                                                       | N/A                                 |
| `ttl_automatic_column`                                   | If set, use the value of the `crdb_internal_expiration` hidden column.                                                                                                       | N/A                                 |

For more information about TTL-related cluster settings, see [View TTL-related cluster settings](#view-ttl-related-cluster-settings).

## Examples

### Create a table with row-level TTL

To specify a TTL when creating a table, use the SQL syntax shown below. For example, to create a new table with rows that expire after 15 minutes, execute a statement like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE events (
  id UUID PRIMARY KEY default gen_random_uuid(),
  description TEXT,
  inserted_at TIMESTAMP default current_timestamp()
) WITH (ttl_expire_after = '3 minutes');
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

### Add row-level TTL to an existing table

To add a TTL to an existing table, use the SQL syntax shown below.

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE events SET (ttl_expire_after = '90 days');
~~~

~~~
ALTER TABLE
~~~

### View TTL jobs

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM [SHOW SCHEDULES] WHERE label LIKE 'row-level-ttl-%';
~~~

~~~
          id         |       label       | schedule_status |        next_run        | state | recurrence | jobsrunning | owner |            created            |     command
---------------------+-------------------+-----------------+------------------------+-------+------------+-------------+-------+-------------------------------+-------------------
  745396332264194049 | row-level-ttl-114 | ACTIVE          | 2022-03-17 21:00:00+00 | NULL  | @hourly    |           0 | root  | 2022-03-17 20:01:48.033267+00 | {"tableId": 114}
(1 row)
~~~

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
SELECT * FROM events WHERE crdb_internal_expiration < now();
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

### Remove row-level TTL from a table

To drop the TTL on an existing table, reset the [`ttl` storage parameter](#param-ttl).

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE events RESET (ttl);
~~~

### View TTL-related cluster settings

To view the [cluster settings](cluster-settings.html) that control how Row-Level TTL works, issue the following query:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM [SHOW CLUSTER SETTINGS] WHERE variable LIKE 'sql.ttl.%';
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

If you try to reset a [TTL storage parameter](#ttl-storage-parameters) but resetting that paraemeter would result in an invalid state of the TTL subsystem, CockroachDB will signal an error. For example, there is only one way to [remove row-level TTL from a table](#remove-row-level-ttl-from-a-table). If you try to remove the TTL from a table by resetting the `ttl_expire_after` storage parameter you set earlier, you will get the following error:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE tbl RESET (ttl_expire_after);
~~~

~~~
ERROR: resetting "ttl_expire_after" is not permitted
SQLSTATE: 22023
HINT: use `RESET (ttl)` to remove TTL from the table
~~~

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
