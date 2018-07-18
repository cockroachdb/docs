---
title: RESET (session variable)
summary: The SET statement resets a session variable to its default value.
toc: true
---

The `RESET` [statement](sql-statements.html) resets a [session variable](set-vars.html) to its default value for the client session.


## Required privileges

No [privileges](privileges.html) are required to reset a session setting.

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/reset_session.html %}</section>

## Parameters

 Parameter | Description 
-----------|-------------
 `session_var` | The name of the [session variable](set-vars.html#supported-variables). 

## Example

{{site.data.alerts.callout_success}}You can use <a href="set-vars.html#reset-a-variable-to-its-default-value"><code>SET .. TO DEFAULT</code></a> to reset a session variable as well.{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql?nofmt
> SET default_transaction_isolation = SNAPSHOT;
~~~

{% include copy-clipboard.html %}
~~~ sql?nofmt
> SHOW default_transaction_isolation;
~~~

~~~
+-------------------------------+
| default_transaction_isolation |
+-------------------------------+
| SNAPSHOT                      |
+-------------------------------+
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql?nofmt
> RESET default_transaction_isolation;
~~~

{% include copy-clipboard.html %}
~~~ sql?nofmt
> SHOW default_transaction_isolation;
~~~

~~~
+-------------------------------+
| default_transaction_isolation |
+-------------------------------+
| SERIALIZABLE                  |
+-------------------------------+
(1 row)
~~~

## See also

- [`SET` (session variable)](set-vars.html)
- [`SHOW` (session variables)](show-vars.html)
