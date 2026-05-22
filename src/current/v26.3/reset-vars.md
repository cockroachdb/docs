---
title: RESET &#123;session variable&#125;
summary: The SET statement resets a session variable to its default value.
toc: true
docs_area: reference.sql
---

The `RESET` [statement]({% link {{ page.version.version }}/sql-statements.md %}) resets a [session variable]({% link {{ page.version.version }}/set-vars.md %}) to its default value for the client session.

## Required privileges

No [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) are required to reset a session setting.

## Synopsis

<div>{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/reset_session.html %}</div>

## Parameters

 Parameter | Description
-----------|-------------
 `session_var` | The name of the [session variable]({% link {{ page.version.version }}/set-vars.md %}#supported-variables).

## Example

{{site.data.alerts.callout_success}}You can use <a href="{% link {{ page.version.version }}/set-vars.md %}#reset-a-variable-to-its-default-value"><code>SET .. TO DEFAULT</code></a> to reset a session variable as well.{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> SET extra_float_digits = -10;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW extra_float_digits;
~~~

~~~
 extra_float_digits
--------------------
 -10
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT random();
~~~

~~~
 random
---------
 0.20286
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> RESET extra_float_digits;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW extra_float_digits;
~~~

~~~
 extra_float_digits
--------------------
 0
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT random();
~~~

~~~
      random
-------------------
 0.561354028296755
(1 row)
~~~

## Known Limitations

{% include {{page.version.version}}/known-limitations/set-transaction-no-rollback.md %}

## See also

- [`SET {session variable}`]({% link {{ page.version.version }}/set-vars.md %})
- [`SHOW {session variable}`]({% link {{ page.version.version }}/show-vars.md %})
- [`SHOW DEFAULT SESSION VARIABLES FOR ROLE`]({% link {{ page.version.version }}/show-default-session-variables-for-role.md %})
