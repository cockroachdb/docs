---
title: CREATE TABLE
toc: false
toc_not_nested: true
---

The `CREATE TABLE` [statement](sql-statements.html) creates a new table in a database.

<div id="toc"></div>

## Syntax

{% include sql/diagrams/create_table.html %}

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the parent database. 


## Semantics

### IF NOT EXISTS

Do not raise a **table already exists** error if a table of the same name in the database already exists. Note that the existance check is on the table name only, there is no guarantee that the existing table has the same columns, indexes, constraints, etc as the one that would have been created. 


#### any_name

The [name](data-definition.html#identifiers) (optionally schema-qualified) of the table to be created. Table names are required to be unique within a database.

The `UPSERT` and `INSERT INTO ... ON CONFLICT` statements make use of a table called `EXCLUDED` to handle data conflicts during execution. It's therefore not recommedned to use the name `EXCLUDED` for any of your tables.


#### column_def

An optional comma separated list of any [column names](data-definition.html#identifiers), their [data types](data-types.html), and any [column level constraints](data-definition.html#column-level-constraints). Column names have their own namespace within a table's definition so are required to be unique for the table but may have the same name as indexes or constraints, however this is not recommended. Any  Primary Key, Unique, and Check constraints that were originally defined at the column level are moved to the table level as part of the table's creation. Using the `SHOW CREATE TABLE` command will show these constraints at the table level.


#### index_def

An optional comma separated list of any [index definitions](data-definition.html#indexes). Index names have their own namespace within a table's definition so are required to be unique for the table but may have the same name as columns or constraints, however this is not recommended.


#### table_constraint

An optional comma separated list of any [table level constraints](data-definition.html#table-level-constraints). Constraint names have their own namespace within a table's definition so are required to be unique for the table but may have the same name as columns or indexes, however this is not recommended. 


## Usage

If the table does not have a `PRIMARY KEY` constraint defined, a mandatory column called `rowid` of type `INT` will be added and automatically populated with a unique id that will be used as the primary key. The column will be added even if the table has an `UNIQUE` constraint.

To display a list of tables created in a database, use the [`SHOW TABLES`](show-tables.html) command.

To display information about columns in a table, use the [`SHOW COLUMNS`](show-columns.html) command.

To show the definition of a table, use the [`SHOW CREATE TABLE`]() command. 

By default, tables are created in the default replication zone but can be placed into a specific replication zone. See the discussion on [Creating a Replication Zone for a Table](configure-replication-zones.html#create-a-replication-zone-for-a-table) for more information.

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
  warranty_period      INT CONSTRAINT valid_warranty CHECK (warranty_period BETWEEN 0 AND 24),
  supplier_id          INT,
  product_status       STRING(20),
  list_price           DECIMAL(8,2),
  min_price            DECIMAL(8,2),
  catalog_url          STRING(50) UNIQUE,
  date_added           DATE DEFAULT CURRENT_DATE(),
  CONSTRAINT price_check CHECK (list_price >= min_price),
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
- [`SHOW TABLES`](show-tables.html)
- [`SHOW CREATE`]()
- [`SHOW COLUMNS`](show-columns.html)
- [Table Level Replication Zones](configure-replication-zones.html#create-a-replication-zone-for-a-table)