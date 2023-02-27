---
title: Monitor and Debug Changefeeds
summary: Monitor a changefeed from the DB Console and use logs for debugging.
toc: true
docs_area: stream_data
---

Changefeeds work as jobs in CockroachDB, which allows for [monitoring](#monitor-a-changefeed) and [debugging](#debug-a-changefeed) through the [DB Console](ui-overview.html) [**Jobs**](ui-jobs-page.html) page and [`SHOW JOBS`](show-jobs.html) SQL statements using the job ID.

<a name="changefeed-retry-errors"></a>

{% include_cached new-in.html version="v22.2.1" %} By default, changefeeds treat errors as retryable except for some specific terminal errors that are non-retryable.

- **retryable**: The changefeed will automatically retry whatever caused the error. (You may need to intervene so that the changefeed can resume.)
- **non-retryable**: The changefeed has encountered a terminal error and fails.

The following define the categories of non-retryable errors:

- When the changefeed cannot verify the target table's schema. For example, the table is offline or there are types within the table that the changefeed cannot handle.
- The changefeed cannot convert the data to the specified [output format](changefeed-messages.html). For example, there are [Avro](changefeed-messages.html#avro) types that changefeeds do not support, or a [CDC transformation](cdc-transformations.html) is using an unsupported or malformed expression.
- The terminal error happens as part of established changefeed behavior. For example, you have specified the [`schema_change_policy=stop` option](create-changefeed.html#schema-policy) and a schema change happens.

We recommend monitoring changefeeds with [Prometheus](monitoring-and-alerting.html#prometheus-endpoint) to avoid accumulation of garbage after a changefeed encounters an error. See [Garbage collection and changefeeds](changefeed-messages.html#garbage-collection-and-changefeeds) for more detail on how changefeeds interact with protected timestamps and garbage collection. In addition, see the [Recommended changefeed metrics to track](#recommended-changefeed-metrics-to-track) section for the essential metrics to track on a changefeed.

## Monitor a changefeed

{{site.data.alerts.callout_info}}
Monitoring is only available for {{ site.data.products.enterprise }} changefeeds.
{{site.data.alerts.end}}

Changefeed progress is exposed as a high-water timestamp that advances as the changefeed progresses. This is a guarantee that all changes before or at the timestamp have been emitted. You can monitor a changefeed:

- On the [**Changefeeds** dashboard](ui-cdc-dashboard.html) of the DB Console.
- On the [**Jobs** page](ui-jobs-page.html) of the DB Console. Hover over the high-water timestamp to view the [system time](as-of-system-time.html).
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

- Using Prometheus and Alertmanager to track and alert on changefeed metrics. See the [Monitor CockroachDB with Prometheus](monitor-cockroachdb-with-prometheus.html) tutorial for steps to set up Prometheus. See the [Recommended changefeed metrics to track](#recommended-changefeed-metrics-to-track) section for the essential metrics to alert you when a changefeed encounters a retryable error, or enters a failed state.

{{site.data.alerts.callout_info}}
You can use the high-water timestamp to [start a new changefeed where another ended](create-changefeed.html#start-a-new-changefeed-where-another-ended).
{{site.data.alerts.end}}

### Recommended changefeed metrics to track

By default, changefeeds will retry errors with [some exceptions](#changefeed-retry-errors). We recommend setting up monitoring for the following metrics to track retryable errors to avoid an over-accumulation of garbage, and non-retryable errors to alert on changefeeds in a failed state:

- `changefeed.max_behind_nanos`: When a changefeed's high-water mark timestamp is at risk of falling behind the cluster's [garbage collection window](configure-replication-zones.html#replication-zone-variables).
- `changefeed.error_retries`: The total number of retryable errors encountered by all changefeeds.
- `changefeed.failures`: The total number of changefeed jobs that have failed.

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
`flushed_bytes`    | Bytes emitted by all changefeeds. This may differ from `emitted_bytes` when [`compression`](create-changefeed.html#compression-opt) is enabled. | Bytes
`changefeed_flushes` | Total number of flushes for a changefeed. | Flushes
`emit_latency`     | Difference between the event's [MVCC](architecture/storage-layer.html#mvcc) timestamp and the time the event was emitted by CockroachDB. | Nanoseconds
`admit_latency`    | Difference between the event's MVCC timestamp and the time the event is put into the memory buffer. | Nanoseconds
`commit_latency`   | Difference between the event's MVCC timestamp and the time it is acknowledged by the [downstream sink](changefeed-sinks.html). If the sink is batching events, then the difference is between the oldest event and when the acknowledgment is recorded. | Nanoseconds
`backfill_count`   | Number of changefeeds currently executing a backfill ([schema change](changefeed-messages.html#schema-changes) or initial scan). | Changefeeds
`sink_batch_hist_nanos` | Time messages spend batched in the sink buffer before being flushed and acknowledged. | Nanoseconds
`flush_hist_nanos` | Time spent flushing messages across all changefeeds. | Nanoseconds
`checkpoint_hist_nanos` | Time spent checkpointing changefeed progress. | Nanoseconds
`error_retries` | Total retryable errors encountered by changefeeds. | Errors
`backfill_pending_ranges` | Number of [ranges](architecture/overview.html#architecture-range) in an ongoing backfill that are yet to be fully emitted. | Ranges
`message_size_hist` | Distribution in the size of emitted messages. | Bytes

## Debug a changefeed

### Using logs

For {{ site.data.products.enterprise }} changefeeds, [use log information](logging-overview.html) to debug connection issues (i.e., `kafka: client has run out of available brokers to talk to (Is your cluster reachable?)`). Debug by looking for lines in the logs with `[kafka-producer]` in them:

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
> SHOW CHANGEFEED JOBS;
~~~

~~~
        job_id       |               description                                                                                                                                      | user_name | status  |         running_status                    |          created           |          started           | finished |          modified          |      high_water_timestamp      | error |   sink_uri                                                                            |                    full_table_names                     |        topics         | format
---------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------+-----------+---------+-------------------------------------------+----------------------------+----------------------------+----------+----------------------------+--------------------------------+-------+---------------------------------------------------------------------------------------+---------------------------------------------------------+-----------------------+---------
786667716931878913   | CREATE CHANGEFEED FOR TABLE movr.users INTO 's3://changefeed_bucket?AWS_ACCESS_KEY_ID={ACCESS KEY}L&AWS_SECRET_ACCESS_KEY=redacted' WITH resolved              | user_name | running | running: resolved=1660144018.670219356,0  | 2022-08-10 14:38:55.098861 | 2022-08-10 14:38:55.12946  | NULL     | 2022-08-10 15:07:31.886757 | 1660144048833832849.0000000000 |       | s3://changefeed_bucket?AWS_ACCESS_KEY_ID={ACCESS KEY}&AWS_SECRET_ACCESS_KEY=redacted  | {movr.public.users}                                     | NULL                  | json
685724608744325121   | CREATE CHANGEFEED FOR TABLE mytable INTO 'kafka://localhost:9092' WITH confluent_schema_registry = 'http://localhost:8081', format = 'avro', resolved, updated | root      | running | running: resolved=1629336943.183631090,0  | 2021-08-19 01:35:43.19592  | 2021-08-19 01:35:43.225445 | NULL     | 2021-08-19 01:35:43.252318 | 1629336943183631090.0000000000 |       | kafka://localhost:9092                                                                | {defaultdb.public.mytable}                              | mytable               | avro
~~~

For more information, see [`SHOW JOBS`](show-jobs.html).

### Using the DB Console

 On the [**Custom Chart** debug page](ui-custom-chart-debug-page.html) of the DB Console:

1. To add a chart, click **Add Chart**.
1. Select `changefeed.error_retries` from the **Metric Name** dropdown menu.

    A graph of changefeed restarts due to retryable errors will display.

## See also

- [DB Console](ui-overview.html)
- [Monitoring and Alerting](monitoring-and-alerting.html)
- [`SHOW JOBS`](show-jobs.html)
