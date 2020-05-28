---
title: DROP CONSTRAINT
summary: Use the ALTER CONSTRAINT statement to remove constraints from columns.
toc: true
---

The `DROP CONSTRAINT` [statement](sql-statements.html) is part of [`ALTER TABLE`](alter-table.html) and removes [`CHECK`](check.html) and [`FOREIGN KEY`](foreign-key.html) constraints from columns.

 [`PRIMARY KEY`](primary-key.html) constraints can be dropped with `DROP CONSTRAINT` if an [`ADD CONSTRAINT`](add-constraint.html) statement follows the `DROP CONSTRAINT` statement in the same transaction.

{{site.data.alerts.callout_success}}
When you change a primary key with [`ALTER TABLE ... ALTER PRIMARY KEY`](alter-primary-key.html), the old primary key index becomes a secondary index. If you do not want the old primary key to become a secondary index, use `DROP CONSTRAINT`/[`ADD CONSTRAINT`](add-constraint.html) to change the primary key.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
For information about removing other constraints, see [Constraints: Remove Constraints](constraints.html#remove-constraints).
{{site.data.alerts.end}}

{% include {{ page.version.version }}/sql/combine-alter-table-commands.md %}

## Synopsis

<section>{% include {{ page.version.version }}/sql/diagrams/drop_constraint.html %} </section>

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the table.

## Parameters

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table with the constraint you want to drop.
 `name` | The name of the constraint you want to drop.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

{% include {{page.version.version}}/sql/movr-statements.md %}

### Drop a foreign key constraint

{% include copy-clipboard.html %}
~~~ sql
> SHOW CONSTRAINTS FROM vehicles;
~~~

~~~
  table_name |  constraint_name  | constraint_type |                         details                         | validated
-------------+-------------------+-----------------+---------------------------------------------------------+------------
  vehicles   | fk_city_ref_users | FOREIGN KEY     | FOREIGN KEY (city, owner_id) REFERENCES users(city, id) |   true
  vehicles   | primary           | PRIMARY KEY     | PRIMARY KEY (city ASC, id ASC)                          |   true
(2 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE vehicles DROP CONSTRAINT fk_city_ref_users;
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CONSTRAINTS FROM vehicles;
~~~

~~~
  table_name | constraint_name | constraint_type |            details             | validated
-------------+-----------------+-----------------+--------------------------------+------------
  vehicles   | primary         | PRIMARY KEY     | PRIMARY KEY (city ASC, id ASC) |   true
(1 row)
~~~

### Drop and add a primary key constraint

When you change a primary key with [`ALTER TABLE ... ALTER PRIMARY KEY`](alter-primary-key.html), the old primary key index becomes a secondary index. If you do not want the old primary key to become a secondary index when changing a primary key, you can use `DROP CONSTRAINT`/[`ADD CONSTRAINT`](add-constraint.html) instead.

Suppose that you want to add `name` to the composite primary key of the `users` table.

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

Then, in the same transaction, `DROP` the old `"primary"` constraint and [`ADD`](add-constraint.html) the new one:

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

- [`ADD CONSTRAINT`](add-constraint.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`RENAME CONSTRAINT`](rename-constraint.html)
- [`VALIDATE CONSTRAINT`](validate-constraint.html)
- [`DROP COLUMN`](drop-column.html)
- [`DROP INDEX`](drop-index.html)
- [`ALTER TABLE`](alter-table.html)
- [`SHOW JOBS`](show-jobs.html)
- ['ALTER PRIMARY KEY'](alter-primary-key.html)
