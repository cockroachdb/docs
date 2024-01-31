---
title: Monitor and Debug Changefeeds
summary: Monitor a changefeed from the DB Console and use logs for debugging.
toc: true
docs_area: stream_data
---

{{site.data.alerts.callout_info}}
Monitoring is only available for [{{ site.data.products.enterprise }} changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}#stream-row-level-changes-with-changefeeds).
{{site.data.alerts.end}}

Changefeeds work as jobs in CockroachDB, which allows for [monitoring](#monitor-a-changefeed) and [debugging](#debug-a-changefeed) through the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}) [**Jobs**]({% link {{ page.version.version }}/ui-jobs-page.md %}) page and [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}) SQL statements using the job ID.

<a name="changefeed-retry-errors"></a>

By default, changefeeds treat errors as retryable except for some specific terminal errors that are non-retryable.

- **retryable**: The changefeed will automatically retry whatever caused the error. (You may need to intervene so that the changefeed can resume.)
- **non-retryable**: The changefeed has encountered a terminal error and fails.

The following define the categories of non-retryable errors:

- When the changefeed cannot verify the target table's schema. For example, the table is offline or there are types within the table that the changefeed cannot handle.
- The changefeed cannot convert the data to the specified [output format]({% link {{ page.version.version }}/changefeed-messages.md %}). For example, there are [Avro]({% link {{ page.version.version }}/changefeed-messages.md %}#avro) types that changefeeds do not support, or a [CDC query]({% link {{ page.version.version }}/cdc-queries.md %}) is using an unsupported or malformed expression.
- The terminal error happens as part of established changefeed behavior. For example, you have specified the [`schema_change_policy=stop` option]({% link {{ page.version.version }}/create-changefeed.md %}#schema-policy) and a schema change happens.

We recommend monitoring changefeeds with [Prometheus]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#prometheus-endpoint) to avoid accumulation of garbage after a changefeed encounters an error. See [Garbage collection and changefeeds]({% link {{ page.version.version }}/protect-changefeed-data.md %}) for more detail on how changefeeds interact with [protected timestamps]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) and garbage collection. In addition, see the [Recommended changefeed metrics to track](#recommended-changefeed-metrics-to-track) section for the essential metrics to track on a changefeed.

## Monitor a changefeed

Changefeed progress is exposed as a high-water timestamp that advances as the changefeed progresses. This is a guarantee that all changes before or at the timestamp have been emitted. You can monitor a changefeed:

- On the [**Changefeeds** dashboard]({% link {{ page.version.version }}/ui-cdc-dashboard.md %}) of the DB Console.
- On the [**Jobs** page]({% link {{ page.version.version }}/ui-jobs-page.md %}) of the DB Console. Hover over the high-water timestamp to view the [system time]({% link {{ page.version.version }}/as-of-system-time.md %}).
- Using `SHOW CHANGEFEED JOB <job_id>`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW CHANGEFEED JOB 383870400694353921;
    ~~~
    ~~~
            job_id       |  job_type  |                              description                              | ... |      high_water_timestamp      | ... |
    +--------------------+------------+-----------------------------------------------------------------------+ ... +--------------------------------+ ... +
      383870400694353921 | CHANGEFEED | CREATE CHANGEFEED FOR TABLE office_dogs INTO 'kafka://localhost:9092' | ... | 1537279405671006870.0000000000 | ... |
    (1 row)
    ~~~

- Using Prometheus and Alertmanager to track and alert on changefeed metrics. See the [Monitor CockroachDB with Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}) tutorial for steps to set up Prometheus. See the [Recommended changefeed metrics to track](#recommended-changefeed-metrics-to-track) section for the essential metrics to alert you when a changefeed encounters a retryable error, or enters a failed state.

{{site.data.alerts.callout_info}}
You can use the high-water timestamp to [start a new changefeed where another ended]({% link {{ page.version.version }}/create-changefeed.md %}#start-a-new-changefeed-where-another-ended).
{{site.data.alerts.end}}

### Recommended changefeed metrics to track

By default, changefeeds will retry errors with [some exceptions](#changefeed-retry-errors). We recommend setting up monitoring for the following metrics to track retryable errors to avoid an over-accumulation of garbage, and non-retryable errors to alert on changefeeds in a failed state:

- `changefeed.max_behind_nanos`: When a changefeed's high-water mark timestamp is at risk of falling behind the cluster's [garbage collection window]({% link {{ page.version.version }}/configure-replication-zones.md %}#replication-zone-variables).
- `changefeed.error_retries`: The total number of retryable errors encountered by all changefeeds.
- `changefeed.failures`: The total number of changefeed jobs that have failed.

If you are running more than 10 changefeeds, we recommend monitoring the CPU usage on your cluster. You can use the [Overload Dashboard]({% link {{ page.version.version }}/ui-overload-dashboard.md %}) in the DB Console to track the performance of your cluster relating to CPU usage. For recommendations around how many tables a changefeed should target, refer to [System resources and running changefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#system-resources-and-running-changefeeds).

#### Protected timestamp and garbage collection monitoring

[Protected timestamps]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) will protect changefeed data from garbage collection in particular scenarios, but if a changefeed lags too far behind, the protected changes could cause data storage issues. Refer to [Protect Changefeed Data from Garbage Collection]({% link {{ page.version.version }}/protect-changefeed-data.md %}) for detail on when changefeed data is protected from garbage collection.

{% include {{ page.version.version }}/cdc/pts-gc-monitoring.md %}

#### Schema registry metrics

If you are running a changefeed with the [`confluent_schema_registry`]({% link {{ page.version.version }}/create-changefeed.md %}#confluent-registry) option, set up monitoring for the following metrics:

- `changefeed.schema_registry.retry_count`: The number of retries encountered when sending requests to the schema registry. A non-zero value could indicate incorrect configuration of the schema registry or changefeed parameters.
- `changefeed.schema_registry.registrations`: The number of registration attempts with the schema registry.

### Using changefeed metrics labels

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
An {{ site.data.products.enterprise }} license is required to use metrics labels in changefeeds.
{{site.data.alerts.end}}

{% include {{ page.version.version }}/cdc/metrics-labels.md %}

To start a changefeed with a metrics label, set the following cluster setting to `true`:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING server.child_metrics.enabled=true;
~~~

Create the changefeed, passing the `metrics_label` option with the label name as its value:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE movr.rides INTO 'kafka://host:port' WITH metrics_label=rides;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE movr.vehicles INTO 'kafka://host:port' WITH metrics_label=vehicles;
~~~

Multiple changefeeds can be added to a label:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR TABLE movr.vehicle_location_histories INTO 'kafka://host:port' WITH metrics_label=vehicles;
~~~

`http://{host}:{http-port}/_status/vars` shows the defined changefeed(s) by label and the aggregated metric for all changefeeds. This output also shows the `default` scope, which will include changefeeds started without a metrics label:

~~~
changefeed_running 4
changefeed_running{scope="default"} 1
changefeed_running{scope="rides"} 1
changefeed_running{scope="vehicles"} 2
~~~

~~~
changefeed_emitted_messages 4144
changefeed_emitted_messages{scope="default"} 0
changefeed_emitted_messages{scope="rides"} 2772
changefeed_emitted_messages{scope="vehicles"} 1372
~~~

~~~
changefeed_emitted_bytes 781591
changefeed_emitted_bytes{scope="default"} 0
changefeed_emitted_bytes{scope="rides"} 598034
changefeed_emitted_bytes{scope="vehicles"} 183557
~~~

#### Metrics

| Metric           |  Description | Unit
-------------------+--------------+---------------------------------------------------
`changefeed_running` | Number of currently running changefeeds, including sinkless changefeeds. | Changefeeds
`emitted_messages` | Number of messages emitted, which increments when messages are flushed. | Messages
`emitted_bytes`    | Number of bytes emitted, which increments as messages are flushed. | Bytes
`flushed_bytes`    | Bytes emitted by all changefeeds. This may differ from `emitted_bytes` when [`compression`]({% link {{ page.version.version }}/create-changefeed.md %}#compression-opt) is enabled. | Bytes
`changefeed_flushes` | Total number of flushes for a changefeed. | Flushes
<span class="version-tag">New in v23.2:</span> `aggregator_progress` | The earliest timestamp up to which any [aggregator]({% link {{ page.version.version }}/how-does-an-enterprise-changefeed-work.md %}) is guaranteed to have emitted all values for which it is responsible. **Note:** This metric may regress when a changefeed restarts due to a transient error. Consider tracking the `changefeed.checkpoint_progress` metric, which will not regress. | Timestamp
<span class="version-tag">New in v23.2:</span> `checkpoint_progress` | The earliest timestamp of any changefeed's persisted checkpoint (values prior to this timestamp will never need to be re-emitted). | Timestamp
`admit_latency`    | Difference between the event's MVCC timestamp and the time the event is put into the memory buffer. | Nanoseconds
`commit_latency`   | Difference between the event's MVCC timestamp and the time it is acknowledged by the [downstream sink]({% link {{ page.version.version }}/changefeed-sinks.md %}). If the sink is batching events, then the difference is between the oldest event and when the acknowledgment is recorded. | Nanoseconds
<a name="lagging-ranges-metric"></a><span class="version-tag">New in v23.2:</span> `lagging_ranges` | Number of ranges which are behind in a changefeed. This is calculated based on the options: <ul><li>[`lagging_ranges_threshold`]({% link {{ page.version.version }}/create-changefeed.md %}#lagging-ranges-threshold), which is the amount of time that a range checkpoint needs to be in the past to be considered lagging.</li><li>[`lagging_ranges_polling_interval`]({% link {{ page.version.version }}/create-changefeed.md %}#lagging-ranges-polling), which is the frequency at which lagging ranges are polled and the metric is updated.</li></ul><br>**Note:** Ranges undergoing an [initial scan]({% link {{ page.version.version }}/create-changefeed.md %}#initial-scan) for longer than the `lagging_ranges_threshold` duration are considered to be lagging. Starting a changefeed with an initial scan on a large table will likely increment the metric for each range in the table. As ranges complete the initial scan, the number of ranges lagging behind will decrease. | Nanoseconds
`backfill_count`   | Number of changefeeds currently executing a backfill ([schema change]({% link {{ page.version.version }}/changefeed-messages.md %}#schema-changes) or initial scan). | Changefeeds
`sink_batch_hist_nanos` | Time messages spend batched in the sink buffer before being flushed and acknowledged. | Nanoseconds
`flush_hist_nanos` | Time spent flushing messages across all changefeeds. | Nanoseconds
`checkpoint_hist_nanos` | Time spent checkpointing changefeed progress. | Nanoseconds
`error_retries` | Total retryable errors encountered by changefeeds. | Errors
`backfill_pending_ranges` | Number of [ranges]({% link {{ page.version.version }}/architecture/overview.md %}#architecture-range) in an ongoing backfill that are yet to be fully emitted. | Ranges
`message_size_hist` | Distribution in the size of emitted messages. | Bytes

### Monitoring and measuring changefeed latency

Changefeeds can encounter latency in events processing. This latency is the total time CockroachDB takes to:

- Commit writes to the database.
- Encode [changefeed messages]({% link {{ page.version.version }}/changefeed-messages.md %}).
- Deliver the message to the [sink]({% link {{ page.version.version }}/changefeed-sinks.md %}).

There are a couple of ways to measure if changefeeds are encountering latency or falling behind:

- [Event latency](#event-latency): Measure the difference between an event's MVCC timestamp and when it is put into the memory buffer or acknowledged at the sink.
- [Lagging ranges](#lagging-ranges): Track the number of [ranges]({% link {{ page.version.version }}/architecture/overview.md %}#range) that are behind in a changefeed.

#### Event latency

To monitor for changefeeds encountering latency in how events are emitting, track the following metrics:

- `admit_latency`: The difference between the event's MVCC timestamp and the time the event is put into the memory buffer.
- `commit_latency`: The difference between the event's MVCC timestamp and the time it is acknowledged by the [downstream sink]({% link {{ page.version.version }}/changefeed-sinks.md %}). If the sink is batching events, the difference is between the oldest event and when the acknowledgment is recorded.

{{site.data.alerts.callout_info}}
The `admit_latency` and `commit_latency` metrics do **not** update for backfills during [initial scans]({% link {{ page.version.version }}/create-changefeed.md %}#initial-scan) or [backfills for schema changes]({% link {{ page.version.version }}/changefeed-messages.md %}#schema-changes-with-column-backfill). This is because a full table scan may contain rows that were written far in the past, which would lead to inaccurate changefeed latency measurements if the events from these scans were included in `admit_latency` adn `commit_latency`.
{{site.data.alerts.end}}

Both of these metrics support [metrics labels](#using-changefeed-metrics-labels). You can set the `metrics_label` option when starting a changefeed to differentiate metrics per changefeed.

We recommend using the p99 `commit_latency` aggregation for alerting and to set SLAs for your changefeeds. Refer to the [Changefeed Dashboard]({% link {{ page.version.version }}/ui-cdc-dashboard.md %}) **Commit Latency** graph to track this metric in the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}).

If your changefeed is experiencing elevated latency, you can use these metrics to:

- Review `admit_latency` versus `commit_latency` to calculate the time events are moving from the memory buffer to the downstream sink.
- Compare the `commit_latency` P99, P90, P50 latency percentiles to investigate performance over time.

#### Lagging ranges

{% include {{ page.version.version }}/cdc/lagging-ranges.md %}

## Debug a changefeed

### Using logs

For {{ site.data.products.enterprise }} changefeeds, [use log information]({% link {{ page.version.version }}/logging-overview.md %}) to debug connection issues (i.e., `kafka: client has run out of available brokers to talk to (Is your cluster reachable?)`). Debug by looking for lines in the logs with `[kafka-producer]` in them:

~~~
I190312 18:56:53.535646 585 vendor/github.com/Shopify/sarama/client.go:123  [kafka-producer] Initializing new client
I190312 18:56:53.535714 585 vendor/github.com/Shopify/sarama/client.go:724  [kafka-producer] client/metadata fetching metadata for all topics from broker localhost:9092
I190312 18:56:53.536730 569 vendor/github.com/Shopify/sarama/broker.go:148  [kafka-producer] Connected to broker at localhost:9092 (unregistered)
I190312 18:56:53.537661 585 vendor/github.com/Shopify/sarama/client.go:500  [kafka-producer] client/brokers registered new broker #0 at 172.16.94.87:9092
I190312 18:56:53.537686 585 vendor/github.com/Shopify/sarama/client.go:170  [kafka-producer] Successfully initialized new client
~~~

### Using `SHOW CHANGEFEED JOBS`

 For {{ site.data.products.enterprise }} changefeeds, use `SHOW CHANGEFEED JOBS` to check the status of your changefeed jobs:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW CHANGEFEED JOBS;
~~~

~~~
        job_id       |               description                                                                                                                                      | user_name | status  |         running_status                    |          created           |          started           | finished |          modified          |      high_water_timestamp      | error |   sink_uri                                                                            |                    full_table_names                     |        topics         | format
---------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------+---------+-------------------------------------------+----------------------------+----------------------------+----------+----------------------------+--------------------------------+-------+---------------------------------------------------------------------------------------+---------------------------------------------------------+-----------------------+---------
786667716931878913   | CREATE CHANGEFEED FOR TABLE movr.users INTO 's3://changefeed_bucket?AWS_ACCESS_KEY_ID={ACCESS KEY}L&AWS_SECRET_ACCESS_KEY=redacted' WITH resolved              | user_name | running | running: resolved=1660144018.670219356,0  | 2022-08-10 14:38:55.098861 | 2022-08-10 14:38:55.12946  | NULL     | 2022-08-10 15:07:31.886757 | 1660144048833832849.0000000000 |       | s3://changefeed_bucket?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY=redacted  | {movr.public.users}                                     | NULL                  | json
685724608744325121   | CREATE CHANGEFEED FOR TABLE mytable INTO 'kafka://localhost:9092' WITH confluent_schema_registry = 'http://localhost:8081', format = 'avro', resolved, updated | root      | running | running: resolved=1629336943.183631090,0  | 2021-08-19 01:35:43.19592  | 2021-08-19 01:35:43.225445 | NULL     | 2021-08-19 01:35:43.252318 | 1629336943183631090.0000000000 |       | kafka://localhost:9092                                                                | {defaultdb.public.mytable}                              | mytable               | avro
~~~

For more information, see [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %}).

### Using the DB Console

 On the [**Custom Chart** debug page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}) of the DB Console:

1. To add a chart, click **Add Chart**.
1. Select `changefeed.error_retries` from the **Metric Name** dropdown menu.

    A graph of changefeed restarts due to retryable errors will display.

## See also

- [DB Console]({% link {{ page.version.version }}/ui-overview.md %})
- [Monitoring and Alerting]({% link {{ page.version.version }}/monitoring-and-alerting.md %})
- [`SHOW JOBS`]({% link {{ page.version.version }}/show-jobs.md %})
