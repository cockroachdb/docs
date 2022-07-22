---
title: Create and Configure Changefeeds
summary: Create and configure a changefeed job for Core and Enterprise.
toc: true
docs_area: stream_data
---

Core and {{ site.data.products.enterprise }} changefeeds offer different levels of configurability. {{ site.data.products.enterprise }} changefeeds allow for active changefeed jobs to be [paused](#pause), [resumed](#resume), and [canceled](#cancel).

Both Core and {{ site.data.products.enterprise }} changefeeds require that you enable rangefeeds before creating a changefeed. See the [Enable rangefeeds](#enable-rangefeeds) section for further detail.

## Considerations

- It is necessary to [enable rangefeeds](#enable-rangefeeds) for changefeeds to work.
- Many DDL queries (including [`TRUNCATE`](truncate.html), [`DROP TABLE`](drop-table.html), and queries that add a column family) will cause errors on a changefeed watching the affected tables. You will need to [start a new changefeed](create-changefeed.html#start-a-new-changefeed-where-another-ended).
- Partial or intermittent sink unavailability may impact changefeed stability. If a sink is unavailable, messages can't send, which means that a changefeed's high-water mark timestamp is at risk of falling behind the cluster's [garbage collection window](configure-replication-zones.html#replication-zone-variables). Throughput and latency can be affected once the sink is available again. However, [ordering guarantees](changefeed-messages.html#ordering-guarantees) will still hold for as long as a changefeed [remains active](monitor-and-debug-changefeeds.html#monitor-a-changefeed).
- When an [`IMPORT INTO`](import-into.html) statement is run, any current changefeed jobs targeting that table will fail.
- {% include {{ page.version.version }}/cdc/virtual-computed-column-cdc.md %}

When creating a changefeed, it's important to consider the number of changefeeds versus the number of tables to include in a single changefeed: 

- Changefeeds each have their own memory overhead, so every running changefeed will increase total memory usage.
- Creating a single changefeed that will watch hundreds of tables can affect the performance of a changefeed by introducing coupling, where the performance of a watched table affects the performance of the changefeed watching it. For example, any [schema change](changefeed-messages.html#schema-changes) on any of the tables will affect the entire changefeed's performance.

To watch multiple tables, we recommend creating a changefeed with a comma-separated list of tables. However, we do **not** recommend creating a single changefeed for watching hundreds of tables. 

We suggest monitoring the performance of your changefeeds. See [Monitor and Debug Changefeeds](monitor-and-debug-changefeeds.html) for more detail.

## Enable rangefeeds

Changefeeds connect to a long-lived request (i.e., a rangefeed), which pushes changes as they happen. This reduces the latency of row changes, as well as reduces transaction restarts on tables being watched by a changefeed for some workloads.

**Rangefeeds must be enabled for a changefeed to work.** To [enable the cluster setting](set-cluster-setting.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING kv.rangefeed.enabled = true;
~~~

Any created changefeed will error until this setting is enabled. Note that enabling rangefeeds currently has a small performance cost (about a 5-10% increase in latencies), whether or not the rangefeed is being used in a changefeed.

The `kv.closed_timestamp.target_duration` [cluster setting](cluster-settings.html) can be used with changefeeds. Resolved timestamps will always be behind by at least this setting's duration; however, decreasing the duration leads to more transaction restarts in your cluster, which can affect performance.

The following Enterprise and Core sections outline how to create and configure each type of changefeed:

<div class="filters clearfix">
  <button class="filter-button" data-scope="enterprise">Enterprise Changefeeds</button>
  <button class="filter-button" data-scope="core">Core Changefeeds</button>
</div>

<section class="filter-content" markdown="1" data-scope="enterprise">

## Configure a changefeed

An {{ site.data.products.enterprise }} changefeed streams row-level changes in a configurable format to a configurable sink (i.e., Kafka or a cloud storage sink). You can [create](#create), [pause](#pause), [resume](#resume), and [cancel](#cancel) an {{ site.data.products.enterprise }} changefeed. For a step-by-step example connecting to a specific sink, see the [Changefeed Examples](changefeed-examples.html) page.

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

### Modify a changefeed

{% include {{ page.version.version }}/cdc/modify-changefeed.md %}

### Configuring all changefeeds

{% include {{ page.version.version }}/cdc/configure-all-changefeed.md %}

</section>

<section class="filter-content" markdown="1" data-scope="core">

## Create a changefeed

A core changefeed streams row-level changes to the client indefinitely until the underlying connection is closed or the changefeed is canceled.

To create a core changefeed:

{% include_cached copy-clipboard.html %}
~~~ sql
> EXPERIMENTAL CHANGEFEED FOR table_name;
~~~

For more information, see [`EXPERIMENTAL CHANGEFEED FOR`](changefeed-for.html).

</section>

## See also

- [`SHOW JOBS`](show-jobs.html)
- [`EXPERIMENTAL CHANGEFEED FOR`](changefeed-for.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
