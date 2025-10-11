---
title: CREATE TABLE
summary: The CREATE TABLE statement creates a new table in a database.
toc: true
---

The `CREATE TABLE` [statement](sql-statements.html) creates a new table in a database.

{% include {{{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the parent database.

## Synopsis

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="basic">Basic</button>
  <button style="width: 15%" class="filter-button" data-scope="expanded">Expanded</button>
</div><p></p>

<div class="filter-content" markdown="1" data-scope="basic">
{% include {{ page.version.version }}/sql/diagrams/create_table.html %}
</div>

<div class="filter-content" markdown="1" data-scope="expanded">

<div>
  {% include {{ page.version.version }}/sql/diagrams/create_table.html %}
</div>

**column_def ::=**

<div>
  {% include {{ page.version.version }}/sql/diagrams/column_def.html %}
</div>

**col_qualification ::=**

<div class="horizontal-scroll">
  {% include {{ page.version.version }}/sql/diagrams/col_qualification.html %}
</div>

**index_def ::=**

<div class="horizontal-scroll">
  {% include {{ page.version.version }}/sql/diagrams/index_def.html %}
</div>

**family_def ::=**

<div>
  {% include {{ page.version.version }}/sql/diagrams/family_def.html %}
</div>

**table_constraint ::=**

<div class="horizontal-scroll">
  {% include {{ page.version.version }}/sql/diagrams/table_constraint.html %}
</div>

**opt_interleave ::=**

<div>
  {% include {{ page.version.version }}/sql/diagrams/opt_interleave.html %}
</div>

</div>

{{site.data.alerts.callout_success}}To create a table from the results of a <code>SELECT</code> statement, use <a href="create-table-as.html"><code>CREATE TABLE AS</code></a>.
{{site.data.alerts.end}}

## Parameters

Parameter | Description
----------|------------
`IF NOT EXISTS` | Create a new table only if a table of the same name does not already exist in the database; if one does exist, do not return an error.<br><br>Note that `IF NOT EXISTS` checks the table name only; it does not check if an existing table has the same columns, indexes, constraints, etc., of the new table.
`table_name` | The name of the table to create, which must be unique within its database and follow these [identifier rules](keywords-and-identifiers.html#identifiers). When the parent database is not set as the default, the name must be formatted as `database.name`.<br><br>The [`UPSERT`](upsert.html) and [`INSERT ON CONFLICT`](insert.html) statements use a temporary table called `excluded` to handle uniqueness conflicts during execution. It's therefore not recommended to use the name `excluded` for any of your tables.
`column_def` | A comma-separated list of column definitions. Each column requires a [name/identifier](keywords-and-identifiers.html#identifiers) and [data type](data-types.html); optionally, a [column-level constraint](constraints.html) or other column qualification (e.g., [computed columns](computed-columns.html)) can be specified. Column names must be unique within the table but can have the same name as indexes or constraints.<br><br>Any `PRIMARY KEY`, `UNIQUE`, and `CHECK` [constraints](constraints.html) defined at the column level are moved to the table-level as part of the table's creation. Use the [`SHOW CREATE`](show-create.html) statement to view them at the table level.
`index_def` | An optional, comma-separated list of [index definitions](indexes.html). For each index, the column(s) to index must be specified; optionally, a name can be specified. Index names must be unique within the table and follow these [identifier rules](keywords-and-identifiers.html#identifiers). See the [Create a Table with Secondary Indexes and Inverted Indexes](#create-a-table-with-secondary-and-inverted-indexes) example below.<br><br>The [`CREATE INDEX`](create-index.html) statement can be used to create an index separate from table creation.
`family_def` | An optional, comma-separated list of [column family definitions](column-families.html). Column family names must be unique within the table but can have the same name as columns, constraints, or indexes.<br><br>A column family is a group of columns that are stored as a single key-value pair in the underlying key-value store. CockroachDB automatically groups columns into families to ensure efficient storage and performance. However, there are cases when you may want to manually assign columns to families. For more details, see [Column Families](column-families.html).
`table_constraint` | An optional, comma-separated list of [table-level constraints](constraints.html). Constraint names must be unique within the table but can have the same name as columns, column families, or indexes.
`opt_interleave` | You can potentially optimize query performance by [interleaving tables](interleave-in-parent.html), which changes how CockroachDB stores your data.
`opt_partition_by` | An [enterprise-only](enterprise-licensing.html) option that lets you define table partitions at the row level. You can define table partitions by list or by range. See [Define Table Partitions](partitioning.html) for more information.

## Table-level replication

By default, tables are created in the default replication zone but can be placed into a specific replication zone. See [Create a Replication Zone for a Table](configure-replication-zones.html#create-a-replication-zone-for-a-table) for more information.

## Row-level replication

CockroachDB allows [enterprise users](enterprise-licensing.html) to [define table partitions](partitioning.html), thus providing row-level control of how and where the data is stored. See [Create a Replication Zone for a Table Partition](configure-replication-zones.html#create-a-replication-zone-for-a-table-or-secondary-index-partition) for more information.

{{site.data.alerts.callout_info}}The primary key required for partitioning is different from the conventional primary key. To define the primary key for partitioning, prefix the unique identifier(s) in the primary key with all columns you want to partition and subpartition the table on, in the order in which you want to nest your subpartitions. See <a href=partitioning.html#partition-using-primary-key>Partition using Primary Key</a> for more details.{{site.data.alerts.end}}

## Examples

### Create a table (no primary key defined)

In CockroachDB, every table requires a [primary key](primary-key.html). If one is not explicitly defined, a column called `rowid` of the type `INT` is added automatically as the primary key, with the `unique_rowid()` function used to ensure that new rows always default to unique `rowid` values. The primary key is automatically indexed.

{{site.data.alerts.callout_info}}Strictly speaking, a primary key's unique index is not created; it is derived from the key(s) under which the data is stored, so it takes no additional space. However, it appears as a normal unique index when using commands like <code>SHOW INDEX</code>.{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE logon (
    user_id INT,
    logon_date DATE
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM logon;
~~~

~~~
+-------------+-----------+-------------+----------------+-----------------------+---------+
| column_name | data_type | is_nullable | column_default | generation_expression | indices |
+-------------+-----------+-------------+----------------+-----------------------+---------+
| user_id     | INT       |    true     | NULL           |                       | {}      |
| logon_date  | DATE      |    true     | NULL           |                       | {}      |
+-------------+-----------+-------------+----------------+-----------------------+---------+
(2 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM logon;
~~~

~~~
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
| table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit |
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
| logon      | primary    |   false    |            1 | rowid       | ASC       |  false  |  false   |
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
(1 row)
~~~

### Create a table (primary key defined)

In this example, we create a table with three columns. One column is the [`PRIMARY KEY`](primary-key.html), another is given the [`UNIQUE` constraint](unique.html), and the third has no constraints. The `PRIMARY KEY` and column with the `UNIQUE` constraint are automatically indexed.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE logoff (
    user_id INT PRIMARY KEY,
    user_email STRING UNIQUE,
    logoff_date DATE
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM logoff;
~~~

~~~
+-------------+-----------+-------------+----------------+-----------------------+-------------------------------------+
| column_name | data_type | is_nullable | column_default | generation_expression |               indices               |
+-------------+-----------+-------------+----------------+-----------------------+-------------------------------------+
| user_id     | INT       |    false    | NULL           |                       | {"primary","logoff_user_email_key"} |
| user_email  | STRING    |    true     | NULL           |                       | {"logoff_user_email_key"}           |
| logoff_date | DATE      |    true     | NULL           |                       | {}                                  |
+-------------+-----------+-------------+----------------+-----------------------+-------------------------------------+
(3 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM logoff;
~~~

~~~
+------------+-----------------------+------------+--------------+-------------+-----------+---------+----------+
| table_name |      index_name       | non_unique | seq_in_index | column_name | direction | storing | implicit |
+------------+-----------------------+------------+--------------+-------------+-----------+---------+----------+
| logoff     | primary               |   false    |            1 | user_id     | ASC       |  false  |  false   |
| logoff     | logoff_user_email_key |   false    |            1 | user_email  | ASC       |  false  |  false   |
| logoff     | logoff_user_email_key |   false    |            2 | user_id     | ASC       |  false  |   true   |
+------------+-----------------------+------------+--------------+-------------+-----------+---------+----------+
(3 rows)
~~~

### Create a table with secondary and inverted indexes

In this example, we create two secondary indexes during table creation. Secondary indexes allow efficient access to data with keys other than the primary key. This example also demonstrates a number of column-level and table-level [constraints](constraints.html).

[Inverted indexes](inverted-indexes.html), which are new in v2.0, allow efficient access to the schemaless data in a [`JSONB`](jsonb.html) column.

This example also demonstrates a number of column-level and table-level [constraints](constraints.html).

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE product_information (
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
    misc                 JSONB,     
    CONSTRAINT price_check CHECK (list_price >= min_price),
    INDEX date_added_idx (date_added),
    INDEX supp_id_prod_status_idx (supplier_id, product_status),
    INVERTED INDEX details (misc)
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM product_information;
~~~

~~~
+---------------------+--------------------------------------+------------+--------------+----------------+-----------+---------+----------+
|     table_name      |              index_name              | non_unique | seq_in_index |  column_name   | direction | storing | implicit |
+---------------------+--------------------------------------+------------+--------------+----------------+-----------+---------+----------+
| product_information | primary                              |   false    |            1 | product_id     | ASC       |  false  |  false   |
| product_information | product_information_product_name_key |   false    |            1 | product_name   | ASC       |  false  |  false   |
| product_information | product_information_product_name_key |   false    |            2 | product_id     | ASC       |  false  |   true   |
| product_information | product_information_catalog_url_key  |   false    |            1 | catalog_url    | ASC       |  false  |  false   |
| product_information | product_information_catalog_url_key  |   false    |            2 | product_id     | ASC       |  false  |   true   |
| product_information | date_added_idx                       |    true    |            1 | date_added     | ASC       |  false  |  false   |
| product_information | date_added_idx                       |    true    |            2 | product_id     | ASC       |  false  |   true   |
| product_information | supp_id_prod_status_idx              |    true    |            1 | supplier_id    | ASC       |  false  |  false   |
| product_information | supp_id_prod_status_idx              |    true    |            2 | product_status | ASC       |  false  |  false   |
| product_information | supp_id_prod_status_idx              |    true    |            3 | product_id     | ASC       |  false  |   true   |
| product_information | details                              |    true    |            1 | misc           | ASC       |  false  |  false   |
| product_information | details                              |    true    |            2 | product_id     | ASC       |  false  |   true   |
+---------------------+--------------------------------------+------------+--------------+----------------+-----------+---------+----------+
(12 rows)
~~~

We also have other resources on indexes:

- Create indexes for existing tables using [`CREATE INDEX`](create-index.html).
- [Learn more about indexes](indexes.html).

### Create a table with auto-generated unique row IDs

{% include {{ page.version.version }}/faq/auto-generate-unique-ids.html %}

### Create a table with a foreign key constraint

[`FOREIGN KEY` constraints](foreign-key.html) guarantee a column uses only values that already exist in the column it references, which must be from another table. This constraint enforces referential integrity between the two tables.

There are a [number of rules](foreign-key.html#rules-for-creating-foreign-keys) that govern foreign keys, but the two most important are:

- Foreign key columns must be [indexed](indexes.html) when creating the table using `INDEX`, `PRIMARY KEY`, or `UNIQUE`.

- Referenced columns must contain only unique values. This means the `REFERENCES` clause must use exactly the same columns as a [`PRIMARY KEY`](primary-key.html) or [`UNIQUE`](unique.html) constraint.

You can include a [foreign key action](foreign-key.html#foreign-key-actions) to specify what happens when a column referenced by a foreign key constraint is updated or deleted. The default actions are `ON UPDATE NO ACTION` and `ON DELETE NO ACTION`.

In this example, we use `ON DELETE CASCADE` (i.e., when row referenced by a foreign key constraint is deleted, all dependent rows are also deleted).

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers (
    id INT PRIMARY KEY,
    name STRING
  );
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT REFERENCES customers(id) ON DELETE CASCADE
  );
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE orders;
~~~

~~~
+------------+--------------------------------------------------------------------------+
| table_name |                             create_statement                             |
+------------+--------------------------------------------------------------------------+
| orders     | CREATE TABLE orders (                                                    |
|            |                                                                          |
|            |     id INT NOT NULL,                                                     |
|            |                                                                          |
|            |     customer_id INT NULL,                                                |
|            |                                                                          |
|            |     CONSTRAINT "primary" PRIMARY KEY (id ASC),                           |
|            |                                                                          |
|            |     CONSTRAINT fk_customer_id_ref_customers FOREIGN KEY (customer_id)    |
|            | REFERENCES customers (id) ON DELETE CASCADE,                             |
|            |                                                                          |
|            |     INDEX orders_auto_index_fk_customer_id_ref_customers (customer_id    |
|            | ASC),                                                                    |
|            |                                                                          |
|            |     FAMILY "primary" (id, customer_id)                                   |
|            |                                                                          |
|            | )                                                                        |
+------------+--------------------------------------------------------------------------+
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO customers VALUES (1, 'Lauren');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO orders VALUES (1,1);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM customers WHERE id = 1;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM orders;
~~~
~~~
+----+-------------+
| id | customer_id |
+----+-------------+
+----+-------------+
~~~

### Create a table that mirrors key-value storage

{% include {{ page.version.version }}/faq/simulate-key-value-store.html %}

### Create a table from a `SELECT` statement

You can use the [`CREATE TABLE AS`](create-table-as.html) statement to create a new table from the results of a `SELECT` statement, for example:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers WHERE state = 'NY';
~~~

~~~
+----+---------+-------+
| id |  name   | state |
+----+---------+-------+
|  6 | Dorotea | NY    |
| 15 | Thales  | NY    |
+----+---------+-------+
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE customers_ny AS SELECT * FROM customers WHERE state = 'NY';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM customers_ny;
~~~

~~~
+----+---------+-------+
| id |  name   | state |
+----+---------+-------+
|  6 | Dorotea | NY    |
| 15 | Thales  | NY    |
+----+---------+-------+
~~~

### Create a table with a computed column

{% include {{ page.version.version }}/computed-columns/simple.md %}

### Create a table with partitions

{{site.data.alerts.callout_info}}
The primary key required for partitioning is different from the conventional primary key. To define the primary key for partitioning, prefix the unique identifier(s) in the primary key with all columns you want to partition and subpartition the table on, in the order in which you want to nest your subpartitions. See [Partition using Primary Key](partitioning.html#partition-using-primary-key) for more details.
{{site.data.alerts.end}}

#### Create a table with partitions by list

In this example, we create a table and [define partitions by list](partitioning.html#partition-by-list).

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE students_by_list (
    id INT DEFAULT unique_rowid(),
    name STRING,
    email STRING,
    country STRING,
    expected_graduation_date DATE,
    PRIMARY KEY (country, id))
    PARTITION BY LIST (country)
      (PARTITION north_america VALUES IN ('CA','US'),
      PARTITION australia VALUES IN ('AU','NZ'),
      PARTITION DEFAULT VALUES IN (default));
~~~

#### Create a table with partitions by range

In this example, we create a table and [define partitions by range](partitioning.html#partition-by-range).

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE students_by_range (
   id INT DEFAULT unique_rowid(),
   name STRING,
   email STRING,                                                                                           
   country STRING,
   expected_graduation_date DATE,                                                                                      
   PRIMARY KEY (expected_graduation_date, id))
   PARTITION BY RANGE (expected_graduation_date)
      (PARTITION graduated VALUES FROM (MINVALUE) TO ('2017-08-15'),
      PARTITION current VALUES FROM ('2017-08-15') TO (MAXVALUE));
~~~

### Show the definition of a table

To show the definition of a table, use the [`SHOW CREATE`](show-create.html) statement. The contents of the `create_statement` column in the response is a string with embedded line breaks that, when echoed, produces formatted output.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE logoff;
~~~

~~~
+------------+----------------------------------------------------------+
| table_name |                     create_statement                     |
+------------+----------------------------------------------------------+
| logoff     | CREATE TABLE logoff (                                    |
|            |                                                          |
|            |     user_id INT NOT NULL,                                |
|            |                                                          |
|            |     user_email STRING NULL,                              |
|            |                                                          |
|            |     logoff_date DATE NULL,                               |
|            |                                                          |
|            |     CONSTRAINT "primary" PRIMARY KEY (user_id ASC),      |
|            |                                                          |
|            |     UNIQUE INDEX logoff_user_email_key (user_email ASC), |
|            |                                                          |
|            |     FAMILY "primary" (user_id, user_email, logoff_date)  |
|            |                                                          |
|            | )                                                        |
+------------+----------------------------------------------------------+
(1 row)
~~~

## See also

- [`INSERT`](insert.html)
- [`ALTER TABLE`](alter-table.html)
- [`DELETE`](delete.html)
- [`DROP TABLE`](drop-table.html)
- [`RENAME TABLE`](rename-table.html)
- [`SHOW TABLES`](show-tables.html)
- [`SHOW COLUMNS`](show-columns.html)
- [Column Families](column-families.html)
- [Table-Level Replication Zones](configure-replication-zones.html#create-a-replication-zone-for-a-table)
- [Define Table Partitions](partitioning.html)
- [Online Schema Changes](online-schema-changes.html)
