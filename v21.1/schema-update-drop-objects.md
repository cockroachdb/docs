---
title: Drop Objects from a Database Schema
summary: Remove a database object from a schema
toc: true
---

This page provides best-practice guidance on dropping existing objects from a database schema, with some simple examples based on Cockroach Labs' fictional vehicle-sharing company, [MovR](movr.html).

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

## Dropping existing objects

To drop an existing object from a database schema, use the `DROP` statement that corresponds to that object.

`DROP` statements typically take the following form:

~~~
DROP [object_type] [object_name];
~~~

For best practices and examples for each object, see the following sections:

- [Drop a database](#alter-a-database)
- [Drop a user-defined schema](#alter-a-user-defined-schema)
- [Drop a table](#alter-a-table)
- [Alter an index](#alter-an-index)
- [Alter other objects](#alter-other-objects)

## Drop a database

To alter a database, use the `ALTER DATABASE` statement.

### Best practices for dropping databases

## Drop a user-defined schema

### Best practices for dropping schemas

## Drop a table

### Best practices for dropping tables

## Drop an index

### Best practices for dropping indexes

## Drop other objects

### Best practices for dropping other objects

## See also

- [`DROP DATABASE`](drop-database.html)
- [`DROP INDEX`][drop-index]
- [`DROP SEQUENCE`](drop-sequence.html)
- [`DROP TABLE`](drop-table.html)
- [`DROP VIEW`](drop-view.html)