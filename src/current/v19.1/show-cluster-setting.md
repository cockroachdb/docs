---
title: SHOW CLUSTER SETTING
summary: The SHOW CLUSTER SETTING statement displays the current cluster settings.
toc: true
---

The `SHOW CLUSTER SETTING` [statement](sql-statements.html) can
display the value of either one or all of the
[cluster settings](cluster-settings.html). These can also be configured
via [`SET CLUSTER SETTING`](set-cluster-setting.html).

## Required privileges

Only members of the `admin` role can display cluster settings. By default, the `root` user belongs to the `admin` role.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_cluster_setting.html %}
</div>

{{site.data.alerts.callout_info}}The <code>SHOW</code> statement for cluster settings is unrelated to the other <code>SHOW</code> statements: <a href="show-vars.html"><code>SHOW (session variable)</code></a>, <a href="show-create.html"><code>SHOW CREATE</code></a>, <a href="show-users.html"><code>SHOW USERS</code></a>, <a href="show-databases.html"><code>SHOW DATABASES</code></a>, <a href="show-columns.html"><code>SHOW COLUMNS</code></a>, <a href="show-grants.html"><code>SHOW GRANTS</code></a>, and <a href="show-constraints.html"><code>SHOW CONSTRAINTS</code></a>.{{site.data.alerts.end}}

## Parameters

Parameter | Description
----------|------------
`any_name` | The name of the [cluster setting](cluster-settings.html) (case-insensitive).

## Examples

### Showing the value of a single cluster setting

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER SETTING diagnostics.reporting.enabled;
~~~

~~~
+-------------------------------+
| diagnostics.reporting.enabled |
+-------------------------------+
|             true              |
+-------------------------------+
(1 row)
~~~

### Showing the value of all cluster settings

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ALL CLUSTER SETTINGS;
~~~

~~~
+------------------------------------------------------+-----------+--------------+--------------------------------------------------------------------------+
|                       variable                       |   value   | setting_type |                               description                                |
+------------------------------------------------------+-----------+--------------+--------------------------------------------------------------------------+
| cloudstorage.gs.default.key                          |           | s            | if set, JSON key to use during Google Cloud Storage operations           |
| cloudstorage.http.custom_ca                          |           | s            | custom root CA (appended to system's default CAs) for verifying          |
|                                                      |           |              | certificates when interacting with HTTPS storage                         |
| cloudstorage.timeout                                 | 10m0s     | d            | the timeout for import/export storage operations                         |
...
+-------------------------------+---------------+------+--------------------------------------------------------+
~~~

## See also

- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`RESET CLUSTER SETTING`](reset-cluster-setting.html)
- [Cluster settings](cluster-settings.html)
- [`SHOW` (session variable)](show-vars.html)
- [`SHOW COLUMNS`](show-columns.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`SHOW CREATE`](show-create.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW INDEX`](show-index.html)
- [`SHOW USERS`](show-users.html)
