---
title: Data Transformation Strategy
summary: Learn about the different approaches to applying data transformations during a migration and how to choose the right strategy for your use case.
toc: true
docs_area: migrate
---

Most migrations require some level of data transformation—whether schema conversion, type mapping, row filtering, or value normalization. The key decision is **where** these transformations occur: on the source database, in flight during the migration pipeline, or on the target CockroachDB cluster. Each approach has distinct trade-offs in terms of performance, operational complexity, and downtime tolerance.

This page explains the types of transformations to expect, where they can be applied, and how these choices shape your use of MOLT tooling.

In general:

- Choose **source-side transformations** when you want to minimize data volume across the network, or when transformations are straightforward to express in SQL.

- Choose **in-flight transformations** for minimal-downtime migrations where the same transformation logic must apply consistently to both the initial bulk load and continuous replication streams.

- Choose **target-side transformations** when you want to minimize changes to the source system, or when you can leverage CockroachDB features like computed columns for convenience.

## Common transformation types

Most migrations require a mix of schema-level and data-level changes:

- **Schema conversion**: Rewrite unsupported DDL and apply CockroachDB best practices using MOLT Schema Conversion Tool.
- **Type mapping**: Align source types with CockroachDB types, especially for dialect-specific types (e.g., MySQL `ENUM`).
- **Primary key strategy**: Replace source sequences or auto-increment patterns with CockroachDB-friendly IDs (UUIDs, sequences).
- **Table reshaping**: Consolidate partitioned tables, rename tables, or retarget to different schemas.
- **Column changes**: Exclude deprecated columns, or map computed columns.
- **Row filtering**: Move only a subset of rows by tenant, region, or timeframe.
- **Constraints and indexes**: Drop non-primary-key constraints and secondary indexes before bulk load for performance, then recreate after.
- **Value normalization**: Apply value transforms during replication to ensure consistent processing of bulk and streaming data.

## Where to transform

### Transform on the source (before export)

Apply transformations directly on the source database before exporting data.

**Best for:** Minimizing data volume across the network; leveraging existing source database features for filtering or aggregation.

**Advantages:** Smallest extract sets reduce network transfer and storage; simple bulk-load path where downstream receives transformed data.

**Disadvantages:** Adds load to source database; complex logic may be harder to express in SQL; may need to replicate transformation logic for continuous replication.

### Transform in flight (inside the MOLT pipeline)

Apply transformations within the migration pipeline, between source and target.

**Best for:** Minimal-downtime migrations where the same logic must apply to both initial load and continuous replication deltas; complex transformations that benefit from code rather than SQL.

**Advantages:** One code layer (TypeScript userscripts) for transform/filter/route logic; version-controlled and testable; separates transformation from databases.

**Disadvantages:** Requires operating a custom code path with observability and error handling; adds CPU to migration's critical path.

{{site.data.alerts.callout_info}}
MOLT Fetch's JSON transformations are for schema shaping (rename/merge/exclude/computed) rather than arbitrary per-value masking. Use MOLT Replicator userscripts for value-level transformations.
{{site.data.alerts.end}}

### Transform on the target (after load or during target DDL)

Apply transformations in CockroachDB after data has been loaded.

**Best for:** Minimizing changes to the source system; leveraging CockroachDB-specific features.

**Advantages:** Minimizes source changes; works well for schema reshaping with CockroachDB DDL; can leverage distributed processing.

**Disadvantages:** Full data volume crosses the network; may require post-load processing.

## Pairing with migration patterns

Different migration patterns favor different transformation approaches:

- **Planned downtime / bulk-load**: Prefer source-side filtering and target-side reshaping (computed columns, renames) to keep the pipeline straightforward. Use MOLT Fetch transformations for schema-level changes.

- **Load-then-replicate (minimal downtime)**: Use in-flight userscripts for continuous replication to ensure consistent transformation logic across bulk and streaming loads. Source-side filtering can reduce initial volume.

- **Continuous replication-first**: Emphasize in-flight transforms (userscripts) to ensure ongoing changes are normalized and reshaped consistently until cutover and beyond.

## Combining approaches

You can and often should combine approaches to meet operational requirements:

- **Source + in flight**: Coarse-grained filtering at source to reduce volume, then complex transformations in-flight for CDC consistency.
- **Source + target**: Source-side views or staging tables for data preparation, plus target computed columns or table renames.
- **In flight + target**: Userscripts for row-level logic, plus target DDL for schema conveniences (computed columns, index recreation).

## Tradeoffs

