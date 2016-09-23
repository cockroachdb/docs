---
title: SET TIME ZONE
summary: The SET TIME ZONE statement sets the default time zone for the current session.
toc: false
---

The `SET TIME ZONE` [statement](sql-statements.html) sets the default time zone for the current session.  

{{site.data.alerts.callout_danger}}In some cases, client drivers can drop and restart the connection to the server. When this happens, any session configurations made with <code>SET</code> statements are lost. It's therefore more reliable to set the time zone as an explicit part of a <a href="timestamp.html"><code>TIMESTAMP</code></a> or <a href="timestamp.html"><code>TIMESTAMPTZ</code></a> value.{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/set_time_zone.html %}

## Required Privileges

No [privileges](privileges.html) are required to set the default time zone.

## Parameters

Parameter | Description
----------|------------
`zone_value` | The time zone for the current session.<br><br>This value can be a string representation of a local system-defined time zone (e.g., `'EST'`, `'America/New_York'`) or the keywords `DEFAULT` or `LOCAL`, both of which are equivalent to `UTC`. Also, once [issue 9558](https://github.com/cockroachdb/cockroach/issues/9558) is resolved, it will be possible to set the session time zone as a positive or negative offset from UTC (e.g., `-7`, `+7` ).

## Examples

### Set the time zone as part of a `TIMESTAMP` value (recommended)

~~~ sql
> CREATE TABLE timestamps (a INT PRIMARY KEY, b TIMESTAMPTZ);
> INSERT INTO timestamps VALUES (1, TIMESTAMPTZ '2016-03-26 10:10:10-05:00');
> SELECT * FROM timestamps;
~~~
~~~
+------+---------------------------------+
|  a   |                b                |
+------+---------------------------------+
|  1   | 2016-03-26 15:10:10 +0000 +0000 |
+------+---------------------------------+
# Note that the timestamp returned is UTC-05:00, which is the equivalent of EST.
~~~

### Set the default time zone via `SET TIME ZONE`

~~~ sql
> SET TIME ZONE 'EST';
> SHOW TIME ZONE;
~~~
~~~ shell
+-----------+
| TIME ZONE |
+-----------+
| EST       |
+-----------+
(1 row)
~~~
~~~ sql
> SET TIME ZONE DEFAULT;
> SHOW TIME ZONE;
~~~
~~~ shell
+-----------+
| TIME ZONE |
+-----------+
| UTC       |
+-----------+
(1 row)
~~~

## See Also

- [`SHOW TIME ZONE`](show-time-zone.html)
- [`TIMESTAMP`](timestamp.html)
- [`DATE`](date.html)
