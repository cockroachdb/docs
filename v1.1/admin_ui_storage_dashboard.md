---
title: Storage Dashboard
toc: false
feedback: false
---

The CockroachDB Admin UI enables you to monitor the storage utilization for your cluster.

<div id="toc"></div>

To view the Storage Metrics for your cluster, [access the Admin UI](https://www.cockroachlabs.com/docs/dev/explore-the-admin-ui.html#access-the-admin-ui), then from the Dashboard drop-down box, select **Storage**. 

#### Viewing time-series graphs for each node
By default, the time series panel displays the metrics for the entire cluster. To view the metrics for an individual node, select the node from the **Graph** drop-down list.
<img src="{{ 'images/admin_ui_select_node.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:40%" />


The Storage dashboard displays the following time-series graphs:

## Capacity
<img src="{{ 'images/admin_ui_capacity.png' | relative_url }}" alt="CockroachDB Admin UI Capacity" style="border:1px solid #eee;max-width:100%" />
The graph displays the maximum allocated storage capacity as well as the available storage capacity for CockroachDB across all nodes.

On hovering over the graph, you can see the Capacity and Available values across all nodes:


Metric | Description
--------|----
Capacity | The maximum storage capacity allocated to CockroachDB across all nodes.
Available | The free storage capacity available to CockroachDB across all nodes.
 
You can configure the maximum allocated storage capacity for CockroachDB using the --store flag. For more information, see [Start a Node](https://www.cockroachlabs.com/docs/stable/start-a-node.html#store).

## File Descriptors
<img src="{{ 'images/admin_ui_file_descriptors.png' | relative_url }}" alt="CockroachDB Admin UI File Descriptors" style="border:1px solid #eee;max-width:100%" />
The graph displays the The number of open file descriptors across all nodes, compared with the file descriptor limit.
If Open count is almost equal to the Limit count, increase [File Descriptors](https://www.cockroachlabs.com/docs/stable/recommended-production-settings.html#file-descriptors-limit).

{{site.data.alerts.callout_info}}The Storage dashboard displays time-series graphs for other metrics such as Live Bytes, Log Commit Latency, Command Commit Latency, RocksDB Read Amplification, and RocksDB SSTables that are important for CockroachDB developers. For monitoring CockroachDB, it is sufficient to monitor the Capacity and File Descriptors graphs.{{site.data.alerts.end}}