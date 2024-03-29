---
title: Cluster Settings
summary: Learn about cluster settings that apply to all nodes of a CockroachDB cluster.
toc: false
docs_area: reference.cluster_settings
---

Cluster settings apply to all nodes of a CockroachDB cluster and control, for example, whether or not to share diagnostic details with Cockroach Labs as well as advanced options for debugging and cluster tuning.

They can be updated anytime after a cluster has been started, but only by a member of the `admin` role, to which the `root` user belongs by default.

{{site.data.alerts.callout_info}}
In contrast to cluster-wide settings, node-level settings apply to a single node. They are defined by flags passed to the `cockroach start` command when starting a node and cannot be changed without stopping and restarting the node. For more details, see [Start a Node]({% link {{ page.version.version }}/cockroach-start.md %}).
{{site.data.alerts.end}}

## Settings

{{site.data.alerts.callout_danger}}
These cluster settings have a broad impact on CockroachDB internals and affect all applications, workloads, and users running on a CockroachDB cluster. For some settings, a [session setting]({% link {{ page.version.version }}/set-vars.md %}#supported-variables) could be a more appropriate scope.
{{site.data.alerts.end}}

{% include {{page.version.version}}/sql/sql-defaults-cluster-settings-deprecation-notice.md %}

{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/{{ page.release_info.crdb_branch_name }}/docs/generated/settings/settings.html %}

## View current cluster settings

Use the [`SHOW CLUSTER SETTING`]({% link {{ page.version.version }}/show-cluster-setting.md %}) statement.

## Change a cluster setting

Use the [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %}) statement.

Before changing a cluster setting, note the following:

- 	Changing a cluster setting is not instantaneous, as the change must be propagated to other nodes in the cluster.

- 	Do not change cluster settings while [upgrading to a new version of CockroachDB]({% link {{ page.version.version }}/upgrade-cockroach-version.md %}). Wait until all nodes have been upgraded before you make the change.

## See also

- [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %})
- [`SHOW CLUSTER SETTING`]({% link {{ page.version.version }}/show-cluster-setting.md %})
- [Diagnostics Reporting]({% link {{ page.version.version }}/diagnostics-reporting.md %})
- [Start a Node]({% link {{ page.version.version }}/cockroach-start.md %})
- [Use the Built-in SQL Client]({% link {{ page.version.version }}/cockroach-sql.md %})
