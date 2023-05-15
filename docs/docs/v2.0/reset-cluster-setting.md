---
title: RESET CLUSTER SETTING
summary: The RESET CLUSTER SETTING statement resets a cluster setting to its default value for the client session.
toc: true
---

The `RESET` [statement](sql-statements.html) resets a [cluster setting](set-cluster-setting.html) to its default value for the client session..


## Required Privileges

Only the `root` user can modify cluster settings.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/reset_csetting.html %}
</div>

## Parameters

| Parameter | Description |
|-----------|-------------|
| `var_name` | The name of the [cluster setting](cluster-settings.html) (case-insensitive). |

## Example

{{site.data.alerts.callout_success}}You can use <a href="set-cluster-setting.html"><code>SET CLUSTER SETTING .. TO DEFAULT</code></a> to reset a cluster setting as well.{{site.data.alerts.end}}

~~~ sql
> SET CLUSTER SETTING sql.metrics.statement_details.enabled = false;
~~~

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

~~~ sql
> RESET CLUSTER SETTING sql.metrics.statement_details.enabled;
~~~

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

## See Also

- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW CLUSTER SETTING`](show-cluster-setting.html)
- [Cluster settings](cluster-settings.html)
