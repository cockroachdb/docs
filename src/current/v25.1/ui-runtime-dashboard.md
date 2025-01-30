---
title: Runtime Dashboard
summary: The Runtime dashboard lets you monitor runtime metrics for you cluster, such as node count, memory usage, and CPU time.
toc: true
docs_area: reference.db_console
---

The **Runtime** dashboard in the DB Console lets you monitor runtime metrics for you cluster, such as node count, memory usage, and CPU time.

To view this dashboard, [access the DB Console]({{ page.version.version }}/ui-overview.md#db-console-access), click **Metrics** on the left-hand navigation bar, and select **Dashboard** > **Runtime**.

## Dashboard navigation


The **Runtime** dashboard displays the following time series graphs:

## Live Node Count

![DB Console Node Count](/images/v24.2/ui_node_count.png)

In the node view as well as the cluster view, the graph shows the number of live nodes in the cluster.

A dip in the graph indicates decommissioned nodes, dead nodes, or nodes that are not responding. To troubleshoot the dip in the graph, refer to the [Summary panel](#summary-panel).

## Memory Usage

![DB Console Memory Usage](/images/v24.2/ui_memory_usage.png)

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


## Runnable Goroutines per CPU


## CPU Time

![DB Console CPU Time](/images/v24.2/ui_cpu_time.png)

- In the node view, the graph shows the [CPU time](https://wikipedia.org/wiki/CPU_time) used by CockroachDB user and system-level operations for the selected node.
- In the cluster view, the graph shows the [CPU time](https://wikipedia.org/wiki/CPU_time) used by CockroachDB user and system-level operations across all nodes in the cluster.

On hovering over the CPU Time graph, the values for the following metrics are displayed:

Metric | Description
--------|----
User CPU Time | Total CPU seconds per second used by the CockroachDB process across all nodes.
Sys CPU Time | Total CPU seconds per second used for CockroachDB system-level operations across all nodes.

## Clock Offset

![DB Console Clock Offset](/images/v24.2/ui_clock_offset.png)

- In the node view, the graph shows the mean clock offset of the node against the rest of the cluster.
- In the cluster view, the graph shows the mean clock offset of each node against the rest of the cluster.

## Other graphs

The **Runtime** dashboard shows other time series graphs that are important for CockroachDB developers:

- Goroutine Count
- GC Runs
- GC Pause Time

For monitoring CockroachDB, it is sufficient to use the [**Live Node Count**](#live-node-count), [**Memory Usage**](#memory-usage), [**CPU Time**](#cpu-time), and [**Clock Offset**](#clock-offset) graphs.


## See also

- [Troubleshooting Overview]({{ page.version.version }}/troubleshooting-overview.md)
- [Support Resources]({{ page.version.version }}/support-resources.md)
- [Raw Status Endpoints]({{ page.version.version }}/monitoring-and-alerting.md#raw-status-endpoints)