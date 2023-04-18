---
title: Export Data with Changefeeds
summary: Use changefeeds to export table data from CockroachDB
toc: true
docs_area: stream_data
---

When you create an {{ site.data.products.enterprise }} changefeed, you can include the [`initial_scan = 'only'`](create-changefeed.html#initial-scan) option to specify that the changefeed should only complete a table scan. The changefeed emits messages for the table scan and then the job completes with a `succeeded` status. As a result, you can create a changefeed with `initial_scan = 'only'` to [export](export.html) data out of your database. 

{% include_cached new-in.html version="v23.1" %} You can also [schedule a changefeed](#create-a-scheduled-changefeed-to-export-filtered-data) to use a changefeed initial scan for exporting data on a regular cadence. 

The benefits of using changefeeds for this use case compared to an export, include:

- Changefeeds are jobs, which can be [paused](pause-job.html), [resumed](resume-job.html), and [cancelled](cancel-job.html).
- There is observability into a changefeed job using [`SHOW CHANGEFEED JOBS`](show-jobs.html#show-changefeed-jobs) and the [Changefeeds Dashboard](ui-cdc-dashboard.html) in the DB Console.
- [Changefeed sinks](changefeed-sinks.html) provide additional endpoints to send your data.
- You can use the [`format=csv`](create-changefeed.html#format) option with `initial_scan= 'only'` to emit messages in CSV format.

{% include {{ page.version.version }}/cdc/csv-changefeed-format.md %}

## Examples

### Export data with a changefeed

To create a changefeed that will only complete an initial scan of a table(s), run the following:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE movr.users INTO '{scheme}://{host}:{port}?{query_parameters}' WITH initial_scan = 'only', format=csv;
~~~

Or, use [CDC queries](cdc-queries.html) to filter the data that your changefeed emits:

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

## See also

- [Changefeed Messages](changefeed-messages.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
- [`CREATE SCHEDULE FOR CHANGEFEED`](create-schedule-for-changefeed.html)