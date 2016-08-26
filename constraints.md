---
title: Constraints
summary: Constraints offer additional data integrity by enforcing conditions on the data within a column or row. They are checked during DML operations and restrict the data values within a column to those specified within the constraint.
toc: false
---

Constraints offer additional data integrity by enforcing conditions on the data within a column or row. They are checked during DML operations and restrict the data values within a column to those specified within the constraint.

If a constraint refers to only one column (column-level constraint) it can be defined against the column as part of its definition. If a constraint refers to more than one column (table-level constraint) it needs to be defined as a separate entry in the tables definition.  

The order of the constraints within the table definition is not important and does not determine the order in which the constraints are checked. Use the [`SHOW CONSTRAINTS`](show-constraints.html) or [`SHOW CREATE TABLE`](show-create-table.html) statement to show the constraints defined on a table.

**column_level_constraint ::=**
{% include sql/diagrams/col_qual_list.html %}

**table_level_constraint ::=**
{% include sql/diagrams/table_constraint.html %}

The different types of constraints are:


| Constraint Type | Description |
|-----------------|-------------|
| NOT NULL | Specifies the column **may not** contain *NULL* values. See [NOT NULL](#not-null) Constraint.  |
| Primary Key | Specifies that the column(s) values are unique and that the column(s) **may not** contain *NULL* values. See [Primary Key](#primary-key) Constraint. |
| Unique | Specifies that the column(s) values are unique and that the column(s) **may** contain *NULL* values. See [Unique](#unique) Constraint. |
| Check |  Specifies that the column value must satisfy a Boolean expression. See [Check](#check) Constraint. |
| Default Value | Specifies a value to populate a column with if none is provided. See [Default Value](#default-value) Constraint. |
| Foreign Keys | Specifies a column can only contain values exactly matching existing values from the column it references. See [Foreign Keys](#foreign-keys) Constraint. |

### NOT NULL

A NOT NULL constraint is specified using `NOT NULL` at the column level. It requires that the column's value is mandatory and must contain a value that is not *NULL*. You can also explicitly just say `NULL` which means the column's value is optional and the column may contain a *NULL* value. If nothing is specified, the default is `NULL`.

~~~ sql
> CREATE TABLE customers
(
  customer_id INT         PRIMARY KEY,
  cust_name   STRING(30)  NULL,
  cust_email  STRING(100) NOT NULL
);

> INSERT INTO customers (customer_id, cust_name, cust_email) VALUES (1, 'Smith', NULL);
~~~
~~~
pq: null value in column "cust_email" violates not-null constraint
~~~

### Primary Key

A Primary Key constraint is specified using `PRIMARY KEY` at either the column or table level. It requires that the column(s) values are unique and that the column(s) **may not** contain *NULL* values. You can optionally give the constraint a name using the `CONSTRAINT name` syntax, otherwise the constraint and it's associated unique index are called **primary**. 

{{site.data.alerts.callout_info}}Strictly speaking, a primary key's unique index is not created, it's derived from the key(s) under which the data is stored so it takes no additional space. However, it appears as a normal unique index when using commands like <code>SHOW INDEXES</code>.{{site.data.alerts.end}}

Columns that are part of a Primary Key are mandatory (NOT NULL). If an optional (nullable) column is made part of a Primary Key, it is made mandatory (NOT NULL). 

The Primary Key for a table can only be specified in the [`CREATE TABLE`](create-table.html) statement. It can't be changed latter using statements like `ALTER TABLE` or `DROP INDEX`.

A Primary Key constraint can be specified at the column level if it has only one column.

~~~ sql
> CREATE TABLE orders
(
  order_id        INT PRIMARY KEY NOT NULL,
  order_date      TIMESTAMP NOT NULL,
  order_mode      STRING(8),
  customer_id     INT,
  order_status    INT
 );
~~~

It needs to be specified at the table level if it has more than one column.

~~~ sql
> CREATE TABLE inventories
(
  product_id        INT NOT NULL,
  warehouse_id      INT NOT NULL,
  quantity_on_hand  INT NOT NULL,
  PRIMARY KEY (product_id, warehouse_id)
);
~~~

### Unique

A Unique constraint is specified using `UNIQUE` at either the column or table level. It requires that the column(s) values are unique and that the column(s) **may** contain *NULL* values. You can optionally give the constraint a name using the `CONSTRAINT name` syntax, otherwise the constraint and it's associated index are called ***\<tablename\>*_*\<columnname(s)\>*_key**.

A Unique constraint can be specified at the column level if it has only one column.

~~~ sql
> CREATE TABLE warehouses
(
  warehouse_id    INT        PRIMARY KEY NOT NULL,
  warehouse_name  STRING(35) UNIQUE,
  location_id     INT
);
~~~

It needs to be specified at the table level if it has more than one column.

~~~ sql
> CREATE TABLE logon
(
  login_id	INT PRIMARY KEY, 
  customer_id   INT,
  logon_date    TIMESTAMP,
  UNIQUE (customer_id, logon_date)
);
~~~

Be aware that if a table has a `UNIQUE` constraint on column(s) that are optional (nullable), it is still possible to insert duplicate rows that appear to violate the constraint if they contain a *NULL* value in at least one of the columns. This is because *NULL*s are never considered equal and hence don't violate the uniqueness constraint.

~~~ sql
> CREATE TABLE logon
(
  login_id INT PRIMARY KEY, 
  customer_id   INT NOT NULL,
  sales_id INT,
  UNIQUE (customer_id, sales_id)
);

> INSERT INTO logon (login_id, customer_id, sales_id) VALUES (1, 2, NULL);
> INSERT INTO logon (login_id, customer_id, sales_id) VALUES (2, 2, NULL);

> SELECT * FROM logon;
~~~
~~~
+----------+-------------+----------+
| login_id | customer_id | sales_id |
+----------+-------------+----------+
|        1 |           2 | NULL     |
|        2 |           2 | NULL     |
+----------+-------------+----------+
~~~

### Check

A Check constraint is specified using `CHECK` at the column or table level. It requires that the column(s) value satisfies a Boolean expression within the constraint. The expression must evaluate to TRUE (or NULL) for every row affected by an INSERT or UPDATE statement. The DML statement will fail if the condition evaluates to FALSE for any row.

You can have multiple Check constraints on a single column but ideally these should be combined using the logical operators. So, for example, 

~~~ sql
warranty_period INT CHECK (warranty_period >= 0) CHECK (warranty_period <= 24)
~~~
should be specified as 

~~~ sql
warranty_period INT CHECK (warranty_period BETWEEN 0 AND 24)
~~~

Check constraints that refer to multiple columns should be specified at the table level. 

~~~ sql
> CREATE TABLE inventories
(
  product_id        INT NOT NULL,
  warehouse_id      INT NOT NULL,
  quantity_on_hand  INT NOT NULL,
  PRIMARY KEY (product_id, warehouse_id),
  CONSTRAINT ok_to_supply CHECK (quantity_on_hand > 0 AND warehouse_id BETWEEN 100 AND 200)
);
~~~

Check constraints may be specified at the column or table level and can reference other columns within the table. Internally, all column level Check constrints are converted to table level constraints so they can be handled in a consistent fashion.

~~~ sql
> CREATE TABLE inventories
(
  product_id        INT NOT NULL,
  warehouse_id      INT NOT NULL,
  quantity_on_hand  INT NOT NULL CHECK (quantity_on_hand > 0),
  PRIMARY KEY (product_id, warehouse_id)
);

> INSERT INTO inventories (product_id, warehouse_id, quantity_on_hand) VALUES (1, 2, -20);
~~~
~~~
pq: failed to satisfy CHECK constraint (quantity_on_hand > 0)
~~~

### Default Value

A Default Value constraint is specified using `DEFAULT` at the column level. It supplies a value to a column if one is not provided on insert. The value may be a hard-coded literal or an expression that is evaluated at the time the row is inserted.
The Datatype of the DEFAULT value or expression should be the same as the Datatype of the column.
The DEFAULT constraint only applies on insert if the column is not specified in the INSERT statement. You can still insert a *NULL* into an optional (nullable) column by explicitly stating the column and the *NULL* value.

~~~ sql
> CREATE TABLE inventories
(
  product_id        INT NOT NULL,
  warehouse_id      INT NOT NULL,
  quantity_on_hand  INT DEFAULT 100,
  PRIMARY KEY (product_id, warehouse_id)
);

> INSERT INTO inventories (product_id, warehouse_id) VALUES (1,20);

> INSERT INTO inventories (product_id, warehouse_id, quantity_on_hand) VALUES (2,30, NULL);

> SELECT * FROM inventories;
~~~
~~~
+------------+--------------+------------------+
| product_id | warehouse_id | quantity_on_hand |
+------------+--------------+------------------+
|          1 |           20 |              100 |
|          2 |           30 | NULL             |
+------------+--------------+------------------+
~~~

If no `DEFAULT` constraint is specified and an explicit value is not given, a value of *NULL* is assigned to the column. This may cause an error if the column has a `NOT NULL` constraint.

### Foreign Keys

The Foreign Key constraint is specified using `REFERENCES` at the column level or `FOREIGN KEY` and `REFERENCES` at the table level. It helps enforce referential integrity between two tables by guaranteeing that all values in a table's foreign key columns exist in the referenced columns of another table, as well as preventing referenced values from being updated or deleted.

For example, if you create a foreign key on `orders.customer` that references `customers.id`:

- Each value inserted or updated in `orders.customer` must exactly match a value in `customers.id`.
- Values in `customers.id` that are referenced by `orders.customer` cannot be deleted or updated. However, `customers.id` values that _aren't_ present in `orders.customer` can be.

#### Rules for Creating Foreign Keys

__Foreign Key Columns__

- Only new tables created via [`CREATE TABLE`](create-table.html#create-a-table-with-foreign-keys) can use foreign keys. In a future release, we plan to add support for existing tables through `ALTER TABLE`.
- You must [index](indexes.html) foreign key columns in the [`CREATE TABLE`](create-table.html) statement. You can do this explicitly using [`INDEX`](create-table.html#create-a-table-with-secondary-indexes) or implicitly with [`PRIMARY KEY`](#primary-key) or [`UNIQUE`](#unique), which both automatically create indexes of their constrained columns. <br><br>Using the foreign key columns as the prefix of an index's columns also satisfies this requirement. For example, if you create foreign key columns `(A, B)`, an index of columns `(A, B, C)` satisfies the requirement for an index.
- Foreign key columns must use their referenced column's [type](data-types.html).
- Each column cannot belong to more than 1 Foreign Key constraint.

__Referenced Columns__

- Referenced columns must contain only unique sets of values. This means the `REFERENCES` clause must use exactly the same columns as a [`UNIQUE`](#unique) or [`PRIMARY KEY`](#primary-key) constraint on the referenced table. For example, the clause `REFERENCES tbl (C, D)` requires `tbl` to have either the constraint `UNIQUE (C, D)` or `PRIMARY KEY (C, D)`.
- In the `REFERENCES` clause, if you specify a table but no columns, CockroachDB references the table's primary key. In these cases, the Foreign Key constraint and the referenced table's primary key must contain the same number of columns.

#### _NULL_ Values

Single-column foreign keys accept _NULL_ values.

Multiple-column foreign keys only accept _NULL_ values in these scenarios:

- The row you're ultimately referencing&mdash;determined by the statement's other values&mdash;contains _NULL_ as the value of the referenced column (i.e., _NULL_ is valid from the perspective of referential integrity)
- The write contains _NULL_ values for all foreign key columns

For example, if you have a Foreign Key constraint on columns `(A, B)` and try to insert `(1, NULL)`, the write would fail unless the row with the value `1` for `(A)` contained a _NULL_ value for `(B)`. However, inserting `(NULL, NULL)` would succeed.

However, allowing _NULL_ values in either your foreign key or referenced columns can degrade their referential integrity. To avoid this, you can use [`NOT NULL`](#not-null) on both sets of columns when [creating your tables](create-table.html). (`NOT NULL` cannot be added to existing tables.)

#### Performance

Because the Foreign Key constraint requires per-row checks on two tables, statements involving foreign key or referenced columns can take longer to execute. You're most likely to notice this with operations like bulk inserts into the table with the foreign keys.

We're currently working to improve the performance of these statements, though.

#### Example

~~~ sql
> CREATE TABLE customers (id INT PRIMARY KEY, email STRING UNIQUE);

> CREATE TABLE orders 
(
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

#### Remove the Foreign Key Constraint

The Foreign Key constraint depends on [the index of foreign key columns](#rules-for-creating-foreign-keys). To remove the Foreign Key constraint you must [drop that index](drop-index.html) with the `CASCADE` clause, which also drops the constraint.

{{site.data.alerts.callout_danger}}<code>CASCADE</code> also drops any other objects that depend on the index.{{site.data.alerts.end}}

~~~ sql
> SHOW CONSTRAINTS FROM orders;
~~~
~~~
+--------+---------------------------+-------------+------------+----------------+
| Table  |           Name            |    Type     | Column(s)  |    Details     |
+--------+---------------------------+-------------+------------+----------------+
| orders | fk_customer_ref_customers | FOREIGN KEY | [customer] | customers.[id] |
| orders | primary                   | PRIMARY KEY | [id]       | NULL           |
+--------+---------------------------+-------------+------------+----------------+
~~~
~~~ sql
> SHOW INDEX FROM orders;
~~~
~~~
+--------+---------------------+--------+-----+----------+-----------+---------+
| Table  |        Name         | Unique | Seq |  Column  | Direction | Storing |
+--------+---------------------+--------+-----+----------+-----------+---------+
| orders | primary             | true   |   1 | id       | ASC       | false   |
| orders | orders_customer_idx | false  |   1 | customer | ASC       | false   |
+--------+---------------------+--------+-----+----------+-----------+---------+
~~~
~~~ sql
> DROP INDEX orders@orders_customer_idx CASCADE;

> SHOW CONSTRAINTS FROM orders;
~~~
~~~
+--------+---------+-------------+-----------+---------+
| Table  |  Name   |    Type     | Column(s) | Details |
+--------+---------+-------------+-----------+---------+
| orders | primary | PRIMARY KEY | [id]      | NULL    |
+--------+---------+-------------+-----------+---------+
~~~

## See Also

- [`CREATE TABLE`](create-table.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
