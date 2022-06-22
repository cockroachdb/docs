---
title: Migration Overview
summary: Learn how to migrate data into a CockroachDB cluster.
toc: true
---

CockroachDB supports importing data from the following databases:

- MySQL
- Postgres

and from the following data formats:

- CSV/TSV

This page lists general considerations to be aware of as you plan your migration to CockroachDB.

In addition to the information listed below, see the following pages for specific instructions and considerations that apply to the database (or data format) you're migrating from:

- [Migrate from Postgres][postgres]
- [Migrate from MySQL][mysql]
- [Migrate from CSV][csv]

## File storage during import

During migration, all of the features of [`IMPORT`][import] that interact with external file storage assume that every node has the exact same view of that storage.  In other words, in order to import from a file, every node needs to have the same access to that file.

## Schema and application changes

In general, you are likely to have to make changes to your schema, and how your app interacts with the database.  We **strongly recommend testing your application against CockroachDB** to ensure that:

1. The state of your data is what you expect post-migration.
2. Performance is as expected for your application's workloads.  You may need to apply some [best practices for optimizing SQL performance in CockroachDB](performance-best-practices-overview.html).

## Data type sizes

Above a certain size, many data types such as [`STRING`](string.html)s, [`DECIMAL`](decimal.html)s, [`ARRAY`](array.html), [`BYTES`](bytes.html), and [`JSONB`](jsonb.html) may run into performance issues due to [write amplification](https://en.wikipedia.org/wiki/Write_amplification).  See each data type's documentation for its recommended size limits.

## Unsupported data types

CockroachDB does not provide `ENUM` or `SET` data types.

In Postgres, you can emulate an `ENUM` type using a [`CHECK` constraint](check.html) as shown below.  For MySQL, we perform this conversion automatically during the import.

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE orders (
    id UUID PRIMARY KEY,
    -- ...
    status STRING check (
      status='processing' or status='in-transit' or status='delivered'
    ) NOT NULL,
    -- ...
  );
~~~

## See also

- [`IMPORT`][import]
- [Migrate from CSV][csv]
- [Migrate from MySQL][mysql]
- [Migrate from Postgres][postgres]
- [Can a Postgres or MySQL application be migrated to CockroachDB?](frequently-asked-questions.html#can-a-postgresql-or-mysql-application-be-migrated-to-cockroachdb)
- [Porting from PostgreSQL](porting-postgres.html)
- [SQL Dump (Export)](sql-dump.html)
- [Back Up and Restore](backup-and-restore.html)
- [Use the Built-in SQL Client](use-the-built-in-sql-client.html)
- [Other Cockroach Commands](cockroach-commands.html)

<!-- Links -->

[postgres]: migrate-from-postgres.html
[mysql]: migrate-from-mysql.html
[csv]: migrate-from-csv.html
[import]: import.html
