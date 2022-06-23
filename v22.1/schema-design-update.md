---
title: Change and Remove Objects in a Database Schema
summary: How to change and remove objects in a CockroachDB database schema.
toc: true
docs_area: develop
---

This page provides an overview on changing and removing the objects in a database schema, with some simple examples based on Cockroach Labs' fictional vehicle-sharing company, [MovR](movr.html).

## Before you begin

Before reading this page, do the following:

- [Create a {{ site.data.products.serverless }} cluster](../cockroachcloud/quickstart.html) or [start a local cluster](../cockroachcloud/quickstart.html?filters=local).
- [Review the database schema objects](schema-design-overview.html).
- [Create a database](schema-design-database.html).
- [Create a user-defined schema](schema-design-schema.html).
- [Create a table](schema-design-table.html).
- [Add secondary indexes](schema-design-indexes.html).

## Alter database schema objects

To change an existing object in a database schema, use an `ALTER` statement.

`ALTER` statements generally take the following form:

~~~
ALTER {OBJECT_TYPE} {object_name} {SUBCOMMAND};
~~~

Parameter | Description
----------|------------
`{OBJECT_TYPE}` | The type of the object.
`{object_name}` | The name of the object.
`{SUBCOMMAND}` | The subcommand for the change that you would like to make.

