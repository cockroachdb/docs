---
title: Alter Objects in a Database Schema
summary: Modify a database object in a schema
toc: true
---

This page provides best-practice guidance on changing existing objects in a database schema, with some simple examples based on Cockroach Labs' fictional vehicle-sharing company, [MovR](movr.html).

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
  <li>
    <a href="schema-design-schema.html">Create a user-defined schema.</a>
  </li>
  <li>
    <a href="schema-design-table.html">Create some tables.</a>
  </li>
  <li>
    <a href="schema-design-table.html">Create some indexes.</a>
  </li>
</ul>

## Changing existing objects

To change an existing object in a database schema, use the `ALTER` statement that corresponds to that object and the substatement that corresponds to the change that you would like to make to that object.

For example, to change the name of an existing database, use `ALTER DATABASE ... RENAME TO ...`.

For best practices and examples for each object, see the following sections:

- [Alter a database](#alter-a-database)
- [Alter a user-defined schema](#alter-a-user-defined-schema)
- [Alter a table](#alter-a-table)
- [Alter an index](#alter-an-index)
- [Alter other objects](#alter-other-objects)

### Database schema change best practices

Because you've already initialized the database schema with the `dbinit.sql` file, it's best to create a separate file, for your new database schema changes.

In Liquibase, these 

## Alter a database

To alter a database, use the `ALTER DATABASE` statement.

For a list of the supported `ALTER DATABASE` subcommands, see [`ALTER DATABASE` syntax page](alter-database.html).

For reference documentation on each `ALTER DATABASE` subcommands, including examples, see the syntax page for each [`ALTER DATABASE` subcommand](alter-database.html#subcommands).

Suppose you want to rename the database `movr` to something a little more specific, like `movr_database`.


## Alter a user-defined schema

To alter a user-defined schema, use the `ALTER SCHEMA` statement.

For a full list of  `ALTER SCHEMA` statement, including additional examples, see the [`ALTER SCHEMA` syntax page](alter-schema.html).

### Best practices for altering schemas

## Alter a table

### Best practices for altering tables

## Alter an index

### Best practices for altering indexes



## See also

- [`ALTER DATABASE`](alter-database.html)
- [`ALTER SCHEMA`](alter-schema.html)
- [`ALTER TABLE`][alter-table]
- [`ALTER INDEX`](alter-index.html)
- [`ALTER RANGE`](alter-range.html)
- [`ALTER SEQUENCE`](alter-sequence.html)
- [`ALTER VIEW`](alter-view.html)
- [`ALTER TYPE`](alter-type.html)