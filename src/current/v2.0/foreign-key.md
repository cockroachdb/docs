---
title: Foreign Key Constraint
summary: The Foreign Key constraint specifies a column can contain only values exactly matching existing values from the column it references.
toc: true
---

The Foreign Key [constraint](constraints.html) specifies that all of a column's values must exactly match existing values from the column it references, enforcing referential integrity.

For example, if you create a foreign key on `orders.customer` that references `customers.id`:

- Each value inserted or updated in `orders.customer` must exactly match a value in `customers.id`.
- Values in `customers.id` that are referenced by `orders.customer` cannot be deleted or updated. However, `customers.id` values that _aren't_ present in `orders.customer` can be.

{{site.data.alerts.callout_success}}If you plan to use Foreign Keys in your schema, consider using <a href="interleave-in-parent.html">interleaved tables</a>, which can dramatically improve query performance.{{site.data.alerts.end}}


## Details

### Rules for Creating Foreign Keys

**Foreign Key Columns**

- Foreign key columns must use their referenced column's [type](data-types.html).
- Each column cannot belong to more than 1 Foreign Key constraint.
- Cannot be a [computed column](computed-columns.html).
- Foreign key columns must be [indexed](indexes.html). This is required because updates and deletes on the referenced table will need to search the referencing table for any matching records to ensure those operations would not violate existing references. In practice, such indexes are likely also needed by applications using these tables, since finding all records which belong to some entity, for example all orders for a given customer, is very common.
    - To meet this requirement when creating a new table, there are a few options:
        - Create indexes explicitly using the [`INDEX`](create-table.html#create-a-table-with-secondary-and-inverted-indexes-new-in-v2-0) clause of `CREATE TABLE`.
        - Rely on indexes created by the [Primary Key](primary-key.html) or [Unique](unique.html) constraints.
        - Have CockroachDB automatically create an index of the foreign key columns for you. However, it's important to note that if you later remove the Foreign Key constraint, this automatically created index _is not_ removed.
        - Using the foreign key columns as the prefix of an index's columns also satisfies the requirement for an index. For example, if you create foreign key columns `(A, B)`, an index of columns `(A, B, C)` satisfies the requirement for an index.
    - To meet this requirement when adding the Foreign Key constraint to an existing table, if the columns you want to constrain are not already indexed, use [`CREATE INDEX`](create-index.html) to index them and only then use the [`ADD CONSTRAINT`](add-constraint.html) statement to add the Foreign Key constraint to the columns.

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

When you set a foreign key constraint, you can control what happens to the constrained column when the column it's referencing (the foreign key) is deleted or updated.

Parameter | Description
----------|------------
`ON DELETE NO ACTION` | _Default action._ If there are any existing references to the key being deleted, the transaction will fail at the end of the statement. The key can be updated, depending on the `ON UPDATE` action. <br><br>Alias: `ON DELETE RESTRICT`
`ON UPDATE NO ACTION` | _Default action._ If there are any existing references to the key being updated, the transaction will fail at the end of the statement. The key can be deleted, depending on the `ON DELETE` action.  <br><br>Alias: `ON UPDATE RESTRICT`
`ON DELETE RESTRICT` / `ON UPDATE RESTRICT` | `RESTRICT` and `NO ACTION` are currently equivalent until options for deferring constraint checking are added. To set an existing foreign key action to `RESTRICT`, the foreign key constraint must be dropped and recreated.
`ON DELETE CASCADE` / `ON UPDATE CASCADE` | When a referenced foreign key is deleted or updated, all rows referencing that key are deleted or updated, respectively. If there are other alterations to the row, such as a `SET NULL` or `SET DEFAULT`, the delete will take precedence. <br><br>Note that `CASCADE` does not list objects it drops or updates, so it should be used cautiously.
`ON DELETE SET NULL` / `ON UPDATE SET NULL` | When a referenced foreign key is deleted or updated, respectively, the columns of all rows referencing that key will be set to `NULL`. The column must allow `NULL` or this update will fail.
`ON DELETE SET DEFAULT` / `ON UPDATE SET DEFAULT` | When a referenced foreign key is deleted or updated, respectively, the columns of all rows referencing that key are set to the default value for that column. If the default value for the column is null, this will have the same effect as `ON DELETE SET NULL` or `ON UPDATE SET NULL`. The default value must still conform with all other constraints, such as `UNIQUE`.

### Performance

Because the Foreign Key constraint requires per-row checks on two tables, statements involving foreign key or referenced columns can take longer to execute. You're most likely to notice this with operations like bulk inserts into the table with the foreign keys.

We're currently working to improve the performance of these statements, though.

{{site.data.alerts.callout_success}}You can improve the performance of some statements that use Foreign Keys by also using <code><a href="interleave-in-parent.html">INTERLEAVE IN PARENT</a></code>.{{site.data.alerts.end}}

## Syntax

Foreign Key constraints can be defined at the [table level](#table-level). However, if you only want the constraint to apply to a single column, it can be applied at the [column level](#column-level).

{{site.data.alerts.callout_info}}You can also add the Foreign Key constraint to existing tables through <a href="add-constraint.html#add-the-foreign-key-constraint-with-cascade"><code>ADD CONSTRAINT</code></a>.{{site.data.alerts.end}}

### Column Level

<section>{% include {{ page.version.version }}/sql/diagrams/foreign_key_column_level.html %}</section>

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

<section>{% include {{ page.version.version }}/sql/diagrams/foreign_key_table_level.html %}</section>

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

In this example, we'll create a table with a foreign key constraint with the default [actions](#foreign-key-actions-new-in-v2-0) (`ON UPDATE NO ACTION ON DELETE NO ACTION`).

First, create the referenced table:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers (id INT PRIMARY KEY, email STRING UNIQUE);
~~~

Next, create the referencing table:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY,
    customer INT NOT NULL REFERENCES customers (id),
    orderTotal DECIMAL(9,2),
    INDEX (customer)
  );
~~~

Let's insert a record into each table:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO customers VALUES (1001, 'a@co.tld'), (1234, 'info@cockroachlabs.com');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO orders VALUES (1, 1002, 29.99);
~~~
~~~
pq: foreign key violation: value [1002] not found in customers@primary [id]
~~~

The second record insertion returns an error because the customer `1002` doesn't exist in the referenced table.

Let's insert a record into the referencing table and try to update the referenced table:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO orders VALUES (1, 1001, 29.99);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> UPDATE customers SET id = 1002 WHERE id = 1001;
~~~
~~~
pq: foreign key violation: value(s) [1001] in columns [id] referenced in table "orders"
~~~

The update to the referenced table returns an error because `id = 1001` is referenced and the default [foreign key action](#foreign-key-actions-new-in-v2-0) is enabled (`ON UPDATE NO ACTION`). However, `id = 1234` is not referenced and can be updated:

{% include_cached copy-clipboard.html %}
~~~ sql
> UPDATE customers SET id = 1111 WHERE id = 1234;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers;
~~~
~~~
+------+------------------------+
|  id  |         email          |
+------+------------------------+
| 1001 | a@co.tld               |
| 1111 | info@cockroachlabs.com |
+------+------------------------+
~~~

Now let's try to delete a referenced row:

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM customers WHERE id = 1001;
~~~
~~~
pq: foreign key violation: value(s) [1001] in columns [id] referenced in table "orders"
~~~

Similarly, the deletion returns an error because `id = 1001` is referenced and the default [foreign key action](#foreign-key-actions-new-in-v2-0) is enabled (`ON DELETE NO ACTION`). However, `id = 1111` is not referenced and can be deleted:

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM customers WHERE id = 1111;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers;
~~~
~~~
+------+----------+
|  id  |  email   |
+------+----------+
| 1001 | a@co.tld |
+------+----------+
~~~

### Use a Foreign Key Constraint with `CASCADE` <span class="version-tag">New in v2.0</span>

In this example, we'll create a table with a foreign key constraint with the [foreign key actions](#foreign-key-actions-new-in-v2-0) `ON UPDATE CASCADE` and `ON DELETE CASCADE`.

First, create the referenced table:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers_2 (
    id INT PRIMARY KEY
  );
~~~

Then, create the referencing table:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE orders_2 (
    id INT PRIMARY KEY,
    customer_id INT REFERENCES customers_2(id) ON UPDATE CASCADE ON DELETE CASCADE
  );
~~~

Insert a few records into the referenced table:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO customers_2 VALUES (1), (2), (3);
~~~

Insert some records into the referencing table:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO orders_2 VALUES (100,1), (101,2), (102,3), (103,1);
~~~

Now, let's update an `id` in the referenced table:

{% include_cached copy-clipboard.html %}
~~~ sql
> UPDATE customers_2 SET id = 23 WHERE id = 1;
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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

When `id = 1` was updated to `id = 23` in `customers_2`, the update propagated to the referencing table `orders_2`.

Similarly, a deletion will cascade. Let's delete `id = 23` from `customers_2`:

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM customers_2 WHERE id = 23;
~~~

{% include_cached copy-clipboard.html %}
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

Let's check to make sure the rows in `orders_2` where `customers_id = 23` were also deleted:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders_2;
~~~
~~~
+-----+--------------+
| id  | customers_id |
+-----+--------------+
| 101 |            2 |
| 102 |            3 |
+-----+--------------+
~~~

### Use a Foreign Key Constraint with `SET NULL` <span class="version-tag">New in v2.0</span>

In this example, we'll create a table with a foreign key constraint with the [foreign key actions](#foreign-key-actions-new-in-v2-0) `ON UPDATE SET NULL` and `ON DELETE SET NULL`.

First, create the referenced table:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers_3 (
    id INT PRIMARY KEY
  );
~~~

Then, create the referencing table:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE orders_3 (
    id INT PRIMARY KEY,
    customer_id INT REFERENCES customers_3(id) ON UPDATE SET NULL ON DELETE SET NULL
  );
~~~

Insert a few records into the referenced table:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO customers_3 VALUES (1), (2), (3);
~~~

Insert some records into the referencing table:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO orders_3 VALUES (100,1), (101,2), (102,3), (103,1);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers_3;
~~~
~~~
+-----+-------------+
| id  | customer_id |
+-----+-------------+
| 100 |           1 |
| 101 |           2 |
| 102 |           3 |
| 103 |           1 |
+-----+-------------+
~~~

Now, let's update an `id` in the referenced table:

{% include_cached copy-clipboard.html %}
~~~ sql
> UPDATE customers_3 SET id = 23 WHERE id = 1;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers_3;
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

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders_3;
~~~
~~~
+-----+-------------+
| id  | customer_id |
+-----+-------------+
| 100 |        NULL |
| 101 |           2 |
| 102 |           3 |
| 103 |        NULL |
+-----+-------------+
~~~

When `id = 1` was updated to `id = 23` in `customers_3`, the referencing `customer_id` was set to `NULL`.

Similarly, a deletion will set the referencing `customer_id` to `NULL`. Let's delete `id = 2` from `customers_3`:

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM customers_3 WHERE id = 2;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers_3;
~~~
~~~
+----+
| id |
+----+
|  3 |
| 23 |
+----+
~~~

Let's check to make sure the row in `orders_3` where `customers_id = 2` was updated to `NULL`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders_3;
~~~
~~~
+-----+-------------+
| id  | customer_id |
+-----+-------------+
| 100 |        NULL |
| 101 |        NULL |
| 102 |           3 |
| 103 |        NULL |
+-----+-------------+
~~~

### Use a Foreign Key Constraint with `SET DEFAULT` <span class="version-tag">New in v2.0</span>

In this example, we'll create a table with a foreign key constraint with the [foreign key actions](#foreign-key-actions-new-in-v2-0) `ON UPDATE SET DEFAULT` and `ON DELETE SET DEFAULT`.

First, create the referenced table:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers_4 (
    id INT PRIMARY KEY
  );
~~~

Then, create the referencing table with the `DEFAULT` value for `customer_id` set to `9999`:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE orders_4 (
    id INT PRIMARY KEY,
    customer_id INT DEFAULT 9999 REFERENCES customers_4(id) ON UPDATE SET DEFAULT ON DELETE SET DEFAULT
  );
~~~

Insert a few records into the referenced table:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO customers_4 VALUES (1), (2), (3), (9999);
~~~

Insert some records into the referencing table:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO orders_4 VALUES (100,1), (101,2), (102,3), (103,1);
~~~
~~~
+-----+-------------+
| id  | customer_id |
+-----+-------------+
| 100 |           1 |
| 101 |           2 |
| 102 |           3 |
| 103 |           1 |
+-----+-------------+
~~~

Now, let's update an `id` in the referenced table:

{% include_cached copy-clipboard.html %}
~~~ sql
> UPDATE customers_4 SET id = 23 WHERE id = 1;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers_4;
~~~
~~~
+------+
|  id  |
+------+
|    2 |
|    3 |
|   23 |
| 9999 |
+------+
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders_4;
~~~
~~~
+-----+-------------+
| id  | customer_id |
+-----+-------------+
| 100 |        9999 |
| 101 |           2 |
| 102 |           3 |
| 103 |        9999 |
+-----+-------------+
~~~

When `id = 1` was updated to `id = 23` in `customers_4`, the referencing `customer_id` was set to `DEFAULT` (i.e., `9999`). You can see this in the first and last rows of `orders_4`, where `id = 100` and the `customer_id` is now `9999`

Similarly, a deletion will set the referencing `customer_id` to the `DEFAULT` value. Let's delete `id = 2` from `customers_4`:

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM customers_4 WHERE id = 2;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers_4;
~~~
~~~
+------+
|   id |
+------+
|    3 |
|   23 |
| 9999 |
+------+
~~~

Let's check to make sure the corresponding `customer_id` value to `id = 101`, was updated to the `DEFAULT` value (i.e., `9999`) in `orders_4`:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders_4;
~~~
~~~
+-----+-------------+
| id  | customer_id |
+-----+-------------+
| 100 |        9999 |
| 101 |        9999 |
| 102 |           3 |
| 103 |        9999 |
+-----+-------------+
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
