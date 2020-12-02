---
title: SHOW CLUSTER SETTING
summary: The SHOW CLUSTER SETTING statement displays the current cluster settings.
toc: true
---

The `SHOW CLUSTER SETTING` [statement](sql-statements.html) displays the values of [cluster settings](cluster-settings.html).

To configure cluster settings, use [`SET CLUSTER SETTING`](set-cluster-setting.html).

{{site.data.alerts.callout_info}}
The `SHOW` statement for cluster settings is unrelated to the other `SHOW` statements: <a href="show-vars.html"><code>SHOW (session variable)</code></a>, <a href="show-create.html"><code>SHOW CREATE</code></a>, <a href="show-users.html"><code>SHOW USERS</code></a>, <a href="show-databases.html"><code>SHOW DATABASES</code></a>, <a href="show-columns.html"><code>SHOW COLUMNS</code></a>, <a href="show-grants.html"><code>SHOW GRANTS</code></a>, and <a href="show-constraints.html"><code>SHOW CONSTRAINTS</code></a>.
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

Only members of the `admin` role can display cluster settings. By default, the `root` user belongs to the `admin` role.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/show_cluster_setting.html %}
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
           variable           |     value      | setting_type |                                                   description
------------------------------+----------------+--------------+-------------------------------------------------------------------------------------------------------------------
  cloudstorage.gs.default.key |                | s            | if set, JSON key to use during Google Cloud Storage operations
  cloudstorage.http.custom_ca |                | s            | custom root CA (appended to system's default CAs) for verifying certificates when interacting with HTTPS storage
  cloudstorage.timeout        | 10m0s          | d            | the timeout for import/export storage operations
  cluster.organization        | Cockroach Demo | s            | organization name
  ...
~~~

### Show the values of all cluster settings

{% include copy-clipboard.html %}
~~~ sql
> SHOW ALL CLUSTER SETTINGS;
~~~

~~~
                variable                | value | setting_type | public |                                                   description
----------------------------------------+-------+--------------+--------+-------------------------------------------------------------------------------------------------------------------
  changefeed.experimental_poll_interval | 1s    | d            | false  | polling interval for the table descriptors
  cloudstorage.gs.default.key           |       | s            |  true  | if set, JSON key to use during Google Cloud Storage operations
  cloudstorage.http.custom_ca           |       | s            |  true  | custom root CA (appended to system's default CAs) for verifying certificates when interacting with HTTPS storage
  cloudstorage.timeout                  | 10m0s | d            |  true  | the timeout for import/export storage operations
  ...
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
