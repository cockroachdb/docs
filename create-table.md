---
title: CREATE TABLE
toc: false
---

The `CREATE TABLE` [statement](sql-statements.html) creates a new table in a database.

By default, tables are created in the default replication zone but can be placed into a specific replication zone. See [Create a Replication Zone for a Table](configure-replication-zones.html#create-a-replication-zone-for-a-table) for more information.

<div id="toc"></div>

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the parent database. 

## Synopsis

**create_table ::=**
{% include sql/diagrams/create_table.html %}

**column_def ::=**
{% include sql/diagrams/column_def.html %}

**col_qual_list ::=**
{% include sql/diagrams/col_qual_list.html %}

**index_def ::=**
{% include sql/diagrams/index_def.html %}

**table_constraint ::=**
{% include sql/diagrams/table_constraint.html %}


## Parameters

Parameter | Description
----------|------------
`IF NOT EXISTS` | Create a new table only if a table of the same name does not already exist in the database; if one does exist, do not return an error.<br><br>Note that `IF NOT EXISTS` checks the table name only; it does not check if an existing table has the same columns, indexes, constraints, etc., of the new table. 
`any_name` | The name of the table to create, following these [naming rules](identifiers.html). When the parent database is not set as the default, the name must be formatted as `database.name`.<br><br>The [`UPSERT`](upsert.html) and [`INSERT ON CONFLICT`](insert.html) statements use a temporary table called `excluded` to handle uniqueness conflicts during execution. It's therefore not recommended to use the name `excluded` for any of your tables.
`column_def` | A comma-separated list of column definitions. Each column requires a [name](identifiers.html) and [data type](data-types.html); optionally, a [column-level constraint](constraints.html) can be specified. Column names must be unique within the table but can have the same name as indexes or constraints.<br><br>Any `PRIMARY KEY`, `UNIQUE`, and `CHECK` [constraints](constraints.html) defined at the column level are moved to the table level as part of the table's creation. Use the `SHOW CREATE TABLE` statement to view them at the table level.
`index_def` | An optional, comma-separated list of [index definitions](indexes.html). For each index, the column(s) to index must be specified; optionally, a name can be specified. Index names must be unique within the table but can have the same name as columns or constraints. See the [Create Indexes with a Table](#create-indexes-with-a-table) example below.<br><br>The [`CREATE INDEX`](create-index.html) statement can be used to create an index separate from table creation.  
`table_constraint` | An optional, comma-separated list of [table-level constraints](constraints.html). Constraint names must be unique within the table but can have the same name as columns or indexes.

## Examples

### Create a Table (No Primary Key Defined)

In CockroachDB, every table requires a [`PRIMARY KEY`](constraints.html#primary-key). If one is not explicitly defined, a column called `rowid` of the type `INT` is added automatically as the primary key, with the `unique_row(id)` function used to ensure that new rows always default to unique `rowid` values. The primary key is automatically indexed. 

{{site.data.alerts.callout_info}}Strictly speaking, a primary key's unique index is not created; it is derived from the key(s) under which the data is stored, so it takes no additional space. However, it appears as a normal unique index when using commands like <code>SHOW INDEX</code>.{{site.data.alerts.end}}

~~~ 
> CREATE TABLE logon (user_id INT, logon_date DATE);
CREATE TABLE

> SHOW COLUMNS FROM logon;
+------------+------+-------+----------------+
|   Field    | Type | Null  |    Default     |
+------------+------+-------+----------------+
| user_id    | INT  | true  | NULL           |
| logon_date | DATE | true  | NULL           |
| rowid      | INT  | false | unique_rowid() |
+------------+------+-------+----------------+

> SHOW INDEX FROM logon;
+-------+---------+--------+-----+--------+-----------+---------+
| Table |  Name   | Unique | Seq | Column | Direction | Storing |
+-------+---------+--------+-----+--------+-----------+---------+
| logon | primary | true   |   1 | rowid  | ASC       | false   |
+-------+---------+--------+-----+--------+-----------+---------+
~~~

### Create a Table (Primary Key Defined)

In this example, we create a table with three columns. One column is the [`PRIMARY KEY`](constraints.html#primary-key), another is given the [`UNIQUE`](constraints.html#unique) constraint, and the third has no constraints. The primary key and column with the `UNIQUE` constraint are automatically indexed.

~~~ 
> CREATE TABLE logoff (user_id INT PRIMARY KEY, user_email STRING UNIQUE, logoff_date DATE);
CREATE TABLE

> SHOW COLUMNS FROM logoff;
+-------------+--------+-------+---------+
|    Field    |  Type  | Null  | Default |
+-------------+--------+-------+---------+
| user_id     | INT    | false | NULL    |
| user_email  | STRING | true  | NULL    |
| logoff_date | DATE   | true  | NULL    |
+-------------+--------+-------+---------+

> SHOW INDEX FROM logoff;
+--------+-----------------------+--------+-----+------------+-----------+---------+
| Table  |         Name          | Unique | Seq |   Column   | Direction | Storing |
+--------+-----------------------+--------+-----+------------+-----------+---------+
| logoff | primary               | true   |   1 | user_id    | ASC       | false   |
| logoff | logoff_user_email_key | true   |   1 | user_email | ASC       | false   |
+--------+-----------------------+--------+-----+------------+-----------+---------+
~~~

### Create a Table With Secondary Indexes

In this example, we create two secondary indexes during table creation. Secondary indexes allow efficient access to data with keys other than the primary key. This example also demonstrates a number of column-level and table-level [constraints](constraints.html).

~~~ 
> CREATE TABLE product_information
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
CREATE TABLE

> SHOW INDEX FROM product_information;
+---------------------+--------------------------------------+--------+-----+----------------+-----------+---------+
|        Table        |                 Name                 | Unique | Seq |     Column     | Direction | Storing |
+---------------------+--------------------------------------+--------+-----+----------------+-----------+---------+
| product_information | primary                              | true   |   1 | product_id     | ASC       | false   |
| product_information | product_information_product_name_key | true   |   1 | product_name   | ASC       | false   |
| product_information | product_information_catalog_url_key  | true   |   1 | catalog_url    | ASC       | false   |
| product_information | date_added_idx                       | false  |   1 | date_added     | ASC       | false   |
| product_information | supp_id_prod_status_idx              | false  |   1 | supplier_id    | ASC       | false   |
| product_information | supp_id_prod_status_idx              | false  |   2 | product_status | ASC       | false   |
+---------------------+--------------------------------------+--------+-----+----------------+-----------+---------+
~~~

An alternate way to create secondary indexes would be to use [`CREATE INDEX`](create-index.html) statements once the table has been created:

~~~
CREATE INDEX date_added_idx ON product_information (date_added);
CREATE INDEX

CREATE INDEX supp_id_prod_status_idx ON product_information (supplier_id, product_status);
CREATE INDEX
~~~

### Show the Definition of a Table

To show the definition of a table, use the `SHOW CREATE TABLE` statement. The contents of the `CreateTable` column in the response is a string with embedded line breaks that, when echoed, produces formatted output.

~~~ 
> SHOW CREATE TABLE logon;
+-------+------------------------------------------------------------------------+
| Table |                              CreateTable                               |
+-------+------------------------------------------------------------------------+
| logon | "CREATE TABLE logon (\n\tuser_id INT NULL,\n\tlogon_date DATE NULL\n)" |
+-------+------------------------------------------------------------------------+
~~~

## See Also

- [`ALTER TABLE`](alter-table.html)
- [`DROP TABLE`](drop-table.html)
- [`RENAME TABLE`](rename-table.html)
- [`TRUNCATE`](truncate.html)
- [`SHOW TABLES`](show-tables.html)
- [`SHOW CREATE`]()
- [`SHOW COLUMNS`](show-columns.html)
- [Table-Level Replication Zones](configure-replication-zones.html#create-a-replication-zone-for-a-table)
