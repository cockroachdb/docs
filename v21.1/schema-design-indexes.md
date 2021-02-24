---
title: Add Secondary Indexes
summary: Index columns in your schema
toc: true
---

This page provides best-practice guidance on creating indexes, with a simple example based on Cockroach Labs' fictional vehicle-sharing company, [MovR](movr.html).

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `CREATE INDEX` statement, including additional examples, see the [`CREATE INDEX` syntax page](create-index.html).
{{site.data.alerts.end}}

## Before you begin

Before reading this page, do the following:

- [Install CockroachDB](install-cockroachdb.html).
- [Start a local cluster](secure-a-cluster.html), or [create a CockroachCloud cluster](../cockroachcloud/create-your-cluster.html).
- [Review the database schema objects](schema-design-overview.html).
- [Create a database](schema-design-database.html).
- [Create a user-defined schema](schema-design-schema.html).
- [Create a table](schema-design-table.html).

## Create a secondary index

Indexes are [logical objects in a cluster](schema-design-overview.html#database-schema-objects) that help [CockroachDB queries](query-data.html) find data more efficiently. When you create an index, CockroachDB creates a copy of the columns selected for the index, and then sorts the rows of data by indexed column values, without sorting the values in the table itself.

CockroachDB automatically creates an index on the table's [primary key](primary-key.html) key columns. This index is called the *primary index*. The primary index helps CockroachDB more efficiently scan rows, as sorted by the table's primary key columns, but it does not help find values as identified by any other columns.

*Secondary indexes* (i.e., all indexes that are not the primary index) improve the performance of queries that identify rows with columns that are not in a table's primary key. CockroachDB automatically creates secondary indexes for columns with a [`UNIQUE` constraint](unique.html).

To add a secondary index to a table, do one of the following, following the [best practices listed below](#best-practices):

- Add an `INDEX` clause to the end of a [`CREATE TABLE`](create-table.html#create-a-table-with-secondary-and-inverted-indexes) statement.

    `INDEX` clauses generally take the following form:

    ~~~
    INDEX {index_name} ({column_names});
    ~~~

    Parameter | Description
    ----------|------------
    `{index_name}` | The name of the index.
    `{column_names}` | The name of the column to index, or a comma-separated list of names of the columns to index.

- Use a [`CREATE INDEX`](create-index.html) statement.

    `CREATE INDEX` statements generally take the following form:

    ~~~
    CREATE INDEX {index_name} ON {table_name} ({column_names});
    ~~~

    Parameter | Description
    ----------|------------
    `{index_name}` | The name of the index.
    `{table_name}` | The name of the table.
    `{column_names}` | The name of the column to index, or a comma-separated list of names of the columns to index.

For an example, see [below](#example).

{{site.data.alerts.callout_info}}
If you do not specify a name for an index, CockroachDB will generate a name.

After creation, the notation for referring to indexes in CockroachDB is `{table_name}@{index_name}`.
{{site.data.alerts.end}}

### Best practices

Here are some best practices for creating indexes:

- Index all columns that you plan to use for [sorting](order-by.html) or [filtering](select-clause.html#filter-rows) data.

    Note that columns listed in a filtering [`WHERE` clause](select-clause.html#parameters) with the equality operators (`=` or `IN`) should come first in the index, before those referenced with inequality operators (`<`, `>`).

- Avoid indexing on sequential values.

    Writes to indexes with sequential keys can result in range hotspots that negatively affect performance. Instead, use [randomly generated unique IDs](performance-best-practices-overview.html#unique-id-best-practices), or [multi-column keys](performance-best-practices-overview.html#use-multi-column-primary-keys).

    If you are working with a table that *must* be indexed on sequential keys, use [hash-sharded indexes](hash-sharded-indexes.html). For details about the mechanics and performance improvements of hash-sharded indexes in CockroachDB, see our [Hash Sharded Indexes Unlock Linear Scaling for Sequential Workloads](https://www.cockroachlabs.com/blog/hash-sharded-indexes-unlock-linear-scaling-for-sequential-workloads/) blog post.

- Avoid creating secondary indexes that you do not need, and [drop unused indexes](drop-index.html) whenever possible. Secondary indexes can slow down write performance and take up node memory.

    Note that queries can benefit from an index even if they only filter a prefix of its columns. For example, if you create an index of columns `(A, B, C)`, queries filtering `(A)` or `(A, B)` can still use the index. However, queries that do not filter `(A)` will not benefit from the index. This feature also lets you avoid using single-column indexes. Instead, use the column as the first column in a multiple-column index, which is useful to more queries.

    Also note that [`ALTER PRIMARY KEY`](alter-primary-key.html) creates a secondary index from the old primary key. If you need to [change a primary key](constraints.html#change-constraints), and you do not plan to filter queries on the old primary key column(s), do not use `ALTER PRIMARY KEY`. Instead, use [`DROP CONSTRAINT ... PRIMARY KEY`/`ADD CONSTRAINT ... PRIMARY KEY`](add-constraint.html#changing-primary-keys-with-add-constraint-primary-key), which does not create a secondary index.

- Use a [`STORING` clause](create-index.html#parameters) to store columns of data that you want returned by common queries, but that you do not plan to use in query filters.

    The `STORING` clause specifies columns that are not part of the index key but should be stored in the index, without being sorted. If a column is specified in a query, and the column is neither indexed nor stored in an index, CockroachDB will perform a full scan of the table, which can result in poor performance. For an example, see [below](#example).

- Review the [specialized indexes that CockroachDB supports](schema-design-overview.html#specialized-indexes), and decide if you need to create a specialized index instead of a standard index.

- Do not create indexes as the `root` user. Instead, create indexes as a [different user](schema-design-overview.html#controlling-access-to-objects), with fewer privileges, following [authorization best practices](authorization.html#authorization-best-practices). This will likely be the same user that created the table to which the index belongs.

- {% include {{page.version.version}}/sql/dev-schema-changes.md %}

- {% include {{page.version.version}}/sql/dev-schema-change-limits.md %}

### Example

Suppose you want the MovR application to display all of the bikes available to the users of the MovR platform.

Recall that the `vehicles` table that you created in [Create a Table](schema-design-table.html) stores rows of data for each vehicle registered with MovR. Your application will need to read any data about vehicles into the application's persistence layer from this table. To display available bikes, the reads will need to filter on the `available` and `type` columns.

Open `max_init.sql`, and, under the `CREATE TABLE` statement for the `vehicles` table, add a `CREATE INDEX` statement for an index on the `type` and `available` columns of the `vehicles` table:

{% include copy-clipboard.html %}
~~~ sql
CREATE INDEX type_available_idx ON movr.vehicles (type, available));
~~~

This statement creates a secondary index named `type_available_idx`, on the `vehicles` table.

The MovR app might also need to display the vehicle's location and ID, but the app won't be filtering or sorting on those values. If any of the columns referenced in or returned by a query are not in a primary or secondary index key, CockroachDB will need to perform [a full scan of the table](sql-tuning-with-explain.html#issue-full-table-scans) to find the value. Full table scans can be costly, and should be avoided whenever possible.

To help avoid unnecessary full table scans, add a `STORING` clause to the index:

{% include copy-clipboard.html %}
~~~ sql
CREATE INDEX type_available_idx ON movr.vehicles (type, available) STORING (last_location);
~~~

The index will now store the values in `last_location`, which will improve the performance of reads from the `vehicles` table that return `type`, `available`, `id`, and `last_location` values and don't filter or sort on the `last_location` column.

The `max_init.sql` file should now look similar to the following:

{% include copy-clipboard.html %}
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

If you executed this file when following the [Create a Table](schema-design-table.html) example, then all of these objects already exist. To clear the database and re-initialize the schemas, first execute the statements in the `dbinit.sql` file as the `root` user:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=root \
< dbinit.sql
~~~

Then, execute the statements in the `max_init.sql` and `abbey_init.sql` files:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=max \
--database=movr
< max_init.sql
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=abbey \
--database=movr
< abbey_init.sql
~~~

After the statements have been executed, you can see the new index in the [CockroachDB SQL shell](cockroach-sql.html#sql-shell).

Open the SQL shell to your cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=max \
--database=movr
~~~

To view the indexes in the `vehicles` table, issue a [`SHOW INDEXES`](show-index.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM movr.max_schema.vehicles;
~~~

~~~
  table_name |     index_name     | non_unique | seq_in_index |  column_name  | direction | storing | implicit
-------------+--------------------+------------+--------------+---------------+-----------+---------+-----------
  vehicles   | primary            |   false    |            1 | id            | ASC       |  false  |  false
  vehicles   | type_available_idx |    true    |            1 | type          | ASC       |  false  |  false
  vehicles   | type_available_idx |    true    |            2 | available     | ASC       |  false  |  false
  vehicles   | type_available_idx |    true    |            3 | last_location | N/A       |  true   |  false
  vehicles   | type_available_idx |    true    |            4 | id            | ASC       |  false  |   true
(5 rows)
~~~

The output from this `SHOW` statement displays the names and columns of the two indexes on the table (i.e., `primary` and `type_available_idx`).

Note that the `last_location` column's `storing` value is `true` in the `type_available_idx` index, and is therefore not sorted. Also note that the primary key column `id` is implicit in the index, meaning the `id` column is implicitly indexed in `type_available_idx`.

To see an index definition, use a [`SHOW CREATE`](show-create.html) statement on the table that contains the index:

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE movr.max_schema.vehicles;
~~~

~~~
         table_name        |                                create_statement
---------------------------+----------------------------------------------------------------------------------
  movr.max_schema.vehicles | CREATE TABLE max_schema.vehicles (
                           |     id UUID NOT NULL DEFAULT gen_random_uuid(),
                           |     type max_schema.vtype NULL,
                           |     creation_time TIMESTAMPTZ NULL DEFAULT now():::TIMESTAMPTZ,
                           |     available BOOL NULL,
                           |     last_location STRING NULL,
                           |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
                           |     INDEX type_available_idx (available ASC, type ASC) STORING (last_location),
                           |     FAMILY "primary" (id, type, creation_time, available, last_location)
                           | )
(1 row)
~~~

After creating a database, a user-defined schema, some tables, and secondary indexes, the database schema should be ready for your application to [write](insert-data.html) and [read data](query-data.html).

It's likely that you will need to update your database schema at some point. For an overview on how to update a database schema, see [Change and Remove Objects in a Database Schema](schema-design-update.html). We also recommend reading about [how online schema changes work in CockroachDB](online-schema-changes.html).

## What's next?

- [Change and Remove Objects in a Database Schema](schema-design-update.html)
- Read about [how schema changes work](online-schema-changes.html)
- [Insert Data](schema-design-indexes.html)
- [Query Data](online-schema-changes.html)

You might also be interested in the following pages:

- [`CREATE INDEX`](create-index.html)
- [Indexes](indexes.html)
- [Index a Subset of Rows](partial-indexes.html)
- [Index Sequential Keys](hash-sharded-indexes.html)
- [Index JSON and Array Data](inverted-indexes.html)
- [Index Spatial Data](spatial-indexes.html)
- [Cockroach Commands](cockroach-commands.html)
- [Create a User-defined Schema](schema-design-schema.html)
- [Create a Database](schema-design-database.html)
- [Schema Design Overview](schema-design-overview.html)
- [CockroachDB naming hierarchy](sql-name-resolution.html#naming-hierarchy)
