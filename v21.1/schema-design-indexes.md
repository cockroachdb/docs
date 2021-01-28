---
title: Add Secondary Indexes
summary: Index columns in your schema
toc: true
---

This page provides best-practice guidance on creating indexes, with some simple examples based on Cockroach Labs' fictional vehicle-sharing company, [MovR](movr.html).

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `CREATE INDEX` statement, including additional examples, see the [`CREATE INDEX` syntax page](create-index.html).
{{site.data.alerts.end}}

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="local">Local</button>
  <button class="filter-button" data-scope="cockroachcloud">CockroachCloud</button>
</div>

## Before you begin

Before reading this page, do the following:

<ul>
  <li>
    <a href="install-cockroachdb.html">Install CockroachDB.</a>
  </li>
  <li>
    <a class="filter-content" data-scope="local" href="secure-a-cluster.html">Start a local CockroachDB cluster.</a>
    <a class="filter-content" data-scope="cockroachcloud" href="cockroachcloud/create-your-cluster.html">Create a CockroachCloud cluster.</a>
  </li>
  <li>
    <a href="schema-design-overview.html">Review the database schema objects.</a>
  </li>
  <li>
    <a href="schema-design-database.html">Create a database.</a>
  </li>
  <li>
    <a href="schema-design-schema.html">Create a user-defined schema.</a>
  </li>
  <li>
    <a href="schema-design-table.html">Create some tables.</a>
  </li>
</ul>

## Create a secondary index

