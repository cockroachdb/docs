---
title: Data Transformation Strategy
summary: Learn about the different approaches to applying data transformations during a migration and how to choose the right strategy for your use case.
toc: true
docs_area: migrate
---

Data transformations are applied to data as it moves from the source to the target. Transformations ensure that the data is compatible, consistent, and valuable in the destination. They are a key part of a migration to CockroachDB. When planning a migration, it's important to determine **what** transformations are necessary and **where** they need to occur.

This page explains the types of transformations to expect, where they can be applied, and how these choices shape your use of MOLT tooling.

## Common transformation types

If the source and target schemas are not identical, some sort of transformation is likely to be necessary during a migration. The set of necessary transformations will depend on the differences between your source database schema and your target CockroachDB schema, as well as any data quality or formatting requirements for your application.

- **Type mapping**: Align source types with CockroachDB types, especially for dialect-specific types.
- **Format conversion**: Change the format or encoding of certain value to align with the target schema (for example, `2024-03-01T00:00:00Z` to `03/01/2024`).
- **Field renaming**: Rename fields to fit target schemas or conventions.
- **Primary key strategy**: Replace source sequences or auto-increment patterns with CockroachDB-friendly IDs (UUIDs, sequences).
- **Table reshaping**: Consolidate partitioned tables, rename tables, or retarget to different schemas.
- **Column changes**: Exclude deprecated columns, or map computed columns.
- **Row filtering**: Move only a subset of rows by tenant, region, or timeframe.
- **Null/default handling**: Replace, remove, or infer missing values.
- **Constraints and indexes**: Drop non-primary-key constraints and secondary indexes before bulk load for performance, then recreate after.

## Where to transform

Transformations can occur in the source database, in the target database, or in flight (between the source and the target). Deciding where to perform the transformations is largely determined by technical constraints, including the mutability of the source database and the choice of tooling.

#### Transform in the source database

Apply transformations directly on the source database before migrating data. This is only possible if the source database can be modified to accommodate the transformations suited for the target database.

This provides the advantage of allowing ample time, before the downtime window, to perform the transformations, but it often is not possible due to technical constraints.

#### Transform in the target database

Apply transformations in the CockroachDB cluster after data has been loaded. For any transformations that occur in the target cluster, it's recommended that these occur before cutover, to ensure that live data complies with CockroachDB best practices. Transformations that occur before cutover may extend downtime.

#### Transform in flight

Apply transformations within the migration pipeline, between the source and target databases. This allows the source database to remain as it is, and it allows the target database to be designed using CockroachDB best practices. It also enables testability by separating transformations from either database.

However, in-flight transformations may require more complex tooling. Transformation in-flight is largely supported by the [MOLT toolkit](#molt-toolkit-support).

## Decision framework

Use these questions to guide your transformation strategy:

- **What is your downtime tolerance?** Near-zero downtime pushes you toward in-flight transforms that apply consistently to bulk and streaming loads.
- **Will transformation logic be reused post-cutover?** If you need ongoing sync or failback, prefer deterministic, version-controlled in-flight transformations.
- **How complex are the transformations?** Simple schema reshaping favors MOLT Fetch transformations or target DDL. Complex value normalization or routing favors in-flight userscripts.
- **Can you modify the source database?** Source-side transformations require permission and capacity to create views, staging tables, or run transformation queries.

## MOLT toolkit support

The MOLT toolkit provides functionality for implementing transformations at each stage of the migration pipeline.

### MOLT Schema Conversion Tool

While not a part of the transformation process itself, the [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}) automates the creation of the target database schema based on the schema of the source database. This reduces downstream transformation pressure by addressing DDL incompatibilities upfront.

### MOLT Fetch

[MOLT Fetch]({% link molt/molt-fetch.md %}) supports transformations during a bulk data load:

- **Row filtering**: [`--filter-path`]({% link molt/molt-fetch-commands-and-flags.md %}#filter-path) specifies a JSON file with table-to-SQL-predicate mappings evaluated in the source dialect before export. Ensure filtered columns are indexed for performance.
- **Schema shaping**: [`--transformations-file`]({% link molt/molt-fetch-commands-and-flags.md %}#transformations-file) defines table renames, n→1 merges (consolidate partitioned tables), and column exclusions. For n→1 merges, use [`--use-copy`]({% link molt/molt-fetch-commands-and-flags.md %}#use-copy) or [`--direct-copy`]({% link molt/molt-fetch-commands-and-flags.md %}#direct-copy) and pre-create the target table.
- **Type alignment**: [`--type-map-file`]({% link molt/molt-fetch-commands-and-flags.md %}#type-map-file) specifies explicit type mappings when auto-creating target tables.
- **Table lifecycle**: [`--table-handling`]({% link molt/molt-fetch-commands-and-flags.md %}#table-handling) controls whether to truncate, drop-and-recreate, or assume tables exist.

### MOLT Replicator

[MOLT Replicator]({% link molt/molt-replicator.md %}) uses TypeScript [userscripts]({% link molt/userscript-overview.md %}) to implement in-flight transformations for continuous replication. Common use cases include:

- [Renaming tables]({% link molt/userscript-cookbook.md %}#rename-tables): Map source table names to different names on the target.
- [Renaming columns]({% link molt/userscript-cookbook.md %}#rename-columns): Map source column names to different names on the target.
- [Row filtering]({% link molt/userscript-cookbook.md %}#select-data-to-replicate): Filter out specific rows based on conditions, such as excluding soft-deleted records or test data.
- [Table filtering]({% link molt/userscript-cookbook.md %}#filter-multiple-tables): Exclude specific tables from replication.
- [Column filtering]({% link molt/userscript-cookbook.md %}#filter-columns): Remove sensitive or unnecessary columns from replicated data.
- [Data transformation]({% link molt/userscript-cookbook.md %}#compute-new-columns): Transform column values, compute new columns, or change data types during replication.
- [Table partitioning]({% link molt/userscript-cookbook.md %}#route-table-partitions): Distribute rows from a single source table across multiple target tables based on partitioning rules.

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Considerations]({% link molt/migration-considerations.md %})
- [Migration Granularity]({% link molt/migration-considerations-granularity.md %})
- [Continuous Replication]({% link molt/migration-considerations-replication.md %})
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Replicator]({% link molt/molt-replicator.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
