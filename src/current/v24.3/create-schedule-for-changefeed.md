---
title: CREATE SCHEDULE FOR CHANGEFEED
summary: The CREATE SCHEDULE FOR CHANGEFEED statement creates a schedule for periodic changefeeds.
toc: true
docs_area: reference.sql
---

`CREATE SCHEDULE FOR CHANGEFEED` allows you to create a scheduled changefeed to export data out of CockroachDB. Scheduled changefeeds have the scale, observability, and endpoint sink options that changefeed jobs include, with the convenience of setting a regular schedule. A changefeed job created with `CREATE SCHEDULE FOR CHANGEFEED` performs a one-time table scan using the [initial scan]({% link {{ page.version.version }}/create-changefeed.md %}#initial-scan) functionality to create an export of your table data.

For more detail on using changefeeds to create an export of your table data, see [Export Data with Changefeeds]({% link {{ page.version.version }}/export-data-with-changefeeds.md %}).

## Required privileges

{% include {{ page.version.version }}/cdc/privilege-model.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_schedule_for_changefeed.html %}
</div>

### Parameters

Parameter | Description
----------+------------
`IF NOT EXISTS` | A scheduled changefeed should not be created if the `schedule_label` already exists. You will receive an error if the schedule label already exists, or if `schedule_label` is not defined when using `IF NOT EXISTS`.
`schedule_label` | The name for the scheduled changefeed. This is optional and does not need to be unique. If you do not define a name, the label will default to `CHANGEFEED` with the timestamp of when you created the schedule.
`changefeed_targets` | The tables to target with the changefeed. For example, `movr.users, movr.rides`.
`changefeed_sink` | The [changefeed sink URI]({% link {{ page.version.version }}/changefeed-sinks.md %}).
`changefeed_option` | The [options]({% link {{ page.version.version }}/create-changefeed.md %}#options) to control the behavior of your changefeed. For example, `WITH format = csv, full_table_name`. See [Changefeed options](#changefeed-options) for a list of available options.
`target_list` | The columns to emit data from if you're using a [CDC query]({% link {{ page.version.version }}/cdc-queries.md %}) expression.
`insert_target` | The target tables for the changefeed if you're using a [CDC query]({% link {{ page.version.version }}/cdc-queries.md %}) expression.
`where_clause` | An optional `WHERE` clause to apply filters to the table if you're using a [CDC query]({% link {{ page.version.version }}/cdc-queries.md %}) expression.
`crontab` | The frequency of the changefeed. The schedule is specified as a `STRING` in [crontab format](https://wikipedia.org/wiki/Cron). All times in UTC. For example, `'@daily'`, `'@hourly'`, `'1 0 * * *'`.
`schedule_option` | The schedule options to control the schedule's behavior. For example, `first_run = now`. See [Schedule options](#schedule-options).

## Changefeed options

You can include the changefeed options listed on the [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}#options) page to modify the behavior of your changefeed. The following options are **not** compatible with scheduled changefeeds:

- `diff`
- `end_time`
- `mvcc_timestamp`
- `resolved`
- `updated`

Scheduled changefeeds have the [`initial_scan = 'only'`]({% link {{ page.version.version }}/create-changefeed.md %}#initial-scan) option included implicitly. You cannot specify `initial_scan` as `'yes'` or `'no'`.

## Schedule options

Option | Value | Description
-------+-------+-------------
`first_run` | [`TIMESTAMP`]({% link {{ page.version.version }}/timestamp.md %}) / `now` | Execute the first run of the schedule at this time. If you do not specify `first_run`, the schedule will execute based on the next `RECURRING` time set by the crontab.
`on_execution_failure` | `retry` / `reschedule` / `pause` | Determine how the schedule handles an error. <br><br>`retry`: Retry the changefeed immediately.<br><br>`reschedule`: Reschedule the changefeed based on the `RECURRING` expression.<br><br>`pause`: Pause the schedule. This requires that you [resume the schedule]({% link {{ page.version.version }}/resume-schedules.md %}) manually.<br><br>**Default:** `reschedule`
`on_previous_running` | `start` / `skip` / `wait` | Control whether the changefeed schedule should start a changefeed if the previous scheduled changefeed is still running.<br><br>`start`: Start the new changefeed anyway, even if the previous one is running.<br><br>`skip`: Skip the new changefeed and run the next changefeed based on the `RECURRING` expression.<br><br>`wait`: Wait for the previous changefeed to complete.<br><br>**Default:** `wait`

{{site.data.alerts.callout_info}}
To avoid multiple clusters running the same schedule concurrently, changefeed schedules will [pause]({% link {{ page.version.version }}/pause-schedules.md %}) when [restored]({% link {{ page.version.version }}/restore.md %}) onto a different cluster or after [physical cluster replication]({% link {{ page.version.version }}/failover-replication.md %}) has completed.
{{site.data.alerts.end}}

## Examples

Before running any of the examples in this section, it is necessary to enable the `kv.rangefeed.enabled` cluster setting. If you are working on a CockroachDB {{ site.data.products.standard }} or {{ site.data.products.basic }} cluster, this cluster setting is enabled by default.

The [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}) page provides detail on the available sinks for your change data messages and connection URIs. We recommend using [external connections]({% link {{ page.version.version }}/create-external-connection.md %}) to interact with external sinks. The examples in this section use an external connection URI for the changefeed sink.

### Create a scheduled changefeed

The following statement sets up a scheduled changefeed named `users_rides_nightly` that will send changefeed messages in `CSV` format 1 minute past midnight every night. As soon as the statement is run, the first changefeed run will execute immediately:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE SCHEDULE users_rides_nightly FOR CHANGEFEED users, rides INTO 'external://kafka-sink' WITH format=csv RECURRING '1 0 * * *' WITH SCHEDULE OPTIONS first_run=now, on_execution_failure=retry, on_previous_running=skip;
~~~

The [schedule options]({% link {{ page.version.version }}/create-schedule-for-changefeed.md %}#schedule-options) control the schedule's behavior:

- If it runs into an error, `on_execution_failure=retry` will ensure that the schedule retries the changefeed immediately.
- If the previous scheduled changefeed is still running, `on_previous_running=skip` will skip a new changefeed at the next scheduled time.

The output will confirm that the changefeed has added the `initial_scan = 'only'` option implicitly:

~~~
     schedule_id     |     label     | status |           first_run           | schedule  |                                                      changefeed_stmt
---------------------+---------------+--------+-------------------------------+-----------+---------------------------------------------------------------------------------------------------------------------------------------------------------
  947257854259855361 | users_nightly | ACTIVE | 2024-02-28 20:02:35.716699+00 | 1 0 * * * | CREATE CHANGEFEED FOR TABLE movr.public.users, TABLE movr.public.rides INTO 'external://kafka-sink' WITH OPTIONS (format = 'csv', initial_scan = 'only')
(1 row)

NOTICE: added missing initial_scan='only' option to schedule changefeed
~~~

### Create a scheduled changefeed with CDC queries

You can use CDC queries with scheduled changefeeds to define expression syntax that selects columns and applies filters to further restrict or transform the data in your changefeed messages. When you add this expression syntax to your changefeed statement, you can only target one table.

For guidance on syntax and more example use cases, see [Change Data Capture Queries]({% link {{ page.version.version }}/cdc-queries.md %}).

This scheduled changefeed filters for the usage of promotion codes in the [`movr`]({% link {{ page.version.version }}/movr.md %}) database and sends the changefeed messages on a daily basis:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE SCHEDULE promo_code FOR CHANGEFEED INTO 'external://kafka-sink' AS SELECT user_id, usage_count FROM movr.user_promo_codes WHERE usage_count > 1 RECURRING '@daily' WITH SCHEDULE OPTIONS first_run=now, on_execution_failure=reschedule, on_previous_running=skip;
~~~

### View scheduled changefeed details

To [show]({% link {{ page.version.version }}/show-schedules.md %}) all scheduled changefeeds:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW SCHEDULES FOR CHANGEFEED;
~~~

To view the details of only running scheduled changefeeds:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW RUNNING SCHEDULES FOR CHANGEFEED;
~~~

To view the details of only paused scheduled changefeeds:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW PAUSED SCHEDULES FOR CHANGEFEED;
~~~

To view the details of a specific scheduled changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW SCHEDULE {schedule ID};
~~~

To [pause]({% link {{ page.version.version }}/pause-schedules.md %}) a scheduled changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
PAUSE SCHEDULE {schedule ID};
~~~

To [resume]({% link {{ page.version.version }}/resume-schedules.md %}) a scheduled changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
RESUME SCHEDULE {schedule ID};
~~~

To [delete]({% link {{ page.version.version }}/drop-schedules.md %}) a scheduled changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP SCHEDULE {schedule ID};
~~~

To see the full [`CREATE SCHEDULE` statement]({% link {{ page.version.version }}/show-create-schedule.md %}) for the scheduled changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CREATE SCHEDULE {schedule ID};
~~~

## See also

- [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %})
- [Change Data Capture Queries]({% link {{ page.version.version }}/cdc-queries.md %})
- [Export Data with Changefeeds]({% link {{ page.version.version }}/export-data-with-changefeeds.md %})
- [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %})