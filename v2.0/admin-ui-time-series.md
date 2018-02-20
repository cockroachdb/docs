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

## Summary Panel
<img src="{{ 'images/admin_ui_summary_panel.png' | relative_url }}" alt="CockroachDB Admin UI Summary Panel" style="border:1px solid #eee;max-width:40%" />

The **Summary** panel provides the following metrics:

Metric | Description
--------|----
Total Nodes | The total number of nodes in the cluster. <a href='admin-ui-access-and-navigate.html#decommissioned-nodes'>Decommissioned nodes</a> are not included in the Total Nodes count. <br><br>You can further drill down into the nodes details by clicking on [**View nodes list**](#nodes-list).
Dead Nodes | The number of [dead nodes](admin-ui-access-and-navigate.html#dead-nodes) in the cluster.
Capacity Used | The storage capacity used as a percentage of total storage capacity allocated across all nodes.<br><br>**Note:** If you are running multiple nodes on a single machine (not recommended), this value may be incorrect. This is because when multiple nodes are running on a single machine, the machine's hard disk is treated as separate stores for each node, while in reality, only one hard disk is used for all nodes. The Capacity Used is then displayed as the hard disk capacity used multiplied by the number of nodes on the machine.
Unavailable Ranges | The number of unavailable ranges in the cluster. A non-zero number indicates an unstable cluster.
Queries per second | The number of SQL queries executed per second.
P50 Latency | The 50th percentile of service latency. Service latency is calculated as the time between when the cluster receives a query and finishes executing the query. This time does not include returning results to the client.
P99 Latency | The 99th percentile of service latency.

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