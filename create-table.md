---
title: CREATE TABLE
toc: false
toc_not_nested: true
---

The `CREATE TABLE` [statement](sql-statements.html) creates a new table in a database.

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/create_table.html %}

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the parent database. 


## Parameters

### IF NOT EXISTS

Do not raise a **table already exists** error if a table of the same name in the same database already exists. Note that the existance check is on the table name only, there is no guarantee that the existing table has the same columns, indexes, constraints, etc as the one that would have been created. 


#### any_name

The [name](data-definition.html#identifiers) (optionally schema-qualified) of the table to be created.


#### column_def

An optional comma separated list of any [column names](data-definition.html#identifiers), their [data types](data-types.html), and any [column level constraints](data-definition.html#column-level-constraints).


#### index_def

An optional comma separated list of any [index definitions](data-definition.html#indexes).


#### table_constraint

An optional comma separated list of any [table level constraints](data-definition.html#table-level-constraints)


## Usage

If the table does not have a `PRIMARY KEY` constraint defined, a mandatory column called `rowid` of type `INT` will be added and automatically populated with a unique along with a unique index called `primary`. The column and index will still be added if the table has an `UNIQUE` constraint but no `PRIMARY KEY` constraint.

The maximum number of columns in a table is ???.


## Examples

A table with a selection of column types, constraints and indexes.

~~~sql
CREATE TABLE product_information
(
  product_id           INT PRIMARY KEY NOT NULL,
  product_name         STRING(50) UNIQUE NOT NULL,
  product_description  STRING(2000),
  category_id          STRING(1) NOT NULL CHECK (category_id IN ('A','B','C')),
  weight_class         INT,
  warranty_period      INT CHECK ((warranty_period >= 0 AND warranty_period <= 24) OR warranty_period IS NULL),
  supplier_id          INT,
  product_status       STRING(20),
  list_price           DECIMAL(8,2),
  min_price            DECIMAL(8,2),
  catalog_url          STRING(50) UNIQUE,
  date_added           DATE DEFAULT CURRENT_DATE(),
  INDEX date_added_idx (date_added),
  INDEX supp_id_prod_status_idx (supplier_id, product_status)
);
~~~


As the syntax diagram suggests, you can create a table without any columns like you can in PostgreSQL. The table does have a column called `rowid` that was added because the table does not have a `PRIMARY KEY` or `UNIQUE` defined.

~~~ sql
CREATE TABLE table_name ();

SHOW COLUMNS FROM table_name;
+-------+------+-------+----------------+
| Field | Type | Null  |    Default     |
+-------+------+-------+----------------+
| rowid | INT  | false | unique_rowid() |
+-------+------+-------+----------------+
~~~



## See Also

- [`ALTER TABLE`](alter-table.html)
- [`DROP TABLE`](drop-table.html)
- [`RENAME TABLE`](rename-table.html)
- [`TRUNCATE`](truncate.html)
- [Table Level Replication Zones](configure-replication-zones.html#create-a-replication-zone-for-a-table)