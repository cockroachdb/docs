---
title: Migrate Your Database to CockroachDB
summary: Learn how to migrate your database to a CockroachDB cluster.
toc: true
docs_area: migrate
---

This page summarizes the steps of migrating a database to CockroachDB:

1. [Convert your schema to work with CockroachDB.](#step-1-convert-your-schema)
1. [Move your data into CockroachDB.](#step-2-move-your-data-to-cockroachdb)
1. [Test and update your application.](#step-3-test-and-update-your-application)
{% comment %}
1. Cutover to production.
{% endcomment %}

The following MOLT (Migrate Off Legacy Technology) tools simplify migration:

- [Schema Conversion Tool](../cockroachcloud/migrations-page.html).
- Support for [AWS DMS](aws-dms.html).

{{site.data.alerts.callout_info}}
If you need to migrate data from a {{ site.data.products.serverless }} cluster to a {{ site.data.products.dedicated }} cluster, see [Migrate data from Serverless to Dedicated](../cockroachcloud/migrate-from-serverless-to-dedicated.html).
{{site.data.alerts.end}}

## Step 1. Convert your schema

To begin a new migration to CockroachDB, convert your database schema to an equivalent CockroachDB schema.

1. Use the source database's tooling to extract the [data definition language (DDL)](sql-statements.html#data-definition-statements) to a `.sql` file.
1. Upload the `.sql` file to the [**Schema Conversion Tool**](../cockroachcloud/migrations-page.html) on the {{ site.data.products.db }} Console. The tool will convert the syntax, identify [unimplemented features](#unimplemented-features) in the schema, and suggest edits according to CockroachDB [best practices](#schema-design-best-practices).
	{{site.data.alerts.callout_info}}
	The Schema Conversion Tool currently accepts `.sql` files from PostgreSQL, MySQL, Oracle, and Microsoft SQL Server.
	{{site.data.alerts.end}}

1. The Schema Conversion Tool automatically creates a new {{ site.data.products.serverless }} database with the converted schema. {% include cockroachcloud/migration/sct-self-hosted.md %}
1. [Move your data](#step-2-move-your-data-to-cockroachdb) to the new database.

### Schema design best practices

Consider the following CockroachDB attributes and best practices:

- We recommend that you always have an explicit primary key defined on every table. For more information, see [Primary key best practices](schema-design-table.html#primary-key-best-practices).

- Instead of using a sequence to define a primary key column, we recommend that you use [multi-column primary keys](performance-best-practices-overview.html#use-multi-column-primary-keys) or [auto-generating unique IDs](sql-faqs.html#how-do-i-auto-generate-unique-row-ids-in-cockroachdb) for primary key columns. For more information, see [`CREATE SEQUENCE`](create-sequence.html#considerations).

	- {% include {{page.version.version}}/performance/use-hash-sharded-indexes.md %}

- By default on CockroachDB, `INT` is an alias for `INT8`, which creates 64-bit signed integers. Depending on your source database or application requirements, you may need to change the integer size to `4`. For example, [PostgreSQL defaults to 32-bit integers](https://www.postgresql.org/docs/9.6/datatype-numeric.html). For more information, see [Considerations for 64-bit signed integers](int.html#considerations-for-64-bit-signed-integers).

For additional considerations specific to other databases and data formats, see the corresponding documentation linked in [Step 2. Move your data to CockroachDB](#step-2-move-your-data-to-cockroachdb).

### Unimplemented features

CockroachDB supports the [PostgreSQL wire protocol](https://www.postgresql.org/docs/current/protocol.html) and is largely compatible with PostgreSQL syntax. However, the following PostgreSQL features do not yet exist in CockroachDB:

{% include {{page.version.version}}/sql/unsupported-postgres-features.md %}

If your source database uses any of the preceding features, you may need to implement workarounds in your schema design, in your [data manipulation language (DML)](sql-statements.html#data-manipulation-statements) when [moving data to the new database](#step-2-move-your-data-to-cockroachdb), or in your [application code](#step-3-test-and-update-your-application).

For more details on the CockroachDB SQL implementation, see [SQL Feature Support](sql-feature-support.html).

## Step 2. Move your data to CockroachDB

To migrate data from another database to CockroachDB, use the source database's tooling to extract the data to a `.sql` file. Then use one of the following methods to migrate the data:

- Use [AWS Database Migration Service (DMS)](aws-dms.html) to migrate data from any database, such as PostgreSQL, MySQL, or Oracle, to CockroachDB. This option is recommended for near-zero downtime migrations of large data sets, either with ongoing replication or as a one-time migration of a snapshot.
- Use [`COPY FROM`](copy-from.html) to copy the data to your CockroachDB tables. This option behaves identically to the PostgreSQL syntax and is recommended if your tables must remain **online** and accessible during a migration or continuous bulk ingestion of data. However, it is slower than using [`IMPORT INTO`](import-into.html) because the statements are executed through a single node on the cluster. 
- Use [`IMPORT INTO`](import-into.html) to migrate [CSV](migrate-from-csv.html) or [Avro](migrate-from-avro) data into pre-existing tables. This option is recommended if you can tolerate your tables being **offline**, such as during an initial migration to CockroachDB. It is faster than using [`COPY FROM`](copy-from.html) because the statements are distributed across multiple nodes.
	{% include {{ page.version.version }}/misc/import-perf.md %}

## Step 3. Test and update your application

As the final step of migration, you will likely need to make changes to how your application interacts with the database. For example, refer to [features that differ from PostgreSQL](postgresql-compatibility.html#features-that-differ-from-postgresql).

Unless you changed the integer size when [migrating the schema](#schema-design-best-practices), your application should also be written to handle 64-bit integers. For more information, see [Considerations for 64-bit signed integers](int.html#considerations-for-64-bit-signed-integers).

We **strongly recommend testing your application against CockroachDB** to ensure that:

1. The state of your data is what you expect post-migration.
1. Performance is sufficient for your application's workloads. Follow the [SQL Performance Best Practices](performance-best-practices-overview.html) and implement [transaction retry logic](transactions.html#transaction-retries).

## See also

- [Migrations Page](../cockroachcloud/migrations-page.html)
- [Can a PostgreSQL or MySQL application be migrated to CockroachDB?](frequently-asked-questions.html#can-a-postgresql-or-mysql-application-be-migrated-to-cockroachdb)
- [PostgreSQL Compatibility](postgresql-compatibility.html)
- [Schema Design Overview](schema-design-overview.html)
- [Create a Database](schema-design-database.html)
- [Create a User-defined Schema](schema-design-schema.html)
- [Back Up and Restore](take-full-and-incremental-backups.html)