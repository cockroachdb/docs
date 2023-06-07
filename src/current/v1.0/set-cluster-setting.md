---
title: SET CLUSTER SETTING
summary: The SET CLUSTER SETTING statement configures one cluster setting.
toc: true
---

The `SET CLUSTER SETTING` [statement](sql-statements.html) modifies a [cluster-wide setting](cluster-settings.html).

{{site.data.alerts.callout_danger}}Many cluster settings are intended for tuning CockroachDB internals. Before changing these settings, we strongly encourage you to discuss your goals with CockroachDB; otherwise, you use them at your own risk.{{site.data.alerts.end}}


## Synopsis

{% include {{ page.version.version }}/sql/diagrams/set_cluster_setting.html %}

{{site.data.alerts.callout_info}}The <code>SET CLUSTER SETTING</code> statement is unrelated to the other <a href="set-transaction.html"><code>SET TRANSACTION</code></a> and <a href="set-vars.html"><code>SET (session variable)</code></a> statements.{{site.data.alerts.end}}

## Required Privileges

Only the `root` user can modify cluster settings.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `var_name` | See the description of [cluster settings](cluster-settings.html). |

The variable name is case-insensitive.

## Examples

### Change the Default Distributed Execution Parameter

You can configure a cluster so that new sessions automatically try to run queries [in a distributed fashion](https://www.cockroachlabs.com/blog/local-and-distributed-processing-in-cockroachdb/):

~~~ sql
> SET CLUSTER SETTING sql.defaults.distsql = 1;
~~~

You can also disable distributed execution for all new sessions:

~~~ sql
> SET CLUSTER SETTING sql.defaults.distsql = 0;
~~~

### Disable Automatic Diagnostic Reporting

You can opt out of
[automatic diagnostic reporting](diagnostics-reporting.html) of usage
data to Cockroach Labs using the following:

~~~ sql
> SET CLUSTER SETTING diagnostics.reporting.enabled = false;
> SHOW CLUSTER SETTING diagnostics.reporting.enabled;
~~~


~~~
+-------------------------------+
| diagnostics.reporting.enabled |
+-------------------------------+
| false                         |
+-------------------------------+
(1 row)
~~~

## See Also

- [`SET` (session variable)](set-vars.html)
- [`SHOW CLUSTER SETTING`](show-cluster-setting.html)
- [Cluster settings](cluster-settings.html)
