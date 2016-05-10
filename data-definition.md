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


The order of the constaints within the table definition is not important and does not determine the order in which the constraints are checked.


| Constraint Type | Description |
|-----------------|-------------|
| NOT NULL | Specifies the column **cannot** contain *NULL* values. See [NOT NULL](data-definition.html#not-null-constraint) Constraint.  |
| Primary Key | Specifies that the column(s) values are unique and that the column(s) **may not** contain *NULL* values. See [Primary Key](data-definition.html#primary-key-constraint) Constraint. |
| Unique Key | Specifies that the column(s) values are unique and that the column(s) **may** contain *NULL* values. See [Unique Key](data-definition.html#unique-key-constraint) Constraint. |
| Check |  See [Check](data-definition.html#check-constraint) Constraint. |
| Default Value | See [Default Value](data-definition.html#default-value-constraint) Constraint. |


### NOT NULL Constraint

`NULL` specifies the column can contain *NULL* values. `NOT NULL` means the column is mandatory and must contain a value. The default is `NULL` and can be omitted if desired.
Attempting to insert or update a row containing a *NULL* value in a `NOT NULL` column will result in a ??? error.

~~~sql
CREATE TABLE customers
(
  customer_id      INT PRIMARY KEY NOT NULL,
  cust_first_name  STRING(30)      NOT NULL,
  cust_last_name   STRING(30)      NOT NULL,
  cust_email       STRING(100)	   NOT NULL
);

INSERT INTO customers (customer_id, cust_first_name, cust_last_name, cust_email) VALUES (1, 'Joe', 'Smith', NULL);
~~~


### Primary Key Constraint

Specifies the column values are unique and that the column may **not** contain *NULL* values. A `UNIQUE` index called **primary** is created on the column.

A Primary Key constraint needs to be specified as a table level constraint if there is more than one column in the Primary Key.

~~~sql
CREATE TABLE inventories
(
  product_id        INT NOT NULL,
  warehouse_id      INT NOT NULL,
  quantity_on_hand  INT NOT NULL,
  PRIMARY KEY (product_id, warehouse_id)
);
~~~

If there is only one column in the Primary Key, it may be specified at the column or table level.

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


### Unique Key Constraint

Specifies the column values are unique and that the column may contain *NULL* values. A `UNIQUE` index called ***\<tablename\>*_*\<columnname\>*_key** is created on the column.

An Unique Key constraint needs to be specified as a table level constraint if there is more than one column in the Unique Key.

~~~sql
CREATE TABLE logon
(
  login_id	INT PRIMARY KEY, 
  customer_id   INT,
  logon_date    TIMESTAMP,
  UNIQUE KEY (customer_id, logon_date)
);

If there is only one column in the Unique Key, it may be specified at the column or table level.

~~~sql
CREATE TABLE warehouses
(
  warehouse_id    INT        PRIMARY KEY NOT NULL,
  warehouse_name  STRING(35) UNIQUE KEY,
  location_id     INT,
);
~~~

Piece here about unique keys and NULL values.


### Check Constraint

A Check constraint allows you to specify a boolean expression that must evaluate to true for every row affected by an INSERT or UPDATE statement. The DML statement will fail if the condition evaluates to false or unknown for any row.

You can only have one Check constraint on a single column but you can combine multiple conditions with the AND operator and you can have Check constraints on multiple columns but an argument of a Check constraint cannot refer to other columns.



Check constraints are unnamed unlike some flavours of SQL.


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

Check constraints can only be specified at the column level, not at the table level.


{{site.data.alerts.warning}}
If a Check constraint is defined on an optional column (one where a NULL value is allowed), then all INSERT or UPDATE statements containing rows with NULL values in that column will fail because the condition will not evaluate to true when a NULL is used in the expression. To work around this, include the condition "OR column IS NULL" in the Check constraint.
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




<!-- ### Foreign Key Constraint -->


### Default Value Constraint

Specify a `DEFAULT` constraint to give a value to a column if the value is *NULL* on insert.
The Datatype of the DEFAULT value should be the same as the Datatype of the column.
The DEFAULT constraint only applies on INSERT if the column is not specified in the INSERT statement. You can still insert a *NULL* into an optional column by explicitly stating the column and the *NULL* value.

~~~sql
CREATE TABLE inventories
(
  product_id        INT NOT NULL,
  warehouse_id      INT NOT NULL,
  quantity_on_hand  INT DEFAULT 0,
  PRIMARY KEY (product_id, warehouse_id)
);

INSERT INTO inventories (product_id, warehouse_id)
VALUES (1,20);

INSERT INTO inventories (product_id, warehouse_id, quantity_on_hand)
VALUES (2,30, NULL);

SELECT * FROM inventories;

~~~



## Indexes

Coming soon.