---
title: SET APPLICATION_NAME
summary: The SET APPLICATION_NAME statement sets the application name for the current session.
toc: false
---

The `SET APPLICATION_NAME` [statement](sql-statements.html) sets the application name for the current session. This is a write-only variable that is used by some SQL frameworks, such as SQL Workbench/J, to improve query logging on the server. 

{{site.data.alerts.callout_danger}}In some cases, client drivers can drop and restart the connection to the server. When this happens, any session configurations made with <code>SET</code> statements are lost. It's therefore more reliable to set the application name in the client's connection string.{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/set_application_name.html %}

## Required Privileges

No [privileges](privileges.html) are required to set the default application name. 

## Example

~~~ shell
$ cockroach sql
# Welcome to the cockroach SQL interface.
# All statements must be terminated by a semicolon.
# To exit: CTRL + D.
~~~

~~~ sql
> SET APPLICATION_NAME = your_app;
~~~

~~~
SET
~~~

## See Also

- [`SET DATABASE`](set-database.html)
- [`SET TIME ZONE`](set-time-zone.html)
- [`SET TRANSACTION`](set-transaction.html)
 