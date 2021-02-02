---
title: Create a Database
summary: Create a database for your CockroachDB cluster
toc: true
---

This page provides best-practice guidance on creating databases, with a couple examples based on Cockroach Labs' fictional vehicle-sharing company, [MovR](movr.html).

{{site.data.alerts.callout_success}}
For reference documentation on the `CREATE DATABASE` statement, including additional examples, see the [`CREATE DATABASE` syntax page](create-database.html).
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
</ul>

## Create a database

Database objects make up the first level of the [CockroachDB naming hierarchy](sql-name-resolution.html#naming-hierarchy).

To create a database, use a [`CREATE DATABASE` statement](create-database.html), following [the database best practices](#database-best-practices). After reviewing the best practices, see the examples we provide [below](#examples).

### Database best practices

Here are some best practices to follow when creating and using databases:

- Do not use the preloaded `defaultdb` database. Instead, create your own database with a `CREATE DATABASE` statement, and change it to the SQL session's [current database](sql-name-resolution.html#current-database) by executing a `USE [databasename];` statement, by passing the `--database=[databasename]` flag to the [`cockroach sql` command](cockroach-sql.html#general), or by specifying the `database` parameter in the [connection string](connection-parameters.html#connect-using-a-url) passed to your database schema migration tool.

- Create databases as the `root` user, and create all other lower-level objects with a [different user](schema-design-overview.html#controlling-access-to-objects), with fewer privileges, following [authorization best practices](authorization.html#authorization-best-practices).

- Limit the number of databases you create. If you need to create multiple tables with the same name in your cluster, do so in different [user-defined schemas](#create-a-user-defined-schema), in the same database.

- {% include {{page.version.version}}/sql/dev-schema-changes.md %}

### Example

Open a terminal window, and use the CockroachDB [SQL client](cockroach-sql.html) to open the [CockroachDB SQL shell](cockroach-sql.html#sql-shell) to your cluster:

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

{% remote_include https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/cockroachcloud/connect_to_crc.md|<!-- BEGIN CRC free sql -->|<!-- END CRC free sql --> %}

</section>

<section class="filter-content" markdown="1" data-scope="local">

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir=[certs-directory]
~~~

</section>

This command opens a SQL shell as the `root` user. Any statements executed from the shell will be executed by this user.

To create a database as `root`, issue a `CREATE DATABASE` statement in the SQL shell:

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE movr;
~~~

This statement creates a database object with the name `movr`. This database will store all of the data for the MovR application.

To view the database in the cluster, use a [`SHOW DATABASES`](show-databases.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
  database_name
-----------------
  defaultdb
  movr
  postgres
  system
(4 rows)
~~~

To follow [authorization best practices](authorization.html#authorization-best-practices), after you create a new database, you should also create some new SQL users to manage the lower-level objects in the new database.

In the open SQL shell, execute the following `CREATE USER` statement:

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER max;
~~~

This creates a SQL user named `max`, with no privileges.

Use a `GRANT` statements to grant the user `CREATE` privileges on the `movr` database.

{% include copy-clipboard.html %}
~~~ sql
> GRANT CREATE ON DATABASE movr TO max;
~~~

This privilege allows `max` to create objects (i.e., user-defined schemas) in the `movr` database.

In the same SQL shell, create a second user named `abbey`, and grant them the same privileges.

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER abbey;
> GRANT CREATE ON DATABASE movr TO abbey;
~~~

This creates a second SQL user named `abbey`, with `CREATE` privileges on the database.

To connect to a secure cluster and execute SQL statements, users need [user certificates](authentication.html#client-authentication). To create a user certificate for `max`, open a new terminal, and run the following [`cockroach cert`](cockroach-cert.html) command:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client max --certs-dir=[certs-directory] --ca-key=[my-safe-directory]/ca.key
~~~

Create a user certificate for `abbey` as well:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client abbey --certs-dir=[certs-directory] --ca-key=[my-safe-directory]/ca.key
~~~

You're now ready to start adding user-defined schemas to the `movr` database for the `max` and `abbey` users.

For guidance on creating user-defined schemas, see at [Create a User-defined Schema](schema-design-schema.html).

## What's next?

- [Create a User-defined Schema](schema-design-schema.html)
- [Create a Table](schema-design-table.html)

You might also be interested in the following pages:

- [`CREATE DATABASE`](create-database.html)
- [Cockroach Commands](cockroach-commands.html)
- [Schema Design Overview](schema-design-overview.html)
- [CockroachDB naming hierarchy](sql-name-resolution.html#naming-hierarchy)
