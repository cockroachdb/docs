---
title: RENAME TABLE
toc: false
---

The `RENAME TABLE` [statement](sql-statements.html) alters the name of a table. It can also be used to move a table from one database to another.

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/rename_table.html %}

## Required Privileges

The user must have the `DROP` [privilege](privileges.html) on the table and the `CREATE` on the parent database. When moving a table from one database to another, the user must have the `CREATE` privilege on both the source and target databases.

## Usage

To rename a table, use the `ALTER TABLE` statement followed by the current table name in `database.table` format, the `RENAME TO` statement, and the new table name in `database.table` format:

~~~ sql
ALTER TABLE db1.table1 RENAME TO db1.table2  
~~~

To avoid an error in case the table does not exist, you can include `IF EXISTS`:

~~~ sql
ALTER TABLE IF EXISTS db1.table1 RENAME TO db1.table2  
~~~

To move a table from one database to another, use the above syntax but specify the source database after `ALTER TABLE` and the target database after `RENAME TO`:

~~~ sql
ALTER TABLE db1.table1 RENAME TO db2.table1  
~~~

## Examples

### Rename a table

~~~ 
SHOW TABLES FROM db1;
+--------+
| Table  |
+--------+
| table1 |
| table2 |
+--------+

ALTER TABLE db1.table1 RENAME TO db1.tablea
RENAME TABLE

SHOW TABLES FROM db1;
+--------+
| Table  |
+--------+
| table2 |
| tablea |
+--------+
~~~

### Move a table

~~~ 
SHOW DATABASES;
+----------+
| Database |
+----------+
| db1      |
| db2      |
| system   |
+----------+

SHOW TABLES FROM db1;
+--------+
| Table  |
+--------+
| table2 |
| tablea |
+--------+

SHOW TABLES FROM db2;
+-------+
| Table |
+-------+
+-------+

ALTER TABLE db1.tablea RENAME TO db2.tablea
RENAME TABLE

SHOW TABLES FROM db1;
+--------+
| Table  |
+--------+
| table2 |
+--------+

SHOW TABLES FROM db2;
+--------+
| Table  |
+--------+
| tablea |
+--------+
~~~

## See Also

- [`CREATE TABLE`](create-table.html)  
- [`ALTER TABLE`](alter-table.html)  
- [`SHOW TABLES`](show-tables.html)  
- [`DROP TABLE`](drop-table.html)  
- [Other SQL Statements](sql-statements.html)
