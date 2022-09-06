---
title: ADD COLUMN
summary: Use the ADD COLUMN statement to add columns to tables.
toc: true
docs_area: reference.sql
---

`ADD COLUMN` is a subcommand of [`ALTER TABLE`](alter-table.html). Use `ADD COLUMN` to add columns to existing tables.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

{% include {{ page.version.version }}/sql/combine-alter-table-commands.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/add_column.html %}
</div>


## Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the table.

## Parameters

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table to which you want to add the column.
 `column_name` | The name of the column you want to add. The column name must follow these [identifier rules](keywords-and-identifiers.html#identifiers) and must be unique within the table but can have the same name as indexes or constraints.
 `typename` | The [data type](data-types.html) of the new column.
 `col_qualification` | An optional list of [column qualifications](create-table.html#column-qualifications).

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

### Setup

The following examples use the [`bank` demo database schema](cockroach-demo.html#datasets).

To follow along, run [`cockroach demo bank`](cockroach-demo.html) to start a temporary, in-memory cluster with the `bank` schema and dataset preloaded:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo bank
~~~

### Add a single column

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN active BOOL;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices    | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-------------+------------
  id          | INT8      |    false    | NULL           |                       | {bank_pkey} |   false
  balance     | INT8      |    true     | NULL           |                       | {bank_pkey} |   false
  payload     | STRING    |    true     | NULL           |                       | {bank_pkey} |   false
  active      | BOOL      |    true     | NULL           |                       | {bank_pkey} |   false
(4 rows)
~~~

### Add multiple columns

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN location STRING, ADD COLUMN currency STRING;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices    | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-------------+------------
  id          | INT8      |    false    | NULL           |                       | {bank_pkey} |   false
  balance     | INT8      |    true     | NULL           |                       | {bank_pkey} |   false
  payload     | STRING    |    true     | NULL           |                       | {bank_pkey} |   false
  active      | BOOL      |    true     | NULL           |                       | {bank_pkey} |   false
  location    | STRING    |    true     | NULL           |                       | {bank_pkey} |   false
  currency    | STRING    |    true     | NULL           |                       | {bank_pkey} |   false
(6 rows)
~~~

### Add a column with a `NOT NULL` constraint and a `DEFAULT` value

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN interest DECIMAL NOT NULL DEFAULT (DECIMAL '1.3');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~
~~~
  column_name | data_type | is_nullable |     column_default     | generation_expression |  indices    | is_hidden
--------------+-----------+-------------+------------------------+-----------------------+-------------+------------
  id          | INT8      |    false    | NULL                   |                       | {bank_pkey} |   false
  balance     | INT8      |    true     | NULL                   |                       | {bank_pkey} |   false
  payload     | STRING    |    true     | NULL                   |                       | {bank_pkey} |   false
  active      | BOOL      |    true     | NULL                   |                       | {bank_pkey} |   false
  location    | STRING    |    true     | NULL                   |                       | {bank_pkey} |   false
  currency    | STRING    |    true     | NULL                   |                       | {bank_pkey} |   false
  interest    | DECIMAL   |    false    | 1.3:::DECIMAL::DECIMAL |                       | {bank_pkey} |   false
(7 rows)
~~~

### Add a column with a `UNIQUE` constraint

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN address STRING UNIQUE;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~
~~~
  column_name | data_type | is_nullable | column_default | generation_expression |          indices             | is_hidden
--------------+-----------+-------------+----------------+-----------------------+------------------------------+------------
  id          | INT8      |    false    | NULL           |                       | {bank_address_key,bank_pkey} |   false
  balance     | INT8      |    true     | NULL           |                       | {bank_pkey}                  |   false
  payload     | STRING    |    true     | NULL           |                       | {bank_pkey}                  |   false
  active      | BOOL      |    true     | NULL           |                       | {bank_pkey}                  |   false
  location    | STRING    |    true     | NULL           |                       | {bank_pkey}                  |   false
  currency    | STRING    |    true     | NULL           |                       | {bank_pkey}                  |   false
  interest    | DECIMAL   |    false    | 1.3:::DECIMAL  |                       | {bank_pkey}                  |   false
  address     | STRING    |    true     | NULL           |                       | {bank_address_key,bank_pkey} |   false
(8 rows)
~~~

###  Add a column with a `FOREIGN KEY` constraint

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers (
  id INT PRIMARY KEY,
  name STRING
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN cust_number INT REFERENCES customers(id);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~
~~~
  column_name | data_type | is_nullable | column_default | generation_expression |          indices             | is_hidden
--------------+-----------+-------------+----------------+-----------------------+------------------------------+------------
  id          | INT8      |    false    | NULL           |                       | {bank_address_key,bank_pkey} |   false
  balance     | INT8      |    true     | NULL           |                       | {bank_pkey}                  |   false
  payload     | STRING    |    true     | NULL           |                       | {bank_pkey}                  |   false
  active      | BOOL      |    true     | NULL           |                       | {bank_pkey}                  |   false
  location    | STRING    |    true     | NULL           |                       | {bank_pkey}                  |   false
  currency    | STRING    |    true     | NULL           |                       | {bank_pkey}                  |   false
  interest    | DECIMAL   |    false    | 1.3:::DECIMAL  |                       | {bank_pkey}                  |   false
  address     | STRING    |    true     | NULL           |                       | {bank_address_key,bank_pkey} |   false
  cust_number | INT8      |    true     | NULL           |                       | {bank_pkey}                  |   false

(9 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CONSTRAINTS FROM bank;
~~~
~~~
  table_name |    constraint_name    | constraint_type |                      details                       | validated
-------------+-----------------------+-----------------+----------------------------------------------------+------------
  bank       | bank_address_key      | UNIQUE          | UNIQUE (address ASC)                               |     t
  bank       | bank_cust_number_fkey | FOREIGN KEY     | FOREIGN KEY (cust_number) REFERENCES customers(id) |     t
  bank       | bank_pkey             | PRIMARY KEY     | PRIMARY KEY (id ASC)                               |     t
(3 rows)
~~~

### Add a column with collation

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN more_names STRING COLLATE en;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~
~~~
  column_name |     data_type     | is_nullable | column_default | generation_expression |          indices             | is_hidden
--------------+-------------------+-------------+----------------+-----------------------+------------------------------+------------
  id          | INT8              |    false    | NULL           |                       | {bank_address_key,bank_pkey} |   false
  balance     | INT8              |    true     | NULL           |                       | {bank_pkey}                  |   false
  payload     | STRING            |    true     | NULL           |                       | {bank_pkey}                  |   false
  active      | BOOL              |    true     | NULL           |                       | {bank_pkey}                  |   false
  location    | STRING            |    true     | NULL           |                       | {bank_pkey}                  |   false
  currency    | STRING            |    true     | NULL           |                       | {bank_pkey}                  |   false
  interest    | DECIMAL           |    false    | 1.3:::DECIMAL  |                       | {bank_pkey}                  |   false
  address     | STRING            |    true     | NULL           |                       | {bank_address_key,bank_pkey} |   false
  cust_number | INT8              |    true     | NULL           |                       | {bank_pkey}                  |   false
  more_names  | STRING COLLATE en |    true     | NULL           |                       | {bank_pkey}                  |   false
(10 rows)
~~~

### Add a column and assign it to a column family

#### Add a column and assign it to a new column family

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN location1 STRING CREATE FAMILY f1;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE bank;
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
             |     CONSTRAINT bank_pkey PRIMARY KEY (id ASC),
             |     CONSTRAINT fk_cust_number_ref_customers FOREIGN KEY (cust_number) REFERENCES customers(id),
             |     UNIQUE INDEX bank_address_key (address ASC),
             |     FAMILY fam_0_id_balance_payload (id, balance, payload, active, location, currency, interest, address, cust_number, more_names),
             |     FAMILY f1 (location1)
             | )
(1 row)
~~~

#### Add a column and assign it to an existing column family

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN location2 STRING FAMILY f1;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE bank;
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
             |     CONSTRAINT bank_pkey PRIMARY KEY (id ASC),
             |     CONSTRAINT fk_cust_number_ref_customers FOREIGN KEY (cust_number) REFERENCES customers(id),
             |     UNIQUE INDEX bank_address_key (address ASC),
             |     FAMILY fam_0_id_balance_payload (id, balance, payload, active, location, currency, interest, address, cust_number, more_names),
             |     FAMILY f1 (location1, location2)
             | )
(1 row)
~~~

#### Add a column and create a new column family if column family does not exist

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN new_name STRING CREATE IF NOT EXISTS FAMILY f2;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE bank;
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
             |     CONSTRAINT bank_pkey PRIMARY KEY (id ASC),
             |     CONSTRAINT fk_cust_number_ref_customers FOREIGN KEY (cust_number) REFERENCES customers(id),
             |     UNIQUE INDEX bank_address_key (address ASC),
             |     FAMILY fam_0_id_balance_payload (id, balance, payload, active, location, currency, interest, address, cust_number, more_names),
             |     FAMILY f1 (location1, location2),
             |     FAMILY f2 (new_name)
             | )
(1 row)
~~~

### Add a column with an `ON UPDATE` expression

 `ON UPDATE` expressions set the value for a column when other values in a row are updated.

For example, suppose you add a new column to the `bank` table:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE bank ADD COLUMN last_updated TIMESTAMPTZ DEFAULT now() ON UPDATE now();
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT id, balance, last_updated FROM bank LIMIT 5;
~~~

~~~
  id | balance |         last_updated
-----+---------+--------------------------------
   0 |       0 | 2021-10-21 17:03:41.213557+00
   1 |       0 | 2021-10-21 17:03:41.213557+00
   2 |       0 | 2021-10-21 17:03:41.213557+00
   3 |       0 | 2021-10-21 17:03:41.213557+00
   4 |       0 | 2021-10-21 17:03:41.213557+00
(5 rows)
~~~

When any value in any row of the `bank` table is updated, CockroachDB re-evaluates the `ON UPDATE` expression and updates the `last_updated` column with the result.

{% include_cached copy-clipboard.html %}
~~~ sql
> UPDATE bank SET balance = 500 WHERE id = 0;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT id, balance, last_updated FROM bank LIMIT 5;
~~~

~~~
  id | balance |         last_updated
-----+---------+--------------------------------
   0 |     500 | 2021-10-21 17:06:42.211261+00
   1 |       0 | 2021-10-21 17:03:41.213557+00
   2 |       0 | 2021-10-21 17:03:41.213557+00
   3 |       0 | 2021-10-21 17:03:41.213557+00
   4 |       0 | 2021-10-21 17:03:41.213557+00
(5 rows)
~~~

## See also

- [`ALTER TABLE`](alter-table.html)
- [Column-level Constraints](constraints.html)
- [Collation](collate.html)
- [Column Families](column-families.html)
- [`SHOW JOBS`](show-jobs.html)
- [Online Schema Changes](online-schema-changes.html)
