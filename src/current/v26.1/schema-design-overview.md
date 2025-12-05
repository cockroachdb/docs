---
title: Database Schemas
summary: An overview of the objects that make up a logical schema
toc: true
keywords: gin, gin index, gin indexes, inverted index, inverted indexes, accelerated index, accelerated indexes
docs_area: develop
---

This page provides an overview of database schemas in CockroachDB.

The follow-up pages listed in [What's next](#whats-next) provide best practices for designing a database schema that optimizes performance and storage resources.

## Database schema objects

The following sections provide a brief overview of the logical objects that make up a database schema in CockroachDB.

For detailed documentation on object name resolution, see [Name Resolution]({% link {{ page.version.version }}/sql-name-resolution.md %}).

### Databases

Database objects make up the first level of the [CockroachDB naming hierarchy]({% link {{ page.version.version }}/sql-name-resolution.md %}#naming-hierarchy). They contain [schemas](#schemas).

All CockroachDB clusters include a preloaded database named `defaultdb`. Rather than using the `defaultdb` database, we recommend creating your own database.

For guidance on creating databases, see [Create a Database]({% link {{ page.version.version }}/schema-design-database.md %}).

{% include {{page.version.version}}/sql/db-terms.md %}

### Schemas

Schemas make up the second level of the naming hierarchy. Each schema belongs to a single database. Schemas contain [tables](#tables) and other objects, like [views](#views) and [sequences](#sequences).

All CockroachDB clusters include a preloaded schema named `public`. CockroachDB also supports creating your own *user-defined schema*.

For guidance on creating user-defined schemas, see [Create a User-defined Schema]({% link {{ page.version.version }}/schema-design-schema.md %}).

{% include {{page.version.version}}/sql/schema-terms.md %}

### Tables

Tables belong to the third and lowest level of the naming hierarchy. Each table can belong to a single [schema](#schemas).

Tables contain *rows* of data. Each value in a row of data belongs to a particular *column*. Each column allows values of data of a single data type. Columns can be further qualified with [column-level constraints]({% link {{ page.version.version }}/constraints.md %}), or computed with [scalar expressions]({% link {{ page.version.version }}/computed-columns.md %}).

For guidance on defining tables, see [Tables]({% link {{ page.version.version }}/schema-design-table.md %}).

### Indexes

An _index_ is a copy of the rows in a single table, sorted by a column or set of columns. CockroachDB queries use indexes to find data more efficiently in a table, given the values of a particular column. Each index belongs to a single table.

The two main types of indexes are the primary index, an index on the row-identifying [primary key columns]({% link {{ page.version.version }}/primary-key.md %}), and the secondary index, an index created on non-primary-key columns of your choice.

For guidance on defining primary keys, see [Select primary key columns]({% link {{ page.version.version }}/schema-design-table.md %}#select-primary-key-columns). For guidance on defining secondary indexes, see [Secondary Indexes]({% link {{ page.version.version }}/schema-design-indexes.md %}).

#### Specialized indexes

CockroachDB supports some specialized types of indexes, designed to improve query performance in specific use cases. For guidance on specialized indexes, see the following pages:

- [Index a Subset of Rows]({% link {{ page.version.version }}/partial-indexes.md %})
- [Index Sequential Keys]({% link {{ page.version.version }}/hash-sharded-indexes.md %})
- [Index JSON and Array Data]({% link {{ page.version.version }}/inverted-indexes.md %})
- [Index Expressions]({% link {{ page.version.version }}/expression-indexes.md %})
- [Index Spatial Data]({% link {{ page.version.version }}/spatial-indexes.md %})

### Other objects

CockroachDB supports several other objects at the third level of the naming hierarchy, including reusable [views](#views), [sequences](#sequences), and [temporary objects](#temporary-objects).

#### Views

A _view_ is a stored and named selection query.

For guidance on using views, see [Views]({% link {{ page.version.version }}/views.md %}).

#### Sequences

A _sequence_ creates and stores sequential data.

For guidance on using sequences, see [the `CREATE SEQUENCE` syntax page]({% link {{ page.version.version }}/create-sequence.md %}).

#### Temporary objects

A _temporary object_ is an object, such as a table, view, or sequence, that is not stored to persistent memory.

For guidance on using temporary objects, see [Temporary Tables]({% link {{ page.version.version }}/temporary-tables.md %}).

## Control access to objects

CockroachDB supports both user-based and role-based access control. With roles, or with direct assignment, you can grant a [SQL user]({% link {{ page.version.version }}/security-reference/authorization.md %}#sql-users) the [privileges]({% link {{ page.version.version }}/security-reference/authorization.md %}#privileges) required to view, modify, and delete database schema objects.

By default, the user that creates an object is that object's *owner*. [Object owners]({% link {{ page.version.version }}/security-reference/authorization.md %}#object-ownership) have all privileges required to view, modify, or delete that object and the data stored within it.

For more information about ownership, privileges, and authorization, see [Authorization]({% link {{ page.version.version }}/authorization.md %}).

## Executing database schema changes

We do not recommend using client drivers or ORM frameworks to execute database schema changes. As a best practice, we recommend creating database schemas and performing database schema changes with one of the following methods:

- Use a database schema migration tool.

    CockroachDB is compatible with most PostgreSQL database schema migration tools, including [Flyway](https://flywaydb.org/) and [Liquibase](https://www.liquibase.com). For a tutorial on performing database schema changes using Liquibase, see our [Liquibase tutorial]({% link {{ page.version.version }}/liquibase.md %}). For a tutorial on performing schema changes with Flyway, see our [Flyway tutorial]({% link {{ page.version.version }}/flyway.md %}).

- Use the [CockroachDB SQL client]({% link {{ page.version.version }}/cockroach-sql.md %}#execute-sql-statements-from-a-file).

    The CockroachDB SQL client allows you to execute commands from the command line, or through the [CockroachDB SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}#sql-shell) interface. From the command line, you can pass a string to the client for execution, or you can pass a `.sql` file populated with SQL commands. From the SQL shell, you can execute SQL commands directly. Throughout the guide, we pass a `.sql` file to the SQL client to perform most database schema changes.

## Object size and scaling considerations

CockroachDB does not place hard limits on most database objects. Extremely large attributes are not supported in certain scenarios as described in this section.

### Hard limits

The following table lists specific limits imposed by CockroachDB.

| Object | Limit | Comments |
| ------ | ----- | -------- |
| Role names | 63 bytes | Other [restrictions]({% link {{ page.version.version }}/create-role.md %}#considerations) apply. |
| User names | 63 bytes | These are [equivalent]({% link {{ page.version.version }}/create-user.md %}) to role names. |
| Identifier length | 128 bytes | This limit is specified in the `max_identifier_length` variable for compatibility with other databases, but is not enforced. It may be enforced in future versions of CockroachDB, so we recommended remaining within this limit. |

### Quantity of tables and other schema objects

CockroachDB has been shown to perform well with clusters containing 10,000 tables. Greater numbers are possible, depending on the complexity of the tables (number of columns and indexes) and hardware specifications.

As you scale to a large number of tables, note that:

- The cluster setting [`sql.schema.approx_max_object_count`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-schema-approx-max-object-count) defaults to `20000` and blocks creation of new schema objects once the approximate count exceeds the limit. The check relies on cached [table statistics]({% link {{ page.version.version }}/cost-based-optimizer.md %}#table-statistics), so enforcement can lag until statistics refresh.
- Other than the value of the `sql.schema.approx_max_object_count` cluster setting, the amount of RAM per node is the limiting factor for the number of tables and other schema objects the cluster can support. This includes columns, [indexes]({% link {{ page.version.version }}/indexes.md %}), [GIN indexes]({% link {{ page.version.version }}/inverted-indexes.md %}), [constraints]({% link {{ page.version.version }}/constraints.md %}), and [partitions]({% link {{ page.version.version }}/partitioning.md %}). Increasing RAM is likely to have the greatest impact on the number of these objects that a cluster can support, while increasing the number of nodes will not have a substantial effect.
- The number of databases or schemas on the cluster has minimal impact on the total number of tables that it can support.
- Performance at larger numbers of tables may be affected by your use of [backup and restore]({% link {{ page.version.version }}/backup-and-restore-overview.md %}) and [Change data capture (CDC)]({% link {{ page.version.version }}/change-data-capture-overview.md %}).

If you upgrade to this version with an existing object count above the limit set by [`sql.schema.approx_max_object_count`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-schema-approx-max-object-count), the upgrade will complete, but future attempts to create schema objects will return an error until you raise or disable the limit:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Raise the limit
SET CLUSTER SETTING sql.schema.approx_max_object_count = 50000;

-- Or disable the limit
SET CLUSTER SETTING sql.schema.approx_max_object_count = 0;
~~~

See the [Hardware]({% link {{ page.version.version }}/recommended-production-settings.md %}#hardware) section for additional recommendations based on your expected workloads.

### Quantity of rows

CockroachDB can support any number of rows by adding additional nodes and [storage]({% link {{ page.version.version }}/recommended-production-settings.md %}#storage).

## What's next?

- [Create a Database]({% link {{ page.version.version }}/schema-design-database.md %})
- [Create a User-defined Schema]({% link {{ page.version.version }}/schema-design-database.md %})

You might also be interested in the following pages:

- [CockroachDB naming hierarchy]({% link {{ page.version.version }}/sql-name-resolution.md %}#naming-hierarchy)
- [Authorization]({% link {{ page.version.version }}/authorization.md %})
- [Liquibase]({% link {{ page.version.version }}/liquibase.md %})
- [Flyway]({% link {{ page.version.version }}/flyway.md %})
