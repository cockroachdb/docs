---
title: Advanced Changefeed Configuration
summary: Tune changefeeds for high durability delivery or throughput.
toc: true
docs_area: stream_data
---

{{site.data.alerts.callout_danger}}
The configurations and settings explained on this page will have a significant impact on a changefeed's behavior and could potentially affect a cluster's performance. Thoroughly test before deploying any changes to production.
{{site.data.alerts.end}}

The following sections describe performance, settings, configurations, and details to tune [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}):

- [Changefeed performance](#changefeed-performance)
- [High durability delivery](#tuning-for-high-durability-delivery)
- [High throughput](#tuning-for-high-throughput)

Some options for the `kafka_sink_config` and `webhook_sink_config` parameters are discussed on this page. However, for more information on specific tuning for Kafka and Webhook sinks, refer to the following pages:

- [Kafka sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka-sink-configuration)
- [Webhook sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink-configuration)

## Changefeed performance

By default, changefeeds are integrated with elastic CPU, which helps to prevent changefeeds from affecting foreground traffic. For example, [changefeed backfills]({% link {{ page.version.version }}/changefeed-messages.md %}#schema-changes-with-column-backfill) and [initial scans]({% link {{ page.version.version }}/create-changefeed.md %}#initial-scan) can be CPU-intensive. This integration will result in a cluster prioritizing SQL traffic over changefeeds. Since this may affect [changefeed latency](#latency-in-changefeeds), you can monitor your cluster's [admission control system]({% link {{ page.version.version }}/admission-control.md %}) on the [Overload Dashboard]({% link {{ page.version.version }}/ui-overload-dashboard.md %}) and changefeed latency on the [Changefeed Dashboard]({% link {{ page.version.version }}/ui-cdc-dashboard.md %}).

This is controlled by the following [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}), which are by default enabled:

~~~
changefeed.cpu.per_event_elastic_control.enabled
kvadmission.rangefeed_catchup_scan_elastic_control.enabled
~~~

For a more technical explanation of elastic CPU, refer to the [Rubbing control theory on the Go scheduler](https://www.cockroachlabs.com/blog/rubbing-control-theory/) blog post.

### Mux rangefeeds

{% include {{ page.version.version }}/cdc/mux-rangefeed.md %}

### Latency in changefeeds

When you are running large workloads, changefeeds can **encounter** or **cause** latency in a cluster in the following ways:

- Changefeeds can have an impact on SQL latency in the cluster generally.
- Changefeeds can encounter latency in events emitting. This latency is the total time CockroachDB takes to:
    - Commit writes to the database.
    - Encode [changefeed messages]({% link {{ page.version.version }}/changefeed-messages.md %}).
    - Deliver the message to the [sink]({% link {{ page.version.version }}/changefeed-sinks.md %}).

The following [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) reduce bursts of [rangefeed]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds) work so that updates are paced steadily over time.

{{site.data.alerts.callout_danger}}
We do **not** recommend adjusting these settings unless you are running a large workload, or are working with the Cockroach Labs [support team]({{ link_prefix }}support-resources.html). Thoroughly test different cluster setting configurations before deploying to production.
{{site.data.alerts.end}}

#### `kv.closed_timestamp.target_duration`

**Default:** `3s`

{{site.data.alerts.callout_info}}
Adjusting `kv.closed_timestamp.target_duration` could have a detrimental impact on [follower reads]({% link {{ page.version.version }}/follower-reads.md %}). If you are using follower reads, refer to the [`kv.rangefeed.closed_timestamp_refresh_interval`](#kv-rangefeed-closed_timestamp_refresh_interval) cluster setting instead to ease changefeed impact on foreground SQL latency.
{{site.data.alerts.end}}

`kv.closed_timestamp.target_duration` controls the target [closed timestamp]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#closed-timestamps) lag duration, which determines how far behind the current time CockroachDB will attempt to maintain the closed timestamp. For example, with the default value of `3s`, if the current time is `12:30:00` then CockroachDB will attempt to keep the closed timestamp at `12:29:57` by possibly retrying or aborting ongoing writes that are below this time.

A changefeed aggregates checkpoints across all ranges, and once the timestamp on all the ranges advances, the changefeed can then [checkpoint]({% link {{ page.version.version }}/how-does-a-changefeed-work.md %}). In the context of changefeeds, `kv.closed_timestamp.target_duration` affects how old the checkpoints will be, which will determine the latency before changefeeds can consider the history of an event complete.

#### `kv.rangefeed.closed_timestamp_refresh_interval`

**Default:** `3s`

This setting controls the interval at which [closed timestamp]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#closed-timestamps) updates are delivered to [rangefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds) and in turn emitted as a [changefeed checkpoint]({% link {{ page.version.version }}/how-does-a-changefeed-work.md %}).

Increasing the interval value will lengthen the delay between each checkpoint, which will increase the latency of changefeed checkpoints, but reduce the impact on SQL latency due to [overload]({% link {{ page.version.version }}/admission-control.md %}#use-cases-for-admission-control) on the cluster. This happens because every range with a rangefeed has to emit a checkpoint event with this `3s` interval. As an example, 1 million ranges would result in 330,000 events per second, which would use more CPU resources.

If you are running changefeeds at a large scale and notice foreground SQL latency, we recommend increasing this setting.

As a result, adjusting `kv.rangefeed.closed_timestamp_refresh_interval` can affect changefeeds encountering latency **and** changefeeds causing foreground SQL latency. In clusters running large-scale workloads, it may be helpful to:

- **Decrease** the value for a lower changefeed emission latency — that is, how often a client can confirm that all relevant events up to a certain timestamp have been emitted.
- **Increase** the value to reduce the potential impact of changefeeds on SQL latency. This will lower the resource cost of changefeeds, which can be especially important for workloads with tables in the TB range of data.

It is important to note that a changefeed at default configuration does not checkpoint more often than once every 30 seconds. When you create a changefeed with [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}), you can adjust this with the [`min_checkpoint_frequency`]({% link {{ page.version.version }}/create-changefeed.md %}#min-checkpoint-frequency) option.

#### `kv.closed_timestamp.side_transport_interval`

**Default:** `200ms`

The `kv.closed_timestamp.side_transport_interval` cluster setting controls how often the closed timestamp is updated. Although the closed timestamp is updated every `200ms`, CockroachDB will only emit an event across the rangefeed containing the closed timestamp value every `3s` as per the [`kv.rangefeed.closed_timestamp_refresh_interval`](#kv-rangefeed-closed_timestamp_refresh_interval) value.

`kv.closed_timestamp.side_transport_interval` is helpful when ranges are inactive. The closed timestamp subsystem usually propagates [closed timestamps via Raft commands]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#closed-timestamps). However, an idle range that does not see any writes does not receive any Raft commands, so it would stall. This setting is an efficient mechanism to broadcast closed timestamp updates for all idle ranges between nodes.

Adjusting `kv.closed_timestamp.side_transport_interval` will affect both [follower reads]({% link {{ page.version.version }}/follower-reads.md %}) and changefeeds. While you can use `kv.closed_timestamp.side_transport_interval` to tune the checkpointing interval, we recommend `kv.rangefeed.closed_timestamp_refresh_interval` if you are using follower reads.

#### `kv.rangefeed.closed_timestamp_smear_interval`

**Default:** `1ms`

This setting provides a mechanism to pace the [closed timestamp]({% link {{ page.version.version }}/architecture/transaction-layer.md %}#closed-timestamps) notifications to follower replicas. At the default, the closed timestamp smear interval makes rangefeed closed timestamp delivery less spiky, which can reduce its impact on foreground SQL query latency.

For example, if you have a large table, and one of the nodes in the cluster is hosting 6000 ranges from this table. Normally, the rangefeed system will wake up every [`kv.rangefeed.closed_timestamp_refresh_interval`](#kv-rangefeed-closed_timestamp_refresh_interval) (default `3s`) and every 3 seconds it will publish checkpoints for all 6000 ranges. In this scenario, the `kv.rangefeed.closed_timestamp_smear_interval` setting takes the `3s` frequency and divides it into `1ms` chunks. Instead of publishing checkpoints for all 6000 ranges, it will publish checkpoints for 2 ranges every `1ms`. This produces a more predictable and level load, rather than spiky, large bursts of workload.

### Lagging ranges

{% include {{ page.version.version }}/cdc/lagging-ranges.md %}

## Tuning for high durability delivery

When designing a system that relies on high durability message delivery—that is, not missing any message acknowledgement at the downstream sink—consider the following settings and configuration in this section:

- [Pausing changefeeds and garbage collection](#pausing-changefeeds-and-garbage-collection)
- [Defining Kafka message acknowledgment](#defining-kafka-message-acknowledgment)
- [Choosing changefeed sinks](#choosing-changefeed-sinks)
- [Defining schema change behavior](#defining-schema-change-behavior)

Before tuning these settings, we recommend reading details on our [changefeed at-least-once-delivery guarantee]({% link {{ page.version.version }}/changefeed-messages.md %}#ordering-and-delivery-guarantees).

### Pausing changefeeds and garbage collection

By default, [protected timestamps]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) will protect changefeed data from [garbage collection]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection) up to the time of the [_checkpoint_]({% link {{ page.version.version }}/how-does-a-changefeed-work.md %}). Protected timestamps will protect changefeed data from garbage collection if the downstream [changefeed sink]({% link {{ page.version.version }}/changefeed-sinks.md %}) is unavailable until you either [cancel]({% link {{ page.version.version }}/cancel-job.md %}) the changefeed or the sink becomes available once again.

However, if the changefeed lags too far behind, the protected changes could lead to an accumulation of garbage. This could result in increased disk usage and degraded performance for some workloads.

For more detail on changefeeds and protected timestamps, refer to [Garbage collection and changefeeds]({% link {{ page.version.version }}/protect-changefeed-data.md %}).

To balance protecting change data and prevent the over-accumulation of garbage, Cockroach Labs recommends creating a changefeed with [options to define your protection duration](#protecting-change-data-on-pause) and [monitoring your changefeed](#monitoring-protected-timestamp-records) for protected timestamp record collection.

#### Protecting change data on pause

[Create changefeeds]({% link {{ page.version.version }}/create-changefeed.md %}) with the following options so that your changefeed protects data when it is [paused]({% link {{ page.version.version }}/pause-job.md %}):

- [`protect_data_from_gc_on_pause`]({% link {{ page.version.version }}/create-changefeed.md %}#protect-data-from-gc-on-pause): to protect changes while the changefeed is paused until you [resume]({% link {{ page.version.version }}/resume-job.md %}) the changefeed.
- [`on_error=pause`]({% link {{ page.version.version }}/create-changefeed.md %}#on-error): to pause the changefeed when it encounters an error. By default, changefeeds treat errors as retryable apart from some [exceptions]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#changefeed-retry-errors).
- [`gc_protect_expires_after`]({% link {{ page.version.version }}/create-changefeed.md %}#gc-protect-expires-after): to automatically expire the [protected timestamp records]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) that are older than your defined duration and [cancel]({% link {{ page.version.version }}/cancel-job.md %}) the changefeed job.

#### Monitoring protected timestamp records

{% include {{ page.version.version }}/cdc/pts-gc-monitoring.md %}

### Defining Kafka message acknowledgment

To determine what a successful write to Kafka is, you can configure the [`kafka_sink_config` option]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka-sink-configuration). The `'RequiredAcks'` field specifies what a successful write to Kafka is. CockroachDB [guarantees at least once delivery of messages]({% link {{ page.version.version }}/changefeed-messages.md %}#ordering-and-delivery-guarantees)—the `'RequiredAcks'` value defines the **delivery**.

For high durability delivery, Cockroach Labs recommends setting:

~~~
kafka_sink_config='{'RequiredAcks': 'ALL'}'
~~~

`ALL` provides the highest consistency level. A quorum of Kafka brokers that have committed the message must be reached before the leader can acknowledge the write.

{{site.data.alerts.callout_info}}
{% include {{ page.version.version }}/cdc/kafka-acks.md %}
{{site.data.alerts.end}}

### Choosing changefeed sinks

Use [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) or [cloud storage]({% link {{ page.version.version }}/changefeed-sinks.md %}#cloud-storage-sink) sinks when tuning for high durability delivery in changefeeds. Both Kafka and cloud storage sinks offer built-in advanced protocols, whereas the [webhook sink]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink), while flexible, requires an understanding of how messages are acknowledged and committed by the particular system used for the webhook in order to ensure the durability of message delivery.

### Defining schema change behavior

Ensure that data is ingested downstream in its new format after a [schema change]({% link {{ page.version.version }}/online-schema-changes.md %}) by using the [`schema_change_events`]({% link {{ page.version.version }}/create-changefeed.md %}#schema-change-events) and [`schema_schange_policy`]({% link {{ page.version.version }}/create-changefeed.md %}#schema-change-policy) options. For example, setting `schema_change_events=column_changes` and `schema_change_policy=stop` will trigger an error to the `cockroach.log` file on a [schema change]({% link {{ page.version.version }}/changefeed-messages.md %}#schema-changes-with-column-backfill) and the changefeed to fail.

## Tuning for high throughput

When designing a system that needs to emit a lot of changefeed messages, whether it be steady traffic or a burst in traffic, consider the following settings and configuration in this section:

- [Setting the `resolved` option](#setting-the-resolved-option)
- [Batching and buffering messages](#batching-and-buffering-messages)
- [Configuring file and message format](#configuring-file-and-message-format)
- [Configuring for tables with many ranges](#configuring-for-tables-with-many-ranges)
- [Adjusting concurrent changefeed work](#adjusting-concurrent-changefeed-work)

### Setting the `resolved` option

When a changefeed emits a [resolved]({% link {{ page.version.version }}/create-changefeed.md %}#resolved) message, it force flushes all outstanding messages that have buffered, which will diminish your changefeed's throughput while the flush completes. Therefore, if you are aiming for higher throughput, we suggest setting the duration higher (e.g., 10 minutes), or **not** using the `resolved` option.

If you are setting the `resolved` option when you are aiming for high throughput, you must also consider the [`min_checkpoint_frequency`]({% link {{ page.version.version }}/create-changefeed.md %}#min-checkpoint-frequency) option, which defaults to `30s`. This option controls how often nodes flush their progress to the [coordinating changefeed node]({% link {{ page.version.version }}/how-does-a-changefeed-work.md %}). As a result, `resolved` messages will not be emitted more frequently than the configured `min_checkpoint_frequency`. Set this option to at least as long as your `resolved` option duration.

### Batching and buffering messages

- Batch messages to your sink:
    - For a [Kafka sink]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka), refer to the [`Flush`]({% link {{ page.version.version }}/changefeed-sinks.md %}#flush) parameter for the `kafka_sink_config` option.
    - For a [cloud storage sink]({% link {{ page.version.version }}/changefeed-sinks.md %}#cloud-storage-sink), use the [`file_size`]({% link {{ page.version.version }}/create-changefeed.md %}#file-size) parameter to flush a file when it exceeds the specified size.
    - For a [webhook sink]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink), refer to the [`Flush`]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink-configuration) parameter for the `webhook_sink_config` option.
- Set the [`changefeed.memory.per_changefeed_limit`]({% link {{ page.version.version }}/cluster-settings.md %}) cluster setting to a higher limit to give more memory for buffering changefeed data. This setting influences how often the changefeed will flush buffered messages. This is useful during heavy traffic.

### Configuring file and message format

- Use `avro` as the emitted message [format]({% link {{ page.version.version }}/create-changefeed.md %}#format) option with Kafka sinks; JSON encoding can potentially create a slowdown.

#### Compression

- Use the [`compression` option]({% link {{ page.version.version }}/create-changefeed.md %}#compression) when you create a changefeed emitting data files to a [cloud storage sink]({% link {{ page.version.version }}/changefeed-sinks.md %}#cloud-storage-sink). For larger files, set `compression` to the `zstd` format.
- Use the `snappy` compression format to emit messages to a [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka-compression) sink. If you're intending to do large batching for Kafka, use the `lz4` compression format.

#### File size

To configure changefeeds emitting to [cloud storage sinks]({% link {{ page.version.version }}/changefeed-sinks.md %}#cloud-storage-sink) for high throughput, you should consider:

- Increasing the [`file_size`]({% link {{ page.version.version }}/create-changefeed.md %}#file-size) parameter to control the size of the files that the changefeed sends to the sink. The default is `16MB`. To configure for high throughput, we recommend `32MB`–`128MB`. Note that this is not a hard limit, and a changefeed will flush the file when it reaches the specified size.
- When you [compress](#compression) a file, it will contain many more events.
- File size is also dependent on what kind of data the changefeed job is writing. For example, large JSON blobs will quickly fill up the `file_size` value compared to small rows.
- When you change or increase `file_size`, ensure that you adjust the `changefeed.memory.per_changefeed_limit` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}), which has a default of `512MiB`. Buffering messages can quickly reach this limit if you have increased the file size.

### Configuring for tables with many ranges

If you have a table with 10,000 or more [ranges]({% link {{ page.version.version }}/architecture/overview.md %}#range), you should consider increasing the `kv.rangefeed.concurrent_catchup_iterators` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}). This changes the number of [rangefeed]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds) catchup iterators a store will allow concurrently before queuing. The default is `16`. We strongly recommend increasing this setting slowly. That is, increase the setting and then [monitor]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}) its impact before adjusting further.

### Adjusting concurrent changefeed work

- Increase the [`changefeed.backfill.concurrent_scan_requests` setting]({% link {{ page.version.version }}/cluster-settings.md %}), which controls the number of concurrent scan requests per node issued during a [backfill event]({% link {{ page.version.version }}/changefeed-messages.md %}#schema-changes-with-column-backfill). The default behavior, when this setting is at `0`, is that the number of scan requests will be 3 times the number of nodes in the cluster (to a maximum of 100). While increasing this number will allow for higher throughput, it **will increase the cluster load overall**, including CPU and IO usage.
- The [`kv.rangefeed.catchup_scan_iterator_optimization.enabled` setting]({% link {{ page.version.version }}/cluster-settings.md %}) is `on` by default. This causes [rangefeeds]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds) to use time-bound iterators for catch-up scans when possible. Catch-up scans are run for each rangefeed request. This setting improves the performance of changefeeds during some [range-split operations]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#range-splits).

## See also

- [Cluster Settings]({% link {{ page.version.version }}/cluster-settings.md %})
- [Changefeed Sinks]({% link {{ page.version.version }}/changefeed-sinks.md %})
- [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %})
