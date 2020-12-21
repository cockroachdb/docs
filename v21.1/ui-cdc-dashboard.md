---
title: Changefeeds Dashboard
summary: The Changefeeds dashboard lets you monitor the changefeeds created across your cluster.
toc: true
redirect_from: admin-ui-cdc-dashboard.html
---

The **Changefeeds** dashboard in the DB Console lets you monitor the [changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html) created across your cluster. To view this dashboard, [access the DB Console](ui-overview.html#db-console-access), click **Metrics** on the left-hand navigation bar, and then select **Dashboard** > **Changefeeds**.

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

The **Changefeeds** dashboard displays the following time series graphs:

## Max Changefeed Latency

This graph shows the maximum latency for resolved timestamps of any running changefeed.

<img src="{{ 'images/v21.1/ui_max_changefeed.png' | relative_url }}" alt="DB Console Max Changefeed Latency graph" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}
The maximum latency for resolved timestamps is distinct from and slower than the commit-to-emit latency for individual change messages. For more information about resolved timestamps, see [Ordering guarantees](stream-data-out-of-cockroachdb-using-changefeeds.html#ordering-guarantees).
{{site.data.alerts.end}}

## Sink Byte Traffic

This graph shows the number of bytes emitted by CockroachDB into the sink for changefeeds.

<img src="{{ 'images/v21.1/ui_sink_byte_traffic.png' | relative_url }}" alt="DB Console Sink Byte Traffic graph" style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|----
**Emitted Bytes** | The number of bytes emitted by CockroachDB into the sink for changefeeds.

## Sink Counts

This graph shows:

- The number of messages that CockroachDB sent to the sink.
- The number of flushes that the sink performed for changefeeds.

<img src="{{ 'images/v21.1/ui_sink_counts.png' | relative_url }}" alt="DB Console Sink Counts graph" style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|----
**Messages** | The number of messages that CockroachDB sent to the sink for changefeeds.
**Flushes** | The the number of flushes that the sink performed for changefeeds.

## Sink Timings

This graph shows:

- The time in milliseconds per second required by CockroachDB to send messages to the sink.
- The time CockroachDB spent waiting for the sink to flush the messages for changefeeds.

<img src="{{ 'images/v21.1/ui_sink_timings.png' | relative_url }}" alt="DB Console Sink Timings graph" style="border:1px solid #eee;max-width:100%" />

Metric | Description
--------|----
**Message Emit Time** | The time in milliseconds per second required by CockroachDB to send messages to the sink for changefeeds.
**Flush Time** | The time in milliseconds per second that CockroachDB spent waiting for the sink to flush the messages for changefeeds.

## Changefeed Restarts

This graph displays the number of times changefeeds restarted due to retryable errors.

<img src="{{ 'images/v21.1/ui_changefeed_restarts.png' | relative_url }}" alt="DB Console Changefeed Restarts graph" style="border:1px solid #eee;max-width:100%" />

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Stream Data Out of CockroachDB Using Changefeeds](stream-data-out-of-cockroachdb-using-changefeeds.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
