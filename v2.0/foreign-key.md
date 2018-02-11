---
title: Foreign Key Constraint
summary: The Foreign Key constraint specifies a column can contain only values exactly matching existing values from the column it references.
toc: false
---

The Foreign Key [constraint](constraints.html) specifies that all of a column's values must exactly match existing values from the column it references, enforcing referential integrity.

For example, if you create a foreign key on `orders.customer` that references `customers.id`:

- Each value inserted or updated in `orders.customer` must exactly match a value in `customers.id`.
- Values in `customers.id` that are referenced by `orders.customer` cannot be deleted or updated. However, `customers.id` values that _aren't_ present in `orders.customer` can be.

{{site.data.alerts.callout_success}}If you plan to use Foreign Keys in your schema, consider using <a href="interleave-in-parent.html">interleaved tables</a>, which can dramatically improve query performance.{{site.data.alerts.end}}

<div id="toc"></div>

## Details

### Rules for Creating Foreign Keys

**Foreign Key Columns**

- Foreign key columns must use their referenced column's [type](data-types.html).
- Each column cannot belong to more than 1 Foreign Key constraint.
- Foreign key columns must be [indexed](indexes.html). This is required because updates and deletes on the referenced table will need to search the referencing table for any matching records to ensure those operations would not violate existing references. In practice, such indexes are likely also needed by applications using these tables, since finding all records which belong to some entity, for example all orders for a given customer, is very common.
    - To meet this requirement when creating a new table, there are a few options:
        - Create indexes explicitly using the [`INDEX`](create-table.html#create-a-table-with-secondary-indexes) clause of `CREATE TABLE`.
        - Rely on indexes created by the [Primary Key](primary-key.html) or [Unique](unique.html) constraints.
        - Have CockroachDB automatically create an index of the foreign key columns for you. However, it's important to note that if you later remove the Foreign Key constraint, this automatically created index _is not_ removed.
        - Using the foreign key columns as the prefix of an index's columns also satisfies the requirement for an index. For example, if you create foreign key columns `(A, B)`, an index of columns `(A, B, C)` satisfies the requirement for an index.
    - To meet this requirement when adding the Foreign Key constraint to an existing table, if the columns you want to constraint are not already indexed, use [`CREATE INDEX`](create-index.html) to index them and only then use the [`ADD CONSTRAINT`](add-constraint.html) statement to add the Foreign Key constraint to the columns.

**Referenced Columns**

- Referenced columns must contain only unique sets of values. This means the `REFERENCES` clause must use exactly the same columns as a [Unique](unique.html) or [Primary Key](primary-key.html) constraint on the referenced table. For example, the clause `REFERENCES tbl (C, D)` requires `tbl` to have either the constraint `UNIQUE (C, D)` or `PRIMARY KEY (C, D)`.
- In the `REFERENCES` clause, if you specify a table but no columns, CockroachDB references the table's primary key. In these cases, the Foreign Key constraint and the referenced table's primary key must contain the same number of columns.

### _NULL_ Values

Single-column foreign keys accept _NULL_ values.

Multiple-column foreign keys only accept _NULL_ values in these scenarios:

- The row you're ultimately referencing&mdash;determined by the statement's other values&mdash;contains _NULL_ as the value of the referenced column (i.e., _NULL_ is valid from the perspective of referential integrity)
- The write contains _NULL_ values for all foreign key columns

For example, if you have a Foreign Key constraint on columns `(A, B)` and try to insert `(1, NULL)`, the write would fail unless the row with the value `1` for `(A)` contained a _NULL_ value for `(B)`. However, inserting `(NULL, NULL)` would succeed.

However, allowing _NULL_ values in either your foreign key or referenced columns can degrade their referential integrity. To avoid this, you can use the [Not Null constraint](not-null.html) on both sets of columns when [creating your tables](create-table.html). (The Not Null constraint cannot be added to existing tables.)

### Foreign Key Actions <span class="version-tag">New in v2.0</span>
You can specify an action to take when a referenced column is updated or deleted.

Parameter | Description
----------|------------
`ON DELETE NO ACTION` / `ON UPDATE NO ACTION` | _Default actions._ If there are any existing references to the key being updated or deleted, the transaction will fail at the end of the statement. <br><br>Aliases: `ON DELETE RESTRICT` / `ON UPDATE RESTRICT`
`ON DELETE RESTRICT` / `ON UPDATE RESTRICT` | `RESTRICT` and `NO ACTION` are currently equivalent until options for deferring constraint checking are added. To set an existing foreign key action to `RESTRICT`, the foreign key constraint must be dropped and recreated.
`ON DELETE CASCADE` / `ON UPDATE CASCADE` | When a referenced foreign key is deleted or updated, all rows referencing that key are deleted or updated. If there are other alterations to the row, such as a `SET NULL` or `SET DEFAULT`, the delete will take precedence. <br><br>Note that `CASCADE` does not list objects it drops or updates, so it should be used cautiously.
`ON DELETE SET NULL` / `ON UPDATE SET NULL` | When a referenced foreign key is deleted or updated, the columns of all rows referencing that key will be set to `NULL`. The column must allow `NULL` or this update will fail.
`ON DELETE SET DEFAULT` / `ON UPDATE SET DEFAULT` | When a referenced foreign key is deleted or updated, the columns of all rows referencing that key are set to the default value for that column. If the default value for the column is null, this will have the same effect as `ON DELETE SET NULL` or `ON UPDATE SET NULL`. The default value must still conform with all other constraints, such as `UNIQUE`.

### Performance

Because the Foreign Key constraint requires per-row checks on two tables, statements involving foreign key or referenced columns can take longer to execute. You're most likely to notice this with operations like bulk inserts into the table with the foreign keys.

We're currently working to improve the performance of these statements, though.

{{site.data.alerts.callout_success}}You can improve the performance of some statements that use Foreign Keys by also using <code><a href="interleave-in-parent.html">INTERLEAVE IN PARENT</a></code>.{{site.data.alerts.end}}

## Syntax

Foreign Key constraints can be defined at the [table level](#table-level). However, if you only want the constraint to apply to a single column, it can be applied at the [column level](#column-level).

{{site.data.alerts.callout_info}}You can also add the Foreign Key constraint to existing tables through <a href="add-constraint.html#add-the-foreign-key-constraint-with-cascade"><code>ADD CONSTRAINT</code></a>.{{site.data.alerts.end}}

### Column Level

<section>{% include sql/{{ page.version.version }}/diagrams/foreign_key_column_level.html %}</section>

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you're creating. |
| `column_name` | The name of the foreign key column. |
| `column_type` | The foreign key column's [data type](data-types.html). |
| `parent_table` | The name of the table the foreign key references. |
| `ref_column_name` | The name of the column the foreign key references. <br/><br/>If you do not include the `ref_column_name` you want to reference from the `parent_table`, CockroachDB uses the first column of `parent_table`'s primary key.
| `column_constraints` | Any other column-level [constraints](constraints.html) you want to apply to this column. |
| `column_def` | Definitions for any other columns in the table. |
| `table_constraints` | Any table-level [constraints](constraints.html) you want to apply. |

**Example**

~~~ sql
> CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY,
    customer INT NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
    orderTotal DECIMAL(9,2),
    INDEX (customer)
  );
~~~
{{site.data.alerts.callout_danger}}<code>CASCADE</code> does not list objects it drops or updates, so it should be used cautiously.{{site.data.alerts.end}}

### Table Level

<section>{% include sql/{{ page.version.version }}/diagrams/foreign_key_table_level.html %}</section>

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table you're creating. |
| `column_def` | Definitions for the table's columns. |
| `name` | The name of the constraint. |
| `fk_column_name` | The name of the foreign key column. |
| `parent_table` | The name of the table the foreign key references. |
| `ref_column_name` | The name of the column the foreign key references. <br/><br/>If you do not include the `column_name` you want to reference from the `parent_table`, CockroachDB uses the first column of `parent_table`'s primary key.
| `table_constraints` | Any other table-level [constraints](constraints.html) you want to apply. |

**Example**

~~~ sql
CREATE TABLE packages (
    customer INT,
    "order" INT,
    id INT,
    address STRING(50),
    delivered BOOL,
    delivery_date DATE,
    PRIMARY KEY (customer, "order", id),
    CONSTRAINT fk_order FOREIGN KEY (customer, "order") REFERENCES orders
    ) INTERLEAVE IN PARENT orders (customer, "order")
  ;
~~~

## Usage Examples

### Use a Foreign Key Constraint with Default Actions

In this example, we'll create a table with a foreign key constraint with the default [actions](#foreign-key-actions-new-in-v2-0) (`ON UPDATE NO ACTION` / `ON DELETE NO ACTION`).

First, create the referenced table.

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers (id INT PRIMARY KEY, email STRING UNIQUE);
~~~

Next, create the child table.

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY,
    customer INT NOT NULL REFERENCES customers (id),
    orderTotal DECIMAL(9,2),
    INDEX (customer)
  );
