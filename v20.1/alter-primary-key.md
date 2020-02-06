---
title: ALTER PRIMARY KEY
summary: Use the ALTER PRIMARY KEY statement to change the primary key of a table.
toc: true
---

The `ALTER PRIMARY KEY` [statement](sql-statements.html) is a subcommand of [`ALTER TABLE`](alter-table.html) and can be used to change the [primary key](primary-key.html) of a table.



{{site.data.alerts.callout_info}}
To manage other constraints, see [`ADD CONSTRAINT`](add-constraint.html) and [`DROP CONSTRAINT`](drop-constraint.html).
{{site.data.alerts.end}}

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/alter_primary_key.html %}
</div>

## Required privileges

The user must have the `CREATE` [privilege](authorization.html#assign-privileges) on a table to alter its primary key.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `table_name` | The name of the table with the primary key that you want to modify. |
| `index_params` | The name of the column(s) that you want to use for the primary key. These columns replace the current primary key column(s). |
| `opt_interleave` | You can potentially optimize query performance by [interleaving tables](interleave-in-parent.html), which changes how CockroachDB stores your data. |

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

You can add a column and change the primary key with a couple `ALTER TABLE` statements:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ADD COLUMN id UUID DEFAULT gen_random_uuid();
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ALTER PRIMARY KEY USING COLUMN (id);
~~~

If you still plan to filter queries on the `name` column, you can add an index on the column to improve performance:

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX ON users (name);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                create_statement
-------------+--------------------------------------------------
  users      | CREATE TABLE users (
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     email STRING NULL,
             |     name STRING NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
             |     INDEX users_name_idx (name ASC),
             |     FAMILY "primary" (id, email, name)
             | )
(1 row)
~~~

### Make a single-column primary key composite for geo-partitioning

Suppose that you are storing the data for users of your application in a table called `users`, defined by the following `CREATE TABLE` statement:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email STRING,
  name STRING,
  INDEX users_name_idx (name)
);
~~~

Now suppose that you want to expand your business from a single region into multiple regions. After you [deploy your application in multiple regions](topology-patterns.html), you consider [geo-partitioning your data](topology-geo-partitioned-replicas.html) to minimize latency and optimize performance. In order to geo-partition the `user` database, you need to add a column specifies the location of the data (e.g., `region`):

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ADD COLUMN region STRING NOT NULL;
~~~

When you geo-partition a database, you [partition the database on a primary key column](partitioning.html#partition-using-primary-key). The primary key of this table is still on `id`. Change the primary key to be composite, on `region` and `id`:

{% include copy-clipboard.html %}
~~~ sql
> ALTER TABLE users ALTER PRIMARY KEY USING COLUMNS (region, id);
~~~
{{site.data.alerts.callout_info}}
The order of the primary key columns is important when geo-partitioning. For performance, always place the partition column first.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE users;
~~~

~~~
  table_name |                      create_statement
-------------+-------------------------------------------------------------
  users      | CREATE TABLE users (
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     email STRING NULL,
             |     name STRING NULL,
             |     region STRING NOT NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (region ASC, id ASC),
             |     INDEX users_name_idx (name ASC),
             |     FAMILY "primary" (id, email, name, region)
             | )
(1 row)
~~~

With a composite primary key on `region` and `id`, the table is ready to be [geo-partitioned](topology-geo-partitioned-replicas.html).

## See also

- [Constraints](constraints.html)
- [`ADD CONSTRAINT`](add-constraint.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`ALTER TABLE`](alter-table.html)
- [`SHOW JOBS`](show-jobs.html)
