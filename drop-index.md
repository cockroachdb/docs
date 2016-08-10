---
title: DROP INDEX
summary: The DROP INDEX statement removes an index from a table.
toc: false
---

The `DROP INDEX` [statement](sql-statements.html) removes an index from a table.

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/drop_index.html %}

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the table.


## Parameters

| Parameter | Description |
|-----------|-------------|
| IF EXISTS | avoid error in case index does not exist |
| table_name_with_index_list | $table@$index_name|
| CASCADE   | delete interleaved rows if a parent is deleted |
| RESTRICT  | allow removal of parent rows with no interleaved rows, but will error if interleaved rows would be orphaned |


## Example

~~~
> SHOW INDEX FROM table;
+----------+-------------------+--------+-----+--------+-----------+---------+
|  Table   |       Name        | Unique | Seq | Column | Direction | Storing |
+----------+-------------------+--------+-----+--------+-----------+---------+
| table    | primary           | true   |   1 | name   | ASC       | false   |
| table    | index_name        | true   |   1 | name   | ASC       | false   |
+----------+-------------------+--------+-----+--------+-----------+---------+


> DROP INDEX table@index_name;

> SHOW INDEX FROM table;
+----------+-------------------+--------+-----+--------+-----------+---------+
|  Table   |       Name        | Unique | Seq | Column | Direction | Storing |
+----------+-------------------+--------+-----+--------+-----------+---------+
| table    | primary           | true   |   1 | name   | ASC       | false   |
+----------+-------------------+--------+-----+--------+-----------+---------+

~~~
