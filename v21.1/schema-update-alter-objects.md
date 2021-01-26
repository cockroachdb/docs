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

For example, to change the name of an existing database, use `ALTER DATABASE oldname RENAME TO newname`.

For best practices and examples for each object, see the following sections:

- [Alter a database](#alter-a-database)
- [Alter a user-defined schema](#alter-a-user-defined-schema)
- [Alter a table](#alter-a-table)
- [Alter an index](#alter-an-index)
- [Alter other objects](#alter-other-objects)

## Alter a database

To alter a database, use the `ALTER DATABASE` statement.

### Best practices for altering databases

## Alter a user-defined schema

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