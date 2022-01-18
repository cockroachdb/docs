---
title: Advanced Changefeed Configuration
summary: Tune changefeeds for high durability delivery or throughput.
toc: true
---

## Advanced changefeed configuration

{{site.data.alerts.callout_danger}}
The configurations and settings explained in these sections will have significant impact on a changefeed's behavior.
{{site.data.alerts.end}}

The following sections describe settings, configurations, and details to tune changefeeds for particular use cases:

* [High durability delivery](#tuning-for-high-durability-delivery)
* [High throughput](#tuning-for-high-throughput)

<!--NOTE Add a note or similar that these are on another sink-specific page. -->
* [Kafka sinks](#kafka-sink-configuration)
* [Webhook sinks](#webhook-sink-configuration)

### Tuning for high durability delivery


When designing a system that relies on high durability of message delivery — that is, not missing any message acknowledgement at the downstream sink — consider the following settings and configuration. Before tuning these settings we recommend reading details on our [changefeed at-least-once-delivery guarantee](stream-data-out-of-cockroachdb-using-changefeeds.html#ordering-guarantees).

* Increase the number of seconds before [garbage collection](architecture/storage-layer.html#garbage-collection) with the [`gc.ttlseconds`](configure-replication-zones.html#gc-ttlseconds) setting to provide a higher recoverability window for data if a changefeed fails. For example, if a sink is unavailable, changes are queued until the sink is available again. While the sink is unavailable, changes will be retried until the garbage collection window is reached and then the data is removed.
  * You can also use the [`protect_data_from_gc_on_pause`](#protect-pause) option in combination with [`on_error=pause`](#on-error) to explicitly pause a changefeed on error (instead of going into a failure state) and to then protect the changes from garbage collection.
* Determine what a successful write to Kafka is with the [`kafka_sink_config: {"RequiredAcks": "ALL"}`](#kafka-required-acks) option, which provides the highest consistency level.
* Use [Kafka](#kafka) or [cloud storage](#cloud-storage-sink) sinks when tuning for high durability delivery in changefeeds. Both Kafka and cloud storage sinks offer built-in advanced protocols, whereas the [webhook sink](#webhook-sink), while flexible, requires an understanding of how messages are acknowledged and committed by the particular system used for the webhook in order to ensure the durability of message delivery.
* Ensure that data is ingested downstream in its new format after a schema change by using the [`schema_change_events`](#schema-events) and [`schema_schange_policy`](#schema-policy) options. For example, setting `schema_change_events=column_changes` and `schema_change_policy=stop` will trigger an error to the `cockroach.log` file on a [schema change](stream-data-out-of-cockroachdb-using-changefeeds.html#schema-changes-with-column-backfill) and the changefeed to fail.

### Tuning for high throughput

When designing a system that needs to emit a lot of changefeed messages, whether it be steady traffic or a burst in traffic, consider the following settings and configuration:

* Avoid using the [`resolved`](#resolved-option) option or set this to a higher duration. This will help to reduce emitted messages.
* Batch messages to your sink. See the [`Flush`](#kafka-flush) parameter for the `kafka_sink_config` option. When using cloud storage sinks, use the [`file_size`](#file-size) parameter to flush a file when it exceeds the specified size.
* Set the [`changefeed.memory.per_changefeed_limit`](cluster-settings.html) cluster setting to a higher limit to give more memory for buffering for a changefeed. This is useful in situations of heavy traffic.
* Use `avro` as the emitted message [format](#format) option with Kafka sinks; JSON encoding can potentially create a slowdown.
* Use the [`compression` option](#compression-opt) in cloud storage sinks with JSON to compress the changefeed data files.
* Increase the [`changefeed.backfill.concurrent_scan_requests` setting](cluster-settings.html), which controls the number of concurrent scan requests per node issued during a backfill event. The default behavior, when this setting is at `0`, is that the number of scan requests will be 3 times the number of nodes in the cluster (to a maximum of 100). While increasing this number will allow for higher throughput, it **will increase the cluster load overall**, including CPU and IO usage.
* <span class="version-tag">New in v21.2:</span> Enable the [`kv.rangefeed.catchup_scan_iterator_optimization.enabled` setting](cluster-settings.html) to have [rangefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html#enable-rangefeeds) use time-bound iterators for catch-up scans when possible. Catch-up scans are run for each rangefeed request. This setting improves the performance of changefeeds during some [range-split operations](architecture/distribution-layer.html#range-splits). Changefeeds using the [`WITH diff` option](#diff-opt) do not currently receive any benefit from this [setting](cluster-settings.html).
