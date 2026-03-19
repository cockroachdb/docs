---
title: Network Page
summary: The Network Latency page displays round-trip latencies between all nodes in your cluster.
toc: true
---

The **Network** page displays round-trip latencies between all nodes in your cluster. This represents the time required to transmit a packet across a network, and is highly dependent on your network topology. Use this page to determine whether your latency is appropriate for your [topology pattern]({% link {{ page.version.version }}/topology-patterns.md %}), and to identify nodes with unexpected latencies or connectivity issues.

To view this page, [access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access) and click **Network** in the left-hand navigation.

## Sort and filter network latencies

Use the **Sort By** menu to arrange the network matrix by [locality]({% link {{ page.version.version }}/cockroach-start.md %}#locality) (e.g., cloud, region, availability zone, datacenter).

Use the **Filter** menu to select specific nodes or localities to view.

Select **Collapse Nodes** to display the mean latencies of each locality, depending on how the matrix is sorted. This is a way to quickly assess cross-regional or cross-cloud latency.

## Interpret the network matrix

Each cell in the matrix displays the round-trip latency in milliseconds between two nodes in your cluster. Round-trip latency includes the return time of a packet. Latencies are color-coded by their standard deviation from the mean latency on the network: green for lower values, and blue for higher. Nodes with the lowest latency are displayed in darker green, and nodes with the highest latency are displayed in darker blue.

<img src="{{ 'images/v25.4/ui_network_latency_matrix.png' | relative_url }}" alt="DB Console Network Latency matrix" style="border:1px solid #eee;max-width:100%" />

Rows represent origin nodes, and columns represent destination nodes. Hover over a cell to display more details:

- The direction of the connection marked by `From` and `To`.
- Locality metadata for origin and destination.q
- Round-trip latency.

The page automatically refreshes every 30 seconds to show the most recent information.

On a [typical multi-region cluster]({% link {{ page.version.version }}/demo-low-latency-multi-region-deployment.md %}), you can expect much lower latencies between nodes in the same region/availability zone. Nodes in different regions/availability zones, meanwhile, will experience higher latencies that reflect their geographical distribution.

For instance, the cluster shown above has nodes in `us-west1`, `us-east1`, and `europe-west2`. Latencies are highest between nodes in `us-west1` and `europe-west2`, which span the greatest distance. This is especially clear when sorting by region or availability zone and collapsing nodes:

<img src="{{ 'images/v25.4/ui_network_latency_collapsed_nodes.png' | relative_url }}" alt="DB Console Network Latency collapsed nodes" style="border:1px solid #eee;max-width:100%" />

### No connections

Nodes that have completely lost connectivity are color-coded depending on connection status:

- Orange with an exclamation mark indicates `unknown connection state`.
- Red with a [no symbol](https://www.wikipedia.org/wiki/No_symbol) indicates `Failed connection`.

This information can help you diagnose a network partition in your cluster.

<img src="{{ 'images/v25.4/ui_network_latency_matrix_suspect_node.png' | relative_url }}" alt="DB Console Network Latency suspect node" style="border:1px solid #eee;max-width:100%" />

Hover over a cell to display more details:

- The direction of the connection marked by `From` and `To`.
- Locality metadata for origin and destination.
- Connection status.
- The error message that resulted from the most recent connection attempt.

This specific information can help you understand the root cause of the connectivity issue.

{{site.data.alerts.callout_info}}
{% include common/network-partitions.md %}

With the introduction of [Leader leases]({% link {{ page.version.version }}/architecture/replication-layer.md %}#leader-leases), most network partitions between a leaseholder and its followers should heal in a few seconds.
{{site.data.alerts.end}}

### Node liveness status

Hover over a node's ID in the row and column headers to show the node's [liveness]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#node-liveness-issues) status, such as `healthy` or `suspect`. Node liveness status is also indicated by the colored circle next to the Node ID: green for `healthy` or red for `suspect`.

If a `suspect` node stays offline for the duration set by [`server.time_until_store_dead`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-server-time-until-store-dead) (5 minutes by default), the [cluster considers the node "dead"]({% link {{ page.version.version }}/node-shutdown.md %}#process-termination) and the node is removed from the matrix.

The number of `LIVE` (healthy), `SUSPECT`, `DRAINING` and `DEAD` nodes is displayed under Node Status on the [Cluster Overview page]({% link {{ page.version.version }}/ui-cluster-overview-page.md %}).

## Topology fundamentals

{% include {{ page.version.version }}/topology-patterns/fundamentals.md %}

{{site.data.alerts.callout_info}}
Network latency limits the performance of individual operations. You can use the [Statements]({% link {{ page.version.version }}/ui-statements-page.md %}) page to see the latencies of SQL statements on gateway nodes.
{{site.data.alerts.end}}

## See also

- [Topology Patterns]({% link {{ page.version.version }}/topology-patterns.md %})
- [CockroachDB Performance]({% link {{ page.version.version }}/performance.md %}#latency)
- [Performance Tuning]({% link {{ page.version.version }}/performance-best-practices-overview.md %})
- [Low Latency Reads and Writes in a Multi-Region Cluster]({% link {{ page.version.version }}/demo-low-latency-multi-region-deployment.md %})
