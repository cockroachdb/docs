---
title: Create a Database
summary: Best practices for creating databases in CockroachDB.
toc: true
docs_area: develop
---

This page provides best-practice guidance on creating databases, with a couple examples based on Cockroach Labs's fictional vehicle-sharing company, [MovR]({% link {{ page.version.version }}/movr.md %}).

{{site.data.alerts.callout_success}}
For reference documentation on the `CREATE DATABASE` statement, including additional examples, see the [`CREATE DATABASE` syntax page]({% link {{ page.version.version }}/create-database.md %}).
{{site.data.alerts.end}}

## Before you begin

Before reading this page, do the following:

- [Create a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/quickstart.md %}) or [start a local cluster]({% link {{page.version.version}}/start-a-local-cluster.md %}).
- [Review the database schema objects]({% link {{ page.version.version }}/schema-design-overview.md %}).

## Create a database

Database objects make up the first level of the [CockroachDB naming hierarchy]({% link {{ page.version.version }}/sql-name-resolution.md %}#naming-hierarchy).

To create a database, use a [`CREATE DATABASE` statement]({% link {{ page.version.version }}/create-database.md %}), following [the database best practices](#database-best-practices). After reviewing the best practices, see the examples we provide [below](#example).

{{site.data.alerts.callout_info}}
Cockroach Labs recommends against starting a database name with the string `cluster:`. Refer to [Database Best Practices](#database-best-practices) for more information.
{{site.data.alerts.end}}

### Database best practices

Here are some best practices to follow when creating and using databases:

- Do not use the preloaded `defaultdb` database. Instead, create your own database with a `CREATE DATABASE` statement, and change it to the SQL session's [current database]({% link {{ page.version.version }}/sql-name-resolution.md %}#current-database) by executing a `USE {databasename};` statement, by passing the `--database={databasename}` flag to the [`cockroach sql` command]({% link {{ page.version.version }}/cockroach-sql.md %}#general), or by specifying the `database` parameter in the [connection string]({% link {{ page.version.version }}/connection-parameters.md %}#connect-using-a-url) passed to your database schema migration tool.
- Do not begin your database name with the string `cluster:`. If your database name begins with this string, you must append the following to the URI connection string to [connect to the cluster]({% link {{ page.version.version }}/connect-to-the-database.md %}): `&options=-ccluster=system`
- Create databases and [user-defined schemas]({% link {{ page.version.version }}/schema-design-schema.md %}) as a member of [the `admin` role]({% link {{ page.version.version }}/security-reference/authorization.md %}#admin-role) (e.g., as the [`root` user]({% link {{ page.version.version }}/security-reference/authorization.md %}#root-user)), and create all other lower-level objects as a [different user]({% link {{ page.version.version }}/schema-design-overview.md %}#control-access-to-objects), with fewer privileges, following [authorization best practices]({% link {{ page.version.version }}/security-reference/authorization.md %}#authorization-best-practices).

- Limit the number of databases you create. If you need to create multiple tables with the same name in your cluster, do so in different [user-defined schemas]({% link {{ page.version.version }}/schema-design-schema.md %}), in the same database.

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

To view the database in the cluster, execute a [`SHOW DATABASES`]({% link {{ page.version.version }}/show-databases.md %}) statement from the command line:

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

For guidance on creating user-defined schemas, see [Create a User-defined Schema]({% link {{ page.version.version }}/schema-design-schema.md %}).

## What's next?

- [Create a User-defined Schema]({% link {{ page.version.version }}/schema-design-schema.md %})
- [Create a Table]({% link {{ page.version.version }}/schema-design-table.md %})

You might also be interested in the following pages:

- [`CREATE DATABASE`]({% link {{ page.version.version }}/create-database.md %})
- [Schema Design Overview]({% link {{ page.version.version }}/schema-design-overview.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
- [CockroachDB naming hierarchy]({% link {{ page.version.version }}/sql-name-resolution.md %}#naming-hierarchy)
