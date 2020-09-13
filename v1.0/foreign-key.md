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
- Foreign key columns must be [indexed](indexes.html). This is required because updates and deletes on the referenced table will need to search the referencing table for any matching records to ensure those operations would not violate existing references. In practice, such indexes are likely also needed by applications using these tables, since finding all records which belong to some entity, for example all orders for a given customer, is very common.
    - To meet this requirement when creating a new table, there are a few options:
        - Create indexes explicitly using the [`INDEX`](create-table.html#create-a-table-with-secondary-indexes) clause of `CREATE TABLE`.
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

### Performance

Because the Foreign Key constraint requires per-row checks on two tables, statements involving foreign key or referenced columns can take longer to execute. You're most likely to notice this with operations like bulk inserts into the table with the foreign keys.

We're currently working to improve the performance of these statements, though.

{{site.data.alerts.callout_success}}You can improve the performance of some statements that use Foreign Keys by also using <code><a href="interleave-in-parent.html">INTERLEAVE IN PARENT</a></code>.{{site.data.alerts.end}}

## Syntax

Foreign Key constraints can be defined at the [table level](#table-level). However, if you only want the constraint to apply to a single column, it can be applied at the [column level](#column-level).

{{site.data.alerts.callout_info}}You can also add the Foreign Key constraint to existing tables through <a href="add-constraint.html#add-the-foreign-key-constraint"><code>ADD CONSTRAINT</code></a>.{{site.data.alerts.end}}

### Column Level

{% include {{ page.version.version }}/sql/diagrams/foreign_key_column_level.html %}

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
    customer INT NOT NULL REFERENCES customers (id),
    orderTotal DECIMAL(9,2),
    INDEX (customer)
  );
~~~

### Table Level

{% include {{ page.version.version }}/sql/diagrams/foreign_key_table_level.html %}

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

## Usage Example

~~~ sql
> CREATE TABLE customers (id INT PRIMARY KEY, email STRING UNIQUE);

> CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY,
    customer INT NOT NULL REFERENCES customers (id),
    orderTotal DECIMAL(9,2),
    INDEX (customer)
  );

> INSERT INTO customers VALUES (1001, 'a@co.tld');

> INSERT INTO orders VALUES (1, 1002, 29.99);
~~~
~~~
pq: foreign key violation: value [1002] not found in customers@primary [id]
~~~
~~~ sql
> INSERT INTO orders VALUES (1, 1001, 29.99);

> UPDATE customers SET id = 1002 WHERE id = 1001;
~~~
~~~
pq: foreign key violation: value(s) [1001] in columns [id] referenced in table "orders"
~~~
~~~ sql
> DELETE FROM customers WHERE id = 1001;
~~~
~~~
pq: foreign key violation: value(s) [1001] in columns [id] referenced in table "orders"
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

