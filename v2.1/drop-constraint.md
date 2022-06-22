---
title: DROP CONSTRAINT
summary: Use the ALTER CONSTRAINT statement to remove constraints from columns.
toc: true
---

The `DROP CONSTRAINT` [statement](sql-statements.html) is part of `ALTER TABLE` and removes Check and Foreign Key constraints from columns.

{{site.data.alerts.callout_info}}For information about removing other constraints, see <a href="constraints.html#remove-constraints">Constraints: Remove Constraints</a>.{{site.data.alerts.end}}


## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/drop_constraint.html %} </section>

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the table.

## Parameters

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table with the constraint you want to drop.
 `name` | The name of the constraint you want to drop.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Example

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CONSTRAINTS FROM orders;
~~~
~~~
+--------+---------------------------+-------------+-----------+----------------+
| Table  |           Name            |    Type     | Column(s) |    Details     |
+--------+---------------------------+-------------+-----------+----------------+
| orders | fk_customer_ref_customers | FOREIGN KEY | customer  | customers.[id] |
| orders | primary                   | PRIMARY KEY | id        | NULL           |
+--------+---------------------------+-------------+-----------+----------------+
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE orders DROP CONSTRAINT fk_customer_ref_customers;
~~~
~~~
ALTER TABLE
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CONSTRAINTS FROM orders;
~~~
~~~
+--------+---------+-------------+-----------+---------+
| Table  |  Name   |    Type     | Column(s) | Details |
+--------+---------+-------------+-----------+---------+
| orders | primary | PRIMARY KEY | id        | NULL    |
+--------+---------+-------------+-----------+---------+
~~~

{{site.data.alerts.callout_info}}You cannot drop the <code>primary</code> constraint, which indicates your table's <a href="primary-key.html">Primary Key</a>.{{site.data.alerts.end}}

## See also

- [`DROP COLUMN`](drop-column.html)
- [`DROP INDEX`](drop-index.html)
- [`ALTER TABLE`](alter-table.html)
