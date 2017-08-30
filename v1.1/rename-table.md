---
title: RENAME TABLE
summary: The RENAME TABLE statement changes the name of a table.
toc: false
---

The `RENAME TABLE` [statement](sql-statements.html) changes the name of a table. It can also be used to move a table from one database to another.

{{site.data.alerts.callout_info}}It is not possible to rename a table referenced by a view. For more details, see <a href="views.html#view-dependencies">View Dependencies</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Required Privileges

The user must have the `DROP` [privilege](privileges.html) on the table and the `CREATE` on the parent database. When moving a table from one database to another, the user must have the `CREATE` privilege on both the source and target databases.

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/rename_table.html %}

## Parameters

| Parameter | Description |
|-----------|-------------|
| `IF EXISTS` | Rename the table only if a table with the current name exists; if one does not exist, do not return an error. |
| `current_name` | The current name of the table. |
| `new_name` | The new name of the table, which must be unique within its database and follow these [identifier rules](keywords-and-identifiers.html#identifiers). When the parent database is not set as the default, the name must be formatted as `database.name`.<br><br>The [`UPSERT`](upsert.html) and [`INSERT ON CONFLICT`](insert.html) statements use a temporary table called `excluded` to handle uniqueness conflicts during execution. It's therefore not recommended to use the name `excluded` for any of your tables. |

## Viewing Schema Changes

{% include custom/schema-change-view-job.md %}

## Examples

### Rename a table

~~~ sql
> SHOW TABLES FROM db1;
~~~
~~~
+--------+
| Table  |
+--------+
| table1 |
| table2 |
+--------+
~~~
~~~ sql
> ALTER TABLE db1.table1 RENAME TO db1.tablea
~~~
~~~ sql
> SHOW TABLES FROM db1;
~~~
~~~
+--------+
| Table  |
+--------+
| table2 |
| tablea |
+--------+
~~~

To avoid an error in case the table does not exist, you can include `IF EXISTS`:

~~~ sql
> ALTER TABLE IF EXISTS db1.table1 RENAME TO db1.table2;
~~~

### Move a table

To move a table from one database to another, use the above syntax but specify the source database after `ALTER TABLE` and the target database after `RENAME TO`:

~~~ sql 
> SHOW DATABASES;
~~~
~~~
+----------+
| Database |
+----------+
| db1      |
| db2      |
| system   |
+----------+
~~~
~~~ sql
> SHOW TABLES FROM db1;
~~~
~~~
+--------+
| Table  |
+--------+
| table2 |
| tablea |
+--------+
~~~
~~~ sql
> SHOW TABLES FROM db2;
~~~
~~~
+-------+
| Table |
+-------+
+-------+
~~~
~~~ sql
> ALTER TABLE db1.tablea RENAME TO db2.tablea
~~~
~~~ sql
> SHOW TABLES FROM db1;
~~~
~~~
+--------+
| Table  |
+--------+
| table2 |
+--------+
~~~
~~~ sql
> SHOW TABLES FROM db2;
~~~
~~~
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
