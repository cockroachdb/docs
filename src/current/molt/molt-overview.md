---
title: MOLT Overview
summary: Learn how to use the MOLT tools to migrate to CockroachDB.
toc: true
docs_area: migrate
---

This page describes the MOLT (Migrate Off Legacy Technology) tools. For more information about migrating to CockroachDB, see [Migration Overview]({% link {{site.current_cloud_version}}/migration-overview.md %}).

The MOLT tools can be used when:

- Converting a schema for compatibility with CockroachDB.
- Loading test and production data into CockroachDB.
- Validating queries on CockroachDB.
- Performing a cutover to finalize the migration to CockroachDB.

|                        Tool                       |            Source databases           |                   Usage                   |                                      Release status                                      |
|---------------------------------------------------|---------------------------------------|-------------------------------------------|------------------------------------------------------------------------------------------|
| [Schema Conversion Tool](#schema-conversion-tool) | PostgreSQL, MySQL, Oracle, SQL Server | Schema conversion                         | GA                                                                                       |
| [Fetch](#fetch)                                   | PostgreSQL, MySQL, CockroachDB        | Initial data load; continuous replication | GA                                                                                       |
| [Verify](#verify)                                 | PostgreSQL, MySQL, CockroachDB        | Data validation                           | [Preview]({% link {{site.current_cloud_version}}/cockroachdb-feature-availability.md %}) |
| [Live Migration Service](#live-migration-service) | PostgreSQL, MySQL, CockroachDB        | Consistent cutover                        | [Preview]({% link {{site.current_cloud_version}}/cockroachdb-feature-availability.md %}) |

## Schema Conversion Tool

The [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}) [converts a source database schema]({% link {{site.current_cloud_version}}/migration-overview.md %}#convert-the-schema) to a CockroachDB-compatible schema. The supported Schema Conversion Tool sources are PostgreSQL, MySQL, Oracle, and SQL Server.

The tool will convert the syntax, identify [unimplemented features and syntax incompatibilities]({% link {{site.current_cloud_version}}/migration-overview.md %}#unimplemented-features-and-syntax-incompatibilities) in the schema, and suggest edits according to CockroachDB [best practices]({% link {{site.current_cloud_version}}/migration-overview.md %}#schema-design-best-practices).

## Fetch

[MOLT Fetch]({% link molt/molt-fetch.md %}) moves data from a source database into CockroachDB. Data can be moved via one-time bulk ingestion and continuously via streaming ingestion. The supported Fetch sources are PostgreSQL, MySQL, and CockroachDB.

You can use MOLT Fetch to [load test data]({% link {{site.current_cloud_version}}/migration-overview.md %}#load-test-data) into CockroachDB, enabling you to [test your application queries]({% link {{site.current_cloud_version}}/migration-overview.md %}#validate-queries) on CockroachDB. When you're ready to [conduct the migration]({% link {{site.current_cloud_version}}/migration-overview.md %}#conduct-the-migration) in a production environment, use MOLT Fetch to move your source data to CockroachDB. You can also enable continuous replication of any changes on the source database to CockroachDB.

## Verify

[MOLT Verify]({% link molt/molt-verify.md %}) checks for discrepancies between the source and target schemas and data. This involves verifying that table structures, column definitions, and row values match between the source and target. The supported Verify sources are PostgreSQL, MySQL, and CockroachDB.

Use MOLT Verify after loading data with [MOLT Fetch](#fetch) and when [validating queries on CockroachDB]({% link {{site.current_cloud_version}}/migration-overview.md %}#validate-queries) to confirm that the CockroachDB data matches the source.

## Live Migration Service

The [MOLT Live Migration Service (LMS)]({% link molt/live-migration-service.md %}) routes traffic between an application, a source database, and a target CockroachDB database. You use the LMS to control which database, as the "source of truth", is serving reads and writes to an application.

When you have sufficiently tested your application on CockroachDB, you use the LMS to perform a transactionally consistent [cutover]({% link {{site.current_cloud_version}}/migration-overview.md %}#cutover-strategy), thus switching the source of truth to CockroachDB. The supported LMS sources are PostgreSQL, MySQL, and CockroachDB.

## See also

- [Migration Overview]({% link {{site.current_cloud_version}}/migration-overview.md %})
- [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
- [MOLT Live Migration Service]({% link molt/live-migration-service.md %})
