---
title: Cluster Settings
summary: Learn about cluster settings that apply to all nodes of a CockroachDB cluster.
toc: false
docs_area: reference.cluster_settings
---

Cluster settings apply to all nodes of a CockroachDB cluster and control, for example, whether or not to share diagnostic details with Cockroach Labs as well as advanced options for debugging and cluster tuning.

They can be updated anytime after a cluster has been started, but only by a member of the `admin` role, to which the `root` user belongs by default.

{{site.data.alerts.callout_info}}
In contrast to cluster-wide settings, node-level settings apply to a single node. They are defined by flags passed to the `cockroach start` command when starting a node and cannot be changed without stopping and restarting the node. For more details, see [Start a Node](cockroach-start.html).
{{site.data.alerts.end}}

## Settings

{{site.data.alerts.callout_danger}}
These cluster settings have a broad impact on CockroachDB internals and affect all applications, workloads, and users running on a CockroachDB cluster. For some settings, a [session setting](set-vars.html#supported-variables) could be a more appropriate scope.
{{site.data.alerts.end}}

{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/release-{{ page.version.version | replace: "v", "" }}/docs/generated/settings/settings.html %}

## View current cluster settings

Use the [`SHOW CLUSTER SETTING`](show-cluster-setting.html) statement.

## Change a cluster setting

Use the [`SET CLUSTER SETTING`](set-cluster-setting.html) statement.

Before changing a cluster setting, please note the following:

- 	Changing a cluster setting is not instantaneous, as the change must be propagated to other nodes in the cluster.

- 	Do not change cluster settings while [upgrading to a new version of CockroachDB](upgrade-cockroach-version.html). Wait until all nodes have been upgraded before you make the change.

## See also

- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW CLUSTER SETTING`](show-cluster-setting.html)
- [Diagnostics Reporting](diagnostics-reporting.html)
- [Start a Node](cockroach-start.html)
- [Use the Built-in SQL Client](cockroach-sql.html)
