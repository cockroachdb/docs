---
title: Advanced Changefeed Configuration
summary: Tune changefeeds for high durability delivery or throughput.
toc: true
docs_area: stream_data
---

{{site.data.alerts.callout_danger}}
The configurations and settings explained on this page will significantly impact a changefeed's behavior.
{{site.data.alerts.end}}

The following sections describe settings, configurations, and details to tune changefeeds for these use cases:

- [High durability delivery](#tuning-for-high-durability-delivery)
- [High throughput](#tuning-for-high-throughput)

Some options for the `kafka_sink_config` and `webhook_sink_config` parameters are discussed on this page. However, for more information on specific tuning for Kafka and Webhook sinks, refer to the following pages:

- [Kafka sinks](changefeed-sinks.html#kafka-sink-configuration)
- [Webhook sinks](changefeed-sinks.html#webhook-sink-configuration)

## MuxRangefeed

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

`MuxRangefeed` is a subsystem that improves the performance of rangefeeds with scale. It significantly reduces the overhead of running [rangefeeds](create-and-configure-changefeeds.html#enable-rangefeeds). Without `MuxRangefeed` enabled the number of RPC streams is proportional with the number of ranges in a table. For example, a large table could have tens of thousands of ranges. With `MuxRangefeed` enabled, this proportion improves so that the number of RPC streams is relative to the number of nodes in a cluster.

You can enable its functionality with the `changefeed.mux_rangefeed.enabled` [cluster setting](cluster-settings.html).

Use the following workflow to enable `MuxRangefeed`:

1. Enable the cluster setting:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING changefeed.mux_rangefeed.enabled = true;
    ~~~

1. After enabling the setting, pause the changefeed:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    PAUSE JOB {job ID};
    ~~~

    You can use [`SHOW CHANGEFEED JOBS`]({% link {{ page.version.version }}/show-jobs.md %}#show-changefeed-jobs) to retrieve the job ID.

1. Resume the changefeed for the cluster setting to take effect:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    RESUME JOB {job ID};
    ~~~

## Tuning for high durability delivery

When designing a system that relies on high durability message delivery—that is, not missing any message acknowledgement at the downstream sink—consider the following settings and configuration in this section:

- [Pausing changefeeds and garbage collection](#pausing-changefeeds-and-garbage-collection)
- [Defining Kafka message acknowledgment](#defining-kafka-message-acknowledgment)
- [Choosing changefeed sinks](#choosing-changefeed-sinks)
- [Defining schema change behavior](#defining-schema-change-behavior)

Before tuning these settings we recommend reading details on our [changefeed at-least-once-delivery guarantee](changefeed-messages.html#ordering-guarantees).

### Pausing changefeeds and garbage collection

By default, [protected timestamps](architecture/storage-layer.html#protected-timestamps) will protect changefeed data from [garbage collection](architecture/storage-layer.html#garbage-collection) up to the time of the [_checkpoint_](change-data-capture-overview.html#how-does-an-enterprise-changefeed-work). Protected timestamps will protect changefeed data from garbage collection if the downstream [changefeed sink](changefeed-sinks.html) is unavailable until you either [cancel](cancel-job.html) the changefeed or the sink becomes available once again.

However, if the changefeed lags too far behind, the protected changes could lead to an accumulation of garbage. This could result in increased disk usage and degraded performance for some workloads.

For more detail on changefeeds and protected timestamps, refer to [Garbage collection and changefeeds](changefeed-messages.html#garbage-collection-and-changefeeds).

[Create changefeeds](create-changefeed.html) with the following options so that your changefeed protects data when it is [paused](pause-job.html):

- [`protect_data_from_gc_on_pause`](create-changefeed.html#protect-pause): to protect changes while the changefeed is paused until you [resume](resume-job.html) the changefeed.
- [`on_error=pause`](create-changefeed.html#on-error): to pause the changefeed when it encounters an error. By default, changefeeds treat errors as retryable apart from some [exceptions](monitor-and-debug-changefeeds.html#changefeed-retry-errors).

### Defining Kafka message acknowledgment

To determine what a successful write to Kafka is, you can configure the [`kafka_sink_config` option](changefeed-sinks.html#kafka-sink-configuration). The `'RequiredAcks'` field specifies what a successful write to Kafka is. CockroachDB [guarantees at least once delivery of messages](changefeed-messages.html#ordering-guarantees)—the `'RequiredAcks'` value defines the **delivery**.

For high durability delivery, Cockroach Labs recommends setting:

~~~
kafka_sink_config='{'RequiredAcks': 'ALL'}'
~~~

`ALL` provides the highest consistency level. A quorum of Kafka brokers that have committed the message must be reached before the leader can acknowledge the write.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/cdc/kafka-acks.md %}
{{site.data.alerts.end}}

### Choosing changefeed sinks

Use [Kafka](changefeed-sinks.html#kafka) or [cloud storage](changefeed-sinks.html#cloud-storage-sink) sinks when tuning for high durability delivery in changefeeds. Both Kafka and cloud storage sinks offer built-in advanced protocols, whereas the [webhook sink](changefeed-sinks.html#webhook-sink), while flexible, requires an understanding of how messages are acknowledged and committed by the particular system used for the webhook in order to ensure the durability of message delivery.

### Defining schema change behavior

Ensure that data is ingested downstream in its new format after a [schema change](online-schema-changes.html) by using the [`schema_change_events`](create-changefeed.html#schema-events) and [`schema_schange_policy`](create-changefeed.html#schema-policy) options. For example, setting `schema_change_events=column_changes` and `schema_change_policy=stop` will trigger an error to the `cockroach.log` file on a [schema change](changefeed-messages.html#schema-changes-with-column-backfill) and the changefeed to fail.

## Tuning for high throughput

When designing a system that needs to emit a lot of changefeed messages, whether it be steady traffic or a burst in traffic, consider the following settings and configuration in this section:

- [Setting the `resolved` option](#setting-the-resolved-option)
- [Batching and buffering messages](#batching-and-buffering-messages)
- [Configuring file and message format](#configuring-file-and-message-format)
- [Configuring for tables with many ranges](#configuring-for-tables-with-many-ranges)
- [Adjusting concurrent changefeed work](#adjusting-concurrent-changefeed-work)

### Setting the `resolved` option

When a changefeed emits a [resolved](create-changefeed.html#resolved-option) message, it force flushes all outstanding messages that have buffered, which will diminish your changefeed's throughput while the flush completes. Therefore, if you are aiming for higher throughput, we suggest setting the duration higher (e.g., 10 minutes), or **not** using the `resolved` option.

If you are setting the `resolved` option when you are aiming for high throughput, you must also consider the [`min_checkpoint_frequency`](create-changefeed.html#min-checkpoint-frequency) option, which defaults to `30s`. This option controls how often nodes flush their progress to the [coordinating changefeed node](change-data-capture-overview.html#how-does-an-enterprise-changefeed-work). As a result, `resolved` messages will not be emitted more frequently than the configured `min_checkpoint_frequency`. Set this option to at least as long as your `resolved` option duration.

### Batching and buffering messages

- Batch messages to your sink:
    - For a [Kafka sink](changefeed-sinks.html#kafka), refer to the [`Flush`](changefeed-sinks.html#kafka-flush) parameter for the `kafka_sink_config` option.
    - For a [cloud storage sink](changefeed-sinks.html#cloud-storage-sink), use the [`file_size`](create-changefeed.html#file-size) parameter to flush a file when it exceeds the specified size.
- Set the [`changefeed.memory.per_changefeed_limit`](cluster-settings.html) cluster setting to a higher limit to give more memory for buffering changefeed data. This setting influences how often the changefeed will flush buffered messages. This is useful during heavy traffic.

### Configuring file and message format

- Use `avro` as the emitted message [format](create-changefeed.html#format) option with Kafka sinks; JSON encoding can potentially create a slowdown.

#### Compression

- Use the [`compression` option](create-changefeed.html#compression-opt) when you create a changefeed emitting data files to a [cloud storage sink](changefeed-sinks.html#cloud-storage-sink). For larger files, set `compression` to the `zstd` format.
- Use the `snappy` compression format to emit messages to a [Kafka](changefeed-sinks.html#kafka-compression) sink. If you're intending to do large batching for Kafka, use the `lz4` compression format.

#### File size

To configure changefeeds emitting to [cloud storage sinks](changefeed-sinks.html#cloud-storage-sink) for high throughput, you should consider:

- Increasing the [`file_size`](create-changefeed.html#file-size) parameter to control the size of the files that the changefeed sends to the sink. The default is `16MB`. To configure for high throughput, we recommend `32MB`–`128MB`. Note that this is not a hard limit, and a changefeed will flush the file when it reaches the specified size.
- When you [compress](#compression) a file, it will contain many more events.
- File size is also dependent on what kind of data the changefeed job is writing. For example, large JSON blobs will quickly fill up the `file_size` value compared to small rows.
- When you change or increase `file_size`, ensure that you adjust the `changefeed.memory.per_changefeed_limit` [cluster setting](cluster-settings.html), which has a default of `512MiB`. Buffering messages can quickly reach this limit if you have increased the file size.

### Configuring for tables with many ranges

If you have a table with 10,000 or more [ranges](architecture/overview.html#architecture-range), you should consider increasing the following two [cluster settings](cluster-settings.html). **We strongly recommend increasing these settings slowly**. That is, increase the setting and then [monitor](monitor-and-debug-changefeeds.html) its impact before adjusting further:

- `kv.rangefeed.catchup_scan_concurrency`: The number of catchups a [rangefeed](create-and-configure-changefeeds.html#enable-rangefeeds) can execute concurrently. The default is `8`.
- `kv.rangefeed.concurrent_catchup_iterators`: The number of [rangefeed](create-and-configure-changefeeds.html#enable-rangefeeds) catchup iterators a store will allow concurrently before queuing. The default is `16`.

### Adjusting concurrent changefeed work

- Increase the [`changefeed.backfill.concurrent_scan_requests` setting](cluster-settings.html), which controls the number of concurrent scan requests per node issued during a [backfill event](changefeed-messages.html#schema-changes-with-column-backfill). The default behavior, when this setting is at `0`, is that the number of scan requests will be 3 times the number of nodes in the cluster (to a maximum of 100). While increasing this number will allow for higher throughput, it **will increase the cluster load overall**, including CPU and IO usage.
- The [`kv.rangefeed.catchup_scan_iterator_optimization.enabled` setting](cluster-settings.html) is `on` by default. This causes [rangefeeds](create-and-configure-changefeeds.html#enable-rangefeeds) to use time-bound iterators for catch-up scans when possible. Catch-up scans are run for each rangefeed request. This setting improves the performance of changefeeds during some [range-split operations](architecture/distribution-layer.html#range-splits).

## Lagging ranges

{% include_cached new-in.html version="v22.2.15" %} Use the `changefeed.lagging_ranges` metric to track the number of ranges that are behind in a changefeed. This is calculated based on the [cluster settings](cluster-settings.html):

- `changefeed.lagging_ranges_threshold` sets a duration from the present that determines the length of time a range is considered to be lagging behind, which will then track in the [`lagging_ranges`](monitor-and-debug-changefeeds.html#using-changefeed-metrics-labels) metric. Note that ranges undergoing an [initial scan](create-changefeed.html#initial-scan) for longer than the threshold duration are considered to be lagging. Starting a changefeed with an initial scan on a large table will likely increment the metric for each range in the table. As ranges complete the initial scan, the number of ranges lagging behind will decrease.
    - **Default:** `3m`
- `changefeed.lagging_ranges_polling_interval` sets the interval rate for when lagging ranges are checked and the `lagging_ranges` metric is updated. Polling adds latency to the `lagging_ranges` metric being updated. For example, if a range falls behind by 3 minutes, the metric may not update until an additional minute afterward.
    - **Default:** `1m`

{{site.data.alerts.callout_success}}
You can use the [`metrics_label`](monitor-and-debug-changefeeds.html#using-changefeed-metrics-labels) option to track the `lagging_ranges` metric per changefeed.
{{site.data.alerts.end}}

## See also

- [Cluster Settings](cluster-settings.html)
- [Changefeed Sinks](changefeed-sinks.html)
- [`CREATE CHANGEFEED`](create-changefeed.html)
