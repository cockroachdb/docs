---
title: DROP TABLE
summary: The DROP TABLE statement removes a table and all its indexes from a database.
toc: false
---

The `DROP TABLE` [statement](sql-statements.html) removes a table and all its indexes from a database. 

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/drop_table.html %}

## Required Privileges

The user must have the `DROP` [privilege](privileges.html) on the table. 

## Usage

To remove one or more tables from a database, use the `DROP TABLE` statement followed by a comma-separated list of table names, each in `database.table` format:

~~~ sql
> DROP TABLE db1.table1, db1.table2;
~~~

To avoid an error in case one or more of the tables do not exist, you can include `IF EXISTS`:

~~~ sql
> DROP TABLE IF EXISTS db1.table1, db1.table2;
~~~

## Example

~~~ sql
> SHOW TABLES FROM db1;
~~~
~~~
+--------+
| Table  |
+--------+
| table1 |
| table2 |
| table3 |
+--------+
~~~
~~~ sql
> DROP TABLE db1.table1, db1.table2;

> SHOW TABLES FROM db1;
~~~
~~~
+--------+
| Table  |
+--------+
| table3 |
+--------+
~~~

## See Also

- [`ALTER TABLE`](alter-table.html)
- [`CREATE TABLE`](create-table.html)
- [`INSERT`](insert.html)
- [`RENAME TABLE`](rename-table.html)
- [`SHOW COLUMNS`](show-columns.html)
- [`SHOW TABLES`](show-tables.html)
- [`UPDATE`](update.html)
- [Other SQL Statements](sql-statements.html)
