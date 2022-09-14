---
title: Migrate Your Database to CockroachDB
summary: Learn how to migrate your database to a CockroachDB cluster.
toc: true
docs_area: migrate
---

This page summarizes the steps of migrating a database to CockroachDB:

1. [Test and update your schema to work with CockroachDB.](#step-1-test-and-update-your-schema)
1. [Move your data into CockroachDB.](#step-2-move-your-data-to-cockroachdb)
1. [Test and update your application.](#step-3-test-and-update-your-application)

{{site.data.alerts.callout_info}}
If you need to migrate data from a {{ site.data.products.serverless }} cluster to a {{ site.data.products.dedicated }} cluster, see [Migrate data from Serverless to Dedicated](../cockroachcloud/migrate-from-serverless-to-dedicated.html).
{{site.data.alerts.end}}

## Step 1. Test and update your schema

To begin a new migration to CockroachDB, extract the [data definition language (DDL)](sql-statements.html#data-definition-statements) of the source database. We strongly recommend migrating your database schema to a new CockroachDB database before migrating the data.

You will likely need to update your schema by converting the data definition statements to CockroachDB-compatible statements. This can be due to:

- [Unimplemented features.](#unimplemented-features)
- [Differences from other databases.](#differences-from-other-databases)

If you are migrating from a PostgreSQL database, [use the **Schema Conversion Tool**](../cockroachcloud/migrations-page.html) on the {{ site.data.products.db }} Console to analyze your schema for SQL incompatibilities. The tool will identify and help you resolve errors in your schema, and then create a new CockroachDB database to which you can [move your data](#step-2-move-your-data-to-cockroachdb).

### Unimplemented features

CockroachDB supports the [PostgreSQL wire protocol](https://www.postgresql.org/docs/current/protocol.html) and is largely compatible with PostgreSQL syntax. However, the following PostgreSQL features do not yet exist in CockroachDB:

{% include {{page.version.version}}/sql/unsupported-postgres-features.md %}

If your source database uses any of the preceding features, you may need to implement workarounds in your schema design, in your [data manipulation language (DML)](sql-statements.html#data-manipulation-statements) when [moving data to the new database](#step-2-move-your-data-to-cockroachdb), or in your [application code](#step-3-test-and-update-your-application).

For more details on the CockroachDB SQL implementation, see [SQL Feature Support](sql-feature-support.html).

### Differences from other databases

Consider the following CockroachDB attributes and best practices:

- When importing data, we recommend that you always have an explicit primary key defined on every table. For more information, see [Primary key best practices](schema-design-table.html#primary-key-best-practices).

- Instead of using a sequence to define a primary key column, we recommend that you use [multi-column primary keys](performance-best-practices-overview.html#use-multi-column-primary-keys) or the [`UUID`](uuid.html) datatype for primary key columns. For more information, see [`CREATE SEQUENCE`](create-sequence.html#considerations).

	- {% include {{page.version.version}}/performance/use-hash-sharded-indexes.md %}

- By default on CockroachDB, `INT` is an alias for `INT8`, which creates 64-bit signed integers. Depending on your source database or application requirements, you may need to change the integer size to `4`. For example, [PostgreSQL defaults to 32-bit integers](https://www.postgresql.org/docs/9.6/datatype-numeric.html). For more information, see [Considerations for 64-bit signed integers](int.html#considerations-for-64-bit-signed-integers).

For additional considerations specific to other databases and data formats, see the corresponding documentation linked in [Step 2. Move your data to CockroachDB](#step-2-move-your-data-to-cockroachdb).

## Step 2. Move your data to CockroachDB

We recommend [using AWS Database Migration Service (DMS) to migrate data](aws-dms.html) from any database to CockroachDB.

Alternatively, use `IMPORT` to [migrate CSV data](migrate-from-csv.html).

You can also migrate data from the following data formats:

- [Avro](migrate-from-avro.html)
- [ESRI Shapefiles](migrate-from-shapefiles.html) (`.shp`) (using `shp2pgsql`)
- [OpenStreetMap data files](migrate-from-openstreetmap.html) (`.pbf`) (using `osm2pgsql`)
- [GeoPackage data files](migrate-from-geopackage.html) (`.gpkg`) (using `ogr2ogr`)
- [GeoJSON data files](migrate-from-geojson.html) (`.geojson`) (using `ogr2ogr`)

{% include {{ page.version.version }}/misc/import-perf.md %}

## Step 3. Test and update your application

As the final step of migration, you will likely need to make changes to how your application interacts with the database. For example, refer to [features that differ from PostgreSQL](postgresql-compatibility.html#features-that-differ-from-postgresql).

Unless you changed the integer size when [migrating the schema](#differences-from-other-databases), your application should also be written to handle 64-bit integers. For more information, see [Considerations for 64-bit signed integers](int.html#considerations-for-64-bit-signed-integers).

We **strongly recommend testing your application against CockroachDB** to ensure that:

1. The state of your data is what you expect post-migration.
2. Performance is sufficient for your application's workloads. Follow the [SQL Performance Best Practices](performance-best-practices-overview.html) and implement [transaction retry logic](transactions.html#transaction-retries).

## See also

- [Migrations Page](../cockroachcloud/migrations-page.html)
- [Can a PostgreSQL or MySQL application be migrated to CockroachDB?](frequently-asked-questions.html#can-a-postgresql-or-mysql-application-be-migrated-to-cockroachdb)
- [PostgreSQL Compatibility](postgresql-compatibility.html)
- [Create a Database](schema-design-database.html)
- [Create a User-defined Schema](schema-design-schema.html)
- [Back Up and Restore](take-full-and-incremental-backups.html)