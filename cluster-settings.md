---
title: Cluster Settings
summary: Learn about cluster settings that apply to all nodes of a CockroachDB cluster.
toc: false
---

This page shows you how to view and change CockroachDB's **cluster-wide settings**. These settings apply to all nodes of a CockroachDB cluster and control, for example, whether or not to share diagnostic details with Cockroach Labs as well as advanced options for debugging and cluster tuning. They are defined via `SET CLUSTER SETTING` SQL statements and can be updated anytime after a cluster has been started, but only by the `root` user.

{{site.data.alerts.callout_info}}In contrast to cluster-wide settings, node-level settings apply to a single node. They are defined by flags passed to the <code>cockroach start</code> command when starting a node and cannot be changed without stopping and restarting the node. For more details, see <a href="start-a-node.html">Start a Node</a>.{{site.data.alerts.end}}

<div id="toc"></div>

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

To view the current settings for a running cluster:

1. Connect [the built-in SQL client](use-the-built-in-sql-client.html) to any node of the cluster.

2. Execute the `SHOW ALL CLUSTER SETTINGS` statement:

	~~~ sql
	> SHOW ALL CLUSTER SETTINGS;
	~~~

## Change a Cluster Setting

Before changing a cluster setting, please note the following:

- 	{{site.data.alerts.callout_danger}}Many cluster settings are intended for tuning CockroachDB internals. Before changing these settings, we strongly encourage you to discuss your goals with CockroachDB; otherwise, you use them at your own risk.{{site.data.alerts.end}}

-	Only the `root` user has privileges to change cluster settings with `SET CLUSTER SETTING`.

- 	Changing a cluster setting is not instantaneous, as the change must be propagated to other nodes in the cluster.

- 	It's not recommended to change cluster settings while upgrading to a new version of CockroachDB (docs on online cluster upgrades coming soon); wait until all nodes have been upgraded and then make the change.

To change a setting for a running cluster:

1. Connect the [built-in SQL client](use-the-built-in-sql-client.html) to any node of the cluster.

2. Execute the `SET CLUSTER SETTING` statement with the relevant setting name and value:

	~~~ sql
	> SET CLUSTER SETTING <setting name> = <setting value>;
	~~~

## See Also

- [Diagnostics Reporting](diagnostics-reporting.html)
- [Start a Node](start-a-node.html)
- [Use the Built-in SQL Client](use-the-built-in-sql-client.html)
