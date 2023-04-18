---
title: Export Data with Changefeeds
summary: Use changefeeds to export table data from CockroachDB
toc: true
docs_area: stream_data
---

When you create an {{ site.data.products.enterprise }} changefeed, you can include the [`initial_scan = 'only'`](create-changefeed.html#initial-scan) option to specify that the changefeed should only complete a table scan. The changefeed emits messages for the table scan and then the job completes with a `succeeded` status. As a result, you can create a changefeed with `initial_scan = 'only'` to [export](export.html) data out of your database.  

The benefits of using changefeeds for this function compared to an export, include:

- Changefeeds are jobs, which can be [paused](pause-job.html), [resumed](resume-job.html), and [cancelled](cancel-job.html).
- There is observability into a changefeed job using [`SHOW CHANGEFEED JOBS`](show-jobs.html#show-changefeed-jobs) and the [Changefeeds Dashboard](ui-cdc-dashboard.html) in the DB Console.
- [Changefeed sinks](changefeed-sinks.html) provide additional endpoints to send your data.
- You can use the [`format=csv`](create-changefeed.html#format) option with `initial_scan= 'only'` to emit messages in CSV format.

{% include {{ page.version.version }}/cdc/csv-changefeed-format.md %}

## Examples

### Export data with changefeeds

To create a changefeed that will only complete an initial scan of a table(s), run the following:

~~~ sql
CREATE CHANGEFEED FOR TABLE movr.users INTO '{scheme}://{host}:{port}?{query_parameters}' WITH initial_scan = 'only', format=csv;
~~~

The job will return a job ID once it has started. You can use `SHOW CHANGEFEED JOBS` to check on the status:

~~~ sql
SHOW CHANGEFEED JOB {job ID};
~~~

When the scan has completed you will find the output shows `succeeded` in the `status` field.

### Export filtered data with changefeeds

{{site.data.alerts.callout_info}}
CDC transformations are in [preview](https://www.cockroachlabs.com/docs/v22.2/cockroachdb-feature-availability).
{{site.data.alerts.end}}

Use CDC transformations with the `initial_scan = 'only'` option to run a changefeed to export specific columns from your table:

~~~ sql
CREATE CHANGEFEED INTO '{scheme}://{host}:{port}?{query_parameters}' 
  WITH initial_scan = 'only', format=csv, schema_change_policy = 'stop' 
  AS SELECT name, city FROM movr.users;
~~~

See the [Change Data Capture Transformations](cdc-transformations.html) page for more examples.

## See also

- [Changefeed Messages](changefeed-messages.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)