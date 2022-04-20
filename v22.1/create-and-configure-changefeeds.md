---
title: Create and Configure Changefeeds
summary: Create and configure a changefeed job for Core and Enterprise.
toc: true
docs_area: stream_data
---

Core and {{ site.data.products.enterprise }} changefeeds offer different levels of configurability. {{ site.data.products.enterprise }} changefeeds allow for active changefeed jobs to be [paused](#pause), [resumed](#resume), and [canceled](#cancel).

## Create a changefeed (Core)

A core changefeed streams row-level changes to the client indefinitely until the underlying connection is closed or the changefeed is canceled.

To create a core changefeed:

{% include copy-clipboard.html %}
~~~ sql
> EXPERIMENTAL CHANGEFEED FOR table_name;
~~~

For more information, see [`EXPERIMENTAL CHANGEFEED FOR`](changefeed-for.html).

## Configure a changefeed ({{ site.data.products.enterprise }})

An {{ site.data.products.enterprise }} changefeed streams row-level changes in a configurable format to a configurable sink (i.e., Kafka or a cloud storage sink). You can [create](#create), [pause](#pause), [resume](#resume), and [cancel](#cancel) an {{ site.data.products.enterprise }} changefeed.

### Create

To create an {{ site.data.products.enterprise }} changefeed:

{% include copy-clipboard.html %}
~~~ sql
> CREATE CHANGEFEED FOR TABLE table_name, table_name2 INTO '{scheme}://{host}:{port}?{query_parameters}';
~~~

{% include {{ page.version.version }}/cdc/url-encoding.md %}

For more information, see [`CREATE CHANGEFEED`](create-changefeed.html).

### Pause

To pause an {{ site.data.products.enterprise }} changefeed:

{% include copy-clipboard.html %}
~~~ sql
> PAUSE JOB job_id;
~~~

For more information, see [`PAUSE JOB`](pause-job.html).

### Resume

To resume a paused {{ site.data.products.enterprise }} changefeed:

{% include copy-clipboard.html %}
~~~ sql
> RESUME JOB job_id;
~~~

For more information, see [`RESUME JOB`](resume-job.html).

### Cancel

To cancel an {{ site.data.products.enterprise }} changefeed:

{% include copy-clipboard.html %}
~~~ sql
> CANCEL JOB job_id;
~~~

For more information, see [`CANCEL JOB`](cancel-job.html).

### Modify a changefeed

{% include {{ page.version.version }}/cdc/modify-changefeed.md %}

### Configuring all changefeeds

{% include {{ page.version.version }}/cdc/configure-all-changefeed.md %}

## See also

- [`SHOW JOBS`](show-jobs.html)
- [`EXPERIMENTAL CHANGEFEED FOR`](changefeed-for.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
