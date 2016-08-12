---
title: TRUNCATE
summany: The TRUNCATE statement deletes all rows from a table.
toc: false
---

The `TRUNCATE` [statement](sql-statements.html) deletes all rows from a table.

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/truncate.html %}

## Required Privileges

The user must have the `DROP` [privilege](privileges.html) on the table. 

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_name` | The [`qualified_name`](sql-grammar.html#qualified_name) of the table you want to truncate. |

## Example

~~~sql
> SELECT * FROM tbl;
+----+
| id |
+----+
|  1 |
|  2 |
|  3 |
+----+

> TRUNCATE tbl;
TRUNCATE

> SELECT * FROM tbl;
+----+
| id |
+----+
+----+
~~~
