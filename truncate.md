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
----------|------------
`table_name` | The [`qualified_name`](sql-grammar.html#qualified_name) of the table you want to truncate.
`CASCADE` | Truncate all tables with [Foreign Key](foreign-key.html) dependencies on the table being truncated.<br><br>`CASCADE` does not list dependent tables it truncates, so should be used cautiously.
`RESTRICT`    | _(Default)_ Do not truncate the table if any other tables have [Foreign Key](foreign-key.html) dependencies on it.

## Examples

### Truncate a Table (No Foreign Key Dependencies)

~~~ sql
> SELECT * FROM tl;
~~~

~~~
+----+------+
| id | name |
+----+------+
|  1 | foo  |
|  2 | bar  |
+----+------+
(2 rows)
~~~

~~~ sql
> TRUNCATE tl;

> SELECT * FROM tl;
~~~

~~~
+----+------+
| id | name |
+----+------+
+----+------+
(0 rows)
~~~

### Truncate a Table and Dependent Tables with `CASCADE`

In this example, the `orders` table has a Foreign Key relationship to the `customers` table. Therefore, it's only possible to truncate the `customers` table while simultaneously truncating the dependent `orders` table using `CASCADE`.

{{site.data.alerts.callout_danger}}<code>CASCADE</code> truncates <em>all</em> dependent tables without listing them, which can lead to inadvertent and difficult-to-recover losses. To avoid potential harm, we recommend truncating tables individually in most cases.{{site.data.alerts.end}}

~~~ sql
> SHOW TABLES FROM test;
~~~

~~~
+-----------+
|   Table   |
+-----------+
| customers |
| orders    |
+-----------+
(2 rows)
~~~

~~~ sql
> TRUNCATE test.customers;
~~~

~~~
pq: "customers" is referenced by foreign key from table "orders"
~~~

~~~sql
> TRUNCATE test.customers CASCADE;
~~~

~~~
TRUNCATE
~~~

~~~ sql
> SELECT * FROM test.customers;
~~~

~~~
+----+-------+
| id | email |
+----+-------+
+----+-------+
(0 rows)
~~~

~~~ sql
> SELECT * FROM test.orders;
~~~

~~~
+----+----------+------------+
| id | customer | orderTotal |
+----+----------+------------+
+----+----------+------------+
(0 rows)
~~~

## See Also

- [`DELETE](delete.html)
- [Foreign Key constraint](foreign-key.html)
