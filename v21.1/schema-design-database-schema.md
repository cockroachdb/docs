---
title: Create a Database and User-defined Schema
summary: Create a database and schema for your CockroachDB cluster
toc: true
---

This page provides best-practice guidance on creating databases and user-defined schemas, with some simple examples based on Cockroach Labs' fictional vehicle-sharing company, [MovR](movr.html).

{% include {{page.version.version}}/sql/dev-schema-changes.md %}

## Before you begin

Before reading this page, do the following:

- Start a [local CockroachDB cluster](secure-a-cluster.html), or create a [CockroachCloud cluster](cockroachcloud/create-your-cluster.html).
- Review [the database schema objects](schema-design-overview.html).

## Create a database

Use the CockroachDB [SQL client](cockroach-sql.html) to open a SQL shell to your cluster:

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

To create a database, issue a `CREATE DATABASE` statement in the SQL shell:

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE cockroachlabs;
~~~

This statement creates a database object with the name `cockroachlabs`. The statement is executed by `root`, but, to follow an [authorization best practice](authorization.html#authorization-best-practices), all other database schema changes should be made by a different user, with lower-level privileges.

{{site.data.alerts.callout_success}}
For reference documentation on the `CREATE DATABASE` statement, including additional examples, see the [`CREATE DATABASE` syntax page](create-database.html).
{{site.data.alerts.end}}

To view the database in the cluster, use a [`SHOW DATABASES`](show-databases.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
  database_name
-----------------
  cockroachlabs
  defaultdb
  postgres
  system
(4 rows)
~~~

### Database best practices

Here are some best practices to follow when creating and using databases:

- Do not use the `defaultdb` database. Instead, create your own database with a `CREATE DATABASE` statement, and change it to the current database using a `USE databasename;` statement, or the `--database` flag of the `cockroach sql` command.
- Create databases as the `root` user, and create all other lower-level objects with different users, with more limited privileges.
- Limit the number of databases you create. If you need to create multiple tables with the same name in your cluster, do so in different [user-defined schemas](#create-a-user-defined-schema) in the same database.

## Create a new SQL user

To follow [authorization best practices](authorization.html#authorization-best-practices), you will need a new SQL user to create any objects in the `cockroachlabs` database.

In the open SQL shell, execute the following `CREATE USER` statement:

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER max;
~~~

This creates a SQL user named `max`, with no privileges.

Use a `GRANT` statements to grant `max` `CREATE` privileges on the `cockroachlabs` database.

{% include copy-clipboard.html %}
~~~ sql
> GRANT CREATE ON DATABASE cockroachlabs TO max;
~~~

## Create a user-defined schema

For the rest of the **Design a Database Schema** sections, we'll add all database schema change statements to a `.sql` file, and then pass the file to the SQL client for execution as the `max` user.

Create an empty file with the `.sql` file extension at the end of the filename. For example:

{% include copy-clipboard.html %}
~~~ shell
$ touch dbinit.sql
~~~

Now, open `dbinit.sql` in a text editor of your choice, and add a `CREATE SCHEMA` statement:

{% include copy-clipboard.html %}
~~~
CREATE SCHEMA movr;
~~~

This statement will create a user-defined schema named `movr` in the current database.

{{site.data.alerts.callout_success}}
For detailed reference documentation on this statement, including additional examples, see the [`CREATE SCHEMA` syntax page](create-schema.html).
{{site.data.alerts.end}}

To execute the file, open a new terminal, and run the following command:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir=certs \
--user=max \
--database=cockroachlabs
< dbinit.sql
~~~

The SQL client will ask you for the `max` user password, and then execute any statements in `dbinit.sql`, with `cockroachlabs` as the current database.

After you have executed the statements, you can see the database and schema in the SQL shell. To view the user-defined schemas in the cluster, open the terminal to the SQL shell, change the current database to `cockroachlabs`, and then issue a [`SHOW SCHEMAS`](show-schemas.html) statement:

{% include copy-clipboard.html %}
~~~ sql
> USE cockroachlabs;
~~~

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

You're now ready to start adding tables to the user-defined schema. For guidance on creating tables, see at [Create a Table](schema-design-table.html).

### User-defined schema best practices

Here are some best practices to follow when creating and using user-defined schemas:

- Do not use the `public` schema. Instead, create a user-defined schema with `CREATE SCHEMA`.
- Do not create user-defined schemas in the `defaultdb` database. Instead, use a database you have created.
- Be sure to change your SQL session's current database before creating a user-defined schema. Schemas can only be created in the current database, and, by default, `defaultdb` is the current database.
- When you create a user-defined schema, take note of the owner. You can specify the owner with the `AUTHORIZATION` keyword. If `AUTHORIZATION` is not specified, the owner will be the creator. We recommend creating user-defined schemas as the user that will create the lower-level objects in the database schema.

## See also

- [CockroachDB naming hierarchy](sql-name-resolution.html#naming-hierarchy)
- [Schema Design Overview](schema-design-overview.html)
- [`CREATE DATABASE`](create-database.html)
- [`CREATE SCHEMA`](create-schema.html)
- [Create a Table](schema-design-table.html)
