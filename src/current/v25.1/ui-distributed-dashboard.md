---
title: Distributed Dashboard
summary: The Distributed dashboard lets you monitor important distribution layer health and performance metrics.
toc: true
docs_area: reference.db_console
---

The **Distributed** dashboard lets you monitor important distribution layer health and performance metrics.

To view this dashboard, [access the DB Console]({{ page.version.version }}/ui-overview.md#db-console-access) and click **Metrics** on the left-hand navigation, and then select **Dashboard** > **Distributed**.

## Dashboard navigation


{{site.data.alerts.callout_info}}
All timestamps in the DB Console are shown in Coordinated Universal Time (UTC).
{{site.data.alerts.end}}

The **Distributed** dashboard displays the following time series graphs:

## Batches

![DB Console batches graph](/images/v22.1/ui_batches.png)

The **Batches** graph displays various details about [`BatchRequest`]({{ page.version.version }}/architecture/distribution-layer.md#batchrequest) traffic in the [Distribution layer]({{ page.version.version }}/architecture/distribution-layer.md).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Batches | The number of `BatchRequests` made, as tracked by the `distsender.batches` metric.
Partial Batches | The number of partial `BatchRequests` made, as tracked by the `distsender.batches.partial` metric.

## RPCs

![DB Console RPCs graph](/images/v22.1/ui_rpcs.png)

The **RPCs** graph displays various details about [`RPC`]({{ page.version.version }}/architecture/distribution-layer.md#grpc) traffic in the [Distribution layer]({{ page.version.version }}/architecture/distribution-layer.md).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
RPCs Sent | The number of RPC calls made, as tracked by the `distsender.rpc.sent` metric.
Local Fast-path | The number of local fast-path RPC calls made, as tracked by the `distsender.rpc.sent.local` metric.

## RPC Errors

![DB Console RPC errors graph](/images/v22.1/ui_rpc_errors.png)

The **RPC Errors** graph displays various details about [`RPC`]({{ page.version.version }}/architecture/distribution-layer.md#grpc) errors encountered in the [Distribution layer]({{ page.version.version }}/architecture/distribution-layer.md).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Replica Errors | The number of RPCs sent due to per-replica errors, as tracked by the `distsender.rpc.sent.nextreplicaerror` metric.
Not Leaseholder Errors | The number of `NotLeaseHolderErrors` logged, as tracked by the `distsender.errors.notleaseholder` metric.

## KV Transactions

![DB Console KV transactions graph](/images/v22.1/ui_kv_transactions.png)

The **KV Transactions** graph displays various details about transactions in the [Transaction layer]({{ page.version.version }}/architecture/transaction-layer.md).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Committed | The number of committed KV transactions (including fast-path), as tracked by the `txn.commits` metric.
Fast-path Committed | The number of committed one-phase KV transactions, as tracked by the `txn.commits1PC` metric.
Aborted | The number of aborted KV transactions, as tracked by the `txn.aborts` metric.

## KV Transaction Durations: 99th percentile

![DB Console KV transaction durations: 99th percentile graph](/images/v22.1/ui_kv_transactions_99.png)

The **KV Transaction Durations: 99th percentile** graph displays the 99th percentile of transaction durations over a one-minute period.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
`<node>` | The 99th percentile of transaction durations observed over a one-minute period for that node, as calculated from the `txn.durations` metric.

## KV Transaction Durations: 90th percentile

![DB Console KV transaction durations: 90th percentile graph](/images/v22.1/ui_kv_transactions_90.png)

The **KV Transaction Durations: 90th percentile** graph displays the 90th percentile of transaction durations over a one-minute period.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
`<node>` | The 90th percentile of transaction durations observed over a one-minute period for that node, as calculated from the `txn.durations` metric.

## Node Heartbeat Latency: 99th percentile

![DB Console node heartbeat latency: 99th percentile graph](/images/v22.1/ui_node_heartbeat_99.png)

The **Node Heartbeat Latency: 99th percentile** graph displays the 99th percentile of time elapsed between [node liveness]({{ page.version.version }}/cluster-setup-troubleshooting.md#node-liveness-issues) heartbeats on the cluster over a one-minute period.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
`<node>` | The 99th percentile of time elapsed between [node liveness]({{ page.version.version }}/cluster-setup-troubleshooting.md#node-liveness-issues) heartbeats on the cluster over a one-minute period for that node, as calculated from the `liveness.heartbeatlatency` metric.

## Node Heartbeat Latency: 90th percentile

![DB Console node heartbeat latency: 90th percentile graph](/images/v22.1/ui_node_heartbeat_90.png)

The **Node Heartbeat Latency: 90th percentile** graph displays the 90th percentile of time elapsed between [node liveness]({{ page.version.version }}/cluster-setup-troubleshooting.md#node-liveness-issues) heartbeats on the cluster over a one-minute period.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
`<node>` | The 90th percentile of time elapsed between [node liveness]({{ page.version.version }}/cluster-setup-troubleshooting.md#node-liveness-issues) heartbeats on the cluster over a one-minute period for that node, as calculated from the `liveness.heartbeatlatency` metric.


## See also

- [Troubleshooting Overview]({{ page.version.version }}/troubleshooting-overview.md)
- [Support Resources]({{ page.version.version }}/support-resources.md)
- [Raw Status Endpoints]({{ page.version.version }}/monitoring-and-alerting.md#raw-status-endpoints)