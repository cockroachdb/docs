---
title: Runtime Dashboard
toc: true
redirect_from: admin-ui-runtime-dashboard.html
---

The **Runtime** dashboard in the DB Console lets you monitor runtime metrics for you cluster, such as node count, memory usage, and CPU time. To view this dashboard, [access the DB Console](ui-overview.html#db-console-access), click **Metrics** on the left-hand navigation bar, and then select **Dashboard** > **Runtime**.

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

The **Runtime** dashboard displays the following time series graphs:

## Live Node Count

<img src="{{ 'images/v21.1/ui_node_count.png' | relative_url }}" alt="DB Console Node Count" style="border:1px solid #eee;max-width:100%" />

In the node view as well as the cluster view, the graph shows the number of live nodes in the cluster.

A dip in the graph indicates decommissioned nodes, dead nodes, or nodes that are not responding. To troubleshoot the dip in the graph, refer to the [Summary panel](#summary-panel).

## Memory Usage

<img src="{{ 'images/v21.1/ui_memory_usage.png' | relative_url }}" alt="DB Console Memory Usage" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the memory in use for the selected node.

- In the cluster view, the graph shows the memory in use across all nodes in the cluster.

On hovering over the graph, the values for the following metrics are displayed:

Metric | Description
--------|----
RSS | Total memory in use by CockroachDB.
Go Allocated | Memory allocated by the Go layer.
Go Total | Total memory managed by the Go layer.
CGo Allocated | Memory allocated by the C layer.
CGo Total | Total memory managed by the C layer.

{{site.data.alerts.callout_info}}If Go Total or CGO Total fluctuates or grows steadily over time, <a href="https://forum.cockroachlabs.com/">contact us</a>.{{site.data.alerts.end}}

## CPU Time

<img src="{{ 'images/v21.1/ui_cpu_time.png' | relative_url }}" alt="DB Console CPU Time" style="border:1px solid #eee;max-width:100%" />


- In the node view, the graph shows the [CPU time](https://en.wikipedia.org/wiki/CPU_time) used by CockroachDB user and system-level operations for the selected node.
- In the cluster view, the graph shows the [CPU time](https://en.wikipedia.org/wiki/CPU_time) used by CockroachDB user and system-level operations across all nodes in the cluster.

On hovering over the CPU Time graph, the values for the following metrics are displayed:

Metric | Description
--------|----
User CPU Time | Total CPU seconds per second used by the CockroachDB process across all nodes.
Sys CPU Time | Total CPU seconds per second used for CockroachDB system-level operations across all nodes.

## Clock Offset

<img src="{{ 'images/v21.1/ui_clock_offset.png' | relative_url }}" alt="DB Console Clock Offset" style="border:1px solid #eee;max-width:100%" />

- In the node view, the graph shows the mean clock offset of the node against the rest of the cluster.
- In the cluster view, the graph shows the mean clock offset of each node against the rest of the cluster.

## Other graphs

The **Runtime** dashboard shows other time series graphs that are important for CockroachDB developers:

- Goroutine Count
- GC Runs
- GC Pause Time

For monitoring CockroachDB, it is sufficient to use the [**Live Node Count**](#live-node-count), [**Memory Usage**](#memory-usage), [**CPU Time**](#cpu-time), and [**Clock Offset**](#clock-offset) graphs.

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
