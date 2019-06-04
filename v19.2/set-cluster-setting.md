---
title: SET CLUSTER SETTING
summary: The SET CLUSTER SETTING statement configures one cluster setting.
toc: true
---

The `SET CLUSTER SETTING` [statement](sql-statements.html) modifies a [cluster-wide setting](cluster-settings.html).

{{site.data.alerts.callout_danger}}Many cluster settings are intended for tuning CockroachDB internals. Before changing these settings, we strongly encourage you to discuss your goals with CockroachDB; otherwise, you use them at your own risk.{{site.data.alerts.end}}


## Required privileges

Only members of the `admin` role can modify cluster settings. By default, the `root` user belongs to the `admin` role.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/set_cluster_setting.html %}
</div>

{{site.data.alerts.callout_info}}The <code>SET CLUSTER SETTING</code> statement is unrelated to the other <a href="set-transaction.html"><code>SET TRANSACTION</code></a> and <a href="set-vars.html"><code>SET (session variable)</code></a> statements.{{site.data.alerts.end}}

## Parameters

| Parameter | Description |
|-----------|-------------|
| `var_name` | The name of the [cluster setting](cluster-settings.html) (case-insensitive). |
| `var_value` | The value for the [cluster setting](cluster-settings.html). |
| `DEFAULT` | Reset the [cluster setting](cluster-settings.html) to its default value.<br><br>The [`RESET CLUSTER SETTING`](reset-cluster-setting.html) resets a cluster setting as well. |

## Examples

### Change the default distributed execution parameter

To configure a cluster so that new sessions automatically try to run queries [in a distributed fashion](https://www.cockroachlabs.com/blog/local-and-distributed-processing-in-cockroachdb/):

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.defaults.distsql = 1;
~~~

To disable distributed execution for all new sessions:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.defaults.distsql = 0;
~~~

### Disable automatic diagnostic reporting

To opt out of [automatic diagnostic reporting](diagnostics-reporting.html) of usage data to Cockroach Labs:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING diagnostics.reporting.enabled = false;
~~~

{% include copy-clipboard.html %}
~~~ sql
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

### Reset a setting to its default value

{{site.data.alerts.callout_success}}You can use <a href="reset-cluster-setting.html"><code>RESET CLUSTER SETTING</code></a> to reset a cluster setting as well.{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.metrics.statement_details.enabled = false;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER SETTING sql.metrics.statement_details.enabled;
~~~

~~~
+---------------------------------------+
| sql.metrics.statement_details.enabled |
+---------------------------------------+
| false                                 |
+---------------------------------------+
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.metrics.statement_details.enabled = DEFAULT;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER SETTING sql.metrics.statement_details.enabled;
~~~

~~~
+---------------------------------------+
| sql.metrics.statement_details.enabled |
+---------------------------------------+
| true                                  |
+---------------------------------------+
(1 row)
~~~

## See also

- [`SET` (session variable)](set-vars.html)
- [`SHOW CLUSTER SETTING`](show-cluster-setting.html)
- [Cluster settings](cluster-settings.html)