~~~

Let's insert a record into each table.

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO customers VALUES (1001, 'a@co.tld');

> INSERT INTO orders VALUES (1, 1002, 29.99);
~~~
~~~
pq: foreign key violation: value [1002] not found in customers@primary [id]
~~~

The second record insertion returns an error because the customer `1002` doesn't exist in the referenced table.

Let's insert a record in the child table and try to update the referenced table.

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO orders VALUES (1, 1001, 29.99);

> UPDATE customers SET id = 1002 WHERE id = 1001;
~~~
~~~
pq: foreign key violation: value(s) [1001] in columns [id] referenced in table "orders"
~~~

The update to the referenced table returns an error because `id = 1001` is referenced and the default [foreign key action](#foreign-key-actions-new-in-v2-0) is enabled (`ON UPDATE NO ACTION`).

Let's try to delete a referenced row.

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM customers WHERE id = 1001;
~~~
~~~
pq: foreign key violation: value(s) [1001] in columns [id] referenced in table "orders"
~~~

Similarly, the deletion returns an error because `id = 100` is referenced and the default [foreign key action](#foreign-key-actions-new-in-v2-0) is enabled (`ON DELETE NO ACTION`).

### Use a Foreign Key Constraint with `CASCADE`

In this example, we'll create a table with a foreign key constraint with the [foreign key action](#foreign-key-actions-new-in-v2-0) `ON DELETE CASCADE`.

First, create the referenced table:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers_2 (
    id INT PRIMARY KEY
  );
~~~

Then, create the child table:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE orders_2 (
    id INT PRIMARY KEY,
    customer_id INT REFERENCES customer(id) ON UPDATE CASCADE ON DELETE CASCADE
  );
~~~

Insert a few records in the referenced table:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO customers_2 VALUES (1), (2), (3);
~~~

Insert some records in the child table:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO orders_2 VALUES (100,1), (101,2), (102,3), (103,1);
~~~

Now, let's update an `id` in the referenced table:

{% include copy-clipboard.html %}
~~~ sql
> UPDATE customers_2 SET id = 23 WHERE id = 1;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers_2;
~~~
~~~
+----+
| id |
+----+
|  2 |
|  3 |
| 23 |
+----+
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders_2;
~~~
~~~
+-----+--------------+
| id  | customers_id |
+-----+--------------+
| 100 |           23 |
| 101 |            2 |
| 102 |            3 |
| 103 |           23 |
+-----+--------------+
~~~

When the `id = 1` was updated to `id =23` in `customers_2`, the update propagated to the child table `orders_2`.

Similarly, a deletion will cascade. Let's delete `id = 23` from `customers_2`:

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM customers_2 WHERE id = 23;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers_2;
~~~
~~~
+----+
| id |
+----+
|  2 |
|  3 |
+----+
~~~

Let's check to make sure the rows in `orders_2` where `student_id = 23` were also deleted:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders_2;
~~~
~~~
+-----+------------+
| id  | student_id |
+-----+------------+
| 101 |          2 |
| 102 |          3 |
+-----+------------+
~~~

## See Also

- [Constraints](constraints.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`ADD CONSTRAINT`](add-constraint.html)
- [Check constraint](check.html)
- [Default Value constraint](default-value.html)
- [Not Null constraint](not-null.html)
- [Primary Key constraint](primary-key.html)
- [Unique constraint](unique.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