For examples, see [below](#altering-objects-examples).

CockroachDB supports the following `ALTER` statements:

- [`ALTER DATABASE`](alter-database.html)
- [`ALTER SCHEMA`](alter-schema.html)
- [`ALTER TABLE`](alter-table.html)
- [`ALTER INDEX`](alter-index.html)
- [`ALTER VIEW`](alter-view.html)
- [`ALTER SEQUENCE`](alter-sequence.html)
- [`ALTER TYPE`](alter-type.html)
- [`ALTER USER/ROLE`](alter-user.html)

### Best practices for altering objects

- After you initialize a database schema, make any additional database schema changes in a separate set of changes (e.g., for the Cockroach SQL client, a separate `.sql` file; for Liquibase, a separate *changeset*).

- For `ALTER TABLE` statements, combine multiple subcommands in a single `ALTER TABLE` statement, where possible.

- {% include {{page.version.version}}/sql/dev-schema-changes.md %}

- {% include {{page.version.version}}/sql/dev-schema-change-limits.md %}

### Altering objects examples

Suppose you want to make some changes to the `users` table that you created in [Create a Table](schema-design-table.html). In specific, you want to do the following:

- Add a new `username` column.
- Change the columns in the table's primary key to `username` column and `email`.
- Move the table to the `abbey_schema` user-defined schema.
- Change the owner of the table to `abbey`.

The `ALTER TABLE` statement has subcommands for all of these changes:

- To add a new column, use the [`ADD COLUMN` subcommand](add-column.html).
- To change the primary key columns of a table, use the [`ALTER PRIMARY KEY` subcommand](alter-primary-key.html).
- To move a table to a different schema, use the [`SET SCHEMA`](set-schema.html) subcommand.
- To change the owner of a table, use the [`OWNER  TO`](owner-to.html) subcommand.

Create a new `.sql` file for the changes that you plan to make to the table:

{% include_cached copy-clipboard.html %}
~~~ shell
$ touch update_users_table.sql
~~~

Open `update_users_table.sql` in a text editor, and add the `ALTER TABLE` statement for adding the `username` column:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE IF EXISTS movr.max_schema.users ADD COLUMN username STRING;
~~~

Under that first `ALTER TABLE` statement, add another `ALTER TABLE` statement for changing the primary key columns to `username` and `email`:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE IF EXISTS movr.max_schema.users ALTER PRIMARY KEY USING COLUMNS (username, email);
~~~

In order to add a column to an existing table's primary key index, the column must have an existing [`NOT NULL` constraint](not-null.html). Neither the `username` nor the `email` columns have `NOT NULL` constraints.

Add a `NOT NULL` constraint to the `ADD COLUMN` subcommand for `username`. In the same `ALTER TABLE` statement, add an [`ALTER COLUMN` subcommand](alter-column.html) to set the `NOT NULL` constraint on the `email` column:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE IF EXISTS movr.max_schema.users
  ADD COLUMN username STRING NOT NULL,
  ALTER COLUMN email SET NOT NULL;
~~~

The file should now look something like this:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE IF EXISTS movr.max_schema.users
  ADD COLUMN username STRING NOT NULL,
  ALTER COLUMN email SET NOT NULL;

ALTER TABLE IF EXISTS movr.max_schema.users ALTER PRIMARY KEY USING COLUMNS (username, email);
~~~

The remaining changes that you want to make will require `ALTER TABLE` statements with the `SET SCHEMA` and `OWNER TO` subcommands. An `ALTER TABLE ... SET SCHEMA` statement will change the contents of two schemas, and an `ALTER TABLE ... OWNER TO` statement will change the privileges of two users. To follow [authorization best practices](security-reference/authorization.html#authorization-best-practices), you should execute any statements that change databases, user-defined schemas, or user privileges as a member of the `admin` role (e.g., as `root`).

Create a new `.sql` file for the remaining `ALTER TABLE` statements, to be executed by `root`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ touch update_users_owner.sql
~~~

Add the following statements to the file:

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE IF EXISTS movr.max_schema.users SET SCHEMA abbey_schema;

ALTER TABLE IF EXISTS movr.abbey_schema.users OWNER TO abbey;
~~~

To execute the statements in the `update_users_table.sql` file as `max`, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=max \
--database=movr \
-f update_users_table.sql
~~~

To execute the statements in the `update_users_owner.sql` file as `root`, run the following command:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=root \
--database=movr \
-f update_users_owner.sql
~~~

The `users` table should now have a new column, a different primary key, a different schema, and a different owner.

You can verify with some `SHOW` statements:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=abbey \
--database=movr \
--execute="SHOW SCHEMAS; SHOW TABLES; SHOW CREATE TABLE movr.abbey_schema.users;"
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

  schema_name  |    table_name    | type  | owner | estimated_row_count
---------------+------------------+-------+-------+----------------------
  abbey_schema | user_promo_codes | table | abbey |                   0
  abbey_schema | users            | table | abbey |                   0
  max_schema   | rides            | table | max   |                   0
  max_schema   | vehicles         | table | max   |                   0
(4 rows)

        table_name        |                                 create_statement
--------------------------+-----------------------------------------------------------------------------------
  movr.abbey_schema.users | CREATE TABLE abbey_schema.users (
                          |     first_name STRING NOT NULL,
                          |     last_name STRING NOT NULL,
                          |     email STRING NOT NULL,
                          |     username STRING NOT NULL,
                          |     CONSTRAINT "primary" PRIMARY KEY (username ASC, email ASC),
                          |     UNIQUE INDEX users_first_name_last_name_key (first_name ASC, last_name ASC),
                          |     UNIQUE INDEX users_email_key (email ASC),
                          |     FAMILY "primary" (first_name, last_name, email, username)
                          | )
(1 row)
~~~

## Drop database schema objects

To drop an object from a database schema, use a `DROP` statement.

`DROP` statements generally take the following form:

~~~
DROP {OBJECT_TYPE} {object_name} CASCADE;
~~~

Parameter | Description
----------|------------
`{OBJECT_TYPE}` | The type of the object.
`{object_name}` | The name of the object.
`{CASCADE}` | An optional keyword that will drop all objects dependent on the object being dropped.

For examples, see [below](#altering-objects-examples).

CockroachDB supports the following `DROP` statements:

- [`DROP DATABASE`](drop-database.html)
- [`DROP SCHEMA`](drop-schema.html)
- [`DROP TABLE`](drop-table.html)
- [`DROP INDEX`](drop-index.html)
- [`DROP SEQUENCE`](drop-sequence.html)
- [`DROP VIEW`](drop-view.html)
- [`DROP USER/ROLE`](drop-user.html)

{{site.data.alerts.callout_info}}
To drop columns and column constraints from a table, use the `DROP COLUMN` and `DROP CONSTRAINT` subcommands of the [`ALTER TABLE`](alter-table.html) statement.
{{site.data.alerts.end}}

### Drop best practices

- Check the contents and dependencies of the object that you want to drop before using the `CASCADE` option. `CASCADE` drops all of the contents of an object, and should be used sparingly after a schema has been initialized.

### Drop example

Suppose that you want to drop an index that isn't being used very much. In particular, you want to drop the index on `first_name` and `last_name` from the `users` table.

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=abbey \
--database=movr \
--execute="SHOW INDEXES FROM movr.abbey_schema.users; SHOW CREATE TABLE movr.abbey_schema.users;"
~~~

~~~
  table_name |           index_name           | non_unique | seq_in_index | column_name | direction | storing | implicit
-------------+--------------------------------+------------+--------------+-------------+-----------+---------+-----------
  users      | users_pkey                     |   false    |            1 | username    | ASC       |  false  |  false
  users      | users_pkey                     |   false    |            2 | email       | ASC       |  false  |  false
  users      | users_first_name_last_name_key |   false    |            1 | first_name  | ASC       |  false  |  false
  users      | users_first_name_last_name_key |   false    |            2 | last_name   | ASC       |  false  |  false
  users      | users_first_name_last_name_key |   false    |            3 | username    | ASC       |  false  |   true
  users      | users_first_name_last_name_key |   false    |            4 | email       | ASC       |  false  |   true
  users      | users_email_key                |   false    |            1 | email       | ASC       |  false  |  false
  users      | users_email_key                |   false    |            2 | username    | ASC       |  false  |   true
(8 rows)

        table_name        |                                 create_statement
--------------------------+-----------------------------------------------------------------------------------
  movr.abbey_schema.users | CREATE TABLE abbey_schema.users (
                          |     first_name STRING NOT NULL,
                          |     last_name STRING NOT NULL,
                          |     email STRING NOT NULL,
                          |     username STRING NOT NULL,
                          |     CONSTRAINT "primary" PRIMARY KEY (username ASC, email ASC),
                          |     UNIQUE INDEX users_first_name_last_name_key (first_name ASC, last_name ASC),
                          |     UNIQUE INDEX users_email_key (email ASC),
                          |     FAMILY "primary" (first_name, last_name, email, username)
                          | )
(1 row)
~~~

Note that `users_first_name_last_name_key` is a `UNIQUE` index, which means that it implies a dependent, `UNIQUE` constraint. To [drop indexes with dependencies](drop-index.html#remove-an-index-and-dependent-objects-with-cascade), you can use the `CASCADE` keyword.

Create a new file, and add the `DROP` statement:

{% include_cached copy-clipboard.html %}
~~~ shell
$ touch drop_unique_users_idx.sql
~~~

{{site.data.alerts.callout_info}}
After creation, the notation for referring to indexes in CockroachDB is `[table_name]@[index_name]`.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~
DROP INDEX movr.abbey_schema.users@users_first_name_last_name_key CASCADE;
~~~

To drop the index, execute the file:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=abbey \
--database=movr \
-f drop_unique_users_idx.sql
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--certs-dir={certs-directory} \
--user=abbey \
--database=movr \
--execute="SHOW INDEXES FROM movr.abbey_schema.users;"
~~~

~~~
  table_name |   index_name    | non_unique | seq_in_index | column_name | direction | storing | implicit
-------------+-----------------+------------+--------------+-------------+-----------+---------+-----------
  users      | users_pkey      |   false    |            1 | username    | ASC       |  false  |  false
  users      | users_pkey      |   false    |            2 | email       | ASC       |  false  |  false
  users      | users_email_key |   false    |            1 | email       | ASC       |  false  |  false
  users      | users_email_key |   false    |            2 | username    | ASC       |  false  |   true
(4 rows)
~~~

## What's next?

- [Online Schema Changes](online-schema-changes.html)
- [Write Data](insert-data.html)
- [Read Data](query-data.html)

You might also be interested in the following pages:

- [`cockroach` Commands Overview](cockroach-commands.html)
