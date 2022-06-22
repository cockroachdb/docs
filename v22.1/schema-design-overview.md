---
title: Database Schemas
summary: An overview of the objects that make up a logical schema
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: develop
---

This page provides an overview of database schemas in CockroachDB.

In later **Design a Database Schema** sections, we provide best practices for designing a database schema that optimizes performance and storage resources.

## Database schema objects

The sections below provide a brief overview of the logical objects that make up a database schema in CockroachDB, for the purpose of orienting application developers.

For detailed documentation on object name resolution, see [Name Resolution](sql-name-resolution.html).

### Databases

Database objects make up the first level of the [CockroachDB naming hierarchy](sql-name-resolution.html#naming-hierarchy). They contain [schemas](#schemas).

All CockroachDB clusters include a preloaded database named `defaultdb`. Rather than using the `defaultdb` database, we recommend creating your own database.

For guidance on creating databases, see [Create a Database](schema-design-database.html).

{% include {{page.version.version}}/sql/db-terms.md %}

### Schemas

Schemas make up the second level of the naming hierarchy. Each schema belongs to a single database. Schemas contain [tables](#tables) and other objects, like [views](#views) and [sequences](#sequences).

All CockroachDB clusters include a preloaded schema named `public`. CockroachDB also supports creating your own *user-defined schema*.

For guidance on creating user-defined schemas, see [Create a User-defined Schema](schema-design-schema.html).

{% include {{page.version.version}}/sql/schema-terms.md %}

### Tables

Tables, belong to the third and lowest level of the naming hierarchy. Each table can belong to a single [user-defined schema](#schemas).

Tables contain *rows* of data. Each value in a row of data belongs to a particular *column*. Each column allows values of data of a single data type. Columns can be further qualified with [column-level constraints](constraints.html), or computed with [scalar expressions](computed-columns.html).

For guidance on defining tables, see [Tables](schema-design-table.html).

### Indexes

An index is a copy of the rows in a single table, sorted by a column or set of columns. CockroachDB queries use indexes to more efficiently find data in a table, given the values of a particular column. Each index belongs to a single table.

The two main types of indexes are the primary index, an index on the row-identifying [primary key columns](primary-key.html), and the secondary index, an index created on non-primary-key columns of your choice.

For guidance on defining primary keys, see [Select primary key columns](schema-design-table.html#select-primary-key-columns). For guidance on defining secondary indexes, see [Add a Secondary Index](schema-design-indexes.html).

#### Specialized indexes

CockroachDB supports some specialized types of indexes, designed to improve query performance in specific use cases. For guidance on specialized indexes, see the following pages:

- [Index a Subset of Rows](partial-indexes.html)
- [Index Sequential Keys](hash-sharded-indexes.html)
- [Index JSON and Array Data](inverted-indexes.html)
- [Index Expressions](expression-indexes.html)
- [Index Spatial Data](spatial-indexes.html)

### Other objects

CockroachDB supports several other objects at the third level of the naming hierarchy, including reusable [views](#views), [sequences](#sequences), and [temporary objects](#temporary-objects).

#### Views

A view is a stored and named selection query.

For guidance on using views, see [Views](views.html).

#### Sequences

Sequences create and store sequential data.

For guidance on using sequences, see [the `CREATE SEQUENCE` syntax page](create-sequence.html).

#### Temporary objects

A temporary object is an object, such as a table, view, or sequence, that is not stored to persistent memory.

For guidance on using temporary objects, see [Temporary Tables](temporary-tables.html).

## Control access to objects

CockroachDB supports both user-based and role-based access control. With roles, or with direct assignment, you can grant a [SQL user](security-reference/authorization.html#sql-users) the [privileges](security-reference/authorization.html#privileges) required to view, modify, and delete database schema objects.

By default, the user that creates an object is that object's *owner*. [Object owners](security-reference/authorization.html#object-ownership) have all privileges required to view, modify, or delete that object and the data stored within it.

For more information about ownership, privileges, and authorization, see [Authorization](authorization.html).

## Executing database schema changes

We do not recommend using client drivers or ORM frameworks to execute database schema changes. As a best practice, we recommend creating database schemas and performing database schema changes with one of the following methods:

- Use a database schema migration tool.

    CockroachDB is compatible with most PostgreSQL database schema migration tools, including [Flyway](https://flywaydb.org/) and [Liquibase](https://www.liquibase.com). For a tutorial on performing database schema changes using Liquibase, see our [Liquibase tutorial](liquibase.html). For a tutorial on performing schema changes with Flyway, see our [Flyway tutorial](flyway.html).

- Use the [CockroachDB SQL client](cockroach-sql.html#execute-sql-statements-from-a-file).

    The CockroachDB SQL client allows you to execute commands from the command line, or through the [CockroachDB SQL shell](cockroach-sql.html#sql-shell) interface. From the command line, you can pass a string to the client for execution, or you can pass a `.sql` file populated with SQL commands. From the SQL shell, you can execute SQL commands directly. Throughout the guide, we pass a `.sql` file to the SQL client to perform most database schema changes.

## Object size and scaling considerations

CockroachDB does not place hard limits on most database objects. Extremely large attributes are not supported in certain scenarios as described in this section.

### Hard limits

The following table lists specific limits imposed by CockroachDB.

| Object | Limit | Comments |
| ------ | ----- | -------- |
| Role names | 63 bytes | Other [restrictions](create-role.html#considerations) apply. |
| User names | 63 bytes | These are [equivalent](create-user.html) to role names. |
| Identifier length | 128 bytes | This limit is specified in the `max_identifier_length` variable for compatibility with other databases, but is not enforced. It may be enforced in future versions of CockroachDB, so we recommended remaining within this limit. |

### Quantity of tables and other schema objects

CockroachDB has been shown to perform well with clusters containing 2,500 tables. Greater numbers are possible, depending on the complexity of the tables (number of columns and indexes) and hardware specifications.

As you scale to a large number of tables, note that:

- The amount of RAM per node is the limiting factor for the number of tables and other schema objects the cluster can support. This includes columns, indexes, GIN indexes, constraints, and partitions. Increasing RAM is likely to have the greatest impact on the number of these objects that a cluster can support, while increasing the number of nodes will not have a substantial effect.
- The number of databases or schemas on the cluster has minimal impact on the total number of tables that it can support.

See the [Hardware](recommended-production-settings.html#hardware) section for additional recommendations based on your expected workloads.

### Quantity of rows

CockroachDB can support any number of rows by adding additional nodes and [storage](recommended-production-settings.html#storage).

## What's next?

- [Create a Database](schema-design-database.html)
- [Create a User-defined Schema](schema-design-database.html)

You might also be interested in the following pages:

- [CockroachDB naming hierarchy](sql-name-resolution.html#naming-hierarchy)
- [Authorization](authorization.html)
- [Liquibase](liquibase.html)
- [Flyway](flyway.html)