| | Source | In flight | Target |
|---|---|---|---|
| **Network transfer** | Reduced (transformed data only) | Full volume crosses network | Full volume crosses network |
| **Source impact** | Adds load to source database | No source changes required | No source changes required |
| **Complexity** | SQL-based, tied to source dialect | Requires custom code and monitoring | DDL-based, CockroachDB native |
| **Downtime impact** | May require source schema changes | Independent of source/target schemas | May require post-load processing |
| **Reusability** | Logic tied to source database | Version-controlled, portable code | Tied to target database |
| **Testing** | Test with source database tools | Test userscripts independently | Test with CockroachDB tools |
| **Best for** | Volume reduction, SQL-friendly transforms | Minimal-downtime migrations, complex logic | Simple migrations, CockroachDB-native features |

## Decision framework

Use these questions to guide your transformation strategy:

- **What is your downtime tolerance?** Near-zero downtime pushes you toward in-flight transforms that apply consistently to bulk and streaming loads.
- **Can your team test and maintain transformations more easily in SQL or code?** This influences whether to use source-side SQL, in-flight TypeScript userscripts, or target-side CockroachDB DDL.
- **Will transformation logic be reused post-cutover?** If you need ongoing sync or failback, prefer deterministic, version-controlled in-flight transformations.
- **How complex are the transformations?** Simple schema reshaping favors MOLT Fetch transformations or target DDL. Complex value normalization or routing favors in-flight userscripts.
- **What is your network and performance budget?** Source-side pushdown reduces volume across the wire. In-flight logic adds CPU to the pipeline. Balance throughput needs with transformation requirements.
- **Can you modify the source database?** Source-side transformations require permission and capacity to create views, staging tables, or run transformation queries.

## MOLT toolkit support

The MOLT toolkit provides specialized features for implementing transformations at each stage of the migration pipeline.

### MOLT Schema Conversion Tool

Use the [Schema Conversion Tool]() first to convert your schema and apply CockroachDB best practices. This reduces downstream transformation pressure by addressing DDL incompatibilities upfront.

### MOLT Fetch

[MOLT Fetch]({% link molt/molt-fetch.md %}) supports transformations during initial data load:

- **Row filtering**: `--filter-path` specifies a JSON file with table-to-SQL-predicate mappings evaluated in the source dialect before export. Ensure filtered columns are indexed for performance.
- **Schema shaping**: `--transformations-file` defines table renames, n→1 merges (consolidate partitioned tables), and column exclusions. For n→1 merges, use `--use-copy` or `--direct-copy` and pre-create the target table.
- **Type alignment**: `--type-map-file` specifies explicit type mappings when auto-creating target tables.
- **Table lifecycle**: `--table-handling` controls whether to truncate, drop-and-recreate, or assume tables exist.

For bulk-only flows, use `--ignore-replication-check` to skip replication checkpoint capture.

### MOLT Replicator

[MOLT Replicator]({% link molt/molt-replicator.md %}) uses TypeScript **userscripts** to implement in-flight transformations for continuous replication:

- **Capabilities**: Transform or normalize values, route rows to different tables, enrich data, filter rows, merge partitioned sources.
- **Structure**: Userscripts export functions (`configureTargetTables`, `onRowUpsert`, `onRowDelete`) that process change data before commit to CockroachDB.
- **Coordination**: For hybrid migrations, run MOLT Fetch for the initial load (which emits a `cdc_cursor` checkpoint), then start MOLT Replicator with the same transformation logic to process ongoing changes from that checkpoint.
- **Staging schema**: Replicator uses a CockroachDB staging schema to store replication state and buffered mutations (`--stagingSchema` and `--stagingCreateSchema`).

### MOLT Verify

Use [MOLT Verify]({% link molt/molt-verify.md %}) to compare schemas and data between source and target. For deliberate differences (e.g., masked columns or changed types), focus on intended equivalence: row counts, unchanged columns, and referential integrity. Run before replication starts (optional baseline) and before final cutover.

## See also

- [Migration Overview]({% link molt/migration-overview.md %})
- [Migration Considerations]({% link molt/migration-considerations.md %})
- [Migration Granularity]({% link molt/migration-considerations-phases.md %})
- [Continuous Replication]({% link molt/migration-considerations-replication.md %})
- [MOLT Schema Conversion Tool]()
- [MOLT Fetch]({% link molt/molt-fetch.md %})
- [MOLT Replicator]({% link molt/molt-replicator.md %})
- [MOLT Verify]({% link molt/molt-verify.md %})
