---
title: Cluster Settings
summary: Learn about cluster settings that apply to all nodes of a CockroachDB cluster.
toc: true
---

This page shows you how to view and change CockroachDB's **cluster-wide settings**.

{{site.data.alerts.callout_info}}In contrast to cluster-wide settings, node-level settings apply to a single node. They are defined by flags passed to the <code>cockroach start</code> command when starting a node and cannot be changed without stopping and restarting the node. For more details, see <a href="start-a-node.html">Start a Node</a>.{{site.data.alerts.end}}


## Overview

Cluster settings apply to all nodes of a CockroachDB cluster and control, for example, whether or not to share diagnostic details with Cockroach Labs as well as advanced options for debugging and cluster tuning.

They can be updated anytime after a cluster has been started, but only by the `root` user.

## Settings

{{site.data.alerts.callout_danger}}Many cluster settings are intended for tuning CockroachDB internals. Before changing these settings, we strongly encourage you to discuss your goals with Cockroach Labs; otherwise, you use them at your own risk.{{site.data.alerts.end}}

The following settings can be configured without further input from Cockroach Labs:

| Setting | Description | Value type    | Default value |
|---------|-------------|---------------|---------------|
| `diagnostics.reporting.enabled` | Enable automatic reporting of usage data to Cockroach Labs. | Boolean | `true` |
| `diagnostics.reporting.interval` | Interval between automatic reports. **Note that increasing this value will also cause memory usage per node to increase, as the reporting data is collected into RAM.** | Interval | 1 hour |
| `diagnostics.reporting.report_metrics` | Enable collection and reporting of diagnostic metrics. Only applicable if `diagnostics.reporting.enabled` is `true`. | Boolean | `true` |
| `diagnostics.reporting.send_crash_reports` | Enable collection and reporting of node crashes. Only applicable if `diagnostics.reporting.enabled` is `true`. | Boolean | `true` |
| `sql.defaults.distsql` | Define whether new client sessions try to [distribute query execution](https://www.cockroachlabs.com/blog/local-and-distributed-processing-in-cockroachdb/) by default. | Integer | 1 (automatic) |
| `sql.metrics.statement_details.enabled` | Collect per-node, per-statement query statistics, visible in the virtual table `crdb_internal.node_statement_statistics`. | Boolean | `true` |
| `sql.metrics.statement_details.dump_to_logs` | On each node, also copy collected per-statement statistics to the [logging output](debug-and-error-logs.html) when automatic reporting is enabled. | Boolean | `false` |
| `sql.metrics.statement_details.threshold` | Only collect per-statement statistics for statements that run longer than this threshold. | Interval | 0 seconds (all statements) |
| `sql.trace.log_statement_execute` | On each node, copy all executed statements to the [logging output](debug-and-error-logs.html). | Boolean | `false` |

<!-- Add this section back in once `system.settings` has been fleshed out.

## Settings

types:

settings-registry.go

s = string
b = boolean
i = int
f = float
d = duration
z = byte-size (can set them with set cluster setting = 32 MiB)

-->

## View Current Cluster Settings

Use the [`SHOW CLUSTER SETTING`](show-cluster-setting.html) statement.

## Change a Cluster Setting

Use the [`SET CLUSTER SETTING`](set-cluster-setting.html) statement.

Before changing a cluster setting, please note the following:

- 	Changing a cluster setting is not instantaneous, as the change must be propagated to other nodes in the cluster.

- 	It's not recommended to change cluster settings [upgrading to a new version of CockroachDB](upgrade-cockroach-version.html); wait until all nodes have been upgraded and then make the change.

## See Also

- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW CLUSTER SETTING`](show-cluster-setting.html)
- [Diagnostics Reporting](diagnostics-reporting.html)
- [Start a Node](start-a-node.html)
- [Use the Built-in SQL Client](use-the-built-in-sql-client.html)
