---
title: MOLT Overview
summary: Learn how to use the MOLT tools to migrate to CockroachDB.
toc: true
docs_area: migrate
---

This page describes the MOLT (Migrate Off Legacy Technology) tools. For instructions on migrating to CockroachDB, refer to [Migrate to CockroachDB]({% link {{ site.current_cloud_version }}/migrate-to-cockroachdb.md %}).

Use the MOLT tools to:

- Convert a schema for compatibility with CockroachDB.
- Load test and production data into CockroachDB.
- Validate queries on CockroachDB.

## MOLT tools

<img src="{{ 'images/molt/molt_tools.svg' | relative_url }}" alt="MOLT tooling overview" style="max-width:100%" />

|                        Tool                       |                   Usage                   |           Supported sources           |                                       Release status                                       |
|---------------------------------------------------|-------------------------------------------|---------------------------------------|--------------------------------------------------------------------------------------------|
| [Schema Conversion Tool](#schema-conversion-tool) | Schema conversion                         | PostgreSQL, MySQL, Oracle, SQL Server | GA                                                                                         |
| [Fetch](#fetch)                                   | Initial data load; continuous replication | PostgreSQL, MySQL, CockroachDB        | GA                                                                                         |
| [Verify](#verify)                                 | Data validation                           | PostgreSQL, MySQL, CockroachDB        | [Preview]({% link {{ site.current_cloud_version }}/cockroachdb-feature-availability.md %}) |

### Schema Conversion Tool

The [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}) converts a source database schema to a CockroachDB-compatible schema. The supported Schema Conversion Tool sources are PostgreSQL, MySQL, Oracle, and SQL Server.

The tool will convert [data definition (DDL) syntax]({% link {{ site.current_cloud_version }}/sql-statements.md %}#data-definition-statements) (excluding destructive statements such as `DROP`), identify [unimplemented features and syntax incompatibilities]({% link {{ site.current_cloud_version }}/migration-overview.md %}#unimplemented-features-and-syntax-incompatibilities) in the schema, and suggest edits according to CockroachDB [best practices]({% link {{ site.current_cloud_version }}/migration-overview.md %}#schema-design-best-practices).

### Fetch

[MOLT Fetch]({% link molt/molt-fetch.md %}) moves data from a source database into CockroachDB. Data is moved via one-time bulk ingestion, which is optionally followed by continuously streaming replication. The supported Fetch sources are PostgreSQL, MySQL, and CockroachDB.

You can use MOLT Fetch to [load test data]({% link {{ site.current_cloud_version }}/migration-overview.md %}#load-test-data) into CockroachDB, enabling you to [test your application queries]({% link {{ site.current_cloud_version }}/migration-overview.md %}#validate-queries) on CockroachDB. When you're ready to [conduct the migration]({% link {{ site.current_cloud_version }}/migration-overview.md %}#conduct-the-migration) in a production environment, use MOLT Fetch to move your source data to CockroachDB. You can also enable continuous replication of any changes on the source database to CockroachDB.

### Verify

[MOLT Verify]({% link molt/molt-verify.md %}) checks for discrepancies between the source and target schemas and data. It verifies that table structures, column definitions, and row values match between the source and target. The supported Verify sources are PostgreSQL, MySQL, and CockroachDB.

Use MOLT Verify after loading data with [MOLT Fetch](#fetch) to confirm that the CockroachDB data matches the source.

## See also

- [Migration Overview]({% link {{ site.current_cloud_version }}/migration-overview.md %})
- [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})