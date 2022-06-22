---
title: ADD CONSTRAINT
summary: Use the ADD CONSTRAINT statement to add constraints to columns.
toc: true
---

The `ADD CONSTRAINT` [statement](sql-statements.html) is part of `ALTER TABLE` and can add the following [constraints](constraints.html) to columns:

- [`UNIQUE`](#add-the-unique-constraint)
- [`CHECK`](#add-the-check-constraint)
- [Foreign key](#add-the-foreign-key-constraint-with-cascade)

{{site.data.alerts.callout_info}}
The [`PRIMARY KEY`](primary-key.html) can only be applied through [`CREATE TABLE`](create-table.html). The [`DEFAULT`](default-value.html) and [`NOT NULL`](not-null.html) constraints are managed through [`ALTER COLUMN`](alter-column.html).
{{site.data.alerts.end}}

{% include {{ page.version.version }}/sql/combine-alter-table-commands.md %}

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
 `constraint_elem` | The [`CHECK`](check.html), [foreign key](foreign-key.html), [`UNIQUE`](unique.html) constraint you want to add. <br/><br/>Adding/changing a `DEFAULT` constraint is done through [`ALTER COLUMN`](alter-column.html). <br/><br/>Adding/changing the table's `PRIMARY KEY` is not supported through `ALTER TABLE`; it can only be specified during [table creation](create-table.html).

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

### Add the `UNIQUE` constraint

Adding the [`UNIQUE` constraint](unique.html) requires that all of a column's values be distinct from one another (except for *NULL* values).

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE orders ADD CONSTRAINT id_customer_unique UNIQUE (id, customer);
~~~

### Add the `CHECK` constraint

Adding the [`CHECK` constraint](check.html) requires that all of a column's values evaluate to `TRUE` for a Boolean expression.

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE orders ADD CONSTRAINT check_id_non_zero CHECK (id > 0);
~~~

Check constraints can be added to columns that were created earlier in the transaction. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> BEGIN;
> ALTER TABLE customers ADD COLUMN gdpr_status STRING;
> ALTER TABLE customers ADD CONSTRAINT check_gdpr_status CHECK (gdpr_status IN ('yes', 'no', 'unknown'));
> COMMIT;
~~~

~~~
BEGIN
ALTER TABLE
ALTER TABLE
COMMIT
~~~

{{site.data.alerts.callout_info}}
The entire transaction will be rolled back, including any new columns that were added, in the following cases:

- If an existing column is found containing values that violate the new constraint.
- If a new column has a default value or is a [computed column](computed-columns.html) that would have contained values that violate the new constraint.
{{site.data.alerts.end}}

### Add the foreign key constraint with `CASCADE`

To add a foreign key constraint, use the steps shown below.

Given two tables, `customers` and `orders`:

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

You can include a [foreign key action](foreign-key.html#foreign-key-actions) to specify what happens when a foreign key is updated or deleted.

Using `ON DELETE CASCADE` will ensure that when the referenced row is deleted, all dependent objects are also deleted.

{{site.data.alerts.callout_danger}}
`CASCADE` does not list the objects it drops or updates, so it should be used with caution.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE orders ADD CONSTRAINT customer_fk FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE;
~~~

An index on the referencing columns is automatically created for you when you add a foreign key constraint to an empty table, if an appropriate index does not already exist. You can see it using [`SHOW INDEXES`](show-index.html):

{% include_cached copy-clipboard.html %}
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
Adding a foreign key for a non-empty table without an appropriate index will fail, since foreign key columns must be indexed. For more information about the requirements for creating foreign keys, see [Rules for creating foreign keys](foreign-key.html#rules-for-creating-foreign-keys).
{{site.data.alerts.end}}

## See also

- [Constraints](constraints.html)
- [Foreign Key Constraint](foreign-key.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`RENAME CONSTRAINT`](rename-constraint.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`VALIDATE CONSTRAINT`](validate-constraint.html)
- [`ALTER COLUMN`](alter-column.html)
- [`CREATE TABLE`](create-table.html)
- [`ALTER TABLE`](alter-table.html)
- [`SHOW JOBS`](show-jobs.html)
