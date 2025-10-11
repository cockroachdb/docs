---
title: DROP INDEX
summary: The DROP INDEX statement removes indexes from tables.
toc: true
---

The `DROP INDEX` [statement](sql-statements.html) removes indexes from tables.

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/drop_index.html %}</section>

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on each specified table.

## Parameters

 Parameter | Description
-----------|-------------
 `IF EXISTS`	| Drop the named indexes if they exist; if they do not exist, do not return an error.
 `table_name`	| The name of the table with the index you want to drop. Find table names with [`SHOW TABLES`](show-tables.html).
 `index_name`	| The name of the index you want to drop. Find index names with [`SHOW INDEX`](show-index.html).<br/><br/>You cannot drop a table's `primary` index.
 `CASCADE`	| Drop all objects (such as [constraints](constraints.html)) that depend on the indexes. `CASCADE` does not list objects it drops, so should be used cautiously.<br><br> To drop an index created with [`CREATE UNIQUE INDEX`](create-index.html#unique-indexes), you do not need to use `CASCADE`.
 `RESTRICT`	| _(Default)_ Do not drop the indexes if any objects (such as [constraints](constraints.html)) depend on them.
 `CONCURRENTLY` | <span class="version-tag">New in v20.1:</span> Optional, no-op syntax for PostgreSQL compatibility. All indexes are dropped concurrently in CockroachDB.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

### Remove an index (no dependencies)

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM tl;
~~~

~~~
+------------+-------------+------------+--------------+-------------+-----------+---------+----------+
| table_name | index_name  | non_unique | seq_in_index | column_name | direction | storing | implicit |
+------------+-------------+------------+--------------+-------------+-----------+---------+----------+
| t1         | primary     |   false    |            1 | id          | ASC       |  false  |  false   |
| t1         | t1_name_idx |    true    |            1 | name        | ASC       |  false  |  false   |
| t1         | t1_name_idx |    true    |            2 | id          | ASC       |  false  |   true   |
+------------+-------------+------------+--------------+-------------+-----------+---------+----------+
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP INDEX t1@t1_name_idx;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM tbl;
~~~

~~~
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
| table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit |
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
| t1         | primary    |   false    |            1 | id          | ASC       |  false  |  false   |
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
(1 row)
~~~

### Remove an index and dependent objects with `CASCADE`

{{site.data.alerts.callout_danger}}<code>CASCADE</code> drops <em>all</em> dependent objects without listing them, which can lead to inadvertent and difficult-to-recover losses. To avoid potential harm, we recommend dropping objects individually in most cases.{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM orders;
~~~

~~~
+------------+---------------------------------------------+------------+--------------+-------------+-----------+---------+----------+
| table_name |                 index_name                  | non_unique | seq_in_index | column_name | direction | storing | implicit |
+------------+---------------------------------------------+------------+--------------+-------------+-----------+---------+----------+
| orders     | primary                                     |   false    |            1 | id          | ASC       |  false  |  false   |
| orders     | orders_auto_index_fk_customer_ref_customers |    true    |            1 | customer    | ASC       |  false  |  false   |
| orders     | orders_auto_index_fk_customer_ref_customers |    true    |            2 | id          | ASC       |  false  |   true   |
+------------+---------------------------------------------+------------+--------------+-------------+-----------+---------+----------+
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP INDEX orders_auto_index_fk_customer_ref_customers;
~~~

~~~
pq: index "orders_auto_index_fk_customer_ref_customers" is in use as a foreign key constraint
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CONSTRAINTS FROM orders;
~~~

~~~
+------------+---------------------------+-----------------+--------------------------------------------------+-----------+
| table_name |      constraint_name      | constraint_type |                     details                      | validated |
+------------+---------------------------+-----------------+--------------------------------------------------+-----------+
| orders     | fk_customer_ref_customers | FOREIGN KEY     | FOREIGN KEY (customer) REFERENCES customers (id) |   true    |
| orders     | primary                   | PRIMARY KEY     | PRIMARY KEY (id ASC)                             |   true    |
+------------+---------------------------+-----------------+--------------------------------------------------+-----------+
(2 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP INDEX orders_auto_index_fk_customer_ref_customers CASCADE;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CONSTRAINTS FROM orders;
~~~

~~~
+------------+-----------------+-----------------+----------------------+-----------+
| table_name | constraint_name | constraint_type |       details        | validated |
+------------+-----------------+-----------------+----------------------+-----------+
| orders     | primary         | PRIMARY KEY     | PRIMARY KEY (id ASC) |   true    |
+------------+-----------------+-----------------+----------------------+-----------+
(1 row)
~~~

## See Also

- [Indexes](indexes.html)
- [Online Schema Changes](online-schema-changes.html)
- [`SHOW JOBS`](show-jobs.html)
