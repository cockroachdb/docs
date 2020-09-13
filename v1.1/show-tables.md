---
title: SHOW TABLES
summary: The SHOW TABLES statement lists the tables in a database.
keywords: reflection
toc: true
---

The `SHOW TABLES` [statement](sql-statements.html) lists the tables in a database. Tables can be standard tables as well as virtual tables representing [views](views.html).

{{site.data.alerts.callout_info}}While a table is being <a href="drop-table.html">dropped</a>, <code>SHOW TABLES</code> will list the table with a <code>(dropped)</code> suffix.{{site.data.alerts.end}}


## Synopsis

{% include {{ page.version.version }}/sql/diagrams/show_tables.html %}

## Required Privileges

No [privileges](privileges.html) are required to list the tables in a database.

## Parameters

Parameter | Description
----------|------------
`name` | The name of the database for which to show tables. This is optional when showing tables in the default database.

## Examples

### Show tables in the default database

This example assumes that the `bank` database has been set as the default database for the session, either via the [`SET`](set-vars.html) statement or in the client's connection string.

~~~ sql
> SHOW TABLES;
~~~

~~~
+---------------+
|     Table     |
+---------------+
| accounts      |
| user_accounts |
+---------------+
(2 rows)
~~~

### Show tables in a non-default database 

~~~ sql
> SHOW TABLES FROM startrek;
~~~

~~~
+-------------------+
|       Table       |
+-------------------+
| episodes          |
| quotes            |
| quotes_per_season |
+-------------------+
(3 rows)
~~~

## See Also

- [`CREATE TABLE`](create-table.html)
- [`CREATE VIEW`](create-view.html)
- [Information Schema](information-schema.html)
