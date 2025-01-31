---
title: Changefeed Monitoring Guide
summary: Learn about how to monitor stages of the changefeed pipeline.
toc: true
---

CockroachDB [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) are long-running [jobs]({% link {{ page.version.version }}/show-jobs.md %}) that work as a pipeline of change events emitted from a [_watched_ table]({% link {{ page.version.version }}/change-data-capture-overview.md %}#watched-table) through to the [downstream sink]({% link {{ page.version.version }}/changefeed-sinks.md %}). The change events from the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}) of CockroachDB progress through the changefeed pipeline and are encoded into [messages]({% link {{ page.version.version }}/changefeed-messages.md %}) that the changefeed job delivers to a sink, such as Kafka.

This guide provides recommendations for monitoring and alerting on changefeeds throughout the pipeline to ensure reliable operation and quick problem detection.

{{site.data.alerts.callout_success}}
For details on how changefeeds work as jobs in CockroachDB, refer to the [technical overview]({% link {{ page.version.version }}/how-does-an-enterprise-changefeed-work.md %}).
{{site.data.alerts.end}}

## Overview

To monitor changefeed jobs effectively, it is necessary to have a view of the high-level metrics that track the health of the changefeed overall and metrics that track the different stages of the changefeed pipeline.

The changefeed pipeline contains three main sections that start at the storage layer of CockroachDB and end at the downstream sink with message delivery. The work completed in each of these pipeline sections feeds metrics that you can track and use to identify where issues could occur.

- [**Rangefeed**](#rangefeed): Connects changefeeds to a long-lived request called a [_rangefeed_]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds), which pushes changes as they happen. 
- [**Processing**](#processing-aggregation-and-encoding): Prepares the change events from the rangefeed into [changefeed messages]({% link {{ page.version.version }}/changefeed-messages.md %}) by encoding messages into the specified format. 
- [**Sink**](#sink): Delivers changefeed messages to the [downstream sink]({% link {{ page.version.version }}/changefeed-sinks.md %}). 

<img src="{{ 'images/v24.3/changefeed-pipeline.svg' | relative_url }}" alt="An overview of the changefeed pipeline and the metrics that are connected to each stage." style="width:100%" />

Where noted in the following sections, you can use changefeed [metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels) to measure metrics per changefeed.

You can [enable the Datadog integration]({% link {{ page.version.version }}/datadog.md %}) on your cluster to collect data and alert on [selected CockroachDB metrics](https://docs.datadoghq.com/integrations/cockroachdb/?tab=host#data-collected) using the Datadog platform.

## Overall pipeline metrics

### High-level performance metrics

- Metric: `(now() - changefeed.checkpoint_progress)`
- Description: The progress of changefeed [checkpointing]({% link {{ page.version.version }}/how-does-an-enterprise-changefeed-work.md %}). Indicates how recently the changefeed state was persisted durably. Critical for monitoring changefeed [recovery capability]({% link {{ page.version.version }}/changefeed-messages.md %}#duplicate-messages).
- Investigation needed: If checkpointing falls too far behind the current time.
- Impact:
    - Recovery time after failures.
    - Ability to resume from last known good state.
    - Resource usage during catch-up after restarts.
- Supported Versions: v23.2.3+, v24.1.0+

## Pipeline section metrics

### Rangefeed

#### Buffer memory usage

- Metric: `changefeed.buffer_entries.allocated_mem.rangefeed`
- Description: The current quota pool memory allocation between the rangefeed and the KV feed.
- Impact: High memory usage may indicate backpressure.
- Supported versions: v23.2.13+, v24.1.6+, v24.2.4+, v24.3.0+

#### Rangefeed buffer latency

- Metrics: 
    - `changefeed.stage.rangefeed_buffer_checkpoint.latency` (count/sum/bucket)
    - `changefeed.stage.rangefeed_buffer_value.latency` (count/sum/bucket)
- Description: Latency within the rangefeed section of the changefeed pipeline.
- Impact: Indicates potential scanning or changefeed catch-up issues.
- Use with [metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels).
- Supported Versions: v23.2.13+, v24.1.6+, v24.2.4+, v24.3.0+

#### KV feed

- Metric: `changefeed.stage.kv_feed_wait_for_table_event.latency` (count/sum/bucket)
- Description: Latency within the [processing section](#processing-aggregation-and-encoding) of the changefeed pipeline.
- Impact: Potential bottlenecks in encoding, batching, sending data, or at the [sink]({% link {{ page.version.version }}/changefeed-sinks.md %}). Use this metric in conjunction with the [downstream delivery metrics](#downstream-delivery).
- Supported Versions: v23.2.13+, v24.1.6+, v24.2.4+, v24.3.0+

### Processing — aggregation and encoding

#### Aggregator buffer health

- Metrics:
    - `changefeed.buffer_entries.allocated_mem.aggregator`
    - `changefeed.stage.kv_feed_buffer.latency` (count/sum/bucket)
- Description: The current quota pool memory allocation between the KV feed and the sink. Latency within the processing section of the changefeed pipeline.
- Use with [metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels).
- Supported Versions: v23.2.13+, v24.1.6+, v24.2.4+, v24.3.0+

#### Encoding performance

- Metric: `changefeed.stage.encode.latency` (count/sum/bucket)
- Description: Latency encoding data within the processing section of the changefeed pipeline.
- Impact: High encoding latency can create a bottleneck for the entire changefeed pipeline.
- Use with [metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels).
- Supported Versions: v23.2.13+, v24.1.6+, v24.2.4+, v24.3.0+

### Sink

#### Sink performance 

{{site.data.alerts.callout_info}}
This metric is supported for [webhook]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink), [Google Cloud Pub/Sub]({% link {{ page.version.version }}/changefeed-sinks.md %}#google-cloud-pub-sub), and the latest version of the CockroachDB [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) sink, which is the [default from v24.2.1]({% link v24.2/changefeed-sinks.md %}#kafka).
{{site.data.alerts.end}}

- Metric: `changefeed.parallel_io_queue_nanos`
- Description: The time that outgoing requests to the sink spend waiting in a queue due to in-flight requests with conflicting keys.
- Use with [metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels).
- Supported Versions: v23.2.0+

#### Sink errors

- Metric: `changefeed.sink_errors`
- Description: The number of changefeed errors caused by the sink.
- Impact: Indicates connectivity or downstream processing issues.
- Use with [metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels).
- Supported Versions: v23.2.16+, v24.1.7,+, v24.2.5+, v24.3.0+

#### Downstream delivery

- Metrics:
    - `changefeed.stage.downstream_client_send.latency` (count/sum/bucket)
    - `changefeed.internal_retry_message_count`
- Description: Latency when flushing messages from a sink's client to the downstream sink. (This includes sends that failed for most, but not all sinks.) The number of messages for which an aggregator node attempted to retry.
- Impact: Indicates connectivity or downstream processing issues.
- Scoped by `changefeed_job_id`
- Supported Versions: v23.2.13+, v24.1.6+, v24.2.4+, v24.3.0+

## See also
- [Monitor and Debug Changefeeds]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %})
- [The DB Console Overview]({% link {{ page.version.version }}/ui-overview.md %})
- [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %})
- [Advanced Changefeed Configuration]({% link {{ page.version.version }}/advanced-changefeed-configuration.md %})