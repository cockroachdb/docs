---
title: Create a User-defined Schema
summary: Create a user-defined schema for your CockroachDB cluster
toc: true
docs_area: develop
---

This page provides best-practice guidance on creating user-defined schemas, with some simple examples based on Cockroach Labs's fictional vehicle-sharing company, [MovR](movr.html).

{{site.data.alerts.callout_success}}
For detailed reference documentation on the `CREATE SCHEMA` statement, including additional examples, see the [`CREATE SCHEMA` syntax page](create-schema.html).
{{site.data.alerts.end}}

## Before you begin

Before reading this page, do the following:

- [Create a {{ site.data.products.serverless }} cluster](../cockroachcloud/quickstart.html) or [start a local cluster](../cockroachcloud/quickstart.html?filters=local).
- [Review the database schema objects](schema-design-overview.html).
- [Create a database](schema-design-database.html).

## Create a user-defined schema

User-defined schemas belong to the second level of the [CockroachDB naming hierarchy](sql-name-resolution.html#naming-hierarchy).

To create a user-defined schema, use a [`CREATE SCHEMA` statement](create-schema.html), following [the user-defined schema best practices](#user-defined-schema-best-practices). After reviewing the best practices, see the example we provide [below](#examples).

### User-defined schema best practices

Here are some best practices to follow when creating and using user-defined schemas:

- If you want to create multiple objects (e.g., tables or views) with the same name in your cluster, do so in different user-defined schemas in the same database.

- If you want to separate lower-level objects (e.g., a set of [tables](schema-design-table.html) or [views](views.html)) for access or organizational purposes, do not create those objects in the preloaded [`public` schema](sql-name-resolution.html#naming-hierarchy). Instead, create user-defined schemas, and then create the objects in the user-defined schemas.

- Create user-defined schemas as a member of [the `admin` role](security-reference/authorization.html#admin-role) (e.g., as the [`root` user](security-reference/authorization.html#root-user)), and then give ownership of them to a [different user](schema-design-overview.html#control-access-to-objects), with fewer privileges across the database, following [authorization best practices](security-reference/authorization.html#authorization-best-practices).

- When you create a user-defined schema, take note of the [object's owner](security-reference/authorization.html#object-ownership). You can specify the owner in a `CREATE SCHEMA` statement with the [`AUTHORIZATION` keyword](create-schema.html#parameters). If `AUTHORIZATION` is not specified, the owner will be the user creating the user-defined schema.

- Do not create user-defined schemas in the preloaded `defaultdb` database. Instead, use a database [you have created](schema-design-database.html). If you do not specify a database in the `CREATE SCHEMA` statement, the user-defined schema will be created in your SQL session's [current database](sql-name-resolution.html#current-database).

- When referring to a lower-level object in a database (e.g., a table), include the object's schema name (e.g., `schema_name.table_name`). Specifying the schema name in a lower-level object reference can prevent users from attempting to access the wrong object, if there are multiple objects with the same name in a database.

- {% include {{page.version.version}}/sql/dev-schema-changes.md %}

### Examples

Suppose you want to separate the tables and indexes in your cluster such that one user manages a group of tables, and another user manages a different group of tables. You can do this with two different user-defined schemas, owned by two different SQL users, with fewer privileges than the `root` user.

Open the `dbinit.sql` file that you created in the [Create a Database](schema-design-database.html) example, and add the following statements under the `CREATE DATABASE` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
USE movr;

CREATE USER IF NOT EXISTS max;
GRANT CREATE ON DATABASE movr TO max;

CREATE USER IF NOT EXISTS abbey;
GRANT CREATE ON DATABASE movr TO abbey;
~~~

The first statement sets the `movr` database as the [current database](sql-name-resolution.html#current-database). The next two sets of statements create SQL users named `max` and `abbey` in the `movr` database, with [`CREATE` privileges on the database](security-reference/authorization.html#supported-privileges). `CREATE` privileges will allow each user to create tables in the database.

Now, under the `CREATE USER` statements, add `DROP SCHEMA` and `CREATE SCHEMA` statements for each user's user-defined schema:

{% include_cached copy-clipboard.html %}
~~~ sql
DROP SCHEMA IF EXISTS max_schema CASCADE;
CREATE SCHEMA max_schema AUTHORIZATION max;

DROP SCHEMA IF EXISTS abbey_schema CASCADE;
CREATE SCHEMA abbey_schema AUTHORIZATION abbey;
~~~

The first set of statement clears the database of any existing schema named `max_schema`, and then creates a schema named `max_schema` with the owner `max`. The next set of statements does the same, but for `abbey_schema`, with `abbey` as the owner.

It might also be a good idea to [grant the `USAGE` privilege](grant.html#supported-privileges) on each schema to the other user in the database. This will allow the other user to access objects in the schema, but it will not let them delete the schema, or create objects inside of it.

Under the `CREATE SCHEMA` statements for each user-defined schema, add a `GRANT` statement granting `USAGE` privileges on the schema to the other user.

The `dbinit.sql` file should now look something link this:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DATABASE IF NOT EXISTS movr;

USE movr;

CREATE USER IF NOT EXISTS max;
GRANT CREATE ON DATABASE movr TO max;

CREATE USER IF NOT EXISTS abbey;
GRANT CREATE ON DATABASE movr TO abbey;

DROP SCHEMA IF EXISTS max_schema CASCADE;
CREATE SCHEMA max_schema AUTHORIZATION max;
GRANT USAGE ON SCHEMA max_schema TO abbey;

DROP SCHEMA IF EXISTS abbey_schema CASCADE;
CREATE SCHEMA abbey_schema AUTHORIZATION abbey;
GRANT USAGE ON SCHEMA abbey_schema TO max;
~~~

To execute the statements in the `dbinit.sql` file as the `root` user, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=root \
-f dbinit.sql
~~~

Before the new users can connect to the cluster and start creating objects, they each need a [user certificate](authentication.html#client-authentication). To create a user certificate for `max`, open a new terminal, and run the following [`cockroach cert`](cockroach-cert.html) command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client max --certs-dir={certs-directory} --ca-key={my-safe-directory}/ca.key
~~~

Create a user certificate for `abbey` as well:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client abbey --certs-dir={certs-directory} --ca-key={my-safe-directory}/ca.key
~~~

As one of the new users, use a [`SHOW SCHEMAS` statement](show-schemas.html) to show the preloaded and user-defined schemas in the `movr` database:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=abbey \
--database=movr \
--execute="SHOW SCHEMAS;"
~~~

~~~
     schema_name     | owner
---------------------+--------
  abbey_schema       | abbey
  crdb_internal      | NULL
  information_schema | NULL
  max_schema         | max
  pg_catalog         | NULL
  pg_extension       | NULL
  public             | admin
(7 rows)
~~~

You're now ready to start adding tables to the `max_schema` user-defined schema as the `max` user, and to the `abbey_schema` user-defined schema as the `abbey` user.

For guidance on creating tables, see at [Create a Table](schema-design-table.html).

## What's next?

- [Create a Table](schema-design-table.html)
- [Secondary Indexes](schema-design-indexes.html)

You might also be interested in the following pages:

- [`CREATE SCHEMA`](create-schema.html)
- [`cockroach` Commands Overview](cockroach-commands.html)
- [Create a Database](schema-design-database.html)
- [Schema Design Overview](schema-design-overview.html)
- [CockroachDB naming hierarchy](sql-name-resolution.html#naming-hierarchy)
