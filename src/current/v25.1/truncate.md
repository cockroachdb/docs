---
title: TRUNCATE
summary: The TRUNCATE statement deletes all rows from specified tables.
toc: true
docs_area: reference.sql
---

The `TRUNCATE` [statement]({{ page.version.version }}/sql-statements.md) removes all rows from a table. At a high level, it works by dropping the table and recreating a new table with the same name.


`TRUNCATE` is a schema change, and as such is not transactional. For more information about how schema changes work, see [Online Schema Changes]({{ page.version.version }}/online-schema-changes.md).

## Synopsis

<div>
</div>

## Required privileges

The user must have the `DROP` [privilege]({{ page.version.version }}/security-reference/authorization.md#managing-privileges) on the table.

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table to truncate.
`CASCADE` | Truncate all tables with [Foreign Key]({{ page.version.version }}/foreign-key.md) dependencies on the table being truncated.<br><br>`CASCADE` does not list dependent tables it truncates, so should be used cautiously.
`RESTRICT`    | _(Default)_ Do not truncate the table if any other tables have [Foreign Key]({{ page.version.version }}/foreign-key.md) dependencies on it.

## Viewing schema changes


## Examples

### Truncate a table (no foreign key dependencies)

~~~ sql
> SELECT * FROM t1;
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
> TRUNCATE t1;
~~~

~~~ sql
> SELECT * FROM t1;
~~~

~~~
+----+------+
| id | name |
+----+------+
+----+------+
(0 rows)
~~~

### Truncate a table and dependent tables

In these examples, the `orders` table has a [Foreign Key]({{ page.version.version }}/foreign-key.md) relationship to the `customers` table. Therefore, it's only possible to truncate the `customers` table while simultaneously truncating the dependent `orders` table, either using `CASCADE` or explicitly.

#### Truncate dependent tables using `CASCADE`

{{site.data.alerts.callout_danger}}<code>CASCADE</code> truncates <em>all</em> dependent tables without listing them, which can lead to inadvertent and difficult-to-recover losses. To avoid potential harm, we recommend truncating tables explicitly in most cases. See <a href="#truncate-dependent-tables-explicitly">Truncate Dependent Tables Explicitly</a> for more details.{{site.data.alerts.end}}

~~~ sql
> TRUNCATE customers;
~~~

~~~
pq: "customers" is referenced by foreign key from table "orders"
~~~

~~~ sql
> TRUNCATE customers CASCADE;
~~~

~~~ sql
> SELECT * FROM customers;
~~~

~~~
+----+-------+
| id | email |
+----+-------+
+----+-------+
(0 rows)
~~~

~~~ sql
> SELECT * FROM orders;
~~~

~~~
+----+----------+------------+
| id | customer | orderTotal |
+----+----------+------------+
+----+----------+------------+
(0 rows)
~~~

#### Truncate dependent tables explicitly

~~~ sql
> TRUNCATE customers, orders;
~~~

~~~ sql
> SELECT * FROM customers;
~~~

~~~
+----+-------+
| id | email |
+----+-------+
+----+-------+
(0 rows)
~~~

~~~ sql
> SELECT * FROM orders;
~~~

~~~
+----+----------+------------+
| id | customer | orderTotal |
+----+----------+------------+
+----+----------+------------+
(0 rows)
~~~

## See also

- [`DELETE`]({{ page.version.version }}/delete.md)
- [`SHOW JOBS`]({{ page.version.version }}/show-jobs.md)
- [Foreign Key constraint]({{ page.version.version }}/foreign-key.md)
- [Online Schema Changes]({{ page.version.version }}/online-schema-changes.md)