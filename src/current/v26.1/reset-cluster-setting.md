---
title: RESET CLUSTER SETTING
summary: The RESET CLUSTER SETTING statement resets a cluster setting to its default value for the client session.
toc: true
docs_area: reference.sql
---

The `RESET` [statement]({% link {{ page.version.version }}/sql-statements.md %}) resets a [cluster setting]({% link {{ page.version.version }}/set-cluster-setting.md %}) to its default value for the client session.

## Required privileges

Only members of the `admin` role can modify cluster settings. By default, the `root` user belongs to the `admin` role.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/reset_csetting.html %}
</div>

## Parameters

 Parameter | Description
-----------|-------------
 `var_name` | The name of the [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) (case-insensitive).

## Example

{{site.data.alerts.callout_success}}You can use <a href="{% link {{ page.version.version }}/set-cluster-setting.md %}"><code>SET CLUSTER SETTING .. TO DEFAULT</code></a> to reset a cluster setting as well.{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.metrics.statement_details.enabled = false;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER SETTING sql.metrics.statement_details.enabled;
~~~

~~~
  sql.metrics.statement_details.enabled
-----------------------------------------
                  false
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> RESET CLUSTER SETTING sql.metrics.statement_details.enabled;
~~~

{% include_cached copy-clipboard.html %}
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

- [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %})
- [`SHOW CLUSTER SETTING`]({% link {{ page.version.version }}/show-cluster-setting.md %})
- [Cluster settings]({% link {{ page.version.version }}/cluster-settings.md %})
