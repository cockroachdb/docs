---
title: Changefeed Monitoring Guide
summary: Learn how to monitor stages of the changefeed pipeline.
toc: true
---

CockroachDB [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) are long-running [jobs]({% link {{ page.version.version }}/show-jobs.md %}) that work as a pipeline of change events emitted from a [_watched_ table]({% link {{ page.version.version }}/change-data-capture-overview.md %}#watched-table) through to the [downstream sink]({% link {{ page.version.version }}/changefeed-sinks.md %}). The change events from the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}) of CockroachDB progress through the changefeed pipeline and are encoded into [messages]({% link {{ page.version.version }}/changefeed-messages.md %}) that the changefeed job delivers to a sink, such as Kafka.

This guide provides recommendations for monitoring and alerting on changefeeds throughout the pipeline to ensure reliable operation and quick problem detection.

{{site.data.alerts.callout_success}}
For details on how changefeeds work as jobs in CockroachDB, refer to the [technical overview]({% link {{ page.version.version }}/how-does-a-changefeed-work.md %}).
{{site.data.alerts.end}}

## Overview

To monitor changefeed jobs effectively, it is necessary to have a view of the high-level metrics that track the health of the changefeed overall and metrics that track the different stages of the changefeed pipeline.

The changefeed pipeline contains three main sections that start at the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}) of CockroachDB and end at the [downstream sink]({% link {{ page.version.version }}/changefeed-sinks.md %}) with message delivery. The work completed in each of these pipeline sections feeds metrics that you can track and use to identify where issues could occur.

