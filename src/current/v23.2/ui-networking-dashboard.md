---
title: Networking Dashboard
summary: The Networking dashboard lets you monitor network traffic.
toc: true
docs_area: reference.db_console
---

The **Networking** dashboard lets you monitor the networking of your cluster. This includes network traffic.

To view this dashboard, [access the DB Console]({% link {{ page.version.version }}/ui-overview.md %}#db-console-access), click **Metrics** in the left-hand navigation, and select **Dashboard** > **Networking**.

For additional information about node connectivity conditions, refer to the [Network page]({% link {{ page.version.version }}/ui-network-latency-page.md %}).

## Dashboard navigation

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

The **Networking** dashboard displays the following time series graphs:

## Network Bytes Received

- In the node view, the graph shows the 10-second average of the number of network bytes received per second for all processes, including `cockroach`, on the node.

- In the cluster view, the graph shows the 10-second average of the number of network bytes received for all processes, including `cockroach`, per second across all nodes.

Metric: [`sys.host.net.recv.bytes`]({% link {{ page.version.version }}/essential-metrics-self-hosted.md %}#sys-host-net-recv-bytes) Bytes received on all network interfaces since the `cockroach` process started

## Network Packets Received

- In the node view, the graph shows the packets received on all network interfaces since the `cockroach` process started on the node.

- In the cluster view, the graph shows the packets received on all network interfaces since the `cockroach` process started on each node in the cluster.

Metric: `sys.host.net.recv.packets`

## Network Packet Errors on Receive

- In the node view, the graph shows the errors on receiving packets on all network interfaces since the `cockroach` process started on the node.

- In the cluster view, the graph shows the errors on receiving packets on all network interfaces since the `cockroach` process started on each node in the cluster.

Metric: `sys.host.net.recv.err`

## Network Packet Drops on Receive

- In the node view, the graph shows received packets that were dropped on all network interfaces since the `cockroach` process started on the node.

- In the cluster view, the graph shows received packets that were dropped on all network interfaces since the `cockroach` process started on each node in the cluster.

Metric: `sys.host.net.recv.drop`

## Network Bytes Sent

- In the node view, the graph shows the 10-second average of the number of network bytes sent per second by all processes, including `cockroach`, on the node.

- In the cluster view, the graph shows the 10-second average of the number of network bytes sent per second by all processes, including `cockroach`, across all nodes.

Metric: [`sys.host.net.send.bytes`]({% link {{ page.version.version }}/essential-metrics-self-hosted.md %}#sys-host-net-send-bytes) Bytes sent on all network interfaces since the `cockroach` process started

## Network Packets Sent

- In the node view, the graph shows packets sent on all network interfaces since the `cockroach` process started on the node.

- In the cluster view,the graph shows packets sent on all network interfaces since the `cockroach` process started on each node in the cluster.

Metric: `sys.host.net.send.packets`

## Network Packet Errors on Send

- In the node view, the graph shows the errors on sending packets on all network interfaces since the `cockroach` process started on the node.

- In the cluster view,the graph shows the errors on sending packets on all network interfaces since the `cockroach` process started on each node in the cluster.

Metric: `sys.host.net.send.err`

## Network Packet Drops on Send

- In the node view, the graph shows sent packets that were dropped on all network interfaces since the `cockroach` process started on the node.

- In the cluster view,the graph shows sent packets that were dropped on all network interfaces since the `cockroach` process started on each node in the cluster.

Metric: `sys.host.net.send.drop`

## RPC Heartbeat Latency: 50th percentile

RPC heartbeat latency is the round-trip latency for recent successful outgoing heartbeats. It is the distribution of round-trip latencies with other nodes. This only reflects successful heartbeats and measures [gRPC]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#grpc) overhead as well as possible [head-of-line blocking](https://wikipedia.org/wiki/Head-of-line_blocking). Elevated values in this metric may hint at network issues or saturation or both, but they are not proof of them. [CPU overload]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#cpu-issues) can similarly elevate this metric. To conclusively diagnose network issues, look at OS-level metrics such as packet loss and retransmits. Heartbeats are not very frequent (every 1 second), so they may not capture rare or short-lived degradations.

- In the node view, the graph shows the 50th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of RPC heartbeat latency for the node.

- In the cluster view, the graph shows the 50th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of RPC heartbeat latency across all nodes in the cluster. There are lines for each node in the cluster.

Metric: `round-trip-latency-p50`

## RPC Heartbeat Latency: 99th percentile

RPC heartbeat latency is the round-trip latency for recent successful outgoing heartbeats. It is the distribution of round-trip latencies with other nodes. This only reflects successful heartbeats and measures [gRPC]({% link {{ page.version.version }}/architecture/distribution-layer.md %}#grpc) overhead as well as possible [head-of-line blocking](https://wikipedia.org/wiki/Head-of-line_blocking). Elevated values in this metric may hint at network issues or saturation or both, but they are not proof of them. [CPU overload]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#cpu-issues) can similarly elevate this metric. To conclusively diagnose network issues, look at OS-level metrics such as packet loss and retransmits. Heartbeats are not very frequent (every 1 second), so they may not capture rare or short-lived degradations.

- In the node view, the graph shows the 99th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of RPC heartbeat latency for the node.

- In the cluster view, the graph shows the 99th [percentile](https://wikipedia.org/wiki/Percentile#The_normal_distribution_and_percentiles) of RPC heartbeat latency across all nodes in the cluster. There are lines for each node in the cluster.

Metric: `round-trip-latency-p99`

## Unhealthy RPC Connections

A healthy RPC connection is one that is “bidirectionally connected” and "heartbeating". For example, if Node 1 sends a request to Node 2 and Node 2 dials back (sends request back to Node 1), it ensures that communication is healthy in both directions. This graph shows the number of connections in an unhealthy state.

- In the node view, the graph shows the number of outgoing connections on a node that are in an unhealthy state.

- In the cluster view, the graph shows the number of outgoing connections on each node that are in an unhealthy state.

Metric: `rpc.connection.unhealthy` Gauge of current connections in an unhealthy state (not bidirectionally connected or heartbeating)

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Support Resources]({% link {{ page.version.version }}/support-resources.md %})
- [Raw Status Endpoints]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#raw-status-endpoints)
