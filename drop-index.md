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

## Usage

To remove an index from a CockroachDB database, use the `DROP INDEX` statement followed by a table@index_name:

~~~ sql
DROP INDEX table@index_name
~~~

To avoid error in case the index does not exist, you can include `IF EXISTS`:

~~~ sql
DROP INDEX IF EXISTS table@index_name
~~~

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
