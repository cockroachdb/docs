---
title: Global Configurations
summary:
toc: false
---

This page shows you how to view and change CockroachDB's **global configurations**. These configurations apply to all nodes of a CockroachDB cluster and control, for example, whether or not to share diagnostic details with Cockroach Labs as well as advanced options for debugging and cluster tuning. They are defined via SQL `SET CLUSTER SETTING` statements and can be updated anytime after a cluster has been started, but only by the `root` user.

{{site.data.alerts.callout_info}}In contrast to global configurations, node-level configurations apply to a single node. They are defined by flags passed to the <code>cockroach start</code> command when starting a node and cannot be changed without stopping and restarting the node. For more details, see <a href="start-a-node.html">Start a Node</a>.{{site.data.alerts.end}}

<div id="toc"></div>

<!-- Add this section back in once `system.settings` has been fleshed out.

## Configuration Options

The following global configurations can be set for a running CockroachDB cluster:

<style>
table td:first-child {
    min-width: 350px;
}
</style>

Option | Type | Description
-------|------| -----------
`diagnostics.reporting.enabled` | Boolean | Whether or not nodes sends diagnostic details to CockroachDB. For more details, see [Diagnostics Reporting](diagnostics-reporting.html).<br><br>**Possible values:** `true` or `false`<br>**Default:** `true`
`enterprise.enabled` | Boolean | Whether or not Enterprise-grade features covered under the CockroachDB Community License (CCL) are enabled. For pricing and other details, please contact [CockroachDB Sales](https://www.cockroachlabs.com/pricing/sales/).
`kv.raft_log.synchronize` |
`kv.snapshot_rebalance.max_rate` |
`kv.snapshot_recovery.max_rate` |
`server.remote_debugging.mode` |
`sql.metrics.statement_details.dump_to_logs` |
`sql.metrics.statement_details.enabled` |
`sql.metrics.statement_details.threshold` |
`sql.trace.log_statement_execute` |
`sql.trace.session_eventlog.enabled` |
`sql.trace.txn.enable_threshold` |

possible types:

settings-registry.go

s = string
b = boolean
i = int
f = float
d = duration
z = byte-size (can set them with set cluster setting = 32 MiB)

-->

## View Current Global Configurations

To view the current global configurations for a running cluster:

1. 	Connect [the built-in SQL client](use-the-built-in-sql-client.html) to any node of the cluster.

2. 	Execute the `SHOW ALL CLUSTER SETTINGS` statement:

	~~~ sql
	> SHOW ALL CLUSTER SETTINGS;
	~~~

## Change a Global Configuration

Before changing a global configuration, please note the following:

- 	{{site.data.alerts.callout_danger}}Many global configurations are intended for tuning CockroachDB internals. Before changing these settings, we strongly encourage you to discuss your goals with CockroachDB; otherwise, you use them at your own risk.{{site.data.alerts.end}}

-	Only the `root` user has privileges to change global configurations with `SET CLUSTER SETTING`.

- 	Changing a global configuration is not instantaneous, as the change must be propagated to other nodes in the cluster.

- 	It's not recommended to change global configurations while upgrading to a new version of CockroachDB (docs on online cluster upgrades coming soon); wait until all nodes have been upgraded and then make the change.

To change a global configuration for a running cluster:

1.	Connect the [built-in SQL client](use-the-built-in-sql-client.html) to any node of the cluster.

2.	Execute the `SET CLUSTER SETTING` statement with the relevant setting name and value:

	~~~ sql
	> SET CLUSTER SETTING <setting name> = <setting value>;
	~~~

## See Also

- [Diagnostics Reporting](diagnostics-reporting.html)
- [Start a Node](start-a-node.html)
- [Use the Built-in SQL Client](use-the-built-in-sql-client.html)
