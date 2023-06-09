---
title: SHOW CLUSTER SETTING
summary: The SHOW CLUSTER SETTING statement displays the current cluster settings.
toc: true
---

The `SHOW CLUSTER SETTING` [statement](sql-statements.html) can
display the value of either one or all of the
[cluster settings](cluster-settings.html). These can also be configured
via [`SET CLUSTER SETTING`](set-cluster-setting.html).


## Required Privileges

No [privileges](privileges.html) are required to display the cluster settings.

## Synopsis

{% include {{ page.version.version }}/sql/diagrams/show_cluster_setting.html %}

{{site.data.alerts.callout_info}}The <code>SHOW</code> statement for cluster settings is unrelated to the other <code>SHOW</code> statements: <a href="show-vars.html"><code>SHOW (session variable)</code></a>, <a href="show-create-table.html"><code>SHOW CREATE TABLE</code></a>, <a href="show-create-view.html"><code>SHOW CREATE VIEW</code></a>, <a href="show-users.html"><code>SHOW USERS</code></a>, <a href="show-databases.html"><code>SHOW DATABASES</code></a>, <a href="show-columns.html"><code>SHOW COLUMNS</code></a>, <a href="show-grants.html"><code>SHOW GRANTS</code></a>, and <a href="show-constraints.html"><code>SHOW CONSTRAINTS</code></a>.{{site.data.alerts.end}}

## Parameters

| Parameter | Description |
|-----------|-------------|
| `any_name` | See the description of [cluster settings](cluster-settings.html). |

The variable name is case insensitive.

## Examples

### Showing the Value of a Single Cluster Setting

~~~ sql
> SHOW CLUSTER SETTING diagnostics.reporting.enabled;
~~~

~~~
+-------------------------------+
| diagnostics.reporting.enabled |
+-------------------------------+
| true                          |
+-------------------------------+
(1 row)
~~~

~~~ sql
> SHOW CLUSTER SETTING sql.default.distsql;
~~~

~~~
+----------------------+
| sql.defaults.distsql |
+----------------------+
|                    1 |
+----------------------+
(1 row)
~~~

### Showing the Value of All Cluster Settings

~~~ sql
> SHOW ALL CLUSTER SETTINGS;
~~~

~~~
+-------------------------------+---------------+------+--------------------------------------------------------+
|          name                 | current_value | type | description                                            |
+-------------------------------+---------------+------+--------------------------------------------------------+
| diagnostics.reporting.enabled | true          | b    | enable reporting diagnostic metrics to cockroach labs  |
| ...                           | ...           | ...  | ...                                                    |
+-------------------------------+---------------+------+--------------------------------------------------------+
(24 rows)
~~~

## See Also

- [`SET CLUSTER SETTING`](set-vars.html)
- [Cluster settings](cluster-settings.html)
- [`SHOW` (session variable)](show-vars.html)
- [`SHOW COLUMNS`](show-columns.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`SHOW CREATE TABLE`](show-create-table.html)
- [`SHOW CREATE VIEW`](show-create-view.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW INDEX`](show-index.html)
- [`SHOW USERS`](show-users.html)
