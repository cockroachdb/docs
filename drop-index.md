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
| `CASCADE`	| Drop all objects (such as [constraints](constraints.html)) that depend on the indexes.<br><br>`CASCADE` does not list objects it drops, so should be used cautiously.|
| `RESTRICT`	| _(Default)_ Do not drop the indexes if any objects (such as [constraints](constraints.html)) depend on them.|

## Examples

### Remove an Index
~~~ sql
> SHOW INDEX FROM tbl;
~~~
~~~ 
+-------+------------+--------+-----+--------+-----------+---------+
| Table |    Name    | Unique | Seq | Column | Direction | Storing |
+-------+------------+--------+-----+--------+-----------+---------+
| tbl   | primary    | true   |   1 | id     | ASC       | false   |
| tbl   | index_name | false  |   1 | name   | ASC       | false   |
+-------+------------+--------+-----+--------+-----------+---------+
~~~
~~~ sql
> DROP INDEX tbl@index_name;

> SHOW INDEX FROM tbl;
~~~
~~~ 
+-------+---------+--------+-----+--------+-----------+---------+
| Table |  Name   | Unique | Seq | Column | Direction | Storing |
+-------+---------+--------+-----+--------+-----------+---------+
| tbl   | primary | true   |   1 | id     | ASC       | false   |
+-------+---------+--------+-----+--------+-----------+---------+
~~~

### Remove Dependent Objects with `CASCADE`

{{site.data.alerts.callout_danger}}<code>CASCADE</code> drops <em>all</em> dependent objects without listing them, which can lead to inadvertent and difficult-to-recover losses. To avoid potential harm, we recommend dropping objects individually in most cases.{{site.data.alerts.end}}

~~~ sql
> SHOW INDEX FROM orders;
~~~
~~~ 
+--------+---------------------+--------+-----+----------+-----------+---------+
| Table  |        Name         | Unique | Seq |  Column  | Direction | Storing |
+--------+---------------------+--------+-----+----------+-----------+---------+
| orders | primary             | true   |   1 | id       | ASC       | false   |
| orders | orders_customer_idx | false  |   1 | customer | ASC       | false   |
+--------+---------------------+--------+-----+----------+-----------+---------+
~~~
~~~ sql
> DROP INDEX orders@orders_customer_idx;
~~~
~~~ 
pq: index "orders_customer_idx" is in use as a foreign key constraint
~~~
~~~ sql
> SHOW CONSTRAINTS FROM orders;
~~~
~~~
+--------+---------------------------+-------------+------------+----------------+
| Table  |           Name            |    Type     | Column(s)  |    Details     |
+--------+---------------------------+-------------+------------+----------------+
| orders | fk_customer_ref_customers | FOREIGN KEY | [customer] | customers.[id] |
| orders | primary                   | PRIMARY KEY | [id]       | NULL           |
+--------+---------------------------+-------------+------------+----------------+
~~~
~~~ sql
> DROP INDEX orders@orders_customer_idx CASCADE;

> SHOW CONSTRAINTS FROM orders;
~~~
~~~
+--------+---------+-------------+-----------+---------+
| Table  |  Name   |    Type     | Column(s) | Details |
+--------+---------+-------------+-----------+---------+
| orders | primary | PRIMARY KEY | [id]      | NULL    |
+--------+---------+-------------+-----------+---------+
~~~
