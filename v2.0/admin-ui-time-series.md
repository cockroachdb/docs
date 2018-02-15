---
title: Admin UI Time Series Graphs
toc: false
---

<div id="toc"></div>

The Admin UI displays time series graphs of key metrics. Time series graphs are useful to visualize and monitor data trends. You can hover over each graph to see actual point-in-time values.

<img src="{{ 'images/admin_ui_hovering.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}By default, CockroachDB stores timeseries metrics for the last 30 days, but you can reduce the interval for timeseries storage. Alternately, if you are exclusively using a third-party tool such as <a href="monitor-cockroachdb-with-prometheus.html">Prometheus</a> for timeseries monitoring, you can disable timeseries storage entirely. For more details, see this <a href="operational-faqs.html#can-i-reduce-or-disable-the-storage-of-timeseries-data-new-in-v2-0">FAQ</a>.
{{site.data.alerts.end}}

## Change time range

You can change the time range by clicking on the time window.
<img src="{{ 'images/admin_ui_time_range.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

{{site.data.alerts.callout_info}}The Admin UI shows time in UTC, even if you set a different time zone for your cluster. {{site.data.alerts.end}}

## View metrics for a single node

By default, the time series panel displays the metrics for the entire cluster. To view the metrics for an individual node, select the node from the **Graph** drop-down list.
<img src="{{ 'images/admin_ui_single_node.gif' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" >

## Events Panel

<img src="{{ 'images/admin_ui_events.png' | relative_url }}" alt="CockroachDB Admin UI Events" style="border:1px solid #eee;max-width:100%" />

The **Events** panel lists the 10 most recent events logged for the all nodes across the cluster. To see the list of all events, click **View all events**.

The following types of events are listed:

- Database created
- Database dropped
- Table created
- Table dropped
- Table altered
- Index created
- Index dropped
- View created
- View dropped
- Schema change reversed
- Schema change finished
- Node joined
- Node decommissioned
- Node restarted
- Cluster setting changed