- [**Rangefeed**](#rangefeed): Connects changefeeds to a long-lived request called a [_rangefeed_]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds), which pushes changes as they happen. 
- [**Processing**](#processing-aggregation-and-encoding): Prepares the change events from the rangefeed into [changefeed messages]({% link {{ page.version.version }}/changefeed-messages.md %}) by encoding messages into the specified [format]({% link {{ page.version.version }}/changefeed-messages.md %}#message-formats).  
- [**Sink**](#sink): Delivers changefeed messages to the [downstream sink]({% link {{ page.version.version }}/changefeed-sinks.md %}). 

<img src="/docs/images/{{ page.version.version }}/changefeed-pipeline.svg" alt="An overview of the changefeed pipeline and the metrics that are connected to each stage." style="width:100%" />

Where noted in the following sections, you can use changefeed [metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels) to measure metrics per changefeed.

You can [enable the Datadog integration]({% link {{ page.version.version }}/datadog.md %}) on your cluster to collect data and alert on [selected CockroachDB metrics](https://docs.datadoghq.com/integrations/cockroachdb/?tab=host#data-collected) using the Datadog platform.

{{site.data.alerts.callout_info}}
Metrics names in Prometheus replace the `.` with `_`. In Datadog, metrics names can differ, refer to the [Datadog metrics list](https://docs.datadoghq.com/integrations/cockroachdb/?tab=host#metrics).
{{site.data.alerts.end}}

## Overall pipeline metrics

### High-level performance metrics

- Metrics: 
    - `changefeed.max_behind_nanos`
        - Description: The maximum lag in nanoseconds between the timestamp of the most recent [resolved timestamp]({% link {{ page.version.version }}/changefeed-messages.md %}#resolved-timestamp-frequency) emitted by the changefeed and the current time. Indicates how far behind the changefeed is in processing changes.
        - Use with [metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels).
        - Investigation needed: If `changefeed.max_behind_nanos` is consistently increasing.
    - `(now() - changefeed.checkpoint_progress)`
        - Description: The progress of changefeed [checkpointing]({% link {{ page.version.version }}/how-does-a-changefeed-work.md %}). Indicates how recently the changefeed state was persisted durably. Critical for monitoring changefeed [recovery capability]({% link {{ page.version.version }}/changefeed-messages.md %}#duplicate-messages).
        - Investigation needed: If checkpointing falls too far behind the current time.
- Impact:
    - Slow processing of changes and updates to downstream sinks.
    - Recovery time after failures, potential for increase in change backlog.
    - Ability to resume from last known good state.
    - Resource usage during catch-up after restarts or failures.

### End-to-end performance metrics

#### End-to-end commit latency

- Metric: `changefeed.commit_latency`
- Description: The time between when a [transaction]({% link {{ page.version.version }}/transactions.md %}) commits and when the changefeed emits the corresponding changes. This time includes rangefeed and buffer delays.
- Use with [metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels).

#### Batch latency

- Metric: `changefeed.sink_batch_hist_nanos`
- Description: The end-to-end latency from the change event being put in a batch to the changefeed emitting the event message to the sink.
- Investigation needed: If this metric has consistently high values, it indicates that there are bottlenecks in the pipeline.

#### Protected timestamp age

- Metric: `jobs.changefeed.protected_age_sec`
- Description: The age of the [protected timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) record for the changefeed.
- Investigation needed: If this metric has high values, it may indicate changefeed processing delays or resource constraints.
- Impact: High values can [block garbage collection]({% link {{ page.version.version }}/protect-changefeed-data.md %}) and lead to increased disk usage and degraded performance for some workloads.

#### Progress tracking

- Metrics: 
    - `high_water_timestamp` from [`SHOW CHANGEFEED JOBS`]({% link {{ page.version.version }}/show-jobs.md %}#show-changefeed-jobs) 
    - `(now() - changefeed.aggregator_progress)`
        - Use with [metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels).
    - `changefeed.max_behind_nanos`
        - Use with [metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels).
    - `(now() - changefeed.checkpoint_progress)`
- Description: These metrics help to measure how far behind the changefeed is from the current time.
- Investigation: A growing delay indicates changefeed processing and messages emitting cannot keep up with the rate of change events.

## Pipeline section metrics

### Rangefeed

#### Buffer memory usage

- Metric: `changefeed.buffer_entries.allocated_mem.rangefeed`
- Description: The current quota pool memory allocation between the rangefeed and the KV feed.
- Impact: High memory usage may indicate backpressure.

#### Rangefeed buffer latency

- Metrics: 
    - `changefeed.stage.rangefeed_buffer_checkpoint.latency` (count/sum/bucket)
    - `changefeed.stage.rangefeed_buffer_value.latency` (count/sum/bucket)
- Description: Latency within the rangefeed section of the changefeed pipeline.
- Impact: Indicates potential scanning or changefeed catch-up issues.
- Use with [metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels).

#### KV feed

- Metric: `changefeed.stage.kv_feed_wait_for_table_event.latency` (count/sum/bucket)
- Description: Latency within the [processing section](#processing-aggregation-and-encoding) of the changefeed pipeline.
- Impact: Potential bottlenecks in encoding, batching, sending data, or at the [sink]({% link {{ page.version.version }}/changefeed-sinks.md %}). Use this metric in conjunction with the [downstream delivery metrics](#downstream-delivery).

### Processing — aggregation and encoding

#### Aggregator buffer health

- Metrics:
    - `changefeed.buffer_entries.allocated_mem.aggregator`
    - `changefeed.stage.kv_feed_buffer.latency` (count/sum/bucket)
- Description: The current quota pool memory allocation between the KV feed and the sink. Latency within the processing section of the changefeed pipeline.
- Use with [metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels).

#### Encoding performance

- Metric: `changefeed.stage.encode.latency` (count/sum/bucket)
- Description: Latency encoding data within the processing section of the changefeed pipeline.
- Impact: High encoding latency can create a bottleneck for the entire changefeed pipeline.
- Use with [metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels).

### Sink

#### Sink performance 

{{site.data.alerts.callout_info}}
This metric is supported for [webhook]({% link {{ page.version.version }}/changefeed-sinks.md %}#webhook-sink), [Google Cloud Pub/Sub]({% link {{ page.version.version }}/changefeed-sinks.md %}#google-cloud-pub-sub), and the latest version of the CockroachDB [Kafka]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) sink.
{{site.data.alerts.end}}

- Metric: `changefeed.parallel_io_queue_nanos`
- Description: The time that outgoing requests to the sink spend waiting in a queue due to in-flight requests with conflicting keys.
- Use with [metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels).

#### Sink errors

- Metric: `changefeed.sink_errors`
- Description: The number of changefeed errors caused by the sink.
- Impact: Indicates connectivity or downstream processing issues.
- Use with [metrics labels]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#using-changefeed-metrics-labels).

#### Downstream delivery

- Metrics:
    - `changefeed.stage.downstream_client_send.latency` (count/sum/bucket)
    - `changefeed.internal_retry_message_count`
- Description: Latency when flushing messages from a sink's client to the downstream sink. (This includes sends that failed for most, but not all sinks.) The number of messages for which an aggregator node attempted to retry.
- Impact: Indicates connectivity or downstream processing issues.
- Scoped by `changefeed_job_id`

## See also
- [Monitor and Debug Changefeeds]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %})
- [The DB Console Overview]({% link {{ page.version.version }}/ui-overview.md %})
- [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %})
- [Advanced Changefeed Configuration]({% link {{ page.version.version }}/advanced-changefeed-configuration.md %})