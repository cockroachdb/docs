---
title: Network Latency Page
toc: true
redirect_from: admin-ui-network-latency-page.html
---

The **Network Latency** page displays round-trip latencies between all nodes in your cluster. Latency is the time required to transmit a packet across a network, and is highly dependent on your network topology. Use this page to determine whether your latency is appropriate for your [topology pattern](topology-patterns.html), or to identify nodes with unexpected latencies.

To view this page, [access the DB Console](ui-overview.html#db-console-access) and click **Network Latency** in the left-hand navigation.

## Sort and filter network latency

Use the **Sort By** menu to arrange the latency matrix by [locality](cockroach-start.html#locality) (e.g., cloud, region, availability zone, datacenter).

Use the **Filter** menu to select specific nodes or localities to view.

Select **Collapse Nodes** to display the mean latencies of each locality, depending on how the matrix is sorted. This is a way to quickly assess cross-regional or cross-cloud latency.

## Understanding the Network Latency matrix

Each cell in the matrix displays the round-trip latency in milliseconds between two nodes in your cluster. Round-trip latency includes the return time of a packet. Latencies are color-coded by their standard deviation from the mean latency on the network: green for lower values, and blue for higher.

<img src="{{ 'images/v21.1/ui_network_latency_matrix.png' | relative_url }}" alt="DB Console Network Latency matrix" style="border:1px solid #eee;max-width:100%" />

Rows represent origin nodes, and columns represent destination nodes. Hover over a cell to see round-trip latency and locality metadata for origin and destination nodes.

On a [typical multi-region cluster](demo-low-latency-multi-region-deployment.html#step-4-access-the-db-console), you can expect much lower latencies between nodes in the same region/availability zone. Nodes in different regions/availability zones, meanwhile, will experience higher latencies that reflect their geographical distribution.

For instance, the cluster shown above has nodes in `us-west1`, `us-east1`, and `europe-west2`. Latencies are highest between nodes in `us-west1` and `europe-west2`, which span the greatest distance. This is especially clear when sorting by region or availability zone and collapsing nodes:

<img src="{{ 'images/v21.1/ui_network_latency_collapsed_nodes.png' | relative_url }}" alt="DB Console Network Latency collapsed nodes" style="border:1px solid #eee;max-width:100%" />

### No connections

Nodes that have lost a connection are displayed in a separate color. This can help you locate a network partition in your cluster.

{{site.data.alerts.callout_info}}
A network partition prevents nodes from communicating with each other in one or both directions. This can be due to a configuration problem with the network, such as when allowlisted IP addresses or hostnames change after a node is torn down and rebuilt. In a symmetric partition, node communication is broken in both directions. In an asymmetric partition, node communication works in one direction but not the other.

The effect of a network partition depends on which nodes are partitioned, where the ranges are located, and to a large extent, whether [localities](cockroach-start.html#locality) are defined. If localities are not defined, a partition that cuts off at least (n-1)/2 nodes will cause data unavailability.
{{site.data.alerts.end}}

Click the **NO CONNECTIONS** link to see lost connections between nodes or [localities](cockroach-start.html#locality), if any are defined.

## Topology fundamentals

{% include {{ page.version.version }}/topology-patterns/fundamentals.md %}

{{site.data.alerts.callout_info}}
Network latency limits the performance of individual operations. You can use the [Statements](ui-statements-page.html) page to see the latencies of SQL statements on gateway nodes.
{{site.data.alerts.end}}

## See also

- [Topology Patterns](topology-patterns.html)
- [CockroachDB Performance](performance.html#latency)
- [Performance Tuning](performance-tuning.html)
- [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html)
