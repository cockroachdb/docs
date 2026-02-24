---
title: Batch Delete Expired Data with Row-Level TTL
summary: Automatically delete rows of expired data older than a specified interval.
toc: true
keywords: ttl,delete,deletion,bulk deletion,bulk delete,expired data,expire data,time to live,row-level ttl,row level ttl
docs_area: develop
---

{% include {{page.version.version}}/sql/row-level-ttl.md %}

By using Row-Level TTL, you can avoid the complexity of writing and managing scheduled jobs from the application layer to mark rows as expired and perform the necessary deletions. Doing it yourself can become complicated due to the need to balance the timeliness of the deletions vs. the potentially negative performance impact of those deletions on foreground traffic from your application.

Use cases for Row-Level TTL include:

- Delete inactive data events to manage data size and performance: For example, you may want to delete order records from an online store after 90 days.

- Delete data no longer needed for compliance: For example, a banking application may need to keep some subset of data for a period of time due to financial regulations. Row-Level TTL can be used to remove data older than that period on a rolling, continuous basis.

- Outbox pattern: When events are written to an outbox table and published to an external system like [Kafka](https://wikipedia.org/wiki/Apache_Kafka) using CockroachDB's [Change Data Capture (CDC)]({% link {{ page.version.version }}/change-data-capture-overview.md %}) feature (also known as ["changefeeds"](#changefeeds)), those events must be deleted to prevent unbounded growth in the size of the outbox table.

## How it works

At a high level, Row-Level TTL works by:

- Issuing a [selection query]({% link {{ page.version.version }}/selection-queries.md %}) at a [historical timestamp]({% link {{ page.version.version }}/as-of-system-time.md %}), yielding a set of rows that are eligible for deletion (also known as "expired").
- Issuing batched [`DELETE`]({% link {{ page.version.version }}/delete.md %}) statements for the expired rows.
- As part of the above process, deciding how many rows to [`SELECT`]({% link {{ page.version.version }}/select-clause.md %}) and [`DELETE`]({% link {{ page.version.version }}/delete.md %}) at once in each of the above queries.
- Running the SQL queries described above in parallel as [background jobs]({% link {{ page.version.version }}/show-jobs.md %}).
- Periodically checkpointing progress across [key spans]({% link {{ page.version.version }}/show-ranges.md %}#span-statistics) so that if a TTL job is retried, paused and resumed, or a node restarts, the job resumes from the last checkpoint without reprocessing spans that were already completed.
- To minimize the performance impact on foreground application queries, the background deletion queries are rate limited; they are also submitted at a lower priority level using the [admission control system]({% link {{ page.version.version }}/admission-control.md %}). When foreground traffic increases, CockroachDB will reduce the resources allocated to TTL deletes to handle the foreground traffic. When foreground traffic decreases, CockroachDB will increase the resources allocated to TTL deletes.

- Latency of row-level TTL queries is further reduced by using the elastic CPU limiter, which dynamically controls the total CPU percentage used by row-level TTL reads. The elastic CPU limiter can be disabled for row-level TTL queries by setting the `kvadmission.low_pri_read_elastic_control.enabled` and `sqladmission.low_pri_read_response_elastic_control.enabled` [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) to `false`.

The process above is conceptually similar to the process described by [Batch delete on an indexed column]({% link {{ page.version.version }}/bulk-delete-data.md %}#batch-delete-on-an-indexed-column), except that Row-Level TTL is built into CockroachDB, so it saves you from having to write code to manage the process from your application and/or external job processing framework, including tuning the rate and performance of your background queries so they don't affect foreground application query performance.

## When are rows deleted?

Once rows are expired (that is, are older than the specified [TTL interval](#param-ttl-expire-after)), they are eligible to be deleted. However, eligible rows may not be deleted right away. Instead, they are scheduled for deletion using a [background job](#view-scheduled-ttl-jobs) that is run at the interval defined by the `ttl_job_cron` [storage parameter](#ttl-storage-parameters).

## Syntax overview

TTLs are defined using either the `ttl_expiration_expression` or `ttl_expire_after` [storage parameters](#ttl-storage-parameters).

- [Using `ttl_expiration_expression`](#using-ttl_expiration_expression) is useful for customizing expiration logic by providing an expression. For example, you could get the same behavior as `ttl_expire_after` by creating a [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}) column with a default value and having the `ttl_expiration_expression` reference that column.
- [Using `ttl_expire_after`](#using-ttl_expire_after) is a convenient way of setting rows to expire a fixed amount of time after they are created or updated.

{{site.data.alerts.callout_success}}
{% include {{page.version.version}}/sql/row-level-ttl-prefer-ttl-expiration-expressions.md %}
{{site.data.alerts.end}}

### Using `ttl_expiration_expression`

Use [`ttl_expiration_expression`](#param-ttl-expiration-expression) for customizing the expiration logic by providing a SQL expression. For example, you could get the same behavior as `ttl_expire_after` by creating a column with a default value and having the `ttl_expiration_expression` reference that column.

To add custom expiration logic using `ttl_expiration_expression`, issue the following SQL statement that uses the [`ttl_expiration_expression`](#param-ttl-expiration-expression) parameter, which defines a [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}) after which the row is considered expired:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE ttl_test_per_row (
  id UUID PRIMARY KEY default gen_random_uuid(),
  description TEXT,
  expired_at TIMESTAMPTZ NOT NULL DEFAULT now() + '30 days'
) WITH (ttl_expiration_expression = 'expired_at', ttl_job_cron = '@daily');
~~~

The statement has the following effects:

<a name="crdb-internal-expiration"></a>

1. Creates a repeating [scheduled job](#view-scheduled-ttl-jobs) for the table and sets it to run once per day.
1. Implicitly adds the `ttl` and `ttl_cron` [storage parameters](#ttl-storage-parameters).

To see the storage parameters, enter the [`SHOW CREATE TABLE`]({% link {{ page.version.version }}/show-create.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE TABLE ttl_test_per_row;
~~~

~~~
     table_name    |                                    create_statement
-------------------+------------------------------------------------------------------------------------------
  ttl_test_per_row | CREATE TABLE public.ttl_test_per_row (
                   |     id UUID NOT NULL DEFAULT gen_random_uuid(),
                   |     description STRING NULL,
                   |     expired_at TIMESTAMPTZ NOT NULL DEFAULT now():::TIMESTAMPTZ + '30 days':::INTERVAL,
                   |     CONSTRAINT ttl_test_per_row_pkey PRIMARY KEY (id ASC)
                   | ) WITH (ttl = 'on', ttl_expiration_expression = 'expired_at', ttl_job_cron = '@daily')
(1 row)
~~~

{{site.data.alerts.callout_success}}
{% include {{page.version.version}}/sql/row-level-ttl-prefer-ttl-expiration-expressions.md %}
{{site.data.alerts.end}}

### Using `ttl_expire_after`

To set rows to expire a fixed amount of time after they are created or updated, issue the following SQL statement using the [`ttl_expire_after`](#param-ttl-expire-after) storage parameter:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE ttl_test_per_table (
  id UUID PRIMARY KEY default gen_random_uuid(),
  description TEXT,
  inserted_at TIMESTAMPTZ default current_timestamp()
) WITH (ttl_expire_after = '3 months', ttl_job_cron = '@daily');
~~~

The statement has the following effects:

<a name="crdb-internal-expiration"></a>

1. Creates a repeating [scheduled job](#view-scheduled-ttl-jobs) for the table and sets it to run once per day.
1. Adds a `NOT VISIBLE` column called `crdb_internal_expiration` of type [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}) to represent the TTL.
1. Implicitly adds the `ttl` and `ttl_cron` [storage parameters](#ttl-storage-parameters).

To see the hidden column and the storage parameters, enter the [`SHOW CREATE TABLE`]({% link {{ page.version.version }}/show-create.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE TABLE ttl_test_per_table;
~~~

~~~
      table_name     |                                                                                         create_statement
---------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  ttl_test_per_table | CREATE TABLE public.ttl_test_per_table (
                     |     id UUID NOT NULL DEFAULT gen_random_uuid(),
                     |     description STRING NULL,
                     |     inserted_at TIMESTAMPTZ NULL DEFAULT current_timestamp():::TIMESTAMPTZ,
                     |     crdb_internal_expiration TIMESTAMPTZ NOT VISIBLE NOT NULL DEFAULT current_timestamp():::TIMESTAMPTZ + '3 mons':::INTERVAL ON UPDATE current_timestamp():::TIMESTAMPTZ + '3 mons':::INTERVAL,
                     |     CONSTRAINT ttl_test_per_table_pkey PRIMARY KEY (id ASC)
                     | ) WITH (ttl = 'on', ttl_expire_after = '3 mons':::INTERVAL, ttl_job_cron = '@daily')
(1 row)
~~~

{{site.data.alerts.callout_success}}
{% include {{page.version.version}}/sql/row-level-ttl-prefer-ttl-expiration-expressions.md %}
{{site.data.alerts.end}}

## TTL storage parameters

The settings that control the behavior of Row-Level TTL are provided using [storage parameters]({% link {{ page.version.version }}/sql-grammar.md %}#opt_with_storage_parameter_list). These parameters can be set during table creation using [`CREATE TABLE`](#create-a-table-with-a-ttl_expiration_expression), added to an existing table using the [`ALTER TABLE`](#add-or-update-the-row-level-ttl-for-an-existing-table) statement, or [reset to default values](#reset-a-storage-parameter-to-its-default-value).

| Option                                                                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                  | Associated cluster setting          |
|----------------------------------------------------------------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+-------------------------------------|
| `ttl_expiration_expression` <a name="param-ttl-expiration-expression"></a> | **Recommended**. SQL expression that defines the TTL expiration. Must evaluate to a [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}). This and/or [`ttl_expire_after`](#param-ttl-expire-after) are required to enable TTL. This parameter is useful when you want to set the TTL for individual rows in the table. For an example, see [Create a table with a `ttl_expiration_expression`](#create-a-table-with-a-ttl_expiration_expression). | N/A                                 |
| `ttl_expire_after` <a name="param-ttl-expire-after"></a>                   | The [interval]({% link {{ page.version.version }}/interval.md %}) when a TTL will expire. This and/or [`ttl_expiration_expression`](#param-ttl-expiration-expression) are required to enable TTL. Minimum value: `'1 microsecond'`.                                                                                                                                                                                                                                         | N/A                                 |
| `ttl` <a name="param-ttl"></a>                                             | Signifies if a TTL is active. Automatically set.                                                                                                                                                                                                                                                                                                                                                                                        | N/A                                 |
| `ttl_select_batch_size`                                                    | How many rows to [select]({% link {{ page.version.version }}/select-clause.md %}) at one time during the row expiration check. Defaults to the value of the associated cluster setting if unset. | `sql.ttl.default_select_batch_size` <br/> Default: 500. Minimum: 1. |
| `ttl_delete_batch_size` <a name="param-ttl-delete-batch-size"></a>                                                    | How many rows to [delete]({% link {{ page.version.version }}/delete.md %}) at a time. Defaults to the value of the associated cluster setting if unset.| `sql.ttl.default_delete_batch_size` <br/> Default: 100. Minimum: 1. |
| `ttl_select_rate_limit` | Maximum number of rows to be selected per second (rate limit). Defaults to the value of the associated cluster setting if unset. <br/><br/>Note: The rate limit is applied per node per table. The TTL job prefers to assign work to the leaseholder of each range, but this is not guaranteed. In some cases, non-leaseholder nodes may be assigned work. <br/><br/>As a result, the effective cluster-wide rate depends on how many nodes end up processing TTL work for the table. | `sql.ttl.default_select_rate_limit`<br/>Default: 0. Minimum: 0 (unlimited). |
| `ttl_delete_rate_limit` | Maximum number of rows to be deleted per second (rate limit). Defaults to the value of the associated cluster setting if unset. <br/><br/>Note: The rate limit is applied per node per table, with the same leaseholder preference and fallback behavior as `ttl_select_rate_limit`. <br/><br/>The actual cluster-wide rate will vary depending on which nodes execute TTL work. | `sql.ttl.default_delete_rate_limit`<br/>Default: 100. Minimum: 0 (unlimited). |
| `ttl_row_stats_poll_interval`                                              | If set, counts rows and expired rows on the table to report as Prometheus metrics while the TTL job is running. Unset by default, meaning no stats are fetched and reported.                                                                                                                                                                                                                                                            | N/A                                 |
| `ttl_pause` <a name="param-ttl-pause"></a>                                 | If set, stops the TTL job from executing.                                                                                                                                                                                                                                                                                                                                                                                               | N/A                                 |
| `ttl_job_cron` <a name="param-ttl-job-cron"></a>                           | Frequency at which the TTL job runs, specified using [CRON syntax](https://cron.help). Default: `'@daily'` (was `'@hourly'`).                                                                                                                                                                                                                                                                                                                            | N/A                                 |
| `ttl_disable_changefeed_replication` | Disables [changefeed]({% link {{ page.version.version }}/change-data-capture-overview.md %}) replication for the deletes performed by the TTL job. | `sql.ttl.changefeed_replication.disabled` |

For more information about TTL-related cluster settings, see [View TTL-related cluster settings](#view-ttl-related-cluster-settings).

## TTL metrics

The table below lists the metrics you can use to monitor the effectiveness of your TTL settings. These metrics are visible on the [Advanced Debug Page]({% link {{ page.version.version }}/ui-debug-pages.md %}), as well as at the [Prometheus endpoint]({% link {{ page.version.version }}/prometheus-endpoint.md %}) which can be scraped by [Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}).

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

- Set the `server.child_metrics.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to `true`.
- Set the `ttl_label_metrics` storage parameter to `true`.

{{site.data.alerts.callout_info}}
For more information about the issues (including negative performance impacts) that can arise when you add cardinality, see the considerations listed in [Using changefeed metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels).
{{site.data.alerts.end}}

## Examples

### Create a table with a `ttl_expiration_expression`

Use the SQL syntax shown below, which uses the [`ttl_expiration_expression`](#param-ttl-expiration-expression) parameter to refer to an `expire_at` column that determines each row's expiration:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE ttl_test_ttl_expiration_expression (
  id INT PRIMARY KEY,
  expire_at TIMESTAMPTZ
) WITH (ttl_expiration_expression = 'expire_at');
~~~

The [`ttl_expiration_expression`](#param-ttl-expiration-expression)" parameter takes a SQL expression (often a column name) that defines the TTL expiration. It is used when you want to set the TTL for individual rows in a table.

The `ttl_expiration_expression` parameter has the following requirements:

- It must evaluate to a [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}).
- It must not reference any columns outside the table to which it is applied.
- Any column it references cannot be [dropped]({% link {{ page.version.version }}/alter-table.md %}#drop-column) or have its [type altered]({% link {{ page.version.version }}/alter-type.md %}).
- Finally, if the [column is renamed]({% link {{ page.version.version }}/alter-table.md %}#rename-column), the value of `ttl_expiration_expression` is automatically updated.

### Use a `ttl_expiration_expression` on a `DATE` or `TIMESTAMPTZ` column

Use the SQL syntax shown below to create a new table with rows that expire 30 days after an event ends using a `ttl_expiration_expression`.

A `ttl_expiration_expression` that uses an existing `DATE` column:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE events_using_date (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT,
  start_date DATE DEFAULT now() NOT NULL,
  end_date DATE NOT NULL
) WITH (
  ttl_expiration_expression = $$(end_date::TIMESTAMPTZ + '30 days')$$
);
~~~

A `ttl_expiration_expression` that uses an existing `TIMESTAMPTZ` column:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE events_using_timestamptz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT,
  start_date TIMESTAMPTZ DEFAULT now() NOT NULL,
  end_date TIMESTAMPTZ NOT NULL
) WITH (
  ttl_expiration_expression = $$(end_date + '30 days')$$
);
~~~

When using a `ttl_expiration_expression` on a `DATE` or `TIMESTAMPTTZ` column, use `AT TIME ZONE` to explicitly set the time zone for the expression. By setting the time zone to UTC in the expression, you set an exact time when the delete should be performed, regardless of the local time zone of the node.

### Create a table with `ttl_expire_after`

Use the SQL syntax shown below to create a new table with rows that expire after a 3 month [interval]({% link {{ page.version.version }}/interval.md %}), execute a statement like the following:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE events (
  id UUID PRIMARY KEY default gen_random_uuid(),
  description TEXT,
  inserted_at TIMESTAMPTZ default current_timestamp()
) WITH (ttl_expire_after = '3 months', ttl_job_cron = '@daily');
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

### Add or update the row-level TTL for an existing table

To add or change the row-level TTL expiration for an existing table, use [`ALTER TABLE`]({% link {{page.version.version}}/alter-table.md %}) as shown in the following example. This example assumes you have an existing [`TIMESTAMPTZ`]({% link {{page.version.version}}/timestamp.md %}) or [`DATE`]({% link {{page.version.version}}/date.md %}) column you can use for the [`ttl_expiration_expression`](#param-ttl-expiration-expression).

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE events_using_date SET (ttl_expiration_expression = $$(end_date::TIMESTAMPTZ + '90 days')$$);
~~~

~~~
ALTER TABLE
~~~

### View scheduled TTL jobs

You can use [`SHOW SCHEDULES`]({% link {{ page.version.version }}/show-schedules.md %}) to view all TTL-related scheduled jobs by executing the following query:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW SCHEDULES;
~~~

~~~
          id         |                          label                          | schedule_status |        next_run        |  state  | recurrence  | jobsrunning | owner |            created            | on_previous_running | on_execution_failure |     command
---------------------+---------------------------------------------------------+-----------------+------------------------+---------+-------------+-------------+-------+-------------------------------+---------------------+----------------------+-------------------
  935320932302127105 | sql-stats-compaction                                    | ACTIVE          | 2024-01-17 17:00:00+00 | pending | @hourly     |           0 | node  | 2024-01-17 16:08:16.061494+00 | SKIP                | RETRY_SCHED          | {}
  935320932701732865 | sql-schema-telemetry                                    | ACTIVE          | 2024-01-23 19:22:00+00 | pending | 22 19 * * 2 |           0 | node  | 2024-01-17 16:08:16.34813+00  | SKIP                | RETRY_SCHED          | {}
  935326966421323777 | row-level-ttl: ttl_test_per_row [166]                   | ACTIVE          | 2024-01-18 00:00:00+00 | NULL    | @daily      |           0 | root  | 2024-01-17 16:38:57.67189+00  | WAIT                | RETRY_SCHED          | {"tableId": 166}
  935327228200321025 | row-level-ttl: ttl_test_per_table [168]                 | ACTIVE          | 2024-01-18 00:00:00+00 | NULL    | @daily      |           0 | root  | 2024-01-17 16:40:17.560295+00 | WAIT                | RETRY_SCHED          | {"tableId": 168}
  935327358744035329 | row-level-ttl: ttl_test_ttl_expiration_expression [169] | ACTIVE          | 2024-01-18 00:00:00+00 | NULL    | @daily      |           0 | root  | 2024-01-17 16:40:57.400097+00 | WAIT                | RETRY_SCHED          | {"tableId": 169}
  935327502619377665 | row-level-ttl: events_using_date [171]                  | ACTIVE          | 2024-01-18 00:00:00+00 | NULL    | @daily      |           0 | root  | 2024-01-17 16:41:41.306759+00 | WAIT                | RETRY_SCHED          | {"tableId": 171}
  935327535652569089 | row-level-ttl: events_using_timestamptz [172]           | ACTIVE          | 2024-01-18 00:00:00+00 | NULL    | @daily      |           0 | root  | 2024-01-17 16:41:51.377205+00 | WAIT                | RETRY_SCHED          | {"tableId": 172}
  935327578138443777 | row-level-ttl: events [173]                             | ACTIVE          | 2024-01-18 00:00:00+00 | NULL    | @daily      |           0 | root  | 2024-01-17 16:42:04.354076+00 | WAIT                | RETRY_SCHED          | {"tableId": 173}
(8 rows)
~~~

### View running TTL jobs

You can use [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}) to see any running TTL jobs by executing the following query:

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
You can also view running TTL jobs using the [Jobs page in the DB Console]({% link {{ page.version.version }}/ui-jobs-page.md %})
{{site.data.alerts.end}}

### View TTL storage parameters on a table

To view TTL storage parameters on a table, you can use [`SHOW CREATE TABLE`]({% link {{ page.version.version }}/show-create.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE TABLE events;
~~~

~~~
  table_name |                                                                                         create_statement
-------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  events     | CREATE TABLE public.events (
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     description STRING NULL,
             |     inserted_at TIMESTAMPTZ NULL DEFAULT current_timestamp():::TIMESTAMPTZ,
             |     crdb_internal_expiration TIMESTAMPTZ NOT VISIBLE NOT NULL DEFAULT current_timestamp():::TIMESTAMPTZ + '3 mons':::INTERVAL ON UPDATE current_timestamp():::TIMESTAMPTZ + '3 mons':::INTERVAL,
             |     CONSTRAINT events_pkey PRIMARY KEY (id ASC)
             | ) WITH (ttl = 'on', ttl_expire_after = '3 mons':::INTERVAL, ttl_job_cron = '@daily')
(1 row)
~~~

You can also use the following query:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT relname, reloptions FROM pg_class WHERE relname = 'events';
~~~

~~~
  relname |                                reloptions
----------+---------------------------------------------------------------------------
  events  | NULL
  events  | {ttl='on',"ttl_expire_after='3 mons':::INTERVAL",ttl_job_cron='@daily'}
(2 rows)
~~~

### Control how often the TTL job runs

Setting a TTL on a table controls when the rows therein are considered expired, but it only says that such rows _may_ be deleted at any time after the expiration. To control how often the TTL deletion job runs, use the [`ttl_job_cron` storage parameter](#param-ttl-job-cron), which supports [CRON syntax](https://cron.help). Cockroach Labs recommends setting `ttl_job_cron` to be equal to or longer than the [`gc.ttlseconds`]({% link {{ page.version.version }}/configure-replication-zones.md %}#gc-ttlseconds) setting, which is the garbage collection interval for the cluster. The default value of `gc.ttlseconds` is 14400, or 4 hours. The CRON pattern for every four hours is `'0 */4 * * *'`.

To control the job interval at [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %}) time, add the storage parameter as shown below:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE tbl (
  id UUID PRIMARY KEY default gen_random_uuid(),
  value TEXT
) WITH (ttl_expire_after = '3 weeks', ttl_job_cron = '0 */4 * * *');
~~~

~~~
CREATE TABLE
~~~

{{site.data.alerts.callout_info}}
To set the [`ttl_job_cron` storage parameter](#param-ttl-job-cron) when creating a table with Row-Level TTL, you must also set either the [`ttl_expire_after`](#param-ttl-expire-after) parameter or the [`ttl_expiration_expression`](#param-ttl-expiration-expression) parameter.
{{site.data.alerts.end}}

To update the TTL deletion job interval on a table that already has Row-Level TTL enabled, use [`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %}):

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

To fetch only those rows from a table with [table-wide TTL](#create-a-table-with-ttl_expire_after) that have not yet expired their TTL, use the [hidden `crdb_internal_expiration` column](#crdb-internal-expiration):

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

To fetch only those rows from a table with [a `ttl_expiration_expression`](#create-a-table-with-a-ttl_expiration_expression) that have not yet expired their TTL, use the `expired_at` column you created earlier:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM ttl_test_per_row WHERE expired_at > now();
~~~

### Reset a storage parameter to its default value

To reset a [TTL storage parameter](#ttl-storage-parameters) to its default value, use the [`ALTER TABLE`]({% link {{ page.version.version }}/alter-table.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE events RESET (ttl_job_cron);
~~~

~~~
ALTER TABLE
~~~

### Remove Row-Level TTL from a table

To drop the TTL on an existing table, reset the [`ttl` storage parameter](#param-ttl).

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE events RESET (ttl);
~~~

If both [`ttl_expire_after`](#param-ttl-expire-after) and [`ttl_expiration_expression`](#param-ttl-expiration-expression) are set, and you want to remove one or the other, you can use either of:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE events RESET (ttl_expire_after);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE events_using_date RESET (ttl_expiration_expression);
~~~

### Disable TTL jobs for the whole cluster

To disable TTL jobs for the whole cluster, set the `sql.ttl.job.enabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to `false`:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING sql.ttl.job.enabled = false;
~~~

~~~
SET CLUSTER SETTING
~~~

### View TTL-related cluster settings

To view the [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) that control how Row-Level TTL works, issue the following query:

{% include_cached copy-clipboard.html %}
~~~ sql
WITH x AS (SHOW CLUSTER SETTINGS) SELECT * FROM x WHERE variable LIKE 'sql.ttl.%';
~~~

~~~
              variable              | value | setting_type |                                 description
------------------------------------+-------+--------------+------------------------------------------------------------------------------
  sql.ttl.default_delete_batch_size | 100   | i            | default amount of rows to delete in a single query during a TTL job
  sql.ttl.default_delete_rate_limit | 100   | i            | default delete rate limit for all TTL jobs. Use 0 to signify no rate limit.
  sql.ttl.default_select_batch_size | 500   | i            | default amount of rows to select in a single query during a TTL job
  sql.ttl.default_select_rate_limit | 0     | i            | default select rate limit for all TTL jobs. Use 0 to signify no rate limit.
  sql.ttl.job.enabled               | false | b            | whether the TTL job is enabled
(6 rows)
~~~

## Common errors

If you attempt to update a [TTL storage parameter](#ttl-storage-parameters) on a table that does not have TTL enabled, you will get an error as shown below:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE events SET (ttl_job_cron = '@weekly');
~~~

~~~
ERROR: "ttl_expire_after" and/or "ttl_expiration_expression" must be set
SQLSTATE: 22023
~~~

If you try to reset a [TTL storage parameter](#ttl-storage-parameters) but resetting that parameter would result in an invalid state of the TTL subsystem, CockroachDB will signal an error. For example, there is only one way to [remove Row-Level TTL from a table](#remove-row-level-ttl-from-a-table). If you try to remove the TTL from a table by resetting the `ttl_expire_after` storage parameter you set earlier, you will get the following error:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE tbl RESET (ttl_expire_after);
~~~

~~~
ERROR: "ttl_expire_after" and/or "ttl_expiration_expression" must be set
SQLSTATE: 22023
~~~

## Changefeeds

Row-level TTL interacts with [changefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}) in the following ways:

- When expired rows are deleted, a [changefeed delete message]({% link {{ page.version.version }}/changefeed-messages.md %}#delete-messages) is emitted.

### Filter changefeeds for tables using row-level TTL

{% include {{ page.version.version }}/cdc/disable-replication-ttl.md %}

For guidance on how to filter changefeed messages to emit row-level TTL deletes only, refer to [Change Data Capture Queries]({% link {{ page.version.version }}/cdc-queries.md %}#reference-ttl-in-a-cdc-query).

## Backup and restore

Row-level TTL interacts with [backup and restore]({% link {{ page.version.version }}/backup-and-restore-overview.md %}) in the following ways:

- When you run a [`BACKUP`]({% link {{ page.version.version }}/backup.md %}), all row-level TTL information associated with the tables being backed up (including TTL expiration times) is also backed up.

- When you [`RESTORE`]({% link {{ page.version.version }}/restore.md %}) from a backup, all row-level TTL information associated with the tables being restored (including TTL expiration times) is also restored. Any expired rows in the restored tables are eligible to be [deleted](#when-are-rows-deleted) by the [TTL job](#how-it-works).

## Required Privileges

To add or update Row-Level TTL settings on a table, you must have one of the following:

- Membership to the [owner]({% link {{ page.version.version }}/security-reference/authorization.md %}#object-ownership) role for the database where the table is located.
- The [`CREATE` or `ALTER` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) on the database where the table is located.

## Migrating TTL usage from earlier versions of CockroachDB

If you are migrating your TTL usage from an earlier version of CockroachDB, the `ttl_expire_after` and `ttl_expiration_expression` storage parameters can co-exist where the `ttl_expire_after` creates the `crdb_internal_expiration` column and `ttl_expiration_expression` overrides the default value of `crdb_internal_expiration`.

## Known limitations

{% include {{page.version.version}}/known-limitations/row-level-ttl-limitations.md %}

## See also

- [Bulk-delete Data]({% link {{ page.version.version }}/bulk-delete-data.md %})
- [Delete data]({% link {{ page.version.version }}/delete-data.md %})
- [`DELETE`]({% link {{ page.version.version }}/delete.md %})
- [`SELECT` clause]({% link {{ page.version.version }}/select-clause.md %})
- [`AS OF SYSTEM TIME`]({% link {{ page.version.version }}/as-of-system-time.md %})
- [`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %})
- [`INTERVAL`]({% link {{ page.version.version }}/interval.md %})
- [SQL Performance Best Practices]({% link {{ page.version.version }}/performance-best-practices-overview.md %})
- [Developer Guide Overview]({% link {{ page.version.version }}/developer-guide-overview.md %})
