---
title: Create a User-defined Schema
summary: Create a user-defined schema for your CockroachDB cluster
toc: true
---

This page provides best-practice guidance on creating user-defined schemas, with a simple example based on Cockroach Labs' fictional vehicle-sharing company, [MovR](movr.html).

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `CREATE SCHEMA` statement, including additional examples, see the [`CREATE SCHEMA` syntax page](create-schema.html).
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
</ul>

## Create a user-defined schema

User-defined schemas belong to the second level of the [CockroachDB naming hierarchy](sql-name-resolution.html#naming-hierarchy).

To create a user-defined schema, use a [`CREATE SCHEMA` statement](create-schema.html), following [the user-defined schema best practices](#user-defined-schema-best-practices). After reviewing the best practices, see the example we provide [below](#example).

### User-defined schema best practices

Here are some best practices to follow when creating and using user-defined schemas:

- If you want to create multiple objects (e.g., tables or views) with the same name in your cluster, do so in different user-defined schemas in the same database.

- If you want to separate lower-level objects (e.g., a set of [tables](create-a-table.html) or [views](views.html)) for access or organizational purposes, do not create those objects in the preloaded [`public` schema](sql-name-resolution.html#naming-hierarchy). Instead, create user-defined schemas, and then create the objects in the user-defined schemas.

- Do not create user-defined schemas as the `root` user. Instead, create them as a [different user](schema-design-overview.html#controlling-access-to-objects), with fewer privileges on the database, following [authorization best practices](authorization.html#authorization-best-practices).

- When you create a user-defined schema, take note of the [object's owner](authorization.html#object-ownership). You can specify the owner in a `CREATE SCHEMA` statement with the `AUTHORIZATION` keyword. If `AUTHORIZATION` is not specified, the owner will be the user creating the user-defined schema. We recommend creating user-defined schemas as the user that will create and use the lower-level objects of the database schema (e.g., tables and indexes).

- Do not create user-defined schemas in the preloaded `defaultdb` database. Instead, use a database [you have created](schema-design-database.html). User-defined schemas can only be created in your SQL session's [current database](sql-name-resolution.html#current-database), so be sure to [change the session's database](schema-design-database.html#database-best-practices) to a database that you have created before creating a user-defined schema.

- When referring to a lower-level object in a database (e.g., a table), include the object's schema name (e.g., `schema_name.table_name`). Specifying the schema name in a lower-level object reference can prevent users from attempting to access the wrong object, if there are multiple objects with the same name in a database.

- {% include {{page.version.version}}/sql/dev-schema-changes.md %}

### Example

For the examples in the rest of the **Design a Database Schema** sections, you'll add database schema change statements to `.sql` files, and then pass the files to the [SQL client](cockroach-sql.html) to be executed as a specific user.

For each user that you created in the `movr` database in [Create a Database](schema-design-database.html) (i.e., `max` and `abbey`), create an empty file with the `.sql` file extension at the end of the filename. For example:

{% include copy-clipboard.html %}
~~~ shell
$ touch max_dbinit.sql
~~~

{% include copy-clipboard.html %}
~~~ shell
$ touch abbey_dbinit.sql
~~~

These files will initialize the objects in the `movr` database, for each user.

Open `max_dbinit.sql` in a text editor of your choice, and add a `CREATE SCHEMA` statement to the top of the file:

{% include copy-clipboard.html %}
~~~
CREATE SCHEMA IF NOT EXISTS max_schema;
~~~

This statement will create a user-defined schema named `max_schema` in the [current database](sql-name-resolution.html#current-database), if one does not already exist. This schema will hold all of the objects in the database schema [owned by](authorization.html#object-ownership) `max`.

Now, open `abbey_dbinit.sql` in a text editor of your choice, and add a `CREATE SCHEMA` statement to the top of the file:

{% include copy-clipboard.html %}
~~~
CREATE SCHEMA IF NOT EXISTS abbey_schema;
~~~

This statement will create a user-defined schema named `abbey_schema` in the current database, if one does not already exist. This schema will hold all of the objects in the database schema accessible to `abbey`.

To execute the statements in the `max_dbinit.sql` file as `max`, run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir=[certs-directory] \
--user=max \
--database=movr
< max_dbinit.sql
~~~

The SQL client will execute any statements in `max_dbinit.sql`, with `movr` as the database and `max` as the user. `max` will be the [owner](authorization.html#object-ownership) of any objects created by the statements in the file.

To execute the statements in the `abbey_dbinit.sql` file as `abbey`, run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir=[certs-directory] \
--user=abbey \
--database=movr
< abbey_dbinit.sql
~~~

`abbey` will be the owner of any objects created by the statements in the file.

After you have executed the statements in both files, you can see the user-defined schemas in the [CockroachDB SQL shell](cockroach-sql.html#sql-shell), as either user:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir=[certs-directory] \
--user=max \
--database=movr
~~~

To view the user-defined schemas in the current database, issue a [`SHOW SCHEMAS`](show-schemas.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name
----------------------
  abbey_schema
  crdb_internal
  information_schema
  max_schema
  pg_catalog
  pg_extension
  public
(7 rows)
~~~

You're now ready to start adding tables to the `max_schema` user-defined schema as the `max` user, and to the `abbey_schema` user-defined schema as the `abbey` user.

For guidance on creating tables, see at [Create a Table](schema-design-table.html).

## What's next?

- [Create a Table](schema-design-table.html)
- [Add Secondary Indexes](schema-design-indexes.html)

You might also be interested in the following pages:

- [`CREATE SCHEMA`](create-schema.html)
- [Cockroach Commands](cockroach-commands.html)
- [Create a Database](schema-design-database.html)
- [Schema Design Overview](schema-design-overview.html)
- [CockroachDB naming hierarchy](sql-name-resolution.html#naming-hierarchy)
