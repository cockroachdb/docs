---
title: Global Configurations
summary:
toc: false
---

In CockroachDB, there are two levels of configuration:

- 	**Node-level configurations** apply to a single node of a CockroachDB cluster and define, for example, the interfaces for communicating with other nodes and the percent of system memory allocated to key-value operations performed by the node. These settings are defined when a node is started with `cockroach start` and cannot be changed without stopping and restarting the node.

- 	**Cluster-wide configurations** apply to all nodes of CockroachDB cluster and define, for example, whether or not to share diagnostic details with Cockroach Labs and advanced options for debugging and cluster tuning. These settings are defined via SQL `SET` statements and therefore can be updated anytime after a cluster has been started.

This page documents how to view and change the **cluster-wide configurations**. For information about node-level configurations, see [Start a Node](start-a-node.html).

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
`diagnostics.reporting.enabled` | Boolean | Whether or not nodes sends diagnostic details to CockroachDB. For more details, see [Diagnostic Reporting](diagnostic-reporting.html).<br><br>**Possible values:** `true` or `false`<br>**Default:** `true`
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
z = byte-size (can set them with set clusters setting 32 MiB)

-->

## View Current Global Configurations

To view the current global configurations for a running cluster:

1. 	Connect [the built-in SQL client](use-the-built-in-sql-client.html) to any node of the cluster.

2. 	Execute the `SHOW ALL CLUSTER SETTINGS` statement:

	~~~ sql
	> SHOW ALL CLUSTER SETTINGS;
	~~~

	~~~
	+--------------------------------------------+---------------+------+-------------------------------------------------------------------------------+
	|                    name                    | current_value | type |                                  description                                  |
	+--------------------------------------------+---------------+------+-------------------------------------------------------------------------------+
	| diagnostics.reporting.enabled              | true          | b    | enable reporting diagnostic metrics to cockroach labs                         |
	| enterprise.enabled                         | false         | b    | set to true to enable Enterprise features                                     |
	| kv.raft_log.synchronize                    | false         | b    | set to true to synchronize on Raft log writes to persistent storage           |
	| kv.snapshot_rebalance.max_rate             | 2.0 MiB       | z    | the rate limit (bytes/sec) to use for rebalance snapshots                     |
	| kv.snapshot_recovery.max_rate              | 8.0 MiB       | z    | the rate limit (bytes/sec) to use for recovery snapshots                      |
	| server.remote_debugging.mode               | local         | s    | set to enable remote debugging, localhost-only or disable (all, local, false) |
	| sql.metrics.statement_details.dump_to_logs | false         | b    | dump collected statement statistics to node logs when periodically cleared    |
	| sql.metrics.statement_details.enabled      | true          | b    | collect per-statement query statistics                                        |
	| sql.metrics.statement_details.threshold    | 0s            | d    | minmum execution time to cause statics to be collected                        |
	| sql.trace.log_statement_execute            | false         | b    | set to true to enable logging of executed statements                          |
	| sql.trace.session_eventlog.enabled         | false         | b    | set to true to enable session tracing                                         |
	| sql.trace.txn.enable_threshold             | 0s            | d    | duration beyond which all transactions are traced (set to 0 to disable)       |
	+--------------------------------------------+---------------+------+-------------------------------------------------------------------------------+
	(12 rows)
	~~~

## Change a Global Configuration

Before changing a global configuration, please note the following:

- 	Many global configurations are intended for tuning CockroachDB internals. Before changing these settings, it's best to [discuss your goals with CockroachDB](https://gitter.im/cockroachdb/cockroach); otherwise, you use them at your own risk.

- 	Changing a global configuration is not instantaneous, as the change must be propigated to other nodes in the cluster.

- 	It's not recommended to change global configurations while upgrading to a new version of CockroachDB (docs on online cluster upgrades coming soon); wait until all nodes have been upgraded and then make the change.

To change a global configuration for a running cluster:

1.	Connect the [built-in SQL client](use-the-built-in-sql-client.html) to any node of the cluster.

2.	Execute the `SET CLUSTER SETTING` statement with the relevant setting name and value:

	~~~ sql
	> SET CLUSTER SETTING <setting name> = <setting value>;
	~~~

## See Also

- [Diagnostics Reporting](diagnostic-reporting.html)
- [Start a Node](start-a-node.html)
- [Use the Built-in SQL Client](use-the-built-in-sql-client.html)
