---
title: Secondary Indexes
summary: How and when to create secondary indexes in CockroachDB.
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: develop
---

An [_index_]({% link {{ page.version.version }}/indexes.md %}) is a [logical object]({% link {{ page.version.version }}/schema-design-overview.md %}#database-schema-objects) that helps [CockroachDB queries]({% link {{ page.version.version }}/query-data.md %}) find data more efficiently. When you create an index, CockroachDB creates a copy of the columns selected for the index, and then sorts the rows of data by indexed column values, without sorting the values in the table itself.

CockroachDB automatically creates an index on the table's [primary key]({% link {{ page.version.version }}/primary-key.md %}) columns. This index is called the *primary index*. The primary index helps CockroachDB more efficiently scan rows, as sorted by the table's primary key columns, but it does not help find values as identified by any other columns.

*Secondary indexes* (i.e., all indexes that are not the primary index) improve the performance of queries that identify rows with columns that are not in a table's primary key. CockroachDB automatically creates secondary indexes for columns with a [`UNIQUE` constraint]({% link {{ page.version.version }}/unique.md %}).

This page provides best-practice guidance on creating secondary indexes, with a simple example based on Cockroach Labs's fictional vehicle-sharing company, [MovR]({% link {{ page.version.version }}/movr.md %}).

## Before you begin

Before reading this page, do the following:

- [Create a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/quickstart.md %}) or [start a local cluster]({% link cockroachcloud/quickstart.md %}?filters=local).
- [Review the database schema objects]({% link {{ page.version.version }}/schema-design-overview.md %}).
- [Create a database]({% link {{ page.version.version }}/schema-design-database.md %}).
- [Create a user-defined schema]({% link {{ page.version.version }}/schema-design-schema.md %}).
- [Create a table]({% link {{ page.version.version }}/schema-design-table.md %}).
- Review the [best practices](#best-practices).

## Create a secondary index

To add a secondary index to a table do one of the following:

- Add an `INDEX` clause to the end of a [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %}#create-a-table-with-secondary-and-gin-indexes) statement.

    `INDEX` clauses generally take the following form:

    ~~~
    INDEX {index_name} ({column_names});
    ~~~

    Parameter | Description
    ----------|------------
    `{index_name}` | The name of the index.
    `{column_names}` | The name of the column to index, or a comma-separated list of names of the columns to index.

- Use a [`CREATE INDEX`]({% link {{ page.version.version }}/create-index.md %}) statement.

    `CREATE INDEX` statements generally take the following form:

    ~~~
    CREATE INDEX {index_name} ON {table_name} ({column_names});
    ~~~

    Parameter | Description
    ----------|------------
    `{index_name}` | The name of the index.
    `{table_name}` | The name of the table.
    `{column_names}` | The name of the column to index, or a comma-separated list of names of the columns to index.

For an example, see [Example](#example).

{{site.data.alerts.callout_info}}
- If you do not specify a name for an index, CockroachDB will generate a name.
- The notation for referring to an index is `{table_name}@{index_name}`.
{{site.data.alerts.end}}

## Best practices

Here are some best practices for creating and using secondary indexes.

{{site.data.alerts.callout_success}}
The [`EXPLAIN`]({% link {{ page.version.version }}/explain.md %}#success-responses) command provides index recommendations, including index actions and SQL statements to perform the actions.
{{site.data.alerts.end}}

### Index contents

- Index all columns that you plan to use for [sorting]({% link {{ page.version.version }}/order-by.md %}) or [filtering]({% link {{ page.version.version }}/select-clause.md %}#filter-rows) data.

    {% include {{page.version.version}}/sql/covering-index.md %}

    CockroachDB [pushes filters]({% link {{ page.version.version }}/indexes.md %}#how-do-indexes-work) (i.e., values listed in a [`WHERE` clause]({% link {{ page.version.version }}/select-clause.md %}#parameters)) into an index, which allows it to perform a finite number of sequential scans. In a `WHERE` clause with `n` constrained columns you can filter the first `n-1` columns either on a single constant value using the operator `=` or a list of constant values using the operator `IN`. You can filter column `n` against a range of values using any of the operators `!=`, `<`, `>`, or `NOT IN`.

    Columns with a higher cardinality (higher number of distinct values) should be placed in the index before columns with a lower cardinality. If the cardinality of the columns you wish to add to the index are similar, test multiple column arrangements in a non-production environment to determine the most performant arrangement.

- If you need to index the result of a function applied to one or more columns of a single table, use the function to create a [computed column]({% link {{ page.version.version }}/computed-columns.md %}) and index the column.

- Avoid indexing on sequential keys (e.g., [`TIMESTAMP`/`TIMESTAMPTZ`]({% link {{ page.version.version }}/timestamp.md %}) columns). Writes to indexes with sequential keys can result in [range hotspots]({% link {{ page.version.version }}/understand-hotspots.md %}#hot-range) that negatively affect performance. Instead, use [randomly generated unique IDs]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#unique-id-best-practices) or [multi-column keys]({% link {{ page.version.version }}/performance-best-practices-overview.md %}#use-multi-column-primary-keys).

    If you are working with a table that **must** be indexed on sequential keys, use [hash-sharded indexes]({% link {{ page.version.version }}/hash-sharded-indexes.md %}). For details about the mechanics and performance improvements of hash-sharded indexes in CockroachDB, see our [Hash Sharded Indexes Unlock Linear Scaling for Sequential Workloads](https://www.cockroachlabs.com/blog/hash-sharded-indexes-unlock-linear-scaling-for-sequential-workloads/) blog post.

<a name="storing-index"></a>

- Use a [`STORING` clause]({% link {{ page.version.version }}/create-index.md %}#parameters) to store columns of data that you want returned by common queries, but that you do not plan to use in query filters.

    The `STORING` clause specifies columns that are not part of the index key but should be stored in the index. If a column is specified in a query, and the column is neither indexed nor stored in an index, CockroachDB may either perform a full scan or perform an [index join]({% link {{ page.version.version }}/indexes.md %}#example) if a suitable secondary index exists. However, if the optimizer determines that the index join is too expensive, then CockroachDB will perform a full table scan. For an example, see [Example](#example).

- Review the [specialized indexes]({% link {{ page.version.version }}/schema-design-overview.md %}#specialized-indexes), such as partial and inverted indexes, and decide if you need to create a specialized index instead of a standard index.

- Avoid creating secondary indexes that you do not need.

    - Queries can benefit from an index even if they only filter a prefix of its columns. For example, if you create an index of columns `(A, B, C)`, queries filtering `(A)` or `(A, B)` can use the index, so you don't need to also index `(A)`.

    - If you need to [change a primary key]({% link {{ page.version.version }}/constraints.md %}#change-constraints), and you do not plan to filter queries on the existing primary key column(s), do not use [`ALTER PRIMARY KEY`]({% link {{ page.version.version }}/alter-table.md %}#alter-primary-key) because it creates a secondary index from an existing primary key. Instead, use [`DROP CONSTRAINT ... PRIMARY KEY`/`ADD CONSTRAINT ... PRIMARY KEY`]({% link {{ page.version.version }}/alter-table.md %}#changing-primary-keys-with-add-constraint-primary-key), which does not create a secondary index.

{{site.data.alerts.callout_danger}}
{% include {{page.version.version}}/sql/add-size-limits-to-indexed-columns.md %}
{{site.data.alerts.end}}

### Index management

- Limit creation and deletion of secondary indexes to off-peak hours. Performance impacts are likely if done during peak business hours.

- Do not create indexes as the `root` user. Instead, create indexes as a [different user]({% link {{ page.version.version }}/schema-design-overview.md %}#control-access-to-objects), with fewer privileges, following [authorization best practices]({% link {{ page.version.version }}/security-reference/authorization.md %}#authorization-best-practices). This will likely be the same user that created the table to which the index belongs.

- Drop unused indexes whenever possible.

  - In the DB Console, visit the [**Databases** page]({% link {{ page.version.version }}/ui-databases-page.md %}) and check databases and tables for [**Index Recommendations**]({% link {{ page.version.version }}/ui-databases-page.md %}#index-recommendations) to drop unused indexes.

  - To understand usage statistics for an index, query the [`crdb_internal.index_usage_statistics`]({% link {{ page.version.version }}/crdb-internal.md %}#index_usage_statistics) table.

        {% include_cached copy-clipboard.html %}
        ~~~ sql
        SELECT * FROM crdb_internal.index_usage_statistics;
        ~~~

        To get more detailed information about the table and index names, run a join query against `crdb_internal.index_usage_statistics` and `crdb_internal.table_indexes`. For an example, see [Fix slow writes]({% link {{ page.version.version }}/performance-recipes.md %}#fix-slow-writes).

- {% include {{page.version.version}}/sql/dev-schema-changes.md %}

- {% include {{page.version.version}}/sql/dev-schema-change-limits.md %}

## Example

Suppose you want the MovR application to display all of the bikes available to the users of the MovR platform.

Recall that the `vehicles` table that you created in [Create a Table]({% link {{ page.version.version }}/schema-design-table.md %}) stores rows of data for each vehicle registered with MovR. Your application will need to read any data about vehicles into the application's persistence layer from this table. To display available bikes, the reads will need to filter on the `available` and `type` columns.

Open `max_init.sql`, and, under the `CREATE TABLE` statement for the `vehicles` table, add a `CREATE INDEX` statement for an index on the `type` and `available` columns of the `vehicles` table:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INDEX type_available_idx ON movr.vehicles (type, available);
~~~

This statement creates a secondary index named `type_available_idx`, on the `vehicles` table.

The MovR app might also need to display the vehicle's location and ID, but the app will not be filtering or sorting on those values. If any of the columns referenced in or returned by a query are not in a primary or secondary index key, CockroachDB will need to perform [a full scan of the table]({% link {{ page.version.version }}/sql-tuning-with-explain.md %}#issue-full-table-scans) to find the value. Full table scans can be costly, and should be avoided whenever possible.

To help avoid unnecessary full table scans, add a `STORING` clause to the index:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INDEX type_available_idx ON movr.vehicles (type, available) STORING (last_location);
~~~

The index will now store the values in `last_location`, which will improve the performance of reads from the `vehicles` table that return `type`, `available`, `id`, and `last_location` values and do not filter or sort on the `last_location` column.

The `max_init.sql` file should now look similar to the following:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE movr.max_schema.users (
    first_name STRING,
    last_name STRING,
    email STRING UNIQUE,
    CONSTRAINT "primary" PRIMARY KEY (first_name, last_name)
  );

CREATE TYPE movr.max_schema.vtype AS ENUM ('bike', 'scooter', 'skateboard');

CREATE TABLE movr.max_schema.vehicles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      type movr.max_schema.vtype,
      creation_time TIMESTAMPTZ DEFAULT now(),
      available BOOL,
      last_location STRING
  );

CREATE INDEX type_available_idx ON movr.max_schema.vehicles (type, available) STORING (last_location);

CREATE TABLE movr.max_schema.rides (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      vehicle_id UUID REFERENCES movr.max_schema.vehicles(id),
      start_address STRING,
      end_address STRING,
      start_time TIMESTAMPTZ DEFAULT now(),
      end_time TIMESTAMPTZ
  );
~~~

If you executed this file when following the [Create a Table]({% link {{ page.version.version }}/schema-design-table.md %}) example, then all of these objects already exist. To clear the database and re-initialize the schemas, first execute the statements in the `dbinit.sql` file as the `root` user:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=root \
-f dbinit.sql
~~~

Then, execute the statements in the `max_init.sql` and `abbey_init.sql` files:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=max \
--database=movr \
-f max_init.sql
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=abbey \
--database=movr \
-f abbey_init.sql
~~~

After the statements have been executed, you can see the new index in the [CockroachDB SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}#sql-shell).

Open the SQL shell to your cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=max \
--database=movr
~~~

To view the indexes in the `vehicles` table, issue a [`SHOW INDEXES`]({% link {{ page.version.version }}/show-index.md %}) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM movr.max_schema.vehicles;
~~~

~~~
  table_name |     index_name     | non_unique | seq_in_index |  column_name  | direction | storing | implicit | visible
-------------+--------------------+------------+--------------+---------------+-----------+---------+----------+----------
  vehicles   | type_available_idx |     t      |            1 | type          | ASC       |    f    |    f     |    t
  vehicles   | type_available_idx |     t      |            2 | available     | ASC       |    f    |    f     |    t
  vehicles   | type_available_idx |     t      |            3 | last_location | N/A       |    t    |    f     |    t
  vehicles   | type_available_idx |     t      |            4 | id            | ASC       |    f    |    t     |    t
  vehicles   | vehicles_pkey      |     f      |            1 | id            | ASC       |    f    |    f     |    t
  vehicles   | vehicles_pkey      |     f      |            2 | type          | N/A       |    t    |    f     |    t
  vehicles   | vehicles_pkey      |     f      |            3 | creation_time | N/A       |    t    |    f     |    t
  vehicles   | vehicles_pkey      |     f      |            4 | available     | N/A       |    t    |    f     |    t
  vehicles   | vehicles_pkey      |     f      |            5 | last_location | N/A       |    t    |    f     |    t
(9 rows)
~~~

The output from this `SHOW` statement displays the names and columns of the two indexes on the table (i.e., `vehicles_pkey` and `type_available_idx`).

The `last_location` column's `storing` value is `true` in the `type_available_idx` index, and is therefore not sorted. The primary key column `id` is implicit in the index, meaning the `id` column is implicitly indexed in `type_available_idx`.

To see an index definition, use a [`SHOW CREATE`]({% link {{ page.version.version }}/show-create.md %}) statement on the table that contains the index:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE movr.max_schema.vehicles;
~~~

~~~
         table_name        |                                create_statement
---------------------------+---------------------------------------------------------------------------------
  movr.max_schema.vehicles | CREATE TABLE max_schema.vehicles (
                           |     id UUID NOT NULL DEFAULT gen_random_uuid(),
                           |     type max_schema.vtype NULL,
                           |     creation_time TIMESTAMPTZ NULL DEFAULT now():::TIMESTAMPTZ,
                           |     available BOOL NULL,
                           |     last_location STRING NULL,
                           |     CONSTRAINT vehicles_pkey PRIMARY KEY (id ASC),
                           |     INDEX type_available_idx (type ASC, available ASC) STORING (last_location)
                           | )
(1 row)
~~~

After creating a database, a user-defined schema, some tables, and secondary indexes, the database schema should be ready for your application to [write]({% link {{ page.version.version }}/insert-data.md %}) and [read data]({% link {{ page.version.version }}/query-data.md %}).

It's likely that you will need to update your database schema at some point. For an overview on how to update a database schema, see [Change and Remove Objects in a Database Schema]({% link {{ page.version.version }}/schema-design-update.md %}). We also recommend reading about [how online schema changes work in CockroachDB]({% link {{ page.version.version }}/online-schema-changes.md %}).

## What's next?

- [Change and Remove Objects in a Database Schema]({% link {{ page.version.version }}/schema-design-update.md %})
- [Online Schema Changes]({% link {{ page.version.version }}/online-schema-changes.md %})
- [Insert Data]({% link {{ page.version.version }}/insert-data.md %})
- [Query Data]({% link {{ page.version.version }}/query-data.md %})

You might also be interested in the following pages:

- [`CREATE INDEX`]({% link {{ page.version.version }}/create-index.md %})
- [Indexes]({% link {{ page.version.version }}/indexes.md %})
- [Index a Subset of Rows with Partial Indexes]({% link {{ page.version.version }}/partial-indexes.md %})
- [Index Sequential Keys with Hash-Sharded Indexes]({% link {{ page.version.version }}/hash-sharded-indexes.md %})
- [Index JSON and Array Data with Generalized Inverted Indexes]({% link {{ page.version.version }}/inverted-indexes.md %})
- [Index Spatial Data]({% link {{ page.version.version }}/spatial-indexes.md %})
- [Cockroach Commands]({% link {{ page.version.version }}/cockroach-commands.md %})
- [Create a User-defined Schema]({% link {{ page.version.version }}/schema-design-schema.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
- [Database Schemas]({% link {{ page.version.version }}/schema-design-schema.md %})
- [Create a Database]({% link {{ page.version.version }}/schema-design-database.md %})
- [Schema Design Overview]({% link {{ page.version.version }}/schema-design-overview.md %})
- [Create a Table]({% link {{ page.version.version }}/schema-design-table.md %})
- [CockroachDB naming hierarchy]({% link {{ page.version.version }}/sql-name-resolution.md %}#naming-hierarchy)
