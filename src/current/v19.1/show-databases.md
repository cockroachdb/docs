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

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DATABASES;
~~~

~~~
+---------------+
| database_name |
+---------------+
| defaultdb     |
| postgres      |
| system        |
+---------------+
(3 rows)
~~~

## Default databases

New clusters and existing clusters [upgraded](upgrade-cockroach-version.html) to v2.1 or later will include three auto-generated databases, with the following purposes:

- The empty `defaultdb` database is used if a client does not specify a database in the [connection parameters](connection-parameters.html).

- An empty database called `postgres` is provided for compatibility with Postgres client applications that require it.

- The `system` database contains CockroachDB metadata and is read-only.

The `postgres` and `defaultdb` databases can be [deleted](drop-database.html) if they are not needed.

## See also

- [`SHOW SCHEMAS`](show-schemas.html)
- [Information Schema](information-schema.html)
- [Other SQL Statements](sql-statements.html)
