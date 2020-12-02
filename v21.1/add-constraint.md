---
title: ADD CONSTRAINT
summary: Use the ADD CONSTRAINT statement to add constraints to columns.
toc: true
---

The `ADD CONSTRAINT` [statement](sql-statements.html) is part of `ALTER TABLE` and can add the following [constraints](constraints.html) to columns:

- [`UNIQUE`](#add-the-unique-constraint)
- [`CHECK`](#add-the-check-constraint)
- [`FOREIGN KEY`](#add-the-foreign-key-constraint-with-cascade)

To add a primary key constraint to a table, you should explicitly define the primary key at [table creation](create-table.html). To replace an existing primary key, you can use `ADD CONSTRAINT ... PRIMARY KEY`. For details, see [Changing primary keys with `ADD CONSTRAINT ... PRIMARY KEY`](#changing-primary-keys-with-add-constraint-primary-key).

The [`DEFAULT`](default-value.html) and [`NOT NULL`](not-null.html) constraints are managed through [`ALTER COLUMN`](alter-column.html).

{% include {{ page.version.version }}/sql/combine-alter-table-commands.md %}

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/add_constraint.html %}
</div>

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the table.

## Parameters

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table containing the column you want to constrain.
 `constraint_name` | The name of the constraint, which must be unique to its table and follow these [identifier rules](keywords-and-identifiers.html#identifiers).
 `constraint_elem` | The [`CHECK`](check.html), [foreign key](foreign-key.html), [`UNIQUE`](unique.html) constraint you want to add. <br/><br/>Adding/changing a `DEFAULT` constraint is done through [`ALTER COLUMN`](alter-column.html). <br/><br/>Adding/changing the table's `PRIMARY KEY` is not supported through `ALTER TABLE`; it can only be specified during [table creation](create-table.html).

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Changing primary keys with `ADD CONSTRAINT ... PRIMARY KEY`

 When you change a primary key with [`ALTER TABLE ... ALTER PRIMARY KEY`](alter-primary-key.html), the old primary key index becomes a secondary index. The secondary index created by `ALTER PRIMARY KEY` takes up node memory and can slow down write performance to a cluster. If you do not have queries that filter on the primary key that you are replacing, you can use `ADD CONSTRAINT` to replace the old primary index without creating a secondary index.

`ADD CONSTRAINT ... PRIMARY KEY` can be used to add a primary key to an existing table if one of the following is true:

  - No primary key was explicitly defined at [table creation](create-table.html). In this case, the table is created with a default [primary key on `rowid`](indexes.html#creation). Using `ADD CONSTRAINT ... PRIMARY KEY` drops the default primary key and replaces it with a new primary key.
  - A [`DROP CONSTRAINT`](drop-constraint.html) statement precedes the `ADD CONSTRAINT ... PRIMARY KEY` statement, in the same transaction. For an example, see [Drop and add the primary key constraint](#drop-and-add-a-primary-key-constraint) below.

{{site.data.alerts.callout_info}}
`ALTER TABLE ... ADD PRIMARY KEY` is an alias for `ALTER TABLE ... ADD CONSTRAINT ... PRIMARY KEY`.
{{site.data.alerts.end}}

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Add the `UNIQUE` constraint

Adding the [`UNIQUE` constraint](unique.html) requires that all of a column's values be distinct from one another (except for *NULL* values).

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

Check constraints can be added to columns that were created earlier in the transaction. For example:

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
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     FAMILY "primary" (id, city, name, address, credit_card)
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
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     FAMILY "primary" (id, city, type, owner_id, creation_time, status, current_location, ext)
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
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, id ASC),
             |     FAMILY "primary" (id, city, name, address, credit_card)
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
             |     CONSTRAINT "primary" PRIMARY KEY (city ASC, name ASC, id ASC),
             |     FAMILY "primary" (id, city, name, address, credit_card)
             | )
(1 row)
~~~

Using [`ALTER PRIMARY KEY`](alter-primary-key.html) would have created a `UNIQUE` secondary index called `users_city_id_key`. Instead, there is just one index for the primary key constraint.

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
