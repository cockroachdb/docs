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

- Do not use the preloaded `public` schema. Instead, create a user-defined schema with `CREATE SCHEMA`, and then refer to lower-level objects with fully-qualified names (e.g., `schema_name.table_name`).
- Do not create user-defined schemas as the `root` user. Instead, create all lower-level objects with a [different user](schema-design-overview.html#controlling-access-to-objects), with more limited privileges, following [authorization best practices](authorization.html#authorization-best-practices).
- Do not create user-defined schemas in the preloaded `defaultdb` database. Instead, use a database [you have created](schema-design-database.html). Schemas can only be created in your SQL session's [current database](sql-name-resolution.html#current-database), so be sure to [change the session's database](schema-design-database.html#database-best-practices) before creating a user-defined schema.
- When you create a user-defined schema, take note of the [object's *owner*](authorization.html#object-ownership). You can specify the owner in a `CREATE SCHEMA` statement with the `AUTHORIZATION` keyword. If `AUTHORIZATION` is not specified, the owner will be the user creating the user-defined schema. We recommend creating user-defined schemas as the user that will create and use the lower-level objects of the database schema (e.g., tables and indexes).
- {% include {{page.version.version}}/sql/dev-schema-changes.md %}

### Example

{{site.data.alerts.callout_info}}
For the examples in the rest of the [**Design a Database Schema** sections](schema-design-table.html), we'll add all database schema change statements to a `.sql` file, and then pass the file to the [SQL client](cockroach-sql.html) for execution as the `maxroach` user.
{{site.data.alerts.end}}

Create an empty file with the `.sql` file extension at the end of the filename. For example:

{% include copy-clipboard.html %}
~~~ shell
$ touch dbinit.sql
~~~

Now, open `dbinit.sql` in a text editor of your choice, and add a `CREATE SCHEMA` statement to the top of the file:

{% include copy-clipboard.html %}
~~~
CREATE SCHEMA IF NOT EXISTS movr;
~~~

This statement will create a user-defined schema named `movr` in the [current database](sql-name-resolution.html#current-database), if one does not already exist.

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

After you have executed the statements, you can see the `cockroachlabs` database and the `movr` user-defined schema in the [CockroachDB SQL shell](cockroach-sql.html#sql-shell).

To open the SQL shell with `cockroachlabs` as the database, run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir=[certs-directory] \
--user=maxroach \
--database=cockroachlabs
~~~

To view the user-defined schemas in `cockroachlabs`, issue a [`SHOW SCHEMAS`](show-schemas.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW SCHEMAS;
~~~

~~~
     schema_name
----------------------
  crdb_internal
  information_schema
  movr
  pg_catalog
  pg_extension
  public
(6 rows)
~~~

You're now ready to start adding tables to the `movr` user-defined schema as the `maxroach` user. For guidance on creating tables, see at [Create a Table](schema-design-table.html).

## See also

- [Create a Database](schema-design-database.html)
- [Create a Table](schema-design-table.html)
- [CockroachDB naming hierarchy](sql-name-resolution.html#naming-hierarchy)
- [Schema Design Overview](schema-design-overview.html)
- [`CREATE SCHEMA`](create-schema.html)
