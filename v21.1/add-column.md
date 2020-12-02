---
title: ADD COLUMN
summary: Use the ADD COLUMN statement to add columns to tables.
toc: true
---

The `ADD COLUMN` [statement](sql-statements.html) is part of `ALTER TABLE` and adds columns to tables.

{% include {{ page.version.version }}/sql/combine-alter-table-commands.md %}

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/add_column.html %}
</div>

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the table.

## Parameters

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table to which you want to add the column.
 `column_name` | The name of the column you want to add. The column name must follow these [identifier rules](keywords-and-identifiers.html#identifiers) and must be unique within the table but can have the same name as indexes or constraints.  
 `typename` | The [data type](data-types.html) of the new column.
 `col_qualification` | An optional list of column definitions, which may include [column-level constraints](constraints.html), [collation](collate.html), or [column family assignments](column-families.html).<br><br>If the column family is not specified, the column will be added to the first column family. For more information about how column families are assigned, see [Column Families](column-families.html#assign-column-families-when-adding-columns).

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

### Setup

The following examples use the [`bank` demo database schema](cockroach-demo.html#datasets).

To follow along, run [`cockroach demo bank`](cockroach-demo.html) to start a temporary, in-memory cluster with the `bank` schema and dataset preloaded:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo bank
~~~

### Add a single column

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN active BOOL;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  id          | INT8      |    false    | NULL           |                       | {primary} |   false
  balance     | INT8      |    true     | NULL           |                       | {}        |   false
  payload     | STRING    |    true     | NULL           |                       | {}        |   false
  active      | BOOL      |    true     | NULL           |                       | {}        |   false
(4 rows)
~~~

### Add multiple columns

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN location STRING, ADD COLUMN currency STRING;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------+------------
  id          | INT8      |    false    | NULL           |                       | {primary} |   false
  balance     | INT8      |    true     | NULL           |                       | {}        |   false
  payload     | STRING    |    true     | NULL           |                       | {}        |   false
  active      | BOOL      |    true     | NULL           |                       | {}        |   false
  location    | STRING    |    true     | NULL           |                       | {}        |   false
  currency    | STRING    |    true     | NULL           |                       | {}        |   false
(6 rows)
~~~

### Add a column with a `NOT NULL` constraint and a `DEFAULT` value

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN interest DECIMAL NOT NULL DEFAULT (DECIMAL '1.3');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~
~~~
  column_name | data_type | is_nullable |     column_default     | generation_expression |  indices  | is_hidden
--------------+-----------+-------------+------------------------+-----------------------+-----------+------------
  id          | INT8      |    false    | NULL                   |                       | {primary} |   false
  balance     | INT8      |    true     | NULL                   |                       | {}        |   false
  payload     | STRING    |    true     | NULL                   |                       | {}        |   false
  active      | BOOL      |    true     | NULL                   |                       | {}        |   false
  location    | STRING    |    true     | NULL                   |                       | {}        |   false
  currency    | STRING    |    true     | NULL                   |                       | {}        |   false
  interest    | DECIMAL   |    false    | 1.3:::DECIMAL::DECIMAL |                       | {}        |   false
(7 rows)
~~~

### Add a column with a `UNIQUE` constraint

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN address STRING UNIQUE;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~
~~~
  column_name | data_type | is_nullable |     column_default     | generation_expression |          indices           | is_hidden
--------------+-----------+-------------+------------------------+-----------------------+----------------------------+------------
  id          | INT8      |    false    | NULL                   |                       | {primary,bank_address_key} |   false
  balance     | INT8      |    true     | NULL                   |                       | {}                         |   false
  payload     | STRING    |    true     | NULL                   |                       | {}                         |   false
  active      | BOOL      |    true     | NULL                   |                       | {}                         |   false
  location    | STRING    |    true     | NULL                   |                       | {}                         |   false
  currency    | STRING    |    true     | NULL                   |                       | {}                         |   false
  interest    | DECIMAL   |    false    | 1.3:::DECIMAL::DECIMAL |                       | {}                         |   false
  address     | STRING    |    true     | NULL                   |                       | {bank_address_key}         |   false
(8 rows)
~~~

###  Add a column with a `FOREIGN KEY` constraint

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers (
  id INT PRIMARY KEY,
  name STRING
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN cust_number INT REFERENCES customers(id);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~
~~~
  column_name | data_type | is_nullable | column_default | generation_expression |          indices           | is_hidden
--------------+-----------+-------------+----------------+-----------------------+----------------------------+------------
  id          | INT8      |    false    | NULL           |                       | {primary,bank_address_key} |   false
  balance     | INT8      |    true     | NULL           |                       | {}                         |   false
  payload     | STRING    |    true     | NULL           |                       | {}                         |   false
  active      | BOOL      |    true     | NULL           |                       | {}                         |   false
  location    | STRING    |    true     | NULL           |                       | {}                         |   false
  currency    | STRING    |    true     | NULL           |                       | {}                         |   false
  interest    | DECIMAL   |    false    | 1.3:::DECIMAL  |                       | {}                         |   false
  address     | STRING    |    true     | NULL           |                       | {bank_address_key}         |   false
  cust_number | INT8      |    true     | NULL           |                       | {}                         |   false
(9 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CONSTRAINTS FROM bank;
~~~
~~~
  table_name |       constraint_name        | constraint_type |                      details                       | validated
-------------+------------------------------+-----------------+----------------------------------------------------+------------
  bank       | bank_address_key             | UNIQUE          | UNIQUE (address ASC)                               |   true
  bank       | fk_cust_number_ref_customers | FOREIGN KEY     | FOREIGN KEY (cust_number) REFERENCES customers(id) |   true
  bank       | primary                      | PRIMARY KEY     | PRIMARY KEY (id ASC)                               |   true
(3 rows)
~~~

### Add a column with collation

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN more_names STRING COLLATE en;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~
~~~
  column_name |     data_type     | is_nullable | column_default | generation_expression |          indices           | is_hidden
--------------+-------------------+-------------+----------------+-----------------------+----------------------------+------------
  id          | INT8              |    false    | NULL           |                       | {primary,bank_address_key} |   false
  balance     | INT8              |    true     | NULL           |                       | {}                         |   false
  payload     | STRING            |    true     | NULL           |                       | {}                         |   false
  active      | BOOL              |    true     | NULL           |                       | {}                         |   false
  location    | STRING            |    true     | NULL           |                       | {}                         |   false
  currency    | STRING            |    true     | NULL           |                       | {}                         |   false
  interest    | DECIMAL           |    false    | 1.3:::DECIMAL  |                       | {}                         |   false
  address     | STRING            |    true     | NULL           |                       | {bank_address_key}         |   false
  cust_number | INT8              |    true     | NULL           |                       | {}                         |   false
  more_names  | STRING COLLATE en |    true     | NULL           |                       | {}                         |   false
(10 rows)
~~~

### Add a column and assign it to a column family

#### Add a column and assign it to a new column family

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN location1 STRING CREATE FAMILY f1;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE FROM bank;
~~~
~~~
  table_name |                                                          create_statement
-------------+--------------------------------------------------------------------------------------------------------------------------------------
  bank       | CREATE TABLE bank (
             |     id INT8 NOT NULL,
             |     balance INT8 NULL,
             |     payload STRING NULL,
             |     active BOOL NULL,
             |     location STRING NULL,
             |     currency STRING NULL,
             |     interest DECIMAL NOT NULL DEFAULT 1.3:::DECIMAL,
             |     address STRING NULL,
             |     cust_number INT8 NULL,
             |     more_names STRING COLLATE en NULL,
             |     location1 STRING NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
             |     CONSTRAINT fk_cust_number_ref_customers FOREIGN KEY (cust_number) REFERENCES customers(id),
             |     UNIQUE INDEX bank_address_key (address ASC),
             |     FAMILY fam_0_id_balance_payload (id, balance, payload, active, location, currency, interest, address, cust_number, more_names),
             |     FAMILY f1 (location1)
             | )
(1 row)
~~~

#### Add a column and assign it to an existing column family

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN location2 STRING FAMILY f1;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE FROM bank;
~~~
~~~
  table_name |                                                          create_statement
-------------+--------------------------------------------------------------------------------------------------------------------------------------
  bank       | CREATE TABLE bank (
             |     id INT8 NOT NULL,
             |     balance INT8 NULL,
             |     payload STRING NULL,
             |     active BOOL NULL,
             |     location STRING NULL,
             |     currency STRING NULL,
             |     interest DECIMAL NOT NULL DEFAULT 1.3:::DECIMAL,
             |     address STRING NULL,
             |     cust_number INT8 NULL,
             |     more_names STRING COLLATE en NULL,
             |     location1 STRING NULL,
             |     location2 STRING NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
             |     CONSTRAINT fk_cust_number_ref_customers FOREIGN KEY (cust_number) REFERENCES customers(id),
             |     UNIQUE INDEX bank_address_key (address ASC),
             |     FAMILY fam_0_id_balance_payload (id, balance, payload, active, location, currency, interest, address, cust_number, more_names),
             |     FAMILY f1 (location1, location2)
             | )
(1 row)
~~~

#### Add a column and create a new column family if column family does not exist

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN new_name STRING CREATE IF NOT EXISTS FAMILY f2;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE FROM bank;
~~~
~~~
  table_name |                                                          create_statement
-------------+--------------------------------------------------------------------------------------------------------------------------------------
  bank       | CREATE TABLE bank (
             |     id INT8 NOT NULL,
             |     balance INT8 NULL,
             |     payload STRING NULL,
             |     active BOOL NULL,
             |     location STRING NULL,
             |     currency STRING NULL,
             |     interest DECIMAL NOT NULL DEFAULT 1.3:::DECIMAL,
             |     address STRING NULL,
             |     cust_number INT8 NULL,
             |     more_names STRING COLLATE en NULL,
             |     location1 STRING NULL,
             |     location2 STRING NULL,
             |     new_name STRING NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
             |     CONSTRAINT fk_cust_number_ref_customers FOREIGN KEY (cust_number) REFERENCES customers(id),
             |     UNIQUE INDEX bank_address_key (address ASC),
             |     FAMILY fam_0_id_balance_payload (id, balance, payload, active, location, currency, interest, address, cust_number, more_names),
             |     FAMILY f1 (location1, location2),
             |     FAMILY f2 (new_name)
             | )
(1 row)
~~~

## See also

- [`ALTER TABLE`](alter-table.html)
- [Column-level Constraints](constraints.html)
- [Collation](collate.html)
- [Column Families](column-families.html)
- [`SHOW JOBS`](show-jobs.html)
