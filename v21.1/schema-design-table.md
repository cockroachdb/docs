---
title: Create a Table
summary: Define tables for your database schema
toc: true
---

This page provides best-practice guidance on creating tables, with some simple examples based on Cockroach Labs' fictional vehicle-sharing company, [MovR](movr.html).

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `CREATE TABLE` statement, including additional examples, see the [`CREATE TABLE` syntax page](create-table.html).
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
</ul>

## Create a table

Tables are the [logical objects in a cluster](schema-design-overview.html#database-schema-objects) that store data sent from your application's persistence layer. Tables organize records of data in rows and columns.

To create a table, use a [`CREATE TABLE` statement](create-table.html), following the best practices that we have listed in the following sections:

- [Name a table](#name-a-table)
- [Define columns](#define-columns)
- [Select primary key columns](#select-primary-key-columns)
- [Add additional constraints](#add-additional-constraints)
- [Execute `CREATE TABLE` statements](#execute-create-table-statements)

### Name a table

Naming a table is the first step in table creation. `CREATE TABLE` statements generally take the form:

~~~
CREATE TABLE [schema_name].[table_name] (
  [elements]
  );
~~~

Where `schema_name` is the name of the user-defined schema, `table_name` is the name of the table, and `elements` is a comma-separated list of table elements, such as column definitions.

#### Table naming best practices

Here are some best practices to follow when naming tables:

- Use a fully-qualified name (i.e., `CREATE TABLE schema_name.table_name`). If you do not specify the user-defined schema in the table name, CockroachDB will create the table in the preloaded `public` schema.
- Use a table name that reflects the contents of the table. For example, for a table containing information about orders, you could use the name `orders` (as opposed to naming the table something like `table1`).

#### Table naming example

Suppose you want to create a table to store information about users of the [MovR](movr.html) platform.

In a text editor, open the `dbinit.sql` file that you used to create the `movr` user-defined schema in [Create a User-defined Schema](schema-design-schema.html). Under the `CREATE SCHEMA` statement, add an empty `CREATE TABLE` statement for the `users` table.

The file should now look something like this:

{% include copy-clipboard.html %}
~~~
CREATE SCHEMA IF NOT EXISTS cockroachlabs;

CREATE TABLE cockroachlabs.movr.users (
);
~~~

The `IF NOT EXISTS` clause of the `CREATE SCHEMA` statement will allow you to execute subsequent statements in the file, even if a schema exists.

Don't execute the file yet. You need to first [define the columns](#define-columns) of the `users` table.

### Define columns

Column definitions give structure to a table by separating the values in each row into columns of a single data type. Column definitions generally take the following form:

~~~
[column_name] [DATA_TYPE] [column_qualification]
~~~

Where `column_name` is the column name, `DATA_TYPE` is the [data type](data-types.html) of the row values in the column, and `column_qualification` is some column qualification, such as a [constraint](#add-additional-constraints).

#### Column definition best practices

Here are some best practices to follow when defining table columns:

- Review the supported column [data types](data-types.html), and select the appropriate type for the data you plan to store in a column, following the best practices listed on the data type's reference page.
- Use column data types with a fixed size limit, or set a maximum size limit on column data types of variable size (e.g., [`VARBIT(n)`](bit.html#size)). Values exceeding 1MB can lead to [write amplification](https://en.wikipedia.org/wiki/Write_amplification) and cause significant performance degradation.
- Review the [primary key best practices](#select-the-primary-key-columns), decide if you need to define any dedicated primary key columns.
- Review the best practices for [adding additional constraints](#add-additional-constraints), and decide if you need to add any additional constraints to your columns.

#### Column definition examples

In the `dbinit.sql` file, add a few column definitions to the `users` table's `CREATE TABLE` statement, for user names and email addresses:

{% include copy-clipboard.html %}
~~~
CREATE TABLE cockroachlabs.movr.users (
    first_name STRING,
    last_name STRING,
    email STRING
);
~~~

All of the columns shown above use the [`STRING`](string.html) data type, meaning that any value in any of the columns must be of the data type `STRING`.

CockroachDB supports a number of other column data types, including [`DECIMAL`](decimal.html), [`INT`](integer.html), [`TIMESTAMP`](timestamp.html), [`UUID`](uuid.html), and [enumerated data types](#user-defined-types) and [spatial data types](#spatial-data-types). We recommend that you review the [supported types](data-types.html), and create columns with data types that correspond to the types of data that you intend to persist to the cluster from your application.

Let's add another example table to our `movr` schema, with more column data types.

As a vehicle-sharing platform, MovR needs to store data about its vehicles. In `dbinit.sql`, add a `CREATE TABLE` statement for a `vehicles` table, under the `CREATE TABLE` statement for `users`. This table should probably include information about the type of vehicle, when it was created, what its availability is, and where it is located:
:

{% include copy-clipboard.html %}
~~~
CREATE TABLE cockroachlabs.movr.vehicles (
      id UUID,
      type STRING,
      creation_time TIMESTAMPTZ,
      available BOOL,
      last_location STRING
  );
~~~

This table includes a few more data types than the `users` table:

- `UUID`, which we recommend for columns with [values that uniquely identify rows](https://en.wikipedia.org/wiki/Unique_key) (like an "id" column).
- `TIMESTAMPTZ`, which we recommend for [timestamp values](https://en.wikipedia.org/wiki/Timestamp)
- `BOOL`, which we recommend for columns that will only take one of two possible values.

The rest of the columns are `STRING`-typed.

Note that values in the `STRING`-typed `type` column will likely only be values from a fixed list of possible values, as the `type` of a vehicle can only be one of the vehicles supported by the MovR platform (e.g., a `bike`, a `scooter`, or a `skateboard`). For values like this, we recommend using a [user-defined, enumerated type](enum.html).

To create a user-defined type, use a `CREATE TYPE` statement. For example, above the `CREATE TABLE` statement for the `vehicles` table, add the following statements:

{% include copy-clipboard.html %}
~~~
CREATE TYPE vtype AS ENUM ('bike', 'scooter', 'skateboard');
~~~

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `CREATE TYPE` statement, including additional examples, see the [`CREATE TYPE` syntax page](create-tyoe.html).<br>For detailed reference documentation on enumerated data types, including additional examples, see [`ENUM`](enum.html).
{{site.data.alerts.end}}

You can then use `vtype` as the `type` column's data type:

{% include copy-clipboard.html %}
~~~
CREATE TABLE cockroachlabs.movr.vehicles (
      id UUID,
      type vtype,
      creation_time TIMESTAMPTZ,
      available BOOL,
      last_location STRING
  );
~~~

Only values in the set of `vtype` values will be allowed in the `type` column.

The `users` and `vehicles` tables now have syntactically valid column definitions. As a best practice, you should explicitly [select primary key columns](#select-primary-key-columns) for the tables before executing the `CREATE TABLE` statements.

### Select primary key columns

A primary key is a column, or set of columns, whose values uniquely identify rows of data. Every table requires a primary key.

Primary keys are defined in `CREATE TABLE` statements with the `PRIMARY KEY` [column constraint](constraints.html). The `PRIMARY KEY` constraint requires that all the constrained column(s) contain only unique and non-`NULL` values.

When a table is created, CockroachDB creates an index (called the `primary` index) on the column(s) constrained by the `PRIMARY KEY` constraint. CockroachDB uses this [index](indexes.html) to find rows in a table more efficiently.

To add a single column to a primary key, add the `PRIMARY KEY` keyword to the end of the column definition. To add multiple columns to a primary key (i.e., to create a [composite primary key](https://en.wikipedia.org/wiki/Composite_key)), add a separate `CONSTRAINT "primary" PRIMARY KEY` clause after the column definitions in the `CREATE TABLE` statement. For examples, see [below](#primary-key-examples).

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `PRIMARY KEY` constraint, including additional examples, see the [`PRIMARY KEY` constraint page](primary-key.html).
{{site.data.alerts.end}}

#### Primary key best practices

Here are some best practices to follow when selecting primary key columns:

- Understand how the data in the primary key column(s) is [distributed across a cluster](architecture/distribution-layer.html).

    Non-uniform data distributions can lead to hotspots on a single range, or cause [transaction contention](transactions.html#transaction-contention).

- Consider the [data types](data-types.html) of the primary key column(s).

    A primary key column's data type can determine where its row data is stored on a cluster. For example, some data types are sequential in nature (e.g., [`TIMESTAMP`](timestamp.html)). Defining primary keys on columns of sequential data can result in data being concentrated in a smaller number of ranges, which can negatively affect performance.

- Define a primary key for every table.

    If you create a table without defining a primary key, CockroachDB will automatically create a primary key over a hidden, [`INT`](int.html)-typed column named `rowid`. By default, sequential, unique identifiers are generated for each row in the `rowid` column with the [`unique_rowid()` function](functions-and-operators.html#built-in-functions). The sequential nature of the `rowid` values can lead to a poor distribution of the data across a cluster, which can negatively affect performance. Furthermore, because you cannot meaningfully use the `rowid` column to filter table data, the primary key index on `rowid` does not offer any performance optimization. This means you will always have improved performance by defining a primary key for a table.

- Define primary key constraints over multiple columns (i.e., use [composite primary keys](https://en.wikipedia.org/wiki/Composite_key)).

    When defining composite primary keys, make sure the data in the first column of the primary key prefix is well-distributed across the nodes in the cluster. To improve the performance of [ordered queries](query-order.html), you can add monotonically increasing primary key columns after the first column of the primary key prefix. For an example, see [Use multi-column primary keys](performance-best-practices-overview.html#use-multi-column-primary-keys) on the [SQL Performance Best Practices](performance-best-practices-overview.html) page.

- For single-column primary keys, use [`UUID`](uuid.html)-typed columns with [randomly-generated default values](performance-best-practices-overview.html#use-uuid-to-generate-unique-ids), using the `gen_random_uuid()` [SQL function](functions-and-operators.html#id-generation-functions).

    Randomly generating `UUID` values ensures that the primary key values will be unique and well-distributed across a cluster.

- Avoid defining primary keys over a single column of sequential data.

    Querying a table with a primary key on a single sequential column (e.g., an auto-incrementing [`INT`](int.html) column) can result in single-range hotspots that negatively affect performance. Instead, use a composite key with a non-sequential prefix, or use a `UUID`-typed column.

    If you are working with a table that *must* be indexed on sequential keys, use [hash-sharded indexes](hash-sharded-indexes.html). For details about the mechanics and performance improvements of hash-sharded indexes in CockroachDB, see our [Hash Sharded Indexes Unlock Linear Scaling for Sequential Workloads](https://www.cockroachlabs.com/blog/hash-sharded-indexes-unlock-linear-scaling-for-sequential-workloads/) blog post.

#### Primary key examples

To follow a [primary key best practice](#primary-key-best-practices), the `CREATE TABLE` statements in `dbinit.sql` for the `users` and `vehicles` tables need to explicitly define a primary key.

In the `dbinit.sql` file, add a composite primary key on the `first_name` and `last_name` columns of the `users` table:

{% include copy-clipboard.html %}
~~~
CREATE TABLE cockroachlabs.movr.users (
    first_name STRING,
    last_name STRING,
    email STRING,
    CONSTRAINT "primary" PRIMARY KEY (first_name, last_name)
);
~~~

This primary key will uniquely identify rows of user data.

Note that, because `PRIMARY KEY` constraints imply `UNIQUE` indexes, only one unique combination of `first_name` and `last_name` will be allowed in rows of the `users` table. Additionally, because `PRIMARY KEY` implies the `NOT NULL` constraint, all rows of data inserted into the `users` table must include values for `first_name` and `last_name`.

Primary key columns can also be single columns, if those columns are guaranteed to uniquely identify the row. Their values should also be well-distributed across the cluster.

In the `vehicles` table definition, add a `PRIMARY KEY` constraint on the `id` column:

{% include copy-clipboard.html %}
~~~
CREATE TABLE cockroachlabs.movr.vehicles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      type vtype,
      creation_time TIMESTAMPTZ,
      available BOOL,
      last_location STRING
  );
~~~

Note that, in addition to the `PRIMARY KEY` constraint, the `id` column has a `DEFAULT` constraint. This constraint sets a default value for the column to a value generated by the `gen_random_uuid()` [function](functions-and-operators.html), following [`UUID`](uuid.html) best practices. The values generated by this function are guaranteed to be unique and well-distributed across the cluster. We discuss the `DEFAULT` constraint more [below](#populate-with-default-values).

### Add additional constraints

In addition to the `PRIMARY KEY` constraint, CockroachDB supports a number of other [column-level constraints](constraints.html), including [`CHECK`](check.html), [`DEFAULT`](#populate-with-default-values), [`FOREIGN KEY`](#reference-other-tables), [`UNIQUE`](#prevent-duplicates), [`NOT NULL`](#prevent-null-values). Using constraints can simplify table queries, improve query performance, and ensure that data remains semantically valid.

To constrain a column, you can add the constraint's clause to the column's definition, as shown in the [`PRIMARY KEY` example above](#primary-key-examples). To constrain more than one column, add the entire constraint's definition after the list of columns in the `CREATE TABLE` statement, also shown in the [`PRIMARY KEY` example above](#primary-key-examples).

For guidance and examples for each constraint, see the sections below.

{{site.data.alerts.callout_success}}
For detailed reference documentation for each supported constraint, see [the constraint's syntax page](constraints.html).
{{site.data.alerts.end}}

#### Populate with default values

To set default values on columns, use the `DEFAULT` constraint. Default values enable you to write queries without the need to specify values for every column.

When combined with [supported SQL functions](functions-and-operators.html), default values can save resources in your application's persistence layer by offloading computation onto CockroachDB. For example, rather than using an application library to generate unique `UUID` values, you can set a default value to be an automatically-generated `UUID` value with the `gen_random_uuid()` SQL function. Similarly, you could use a default value to populate a `TIMESTAMP` column with the current time of day, using the `now()` function.

For example, in the `vehicles` table definition in `dbinit.sql`, you added a `DEFAULT gen_random_uuid()` clause to the `id` column definition. Now, add a default value to the `creation_time` column:

{% include copy-clipboard.html %}
~~~
CREATE TABLE cockroachlabs.movr.vehicles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      type vtype,
      creation_time TIMESTAMPTZ DEFAULT now(),
      available BOOL,
      last_location STRING
  );
~~~

When a row is inserted into the `vehicles` table, CockroachDB generates a random default value for the vehicle `id`, and uses the current timestamp for the vehicle's `creation_time`. Rows inserted into the `vehicles` table do not need to include a value for `id` or `creation_time`.

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `DEFAULT` constraint, including additional examples, see [the `DEFAULT` syntax page](default-value.html).
{{site.data.alerts.end}}

#### Reference other tables

To reference values in another table, use a `FOREIGN KEY` constraint. `FOREIGN KEY` constraints enforce [referential integrity](https://en.wikipedia.org/wiki/Referential_integrity), which means that a column can only refer to an existing column.

For example, suppose you want to add a new table that contains data about the rides that MovR users are taking on vehicles. This table should probably include information about the location and duration of the ride, as well as information about the vehicle used for the ride.

In `dbinit.sql`, under the `CREATE TABLE` statement for `vehicles`, add a definition for a `rides` table, with a foreign key dependency on the `vehicles` table. To define a foreign key constraint, use the `REFERENCES` keyword:

{% include copy-clipboard.html %}
~~~
CREATE TABLE cockroachlabs.movr.rides (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      vehicle_id UUID REFERENCES cockroachlabs.movr.vehicles(id),
      start_address STRING,
      end_address STRING,
      start_time TIMESTAMPTZ DEFAULT now(),
      end_time TIMESTAMPTZ
  );
~~~

The `vehicle_id` column will be identical to the `id` column in the `vehicles` table. Any queries that insert a `vehicle_id` that does not exist in the `id` column of the `vehicles` table will return an error.

{{site.data.alerts.callout_info}}
Foreign key dependencies can significantly impact query performance, as queries involving tables with foreign keys, or tables referenced by foreign keys, require CockroachDB to check two separate tables. We recommend using them sparingly.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `FOREIGN KEY` constraint, including additional examples, see [the `FOREIGN KEY` syntax page](foreign-key.html).
{{site.data.alerts.end}}

#### Prevent duplicates

To prevent duplicate values in a column, use the `UNIQUE` constraint.

For example, suppose that you want to ensure that the email addresses of all users are different, to prevent users from registering for two accounts with the same email address. Add a `UNIQUE` constraint to the `email` column of the `users` table:

{% include copy-clipboard.html %}
~~~
CREATE TABLE cockroachlabs.movr.users (
    first_name STRING,
    last_name STRING,
    email STRING UNIQUE,
    CONSTRAINT "primary" PRIMARY KEY (first_name, last_name)
);
~~~

Queries that insert `email` values that already exist in the `users` table will return an error.

{{site.data.alerts.callout_info}}
When you add a `UNIQUE` constraint to a column, CockroachDB creates a secondary index on that column, to help speed up checks on a column value's uniqueness.

Also note that the `UNIQUE` constraint is implied by the `PRIMARY KEY` constraint.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `UNIQUE` constraint, including additional examples, see [the `UNIQUE` syntax page](unique.html).
{{site.data.alerts.end}}

#### Prevent `NULL` values

To prevent `NULL` values in a column, use the `NOT NULL` constraint. If you specify a `NOT NULL` constraint, all queries against the table with that constraint must specify a value for that column, or have a default value specified with a `DEFAULT` constraint.

For example, if you require all users of the MovR platform to have an email on file, you can add a `NOT NULL` constraint to the `email` column of the `users` table:

{% include copy-clipboard.html %}
~~~
CREATE TABLE cockroachlabs.movr.users (
    first_name STRING,
    last_name STRING,
    email STRING UNIQUE NOT NULL,
    CONSTRAINT "primary" PRIMARY KEY (first_name, last_name)
);
~~~

{{site.data.alerts.callout_info}}
Note that the `NOT NULL` constraint is implied by the `PRIMARY KEY` constraint.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `NOT NULL` constraint, including additional examples, see [the `NOT NULL` syntax page](not-null.html).
{{site.data.alerts.end}}

### Execute `CREATE TABLE` statements

After you have defined `CREATE TABLE` statements for your tables, you can execute the statements.

#### `CREATE TABLE` execution best practices

Here are some general best practices to follow when executing `CREATE TABLE` statements:

- Do not create tables as the `root` user. Instead, create tables as a [different user](schema-design-overview.html#controlling-access-to-objects), with fewer privileges, following [authorization best practices](authorization.html#authorization-best-practices). This can be the same user that created the user-defined schema to which the tables belong.
- {% include {{page.version.version}}/sql/dev-schema-changes.md %}
- Review the [limitations of online schema changes in CockroachDB](online-schema-changes.html#limitations). In specific, note that CockroachDB has [limited support for schema changes within the same explicit transaction](online-schema-changes#limited-support-for-schema-changes-within-transactions).

  We recommend doing schema changes (including `CREATE TABLE` statements) outside explicit transactions, where possible. When a database schema management tool manages transactions on your behalf, we recommend only including one schema change operation per transaction.

#### Execute the example `CREATE TABLE` statements

After following the examples provided in the sections above, the `dbinit.sql` file should look similar to the following:

{% include copy-clipboard.html %}
~~~
CREATE SCHEMA IF NOT EXISTS movr;

CREATE TABLE cockroachlabs.movr.users (
    first_name STRING,
    last_name STRING,
    email STRING UNIQUE NOT NULL,
    CONSTRAINT "primary" PRIMARY KEY (first_name, last_name)
);

CREATE TYPE vtype AS ENUM ('bike', 'scooter', 'skateboard');

CREATE TABLE cockroachlabs.movr.vehicles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      type vtype,
      creation_time TIMESTAMPTZ DEFAULT now(),
      available BOOL,
      last_location STRING
  );

CREATE TABLE cockroachlabs.movr.rides (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      vehicle_id UUID REFERENCES cockroachlabs.movr.vehicles(id),
      start_address STRING,
      end_address STRING,
      start_time TIMESTAMPTZ DEFAULT now(),
      end_time TIMESTAMPTZ
  );
~~~

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

To view the tables in the `movr` user-defined schema, issue a [`SHOW TABLES`](show-tables.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM movr;
~~~

~~~
  schema_name | table_name | type  | estimated_row_count
--------------+------------+-------+----------------------
  movr        | rides      | table |                   0
  movr        | users      | table |                   0
  movr        | vehicles   | table |                   0
(3 rows)
~~~

To see the individual `CREATE TABLE` statements for each table, use a [`SHOW CREATE`](show-create.html) statement. For example, to see the `vehicles` `CREATE TABLE` statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE movr.vehicles;
~~~

~~~
   table_name   |                           create_statement
----------------+------------------------------------------------------------------------
  movr.vehicles | CREATE TABLE movr.vehicles (
                |     id UUID NOT NULL DEFAULT gen_random_uuid(),
                |     type public.vtype NULL,
                |     creation_time TIMESTAMPTZ NULL DEFAULT now():::TIMESTAMPTZ,
                |     available BOOL NULL,
                |     last_location STRING NULL,
                |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
                |     FAMILY "primary" (id, type, creation_time, available, last_location)
                | )
(1 row)
~~~

Note that these tables only have `primary` indexes. For guidance on adding secondary indexes, see at [Add Secondary Indexes](schema-design-indexes.html).

## See also

- [Create a User-defined Schema](schema-design-schema.html)
- [Add Secondary Indexes](schema-design-indexes.html)
- [CockroachDB naming hierarchy](sql-name-resolution.html#naming-hierarchy)
- [Schema Design Overview](schema-design-overview.html)
- [`CREATE TABLE`](create-table.html)
