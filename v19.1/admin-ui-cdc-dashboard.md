---
title: Changefeeds Dashboard
summary: The Changefeeds dashboard lets you monitor the changefeeds created across your cluster.
toc: true
---

The **Changefeeds** dashboard in the CockroachDB Admin UI lets you monitor the [changefeeds](change-data-capture.html) created across your cluster. To view this dashboard, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui), click **Metrics** on the left-hand navigation bar, and then select **Dashboard** > **Changefeeds**.


The **Changefeeds** dashboard displays the following time series graphs:

## Max Changefeed Latency

<img src="{{ 'images/v19.1/admin_ui_max_changefeed.png' | relative_url }}" alt="CockroachDB Admin UI Max Changefeed Latency graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the maximum latency for resolved timestamps of any running changefeed for the node.

- In the cluster view, the graph shows the maximum latency for resolved timestamps of any running changefeed across all nodes.

{{site.data.alerts.callout_info}}
The maximum latency for resolved timestamps is distinct from and slower than the commit-to-emit latency for individual change messages. For more information about resolved timestamps, see [Ordering guarantees](change-data-capture.html#ordering-guarantees).
{{site.data.alerts.end}}

## Sink Byte Traffic

<img src="{{ 'images/v19.1/admin_ui_sink_byte_traffic.png' | relative_url }}" alt="CockroachDB Admin UI Sink Byte Traffic graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the number of bytes emitted by CockroachDB into the sink across all changefeeds for the selected node.

- In the cluster view, the graph shows the number of bytes emitted by CockroachDB into the sink across all changefeeds and across all nodes in the cluster.

On hovering over the graph, the values for the following metrics are displayed:

Metric | Description
--------|----
**Emitted Bytes** | The number of bytes emitted by CockroachDB into the sink for all changefeeds.

## Sink Counts

<img src="{{ 'images/v19.1/admin_ui_sink_counts.png' | relative_url }}" alt="CockroachDB Admin UI Sink Counts graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the number of messages that CockroachDB sent to the sink as well as the number of flushes that the sink performed for all changefeeds.

- In the cluster view, the graph shows the number of messages that CockroachDB sent to the sink as well as the number of flushes that the sink performed for all changefeeds across the cluster.

On hovering over the graph, the values for the following metrics are displayed:

Metric | Description
--------|----
**Messages** | The number of messages that CockroachDB sent to the sink for all changefeeds.
**Flushes** | The the number of flushes that the sink performed for all changefeeds.

## Sink Timings

<img src="{{ 'images/v19.1/admin_ui_sink_timings.png' | relative_url }}" alt="CockroachDB Admin UI Sink Timings graph" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the time in milliseconds per second required by CockroachDB to send messages to the sink as well as the time CockroachDB spent waiting for the sink to flush the messages for all changefeeds.

- In the cluster view, the graph shows the time in milliseconds per second required by CockroachDB to send messages to the sink as the time CockroachDB spent waiting for the sink to flush the messages for all changefeeds across the cluster.

On hovering over the graph, the values for the following metrics are displayed:

Metric | Description
--------|----
**Message Emit Time** | The time in milliseconds per second required by CockroachDB to send messages to the sink for all changefeeds.
**Flush Time** | The time in milliseconds per second that CockroachDB spent waiting for the sink to flush the messages for all changefeeds.

## See also

- [Change Data Capture](change-data-capture.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
