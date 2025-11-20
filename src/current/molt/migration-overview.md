---
title: Migration Overview
summary: Learn how to migrate your database to a CockroachDB cluster.
toc: true
docs_area: migrate
---

A migration involves transfering data from a pre-existing **source** database onto a **target** CockroachDB cluster. Migrating data is a complex, multi-step process, and a data migration can take many different forms depending on your specific business and technical constraints.

Cockroach Labs provides a MOLT (Migrate Off Legacy Technology) toolkit to aid in migrations.

This page provides an overview of the following:

- Overall [migration sequence](#migration-sequence)
- [MOLT tools](#molt-tools)
- Supported [migration flows](#migration-flows)

## Migration sequence

A migration to CockroachDB generally follows this sequence:

<!-- 1. **Assess and discover**: Inventory the source database, flag unsupported features, make a migration plan.
1. **Prepare the environment**: Configure networking, users and permissions, bucket locations, replication settings, and more.
1. **Convert the source schema**: Generate CockroachDB-compatible [DDL]({% link {{ site.current_cloud_version }}/sql-statements.md %}#data-definition-statements). Apply the converted schema to the target database. Drop constraints and indexes to facilitate data load. Use the [Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}).
1. **Stop application traffic**: Limit user read/write traffic to the source database. _This begins application downtime._
1. **Load data into CockroachDB**: Bulk load the source data into the CockroachDB cluster. Use [MOLT Fetch]({% link molt/molt-fetch.md %}).
1. **_(Optional)_ Replicate ongoing changes**: Keep CockroachDB in sync with the source. This may be necessary for migrations that minimize downtime. Use [MOLT Replicator]({% link molt/molt-replicator.md %}).
1. **Finalize target schema**: Recreate indexes or constraints on CockroachDB that you previously dropped to facilitate data load.
1. **Verify data consistency**: Confirm that the CockroachDB data is consistent with the source. Use [MOLT Verify]({% link molt/molt-verify.md %}).
1. **_(Optional)_ Enable failback**: Replicate data from the target back to the source, enabling a reversion to the source database in the event of migration failure. Use [MOLT Replicator]({% link molt/molt-replicator.md %}).
1. **Cut over application traffic**: Resume normal application use, with the CockroachDB cluster as the target database. _This ends application downtime._ -->

1. **Assess and discover**: Inventory the source database, flag unsupported features, make a migration plan.
1. **Prepare the environment**: Configure networking, users and permissions, bucket locations, replication settings, and more.
1. **Convert the source schema**: Generate CockroachDB-compatible [DDL]({% link {{ site.current_cloud_version }}/sql-statements.md %}#data-definition-statements). Apply the converted schema to the target database. Drop constraints and indexes to facilitate data load.
1. **Stop application traffic**: Limit user read/write traffic to the source database. _This begins application downtime._
1. **Load data into CockroachDB**: Bulk load the source data into the CockroachDB cluster.
1. **_(Optional)_ Replicate ongoing changes**: Keep CockroachDB in sync with the source. This may be necessary for migrations that minimize downtime.
1. **Finalize target schema**: Recreate indexes or constraints on CockroachDB that you previously dropped to facilitate data load.
1. **Verify data consistency**: Confirm that the CockroachDB data is consistent with the source.
1. **_(Optional)_ Enable failback**: Replicate data from the target back to the source, enabling a reversion to the source database in the event of migration failure.
1. **Cut over application traffic**: Resume normal application use, with the CockroachDB cluster as the target database. _This ends application downtime._

The MOLT (Migrate Off Legacy Technology) toolkit enables safe, minimal-downtime database migrations to CockroachDB. MOLT combines schema transformation, distributed data load, continuous replication, and row-level validation into a highly configurable workflow that adapts to diverse production environments.

<!-- <img src="{{ 'images/molt/migration_flow.svg' | relative_url }}" alt="MOLT tooling overview" style="max-width:100%" /> -->
<div style="text-align: center;">
<img src="{{ 'images/molt/molt_flows_1.svg' | relative_url }}" alt="MOLT tooling overview" style="max-width:100%" />
</div>

For more details, refer to [Migration flows](#migration-flows).

## MOLT tools

[MOLT (Migrate Off Legacy Technology)]({% link releases/molt.md %}) is a set of tools for schema conversion, data load, replication, and validation. Migrations with MOLT are resilient, restartable, and scalable to large data sets.

MOLT [Fetch](#fetch), [Replicator](#replicator), and [Verify](#verify) are CLI-based to maximize control, automation, and visibility during the data load and replication stages.

<table class="comparison-chart">
  <tr>
    <th>Tool</th>
    <th>Usage</th>
    <th>Tested and supported sources</th>
    <th>Release status</th>
  </tr>
  <tr>
    <td class="comparison-chart__feature"><a href="#schema-conversion-tool"><b>Schema Conversion Tool</b></a></td>
    <td>Schema conversion</td>
    <td>PostgreSQL, MySQL, Oracle, SQL Server</td>
    <td>GA (Cloud only)</td>
  </tr>
  <tr>
    <td class="comparison-chart__feature"><a href="#fetch"><b>Fetch</b></a></td>
    <td>Initial data load</td>
    <td>PostgreSQL 11-16, MySQL 5.7-8.0+, Oracle Database 19c (Enterprise Edition) and 21c (Express Edition), CockroachDB</td>
    <td>GA</td>
  </tr>
  <tr>
    <td class="comparison-chart__feature"><a href="#replicator"><b>Replicator</b></a></td>
    <td>Continuous replication</td>
    <td>CockroachDB, PostgreSQL 11-16, MySQL 5.7+ and 8.0+, Oracle Database 19c+</td>
    <td>GA</td>
  </tr>
  <tr>
    <td class="comparison-chart__feature"><a href="#verify"><b>Verify</b></a></td>
    <td>Schema and data validation</td>
    <td>PostgreSQL 12-16, MySQL 5.7-8.0+, Oracle Database 19c (Enterprise Edition) and 21c (Express Edition), CockroachDB</td>
    <td><a href="{% link {{ site.current_cloud_version }}/cockroachdb-feature-availability.md %}">Preview</a></td>
  </tr>
</table>

{% include molt/crdb-to-crdb-migration.md %}

### Schema Conversion Tool

The [MOLT Schema Conversion Tool]({% link cockroachcloud/migrations-page.md %}) converts a source database schema to a CockroachDB-compatible schema. The tool performs the following actions:

- Identifies [unimplemented features]({% link molt/migration-strategy.md %}#unimplemented-features-and-syntax-incompatibilities).
- Rewrites unsupported [DDL syntax]({% link {{ site.current_cloud_version }}/sql-statements.md %}#data-definition-statements).
- Applies CockroachDB [schema best practices]({% link molt/migration-strategy.md %}#schema-design-best-practices).

### Fetch

[MOLT Fetch]({% link molt/molt-fetch.md %}) performs the initial data load to CockroachDB. It supports:

- [Multiple migration flows](#migration-flows) via `IMPORT INTO` or `COPY FROM`.
- Data movement via [cloud storage, local file servers, or direct copy]({% link molt/molt-fetch.md %}#data-path).
- [Concurrent data export]({% link molt/molt-fetch.md %}#best-practices) from multiple source tables and shards.
- [Schema transformation rules]({% link molt/molt-fetch.md %}#transformations).
- After exporting data with `IMPORT INTO`, safe [continuation]({% link molt/molt-fetch.md %}#fetch-continuation) to retry failed or interrupted tasks from specific checkpoints.

### Replicator

[MOLT Replicator]({% link molt/molt-replicator.md %}) provides continuous replication capabilities for minimal-downtime migrations. It supports:

- Continuous replication from source databases to CockroachDB.
- [Multiple consistency modes]({% link molt/molt-replicator.md %}#consistency-modes) for balancing throughput and transactional guarantees.
- Failback replication from CockroachDB back to source databases.
- [Performance tuning]({% link molt/molt-replicator.md %}#optimize-performance) for high-throughput workloads.

### Verify

[MOLT Verify]({% link molt/molt-verify.md %}) checks for data and schema discrepancies between the source database and CockroachDB. It performs the following verifications:

- Table structure.
- Column definition.
- Row-level data.

<!-- ## Migration flows

{{site.data.alerts.callout_success}}
Before you begin the migration, review [Migration Strategy]({% link molt/migration-strategy.md %}).
{{site.data.alerts.end}}

MOLT supports various migration flows using [MOLT Fetch]({% link molt/molt-fetch.md %}) for data loading and [MOLT Replicator]({% link molt/molt-replicator.md %}) for ongoing replication.

|                             Migration flow                             |            Tools             |                                         Description                                          |                                                 Best for                                                |
|------------------------------------------------------------------------|------------------------------|----------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [Bulk load]({% link molt/migrate-bulk-load.md %})                      | MOLT Fetch                   | Perform a one-time bulk load of source data into CockroachDB.                                | Testing, migrations with [planned downtime]({% link molt/migration-strategy.md %}#approach-to-downtime) |
| [Data load and replication]({% link molt/migrate-load-replicate.md %}) | MOLT Fetch + MOLT Replicator | Load source data with Fetch, then replicate subsequent changes continuously with Replicator. | [Minimal downtime]({% link molt/migration-strategy.md %}#approach-to-downtime) migrations               |
| [Resume replication]({% link molt/migrate-resume-replication.md %})    | MOLT Replicator              | Resume replication from a checkpoint after interruption.                                     | Resuming interrupted migrations, post-load sync                                                         |
| [Failback]({% link molt/migrate-failback.md %})                        | MOLT Replicator              | Replicate changes from CockroachDB back to the source database.                              | [Rollback]({% link molt/migrate-failback.md %}) scenarios                                               | -->

## Migration considerations

You must decide how you want your migration to handle each of the following variables. These decisions will depend on your specific business and technical considerations. The MOLT toolkit supports any set of decisions made for the [supported source databases](#molt-tools).

### Bulk vs. phased migration

For smaller data stores, it's possible to migrate all of your data onto the target cluster at once. For larger data stores, it's recommended that you do so in phases. This  

Learn more about [phased migrations]({% link molt/migration-considerations-phases.md %}).

### Continuous replication

To minimize downtime during migration, use MOLT Fetch for initial data loading followed by MOLT Replicator for continuous replication. Instead of loading all data during a planned downtime window, you can run an initial load followed by continuous replication. Writes are paused only briefly to allow replication to drain before the final cutover. The duration of this pause depends on the volume of write traffic and the replication lag between the source and CockroachDB. Learn more about [continuous replication]({% link molt/migration-considerations-replication.md %}).

### Rollback plan

If the migration is interrupted or cutover must be aborted, MOLT Replicator provides safe recovery options:

- Resume a previously interrupted replication stream. Refer to [Resume Replication]({% link molt/migrate-resume-replication.md %}).
- Use failback mode to reverse the migration, synchronizing changes from CockroachDB back to the original source. This ensures data consistency on the source so that you can retry the migration later. Refer to [Migration Failback]({% link molt/migrate-failback.md %}).

### Validation strategy

[]

### Cutover plan

*Cutover* is the process of switching application traffic from the source database to CockroachDB. Once the source data is fully migrated to CockroachDB, switch application traffic to the new database to end downtime.

MOLT enables [migrations with minimal downtime]({% link molt/migration-overview.md %}#migrations-with-minimal-downtime), using [MOLT Replicator]({% link molt/molt-replicator.md %}) for continuous replication of source changes to CockroachDB.

To safely cut over when using replication:

1. Stop application traffic on the source database.
1. Wait for the replication stream to drain.
1. When your [monitoring](#set-up-monitoring-and-alerting) indicates that replication is idle, use [MOLT Verify]({% link molt/molt-verify.md %}) to validate the CockroachDB data.
1. Start application traffic on CockroachDB.

When you are ready to migrate, refer to [Migration flows]({% link molt/migration-overview.md %}#migration-flows) for a summary of migration types.

## See also

- [Migration Strategy]({% link molt/migration-strategy.md %})
- [MOLT Releases]({% link releases/molt.md %})
