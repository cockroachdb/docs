---
title: RESET CLUSTER SETTING
summary: The RESET CLUSTER SETTING statement resets a cluster setting to its default value for the client session.
toc: true
docs_area: reference.sql
---

The `RESET` [statement]({{ page.version.version }}/sql-statements.md) resets a [cluster setting]({{ page.version.version }}/set-cluster-setting.md) to its default value for the client session.

## Required privileges

Only members of the `admin` role can modify cluster settings. By default, the `root` user belongs to the `admin` role.

## Synopsis

<div>
</div>

## Parameters

 Parameter | Description
-----------|-------------
 `var_name` | The name of the [cluster setting]({{ page.version.version }}/cluster-settings.md) (case-insensitive).

## Example

{{site.data.alerts.callout_success}}You can use <a href="{{ page.version.version }}/set-cluster-setting.md"><code>SET CLUSTER SETTING .. TO DEFAULT</code></a> to reset a cluster setting as well.{{site.data.alerts.end}}

~~~ sql
> SET CLUSTER SETTING sql.metrics.statement_details.enabled = false;
~~~

~~~ sql
> SHOW CLUSTER SETTING sql.metrics.statement_details.enabled;
~~~

~~~
  sql.metrics.statement_details.enabled
-----------------------------------------
                  false
(1 row)
~~~

~~~ sql
> RESET CLUSTER SETTING sql.metrics.statement_details.enabled;
~~~

~~~ sql
> SHOW CLUSTER SETTING sql.metrics.statement_details.enabled;
~~~

~~~
  sql.metrics.statement_details.enabled
-----------------------------------------
                  true
(1 row)
~~~

## See also

- [`SET CLUSTER SETTING`]({{ page.version.version }}/set-cluster-setting.md)
- [`SHOW CLUSTER SETTING`]({{ page.version.version }}/show-cluster-setting.md)
- [Cluster settings]({{ page.version.version }}/cluster-settings.md)