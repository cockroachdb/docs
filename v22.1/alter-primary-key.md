---
title: ALTER PRIMARY KEY
summary: Use the ALTER PRIMARY KEY statement to change the primary key of a table.
toc: true
docs_area: reference.sql
---

The `ALTER PRIMARY KEY` [statement](sql-statements.html) is a subcommand of [`ALTER TABLE`](alter-table.html) that can be used to change the [primary key](primary-key.html) of a table.

{% include {{ page.version.version }}/misc/schema-change-stmt-note.md %}

## Watch the demo

<iframe width="560" height="315" src="https://www.youtube.com/embed/MPx-LXY2D-c" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Details

- You cannot change the primary key of a table that is currently undergoing a primary key change, or any other [schema change](online-schema-changes.html).

- `ALTER PRIMARY KEY` might need to rewrite multiple indexes, which can make it an expensive operation.

-  When you change a primary key with `ALTER PRIMARY KEY`, the old primary key index becomes a [`UNIQUE`](unique.html) secondary index. This helps optimize the performance of queries that still filter on the old primary key column.

- `ALTER PRIMARY KEY` does not alter the [partitions](partitioning.html) on a table or its indexes, even if a partition is defined on [a column in the original primary key](partitioning.html#partition-using-primary-key). If you alter the primary key of a partitioned table, you must update the table partition accordingly.

- The secondary index created by `ALTER PRIMARY KEY` will not be partitioned, even if a partition is defined on [a column in the original primary key](partitioning.html#partition-using-primary-key). To ensure that the table is partitioned correctly, you must create a partition on the secondary index, or drop the secondary index.

- Any new primary key column set by `ALTER PRIMARY KEY` must have an existing [`NOT NULL` constraint](not-null.html). To add a `NOT NULL` constraint to an existing column, use [`ALTER TABLE ... ALTER COLUMN ... SET NOT NULL`](alter-column.html#set-not-null-constraint).

{{site.data.alerts.callout_success}}
To change an existing primary key without creating a secondary index from that primary key, use [`DROP CONSTRAINT ... PRIMARY KEY`/`ADD CONSTRAINT ... PRIMARY KEY`](add-constraint.html#changing-primary-keys-with-add-constraint-primary-key). For examples, see the [`ADD CONSTRAINT`](add-constraint.html#examples) and [`DROP CONSTRAINT`](drop-constraint.html#examples) pages.
{{site.data.alerts.end}}

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/alter_primary_key.html %}
</div>

## Parameters

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table with the primary key that you want to modify.
 `index_params` | The name of the column(s) that you want to use for the primary key. These columns replace the current primary key column(s).
 `USING HASH` | Creates a [hash-sharded index](hash-sharded-indexes.html).

## Required privileges

The user must have the `CREATE` [privilege](security-reference/authorization.html#managing-privileges) on a table to alter its primary key.

## Viewing schema changes

{% include {{ page.version.version }}/misc/schema-change-view-job.md %}

## Examples

### Alter a single-column primary key

Suppose that you are storing the data for users of your application in a table called `users`, defined by the following `CREATE TABLE` statement:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
  name STRING PRIMARY KEY,
  email STRING
);
~~~

The primary key of this table is on the `name` column. This is a poor choice, as some users likely have the same name, and all primary keys enforce a `UNIQUE` constraint on row values of the primary key column. Per our [best practices](performance-best-practices-overview.html#use-uuid-to-generate-unique-ids), you should instead use a `UUID` for single-column primary keys, and populate the rows of the table with generated, unique values.

You can add a column and change the primary key with a couple of `ALTER TABLE` statements:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ADD COLUMN id UUID NOT NULL DEFAULT gen_random_uuid();
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ALTER PRIMARY KEY USING COLUMNS (id);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                create_statement
-------------+--------------------------------------------------
  users      | CREATE TABLE users (
             |     name STRING NOT NULL,
             |     email STRING NULL,
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
             |     UNIQUE INDEX users_name_key (name ASC),
             |     FAMILY "primary" (name, email, id)
             | )
(1 row)
~~~

### Alter an existing primary key to use hash sharding

{% include {{page.version.version}}/performance/alter-primary-key-hash-sharded.md %}

Note that the old primary key index becomes a secondary index, in this case, `users_name_key`. If you do not want the old primary key to become a secondary index when changing a primary key, you can use [`DROP CONSTRAINT`](drop-constraint.html)/[`ADD CONSTRAINT`](add-constraint.html) instead.

## See also

- [Constraints](constraints.html)
- [`ADD CONSTRAINT`](add-constraint.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`ALTER TABLE`](alter-table.html)
- [`SHOW JOBS`](show-jobs.html)
- [Online Schema Changes](online-schema-changes.html)
