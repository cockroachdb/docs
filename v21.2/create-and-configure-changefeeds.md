---
title: Create and Configure Changefeeds
summary: Create and configure a changefeed job for Core and Enterprise.
toc: true
docs_area: stream_data
---

Core and {{ site.data.products.enterprise }} changefeeds offer different levels of configurability. {{ site.data.products.enterprise }} changefeeds allow for active changefeed jobs to be [paused](#pause), [resumed](#resume), and [canceled](#cancel).

When creating a changefeed, it's important to consider the number of changefeeds versus the number of tables to include in a single changefeed:

  - Changefeeds do not share internal buffers, so each running changefeed will increase total memory usage. To watch multiple tables, we recommend creating a changefeed with a comma-separated list of tables.
  - Creating a single changefeed that will watch hundreds of tables can affect the performance of a changefeed by introducing coupling. For example, any [schema change](use-changefeeds.html#schema-changes) on any of the tables will affect the entire changefeed's performance. 

We recommend monitoring your changefeeds. See [Monitor and Debug Changefeeds](monitor-and-debug-changefeeds.html) for more detail.

The following Enterprise and Core sections outline how to create and configure each type of changefeed:

<div class="filters clearfix">
  <button class="filter-button" data-scope="enterprise">Enterprise Changefeeds</button>
  <button class="filter-button" data-scope="core">Core Changefeeds</button>
</div>

<section class="filter-content" markdown="1" data-scope="enterprise">

## Configure a changefeed

An {{ site.data.products.enterprise }} changefeed streams row-level changes in a configurable format to a configurable sink (i.e., Kafka or a cloud storage sink). You can [create](#create), [pause](#pause), [resume](#resume), and [cancel](#cancel) an {{ site.data.products.enterprise }} changefeed.

### Create

To create an {{ site.data.products.enterprise }} changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE CHANGEFEED FOR TABLE table_name, table_name2 INTO '{scheme}://{host}:{port}?{query_parameters}';
~~~

{% include {{ page.version.version }}/cdc/url-encoding.md %}

For more information, see [`CREATE CHANGEFEED`](create-changefeed.html).

### Pause

To pause an {{ site.data.products.enterprise }} changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
> PAUSE JOB job_id;
~~~

For more information, see [`PAUSE JOB`](pause-job.html).

### Resume

To resume a paused {{ site.data.products.enterprise }} changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
> RESUME JOB job_id;
~~~

For more information, see [`RESUME JOB`](resume-job.html).

### Cancel

To cancel an {{ site.data.products.enterprise }} changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
> CANCEL JOB job_id;
~~~

For more information, see [`CANCEL JOB`](cancel-job.html).

### Configuring all changefeeds

{% include {{ page.version.version }}/cdc/configure-all-changefeed.md %}

</section>

<section class="filter-content" markdown="1" data-scope="core">

## Create a changefeed 

A core changefeed streams row-level changes to the client indefinitely until the underlying connection is closed or the changefeed is canceled.

To create a core changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPERIMENTAL CHANGEFEED FOR name;
~~~

For more information, see [`EXPERIMENTAL CHANGEFEED FOR`](changefeed-for.html).

</section>

## See also

- [`SHOW JOBS`](show-jobs.html)
- [`EXPERIMENTAL CHANGEFEED FOR`](changefeed-for.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
