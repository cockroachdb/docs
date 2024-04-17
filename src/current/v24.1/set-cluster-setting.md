---
title: SET CLUSTER SETTING
summary: The SET CLUSTER SETTING statement configures one cluster setting.
toc: true
docs_area: reference.sql
---

The `SET CLUSTER SETTING` [statement]({% link {{ page.version.version }}/sql-statements.md %}) modifies a [cluster-wide setting]({% link {{ page.version.version }}/cluster-settings.md %}).

{{site.data.alerts.callout_danger}}Many cluster settings are intended for tuning CockroachDB internals. Before changing these settings, we strongly encourage you to discuss your goals with CockroachDB; otherwise, you use them at your own risk.{{site.data.alerts.end}}

## Required privileges

To use the `SET CLUSTER SETTING` statement, a user must have one of the following attributes:

- Be a member of the `admin` role. (By default, the `root` user belongs to the `admin` role.)
- Have the `MODIFYCLUSTERSETTING` [system-level privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges) granted. `root` and [`admin`]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) users have this system-level privilege by default and are capable of granting it to other users and roles using the [`GRANT`]({% link {{ page.version.version }}/grant.md %}) statement. For example to grant this system-level privilege to user `maxroach`:

    ~~~ sql
    GRANT SYSTEM MODIFYCLUSTERSETTING TO maxroach;
    ~~~

- Have the `MODIFYSQLCLUSTERSETTING` [system-level privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges) granted. Users with this privilege are allowed to modify only [`sql.defaults.*` cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-defaults-cost-scans-with-default-col-size-enabled), not all cluster settings.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/set_cluster_setting.html %}
</div>

{{site.data.alerts.callout_info}}The <code>SET CLUSTER SETTING</code> statement is unrelated to the other <a href="set-transaction.html"><code>SET TRANSACTION</code></a> and <a href="{% link {{ page.version.version }}/set-vars.md %}"><code>SET {session variable}</code></a> statements.{{site.data.alerts.end}}

## Parameters

| Parameter | Description |
|-----------|-------------|
| `var_name` | The name of the [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) (case-insensitive). |
| `var_value` | The value for the [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}). |
| `DEFAULT` | Reset the [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) to its default value.<br><br>The [`RESET CLUSTER SETTING`]({% link {{ page.version.version }}/reset-cluster-setting.md %}) resets a cluster setting as well. |

## Examples

### Change the default distributed execution parameter

To configure a cluster so that new sessions automatically try to run queries [in a distributed fashion](https://www.cockroachlabs.com/blog/local-and-distributed-processing-in-cockroachdb/):

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.defaults.distsql = 1;
~~~

To disable distributed execution for all new sessions:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.defaults.distsql = 0;
~~~

{% include {{page.version.version}}/sql/sql-defaults-cluster-settings-deprecation-notice.md %}

### Disable automatic diagnostic reporting

To opt out of [automatic diagnostic reporting]({% link {{ page.version.version }}/diagnostics-reporting.md %}) of usage data to Cockroach Labs:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING diagnostics.reporting.enabled = false;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER SETTING diagnostics.reporting.enabled;
~~~

~~~
  diagnostics.reporting.enabled
---------------------------------
              false
(1 row)
~~~

### Reset a setting to its default value

{{site.data.alerts.callout_success}}You can use <a href="reset-cluster-setting.html"><code>RESET CLUSTER SETTING</code></a> to reset a cluster setting as well.{{site.data.alerts.end}}

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
> SET CLUSTER SETTING sql.metrics.statement_details.enabled = DEFAULT;
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

- [`SET {session variable}`]({% link {{ page.version.version }}/set-vars.md %})
- [`SHOW CLUSTER SETTING`]({% link {{ page.version.version }}/show-cluster-setting.md %})
- [Cluster settings]({% link {{ page.version.version }}/cluster-settings.md %})
- [`SHOW DEFAULT SESSION VARIABLES FOR ROLE`]({% link {{ page.version.version }}/show-default-session-variables-for-role.md %})
