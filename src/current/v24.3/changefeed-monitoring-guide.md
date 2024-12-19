---
title: Changefeed Monitoring Guide
summary: Learn about how to monitor stages of the changefeed pipeline.
toc: true
---

CockroachDB changefeeds are long-running jobs that work as a pipeline of change events emitted from a [_watched_ table]({% link {{ page.version.version }}/change-data-capture-overview.md %}#watched-table) through to the [downstream sink]({% link {{ page.version.version }}/changefeed-sinks.md %}). The change events from the [storage layer]({% link {{ page.version.version }}/architecture/storage-layer.md %}) of CockroachDB progress through the changefeed pipeline and are encoded into messages for delivery to the sink.

This guide provides recommendations for monitoring and alerting on changefeeds throughout the pipeline to ensure reliable operation and quick problem detection.

{{site.data.alerts.callout_success}}
For details on how changefeeds work as jobs in CockroachDB, refer to the [technical overview]({% link {{ page.version.version }}/how-does-an-enterprise-changefeed-work.md %}).
{{site.data.alerts.end}}

## Overview

To monitor changefeed jobs effectively, it is necessary to have a view of the high-level metrics that track the health of the changefeed overall and a view of metrics that track the different stages of the changefeed pipeline.

The changefeed pipeline contains three main sections that start at the storage layer of CockroachDB and end at the downstream sink with message delivery. The work that is completed in each of these pipeline sections feeds metrics that you can track. Each of these metrics relate to a stage within the pipeline section that helps to identify where potential issues are occurring.

- Rangefeed: Changefeeds connect to a long-lived request called a _rangefeed_, which pushes changes as they happen. 
- Processing: Prepares the change events from the rangefeed into changefeed messages — encodes messages into the specified format. 
- Sink: Delivery of message to the downstream sink. 

<img src="{{ 'images/v24.3/changefeed-pipeline.svg' | relative_url }}" alt="An overview of the changefeed pipeline and the metrics that are connected to each stage." style="width:100%" />

Metrics can be scoped by a configured metrics label, which allows you to measure metrics per changefeed.

## Overall pipeline metrics

{% comment %}Decide where to place:
Explanation of scoped/not scoped
Investigation description
{% endcomment %}

### High-level performance metrics

- Metric: `(now() - changefeed.checkpoint_progress)`
    - Description: The progress of changefeed [checkpointing]({% link {{ page.version.version }}/how-does-an-enterprise-changefeed-work.md %}). Indicates how recently the changefeed state was persisted durably. Critical for monitoring changefeed [recovery capability]({% link {{ page.version.version }}/changefeed-messages.md %}#duplicate-messages).
    - Investigation needed: If checkpointing falls behind, it affects:
        - Recovery time after failures.
        - Ability to resume from last known good state.
        - Resource usage during catch-up after restarts.
    - Not Scoped
    - Supported Versions: v23.2.3+, v24.1.0+
    - Datadog integration: `cockroachdb.changefeed.checkpoint_progress`

### End-to-end performance metrics

#### End-to-end commit latency

- Metric: `changefeed.commit_latency`
    - Description: The time between when a [transaction]({% link {{ page.version.version }}/transactions.md %}) commits and when the changefeed emits the corresponding changes. Includes rangefeed and buffer delays.
    - Scoped
    - Supported Versions: v23.2.3+, v24.1.0+
    - Datadog integration: `cockroachdb.changefeed.commit.latency`

#### Batch latency

- Metric: `changefeed.sink_batch_hist_nanos`
    - Description: End-to-end latency from the change event being put in a batch to the changefeed emitting it to the sink.
    - Investigation needed: If there are consistently high values, it indicates bottlenecks in the pipeline.
    - Not scoped
    - Supported Versions: v23.2.3+, v24.1.0+

#### Protected timestamp age

- Metric: `jobs.changefeed.protected_age_sec`
    - Description: Age of the [protected timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) record for the changefeed.
    - Investigation: High values may indicate changefeed processing delays or resource constraints.
    - Impact: High values can [block garbage collection]({% link {{ page.version.version }}/protect-changefeed-data.md %}) and lead to increased disk usage and degraded performance for some workloads.
    - Not scoped
    - Supported versions: v23.2.0+

#### Progress tracking

- Metrics: 
    - `high_water_timestamp` from [`SHOW CHANGEFEED JOBS`]({% link {{ page.version.version }}/show-jobs.md %}#show-changefeed-jobs) 
    - `(now() - changefeed.aggregator_progress)`
        - Scoped
    - `changefeed.max_behind_nanos`
        - Not scoped
    - Description: Each of these metrics helps to measure how far behind the changefeed is from the current time.
    - Investigation: Growing delay indicates changefeed processing and emission cannot keep up with the rate of change events.
    - Supported versions: v23.2.3+, v24.1.0+

## Pipeline section metrics

### Rangefeed

#### Buffer memory usage

- Metric: `changefeed.buffer_entries.allocated_mem.rangefeed`
- Impact: High memory usage may indicate backpressure.
- Not scoped
- Supported versions: v23.2.13+, v24.1.6+, v24.2.4+, v24.3.0+

#### Rangefeed buffer latency

- Metrics: 
    - `changefeed.stage.rangefeed_buffer_checkpoint.latency` (count/sum/bucket)
    - `changefeed.stage.rangefeed_buffer_value.latency` (count/sum/bucket)
- Impact: Indicates potential scanning or changefeed catch-up issues.
- Scoped
- Supported Versions: v23.2.13+, v24.1.6+, v24.2.4+, v24.3.0+

#### KV feed

- Metric: `changefeed.stage.kv_feed_wait_for_table_event.latency` (count/sum/bucket)
- Impact: Potential bottlenecks in encoding, batching, sending data, or with the sink. Use in conjunction with the [downstream delivery metrics](#downstream-delivery).
- Not scoped
- Supported Versions: v23.2.13+, v24.1.6+, v24.2.4+, v24.3.0+

### Processing — aggregation and encoding

#### Aggregator buffer health

- Metrics:
    - `changefeed.buffer_entries.allocated_mem.aggregator`
    - `changefeed.stage.kv_feed_buffer.latency` (count/sum/bucket)
- Scoped
- Supported Versions: v23.2.13+, v24.1.6+, v24.2.4+, v24.3.0+

#### Encoding performance

- Metric: `changefeed.stage.encode.latency` (count/sum/bucket)
- Impact: High encoding latency can create a bottleneck for the entire pipeline.
- Scoped
- Supported Versions: v23.2.13+, v24.1.6+, v24.2.4+, v24.3.0+

### Sink

#### Sink performance 

(webhook, Google Cloud Pub/Sub, (new) Kafka)

- Metrics: `changefeed.parallel_io_queue_nanos`
- Scoped
- Supported Versions: v23.2.0+

#### Sink errors

- Metric: `changefeed.sink_errors`
- Impact: Indicates connectivity or downstream processing issues.
- Scoped
- Supported Versions: v23.2.16+, v24.1.7,+, v24.2.5+, v24.3.0+

#### Downstream delivery

- Metrics:
    - `changefeed.stage.downstream_client_send.latency` (count/sum/bucket)
    - `changefeed.internal_retry_message_count`
- Impact: Indicates connectivity or downstream processing issues.
- Scoped by `changefeed_job_id`
- Supported Versions: v23.2.13+, v24.1.6+, v24.2.4+, v24.3.0+

## Suggested dashboards

The [**Custom Chart** debug page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}) in the DB Console allows you to create one of multiple charts showing any combination of available metrics. Considering metrics on this page, we suggest creating the following dashboards with

{% comment %}Intro to this section re custom dashboards{% endcomment %}

- Main overview dashboard
    - End-to-end latency graph
    - Progress tracking panel
    - Error rate panel
    - Memory usage across buffers

- Performance dashboard
    - Component-wise latency breakdown
    - Buffer utilization metrics
    - Encoding performance
    - Sink throughput

- Error tracking dashboard
    - Sink errors over time
    - Retry counts

## Common troubleshooting scenarios

High End-to-End Latency
Check component-wise latency breakdown
Monitor buffer utilization
Verify downstream sink performance
Review error rates and retries

Rangefeed Pressure
Monitor buffer_entries_allocated_mem
Check aggregator buffer usage
Review changefeed configuration
Consider scaling resources

Sink Performance Issues
Monitor sink_errors
Check downstream system health
