---
title: Create a Table
summary: Best practices for working with tables in CockroachDB.
toc: true
docs_area: develop
---

This page provides best-practice guidance on creating tables, with some simple examples based on Cockroach Labs' fictional vehicle-sharing company, [MovR](movr.html).

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `CREATE TABLE` statement, including additional examples, see the [`CREATE TABLE` syntax page](create-table.html).
{{site.data.alerts.end}}

## Before you begin

Before reading this page, do the following:

- [Create a {{ site.data.products.serverless }} cluster](../cockroachcloud/quickstart.html) or [start a local cluster](../cockroachcloud/quickstart.html?filters=local).
- [Review the database schema objects](schema-design-overview.html).
- [Create a database](schema-design-database.html).
- [Create a user-defined schema](schema-design-schema.html).

## Create a table

Tables are the [logical objects in a cluster](schema-design-overview.html#database-schema-objects) that store data sent from your application's persistence layer. Tables organize records of data in rows and columns.

To create a table, use a [`CREATE TABLE` statement](create-table.html), following the best practices that we have listed in the following sections:

- [Name a table](#name-a-table)
- [Define columns](#define-columns)
- [Select primary key columns](#select-primary-key-columns)
- [Add additional constraints](#add-additional-constraints)
- [Execute `CREATE TABLE` statements](#execute-create-table-statements)

After reviewing the best practices in each section, see the example provided in that section.

### Name a table

Naming a table is the first step in table creation.

`CREATE TABLE` statements generally take the form:

~~~
CREATE TABLE {schema_name}.{table_name} (
  {elements}
  );
~~~

Parameter | Description
----------|------------
`{schema_name}` | The name of the user-defined schema.
`{table_name}` | The name of the table.
`{elements}` | A comma-separated list of table elements, such as column definitions.

For an example, see [below](#table-naming-example).

#### Table naming best practices

Here are some best practices to follow when naming tables:

- Use a [fully-qualified name](sql-name-resolution.html#how-name-resolution-works) (i.e., `CREATE TABLE database_name.schema_name.table_name`). If you do not specify the database name, CockroachDB will use the SQL session's [current database](sql-name-resolution.html#current-database) (`defaultdb`, by default). If you do not specify the user-defined schema in the table name, CockroachDB will create the table in the preloaded `public` schema.

- Use a table name that reflects the contents of the table. For example, for a table containing information about orders, you could use the name `orders` (as opposed to naming the table something like `table1`).

#### Table naming example

Suppose you want to create a table to store information about users of the [MovR](movr.html) platform, and you want the SQL user `max` to manage that table.

Create an empty `.sql` file for `max`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ touch max_init.sql
~~~

This file will initialize the objects in the `max_schema` user-defined schema that you created in [Create a Schema](schema-design-schema.html), starting with a `users` table.

In a text editor, open `max_init.sql`, and add an empty `CREATE TABLE` statement for the `users` table:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE movr.max_schema.users (
);
~~~

Next, [define the table's columns](#define-columns).

### Define columns

Column definitions give structure to a table by separating the values in each row into columns of a single data type.

Column definitions generally take the following form:

~~~
{column_name} {DATA_TYPE} {column_qualification}
~~~

Parameter | Description
----------|------------
`{column_name}` | The name of the column.
`{DATA_TYPE}` | The [data type](data-types.html) of the row values in the column.
`{column_qualification}` | Some column qualification, such as a [column-level constraint](#add-additional-constraints), or a [computed column clause](computed-columns.html).

For examples, see [below](#column-definition-examples).

#### Column definition best practices

Here are some best practices to follow when defining table columns:

- Review the supported column [data types](data-types.html), and select the appropriate type for the data you plan to store in a column, following the best practices listed on the data type's reference page.

- Use column data types with a fixed size limit, or set a maximum size limit on column data types of variable size (e.g., [`VARBIT(n)`](bit.html#size)). Values exceeding 1MB can lead to [write amplification](architecture/storage-layer.html#write-amplification) and cause significant performance degradation.

- Review the [primary key best practices](#select-primary-key-columns) and [examples](#primary-key-examples), decide if you need to define any dedicated primary key columns.

- Review the best practices and examples for [adding additional constraints](#add-additional-constraints), and decide if you need to add any additional constraints to your columns.

#### Column definition examples

In the `max_init.sql` file, add a few column definitions to the `users` table's `CREATE TABLE` statement, for user names and email addresses:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE movr.max_schema.users (
    first_name STRING,
    last_name STRING,
    email STRING
);
~~~

All of the columns shown above use the [`STRING`](string.html) data type, meaning that any value in any of the columns must be of the data type `STRING`.

CockroachDB supports a number of other column data types, including [`DECIMAL`](decimal.html), [`INT`](int.html), [`TIMESTAMP`](timestamp.html), [`UUID`](uuid.html), and [enumerated data types](enum.html) and [spatial data types](spatial-data.html). We recommend that you review the [supported types](data-types.html), and create columns with data types that correspond to the types of data that you intend to persist to the cluster from your application.

Let's add another example table to our `max_schema` schema, with more column data types.

As a vehicle-sharing platform, MovR needs to store data about its vehicles. In `max_init.sql`, add a `CREATE TABLE` statement for a `vehicles` table, under the `CREATE TABLE` statement for `users`. This table should probably include information about the type of vehicle, when it was created, what its availability is, and where it is located:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE movr.max_schema.vehicles (
      id UUID,
      type STRING,
      creation_time TIMESTAMPTZ,
      available BOOL,
      last_location STRING
  );
~~~

This table includes a few more data types than the `users` table:

- [`UUID`](uuid.html), which we recommend for columns with [values that uniquely identify rows](https://en.wikipedia.org/wiki/Unique_key) (like an "id" column).
- [`TIMESTAMPTZ`](timestamp.html), which we recommend for [timestamp values](https://en.wikipedia.org/wiki/Timestamp).
- [`BOOL`](bool.html), which we recommend for columns that will only take one of two possible values.

The rest of the columns are `STRING`-typed.

Note that values in the `type` column will likely only be `STRING` values from a fixed list of values. Specifically, the vehicle type can only be one of the vehicle types supported by the MovR platform (e.g., a `bike`, a `scooter`, or a `skateboard`). For values like this, we recommend using a [user-defined, enumerated type](enum.html).

To create a user-defined type, use a `CREATE TYPE` statement. For example, above the `CREATE TABLE` statement for the `vehicles` table, add the following statements:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TYPE movr.max_schema.vtype AS ENUM ('bike', 'scooter', 'skateboard');
~~~

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `CREATE TYPE` statement, including additional examples, see the [`CREATE TYPE` syntax page](create-type.html).<br>For detailed reference documentation on enumerated data types, including additional examples, see [`ENUM`](enum.html).
{{site.data.alerts.end}}

You can then use `movr.max_schema.vtype` as the `type` column's data type:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE movr.max_schema.vehicles (
      id UUID,
      type movr.max_schema.vtype,
      creation_time TIMESTAMPTZ,
      available BOOL,
      last_location STRING
  );
~~~

Only values in the set of `movr.max_schema.vtype` values will be allowed in the `type` column.

The `users` and `vehicles` tables now have syntactically valid column definitions. As a best practice, you should explicitly [select primary key columns](#select-primary-key-columns) and add any [additional constraints](#add-additional-constraints) before executing the `CREATE TABLE` statements.

### Select primary key columns

A primary key is a column, or set of columns, whose values uniquely identify rows of data. Every table requires a primary key.

Primary keys are defined in `CREATE TABLE` statements with the `PRIMARY KEY` [column constraint](constraints.html). The `PRIMARY KEY` constraint requires that all the constrained column(s) contain only unique and non-`NULL` values.

When a table is created, CockroachDB creates an index (called the _primary index_ and named `{tbl}_pkey`) on the column(s) constrained by the `PRIMARY KEY` constraint. CockroachDB uses this [index](indexes.html) to find rows in a table more efficiently.

To add a single column to a primary key, add the `PRIMARY KEY` keyword to the end of the column definition. To add multiple columns to a primary key (i.e., to create a [composite primary key](https://en.wikipedia.org/wiki/Composite_key)), add a separate `CONSTRAINT "primary" PRIMARY KEY` clause after the column definitions in the `CREATE TABLE` statement.

For examples, see [below](#primary-key-examples).

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `PRIMARY KEY` constraint, including additional examples, see the [`PRIMARY KEY` constraint page](primary-key.html).
{{site.data.alerts.end}}

#### Primary key best practices

Here are some best practices to follow when selecting primary key columns:

- Avoid defining primary keys over a single column of sequential data.

    Querying a table with a primary key on a single sequential column (e.g., an auto-incrementing [`INT`](int.html) column, or a [`TIMESTAMP`](timestamp.html) value) can result in single-range hot spots that negatively affect performance, or cause [transaction contention](transactions.html#transaction-contention).

    If you are working with a table that *must* be indexed on sequential keys, use [hash-sharded indexes](hash-sharded-indexes.html). For details about the mechanics and performance improvements of hash-sharded indexes in CockroachDB, see our [Hash Sharded Indexes Unlock Linear Scaling for Sequential Workloads](https://www.cockroachlabs.com/blog/hash-sharded-indexes-unlock-linear-scaling-for-sequential-workloads/) blog post.

- Define a primary key for every table.

    If you create a table without defining a primary key, CockroachDB will automatically create a primary key over a hidden, [`INT`](int.html)-typed column named `rowid`. By default, sequential, unique identifiers are generated for each row in the `rowid` column with the [`unique_rowid()` function](functions-and-operators.html#built-in-functions). The sequential nature of the `rowid` values can lead to a poor distribution of the data across a cluster, which can negatively affect performance. Furthermore, because you cannot meaningfully use the `rowid` column to filter table data, the primary key index on `rowid` does not offer any performance optimization. This means you will always have improved performance by defining a primary key for a table.

     To require an explicitly defined primary key for all tables created in your cluster, set the `sql.defaults.require_explicit_primary_keys.enabled` [cluster setting](cluster-settings.html) to `true`.

- When possible, define primary key constraints over multiple columns (i.e., use [composite primary keys](https://en.wikipedia.org/wiki/Composite_key)).

    When defining composite primary keys, make sure the data in the first column of the primary key prefix is well-distributed across the nodes in the cluster. To improve the performance of [ordered queries](order-by.html), you can add monotonically increasing primary key columns after the first column of the primary key prefix. For an example, see [below](#primary-key-examples).

- For single-column primary keys, use [`UUID`](uuid.html)-typed columns with default values randomly-generated, using the `gen_random_uuid()` [SQL function](functions-and-operators.html#id-generation-functions).

    Randomly generating `UUID` values ensures that the primary key values will be unique and well-distributed across a cluster. For an example, see [below](#primary-key-examples).

#### Primary key examples

To follow a [primary key best practice](#primary-key-best-practices), the `CREATE TABLE` statements in `max_init.sql` for the `users` and `vehicles` tables need to explicitly define a primary key.

In the `max_init.sql` file, add a composite primary key on the `first_name` and `last_name` columns of the `users` table:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE movr.max_schema.users (
    first_name STRING,
    last_name STRING,
    email STRING,
    CONSTRAINT "primary" PRIMARY KEY (first_name, last_name)
);
~~~

This primary key will uniquely identify rows of user data.

Because `PRIMARY KEY` constraints imply `UNIQUE` indexes, only one unique combination of `first_name` and `last_name` will be allowed in rows of the `users` table. Additionally, because `PRIMARY KEY` implies the `NOT NULL` constraint, all rows of data inserted into the `users` table must include values for `first_name` and `last_name`.

Primary key columns can also be single columns, if those columns are guaranteed to uniquely identify the row. Their values should also be well-distributed across the cluster.

In the `vehicles` table definition, add a `PRIMARY KEY` constraint on the `id` column:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE movr.max_schema.vehicles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      type movr.max_schema.vtype,
      creation_time TIMESTAMPTZ,
      available BOOL,
      last_location STRING
  );
~~~

Note that, in addition to the `PRIMARY KEY` constraint, the `id` column has a `DEFAULT` constraint. This constraint sets a default value for the column to a value generated by the `gen_random_uuid()` [function](functions-and-operators.html), following [`UUID`](uuid.html) best practices. The values generated by this function are guaranteed to be unique and well-distributed across the cluster. We discuss the `DEFAULT` constraint more [below](#populate-with-default-values).

### Add additional constraints

In addition to the `PRIMARY KEY` constraint, CockroachDB supports a number of other [column-level constraints](constraints.html), including [`CHECK`](check.html), [`DEFAULT`](#populate-with-default-values), [`FOREIGN KEY`](#reference-other-tables), [`UNIQUE`](#prevent-duplicates), and [`NOT NULL`](#prevent-null-values). Using constraints can simplify table queries, improve query performance, and ensure that data remains semantically valid.

To constrain a single column, add a constraint keyword to the column's definition, as shown in the [single-column `PRIMARY KEY` example above](#primary-key-examples). To constrain more than one column, add the entire constraint's definition after the list of columns in the `CREATE TABLE` statement, also shown in the [composite `PRIMARY KEY` example above](#primary-key-examples).

For guidance and examples for each constraint, see the sections below.

{{site.data.alerts.callout_success}}
For detailed reference documentation for each supported constraint, see [the constraint's syntax page](constraints.html).
{{site.data.alerts.end}}

#### Populate with default values

To set default values on columns, use the `DEFAULT` constraint. Default values enable you to write queries without the need to specify values for every column.

When combined with [supported SQL functions](functions-and-operators.html), default values can save resources in your application's persistence layer by offloading computation onto CockroachDB. For example, rather than using an application library to generate unique `UUID` values, you can set a default value to be an automatically-generated `UUID` value with the `gen_random_uuid()` SQL function. Similarly, you could use a default value to populate a `TIMESTAMP` column with the current time of day, using the `now()` function.

For example, in the `vehicles` table definition in `max_init.sql`, you added a `DEFAULT gen_random_uuid()` clause to the `id` column definition. This set the default value to a generated `UUID` value. Now, add a default value to the `creation_time` column:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE movr.max_schema.vehicles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      type movr.max_schema.vtype,
      creation_time TIMESTAMPTZ DEFAULT now(),
      available BOOL,
      last_location STRING
  );
~~~

When a row is inserted into the `vehicles` table, CockroachDB generates a random default value for the vehicle `id`, and uses the current timestamp for the vehicle's `creation_time`. Rows inserted into the `vehicles` table do not need to include an explicit value for `id` or `creation_time`.

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `DEFAULT` constraint, including additional examples, see [the `DEFAULT` syntax page](default-value.html).
{{site.data.alerts.end}}

#### Reference other tables

To reference values in another table, use a `FOREIGN KEY` constraint. `FOREIGN KEY` constraints enforce [referential integrity](https://en.wikipedia.org/wiki/Referential_integrity), which means that a column can only refer to an existing column.

For example, suppose you want to add a new table that contains data about the rides that MovR users are taking on vehicles. This table should probably include information about the location and duration of the ride, as well as information about the vehicle used for the ride.

In `max_init.sql`, under the `CREATE TABLE` statement for `vehicles`, add a definition for a `rides` table, with a foreign key dependency on the `vehicles` table. To define a foreign key constraint, use the `REFERENCES` keyword:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE movr.max_schema.rides (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      vehicle_id UUID REFERENCES movr.max_schema.vehicles(id),
      start_address STRING,
      end_address STRING,
      start_time TIMESTAMPTZ DEFAULT now(),
      end_time TIMESTAMPTZ
  );
~~~

The `vehicle_id` column will be identical to the `id` column in the `vehicles` table. Any queries that insert a `vehicle_id` that does not exist in the `id` column of the `vehicles` table will return an error.

Foreign keys cannot reference tables in a different database. They can, however reference tables in a different schema.

Suppose that you want to introduce promotional codes for users on the MovR platform, but you want the user promo code data to be managed by the `abbey` user that you created in [Create a Database](schema-design-database.html).

Create an empty `.sql` initialization file for `abbey`.

{% include_cached copy-clipboard.html %}
~~~ shell
$ touch abbey_init.sql
~~~

This file will initialize the objects in the `abbey_schema` user-defined schema that you created in [Create a Schema](schema-design-schema.html).

In a text editor, open `abbey_init.sql`, and add a `CREATE TABLE` statement for a table called `user_promo_codes`:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE movr.abbey_schema.user_promo_codes (
    code STRING,
    user_email STRING REFERENCES movr.max_schema.users(email),
    valid BOOL,
    CONSTRAINT "primary" PRIMARY KEY (code, user_email)
  );
~~~

This new table references the `email` column of the `users` table in `max_schema`. Because the `user_promo_codes` table depends on the `users` table, you'll need to execute `max_init.sql` before `abbey_init.sql`.

{{site.data.alerts.callout_info}}
Foreign key dependencies can significantly impact query performance, as queries involving tables with foreign keys, or tables referenced by foreign keys, require CockroachDB to check two separate tables. We recommend using them sparingly.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `FOREIGN KEY` constraint, including additional examples, see [the `FOREIGN KEY` syntax page](foreign-key.html).
{{site.data.alerts.end}}

#### Prevent duplicates

To prevent duplicate values in a column, use the `UNIQUE` constraint.

For example, suppose that you want to ensure that the email addresses of all users are different, to prevent users from registering for two accounts with the same email address. Add a `UNIQUE` constraint to the `email` column of the `users` table:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE movr.max_schema.users (
    first_name STRING,
    last_name STRING,
    email STRING UNIQUE,
    CONSTRAINT "primary" PRIMARY KEY (first_name, last_name)
);
~~~

Attempting to insert `email` values that already exist in the `users` table will return an error.

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

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE movr.max_schema.users (
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

- Do not create tables as the `root` user. Instead, create tables as a [different user](schema-design-overview.html#control-access-to-objects), with fewer privileges, following [authorization best practices](security-reference/authorization.html#authorization-best-practices). The user that creates an object becomes that [object's owner](security-reference/authorization.html#object-ownership).

- {% include {{page.version.version}}/sql/dev-schema-changes.md %}

- {% include {{page.version.version}}/sql/dev-schema-change-limits.md %}

#### Execute the example `CREATE TABLE` statements

After following the examples provided in the sections above, the `max_init.sql` file should look similar to the following:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE movr.max_schema.users (
    first_name STRING,
    last_name STRING,
    email STRING UNIQUE NOT NULL,
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

CREATE TABLE movr.max_schema.rides (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      vehicle_id UUID REFERENCES movr.max_schema.vehicles(id),
      start_address STRING,
      end_address STRING,
      start_time TIMESTAMPTZ DEFAULT now(),
      end_time TIMESTAMPTZ
  );
~~~

To execute the statements in the `max_init.sql` file, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=max \
--database=movr \
-f max_init.sql
~~~

The SQL client will execute any statements in `max_init.sql`, with `movr` as the database and `max` as the user. `max` is now the owner of all objects created by the statements in the `max_init.sql` file.

After the statements have been executed, you can see the tables in the [CockroachDB SQL shell](cockroach-sql.html#sql-shell).

Open the SQL shell to your cluster, with `movr` as the database and `max` as the user:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=max \
--database=movr
~~~

To view the tables in the `max_schema` user-defined schema, issue a [`SHOW TABLES`](show-tables.html) statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM max_schema;
~~~

~~~
  schema_name | table_name | type  | owner | estimated_row_count
--------------+------------+-------+-------+----------------------
  max_schema  | rides      | table | max   |                   0
  max_schema  | users      | table | max   |                   0
  max_schema  | vehicles   | table | max   |                   0
(3 rows)
~~~

To see the individual `CREATE TABLE` statements for each table, use a [`SHOW CREATE`](show-create.html) statement. For example, to see the `vehicles` `CREATE TABLE` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE movr.max_schema.vehicles;
~~~

~~~
         table_name        |                        create_statement
---------------------------+------------------------------------------------------------------
  movr.max_schema.vehicles | CREATE TABLE max_schema.vehicles (
                           |     id UUID NOT NULL DEFAULT gen_random_uuid(),
                           |     type max_schema.vtype NULL,
                           |     creation_time TIMESTAMPTZ NULL DEFAULT now():::TIMESTAMPTZ,
                           |     available BOOL NULL,
                           |     last_location STRING NULL,
                           |     CONSTRAINT vehicles_pkey PRIMARY KEY (id ASC)
                           | )
(1 row)
~~~

After following the examples provided in the sections above, the `abbey_init.sql` file should look similar to the following:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE movr.abbey_schema.user_promo_codes (
    code STRING,
    user_email STRING REFERENCES movr.max_schema.users(email),
    valid BOOL,
    CONSTRAINT "primary" PRIMARY KEY (code, user_email)
  );
~~~

To execute the statement in the `abbey_init.sql` file, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=abbey \
--database=movr \
-f abbey_init.sql
~~~

After the statements have been executed, you can see the table in the [CockroachDB SQL shell](cockroach-sql.html#sql-shell).

Open the SQL shell to your cluster, with `movr` as the database and `abbey` as the user, and view the table:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=abbey \
--database=movr
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM abbey_schema;
~~~

~~~
  schema_name  |    table_name    | type  | owner | estimated_row_count
---------------+------------------+-------+-------+----------------------
  abbey_schema | user_promo_codes | table | abbey |                   0
(1 row
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE movr.abbey_schema.user_promo_codes;
~~~

~~~
              table_name             |                                              create_statement
-------------------------------------+--------------------------------------------------------------------------------------------------------------
  movr.abbey_schema.user_promo_codes | CREATE TABLE abbey_schema.user_promo_codes (
                                     |     code STRING NOT NULL,
                                     |     user_email STRING NOT NULL,
                                     |     valid BOOL NULL,
                                     |     CONSTRAINT "primary" PRIMARY KEY (code ASC, user_email ASC),
                                     |     CONSTRAINT user_promo_codes_user_email_fkey FOREIGN KEY (user_email) REFERENCES max_schema.users(email)
                                     | )
(1 row)
~~~

Note that none of the tables that you have created thus far have secondary indexes. For guidance on adding secondary indexes, see at [Secondary Indexes](schema-design-indexes.html).

## What's next?

- [Secondary Indexes](schema-design-indexes.html)
- [Online Schema Changes](online-schema-changes.html)

You might also be interested in the following pages:

- [Computed Columns](computed-columns.html)
- [Column Families](column-families.html)
- [`CREATE TABLE`](create-table.html)
- [Data Types](data-types.html)
- [`PRIMARY KEY`](primary-key.html)
- [Constraints](constraints.html)
- [`cockroach` Commands Overview](cockroach-commands.html)
- [Create a User-defined Schema](schema-design-schema.html)
- [Create a Database](schema-design-database.html)
- [Schema Design Overview](schema-design-overview.html)
- [CockroachDB naming hierarchy](sql-name-resolution.html#naming-hierarchy)
