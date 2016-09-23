---
title: SHOW TIME ZONE
summary: The SHOW TIME ZONE statement lists the default time zone for the current session.
keywords: reflection
toc: false
---

The `SHOW TIME ZONE` [statement](sql-statements.html) lists the default time zone for the current session.

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/show_timezone.html %}

## Required Privileges

No [privileges](privileges.html) are required to view the default time zone.

## Examples

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

- [`SET TIME ZONE`](set-time-zone.html)
- [`TIMESTAMP`](timestamp.html)
- [`DATE`](date.html)
