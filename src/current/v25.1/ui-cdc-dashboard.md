---
title: Changefeeds Dashboard
summary: The Changefeeds dashboard lets you monitor the changefeeds created across your cluster.
toc: true
docs_area: reference.db_console
---

The **Changefeeds** dashboard in the DB Console lets you monitor the [changefeeds]({{ page.version.version }}/change-data-capture-overview.md) created across your cluster.

To view this dashboard, [access the DB Console]({{ page.version.version }}/ui-overview.md#db-console-access), click **Metrics** on the left-hand navigation bar, and then select **Dashboard** > **Changefeeds**.

{{site.data.alerts.callout_success}}
For more general recommendations on metrics and tooling options for change data capture monitoring, refer to the [Monitor and Debug Changefeeds]({{ page.version.version }}/monitor-and-debug-changefeeds.md) page.
{{site.data.alerts.end}}

## Dashboard navigation


The **Changefeeds** dashboard displays the following time series graphs:

## Changefeed Status

This graph displays the status of all running changefeeds.

![DB Console Changefeed Status graph showing running, paused, and failed changefeeds.](/images/v24.2/ui-changefeed-status.png)

Metric | Description
--------|----
**Running** | The number of changefeeds running.
**Paused** | The number of [paused]({{ page.version.version }}/pause-job.md) changefeeds.
**Failed** | The number of changefeeds that have failed.

Refer to [`RESUME JOB`]({{ page.version.version }}/resume-job.md) and [`PAUSE JOB`]({{ page.version.version }}/pause-job.md) to manage a changefeed.

In the case of a failed changefeed, you may want to use the [`cursor`]({{ page.version.version }}/create-changefeed.md#cursor) option to restart the changefeed. Refer to the [Start a new changefeed where the previous failed]({{ page.version.version }}/create-changefeed.md#start-a-new-changefeed-where-another-ended) example.

## Commit Latency

This graph displays the 99th, 90th, and 50th percentile of commit latency for running changefeeds. This is the difference between an event's MVCC timestamp and the time it was acknowledged as received by the [downstream sink]({{ page.version.version }}/changefeed-sinks.md).

![DB Console Commit Latency graph showing the 99th, 90th, and 50th percentile of commit latency.](/images/v24.2/ui-commit-latency.png)

If the sink batches events, then the difference between the oldest event in the batch and acknowledgement is recorded. Latency during backfill is excluded.

## Emitted Bytes

This graph shows the number of bytes emitted by CockroachDB into the changefeed's [downstream sink]({{ page.version.version }}/changefeed-sinks.md).

{{site.data.alerts.callout_info}}
In v23.1 and earlier, the **Emitted Bytes** graph was named **Sink Byte Traffic**. If you want to customize charts, including how metrics are named, use the [**Custom Chart** debug page]({{ page.version.version }}/ui-custom-chart-debug-page.md).
{{site.data.alerts.end}}

![DB Console Emitted Bytes Graph showing the time and emitted bites](/images/v24.2/ui-emitted-bytes.png)

Metric | Description
--------|----
**Emitted Bytes** | The number of bytes emitted by CockroachDB into the configured changefeed sinks.

## Sink Counts

This graph displays data relating to the number of messages and flushes at the changefeed sink.

- The number of messages that CockroachDB sent to the sink.
- The number of flushes that the sink performed for changefeeds.

![DB Console Sink Counts graph](/images/v24.2/ui-sink-counts.png)

Metric | Description
--------|----
**Messages** | The number of messages that CockroachDB sent to the downstream sink.
**Flushes** | The total number of flushes to the sink.

## Max Checkpoint Latency

This graph displays the most any changefeed's persisted [checkpoint]({{ page.version.version }}/how-does-an-enterprise-changefeed-work.md) is behind the present time. Larger values indicate issues with successfully ingesting or emitting changes. If errors cause a changefeed to restart, or the changefeed is [paused]({{ page.version.version }}/pause-job.md) and unpaused, emitted data up to the last checkpoint may be re-emitted.

{{site.data.alerts.callout_info}}
In v23.1 and earlier, the **Max Checkpoint Latency** graph was named **Max Changefeed Latency**. If you want to customize charts, including how metrics are named, use the [**Custom Chart** debug page]({{ page.version.version }}/ui-custom-chart-debug-page.md).
{{site.data.alerts.end}}

![DB Console Max Checkpoint Latency graph](/images/v24.2/ui-max-checkpoint-latency.png)

{{site.data.alerts.callout_info}}
The maximum checkpoint latency is distinct from, and slower than, the commit latency for individual change messages. For more information about resolved timestamps, refer to the [Changefeed Messages]({{ page.version.version }}/changefeed-messages.md#resolved-messages) page.
{{site.data.alerts.end}}

## Changefeed Restarts

This graph displays the number of times changefeeds restarted due to [retryable errors]({{ page.version.version }}/monitor-and-debug-changefeeds.md#changefeed-retry-errors).

![DB Console Changefeed Restarts graph](/images/v24.2/ui-changefeed-restarts.png)

Metric | Description
--------|----
**Retryable Errors** | The number of retryable errors that changefeeds are encountering. That is, an error the changefeed will automatically retry.

## Oldest Protected Timestamp

This graph displays the oldest [protected timestamp]({{ page.version.version }}/architecture/storage-layer.md#protected-timestamps) of any running changefeed on the cluster.

![DB Console Oldest Protected Timestamp graph](/images/v24.2/ui-oldest-protected-timestamp.png)

Metric | Description
--------|----
**Protected Timestamp Age** | The age of the oldest protected timestamp (of any changefeed) that is protecting data from being [garbage collected]({{ page.version.version }}/architecture/storage-layer.md#garbage-collection).

## Backfill Pending Ranges

This graph displays the number of ranges being backfilled that are yet to enter the changefeed pipeline. An [initial scan]({{ page.version.version }}/create-changefeed.md#initial-scan) or [schema change]({{ page.version.version }}/online-schema-changes.md) can cause a backfill.

![DB Console Backfill Pending Ranges graph](/images/v24.2/ui-backfill-pending-ranges.png)

Metric | Description
--------|----
**Backfill Pending Ranges** | The number of ranges in the backfill process that have not yet entered the changefeed stream.

## Schema Registry Registrations

This graph displays the rate of schema registration requests made by CockroachDB nodes to a configured schema registry endpoint. For example, a [Kafka sink]({{ page.version.version }}/changefeed-sinks.md#kafka) pointing to a [Confluent Schema Registry]({{ page.version.version }}/stream-a-changefeed-to-a-confluent-cloud-kafka-cluster.md).

![DB Console Schema Registry Registrations graph](/images/v24.2/ui-schema-registry-registrations.png)

Metric | Description
--------|----
**Schema Registry Registrations** | The number of registrations to a downstream schema registry.

## Ranges in catchup mode

This graph displays the total number of ranges with an active [rangefeed]({{ page.version.version }}/create-and-configure-changefeeds.md#enable-rangefeeds) that is performing a catchup scan.

![DB Console Ranges in Catchup Mode graph](/images/v24.2/ui-ranges-in-catchup-mode.png)

Metric | Description
--------|----
**Ranges** | The number of ranges that are performing a catchup scan.

## Rangefeed Catchup Scans Duration

This graph displays the duration of catchup scans that changefeeds are performing.

![DB Console Rangefeed Catchup Scans Duration graph](/images/v24.2/ui-rangefeed-catchup-scans-duration.png)

Metric | Description
--------|----
**(Node Hostname)** | The duration of the catchup scan displayed per node.


## See also

- [Change Data Capture Overview]({{ page.version.version }}/change-data-capture-overview.md)
- [Troubleshooting Overview]({{ page.version.version }}/troubleshooting-overview.md)
- [Support Resources]({{ page.version.version }}/support-resources.md)
- [Raw Status Endpoints]({{ page.version.version }}/monitoring-and-alerting.md#raw-status-endpoints)