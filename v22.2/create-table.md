---
title: CREATE TABLE
summary: The CREATE TABLE statement creates a new table in a database.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: reference.sql
---

The `CREATE TABLE` [statement](sql-statements.html) creates a new table in a database.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Required privileges

To create a table, the user must have one of the following:

- Membership to the [`admin`](security-reference/authorization.html#roles) role for the cluster.
- Membership to the [owner](security-reference/authorization.html#object-ownership) role for the database.
- The [`CREATE` privilege](security-reference/authorization.html#supported-privileges) on the database.

## Synopsis

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="basic">Basic</button>
  <button style="width: 15%" class="filter-button" data-scope="expanded">Expanded</button>
</div><p></p>

<div class="filter-content" markdown="1" data-scope="basic">
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_table.html %}
</div>

<div class="filter-content" markdown="1" data-scope="expanded">

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_table.html %}
</div>

**opt_persistence_temp_table ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/opt_persistence_temp_table.html %}
</div>

**column_def ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/column_table_def.html %}
</div>

**col_qualification ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/col_qualification.html %}
</div>

**index_def ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/index_def.html %}
</div>

**family_def ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/family_def.html %}
</div>

**table_constraint ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/table_constraint.html %}
</div>

**like_table_option_list::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/like_table_option_list.html %}
</div>

**opt_with_storage_parameter_list ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/opt_with_storage_parameter_list.html %}
</div>

**opt_locality ::=**

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/opt_locality.html %}
</div>

</div>

{{site.data.alerts.callout_success}}To create a table from the results of a <code>SELECT</code> statement, use <a href="create-table-as.html"><code>CREATE TABLE AS</code></a>.
{{site.data.alerts.end}}

## Parameters

