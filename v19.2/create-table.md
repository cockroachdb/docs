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

CockroachDB allows [enterprise users](enterprise-licensing.html) to [define table partitions](partitioning.html), thus providing row-level control of how and where the data is stored. See [Create a Replication Zone for a Table Partition](configure-replication-zones.html#create-a-replication-zone-for-a-partition) for more information.

{{site.data.alerts.callout_info}}The primary key required for partitioning is different from the conventional primary key. To define the primary key for partitioning, prefix the unique identifier(s) in the primary key with all columns you want to partition and subpartition the table on, in the order in which you want to nest your subpartitions. See <a href=partitioning.html#partition-using-primary-key>Partition using Primary Key</a> for more details.{{site.data.alerts.end}}

## Examples

### Create a table

In this example, we create the `users` table with a single [primary key](primary-key.html) column defined. In CockroachDB, every table requires a [primary key](primary-key.html). If one is not explicitly defined, a column called `rowid` of the type `INT` is added automatically as the primary key, with the `unique_rowid()` function used to ensure that new rows always default to unique `rowid` values. The primary key is automatically indexed.

For performance recommendations on primary keys, see the [Primary Key Constraint](primary-key.html#performance-considerations) page and the [SQL Performance Best Practices](performance-best-practices-overview.html#use-multi-column-primary-keys) page.

{{site.data.alerts.callout_info}}Strictly speaking, a primary key's unique index is not created; it is derived from the key(s) under which the data is stored, so it takes no additional space. However, it appears as a normal unique index when using commands like <code>SHOW INDEX</code>.{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
        id UUID PRIMARY KEY,
        city STRING,
        name STRING,
        address STRING,
        credit_card STRING,
        dl STRING
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM users;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |  indices  | is_hidden
+-------------+-----------+-------------+----------------+-----------------------+-----------+-----------+
  id          | UUID      |    false    | NULL           |                       | {primary} |   false
  city        | STRING    |    true     | NULL           |                       | {}        |   false
  name        | STRING    |    true     | NULL           |                       | {}        |   false
  address     | STRING    |    true     | NULL           |                       | {}        |   false
  credit_card | STRING    |    true     | NULL           |                       | {}        |   false
  dl          | STRING    |    true     | NULL           |                       | {}        |   false
(6 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM users;
~~~

~~~
  table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
  users      | primary    |   false    |            1 | id          | ASC       |  false  |  false
(1 row)
~~~

### Create a table with secondary and inverted indexes

In this example, we create secondary and inverted indexes during table creation. Secondary indexes allow efficient access to data with keys other than the primary key. [Inverted indexes](inverted-indexes.html) allow efficient access to the schemaless data in a [`JSONB`](jsonb.html) column.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE vehicles (
        id UUID NOT NULL,
        city STRING NOT NULL,
        type STRING,
        owner_id UUID,
        creation_time TIMESTAMP,
        status STRING,
        current_location STRING,
        ext JSONB,
        CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
        INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC),
        INVERTED INDEX ix_vehicle_ext (ext),
        FAMILY "primary" (id, city, type, owner_id, creation_time, status, current_location, ext)
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM vehicles;
~~~

~~~
  table_name |              index_name               | non_unique | seq_in_index | column_name | direction | storing | implicit
+------------+---------------------------------------+------------+--------------+-------------+-----------+---------+----------+
  vehicles   | primary                               |   false    |            1 | city        | ASC       |  false  |  false
  vehicles   | primary                               |   false    |            2 | id          | ASC       |  false  |  false
  vehicles   | vehicles_auto_index_fk_city_ref_users |    true    |            1 | city        | ASC       |  false  |  false
  vehicles   | vehicles_auto_index_fk_city_ref_users |    true    |            2 | owner_id    | ASC       |  false  |  false
  vehicles   | vehicles_auto_index_fk_city_ref_users |    true    |            3 | id          | ASC       |  false  |   true
  vehicles   | ix_vehicle_ext                        |    true    |            1 | ext         | ASC       |  false  |  false
  vehicles   | ix_vehicle_ext                        |    true    |            2 | city        | ASC       |  false  |   true
  vehicles   | ix_vehicle_ext                        |    true    |            3 | id          | ASC       |  false  |   true
(8 rows)
~~~

We also have other resources on indexes:

- Create indexes for existing tables using [`CREATE INDEX`](create-index.html).
- [Learn more about indexes](indexes.html).

### Create a table with auto-generated unique row IDs

{% include {{ page.version.version }}/faq/auto-generate-unique-ids.html %}

### Create a table with a foreign key constraint

[Foreign key constraints](foreign-key.html) guarantee a column uses only values that already exist in the column it references, which must be from another table. This constraint enforces referential integrity between the two tables.

There are a [number of rules](foreign-key.html#rules-for-creating-foreign-keys) that govern foreign keys, but the two most important are:

- Foreign key columns must be [indexed](indexes.html). If no index is defined in the `CREATE TABLE` statement using `INDEX`, `PRIMARY KEY`, or `UNIQUE`, a secondary index is automatically created on the foreign key columns.

- Referenced columns must contain only unique values. This means the `REFERENCES` clause must use exactly the same columns as a [primary key](primary-key.html) or [unique](unique.html) constraint.

You can include a [foreign key action](foreign-key.html#foreign-key-actions) to specify what happens when a column referenced by a foreign key constraint is updated or deleted. The default actions are `ON UPDATE NO ACTION` and `ON DELETE NO ACTION`.

In this example, we use `ON DELETE CASCADE` (i.e., when row referenced by a foreign key constraint is deleted, all dependent rows are also deleted).

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        city STRING,
        name STRING,
        address STRING,
        credit_card STRING,
        dl STRING UNIQUE CHECK (LENGTH(dl) < 8)
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE vehicles (
        id UUID NOT NULL DEFAULT gen_random_uuid(),
        city STRING NOT NULL,
        type STRING,
        owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
        creation_time TIMESTAMP,
        status STRING,
        current_location STRING,
        ext JSONB,
        CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
        INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC),
        INVERTED INDEX ix_vehicle_ext (ext),
        FAMILY "primary" (id, city, type, owner_id, creation_time, status, current_location, ext)
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE vehicles;
~~~

~~~
  table_name |                                          create_statement
+------------+-----------------------------------------------------------------------------------------------------+
  vehicles   | CREATE TABLE vehicles (
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     city STRING NOT NULL,
             |     type STRING NULL,
             |     owner_id UUID NULL,
             |     creation_time TIMESTAMP NULL,
             |     status STRING NULL,
             |     current_location STRING NULL,
             |     ext JSONB NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC),
             |     INVERTED INDEX ix_vehicle_ext (ext),
             |     CONSTRAINT fk_owner_id_ref_users FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
             |     INDEX vehicles_auto_index_fk_owner_id_ref_users (owner_id ASC),
             |     FAMILY "primary" (id, city, type, owner_id, creation_time, status, current_location, ext)
             | )
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO users (name, dl) VALUES ('Annika', 'ABC-123');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users;
~~~

~~~
                   id                  | city |  name  | address | credit_card |   dl
+--------------------------------------+------+--------+---------+-------------+---------+
  26da1fce-59e1-4290-a786-9068242dd195 | NULL | Annika | NULL    | NULL        | ABC-123
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO vehicles (city, owner_id) VALUES ('seattle', '26da1fce-59e1-4290-a786-9068242dd195');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM vehicles;
~~~

~~~
                   id                  |  city   | type |               owner_id               | creation_time | status | current_location | ext
+--------------------------------------+---------+------+--------------------------------------+---------------+--------+------------------+------+
  fc6f7a8c-4ba9-42e1-9c37-7be3c906050c | seattle | NULL | 26da1fce-59e1-4290-a786-9068242dd195 | NULL          | NULL   | NULL             | NULL
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> DELETE FROM users WHERE id = '26da1fce-59e1-4290-a786-9068242dd195';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM vehicles;
~~~
~~~
  id | city | type | owner_id | creation_time | status | current_location | ext
+----+------+------+----------+---------------+--------+------------------+-----+
(0 rows)
~~~


### Create a table with a check constraint

In this example, we create the `users` table, but with some column [constraints](constraints.html). One column is the [primary key](primary-key.html), and another column is given a [unique constraint](unique.html) and a [check constraint](check.html) that limits the length of the string. Primary key columns and columns with unique constraints are automatically indexed.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
        id UUID PRIMARY KEY,
        city STRING,
        name STRING,
        address STRING,
        credit_card STRING,
        dl STRING UNIQUE CHECK (LENGTH(dl) < 8)
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM users;
~~~

~~~
  column_name | data_type | is_nullable | column_default | generation_expression |        indices         | is_hidden
+-------------+-----------+-------------+----------------+-----------------------+------------------------+-----------+
  id          | UUID      |    false    | NULL           |                       | {primary,users_dl_key} |   false
  city        | STRING    |    true     | NULL           |                       | {}                     |   false
  name        | STRING    |    true     | NULL           |                       | {}                     |   false
  address     | STRING    |    true     | NULL           |                       | {}                     |   false
  credit_card | STRING    |    true     | NULL           |                       | {}                     |   false
  dl          | STRING    |    true     | NULL           |                       | {users_dl_key}         |   false
(6 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM users;
~~~

~~~
  table_name |  index_name  | non_unique | seq_in_index | column_name | direction | storing | implicit
+------------+--------------+------------+--------------+-------------+-----------+---------+----------+
  users      | primary      |   false    |            1 | id          | ASC       |  false  |  false
  users      | users_dl_key |   false    |            1 | dl          | ASC       |  false  |  false
  users      | users_dl_key |   false    |            2 | id          | ASC       |  false  |   true
(3 rows)
~~~

### Create a table that mirrors key-value storage

{% include {{ page.version.version }}/faq/simulate-key-value-store.html %}

### Create a table from a `SELECT` statement

You can use the [`CREATE TABLE AS`](create-table-as.html) statement to create a new table from the results of a `SELECT` statement. For example, suppose you have a number of rows of user data in the `users` table, and you want to create a new table from the subset of users that are located in New York.

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users WHERE city = 'new york';
~~~

~~~
                   id                  |   city   |       name       |           address           | credit_card
+--------------------------------------+----------+------------------+-----------------------------+-------------+
  00000000-0000-4000-8000-000000000000 | new york | Robert Murphy    | 99176 Anderson Mills        | 8885705228
  051eb851-eb85-4ec0-8000-000000000001 | new york | James Hamilton   | 73488 Sydney Ports Suite 57 | 8340905892
  0a3d70a3-d70a-4d80-8000-000000000002 | new york | Judy White       | 18580 Rosario Ville Apt. 61 | 2597958636
  0f5c28f5-c28f-4c00-8000-000000000003 | new york | Devin Jordan     | 81127 Angela Ferry Apt. 8   | 5614075234
  147ae147-ae14-4b00-8000-000000000004 | new york | Catherine Nelson | 1149 Lee Alley              | 0792553487
(5 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users_ny AS SELECT * FROM users WHERE city = 'new york';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM users_ny;
~~~

~~~
                   id                  |   city   |       name       |           address           | credit_card
+--------------------------------------+----------+------------------+-----------------------------+-------------+
  00000000-0000-4000-8000-000000000000 | new york | Robert Murphy    | 99176 Anderson Mills        | 8885705228
  051eb851-eb85-4ec0-8000-000000000001 | new york | James Hamilton   | 73488 Sydney Ports Suite 57 | 8340905892
  0a3d70a3-d70a-4d80-8000-000000000002 | new york | Judy White       | 18580 Rosario Ville Apt. 61 | 2597958636
  0f5c28f5-c28f-4c00-8000-000000000003 | new york | Devin Jordan     | 81127 Angela Ferry Apt. 8   | 5614075234
  147ae147-ae14-4b00-8000-000000000004 | new york | Catherine Nelson | 1149 Lee Alley              | 0792553487
(5 rows)
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
> CREATE TABLE rides (
        id UUID NOT NULL,
        city STRING NOT NULL,
        vehicle_city STRING,
        rider_id UUID,
        vehicle_id UUID,
        start_address STRING,
        end_address STRING,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        revenue DECIMAL(10,2),
        CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
        INDEX rides_auto_index_fk_city_ref_users (city ASC, rider_id ASC),
        INDEX rides_auto_index_fk_vehicle_city_ref_vehicles (vehicle_city ASC, vehicle_id ASC),
        FAMILY "primary" (id, city, vehicle_city, rider_id, vehicle_id, start_address, end_address, start_time, end_time, revenue),
        CONSTRAINT check_vehicle_city_city CHECK (vehicle_city = city))
        PARTITION BY LIST (city)
          (PARTITION new_york VALUES IN ('new york'),
          PARTITION chicago VALUES IN ('chicago'),
          PARTITION seattle VALUES IN ('seattle'));
~~~

#### Create a table with partitions by range

In this example, we create a table and [define partitions by range](partitioning.html#partition-by-range).

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE rides (
        id UUID NOT NULL,
        city STRING NOT NULL,
        vehicle_city STRING,
        rider_id UUID,
        vehicle_id UUID,
        start_address STRING,
        end_address STRING,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        ride_length INTERVAL as (start_time - end_time) STORED,
        revenue DECIMAL(10,2),
        CONSTRAINT "primary" PRIMARY KEY (ride_length ASC, city ASC, id ASC),
        INDEX rides_auto_index_fk_city_ref_users (city ASC, rider_id ASC),
        INDEX rides_auto_index_fk_vehicle_city_ref_vehicles (vehicle_city ASC, vehicle_id ASC),
        FAMILY "primary" (id, city, vehicle_city, rider_id, vehicle_id, start_address, end_address, start_time, end_time, revenue),
        CONSTRAINT check_vehicle_city_city CHECK (vehicle_city = city))
        PARTITION BY RANGE (ride_length)
          (PARTITION short_rides VALUES FROM ('0 seconds') TO ('30 minutes'),
          PARTITION long_rides VALUES FROM ('30 minutes') TO (MAXVALUE));
~~~

### Show the definition of a table

To show the definition of a table, use the [`SHOW CREATE`](show-create.html) statement. The contents of the `create_statement` column in the response is a string with embedded line breaks that, when echoed, produces formatted output.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE rides;
~~~

~~~
  table_name |                                                               create_statement
+------------+----------------------------------------------------------------------------------------------------------------------------------------------+
  rides      | CREATE TABLE rides (
             |     id UUID NOT NULL,
             |     city STRING NOT NULL,
             |     vehicle_city STRING NULL,
             |     rider_id UUID NULL,
             |     vehicle_id UUID NULL,
             |     start_address STRING NULL,
             |     end_address STRING NULL,
             |     start_time TIMESTAMP NULL,
             |     end_time TIMESTAMP NULL,
             |     ride_length INTERVAL NOT NULL AS (start_time - end_time) STORED,
             |     revenue DECIMAL(10,2) NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (ride_length ASC, city ASC, id ASC),
             |     INDEX rides_auto_index_fk_city_ref_users (city ASC, rider_id ASC),
             |     INDEX rides_auto_index_fk_vehicle_city_ref_vehicles (vehicle_city ASC, vehicle_id ASC),
             |     FAMILY "primary" (id, city, vehicle_city, rider_id, vehicle_id, start_address, end_address, start_time, end_time, revenue, ride_length),
             |     CONSTRAINT check_vehicle_city_city CHECK (vehicle_city = city)
             | ) PARTITION BY RANGE (ride_length) (
             |     PARTITION short_rides VALUES FROM ('00:00:00') TO ('00:30:00'),
             |     PARTITION long_rides VALUES FROM ('00:30:00') TO (MAXVALUE)
             | )
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
