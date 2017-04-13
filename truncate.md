---
title: TRUNCATE
summary: The TRUNCATE statement deletes all rows from specified tables.
toc: false
---

The `TRUNCATE` [statement](sql-statements.html) deletes all rows from specified tables.

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/truncate.html %}

## Required Privileges

The user must have the `DROP` [privilege](privileges.html) on the table. 

## Parameters

 Parameter | Description 
-----------|------------|
 `table_name` | The [`qualified_name`](sql-grammar.html#qualified_name) of the table you want to truncate. 
`CASCADE` | Drop all objects (such as [constraints](constraints.html) and [views](views.html)) that depend on the table.<br><br>`CASCADE` does not list objects it drops, so should be used cautiously.
`RESTRICT`    | _(Default)_ Do not truncate the table if any objects (such as [constraints](constraints.html) and [views](views.html)) depend on it.


## Example

### Truncate a Table

~~~ sql
> SELECT * FROM tbl;
~~~
~~~
+----+
| id |
+----+
|  1 |
|  2 |
|  3 |
+----+
~~~
~~~ sql
> TRUNCATE tbl;

> SELECT * FROM tbl;
~~~
~~~
+----+
| id |
+----+
+----+
~~~

### Truncate a Table with Dependent Objects

~~~ sql
SELECT * FROM products;
~~~
~~~
+-----+--------------+----------------+
| sku |     upc      |     vendor     |
+-----+--------------+----------------+
| 780 | 885155001450 | Acme Co.       |
| 781 | 867072000006 | Pointsman, LLC |
+-----+--------------+----------------+
~~~
~~~ sql
> SELECT * FROM orders;
~~~
~~~
+----+----------+---------+----------+
| id | shipment | product | customer |
+----+----------+---------+----------+
|  1 |        1 |     780 |        2 |
+----+----------+---------+----------+
~~~
~~~ sql
> TRUNCATE products;
~~~
~~~
pq: "products" is referenced by foreign key from table "orders"
~~~
~~~ sql
> TRUNCATE products CASCADE;
~~~
~~~
TRUNCATE
~~~
~~~ sql
> SELECT * FROM products;
~~~
~~~
+-----+-----+--------+
| sku | upc | vendor |
+-----+-----+--------+
+-----+-----+--------+
~~~
~~~ sql
> SELECT * FROM orders;
~~~
~~~
+----+----------+---------+----------+
| id | shipment | product | customer |
+----+----------+---------+----------+
+----+----------+---------+----------+
~~~
