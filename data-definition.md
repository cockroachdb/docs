---
title: Data Definition
toc: true
---

## Identifiers

When naming a database, table, column, or other object, the identifier you use must follow these rules:

- Must begin with a letter (a-z, but also letters with diacritical marks and non-Latin letters) or an underscore (_). Subsequent characters can be letters, underscores, digits (0-9), or dollar signs ($).
- Must not be a [reserved keyword](sql-grammar.html#reserved_keyword). This rule does not apply to column names.
- Must be unique within its context. For example, you cannot have two identically-named databases in a cluster or two identically-named columns in a single table. 

To bypass either of the first two rules, simply surround the identifier with double-quotes.

## Constraints

Constraints offer additional data integrity by enforcing conditions on the data within a column or row. They are checked during DML operations and restrict the data values within a column to those specified within the constraint.

If a constraint refers to only one column (column level constraint) it can be defined against the column as part of its definition. If a constraint refers to more than one column (table level constraint) it needs to be defined as a separate entry in the tables definition.  

The order of the constraints within the table definition is not important and does not determine the order in which the constraints are checked. Use the [`SHOW CREATE TABLE`](show-create-table.html) command to show the constraints defined on a table.

<!-- % include sql/diagrams/column_constraint.html % -->

<!-- % include sql/diagrams/table_constraint.html % -->

The different types of constraints are:


| Constraint Type | Description |
|-----------------|-------------|
| NOT NULL | Specifies the column **may not** contain *NULL* values. See [NOT NULL](data-definition.html#not-null) Constraint.  |
| Primary Key | Specifies that the column(s) values are unique and that the column(s) **may not** contain *NULL* values. See [Primary Key](data-definition.html#primary-key) Constraint. |
| Unique | Specifies that the column(s) values are unique and that the column(s) **may** contain *NULL* values. See [Unique](data-definition.html#unique) Constraint. |
| Check |  Specifies that the column value must satisfy a Boolean expression. See [Check](data-definition.html#check) Constraint. |
| Default Value | Specifies a value to populate a column with if none is provided. See [Default Value](data-definition.html#default-value) Constraint. |


### NOT NULL

A NOT NULL constraint is specified using `NOT NULL` at the column level. It requires that the column's value is mandatory and must contain a value that is not *NULL*. You can also explicitly just say `NULL` which means the column's value is optional and the column may contain a *NULL* value. If nothing is specified, the default is `NULL`.


~~~sql
CREATE TABLE customers
(
  customer_id INT         PRIMARY KEY,
  cust_name   STRING(30)  NULL,
  cust_email  STRING(100) NOT NULL
);

INSERT INTO customers (customer_id, cust_name, cust_email) VALUES (1, 'Smith', NULL);
pq: null value in column "cust_email" violates not-null constraint
~~~


### Primary Key

A Primary Key constraint is specified using `PRIMARY KEY` at either the column or table level. It requires that the column(s) values are unique and that the column(s) **may not** contain *NULL* values. You can optionally give the constraint a name using the `CONSTRAINT name` syntax, otherwise the constraint and it's associated unique index are called **primary**. 

{{site.data.alerts.callout_info}}
Strictly speaking, a primary key's unique index is not created, it's derived from the key(s) under which the data is stored so it takes no additional space. However, it appears as a normal unique index when using commands like SHOW INDEXES.
{{site.data.alerts.end}}

Columns that are part of a Primary Key are mandatory (NOT NULL). If an optional (nullable) column is made part of a Primary Key, it is made mandatory (NOT NULL). 

The Primary Key for a table can only be specified in the [`CREATE TABLE`](create-table.html) statement. It can't be changed latter using statements like `ALTER TABLE` or `DROP INDEX`.

A Primary Key constraint can be specified at the column level if it has only one column.

~~~sql
CREATE TABLE orders
(
  order_id        INT PRIMARY KEY NOT NULL,
  order_date      TIMESTAMP NOT NULL,
  order_mode      STRING(8),
  customer_id     INT,
  order_status    INT
 );
~~~

It needs to be specified at the table level if it has more than one column.

~~~sql
CREATE TABLE inventories
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

~~~sql
CREATE TABLE warehouses
(
  warehouse_id    INT        PRIMARY KEY NOT NULL,
  warehouse_name  STRING(35) UNIQUE,
  location_id     INT
);
~~~

It needs to be specified at the table level if it has more than one column.

~~~sql
CREATE TABLE logon
(
  login_id	INT PRIMARY KEY, 
  customer_id   INT,
  logon_date    TIMESTAMP,
  UNIQUE (customer_id, logon_date)
);
~~~

Be aware that if a table has a `UNIQUE` constraint on column(s) that are optional (nullable), it is still possible to insert duplicate rows that appear to violate the constraint if they contain a *NULL* value in at least one of the columns. This is because *NULL*s are never considered equal and hence don't violate the uniqueness constraint.

~~~sql
CREATE TABLE logon
(
  login_id INT PRIMARY KEY, 
  customer_id   INT NOT NULL,
  sales_id INT,
  UNIQUE (customer_id, sales_id)
);

INSERT INTO logon (login_id, customer_id, sales_id) VALUES (1, 2, NULL);

INSERT INTO logon (login_id, customer_id, sales_id) VALUES (2, 2, NULL);

select * from logon;
+----------+-------------+----------+
| login_id | customer_id | sales_id |
+----------+-------------+----------+
|        1 |           2 | NULL     |
|        2 |           2 | NULL     |
+----------+-------------+----------+
~~~


### Check

A Check constraint is specified using `CHECK` at the column or table level. It requires that the column(s) value satisfies a Boolean expression within the constraint. The expression must evaluate to TRUE or NULL for every row affected by an INSERT or UPDATE statement. The DML statement will fail if the condition evaluates to FALSE for any row.

You can have multiple Check constraints on a single column but ideally these should be combined using the logical operators. So, for example, 

~~~sql
warranty_period INT CHECK (warranty_period >= 0) CHECK (warranty_period <= 24)
~~~
should be specified as 

~~~sql
warranty_period INT CHECK (warranty_period BETWEEN 0 AND 24)
~~~

{{site.data.alerts.callout_warning}}
Check constraints are still under developement and are not yet ready for production use. They are currently not checked during UPDATE operations.
{{site.data.alerts.end}}

Check constraints that refer to multiple columns should be specified at the table level. 

~~~sql
CREATE TABLE inventories
(
  product_id        INT NOT NULL,
  warehouse_id      INT NOT NULL,
  quantity_on_hand  INT NOT NULL,
  PRIMARY KEY (product_id, warehouse_id),
  CONSTRAINT ok_to_supply CHECK (quantity_on_hand > 0 AND warehouse_id BETWEEN 100 AND 200)
);
~~~

Check constraints may be specified at the column or table level and can reference other columns within the table. Internally, all column level Check constrints are converted to table level constraints so they can be handled in a consistent fashion.

~~~sql
CREATE TABLE inventories
(
  product_id        INT NOT NULL,
  warehouse_id      INT NOT NULL,
  quantity_on_hand  INT NOT NULL CHECK (quantity_on_hand > 0),
  PRIMARY KEY (product_id, warehouse_id)
);

INSERT INTO inventories (product_id, warehouse_id, quantity_on_hand) VALUES (1, 2, -20);
pq: failed to satisfy CHECK constraint (quantity_on_hand > 0)
~~~

{{site.data.alerts.warning}}
If a Check constraint is defined on an optional column (one where a NULL value is allowed), then all insert or update statements containing rows with NULL values in that column will fail because the condition will not evaluate to TRUE when a NULL is used in the expression. To work around this, include the condition "OR column IS NULL" in the Check constraint.
{{site.data.alerts.end}}

For Example:

~~~sql
CREATE TABLE product_information
(
  product_id           INT PRIMARY KEY NOT NULL,
  product_name         STRING(50),
  warranty_period      INT CHECK ( (warranty_period >= 0 AND warranty_period <= 24) OR warranty_period IS NULL),
  supplier_id          INT
);
~~~

<!-- ### References Constraint -->


### Default Value

A Default Value constraint is specified using `DEFAULT` at the column level. It supplies a value to a column if one is not provided on insert. The value may be a hard-coded literal or an expression that is evaluated at the time the row is inserted.
The Datatype of the DEFAULT value or expression should be the same as the Datatype of the column.
The DEFAULT constraint only applies on insert if the column is not specified in the INSERT statement. You can still insert a *NULL* into an optional (nullable) column by explicitly stating the column and the *NULL* value.

~~~sql
CREATE TABLE inventories
(
  product_id        INT NOT NULL,
  warehouse_id      INT NOT NULL,
  quantity_on_hand  INT DEFAULT 100,
  PRIMARY KEY (product_id, warehouse_id)
);

INSERT INTO inventories (product_id, warehouse_id) VALUES (1,20);

INSERT INTO inventories (product_id, warehouse_id, quantity_on_hand) VALUES (2,30, NULL);

SELECT * FROM inventories;
+------------+--------------+------------------+
| product_id | warehouse_id | quantity_on_hand |
+------------+--------------+------------------+
|          1 |           20 |              100 |
|          2 |           30 | NULL             |
+------------+--------------+------------------+
~~~

If no `DEFAULT` constraint is specified and an explicit value is not given, a value of *NULL* is assigned to the column. This may cause an error if the column has a `NOT NULL` constraint. 


## Indexes

Indexes are used to quickly locate data without having to look through every row of a table. They can be created during table creation ([`CREATE TABLE`](create-table.html)) or separately using the [`CREATE INDEX`](create-index.html) statement. During table creation, indexes are automatically created for the primary key of a table and any columns with a unique constraint.

Other index-related SQL statements:

- [`DROP INDEX`](drop-index.html) 
- [`RENAME INDEX`](rename-index.html) 
- [`SHOW INDEX`](show-index.html). 
 
To understand how CockroachDB chooses the best index for running a query, see [Index Selection in CockroachDB](https://www.cockroachlabs.com/blog/index-selection-cockroachdb-2/).
