---
title: Runtime Dashboard
toc: false
---

The **Runtime** dashboard in the CockroachDB Admin UI lets you monitor runtime metrics such as the Node Count, CPU Time, and Memory Usage for your cluster. To view this dashboard, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui). From the **Dashboard** drop-down box, select **Runtime**.

<div id="toc"></div>

The Runtime dashboard displays the following time series graphs:

## Node Count
<img src="{{ 'images/admin_ui_node_count.png' | relative_url }}" alt="CockroachDB Admin UI Node Count" style="border:1px solid #eee;max-width:100%" />

In the node view as well as the cluster view, the graph displays the number of live nodes in the cluster.

A dip in the graph indicates decommissioned nodes, dead nodes, or nodes that are not responding. To troubleshoot the dip in the graph, refer to the [Summary panel](admin-ui-access-and-navigate.html#summary-panel).

## Memory Usage
<img src="{{ 'images/admin_ui_memory_usage.png' | relative_url }}" alt="CockroachDB Admin UI Memory Usage" style="border:1px solid #eee;max-width:100%" />

In the node view, the graph displays the memory in use for the selected node.

In the cluster view, the graph displays the memory in use across all nodes in the cluster.

On hovering over the graph, the values for the following metrics are displayed:

Metric | Description
--------|----
RSS | Total memory in use by CockroachDB.
Go Allocated | Memory allocated by the Go layer.
Go Total | Total memory managed by the Go layer.
CGo Allocated | Memory allocated by the C layer.
CGo Total | Total memory managed by the C layer.

If Go Total or CGO Total fluctuates or grows steadily over time, [contact us](https://forum.cockroachlabs.com/).

## CPU Time
<img src="{{ 'images/admin_ui_cpu_time.png' | relative_url }}" alt="CockroachDB Admin UI CPU Time" style="border:1px solid #eee;max-width:100%" />

In the node view, the graph displays the [CPU time](https://en.wikipedia.org/wiki/CPU_time) used by CockroachDB user and system-level operations for the selected node.

In the cluster view, the graph displays the [CPU time](https://en.wikipedia.org/wiki/CPU_time) used by CockroachDB user and system-level operations across all nodes in the cluster.

On hovering over the CPU Time graph in the Admin UI, the values for the following metrics are displayed:

Metric | Description
--------|----
User CPU Time | Total CPU seconds per second used by the CockroachDB process across all nodes.
Sys CPU Time | Total CPU seconds per second used by the system calls made by CockroachDB across all nodes.
GC Pause Time | Time required by the Garbage Collection process of Go.

{{site.data.alerts.callout_info}}The GC Pause Time parameter is important for CockroachDB developers. For monitoring CockroachDB, it is sufficient to monitor the User CPU Time and Sys CPU Time.{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}The <b>Runtime</b> dashboard displays time series graphs for other metrics such as <b>Goroutine Count</b>, <b>GC Runs</b>, and <b>GC Pause Time</b> that are important for CockroachDB developers. For monitoring CockroachDB, it is sufficient to monitor the <b>Node Count</b>, <b>Memory Usage</b>, and <b>CPU Time</b> graphs.{{site.data.alerts.end}}
