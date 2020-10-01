---
title: TRUNCATE
summary: The TRUNCATE statement deletes all rows from specified tables.
toc: true
---

The `TRUNCATE` [statement](sql-statements.html) removes all rows from a table. At a high level, it works by dropping the table and recreating a new table with the same name.

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/truncate.html %}
</div>

## Required privileges

The user must have the `DROP` [privilege](authorization.html#assign-privileges) on the table.

## Parameters

Parameter | Description
----------|------------
`table_name` | The name of the table to truncate.
`CASCADE` | Truncate all tables with [Foreign Key](foreign-key.html) dependencies on the table being truncated.<br><br>`CASCADE` does not list dependent tables it truncates, so should be used cautiously.
`RESTRICT`    | _(Default)_ Do not truncate the table if any other tables have [Foreign Key](foreign-key.html) dependencies on it.

## Limitations

`TRUNCATE` is a schema change, and as such is not transactional. For more information about how schema changes work, see [Online Schema Changes](online-schema-changes.html).

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

### Truncate a table (no foreign key dependencies)

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> TRUNCATE t1;
~~~

{% include copy-clipboard.html %}
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

In these examples, the `orders` table has a [Foreign Key](foreign-key.html) relationship to the `customers` table. Therefore, it's only possible to truncate the `customers` table while simultaneously truncating the dependent `orders` table, either using `CASCADE` or explicitly.

#### Truncate dependent tables using `CASCADE`

{{site.data.alerts.callout_danger}}<code>CASCADE</code> truncates <em>all</em> dependent tables without listing them, which can lead to inadvertent and difficult-to-recover losses. To avoid potential harm, we recommend truncating tables explicitly in most cases. See <a href="#truncate-dependent-tables-explicitly">Truncate Dependent Tables Explicitly</a> for more details.{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> TRUNCATE customers;
~~~

~~~
pq: "customers" is referenced by foreign key from table "orders"
~~~

{% include copy-clipboard.html %}
~~~ sql
> TRUNCATE customers CASCADE;
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
~~~ sql
> TRUNCATE customers, orders;
~~~

{% include copy-clipboard.html %}
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

{% include copy-clipboard.html %}
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

- [`DELETE`](delete.html)
- [`SHOW JOBS`](show-jobs.html)
- [Foreign Key constraint](foreign-key.html)
- [Online Schema Changes](online-schema-changes.html)
