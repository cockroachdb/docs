---
title: SHOW ALL
summary: The SHOW ALL statement lists all current run-time settings. 
toc: false
---

The `SHOW ALL` [statement](sql-statements.html) lists all current run-time settings.

<div id="toc"></div>

## Required Privileges

No [privileges](privileges.html) are required to list all current run-time settings.

## Synopsis

{% include sql/diagrams/show_all.html %}

## Example

~~~ sql
> SHOW ALL;
~~~
~~~
+-------------------------------+--------------+
|           Variable            |    Value     |
+-------------------------------+--------------+
| DATABASE                      | bank         |
| DEFAULT_TRANSACTION_ISOLATION | SERIALIZABLE |
| SYNTAX                        | Traditional  |
| TIME ZONE                     | UTC          |
| TRANSACTION ISOLATION LEVEL   | SERIALIZABLE |
| TRANSACTION PRIORITY          | NORMAL       |
+-------------------------------+--------------+
(6 rows)
~~~

## See Also

- [`SET DATABASE`](set-database.html)
- [`SET TIME ZONE`](set-time-zone.html)
- [`SET TRANSACTION`](set-transaction.html)
