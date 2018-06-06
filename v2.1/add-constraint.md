---
title: ADD CONSTRAINT
summary: Use the ADD CONSTRAINT statement to add constraints to columns.
toc: false
---

The `ADD CONSTRAINT` [statement](sql-statements.html) is part of `ALTER TABLE` and can add the following [constraints](constraints.html) to columns:

- [`CHECK`](check.html)
- [`FOREIGN KEY`](foreign-key.html)
- [`UNIQUE`](unique.html)

{{site.data.alerts.callout_info}}
The [`PRIMARY KEY`](primary-key.html) and [`NOT NULL`](not-null.html) constraints can only be applied through [`CREATE TABLE`](create-table.html). The [`DEFAULT`](default-value.html) constraint is managed through [`ALTER COLUMN`](alter-column.html).
{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/{{ page.version.version }}/diagrams/add_constraint.html %}

## Required privileges

The user must have the `CREATE` [privilege](privileges.html) on the table.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table containing the column you want to constrain. |
| `constraint_name` | The name of the constraint, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers). |
| `constraint_elem` | The [`CHECK`](check.html), [`FOREIGN KEY`](foreign-key.html), [`UNIQUE`](unique.html) constraint you want to add. <br/><br/>Adding/changing a `DEFAULT` constraint is done through [`ALTER COLUMN`](alter-column.html). <br/><br/>Adding/changing the table's `PRIMARY KEY` is not supported through `ALTER TABLE`; it can only be specified during [table creation](create-table.html#create-a-table-primary-key-defined). |

## Viewing schema changes

{% include custom/schema-change-view-job.md %}

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

### Add the `FOREIGN KEY` constraint with `CASCADE`

Before you can add the [`FOREIGN KEY`](foreign-key.html) constraint to columns, the columns must already be indexed. If they are not already indexed, use [`CREATE INDEX`](create-index.html) to index them and only then use the `ADD CONSTRAINT` statement to add the Foreign Key constraint to the columns.

For example, let's say you have two tables, `orders` and `customers`:

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE customers;
~~~

~~~
+-----------+-------------------------------------------------+
|   Table   |                   CreateTable                   |
+-----------+-------------------------------------------------+
| customers | CREATE TABLE customers (␤                       |
|           |     id INT NOT NULL,␤                           |
|           |     "name" STRING NOT NULL,␤                    |
|           |     address STRING NULL,␤                       |
|           |     CONSTRAINT "primary" PRIMARY KEY (id ASC),␤ |
|           |     FAMILY "primary" (id, "name", address)␤     |
|           | )                                               |
+-----------+-------------------------------------------------+
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE orders;
~~~

~~~
+--------+-------------------------------------------------------------------------------------------------------------+
| Table  |                                                 CreateTable                                                 |
+--------+-------------------------------------------------------------------------------------------------------------+
| orders | CREATE TABLE orders (␤                                                                                      |
|        |     id INT NOT NULL,␤                                                                                       |
|        |     customer_id INT NULL,␤                                                                                  |
|        |     status STRING NOT NULL,␤                                                                                |
|        |     CONSTRAINT "primary" PRIMARY KEY (id ASC),␤                                                             |
|        |     FAMILY "primary" (id, customer_id, status),␤                                                            |
|        |     CONSTRAINT check_status CHECK (status IN ('open':::STRING, 'complete':::STRING, 'cancelled':::STRING))␤ |
|        | )                                                                                                           |
+--------+-------------------------------------------------------------------------------------------------------------+
(1 row)
~~~

To ensure that each value in the `orders.customer_id` column matches a unique value in the `customers.id` column, you want to add the Foreign Key constraint to `orders.customer_id`. So you first create an index on `orders.customer_id`:

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON orders (customer_id);
~~~

Then you add the `FOREIGN KEY` constraint.

You can include a [foreign key action](foreign-key.html#foreign-key-actions) to specify what happens when a foreign key is updated or deleted.

In this example, let's use `ON DELETE CASCADE` (i.e., when referenced row is deleted, all dependent objects are also deleted).

{{site.data.alerts.callout_danger}}<code>CASCADE</code> does not list objects it drops or updates, so it should be used cautiously.{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE orders ADD CONSTRAINT customer_fk FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE;
~~~

If you had tried to add the constraint before indexing the column, you would have received an error:

~~~
pq: foreign key requires an existing index on columns ("customer_id")
~~~

## See also

- [Constraints](constraints.html)
- [Foreign Key Constraint](foreign-key.html)
- [`ALTER COLUMN`](alter-column.html)
- [`CREATE TABLE`](create-table.html)
- [`ALTER TABLE`](alter-table.html)
