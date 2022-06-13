---
title: RESET &#123;session variable&#125;
summary: The SET statement resets a session variable to its default value.
toc: true
docs_area: reference.sql
---

The `RESET` [statement](sql-statements.html) resets a [session variable](set-vars.html) to its default value for the client session.


## Required privileges

No [privileges](security-reference/authorization.html#managing-privileges) are required to reset a session setting.

## Synopsis

<div>{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/reset_session.html %}</div>

## Parameters

 Parameter | Description
-----------|-------------
 `session_var` | The name of the [session variable](set-vars.html#supported-variables).

## Example

{{site.data.alerts.callout_success}}You can use <a href="set-vars.html#reset-a-variable-to-its-default-value"><code>SET .. TO DEFAULT</code></a> to reset a session variable as well.{{site.data.alerts.end}}

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

## See also

- [`SET {session variable}`](set-vars.html)
- [`SHOW {session variable}`](show-vars.html)
