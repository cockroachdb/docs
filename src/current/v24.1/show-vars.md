---
title: SHOW &#123;session variable&#125;
summary: The SHOW statement displays the current settings for the client session.
toc: true
docs_area: reference.sql
---

Use the `SHOW` [statement]({% link {{ page.version.version }}/sql-statements.md %}) to display the value of one or all of the session variables. You configure session variables using [`SET`]({% link {{ page.version.version }}/set-vars.md %}).

## Required privileges

No [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) are required to display the session variables.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/show_session.html %}
</div>

{{site.data.alerts.callout_info}}
The `SHOW` statement for session variables is unrelated to the other `SHOW` statements like [`SHOW CLUSTER SETTING`]({% link {{ page.version.version }}/show-cluster-setting.md %}), [`SHOW CREATE`]({% link {{ page.version.version }}/show-create.md %}), and [`SHOW DATABASES`]({% link {{ page.version.version }}/show-databases.md %}).
{{site.data.alerts.end}}

## Parameters

 Parameter | Description
-----------|-------------
`var_name` | The session variable name to show.<br>The variable name is case-insensitive and can be enclosed in double quotes.

### Supported variables

{% include {{ page.version.version }}/misc/session-vars.md %}

For session variables on features in preview, see [Features in Preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}).

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

- [`SET {session variable}`]({% link {{ page.version.version }}/set-vars.md %})
- [Transactions]({% link {{ page.version.version }}/transactions.md %}), including [Priority levels]({% link {{ page.version.version }}/transactions.md %}#transaction-priorities)
- [`SHOW CLUSTER SETTING`]({% link {{ page.version.version }}/show-cluster-setting.md %})
- [`SHOW COLUMNS`]({% link {{ page.version.version }}/show-columns.md %})
- [`SHOW CONSTRAINTS`]({% link {{ page.version.version }}/show-constraints.md %})
- [`SHOW CREATE`]({% link {{ page.version.version }}/show-create.md %})
- [`SHOW DATABASES`]({% link {{ page.version.version }}/show-databases.md %})
- [`SHOW GRANTS`]({% link {{ page.version.version }}/show-grants.md %})
- [`SHOW INDEX`]({% link {{ page.version.version }}/show-index.md %})
- [`SHOW USERS`]({% link {{ page.version.version }}/show-users.md %})
- [`SHOW DEFAULT SESSION VARIABLES FOR ROLE`]({% link {{ page.version.version }}/show-default-session-variables-for-role.md %})
