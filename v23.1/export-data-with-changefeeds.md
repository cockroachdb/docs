---
title: Export Data with Changefeeds
summary: Use changefeeds to export table data from CockroachDB
toc: true
docs_area: stream_data
---

When you create an {{ site.data.products.enterprise }} changefeed, you can include the [`initial_scan = 'only'`](create-changefeed.html#initial-scan) option to specify that the changefeed should only complete a table scan. The changefeed emits messages for the table scan and then the job completes with a `succeeded` status. As a result, you can create a changefeed with `initial_scan = 'only'` to [export](export.html) data out of your database. 

{% include_cached new-in.html version="v23.1" %} You can also [schedule a changefeed](#create-a-scheduled-changefeed-to-export-data) to use a changefeed initial scan for exporting data on a regular cadence. 

The benefits of using changefeeds for this use case compared to an export, include:

- Changefeeds are jobs, which can be [paused](pause-job.html), [resumed](resume-job.html), and [cancelled](cancel-job.html).
- There is observability into a changefeed job using [`SHOW CHANGEFEED JOBS`](show-jobs.html#show-changefeed-jobs) and the [Changefeeds Dashboard](ui-cdc-dashboard.html) in the DB Console.
- [Changefeed sinks](changefeed-sinks.html) provide additional endpoints to send your data.
- You can use the [`format=csv`](create-changefeed.html#format) option with `initial_scan= 'only'` to emit messages in CSV format.

{% include {{ page.version.version }}/cdc/csv-changefeed-format.md %}

## Examples

### Export data with a changefeed

To create a changefeed that will only complete an initial scan of a table(s), run the following:

~~~ sql
CREATE CHANGEFEED FOR TABLE movr.users INTO '{scheme}://{host}:{port}?{query_parameters}' WITH initial_scan = 'only', format=csv;
~~~

The job will return a job ID once it has started. You can use `SHOW CHANGEFEED JOBS` to check on the status:

~~~ sql
SHOW CHANGEFEED JOB {job ID};
~~~

When the scan has completed you will find the output shows `succeeded` in the `status` field.

### Create a scheduled changefeed to export data

This example creates a nightly export of some filtered table data with a scheduled changefeed that will run just after midnight every night. The changefeed uses [CDC transformations](cdc-transformations.html) to query the table and filter the data it will send to the sink: 

~~~ sql
CREATE SCHEDULE sf_skateboard FOR CHANGEFEED INTO 'external://cloud-sink' WITH format=csv AS SELECT current_location AS sf_address, id, type, status FROM vehicles WHERE city = 'san francisco' AND type = 'skateboard' RECURRING '1 0 * * *' WITH SCHEDULE OPTIONS on_execution_failure=retry, on_previous_running=start;
~~~

The [schedule options](create-schedule-for-changefeed.html#schedule-options) control the schedule's behavior:

- If it runs into a failure, `on_execution_failure=retry` will ensure that the schedule retries the changefeed immediately. 
- If the previous scheduled changefeed is still running, `on_previous_running=start` will start a new changefeed at the defined cadence.

## See also

- [Changefeed Messages](changefeed-messages.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)