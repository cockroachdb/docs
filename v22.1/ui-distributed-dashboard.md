---
title: Distributed Dashboard
summary: The Distributed dashboard lets you monitor important distribution layer health and performance metrics.
toc: true
docs_area: reference.db_console
---

The **Distributed** dashboard lets you monitor important distribution layer health and performance metrics.

To view this dashboard, [access the DB Console](ui-overview.html#db-console-access) and click **Metrics** on the left-hand navigation, and then select **Dashboard** > **Distributed**.

{% include {{ page.version.version }}/ui/ui-metrics-navigation.md %}

{{site.data.alerts.callout_info}}
All timestamps in the DB Console are shown in Coordinated Universal Time (UTC).
{{site.data.alerts.end}}

The **Distributed** dashboard displays the following time series graphs:

## Batches

<img src="{{ 'images/v22.1/ui_batches.png' | relative_url }}" alt="DB Console batches graph" style="border:1px solid #eee;max-width:100%" />

The **Batches** graph displays various details about [`BatchRequest`](architecture/distribution-layer.html#batchrequest) traffic in the [Distribution layer](architecture/distribution-layer.html).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Batches | The number of `BatchRequests` made, as tracked by the `distsender.batches` metric.
Partial Batches | The number of partial `BatchRequests` made, as tracked by the `distsender.batches.partial` metric.

## RPCs

<img src="{{ 'images/v22.1/ui_rpcs.png' | relative_url }}" alt="DB Console RPCs graph" style="border:1px solid #eee;max-width:100%" />

The **RPCs** graph displays various details about [`RPC`](architecture/distribution-layer.html#grpc) traffic in the [Distribution layer](architecture/distribution-layer.html).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
RPCs Sent | The number of RPC calls made, as tracked by the `distsender.rpc.sent` metric.
Local Fast-path | The number of local fast-path RPC calls made, as tracked by the `distsender.rpc.sent.local` metric.

## RPC Errors

<img src="{{ 'images/v22.1/ui_rpc_errors.png' | relative_url }}" alt="DB Console RPC errors graph" style="border:1px solid #eee;max-width:100%" />

The **RPC Errors** graph displays various details about [`RPC`](architecture/distribution-layer.html#grpc) errors encountered in the [Distribution layer](architecture/distribution-layer.html).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Replica Errors | The number of RPCs sent due to per-replica errors, as tracked by the `distsender.rpc.sent.nextreplicaerror` metric.
Not Leaseholder Errors | The number of `NotLeaseHolderErrors` logged, as tracked by the `distsender.errors.notleaseholder` metric.

## KV Transactions

<img src="{{ 'images/v22.1/ui_kv_transactions.png' | relative_url }}" alt="DB Console KV transactions graph" style="border:1px solid #eee;max-width:100%" />

The **KV Transactions** graph displays various details about transactions in the [Transaction layer](architecture/transaction-layer.html).

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
Committed | The number of committed KV transactions (including fast-path), as tracked by the `txn.commits` metric.
Fast-path Committed | The number of committed one-phase KV transactions, as tracked by the `txn.commits1PC` metric.
Aborted | The number of aborted KV transactions, as tracked by the `txn.aborts` metric.

## KV Transaction Durations: 99th percentile

<img src="{{ 'images/v22.1/ui_kv_transactions_99.png' | relative_url }}" alt="DB Console KV transaction durations: 99th percentile graph" style="border:1px solid #eee;max-width:100%" />

The **KV Transaction Durations: 99th percentile** graph displays the 99th percentile of transaction durations over a one-minute period.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
`<node>` | The 99th percentile of transaction durations observed over a one-minute period for that node, as calculated from the `txn.durations` metric.

## KV Transaction Durations: 90th percentile

<img src="{{ 'images/v22.1/ui_kv_transactions_90.png' | relative_url }}" alt="DB Console KV transaction durations: 90th percentile graph" style="border:1px solid #eee;max-width:100%" />

The **KV Transaction Durations: 90th percentile** graph displays the 90th percentile of transaction durations over a one-minute period.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
`<node>` | The 90th percentile of transaction durations observed over a one-minute period for that node, as calculated from the `txn.durations` metric.

## Node Heartbeat Latency: 99th percentile

<img src="{{ 'images/v22.1/ui_node_heartbeat_99.png' | relative_url }}" alt="DB Console node heartbeat latency: 99th percentile graph" style="border:1px solid #eee;max-width:100%" />

The **Node Heartbeat Latency: 99th percentile** graph displays the 99th percentile of time elapsed between [node liveness](cluster-setup-troubleshooting.html#node-liveness-issues) heartbeats on the cluster over a one-minute period.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
`<node>` | The 99th percentile of time elapsed between [node liveness](cluster-setup-troubleshooting.html#node-liveness-issues) heartbeats on the cluster over a one-minute period for that node, as calculated from the `liveness.heartbeatlatency` metric.

## Node Heartbeat Latency: 90th percentile

<img src="{{ 'images/v22.1/ui_node_heartbeat_90.png' | relative_url }}" alt="DB Console node heartbeat latency: 90th percentile graph" style="border:1px solid #eee;max-width:100%" />

The **Node Heartbeat Latency: 90th percentile** graph displays the 90th percentile of time elapsed between [node liveness](cluster-setup-troubleshooting.html#node-liveness-issues) heartbeats on the cluster over a one-minute period.

Hovering over the graph displays values for the following metrics:

Metric | Description
--------|----
`<node>` | The 90th percentile of time elapsed between [node liveness](cluster-setup-troubleshooting.html#node-liveness-issues) heartbeats on the cluster over a one-minute period for that node, as calculated from the `liveness.heartbeatlatency` metric.

{% include {{ page.version.version }}/ui/ui-summary-events.md %}

## See also

- [Troubleshooting Overview](troubleshooting-overview.html)
- [Support Resources](support-resources.html)
- [Raw Status Endpoints](monitoring-and-alerting.html#raw-status-endpoints)
