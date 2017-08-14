---
title: Runtime Dashboard
toc: false
feedback: false
---

CockroachDB’s Admin UI enables you to monitor runtime metrics such as the Node Count, CPU Time, and Memory Usage for your cluster.

<div id="toc"></div>

To view the Runtime Metrics for your cluster, [access the Admin UI](https://www.cockroachlabs.com/docs/dev/explore-the-admin-ui.html#access-the-admin-ui). From the Dashboard drop-down box, select **Runtime**.

#### Viewing time-series graphs for each node
By default, the time series panel displays the metrics for the entire cluster. To view the metrics for an individual node, select the node from the **Graph** drop-down list.
<img src="{{ 'images/admin_ui_select_node.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:40%"/>

The Runtime dashboard displays the following time-series graphs:

## Node Count
<img src="{{ 'images/admin_ui_node_count.png' | relative_url }}" alt="CockroachDB Admin UI Node Count" style="border:1px solid #eee;max-width:100%" />
The graph displays the number of live nodes in the cluster.
A dip in the graph indicates decommissioned nodes, dead nodes, or nodes that are not responding. To troubleshoot the dip in the graph, refer to the [Summary panel](https://www.cockroachlabs.com/docs/dev/explore-the-admin-ui.html#summary-panel).

## Memory Usage
<img src="{{ 'images/admin_ui_memory_usage.png' | relative_url }}" alt="CockroachDB Admin UI Memory Usage" style="border:1px solid #eee;max-width:100%" />
The graph displays Memory in use across all nodes.
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
The graph displays the CPU time used by the CockroachDB User and CockroachDB system-level operations across all nodes.
On hovering over the graph, the values for the following metrics are displayed:

Metric | Description
--------|----
User CPU Time | CPU Time used by CockroachDB across all nodes.
Sys CPU Time | CPU Time used by system operations across all nodes.
GC Pause Time | Time required by the Garbage Collection process of Go.

If Sys CPU Time is more than User CPU Time, it might indicate that CockroachDB is not getting sufficient CPU time. In that case, review the processes running on the system to troubleshoot if any processes can be killed to allocate more CPU Time to CockroachDB.

{{site.data.alerts.callout_info}}The GC Pause Time parameter is important for CockroachDB developers. For monitoring CockroachDB, it is sufficient to monitor the User CPU Time and Sys CPU Time.{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}The Runtime dashboard displays time-series graphs for other metrics such as Goroutine Count, GC Runs, and GC Pause Time that are important for CockroachDB developers. For monitoring CockroachDB, it is sufficient to monitor the Node Count, Memory Usage, and CPU Time graphs.{{site.data.alerts.end}}