Parameter | Description
----------|------------
`opt_persistence_temp_table` |  Defines the table as a session-scoped temporary table. For more information, see [Temporary Tables](temporary-tables.html).<br><br>Note that the `LOCAL`, `GLOBAL`, and `UNLOGGED` options are no-ops, allowed by the parser for PostgreSQL compatibility.<br><br>**Support for temporary tables is [experimental](experimental-features.html#temporary-objects)**.
`IF NOT EXISTS` | Create a new table only if a table of the same name does not already exist in the database; if one does exist, do not return an error.<br><br>Note that `IF NOT EXISTS` checks the table name only; it does not check if an existing table has the same columns, indexes, constraints, etc., of the new table.
`table_name` | The name of the table to create, which must be unique within its database and follow these [identifier rules](keywords-and-identifiers.html#identifiers). When the parent database is not set as the default, the name must be formatted as `database.name`.<br><br>The [`UPSERT`](upsert.html) and [`INSERT ON CONFLICT`](insert.html) statements use a temporary table called `excluded` to handle uniqueness conflicts during execution. It's therefore not recommended to use the name `excluded` for any of your tables.
`column_def` | A comma-separated list of column definitions. Each column requires a [name/identifier](keywords-and-identifiers.html#identifiers) and [data type](data-types.html). Column names must be unique within the table but can have the same name as indexes or constraints.<br><br>You can optionally specify a [column qualification](#column-qualifications) (e.g., a [column-level constraint](constraints.html)). Any `PRIMARY KEY`, `UNIQUE`, and `CHECK` [constraints](constraints.html) defined at the column level are moved to the table-level as part of the table's creation. Use the [`SHOW CREATE`](show-create.html) statement to view them at the table level.
`index_def` | An optional, comma-separated list of [index definitions](indexes.html). For each index, the column(s) to index must be specified; optionally, a name can be specified. Index names must be unique within the table and follow these [identifier rules](keywords-and-identifiers.html#identifiers). See the [Create a Table with Secondary Indexes and GIN Indexes](#create-a-table-with-secondary-and-gin-indexes) example below.<br><br> For examples, see [Create a table with hash-sharded indexes](#create-a-table-with-a-hash-sharded-primary-index) below.<br><br>The [`CREATE INDEX`](create-index.html) statement can be used to create an index separate from table creation.
`family_def` | An optional, comma-separated list of [column family definitions](column-families.html). Column family names must be unique within the table but can have the same name as columns, constraints, or indexes.<br><br>A column family is a group of columns that are stored as a single key-value pair in the underlying key-value store. CockroachDB automatically groups columns into families to ensure efficient storage and performance. However, there are cases when you may want to manually assign columns to families. For more details, see [Column Families](column-families.html).
`table_constraint` | An optional, comma-separated list of [table-level constraints](constraints.html). Constraint names must be unique within the table but can have the same name as columns, column families, or indexes.
`LIKE table_name like_table_option_list` |  Create a new table based on the schema of an existing table, using supported specifiers. For details, see [Create a table like an existing table](#create-a-table-like-an-existing-table). For examples, see [Create a new table from an existing one](#create-a-new-table-from-an-existing-one).
`opt_partition_by` | An [Enterprise-only](enterprise-licensing.html) option that lets you define table partitions at the row level. You can define table partitions by list or by range. See [Define Table Partitions](partitioning.html) for more information.
`opt_locality` |  Specify a [locality](multiregion-overview.html#table-locality) for the table. In order to set a locality, the table must belong to a [multi-region database](multiregion-overview.html).<br><br>Note that multi-region features require an [Enterprise license](enterprise-licensing.html).
`opt_where_clause` |  An optional `WHERE` clause that defines the predicate boolean expression of a [partial index](partial-indexes.html).
`opt_with_storage_parameter_list` |  A comma-separated list of [spatial index tuning parameters](spatial-indexes.html#index-tuning-parameters). Supported parameters include `fillfactor`, `s2_max_level`, `s2_level_mod`, `s2_max_cells`, `geometry_min_x`, `geometry_max_x`, `geometry_min_y`, and `geometry_max_y`. The `fillfactor` parameter is a no-op, allowed for PostgreSQL-compatibility.<br><br>For details, see [Spatial index tuning parameters](spatial-indexes.html#index-tuning-parameters). For an example, see [Create a spatial index that uses all of the tuning parameters](spatial-indexes.html#create-a-spatial-index-that-uses-all-of-the-tuning-parameters).
`ON COMMIT PRESERVE ROWS` | This clause is a no-op, allowed by the parser for PostgreSQL compatibility. CockroachDB only supports session-scoped [temporary tables](temporary-tables.html), and does not support the clauses `ON COMMIT DELETE ROWS` and `ON COMMIT DROP`, which are used to define transaction-scoped temporary tables in PostgreSQL.

## Column qualifications

CockroachDB supports the following column qualifications:

- [Column-level constraints](constraints.html)
- [Collations](collate.html)
- [Column family assignments](column-families.html)
- [`DEFAULT` expressions](default-value.html)
- [`ON UPDATE` expressions](#on-update-expressions)
- [Identity columns](#identity-columns) (sequence-populated columns)
- `NOT VISIBLE`

### `ON UPDATE` expressions

 `ON UPDATE` expressions update column values in the following cases:

- An [`UPDATE`](update.html) or [`UPSERT`](upsert.html) statement modifies a different column value in the same row.
- An `ON UPDATE CASCADE` [foreign key action](foreign-key.html#foreign-key-actions) modifies a different column value in the same row.

`ON UPDATE` expressions **do not** update column values in the following cases:

- An `UPDATE` or `UPSERT` statement directly modifies the value of a column with an `ON UPDATE` expression.
- An `UPSERT` statement creates a new row.
- A new column is backfilled with values (e.g., by a `DEFAULT` expression).

Note the following limitations of `ON UPDATE` expressions:

- `ON UPDATE` expressions allow context-dependent expressions, but not expressions that reference other columns. For example, the `current_timestamp()` [built-in function](functions-and-operators.html) is allowed, but `CONCAT(<column_one>, <column_two>)` is not.
- You cannot add a [foreign key constraint](foreign-key.html) and an `ON UPDATE` expression to the same column.

For an example of `ON UPDATE`, see [Add a column with an `ON UPDATE` expression](add-column.html#add-a-column-with-an-on-update-expression).

### Identity columns

*Identity columns* are columns that are populated with values in a [sequence](create-sequence.html). When you create an identity column, CockroachDB creates a sequence and sets the default value for the identity column to the result of the `nextval()` [built-in function](functions-and-operators.html) on the sequence.

To create an identity column, add a `GENERATED BY DEFAULT AS IDENTITY`/`GENERATED ALWAYS AS IDENTITY` clause to the column definition, followed by [sequence options](create-sequence.html#parameters). If you do not specify any sequence options in the column definition, the column assumes the default options of [`CREATE SEQUENCE`](create-sequence.html).

If you use `GENERATED BY DEFAULT AS IDENTITY` to define the identity column, any [`INSERT`](insert.html)/[`UPSERT`](upsert.html)/[`UPDATE`](update.html) operations that specify a new value for the identity column will overwrite the default sequential values in the column. If you use `GENERATED ALWAYS AS IDENTITY`, the column's sequential values cannot be overwritten.

Note the following limitations of identity columns:

- `GENERATED ALWAYS AS IDENTITY`/`GENERATED BY DEFAULT AS IDENTITY` is supported in [`ALTER TABLE ... ADD COLUMN`](add-column.html) statements only when the table being altered is empty, as [CockroachDB does not support back-filling sequential column data](known-limitations.html#adding-a-column-with-sequence-based-default-values). For more information, see the [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/42508).
- Unlike PostgreSQL, CockroachDB does not support using the `OVERRIDING SYSTEM VALUE` clause in `INSERT`/`UPDATE`/`UPSERT` statements to overwrite `GENERATED ALWAYS AS IDENTITY` identity column values.

For an example of an identity column, see [Create a table with an identity column](#create-a-table-with-an-identity-column).

### `NOT VISIBLE` property

The `NOT VISIBLE` property specifies a column will not be returned when using `*` in a [`SELECT` clause](select-clause.html). You can apply the `NOT VISIBLE` property only to individual columns. For an example, refer to [Show the `CREATE TABLE` statement for a table with a hidden column](show-create.html#show-the-create-table-statement-for-a-table-with-a-hidden-column).

## Create a table like an existing table

CockroachDB supports the `CREATE TABLE LIKE` syntax for creating a new table based on the schema of an existing table.

The following options are supported:

- `INCLUDING CONSTRAINTS` adds all [`CHECK`](check.html) constraints from the source table.
- `INCLUDING DEFAULTS` adds all [`DEFAULT`](default-value.html) column expressions from the source table.
- `INCLUDING GENERATED` adds all [computed column](computed-columns.html) expressions from the source table.
- `INCLUDING INDEXES` adds all [indexes](indexes.html) from the source table.
- `INCLUDING ALL` includes all of the specifiers above.

To exclude specifiers, use the `EXCLUDING` keyword. Excluding specifiers can be useful if you want to use `INCLUDING ALL`, and exclude just one or two specifiers. The last `INCLUDING`/`EXCLUDING` keyword for a given specifier takes priority.

{{site.data.alerts.callout_info}}
`CREATE TABLE LIKE` statements cannot copy [column families](column-families.html), [partitions](partitioning.html), and [foreign key constraints](foreign-key.html) from existing tables. If you want these column qualifications in a new table, you must recreate them manually.

`CREATE TABLE LIKE` copies all hidden columns (e.g., the hidden [`crdb_region`](set-locality.html#crdb_region) column in multi-region tables) from the existing table to the new table.
{{site.data.alerts.end}}

Supported `LIKE` specifiers can also be mixed with ordinary `CREATE TABLE` specifiers. For example:

~~~ sql
CREATE TABLE table1 (a INT PRIMARY KEY, b INT NOT NULL DEFAULT 3 CHECK (b > 0), INDEX(b));

CREATE TABLE table2 (LIKE table1 INCLUDING ALL EXCLUDING CONSTRAINTS, c INT, INDEX(b,c));
~~~

In this example, `table2` is created with the indexes and default values of `table1`, but not the `CHECK` constraints, because `EXCLUDING CONSTRAINTS` was
specified after `INCLUDING ALL`. `table2` also includes an additional column and index.

For additional examples, see [Create a new table from an existing one](#create-a-new-table-from-an-existing-one).

## Examples

### Create a table

In this example, we create the `users` table with a single [primary key](primary-key.html) column defined. In CockroachDB, every table requires a [primary key](primary-key.html). If one is not explicitly defined, a column called `rowid` of the type `INT` is added automatically as the primary key, with the `unique_rowid()` function used to ensure that new rows always default to unique `rowid` values. The primary key is automatically indexed.

For performance recommendations on primary keys, see the [Schema Design: Create a Table](schema-design-table.html) page and the [SQL Performance Best Practices](performance-best-practices-overview.html#use-multi-column-primary-keys) page.

{{site.data.alerts.callout_info}}
  If no primary key is explicitly defined in a `CREATE TABLE` statement, you can add a primary key to the table with [`ADD CONSTRAINT ... PRIMARY KEY`](add-constraint.html) or [`ALTER PRIMARY KEY`](alter-primary-key.html). If the `ADD` or `ALTER` statement follows the `CREATE TABLE` statement, and is part of the same transaction, no default primary key will be created. If the table has already been created and the transaction committed, the `ADD` or `ALTER` statements replace the default primary key.
 {{site.data.alerts.end}}

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
  city        | VARCHAR   |    false    | NULL           |                       | {primary} |   false
  name        | VARCHAR   |    true     | NULL           |                       | {primary} |   false
  address     | VARCHAR   |    true     | NULL           |                       | {primary} |   false
  credit_card | VARCHAR   |    true     | NULL           |                       | {primary} |   false
  dl          | STRING    |    true     | NULL           |                       | {primary} |   false
(6 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM users;
~~~

~~~
  table_name | index_name | non_unique | seq_in_index | column_name | direction | storing | implicit
+------------+------------+------------+--------------+-------------+-----------+---------+----------+
  users      | users_pkey |   false    |            1 | city        | ASC       |  false  |  false
  users      | users_pkey |   false    |            2 | id          | ASC       |  false  |  false
  users      | users_pkey |   false    |            3 | name        | N/A       |  true   |  false
  users      | users_pkey |   false    |            4 | address     | N/A       |  true   |  false
  users      | users_pkey |   false    |            5 | credit_card | N/A       |  true   |  false
  users      | users_pkey |   false    |            6 | dl          | N/A       |  true   |  false
(6 rows)
~~~

### Create a table with secondary and GIN indexes

In this example, we create secondary and GIN indexes during table creation. Secondary indexes allow efficient access to data with keys other than the primary key. [GIN indexes](inverted-indexes.html) allow efficient access to the schemaless data in a [`JSONB`](jsonb.html) column.

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
        INDEX index_status (status),
        INVERTED INDEX ix_vehicle_ext (ext),
        FAMILY "primary" (id, city, type, owner_id, creation_time, status, current_location, ext)
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM vehicles;
~~~

~~~
  table_name |   index_name   | non_unique | seq_in_index | column_name | direction | storing | implicit
-------------+----------------+------------+--------------+-------------+-----------+---------+-----------
  vehicles   | index_status   |    true    |            1 | status           | ASC       |  false  |  false
  vehicles   | index_status   |    true    |            2 | city             | ASC       |  false  |   true
  vehicles   | index_status   |    true    |            3 | id               | ASC       |  false  |   true
  vehicles   | ix_vehicle_ext |    true    |            1 | ext              | ASC       |  false  |  false
  vehicles   | ix_vehicle_ext |    true    |            2 | city             | ASC       |  false  |   true
  vehicles   | ix_vehicle_ext |    true    |            3 | id               | ASC       |  false  |   true
  vehicles   | vehicles_pkey  |   false    |            1 | city             | ASC       |  false  |  false
  vehicles   | vehicles_pkey  |   false    |            2 | id               | ASC       |  false  |  false
  vehicles   | vehicles_pkey  |   false    |            3 | type             | N/A       |  true   |  false
  vehicles   | vehicles_pkey  |   false    |            4 | owner_id         | N/A       |  true   |  false
  vehicles   | vehicles_pkey  |   false    |            5 | creation_time    | N/A       |  true   |  false
  vehicles   | vehicles_pkey  |   false    |            6 | status           | N/A       |  true   |  false
  vehicles   | vehicles_pkey  |   false    |            7 | current_location | N/A       |  true   |  false
  vehicles   | vehicles_pkey  |   false    |            8 | ext              | N/A       |  true   |  false
(14 rows)
~~~

We also have other resources on indexes:

- Create indexes for existing tables using [`CREATE INDEX`](create-index.html).
- [Learn more about indexes](indexes.html).

### Create a table with auto-generated unique row IDs

{% include {{ page.version.version }}/faq/auto-generate-unique-ids.html %}

### Create a table with a foreign key constraint

[Foreign key constraints](foreign-key.html) guarantee a column uses only values that already exist in the column it references, which must be from another table. This constraint enforces referential integrity between the two tables.

There are a [number of rules](foreign-key.html#rules-for-creating-foreign-keys) that govern foreign keys, but the most important rule is that referenced columns must contain only unique values. This means the `REFERENCES` clause must use exactly the same columns as a [primary key](primary-key.html) or [unique](unique.html) constraint.

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
  column_name | data_type | is_nullable | column_default | generation_expression |           indices           | is_hidden
--------------+-----------+-------------+----------------+-----------------------+-----------------------------+------------
  id          | UUID      |    false    | NULL           |                       | {users_name_idx,users_pkey} |   false
  city        | VARCHAR   |    false    | NULL           |                       | {users_name_idx,users_pkey} |   false
  name        | VARCHAR   |    true     | NULL           |                       | {users_name_idx,users_pkey} |   false
  address     | VARCHAR   |    true     | NULL           |                       | {users_pkey}                |   false
  credit_card | VARCHAR   |    true     | NULL           |                       | {users_pkey}                |   false
  dl          | STRING    |    true     | NULL           |                       | {users_dl_key}              |   false
(6 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEX FROM users;
~~~

~~~
  table_name |  index_name  | non_unique | seq_in_index | column_name | direction | storing | implicit
+------------+--------------+------------+--------------+-------------+-----------+---------+----------+
  users      | users_pkey   |   false    |            1 | id          | ASC       |  false  |  false
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

### Create a table with a hash-sharded primary index

{% include {{page.version.version}}/performance/use-hash-sharded-indexes.md %}

{% include {{page.version.version}}/performance/create-table-hash-sharded-primary-index.md %}

### Create a table with a hash-sharded secondary index

{% include {{page.version.version}}/performance/create-table-hash-sharded-secondary-index.md %}

### Create a new table from an existing one

#### Create a table including all supported source specifiers

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE vehicles;
~~~

~~~
  table_name |                                              create_statement
-------------+-------------------------------------------------------------------------------------------------------------
  vehicles   | CREATE TABLE public.vehicles (
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     city STRING NOT NULL,
             |     type STRING NULL,
             |     owner_id UUID NULL,
             |     creation_time TIMESTAMP NULL,
             |     status STRING NULL,
             |     current_location STRING NULL,
             |     ext JSONB NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     CONSTRAINT fk_owner_id_ref_users FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE,
             |     INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC),
             |     INVERTED INDEX ix_vehicle_ext (ext),
             |     FAMILY "primary" (id, city, type, owner_id, creation_time, status, current_location, ext)
             | )
(1 row
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE vehicles2 (
        LIKE vehicles INCLUDING ALL
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE vehicles2;
~~~

~~~
  table_name |                                       create_statement
-------------+------------------------------------------------------------------------------------------------
  vehicles2  | CREATE TABLE public.vehicles2 (
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
             |     FAMILY "primary" (id, city, type, owner_id, creation_time, status, current_location, ext)
             | )
(1 row)
~~~

Note that the foreign key constraint `fk_owner_id_ref_users` in the source table is not included in the new table.

#### Create a table with some source specifiers and a foreign key constraint

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE vehicles3 (
        LIKE vehicles INCLUDING DEFAULTS INCLUDING INDEXES,
        CONSTRAINT fk_owner_id_ref_users FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE vehicles3;
~~~

~~~
  table_name |                                              create_statement
-------------+-------------------------------------------------------------------------------------------------------------
  vehicles3  | CREATE TABLE public.vehicles3 (
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     city STRING NOT NULL,
             |     type STRING NULL,
             |     owner_id UUID NULL,
             |     creation_time TIMESTAMP NULL,
             |     status STRING NULL,
             |     current_location STRING NULL,
             |     ext JSONB NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     CONSTRAINT fk_owner_id_ref_users FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE,
             |     INDEX vehicles_auto_index_fk_city_ref_users (city ASC, owner_id ASC),
             |     INVERTED INDEX ix_vehicle_ext (ext),
             |     FAMILY "primary" (id, city, type, owner_id, creation_time, status, current_location, ext)
             | )
(1 row)
~~~

### Create a table in a multi-region database

To create a table with a specific [table locality](multiregion-overview.html#table-locality) in a [multi-region database](multiregion-overview.html), add a `LOCALITY` clause to the end of the table's `CREATE TABLE` statement.

{{site.data.alerts.callout_info}}
In order to set table localities, the database that contains the table must have [database regions](multiregion-overview.html#database-regions).

By default, all tables in a multi-region database have a [`REGIONAL BY TABLE IN PRIMARY REGION`](multiregion-overview.html#regional-tables) locality.
{{site.data.alerts.end}}

#### Create a table with a global locality

To create a table with a [`GLOBAL`](multiregion-overview.html#global-tables) locality, add a `LOCALITY GLOBAL` clause to the end of the `CREATE TABLE` statement.

The `GLOBAL` locality is useful for "read-mostly" tables of reference data that are rarely updated, but need to be read with low latency from all regions.

For example, the `promo_codes` table of the [`movr` database](movr.html) is rarely updated after being initialized, but it needs to be read by nodes in all regions.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE promo_codes (
    code STRING PRIMARY KEY,
    description STRING,
    creation_time TIMESTAMP,
    expiration_time TIMESTAMP,
    rules JSONB)
    LOCALITY GLOBAL;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW TABLES)
SELECT * FROM x WHERE table_name='promo_codes';
~~~

~~~
  schema_name | table_name  | type  | owner | estimated_row_count | locality
--------------+-------------+-------+-------+---------------------+-----------
  public      | promo_codes | table | demo  |                   0 | GLOBAL
(1 row)
~~~

#### Create a table with a regional-by-table locality

To create a table with a [`REGIONAL BY TABLE`](multiregion-overview.html#regional-tables) locality, add a `LOCALITY REGIONAL BY TABLE` clause to the end of the `CREATE TABLE` statement.

{{site.data.alerts.callout_info}}
`REGIONAL BY TABLE IN PRIMARY REGION` is the default locality for all tables created in a multi-region database.
{{site.data.alerts.end}}

The `REGIONAL BY TABLE` locality is useful for tables that require low-latency reads and writes from specific region.

For example, suppose you want to create a table for your application's end users in a specific state:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE users_ny (
    id UUID PRIMARY KEY,
    name STRING,
    address STRING)
    LOCALITY REGIONAL BY TABLE IN "us-east1";
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> WITH x AS (SHOW TABLES) SELECT * FROM x WHERE table_name='users_ny';
~~~

~~~
  schema_name | table_name | type  | owner | estimated_row_count |            locality
--------------+------------+-------+-------+---------------------+----------------------------------
  public      | users_ny   | table | demo  |                   0 | REGIONAL BY TABLE IN "us-east1"
(1 row)
~~~

{{site.data.alerts.callout_success}}
`LOCALITY REGIONAL` is an alias for `LOCALITY REGIONAL BY TABLE`.
{{site.data.alerts.end}}

#### Create a table with a regional-by-row locality

To create a table with a [`REGIONAL-BY-ROW`](multiregion-overview.html#regional-by-row-tables) locality, add a `LOCALITY REGIONAL BY ROW` clause to the end of the `CREATE TABLE` statement.

The `REGIONAL BY ROW` locality is useful for tables that require low-latency reads and writes from different regions, where the low-latency region is specified at the row level.

For example, the `vehicles` table of the [`movr` database](movr.html) is read to and written from nodes in different regions.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE vehicles (
    id UUID PRIMARY KEY,
    type STRING,
    city STRING,
    owner_id UUID,
    creation_time TIMESTAMP,
    status STRING,
    current_location STRING,
    ext JSONB)
    LOCALITY REGIONAL BY ROW;
~~~

CockroachDB will automatically assign each row to a region based on the locality of the node from which the row is inserted. It will then optimize subsequent read and write queries executed from nodes located in the region assigned to the rows being queried.

{{site.data.alerts.callout_info}}
If the node from which a row is inserted has a locality that does not correspond to a region in the database, then the row will be assigned to the database's primary region.
{{site.data.alerts.end}}

To assign rows to regions, CockroachDB creates and manages a hidden [`crdb_region` column](set-locality.html#crdb_region), of [`ENUM`](enum.html) type `crdb_internal_region`. To override the automatic region assignment and choose the region in which rows will be placed, you can provide a value for the `crdb_region` column in `INSERT` and `UPDATE` queries on the table.

{{site.data.alerts.callout_info}}
The region value for `crdb_region` must be one of the regions added to the database, and present in the `crdb_internal_region` `ENUM`. To return the available regions, use a [`SHOW REGIONS FROM DATABASE <database name>`](show-regions.html) statement, or a [`SHOW ENUMS`](show-enums.html) statement.
{{site.data.alerts.end}}

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE vehicles (
    id UUID PRIMARY KEY,
    type STRING,
    city STRING,
    owner_id UUID,
    creation_time TIMESTAMP,
    status STRING,
    current_location STRING,
    ext JSONB)
    LOCALITY REGIONAL BY ROW;
~~~

~~~ sql
> SHOW REGIONS FROM DATABASE movr;
~~~

~~~
  database |    region    | primary |  zones
-----------+--------------+---------+----------
  movr     | us-east1     |  true   | {b,c,d}
  movr     | europe-west1 |  false  | {b,c,d}
  movr     | us-west1     |  false  | {a,b,c}
(3 rows)
~~~

~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |         name         |              values              | owner
---------+----------------------+----------------------------------+--------
  public | crdb_internal_region | {europe-west1,us-east1,us-west1} | root
(1 row)
~~~

You can then manually set the values of the region with each [`INSERT`](insert.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO vehicles (crdb_region, ...) VALUES ('us-east1', ...);
~~~

Alternatively, you could update the rows in the `crdb_region` column to compute the region based on the value of another column, like the `city` column.

~~~ sql
> UPDATE vehicles SET crdb_region = 'us-east1' WHERE city IN (...) ...
~~~

#### Create a table with a regional-by-row locality, using a custom region column

To create a table with a [`REGIONAL-BY-ROW`](multiregion-overview.html#regional-by-row-tables) locality, where the region of each row in a table is based on the value of a specific column that you create, you can add a `LOCALITY REGIONAL BY ROW AS <region>` clause to the end of the `CREATE TABLE` statement.

Using the `LOCALITY REGIONAL BY ROW AS <region>` clause, you can assign rows to regions based on the value of any custom column of type `crdb_internal_region`.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE vehicles (
    id UUID PRIMARY KEY,
    type STRING,
    city STRING,
    region crdb_internal_region AS (
      CASE
        WHEN city IN ('new york', 'boston', 'washington dc', 'chicago', 'detroit', 'minneapolis') THEN 'us-east1'
        WHEN city IN ('san francisco', 'seattle', 'los angeles') THEN 'us-west1'
        WHEN city IN ('amsterdam', 'paris', 'rome') THEN 'europe-west1'
      END) STORED,
    owner_id UUID,
    creation_time TIMESTAMP,
    status STRING,
    current_location STRING,
    ext JSONB)
    LOCALITY REGIONAL BY ROW AS region;
~~~

CockroachDB will then assign a region to each row, based on the value of the `region` column. In this example, the `region` column is computed from the value of the `city` column.

### Create a table with an identity column

 [Identity columns](#identity-columns) define a sequence from which to populate a column when a new row is inserted.

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE bank (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_index INT8 UNIQUE,
    balance INT8,
    payload STRING,
    numerical INT8 GENERATED BY DEFAULT AS IDENTITY (INCREMENT 1 MINVALUE 0 START 0)
);
~~~

CockroachDB creates a sequence to use as the `numerical` column's default value.

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW SEQUENCES;
~~~

~~~
  sequence_schema |   sequence_name
------------------+---------------------
  public          | bank_numerical_seq
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW COLUMNS FROM bank;
~~~

~~~
  column_name | data_type | is_nullable |                 column_default                 | generation_expression |            indices             | is_hidden
--------------+-----------+-------------+------------------------------------------------+-----------------------+--------------------------------+------------
  id          | UUID      |    false    | gen_random_uuid()                              |                       | {bank_order_index_key,primary} |   false
  order_index | INT8      |    true     | NULL                                           |                       | {bank_order_index_key,primary} |   false
  balance     | INT8      |    true     | NULL                                           |                       | {primary}                      |   false
  payload     | STRING    |    true     | NULL                                           |                       | {primary}                      |   false
  numerical   | INT8      |    false    | nextval('public.bank_numerical_seq'::REGCLASS) |                       | {primary}                      |   false
(5 rows)
~~~

When a new row is added to the table, CockroachDB populates the `numerical` column with the result of the `nextval('bank_numerical_seq')` [built-in function](functions-and-operators.html).

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO bank (order_index, balance) VALUES (1, 0), (2, 0), (3, 0);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT id, order_index, balance, numerical FROM bank ORDER BY order_index;
~~~

~~~
                   id                  | order_index | balance | numerical
---------------------------------------+-------------+---------+------------
  0b533801-052e-4837-8e13-0ef2fa6f8883 |           1 |       0 |         0
  9acc87ad-ced6-4744-9397-6a081a7a9c79 |           2 |       0 |         1
  4f929768-e3da-49cf-b8a6-5381e47953ca |           3 |       0 |         2
(3 rows)
~~~

The `numerical` column in this example follows the `BY DEFAULT` rule. According to this rule, if the value of an identity is explicitly updated, the sequence value is overwritten:

{% include_cached copy-clipboard.html %}
~~~ sql
> UPDATE bank SET numerical = 500 WHERE id = '0b533801-052e-4837-8e13-0ef2fa6f8883';
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT id, order_index, balance, numerical FROM bank ORDER BY order_index;
~~~

~~~
                   id                  | order_index | balance | numerical
---------------------------------------+-------------+---------+------------
  0b533801-052e-4837-8e13-0ef2fa6f8883 |           1 |       0 |       500
  9acc87ad-ced6-4744-9397-6a081a7a9c79 |           2 |       0 |         1
  4f929768-e3da-49cf-b8a6-5381e47953ca |           3 |       0 |         2
(3 rows)
~~~

Inserting explicit values does not affect the next value of the sequence:

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO bank (order_index, balance, numerical) VALUES (4, 0, 3);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO bank (order_index, balance) VALUES (5, 0);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT id, order_index, balance, numerical FROM bank ORDER BY order_index;
~~~

~~~
                   id                  | order_index | balance | numerical
---------------------------------------+-------------+---------+------------
  0b533801-052e-4837-8e13-0ef2fa6f8883 |           1 |       0 |       500
  9acc87ad-ced6-4744-9397-6a081a7a9c79 |           2 |       0 |         1
  4f929768-e3da-49cf-b8a6-5381e47953ca |           3 |       0 |         2
  9165ab56-c41c-4a8a-ac0c-15e82243dc4d |           4 |       0 |         3
  40b5620f-cd56-4c03-b0ab-b4a63956dfe6 |           5 |       0 |         3
(5 rows)
~~~

{{site.data.alerts.callout_info}}
If the `numerical` column were to follow the `ALWAYS` rule instead, then the sequence values in the column could not be overwritten.
{{site.data.alerts.end}}

### Create a table with data excluded from backup

In some situations, you may want to exclude a table's row data from a [backup](backup.html). For example, a table could contain high-churn data that you would like to [garbage collect](architecture/storage-layer.html#garbage-collection) more quickly than the [incremental backup](take-full-and-incremental-backups.html#incremental-backups) schedule for the database or cluster that will hold the table. You can use the `exclude_data_from_backup = true` parameter with `CREATE TABLE` to mark a table's row data for exclusion from a backup:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE promo_codes (
    code VARCHAR NOT NULL,
    description VARCHAR NULL,
    creation_time TIMESTAMP NULL,
    expiration_time TIMESTAMP NULL,
    rules JSONB NULL,
    CONSTRAINT promo_codes_pkey PRIMARY KEY (code ASC)
  )
WITH (exclude_data_from_backup = true);
~~~

To set `exclude_data_from_backup` on an existing table, see the [Exclude a table's data from backups](take-full-and-incremental-backups.html#exclude-a-tables-data-from-backups) example.

## See also

- [`INSERT`](insert.html)
- [`ALTER TABLE`](alter-table.html)
- [`DELETE`](delete.html)
- [`DROP TABLE`](drop-table.html)
- [`RENAME TABLE`](rename-table.html)
- [`SHOW CREATE`](show-create.html)
- [`SHOW TABLES`](show-tables.html)
- [`SHOW COLUMNS`](show-columns.html)
- [Column Families](column-families.html)
- [Table-Level Replication Zones](configure-replication-zones.html#create-a-replication-zone-for-a-table)
- [Define Table Partitions](partitioning.html)
- [Online Schema Changes](online-schema-changes.html)
