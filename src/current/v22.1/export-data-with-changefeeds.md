---
title: Export Data with Changefeeds
summary: Use changefeeds to export table data from CockroachDB
toc: true
docs_area: stream_data
---

{% include_cached new-in.html version="v22.1" %} When you create an {{ site.data.products.enterprise }} changefeed, you can include the [`initial_scan = 'only'`](create-changefeed.html#initial-scan) option to specify that the changefeed should only complete a table scan. The changefeed emits messages for the table scan and then the job completes with a `succeeded` status. As a result, you can create a changefeed with `initial_scan = 'only'` to [export](export.html) data out of your database.  

The benefits of using changefeeds for this function compared to an export, include:

- Changefeeds are jobs, which can be [paused](pause-job.html), [resumed](resume-job.html), and [cancelled](cancel-job.html).
- There is observability into a changefeed job using [`SHOW CHANGEFEED JOBS`](show-jobs.html#show-changefeed-jobs) and the [Changefeeds Dashboard](ui-cdc-dashboard.html) in the DB Console.
- [Changefeed sinks](changefeed-sinks.html) provide additional endpoints to send your data.
- You can use the [`format=csv`](create-changefeed.html#format) option with `initial_scan= 'only'` to emit messages in CSV format.

Although this option offers an alternative way to export data out of your database, it is necessary to consider the following when you use [`CREATE CHANGEFEED`](create-changefeed.html) instead of [`EXPORT`](export.html):

- Changefeeds do not offer any [filtering capabilities](export.html#export-using-a-select-statement).
- Changefeeds can emit [duplicate messages](changefeed-messages.html#ordering-guarantees).

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/cdc/initial-scan-limit-alter-changefeed.md %}
{{site.data.alerts.end}}

To create a changefeed that will only complete an initial scan of a table(s), run the following:

~~~ sql
CREATE CHANGEFEED FOR TABLE movr.users INTO '{scheme}://{host}:{port}?{query_parameters}' WITH initial_scan = 'only', format=csv;
~~~

The job will return a job ID once it has started. You can use `SHOW CHANGEFEED JOBS` to check on the status:

~~~ sql
SHOW CHANGEFEED JOB {job ID};
~~~

When the scan has completed you will find the output shows `succeeded` in the `status` field.

## See also

- [Changefeed Messages](changefeed-messages.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)