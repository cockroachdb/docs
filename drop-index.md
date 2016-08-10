---
title: DROP INDEX
summary: The DROP INDEX statement removes indexes from tables.
toc: false
---

The `DROP INDEX` [statement](sql-statements.html) removes indexes from tables.

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/drop_index.html %}

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on each specified table.


## Parameters

| Parameter | Description |
|-----------|-------------|
| `IF EXISTS`	| Drop the named indexes if they exist; if they do not exist, do not return an error.|
| `table_name`	| The name of the table with the index you want to drop. Find table names with [`SHOW TABLES`](show-tables.html).|
| `index_name`	| The name of the index you want to drop. Find index names with [`SHOW INDEX`](show-index.html).<br/><br/>You cannot drop a table's `primary` index.|
| `CASCADE`	| Drop all objects (such as [constraints](constraints.html)) that depend on the indexes.|
| `RESTRICT`	| _(Default)_ Do not drop the indexes if any objects (such as [constraints](constraints.html)) depend on them.|

## Example

~~~
> SHOW INDEX FROM tbl;
+-------+------------+--------+-----+--------+-----------+---------+
| Table |    Name    | Unique | Seq | Column | Direction | Storing |
+-------+------------+--------+-----+--------+-----------+---------+
| tbl   | primary    | true   |   1 | id     | ASC       | false   |
| tbl   | index_name | false  |   1 | name   | ASC       | false   |
+-------+------------+--------+-----+--------+-----------+---------+

> DROP INDEX tbl@index_name;

> SHOW INDEX FROM tbl;
+-------+---------+--------+-----+--------+-----------+---------+
| Table |  Name   | Unique | Seq | Column | Direction | Storing |
+-------+---------+--------+-----+--------+-----------+---------+
| tbl   | primary | true   |   1 | id     | ASC       | false   |
+-------+---------+--------+-----+--------+-----------+---------+
~~~
