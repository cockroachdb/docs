---
title: Create a Database
summary: Best practices for creating databases in CockroachDB.
toc: true
docs_area: develop
sidebar: schema_design_overview
---

This page provides best-practice guidance on creating databases, with a couple examples based on Cockroach Labs's fictional vehicle-sharing company, [MovR](movr.html).

{{site.data.alerts.callout_success}}
For reference documentation on the `CREATE DATABASE` statement, including additional examples, see the [`CREATE DATABASE` syntax page](create-database.html).
{{site.data.alerts.end}}

## Before you begin

Before reading this page, do the following:

- [Create a {{ site.data.products.serverless }} cluster](../cockroachcloud/quickstart.html) or [start a local cluster](../cockroachcloud/quickstart.html?filters=local).
- [Review the database schema objects](schema-design-overview.html).

## Create a database

Database objects make up the first level of the [CockroachDB naming hierarchy](sql-name-resolution.html#naming-hierarchy).

To create a database, use a [`CREATE DATABASE` statement](create-database.html), following [the database best practices](#database-best-practices). After reviewing the best practices, see the examples we provide [below](#example).

### Database best practices

Here are some best practices to follow when creating and using databases:

- Do not use the preloaded `defaultdb` database. Instead, create your own database with a `CREATE DATABASE` statement, and change it to the SQL session's [current database](sql-name-resolution.html#current-database) by executing a `USE {databasename};` statement, by passing the `--database={databasename}` flag to the [`cockroach sql` command](cockroach-sql.html#general), or by specifying the `database` parameter in the [connection string](connection-parameters.html#connect-using-a-url) passed to your database schema migration tool.

- Create databases and [user-defined schemas](schema-design-schema.html) as a member of [the `admin` role](security-reference/authorization.html#admin-role) (e.g., as the [`root` user](security-reference/authorization.html#root-user)), and create all other lower-level objects as a [different user](schema-design-overview.html#control-access-to-objects), with fewer privileges, following [authorization best practices](security-reference/authorization.html#authorization-best-practices).

- Limit the number of databases you create. If you need to create multiple tables with the same name in your cluster, do so in different [user-defined schemas](schema-design-schema.html), in the same database.

- {% include {{page.version.version}}/sql/dev-schema-changes.md %}

### Example

Create an empty file with the `.sql` file extension at the end of the filename. This file will initialize the database that will store all of the data for the MovR application.

For example:

{% include_cached copy-clipboard.html %}
~~~ shell
$ touch dbinit.sql
~~~

Open `dbinit.sql` in a text editor, and, at the top of the file, add a `CREATE DATABASE` statement:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE DATABASE IF NOT EXISTS movr;
~~~

This statement will create a database named `movr`, if one does not already exist.

To execute the statement in the `dbinit.sql` file as the `root` user, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=root \
-f dbinit.sql
~~~

To view the database in the cluster, execute a [`SHOW DATABASES`](show-databases.html) statement from the command line:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=root \
--execute="SHOW DATABASES;"
~~~

~~~
  database_name | owner | primary_region | regions | survival_goal
----------------+-------+----------------+---------+----------------
  defaultdb     | root  | NULL           | {}      | NULL
  movr          | root  | NULL           | {}      | NULL
  postgres      | root  | NULL           | {}      | NULL
  system        | node  | NULL           | {}      | NULL
(4 rows)
~~~

You're now ready to start adding user-defined schemas to the `movr` database.

For guidance on creating user-defined schemas, see [Create a User-defined Schema](schema-design-schema.html).

## What's next?

- [Create a User-defined Schema](schema-design-schema.html)
- [Create a Table](schema-design-table.html)

You might also be interested in the following pages:

- [`CREATE DATABASE`](create-database.html)
- [Schema Design Overview](schema-design-overview.html)
- [`cockroach` Commands Overview](cockroach-commands.html)
- [CockroachDB naming hierarchy](sql-name-resolution.html#naming-hierarchy)