Indexes are [logical objects in a cluster](schema-design-overview.html#database-schema-objects) that help [CockroachDB queries](query-data.html) find data more efficiently.

When you create an index, CockroachDB creates a copy of the columns selected for the index, and then sorts the rows of data by indexed column values, without sorting the values in the table itself.

CockroachDB automatically creates an index on the table's [primary key](primary-key.html) key columns. This index is called the `primary` index. The `primary` index helps CockroachDB more efficiently scan rows, as sorted by the table's primary key columns, but it does not help find values as identified by any other columns.

*Secondary indexes* improve the performance of queries that identify rows with columns that are not in a table's primary key. To add a secondary index to a table, do one of the following, following the [best practices listed below](#best-practices):

- Add an `INDEX` clause to the end of a [`CREATE TABLE`](create-table.html#create-a-table-with-secondary-and-inverted-indexes) statement.
- Use a [`CREATE INDEX`](create-index.html) statement.

{{site.data.alerts.callout_info}}
CockroachDB also automatically creates secondary indexes for columns with the [`UNIQUE` column constraint](unique.html).
{{site.data.alerts.end}}

`CREATE INEX` statements generally take the following form:

~~~
CREATE INDEX [index_name] ON [table_name] ([column_names]);
~~~

Where `[index_name]` is the name of the index, `[table_name]` is the name of the table, and `[column_names]` is the name of the column, or a comma-separated list of names of the columns, to index.

{{site.data.alerts.callout_info}}
If you do not specify a name for the column, CockroachDB will generate a name.
{{site.data.alerts.end}}

### Best practices

{{site.data.alerts.callout_success}}
Review the columns of the tables in your cluster, and take note of the columns on which you plan to sort and filter your queries. If a column, or set of columns, is not in the primary key index, you might need to create an index on it.
{{site.data.alerts.end}}

Here are some best practices for creating indexes:

- Index all columns on which you plan to [sort](query-order.html#index-order) or [filter](select-clause.html#filter-rows) queries.

    Note that columns listed in a filtering [`WHERE` clause](select-clause.html#parameters) with the equality operators (`=` or `IN`) should come first in the index, before those referenced with inequality operators (`<`, `>`).

- Avoid indexing on sequential values.

    Writes to indexes with sequential keys can result in range hotspots that negatively affect performance. Instead, use [randomly generated unique IDs](performance-best-practices-overview.html#unique-id-best-practices), or [multi-column keys](performance-best-practices-overview.html#use-multi-column-primary-keys).

    If you are working with a table that *must* be indexed on sequential keys, use [hash-sharded indexes](hash-sharded-indexes.html). For details about the mechanics and performance improvements of hash-sharded indexes in CockroachDB, see our [Hash Sharded Indexes Unlock Linear Scaling for Sequential Workloads](https://www.cockroachlabs.com/blog/hash-sharded-indexes-unlock-linear-scaling-for-sequential-workloads/) blog post.

- Avoid creating secondary indexes that you do not need, and [drop unused indexes](drop-index.html) whenever possible.

    Secondary indexes can slow down write performance and take up node memory.

    Note that queries can benefit from an index even if they only filter a prefix of its columns. For example, if you create an index of columns `(A, B, C)`, queries filtering `(A)` or `(A, B)` can still use the index. However, queries that do not filter `(A)` will not benefit from the index. This feature also lets you avoid using single-column indexes. Instead, use the column as the first column in a multiple-column index, which is useful to more queries.

    Also note that [`ALTER PRIMARY KEY`](alter-primary-key.html) creates a secondary index from the old primary key. If you need to [change a primary key](constraints.html#change-constraints), and you do not plan to filter queries on the old primary key column(s), do not use `ALTER PRIMARY KEY`. Instead, use [`DROP CONSTRAINT ... PRIMARY KEY`/`ADD CONSTRAINT ... PRIMARY KEY`](add-constraint.html#changing-primary-keys-with-add-constraint-primary-key), which does not create a secondary index.

- Use a [`STORING` clause](create-index.html#parameters) to store columns in common queries that you do not plan to use in query filters.

    The `STORING` clause specifies columns that are not part of the index key but should be stored in the index, without being sorted. If a column is specified in a query, and the column is neither indexed nor stored in an index, CockroachDB will perform a full scan of the table, which can have a significant impact on performance.

- Review the [specialized indexes that CockroachDB supports](schema-design-overview.html#specialized-indexes), and decide if you need to create a specialized index instead of a standard index.

- Do not create indexes as the `root` user. Instead, create indexes as a [different user](schema-design-overview.html#controlling-access-to-objects), with fewer privileges, following [authorization best practices](authorization.html#authorization-best-practices). This can be the same user that created the table.

- {% include {{page.version.version}}/sql/dev-schema-changes.md %}

- Review the [limitations of online schema changes in CockroachDB](online-schema-changes.html#limitations). In specific, note that CockroachDB has [limited support for schema changes within the same explicit transaction](online-schema-changes#limited-support-for-schema-changes-within-transactions).

### Examples

Suppose you want the MovR application to display all of the bikes available to the users of the MovR platform.

Recall that the `vehicles` table that you created in [Create a Table](create-a-table.html) stores rows of data for each vehicle registered with MovR. Your application will need to read any data about vehicles into the application's persistence layer from this table.

The values in the `available` and `type` columns are of interest, in this case.

Under the `CREATE TABLE` statement for the `vehicles` table, add a `CREATE INDEX` statement for an index on the `available` and `type` columns of the `vehicles` table:

{% include copy-clipboard.html %}
~~~
CREATE INDEX available_type_idx ON movr.vehicles (available, type));
~~~

This statement creates a secondary index named `available_type_idx`, on the `vehicles` table.

You might also need the vehicle's location and ID, but you won't be filtering or sorting on those values. If any of the returned columns are not in the secondary index, CockroachDB will need to perform a full scan of the table to find the value.

To improve the performance of queries against the `vehicles` table that return `available`, `type`, `id`, and `last_location` values, but don't filter or sort on the `last_location` columns, add a `STORING` clause to the index:

{% include copy-clipboard.html %}
~~~
CREATE INDEX available_type_idx ON movr.vehicles (available, type) STORING (last_location);
~~~

The `dbinit.sql` file should look similar to the following:

{% include copy-clipboard.html %}
~~~
CREATE SCHEMA IF NOT EXISTS movr;

CREATE TABLE IF NOT EXISTS cockroachlabs.movr.users (
    first_name STRING,
    last_name STRING,
    email STRING UNIQUE NOT NULL,
    CONSTRAINT "primary" PRIMARY KEY (first_name, last_name)
);

DROP TYPE cockroachlabs.movr.vtype;
CREATE TYPE cockroachlabs.movr.vtype AS ENUM ('bike', 'scooter', 'skateboard');

CREATE TABLE IF NOT EXISTS cockroachlabs.movr.vehicles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      type vtype,
      creation_time TIMESTAMPTZ DEFAULT now(),
      available BOOL,
      last_location STRING
  );

CREATE INDEX available_type_idx ON cockroachlabs.movr.vehicles (available, type) STORING (last_location);

CREATE TABLE IF NOT EXISTS cockroachlabs.movr.rides (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      vehicle_id UUID REFERENCES cockroachlabs.movr.vehicles(id),
      start_address STRING,
      end_address STRING,
      start_time TIMESTAMPTZ DEFAULT now(),
      end_time TIMESTAMPTZ
  );
~~~

The `IF NOT EXISTS` clauses allow you to run the file without dropping any existing user-defined schemas or tables of the same name in the current database. The `CREATE TYPE` statement does not support the `IF NOT EXISTS` clause. Add a [`DROP TYPE IF EXISTS`](drop-type.html) statement just before the `CREATE TYPE` statement for `vtype`.

To execute the statements in the `dbinit.sql` file, run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir=[certs-directory] \
--user=maxroach \
--database=cockroachlabs
< dbinit.sql
~~~

The SQL client will execute any statements in `dbinit.sql`, with `cockroachlabs` as the database and `maxroach` as the user.

After the statements have been executed, you can see the tables in the [CockroachDB SQL shell](cockroach-sql.html#sql-shell).

Open the SQL shell to your cluster, with `cockroachlabs` as the database:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir=[certs-directory] \
--user=maxroach \
--database=cockroachlabs
~~~

To view the indexes in the `vehicles` table, issue a [`SHOW INDEXES`](show-indexes.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW INDEXES FROM cockroachlabs.movr.vehicles;
~~~

~~~
  table_name |     index_name     | non_unique | seq_in_index |  column_name  | direction | storing | implicit
-------------+--------------------+------------+--------------+---------------+-----------+---------+-----------
  vehicles   | primary            |   false    |            1 | id            | ASC       |  false  |  false
  vehicles   | available_type_idx |    true    |            1 | available     | ASC       |  false  |  false
  vehicles   | available_type_idx |    true    |            2 | type          | ASC       |  false  |  false
  vehicles   | available_type_idx |    true    |            3 | last_location | N/A       |  true   |  false
  vehicles   | available_type_idx |    true    |            4 | id            | ASC       |  false  |   true
(5 rows)
~~~

The output from this `SHOW` statement displays the names and columns of the two indexes on the table (`primary` and `available_type_idx`). Note that the `last_location` column is stored (its `storing` value is `true`) in the `available_type_idx` index, and therefore not sorted (its `direction` value is `N/A`). Also note that the primary key column `id` is implicit in the index.

To see an index definition, use a [`SHOW CREATE`](show-create.html) statement on the table that contains the index:

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE cockroachlabs.movr.vehicles;
~~~

~~~
          table_name          |                                create_statement
------------------------------+----------------------------------------------------------------------------------
  cockroachlabs.movr.vehicles | CREATE TABLE movr.vehicles (
                              |     id UUID NOT NULL DEFAULT gen_random_uuid(),
                              |     type public.vtype NULL,
                              |     creation_time TIMESTAMPTZ NULL DEFAULT now():::TIMESTAMPTZ,
                              |     available BOOL NULL,
                              |     last_location STRING NULL,
                              |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
                              |     INDEX available_type_idx (available ASC, type ASC) STORING (last_location),
                              |     FAMILY "primary" (id, type, creation_time, available, last_location)
                              | )
~~~

## See also

- [`CREATE INDEX`](create-index.html)
- [Indexes](indexes.html)
- [Schema Design Overview](schema-design-overview.html)
- [Create a Database](schema-design-database.html)
- [Create a User-defined Schema](schema-design-schema.html)
- [Create a Table](schema-design-table.html)
- [CockroachDB naming hierarchy](sql-name-resolution.html#naming-hierarchy)
