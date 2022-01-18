---
title: Create and Configure Changefeeds
summary: Create and configure a changefeed job for core and enterprise.
toc: true
---

## Create a changefeed (Core)

A core changefeed streams row-level changes to the client indefinitely until the underlying connection is closed or the changefeed is canceled.

To create a core changefeed:

{% include copy-clipboard.html %}
~~~ sql
> EXPERIMENTAL CHANGEFEED FOR name;
~~~

For more information, see [`CHANGEFEED FOR`](changefeed-for.html).

## Configure a changefeed (Enterprise)

An Enterprise changefeed streams row-level changes in a configurable format to a configurable sink (i.e., Kafka or a cloud storage sink). You can [create](#create), [pause](#pause), [resume](#resume), [cancel](#cancel), [monitor](#monitor-a-changefeed), and [debug](#debug-a-changefeed) an Enterprise changefeed.

### Create

To create an Enterprise changefeed:

{% include copy-clipboard.html %}
~~~ sql
> CREATE CHANGEFEED FOR TABLE table_name, table_name2 INTO '{scheme}://{host}:{port}?{query_parameters}';
~~~

{% include {{ page.version.version }}/cdc/url-encoding.md %}

For more information, see [`CREATE CHANGEFEED`](create-changefeed.html).

### Pause

To pause an Enterprise changefeed:

{% include copy-clipboard.html %}
~~~ sql
> PAUSE JOB job_id;
~~~

For more information, see [`PAUSE JOB`](pause-job.html).

### Resume

To resume a paused Enterprise changefeed:

{% include copy-clipboard.html %}
~~~ sql
> RESUME JOB job_id;
~~~

For more information, see [`RESUME JOB`](resume-job.html).

### Cancel

To cancel an Enterprise changefeed:

{% include copy-clipboard.html %}
~~~ sql
> CANCEL JOB job_id;
~~~

For more information, see [`CANCEL JOB`](cancel-job.html).

### Configuring all changefeeds

{% include {{ page.version.version }}/cdc/configure-all-changefeed.md %}
