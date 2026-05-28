---
title: Changefeeds Dashboard
summary: The Changefeeds dashboard lets you monitor the changefeeds created across your cluster.
toc: true
docs_area: reference.db_console
---

The **Changefeeds** dashboard in the DB Console lets you monitor the [changefeeds]({% link {{ page.version.version }}/change-data-capture-overview.md %}) created across your cluster.

To view this dashboard, [access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access), click **Metrics** on the left-hand navigation bar, and then select **Dashboard** > **Changefeeds**.

{{site.data.alerts.callout_success}}
For more general recommendations on metrics and tooling options for change data capture monitoring, refer to the [Monitor and Debug Changefeeds]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}) page.
{{site.data.alerts.end}}

## Dashboard navigation

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

The **Changefeeds** dashboard displays the following time series graphs:

## Changefeed Status

{% include_cached new-in.html version="v23.2" %} This graph displays the status of all running changefeeds.

<img src="/docs/images/{{ page.version.version }}/ui-changefeed-status.png" alt="DB Console Changefeed Status graph showing running, paused, and failed changefeeds." style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|----
**Running** | The number of changefeeds running.
**Paused** | The number of [paused]({% link {{ page.version.version }}/pause-job.md %}) changefeeds.
**Failed** | The number of changefeeds that have failed.

Refer to [`RESUME JOB`]({% link {{ page.version.version }}/resume-job.md %}) and [`PAUSE JOB`]({% link {{ page.version.version }}/pause-job.md %}) to manage a changefeed.

In the case of a failed changefeed, you may want to use the [`cursor`]({% link {{ page.version.version }}/create-changefeed.md %}#cursor-option) option to restart the changefeed. Refer to the [Start a new changefeed where the previous failed]({% link {{ page.version.version }}/create-changefeed.md %}#start-a-new-changefeed-where-another-ended) example.

## Commit Latency

{% include_cached new-in.html version="v23.2" %} This graph displays the 99th, 90th, and 50th percentile of commit latency for running changefeeds. This is the difference between an event's MVCC timestamp and the time it was acknowledged as received by the [downstream sink]({% link {{ page.version.version }}/changefeed-sinks.md %}).

<img src="/docs/images/{{ page.version.version }}/ui-commit-latency.png" alt="DB Console Commit Latency graph showing the 99th, 90th, and 50th percentile of commit latency." style="border:1px solid #eee;max-width:100%" />

If the sink batches events, then the difference between the oldest event in the batch and acknowledgement is recorded. Latency during backfill is excluded.

## Emitted Bytes

This graph shows the number of bytes emitted by CockroachDB into the changefeed's [downstream sink]({% link {{ page.version.version }}/changefeed-sinks.md %}).

{{site.data.alerts.callout_info}}
In v23.1 and earlier, the **Emitted Bytes** graph was named **Sink Byte Traffic**. If you want to customize charts, including how metrics are named, use the [**Custom Chart** debug page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}).
{{site.data.alerts.end}}

<img src="/docs/images/{{ page.version.version }}/ui-emitted-bytes.png" alt="DB Console Emitted Bytes Graph showing the time and emitted bites" style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|----
**Emitted Bytes** | The number of bytes emitted by CockroachDB into the configured changefeed sinks.

## Sink Counts

This graph displays data relating to the number of messages and flushes at the changefeed sink.

- The number of messages that CockroachDB sent to the sink.
- The number of flushes that the sink performed for changefeeds.

<img src="/docs/images/{{ page.version.version }}/ui-sink-counts.png" alt="DB Console Sink Counts graph" style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|----
**Messages** | The number of messages that CockroachDB sent to the downstream sink.
**Flushes** | The total number of flushes to the sink.

## Max Checkpoint Latency

This graph displays the most any changefeed's persisted [checkpoint]({% link {{ page.version.version }}/how-does-an-enterprise-changefeed-work.md %}) is behind the present time. Larger values indicate issues with successfully ingesting or emitting changes. If errors cause a changefeed to restart, or the changefeed is [paused]({% link {{ page.version.version }}/pause-job.md %}) and unpaused, emitted data up to the last checkpoint may be re-emitted.

