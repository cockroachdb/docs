---
title: SHOW DATABASES
summary: The SHOW DATABASES statement lists all database in the CockroachDB cluster.
keywords: reflection
toc: true
---

The `SHOW DATABASES` [statement](sql-statements.html) lists all databases in the CockroachDB cluster.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/show_databases.html %}
</div>

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to list the databases in the CockroachDB cluster.

## Example

### Show databases

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
  database_name
+---------------+
  defaultdb
  movr
  postgres
  startrek
  system
(5 rows)
~~~

Alternatively, within the built-in SQL shell, you can use the `\l` [shell command](cockroach-sql.html#commands) to list all databases:

{% include copy-clipboard.html %}
~~~ sql
> \l
~~~

~~~
  database_name
+---------------+
  defaultdb
  movr
  postgres
  startrek
  system
(5 rows)
~~~

### Show databases with comments

You can use [`COMMENT ON`](comment-on.html) to add comments on a database.

{% include copy-clipboard.html %}
~~~ sql
> COMMENT ON DATABASE movr IS 'This database holds information about users, vehicles, and rides.';
~~~

To view a database's comments:

{% include copy-clipboard.html %}
~~~ sql
> SHOW DATABASES WITH COMMENT;
~~~

~~~
  database_name |                              comment
+---------------+-------------------------------------------------------------------+
  defaultdb     | NULL
  movr          | This database holds information about users, vehicles, and rides.
  postgres      | NULL
  startrek      | NULL
  system        | NULL
(5 rows)
~~~

For more information, see [`COMMENT ON`](comment-on.html).

## Preloaded databases

New clusters and existing clusters [upgraded](upgrade-cockroach-version.html) to v2.1 or later will include three auto-generated databases, with the following purposes:

- The empty `defaultdb` database is used if a client does not specify a database in the [connection parameters](connection-parameters.html).

- The `movr` database contains data about users, vehicles, and rides for the vehicle-sharing app [MovR](movr.html).

- An empty database called `postgres` is provided for compatibility with Postgres client applications that require it.

- The `startrek` database contains quotes from episodes.

- The `system` database contains CockroachDB metadata and is read-only.

The `postgres` and `defaultdb` databases can be [deleted](drop-database.html) if they are not needed.

## See also

- [`COMMENT ON`](comment-on.html)
- [`SHOW SCHEMAS`](show-schemas.html)
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
