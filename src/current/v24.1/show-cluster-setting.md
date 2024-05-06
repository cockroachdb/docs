---
title: SHOW CLUSTER SETTING
summary: The SHOW CLUSTER SETTING statement displays the current cluster settings.
toc: true
docs_area: reference.sql
---

The `SHOW CLUSTER SETTING` [statement]({% link {{ page.version.version }}/sql-statements.md %}) displays the values of [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}).

To configure cluster settings, use [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %}).

{{site.data.alerts.callout_info}}
The `SHOW` statement for cluster settings is unrelated to the other `SHOW` statements: <a href="{% link {{ page.version.version }}/show-vars.md %}"><code>SHOW {session variable}</code></a>, <a href="{% link {{ page.version.version }}/show-create.md %}"><code>SHOW CREATE</code></a>, <a href="{% link {{ page.version.version }}/show-users.md %}"><code>SHOW USERS</code></a>, <a href="{% link {{ page.version.version }}/show-databases.md %}"><code>SHOW DATABASES</code></a>, <a href="{% link {{ page.version.version }}/show-columns.md %}"><code>SHOW COLUMNS</code></a>, <a href="{% link {{ page.version.version }}/show-grants.md %}"><code>SHOW GRANTS</code></a>, and <a href="{% link {{ page.version.version }}/show-constraints.md %}"><code>SHOW CONSTRAINTS</code></a>.
{{site.data.alerts.end}}

## Details

- To display the value of a specific cluster setting, use the following syntax:

    ~~~ sql
    SHOW CLUSTER SETTING <setting>;
    ~~~

- To display the values of *public* cluster settings (i.e., cluster settings that are documented and for which tuning is supported), use one of the following:

    ~~~ sql
    SHOW CLUSTER SETTINGS;
    ~~~
    ~~~ sql
    SHOW PUBLIC CLUSTER SETTINGS;
    ~~~

-  To display the values of all cluster settings use one of the following:

    ~~~ sql
    SHOW ALL CLUSTER SETTINGS;
    ~~~
    ~~~ sql
    SHOW CLUSTER SETTING ALL;
    ~~~

    When you display all cluster settings, the table output includes a `public` column that denotes whether a setting is public or not.

## Required privileges

To use the `SHOW CLUSTER SETTING` statement, a user must have one of the following attributes:

- Be a member of the `admin` role (the `root` user belongs to the `admin` role by default).
- Have the `MODIFYCLUSTERSETTING` [system-level privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges) granted.
- Have the `VIEWCLUSTERSETTING` [system-level privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) (or the legacy `VIEWCLUSTERSETTING` [role option]({% link {{ page.version.version }}/security-reference/authorization.md %}#role-options)) defined.
- Have the `MODIFYSQLCLUSTERSETTING` [system-level privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges) granted. Users with this privilege are allowed to view only [`sql.defaults.*` cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-defaults-cost-scans-with-default-col-size-enabled), not all cluster settings.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_cluster_setting.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`var_name` | The name of the [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) (case-insensitive).
`ALL` | Display all cluster settings.
`PUBLIC` | Display only the public cluster settings.<br>By default, only public settings are listed by `SHOW CLUSTER SETTINGS`. `SHOW PUBLIC CLUSTER SETTINGS` and `SHOW CLUSTER SETTINGS` are equivalent.

## Response

When you query multiple cluster settings (e.g., with `SHOW CLUSTER SETTINGS`, or with `SHOW ALL CLUSTER SETTINGS`), the following fields are returned:

Field | Description
------|------------
`variable` | The name of the cluster setting.
`value` | The value of the cluster setting.
`setting_type` | The type of the cluster setting.<br>Possible values for `setting_type` include:<ul><li>`b` (`true` or `false`)</li><li>`z` (size, in bytes)</li><li>`d` (duration)</li><li>`e` (one of a set of possible values)</li><li>`f` (floating-point value)</li><li>`i` (integer)</li><li>`s` (string)</li></ul>
`description` | A brief description of the cluster setting, including possible values.
`public` | `true` if the cluster setting is public.<br>This field is only included if all cluster settings are displayed.
`default_value` | The default value of the cluster setting.
`origin` | The origin of the current value of the cluster setting.<br>Possible values for `origin` include:<ul><li>`default` (The current value has not been changed from the default value.)</li><li>`override` (The current value has been changed from the default value.)</li></ul>

## Examples

### Show the value of a single cluster setting

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER SETTING diagnostics.reporting.enabled;
~~~

~~~
  diagnostics.reporting.enabled
---------------------------------
              true
(1 row)
~~~

### Show the values of all public cluster settings

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CLUSTER SETTINGS;
~~~

~~~
                     variable                    | value | setting_type |                                                 description
-------------------------------------------------+-------+--------------+---------------------------------------------------------------------------------------------------------------
  admission.kv.enabled                           | false | b            | when true, work performed by the KV layer is subject to admission control
  admission.sql_kv_response.enabled              | false | b            | when true, work performed by the SQL layer when receiving a KV response is subject to admission control
  admission.sql_sql_response.enabled             | false | b            | when true, work performed by the SQL layer when receiving a DistSQL response is subject to admission control
  bulkio.stream_ingestion.minimum_flush_interval | 5s    | d            | the minimum timestamp between flushes; flushes may still occur if internal buffers fill up
  ...
~~~

### Show the values of all cluster settings

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ALL CLUSTER SETTINGS;
~~~

~~~
                     variable                     | value | setting_type | public |                                                             description
--------------------------------------------------+-------+--------------+--------+--------------------------------------------------------------------------------------------------------------------------------------
  admission.kv.enabled                            | false | b            |  true  | when true, work performed by the KV layer is subject to admission control
  admission.kv_slot_adjuster.overload_threshold   | 32    | i            | false  | when the number of runnable goroutines per CPU is greater than this threshold, the slot adjuster considers the cpu to be overloaded
  admission.l0_file_count_overload_threshold      | 1000  | i            | false  | when the L0 file count exceeds this threshold, the store is considered overloaded
  admission.l0_sub_level_count_overload_threshold | 20    | i            | false  | when the L0 sub-level count exceeds this threshold, the store is considered overloaded
  ...
~~~

## See also

- [`SET CLUSTER SETTING`]({% link {{ page.version.version }}/set-cluster-setting.md %})
- [`RESET CLUSTER SETTING`]({% link {{ page.version.version }}/reset-cluster-setting.md %})
- [Cluster settings]({% link {{ page.version.version }}/cluster-settings.md %})
- [`SHOW {session variable}`]({% link {{ page.version.version }}/show-vars.md %})
- [`SHOW COLUMNS`]({% link {{ page.version.version }}/show-columns.md %})
- [`SHOW CONSTRAINTS`]({% link {{ page.version.version }}/show-constraints.md %})
- [`SHOW CREATE`]({% link {{ page.version.version }}/show-create.md %})
- [`SHOW DATABASES`]({% link {{ page.version.version }}/show-databases.md %})
- [`SHOW GRANTS`]({% link {{ page.version.version }}/show-grants.md %})
- [`SHOW INDEX`]({% link {{ page.version.version }}/show-index.md %})
- [`SHOW USERS`]({% link {{ page.version.version }}/show-users.md %})
- [`SHOW DEFAULT SESSION VARIABLES FOR ROLE`]({% link {{ page.version.version }}/show-default-session-variables-for-role.md %})
