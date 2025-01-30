---
title: RESET &#123;session variable&#125;
summary: The SET statement resets a session variable to its default value.
toc: true
docs_area: reference.sql
---

The `RESET` [statement]({{ page.version.version }}/sql-statements.md) resets a [session variable]({{ page.version.version }}/set-vars.md) to its default value for the client session.

## Required privileges

No [privileges]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) are required to reset a session setting.

## Synopsis


## Parameters

 Parameter | Description
-----------|-------------
 `session_var` | The name of the [session variable]({{ page.version.version }}/set-vars.md#supported-variables).

## Example

{{site.data.alerts.callout_success}}You can use <a href="{{ page.version.version }}/set-vars.md#reset-a-variable-to-its-default-value"><code>SET .. TO DEFAULT</code></a> to reset a session variable as well.{{site.data.alerts.end}}

~~~ sql
> SET extra_float_digits = -10;
~~~

~~~ sql
> SHOW extra_float_digits;
~~~

~~~
 extra_float_digits
--------------------
 -10
(1 row)
~~~

~~~ sql
> SELECT random();
~~~

~~~
 random
---------
 0.20286
(1 row)
~~~

~~~ sql
> RESET extra_float_digits;
~~~

~~~ sql
> SHOW extra_float_digits;
~~~

~~~
 extra_float_digits
--------------------
 0
(1 row)
~~~

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

- [`SET {session variable}`]({{ page.version.version }}/set-vars.md)
- [`SHOW {session variable}`]({{ page.version.version }}/show-vars.md)
- [`SHOW DEFAULT SESSION VARIABLES FOR ROLE`]({{ page.version.version }}/show-default-session-variables-for-role.md)