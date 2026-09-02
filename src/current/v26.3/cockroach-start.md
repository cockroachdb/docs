---
title: cockroach start
summary: Start a new multi-node cluster or add nodes to an existing multi-node cluster.
toc: true
key: start-a-node.html
docs_area: reference.cli
---

{% assign version = page.version.version | replace: ".", "" %}
{% assign start_cmd = site.data[version]["cockroach-commands"] | where: "command_id", "cockroach_start" | first %}

This page explains the `cockroach start` [command]({% link {{ page.version.version }}/cockroach-commands.md %}), which you use to start a new multi-node cluster or add nodes to an existing cluster.

{{site.data.alerts.callout_success}}
If you need a simple single-node backend for app development, use [`cockroach start-single-node`]({% link {{ page.version.version }}/cockroach-start-single-node.md %}) instead, and follow the best practices for local testing described in [Test Your Application]({% link {{ page.version.version }}/local-testing.md %}).

For quick SQL testing, consider using [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) to start a temporary, in-memory cluster with immediate access to an interactive SQL shell.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Node-level settings are defined by [flags](#flags) passed to the `cockroach start` command and cannot be changed without stopping and restarting the node. In contrast, some cluster-wide settings are defined via SQL statements and can be updated anytime after a cluster has been started. For more details, see [Cluster Settings]({% link {{ page.version.version }}/cluster-settings.md %}).
{{site.data.alerts.end}}

## Synopsis

Start a node to be part of a new multi-node cluster:

~~~ shell
{{ start_cmd.synopsis.start_new_cluster }}
~~~

Initialize a new multi-node cluster:

~~~ shell
{{ start_cmd.synopsis.initialize_cluster }}
~~~

Add a node to an existing cluster:

~~~ shell
{{ start_cmd.synopsis.add_node }}
~~~

View help:

~~~ shell
{{ start_cmd.synopsis.view_help }}
~~~

## Flags

{% include {{ page.version.version }}/reference/flags-table.md flags=start_cmd.flags %}

## Store

The `--store` flag supports the following fields. Note that commas are used to separate fields, and so are forbidden in all field values.

{% include {{ page.version.version }}/reference/fields-table.md fields=start_cmd.store %}

## Standard output

When you run `cockroach start`, some helpful details are printed to the standard output:

{{site.data.alerts.callout_success}}
These details are also written to the `INFO` log in the `/logs` directory. You can retrieve them with a command like `grep 'node starting' node1/logs/cockroach.log -A 11`.
{{site.data.alerts.end}}

{% include {{ page.version.version }}/reference/fields-table.md fields=start_cmd.standard_output.fields %}

## See also

- [Initialize a Cluster]({% link {{ page.version.version }}/cockroach-init.md %})
- [Manual Deployment]({% link {{ page.version.version }}/manual-deployment.md %})
- [Kubernetes Overview]({% link {{ page.version.version }}/kubernetes-overview.md %})
- [Local Deployment]({% link {{ page.version.version }}/start-a-local-cluster.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})