---
title: SHOW &#123;session variable&#125;
summary: The SHOW statement displays the current settings for the client session.
toc: true
docs_area: reference.sql
---

THIS IS A TEST.  DO NOT MERGE ME.  I AM A TEST.

Use the `SHOW` [statement](sql-statements.html) to display the value of one or all of the session variables. You configure session variables using [`SET`](set-vars.html).

## Required privileges

No [privileges](security-reference/authorization.html#managing-privileges) are required to display the session variables.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_session.html %}
</div>

{{site.data.alerts.callout_info}}
The `SHOW` statement for session variables is unrelated to the other `SHOW` statements like [`SHOW CLUSTER SETTING`](show-cluster-setting.html), [`SHOW CREATE`](show-create.html), and [`SHOW DATABASES`](show-databases.html).
{{site.data.alerts.end}}

## Parameters

 Parameter | Description
-----------|-------------
`var_name` | The session variable name to show.<br>The variable name is case-insensitive and can be enclosed in double quotes.

### Supported variables

{% include {{ page.version.version }}/misc/session-vars.md %}

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

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

- [`SET {session variable}`](set-vars.html)
- [Transactions](transactions.html), including [Priority levels](transactions.html#transaction-priorities)
- [`SHOW CLUSTER SETTING`](show-cluster-setting.html)
- [`SHOW COLUMNS`](show-columns.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`SHOW CREATE`](show-create.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW INDEX`](show-index.html)
- [`SHOW USERS`](show-users.html)
