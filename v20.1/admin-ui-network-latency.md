---
title: Network Latency Page
toc: true
---

The **Network Latency** page displays latencies between all nodes in your cluster. Latency is the time required to transmit a packet across a network, and is highly dependent on your network topology. Use this page to determine whether your latency is appropriate for your [topology pattern](topology-patterns.html), or to identify nodes with unexpected latencies.

To view this page, [access the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) and click **Network Latency** in the left-hand navigation.

## Sort and filter network latency

<menus screenshot TK>

Use the **Sort By** menu to arrange the latency matrix by cluster, cloud, region, or availability zone.

Use the **Filter** menu to select specific nodes, clouds, regions, or availability zones to view.

Select **Collapse Nodes** to display the mean latencies of each cloud, region, or availability zone, depending on how the matrix is sorted. This is a way to quickly assess cross-regional or cross-cloud latency.

## Understanding the Network Latency page

Each cell displays the round-trip latency in milliseconds between two nodes in your cluster. Round-trip latency includes the return time of a packet.

Rows represent origin nodes, and columns represent destination nodes. Hover over a cell to see round-trip latency and cloud, region, and zone metadata for origin and destination nodes.

<standard deviation screenshot TK>

Latencies are color-coded by their standard deviation from the mean latency on the network.

<overall screenshot TK>

On a [typical multi-region cluster](demo-low-latency-multi-region-deployment.html#step-4-access-the-admin-ui), you can expect much lower latencies between nodes in the same region/availability zone. 

Nodes in different regions/availability zones will experience higher latencies that reflect their geographical distribution. For instance, the cluster shown above has nodes in `us-west1`, `us-east1`, and `europe-west2`. Latencies are highest between nodes in `us-west1` and `europe-west2`, which span the greatest distance.

This is especially clear when sorting by region or availability zone and collapsing nodes:

<collapse nodes screenshot TK>

### No connections

<no connections screenshot TK>

Nodes that have lost a connection are displayed in the above color. This can help you locate, for example, a one-way [partition](partitioning.html) in your cluster.

Click the **NO CONNECTIONS** to tk node or [locality](cockroach-start.html#locality) flag.

{{site.data.alerts.callout_info}}
Network latency limits the performance of individual operations. You can use the [Statements](admin-ui-statements-page.html) page to see the latencies of SQL statements on gateway nodes. 
{{site.data.alerts.end}}

## Topology fundamentals

{% include {{ page.version.version }}/topology-patterns/fundamentals.md %}

## See also

- [Topology Patterns](topology-patterns.html)
- [CockroachDB Performance](performance.html#latency)
- [Performance Tuning](performance-tuning.html)
- [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html)