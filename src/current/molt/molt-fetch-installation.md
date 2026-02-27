---
title: MOLT Fetch Installation
summary: Learn how to install MOLT Fetch and configure prerequisites for data migration.
toc: true
docs_area: migrate
---

This page explains the prequisites for using [MOLT Fetch]({% link molt/molt-fetch.md %}) and then describes how to install it.

## Prerequisites

### Supported databases

The following source databases are supported:

- PostgreSQL 11-16
- MySQL 5.7, 8.0 and later
- Oracle Database 19c (Enterprise Edition) and 21c (Express Edition)

### Database configuration

Ensure that the source and target schemas are identical, unless you enable automatic schema creation with the [`drop-on-target-and-recreate`]({% link molt/molt-fetch.md %}#handle-target-tables) option. If you are creating the target schema manually, review the behaviors in [Mismatch handling]({% link molt/molt-fetch.md %}#mismatch-handling).

{{site.data.alerts.callout_info}}
MOLT Fetch does not support migrating sequences. If your source database contains sequences, refer to the [guidance on indexing with sequential keys]({% link {{site.current_cloud_version}}/sql-faqs.md %}#how-do-i-generate-unique-slowly-increasing-sequential-numbers-in-cockroachdb). If a sequential key is necessary in your CockroachDB table, you must create it manually. After using MOLT Fetch to load the data onto the target, but before cutover, make sure to update each sequence's current value using [`setval()`]({% link {{site.current_cloud_version}}/functions-and-operators.md %}#sequence-functions) so that new inserts continue from the correct point.
{{site.data.alerts.end}}

If you plan to use cloud storage for the data migration, follow [Cloud storage security]({% link molt/molt-fetch-best-practices.md %}#cloud-storage-security) best practices.

### User permissions

The SQL user running MOLT Fetch requires specific privileges on both the source and target databases:

|      Database      |                                                                                                                                                           Required Privileges                                                                                                                                                            |                                                           Examples                                                            |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| PostgreSQL source  | <ul><li>`CONNECT` on database.</li><li>`USAGE` on schema.</li><li>`SELECT` on tables to migrate.</li></ul>                                                                                                                                                                                                                               | [Create PostgreSQL migration user]({% link molt/classic-bulk-load-postgres.md %}#create-migration-user-on-source-database)            |
| MySQL source       | <ul><li>`SELECT` on tables to migrate.</li></ul>                                                                                                                                                                                                                                                                                         | [Create MySQL migration user]({% link molt/classic-bulk-load-mysql.md %}?#create-migration-user-on-source-database)   |
| Oracle source      | <ul><li>`CONNECT` and `CREATE SESSION`.</li><li>`SELECT` and `FLASHBACK` on tables to migrate.</li><li>`SELECT` on metadata views (`ALL_USERS`, `DBA_USERS`, `DBA_OBJECTS`, `DBA_SYNONYMS`, `DBA_TABLES`).</li></ul>                                                                                                                     | [Create Oracle migration user]({% link molt/classic-bulk-load-oracle.md %}#create-migration-user-on-source-database) |
| CockroachDB target | <ul><li>`ALL` on target database.</li><li>`CREATE` on schema.</li><li>`SELECT`, `INSERT`, `UPDATE`, `DELETE` on target tables.</li><li>For `IMPORT INTO`: `SELECT`, `INSERT`, `DROP` on target tables. Optionally `EXTERNALIOIMPLICITACCESS` for implicit cloud storage authentication.</li><li>For `COPY FROM`: `admin` role.</li></ul> | [Create CockroachDB user]({% link molt/classic-bulk-load-postgres.md %}#create-the-sql-user)                                          |

## Installation

{% include molt/molt-install.md %}

### Docker usage

{% include molt/molt-docker.md %}

## See also

- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Fetch Commands and Flags]({% link molt/molt-fetch-commands-and-flags.md %})
- [MOLT Fetch Best Practices]({% link molt/molt-fetch-best-practices.md %})
- [Migration Overview]({% link molt/migration-overview.md %})
