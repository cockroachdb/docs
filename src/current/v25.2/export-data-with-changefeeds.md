---
title: Export Data with Changefeeds
summary: Use changefeeds to export table data from CockroachDB
toc: true
docs_area: stream_data
---

When you create a changefeed, you can include the [`initial_scan = 'only'`]({% link {{ page.version.version }}/create-changefeed.md %}#initial-scan) option to specify that the changefeed should only complete a table scan. The changefeed emits messages for the table scan and then the job completes with a `succeeded` status. As a result, you can create a changefeed with `initial_scan = 'only'` to [`EXPORT`]({% link {{ page.version.version }}/export.md %}) data out of your database.

You can also [schedule a changefeed](#create-a-scheduled-changefeed-to-export-filtered-data) that is emitting messages to a downstream sink, which allows you to use a changefeed initial scan for exporting data on a regular cadence.

The benefits of using changefeeds for this use case instead of [export]({% link {{ page.version.version }}/export.md %}), include:

- Changefeeds are jobs, which can be [paused]({% link {{ page.version.version }}/pause-job.md %}), [resumed]({% link {{ page.version.version }}/resume-job.md %}), [cancelled]({% link {{ page.version.version }}/cancel-job.md %}), [scheduled]({% link {{ page.version.version }}/create-schedule-for-changefeed.md %}), and [altered]({% link {{ page.version.version }}/alter-changefeed.md %}).
- There is observability into a changefeed job using [`SHOW CHANGEFEED JOBS`]({% link {{ page.version.version }}/show-jobs.md %}#show-changefeed-jobs) and the [Changefeeds Dashboard]({% link {{ page.version.version }}/ui-cdc-dashboard.md %}) in the DB Console.
- Changefeed jobs have built-in [checkpointing]({% link {{ page.version.version }}/how-does-a-changefeed-work.md %}) and [retries]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#changefeed-retry-errors).
- [Changefeed sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}) provide additional endpoints for your data.
- You can use the [`format=csv`]({% link {{ page.version.version }}/create-changefeed.md %}#format) option with `initial_scan= 'only'` to emit messages in CSV format.

{% include {{ page.version.version }}/cdc/csv-changefeed-format.md %}

## Message formats

{% include {{ page.version.version }}/cdc/message-format-list.md %}

## Examples

### Export data with a changefeed

To create a changefeed that will only complete an initial scan of a table(s), run the following:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE movr.users INTO '{scheme}://{host}:{port}?{query_parameters}' WITH initial_scan = 'only', format=csv;
~~~

Or, use [CDC queries]({% link {{ page.version.version }}/cdc-queries.md %}) to filter the data that your changefeed emits:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED INTO '{scheme}://{host}:{port}?{query_parameters}'
  WITH initial_scan = 'only', format=csv AS SELECT name, city FROM movr.users;
~~~

The job will return a job ID once it has started. You can use `SHOW CHANGEFEED JOBS` to check on the status:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CHANGEFEED JOB {job ID};
~~~

When the scan has completed you will find the output shows `succeeded` in the `status` field.

### Create a scheduled changefeed to export filtered data

{% include {{ page.version.version }}/cdc/schedule-query-example.md %}

### Video Demo

For a demo on how to use changefeeds to export large amounts of data, watch the following video:

{% include_cached youtube.html video_id="UXsKuXbkjws" %}

## See also

- [Changefeed Messages]({% link {{ page.version.version }}/changefeed-messages.md %})
- [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %})
- [`CREATE SCHEDULE FOR CHANGEFEED`]({% link {{ page.version.version }}/create-schedule-for-changefeed.md %})