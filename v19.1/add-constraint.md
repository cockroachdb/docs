---
title: ADD CONSTRAINT
summary: Use the ADD CONSTRAINT statement to add constraints to columns.
toc: true
---

The `ADD CONSTRAINT` [statement](sql-statements.html) is part of `ALTER TABLE` and can add the following [constraints](constraints.html) to columns:

- [Unique](#add-the-unique-constraint)
- [Check](#add-the-check-constraint)
- [Foreign key](#add-the-foreign-key-constraint-with-cascade)

{{site.data.alerts.callout_info}}
The [`PRIMARY KEY`](primary-key.html) and [`NOT NULL`](not-null.html) constraints can only be applied through [`CREATE TABLE`](create-table.html). The [`DEFAULT`](default-value.html) constraint is managed through [`ALTER COLUMN`](alter-column.html).
{{site.data.alerts.end}}

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/add_constraint.html %}
</div>

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the table.

## Parameters

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table containing the column you want to constrain.
 `constraint_name` | The name of the constraint, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers).
 `constraint_elem` | The [`CHECK`](check.html), [foreign key](foreign-key.html), [`UNIQUE`](unique.html) constraint you want to add. <br/><br/>Adding/changing a `DEFAULT` constraint is done through [`ALTER COLUMN`](alter-column.html). <br/><br/>Adding/changing the table's `PRIMARY KEY` is not supported through `ALTER TABLE`; it can only be specified during [table creation](create-table.html#create-a-table-primary-key-defined).

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

### Add the `UNIQUE` constraint

Adding the [`UNIQUE` constraint](unique.html) requires that all of a column's values be distinct from one another (except for *NULL* values).

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE orders ADD CONSTRAINT id_customer_unique UNIQUE (id, customer);
~~~

### Add the `CHECK` constraint

Adding the [`CHECK` constraint](check.html) requires that all of a column's values evaluate to `TRUE` for a Boolean expression.

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE orders ADD CONSTRAINT total_0_check CHECK (total > 0);
~~~

### Add the foreign key constraint with `CASCADE`

Adding a foreign key constraint is done using the steps shown below.

Given two tables, `customers` and `orders`,

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE customers;
~~~

~~~
 table_name |                  create_statement
------------+----------------------------------------------------
 customers  | CREATE TABLE customers (                          +
            |         id INT8 NOT NULL,                         +
            |         name STRING NOT NULL,                     +
            |         address STRING NULL,                      +
            |         CONSTRAINT "primary" PRIMARY KEY (id ASC),+
            |         FAMILY "primary" (id, name, address)      +
            | )
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE orders;
~~~

~~~
 table_name |                                                create_statement
------------+----------------------------------------------------------------------------------------------------------------
 orders     | CREATE TABLE orders (                                                                                         +
            |         id INT8 NOT NULL,                                                                                     +
            |         customer_id INT8 NULL,                                                                                +
            |         status STRING NOT NULL,                                                                               +
            |         CONSTRAINT "primary" PRIMARY KEY (id ASC),                                                            +
            |         FAMILY "primary" (id, customer_id, status),                                                           +
            |         CONSTRAINT check_status CHECK (status IN ('open':::STRING, 'complete':::STRING, 'cancelled':::STRING))+
            | )
(1 row)
~~~

you can include a [foreign key action](foreign-key.html#foreign-key-actions) to specify what happens when a foreign key is updated or deleted.

Using `ON DELETE CASCADE` will ensure that when the referenced row is deleted, all dependent objects are also deleted.

{{site.data.alerts.callout_danger}}
`CASCADE` does not list the objects it drops or updates, so it should be used with caution.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE orders ADD CONSTRAINT customer_fk FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE;
~~~

<span class="version-tag">New in v19.1</span>: An index on the referenced columns is automatically created for you when you add a foreign key constraint to an empty table. You can see it using [`SHOW INDEXES`](show-index.html):

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM orders;
~~~

~~~
 table_name |          index_name           | non_unique | seq_in_index | column_name | direction | storing | implicit
------------+-------------------------------+------------+--------------+-------------+-----------+---------+----------
 orders     | primary                       | f          |            1 | id          | ASC       | f       | f
 orders     | orders_auto_index_customer_fk | t          |            1 | customer_id | ASC       | f       | f
 orders     | orders_auto_index_customer_fk | t          |            2 | id          | ASC       | f       | t
(3 rows)
~~~

{{site.data.alerts.callout_info}}
Adding a foreign key for a non-empty, non-indexed table will fail, since foreign key columns must be indexed. For more information about the requirements for creating foreign keys, see [Rules for creating foreign keys](foreign-key.html#rules-for-creating-foreign-keys).
{{site.data.alerts.end}}

## See also

- [Constraints](constraints.html)
- [Foreign Key Constraint](foreign-key.html)
- [`ALTER COLUMN`](alter-column.html)
- [`CREATE TABLE`](create-table.html)
- [`ALTER TABLE`](alter-table.html)