{{site.data.alerts.callout_info}}
In v23.1 and earlier, the **Max Checkpoint Latency** graph was named **Max Changefeed Latency**. If you want to customize charts, including how metrics are named, use the [**Custom Chart** debug page]({% link {{ page.version.version }}/ui-custom-chart-debug-page.md %}).
{{site.data.alerts.end}}

<img src="/docs/images/{{ page.version.version }}/ui-max-checkpoint-latency.png" alt="DB Console Max Checkpoint Latency graph" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}
The maximum checkpoint latency is distinct from, and slower than, the commit latency for individual change messages. For more information about resolved timestamps, refer to the [Changefeed Messages]({% link {{ page.version.version }}/changefeed-messages.md %}#resolved-messages) page.
{{site.data.alerts.end}}

## Changefeed Restarts

This graph displays the number of times changefeeds restarted due to [retryable errors]({% link {{ page.version.version }}/monitor-and-debug-changefeeds.md %}#changefeed-retry-errors).

<img src="/docs/images/{{ page.version.version }}/ui-changefeed-restarts.png" alt="DB Console Changefeed Restarts graph" style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|----
**Retryable Errors** | The number of retryable errors that changefeeds are encountering. That is, an error the changefeed will automatically retry.

## Oldest Protected Timestamp

{% include_cached new-in.html version="v23.2" %} This graph displays the oldest [protected timestamp]({% link {{ page.version.version }}/architecture/storage-layer.md %}#protected-timestamps) of any running changefeed on the cluster.

<img src="/docs/images/{{ page.version.version }}/ui-oldest-protected-timestamp.png" alt="DB Console Oldest Protected Timestamp graph" style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|----
**Protected Timestamp Age** | The age of the oldest protected timestamp (of any changefeed) that is protecting data from being [garbage collected]({% link {{ page.version.version }}/architecture/storage-layer.md %}#garbage-collection).

## Backfill Pending Ranges

{% include_cached new-in.html version="v23.2" %} This graph displays the number of ranges being backfilled that are yet to enter the changefeed pipeline. An [initial scan]({% link {{ page.version.version }}/create-changefeed.md %}#initial-scan) or [schema change]({% link {{ page.version.version }}/online-schema-changes.md %}) can cause a backfill.

<img src="/docs/images/{{ page.version.version }}/ui-backfill-pending-ranges.png" alt="DB Console Backfill Pending Ranges graph" style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|----
**Backfill Pending Ranges** | The number of ranges in the backfill process that have not yet entered the changefeed stream.

## Schema Registry Registrations

{% include_cached new-in.html version="v23.2" %} This graph displays the rate of schema registration requests made by CockroachDB nodes to a configured schema registry endpoint. For example, a [Kafka sink]({% link {{ page.version.version }}/changefeed-sinks.md %}#kafka) pointing to a [Confluent Schema Registry]({% link {{ page.version.version }}/stream-a-changefeed-to-a-confluent-cloud-kafka-cluster.md %}).

<img src="/docs/images/{{ page.version.version }}/ui-schema-registry-registrations.png" alt="DB Console Schema Registry Registrations graph" style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|----
**Schema Registry Registrations** | The number of registrations to a downstream schema registry.

## Ranges in catchup mode

This graph displays the total number of ranges with an active [rangefeed]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#enable-rangefeeds) that is performing a catchup scan.

<img src="/docs/images/{{ page.version.version }}/ui-ranges-in-catchup-mode.png" alt="DB Console Ranges in Catchup Mode graph" style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|----
**Ranges** | The number of ranges that are performing a catchup scan.

## Rangefeed Catchup Scans Duration

This graph displays the duration of catchup scans that changefeeds are performing.

<img src="/docs/images/{{ page.version.version }}/ui-rangefeed-catchup-scans-duration.png" alt="DB Console Rangefeed Catchup Scans Duration graph" style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|----
**(Node Hostname)** | The duration of the catchup scan displayed per node.

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Change Data Capture Overview]({% link {{ page.version.version }}/change-data-capture-overview.md %})
- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Support Resources]({% link {{ page.version.version }}/support-resources.md %})
- [Raw Status Endpoints]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#raw-status-endpoints)
