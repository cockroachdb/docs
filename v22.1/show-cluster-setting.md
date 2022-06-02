---
title: SHOW CLUSTER SETTING
summary: The SHOW CLUSTER SETTING statement displays the current cluster settings.
toc: true
docs_area: reference.sql
---

The `SHOW CLUSTER SETTING` [statement](sql-statements.html) displays the values of [cluster settings](cluster-settings.html).

To configure cluster settings, use [`SET CLUSTER SETTING`](set-cluster-setting.html).

{{site.data.alerts.callout_info}}
The `SHOW` statement for cluster settings is unrelated to the other `SHOW` statements: <a href="show-vars.html"><code>SHOW {session variable}</code></a>, <a href="show-create.html"><code>SHOW CREATE</code></a>, <a href="show-users.html"><code>SHOW USERS</code></a>, <a href="show-databases.html"><code>SHOW DATABASES</code></a>, <a href="show-columns.html"><code>SHOW COLUMNS</code></a>, <a href="show-grants.html"><code>SHOW GRANTS</code></a>, and <a href="show-constraints.html"><code>SHOW CONSTRAINTS</code></a>.
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

To use the `SHOW CLUSTER SETTING` statement, a user must either be a member of the `admin` role (the `root` user belongs to the `admin` role by default) or have the `VIEWCLUSTERSETTING` [role option](security-reference/authorization.html#role-options) defined.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/show_cluster_setting.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`var_name` | The name of the [cluster setting](cluster-settings.html) (case-insensitive).
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
`public` | `true` if the cluster setting is public.<br>This field is only included only if all cluster settings are displayed.

## Examples

### Show the value of a single cluster setting

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> SHOW ALL CLUSTER SETTINGS;
~~~

~~~
                     variable                     | value | setting_type | public |                                                             description
--------------------------------------------------+-------+--------------+--------+--------------------------------------------------------------------------------------------------------------------------------------
  admission.kv.enabled                            | false | b            |  true  | when true, work performed by the KV layer is subject to admission control
  admission.kv_slot_adjuster.overload_threshold   | 32    | i            | false  | when the number of runnable goroutines per CPU is greater than this threshold, the slot adjuster considers the cpu to be overloaded
  admission.l0_file_count_overload_threshold      | 1000  | i            | false  | when the L0 file count exceeds this theshold, the store is considered overloaded
  admission.l0_sub_level_count_overload_threshold | 20    | i            | false  | when the L0 sub-level count exceeds this threshold, the store is considered overloaded
  ...
~~~

## See also

- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`RESET CLUSTER SETTING`](reset-cluster-setting.html)
- [Cluster settings](cluster-settings.html)
- [`SHOW {session variable}`](show-vars.html)
- [`SHOW COLUMNS`](show-columns.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`SHOW CREATE`](show-create.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW INDEX`](show-index.html)
- [`SHOW USERS`](show-users.html)
