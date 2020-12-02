---
title: Foreign Key Constraint
summary: The `FOREIGN KEY` constraint specifies a column can contain only values exactly matching existing values from the column it references.
toc: true
---

A foreign key is a column (or combination of columns) in a table whose values must match values of a column in some other table. `FOREIGN KEY` constraints enforce [referential integrity](https://en.wikipedia.org/wiki/Referential_integrity), which essentially says that if column value A refers to column value B, then column value B must exist.

For example, given an `orders` table and a `customers` table, if you create a column `orders.customer_id` that references the `customers.id` primary key:

- Each value inserted or updated in `orders.customer_id` must exactly match a value in `customers.id`, or be `NULL`.
- Values in `customers.id` that are referenced by `orders.customer_id` cannot be deleted or updated, unless you have [cascading actions](#use-a-foreign-key-constraint-with-cascade). However, values of `customers.id` that are _not_ present in `orders.customer_id` can be deleted or updated.

{{site.data.alerts.callout_info}}
 A single column can have multiple foreign key constraints. For an example, see [Add multiple foreign key constraints to a single column](#add-multiple-foreign-key-constraints-to-a-single-column).
{{site.data.alerts.end}}

## Details

### Rules for creating foreign keys

**Foreign Key Columns**

- Foreign key columns must use their referenced column's [type](data-types.html).
- A foreign key column cannot be a [computed column](computed-columns.html).

{{site.data.alerts.callout_info}}
 Foreign key columns do not need to be indexed. In versions < v20.2, an index on referencing foreign key columns is required.
{{site.data.alerts.end}}

**Referenced Columns**

- Referenced columns must contain only unique sets of values. This means the `REFERENCES` clause must use exactly the same columns as a [`UNIQUE`](unique.html) or [`PRIMARY KEY`](primary-key.html) constraint on the referenced table. For example, the clause `REFERENCES tbl (C, D)` requires `tbl` to have either the constraint `UNIQUE (C, D)` or `PRIMARY KEY (C, D)`.
- In the `REFERENCES` clause, if you specify a table but no columns, CockroachDB references the table's primary key. In these cases, the `FOREIGN KEY` constraint and the referenced table's primary key must contain the same number of columns.
-  By default, referenced columns must be in the same database as the referencing foreign key column. To enable cross-database foreign key references, set the `sql.cross_db_fks.enabled` [cluster setting](cluster-settings.html) to `true`.
- Referenced columns must be [indexed](indexes.html). There are a number of ways to meet this requirement:

    - You can create indexes explicitly using the [`INDEX`](create-table.html#create-a-table-with-secondary-and-inverted-indexes) clause of `CREATE TABLE`.
    - You can rely on indexes created by the [`PRIMARY KEY`](primary-key.html) or [`UNIQUE`](unique.html) constraints.
    - If an index on the referenced column does not already exist, CockroachDB automatically creates one. It's important to note that if you later remove the `FOREIGN KEY` constraint, this automatically created index _is not_ removed.

    {{site.data.alerts.callout_success}}
    Using the referenced columns as the prefix of an index's columns also satisfies the requirement for an index. For example, if you create foreign key that references the columns `(A, B)`, an index of columns `(A, B, C)` satisfies the requirement for an index.
    {{site.data.alerts.end}}

    {{site.data.alerts.callout_info}}
     You can drop the index on the referenced columns if another index exists on the same columns and fulfills the indexing requirement described above.
    {{site.data.alerts.end}}

### Null values

Single-column foreign keys accept null values.

Multiple-column (composite) foreign keys only accept null values in the following scenarios:

- The write contains null values for all foreign key columns (if `MATCH FULL` is specified).
- The write contains null values for at least one foreign key column (if `MATCH SIMPLE` is specified).

For more information about composite foreign keys, see the [composite foreign key matching](#composite-foreign-key-matching) section.

Note that allowing null values in either your foreign key or referenced columns can degrade their referential integrity, since any key with a null value is never checked against the referenced table. To avoid this, you can use a [`NOT NULL` constraint](not-null.html) on foreign keys when [creating your tables](create-table.html).

{{site.data.alerts.callout_info}}
A `NOT NULL` constraint cannot be added to existing tables.
{{site.data.alerts.end}}

### Composite foreign key matching

By default, composite foreign keys are matched using the `MATCH SIMPLE` algorithm (which is the same default as Postgres). `MATCH FULL` is available if specified. You can specify both `MATCH FULL` and `MATCH SIMPLE`.

All composite key matches defined prior to version 19.1 use the `MATCH SIMPLE` comparison method. If you had a composite foreign key constraint and have just upgraded to version 19.1, then please check that `MATCH SIMPLE` works for your schema and consider replacing that foreign key constraint with a `MATCH FULL` one.

#### How it works

For matching purposes, composite foreign keys can be in one of three states:

- **Valid**: Keys that can be used for matching foreign key relationships.

- **Invalid**: Keys that will not be used for matching (including for any cascading operations).

- **Unacceptable**: Keys that cannot be inserted at all (an error is signalled).

`MATCH SIMPLE` stipulates that:

- **Valid** keys may not contain any null values.

- **Invalid** keys contain one or more null values.

- **Unacceptable** keys do not exist from the point of view of `MATCH SIMPLE`; all composite keys are acceptable.

`MATCH FULL` stipulates that:

- **Valid** keys may not contain any null values.

- **Invalid** keys must have all null values.

- **Unacceptable** keys have any combination of both null and non-null values. In other words, `MATCH FULL` requires that if any column of a composite key is `NULL`, then all columns of the key must be `NULL`.

For examples showing how these key matching algorithms work, see [Match composite foreign keys with `MATCH SIMPLE` and `MATCH FULL`](#match-composite-foreign-keys-with-match-simple-and-match-full).

{{site.data.alerts.callout_info}}
CockroachDB does not support `MATCH PARTIAL`. For more information, see issue [#20305](https://github.com/cockroachdb/cockroach/issues/20305).
{{site.data.alerts.end}}

### Foreign key actions

When you set a foreign key constraint, you can control what happens to the constrained column when the column it's referencing (the foreign key) is deleted or updated.

Parameter | Description
----------|------------
`ON DELETE NO ACTION` | _Default action._ If there are any existing references to the key being deleted, the transaction will fail at the end of the statement. The key can be updated, depending on the `ON UPDATE` action. <br><br>Alias: `ON DELETE RESTRICT`
`ON UPDATE NO ACTION` | _Default action._ If there are any existing references to the key being updated, the transaction will fail at the end of the statement. The key can be deleted, depending on the `ON DELETE` action. <br><br>Alias: `ON UPDATE RESTRICT`
`ON DELETE RESTRICT` / `ON UPDATE RESTRICT` | `RESTRICT` and `NO ACTION` are currently equivalent until options for deferring constraint checking are added. To set an existing foreign key action to `RESTRICT`, the foreign key constraint must be dropped and recreated.
`ON DELETE CASCADE` / `ON UPDATE CASCADE` | When a referenced foreign key is deleted or updated, all rows referencing that key are deleted or updated, respectively. If there are other alterations to the row, such as a `SET NULL` or `SET DEFAULT`, the delete will take precedence. <br><br>Note that `CASCADE` does not list objects it drops or updates, so it should be used cautiously.
`ON DELETE SET NULL` / `ON UPDATE SET NULL` | When a referenced foreign key is deleted or updated, respectively, the columns of all rows referencing that key will be set to `NULL`. The column must allow `NULL` or this update will fail.
`ON DELETE SET DEFAULT` / `ON UPDATE SET DEFAULT` | When a referenced foreign key is deleted or updated, the columns of all rows referencing that key are set to the default value for that column. <br/><br/> If the default value for the column is null, or if no default value is provided and the column does not have a [`NOT NULL`](not-null.html) constraint, this will have the same effect as `ON DELETE SET NULL` or `ON UPDATE SET NULL`. The default value must still conform with all other constraints, such as `UNIQUE`.

{{site.data.alerts.callout_info}}
 If a foreign key column has multiple constraints that reference the same column, the foreign key action that is specified by the first foreign key takes precedence. For an example, see [Add multiple foreign key constraints to a single column](#add-multiple-foreign-key-constraints-to-a-single-column).
{{site.data.alerts.end}}

### Performance

Because the foreign key constraint requires per-row checks on two tables, statements involving foreign key or referenced columns can take longer to execute. You're most likely to notice this with operations like bulk inserts into the table with the foreign keys. For bulk inserts into new tables, use the [`IMPORT`](import.html) statement instead of [`INSERT`](insert.html).

You can improve the performance of some statements that use foreign keys by also using [`INTERLEAVE IN PARENT`](interleave-in-parent.html), but there are tradeoffs. For more information about the performance implications of interleaved tables (as well as the limitations), see the **Interleave tables** section of [Performance best practices](performance-best-practices-overview.html#interleave-tables).

## Syntax

Foreign key constraints can be defined at the [table level](#table-level). However, if you only want the constraint to apply to a single column, it can be applied at the [column level](#column-level).

{{site.data.alerts.callout_info}}
You can also add the `FOREIGN KEY` constraint to existing tables through [`ADD CONSTRAINT`](add-constraint.html#add-the-foreign-key-constraint-with-cascade).
{{site.data.alerts.end}}

### Column level

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

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY,
    customer INT NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
    orderTotal DECIMAL(9,2),
    INDEX (customer)
  );
~~~
{{site.data.alerts.callout_danger}}
`CASCADE` does not list objects it drops or updates, so it should be used cautiously.
{{site.data.alerts.end}}

### Table level

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

{% include copy-clipboard.html %}
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

## Usage examples

### Use a foreign key constraint with default actions

In this example, we'll create a table with a foreign key constraint with the default [actions](#foreign-key-actions) (`ON UPDATE NO ACTION ON DELETE NO ACTION`).

First, create the referenced table:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers (id INT PRIMARY KEY, email STRING UNIQUE);
~~~

Next, create the referencing table:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY,
    customer INT NOT NULL REFERENCES customers (id),
    orderTotal DECIMAL(9,2),
    INDEX (customer)
  );
~~~

Let's insert a record into each table:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO customers VALUES (1001, 'a@co.tld'), (1234, 'info@cockroachlabs.com');
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO orders VALUES (1, 1002, 29.99);
~~~
~~~
pq: foreign key violation: value [1002] not found in customers@primary [id]
~~~

The second record insertion returns an error because the customer `1002` doesn't exist in the referenced table.

Let's insert a record into the referencing table and try to update the referenced table:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO orders VALUES (1, 1001, 29.99);
~~~

{% include copy-clipboard.html %}
~~~ sql
> UPDATE customers SET id = 1002 WHERE id = 1001;
~~~
~~~
pq: foreign key violation: value(s) [1001] in columns [id] referenced in table "orders"
~~~

The update to the referenced table returns an error because `id = 1001` is referenced and the default [foreign key action](#foreign-key-actions) is enabled (`ON UPDATE NO ACTION`). However, `id = 1234` is not referenced and can be updated:

{% include copy-clipboard.html %}
~~~ sql
> UPDATE customers SET id = 1111 WHERE id = 1234;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers;
~~~
~~~
   id  |         email
+------+------------------------+
  1001 | a@co.tld
  1111 | info@cockroachlabs.com
(2 rows)
~~~

Now let's try to delete a referenced row:

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM customers WHERE id = 1001;
~~~
~~~
pq: foreign key violation: value(s) [1001] in columns [id] referenced in table "orders"
~~~

Similarly, the deletion returns an error because `id = 1001` is referenced and the default [foreign key action](#foreign-key-actions) is enabled (`ON DELETE NO ACTION`). However, `id = 1111` is not referenced and can be deleted:

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM customers WHERE id = 1111;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers;
~~~
~~~
   id  |  email
+------+----------+
  1001 | a@co.tld
(1 row)
~~~

### Use a Foreign Key Constraint with `CASCADE`

In this example, we'll create a table with a foreign key constraint with the [foreign key actions](#foreign-key-actions) `ON UPDATE CASCADE` and `ON DELETE CASCADE`.

First, create the referenced table:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers_2 (
    id INT PRIMARY KEY
  );
~~~

Then, create the referencing table:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE orders_2 (
    id INT PRIMARY KEY,
    customer_id INT REFERENCES customers_2(id) ON UPDATE CASCADE ON DELETE CASCADE
  );
~~~

Insert a few records into the referenced table:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO customers_2 VALUES (1), (2), (3);
~~~

Insert some records into the referencing table:

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
  id
+----+
   2
   3
  23
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders_2;
~~~
~~~
  id  | customer_id
+-----+-------------+
  100 |          23
  101 |           2
  102 |           3
  103 |          23
(4 rows)
~~~

When `id = 1` was updated to `id = 23` in `customers_2`, the update propagated to the referencing table `orders_2`.

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
  id
+----+
   2
   3
(2 rows)
~~~

Let's check to make sure the rows in `orders_2` where `customers_id = 23` were also deleted:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders_2;
~~~
~~~
  id  | customer_id
+-----+-------------+
  101 |           2
  102 |           3
(2 rows)
~~~

### Use a Foreign Key Constraint with `SET NULL`

In this example, we'll create a table with a foreign key constraint with the [foreign key actions](#foreign-key-actions) `ON UPDATE SET NULL` and `ON DELETE SET NULL`.

First, create the referenced table:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers_3 (
    id INT PRIMARY KEY
  );
~~~

Then, create the referencing table:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE orders_3 (
    id INT PRIMARY KEY,
    customer_id INT REFERENCES customers_3(id) ON UPDATE SET NULL ON DELETE SET NULL
  );
~~~

Insert a few records into the referenced table:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO customers_3 VALUES (1), (2), (3);
~~~

Insert some records into the referencing table:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO orders_3 VALUES (100,1), (101,2), (102,3), (103,1);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders_3;
~~~
~~~
  id  | customer_id
+-----+-------------+
  100 |           1
  101 |           2
  102 |           3
  103 |           1
(4 rows)
~~~

Now, let's update an `id` in the referenced table:

{% include copy-clipboard.html %}
~~~ sql
> UPDATE customers_3 SET id = 23 WHERE id = 1;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers_3;
~~~
~~~
  id
+----+
   2
   3
  23
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders_3;
~~~
~~~
  id  | customer_id
+-----+-------------+
  100 |        NULL
  101 |           2
  102 |           3
  103 |        NULL
(4 rows)
~~~

When `id = 1` was updated to `id = 23` in `customers_3`, the referencing `customer_id` was set to `NULL`.

Similarly, a deletion will set the referencing `customer_id` to `NULL`. Let's delete `id = 2` from `customers_3`:

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM customers_3 WHERE id = 2;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers_3;
~~~
~~~
  id
+----+
   3
  23
(2 rows)
~~~

Let's check to make sure the row in `orders_3` where `customers_id = 2` was updated to `NULL`:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders_3;
~~~
~~~
  id  | customer_id
+-----+-------------+
  100 |        NULL
  101 |        NULL
  102 |           3
  103 |        NULL
(4 rows)
~~~

### Use a Foreign Key Constraint with `SET DEFAULT`

In this example, we'll create a table with a `FOREIGN` constraint with the [foreign key actions](#foreign-key-actions) `ON UPDATE SET DEFAULT` and `ON DELETE SET DEFAULT`.

First, create the referenced table:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers_4 (
    id INT PRIMARY KEY
  );
~~~

Then, create the referencing table with the `DEFAULT` value for `customer_id` set to `9999`:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE orders_4 (
    id INT PRIMARY KEY,
    customer_id INT DEFAULT 9999 REFERENCES customers_4(id) ON UPDATE SET DEFAULT ON DELETE SET DEFAULT
  );
~~~

Insert a few records into the referenced table:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO customers_4 VALUES (1), (2), (3), (9999);
~~~

Insert some records into the referencing table:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO orders_4 VALUES (100,1), (101,2), (102,3), (103,1);
~~~


{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders_4;
~~~
~~~
  id  | customer_id
+-----+-------------+
  100 |           1
  101 |           2
  102 |           3
  103 |           1
(4 rows)
~~~

Now, let's update an `id` in the referenced table:

{% include copy-clipboard.html %}
~~~ sql
> UPDATE customers_4 SET id = 23 WHERE id = 1;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers_4;
~~~
~~~
   id
+------+
     2
     3
    23
  9999
(4 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders_4;
~~~
~~~
  id  | customer_id
+-----+-------------+
  100 |        9999
  101 |           2
  102 |           3
  103 |        9999
(4 rows)
~~~

When `id = 1` was updated to `id = 23` in `customers_4`, the referencing `customer_id` was set to `DEFAULT` (i.e., `9999`). You can see this in the first and last rows of `orders_4`, where `id = 100` and the `customer_id` is now `9999`

Similarly, a deletion will set the referencing `customer_id` to the `DEFAULT` value. Let's delete `id = 2` from `customers_4`:

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM customers_4 WHERE id = 2;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers_4;
~~~
~~~
   id
+------+
     3
    23
  9999
(3 rows)
~~~

Let's check to make sure the corresponding `customer_id` value to `id = 101`, was updated to the `DEFAULT` value (i.e., `9999`) in `orders_4`:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders_4;
~~~
~~~
  id  | customer_id
+-----+-------------+
  100 |        9999
  101 |        9999
  102 |           3
  103 |        9999
(4 rows)
~~~

If the default value for the `customer_id` column is not set, and the column does not have a [`NOT NULL`](not-null.html) constraint, `ON UPDATE SET DEFAULT` and `ON DELETE SET DEFAULT` actions set referenced column values to `NULL`.

For example, let's create a new `customers_5` table and insert some values:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers_5 (
    id INT PRIMARY KEY
  );
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO customers_5 VALUES (1), (2), (3), (4);
~~~

Then we can create a new `orders_5` table that references the `customers_5` table, but with no default value specified for the `ON UPDATE SET DEFAULT` and `ON DELETE SET DEFAULT` actions:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE orders_5 (
    id INT PRIMARY KEY,
    customer_id INT REFERENCES customers_5(id) ON UPDATE SET DEFAULT ON DELETE SET DEFAULT
  );
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO orders_5 VALUES (200,1), (201,2), (202,3), (203,4);
~~~

Deleting and updating values in the `customers_5` table sets the referenced values in `orders_5` to `NULL`:

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM customers_5 WHERE id = 3;
~~~

{% include copy-clipboard.html %}
~~~ sql
> UPDATE customers_5 SET id = 0 WHERE id = 1;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders_5;
~~~
~~~
  id  | customer_id
+-----+-------------+
  200 |        NULL
  201 |           2
  202 |        NULL
  203 |           4
(4 rows)
~~~

### Add multiple foreign key constraints to a single column

 You can add more than one foreign key constraint to a single column.

For example, if you create the following tables:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers (
    id INT PRIMARY KEY,
    name STRING,
    email STRING
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT UNIQUE,
    item_number INT
 );
~~~

You can create a table with a column that references columns in both the `customers` and `orders` tables:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE shipments (
    tracking_number UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    carrier STRING,
    status STRING,
    customer_id INT,
    CONSTRAINT fk_customers FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_orders FOREIGN KEY (customer_id) REFERENCES orders(customer_id)
  );
~~~

Inserts into the `shipments` table must fulfill both foreign key constraints on `customer_id` (`fk_customers` and `fk_customers_2`).

Let's insert a record into each table:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO customers VALUES (1001, 'Alexa', 'a@co.tld'), (1234, 'Evan', 'info@cockroachlabs.com');
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO orders VALUES (1, 1001, 25), (2, 1234, 15), (3, 2000, 5);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO shipments (carrier, status, customer_id) VALUES ('USPS', 'Out for delivery', 1001);
~~~

The last statement succeeds because `1001` matches a unique `id` value in the `customers` table and a unique `customer_id` value in the `orders` table. If `1001` was in neither of the referenced columns, or in just one of them, the statement would return an error.

For instance, the following statement fulfills just one of the foreign key constraints and returns an error:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO shipments (carrier, status, customer_id) VALUES ('DHL', 'At facility', 2000);
~~~

~~~
ERROR: insert on table "shipments" violates foreign key constraint "fk_customers"
SQLSTATE: 23503
DETAIL: Key (customer_id)=(2000) is not present in table "customers".
~~~

CockroachDB allows you to add multiple foreign key constraints on the same column, that reference the same column:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE shipments ADD CONSTRAINT fk_customers_2 FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CONSTRAINTS FROM shipments;
~~~

~~~
  table_name | constraint_name | constraint_type |                               details                                | validated
-------------+-----------------+-----------------+----------------------------------------------------------------------+------------
  shipments  | fk_customers    | FOREIGN KEY     | FOREIGN KEY (customer_id) REFERENCES customers(id)                   |   true
  shipments  | fk_customers_2  | FOREIGN KEY     | FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE |   true
  shipments  | fk_orders       | FOREIGN KEY     | FOREIGN KEY (customer_id) REFERENCES orders(customer_id)             |   true
  shipments  | primary         | PRIMARY KEY     | PRIMARY KEY (tracking_number ASC)                                    |   true
(4 rows)
~~~

There are now two foreign key constraints on `customer_id` that reference the `customers(id)` column (i.e., `fk_customers` and `fk_customers_2`).

In the event of a `DELETE` or `UPDATE` to the referenced column (`customers(id)`), the action for the first foreign key specified takes precedence. In this case, that will be the default [action](#foreign-key-actions) (`ON UPDATE NO ACTION ON DELETE NO ACTION`) on the first foreign key constraint (`fk_customers`). This means that `DELETE`s on referenced columns will fail, even though the second foreign key constraint (`fk_customer_2`) is defined with the `ON DELETE CASCADE` action.

{% include copy-clipboard.html %}
~~~ sql
> DELETE FROM orders WHERE customer_id = 1001;
~~~

~~~
ERROR: delete on table "orders" violates foreign key constraint "fk_orders" on table "shipments"
SQLSTATE: 23503
DETAIL: Key (customer_id)=(1001) is still referenced from table "shipments".
~~~

### Match composite foreign keys with `MATCH SIMPLE` and `MATCH FULL`

The examples in this section show how composite foreign key matching works for both the `MATCH SIMPLE` and `MATCH FULL` algorithms. For a conceptual overview, see [Composite foreign key matching](#composite-foreign-key-matching).

First, let's create some tables. `parent` is a table with a composite key:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE parent (x INT, y INT,  z INT, UNIQUE (x, y, z));
~~~

`full_test` has a foreign key on `parent` that uses the `MATCH FULL` algorithm:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE full_test (
    x INT,
    y INT,
    z INT,
    FOREIGN KEY (x, y, z) REFERENCES parent (x, y, z) MATCH FULL ON DELETE CASCADE ON UPDATE CASCADE
  );
~~~

`simple_test` has a foreign key on `parent` that uses the `MATCH SIMPLE` algorithm (the default):

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE simple_test (
    x INT,
    y INT,
    z INT,
    FOREIGN KEY (x, y, z) REFERENCES parent (x, y, z) ON DELETE CASCADE ON UPDATE CASCADE
  );
~~~

Next, we populate `parent` with some values:

{% include copy-clipboard.html %}
~~~ sql
> INSERT
    INTO parent
  VALUES (1, 1, 1),
         (2, 1, 1),
         (1, 2, 1),
         (1, 1, 2),
         (NULL, NULL, NULL),
         (1, NULL, NULL),
         (NULL, 1, NULL),
         (NULL, NULL, 1),
         (1, 1, NULL),
         (1, NULL, 1),
         (NULL, 1, 1);
~~~

Now let's look at some `INSERT` statements to see how the different key matching algorithms work.

- [MATCH SIMPLE](#match-simple)
- [MATCH FULL](#match-full)

#### MATCH SIMPLE

Inserting values into the table using the `MATCH SIMPLE` algorithm (described [above](#composite-foreign-key-matching)) gives the following results:

| Statement                                         | Can insert? | Throws error? | Notes                         |
|---------------------------------------------------+-------------+---------------+-------------------------------|
| `INSERT INTO simple_test VALUES (1,1,1)`          | Yes         | No            | References `parent (1,1,1)`.  |
| `INSERT INTO simple_test VALUES (NULL,NULL,NULL)` | Yes         | No            | Does not reference `parent`.  |
| `INSERT INTO simple_test VALUES (1,NULL,NULL)`    | Yes         | No            | Does not reference `parent`.  |
| `INSERT INTO simple_test VALUES (NULL,1,NULL)`    | Yes         | No            | Does not reference `parent`.  |
| `INSERT INTO simple_test VALUES (NULL,NULL,1)`    | Yes         | No            | Does not reference `parent`.  |
| `INSERT INTO simple_test VALUES (1,1,NULL)`       | Yes         | No            | Does not reference `parent`.  |
| `INSERT INTO simple_test VALUES (1,NULL,1)`       | Yes         | No            | Does not reference `parent`.  |
| `INSERT INTO simple_test VALUES (NULL,1,1)`       | Yes         | No            | Does not reference `parent`.  |
| `INSERT INTO simple_test VALUES (2,2,NULL)`       | Yes         | No            | Does not reference `parent`.  |
| `INSERT INTO simple_test VALUES (2,2,2)`          | No          | Yes           | No `parent` reference exists. |

#### MATCH FULL

Inserting values into the table using the `MATCH FULL` algorithm (described [above](#composite-foreign-key-matching)) gives the following results:

| Statement                                       | Can insert? | Throws error? | Notes                                               |
|-------------------------------------------------+-------------+---------------+-----------------------------------------------------|
| `INSERT INTO full_test VALUES (1,1,1)`          | Yes         | No            | References `parent(1,1,1)`.                         |
| `INSERT INTO full_test VALUES (NULL,NULL,NULL)` | Yes         | No            | Does not reference `parent`.                        |
| `INSERT INTO full_test VALUES (1,NULL,NULL)`    | No          | Yes           | Can't mix null and non-null values in `MATCH FULL`. |
| `INSERT INTO full_test VALUES (NULL,1,NULL)`    | No          | Yes           | Can't mix null and non-null values in `MATCH FULL`. |
| `INSERT INTO full_test VALUES (NULL,NULL,1)`    | No          | Yes           | Can't mix null and non-null values in `MATCH FULL`. |
| `INSERT INTO full_test VALUES (1,1,NULL)`       | No          | Yes           | Can't mix null and non-null values in `MATCH FULL`. |
| `INSERT INTO full_test VALUES (1,NULL,1)`       | No          | Yes           | Can't mix null and non-null values in `MATCH FULL`. |
| `INSERT INTO full_test VALUES (NULL,1,1)`       | No          | Yes           | Can't mix null and non-null values in `MATCH FULL`. |
| `INSERT INTO full_test VALUES (2,2,NULL)`       | No          | Yes           | Can't mix null and non-null values in `MATCH FULL`. |
| `INSERT INTO full_test VALUES (2,2,2)`          | No          | Yes           | No `parent` reference exists.                       |

## See also

- [Constraints](constraints.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`ADD CONSTRAINT`](add-constraint.html)
- [`CHECK` constraint](check.html)
- [`DEFAULT` constraint](default-value.html)
- [`NOT NULL` constraint](not-null.html)
- [`PRIMARY KEY` constraint](primary-key.html)
- [`UNIQUE` constraint](unique.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
