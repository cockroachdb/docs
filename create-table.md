---
title: CREATE TABLE
toc: false
---

The `CREATE TABLE` [statement](sql-statements.html) creates a new table in a database.
By default, tables are created in the default replication zone but can be placed into a specific replication zone. See the discussion on [Creating a Replication Zone for a Table](configure-replication-zones.html#create-a-replication-zone-for-a-table) for more information.

<div id="toc"></div>

## Syntax

{% include sql/diagrams/create_table.html %}

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the parent database. 


## Parameters

Parameter | Description
----------|-----------
`IF NOT EXISTS` | Create a new table only if a table of the same name does not already exist in the database; if one does exist, do not return an error.<br><br>Note that this checks the table name only; it does not check if an existing table has the same columns, indexes, constraints, etc., of the new table. 
`any_name` | The [name](data-definition.html#identifiers) (optionally schema-qualified) of the table to be created. Table names are required to be unique within a database. The `UPSERT` and `INSERT INTO ... ON CONFLICT` statements make use of a table called `EXCLUDED` to handle data conflicts during execution. It's therefore not recommended to use the name `EXCLUDED` for any of your tables.
`column_def` | An optional comma separated list of any [column names](data-definition.html#identifiers), their [data types](data-types.html), and any [column level constraints](data-definition.html#column-level-constraints). Column names have their own namespace within a table's definition so are required to be unique for the table but may have the same name as indexes or constraints, however this is not recommended. Any  Primary Key, Unique, and Check constraints that were originally defined at the column level are moved to the table level as part of the table's creation. Using the `SHOW CREATE TABLE` command will show these constraints at the table level.
`index_def` | An optional comma separated list of any [index definitions](data-definition.html#indexes). Index names have their own namespace within a table's definition so are required to be unique for the table but may have the same name as columns or constraints, however this is not recommended.
table_constraint | An optional comma separated list of any [table level constraints](data-definition.html#table-level-constraints). Constraint names have their own namespace within a table's definition so are required to be unique for the table but may have the same name as columns or indexes, however this is not recommended.


## Examples

If the table does **not** have a `PRIMARY KEY` constraint defined, a mandatory column called `rowid` of type `INT` will be added and automatically populated with a unique id that will be used as the primary key. The column will be added even if the table has an `UNIQUE` constraint.

~~~sql
CREATE TABLE logon
(
  userid     INT NOT NULL,
  logon_date DATE
);
SHOW COLUMNS FROM logon;
+------------+------+-------+----------------+
|   Field    | Type | Null  |    Default     |
+------------+------+-------+----------------+
| userid     | INT  | false | NULL           |
| logon_date | DATE | true  | NULL           |
| rowid      | INT  | false | unique_rowid() |
+------------+------+-------+----------------+
~~~

To display a list of tables created in a database, use the [`SHOW TABLES`](show-tables.html) command.

~~~sql
SHOW TABLES;
+-------+
| Table |
+-------+
| logon |
+-------+
~~~

To display information about columns in a table, use the [`SHOW COLUMNS`](show-columns.html) command.

~~~sql

SHOW COLUMNS FROM product_information;
+---------------------+--------------+-------+------------------+
|        Field        |     Type     | Null  |     Default      |
+---------------------+--------------+-------+------------------+
| product_id          | INT          | false | NULL             |
| product_name        | STRING(50)   | false | NULL             |
| product_description | STRING(2000) | true  | NULL             |
| category_id         | STRING(1)    | false | NULL             |
| weight_class        | INT          | true  | NULL             |
| warranty_period     | INT          | true  | NULL             |
| supplier_id         | INT          | true  | NULL             |
| product_status      | STRING(20)   | true  | NULL             |
| list_price          | DECIMAL(8,2) | true  | NULL             |
| min_price           | DECIMAL(8,2) | true  | NULL             |
| catalog_url         | STRING(50)   | true  | NULL             |
| date_added          | DATE         | true  | "CURRENT_DATE"() |
+---------------------+--------------+-------+------------------+
~~~

To show the definition of a table, use the `SHOW CREATE TABLE` command. The contents of the CreateTable column in the output is a string with embedded line breaks which when echoed produces formatted output. 

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

SHOW CREATE TABLE product_information;
----------------------+-----------------------------------------------------------------------------------+
|        Table        |                                   CreateTable                                     |
+---------------------+-----------------------------------------------------------------------------------+
| product_information | "CREATE TABLE product_information (\n\tproduct_id INT NOT NULL,\n\tproduct_name STRING(50) NOT NULL,\n\tproduct_description STRING(2000) NULL,\n\tcategory_id STRING(1) NOT NULL,\n\tweight_class INT NULL,\n\twarranty_period INT NULL,\n\tsupplier_id INT NULL,\n\tproduct_status STRING(20) NULL,\n\tlist_price DECIMAL(8,2) NULL,\n\tmin_price DECIMAL(8,2) NULL,\n\tcatalog_url STRING(50) NULL,\n\tdate_added DATE NULL DEFAULT \"CURRENT_DATE\"(),\n\tCONSTRAINT \"primary\" PRIMARY KEY (product_id),\n\tUNIQUE INDEX product_information_product_name_key (product_name),\n\tUNIQUE INDEX product_information_catalog_url_key (catalog_url),\n\tINDEX date_added_idx (date_added),\n\tINDEX supp_id_prod_status_idx (supplier_id, product_status),\n\tCONSTRAINT price_check CHECK (list_price >= min_price),\n\tCHECK (category_id IN ('A', 'B', 'C')),\n\tCHECK (warranty_period BETWEEN 0 AND 24)\n)" |
+---------------------+-----------------------------------------------------------------------------------+
~~~

~~~sql
$ echo -e <CreateTable_string>
CREATE TABLE product_information (
	product_id INT NOT NULL,
	product_name STRING(50) NOT NULL,
	product_description STRING(2000) NULL,
	category_id STRING(1) NOT NULL,
	weight_class INT NULL,
	warranty_period INT NULL,
	supplier_id INT NULL,
	product_status STRING(20) NULL,
	list_price DECIMAL(8,2) NULL,
	min_price DECIMAL(8,2) NULL,
	catalog_url STRING(50) NULL,
	date_added DATE NULL DEFAULT "CURRENT_DATE"(),
	CONSTRAINT "primary" PRIMARY KEY (product_id),
	UNIQUE INDEX product_information_product_name_key (product_name),
	UNIQUE INDEX product_information_catalog_url_key (catalog_url),
	INDEX date_added_idx (date_added),
	INDEX supp_id_prod_status_idx (supplier_id, product_status),
	CONSTRAINT price_check CHECK (list_price >= min_price),
	CHECK (category_id IN ('A', 'B', 'C')),
	CHECK (warranty_period BETWEEN 0 AND 24)
)
~~~
Note that the column level Primary Key, Unique, and Check constraints have been moved to the table level.

## See Also

- [`ALTER TABLE`](alter-table.html)
- [`DROP TABLE`](drop-table.html)
- [`RENAME TABLE`](rename-table.html)
- [`TRUNCATE`](truncate.html)
- [`SHOW TABLES`](show-tables.html)
- [`SHOW CREATE`]()
- [`SHOW COLUMNS`](show-columns.html)
- [Table Level Replication Zones](configure-replication-zones.html#create-a-replication-zone-for-a-table)