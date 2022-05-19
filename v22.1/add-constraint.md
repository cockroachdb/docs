---
title: ADD CONSTRAINT
summary: Use the ADD CONSTRAINT statement to add constraints to columns.
toc: true
docs_area: reference.sql
---

The `ADD CONSTRAINT` [statement](sql-statements.html) is part of `ALTER TABLE` and can add the following [constraints](constraints.html) to columns:

- [`UNIQUE`](#add-the-unique-constraint)
- [`CHECK`](#add-the-check-constraint)
- [`FOREIGN KEY`](#add-the-foreign-key-constraint-with-cascade)

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

To add a primary key constraint to a table, you should explicitly define the primary key at [table creation](create-table.html). To replace an existing primary key, you can use `ADD CONSTRAINT ... PRIMARY KEY`. For details, see [Changing primary keys with `ADD CONSTRAINT ... PRIMARY KEY`](#changing-primary-keys-with-add-constraint-primary-key).

The [`DEFAULT`](default-value.html) and [`NOT NULL`](not-null.html) constraints are managed through [`ALTER COLUMN`](alter-column.html).

{% include {{ page.version.version }}/sql/combine-alter-table-commands.md %}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/add_constraint.html %}
</div>

## Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on the table.

## Parameters

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table containing the column you want to constrain.
 `constraint_name` | The name of the constraint, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers).
 `constraint_elem` | The [`CHECK`](check.html), [foreign key](foreign-key.html), [`UNIQUE`](unique.html) constraint you want to add. <br/><br/>Adding/changing a `DEFAULT` constraint is done through [`ALTER COLUMN`](alter-column.html). <br/><br/>Adding/changing the table's `PRIMARY KEY` is not supported through `ALTER TABLE`; it can only be specified during [table creation](create-table.html).

## View schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Changing primary keys with `ADD CONSTRAINT ... PRIMARY KEY`

When you change a primary key with [`ALTER TABLE ... ALTER PRIMARY KEY`](alter-primary-key.html), the old primary key index becomes a secondary index. The secondary index created by `ALTER PRIMARY KEY` takes up node memory and can slow down write performance to a cluster. If you do not have queries that filter on the primary key that you are replacing, you can use `ADD CONSTRAINT` to replace the old primary index without creating a secondary index.

You can use `ADD CONSTRAINT ... PRIMARY KEY` to add a primary key to an existing table if one of the following is true:

- No primary key was explicitly defined at [table creation](create-table.html). In this case, the table is created with a default [primary key on `rowid`](indexes.html#creation). Using `ADD CONSTRAINT ... PRIMARY KEY` drops the default primary key and replaces it with a new primary key.
- A [`DROP CONSTRAINT`](drop-constraint.html) statement precedes the `ADD CONSTRAINT ... PRIMARY KEY` statement, in the same transaction. For an example, see [Drop and add the primary key constraint](#drop-and-add-a-primary-key-constraint).

{{site.data.alerts.callout_info}}
`ALTER TABLE ... ADD PRIMARY KEY` is an alias for `ALTER TABLE ... ADD CONSTRAINT ... PRIMARY KEY`.
{{site.data.alerts.end}}

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Add the `UNIQUE` constraint

Adding the [`UNIQUE` constraint](unique.html) requires that all of a column's values be distinct from one another (except for `NULL` values).

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ADD CONSTRAINT id_name_unique UNIQUE (id, name);
~~~

### Add the `CHECK` constraint

Adding the [`CHECK` constraint](check.html) requires that all of a column's values evaluate to `TRUE` for a Boolean expression.

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE rides ADD CONSTRAINT check_revenue_positive CHECK (revenue >= 0);
~~~

In the process of adding the constraint CockroachDB will run a background job to validate existing table data. If CockroachDB finds a row that violates the constraint during the validation step, the [`ADD CONSTRAINT`](add-constraint.html) statement will fail.

#### Add constraints to columns created during a transaction

You can add check constraints to columns that were created earlier in the transaction. For example:

{% include copy-clipboard.html %}
~~~ sql
> BEGIN;
> ALTER TABLE users ADD COLUMN is_owner STRING;
> ALTER TABLE users ADD CONSTRAINT check_is_owner CHECK (is_owner IN ('yes', 'no', 'unknown'));
> COMMIT;
~~~

~~~
BEGIN
ALTER TABLE
ALTER TABLE
COMMIT
~~~

{{site.data.alerts.callout_info}}
The entire transaction will be rolled back, including any new columns that were added, in the following cases:

- If an existing column is found containing values that violate the new constraint.
- If a new column has a default value or is a [computed column](computed-columns.html) that would have contained values that violate the new constraint.
{{site.data.alerts.end}}

### Add the foreign key constraint with `CASCADE`

To add a foreign key constraint, use the steps shown below.

Given two tables, `users` and `vehicles`, without foreign key constraints:

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE users;
~~~

~~~
  table_name |                      create_statement
-------------+--------------------------------------------------------------
  users      | CREATE TABLE users (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     name VARCHAR NULL,
             |     address VARCHAR NULL,
             |     credit_card VARCHAR NULL,
             |     CONSTRAINT users_pkey PRIMARY KEY (city ASC, id ASC)
             | )
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE vehicles;
~~~

~~~
  table_name |                                       create_statement
-------------+------------------------------------------------------------------------------------------------
  vehicles   | CREATE TABLE vehicles (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     type VARCHAR NULL,
             |     owner_id UUID NULL,
             |     creation_time TIMESTAMP NULL,
             |     status VARCHAR NULL,
             |     current_location VARCHAR NULL,
             |     ext JSONB NULL,
             |     CONSTRAINT vehicles_pkey PRIMARY KEY (city ASC, id ASC),
             | )
(1 row)
~~~

You can include a [foreign key action](foreign-key.html#foreign-key-actions) to specify what happens when a foreign key is updated or deleted.

Using `ON DELETE CASCADE` will ensure that when the referenced row is deleted, all dependent objects are also deleted.

{{site.data.alerts.callout_danger}}
`CASCADE` does not list the objects it drops or updates, so it should be used with caution.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE vehicles ADD CONSTRAINT users_fk FOREIGN KEY (city, owner_id) REFERENCES users (city, id) ON DELETE CASCADE;
~~~

{{site.data.alerts.callout_info}}
 By default, referenced columns must be in the same database as the referencing foreign key column. To enable cross-database foreign key references, set the `sql.cross_db_fks.enabled` [cluster setting](cluster-settings.html) to `true`.
{{site.data.alerts.end}}

### Drop and add a primary key constraint

Suppose that you want to add `name` to the composite primary key of the `users` table, [without creating a secondary index of the existing primary key](#changing-primary-keys-with-add-constraint-primary-key).

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                      create_statement
-------------+--------------------------------------------------------------
  users      | CREATE TABLE users (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     name VARCHAR NULL,
             |     address VARCHAR NULL,
             |     credit_card VARCHAR NULL,
             |     CONSTRAINT users_pkey PRIMARY KEY (city ASC, id ASC)
             | )
(1 row)
~~~

First, add a [`NOT NULL`](not-null.html) constraint to the `name` column with [`ALTER COLUMN`](alter-column.html).

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ALTER COLUMN name SET NOT NULL;
~~~

Then, in the same transaction, [`DROP`](drop-constraint.html) the old `"primary"` constraint and `ADD` the new one:

{% include copy-clipboard.html %}
~~~ sql
> BEGIN;
> ALTER TABLE users DROP CONSTRAINT "primary";
> ALTER TABLE users ADD CONSTRAINT "primary" PRIMARY KEY (city, name, id);
> COMMIT;
~~~

~~~
NOTICE: primary key changes are finalized asynchronously; further schema changes on this table may be restricted until the job completes
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                          create_statement
-------------+---------------------------------------------------------------------
  users      | CREATE TABLE users (
             |     id UUID NOT NULL,
             |     city VARCHAR NOT NULL,
             |     name VARCHAR NOT NULL,
             |     address VARCHAR NULL,
             |     credit_card VARCHAR NULL,
             |     CONSTRAINT users_pkey PRIMARY KEY (city ASC, name ASC, id ASC),
             | )
(1 row)
~~~

Using [`ALTER PRIMARY KEY`](alter-primary-key.html) would have created a `UNIQUE` secondary index called `users_city_id_key`. Instead, there is just one index for the primary key constraint.

### Add a unique index to a `REGIONAL BY ROW` table

{% include {{page.version.version}}/sql/indexes-regional-by-row.md %}

This example assumes you have a simulated multi-region database running on your local machine following the steps described in [Low Latency Reads and Writes in a Multi-Region Cluster](demo-low-latency-multi-region-deployment.html). It shows how a `UNIQUE` index is partitioned, but it's similar to how all indexes are partitioned on `REGIONAL BY ROW` tables.

To show how the automatic partitioning of indexes on `REGIONAL BY ROW` tables works, we will:

1. [Add a column](add-column.html) to the `users` table in the [MovR dataset](movr.html).
1. Add a [`UNIQUE` constraint](unique.html) to that column.
1. Verify that the index is automatically partitioned for better multi-region performance by using [`SHOW INDEXES`](show-index.html) and [`SHOW PARTITIONS`](show-partitions.html).

First, add a column and its unique constraint. We'll use `email` since that is something that should be unique per user.

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE users ADD COLUMN email STRING;
~~~

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE users ADD CONSTRAINT user_email_unique UNIQUE (email);
~~~

Next, issue the [`SHOW INDEXES`](show-index.html) statement. You will see that [the implicit region column](set-locality.html#set-the-table-locality-to-regional-by-row) that was added when the table [was converted to regional by row](demo-low-latency-multi-region-deployment.html#configure-regional-by-row-tables) is now indexed:

{% include copy-clipboard.html %}
~~~ sql
SHOW INDEXES FROM users;
~~~

~~~
  table_name |    index_name     | non_unique | seq_in_index | column_name | direction | storing | implicit
-------------+-------------------+------------+--------------+-------------+-----------+---------+-----------
  users      | primary           |   false    |            1 | region      | ASC       |  false  |   true
  users      | primary           |   false    |            2 | id          | ASC       |  false  |  false
  users      | primary           |   false    |            3 | city        | N/A       |  true   |  false
  users      | primary           |   false    |            4 | name        | N/A       |  true   |  false
  users      | primary           |   false    |            5 | address     | N/A       |  true   |  false
  users      | primary           |   false    |            6 | credit_card | N/A       |  true   |  false
  users      | primary           |   false    |            7 | email       | N/A       |  true   |  false
  users      | user_email_unique |   false    |            1 | region      | ASC       |  false  |   true
  users      | user_email_unique |   false    |            2 | email       | ASC       |  false  |  false
  users      | user_email_unique |   false    |            3 | id          | ASC       |  false  |   true
  users      | users_city_idx    |    true    |            1 | region      | ASC       |  false  |   true
  users      | users_city_idx    |    true    |            2 | city        | ASC       |  false  |  false
  users      | users_city_idx    |    true    |            3 | id          | ASC       |  false  |   true
(13 rows)
~~~

Next, issue the [`SHOW PARTITIONS`](show-partitions.html) statement. The output below (which is edited for length) will verify that the unique index was automatically [partitioned](partitioning.html) for you. It shows that the `user_email_unique` index is now partitioned by the database regions `europe-west1`, `us-east1`, and `us-west1`.

{% include copy-clipboard.html %}
~~~ sql
SHOW PARTITIONS FROM TABLE users;
~~~

~~~
  database_name | table_name | partition_name | column_names |       index_name        | partition_value  |  ...
----------------+------------+----------------+--------------+-------------------------+------------------+-----
  movr          | users      | europe-west1   | region       | users@user_email_unique | ('europe-west1') |  ...
  movr          | users      | us-east1       | region       | users@user_email_unique | ('us-east1')     |  ...
  movr          | users      | us-west1       | region       | users@user_email_unique | ('us-west1')     |  ...
~~~

To ensure that the uniqueness constraint is enforced properly across regions when rows are inserted, or the `email` column of an existing row is updated, the database needs to do the following additional work when indexes are partitioned as shown above:

1. Run a one-time-only validation query to ensure that the existing data in the table satisfies the unique constraint.
1. Thereafter, the [optimizer](cost-based-optimizer.html) will automatically add a "uniqueness check" when necessary to any [`INSERT`](insert.html), [`UPDATE`](update.html), or [`UPSERT`](upsert.html) statement affecting the columns in the unique constraint.

{% include {{page.version.version}}/sql/locality-optimized-search.md %}

### Using `DEFAULT gen_random_uuid()` in `REGIONAL BY ROW` tables

To auto-generate unique row IDs in `REGIONAL BY ROW` tables, use the [`UUID`](uuid.html) column with the `gen_random_uuid()` [function](functions-and-operators.html#id-generation-functions) as the [default value](default-value.html):

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
        id UUID NOT NULL DEFAULT gen_random_uuid(),
        city STRING NOT NULL,
        name STRING NULL,
        address STRING NULL,
        credit_card STRING NULL,
        CONSTRAINT users_pkey PRIMARY KEY (city ASC, id ASC)
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO users (name, city) VALUES ('Petee', 'new york'), ('Eric', 'seattle'), ('Dan', 'seattle');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM users;
~~~

~~~
                   id                  |   city   | name  | address | credit_card
+--------------------------------------+----------+-------+---------+-------------+
  cf8ee4e2-cd74-449a-b6e6-a0fb2017baa4 | new york | Petee | NULL    | NULL
  2382564e-702f-42d9-a139-b6df535ae00a | seattle  | Eric  | NULL    | NULL
  7d27e40b-263a-4891-b29b-d59135e55650 | seattle  | Dan   | NULL    | NULL
(3 rows)
~~~

{{site.data.alerts.callout_info}}
When using `DEFAULT gen_random_uuid()` on columns in `REGIONAL BY ROW` tables, uniqueness checks on those columns are disabled by default for performance purposes. CockroachDB assumes uniqueness based on the way this column generates [`UUIDs`](uuid.html#create-a-table-with-auto-generated-unique-row-ids). To enable this check, you can modify the `sql.optimizer.uniqueness_checks_for_gen_random_uuid.enabled` [cluster setting](cluster-settings.html). Note that while there is virtually no chance of a [collision](https://en.wikipedia.org/wiki/Universally_unique_identifier#Collisions) occurring when enabling this setting, it is not truly zero.
{{site.data.alerts.end}}

### Using implicit vs. explicit index partitioning in `REGIONAL BY ROW` tables

In `REGIONAL BY ROW` tables, all indexes are partitioned on the region column (usually called [`crdb_region`](set-locality.html#crdb_region)).

These indexes can either include or exclude the partitioning key (`crdb_region`) as the first column in the index definition:

- If `crdb_region` is included in the index definition, a [`UNIQUE` index](unique.html) will enforce uniqueness on the set of columns, just like it would in a non-partitioned table.
- If `crdb_region` is excluded from the index definition, that serves as a signal that CockroachDB should enforce uniqueness on only the columns in the index definition.

In the latter case, the index alone cannot enforce uniqueness on columns that are not a prefix of the index columns, so any time rows are [inserted](insert.html) or [updated](update.html) in a `REGIONAL BY ROW` table that has an implicitly partitioned `UNIQUE` index, the [optimizer](cost-based-optimizer.html) must add uniqueness checks.

Whether or not to explicitly include `crdb_region` in the index definition depends on the context:

- If you only need to enforce uniqueness at the region level, then including `crdb_region` in the `UNIQUE` index definition will enforce these semantics and allow you to get better performance on [`INSERT`](insert.html)s, [`UPDATE`](update.html)s, and [`UPSERT`](upsert.html)s, since there will not be any added latency from uniqueness checks.
- If you need to enforce global uniqueness, you should not include `crdb_region` in the `UNIQUE` (or [`PRIMARY KEY`](primary-key.html)) index definition, and the database will automatically ensure that the constraint is enforced.

To illustrate the different behavior of explicitly vs. implicitly partitioned indexes, we will perform the following tasks:

- Create a schema that includes an explicitly partitioned index, and an implicitly partitioned index.
- Check the output of several queries using `EXPLAIN` to show the differences in behavior between the two.

1. Start [`cockroach demo`](cockroach-demo.html) as follows:

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach demo --geo-partitioned-replicas
    ~~~

1. Create a multi-region database and an `employees` table. There are three indexes in the table, all `UNIQUE` and all partitioned by the `crdb_region` column. The table schema guarantees that both `id` and `email` are globally unique, while `desk_id` is only unique per region. The indexes on `id` and `email` are implicitly partitioned, while the index on `(crdb_region, desk_id)` is explicitly partitioned. `UNIQUE` indexes can only directly enforce uniqueness on all columns in the index, including partitioning columns, so each of these indexes enforce uniqueness for `id`, `email`, and `desk_id` per region, respectively.

    {% include copy-clipboard.html %}
    ~~~ sql
    CREATE DATABASE multi_region_test_db PRIMARY REGION "europe-west1" REGIONS "us-west1", "us-east1";
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    USE multi_region_test_db;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    CREATE TABLE employee (
      id INT PRIMARY KEY,
      email STRING UNIQUE,
      desk_id INT,
      UNIQUE (crdb_region, desk_id)
    ) LOCALITY REGIONAL BY ROW;
    ~~~

1. In the statement below, we add a new user with the required `id`, `email`, and `desk_id` columns. CockroachDB needs to do additional work to enforce global uniqueness for the `id` and `email` columns, which are implicitly partitioned. This additional work is in the form of "uniqueness checks" that the optimizer adds as part of mutation queries.

    {% include copy-clipboard.html %}
    ~~~ sql
    EXPLAIN INSERT INTO employee VALUES (1, 'joe@example.com', 1);
    ~~~

    The `EXPLAIN` output below shows that the optimizer has added two `constraint-check` post queries to check the uniqueness of the implicitly partitioned indexes `id` and `email`. There is no check needed for `desk_id` (really `(crdb_region, desk_id)`), since that constraint is automatically enforced by the explicitly partitioned index we added in the [`CREATE TABLE`](create-table.html) statement above.

    ~~~
                                             info
    --------------------------------------------------------------------------------------
      distribution: local
      vectorized: true

      • root
      │
      ├── • insert
      │   │ into: employee(id, email, desk_id, crdb_region)
      │   │
      │   └── • buffer
      │       │ label: buffer 1
      │       │
      │       └── • values
      │             size: 5 columns, 1 row
      │
      ├── • constraint-check
      │   │
      │   └── • error if rows
      │       │
      │       └── • lookup join (semi)
      │           │ table: employee@primary
      │           │ equality: (lookup_join_const_col_@15, column1) = (crdb_region,id)
      │           │ equality cols are key
      │           │ pred: column10 != crdb_region
      │           │
      │           └── • cross join
      │               │ estimated row count: 3
      │               │
      │               ├── • values
      │               │     size: 1 column, 3 rows
      │               │
      │               └── • scan buffer
      │                     label: buffer 1
      │
      └── • constraint-check
          │
          └── • error if rows
              │
              └── • lookup join (semi)
                  │ table: employee@employee_email_key
                  │ equality: (lookup_join_const_col_@25, column2) = (crdb_region,email)
                  │ equality cols are key
                  │ pred: (column1 != id) OR (column10 != crdb_region)
                  │
                  └── • cross join
                      │ estimated row count: 3
                      │
                      ├── • values
                      │     size: 1 column, 3 rows
                      │
                      └── • scan buffer
                            label: buffer 1
    ~~~

1. The statement below updates the user's `email` column. Because the unique index on the `email` column is implicitly partitioned, the optimizer must perform a uniqueness check.

    {% include copy-clipboard.html %}
    ~~~ sql
    EXPLAIN UPDATE employee SET email = 'joe1@exaple.com' WHERE id = 1;
    ~~~

    In the `EXPLAIN` output below, the optimizer performs a uniqueness check for `email` since we're not updating any other columns (see the `constraint-check` section).

    ~~~
                                                      info
    --------------------------------------------------------------------------------------------------------
      distribution: local
      vectorized: true

      • root
      │
      ├── • update
      │   │ table: employee
      │   │ set: email
      │   │
      │   └── • buffer
      │       │ label: buffer 1
      │       │
      │       └── • render
      │           │ estimated row count: 1
      │           │
      │           └── • union all
      │               │ estimated row count: 1
      │               │ limit: 1
      │               │
      │               ├── • scan
      │               │     estimated row count: 1 (100% of the table; stats collected 1 minute ago)
      │               │     table: employee@primary
      │               │     spans: [/'us-east1'/1 - /'us-east1'/1]
      │               │
      │               └── • scan
      │                     estimated row count: 1 (100% of the table; stats collected 1 minute ago)
      │                     table: employee@primary
      │                     spans: [/'europe-west1'/1 - /'europe-west1'/1] [/'us-west1'/1 - /'us-west1'/1]
      │
      └── • constraint-check
          │
          └── • error if rows
              │
              └── • lookup join (semi)
                  │ table: employee@employee_email_key
                  │ equality: (lookup_join_const_col_@18, email_new) = (crdb_region,email)
                  │ equality cols are key
                  │ pred: (id != id) OR (crdb_region != crdb_region)
                  │
                  └── • cross join
                      │ estimated row count: 3
                      │
                      ├── • values
                      │     size: 1 column, 3 rows
                      │
                      └── • scan buffer
                            label: buffer 1
    ~~~

1. If we only update the user's `desk_id` as shown below, no uniqueness checks are needed, since the index on that column is explicitly partitioned (it's really `(crdb_region, desk_id)`).

    {% include copy-clipboard.html %}
    ~~~ sql
    EXPLAIN UPDATE employee SET desk_id = 2 WHERE id = 1;
    ~~~

    Because no uniqueness check is needed, there is no `constraint-check` section in the `EXPLAIN` output.

    ~~~
                                                  info
    ------------------------------------------------------------------------------------------------
      distribution: local
      vectorized: true

      • update
      │ table: employee
      │ set: desk_id
      │ auto commit
      │
      └── • render
          │ estimated row count: 1
          │
          └── • union all
              │ estimated row count: 1
              │ limit: 1
              │
              ├── • scan
              │     estimated row count: 1 (100% of the table; stats collected 2 minutes ago)
              │     table: employee@primary
              │     spans: [/'us-east1'/1 - /'us-east1'/1]
              │
              └── • scan
                    estimated row count: 1 (100% of the table; stats collected 2 minutes ago)
                    table: employee@primary
                    spans: [/'europe-west1'/1 - /'europe-west1'/1] [/'us-west1'/1 - /'us-west1'/1]
    ~~~

## See also

- [Constraints](constraints.html)
- [Foreign Key Constraint](foreign-key.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`RENAME CONSTRAINT`](rename-constraint.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`VALIDATE CONSTRAINT`](validate-constraint.html)
- [`ALTER COLUMN`](alter-column.html)
- [`CREATE TABLE`](create-table.html)
- [`ALTER TABLE`](alter-table.html)
- [`SHOW JOBS`](show-jobs.html)
- ['ALTER PRIMARY KEY'](alter-primary-key.html)
- [Online Schema Changes](online-schema-changes.html)
