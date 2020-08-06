---
title: SHOW (session settings)
summary: The SHOW statement displays the current settings for the client session.
toc: true
redirect_from:
- show-all.html
- show-transaction.html
- show-time-zone.html
---

The `SHOW` [statement](sql-statements.html) can display the value of either one or all of
the session setting variables. Some of these can also be configured via [`SET`](set-vars.html).

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to display the session settings.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/show_var.html %}
</div>

{{site.data.alerts.callout_info}}The <code>SHOW</code> statement for session settings is unrelated to the other <code>SHOW</code> statements: <a href="cluster-settings.html#view-current-cluster-settings"><code>SHOW CLUSTER SETTING</code></a>, <a href="show-create.html"><code>SHOW CREATE</code></a>, <a href="show-users.html"><code>SHOW USERS</code></a>, <a href="show-databases.html"><code>SHOW DATABASES</code></a>, <a href="show-columns.html"><code>SHOW COLUMNS</code></a>, <a href="show-grants.html"><code>SHOW GRANTS</code></a>, and <a href="show-constraints.html"><code>SHOW CONSTRAINTS</code></a>.{{site.data.alerts.end}}

## Parameters

The `SHOW <session variable>` statement accepts a single parameter: the variable name.

The variable name is case insensitive. It may be enclosed in double quotes; this is useful if the variable name itself contains spaces.

### Supported variables

{% include {{ page.version.version }}/misc/session-vars.html %}

For session variables on experimental features, see [Experimental Features](experimental-features.html).

Special syntax cases supported for compatibility:

 Syntax | Equivalent to
--------|---------------
 `SHOW TRANSACTION PRIORITY` | `SHOW "transaction priority"`
 `SHOW TRANSACTION ISOLATION LEVEL` | `SHOW "transaction isolation level"`
 `SHOW TIME ZONE` | `SHOW "timezone"`
 `SHOW TRANSACTION STATUS` | `SHOW "transaction status"`

## Examples

### Showing the value of a single session variable

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASE;
~~~

~~~
  database
------------
  movr
(1 row)
~~~

### Showing the value of all session variables

{% include copy-clipboard.html %}
~~~ sql
> SHOW ALL;
~~~

~~~
       variable       |      value
----------------------+-------------------
  application_name    | $ cockroach demo
  bytea_output        | hex
  client_encoding     | UTF8
  client_min_messages | notice
...
~~~

## See also

- [`SET` (session variable)](set-vars.html)
- [Transactions](transactions.html), including [Priority levels](transactions.html#transaction-priorities)
- [`SHOW CLUSTER SETTING`](show-cluster-setting.html)
- [`SHOW COLUMNS`](show-columns.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`SHOW CREATE`](show-create.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW INDEX`](show-index.html)
- [`SHOW USERS`](show-users.html)
